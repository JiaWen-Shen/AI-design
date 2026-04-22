Presentation deck

Appendix: Q&A

目錄

🎨 UI Designers 

跟 Figma 搭配使用

跟 Claude Code CLI 搭配使用

把 convention / skill 帶進 Claude Design

🧑‍💻 RDs

跟現在團隊協作架構的整合

📋 PMs

🧭 Managers 

效率提升：哪裡、多少

適合的場景：它贏在哪

🎨 UI Designers 

🔥 「它會取代 Figma嗎？」

不會。兩者做不同的事，AI 加速的是設計製作，不是設計思考。

「用 Claude Design 需要會 CLI / Git 嗎？」

不用。Slide 8 就是這個承諾："No CLI. No Git. Just a canvas and a chat box." handoff 到 Claude Code 是一鍵的 — 設計師完全不用看到 terminal。

「我可以匯入既有的 Design System / Figma library 嗎？」

部分可以。Claude Design 在 onboarding 時可讀 GitHub repo link 或 .fig 檔（Slide 19）。注意（Slide 28）： 原始檔更新不會自動同步到 Claude Design — 要用「Remix」手動改。如果你的 DS 每週都在變，預期會有工作量。

「如果我不用 Claude Design 了，作品怎麼搬走？」

匯出格式：HTML、PDF、PPTX、Canva（Slide 2）。沒有官方的 Figma 匯出 — 需要 Anima 或 html.to.design。建議：把 Claude Design 的 output 當成「交付物」（簡報、marketing 頁），不要當成一個長期 DS 的 canonical source。

「可以像 Figma 那樣多人即時共編嗎？」

⚠ 沒有 team-level 協作機制（2026-04-22 已用企業帳號確認）。 Claude Design Team plan 裡沒有 team members 管理、沒有 team project、沒有 shared workspace / shared skills / shared documents。分享只能透過 org share URL 給單篇 artifact，沒有 Figma 那種多人即時共編。被問到就直接講：「目前沒有多人即時共編，只能用分享連結做非同步 review」。

「可以微調像素嗎？1px 的 margin 可以動嗎？」

有 spacing / color / layout 的 GUI sliders（Slide 11）。像素級細修還是 Figma 比較好。Claude Design 的上限是「在 scaffold 上微調」，不是「從頭刻」。

「產出的東西可以直接 ship 嗎？」

不行。Slide 6 講得很明白：Universal gap — 產出的是 spec，不是 shipping code。可以用來做 stakeholder 簡報或 mockup；RD 仍然要把 reference code 翻譯到你們家的 prod stack。

「用哪個 AI model？可以選 Haiku 跑快一點嗎？」

只有 Opus 4.7，沒辦法切模型（不像 Claude Code 可以 Opus / Sonnet / Haiku 切）。

「它還在 research preview — 現在該用嗎？」

先用在非關鍵的工作（marketing one-pager、pitch、概念探索）。預期會滾動更新。不要把整個團隊的 DS pipeline 壓在上面，等到 GA 再說。

— 跟 Figma 搭配使用 —

「我可以繼續用 Figma，同時搭 Claude Design 嗎？」

可以，而且這就是建議的用法。Figma 當你「canonical」的 DS 與細節打磨的地方；Claude Design 是 mockup / 簡報 / one-pager 的快速通道（那些本來要在 Figma 從零做的東西）。把它想成「低 craft 端工作的捷徑」。

「可以 Figma 開頭、Claude Design 完成嗎？」

部分可以。Claude Design 在 onboarding 接受 .fig 檔（Slide 19 — 要從 Figma Save local copy）。這是匯入，不是連結。所以：初期 scaffolding 可以，「兩邊一直同步」就沒辦法。

「可以 Claude Design 開頭，再搬到 Figma 打磨嗎？」

沒有官方的 Figma 匯出。選項：

Anima（第三方）— 把 HTML output 轉成 Figma layers

html.to.design — 類似

截圖重建 — 最慢但最乾淨
如果 Figma 一定要是最終畫布，預留時間走一次 Anima。

「我的 Figma library 每週都在更新 — Claude Design 會跟上嗎？」

不會自動同步。Slide 28 Card B 的 limit："Design system · 不會 auto-sync — 要手動 Remix"。要重新匯入或走 Remix chat flow。DS 持續演進的話，drift 的風險是真的。

「可以在 Claude Design 裡用 Figma plugin / community 元件嗎？」

