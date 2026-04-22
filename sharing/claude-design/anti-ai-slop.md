# 反 AI slop：Claude Design vs huashu-design 的兩種解法

> 來源：`alchaincyf/huashu-design` 的 SKILL.md（§1.a 核心資產協議、§6 反 AI slop）
> 整理日期：2026-04-22

---

## 一、什麼是 AI slop？

**AI slop = AI 訓練語料裡的「視覺最大公約數」**——紫漸層、emoji 圖標、圓角卡片+左側彩色 border、SVG 手畫人臉、深藍底 `#0D1117`⋯⋯

這些東西本身不一定醜，問題是**它們是 AI 默認模式下的產物**，每個 AI 生出來的頁面都長這樣，**不攜帶任何品牌資訊**。

中文有人翻「AI 餿水」「AI 泔水」，意思是敷衍、generic、沒靈魂的 AI 產出。

---

## 二、為什麼要「反」slop

邏輯鏈（huashu-design SKILL.md 原文）：

1. 用戶請你做設計，目的是**他的品牌被認出來**
2. AI 默認產出 = 訓練語料的平均 = 所有品牌混合 = **沒有任何品牌被認出來**
3. 所以默認產出 = 幫用戶把品牌稀釋成「又一個 AI 做的頁面」
4. **反 slop 不是審美潔癖，是替用戶保護品牌識別度**

---

## 三、常見 slop 清單

| slop 元素 | 為什麼是 slop | 合法破例條件 |
|---|---|---|
| 激進紫漸層 | 每個 SaaS/AI/web3 落地頁萬能公式 | 品牌本身用（Linear 某些場景） |
| Emoji 當 icon | 「不夠專業就用 emoji 湊」的病 | 品牌本身用（Notion）、或兒童/輕鬆場景 |
| 圓角卡片+左彩色 border | 2020–2024 Material/Tailwind 烂大街組合 | 品牌 spec 明訂保留 |
| SVG 手畫人臉/場景 | AI 畫的 SVG 人物永遠五官錯位 | 幾乎沒有——有圖就用真圖 |
| CSS 剪影代替真實產品圖 | 生成的就是「通用科技動畫」，任何產品都長一樣 | 幾乎沒有——先走核心資產協議找真圖 |
| Inter/Roboto/Arial 當 display 字 | 看不出是「設計過」還是「demo 頁」 | 品牌 spec 明訂（Stripe 用微調版 Sohne/Inter） |
| 賽博霓虹+深藍底 `#0D1117` | GitHub dark mode 美學複製 | 開發者工具且品牌本身走這方向 |

**破例原則**：「品牌本身用」是唯一能合法破例的理由。品牌 spec 裡明寫了用紫漸層，那就用——此時它不再是 slop，是**品牌簽名**。

---

## 四、正向做什麼（反 slop 的正面清單）

- ✅ `text-wrap: pretty` + CSS Grid + 高級 CSS——排版細節是 AI 分不清的「品味稅」
- ✅ 用 `oklch()` 或 spec 裡已有的色，**不憑空發明新顏色**
- ✅ 配圖優先 AI 生成（Gemini / Flash / Lovart），HTML 截圖只在精確數據表格時用
- ✅ 中文文案用「」引號不用 ""——中文排印規範，也是「有審校過」的細節信號
- ✅ **一個細節做到 120%，其他做到 80%**——品味 = 在合適的地方足夠精緻，不是均勻用力

---

## 五、Claude Design vs huashu-design：兩種解法

「反 slop」是兩邊共享的核心命題，但解法相反。

### 5.1 流程對照

| | Claude Design | huashu-design |
|---|---|---|
| 形態 | 網頁產品（GUI） | skill（Claude Code 對話） |
| 配額 | 訂閱 quota | API 消耗，可並行跑 agent |
| 交付物 | 畫布內 + 可導 Figma | HTML / MP4 / GIF / PPTX / PDF |
| 複雜動畫 | 有限 | Stage + Sprite 時間軸 60fps |
| 跨 agent | 僅 Claude.ai | 任意 skill-compatible agent |

### 5.2 遇到「沒有品牌資料」時

| 情境 | Claude Design | huashu-design |
|---|---|---|
| 完全空白 | 引導使用者**建一套 design system**（選色、字、component 規則） | 進入「設計方向顧問模式」——從 20 種設計哲學推 3 個差異化方向讓用戶選 |
| 有具體品牌（Stripe/DJI⋯） | 還是走 system 流程 | **跳過 system**，走 5 步硬流程：問 → 搜官方 → 下載 logo/產品圖/UI → 驗證 → 寫 `brand-spec.md` |
| 產出的載體 | design system 畫布 | `brand-spec.md` + `assets/<brand>-brand/` 素材目錄 |

### 5.3 核心哲學的分歧：資產 > 規範

huashu-design 作者花叔的原話（2026-04-20 v1.1 重構）：

> 「除了所謂的品牌色，顯然我們應該找到並且用上大疆的 logo，用上 pocket4 的產品圖。⋯⋯這可能是比所謂的品牌設計的 spec 更重要的基本邏輯。否則，我們在表達什麼呢？」

識別度排序表（huashu-design SKILL.md §1.a）：

| 資產類型 | 識別度貢獻 | 必需性 |
|---|---|---|
| Logo | 最高 | 任何品牌必備 |
| 產品圖 / 渲染圖 | 極高 | 實體產品必備 |
| UI 截圖 | 極高 | 數字產品必備 |
| 色值 | 中（脫離前三項常撞衫） | 輔助 |
| 字體 | 低 | 輔助 |

**翻譯成執行規則**：
- 只抽色值+字體、不找 logo/產品圖/UI → **違反協議**
- 用 CSS 剪影/SVG 手畫替代真實產品圖 → **違反協議**
- 找不到資產不告訴用戶、硬做 → **違反協議**

### 5.4 為什麼 huashu-design 不照抄 Claude Design

Claude Design 的「建 system」流程本質是**在工具裡建 system**（畫布、token、component），這對 GUI 產品合理；但對 CLI agent 來說，**花時間建 system 不如花時間找真實素材**——因為 agent 的瓶頸不是 token 管理，是視覺識別度（logo/產品圖）。

---

## 六、對 AI-design sharing 的意義

這跟 sharing 的 convention 注入三法是**同一條光譜的兩端**：

- **Claude Design 那端**：workspace instruction + DS import（build system first）
- **huashu-design 這端**：brand-spec.md + assets/（fetch assets first）

兩個都是「反 AI slop」，只是 huashu-design 賭的是**資產比規範更能建立識別度**。

這也是為什麼 sharing 的 thesis **"output is a spec, not shipping code"** 某種程度上也在反 slop——spec 是為這個產品寫的，shipping code 容易滑向 AI 平均值。

### 可用於 Q&A 的 soundbite

> 「只要 agent 在『為某個具體品牌』工作，而不是『為 AI 平均值』工作，slop 就不會發生。Claude Design 透過建 system 來達成，huashu-design 透過抓真實資產來達成——兩條路殊途同歸。」

---

## 參考

- huashu-design SKILL.md §1.a「核心資產協議」
- huashu-design SKILL.md §6「反 AI slop」
- huashu-design README.md「和 Claude Design 的关系」段
- 本 repo：`sharing/claude-design/audience-qa.md`（convention 注入三法）
