# Week 5 Outline — 讓 AI 讀對規範：CLAUDE.md、memory，與持續同步的需求

> **EN title**: Feeding the AI the right context — CLAUDE.md, memory, and always-fresh specs
> 審稿用大綱。確認後再生 `build-week5-pptx.js` → `week5-claudemd-and-context.pptx`。
> 格式沿用 week3/4：pptxgenjs、TLDS palette、雙語標題（ZH 主、EN 副）、helper（box / pill / sayRow）。
> **重點調整（依用戶指示）**：重心放 CLAUDE.md & memory（概念 **＋ 如何建立/使用** 全域與專案、優先順序）；**不講 repo 四層分層**；直接帶到 design-context skill 的 whole story（引用專案設定檔 + 持續讀最新需求文件）。
> 素材出處：global `~/.claude/CLAUDE.md`、design-context `README.md` / `SKILL.md`、會議記錄 `meeting-minutes/2026-05-28-design-pr-review-feedback.md`（§B）。

---

## 故事線 Story arc

**靜態、你寫的**（CLAUDE.md / memory）→ 缺口：有些規範是別人的、天天變 → **動態、持續同步的**（design-context）。

兩幕：
- **Part 1（S3–S11）CLAUDE.md & memory** — 概念 + **怎麼建立與使用**。全域 vs 專案、優先順序、memory 是什麼與怎麼用。
- **Part 2（S12–S18）design-context** — 怎麼引用「別人維護、會變的規範與需求」並持續讀到最新。

共 **18 片**。

---

## Part 1 — CLAUDE.md & memory（你寫的、靜態的）

### Slide 1 — 封面 Cover
- **ZH**：讓 AI 讀對規範
- **EN**：Feeding the AI the right context
- eyebrow：Week 5 · GitHub for Designers
- 講者：前四週學會用 AI 操作 git，但 AI 怎麼「知道」你的規範？這週講兩件事：你寫給它的規範（CLAUDE.md / memory），和怎麼讀到別人天天在改的需求（design-context）。

### Slide 2 — 回顧 + 橋接 Recap & Bridge
- **ZH**：AI 會操作了，但它「知道」你的規範嗎？
- **EN**：It can drive Git now — but does it know your rules?
- 內容：Week4 你能用自然語言 commit/push/PR。但每次都要重講「commit 要 conventional、push 前切帳號」嗎？
- 講者：帶出「規範可以寫成檔案、AI 自動讀」。

### Slide 3 — CLAUDE.md 是什麼 What is CLAUDE.md
- **ZH**：CLAUDE.md — 讓 AI 記住你的專案規範
- **EN**：CLAUDE.md — your project's standing instructions
- 內容：放在專案根目錄的設定檔，Claude Code 每次自動讀取並遵守，不用重講。
- 類比：像 Figma 設好 Design System——定義一次，到處適用。
- 講者：建立「規範 = 檔案，AI 自己讀」的認知。

### Slide 4 — CLAUDE.md 範例 Example
- **ZH**：寫一次，每次對話都生效
- **EN**：Write once, applies every session
- 內容 code block：
  ```markdown
  ## Commit 規範
  - Conventional Commits：feat: / fix: / chore:
  - Commit message 說明 what + why
  ## 專案特殊設定
  - Push 前切換正確 GitHub 帳號
  - 中英混排用中文標點
  ```
- 講者：這些就是「不用再口頭叮嚀」的規範。

### Slide 5 — 怎麼建立與維護 CLAUDE.md How to create & maintain ⭐（新增 how-to · 截圖）
- **ZH**：怎麼建立、更新 CLAUDE.md
- **EN**：Create & update CLAUDE.md
- 內容（已對 docs 校正，**移除不存在的 `#` 功能**）：
  1. **`/init`** — 讓 Claude Code 掃過專案自動生成 CLAUDE.md 草稿；問你存 `./CLAUDE.md` 還是 `./.claude/CLAUDE.md`（最省事起點）
  2. **直接編輯檔案** — 純文字 markdown，隨時開來改、加規範
  3. **跟 Claude 講** — 「把這條規則寫進 CLAUDE.md」，它幫你編輯
  4. （進階）**`@import`** — CLAUDE.md 內 `@docs/git-rules.md` 引入別的檔，開機一起載入
- **截圖**：終端跑 `/init` 的畫面（生成 CLAUDE.md 草稿 + 詢問存放位置）。
- 講者：設計師最常用 ①`/init` 起手 + ② 直接改檔。

### Slide 6 — 兩層 CLAUDE.md Two levels ⭐
- **ZH**：全域 vs 專案 — CLAUDE.md 有兩個家
- **EN**：Global vs project — CLAUDE.md lives in two places
- 內容（box 對照）：
  - **全域** `~/.claude/CLAUDE.md`：你**所有**專案通用的個人偏好（變數命名、收工流程、commit 習慣）
  - **專案** `<repo>/CLAUDE.md`（或 `.claude/CLAUDE.md`）：**這個**專案專屬的規範（帳號、設計系統路徑、團隊慣例）；checked into git，全團隊共用
