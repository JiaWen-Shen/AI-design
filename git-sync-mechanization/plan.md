# Git 同步檢查機制化 v2（session-start 自動觸發 + registry skill）

> 2026-07-26 改版：Karen 明確表示不要排程/launchd，要的是「每次 session start 自動觸發同步」+「repo 清單維護走 skill，同步本身走 script」。取代下面舊版 v1 內容（launchd/cron 那套整段作廢）。

## Context

這次 C機開工，我漏掉 dotclaude 落後 10 commits + qoome 底下 6 個 nested repo 落後 remote（gateway +3、campaign +40），使用者連問三次才逼出根因。追查後發現問題疊了三層：

1. **我自己**：看到「開工」沒去讀 `start-work-flow.md` 就土法動手，範圍縮到 cwd。
2. **「開工」機制上唯一保證會跑的東西**（`daily-flow-inject.sh` hook，比對到「開工/早安/briefing」字串才觸發）——只呼叫 `today-touched.sh`／`wip-detector.sh`，兩支都只查本機 dirty/unpushed，**從不 `git fetch`**，跟手動版 `check-sync.sh` 同個盲點。
3. **repo 探索範圍本身有洞**：`check-sync.sh` 用 `for dir in "$VIBE_DIR"/*/`（只看第一層），`today-touched.sh`/`wip-detector.sh` 用 `find -maxdepth 2`——兩者都看不到 `~/Jottacloud/vibe/qoome/` 底下再巢狀一層的 9 個獨立 repo（qoome-content-factory、qoome-gateway…），因為 `qoome/` 自己也是一個 repo，形成「container repo 裡面包 repo」的巢狀結構。

另外查到：**已經有一支現成機制**做「fetch + behind + 通知」——`scripts/daily-flow/cron/dotclaude-drift.sh`，透過 launchd 排程（08:00）、behind 就用 `notify-osa.sh` 跳 macOS 通知。但範圍**只鎖 dotclaude 一個 repo**，而且 launchd agent 要靠 `install-launchd.sh` 每台裝置手動裝一次——**C機從沒裝過**（`launchctl list` 確認 0 個 daily-flow 相關 job 在跑），且這個安裝步驟從沒被寫進 `reference_device_sync.md` 的新裝置 SOP。

目標調整（Karen 2026-07-26 追加指示）：
- **不要排程/launchd**——要「每次 session start」自動觸發，不是「每天固定時間」。
- **同步機制 = script**（機械式執行，不用判斷）。
- **repo 清單維護 = skill**（需要判斷：新 repo 要不要收、舊 repo 是不是該移除，交給 agent 判斷再問 Karen，不是純自動）。

## 關鍵新發現：SessionStart hook 早就存在，而且已經半殘

`~/dotclaude/settings.json` 的 `SessionStart` 已經掛了 `auto-pull.sh`（matcher `startup`，timeout 8s）。讀了它的邏輯（`~/dotclaude/scripts/auto-pull.sh`）：

- **Part A**：dotclaude 乾淨時 `git pull --ff-only`——這段有在動。
- **Part B**：`if [ -d "$VIBE/.git" ]` 才做 vibe fetch——**這個判斷式現在恆假**。2026-07-21「vibe repo 整理」把 `~/Jottacloud/vibe/.git` 整個移除、拆成純資料夾（MEMORY.md 有記），但這支 script 沒跟著更新，Part B 從那天起就是死碼，一直靜默不做事。

這解釋了另一件事：這次 session 一開始 dotclaude 就是 dirty（3 個 memory 檔案 modified），Part A 的「只在乾淨時 pull」guard 擋下了自動 pull——hook 其實有跑，只是被 guard 擋掉又沒有 fallback 通知「其實你落後 remote，只是我沒幫你拉」。

**結論：不用新掛 hook，直接把這支既有、已經在 SessionStart 生效的 script 改對、改滿即可。**

## 方案

### 1. Registry 檔：`~/dotclaude/skills/sync-health-check/repo-registry.txt`

- 純文字，一行一個絕對路徑，`#` 開頭當註解。放在 dotclaude 底下 → 天生透過既有「dotclaude git pull」機制跨裝置同步，不用另外做同步層。
- 初始清單：用第 3 點的 discovery 邏輯跑一次，把現有 ~45 個 repo（vibe/ 下所有 + qoome/ 巢狀 9 個 + dotclaude 本身 + dotclaude/skills、hooks 下巢狀 repo）填進去當種子。

### 2. `check-sync.sh` 加 `--repos-file <path>` 模式（script，機械式）

