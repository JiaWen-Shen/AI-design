# 2026 個人工作彙報

**彙報期間：** 2026/02/01–2026/09/21（截至目前）
**職稱：** Design Engineer

## 工作執掌

Design Engineer 的角色，是把設計端的需求、素材與判斷方式，轉換成可被 AI、工具與協作流程穩定使用的系統；同時也把生成能力轉成可由視覺設計與 MKT 團隊採用、檢驗與延伸的交付。

1. **Bridge Designers ↔ AI workflow**：為設計師建立 AI 工作流程、工具、知識脈絡、訓練與協作治理，讓 AI 能實際進入日常設計工作。
2. **Bridge Visual Designers ↔ MKT**：把視覺設計系統、範本與素材流程轉成 MKT 可使用的內容生產與驗證機制，並以回饋持續收斂品質。

> `Duration` 為工作日誌中可追溯的實際推進區間，不以 commit 數推估工時；個人專案均依範圍排除。

---

## 一、Bridge Designers ↔ AI workflow

### 1. 設計師 AI / Git 協作內訓與教材系統

**Duration：** 2026/04–2026/08
**題目：** 從 Git 與 repository 基礎，到 Claude Code、模型設定與跨裝置協作的設計師 AI 工作方法。

**大綱：**

- 建立 GitHub for UI Designers 系列：Git 與 Figma 的對照、branch / fork、remote / local、PR review、衝突處理與安全復原。
- 製作 Claude Design / Claude Code 分享，釐清 Desktop、CLI 與設計師 handoff 的使用邊界，並納入 anti-AI-slop 與現場 Q&A。
- 延伸成模型選擇與設定、VPN / 帳號遷移、1 小時 prompt cache 與跨裝置協作等可操作教材。
- 於 Demo Day 完成部署與內容調整，保留未完成驗證的誠實揭露。

**可量化資料：** AI-design 於 4–8 月記錄 **122 commits**；產出 Week 1–6 系列、31 頁 Claude Design 分享、雙語互動式模型設定指南與 Demo Day 簡報等教材。

### 2. AI 開發環境、存取管理與跨 Runtime 相容

**Duration：** 2026/06–2026/09
**題目：** 將 AI 模型、帳號、憑證與多工具環境，包裝成設計團隊可安全採用的入口與運作規則。

**大綱：**

- 交付 1 小時 prompt cache 設定包：安裝、驗證、雙語說明與回報機制，降低長 context 的使用成本。
- 完成公司 AI 存取管理 plugin：整合 credential、model switching、access gate、跨平台 launcher 與 reset / recovery 流程。
- 建立 Claude Code × Codex CLI 指令共用層：以 `AGENTS.md` 為共同契約、完成 canary 驗證與每日安全同步。
- 修正 profile 模式下個人 skills 無法被載入的問題，讓不同 profile 仍可發現並使用必要工具。

**可量化資料：** AI 存取管理 plugin 於 8 月完成 **116 commits、20+ PR**、版本 **0.3 → 0.13**，含 bash 與 PowerShell 兩套 launcher、9 組 regression；跨 Runtime 相容計畫已對 **22 個專案**產生 `AGENTS.md`，其中 **20 個**完成乾淨 push。

### 3. AIUX 協作治理、健康檢查與日常作業流程

**Duration：** 2026/04–2026/09
**題目：** 將 AIUX 團隊的需求、上下文、交接與健康狀態，轉成可追蹤、可重複執行的工具與規則。

**大綱：**

- 先後建立 Teams / Outlook 需求彙整、UXD weekly digest 與新進人員 onboarding 的基礎工具。
- 建立 AI environment healthcheck：讓訪談者與受訪者各自運行可攜工具，再以逐字稿與機械檢測交叉分析。
- 建立 squad sync、daily summary、checkpoint、remote-first sync 與 handoff 機制，將日常交接轉成有 scope gate 與 regression 的流程。
- 執行 context bloat diet，量測並降低每次 agent session 的固定 context 開銷。

**可量化資料：** healthcheck 在 7 月完成 **8 場訪談、18 份機械檢測資料**並彙整為三層問題分類；context bloat diet 實測降低 memory-file 開銷 **36%**、skill-description 開銷 **44%**。

### 4. Open Design 平台評估與 TLDS 設計系統 Pipeline

**Duration：** 2026/08–至今
**題目：** 評估並建立可讓設計團隊與 MKT 使用的 AI design platform、設計系統與 deck 產出路徑。

**大綱：**

