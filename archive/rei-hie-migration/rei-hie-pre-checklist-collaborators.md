# HIE-REI 搬遷前置 Checklist — 給協作者的 Agent 跑

> **搬遷時間：2026-04-27（今天） 14:30（30 分鐘 freeze 到 15:00）**
> 請在 **14:25 之前**完成下面的前置作業，避免 freeze 期間或解凍後卡住。
> 本檔可整份貼給 Claude Code / 其他 agent 執行。
>
> ⚠️ 注意：repo 名稱會從 `rei-hie` 改成 **`hie-rei`**（順序顛倒）。新位置：`trendlife-general/hie-rei`。

---

## 給你的 Agent 的 prompt（整份貼給它）

```
我是 rei-hie / REI-Project 的協作者，今天 14:30 這個 repo 要從
peter-p-wu_tmemu/rei-hie 改名 + 搬到 trendlife-general/hie-rei。
請在 14:25 前協助我完成搬遷前置。

執行規則：
1. 先問我屬於哪一類（A / B / A+B），再依此跑對應 section + Section C
2. Step 0 開始前先問我：
   - A 類：「你本地 rei-hie 的絕對路徑是？」→ 設成 $REI_HIE
   - B 類：「你本地 REI-Project 的絕對路徑是？」→ 設成 $REI_PROJECT
   - A+B：兩個都問
3. 每個 section 完成後停下來等我確認，再繼續
4. 任何 ⚠️ 或非預期 error 立刻暫停問我
5. Section C.2 的 SSO 授權如果失敗，提醒我去 GitHub 網頁授權，你不用代勞
6. 用繁體中文回我
7. 不要用 git push --force、不要 --no-verify、不要 reset --hard
```

---

## Step 1 — 判斷你屬於哪一類

| 類別 | 描述 | 要做的 section |
|---|---|---|
| **A** | 我有 clone `peter-p-wu_tmemu/rei-hie` 自己用 | A + C |
| **B** | 我有 clone `trendlife-general/REI-Project` parent repo | B + C |
| **A+B** | 兩個都有 | A + B + C |

> 不確定？跑這個指令找：
> ```bash
> find ~ -maxdepth 6 -type d -name ".git" 2>/dev/null | xargs -I{} dirname {} | grep -iE "(rei-hie|hie-rei|REI-Project)"
> ```

---

## Section A — 有 clone `rei-hie` 的人

### A.0 設定路徑

```bash
export REI_HIE="/path/to/your/rei-hie"   # ← 換成實際絕對路徑
cd "$REI_HIE" && pwd && git rev-parse --show-toplevel
# 兩個輸出應一致
```

### A.1 Push 所有未 push 的 commit / 變更

```bash
cd "$REI_HIE"
git fetch --all --prune 2>&1 | tail -3

# 1. 看有沒有未 commit 的變更
echo "=== uncommitted changes ==="
git status --porcelain
# 預期：無輸出 = clean

# 2. 看每個 local branch 跟 upstream 的差距
echo "=== branches vs upstream ==="
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

**處理規則**：
- `git status` 有輸出 → commit + push，或 `git stash -u` 起來（stash 是 local-only，搬完後還在）
- `NO_UPSTREAM` → 該 branch 沒推過：跑 `git push -u origin <branch>`
- `ahead=N`（N>0）→ 跑 `git push origin <branch>`
- 處理完重跑這段確認

> Agent 注意：不要自動 push 任何 branch，列出狀態給我看，等我說「都 push 上去」再執行。

### A.2 Sanity check

```bash
cd "$REI_HIE"
unpushed=""
git for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads/ | while read branch upstream; do
  if [ -z "$upstream" ]; then
    echo "⚠️ $branch: NO_UPSTREAM"
  else
    ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null)
    [ "$ahead" -gt 0 ] && echo "⚠️ $branch: ahead=$ahead"
  fi
done
echo "(若上方無 ⚠️ 訊息 = section A 完成)"
```

### A.3 列下你目前的 PR / issue（不用動作，留紀錄）

```bash
gh pr list --repo peter-p-wu_tmemu/rei-hie --author "@me" 2>&1 | head -10
gh issue list --repo peter-p-wu_tmemu/rei-hie --author "@me" 2>&1 | head -10
```

> Transfer 後 PR/issue 會自動跟著搬到新 repo `trendlife-general/hie-rei`，舊書籤連結會 redirect。
> 沒裝 gh 跳過這步沒關係。

---

## Section B — 有 clone `REI-Project` parent repo 的人

### B.0 設定路徑

```bash
export REI_PROJECT="/path/to/your/REI-Project"   # ← 換成實際絕對路徑
cd "$REI_PROJECT" && pwd && git rev-parse --show-toplevel
```

### B.1 確認 `teams/HIE` 子目錄沒有未 push 的變更

```bash
cd "$REI_PROJECT"

