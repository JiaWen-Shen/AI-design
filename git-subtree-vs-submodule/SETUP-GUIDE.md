# Designer Setup Guide | 設計師設定指南

> Add the submodule workflow to your Claude Code so it can handle git for you automatically.
>
> 把 submodule 工作流加入你的 Claude Code，讓它自動幫你處理 git 操作。

---

## What you'll set up | 你會設定什麼

1. A small snippet (~50 lines) appended to your Claude Code settings
2. The full operation guide is already in the team repo — Claude Code reads it automatically

1. 一小段設定（約 50 行）加到你的 Claude Code 設定檔
2. 完整操作指南已經在團隊 repo 裡 — Claude Code 會自動讀取

---

## Option A: Let Claude Code do it (Recommended) | 讓 Claude Code 幫你做（推薦）

Open Claude Code and paste this:

打開 Claude Code，貼上這段：

```
Please help me set up the designer submodule workflow:

1. Download:
   https://raw.githubusercontent.com/karen-shen_tmemu/cross_team_test_submodule/main/git-subtree-vs-submodule/designer-claude-snippet.md

2. Read the file and extract the content AFTER the first "---" separator line.

3. APPEND that content to my ~/.claude/CLAUDE.md
   - If the file exists: add a blank line + "---" + blank line, then append
   - If it doesn't exist: create it with just that content

4. After adding, start the onboarding flow — the snippet has instructions.
```

That's it! Claude Code will handle the rest.

這樣就好了！Claude Code 會處理剩下的。

---

## Option B: Manual setup | 手動設定

**Step 1**: Download the snippet | 下載設定片段

```bash
curl -o /tmp/designer-snippet.md \
  "https://raw.githubusercontent.com/karen-shen_tmemu/cross_team_test_submodule/main/git-subtree-vs-submodule/designer-claude-snippet.md"
```

**Step 2**: Extract the content after the `---` separator (skip the instructions header)

```bash
sed -n '/^---$/,$ p' /tmp/designer-snippet.md | tail -n +2 > /tmp/snippet-content.md
```

**Step 3**: Append to your CLAUDE.md

```bash
# Create ~/.claude/ if it doesn't exist
mkdir -p ~/.claude

# If CLAUDE.md already exists — append with separator
if [ -f ~/.claude/CLAUDE.md ]; then
  echo "" >> ~/.claude/CLAUDE.md
  echo "---" >> ~/.claude/CLAUDE.md
  echo "" >> ~/.claude/CLAUDE.md
  cat /tmp/snippet-content.md >> ~/.claude/CLAUDE.md
else
  # If it doesn't exist — create it
  cp /tmp/snippet-content.md ~/.claude/CLAUDE.md
fi
```

> ⚠️ Use `>>` (append), NOT `>` (overwrite)! | 用 `>>`（附加），不是 `>`（覆蓋）！

**Step 4**: Open Claude Code and say:

```
I just added the designer submodule workflow to my CLAUDE.md.
Help me set it up — I'm a first-time user.
```

---

## How it works | 運作方式

```
~/.claude/CLAUDE.md (your settings)
  └── Contains: Config block + reference to guide
        │
        ▼  Claude Code reads the reference
<clone_path>/git-operation-guide.md (in team repo)
  └── Contains: Full onboarding, daily ops, error handling, safety rules
```

- The **snippet** in your CLAUDE.md is small (~50 lines) and tells Claude Code your config + where to find the full guide
- The **guide** lives in the team repo — when maintainers update it, you get the latest version next time you pull
- Your existing CLAUDE.md settings are **not affected** — the snippet is appended at the end

- CLAUDE.md 裡的**設定片段**很小（約 50 行），告訴 Claude Code 你的設定 + 去哪找完整指南
- **指南**在團隊 repo 裡 — maintainer 更新後，你下次 pull 就會拿到最新版
- 你原本的 CLAUDE.md 設定**不受影響** — 片段加在最後面

---

## Troubleshooting | 疑難排解

| Problem | Solution |
|---------|----------|
| "I accidentally overwrote my CLAUDE.md" | Re-create your original settings, then re-append the snippet |
| 「不小心覆蓋了 CLAUDE.md」 | 重建原本的設定，再重新附加片段 |
| "Claude Code doesn't follow the rules" | Verify content is in `~/.claude/CLAUDE.md`: `cat ~/.claude/CLAUDE.md` |
| 「Claude Code 沒照規則做」 | 確認內容在 `~/.claude/CLAUDE.md`：`cat ~/.claude/CLAUDE.md` |
| "The guide file is missing" | Make sure you've cloned the team repo with `--recurse-submodules`, then check `<clone_path>/git-operation-guide.md` |
| 「找不到指南檔案」 | 確認已用 `--recurse-submodules` clone 團隊 repo，檢查 `<clone_path>/git-operation-guide.md` |
| "Don't know the repo URL" | Ask your team lead or Karen (karen-shen_tmemu) |
| 「不知道 repo 網址」 | 問你的 team lead 或 Karen (karen-shen_tmemu) |

---

## Questions? | 有問題？

Contact Karen (karen-shen_tmemu) or open an issue in the team repo.

聯絡 Karen (karen-shen_tmemu) 或在團隊 repo 開 issue。