- 建立本機 Open Design CLI workflow 與專案級 token / deliverable ledger。
- 比較 Open Design、Figma AI / Make、Claude `/design`、Canva、Google Stitch、Lovart 等平台，以 UX、協作、GitHub / OneDrive、設計系統約束、成本與輸出品質建立 evidence-graded matrix。
- 將候選收斂到 Open Design 與 Figma AI / Make，並提出公司級 self-host 方案：pilot → wave → full rollout、per-user daemon pod、權限隔離與 code-first handoff。
- 將 TLDS package、設計 token、素材資產與 deck verifier 接入 Open Design pipeline，持續處理產出品質與 pipeline 強制性問題。

**可量化資料：** 8/31 建立首份 Open Design ledger，辨識 **91 個 session、7,743 個 usage events**；9 月完成 **6 家平台 matrix**與對外可讀 HTML 報告，並將 TLDS package 整理為 **64 個檔案**的可掛載設計系統快照。

---

## 二、Bridge Visual Designers ↔ MKT

### 1. MKT Template Refinement 與設計語言收斂

**Duration：** 2026/06–2026/07
**題目：** 以 benchmark、匿名偏好測試與設計師判讀，協助 MKT 建立可共識化的視覺內容方向。

**大綱：**

- 以品牌 moodboard 建立 2×2 風格分佈，檢視內部區域帳號在情緒與媒材上的分歧。
- 建立三語 swipe survey，將品牌素材去識別後收集結構化偏好與理由。
- 將量化與質化回饋整合為分析頁，保留每一項視覺手法的設計師意見，最後收斂為 warm minimalism design language 與 IG mockup 提案。
- 將整套研究、蒐集、評估、設計語言收斂的流程，形成可重複使用的 evaluation-driven pipeline。

**可量化資料：** 處理 **85 張**去識別化圖像、建立 **14 張**三語 survey 卡，收到 **8+1 份**回覆並完成量化與質化整合。

### 2. 社群內容生成 Orchestrator 與範本供給鏈

**Duration：** 2026/08–至今
**題目：** 將社群內容生成從一次性 prompt，轉為 MKT 可操作、可選版型、可同步上游資源的流程。

**大綱：**

- 建置 `social-media-gen` orchestrator，包含 preflight、editorial alignment、素材補圖、mockup preview、checkpoint 與交付規範。
- 維護 Cover、UI mockup、Blurring / Color Temperature 三個視覺表現家族，並將上游資源以 manifest 與 SHA 檢查同步。
- 根據同仁 dogfood 回饋與跨區 MKT 團隊需求對齊，補足 template guide、版型欄位、disabled gate 與跨 Runtime 說明；不另維護 Claude / Codex fork。

**可量化資料：** 8 月記錄 **24 commits**；完成 **9 個 UI mockup 版型**的精確截圖與使用指引，並經 4–5 輪內部 dogfood 迭代。

### 3. MKT 視覺素材匯出與交付工具

**Duration：** 2026/08–2026/09
**題目：** 將設計資產與交付範本變成 MKT 可直接取得、可追蹤的素材供給。

**大綱：**

- 建立設計交付 template 的 12 頁 demo，作為 AI 產出與既有 PowerPoint 品質的對照基準。
- 於 9/3 完成 `figma-export.sh`：依 Figma SECTION / FRAME 樹遞迴匯出 PNG @2x，並以 manifest 記錄輸出狀態、來源與檔案清單。
- 將輸出流程、品牌治理檢查與操作文件一併交付，讓共享素材庫可被重複更新而非手動整理。

**可量化資料：** Figma export 工具為 **471 行**互動式 shell script；以 **4 個真實 Figma URL**驗證，共正確輸出 **75 個檔案**。

### 4. AI 內容品質評估與語音方法論

**Duration：** 2026/06–2026/07
**題目：** 將 AI 內容生成由「能否寫出來」轉為可評估、可比較、可修正的視覺與語音品質流程。

**大綱：**

- 分析公司 IG 內容表現，建立以控制變因為前提的視覺 / 內容判讀，而非僅依單一觸及或互動數字下結論。
- 製作三語 blind evaluation 頁與 stakeholder 回饋機制，作為內容與風格版本的比較基礎。
- 完成 Case-Tom persona 專案的多輪 Turing test，將失敗樣本整理為可執行的 rule patch 與重寫技能。
- 將方法論整理成內部分享，並以簡報本身的多輪評測驗證產出品質。

