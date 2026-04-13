# Git Operation Guide for Designers | 設計師 Git 操作指南

> This guide is read by Claude Code to handle all git operations for you automatically.
> You don't need to read or understand this file — just keep it in the repo.
>
> 這份指南由 Claude Code 讀取，自動處理所有 git 操作。
> 你不需要閱讀或理解這份文件，只要它在 repo 裡就好。

---

## 1. First-Time Onboarding | 首次設定引導

**Trigger**: Designer's CLAUDE.md has `<FILL_IN>` values, or designer says "first time" / "help me set up" / "how do I start" / "I just joined the team".

**Principle**: Ask one question at a time. Wait for the answer. Never assume.

### Step 1: Welcome & Identity | 歡迎與身份確認

Greet the designer and ask:

> "Hi! I'm your assistant for working with the team repo. Before we start:
> 1. What's your name?
> 2. What's your GitHub username?"

Verify GitHub auth:
```bash
gh auth status
```
- Active account matches → proceed
- Doesn't match → offer to switch: "You're logged in as `X`. Should I switch to `Y`?"
- Not logged in → guide through `gh auth login`

**Update CLAUDE.md Config**: `designer_name`, `github_account`

### Step 2: Identify the Team Repo | 確認團隊 Repo

> "Which team repo will you be working in? Share a GitHub URL or just the name."

Then:
1. Normalize URL, convert to SSH if enterprise org needs it
2. Verify access: `git ls-remote <url> HEAD`
3. If 403/SAML → check SSH: `ssh -T git@github.com`, guide SSO auth if needed
4. Detect default branch: `git ls-remote --symref <url> HEAD`

**Update CLAUDE.md Config**: `parent_repo_url`, `parent_branch`

### Step 3: Clone the Repo | 下載 Repo

> "Where is your usual working folder? (e.g., `~/Documents/projects/`)"

If unsure → check `pwd` and suggest current location.

```bash
git clone --recurse-submodules <parent_repo_url> <target_path>/<repo_name>
```

If LFS error → `brew install git-lfs && git lfs install`, retry clone.

**Update CLAUDE.md Config**: `clone_path`

### Step 4: Identify the Designer's Folder | 確認指派的資料夾

> "Which folder in this project has been assigned to you?
> You can share a GitHub URL or folder path. If not sure, ask your team lead."

Extract path from URL if needed, then verify:
```bash
cd <clone_path>
ls -d <folder_path>
git submodule status <folder_path> 2>&1
```

**Case A — IS a submodule** (normal):
```bash
cd <folder_path>
git checkout main
git remote -v
git status
```
If empty → `git submodule update --init <folder_path>` from parent root.

**Case B — NOT a submodule** (needs maintainer):
> "Your folder exists but isn't set up for independent syncing yet. Ask your maintainer to convert it. They'll need:
> - Folder: `<path>`, Your account: `<account>`"

**Case C — Folder doesn't exist** → list available folders, let designer pick.

**Update CLAUDE.md Config**: `my_submodule_folder`

### Step 5: Confirm & Save | 確認並儲存

Update all `<FILL_IN>` fields in designer's CLAUDE.md, then summarize:

> "All set! From now on:
> - Edit files inside `<folder>/`
> - Tell me 'save my work' or 'push to team'
> - I handle everything else."

---

## 2. Daily Operations | 日常操作

### 2.1 Entering the Workspace | 進入工作區

Run silently every time:
```bash
cd <clone_path>/<my_submodule_folder>
git fetch origin
branch=$(git branch --show-current)
```

- Empty branch (detached HEAD) → auto-fix: `git checkout <my_submodule_branch>`
- Behind remote → `git pull`, tell designer: "I've pulled in the latest changes."
- Uncommitted changes → ask: "You have unsaved changes from last time. Save them now?"
- Clean → "Your workspace is ready."

### 2.2 Commit + Push (Dual Commit) | 提交 + 推送（雙重提交）

**Trigger**: "commit", "push", "save", "upload", "share", "done", "send it"

**Always clarify scope first | 先確認範圍：**

> "Do you want to:
> 1. **Save to your personal repo only** — backed up, team won't see it yet
> 2. **Save and share with the team** — backed up AND team repo updated"

