# 聽眾 Q&A 準備 — Claude Design sharing

依聽眾分類，從「最可能一開口就讓你招架不住的題目」往下排到「好奇心問題」。
回答都對得到 deck 裡的某張 slide 或 handoff md，被追問時可以直接指回去。

**圖例：**  🔥 = 最可能破題的「殺手題」  ·  ⚠ = 回答要小心、有事實邊界

---

## 🎨 UI Designers — 這份簡報的主要受眾

### 🔥 「它會取代 Figma（或我的工作）嗎？」
**簡短：** 不會。兩者做不同的事，AI 加速的是**設計製作**，不是**設計思考**。
**延伸：**
- Slide 15 / Rasmus 引言（Slide 27）：*"不是 design tool，是 design production tool"*
- Figma 做 ideation、pixel-level 細修、細節打磨；Claude Design 加速 mockup / 簡報 / one-pager
- 關於角色：AI 加速了「做」，決定「做什麼」以及「說服 stakeholder 一起做」仍然是設計師的工作。Slide 30 Ryan Mather 的引言就是故意放在最後收尾這點

### 「用 Claude Design 需要會 CLI / Git 嗎？」
不用。Slide 8 就是這個承諾：*"No CLI. No Git. Just a canvas and a chat box."* handoff 到 Claude Code 是一鍵的 — 設計師完全不用看到 terminal。

### 「我可以匯入既有的 Design System / Figma library 嗎？」
部分可以。Claude Design 在 onboarding 時可讀 GitHub repo link 或 `.fig` 檔（Slide 19）。**注意（Slide 28）：** 原始檔更新不會自動同步到 Claude Design — 要用「Remix」手動改。如果你的 DS 每週都在變，預期會有工作量。

### 「如果我不用 Claude Design 了，作品怎麼搬走？」
匯出格式：HTML、PDF、PPTX、Canva（Slide 2）。**沒有官方的 Figma 匯出** — 需要 Anima 或 html.to.design。建議：把 Claude Design 的 output 當成「交付物」（簡報、marketing 頁），**不要**當成一個長期 DS 的 canonical source。

### 「可以像 Figma 那樣多人即時共編嗎？」
⚠ **不確定 — 回答要保守。** Team / Enterprise plan 有 shared workspace + inline comments + org share URL。我沒驗證過「同時共編」。被問到就老實說 *「非同步評論確認有；即時 multiplayer 我沒實測，有試過的人請指正」*。

### 「可以微調像素嗎？1px 的 margin 可以動嗎？」
有 spacing / color / layout 的 GUI sliders（Slide 11）。**像素級細修**還是 Figma 比較好。Claude Design 的上限是「在 scaffold 上微調」，不是「從頭刻」。

### 「產出的東西可以直接 ship 嗎？」
不行。Slide 6 講得很明白：**Universal gap — 產出的是 spec，不是 shipping code**。可以用來做 stakeholder 簡報或 mockup；RD 仍然要把 reference code 翻譯到你們家的 prod stack。

### 「用哪個 AI model？可以選 Haiku 跑快一點嗎？」
只有 Opus 4.7，沒辦法切模型（不像 Claude Code 可以 Opus / Sonnet / Haiku 切）。

### 「它還在 research preview — 現在該用嗎？」
先用在非關鍵的工作（marketing one-pager、pitch、概念探索）。預期會滾動更新。**不要**把整個團隊的 DS pipeline 壓在上面，等到 GA 再說。

### — 跟 Figma 搭配使用 —

### 「我可以繼續用 Figma，同時搭 Claude Design 嗎？」
可以，而且這就是建議的用法。Figma 當你「canonical」的 DS 與細節打磨的地方；Claude Design 是 mockup / 簡報 / one-pager 的快速通道（那些本來要在 Figma 從零做的東西）。把它想成「低 craft 端工作的捷徑」。

### 「可以 Figma 開頭、Claude Design 完成嗎？」
部分可以。Claude Design 在 onboarding 接受 `.fig` 檔（Slide 19 — 要從 Figma *Save local copy*）。這是**匯入**，不是**連結**。所以：初期 scaffolding 可以，「兩邊一直同步」就沒辦法。

