# HIE-REI Repo 搬遷 — 給 Peter 的執行步驟（給你的 Agent 跑）

> **搬遷時間：2026-04-27（今天） 14:30（30 分鐘 freeze 到 15:00）**
> Peter 只要做 Phase 0–1，約 7 分鐘。Phase 2 是 org admin、Phase 3 之後是 Karen。
> ⚠️ 時程緊湊：Phase 0 必須在 14:25 前做完，14:30 一到立刻 rename + transfer。
> ⚠️ 注意：repo 名稱會從 `rei-hie` 改成 **`hie-rei`**（順序顛倒）。

---

## 已確認的現況

| 項目 | 值 |
|---|---|
| 你的 repo（搬遷前） | `peter-p-wu_tmemu/rei-hie` |
| 目標位置（搬遷後） | `trendlife-general/hie-rei` ⚠️ 名字反過來 |
| Parent repo | `trendlife-general/REI-Project` |
| Submodule path in parent | `teams/HIE` |
| 目前 pointer SHA | `09ab87f4788138ad846c22b62241964812ea09c4` |

> 此 SHA 在搬遷前後**不應改變**。

---

## 流程概要（為什麼有兩步）

GitHub 的 Transfer ownership 不能在 transfer 同時改 repo 名稱。所以分兩步：

1. **Phase 1.A**：Peter 先在自己的 GitHub 把 `peter-p-wu_tmemu/rei-hie` **rename 成 `peter-p-wu_tmemu/hie-rei`**
2. **Phase 1.B**：再 Transfer ownership → `trendlife-general/hie-rei`

兩步都會自動建立 GitHub redirect，舊 URL 仍可短期內訪問。

---

## 給 Peter's Agent 的 prompt（整份貼給 Claude Code 等）

```
我是 hie-rei repo 的 owner（原 rei-hie，今天會改名 + 搬到 org），今天 14:30 要把
peter-p-wu_tmemu/rei-hie 先 rename 成 peter-p-wu_tmemu/hie-rei，
再 transfer 到 trendlife-general/hie-rei。請依序執行下方 Phase 0 和 Phase 1。
時程很緊（30 分鐘到 15:00 結束），Phase 0 要在 14:25 前完成。

執行規則：
- 每個 phase 完成後停下來等我確認，再繼續
- Phase 0.0 開始前先問我：「你本地 rei-hie 的絕對路徑是？」
  我給你後，把整段指令裡的 $REI_HIE 換成這個路徑來跑（用 export REI_HIE="..." 設一次即可）
- Phase 0.4 的 settings 截圖請我自己做
- Phase 1.2 和 1.3 的 GitHub UI 操作（rename + transfer）不用幫我點，提醒我去 GitHub UI 做即可
- 任何 ⚠️ 或非預期 error 立刻暫停問我
- 用繁體中文回我
- 不要用 git push --force、不要 --no-verify、不要 reset --hard
```

---

## Phase 0 — 搬遷前盤點（5 分鐘，14:25 前完成）

### 0.0 設定路徑變數（agent 跟我確認後設）

```bash
export REI_HIE="/path/to/your/rei-hie"   # ← 換成實際絕對路徑
cd "$REI_HIE" && pwd && git rev-parse --show-toplevel
# 兩個輸出應一致；不一致代表路徑錯
```

### 0.1 確認本地 repo 沒有未 commit 的變更

```bash
cd "$REI_HIE"
git status --porcelain
# 預期：無輸出 = clean
# 若有輸出 → 先處理（commit + push 或 stash）
```

### 0.2 確認所有 local branch 都已 push（穩健版）

```bash
cd "$REI_HIE"
git fetch --all --prune 2>&1 | tail -3

# 列出所有 local branch + 它的 upstream + ahead/behind 數字
git for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads/ | while read branch upstream; do
  if [ -z "$upstream" ]; then
    echo "$branch | NO_UPSTREAM (尚未 push 過)"
  else
    ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null)
    behind=$(git rev-list --count "$branch..$upstream" 2>/dev/null)
    echo "$branch | upstream=$upstream | ahead=$ahead behind=$behind"
  fi
done
```

