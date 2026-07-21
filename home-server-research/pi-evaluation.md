# Raspberry Pi 5 評估

> 評估日期：2026-04-27
> 評估方式：Haiku sub-agent 顧問報告 + Karen 補充看法
> 動機背景：見 [README.md](./README.md)

## 候選 spec

- **Raspberry Pi 5（4GB / 8GB）**
- 入門配套：PSU 27W、官方殼、microSD（推薦 SanDisk High Endurance）或外接 SSD（USB 3.0）
- 預算：$50–80 USD（裸機）、$80–120（含外設）

## 評估維度填寫

### 1. 硬體成本（一次性）

- Pi 5 裸板：$55–75（依 RAM）
- 配件（PSU + 殼 + 散熱 + SD/SSD）：$30–50
- **總計**：$80–120 USD（一次性）
- 折舊：3–5 年（SD 卡可能 3 年要換一次，SSD 撐更久）

### 2. 電費（24/7 全年）

- 平均功耗：5–10W（idle 偏低，跑 service 時 8–12W）
- 假設 8W × 24h × 365d = ~70 kWh/年
- 台灣電價約 $3 NTD/kWh ≈ $210 NTD/年 ≈ **$7 USD/年**
- agent 報告寫 $30/年是估較高，台灣實際更便宜

### 3. 維護成本

- 月維護時間：1–4 小時（agent 估算）
  - 系統更新（apt upgrade）
  - 偶發故障（SD 卡損壞、過熱、Wi-Fi 掉線）
  - 備份策略執行 / 驗證
- **3 年累積維護**：~50–100 小時
- 學習曲線：對熟 zsh + Linux 的人不陡，但故障當下很煩

### 4. 能跑什麼

- ✅ 任何 Linux 原生服務（Docker、Node.js、Python、databases）
- ✅ Pi-hole、Home Assistant、Plex、Jellyfin、Quartz
- ✅ Tailscale（subnet router / exit node）
- ✅ ARM64 容器
- ⚠️ 本機 LLM：能跑 7B（量化），但很慢；非主力場景

### 5. 不能跑什麼

- ❌ macOS（沒辦法跑 macOS-only 工具）
- ❌ x86 binary（部分舊容器只有 amd64）
- ⚠️ 重 I/O 的服務（USB 3.0 共用匯流排，多裝置時頻寬會分掉）
- ⚠️ 高並發 web service（單機 4 核，跟雲不能比）

### 6. vs Cloudflare Workers / Fly.io

**Pi 獨有的價值：**
- 本地網路才能做的事（Pi-hole DNS、家庭內網檔案共享、實體 GPIO）
- 隱私敏感資料（不想經過任何雲端的個人筆記 / 備份）
- 無流量計費焦慮（Cloudflare Workers free tier 雖大但有上限；Pi 自家頻寬隨便用）

**Cloudflare/Fly 贏的地方：**
- 全球 edge / 低延遲跨地域
- 免維護 + SLA
- 突發流量自動擴展
- 不會壞（硬體故障風險為 0）

### 7. 我的 use case match

針對 README 列的 8 項 use case：

| Use case | Pi 適合？ | 備註 |
|---|---|---|
| Obsidian Publish 自託管 | ✅ 適合 | Quartz / Obsidian Local REST API；前提是有對外分享需求 |
| Pi-hole | ✅✅ 最佳 | Pi 經典 use case，雲端做不到 |
| 家庭備份樞紐 | ✅ 適合 | 需加外接硬碟 |
| Plex / Jellyfin | ⚠️ 勉強 | Pi 5 能跑 1080p 軟解，4K 轉碼吃緊 → Mac mini 完勝 |
| Tailscale exit node | ✅ 適合 | 低需求，Pi 完全夠用 |
| 本機 LLM | ❌ 不適合 | Pi 5 跑 7B 模型很慢；Mac mini M4 才是這項主場 |
| Home Assistant | ✅ 適合 | 我目前沒智慧家電，先擱置 |
| Self-hosted CI runner | ✅ 適合 | 個人用量小，Pi 夠 |

## Haiku Agent 的 3 個具體建議

### Use Case A：LINE-Obsidian 同步（agent 認為最強場景）
- 評語：「本地化 + 隱私 + 24/7 省電（相比 Mac）」
- ⚠️ **但這個動機在 2026-04-27 已經失效** — merge 邏輯搬上 Cloudflare Worker 後不需要本地伺服器了

### Use Case B：Obsidian Publish 替代
- 月費 vs 自託管：Obsidian Publish $8/月 vs Pi 自託管 ~$0
- 條件：要常態性分享筆記給小團隊
- agent 評：條件性建議

### Use Case C：家庭備份樞紐
- $50 Pi + $30–50 外接硬碟 + 1h 設定
- agent 評：可選項、nice-to-have，不急迫

## Agent 的總體建議

> **「先實驗，再決定」**：用廢舊筆電 / 二手 Pi（$30）跑一週，確認 24/7 穩定性 + 維護負擔可接受後再決定要不要買 Pi 5。

不買的信號：
- 動機是「想學 Pi」→ VM 更省錢
- 動機是「省錢」→ Workers free tier 已贏

## Karen 的補充看法