### 「可以 Claude Design 開頭，再搬到 Figma 打磨嗎？」
沒有官方的 Figma 匯出。選項：
- Anima（第三方）— 把 HTML output 轉成 Figma layers
- html.to.design — 類似
- 截圖重建 — 最慢但最乾淨
如果 Figma 一定要是最終畫布，預留時間走一次 Anima。

### 「我的 Figma library 每週都在更新 — Claude Design 會跟上嗎？」
不會自動同步。Slide 28 Card B 的 limit：*"Design system · 不會 auto-sync — 要手動 Remix"*。要重新匯入或走 Remix chat flow。DS 持續演進的話，drift 的風險是真的。

### 「可以在 Claude Design 裡用 Figma plugin / community 元件嗎？」
Plugin：不行 — 它們住在 Figma。community 元件透過 `.fig` 匯入可以用，但 plugin 的行為不會被繼承進來。

### 「如果我們團隊 100% Figma-native，這不就只是多一層 overhead？」
說真的，對現在的你們來說可能是。最受益的是**今天還在用 Google Docs 寫設計規格 + 粗略交付**的設計師。如果你們的 Figma-to-Storybook-to-prod pipeline 已經很完整，Claude Design 加進來只是雜訊，除非特定情境是 Figma 真的慢的那種（簡報、marketing artifacts、臨時 prototype）。

### — 跟 Claude Code CLI 搭配使用 —

### 「我要不要一起學 Claude Code CLI？」
看你要交付什麼：
- **純視覺產出**（簡報、marketing、stakeholder mockup）：只用 Claude Design 就夠
- **交付 RD、長期專案、DS 工作**：會碰到 Claude Design 的天花板。學 Claude Code CLI 讓你拿到 `CLAUDE.md`、git-based 版控、MCP 整合、skill。Slide 13 的 WHY 區塊就是在講「什麼時候會感受到這個天花板」

### 「Claude Design 的 canvas 還是 Claude Code 的 prompt — 先開哪個？」
Rule of thumb：
- **下一步是 stakeholder review** → Claude Design 開場
- **下一步是 RD 接手** → Claude Code 開場
- 專案中途不確定時 → Claude Design 比較安全（因為有一鍵 handoff bundle，要切過去隨時可以）

### 「同一個專案什麼時候從 Claude Design 切換到 Claude Code？」
觸發點：
- 需要版控 / rollback / diff → Claude Code
- 想要 MCP 從 Teams / Jira 吸 requirement → Claude Code
- 要跨裝置 reproducible build → Claude Code + git
- 要自動化（cron、skill、hook）→ Claude Code
- RD 要開始接手了 → Claude Code（走 handoff bundle）

### 「handoff bundle 是雙向的嗎？」
目前**單向**。**Claude Design → Claude Code** 是有文件的流程（一鍵「Send to Claude Code」）。**Claude Code → Claude Design** 不是 first-class path。規劃 flow 時要注意 — 離開 Claude Design 後，同一個專案就不要再回頭。

### 「我 Claude Code 用得很順，還需要 Claude Design 嗎？」
說實話，自己做的話不用。Claude Design 的價值是「**給 stakeholder 看的視覺 canvas**」與「**降低非 CLI 設計師的門檻**」。如果你已經 Claude Code prompt 寫得很順，stakeholder 也能接受看 code preview，跳過 Claude Design 沒差。

### 「Claude Code 的 Figma MCP 工具 — 對設計師有用嗎？」
非常有用，且很多人不知道。`mcp__figma__get_design_context`、`mcp__figma__get_screenshot`、`mcp__figma__get_variable_defs` 讓你丟一個 Figma URL 給 Claude Code，就能拿到一致的 output。**這就是 Team UX repo 現在透過 submodule workflow 走的路。** 想學 Claude Code CLI 的話，這幾個 MCP 工具是第一波該熟悉的。

### 「所以理想的設計師 stack 是？」
**Figma（DS + 細節 craft 的 source of truth） → Claude Design（視覺快速通道 + stakeholder review） → Claude Code CLI（handoff + RD 交付 + 自動化）**。看當下 phase 適合哪個就住在哪個；handoff bundle 跟 Figma MCP 是銜接橋樑。

