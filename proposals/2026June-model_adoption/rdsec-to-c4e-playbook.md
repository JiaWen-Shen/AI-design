# RDsec → C4E 永久切換 — Agent Playbook

> 給同仁用：把這整份內容**貼進 Claude Code session**，agent 會自動跑完整套切換 +
> 驗證，最後生一份 report 給你寄回 Karen（karen_shen@trendmicro.com）。
>
> 遇到路徑或檔案不存在時，agent 會主動問你，**不會擅自跳過或亂猜**。

---

## 給 Agent 的指令（從這裡開始整段執行）

You are helping the user migrate this Mac from the legacy RDsec AI proxy to
C4E (Claude for Enterprise). Follow these 5 phases strictly. **STOP and ASK**
whenever a path is missing or ambiguous — never guess.

Use Traditional Chinese (zh-TW) when speaking to the user.

---

### Phase 0 — 認裝置（靜默執行，記下結果）

```bash
DEVICE_NAME=$(scutil --get ComputerName 2>/dev/null || hostname)
USER_NAME=$USER
OS_VERSION=$(sw_vers -productVersion 2>/dev/null || echo "unknown")
CLAUDE_VERSION=$(claude --version 2>/dev/null | head -1 || echo "unknown")
DATE_STAMP=$(date +%Y-%m-%d)
echo "Device: $DEVICE_NAME"
echo "User: $USER_NAME"
echo "macOS: $OS_VERSION"
echo "Claude Code: $CLAUDE_VERSION"
echo "Date: $DATE_STAMP"
```

保留這 5 個值，後面 report 要用。

---

### Phase 1 — 盤點（**唯讀，絕對不要改任何檔案**）

跑這 4 個 check 並印結果：

```bash
# 1. shell rc 內 ANTHROPIC export
echo "--- A. Shell rc ---"
for f in ~/.zshrc ~/.bashrc ~/.zshenv ~/.bash_profile ~/.profile; do
  [ -f "$f" ] && grep -nE "ANTHROPIC_(BASE_URL|API_KEY|AUTH_TOKEN)" "$f" \
    | sed "s|^|$f: |"
done

# 2. settings.json 內 RDsec 殘留
echo "--- B. ~/.claude/settings.json ---"
jq '{
  env_anthropic: (.env // {} | to_entries |
    map(select(.key | startswith("ANTHROPIC"))) | from_entries),
  apiKeyHelper: .apiKeyHelper,
  anthropicBaseURL: .anthropicBaseURL
}' ~/.claude/settings.json 2>/dev/null || echo "settings.json not found"

# 3. ~/.claude.json oauthAccount
echo "--- C. ~/.claude.json oauthAccount ---"
jq '.oauthAccount // "not_logged_in"' ~/.claude.json 2>/dev/null \
  || echo ".claude.json not found"

# 4. Keychain
echo "--- D. macOS Keychain ---"
security find-generic-password -s "Claude Code-credentials" -a "$USER" \
  2>&1 | grep -E "svce|acct" | head -2 \
  || echo "no Keychain entry"
```

**處理路徑/檔案不存在**：
- 若 `~/.zshrc` `~/.bashrc` 都沒有 → 問 user：「你 shell rc 是用哪個檔？」
- 若 `~/.claude/settings.json` 不存在 → 問 user：「Claude Code 是否裝在非預設位置？」
- 若 jq 沒裝 → 問 user：「要我用 python 替代 jq 跑嗎？」

把結果整理成一張表給 user 看：

| 層 | 狀態 | RDsec 殘留 |
|---|---|---|
| shell rc | … | … |
| settings.json | … | … |
| .claude.json | … | … |
| Keychain | … | … |

**Wait for user confirmation** 後再進 Phase 2。

---

### Phase 2 — 清理（user 確認後才動）

對 Phase 1 找到的每個殘留：

1. **先 show diff** — 用 Edit / Read 給 user 看會改什麼
2. **等 user 說 OK** 再實際改
3. **改完再印一次** 確認

規則：
- shell rc 的 `export ANTHROPIC_*` → **加 `# ` 註解掉**（保留原文 + 加標記 `# [RDsec->C4E YYYY-MM-DD]`），**不要刪除**
- settings.json 的 `env.ANTHROPIC_*` / `apiKeyHelper` / `anthropicBaseURL` → 用 jq 移除（保留其他欄位）
- **不要動** `env.RDSEC_API_KEY`（codex CLI 還要用）
- **不要動** Keychain（user 親手 `/logout` 處理）

範例 jq 清 settings.json：
```bash
jq 'del(.env.ANTHROPIC_BASE_URL, .env.ANTHROPIC_API_KEY,
        .env.ANTHROPIC_AUTH_TOKEN, .apiKeyHelper, .anthropicBaseURL)' \
   ~/.claude/settings.json > /tmp/settings.new \
  && mv /tmp/settings.new ~/.claude/settings.json
```

**異常處理**：
- 寫入失敗（權限 / disk full）→ STOP 並問 user
- jq 不存在 → 用 python 寫 in-place edit，但先問 user