沿用既有 `process_repo()`（remote / fetch+behind / unpushed / dirty / gitignore / zombie 全套邏輯不變），只改「輸入從哪來」：

- 無 `--repos-file` ＝原行為（遞迴 discover，全量掃描，`sync-health-check` skill 手動跑收工用）。
- 有 `--repos-file` ＝跳過 discovery，只讀清單裡的路徑逐一 `process_repo`；清單裡路徑若已不存在，標記「registry 有髒路徑，建議清除」而不是報錯中斷。
- **平行化**：45 個 repo 逐一序列 fetch 太慢，SessionStart 等不了。每個 `process_repo` 丟進背景 subshell、各自把 JSON 結果寫進 `mktemp -d` 底下自己的暫存檔（避免多行 stdout 交錯），`wait` 收工後 `jq -s` 合併。外層包一個總 `timeout`（例如 12s）當保險——即使還有 repo 在 fetch 也準時交卷，回報「已完成 X/45，Y 個逾時未查」，不讓單一沒回應的 remote 卡死整個 session 啟動。

### 3. `discover_repos()` 抽成共用 `lib-discover.sh`

原本寫在 `check-sync.sh` 裡的遞迴 `find`（排除 node_modules 等，抓到 qoome 巢狀 repo 那段）搬到 `~/.claude/skills/sync-health-check/lib-discover.sh`，`check-sync.sh` 跟下面的 `audit-registry.sh` 都 `source` 它，避免兩處各寫一份。

### 4. 新 script：`audit-registry.sh`（給 skill 呼叫，也給 hook 呼叫輕量模式）

- 預設模式（給 skill 用）：跑 `discover_repos()` 拿到「實際存在的 repo 清單」，跟 `repo-registry.txt` 做 diff：
  - **有 repo 但沒登記** → 列出來當候選新增（可能是合法新專案，也可能是不小心巢狀出來的 `.git`，需要人判斷，不能自動收）
  - **登記了但路徑不存在** → 列出來當候選移除（可能專案 archive 了）
  - 只印 diff，**不自動改 `repo-registry.txt`**——改動由下面的 skill 流程決定。
- **`--summary-json` 模式（給 auto-pull.sh Part D 用）**：跳過詳細列表，只輸出 `{"unregistered": N, "missing": M}` 兩個計數，給 hook 判斷要不要在 `additionalContext` 補提醒行。

### 5. 擴充既有 `sync-health-check` skill（不另開新 skill，避免 skill 氾濫）

`~/.claude/skills/sync-health-check/SKILL.md` 加一段「Repo 清單維護」：

- **On-demand 觸發**：Karen 說「盤點 repo 清單」/「audit repo registry」/ 或我自己覺得哪裡怪主動提議時 → 跑 `audit-registry.sh` → 把 diff 攤開問 Karen 每一條要不要收/要不要移除 → 確認後才寫回 `repo-registry.txt`。
- **開新專案自動掛勾**：`new-project-flow.md` 既有的「登記進 cross-device-sync.md『🆕 新專案啟動』」步驟（Type 1 / Type 3）旁邊加一行：同時把新 repo 路徑 append 進 `repo-registry.txt`——這樣「剛建的新專案」這個最常見情境不用等手動盤點才收得到。
- **明確不做**：不排週期性自動跑 audit（Karen 已表態不要排程），audit 永遠是「被叫到才跑」或「我主動覺得該提議」，不是背景常駐。

### 6. `auto-pull.sh`：把死掉的 Part B 換成真正在跑的 Part C + Part D（機械 drift 提醒）