### — 把 convention / skill 帶進 Claude Design —

### 「我可以把整個 repo 丟給 Claude Design，叫它同時讀 `.claude/skills/` 照 skill 執行嗎？」
**不行。** Claude Design 沒有 skill runner。
- Claude Design 讀 repo 的目的是**一次性抽 DS**（colors / typography / components），不是 agent loop
- `.claude/skills/*.md` 頂多被當一般文字看過，不會被當「可執行的 skill」辨識
- Skill 的 frontmatter + 指令需要 Claude Code 的 harness 才跑得起來（這正是 Slide 13 WHY 區塊講 harness 差異的具體例子）

### 「那我的 convention 怎麼帶進 Claude Design 還能保持一致？」
三個做法，由**持久**到**短暫**：

**① 塞進 DS import source（最持久）**
把 convention 寫進 Claude Design onboarding 時會讀到的那幾個地方，讓它直接變成 DS 的一部分：
- GitHub repo 的 `tailwind.config.js` / `tokens.json` / `design-tokens.css`
- `/components/` 的註解 + JSDoc
- `.fig` 檔的 component description 欄位
→ 可以塞**結構性規則**（tokens、spacing scale、component pattern）。塞不進純文字 prose 規則。

**② Remix chat 固化（次持久）**
Onboarding 完成後，走 *Organization settings → design system → Open → Remix*，用聊天告訴它：
> "All component naming must follow BEM. Spacing must be multiples of 4. Dark text only #153241 or #788086. CTA buttons use imperative verbs."
→ 會以 DS 形式固化，不用每個 new project 重貼。但只能用 chat，沒有檔案上傳欄位。

**③ 每個 new project chat 開頭貼一段（session-level）**
最底、最保險的做法：每次開新 project，先把 convention 貼進 chat。
→ 離開這個 project 就沒了，但可以塞任意 prose 規則。

### 「Team / Enterprise plan 有『workspace instruction』之類可以統一注入的欄位嗎？」
⚠ **我還沒實際確認 Claude Design 的 UI 有沒有這種獨立欄位**。有文件記載的只有上面 3 個機制（DS setup / Remix / chat）。如果 UI 翻出來找到類似 *Project instructions* / *Workspace guidelines* 的欄位，可以當成第 ④ 個更持久的選項，但**在 confirm 前不要在台上講死**。

### 「理想的做法是？」
**skill 留給 Claude Code。** Claude Design 這邊只放 DS + 結構性 convention；skill 層級的檢查 / 轉換 / commit / sync 走 handoff bundle 到 Claude Code 那端執行。這就是 Slide 28「It's a relay」講的分工：
- **Claude Design 端**：視覺一致性規則（tokens、spacing、component pattern、wording tone）
- **Claude Code 端**：可執行規則（lint、format、versioning、skill-based 自動化）

---

## 🧑‍💻 RDs — 接收設計交付的工程師

### 🔥 「產出的 code 可以直接 ship 嗎？」
**不行。** 這是 RD 聽到最重要的一件事。
- Slide 6 Universal gap：*"Claude Design 的 output 是 spec，不是 shipping code"*
- handoff bundle（透過 Claude Code 產生）是 **reference code** — 通常是 HTML / Tailwind
- RD 仍然要把 reference code 翻譯到你們的 prod stack（React Native、component library、design tokens、API layer）
- 它的價值是**更豐富的 spec** — PROMPT.md、設計決策、意圖 — 不是 merge-ready code

### 「handoff bundle 產出什麼 tech stack？」
預設 HTML / Tailwind。prompt 條件化可以指定其他 stack。我們的假設永遠是：**reference → 翻譯到 prod**。

### 「它會符合我們的 design tokens / component library 嗎？」
onboarding 時可以讀 GitHub repo 或 design file（Slide 19）。**但：** token 是 black box（Slide 28：*"No rollback · tokens are a black box · can't diff"*）。你沒辦法用程式驗證 token 跟 source of truth 一致。對比：Claude Code + `mcp__figma__get_variable_defs` 可以 diff。

