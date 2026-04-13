# How to Set Up Claude Code for Your Team Repo

# 如何設定 Claude Code 來管理你的團隊 Repo

> Estimated time: 5 minutes | 預估時間：5 分鐘
>
> After setup, Claude Code will handle all git operations for you — you just focus on your design work.
>
> 設定完成後，Claude Code 會幫你處理所有 git 操作 — 你只需要專心做設計。

---

## Table of Contents | 目錄

1. [Before You Start | 開始前確認](#before-you-start--開始前確認)
2. [Which Method? | 用哪個方法？](#which-method--用哪個方法)
3. [Method 1: New Claude Code User | 新用戶](#method-1-new-claude-code-user--新用戶)
4. [Method 2: Existing Claude Code User | 既有用戶](#method-2-existing-claude-code-user--既有用戶)
5. [What Happens During Setup | 設定過程](#what-happens-during-setup--設定過程)
6. [After Setup: Daily Workflow Cheat Sheet | 日常工作速查](#after-setup-daily-workflow-cheat-sheet--日常工作速查)
7. [How to Check Sync Status | 如何檢查同步狀態](#how-to-check-sync-status--如何檢查同步狀態)
8. [Troubleshooting | 疑難排解](#troubleshooting--疑難排解)

---

## Before You Start | 開始前確認

- [ ] **Claude Code** installed (VS Code extension or CLI) | 已安裝 Claude Code
- [ ] **GitHub account** with access to the team repo | 有權限存取團隊 repo 的 GitHub 帳號
- [ ] **Git** installed — type `git --version` in terminal to check | 已安裝 git

---

## Which method? | 用哪個方法？

| | Method 1 | Method 2 |
|---|---|---|
| **For** | First-time Claude Code users | Existing Claude Code users |
| **適用** | 第一次使用 Claude Code 的人 | 已經在用 Claude Code 的人 |
| **~/.claude/CLAUDE.md** | Does NOT exist yet | Already has your settings |
| | 還沒有這個檔案 | 已經有你的設定在裡面 |
| **Action** | Create new file | APPEND to existing file |
| **動作** | 建立新檔案 | 附加到現有檔案（不覆蓋） |

> Not sure if you have a CLAUDE.md? Run this in terminal: `cat ~/.claude/CLAUDE.md`
> - Shows content → you're an **existing user**, use **Method 2**
> - Says "No such file" → you're a **new user**, use **Method 1**
>
> 不確定有沒有？在終端機執行：`cat ~/.claude/CLAUDE.md`
> - 有顯示內容 → **既有用戶**，用 **Method 2**
> - 顯示「No such file」→ **新用戶**，用 **Method 1**

---

## Method 1: New Claude Code User | 新用戶

You don't have a CLAUDE.md yet. We'll create one with the team workflow settings.

你還沒有 CLAUDE.md，我們會建立一個包含團隊工作流設定的新檔案。

### Copy-paste this into Claude Code: | 把這段貼進 Claude Code：

```
Help me set up the designer submodule workflow. I'm a new Claude Code user.

1. Create the folder if needed: mkdir -p ~/.claude

2. Download the snippet:
   https://raw.githubusercontent.com/karen-shen_tmemu/cross_team_test_submodule/main/designer-claude-snippet.md

3. Extract ONLY the content after the first "---" line (skip the instruction header above it).

4. Create a NEW file at ~/.claude/CLAUDE.md with that content.
   (I don't have an existing CLAUDE.md, so creating fresh is safe.)

5. Show me what was created so I can confirm.

6. Then start the onboarding flow — the snippet will tell you how.
```

### Or do it manually: | 或手動操作：

```bash
mkdir -p ~/.claude
curl -sL "https://raw.githubusercontent.com/karen-shen_tmemu/cross_team_test_submodule/main/designer-claude-snippet.md" -o /tmp/snippet.md
sed -n '/^---$/,$ p' /tmp/snippet.md | tail -n +2 > ~/.claude/CLAUDE.md
echo "Done! 完成！"
```

Then open Claude Code and say: | 然後打開 Claude Code 說：
```
I just set up the designer submodule workflow. Help me get started — I'm a first-time user.
```

---

## Method 2: Existing Claude Code User | 既有用戶

You already have settings in CLAUDE.md. We'll **append** the team workflow settings at the end — your existing settings stay untouched.

你的 CLAUDE.md 裡已經有設定。我們會把團隊工作流設定**附加在最後面** — 你原本的設定不會被動到。

### Copy-paste this into Claude Code: | 把這段貼進 Claude Code：

```
Help me set up the designer submodule workflow. I already have an existing CLAUDE.md that I need to keep.

1. First, READ my current ~/.claude/CLAUDE.md so you know what's already there.

2. Download the snippet:
   https://raw.githubusercontent.com/karen-shen_tmemu/cross_team_test_submodule/main/designer-claude-snippet.md

3. Extract ONLY the content after the first "---" line (skip the instruction header above it).

4. APPEND to my existing ~/.claude/CLAUDE.md:
   - Add a blank line at the end
   - Add a "---" separator line
   - Add another blank line
   - Then append the snippet content
   - IMPORTANT: Do NOT delete, modify, or overwrite ANYTHING that's already in the file

5. Show me a before/after comparison so I can confirm nothing was lost.

6. Then start the onboarding flow — the snippet will tell you how.
```

### Or do it manually: | 或手動操作：

```bash
# Step 1: Backup your existing CLAUDE.md (just in case)
# 第一步：備份現有的 CLAUDE.md（以防萬一）
cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.bak

# Step 2: Download the snippet
# 第二步：下載設定片段
curl -sL "https://raw.githubusercontent.com/karen-shen_tmemu/cross_team_test_submodule/main/designer-claude-snippet.md" -o /tmp/snippet.md

# Step 3: Extract content after the --- line
# 第三步：擷取 --- 之後的內容
sed -n '/^---$/,$ p' /tmp/snippet.md | tail -n +2 > /tmp/snippet-content.md

# Step 4: Append with separator (DO NOT use > single arrow!)
# 第四步：附加到後面（不要用 > 單箭頭！）
printf '\n---\n\n' >> ~/.claude/CLAUDE.md
cat /tmp/snippet-content.md >> ~/.claude/CLAUDE.md

echo "Done! Your original settings are preserved. 完成！原本的設定都還在。"
```

> ⚠️ **`>>` = append (safe) | `>` = overwrite (dangerous!)**
>
> ⚠️ **`>>` = 附加（安全）| `>` = 覆蓋（危險！）**
>
> The manual steps include a backup (`CLAUDE.md.bak`). If anything goes wrong:
> `cp ~/.claude/CLAUDE.md.bak ~/.claude/CLAUDE.md`
>
> 手動步驟有建立備份。如果出問題：`cp ~/.claude/CLAUDE.md.bak ~/.claude/CLAUDE.md`

Then open Claude Code and say: | 然後打開 Claude Code 說：
```
I just added the designer submodule workflow to my CLAUDE.md.
Help me set it up — I'm a first-time user for this workflow.
```

---

## What Happens During Setup | 設定過程

Claude Code will ask you 4 simple questions: | Claude Code 會問你 4 個問題：

| # | Question | Example answer |
|---|----------|---------------|
| 1 | Your name and GitHub username | "Karen, karen-shen_tmemu" |
| 2 | Which team repo? | "TrendLife-UX-design-team" or a GitHub URL |
| 3 | Where is your working folder? | "~/Documents/" or "put it on my Desktop" |
| 4 | Which folder is yours? | "skills/uxr" or a GitHub URL to the folder |

After answering, Claude Code sets everything up automatically.

回答完後，Claude Code 會自動完成所有設定。

---

## After Setup: Daily Workflow Cheat Sheet | 日常工作速查

| What you want | What to say | 你想做什麼 | 怎麼說 |
|---|---|---|---|
| Save (personal backup) | "Save my work" | 存檔（個人備份） | 「幫我存檔」 |
| Share with team | "Push to team" | 分享給團隊 | 「推到團隊 repo」 |
| Get latest updates | "Sync" | 拿最新版 | 「同步一下」 |
| See what changed | "Show history" | 看修改紀錄 | 「之前改了什麼」 |
| Undo a mistake | "Undo" | 復原 | 「復原」 |

**No git commands to remember.** | **不需要記任何 git 指令。**

---

## How to Check Sync Status | 如何檢查同步狀態

Want to know if your work is up to date with the team? Just ask Claude Code:

想知道你的版本跟團隊是否同步？直接問 Claude Code：

| What you want | What to say |
|---|---|
| Check if everything is synced | "Am I up to date?" / "Check my status" |
| 檢查是否同步 | 「我是最新版嗎？」/「檢查同步狀態」 |

Claude Code will check these things for you:

| Check | What it means | 檢查項目 | 意思 |
|---|---|---|---|
| Your repo has unpushed changes | You saved locally but haven't shared yet | 有未推送的變更 | 本地有存檔但還沒分享 |
| Team repo pointer is outdated | You pushed to your repo but forgot Phase B | 團隊指標過期 | 你推了但忘了更新團隊 repo |
| Team repo has newer changes | Someone else updated — you should sync | 團隊有更新 | 其他人更新了，你該同步 |
| Everything is in sync | You're good! | 全部同步 | 沒問題！ |

> **Tip**: If Claude Code says "Phase B is needed", just say "push to team" and it will handle it.
>
> **提示**：如果 Claude Code 說「需要 Phase B」，只要說「推到團隊」它就會處理。

---

## Troubleshooting | 疑難排解

| Problem | Solution |
|---------|----------|
| Can't find `~/.claude/CLAUDE.md` | The `.claude` folder is hidden. Mac Finder: `Cmd+Shift+.` to show. Terminal: `ls -la ~/` |
| 找不到 `~/.claude/CLAUDE.md` | `.claude` 是隱藏資料夾。Mac Finder 按 `Cmd+Shift+.` 顯示。終端機：`ls -la ~/` |
| Accidentally overwrote CLAUDE.md | Restore backup: `cp ~/.claude/CLAUDE.md.bak ~/.claude/CLAUDE.md` |
| 不小心覆蓋了 | 還原備份：`cp ~/.claude/CLAUDE.md.bak ~/.claude/CLAUDE.md` |
| Claude Code ignores the workflow | Check: `cat ~/.claude/CLAUDE.md` — look for "Designer Submodule Workflow" |
| Claude Code 沒照工作流做 | 確認：`cat ~/.claude/CLAUDE.md` — 找 "Designer Submodule Workflow" |
| "guide file not found" | Make sure team repo was cloned with `--recurse-submodules`. Check: `ls <clone_path>/git-operation-guide.md` |
| 「找不到指南檔案」| 確認 team repo 用 `--recurse-submodules` clone。檢查：`ls <clone_path>/git-operation-guide.md` |
| Something broke | Just say: "Something's wrong, help me fix it" — Claude Code will auto-diagnose |
| 出問題了 | 直接說：「有問題，幫我修」— Claude Code 會自動診斷 |

---

## Questions? | 有問題？

Ask your team lead or contact Karen (karen-shen_tmemu).

問你的 team lead 或聯絡 Karen (karen-shen_tmemu)。
