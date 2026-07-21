# HIE-REI Repo 搬遷 — Karen Phase 3 執行步驟（給 Karen's Agent 跑）

> **執行時間：2026-04-27（今天） 約 14:43–14:55**（時程緊湊，總 freeze 只有 30 分鐘到 15:00）
> 前置條件：
> 1. Peter 已完成 Phase 1（GitHub UI Rename + Transfer ownership + 通知 Karen，約 14:38）
> 2. org admin 已完成 Phase 2（Karen 對 `trendlife-general/hie-rei` 有 read 權限，約 14:43）
>
> ⚠️ **建議 Karen 在 14:00 前先把 REI-Project clone 下來**（122 MB，1–2 分鐘），這樣 Phase 3 開跑時直接走 update 路線，不用等 clone。
>
> ⚠️ 注意：repo 名字會從 `rei-hie` 改成 **`hie-rei`**（順序顛倒）。新 URL：`git@github.com:trendlife-general/hie-rei.git`

---

## 已確認的現況

| 項目 | 值 |
|---|---|
| Parent repo | `trendlife-general/REI-Project` |
| Parent default branch | `main` |
| Submodule path | `teams/HIE` |
| 搬遷後新 URL | `git@github.com:trendlife-general/hie-rei.git` |
| 預期 pointer SHA（不變） | `09ab87f4788138ad846c22b62241964812ea09c4` |
| Karen 本地 REI-Project 路徑 | **目前還沒 clone**，Phase 3 第一步要 clone |

---

## 給 Karen's Agent 的 prompt（整份貼給 Claude Code）

```
我是 Karen，HIE-REI 搬遷的 Phase 3 負責人。Peter 已完成 Phase 1（rename + transfer），
org admin 已完成 Phase 2。新 repo 位置是 trendlife-general/hie-rei（注意名字順序顛倒）。
請依序執行下方所有步驟。

執行規則：
1. 先確認帳號是 karen-shen_tmemu（不是的話 gh auth switch）
2. 每個 step 完成後停下來等我確認，再繼續下一個
3. 任何 ⚠️ 或非預期 error 立刻暫停問我
4. 不要用 git push --force、不要 --no-verify、不要 reset --hard
5. Step 4 commit 前讓我看 git diff，確認後再 commit + push
6. 用繁體中文回我
```

---

## Step 0 — 確認帳號

```bash
gh auth status
# 預期：karen-shen_tmemu (active)
# 若不是：gh auth switch -u karen-shen_tmemu
```

---

## Step 1 — Clone REI-Project（如果還沒 clone）

```bash
cd ~/Jottacloud/vibe

# 檢查是否已 clone
if [ -d REI-Project ]; then
  echo "已存在，進入 update 流程"
  cd REI-Project
  git status --porcelain
  # 必須無輸出（clean）
  git checkout main
  git pull origin main
else
  echo "首次 clone"
  git clone git@github.com:trendlife-general/REI-Project.git
  cd REI-Project
fi

export REI_PROJECT=$(pwd)
echo "REI_PROJECT=$REI_PROJECT"
```

> ⚠️ 如果 clone 失敗（403 / Permission denied）：
> - SSO 沒授權 → https://github.com/settings/keys → 找你的 SSH key → Configure SSO → Authorize `trendlife-general`
> - 還是不行 → 確認 org admin 把你加到 collaborators

---

## Step 2 — 確認 submodule 現況

```bash
cd "$REI_PROJECT"

echo "=== .gitmodules 中 teams/HIE 條目 ==="
grep -A 2 'teams/HIE' .gitmodules
# 預期輸出：
# [submodule "teams/HIE"]
#     path = teams/HIE
#     url = git@github.com:peter-p-wu_tmemu/rei-hie.git

echo "=== 目前 pointer SHA ==="
git ls-tree HEAD teams/HIE
# 預期輸出：160000 commit 09ab87f4788138ad846c22b62241964812ea09c4	teams/HIE
```

如果輸出與預期不符（例如 url 已經是 trendlife-general 或 SHA 不同），**停下來告訴我**再繼續。

---

## Step 3 — 編輯 `.gitmodules`

把 `[submodule "teams/HIE"]` 段落的 url 從：

```
url = git@github.com:peter-p-wu_tmemu/rei-hie.git
```

