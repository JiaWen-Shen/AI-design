# Start of Day（開機流程）

用戶說「開始工作」/「開工」/「早安」/「briefing」時觸發此流程。

## 核心理念

**幫用戶把注意力放在正確的位置，而非展示最多資訊**。重點是「跨裝置 context 恢復」+「今日重點聚焦」。

## 敘事節奏（Narration protocol）

### 為什麼需要

從 trigger 到儀表板產出，中間有 5–15 秒的 tool call 時間。靜默或只顯示 tool 名稱會讓用戶產生「系統卡住了嗎」的焦慮。**敘事的目的是把等待時間轉化為信任建立時間**。

### 開場序列（兩句結構，不可合併）

**第 1 句（校準前，中性開場）**：
告知將進行校準與載入，**不使用時段問候**。

範例：「讓我先校準時間、看一下昨天的進度...」

**第 2 句（校準後，正式問候 + 狀態報告）**：
基於 Time Budget 的 `LOCAL now` 輸出時段問候。即使用戶輸入「早安」，若校準後是午安時段，**以校準結果為準**，不複讀 trigger 詞。

範例：「午安。現在是週四 14:32——讓我把昨天的進度整理給你...」

### A 級敘事（每個 tool call 一句）

- 讀取昨日摘要前：「正在翻昨天的工作摘要...」
- 跑 sync health check 前：「順便確認一下各專案的同步狀態...」
- 檢查 git status 前：「核對一下昨天有動過的專案有沒有未提交變更...」

若發現具體線索（某個專案卡關、某個未推送 commit），下一句敘事可自然提及。

### 動詞對照（zh-TW）

| 情境 | 建議 | 避免 |
|---|---|---|
| 搜尋 | 翻看、看一下、核對 | 搜尋、查詢、檢索 |
| 比對 | 對照、串起來看 | 分析、匹配 |
| 發現 | 注意到、看到 | 檢測到、識別出 |
| 組裝 | 整理、組裝、歸整 | 生成、輸出、渲染 |

### 不做什麼

- ❌ 不用 marker 符號（`›`、`▸`、`[Thinking]`）裝飾敘事句
- ❌ 不顯示 tool 名稱、參數
- ❌ 不在校準前用時段問候
- ❌ 不複讀 trigger 詞（用戶輸入「早安」但實際是下午，要說「午安」）
- ❌ 不事後總結（「我已經讀完所有摘要了」）

## Time Budget（時間校準）

### 執行時機

第 1 句敘事輸出後、第 2 句問候輸出前。

### 作法

呼叫 `bash` 執行：

```bash
UTC_RAW=$(curl -s --max-time 5 -I https://www.google.com | grep -i "^date:" | head -1 | sed 's/^[Dd]ate: //I' | tr -d '\r')
[ -z "$UTC_RAW" ] && UTC_RAW=$(curl -s --max-time 5 -I https://www.cloudflare.com | grep -i "^date:" | head -1 | sed 's/^[Dd]ate: //I' | tr -d '\r')
[ -z "$UTC_RAW" ] && UTC_RAW=$(curl -s --max-time 5 -I https://www.apple.com | grep -i "^date:" | head -1 | sed 's/^[Dd]ate: //I' | tr -d '\r')

# HTTP date 永遠是 GMT/UTC。先轉 epoch 再格式化——跨平台（GNU date -d vs BSD/macOS date -jf）。
# ⚠ 不可在 macOS 直接 `date -jf '...GMT' ...`：BSD date 會把 GMT 字串當本地時間，不做 +8 換算。
if date --version >/dev/null 2>&1; then
  EPOCH=$(date -u -d "$UTC_RAW" +%s)                                  # GNU date (Linux)
else
  EPOCH=$(TZ=UTC date -jf '%a, %d %b %Y %H:%M:%S GMT' "$UTC_RAW" +%s) # BSD date (macOS)
fi

export TZ="Asia/Taipei"
fmt() { date -r "$EPOCH" "$1" 2>/dev/null || date -d "@$EPOCH" "$1"; }
echo "=== Time Budget ==="
echo "UTC now: $(TZ=UTC fmt '+%Y-%m-%dT%H:%M:%SZ')"
echo "LOCAL now: $(fmt '+%Y-%m-%d %H:%M %a')"
echo "LOCAL hour: $(fmt '+%H')"
echo "LOCAL today: $(fmt '+%Y-%m-%d')"
echo "TZ offset: $(fmt '+%z')"
echo "==================="
```

### 規則

1. **Time Budget 是 single source of truth**——後續所有時間顯示都引用此值，禁止 UTC→local 心算
2. **Time Budget 完全隱藏**——不在敘事或儀表板中以列表形式輸出
3. **Greeting band**（依 `LOCAL hour`）：
   - `05–10` → 早安
   - `11–16` → 午安
   - `17–04` → 晚安

### Fallback

若 curl 三個 endpoint 全部失敗，退回「時間未校準」模式：儀表板頂部加註「⚠ 時間校準失敗，以下時間標註可能不準確」。

## 執行步驟