Plugin：不行 — 它們住在 Figma。community 元件透過 .fig 匯入可以用，但 plugin 的行為不會被繼承進來。

「如果我們團隊 100% Figma-native，這不就只是多一層 overhead？」

說真的，對現在的你們來說可能是。最受益的是今天還在用 Google Docs 寫設計規格 + 粗略交付的設計師。如果你們的 Figma-to-Storybook-to-prod pipeline 已經很完整，Claude Design 加進來只是雜訊，除非特定情境是 Figma 真的慢的那種（簡報、marketing artifacts、臨時 prototype）。



— 跟 Claude Code CLI 搭配使用 —

🔥 「可以在 Claude Design 和 Claude Code 之間交替使用嗎？怎麼協作？」

可以，但不是 peer-to-peer 協作，是單向 relay（接力）。

三種協作模式：

① 接力模式（主流用法）
Claude Design 做視覺探索 → 一鍵 "Send to Claude Code" → 產出 handoff bundle（PROMPT.md + reference code + 視覺 canvas）→ Claude Code 接手做自動化 / 版控 / RD 交付。這就是 Slide 28 "It's a relay" 講的流程。

② 上下游模式（推薦流程）
Figma（DS 與細節 craft 的 source of truth）→ Claude Design（視覺快速通道 + stakeholder review）→ Claude Code（handoff + RD 交付 + 自動化）。每個 phase 住在最適合的工具裡，handoff bundle 跟 Figma MCP 當銜接橋樑。

③ 選邊站模式
某些情況不需要兩者都用：

純視覺素材、stakeholder review → 只用 Claude Design

CLI 用得順、stakeholder 接受看 code preview → 跳過 Claude Design

關鍵限制：

handoff 是單向的：Claude Design → Claude Code 有一鍵流程；Claude Code → Claude Design 不是 first-class path。離開 Claude Design 後，同一個專案就不要再回頭

沒有 live sync：不存在「改 Claude Code 的 code，Claude Design 畫布自動更新」這種雙向同步

決策要一次做對：選 Claude Design 開場前，要先想清楚之後會不會切到 Claude Code — 切過去後，視覺 canvas 就跟 code 脫鉤了

怎麼知道什麼時候該切？ 觸發點列在下方〈同一個專案什麼時候切換〉那題。

「我要不要一起學 Claude Code CLI？」

看你要交付什麼：

純視覺產出（簡報、marketing、stakeholder mockup）：只用 Claude Design 就夠

交付 RD、長期專案、DS 工作：會碰到 Claude Design 的天花板。學 Claude Code CLI 讓你拿到 CLAUDE.md、git-based 版控、MCP 整合、skill。Slide 13 的 WHY 區塊就是在講「什麼時候會感受到這個天花板」

「Claude Design 的 canvas 還是 Claude Code 的 prompt — 先開哪個？」

Rule of thumb：

下一步是 stakeholder review → Claude Design 開場

下一步是 RD 接手 → Claude Code 開場

專案中途不確定時 → Claude Design 比較安全（因為有一鍵 handoff bundle，要切過去隨時可以）

「同一個專案什麼時候從 Claude Design 切換到 Claude Code？」

觸發點：

需要版控 / rollback / diff → Claude Code

想要 MCP 從 Teams / Jira 吸 requirement → Claude Code

要跨裝置 reproducible build → Claude Code + git

要自動化（cron、skill、hook）→ Claude Code

RD 要開始接手了 → Claude Code（走 handoff bundle）

「handoff bundle 是雙向的嗎？」

目前單向。Claude Design → Claude Code 是有文件的流程（一鍵「Send to Claude Code」）。Claude Code → Claude Design 不是 first-class path。規劃 flow 時要注意 — 離開 Claude Design 後，同一個專案就不要再回頭。

「我 Claude Code 用得很順，還需要 Claude Design 嗎？」

不一定。如果用得很順，不用刻意換環境 — 原本的 harness 設定（CLAUDE.md、skill、MCP、hook）都已經就位，搬到 Claude Design 等於從頭重建一個能力更窄的環境。

但如果是新專案、想要快速產出（stakeholder mockup、marketing one-pager、pitch 視覺），可以試試 Claude Design — 它的 scaffolding 跟 GUI 操作對「從零到 0.5」的階段比較省力。

「Claude Code 的 Figma MCP 工具 — 對設計師有用嗎？」

