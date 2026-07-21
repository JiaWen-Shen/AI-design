# Mac mini 評估（M2 二手 vs M4 新機）

> 評估日期：2026-04-29
> 評估方式：估算數字 + Karen 自評 use case
> 動機背景：見 [README.md](./README.md)；Pi 已擱置見 [pi-evaluation.md](./pi-evaluation.md)

## 候選 spec

| 候選 | RAM/SSD | 估價（2026-04） | 取得方式 |
|---|---|---|---|
| **A. M2 Mac mini 二手** | 8GB / 256GB | $12,000–16,000 NTD（$380–500 USD） | 露天 / 蝦皮 / FB Marketplace |
| **A+. M2 Pro 二手** | 16GB / 512GB | $20,000–26,000 NTD（$630–820 USD） | 同上，貨少 |
| **B. M4 Mac mini 新機（base）** | 16GB / 256GB | $19,900 NTD（Apple 官網） | Apple Store |
| **B+. M4 Mac mini 新機（升級）** | 16GB / 512GB | $23,900 NTD | Apple Store |
| **C. M4 Pro Mac mini** | 24GB / 512GB | $42,900 NTD | Apple Store；本研究跳過（過度配置） |

> 實際採購前要 verify 當下價格 — 上面是 2026-04 推估，二手價格波動大。

---

## 評估維度填寫（用 A=M2 二手 8GB / B=M4 新機 base 16GB 為主）

### 1. 硬體成本（一次性）

| | M2 二手 8GB | M4 新機 16GB |
|---|---|---|
| 價格 | $12k–16k NTD | $19,900 NTD |
| 折舊預期 | 3 年（已折舊一次，剩餘壽命 OK） | 5–7 年（Apple Silicon 還在前段） |
| 二手變現 | 3 年後剩 50–60% | 3 年後剩 60–70% |
| **3 年實際成本** | ~$6k–8k NTD | ~$8k–10k NTD |

直覺：M4 新機 amortize 後其實沒貴多少，且多 8GB RAM + Neural Engine 升級。

### 2. 電費（24/7 全年）

- M2 mini idle：~7W；負載 ~25W
- M4 mini idle：~5W；負載 ~30W（更高峰但 idle 更省）
- 假設平均 10W × 24h × 365d = ~88 kWh/年
- 台灣電價約 $3 NTD/kWh ≈ **$264 NTD/年 ≈ $9 USD/年**
- 比 Pi 多約 $2/年，差距可忽略

### 3. 維護成本

- macOS 自動更新（小版本）→ 月維護 < 30 分鐘
- 不會像 Pi 一樣 SD 卡損壞 / 過熱掉線（SSD 內建 + 散熱設計成熟）
- **3 年累積維護**：~10–20 小時（遠少於 Pi 的 50–100 小時）
- 學習曲線：零（macOS 環境完全熟悉）
- 風險：macOS 偶爾大版本更新踩雷（但 mini 可以延後升級）

### 4. 能跑什麼

- ✅ 所有 macOS-only 工具（Xcode build / iOS simulator / Sketch headless / Claude Code GUI）
- ✅ 所有 Linux 服務（Docker / OrbStack / Colima）
- ✅ ARM64 + x86 binary（Rosetta 2）
- ✅ **本機 LLM**：Ollama / LM Studio 跑 Llama 3.1 8B / Qwen 2.5 14B（16GB 夠）；M4 推論速度約 25–40 tok/s（8B Q4），實用級別
- ✅ Plex / Jellyfin 4K 硬解（HEVC / H.264 硬體加速）
- ✅ Time Machine target、檔案分享、SMB
- ✅ 任何 macOS 自動化（Shortcuts / launchd / cron / Hammerspoon）

### 5. 不能跑什麼