- 補：全域跟著你、不進 git；專案進 git、開給團隊。`/init` 預設寫的是專案層。
- 講者：一個跟著「你」，一個跟著「專案」。

### Slide 7 — 優先順序 Precedence ⭐⭐
- **ZH**：兩個都讀，誰說了算？
- **EN**：Both are read — who wins?
- 內容（sayRow 風格）：
  - Claude Code **兩個都載入**：全域先、專案後
  - 衝突時 **專案層更具體、覆寫全域**（例：全域說用個人帳號，專案說用工作帳號 → 在這專案聽專案的）
  - 心智模型：全域 = 預設值，專案 = 在地覆寫（override）
- 講者：這是設計師最容易搞混的點，給明確規則 + 一個衝突實例。

### Slide 8 — memory 是什麼 What is memory
- **ZH**：memory — Claude 自動累積的長期記憶
- **EN**：memory — what Claude accumulates across sessions
- 內容：除了你寫的 CLAUDE.md，Claude Code 會把「對話中學到的事實」**自動**存成持久記憶（你的角色、偏好、專案現況、給過的回饋），下次開新對話自動帶回。
- **檔名（你要提的）**：`~/.claude/projects/<專案>/memory/MEMORY.md`（索引，開機載前 200 行）+ 主題檔（按需載入）。
- ⚠️ **machine-local，不跨裝置**（跟進 git 的 CLAUDE.md 不同）。
- 講者：CLAUDE.md 是「你寫的規則」，memory 是「Claude 記住的事實」——重點差別：一個你寫、一個它長。

### Slide 9 — 怎麼用 memory How to use memory ⭐（新增 how-to · 截圖）
- **ZH**：它自動記，你負責校正
- **EN**：It remembers; you keep it honest
- 內容（已對 docs 校正，**移除不存在的 `#`**）：
  - **自動累積**：你不用手動加；Claude 從對話/回饋自己寫進 `memory/`
  - **想要它記**：直接說「記住我用工作帳號」→ Claude 寫入 memory
  - **自動帶回**：下次開新對話，相關記憶自動出現在 context
  - **檢視/校正**：`/memory` 瀏覽所有 memory 與 CLAUDE.md 檔、開檔編輯、開關 auto memory
- **截圖**：`/memory` 互動畫面（列出 memory 檔 + auto memory 資料夾）。
- 講者：memory 不是黑盒；`/memory` 看得到、改得動。記錯比沒記更糟，要會校正。

### Slide 10 — CLAUDE.md vs memory 對照 Rules vs memory
- **ZH**：你寫死的規範 vs 會長出來的記憶
- **EN**：Rules you author vs memory that accrues
- 內容（對照表）：

  | | CLAUDE.md | memory |
  |---|---|---|
  | 誰寫 | 你手動寫 | AI 自動累積（你可校正/刪） |
  | 內容 | 規範、慣例、指令 | 事實、偏好、現況、回饋 |
  | 何時變 | 你編輯 / `/init` | 對話中自動長 |
  | 範圍 | 全域 / 專案（可進 git） | 跟著你、machine-local |
  | 怎麼動它 | `/init` / 編輯檔案 / `@import` | 說「記住」/ `/memory` 校正 |
- 講者：兩者互補；規範用 CLAUDE.md，狀態/事實交給 memory。

### Slide 11 — 兩者都靜態、都「你的」 Both are static & yours
- **ZH**：但這些都是「你」的、寫好就靜在那
- **EN**：But these are *yours* — and they sit still
- 內容：CLAUDE.md 你寫了才有、memory 是你的個人記憶。它們不會自己跟上**別人**天天在改的東西。
- 講者：轉場——拋出缺口，進 Part 2。

---

## Part 2 — design-context（別人的、會變的、要持續同步）

### Slide 12 — 缺口 The gap
- **ZH**：有些規範不是你的，而且天天變
- **EN**：Some rules aren't yours — and they change daily
- 內容（三個例子）：部門 **Design System**（VXD 維護）、PM 的**需求文件**、**會議結論**。把它們抄進 CLAUDE.md → 隔天就過期。
- 一句回扣 Week3：這類「只讀不改的參考」= Type B（不展開分層，只點名）。
- 講者：你需要的不是「寫死」，而是「持續拉到最新」。

### Slide 13 — design-context 登場 Enter design-context
- **ZH**：design-context — 自動把最新規範與需求餵給 AI
- **EN**：design-context — keeps the AI's context fresh, automatically
- 內容 whole-story 一圖（出自 README）：
  ```
  GitHub repos ──cron + session-start──▶ 本地 cache ──skill 觸發──▶ agent 讀取
  ```
- 講者：這是我們團隊已做出來的 skill；它解決「引用專案設定檔 + 持續讀最新需求」。