Shortcut rules (skip asking):
- "save my work" / "back it up" → Personal only (Phase A)
- "push to team" / "share with everyone" → Both (Phase A + B)
- Ambiguous ("push it" / "save") → always ask

**Phase A — Submodule commit (personal repo) | 個人 repo 提交**
```bash
cd <clone_path>/<my_submodule_folder>
git checkout <my_submodule_branch>
git status                              # No changes → stop
git diff --stat                         # Show summary to designer
git add <specific files>                # NEVER git add .
git commit -m "feat: <description>"
git push origin <my_submodule_branch>
```

**Phase B — Parent repo pointer update (team) | 團隊 repo 指標更新**
```bash
cd <clone_path>
git add <my_submodule_folder>
git commit -m "chore: update <my_submodule_folder> submodule pointer"
git push origin <parent_branch>
```

Report:
- Phase A only: "Saved to your personal repo. Tell me when you're ready to share with the team."
- Phase A + B: "Saved and shared! The team can see your latest version now."

If Phase B fails → diagnose + fix (usually `git pull --rebase` first). Never leave incomplete.

### 2.3 Pull / Sync | 拉取 / 同步

**Trigger**: "pull", "sync", "update", "get latest"

```bash
cd <clone_path>
git pull origin <parent_branch>
git submodule update --remote <my_submodule_folder>
cd <my_submodule_folder>
git checkout <my_submodule_branch>     # CRITICAL: fix detached HEAD
git status
```

If conflicts → don't resolve silently. Show each conflict, let designer decide.

### 2.4 View History | 查看歷史

**Trigger**: "what changed", "history", "who edited this"

```bash
cd <clone_path>/<my_submodule_folder>
git log --oneline --format="%h %ad %an: %s" --date=short -10
```

Translate to plain language:
> "Recent changes: Apr 13 — You updated the wireframe, Apr 12 — You added reference images"

### 2.5 Undo / Revert | 復原

**Trigger**: "undo", "revert", "go back", "restore"

Ask first:
> "1. Undo unsaved edits — restore to last saved version
> 2. Go back to a previous save — pick from history"

- Option 1: `git checkout -- <file>` (confirm files first)
- Option 2: show history, let them pick, `git checkout <commit> -- <file>`

### 2.6 Branch Workflow | 分支工作流

**Trigger**: "I want to try something new without breaking my current work", "make a branch", "experiment", "work on a separate version"

Designers can use branches in their submodule repo just like any normal repo. Claude Code handles all the details.

Designer 可以在自己的 submodule repo 裡使用 branch，跟一般 repo 一樣。Claude Code 會處理所有細節。

**Create a branch | 建立分支：**
```bash
cd <clone_path>/<my_submodule_folder>
git checkout <my_submodule_branch>           # Start from main
git checkout -b <branch_name>                # Create and switch to new branch
```

Tell designer:
> "I've created a separate workspace called `<branch_name>`. You can experiment freely here — your main work is safe."

**Work on the branch | 在分支上工作：**
Normal commit/push flow (Phase A only, to the branch):
```bash
git add <files>
git commit -m "feat: <description>"
git push origin <branch_name>
```

> Note: Do NOT run Phase B while on a feature branch. The parent repo pointer should only track `main`.
>
> 注意：在 feature branch 上不要執行 Phase B。Parent repo 的指標只追蹤 `main`。

**Merge back to main | 合併回 main：**

When designer says "merge it", "I'm happy with this", "put it back in main", "done with this branch":

```bash
cd <clone_path>/<my_submodule_folder>
git checkout <my_submodule_branch>           # Switch back to main
git merge <branch_name>                       # Merge the branch
git push origin <my_submodule_branch>         # Push merged main
```

If merge conflicts → show each conflict, let designer decide which version to keep.

**After merge → Phase B is required! | 合併後必須執行 Phase B！**

After any merge to `main`, the parent repo pointer is outdated. Always run Phase B:

```bash
cd <clone_path>
git add <my_submodule_folder>
git commit -m "chore: update <my_submodule_folder> submodule pointer"
git push origin <parent_branch>
```

