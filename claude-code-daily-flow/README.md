# Claude Code Daily Flow

一套給 Claude Code agent 跑的「開機 / 跨裝置 / 收工」流程規範。

設計給 **TM 內部設計師** —— 假設你有 `~/dotclaude/` 設定 repo、Microsoft 365 帳號（MS Graph token）。**不依賴** Jottacloud。

## 這包解決什麼

1. **開機（Session Start）**——讓 agent 自動把昨天進度、跨裝置 ledger、行事曆、Email、Teams 整成一份儀表板，省去你每天早上「想想昨天做到哪」
2. **跨裝置同步**——用一支 git repo（`dotclaude`）+ 一份 ledger 檔，讓 A/B/C 多台機器接力工作不掉資料
3. **收工（Session Handoff）**——commit + push + 寫 daily summary + 標 WIP 狀態，確保隔天/換裝置開工 context 不斷

## 怎麼分享給同事的 agent

把下面這段貼給對方，他的 Claude Code 會自動 fetch：

```
請去抓 https://github.com/JiaWen-Shen/AI-design/tree/main/claude-code-daily-flow
讀完所有 .md 檔，然後幫我把這套流程接到我的設定裡。
我說「開始工作」時跑 start-of-day.md
我說「準備收工」時跑 end-of-day.md
新增專案、換裝置時讀 cross-device-sync.md
```

或者直接 `gh repo clone JiaWen-Shen/AI-design` 後把 `claude-code-daily-flow/` 抄到自己的工作目錄。

## 檔案說明

| 檔案 | 用途 |
|---|---|
| `start-of-day.md` | 「開始工作 / 早安 / briefing」觸發；time budget 校時 → 載入 context → 輸出儀表板 |
| `end-of-day.md` | 「準備收工」觸發；sync health check → commit/push → daily summary → MEMORY 更新 |
| `cross-device-sync.md` | 跨裝置交接規範；ledger 結構、device-sync flow、新專案 6 種類型決策樹 |
| `templates/daily-summary.md` | 收工時寫的當日摘要範本 |
| `templates/cross-device-ledger.md` | 跨裝置 ledger 起手檔 |
| `templates/MEMORY.md` | Agent 跨對話記憶骨架 |

## 前置設定（一次性）

1. **設定 working directory**——選一個固定路徑放專案（建議 `~/projects/` 或 `~/work/`）。**不要** 放 iCloud / Dropbox / Jottacloud（雲端同步會破壞 `.git/`，踩過很多次）
2. **建 `dotclaude` repo**——把你的 `~/.claude/` 設定（CLAUDE.md / skills / hooks）放進 git，跨裝置用 git pull 同步
3. **建 ledger 檔**——複製 `templates/cross-device-ledger.md` 到你的 memory 目錄（通常 `~/.claude/projects/<encoded-path>/memory/cross-device-sync.md`）
4. **MS Graph token**——morning-briefing 會自動抓 Calendar / Email / Teams，需要 token 設在 `~/.env.msgraph`（公司內部 SSO 取得方式問 IT）
5. **改 CLAUDE.md**——在你的 `~/.claude/CLAUDE.md` 加幾行 trigger，告訴 agent 看到「開始工作」「準備收工」要讀本目錄哪份檔

## CLAUDE.md trigger 範本

```markdown
## Session Triggers

- 「開始工作」/「開工」/「早安」/「briefing」→ 讀 `<path>/claude-code-daily-flow/start-of-day.md` 並執行
- 「準備收工」→ 讀 `<path>/claude-code-daily-flow/end-of-day.md` 並執行
- 「開新專案」→ 讀 `<path>/claude-code-daily-flow/cross-device-sync.md` 的「新專案 flow」段
- 「換裝置」/「切到這台」→ 讀 `<path>/claude-code-daily-flow/cross-device-sync.md` 的「device-sync 流程」段
```

## 設計原則

- **Agent 視角的可執行性 > 文檔可讀性**——所有指令都假設 agent 會直接照跑，所以指令明確、bash block 完整、容錯處理寫死
- **Time Budget 校時為基準**——所有時間顯示都從一次 curl 抓的 HTTP date header 推算，禁止 agent 自己心算 UTC→local
- **敘事節奏（Narration cadence）**——5–15 秒的 tool call 等待時間用敘事填補，避免「系統卡住了嗎」焦慮
- **狀態 taxonomy 統一**——所有專案進度只有 `🟢 進行中 / 🚧 卡關 / 🅿️ 擱置 / ✅ 結案`