**預期 / 處理**：
- `NO_UPSTREAM` → 該 branch 沒設 tracking，需要 `git push -u origin <branch>` 推上去
- `ahead=0` → 已同步，不用動
- `ahead=N`（N>0）→ 有未 push commit，跑 `git push origin <branch>`

跑完處理動作後重跑這段，直到所有 branch 都 `ahead=0` 或本來就不打算 push（agent 要列給我看再讓我決定）。

### 0.3 確認 parent repo 引用的 SHA 還在本地

```bash
cd "$REI_HIE"
git cat-file -e 09ab87f4788138ad846c22b62241964812ea09c4 2>&1
echo "exitcode=$?"
# exitcode=0 → ✅ SHA 存在
# exitcode=128 → ❌ SHA missing — STOP，找回這個 commit 再繼續
```

如果 SHA 不在：用 `git fetch --all --tags` 再試一次；還是不在表示這個 commit 在歷史上消失了（force-push 過？），**停下來找 Karen 討論**。

### 0.4 列出 repo 設定（搬完要在新 repo 重設 — Peter 自己做）

> Agent 不用代勞，提醒 Peter 開瀏覽器到 `https://github.com/peter-p-wu_tmemu/rei-hie/settings` 截圖：

- [ ] **Secrets and variables → Actions**
- [ ] **Pages**（有開的話 URL 會變）
- [ ] **Webhooks**
- [ ] **Branch protection rules**
- [ ] **Collaborators**（誰有權限）
- [ ] **Deploy keys**

---

## Phase 1 — Rename + Transfer（14:30 開始，約 8 分鐘）

> ⚠️ 時程緊湊。建議 Peter 在 **14:25 預先 ping org admin** 提醒 standby（admin 約 14:38 後要立刻處理 Phase 2）。

### 1.1 確認搬遷公告已 po 出去（agent 提醒 Peter 確認）

兩個 channel：rei-hie collaborators + REI-Project collaborators。

### 1.2 Step A — Rename repo `rei-hie` → `hie-rei`（GitHub UI — Peter 自己點）

> Agent 不要幫忙開瀏覽器或 call API，提醒 Peter：

1. 開 `https://github.com/peter-p-wu_tmemu/rei-hie/settings`
2. 在最上方 **General** section 找到 **Repository name** 欄位
3. 把 `rei-hie` 改成 `hie-rei`
4. 點 **Rename**

**完成後驗證（agent 跑）**：

```bash
# 等 10 秒讓 GitHub 處理完 rename
sleep 10

# 新名字可訪問
git ls-remote git@github.com:peter-p-wu_tmemu/hie-rei.git HEAD 2>&1 | head -1
# 預期：輸出 SHA + HEAD

# 舊名字會 redirect
git ls-remote git@github.com:peter-p-wu_tmemu/rei-hie.git HEAD 2>&1 | head -3
# 預期：可能輸出 SHA（透過 redirect），或 "warning: redirecting to..."
```

### 1.3 Step B — Transfer ownership（GitHub UI — Peter 自己點）

⚠️ **前置條件**：org admin 已確認**清空 `trendlife-general/hie-rei`**（如果之前 org 預先建了空 repo，要先請 admin 刪掉，不然 transfer 會被擋）。**今天 Peter 已確認 admin 已刪除空 repo**。

1. 開 `https://github.com/peter-p-wu_tmemu/hie-rei/settings`（注意：用新名字 hie-rei）
2. 拉到最下方 **Danger Zone**
3. 點 **Transfer ownership**
4. New owner 填：`trendlife-general`
5. 輸入 repo 名稱 `hie-rei` 確認（注意：是 hie-rei，不是 rei-hie）
6. 點 **I understand, transfer this repository**

> ⚠️ 出現「Repository name already exists in trendlife-general」→ org admin 沒刪掉預建的空 repo，停下來請 admin 刪除後再做
> ⚠️ 出現「You don't have permission to create repositories in trendlife-general」→ 停下來找 org admin 給 Peter member 權限，**不要**改用 mirror push（會失去 redirect）