# 確認 submodule 已 init
if [ ! -f teams/HIE/.git ] && [ ! -d teams/HIE/.git ]; then
  echo "ℹ️ teams/HIE 還沒 init，跳過 B.1（沒有 local 變更可損失）"
else
  cd "$REI_PROJECT/teams/HIE"
  git fetch --all --prune 2>&1 | tail -3

  echo "=== uncommitted changes ==="
  git status --porcelain

  echo "=== branches vs upstream ==="
  git for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads/ | while read branch upstream; do
    if [ -z "$upstream" ]; then
      echo "$branch | NO_UPSTREAM"
    else
      ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null)
      behind=$(git rev-list --count "$branch..$upstream" 2>/dev/null)
      echo "$branch | upstream=$upstream | ahead=$ahead behind=$behind"
    fi
  done
fi
```

**處理規則**（同 A.1）：
- `git status` 有輸出 → commit + push（往現在的 URL `peter-p-wu_tmemu/rei-hie` 推）
- `ahead>0` → `git push`
- WIP → `git stash` 或先做 WIP commit

### B.2 確認 parent repo 自己也乾淨

```bash
cd "$REI_PROJECT"

echo "=== uncommitted in parent repo ==="
git status --porcelain

echo "=== parent repo branches vs upstream ==="
git for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads/ | while read branch upstream; do
  if [ -z "$upstream" ]; then
    echo "$branch | NO_UPSTREAM"
  else
    ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null)
    behind=$(git rev-list --count "$branch..$upstream" 2>/dev/null)
    echo "$branch | upstream=$upstream | ahead=$ahead behind=$behind"
  fi
done
```

**特別注意 `.gitmodules`**：搬遷後 Karen 會 push 一個改 `.gitmodules` 的 commit 到 main。如果你本地有未 push 的 `.gitmodules` 變更，pull 會卡。

```bash
cd "$REI_PROJECT"
git diff --name-only origin/main..HEAD 2>/dev/null | grep -F ".gitmodules" && echo "⚠️ 你有未 push 的 .gitmodules 變更，先處理" || echo "✅ .gitmodules clean"
git diff --name-only HEAD 2>/dev/null | grep -F ".gitmodules" && echo "⚠️ 你有未 commit 的 .gitmodules 變更，先處理" || echo "✅ .gitmodules working tree clean"
```

### B.3 Pull 到最新

```bash
cd "$REI_PROJECT"
git checkout main
git pull origin main 2>&1 | tail -5
```

讓你 14:25 收工時的狀態跟搬遷前的 main 對齊，解凍後 `git pull` 只會拉 Karen 那個 relocate commit。

---

## Section C — 所有人都要做（環境檢查）

### C.1 確認 git 版本

```bash
git --version
# 確認 >= 2.30；< 2.30 對 submodule sync 有 bug
```

太舊：
- macOS: `brew upgrade git`
- Linux: 用 package manager 升級

### C.2 ⚠️ 確認你對 `trendlife-general` org 有 SSO 授權（最容易卡的點）

搬完後 `teams/HIE` submodule 會指向 `trendlife-general/hie-rei`。沒授權的話解凍時會在 `git submodule update` 那步 403。

```bash
# Test 1: SSH 連線可達
ssh -T git@github.com 2>&1 | head -1
# 預期："Hi <username>! You've successfully authenticated, but GitHub does not provide shell access."

# Test 2: SSH key 對 trendlife-general 已 SSO 授權
echo "=== SSH SSO test ==="
git ls-remote git@github.com:trendlife-general/REI-Project.git HEAD 2>&1 | head -3
# 預期：輸出 SHA + HEAD
# 失敗訊息：包含 "Permission denied" 或 "SAML SSO" 或 "403"

# Test 3: HTTPS（如果你慣用 https）也能訪問
echo "=== HTTPS access test ==="
gh repo view trendlife-general/REI-Project --json name 2>&1 | head -3 || echo "(沒裝 gh 跳過)"
```

**Test 2 失敗的處理**：

1. 開 https://github.com/settings/keys
2. 找到你**目前在用的 SSH key**（如果不確定用哪一把：跑 `ssh -v git@github.com 2>&1 | grep "Offering public key"` 看 key 路徑）
3. 該 key 旁邊點 **Configure SSO** → 對 `trendlife-general` 點 **Authorize**

如果你習慣用 HTTPS + PAT：
1. 開 https://github.com/settings/tokens
2. 找你的 PAT，點 **Configure SSO** → Authorize `trendlife-general`

跑完授權後重跑 Test 2 確認通過。

> Agent 注意：這步要使用者自己開瀏覽器處理，不要嘗試自動完成 SSO。

### C.3 14:25 最後一鍵檢查

```bash
# A 類（如果有設 $REI_HIE 才會跑）
if [ -n "$REI_HIE" ] && [ -d "$REI_HIE" ]; then
  echo "=== A: rei-hie ==="
  cd "$REI_HIE"
  echo "uncommitted: $(git status --porcelain | wc -l | tr -d ' ') files"
  echo "branch state:"
  git for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads/ | while read branch upstream; do
    if [ -z "$upstream" ]; then
      echo "  ⚠️ $branch: NO_UPSTREAM"
    else
      ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null)
      [ "$ahead" -gt 0 ] && echo "  ⚠️ $branch: ahead=$ahead"
    fi
  done