1. **Agent 最大論點已經失效**：agent 把「LINE-Obsidian」列為 Pi 最佳用武之地，但這題我今天已經透過 Worker 解掉了。所以這份評估的結論要重新算：剩下的有效 use case 只有 Pi-hole / 備份樞紐 / Quartz / Tailscale。

2. **真的會用的 use case 盤點（誠實 check）**：
   - Pi-hole：⚠️ 我家網路環境變動大（WFH + 出國 + 公司網路），沒固定 Wi-Fi 環境讓 Pi-hole 持續服務全裝置 → **動機弱**
   - Obsidian Publish：⚠️ 我沒有持續對外分享筆記的需求（社群發文都直接 Threads）→ **動機弱**
   - 家庭備份：✅ 有需求，但 iCloud + Time Machine 已經 cover → **不急迫**
   - Tailscale exit node：⚠️ 我目前沒這需求 → **動機弱**

3. **目前傾向**：Pi 對我而言「找不到夠強的 use case」。如果要買，Mac mini 反而更值得評估（macOS 環境一致 + 本機 LLM 強 + 能當 second-Mac 跑 long-running 任務）。

4. **下一步**：
   - 先寫 [mac-mini-evaluation.md](./mac-mini-evaluation.md)（M2 二手 vs M4 新機）
   - 對比後再決定要不要進「先借舊筆電試一週」階段
   - **不要為了想買硬體而強行湊 use case**

## 結論

**Pi 5：擱置。** 在沒有強 use case 的情況下不買；先評估 Mac mini，再決定家用伺服器策略。

---

## 附錄：原始 agent 報告全文

<details>
<summary>展開看 Haiku agent 完整報告</summary>

### 1. Pi 的適用情境

**Pi 比 Cloudflare Workers / Fly.io 更優的場景：**

- **本地網路服務**：家庭 NAS、Plex 媒體伺服器、本地 DNS（Pi-hole）、網路備份
- **實體硬體控制**：GPIO 觸發家庭自動化、攝影機監控、溫度感測器
- **隱私敏感的個人雲**：Obsidian Sync 本地伺服器、筆記檔案完全自託管、無需信任第三方
- **低延遲本地計算**：掃瞄後立即 OCR、影像處理前置流程
- **網路分割與防禦**：Pi-hole 廣告攔截、VPN 入口點

最相關的：Obsidian vault 在家庭 Wi-Fi 內自動同步、LINE 筆記同步完全本地化。

### 2. Pi 不適合的情境

**Cloudflare Workers / Fly.io 反而更好：**

- **全球 edge 需求**：holylot.app、設計 demo 站跨地域訪問
- **完全無維護**：Workers free tier 近乎零運維、Fly.io 自動補新版本；Pi 需要定期維護
- **可擴展突發流量**：Workers 自動擴展；Pi 單機上限有限
- **長期穩定性需求**：Workers SLA 99.95%；Pi 掉線只有你來修
- **電費 + 硬體壽命**：Pi 4 約 $55 USD，20W × 365 ≈ $30/年電費；SD 卡 3-5 年需更換

### 3. 入門成本與維護成本對比

| 項目 | Raspberry Pi 5 | Cloudflare Workers | Fly.io Tokyo |
|------|---|---|---|
| 初始硬體 | $50-80 | 無 | 無 |
| 月費（無流量） | $2-3 電費 | Free | ~$3-5 base |
| 月費（有流量） | 同上 | Free | $3-10 |
| 維護時間/月 | 1-4 小時 | 0 | 0 |
| 3 年總成本 | $50 + $84 電費 + 5-10h 維護 | 無 | $108-180 |

### 4. 3 個具體 Use Case

#### Use Case A：LINE-Obsidian 同步優化（最強業務場景）
- 現況：merge-notes.sh 跑在 Mac cron，需要 Mac 常開
- Pi 方案：Pi 跑 cron job，透過 Tailscale VPN 或本地 SSH 觸發 Obsidian 同步
- 優勢：完全本地、不走網際網路、隱私最高、Pi 24/7 省電（相比 Mac）
- 成本：$50 硬體 + 3h 設定時間
- 建議：**值得**

#### Use Case B：Obsidian Publish 替代方案（中等場景）
- Pi 方案：Pi 跑 Quartz，家庭 Wi-Fi 內分享
- 優勢：$0 月費（vs $8/月）、完全自訂 CSS
- 成本：$50 硬體 + 1h 設定
- 建議：**條件性建議**

#### Use Case C：家庭備份樞紐（附加價值）
- Pi 方案：Pi 跑 rsync daemon
- 優勢：本地快速備份、不依賴雲端
- 成本：$50 硬體 + 外置硬碟 $30-50
- 建議：**可選項**

### 5. 建議

**總體判斷：值得入門，但限定範圍**

買 Pi 的理由：
1. Use Case A 確實是 Pi 的最佳用武之地
2. 已經懂 zsh script + git，學習曲線不陡
3. 單次 $50-80 投資，享受 3-5 年本地隱私基礎設施
4. Fly.io 經驗遷移：Linux server 管理心法類似

不買的理由：
1. Cloudflare Workers 已經解決了 merge 邏輯搬遷
2. 維護時間成本：產品經理而非基礎設施工程師
3. 現有 always-on 方案已足夠覆蓋 99% 需求

**「先實驗，再決定」**：用廢舊筆電 / 二手 Pi 跑一週確認後再買。

</details>