- ❌ NVIDIA CUDA（要跑 Stable Diffusion XL / 大型模型訓練還是不如 NVIDIA GPU）
- ⚠️ GPIO / 實體感測器（沒有 Pi 的 40-pin header，要用 USB 周邊）
- ⚠️ 高並發 web service（單機 4–10 核，跟雲端橫向擴展不能比）

### 6. vs Cloudflare Workers / Fly.io

**Mac mini 獨有的價值：**
- 本機 LLM 推論（Workers / Fly 的 GPU 方案都很貴）
- macOS-only 工作流（Xcode / iOS build / Sketch / 任何 mac app headless）
- second Mac：跑 long-running 任務不佔主機（agent / build / 影片轉檔）
- 大檔案備份樞紐（Time Machine、iCloud 不夠用時的本地 fallback）
- 完全本地隱私敏感運算（個人筆記 RAG / 個人助理）

**Cloudflare/Fly 贏的地方：**
- 全球 edge / 低延遲跨地域 → 對外服務首選
- 免維護 + SLA
- 突發流量自動擴展
- 不會壞、不會被偷、不會跳電

### 7. Use case match（誠實 check）

| Use case | Mac mini 適合？ | 我會用嗎？ | 備註 |
|---|---|---|---|
| **本機 LLM 推論** | ✅✅ 主場 | ⚠️ **要誠實答**：我目前所有 LLM 用例都用 Claude API / Claude Code，本機 8B 模型品質遠不及 Sonnet 4.6。**真的會用的場景**：(a) 隱私敏感資料（個人筆記 RAG）— 但目前沒這需求；(b) Claude API 額度焦慮 — 我目前沒這焦慮 → **動機弱** |
| **second Mac 跑 long-running** | ✅ 適合 | ⚠️ **誠實 check**：我有時會跑長 Claude Code agent，但用 Fly.io / cloud agent 也能解。要常常跑「不能斷線、要佔住 Mac」的任務才划算 → **動機弱到中** |
| **macOS-only 自動化** | ✅✅ Pi 做不到 | ⚠️ 我目前的自動化都已經跑在 Cloudflare Worker / 本機 Mac，沒有「需要 Mac 環境但不能佔主機」的長駐任務 → **動機弱** |
| **Plex / Jellyfin 4K** | ✅ 完勝 Pi | ❌ 我沒有大量本地影音收藏（都用串流）→ **動機極弱** |
| **Time Machine target** | ✅ 適合 | ⚠️ 我目前 iCloud + 主機 Time Machine 已 cover → **不急迫** |
| **個人筆記/RAG 自託管** | ✅ 適合 | ⚠️ 我用 Obsidian + Jottacloud 同步已 cover → **動機弱** |
| **Obsidian Publish 自託管** | ✅ 但 Pi 也行 | ⚠️ 我沒有持續對外分享筆記需求 → **動機弱**（Pi 評估同結論） |
| **家庭備份樞紐** | ✅ 適合 | ⚠️ 不急迫（Pi 評估同結論） |
| **iOS/macOS dev CI runner** | ✅ Pi 做不到 | ❌ 我沒有 iOS/macOS 開發專案 → **動機極弱** |

---

## vs Pi 5 橫向對比

| 維度 | Pi 5 | M2 二手 | M4 新機 |
|---|---|---|---|
| 一次性成本 | ~$3,000 NTD | ~$14,000 NTD | ~$20,000 NTD |
| 3 年攤提 | ~$3,000 | ~$7,000 | ~$9,000 |
| 電費/年 | $7 USD | $9 USD | $9 USD |
| 維護時間/3 年 | 50–100h | 10–20h | 10–20h |
| macOS 工作流 | ❌ | ✅ | ✅ |
| 本機 LLM 8B | ❌ 太慢 | ⚠️ 勉強（8GB RAM 不夠） | ✅ 25–40 tok/s |
| Plex 4K | ❌ 只能 1080p | ✅ | ✅ |
| GPIO / 實體 IO | ✅ | ❌ | ❌ |
| Pi-hole | ✅ 經典 | ✅ overkill | ✅ overkill |
| Tailscale | ✅ | ✅ | ✅ |
| 隱私敏感本地運算 | ✅ 但慢 | ✅ | ✅✅ |

