# Design PR Review Feedback Meeting

**日期：** 2026-05-28（約 59 分鐘）
**地點：** Teams
**出席：** Karen、Stanley、Michael、Peter、Mei、ShuHan
**主題：** design-pr-review skill 回饋 + design-context skill 提案討論


## 一句話摘要

針對 design-pr-review skill 的實戰回饋（rebase 衝突導致 agent 誤判），決定把它擴大為「半自動 merge 流程 + 衝突才觸發畫面比對」；並討論 design-context skill 的核心定位，結論是源頭需求文件不更新才是根因，skill 應定期 fetch requirement + meeting notes，並用 Teams 訊息 tag 機制讓 agent 抓取共識。

---

## 重點討論

### A. design-pr-review skill 與 merge 流程

#### 1. 實戰問題：rebase 沒做 → agent 誤判版本

- Stanley 比 Mei 先 push，設計又在當晚變更，導致兩邊**檔名對不上**（切 view 時設計常變動：3 view → 2 view → 4 view）。
- Agent 沒有先 rebase 合最新版本，就直接亂 merge → 把新版蓋掉舊版、判斷錯誤。
- skill 目前讓 Mei「快速看到哪裡不同」、跟 AI 溝通更快（看畫面比看線框好懂），但**大部分衝突很小**，不需要每次都看畫面，只有檔名混雜、狀況太多時才需要。

#### 2. PR self-review 的 blocker 與設定方向

- GitHub branch protection：**本人不能 review 自己的 PR 來 unblock merge**；若設「require 1 reviewer」，自己按 approve 不算數。
- admin override 可以蓋過「需他人 review」的要求，但**不代表 agent 真的做了 review**，且直接開 admin 很危險（可能誤 push 到 main）。
- 3 人各自負責獨立設計區塊（分 3 塊），彼此不常 sync，互相 review 也難判斷對方改了什麼。
- **結論方向**：開 PR 流程但**允許自我 review（不強制第二人）**，PR 當成 branch protection 的 formality；重點是**關掉 auto-merge**，讓人 review 過內容再 merge。

#### 3. auto-merge 的成因與修正

- 目前 Mei 的 AI 是全自動 merge：因為 Mei 過去每次都回「要」，AI 學起來變成只要有 PR 就直接 overwrite。
- 修正：跟 AI 講「有衝突先問我再決定」；但更上游是 **merge rule / branch protection 設定**要改。

#### 4. 衝突歸屬靠 commit author 判斷（skill 設計）

- skill 不該只看 line-by-line diff，要**依 commit 是哪個 GitHub user 引入**來判歸屬（commit history 本來就有）。
- 規則範例：style / CSS 相關或來自 Stanley → 以 Stanley 為主；wording → 以 Michael 為主。
- 這個歸屬邏輯要寫進 skill / spec，agent 才不會「看到那邊有 change 就壓過去」。

#### 5. CI gate 與 mechanical review

- Michael 已在實驗用 CI 把 merge-ability gate 起來保護 branch。
- GitHub auto-merge 需「bot review」或「workflow mechanical review」才能成立。
- 想法：mechanical script 判斷 wording-only / style-only，且無互相衝突 → 才放行 auto-merge。
- 顧慮：push 前已做 local testing，有點重工。

### B. design-context skill 與需求對標

#### 1. 核心定位（重新聚焦）

- skill 核心應是**定期 fetch requirement 文件 + meeting notes**，並把 meeting notes 也納為 agent 設計時的參考 source。
- 「in-line design notes 回應 PM」是後來額外想到的次要功能，非核心。
- 架構：
  - **L1（VSD skill / convention / design system）**：shallow clone（只拉最新版整包、無 history）。
  - **L2（含 PM requirement 資料夾、一天 commit 多次）**：sparse checkout（只拉該資料夾，避免肥大）。
  - 背景 cron 定期（每 30 分鐘）抓取 cache，寫 hook 強制 agent 設計前先讀。

#### 2. 根因：源頭文件不更新（非文件對齊問題）

- PM 丟出 requirement + HTML、開會說「就這樣辦」，但後續更新散落在口頭確認或會議中，**不會把會議結論回寫文件**。
- 那些東西甚至**沒有共識**，卻被要求遵循 → 本質是專案管理 / 溝通問題，工具無法解決。
- 沒人 care 背後 requirement，大家直接看 mockup 就 comment。團隊已定型、不會改。

