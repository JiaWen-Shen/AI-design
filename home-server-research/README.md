# Home Server Research

家庭常駐伺服器選項研究筆記。動機與背景見下方。

## 為什麼開始這個研究

2026-04-27，本機 cron 跑 LINE → Obsidian 筆記同步需要 Mac 醒著的問題，已經透過把合併邏輯搬上 Cloudflare Worker scheduled handler 解決（見 `~/Jottacloud/vibe/line-obsidian-bot/`）。原本痛點消失，但延伸出一個更廣的探索題：

> **是否值得買一台家庭常駐伺服器（Pi / Mac mini / 其他）作為個人基礎設施？**

這個問題的答案不是非黑即白，取決於我有多少「真的適合本地化」的 use case，以及對隱私 / 自主 / 維護成本的取捨。這個資料夾就是放這個探索的研究筆記與決策過程。

## 已有的 always-on 替代方案

我目前已經會用且穩定的雲端 always-on：

- **Cloudflare Workers**（free tier 充裕，已用於 LINE bot、teams-to-confluence webhook 等）
- **Fly.io Tokyo**（每月 $2–5，已部署 holylot.app + teams-to-confluence）

這些雲方案能解掉 90% 的「跑 24/7 的小服務」需求，是評估 Pi / Mac mini 的對照基準。

## 候選硬體（本研究範圍）

| 候選 | 狀態 | 評估文件 |
|---|---|---|
| Raspberry Pi 5 | ✅ 已初評（擱置） | [pi-evaluation.md](./pi-evaluation.md) |
| Mac mini（M2 二手 / M4 新機） | ✅ 已初評（擱置） | [mac-mini-evaluation.md](./mac-mini-evaluation.md) |
| Intel NUC / 二手 mini PC | ⏭️ 跳過 | 共同前提被否決，見下方階段性結論 |
| 舊筆電改 server | ⏭️ 跳過（過渡方案） | 同上 |
| Synology / QNAP NAS | ⏭️ 跳過 | 同上 |

## 階段性結論（2026-04-29）

跑完 Pi + Mac mini 兩份評估後，整體答案已清楚：

> **目前不需要家庭常駐伺服器。** Cloudflare Workers + Fly.io 已 cover 所有實際 use case，買硬體會是「找題目給工具」。

**重啟研究的觸發條件**（任一出現再回來重看）：
1. 開始有 iOS / macOS 開發專案，需要 dedicated build machine
2. Claude API 月費爆炸（$50+/月持續）且 8B 本機模型品質夠用某些子任務
3. 有明確的長駐 agent 任務（每天跑 8h+）佔住主機
4. 開始做需要本地 GPU 推論的 side project（影像 / RAG）

## 評估維度（每個候選都用同一套衡量）

研究時針對每個候選依以下維度填寫，方便橫向比較：

1. **硬體成本**（一次性 + 折舊）
2. **電費**（24/7 全年）
3. **維護成本**（系統更新、故障處理、備份策略）
4. **能跑什麼**（macOS-only app / Docker / Linux 原生服務）
5. **不能跑什麼**（限制：架構、效能、I/O）
6. **跟 Cloudflare Workers / Fly.io 比的差異化價值**（哪些事只有這個方案能做）
7. **適合我的 use case match**（從下方清單選）

## 我可能會用本地伺服器跑的 use case 候選

依優先順序排，研究時把每個候選硬體對應上去：

1. **Obsidian Publish 自託管**（Quartz / Obsidian Local REST API）— 月省 $8，前提：要有持續對外分享需求
2. **Pi-hole 廣告攔截**（家庭 Wi-Fi 全裝置 DNS-level 過濾）— 純本地網路才用得到
3. **家庭備份樞紐**（rsync / Time Machine target / iPhone photo dump）— 需外接硬碟
4. **Plex / Jellyfin 媒體伺服器**— 看影音消費習慣
5. **Tailscale exit node** / 個人 VPN — 出國 / 公司外網 access 家裡資源
6. **本機 LLM 推論**（Ollama 跑 8B–14B 模型）— 隱私 + 探索；Mac mini M4 在這項遠勝 Pi
7. **Home Assistant 家庭自動化**— 沒有智慧家電就用不到
8. **GitHub Actions self-hosted runner**— work / 個人 CI 用量大才划算

> 寫進評估時要誠實 check：這些 use case **我真的會用嗎**，還是只是「找題目給工具」？

## 決策原則（避免買了堆灰塵）

- ❌ 不要為了「想學 Pi / mini server」買硬體 — 這動機用 VM / 雲端 free tier 就夠
- ❌ 不要為了「省 Cloudflare / Fly 月費」買硬體 — 那點錢遠不及維護時間
- ✅ 只在有 ≥ 2 個 use case 真正用得到，且其中至少 1 個 Cloudflare/Fly 做不到的情況下，才值得買

## 下次繼續研究時的 starter prompt

```
讀 ~/Jottacloud/vibe/home-server-research/README.md 和已有評估文件，
我想研究 [候選硬體名稱]，幫我：
1. 用同一套評估維度寫一份 [hardware]-evaluation.md
2. 跟 pi-evaluation.md 做橫向對比
3. 根據我列的 use case 候選，分別 match 哪個硬體最適合
```