fi

# B 類（如果有設 $REI_PROJECT 才會跑）
if [ -n "$REI_PROJECT" ] && [ -d "$REI_PROJECT" ]; then
  echo "=== B: REI-Project ==="
  cd "$REI_PROJECT"
  echo "uncommitted: $(git status --porcelain | wc -l | tr -d ' ') files"
  echo "branch state:"
  git for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads/ | while read branch upstream; do
    if [ -z "$upstream" ]; then
      echo "  ⚠️ $branch: NO_UPSTREAM"
    else
      ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null)
      [ "$ahead" -gt 0 ] && echo "  ⚠️ $branch: ahead=$ahead"
    fi
  done
  echo "submodule status:"
  git submodule status teams/HIE 2>&1 | head -3
fi

# 兩類都驗 SSO
echo "=== SSO test ==="
git ls-remote git@github.com:trendlife-general/REI-Project.git HEAD >/dev/null 2>&1 && echo "✅ trendlife-general SSO OK" || echo "❌ trendlife-general SSO failed — 去 https://github.com/settings/keys 授權"
```

`uncommitted: 0`、`unpushed: (none)`、`✅ SSO OK` = 你準備好了。

---

## FAQ

**Q: 為什麼 repo 名字會從 rei-hie 改成 hie-rei？**

A: 這是搬遷時順便正名，跟新 org 的命名慣例一致。GitHub 會自動建 redirect，舊名字短期內仍可用。

**Q: 我的工作還沒做完，但 14:30 freeze 期間我要繼續寫，怎麼辦？**

A: Local 寫沒問題，只是不要 push。Freeze 結束後（約 15:00），你 pull 完新狀態再 push 即可。Pull 解凍 commit 不會跟你的 local commit 衝突，因為改的只是 parent repo 的 `.gitmodules`。

**Q: Freeze 期間我不小心 push 了怎麼辦？**

A: GitHub 的 redirect 通常會把 push 寫到新 repo，但**請在解凍後 ping Karen / Peter** 一聲，我們會幫你檢查 commit 有沒有正確落地。

**Q: 我有 fork peter-p-wu_tmemu/rei-hie，要做什麼？**

A: Fork 不會自動跟著 transfer，但 GitHub 會把 fork 關係指到新 repo `trendlife-general/hie-rei`。建議解凍後跑：
```bash
cd <你的 fork clone>
git remote set-url upstream git@github.com:trendlife-general/hie-rei.git
git remote -v
```

**Q: 搬完後我的 origin URL 一定要改嗎？**

A: 短期內 GitHub 的 redirect 會處理，舊 URL 還能用。但**強烈建議解凍後就改**：

A 類解凍指令（agent 可直接跑）：
```bash
cd "$REI_HIE"
git remote set-url origin git@github.com:trendlife-general/hie-rei.git
git remote -v
git fetch origin 2>&1 | tail -3
```

B 類解凍指令（agent 可直接跑）：
```bash
cd "$REI_PROJECT"
git checkout main
git pull origin main 2>&1 | tail -5
git submodule sync -- teams/HIE
git submodule update --init --recursive teams/HIE 2>&1 | tail -5

# 驗證
cd teams/HIE
git remote -v
# 預期：origin git@github.com:trendlife-general/hie-rei.git
```

**Q: 本地資料夾名字 `rei-hie` 要改成 `hie-rei` 嗎？**

A: 不用。git 認的是 `.git/config` 裡的 remote URL，跟資料夾名字無關。要改也可以（純強迫症），改完 `cd` 路徑也要更新。

---

## 搬遷時程提醒（緊湊：總共 30 分鐘）

| 時間 | 動作 |
|---|---|
| **～14:25** | 你完成這份 checklist |
| **14:30** | Freeze 開始（不要 push） |
| **14:30–14:38** | Peter 做 rename + transfer |
| **14:38–14:43** | org admin 加 access |
| **14:43–14:55** | Karen 改 parent repo `.gitmodules` |
| **～15:00** | Karen 發解凍通告 + 同步指令（freeze 結束） |

有問題在 channel 留言或 ping {Peter / Karen}。