### Slide 14 — 兩種來源 L1 / L2 Two sources
- **ZH**：L1 部門規範、L2 專案需求
- **EN**：L1 department rules · L2 project specs
- 內容（box 對照）：
  - **L1 部門規範**（`vxd-skill`：TLDS tokens、brand、motion、component）→ shallow clone（只拉最新整包）
  - **L2 專案需求**（`REI-Project/docs`：requirement、決策、**會議記錄**）→ sparse checkout（只拉該資料夾，一天 commit 多次也不肥）
- 接回 Part 1：L1/L2 就是「別人版的 CLAUDE.md / 需求」——只是你不用手抄，skill 幫你持續拉。
- 講者：對應「設定檔（L1）」與「需求文件（L2）」。

### Slide 15 — 怎麼保持最新 Staying fresh
- **ZH**：背景自動拉 + 設計前強制讀
- **EN**：Auto-pull in background + read-before-design
- 內容：
  - **cron 每 30 分**背景 fetch 最新（launchd）
  - **SessionStart hook** 補刀（cron 漏接時）
  - skill **On Activation** 強制 agent 設計前先讀 manifest + 最新異動 digest
  - 觸發詞：「請根據 Q1-ONBOARDING 做設計」「用部門規範」「拉最新 PM spec」
- 講者：設計師不用記指令，講人話就會觸發。

### Slide 16 — 變更通知 Change notifications
- **ZH**：規範變了，主動提醒你
- **EN**：When specs change, you hear about it
- 內容：sync 偵測到超過 threshold 的異動 → macOS 通知（即使 Claude Code 關著）+ 寫 digest，下次設計時 agent inline 提醒（例：「Q15 家庭設定規格昨天被改寫，你既有的設計要重看」）。
- 講者：避免「埋頭做完才發現規格早變了」。

### Slide 17 — 會議結論 / Teams 共識（依 5/28 會議要擴充）New: meeting & Teams consensus
- **ZH**：把會議結論與團隊共識也納入
- **EN**：Pull in meeting outcomes & team consensus too
- 內容（meeting §B.5，標「規劃中」）：
  - meeting notes 納為設計 source
  - Teams 訊息加人工 tag（`#共識` `#conclusion` `#Stanley` `#BD`）→ agent 精準抓團隊默契
  - 來源未來擴到 email
- 講者：明確標示這是 roadmap、依會議回饋要做的擴充。

### Slide 18 — 老實的限制 + 橋接 Week6 Honest caveat & next
- **ZH**：工具補不了「源頭沒更新」
- **EN**：A tool can't fix specs nobody updates
- 內容（meeting §B.2/B.3）：
  - 根因常是 PM/RD **沒把口頭/會議結論回寫文件**——這是溝通問題
  - ⚠️ 若硬抓「過時的 requirement」，反而跟現行設計打架、製造 conflict
  - 所以 design-context 是「持續同步 + 提醒」，不是「保證正確」；先把流程做對再自動化
  - 橋接 Week6：一人多 repo 的每日 workflow、怎麼把這些層在日常串起來
- 講者：誠實收尾，避免過度承諾。

---

## 待你確認
1. **片數/比例**：18 片，Part1（CLAUDE.md+memory，含 2 片 how-to）佔 9 片、Part2（design-context）佔 7 片，OK？
2. **how-to 深淺**：S5（建 CLAUDE.md）+ S9（用 memory）給 `/init`、`#`、`/memory` 三招。要不要實際截圖／terminal 示意？還是文字條列就好？
3. **memory 名詞**：投影片用「memory」還是「memory.md / 自動記憶」？（實際機制是 Claude Code 的持久記憶，未必對設計師講檔名）
4. **指令正確性**：✅ 已對官方 docs 校正（2026-06-02）。重大更正：vanilla Claude Code **沒有 `#` 快速加記憶功能**，已全數移除；改用 `/init` + 直接編輯 + 「跟 Claude 講」。memory 檔名確認為 `~/.claude/projects/<專案>/memory/MEMORY.md`。
5. **優先順序（S7）**：用「全域=預設、專案=覆寫」這組心智模型 OK？要不要畫成圖？
6. **S17 Teams/meeting**：標「roadmap」還是先不放（等真的做了再講）？
7. **檔名**：`week5-claudemd-and-context.pptx`？要不要 `build-week5-en.js` 英文純版？

---

## ⚠️ 另一條獨立工作線：design-context skill 要照 5/28 會議回饋修
（與 Week5 deck 分開，建議當下一個任務處理。摘自 meeting §B + 行動項目）

1. **核心重新聚焦**：core = 定期 fetch requirement + **meeting notes**；in-line design notes 降為次要。
2. **擴充 doc source**：加入 **Teams chat history**（用 `#共識`/`#conclusion` tag 擷取），未來含 email。
3. **⚠️ outdated-requirement 風險**：抓到沒更新的舊 requirement 會跟現行設計衝突 → 需先評估，決定 fetch-requirement 是否上線 / 加防呆。
4. （待釐清）PR 設定方向：關掉 auto-merge、允許 self-review（這條主要影響 design-pr-review，附記）。