#### 3. ⚠️ 重大顧慮：抓 outdated requirement 反而會 conflict

- 設計已隨討論演化（Sylvia、Heather 的 feedback），但 requirement 文件沒更新。
- 若讓 agent 回去抓那份舊 requirement，會**跟現行設計對不起來、反而製造 conflict** → 套這功能可能出問題。
- 需先確認此風險再決定要不要做 fetch-requirement 那部分。

#### 4. AI 工廠轉譯問題（FED 端對接）

- FED 端「AI 工廠」會把 HIE delivered 的 HTML / MD **轉譯成完全不一樣的結果**。
- 團隊搞清楚他們的轉譯邏輯、output 資料給他們的 AI 做一致轉譯、design token 接到工廠、評估 Storybook MCP。
- 需要先建立跟 FED 端的溝通默契。

#### 5. Teams 訊息 tag 機制（團隊共識）

- 共識：資訊都在 Teams 頻道但太多，需要在訊息上加**人工 tag**（如 `#vd`、`#conclusion`、`#共識`、`#Stanley`、`#BD`），agent 才能精準抓取。
- source 仍是整個頻道，只是用 tag 擷取；agent 可分開抓不同 tag（如同時抓 `#Stanley` + `#BD`）。
- 開工時讓 agent 讀這些 tagged 內容；可在 repo 開「HIE 內部溝通用」資料夾 / 「專案小精靈」MD 當存放地。
- 把這個讀取能力**整合進 design-context skill**：讀取文件來源擴充到 Teams 內容（未來含 email）。

#### 6. 其他延伸討論

- meeting minutes「只能參考、不能相信」（貼出來的 MD 常與實際結論不符、沒人檢查）→ 牽涉到 transcribe 的落差
- 想法：中間卡一層「design requirement」保護層（PM requirement → 我們的 design requirement → 給 APP / design 的產出），不直接堆到RD沒更新的文件；理想但現況難做，或可寫 agent 代勞。
- MD template 想法：introduction / reference / 相關產品 / per-feature；可拿ShuHan的 MD 當標準套用到其他 feature。
- 不要太快全自動化：**先把流程處理好再來自動化**；UID 之間的衝突非當前優先（已有其他默契 / workaround）。

---

## 決議事項

- design-pr-review 擴大為**半自動 merge 流程**：平常人工 review，**有衝突時才觸發 skill 生成畫面比對**。
- PR 流程開啟但**允許自我 review、關掉 auto-merge**，PR 作為 branch protection 的 formality。
- design-context skill 核心定位為**定期 fetch requirement + meeting notes**，in-line design notes 為次要。
- 團隊採用 **Teams 訊息 tag convention**（`#共識` / `#conclusion` 等），讓 agent 易於抓取。
- 暫不全自動化，先把流程做對。

---

## 行動項目

- [ ] 檢視 commit / push 時的 rebase 流程為何仍出問題，補強 push hook（push 前檢查是否有 rebase）— **Michael Fu**
- [ ] 把 design-pr-review 改造為半自動 merge 流程 + 整合 PR / branch protection 設定，衝突才觸發畫面比對 — **Karen**
- [ ] design-pr-review skill 加入「依 commit author 判衝突歸屬」邏輯（style/CSS/Stanley → Stanley；wording → Michael）
- [ ] 擴充 **design-context skill** 的 doc source：加入 Teams chat history、（未來）email
- [ ] 建立 Teams 訊息 tag convention 並公告團隊（`#vd`、`#conclusion`、`#共識`、`#Stanley`、`#BD` 等）
- [ ] 評估「抓 outdated requirement 反而 conflict」的風險，再決定 fetch-requirement 功能是否上線
- [ ] FED 端談取得轉譯邏輯 / LLM，評估 design token 接 Storybook MCP

---

## 待釐清

- PR 設定要不要保留「require review」？目前傾向關掉強制、只留 self-review + 手動 merge。
- design-context 的 fetch-requirement 與 in-line design notes 兩塊，是否因根因（源頭不更新）而暫緩其一。