改成：

```
url = git@github.com:trendlife-general/hie-rei.git
```

> ⚠️ 注意：新 repo 是 `hie-rei`（HIE 在前，REI 在後），不是 `rei-hie`！

> Agent 可用 Edit tool 直接改，改完讓我看 diff：

```bash
cd "$REI_PROJECT"
git diff .gitmodules
```

預期 diff：
```diff
 [submodule "teams/HIE"]
 	path = teams/HIE
-	url = git@github.com:peter-p-wu_tmemu/rei-hie.git
+	url = git@github.com:trendlife-general/hie-rei.git
```

確認 diff 正確後再進 Step 4。**特別檢查 url 是 `hie-rei` 不是 `rei-hie`**。

---

## Step 4 — 同步 URL + 驗證 SHA 沒變

```bash
cd "$REI_PROJECT"

# 把新 URL 寫進 .git/config
git submodule sync -- teams/HIE

# 確認 .git/config 已更新
git config --get submodule.teams/HIE.url
# 預期：git@github.com:trendlife-general/hie-rei.git

# 初始化 / 更新 submodule（fetch 新 remote）
git submodule update --init teams/HIE 2>&1 | tail -5

# 驗證 submodule pointer SHA 沒變
cd teams/HIE
echo "submodule HEAD: $(git rev-parse HEAD)"
echo "expected:       09ab87f4788138ad846c22b62241964812ea09c4"
# 兩行應一致

# 驗證 submodule 的 origin URL 已換
git remote -v
# 預期：origin git@github.com:trendlife-general/hie-rei.git

# 驗證能 fetch
git fetch origin 2>&1 | tail -3
```

> ⚠️ 如果 fetch 失敗（403 / Permission denied）：
> Phase 2 還沒完成，Karen 對 `trendlife-general/hie-rei` 還沒有 access。
> 停下來找 org admin 確認後再繼續。**不要強行 push**。

---

## Step 5 — Commit + push

```bash
cd "$REI_PROJECT"

git add .gitmodules
git status   # 確認只有 .gitmodules
git diff --cached .gitmodules   # 再次確認 diff
```

> Agent 注意：commit 前讓我看一次 `git diff --cached`，我確認後再執行下一段。

```bash
cd "$REI_PROJECT"
git commit -m "$(cat <<'EOF'
chore: relocate teams/HIE submodule to trendlife-general/hie-rei

Repo renamed from rei-hie to hie-rei and transferred from
peter-p-wu_tmemu to trendlife-general org.

Submodule pointer SHA (09ab87f4) unchanged; only remote URL updated.
EOF
)"

# push 前再次確認帳號
gh auth status

# push
git push origin main 2>&1 | tail -5
```

### 如果 push 被 branch protection 擋下（要走 PR）

```bash
cd "$REI_PROJECT"
git checkout -b chore/relocate-hie-rei-submodule
git push -u origin chore/relocate-hie-rei-submodule
gh pr create --title "chore: relocate teams/HIE submodule to trendlife-general/hie-rei" \
  --body "$(cat <<'EOF'
## Summary
Repo renamed from `peter-p-wu_tmemu/rei-hie` to `trendlife-general/hie-rei`
(rename + transfer ownership). Submodule pointer SHA (`09ab87f4`) unchanged;
only remote URL updated.

## After merge
All clone holders need to run:
\`\`\`
git pull origin main
git submodule sync -- teams/HIE
git submodule update --init --recursive teams/HIE
\`\`\`
EOF
)"
```

PR 開好後 ping reviewer，merge 完才繼續 Step 6。

---

## Step 6 — 驗證遠端已更新

```bash
# 從 origin 重新讀 .gitmodules 確認 push 成功
cd "$REI_PROJECT"
git fetch origin main
git show origin/main:.gitmodules | grep -A 2 'teams/HIE'
# 預期：url = git@github.com:trendlife-general/hie-rei.git
```

確認後 Phase 3 完成。

---

## Step 7 — Grace period: grep 舊 URL hardcode

