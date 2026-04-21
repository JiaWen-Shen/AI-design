# Claude Design vs Claude Code CLI — 設計師 → RD 交付場景

> **場景**：設計師用 agent 產出設計 → 交付 RD；同時要顧部門內 review、跨部門協作，持續吸收 PM requirement 與 design system 文件更新。

> **資料時點**：2026-04 Claude Design research preview 發佈時的公開資訊。Claude Design 仍在 research preview，功能滾動更新中。

> ⚠️ **核心前提**：兩者最終產出**都不是** production-ready code。
> - Claude Design 輸出視覺設計 + handoff bundle
> - Claude Code 輸出 reference implementation（HTML/Tailwind 為主，tech stack 常與 prod 不同）
>
> RD 都需要再翻譯成 prod stack。真正的差別在「**交付鏈條的斷點分佈**」。

## 0. 先搞清楚兩者的關係

Claude Design **不是** Claude Code 的替代品，兩者**設計上就是搭配使用**：

```
設計師在 Claude Design 發想視覺 → 「Send to Claude Code」一鍵打包（含 PROMPT.md）
→ Claude Code 產 reference code → RD 翻譯到 prod stack
```

所以這份比較不是在選「用哪個」，而是在看**設計師自己要深入到哪一層**、以及**兩個工具各自處理哪些斷點**。

## 1. PM Requirements 吸收（入口）

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **來源整合** | 聊天貼上文字 / 圖片、上傳檔案；MCP 支援為 roadmap | MCP 接 Jira / Confluence / Teams / Outlook；現成的 `teams-channel-digest`、`outlook-email-digest` skill |
| **主動 poll** | 無 | Cron / scheduled skill，定期拉最新 requirement（`teams-to-confluence` 跑 15 分鐘一次就是這模式） |
| **需求追蹤歷史** | 對話 + workspace 內 | Git commit log + Confluence page + MEMORY.md 多層 |
| **結論** | 每次手動貼入 | 可做成「需求自動流進來」的 pipeline |

## 2. Design System 文件同步

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **初次建立** | ✅ Onboarding 時讀 codebase + design files，**自動建立 design system**（colors / typography / components）並套到後續所有專案 | 需設計一套方式（讀 repo / Figma MCP / submodule） |
| **後續更新** | 靠 re-onboarding 或手動更新（目前機制未公開） | `cross-team-submod/local-cache-ttl/`——TTL 到期自動 fetch guideline |
| **Token / variable** | Design 內建一致套用，黑盒 | `mcp__figma__get_variable_defs` 可程式化抓、可 diff |
| **版本管理** | 無 | git pull submodule、可 pin 版本、可 rollback |
| **結論** | 啟動成本極低 | 長期自動化需自己搭 |

## 3. Design 產出本身

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **輸出型態** | Claude Design canvas 內的視覺設計。匯出：**Canva / PDF / PPTX / 標準 HTML** | Code-shaped spec（依 prompt 而定，常見 HTML + Tailwind） |
| **視覺迭代方式** | Canvas 直接看、inline 評論、Claude 動態生成的 **adjustment sliders**（調 spacing / color / layout） | 跑 dev server 或靜態 preview 才看得到 |
| **設計決策** | 內建 design-decision prompts（幫設計師把流程結構化） | 要自己在 prompt 或 CLAUDE.md 規範 |
| **適合產出** | Prototype、marketing 頁、slide、one-pager | Prototype repo、行為可運作的 mockup、帶互動的 spec |
| **模型** | Opus 4.7 | Opus 4.7 / Sonnet 4.6 / Haiku 4.5 可切 |
| **天花板** | 被 scaffold 結構化——上手快，但客製化空間較窄 | 高，靠使用者能力 |

## 4. 交付給 RD（最關鍵——兩者都有斷點，位置不同）

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **交付物本質** | 視覺設計 + **一鍵 handoff bundle**（內含 PROMPT.md，指定 stack / convention / 畫面順序） | Reference code（HTML/Tailwind 或指定 stack） |
| **典型流程** | Design → Claude Code → reference code → RD | CLI → reference code → RD |
| **RD 是否能直接用** | ❌ 經 Claude Code 再產 code 後，RD 仍要翻譯到 prod stack | ❌ 一樣要翻譯（tech stack、design token、component library 常常對不上 prod） |
| **RD 接手起點** | 視覺稿 + 由 Claude Code 生的 reference code | Reference code（結構 + CSS class + state） |
| **Spec 漏失風險** | 中——兩次轉譯（視覺 → code → prod） | 中——一次轉譯（code → prod） |
| **斷點位置** | 介於 Code ↔ prod | 介於 Code ↔ prod |
| **結論** | 對設計師友善（不用碰 CLI），但多一層轉換 | 設計師自己直接產 code 較接近交付點 |