### 「會不會讓我們反而要 rework 更多？」
看團隊 contract。deck 的論點是：今天用純文字 + 一張截圖丟過來的設計師，改用 Claude Design 之後會帶 PROMPT.md + reference code + 視覺 canvas — **給的 context 更多不是更少**。風險是：如果設計師**跳過** handoff，直接丟「成品 code」過來，RD 以為可以直接用就爆炸了。

### 「Claude Design 有用 Figma MCP 嗎？」
**沒有。** Slide 15（Karen 改過的）：只有 Claude Code 有 Figma MCP。Claude Design → Figma 要走 handoff bundle → Claude Code → Figma MCP，或第三方（Anima）。

### 「跟 Figma Make / Google Stitch 差在哪？」
Slide 6 有比較表。短版：
- **Claude Design**：設計師導向的 GUI、scaffolded design system、匯出 Canva / PPTX / HTML
- **Figma Make**：Figma-native 的 code gen，跟 Figma 生態整合度高
- **Google Stitch**：更 DESIGN.md-centric、跨工具可攜性強

### 「testing / accessibility / security 呢？」
不在 Claude Design scope 內。RD 仍然負責 non-functional requirements。

### 「monorepo / private package — 它看得到嗎？」
onboarding 透過 GitHub 支援 public repo 或 admin 授權的 repo。真正 private 的 monorepo：會有摩擦。這種情境是 Claude Code + MCP 的強項（讀本地檔案）。

### — 跟現在團隊協作架構的整合 —

### 「它跟我們 submodule-based 的設計 → RD 流程怎麼接？」
現在的流程 — 設計師在 `Karen-test-submodule` 裡面寫入 `TrendLife-UX-design-team`、commit、PR review、Phase B parent pointer 更新 — **code 工作本身不變**。Claude Design 坐在這個流程的**上游**：設計師用 Claude Design 做視覺探索 → 按「Send to Claude Code」→ Claude Code 落到 submodule，之後既有的 git / hook / PR 流程接手。Claude Design 是**多一個 on-ramp**，不是 git pipeline 的替代。

### 「phase-b-reminder hook 還會觸發嗎？」
會。這個 hook 是專案層級（submodule repo 的 `.claude/settings.json`），在 submodule 裡跑 `git push` 時觸發 — 不管 code 是人手打進來的、Claude Code 直接產的、還是 Claude Design 走 handoff 過來。只要東西落到 submodule 然後 push，parent-pointer 更新提醒就會正常運作。

### 「handoff bundle 會吃我們的 `CLAUDE.md` / `design_conventions.md` 嗎？」
部分。handoff bundle 會帶一份自己的 `PROMPT.md` 告訴 Claude Code 要做什麼。**不會自動跟 submodule 既有的 `CLAUDE.md` 合併**。建議的工作流程：handoff 落地之後，請 Claude Code 在繼續 iterate 前重讀 submodule 的 `CLAUDE.md` 和 `design_conventions.md` — 你可能需要手動 prompt 一句 `"繼續前請先看 project 的 CLAUDE.md 跟 design_conventions"`。

### 「它跟我們的 `local-cache-ttl` DS 同步機制會衝突嗎？」
沒有直接整合。`local-cache-ttl` 是 Claude Code skill（TTL 到期 fetch DS）。Claude Design 有自己的 black-box DS 匯入。**要注意的風險：** 兩邊會 drift。緩解：把 `local-cache-ttl` 版當作 canonical source，只在 cache 有意義更新時才重新匯入 Claude Design。

### 「handoff bundle 會自己產 commit / branch 嗎？」
handoff 是把 code 檔案丟給 Claude Code 消化；從那之後就是一般的 git flow — Claude Code 或設計師自己 `git checkout -b` 然後 commit。bundle 本身不做 git 操作。

### 「Claude Design 的 output 要怎麼 PR review？」
你 PR-review 的是 **Claude Code 產生的 handoff code**（落到 submodule 之後），不是 Claude Design 的 canvas。Canvas review = 點 org-internal share URL。Handoff code review = 在 PR 裡 diff Claude Code 的 output。**兩層 review 分開**：視覺審查在上游，code 審查在 submodule PR。