### 1.4 驗證 Transfer 成功

```bash
# 等 30 秒讓 GitHub 內部完成 transfer
sleep 30

# 1. 新 repo 可訪問
git ls-remote git@github.com:trendlife-general/hie-rei.git HEAD 2>&1 | head -1
# 預期：輸出 SHA + HEAD

# 2. 舊 URL 已 redirect（兩個都試）
git ls-remote git@github.com:peter-p-wu_tmemu/hie-rei.git HEAD 2>&1 | head -3
git ls-remote git@github.com:peter-p-wu_tmemu/rei-hie.git HEAD 2>&1 | head -3
# 預期：要嘛輸出 SHA（透過 redirect），要嘛 "warning: redirecting to..."

# 3. SHA 在新位置存在
cd "$REI_HIE"
git fetch git@github.com:trendlife-general/hie-rei.git 2>&1 | tail -3
# 預期：fetch 成功，沒 error

# 4. 用 SHA 在新 repo 找 commit
git ls-remote git@github.com:trendlife-general/hie-rei.git | grep 09ab87f4 \
  || echo "(commit not on a ref tip — 正常，因為它可能是歷史中間的 commit)"
```

### 1.5 在新 repo 重設 Phase 0.4 列出的設定

> Peter 自己在瀏覽器做，agent 不用代勞。

進 `https://github.com/trendlife-general/hie-rei/settings` 重新設定 secrets / Pages / webhook / deploy key 等。Collaborators 由 org admin 在 Phase 2 處理。

### 1.6 更新本地 clone 的 remote（agent 跑）

```bash
cd "$REI_HIE"
git remote -v
# 確認 origin 還是 peter-p-wu_tmemu/rei-hie

git remote set-url origin git@github.com:trendlife-general/hie-rei.git
git remote -v
# 確認已換成 trendlife-general/hie-rei

git fetch origin 2>&1 | tail -3
git status
# 應顯示 "Your branch is up to date with 'origin/main'"
```

> 提醒：本地資料夾名字（你 clone 出來的目錄名）是 `rei-hie` 還是別的，**不需要改**，git 認的是 `.git/config` 裡的 remote URL，跟資料夾名無關。要改也可以（純強迫症），改完路徑變數 `$REI_HIE` 也要更新。

---

## ✅ 完成 Phase 1 後（約 14:38）

Agent 提醒 Peter 在 channel ping 兩個人：

1. **org admin** — 麻煩處理 Phase 2 access：把原本對 `peter-p-wu_tmemu/rei-hie` 有 access 的人加回 `trendlife-general/hie-rei`（含 Karen）
2. **Karen** — 我會接手 Phase 3，更新 parent repo `REI-Project` 的 `.gitmodules`

---

## 風險檢查清單（搬之前最後確認）

- [ ] 0.0 路徑設定正確
- [ ] 0.1 working tree clean
- [ ] 0.2 所有 branch ahead=0 或已決定不推
- [ ] 0.3 SHA `09ab87f4` 存在於本地
- [ ] 0.4 settings 已截圖（Peter 自己做）
- [ ] org admin 已確認刪除 `trendlife-general/hie-rei` 空 repo
- [ ] Peter 對 `trendlife-general` 有 receive transfer 權限
- [ ] 搬遷公告已 po 到兩個 channel

---

## 萬一出大問題的回滾方案

GitHub 允許 transfer 之後再 transfer 回去 + rename 也可以反向：

1. trendlife-general org admin 進 `trendlife-general/hie-rei/settings → Danger Zone → Transfer ownership`
2. New owner: `peter-p-wu_tmemu`
3. Peter 接受 transfer
4.（可選）Peter 把 `peter-p-wu_tmemu/hie-rei` rename 回 `rei-hie`
5. Karen 把 parent repo 的 `.gitmodules` URL 改回 `peter-p-wu_tmemu/rei-hie` 並 commit + push

不會掉資料（commit / Issues / PRs 都還在）。
