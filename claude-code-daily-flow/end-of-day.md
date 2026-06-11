# End of Day（收工流程）

用戶說「準備收工」時觸發此流程。

## 核心理念

收工的目的是**讓隔天 / 換裝置開工時，context 不會斷**。所以：
- 該 push 的都 push
- WIP 狀態清楚標出來
- 寫一份「人和 agent 都看得懂」的當日 summary
- 更新 MEMORY 的 Projects 狀態

## 執行步驟（依序）

### 1. Sync health check

掃 `<WORK_DIR>` 內所有專案（含 monorepo 根），確認：
- 每個都有 git remote 備份
- 沒有未 commit 的變更（modified 或 untracked）
- 沒有未 push 的 commit
- `.gitignore` 設定正確（沒漏掉 `.env` / 機密檔）

範例腳本：

```bash
# ~/.claude/skills/sync-health-check/check-sync.sh
# 對每個 repo 跑：
git -C "$repo" status -sb
git -C "$repo" log @{u}.. --oneline 2>/dev/null  # 未 push 的 commit
git -C "$repo" remote -v
```

發現 ❌ 高風險（沒 remote、有 secret 沒 gitignore）→ **先修才繼續**。
發現 ⚠️ 警告（未 commit / 未 push）→ 下一步處理。

### 2. 對今天動過的專案 `git status`

```bash
# 找今天有改過的專案
find <WORK_DIR> -maxdepth 2 -type d -name ".git" -newer /tmp/today-start | \
  xargs -I{} dirname {}
```

對每個跑 `git status`，看有什麼要 commit。

### 3. Commit + push

依 [auto-commit 規則](#auto-commit-規則) 處理。

未完成的功能 → **WIP commit**（只 commit、不 push）：

```bash
git commit -m "wip: <一句話進度>"
```

完成的段落 → **正常 commit + push**：

```bash
git commit -m "feat(<scope>): <what + why>"
git push
```

### 4. 寫 daily summary

路徑：`<WORK_DIR>/daily-summaries/YYYY-MM-DD.md`

範本見 `templates/daily-summary.md`。

開頭加一行 `Usage: <%>`（手動跑 `/usage` 拿）。

### 5. 更新 MEMORY

只記三件事：
- 各專案 last commit hash
- 當下狀態（🟢 / 🚧 / 🅿️ / ✅）
- 下一步

歷史細節留 daily summary，**MEMORY 保持精簡**——它會被全量 load 進每次對話的 context，太肥會吃 token。

### 6. WIP 狀態盤點

收工報告中段列出當日有觸碰的專案，每個標：

| 專案 | 狀態 | 下一步 |
|---|---|---|
| `<project-A>` | 🟢 進行中 | <一句話> |
| `<project-B>` | 🚧 卡關 | <等什麼> |
| `<project-C>` | 🅿️ 擱置 | <擱置原因> |

狀態變更（新進、卡關、結案）要同步更新 MEMORY Projects 區塊。

### 7. 跨裝置 ledger 確認

如果當日有：
- **開新專案** → 確認已寫進 `cross-device-sync.md`「🆕 新專案啟動」段
- **發現要在另一台做的事** → 寫進「🔴 Pending」段
- **完成 ledger 任務** → 從 Pending / 新專案啟動 搬到 Done 段

### 8. 確認 skills / memory 有無需要更新

如果今天有學到新規則、新偏好、新流程 → 看是否該寫進 memory 或更新 CLAUDE.md。

## Auto-Commit 規則

### 自動觸發 commit + push 的時機（無需用戶提示）

1. 任務段落完成（feature / bugfix）
2. 測試通過後
3. Build 成功後
4. 用戶確認 bug 已解決（說「好了」「可以」「先這樣」）
5. 切換任務前

### 自動觸發 WIP commit（只 commit，不 push）

- 任務進行到一半但用戶要先處理別的事
- 超過 5 個檔案有未提交變更（格式：`wip: <進度描述>`）

### Commit 原則

- **Conventional Commits**：`feat:` / `fix:` / `chore:` / `refactor:` / `docs:`
- 每個 commit 只做一件事，message 說明 what + why
- **不用 `git add .`**，明確指定檔案（避免誤加 secret / 大檔）

### 例外

- 用戶說「先不要 push」→ 只 commit
- 測試失敗 → 不 commit，先修好
- 破壞性 refactor → 等用戶確認方向
- **跨團隊 repo（不是自己 owned 的）→ 不自動 push**，先給 diff 等用戶確認

## 收工報告結構

```markdown
# 收工報告 — YYYY-MM-DD

## 今天做了什麼
<3-5 句話總結>

## Commits
- `<repo>`: `<hash>` <message>
- `<repo>`: `<hash>` <message>

## WIP 狀態盤點
| 專案 | 狀態 | 下一步 |
|---|---|---|

## 待處理 / 跨裝置交接
<有寫進 ledger Pending 的事>

## 同步健康
✅ 全綠 / ⚠️ X 件警告 / ❌ 需立即處理

## 隔天開工建議
<2-3 句>
```

## 範例收工執行

用戶輸入：「準備收工」

```
讓我先確認各專案同步狀態...

[bash: sync health check]

注意到 hie-rei 還有 2 個 unpushed commits、worklog 有 1 個 untracked file。
先處理 hie-rei...

[git push for hie-rei]

worklog 的 untracked 是新的月度 HTML，要 commit 進 main 嗎？

[等用戶確認]

[commit + push]

正在寫今天的 summary...

[Write daily-summaries/YYYY-MM-DD.md]

更新 MEMORY 的 Projects 段...

[Edit MEMORY.md]

# 收工報告 — YYYY-MM-DD
...
```

## Failure handling

- Sync health check 發現高風險 → **不繼續**收工，先修。具體：沒 remote 的 repo 先 `gh repo create`、有 secret 在 git history 先 `git rm --cached` + 寫進 `.gitignore`
- Push 因 gh auth 帳號錯 403 → 切帳號 → 重 push（見 [跨裝置同步](cross-device-sync.md#多-github-帳號管理)）
- Commit hook 失敗 → 修問題、不要 `--no-verify` 繞過。除非確定 hook 邏輯本身有 bug
- daily-summaries 目錄不存在 → `mkdir -p` 就好，不用問

## 設計原則

- **每個 commit 都是一個可獨立 revert 的單位**——不要混 feat + chore + docs 在同一個 commit
- **WIP commit 沒有羞恥**——做一半被打斷就 WIP，比堆滿 working tree 安全
- **daily summary 寫給未來的自己**——三個月後回來看，要能 5 秒鐘想起「那天我在幹嘛」