### 「Figma MCP 呢？我們已經透過 Claude Code 在用了。」
沒東西會壞。Claude Code 的 Figma MCP 跟以前一樣運作。Claude Design 不碰 MCP。如果設計師要給你 Figma context，既有的路徑（Claude Code + `mcp__figma__get_design_context`）仍然是對的。

### 「設計師會不會跳過 handoff，直接把『成品』HTML 丟過來？這會不會是問題？」
合理擔心。團隊 contract：**任何要交給 RD 消化的東西，都必須經過 submodule + PR** — 不能 Slack 丟一包 Claude Design HTML。`git-operation-guide.md` 可以加一段：*「如果你的工作是從 Claude Design 開始，用『Send to Claude Code』handoff 進 submodule 之後再開 PR。」* 需要的話用 hook 在 Claude Code 端強制。

### 「可以追溯到當時是誰決定這樣設計的嗎？」
如果決定是在 Claude Design 的 chat 裡做的，trail 就斷在那裡（Slide 28 limit：*"no decision trace"*）。需要持久 blame 的決定，還是要在 PR description 或 `meeting-minutes/` 留一行 — 跟今天的 discipline 一樣，只是 Claude Design 多一個 source。

### 「會破壞既有 designer onboarding（git-operation-guide.md、phase-b-reminder）嗎？」
不會。設計師的 git 工作流程不變。guide 可以多一節 — 「如果你從 Claude Design 開始」— 指向一鍵 handoff。既有的 7 個錯誤情境、5 步 onboarding 都不用動。

### 「DS 的 import 有辦法版控嗎？」
在 Claude Design 內沒辦法。**緩解：** 把 `local-cache-ttl` 的 snapshot 當成版控的 source；只在刻意 refresh 的時間點重新匯入 Claude Design；在每個專案的 `CLAUDE.md` 裡 pin 住 DS 的 commit，這樣能 rebuild 到特定狀態。

---

## 📋 PMs — 產品 / 專案

### 🔥 「從 idea 到可分享的 mockup 要多快？」
first pass 是分鐘級；polished 版本一兩小時。這是核心速度故事（Slide 3 TOC Q2 + Slide 11）。對比傳統 Figma + dev prototype loop 的好幾天 / 週。

### 「可以拿它來加速 stakeholder 對齊嗎？」
**可以 — 這就是它的主戰場。** Slide 28 Card A：org-internal share URL、inline comments、匯出 PDF / PPTX / Canva。scenario map 明確列「cross-team sign-off on visual direction」。

### 「stakeholder 的決策記錄在哪？」
⚠ **只在 workspace / chat 裡。** Slide 28 的 limit：*"No decision trace"*。對比：Claude Code = git commit + PR description + meeting-minutes 檔。如果 org 需要可稽核的決策，要在上面疊一層（把最終匯出 commit 到 git，或用 Confluence）。

### 「可以接 Jira / Linear / Teams 嗎？」
**沒有原生整合**（Slide 28：*"Every update pasted by hand, no MCP / cron"*）。自動化的需求吸收走 Claude Code 的 skill（`teams-channel-digest`、`outlook-email-digest`）。這就是「自動化用 Claude Code CLI」那半邊的 relay。

### 「費用？」
Pro / Max / Team / Enterprise 分級（規模大了不便宜，per-seat）。Enterprise 才有 org-internal 協作功能。跟採購確認 — research preview 階段價格會變。

### 「對 sprint / 時程的影響？」
加速 discovery + stakeholder review。對 implementation 影響很小（RD 還是要翻譯）。「用 Claude Design 之後 10x velocity」是經典陷阱 — 不會發生。

### 「ROI — 哪裡最快看到效益？」
Marketing one-pager、pitch deck、概念驗證（Slide 28 Card A 場景）。快速見效。ROI 慢的：production design pipeline（Card B 場景本來就靠 Claude Code）。

### 「如果 sprint 中途它掛了？」
research preview — 偶爾 outage 或 API 變動要預期。關鍵的 client-facing 交付不要只押它，要有 Figma 備援方案。