**可量化資料：** 分析約 **223 篇**IG 貼文並產出 **8 張**互動圖表；Case-Tom 完成 **20 輪 Turing test、61.5% 命中率**，產出 **21 頁**內部分享簡報。

---

## 三、今年的內部分享與共用工具

### 內部分享 / 教材

| 主題 | 期間 | 產出 |
|---|---:|---|
| GitHub for UI Designers / Vibe Coding 系列 | 4–6 月 | Week 1–6 教材：Git 基礎、協作架構、PR / conflict、跨裝置與 context workflow |
| Claude Design 與 Claude Code 使用界線 | 4 月 | 31 頁分享與 Q&A 準備 |
| 模型設定、帳號遷移與 prompt cache | 6 月 | 雙語互動指南、設定 / 自檢 / 回報流程 |
| Case-Tom AI 內容品質與語音方法論 | 7 月 | 21 頁內部分享簡報與 evaluation-driven 製作流程 |
| Demo Day / AI design platform 說明 | 8–9 月 | Demo Day deck、平台評估 matrix、self-hosted Open Design 提案 |

### 共用工具 / 基礎設施

- `teams-to-confluence`、`uxd-req-collector`：從 Teams / Outlook 彙整需求與週報。
- `team-claude-code-1hr-cache`：設計師可自行設定與驗證的成本優化包。
- AI environment healthcheck：可攜式訪談與環境檢測工具。
- AI access management plugin：模型 / credential / profile / launcher / recovery 的統一入口。
- squad sync、daily flow、handoff、cross-runtime instruction sync：團隊交接與跨裝置作業基礎設施。
- `social-media-gen`、Figma export、TLDS deck pipeline：MKT 內容生成、素材供給與品牌化簡報交付工具。

---

## 四、專案交付與目前在手項目

### 已完成或已交付的專案

| 專案 | Duration | 大綱 / 交付 |
|---|---:|---|
| Client UI Mockup | 3/01–4/27 | 多角色情境與功能概念的 UI mockup、設計規範、多人協作 PR / handoff 流程；3 月主力，記錄 **167 commits**。 |
| Team offsite 投票與決策頁 | 6/08–6/22 | 兩案比較 deck、預算 / 行程與公開雙語投票頁，協助約 17 人團隊完成決策。 |
| 設計團隊 onboarding / repository template | 4–7 月 | 設計師 setup guide、template、跨 repo 協作與新進成員 onboarding 基礎。 |
| VPN 與 iTis 專案支援 | 6–9 月 | VPN 帳號遷移溝通、雙語設定指引與 Kaleida bundle 支援；iTis 資料 / 訪談整理、Kaleida 支援與 MKT design-system 更新。 |

### 目前在手項目

| 專案 | 起始 / 狀態 | 下一階段 |
|---|---|---|
| Open Design 評估與 self-hosted rollout | 8 月啟動，進行中 | 完成 Open Design / Figma AI-Make POC 比較；與 Infra 確認 pilot pod、權限與 DS 掛載方案。 |
| TLDS × Open Design deck pipeline | 9 月啟動，進行中 | 驗收 doc-gen assembly 與 verifier 是否真正被 pipeline 強制執行；處理 user-scoped DS routing 與品質門檻。 |
| MKT social-media-gen 與範本供給 | 8 月啟動，進行中 | 依測試回饋持續同步上游版型、補齊 template metadata 與交付指引。 |
| AI 存取管理與跨 Runtime 環境 | 6 月啟動，維運中 | 持續維護 launcher、profile / skill discovery、AGENTS sync 與安全回復流程。 |

---

## 工作成果總結

今年的工作主軸，從「教設計師如何使用 AI」逐步擴展為兩條可持續運作的橋接線：

- 對設計師，建立可被採用的 AI 工作方式：教材、context、review、access、同步與交接流程都能有明確工具與驗證。
- 對視覺設計與 MKT，建立可被評估與迭代的內容供給鏈：從品牌研究、偏好資料、設計語言，到模板、素材匯出、生成 orchestrator 與設計系統 pipeline。

因此工作成果不只是一批工具或簡報，而是把設計判斷轉為能在團隊中重複使用、追蹤與持續改善的機制。

## 資料來源與範圍

- 主要來源：2026 年每日工作摘要（3/31–9/21，共 127 份）。
- 補充來源：個人 worklog 的 2026/02–08 月頁面，用於補足早期專案期間與已彙整的 commit / 交付資料。
- 不納入：與上述職務無直接關聯的個人專案。