## 5. 部門內協作（設計師之間）

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **Peer review** | **Organization-internal share URL**、inline comments、workspace folder（Team / Enterprise plan） | PR review（submodule workflow） |
| **Variant 探索** | 對話內建分支、custom sliders 快速調參 | git branch + worktree（可平行探索） |
| **共享 prompt / scaffold** | Onboarding 一次，團隊共享 design system | `.claude/commands/`、`.claude/agents/`、skill checked in repo，全隊共用 |
| **新人 onboarding** | 開帳號即用 | 需要學 git（有 `git-operation-guide.md` + designer submodule workflow 包裝過） |
| **結論** | 協作鏈低摩擦 | 摩擦高、但可版控 / 規模化 |

## 6. 跨部門協作（PM / RD / Stakeholder）

| 面向 | Claude Design | Claude Code CLI |
|---|---|---|
| **給 PM 看** | Org-internal URL 一貼就看、可 export PDF/PPTX | 需要 deploy preview 或 GitHub Pages（`trendlife-ui-mockup` 就是這做法） |
| **給 RD 討論** | 對著 canvas + handoff bundle 講 | 對著 diff / PR 講 |
| **Stakeholder 決策紀錄** | 設計版本 + 評論內 | git commit + PR description + meeting-minutes |
| **追蹤回饋 → 落地** | 手動 | PM 回饋可進 Jira → skill 拉進來 → 變 task |
| **結論** | 視覺溝通強 | 決策可追溯性強 |

## 7. Figma 的位置（容易踩坑）

| 方向 | 現況（2026-04） |
|---|---|
| Claude **Code** ↔ Figma | ✅ Figma MCP 支援雙向：Code to Canvas（code → Figma frame）、Figma → code context |
| Claude **Design** → Figma | ⚠️ **無官方直接匯出**，需第三方工具（Anima、html.to.design） |
| Claude **Design** → Claude Code | ✅ 一鍵 handoff bundle |
| Figma → Claude **Design** | 走 Claude Code 中介或重 onboarding |

## Access / 定價

- **Claude Design**：Pro / Max / Team / Enterprise 訂閱，research preview 階段
- **Claude Code CLI**：API usage-based 或 Max 訂閱 tokens；企業可接 Bedrock / Vertex

## 整體比較

| 維度 | Claude Design | Claude Code CLI |
|---|---|---|
| **設計師啟動成本** | 極低 | 高 |
| **交付給 RD 的斷點數** | 2 次轉譯（視覺 → Code → prod） | 1 次轉譯（Code → prod） |
| **自動化能力**（requirement / design system 持續同步） | 低 | 高（hooks / cron / MCP / skill） |
| **部門內協作（視覺）** | 強（org URL + inline comments） | 弱 |
| **部門內協作（版控）** | 弱 | 強 |
| **跨部門可追溯性** | 中 | 強 |
| **設計師自主天花板** | 被 scaffold 結構化 | 無天花板、靠使用者 |

## 針對這場景的建議

**純視覺驗證概念、跨部門 review**：Claude Design 主場。

**要交付 RD、要自動化 requirement 吸收、要版控 design system**：
- **主力用 Claude Code CLI**——自動化 pipeline + 斷點少一層
- **Claude Design 當前段**——設計師視覺發想、stakeholder review 時用，再透過 handoff bundle 進 Claude Code
- **認清定位**：兩者不是擇一，是**接力**（Design → Code → RD）

**你已有的資產**：
- Requirement 吸收：`teams-channel-digest`、`outlook-email-digest`、`teams-to-confluence`
- Design system 同步：`cross-team-submod/local-cache-ttl/`
- 設計師 git workflow：`Karen-test-submodule/git-operation-guide.md` + phase-b-reminder hook
- 交付 RD：submodule + PR review + GitHub Pages preview

## Sources

- [Introducing Claude Design by Anthropic Labs](https://www.anthropic.com/news/claude-design-anthropic-labs)
- [Claude Design launch coverage — VentureBeat](https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma)
- [TechCrunch — Claude Design](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/)
- [From Claude Code to Figma — Figma Blog](https://www.figma.com/blog/introducing-claude-code-to-figma/)
- [Claude Design to Figma via Anima](https://www.animaapp.com/blog/product-updates/how-to-go-from-claude-design-to-figma/)
- [Claude Code + Figma workflow — Builder.io](https://www.builder.io/blog/claude-code-to-figma)
- [Figma MCP connector](https://claude.com/connectors/figma)