### 「隱藏成本？」
- 第三方 Figma 匯出工具（需要時）：Anima 訂閱
- 「影片 demo」的螢幕錄影工具
- Team / Enterprise plan 升級買協作功能
- 前 1-2 位設計師的 onboarding 時間（handoff + DS 設定）

### 「合規 / 資料 / IP？」
去看 Anthropic Enterprise terms。要問：
- 設計輸入會離開 tenant 嗎？
- 產出 IP（通常使用者擁有，但要確認）
- Data residency（EU / 受監管產業）
- **被追問前先找法務**，不要自己在台上亂答

---

## 🧭 Managers — 設計 / 工程主管

### 🔥 「我們要全團隊導入嗎？你的建議是？」
**分階段導入。** Slide 28 直接引用：
- **Card A（主戰場）場景**：現在就導入 — concept ideation、stakeholder 簡報、marketing artifact。低風險
- **Card B（切換到 Claude Code）場景**：沿用現有 pipeline。harness + 自動化還是在 Claude Code
- **不要強制。** 先從 1-2 位 champion 設計師開始；8-12 週後評估 leading indicator（time-to-first-prototype、stakeholder review cycle）

### 「它會取代我們的 Figma 預算嗎？」
不會（Slide 15）。兩者都要。Claude Design 的預算是**加上去的**，不是替代。緩解：先一小部分設計師試。

### 「vendor lock 的風險？」
- research preview 狀態 — 產品可能變或停掉
- 沒官方 Figma 匯出 — 要遷出要走 PDF / PPTX / HTML 或第三方（Anima）
- DS setup 是 Claude-Design-proprietary（沒有像 Google Stitch 那種 DESIGN.md 標準）
- **緩解：** 把 output 當 deliverable，不當 canonical DS source。真正的 DS 留在 git 或 Figma

### 「它會怎麼影響團隊組成 — PM / 設計師 / RD 的界線？」
降低了非設計師產出設計類 artifact 的門檻（PM 做 pitch mockup 之類）。對速度是好事；對設計品質有疑慮。要設 guardrail：例如任何要給 stakeholder 的東西，必須經過設計師簽核。

### 「跟 Figma Make / Google Stitch 比，為什麼選這個？」
Slide 6 的表。短答：各有所長。我們的建議不是「Claude Design 贏過其他」— 而是**「Claude Design 跟我們的 Claude Code pipeline 搭得起來，因為有 handoff bundle」**。如果你們團隊是 Figma-native，Figma Make 可能更適合。

### 「怎麼衡量成效？」
Slide 29 「What's Next」：
- **Leading：** time-to-first-prototype、stakeholder review cycle time、設計師自述 friction
- **Lagging：** production parity（上線的 UI 有對到 Claude Design 的 mockup 嗎？）、RD rework rate、DS drift

### 「隱藏成本？」
- 第三方 Figma 匯出（需要的話）：Anima 訂閱
- 「影片 demo」的螢幕錄影工具
- Team / Enterprise plan 升級買協作功能
- 前 1-2 位設計師的 onboarding 時間（handoff + DS 設定）

### 「合規 / 資料 / IP？」
去看 Anthropic Enterprise terms。要問：
- 設計輸入會離開 tenant 嗎？
- 產出 IP（通常使用者擁有，但要確認）
- Data residency（EU / 受監管產業）
- **被追問前先找法務**，不要自己在台上亂答

### — 效率提升：哪裡、多少 —

### 「discovery → prototype 週期會加速多少？」
給範圍，不給承諾：
- **stakeholder review 用的 concept mockup**：天級 → 小時級（常見情境 5-10×）
- **pitch deck / marketing one-pager**：小時級 → 分鐘級（template 對上 10×+）
- **跨部門設計對齊 artifact**：半天 → 30 分鐘
- **production-ready handoff**：**沒有變化** — 還是卡在 RD 翻譯。這是老實話；不要承諾整個 pipeline 10×