> **Key rule**: Any time `main` moves forward — whether by direct commit OR merge — the team repo pointer needs Phase B to update. Without it, the team still sees the old version.
>
> **關鍵規則**：不管是直接 commit 還是 merge，只要 `main` 往前走了，團隊 repo 的指標都需要 Phase B 來更新。沒做的話，團隊看到的還是舊版。

Tell designer after merge + Phase B:
> "Your changes from `<branch_name>` are now merged into your main workspace and shared with the team."

**Clean up (optional) | 清理（選用）：**
```bash
git branch -d <branch_name>                  # Delete local branch
git push origin --delete <branch_name>        # Delete remote branch
```

**Conversation patterns for branches | 分支相關的對話模式：**

| Designer says | Action |
|---------------|--------|
| "I want to try something" / "make a branch" | Create branch from main |
| "switch back to main" / "go back to my main work" | `git checkout <my_submodule_branch>` |
| "which branch am I on" | `git branch --show-current` and report |
| "merge it" / "I'm done with this branch" | Merge to main + Phase B |
| "delete this branch" / "clean up" | Delete branch after confirming it's merged |
| "push this branch" | Phase A only to the branch (NOT Phase B) |

### 2.7 Check Sync Status | 檢查同步狀態

**Trigger**: "status", "am I up to date", "is everything synced", "check sync"

Run these checks and report results in plain language:

```bash
# 1. Check submodule for unpushed commits | 檢查個人 repo 未推送的 commit
cd <clone_path>/<my_submodule_folder>
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/<my_submodule_branch>)
UNPUSHED=$(git log origin/<my_submodule_branch>..HEAD --oneline)

# 2. Check parent repo pointer vs submodule HEAD | 檢查團隊指標是否過期
cd <clone_path>
POINTER=$(git ls-tree HEAD <my_submodule_folder> | awk '{print $3}')
SUB_HEAD=$(git -C <my_submodule_folder> rev-parse HEAD)
# If POINTER ≠ SUB_HEAD → Phase B is needed

# 3. Check if parent repo has newer changes | 檢查團隊 repo 是否有更新
git fetch origin
PARENT_BEHIND=$(git log HEAD..origin/<parent_branch> --oneline)
```

Report to designer:

| Condition | Message |
|-----------|---------|
| Unpushed commits in submodule | "You have unsaved changes. Want me to push them?" |
| POINTER ≠ SUB_HEAD | "Your personal repo is updated, but the team hasn't been notified yet. Want me to push to team? (Phase B)" |
| Parent behind remote | "The team repo has newer changes. Want me to sync?" |
| All match | "Everything is in sync! Your work matches what the team sees." |

全部同步時告訴設計師：「全部同步了！團隊看到的是你的最新版本。」

---

## 3. Error Handling & Auto-Recovery | 錯誤處理

Fix silently when possible. Explain simply when input needed.

| # | Error | Detect | Auto-fix |
|---|-------|--------|----------|
| 3.1 | **Detached HEAD** | `git branch --show-current` returns empty | `git checkout <branch>`. If commits exist on detached: `git branch temp-save && git checkout <branch> && git merge temp-save && git branch -d temp-save` |
| 3.2 | **Empty submodule folder** | Folder exists but no files | `git submodule update --init --recursive` then `git checkout <branch>` |
| 3.3 | **Incomplete dual commit** | Parent `git status` shows submodule "new commits" | `git add <folder> && git commit && git push` in parent |
| 3.4 | **Push rejected** | "rejected" or "non-fast-forward" | `git pull --rebase origin <branch>` then retry push. If conflict → guide designer |
| 3.5 | **SAML SSO failure** | 403, "SAML enforcement" | Cannot auto-fix. Guide: "Open `https://github.com/orgs/<org>/sso` in browser" |
| 3.6 | **SSH auth error** | "Permission denied (publickey)" | Check `ssh -T git@github.com`, `ssh-add -l`. Guide key setup if needed |
| 3.7 | **Git LFS missing** | "git-lfs: command not found" | `brew install git-lfs && git lfs install && git lfs pull` |

---