**結論方向**：Mac mini 比 Pi 多解的問題集中在「本機 LLM + macOS 工作流」兩塊，**而這兩塊我現在都沒有強需求**。

---

## Karen 的判斷

### 誠實盤點：Mac mini 我「真的會用」的 use case

把上面 9 項過一遍，沒有任何一項打 ✅ 強需求。最接近的是：

1. **second Mac 跑 long-running**（動機中）— 但目前 Claude Code agent 多半 < 30 分鐘，不會卡到主機
2. **本機 LLM**（動機弱）— 我用 Claude API 沒額度焦慮，本機 8B 品質落差太大
3. **隱私敏感本地運算**（動機弱）— 沒有真的不能上雲的資料

### 跟 Pi 評估的同樣陷阱

Pi 評估時 Haiku agent 最強論點（LINE-Obsidian）已經被 Worker 解掉。

Mac mini 評估時，我發現自己很容易腦補「買了就會跑 LLM / 買了就會做 home lab」，但**這跟「想學 Pi」一樣是「找題目給工具」**。

### 決策建議

**Mac mini：擱置（同 Pi 結論）。**

理由：
- ❌ 找不到任何「Cloudflare/Fly 做不到 + 我真的會用」的 use case
- ❌ 我沒有 macOS-only 工作流長駐需求（沒有 iOS dev、沒有 video edit pipeline）
- ❌ 本機 LLM 對我而言是 nice-to-have 不是 must-have（API 已經夠用）
- ❌ $20,000 NTD 買來「以防萬一可能用得到」CP 值極低

**反過來說，會讓我重新考慮 Mac mini 的觸發條件**：
1. 開始有 iOS / macOS 開發專案，需要 dedicated build machine
2. Claude API 月費爆炸（$50+/月持續），且 8B 本機模型品質夠用某些子任務
3. 有一個明確的長駐 agent 任務（每天跑 8h+）佔住主機很煩
4. 開始做需要本地 GPU 推論的 side project（影像 / RAG）

> 任一觸發條件出現，再回來重看這份評估。

---

## 結論

**Mac mini：擱置。** 跟 Pi 同結論——沒有夠強的 use case，硬體先不要碰。

### 整體 home-server 研究階段性結論（2026-04-29）

跑完 Pi + Mac mini 兩份評估，answer 已經很清楚：

> **目前不需要家庭常駐伺服器。Cloudflare Workers + Fly.io 已 cover 所有實際 use case，買硬體會是「找題目給工具」。**

**不需要再評估 NUC / 二手 mini PC / NAS 的理由**：
- 共同前提（夠強 use case）已被否決
- NUC / mini PC 解的問題是 Pi/Mac mini 的子集
- NAS 解的是備份樞紐單一場景，目前不急迫

**研究資料夾擱置條件**：上面 4 個觸發條件之一出現時再重啟。

---

## 附錄：M2 二手 vs M4 新機 二選一（如果未來真的要買）

如果觸發條件真的出現，買哪台？

**選 M4 新機（B = $19,900 NTD base）的理由：**
- 16GB RAM 是本機 LLM 的最低門檻（M2 二手 8GB 不夠跑 8B 流暢）
- 5–7 年壽命 vs M2 已經 3 年起跳
- Apple 保固 + AppleCare option
- M4 Neural Engine 對 LLM 推論顯著加速

**選 M2 二手 的理由：**
- 預算極限（$6k 以下）
- 只當 file server / Time Machine target，不跑 LLM
- 接受 3 年壽命

**Karen 的傾向**：如果真的買 → 選 M4 新機 base 16GB。M2 二手 8GB 等於買來只能做 Pi 能做的事，CP 值低。
