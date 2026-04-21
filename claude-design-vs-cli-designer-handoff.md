# Claude Design vs Claude Code CLI — 設計師 → RD 交付場景

> **場景**：設計師用 agent 產出設計 → 交付 RD；同時要顧部門內 review、跨部門協作，持續吸收 PM requirement 與 design system 文件更新。

> ⚠️ **重要前提**：兩者輸出都是 **spec / reference**，不是 production-ready code。RD 都需要再改寫才能進產品 codebase。差別在於「spec 的型態」以及「交付過程的斷點多寡」。

## 1. PM Requirements 吸收（入口）

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **來源整合** | 聊天貼上文字/圖片；無外部系統整合 | MCP 接 Jira / Confluence / Teams / Outlook；現成的 `teams-channel-digest`、`outlook-email-digest` skill |
| **主動 poll** | 無 | Cron / scheduled skill，定期拉最新 requirement（`teams-to-confluence` 跑 15 分鐘一次就是這模式） |
| **需求追蹤歷史** | 對話內 | Git commit log + Confluence page + MEMORY.md 多層 |
| **結論** | 每次手動複製貼上 | 可做成「需求自動流進來」的 pipeline |

## 2. Design System 文件同步

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **初次 import** | ✅ 內建 Figma design system import | 需設計一套方式（讀 repo / Figma MCP / submodule） |
| **持續更新** | Library 變動要手動重 import | `cross-team-submod/local-cache-ttl/`——TTL 到期自動 fetch guideline |
| **Token / variable** | Figma variables 拉進來，但是黑盒 | `mcp__figma__get_variable_defs` 可程式化抓、可 diff |
| **版本管理** | 無 | git pull submodule、可 pin 版本、可 rollback |
| **結論** | 啟動快、但同步要靠人 | 設計一次、長期自動化 |

## 3. Design 產出本身

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **輸出型態** | 視覺 artifact（HTML/React mockup、slide、one-pager） | Code-shaped spec（HTML/React reference code，但不是 prod stack） |
| **視覺迭代速度** | ✅ 快——canvas 直接看、inline 調 | 要跑 dev server 才看得到 |
| **Brand / design system 一致性** | Scaffolding 內建 design-decision prompt | 要自己在 prompt 或 CLAUDE.md 明確規範 |
| **適合產出** | Prototype、marketing 頁、one-pager | Prototype repo、行為邏輯能動的 mockup、帶互動的 spec |
| **天花板** | 被 scaffold 限制（spec 層級） | 高，但需要會寫 prompt 控制 |

## 4. 交付 RD（最關鍵——**兩者都是 spec，差別在斷點**）

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **交付物本質** | 視覺 spec（連結 + HTML/React artifact） | Code spec（reference implementation，非 prod stack） |
| **RD 是否能直接用** | ❌ 要對著設計重寫成 prod code | ❌ 一樣要改寫——tech stack、design token、component library 常常對不上 prod |
| **RD 接手時的起點** | 視覺 + 切版提示 | 結構化 code + interaction 邏輯 + 明確 CSS/Tailwind class |
| **Spec 漏失風險** | 中——設計 → 文字描述 → 實作，易失真 | 中低——code 本身傳達了 layout、命名、state，但跨 stack 仍要翻譯 |
| **與 RD 工具鏈整合** | 走 Figma MCP 橋接 | PR comment、gh CLI、CI 測試 |
| **RD 會多做的事** | 幾乎從頭搭 component、tokenize、整合 state | 把 reference code 對映到 prod component library、替換 token、接真 API |
| **結論** | 設計好看、但 code 斷點最大 | 斷點較小、但不是「零接手成本」的幻覺 |

## 5. 部門內協作（設計師之間）

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **Peer review** | 分享連結 + 留言 | PR review（你在用的 submodule workflow） |
| **Variant 探索** | 對話內建分支 | git branch + worktree（可平行探索） |
| **共享 prompt / scaffold** | 各自帳號，不易共享 | `.claude/commands/`、`.claude/agents/`、skill checked in repo，全隊共用 |
| **新人 onboarding** | 開帳號即用 | 需要學 git（`git-operation-guide.md` + designer submodule workflow 就是為此寫的） |
| **結論** | 低摩擦、但難規模化 | 摩擦高、但一次投資長期受用 |

## 6. 跨部門協作（PM / RD / Stakeholder）

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **給 PM 看** | 連結一貼就能看 | 需要 deploy preview 或 GitHub Pages（`trendlife-ui-mockup` 就是這做法） |
| **給 RD 討論** | 對著 canvas 講 | 對著 diff / PR 講 |
| **Stakeholder 決策紀錄** | 設計版本內 | git commit + PR description + meeting-minutes |
| **追蹤回饋 → 落地** | 手動 | PM 回饋可進 Jira → skill 拉進來 → 變 task |
| **結論** | 視覺溝通強 | 決策可追溯性強 |

## 整體比較

| 維度 | Claude Design | Claude Code CLI |
|---|---|---|
| **啟動成本** | 極低 | 高（要會 CLI + git） |
| **交付給 RD 的斷點** | 大（視覺 → 重寫 prod code） | 中（code → 翻譯到 prod stack） |
| **自動化能力**（requirement / design system 持續同步） | 無 | 高（hooks / cron / MCP / skill） |
| **協作規模化**（隊伍擴大後的效益） | 隊伍越大越吃力 | 前期辛苦、後期自動化回本 |
| **設計師自主產出的天花板** | 被 scaffold 限制 | 無天花板，但靠使用者 |

## 針對這場景的建議

**單一設計師、快速驗證概念**：Claude Design 就夠。

**要交付 RD、部門內外協作、requirement 持續流入、design system 會更新**：
- **主力用 Claude Code CLI**——「自動化 pipeline」與「code-shaped spec」讓交付斷點變小（但仍是斷點，不是零）
- **Claude Design 當輔助**——前期發想、產對外 slide/marketing 頁時用
- **橋接**：Figma MCP 把兩邊串起來（Design 產視覺稿 → Figma 精修 → CLI 讀 Figma 轉 code 給 RD）

**認清定位**：兩者產出都是 spec，RD 都要再寫。選工具是在選「哪種 spec 型態讓 RD 接手最省力、讓設計師自己最能持續維護」。

**已有的資產對應這場景**：
- Requirement 吸收：`teams-channel-digest`、`outlook-email-digest`、`teams-to-confluence`
- Design system 同步：`cross-team-submod/local-cache-ttl/`
- 設計師 git workflow：`Karen-test-submodule/git-operation-guide.md` + phase-b-reminder hook
- 交付 RD：submodule + PR review + GitHub Pages preview