## 4. Pre-flight Checks | 操作前安全檢查

Run **before every git operation**, silently:

```bash
# 1. GitHub identity | 帳號身份
gh auth status                          # Must match config github_account

# 2. Parent repo accessible | Repo 存在
git -C <clone_path> rev-parse --show-toplevel

# 3. Submodule initialized | Submodule 已初始化
git -C <clone_path> submodule status <my_submodule_folder>
# '-' prefix → run submodule update --init
# '+' prefix → check if Phase B is needed

# 4. Submodule branch | 確認 branch
git -C <clone_path>/<my_submodule_folder> branch --show-current
# Empty → detached HEAD, auto-fix

# 5. Stale locks | 過期的鎖定檔
ls <clone_path>/.git/index.lock 2>/dev/null
# Exists and >5 min old → remove
```

Fix any issues before proceeding. Designer should never see intermediate failures.

---

## 5. Conversation Patterns | 對話模式對照

| Designer says | Action |
|---------------|--------|
| "first time" / "set up" / "how do I start" | Onboarding (Section 1) |
| "commit" / "push" / "save" / "done" | Ask scope: personal or team? (2.2) |
| "push to team" / "share with team" | Phase A + B directly (2.2) |
| "save to my repo" / "back it up" | Phase A only (2.2) |
| "pull" / "sync" / "update" / "get latest" | Pull (2.3) |
| "history" / "what changed" / "who edited this" | View history (2.4) |
| "undo" / "revert" / "go back" | Undo flow (2.5) |
| "files are gone" / "folder is empty" | Check submodule init (3.2) |
| "error" / "failed" / "something's wrong" | Diagnose (Section 3) |
| "whose folder is this" | Read .gitmodules, explain |
| "can I edit someone else's folder" | Warn: that's another person's workspace |
| "status" / "am I up to date" | Run pre-flight checks (Section 4) |

---

## 6. Prohibited Actions | 禁止事項

Claude Code must **NEVER** do these, even if asked:

1. **`git push --force`** — overwrites others' work | 會覆蓋別人的修改
2. **Delete `.gitmodules`** — breaks all submodule links | 破壞所有 submodule 關聯
3. **Commit on detached HEAD then checkout** — loses commits (branch-save first) | 會丟失 commit
4. **Edit another designer's submodule** — warn it's someone else's workspace | 那是別人的工作區
5. **`git add .` from parent level** — breaks submodule structure | 破壞 submodule 結構
6. **Commit `.env` / credentials / API keys** — review staged files first | 檢查敏感檔案
7. **`git clean -fd` / `git reset --hard`** without confirmation — destroys uncommitted work | 會刪除未提交的工作
8. **Modify parent repo files outside designer's submodule** — scope is their workspace only | 只能改自己的資料夾

---

## 7. Maintainer Guide | 維護者指南

### Adding a New Designer | 新增設計師

```bash
# 1. Create designer's repo | 建立設計師的 repo
gh repo create <org>/<designer-repo-name> --private

# 2. Add as submodule | 加為 submodule
cd <parent-repo>
git submodule add <designer-repo-url> <designer-folder-name>
git commit -m "chore: add <designer-name> submodule workspace"
git push origin master
```

3. Share the `designer-claude-snippet.md` with the designer (append to their `~/.claude/CLAUDE.md`)
4. Verify permissions: submodule repo (read+write), parent repo (read+write), enterprise SSO (SSH + gh CLI)

### Checking Sync Status | 檢查同步狀態

```bash
git submodule status                                    # All submodules
git submodule update --remote <folder>                  # Update specific one
git add <folder> && git commit -m "chore: update pointer" && git push
```

### Common Config Mistakes | 常見設定錯誤

| Symptom | Cause | Fix |
|---------|-------|-----|
| Clone 404 | `parent_repo_url` points to designer's own repo | Correct URL |
| Push to parent fails | `parent_branch` wrong (`main` vs `master`) | Check `git remote show origin` |
| Empty submodule after clone | `my_submodule_folder` misspelled | Compare with `.gitmodules` |
| SSO errors for some ops | SSH authorized but gh CLI isn't (or vice versa) | Authorize both at org SSO page |