```bash
cd "$REI_PROJECT"
echo "=== grep peter-p-wu_tmemu/rei-hie hardcode ==="
grep -rn "peter-p-wu_tmemu/rei-hie" . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=teams \
  2>/dev/null

echo "=== grep peter-p-wu_tmemu/hie-rei hardcode（rename 過後的舊路徑）==="
grep -rn "peter-p-wu_tmemu/hie-rei" . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=teams \
  2>/dev/null

echo "=== grep trendlife-general/rei-hie 也檢查（防止有人寫錯名字順序）==="
grep -rn "trendlife-general/rei-hie" . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=teams \
  2>/dev/null
```

如果有命中（CI script、文件、hook），讓我看結果再決定是否一併改掉並 commit。
無命中 = ✅ 沒有殘留 hardcode。

---

## ✅ Phase 3 完成後（約 14:55）

Agent 提醒 Karen：

1. 在兩個 channel po 解凍通告（範本見下方）
2. 個別 ping 重要協作者確認他們有看到通告
3. 觀察 1 小時看有沒有人回報同步異常
4. 一週後再跑一次 grep 檢查是否有人 push 了新的 hardcode 舊 URL

---

# 📨 解凍通告範本（Phase 3 完成後 PO）

## 給 rei-hie 協作者 channel

```
✅ 【解凍】rei-hie 已搬到 trendlife-general/hie-rei（注意：repo 改名）

Hi 大家，搬遷完成，可以恢復工作了。

⚠️ Repo 名字從 rei-hie 改成 hie-rei（順序顛倒），新 URL：
git@github.com:trendlife-general/hie-rei.git

請花 1 分鐘把你本地的 origin URL 換掉（可以丟給你的 agent 跑）：

cd <你本地 rei-hie 的路徑>
git remote set-url origin git@github.com:trendlife-general/hie-rei.git
git remote -v       # 確認顯示 trendlife-general/hie-rei
git fetch origin

⚠️ 如果 fetch 出現 Permission denied / SAML SSO error：
→ https://github.com/settings/keys → 你的 SSH key → Configure SSO → Authorize trendlife-general

舊 URL（peter-p-wu_tmemu/rei-hie 和 peter-p-wu_tmemu/hie-rei）GitHub 會自動 redirect，
短期內不會壞，但建議現在就改。

PR 和 issue 已自動跟著搬到新 repo，書籤連結會 redirect。

本地資料夾名字（rei-hie）不用改，git 認的是 .git/config 裡的 remote URL。

Freeze 期間如果你不小心 push 了，請 ping 我或 Peter 確認 commit 有正確落地。
```

## 給 REI-Project parent repo 協作者 channel

```
✅ 【解凍】REI-Project 的 teams/HIE submodule 已切到 trendlife-general/hie-rei

Hi 大家，搬遷完成，REI-Project 的 main 已 push 一個 .gitmodules 變更 commit。

⚠️ 注意：repo 名字從 rei-hie 改成 hie-rei（順序顛倒）。

請執行下面的同步指令（可以丟給你的 agent 跑）：

cd <你本地 REI-Project 的路徑>
git checkout main
git pull origin main
git submodule sync -- teams/HIE
git submodule update --init --recursive teams/HIE

# 驗證
cd teams/HIE
git remote -v       # 應顯示 trendlife-general/hie-rei
git rev-parse HEAD  # 應為 09ab87f4... 或更新

⚠️ 如果 submodule update 出現 Permission denied / SAML SSO error：
→ https://github.com/settings/keys → 你的 SSH key → Configure SSO → Authorize trendlife-general
→ 授權後重跑 git submodule update --init --recursive teams/HIE

如果你在 teams/HIE 本地有未 push 的 commit：
cd teams/HIE
git remote set-url origin git@github.com:trendlife-general/hie-rei.git
git push

有任何同步異常請在這個 thread 留言。
```

---

## 萬一 Step 5 push 之後發現有問題

| 狀況 | 處理 |
|---|---|
| `.gitmodules` URL typo（例如打成 rei-hie） | 直接改成 hie-rei，commit `fix: correct submodule URL to hie-rei` 再 push |
| Submodule SHA 在 push 後變了（不該變但變了） | 跑 `git checkout 09ab87f4...` 在 submodule 裡 reset 到正確 commit，回 parent repo `git add teams/HIE` commit 修正 |
| 整個搬遷需要回滾 | 走完整回滾方案：org admin transfer 回 peter-p-wu_tmemu → Peter rename 回 rei-hie（可選）→ 改 .gitmodules 回舊 URL → push |
