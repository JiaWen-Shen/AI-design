# Claude Code CLI vs Claude Desktop

比較兩者在 harness、collaboration 層面的能力差異，以及其他值得注意的面向。

## Harness 層面（最大差異）

| 面向 | Claude Code CLI | Claude Desktop |
|---|---|---|
| **檔案系統存取** | 直接讀寫本機檔案（Read/Edit/Write/Glob/Grep） | 無，只能透過 MCP 間接讀檔（如 Filesystem MCP） |
| **執行 shell 指令** | 原生 Bash tool，可跑 git / npm / pytest | 無，需靠 MCP server 包裝 |
| **Hooks** | PreToolUse / PostToolUse / Stop / Notification / UserPromptSubmit / SessionStart 等事件可掛 shell script | 無 hook 系統 |
| **Subagents** | `Agent` tool + 自訂 agent（`.claude/agents/*.md`），可 parallel 分派 | 無 |
| **Skills** | `~/.claude/skills/` + project-level，可觸發式載入 | 有 Skills（Pro/Max 訂閱），但無本地檔案整合 |
| **Plan Mode / Worktree** | 有（隔離 branch 操作） | 無 |
| **Settings / permissions** | `settings.json` 分 user/project/local，細到每個 tool 可 allowlist | 只有 app-level 偏好 |
| **Slash commands** | 自訂 `.claude/commands/*.md` | 無 |
| **Background jobs** | `run_in_background` + Monitor，可長跑 dev server | 無 |
| **Cron / 排程** | CronCreate / ScheduleWakeup，支援 /loop 自主輪詢 | 無 |
| **Model 切換** | `/model` 切 Opus/Sonnet/Haiku，1M context 變體 | 訂閱方案限定 |

## Collaboration 層面

| 面向 | CLI | Desktop |
|---|---|---|
| **Git workflow** | 原生——branch、commit、PR via `gh`，submodule hooks | 需透過 MCP（GitHub MCP） |
| **Code review** | `/review`、`/security-review`、caveman-review skill | 只能貼程式碼人工 review |
| **IDE 整合** | VS Code / JetBrains extension，共享 selection context | 獨立 app |
| **團隊共享設定** | `.claude/` checked in repo（commands/agents/hooks 全團隊共用） | 無 |
| **Pair programming** | 在 terminal + IDE，真正改動 codebase | 對話式，產出需人工貼回 |
| **跨裝置同步** | Jottacloud symlink + auto-memory 跨機器（我現在這套） | Anthropic 帳號同步對話，但無本地狀態 |

## 其他值得注意的面向

1. **MCP 可用性**：兩者都支援 MCP，但 CLI 的 MCP 跑在本機 process、能存本機資源；Desktop 的 MCP 受限於 app sandbox
2. **Context 容量**：CLI 有 1M context 變體（Opus 4.7 1M）；Desktop 走訂閱帳號的一般 context 限制
3. **檔案產出**：CLI 直接寫到 disk、可進 git；Desktop 產出是 Artifact（HTML/React preview）或對話附件，要手動下載
4. **成本模型**：CLI 走 API usage-based（或 Max 訂閱 tokens）；Desktop 走 Pro/Max 固定月費
5. **隱私 / 企業環境**：CLI 可完全離線 on-prem（Bedrock/Vertex）、enterprise profile 分 work/personal；Desktop 是 Anthropic hosted
6. **Artifact / 視覺產出**：Desktop 強項——inline preview React、Mermaid、SVG；CLI 要靠 dev server + 瀏覽器
7. **多模態輸入**：Desktop 拖拉圖片/PDF 直覺；CLI 要給檔案路徑
8. **可觀測性 / telemetry**：CLI 有 OTEL export、transcripts 可 grep；Desktop 是黑盒

## 決策建議

- **寫 code、改 repo、自動化 workflow、跨裝置 session** → CLI
- **討論設計、快速 prototype UI、貼圖給 AI 看、一次性問答** → Desktop
- **兩者互補**：Desktop 發想 + CLI 執行是常見組合