1. **第 1 句敘事**（中性開場）
2. **Time Budget 校時**（bash curl）
3. **第 2 句敘事**（時段問候 + 時間狀態）
4. **A 級敘事 + tool calls**（平行執行）：
   - **檢查 cross-device-sync ledger**（兩個段落都要讀）：
     1. 「🔴 Pending — 任一裝置開工時請處理」段落 — 有項目 → 浮到儀表板 PRIORITY
     2. 「🆕 新專案啟動」段落 — 找狀態為 ⏳ 且**非本裝置**開啟的 entry，`ls` 確認本機**沒有**對應路徑 → 浮到 PRIORITY 頂部，附 clone 指令；用戶決定是否當下 clone（clone 完手動把該 entry 狀態改 ✅）
     兩段皆無 → 跳過不敘事
   - 讀取最新 `daily-summaries/YYYY-MM-DD.md`
   - 跑 sync health check（掃 `<WORK_DIR>` 內所有 git repo）
   - **跑 morning-briefing**（如果有設定 MS Graph token）：

     ```bash
     # 假設你有放好 morning-briefing skill（preflight + orchestrator）
     bash ~/.claude/skills/morning-briefing/scripts/preflight.sh > /tmp/preflight.json
     set -a; source ~/.env.msgraph; set +a
     npx tsx ~/.claude/skills/morning-briefing/scripts/briefing-orchestrator.ts > /tmp/briefing.json
     ```

     - preflight 已內建 401 → silent refresh，**LLM 不需要判斷 token 狀態**
     - 沒有 morning-briefing skill 也可以——這段跳過，儀表板少掉 Calendar/Email/Teams 區塊但其他照常
   - 對昨天有動過的專案跑 `git status`，**若 working tree 有 dirty file**：先 `git fetch` + 看 remote 有無對應 commit，**不要直覺 commit**
5. **收尾敘事**：「正在為你整理今日待辦...」
6. **儀表板輸出**

## 儀表板結構（zh-TW）

### Header（兩段式，不可合併或拆分）

**第 1 行**：大字問候 + 右側小字 meta

```
午安，<NAME>     週四 2026/04/30 · 14:32 UTC+8
```

**第 2 行（段落）**：一句話總結

```
昨天有 3 個專案在動，<project-A> 卡關待你決定方案，<project-B> 待驗證。
```

### PRIORITY 區塊（卡關 / 必處理）

每項一個左邊框卡片，列出：
- 專案名 + 狀態（🚧 卡關 / 🔥 必做）
- 當前狀態一句話
- 下一步具體動作

### TODAY 行事曆（如果有 MS Graph briefing）

把當日 calendar 排成表格，標出衝突時段。

### INBOX 重點（如果有 MS Graph briefing）

- Priority email（manager / CXO / PTO）—— **只列分類，不要在公開分享版本寫死特定姓名**
- Teams 重點訊息（@mention / priority chat）

### WIP 全景區塊（必出）

掃你的 MEMORY 「Projects」section，列出所有**非 ✅ 結案**的專案，一行一個，狀態 emoji + 專案名 + 狀態一句話。讓用戶一眼看到「現在手上有幾顆球」。

狀態 taxonomy（必用其一）：
- `🟢 進行中` — 有活躍下一步
- `🚧 卡關` — 等用戶決策／等外部
- `🅿️ 擱置` — 主動暫停（含日期 + 原因）
- `✅ 結案` — 已關（**全景區不列**，但 MEMORY 保留作歷史）

格式：

```
▸ WIP 全景
🟢 <project-A>   <一句話現況>
🚧 <project-B>   <一句話現況>
🅿️ <project-C>   <一句話現況 + 擱置日期>
```

### TOMORROW / 擱置區塊（資訊性）

列出 🅿️ 擱置中的專案，提醒「不會做但留 context」。

### RECOMMEND 區塊（選配）

1–2 句具體建議下一步。最後問：「要從哪個繼續？」

## 視覺規範

- **不用 emoji 裝飾**（狀態符號 🚧 🅿️ ✅ 例外，已是約定俗成）
- 區塊標題用 `▸ SECTION_NAME` 格式
- 顏色編碼：紅 = priority、藍 = tomorrow、灰 = today
- 保持 flat、clean

## 全形標點規則（zh-TW 必遵守）

繁中上下文的標點全部用全形：

| 用途 | 全形（正確） | 半形（錯誤） |
|---|---|---|
| 逗號 | `，` | `,` |
| 句號 | `。` | `.` |
| 冒號 | `：` | `:` |
| 括號 | `（）` | `()` |
| 引號 | `「」` | `""` |

**例外（保留半形）**：
- 英文句子/片語內的標點
- URL、檔名、程式碼
- 時間戳（`14:32`、`14:00-15:00`）
- 技術術語原文（`Cloudflare Worker`）

**判斷原則**：標點左右是中文 → 全形；至少一邊是英文/數字 → 半形。

## 範例：完整敘事序列

用戶輸入：`開始工作`

```
讓我先校準時間、看一下昨天的進度...

[bash: curl + date]

午安。現在是週四 14:32——讓我把昨天的進度整理給你...

正在翻昨天的工作摘要...

[Read 2026-04-29.md 並行 sync health check]

順便確認一下各專案的同步狀態...

注意到 <project-A> 昨天卡在 CORS，待你決定方案 1/3/4...

正在為你整理今日待辦...

[儀表板輸出]
```

## Failure handling

- 若 daily-summaries 沒有當週檔案 → 用最新一份，並在 Header 註明「⚠ 上次工作日為 X 天前」
- 若 sync health check 發現 ❌ 高風險 → 在 PRIORITY 最上方加紅色警示卡，**先修才繼續**
- 若 sync health check 發現 ⚠️ 警告 → 在 RECOMMEND 加一條「同步警告 X 件」
- 若 git status 對某專案失敗 → 該專案標 `⚠ status 取得失敗`，其他正常處理
- 若 MS Graph briefing 失敗 → 跳過 TODAY / INBOX 區塊，儀表板其他正常出