- 拿掉 `if [ -d "$VIBE/.git" ]`（已經恆假的死碼）。
- **Part C**：呼叫 `check-sync.sh --json --repos-file ~/dotclaude/skills/sync-health-check/repo-registry.txt`，`jq` 篩出 `behind>0 || dirty_count>0 || !fetch_ok || never_pushed` 的 repo，組成人類可讀摘要，沿用原本 `MSG` 變數串接的寫法。
- **Part D（新增，回應 Karen 提的「跟新專案流程銜接好應該就不會漏」）**：new-project-flow 銜接可以擋掉「正常建專案」這條路徑漏登記，但擋不掉意外情況（手動 `git init`、忘記走 flow、複製別人專案）。這段補的是**保底偵測**，不是不信任銜接本身——呼叫 `audit-registry.sh --summary-json`（新增的輕量模式，只回 `{unregistered: N, missing: M}` 計數，不印詳細 diff），這步只跑本機 `find`，不連網路，成本遠低於 Part C 的 fetch，可以每次都跑。`N>0` 或 `M>0` 時，在 `MSG` 補一行：「⚠️ N 個 repo 未登記 / M 個登記路徑消失 — 說「盤點 repo 清單」處理」。**偵測是機械的（每次 session start 都做），處理仍然是 skill/人判斷**——這樣就算 new-project-flow 哪次沒銜接好，下次開 session 也會被動提醒，不會無限期silent drift。
- Part A（dotclaude pull）順便補一個小洞：目前 dirty 時直接跳過、什麼都不講；改成 dirty 時至少做 `git fetch`（不動 working tree，安全）+ 講「落後 remote N commits，但因為本機有未 commit 變更沒幫你自動 pull，先手動處理」——這是這次 C機踩到的實際情境（session 開始時 dotclaude 剛好 dirty），順手補上不算超出範圍。
- `settings.json` 裡這個 hook 的 `timeout` 從 8 → 15（給第 2 點的平行 fetch batch 留空間；script 自己內層 timeout 12 < hook 外層 15，確保是 script 自己先體面收尾，不是被 hook 硬殺）。Part D 是純本機 find，不佔這個 timeout 的主要額度。

### 已知限制（不在本次範圍解，先寫明）

- `iven-qoome` org 系列 repo 走 HTTPS + `gh` credential helper，帳號沒切對就 403/404——背景 fetch 撞到只記一行「fetch 失敗，疑似帳號問題」，不會自動切帳號。長期建議改 SSH multi-account alias（跟其餘多數 repo一致），但那是獨立清理項目，不塞進這次。
- Session-start 每次都跑（不管有沒有要碰 git），會替**每一個** Claude Code session 開場加上幾秒延遲，即使是完全不相關的專案。這是 Karen 明確要的行為（「每次 session start 就自動觸發」），已知取捨，不是 bug。

## 修改檔案清單

- 新增 `~/.claude/skills/sync-health-check/repo-registry.txt`（種子清單）
- 新增 `~/.claude/skills/sync-health-check/lib-discover.sh`（`discover_repos()` 抽出來共用）
- 新增 `~/.claude/skills/sync-health-check/audit-registry.sh`（diff 用，給 skill 呼叫）
- 修改 `~/.claude/skills/sync-health-check/check-sync.sh`（`--repos-file` 模式 + 平行化 + source lib-discover.sh）
- 修改 `~/.claude/skills/sync-health-check/SKILL.md`（補「Repo 清單維護」段落）
- 修改 `~/dotclaude/scripts/auto-pull.sh`（死 Part B → 活 Part C，Part A 補 dirty-fetch-only 分支）
- 修改 `~/dotclaude/settings.json`（該 hook timeout 8→15）
- 修改 `~/.claude/projects/-Users-karen-shen-Jottacloud-vibe/memory/new-project-flow.md`（Type 1/3 登記步驟加一行 append registry）

## 驗證方式

1. `bash audit-registry.sh` 對空清單跑一次，確認能列出目前所有實際 repo（含 qoome 巢狀 9 個），用這份輸出當種子寫入 `repo-registry.txt`。
2. `bash check-sync.sh --json --repos-file repo-registry.txt | jq .` 確認能跑完、结構正確，且時間在合理範圍內（量測實際秒數，跟 12s 內層 timeout 比對）。
3. 手動跑一次 `bash auto-pull.sh`，確認吐出的 JSON `additionalContext` 裡有 registry 掃描摘要；找一個目前故意落後的 repo（或暫時 `git reset --hard HEAD~1` 一個安全的測試分支）驗證真的抓得到 behind。
4. 重新整理 `repo-registry.txt` 後，臨時在 vibe 下建一個假 repo（`mkdir -p /tmp-test && git init`，完後刪掉），跑 `audit-registry.sh` 確認「有 repo 但沒登記」這條分支正確觸發，測完清乾淨。
5. 檢查 `settings.json` 的 timeout 確實改成 15，且 `auto-pull.sh` 內層 timeout 是 12（外層永遠 > 內層）。
6. 走一次 `new-project-flow.md` 的 Type 1 建新專案流程（或純檢查文件內容），確認新增的 append-registry 那行確實寫進文件、邏輯合理。
7. **Drift 保底提醒**：從 registry 裡暫時拿掉一個真實存在的 repo（不刪檔案，只刪 `repo-registry.txt` 那一行），跑 `audit-registry.sh --summary-json` 確認 `unregistered` 計數 +1；再跑 `auto-pull.sh` 確認 `additionalContext` 裡出現「N 個 repo 未登記」提醒行；改完記得把那行加回去。
