# Designer Setup Guide: Add Submodule Workflow to Your Claude Code

# 設計師設定指南：將 Submodule 工作流加入你的 Claude Code

---

## What is this? | 這是什麼？

`sample_claude.md` contains workflow rules that teach Claude Code how to handle git submodule operations for you automatically. Once added, you just say "save my work" or "push to team" — Claude Code handles all the git complexity.

`sample_claude.md` 包含了一組工作流規則，讓 Claude Code 自動處理所有 git submodule 操作。加入之後，你只要說「幫我存檔」或「推到團隊 repo」，Claude Code 就會自動搞定。

---

## Setup Steps | 設定步驟

### Option A: Let Claude Code do it for you (Recommended) | 讓 Claude Code 幫你做（推薦）

Open Claude Code and paste this message:

打開 Claude Code，貼上這段：

```
Please help me set up the designer submodule workflow.

1. Download the file from:
   https://raw.githubusercontent.com/karen-shen_tmemu/cross_team_test_submodule/main/git-subtree-vs-submodule/sample_claude.md

2. APPEND (do not overwrite) the content to my global CLAUDE.md at:
   ~/.claude/CLAUDE.md

3. If ~/.claude/CLAUDE.md already exists, add a separator line then append.
   If it doesn't exist, create it with the content.

4. After adding, walk me through the onboarding flow in the file.
```

That's it! Claude Code will handle the rest and guide you through the first-time setup.

這樣就好了！Claude Code 會處理剩下的步驟，並帶你完成首次設定。

---

### Option B: Do it yourself in Terminal | 自己在 Terminal 操作

**Step 1**: Download the file | 下載檔案

```bash
curl -o /tmp/sample_claude.md \
  "https://raw.githubusercontent.com/karen-shen_tmemu/cross_team_test_submodule/main/git-subtree-vs-submodule/sample_claude.md"
```

**Step 2**: Check if you already have a global CLAUDE.md | 確認是否已有 CLAUDE.md

```bash
ls ~/.claude/CLAUDE.md
```

**Step 3a**: If the file does NOT exist — create it | 如果不存在 — 直接建立

```bash
mkdir -p ~/.claude
cp /tmp/sample_claude.md ~/.claude/CLAUDE.md
```

**Step 3b**: If the file ALREADY exists — append to it | 如果已存在 — 附加到後面

```bash
echo "" >> ~/.claude/CLAUDE.md
echo "---" >> ~/.claude/CLAUDE.md
echo "" >> ~/.claude/CLAUDE.md
cat /tmp/sample_claude.md >> ~/.claude/CLAUDE.md
```

> ⚠️ **Important**: Use `>>` (append), NOT `>` (overwrite). Using `>` will erase your existing settings!
>
> ⚠️ **注意**：用 `>>`（附加），不是 `>`（覆蓋）。用錯會把你原本的設定清掉！

**Step 4**: Open Claude Code and say | 打開 Claude Code 說

```
I just added the designer submodule workflow to my CLAUDE.md. 
Help me set it up — I'm a first-time user.
```

Claude Code will read the new rules and start the onboarding flow.

Claude Code 會讀取新規則並開始引導你完成設定。

---

## What happens next? | 接下來會發生什麼？

Claude Code will ask you a few questions:

Claude Code 會問你幾個問題：

1. **Your name and GitHub account** | 你的名字和 GitHub 帳號
2. **Which team repo to join** | 要加入哪個團隊 repo
3. **Where to save it on your computer** | 要存在電腦的哪個位置
4. **Which folder is yours** | 哪個資料夾是你負責的

After that, your daily workflow is simply:

設定完成後，你每天的工作就是：

- Edit files in your workspace as usual | 照常在你的工作區編輯檔案
- Tell Claude Code "save my work" or "push to team" | 跟 Claude Code 說「幫我存檔」或「推到團隊」
- Done! | 搞定！

---

## Troubleshooting | 疑難排解

| Problem / 問題 | Solution / 解法 |
|---|---|
| "I accidentally overwrote my CLAUDE.md" | Check if you have a backup: `ls ~/.claude/CLAUDE.md.bak`. If not, you'll need to recreate your settings and re-append the workflow file. |
| 「我不小心覆蓋了 CLAUDE.md」 | 檢查有沒有備份：`ls ~/.claude/CLAUDE.md.bak`。如果沒有，需要重建設定並重新附加工作流檔案。 |
| "Claude Code doesn't seem to follow the rules" | Make sure the content is in `~/.claude/CLAUDE.md` (global), not in a project-level CLAUDE.md. Run `cat ~/.claude/CLAUDE.md` to verify. |
| 「Claude Code 好像沒有照規則做」 | 確認內容在 `~/.claude/CLAUDE.md`（全域），不是在專案層級的 CLAUDE.md。執行 `cat ~/.claude/CLAUDE.md` 確認。 |
| "The onboarding asks for a repo URL I don't know" | Ask your team lead or maintainer (Karen) for the correct URL. |
| 「設定問我 repo 網址但我不知道」 | 問你的 team lead 或 maintainer（Karen）要正確的網址。 |

---

## Questions? | 有問題？

Contact Karen (karen-shen_tmemu) or open an issue in the team repo.

聯絡 Karen (karen-shen_tmemu) 或在團隊 repo 開 issue。
