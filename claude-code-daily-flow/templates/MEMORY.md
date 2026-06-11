# Memory

<!--
這是 agent 的跨對話記憶骨架。
路徑：`~/.claude/projects/<encoded-working-dir>/memory/MEMORY.md`
每次新對話會被全量 load 進 context，**保持精簡**——明細寫到 sub-file，這裡只放索引。
-->

## GitHub Accounts

<!-- 列你的多個 gh 帳號 -->
- `<personal-account>` — 個人帳號
- `<work-account>` — 工作帳號（active）
- push 因帳號不符 403 時：直接切 → push → 切回，不用問

## User Preferences

<!-- 寫死你常用的 trigger 詞和對應動作 -->
- 說「準備收工」= 走 [收工流程](claude-code-daily-flow/end-of-day.md)
- 說「開始工作 / 開工 / 早安 / briefing」= 走 [開機流程](claude-code-daily-flow/start-of-day.md)
- 說「繼續 xx 專案」= 讀 MEMORY + sub-file → git status + sync health → 呈現現況再問
- 說「開新專案」= 走 [新專案 flow](claude-code-daily-flow/cross-device-sync.md#新專案-flow)
- 說「換裝置 / 切到這台」= 走 [device-sync 流程](claude-code-daily-flow/cross-device-sync.md#device-sync-流程)

## Feedback

<!-- agent 跟你互動時學到的偏好。每條一行+sub-file 連結 -->
- [example] 整段 feature push 前先給用戶檢查 — 跨團隊 repo 不套用 auto-push

## Devices

<!-- 見 cross-device-sync.md 的 Device List 範本 -->
- **A 機 — 公司 MBP** — `hostname -s` = `<XXX>`。主力工作機
- **B 機 — 家裡 MBP** — `hostname -s` = `<YYY>`。下班 / 週末

## Projects

<!--
每個專案一個 H3 + 狀態 emoji，內容極短：
- 路徑 + remote
- last commit hash
- 一句話「下一步」
歷史細節寫進 daily-summaries，不寫這裡。

狀態 taxonomy：
- 🟢 進行中 — 有活躍下一步
- 🚧 卡關 — 等用戶決策／等外部
- 🅿️ 擱置 — 主動暫停（含日期 + 原因）
- ✅ 結案 — 已關（保留作歷史）
-->

### <project-A> — 🟢 進行中

- `<WORK_DIR>/<project-A>/`，`<gh-account>/<repo>`
- last commit: `<hash>`（<date>，<commit message 摘要>）
- 下一步：<一句話>

### <project-B> — 🚧 卡關

- `<WORK_DIR>/<project-B>/`
- 卡在：<等什麼>
- 解卡條件：<具體要發生什麼事>