---

### Phase 3 — 用戶手動步驟（agent 印出並等）

清完後印給 user：

```
✋ 接下來你要親手做：

  1. 完全離開 Claude Code（在這個 session 內輸入 exit）
  2. 開一個全新的 terminal
  3. 依序跑：
       claude /logout      # 清掉 Keychain 內 RDsec 舊 credentials
       claude              # 重開 session
       > /login            # 跳瀏覽器 → Trend Micro SSO
       > /model            # 選 Opus 4.7

  4. 完成後**再重開一次 Claude Code**（驗證設定真的 persist）

  5. 重開後在新 session 內把這整份 playbook 再貼一次，
     並告訴 agent「我已完成 /login，跑 Phase 4 驗證」
```

---

### Phase 4 — 自動驗證（user 說「已完成 /login」後跑）

```bash
echo "=== 驗證 4 道關卡 ==="

# 1. Keychain
security find-generic-password -s "Claude Code-credentials" -a "$USER" \
  >/dev/null 2>&1 \
  && echo "✅ Keychain  有 C4E credentials" \
  || echo "❌ Keychain  缺 credentials → 需要重跑 /login"

# 2. .claude.json oauthAccount
EMAIL=$(jq -r '.oauthAccount.emailAddress // empty' ~/.claude.json 2>/dev/null)
if [ -n "$EMAIL" ]; then
  echo "✅ oauthAccount  $EMAIL"
else
  echo "❌ oauthAccount  缺 email → /login 未完成"
fi

# 3. settings.json 已清
RES=$(jq -r '[
  .env.ANTHROPIC_BASE_URL, .env.ANTHROPIC_API_KEY,
  .env.ANTHROPIC_AUTH_TOKEN, .apiKeyHelper, .anthropicBaseURL
] | map(select(. != null)) | length' ~/.claude/settings.json)
if [ "$RES" = "0" ]; then
  echo "✅ settings.json  乾淨"
else
  echo "❌ settings.json  還有 $RES 個 RDsec 殘留"
fi

# 4. shell rc 已清
LEAK=$(grep -lE "^[^#]*export +ANTHROPIC_(BASE_URL|API_KEY|AUTH_TOKEN)" \
  ~/.zshrc ~/.bashrc ~/.zshenv ~/.bash_profile ~/.profile 2>/dev/null)
if [ -z "$LEAK" ]; then
  echo "✅ shell rc  乾淨"
else
  echo "❌ shell rc  還有未註解 export：$LEAK"
fi
```

把結果記下來，下一步要寫進 report。

---

### Phase 5 — 生成 Report + 回報給 Karen

把以下內容寫到 `~/Desktop/rdsec-to-c4e-report-${DEVICE_NAME}-${DATE_STAMP}.md`
（檔名空白用 `_` 替換）：

```markdown
# RDsec → C4E 切換報告

## 裝置
- Device: {DEVICE_NAME}
- User: {USER_NAME}
- macOS: {OS_VERSION}
- Claude Code: {CLAUDE_VERSION}
- 切換日期: {DATE_STAMP}

## 切換前狀態（Phase 1 audit 結果）
{貼 Phase 1 表格}

## 執行的清理動作（Phase 2）
{列出每個改動的檔案 + 摘要}

## 用戶手動步驟完成狀況（Phase 3）
- /logout: ✅ / ❌
- /login → Trend SSO: ✅ / ❌
- /model 設 Opus 4.7: ✅ / ❌

## 自動驗證結果（Phase 4）
| 層 | 結果 |
|---|---|
| Keychain | ✅ / ❌ |
| oauthAccount | ✅ / ❌ |
| settings.json | ✅ / ❌ |
| shell rc | ✅ / ❌ |

## 最終狀態
- [ ] SUCCESS（4 道都過）
- [ ] PARTIAL（部分通過，列出未通過項）
- [ ] FAILED（未完成切換）

## 過程中的異常 / 用戶選擇
{任何問 user 的問題與選擇}
```

最後印給 user：

```
✅ Report 已寫到：
   ~/Desktop/rdsec-to-c4e-report-{DEVICE_NAME}-{DATE_STAMP}.md

請把這份檔案寄回 Karen，三選一：

  (a) Teams DM 給 karen_shen@trendmicro.com，把檔案內容貼上
  (b) 把整個檔案 attach 到 Teams 群組「RDsec migration tracker」
  (c) 直接複製到剪貼簿：
        pbcopy < ~/Desktop/rdsec-to-c4e-report-{DEVICE_NAME}-{DATE_STAMP}.md
      然後貼到任何地方傳給 Karen
```

---

## 給 Karen 的 meta 註記（不是給 agent 看的）

- 同仁回傳 report 後，依 Phase 4 的 4 道驗證結果歸類
- 任何 PARTIAL / FAILED 都需要單獨 follow up
- Phase 2 內列的「執行的清理動作」是同仁 baseline 的真實 RDsec 設定樣貌，
  收集多份後可以反推團隊內 RDsec 配置的所有變體