非常有用，且很多人不知道。mcp__figma__get_design_context、mcp__figma__get_screenshot、mcp__figma__get_variable_defs 讓你丟一個 Figma URL 給 Claude Code，就能拿到一致的 output。這就是 Team UX repo 現在透過 submodule workflow 走的路。 想學 Claude Code CLI 的話，這幾個 MCP 工具是第一波該熟悉的。

「所以理想的設計師 stack 是？」

Figma（DS + 細節 craft 的 source of truth） → Claude Design（視覺快速通道 + stakeholder review） → Claude Code CLI（handoff + RD 交付 + 自動化）。看當下 phase 適合哪個就住在哪個；handoff bundle 跟 Figma MCP 是銜接橋樑。



— 把 convention / skill 帶進 Claude Design —

「我可以把整個 repo 丟給 Claude Design，叫它同時讀 .claude/skills/ 照 skill 執行嗎？」

不行。 Claude Design 沒有 skill runner。

Claude Design 讀 repo 的目的是一次性抽 DS（colors / typography / components），不是 agent loop

.claude/skills/*.md 頂多被當一般文字看過，不會被當「可執行的 skill」辨識

Skill 的 frontmatter + 指令需要 Claude Code 的 harness 才跑得起來（這正是 Slide 13 WHY 區塊講 harness 差異的具體例子）

「那我的 convention 怎麼帶進 Claude Design 還能保持一致？」

三個做法，由持久到短暫：

① 塞進 DS import source（最持久）
把 convention 寫進 Claude Design onboarding 時會讀到的那幾個地方，讓它直接變成 DS 的一部分：

GitHub repo 的 tailwind.config.js / tokens.json / design-tokens.css

/components/ 的註解 + JSDoc

.fig 檔的 component description 欄位
→ 可以塞結構性規則（tokens、spacing scale、component pattern）。塞不進純文字 prose 規則。

② Remix chat 固化（次持久）
Onboarding 完成後，走 Organization settings → design system → Open → Remix，用聊天告訴它：

"All component naming must follow BEM. Spacing must be multiples of 4. Dark text only #153241 or #788086. CTA buttons use imperative verbs."
→ 會以 DS 形式固化，不用每個 new project 重貼。但只能用 chat，沒有檔案上傳欄位。

③ 每個 new project chat 開頭貼一段（session-level）
最底、最保險的做法：每次開新 project，先把 convention 貼進 chat。
→ 離開這個 project 就沒了，但可以塞任意 prose 規則。

「Team / Enterprise plan 有『workspace instruction』之類可以統一注入的欄位嗎？」

沒有（2026-04-22 已用企業帳號確認）。 Claude Design Team plan 的 UI 裡沒看到 workspace-level instruction 欄位、沒有 team shared skills / documents、沒有 team members 設定、沒有 team project 管理。目前能用的 convention 注入機制就只有上面 3 個（DS setup / Remix / chat）。如果要跨人 / 跨 project 共用規則，唯一持久的選項是把規則寫進 DS 本身（①），Workspace 層級沒有 hook 點。

「理想的做法是？」

skill 留給 Claude Code。 Claude Design 這邊只放 DS + 結構性 convention；skill 層級的檢查 / 轉換 / commit / sync 走 handoff bundle 到 Claude Code 那端執行。這就是 Slide 28「It's a relay」講的分工：

Claude Design 端：視覺一致性規則（tokens、spacing、component pattern、wording tone）

Claude Code 端：可執行規則（lint、format、versioning、skill-based 自動化）

🧑‍💻 RDs

🔥 「產出的 code 可以直接 ship 嗎？」

不行。 

Slide 6 Universal gap："Claude Design 的 output 是 spec，不是 shipping code"

handoff bundle（透過 Claude Code 產生）是 reference code — 通常是 HTML / Tailwind

RD 仍然要把 reference code 翻譯到你們的 prod stack（React Native、component library、design tokens、API layer）

它的價值是更豐富的 spec — PROMPT.md、設計決策、意圖 — 不是 merge-ready code

「handoff bundle 產出什麼 tech stack？」

預設 HTML / Tailwind。prompt 條件化可以指定其他 stack。我們的假設永遠是：reference → 翻譯到 prod。

「它會符合我們的 design tokens / component library 嗎？」

onboarding 時可以讀 GitHub repo 或 design file（Slide 19）。但： token 是 black box（Slide 28："No rollback · tokens are a black box · can't diff"）。你沒辦法用程式驗證 token 跟 source of truth 一致。對比：Claude Code + mcp__figma__get_variable_defs 可以 diff。

「會不會讓我們反而要 rework 更多？」

看團隊 contract。deck 的論點是：今天用純文字 + 一張截圖丟過來的設計師，改用 Claude Design 之後會帶 PROMPT.md + reference code + 視覺 canvas — 給的 context 更多不是更少。風險是：如果設計師跳過 handoff，直接丟「成品 code」過來，RD 以為可以直接用就爆炸了。

「Claude Design 有用 Figma MCP 嗎？」

沒有。 Slide 15：只有 Claude Code 有 Figma MCP。Claude Design → Figma 要走 handoff bundle → Claude Code → Figma MCP，或第三方（Anima）。

「跟 Figma Make / Google Stitch 差在哪？」

Slide 6 有比較表。短版：

Claude Design：設計師導向的 GUI、scaffolded design system、匯出 Canva / PPTX / HTML

Figma Make：Figma-native 的 code gen，跟 Figma 生態整合度高

Google Stitch：更 DESIGN.md-centric、跨工具可攜性強



— 跟現在團隊協作架構的整合 —

「它跟我們 submodule-based 的設計 → RD 流程怎麼接？」

現在的流程 — 設計師在 Karen-test-submodule 裡面寫入 TrendLife-UX-design-team、commit、PR review、Phase B parent pointer 更新 — code 工作本身不變。Claude Design 坐在這個流程的上游：設計師用 Claude Design 做視覺探索 → 按「Send to Claude Code」→ Claude Code 落到 submodule，之後既有的 git / hook / PR 流程接手。Claude Design 是多一個 on-ramp，不是 git pipeline 的替代。

「Figma MCP 呢？我們已經透過 Claude Code 在用了。」

沒東西會壞。Claude Code 的 Figma MCP 跟以前一樣運作。Claude Design 不碰 MCP。如果設計師要給你 Figma context，既有的路徑（Claude Code + mcp__figma__get_design_context）仍然是對的。

「DS 的 import 有辦法版控嗎？」

在 Claude Design 內沒辦法。緩解： 把 local-cache-ttl 的 snapshot 當成版控的 source；只在刻意 refresh 的時間點重新匯入 Claude Design；在每個專案的 CLAUDE.md 裡 pin 住 DS 的 commit，這樣能 rebuild 到特定狀態。

📋 PMs

🔥 「從 idea 到可分享的 mockup 要多快？」

first pass 是分鐘級；polished 版本一兩小時。這是核心速度故事（Slide 3 TOC Q2 + Slide 11）。對比傳統 Figma + dev prototype loop 的好幾天 / 週。

「可以拿它來加速 stakeholder 對齊嗎？」

可以 — 這就是它的主戰場。 Slide 28 Card A：org-internal share URL、inline comments、匯出 PDF / PPTX / Canva。scenario map 明確列「cross-team sign-off on visual direction」。

「可以接 Jira / Linear / Teams 嗎？」

沒有原生整合（Slide 28："Every update pasted by hand, no MCP / cron"）。自動化的需求吸收走 Claude Code 的 skill（teams-channel-digest、outlook-email-digest）。這就是「自動化用 Claude Code CLI」那半邊的 relay。

「ROI — 哪裡最快看到效益？」

Marketing one-pager、pitch deck、概念驗證（Slide 28 Card A 場景）。快速見效。ROI 慢的：production design pipeline（Card B 場景本來就靠 Claude Code）。

「如果 sprint 中途它掛了？」

research preview — 偶爾 outage 或 API 變動要預期。關鍵的 client-facing 交付不要只押它，要有 Figma 備援方案。

🧭 Managers 

🔥 「我們要全團隊導入嗎？」

分階段導入。 Slide 28 直接引用：

Card A（主戰場）場景：現在就導入 — concept ideation、stakeholder 簡報、marketing artifact。低風險

Card B（切換到 Claude Code）場景：沿用現有 pipeline。harness + 自動化還是在 Claude Code

不要強制。 先從 1-2 位 champion 設計師開始；8-12 週後評估 leading indicator（time-to-first-prototype、stakeholder review cycle）

「它會取代我們的 Figma 預算嗎？」

不會（Slide 15）。兩者都要。Claude Design 的預算是加上去的，不是替代。緩解：先一小部分設計師試。

「它會怎麼影響團隊組成 — PM / 設計師 / RD 的界線？」

降低了非設計師產出設計類 artifact 的門檻（PM 做 pitch mockup 之類）。對速度是好事；對設計品質有疑慮。要設 guardrail：例如任何要給 stakeholder 的東西，必須經過設計師簽核。

「跟 Figma Make / Google Stitch 比，為什麼選這個？」

Slide 6 的表。短答：各有所長。我們的建議不是「Claude Design 贏過其他」— 而是「Claude Design 跟我們的 Claude Code pipeline 搭得起來，因為有 handoff bundle」。如果你們團隊是 Figma-native，Figma Make 可能更適合。

— 效率提升：哪裡、多少 —

「設計師省下的時間可以量化嗎？」

粗估模型，要跟 pilot 實際數據對：

concept / marketing 類工作從設計師週工時的 ~40% 降到 ~15%

省下來的時間轉去 DS 維護、Figma 細節打磨、stakeholder 協作 — 這些是 AI 最爛的區塊

沒省到的：決策、stakeholder 對齊、跨部門協調。AI 加速了製作，瓶頸往上游（決策層）移

「設計師多久能上手？」

第 1 小時：做出第一個 mockup

第 1-2 天：獨立做出可簡報的 artifact

第 1-2 週：熟悉 DS 匯入 + handoff

第 4 週+：知道什麼時候用 Claude Design vs Figma vs Claude Code CLI

對比：設計師學 Claude Code CLI 到同等熟練度要週 → 月。這個落差就是採用 Claude Design 最主要的效率論點。

「哪類交付物最先從『天』變『小時』？」

依加速倍率排序：

stakeholder review 簡報 / one-pager

marketing artifact（landing page mockup、campaign 視覺）

概念探索（早期變體）

含設計內容的內部文件

給 PM 快速簽核的 A/B 視覺選項

「哪些情境不會加速 — 甚至會變慢？」

detail 設計 craft（複雜 component、micro-interaction）— 還是 Figma 贏

production handoff — RD 還是要翻譯

DS 演進 — 沒 auto-sync，更新成本不變甚至更高

合規 / 法務 / a11y 簽核 — 瓶頸是審核 cycle 不是製作

剛開始導入的時候 — 前兩週其實更慢，設計師在學「什麼時候用哪個工具」

— 適合的場景：它贏在哪 —

「哪些團隊 / 產品應該先 pilot？」

優先順序：

Marketing 相關設計工作 — 最大最快的 win，合規風險低

跨多產品的設計師（像 Ryan Mather 在 Anthropic 一人顧 7 個產品）— 速度故事放大

PM + 設計師 pair 一起產 stakeholder mockup — Claude Design 降低 PM 的參與門檻

Design System team — 第二波，等我們了解匯入 drift 的風險之後

production-critical UI 工作 — 不適合做 pilot。繼續用現有 Figma + Claude Code pipeline

「哪些情境不適合？」

視覺本身就是產品的客戶交付（例如要原樣上線的 marketing site）

多設計師在同一個檔同時編輯 — 沒確認可靠支援

已經有成熟 Figma + Storybook + prod pipeline 的設計師 — 邊際效益很低

「多個團隊可以共用一個 Claude Design setup 嗎？」

跨團隊 DS 重用：匯入階段可以，但團隊數越多 drift 風險越大。

「哪些 design ops 會變多餘？」

stakeholder review 的手動 mockup 組裝 — 50%+ 自動化

「可以快速做一個版本丟 Slack 嗎？」這類 one-off — 大多自動化

不會多餘的：DS 治理、元件庫維護、跨團隊 DS 對齊、production 最終打磨

「還需要 DS team 嗎？」

需要，而且比以前更需要。Claude Design 會放大你餵進去的 DS — 好 DS → 好 output，drift 過的 DS → drift 的 output。DS team 的工作從「建 DS」往「把 DS 保持夠乾淨，讓 AI 的 output 保持一致」轉移。

「最快驗證它對我們有效的路徑？」

4 週 pilot，1 位設計師，1 個產品，可測量的 baseline。

Week 0：snapshot 目前的 time-to-first-prototype 與 time-to-stakeholder-signoff

Weeks 1-4：設計師在 pilot 產品上所有 concept 工作都用 Claude Design

Week 4：對比數字；收 stakeholder + RD 的質性回饋

Gate：如果 baseline 指標 ≥30% 加速、RD rework 沒變差，就擴大

🌀 橫跨所有聽眾的問題

「那你的 bottom line 是什麼？」

用 Claude Design 做它設計出來該做的事（視覺驗證、marketing artifact、stakeholder 簡報）；Claude Code CLI 當 production handoff 和自動化的 backbone。不是 replacement，是 relay（Slide 28）。