### 「設計師省下的時間可以量化嗎？」
粗估模型，要跟 pilot 實際數據對：
- concept / marketing 類工作從設計師週工時的 ~40% 降到 ~15%
- 省下來的時間轉去 DS 維護、Figma 細節打磨、stakeholder 協作 — 這些是 AI 最爛的區塊
- **沒省到的**：決策、stakeholder 對齊、跨部門協調。AI 加速了製作，瓶頸往上游（決策層）移

### 「設計師多久能上手？」
- **第 1 小時**：做出第一個 mockup
- **第 1-2 天**：獨立做出可簡報的 artifact
- **第 1-2 週**：熟悉 DS 匯入 + handoff
- **第 4 週+**：知道什麼時候用 Claude Design vs Figma vs Claude Code CLI

對比：設計師學 Claude Code CLI 到同等熟練度要週 → 月。**這個落差就是採用 Claude Design 最主要的效率論點**。

### 「哪類交付物最先從『天』變『小時』？」
依加速倍率排序：
1. stakeholder review 簡報 / one-pager
2. marketing artifact（landing page mockup、campaign 視覺）
3. 概念探索（早期變體）
4. 含設計內容的內部文件
5. 給 PM 快速簽核的 A/B 視覺選項

### 「哪些情境不會加速 — 甚至會變慢？」
在別人挖到之前先講：
- **detail 設計 craft**（複雜 component、micro-interaction）— 還是 Figma 贏
- **production handoff** — RD 還是要翻譯
- **DS 演進** — 沒 auto-sync，更新成本不變甚至更高
- **合規 / 法務 / a11y 簽核** — 瓶頸是審核 cycle 不是製作
- **剛開始導入的時候** — 前兩週其實**更慢**，設計師在學「什麼時候用哪個工具」

### — 適合的場景：它贏在哪 —

### 「哪些團隊 / 產品應該先 pilot？」
優先順序：
1. **Marketing 相關設計工作** — 最大最快的 win，合規風險低
2. **跨多產品的設計師**（像 Ryan Mather 在 Anthropic 一人顧 7 個產品）— 速度故事放大
3. **PM + 設計師 pair 一起產 stakeholder mockup** — Claude Design 降低 PM 的參與門檻
4. **Design System team** — **第二波**，等我們了解匯入 drift 的風險之後
5. **production-critical UI 工作** — **不適合做 pilot**。繼續用現有 Figma + Claude Code pipeline

### 「哪些情境不適合？」
- **視覺本身就是產品的客戶交付**（例如要原樣上線的 marketing site）
- **每週在變的長期 DS** — no-auto-sync 問題會放大
- **多設計師在同一個檔同時編輯** — 沒確認可靠支援
- **受監管產業且 data residency 嚴格** — Enterprise terms 確認前別用
- **已經有成熟 Figma + Storybook + prod pipeline 的設計師** — 邊際效益很低

### 「多個團隊可以共用一個 Claude Design setup 嗎？」
Team / Enterprise plan 有 workspace folder 和 org-internal 分享。一個產品一個 workspace 合理。跨團隊 DS 重用：匯入階段可以，但團隊數越多 drift 風險越大。

### 「5 個設計師的話，效率倍數是多少？」
不是線性 multiplier。最佳估計：
- concept / marketing 工作：團隊整體 ~3-5×（有些設計師吃得快，有些吃得慢）
- production 工作：~1×（沒變）
- **最大收益來自工作重新分配**，不是純速度：設計師停止做 Claude Design 現在能做的事，把時間放到原本被跳過的高價值工作

### 「最小團隊規模是多少才划算？」
大概：**1 位設計師支援 ≥3 個產品、或 ≥2 位設計師 + 1 位 PM 共同產 artifact**。低於這個規模，純 Figma flow 就夠了。多產品 / 多 stakeholder 才是 Claude Design 複利生效的地方。

### 「什麼時候該重新評估（research preview → GA）？」
三個 checkpoint：
- **+3 個月**：pilot 回顧（1-2 位設計師）。Gate：要不要擴大？
- **+6 個月或 GA 公告**：全團隊採用決策。Gate：價格明朗、功能穩定
- **+12 個月**：策略性 review。我們還在對的工具上嗎？還是 landscape 變了（Figma Make、Stitch 追上來了）？

### 「這會讓我們可以少請設計師嗎？」
**這題回答要非常小心。** 我誠懇的建議：**不會 — 它讓現有設計師做更多高價值工作，不是讓同樣的工作用更少人做**。如果 leadership 問這題是想砍人頭，答案是「這是用短期成本節省換長期設計品質，不建議」。

### 「哪些 design ops 會變多餘？」
- stakeholder review 的手動 mockup 組裝 — 50%+ 自動化
- 「可以快速做一個版本丟 Slack 嗎？」這類 one-off — 大多自動化
- **不會多餘的**：DS 治理、元件庫維護、跨團隊 DS 對齊、production 最終打磨

### 「還需要 DS team 嗎？」
需要，而且**比以前更需要**。Claude Design 會放大你餵進去的 DS — 好 DS → 好 output，drift 過的 DS → drift 的 output。DS team 的工作從「建 DS」往「把 DS 保持夠乾淨，讓 AI 的 output 保持一致」轉移。

### 「該投資這個還是多請設計師？」
不同的槓桿，互補。Claude Design 在**製作層**（marketing、簡報、prototype）回本最快。請人在**思考層**（策略、研究、craft）回本。如果一定要選：先 pilot Claude Design（幾週看到結果）再決定要不要多請一位設計師（好幾個月才看到結果）。

### 「最快驗證它對我們有效的路徑？」
**4 週 pilot，1 位設計師，1 個產品，可測量的 baseline。**
- Week 0：snapshot 目前的 time-to-first-prototype 與 time-to-stakeholder-signoff
- Weeks 1-4：設計師在 pilot 產品上所有 concept 工作都用 Claude Design
- Week 4：對比數字；收 stakeholder + RD 的質性回饋
- Gate：如果 baseline 指標 ≥30% 加速、RD rework 沒變差，就擴大

---

## 🌀 橫跨所有聽眾的問題（Q&A 閃電輪）

### 「為什麼是現在要評估這個？」
Claude Design 2026 年 4 月推出 research preview。早期採用可以建立跟 Anthropic 的 feedback loop、也可以比已經在試的 peer 早一步。不評估 = 落後。

### 「一句話講清楚 Claude Design 是什麼？」
**「一個 designer 導向的 GUI，坐在 Claude Code 上，產出設計 artifact（簡報、mockup、one-pager）— 不是 shipping code。」**

### 「可以現場 demo 嗎？」
翻到 Hands-on 區塊（Slide 17–26）。

### 「你沒講的最大風險是什麼？」
**真心話：** deck 故意 under-sell 兩件事：
1. **research-preview 不穩定** — 功能可能消失。長期 pipeline 不要壓在上面
2. **設計師能力飄移** — junior 如果只用 Claude Design，還能學到設計思考嗎？開放問題，deck 沒答

### 「那你的 bottom line 是什麼？」
用 Claude Design 做它設計出來該做的事（視覺驗證、marketing artifact、stakeholder 簡報）；Claude Code CLI 當 production handoff 和自動化的 backbone。**不是 replacement，是 relay**（Slide 28）。

---

## 被問到時要換框架的題目

- *「它會產 test 嗎？」* → 「test 是 Claude Code / RD 的領域。Claude Design 是 spec generator」
- *「output 有 a11y 嗎？」* → 「Claude Design 產的是 reference output；a11y 最終責任在 RD」
- *「這會讓我們設計團隊 10×？」* → 「加速的是 artifact 層。設計思考還是 bottleneck」

---

## Slide 跳頁小抄（現場 Q&A 用）

| 問題主題 | 跳到 slide |
|---|---|
| 「這是什麼？」 | 2（Briefing） |
| 「跟 Claude Code 怎麼比？」 | 5（A1 類比） |
| 「功能對照表」 | 6 |
| 「解決了哪些痛點？」 | 9–11 |
| 「品質 / 上限 / 限制？」 | 13（A3 + WHY） |
| 「跟 Figma 共存？」 | 15 |
| 「什麼時候用哪個？」 | 28（scenario map） |
| 「然後呢 / 長期？」 | 29 |
