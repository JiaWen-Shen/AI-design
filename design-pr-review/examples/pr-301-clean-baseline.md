# design-pr-review skill — walkthrough on PR #301

> **Audience**: design team meeting reviewers. Reading this gives you a tour of every stage the skill goes through, the actual commands it runs, and what the designer sees / decides at each point.

**PR under test**: [hie-rei #301 — feat(concept-mei): add forYou.html pinned-chat view for Heather](https://github.com/trendlife-general/hie-rei/pull/301)
**Author**: mei-hung_tmemu
**Diff**: +585 −0 across 1 file (new file: `REI/concept/concept-mei/forYou.html`)
**State**: open, not draft, no DO NOT MERGE prefix
**Skill workspace**: `/tmp/design-review-301/`

---

## Why this PR is a good demo case

- ✅ Single design surface file — easy to reason about
- ✅ Substantial size (585 LOC) — exercises the catalog scanner
- ✅ Real, open PR — not a contrived example
- ✅ Comes back **clean** — shows what the skill says when there's nothing to flag (the common case, and the one designers see most often)

A separate demo with a violating PR (e.g. PR #320 cdlp-android had 189 findings) can be shown if the team wants to see the flagging mode in action.

---

## Stage 0 — Scope tier classification (mechanical)

**Command run by the skill**:
```bash
bash scripts/scope-tier.sh --pr 301 --repo trendlife-general/hie-rei
```

**Output (real, just captured)**:
```json
{
  "pr": 301,
  "repo": "trendlife-general/hie-rei",
  "tier": "multi-screen",
  "workspace": "/tmp/design-review-301",
  "design_surface": 1,
  "loc": 591,
  "counts": { "html": 1, "md": 0, "css": 0, "img": 0, "other": 0 },
  "is_draft": false,
  "do_not_merge": false,
  "out_of_scope_count": 0,
  "out_of_scope_paths": [],
  "scratchpad_path": "/tmp/design-review-301/output/pr-301-scratch.md",
  "scratchpad_exists": false
}
[SCRIPT: scope-tier]
event: scope_complete
decision: pass
reason: tier=multi-screen, design_surface=1 files, loc=591
action: Proceed to Stage 0.5
```

**Branch decision (per SKILL.md)**:
- `tier == "infra-mixed"` → would abort (would have told designer "this touches hooks / workflows, escalate to RD"). **Not the case.**
- `tier == "no-design-surface"` → would abort. **Not the case** — 1 HTML file present.
- `scratchpad_exists == true` → would prompt "resume or restart?". **No prior scratchpad.**
- Otherwise → **proceed to Stage 0.5.** ← this branch

**Why "multi-screen" instead of "single-screen"?**
- `single-screen` rule: ≤ 1 HTML AND < 100 LOC. Here HTML=1 but LOC=591 (≥ 100), so falls into `multi-screen`. Tier name slightly misleading for a 1-file PR; it just signals "non-trivial change".

---

## Stage 0.5 — Deterministic pre-checks (mechanical, before any LLM)

### 0.5a — fetch-pr (materialise before/after)

**Command**:
```bash
bash scripts/fetch-pr.sh --pr 301 --repo trendlife-general/hie-rei
```

**What it does**: writes pre/post PR copies of every design-surface file to `/tmp/design-review-301/{before,after}/`. Sets up the substrate for visual diff and violation scanning.

**Result**: 1 file fetched. `before/` is empty (file is new in PR), `after/` contains the full PR state.

### 0.5b — auto-detect-violations (catalog scan)

**Command**:
```bash
bash scripts/auto-detect-violations.sh --pr 301 > /tmp/design-review-301/violations.json
```

**What it scans** (per SKILL.md):
- `hex-hardcoded` — color values like `#FF3B42` not mapped to TLDS tokens
- `non-token-spacing` — `padding: 17px` not from spacing scale
- `non-token-type` — font-size / line-height outside type tokens
- `inline-style` — `<div style="...">` attributes (the repo's CSS conventions ban these)
- `md-class-orphan` — Markdown referencing CSS classes that don't exist in repo CSS
- `conflict-marker` — leftover `<<<<<<< HEAD` from incomplete merge

**Result**:
```
[SCRIPT: auto-detect-violations]
event: scan_complete
status: clean
decision: pass
reason: 0 findings (0 conflict-marker, rest catalog rules)
action: Findings feed into Stage 3d per-cluster enumeration
```

**0 violations.** This PR is exceptionally clean by the catalog's standards. _(For demo contrast: PR #320 cdlp-android scanned 189 findings.)_

### What the designer is told so far

> Nothing yet. Stages 0 / 0.5 are silent pre-passes — the designer doesn't see them. Findings (if any) only surface in Stage 1.2 (conflict-markers, blocking) or Stage 3d (per-cluster offers).

---

## Stage 1 — Fetch & scope summary

**What the skill says to the designer**:

> 這個 PR「feat(concept-mei): add forYou.html pinned-chat view for Heather」改動了 1 個畫面，是多畫面改動級別的改動。
> 我先掃了一輪，**沒找到要 flag 的地方**。
> 要先開始走畫面嗎？

**Designer answers**: "好" / "yes" / nods.

---

## Stage 1.1 — PR state expectations

**Branch logic**:
- `is_draft == false` and `do_not_merge == false` → **skip this stage silently.** No banner shown.

For this PR, nothing happens here. _(If the PR had been draft, the skill would explicitly tell the designer the tone is "early feedback" not "final sign-off".)_

---

## Stage 1.2 — Early-surface conflict markers

```bash
jq '[.[] | select(.type == "conflict-marker")]' /tmp/design-review-301/violations.json
# → []
```

**0 conflict markers** → **skipped.** Proceed to Stage 1.5.

---

## Stage 1.5 — Multi-author conflict scan (mechanical)

**Command**:
```bash
bash scripts/scan-conflicts.sh --pr 301 --repo trendlife-general/hie-rei
```

**Output**:
```json
{
  "authors": [{ "login": "mei-hung_tmemu", "name": "mei-hung_tmemu", "commit_count": 1 }],
  "multi_author_files": [],
  "repeat_touch_files": []
}
```

Single author, single commit, no conflict files → **silent pass.**

---

## Stage 2 — Cluster planning

The skill groups files into review **clusters** so the designer reviews related changes together. With 1 file, **the plan is trivially 1 cluster of 1 file**: `cluster-1 = ["REI/concept/concept-mei/forYou.html"]`.

For larger PRs (e.g. 12 HTML files) clustering matters — files modifying the same screen / flow / token would be grouped. Here, just one entry to walk.

---

## Stage 3 — Cluster walkthrough (per cluster)

Only one cluster, so we walk it once.

### 3a — Open the before / after compare

**Commands**:
```bash
node scripts/compute-html-diff.js \
  --workspace /tmp/design-review-301 \
  --file "REI/concept/concept-mei/forYou.html"

# (skill then generates a side-by-side compare wrapper in /tmp/design-review-301/compare/
#  and starts a local preview server on serve-compare.sh)
```

**`compute-html-diff.js` writes** `/tmp/design-review-301/html-diff.json` — structured diff (added blocks, removed blocks, modified blocks) the skill uses for the next steps.

**What the designer sees**: a browser tab opens with **before (empty / 404) | after (full forYou.html)** side-by-side at iPhone width. For a brand-new file, "before" is just a placeholder telling them this file is new.

### 3b — Scan visuals

The skill walks the designer through the visible changes:

> 這個畫面是 Heather 用的個人 chat view 範本：
> - 上方有完整的 status bar + app header（含 hamburger / family graph button）
> - 兩則 AI 訊息 (daily context / weekly brief)，用 blockquote 樣式呈現
> - 三個 action icons (複製 / 讚 / 倒讚)
> - 下方 input bar (+ 加號 + send 按鈕)

### 3c — PR description + spec context

The skill surfaces the PR body for the designer:

> 作者 Mei 的 PR 說明：
> - 來源：design-handoff/views/chat-familyKaleida/chat-familyKaleida.html 的精簡版
> - CSS inline (只留 chat view 用到的，~424 行；原 kaleida-main.css 是 2159 行)
> - 修正 action 圖示：原版用實心填色 SVG (複製/讚/倒讚 都是黑塊)，改為正確 outline stroke 寫法
>
> 為什麼要獨立一份：Heather 想把文字配上 pinned chat 設計試看看，直接在 design-handoff 改文字會污染 hie 的 handoff 來源；放在 concept-mei/ 作個人實驗空間是安全隔離。

### 3d — Enumerate flag candidates (per cluster)

```bash
jq '[.[] | select(.cluster == "cluster-1")]' /tmp/design-review-301/violations.json
# → []
```

**0 findings for this cluster.** Skill tells the designer:

> 這個 cluster 沒有 mechanical findings — TLDS token / spacing / inline-style 都沒事。
> 你看完視覺有想留 comment 的嗎？

**Designer options** (mental rubric the skill prompts through):
- 設計面意見（layout、hierarchy、micro-copy）
- 跟其他畫面的一致性
- 動效 / interaction 細節
- nothing — looks good

### Catch — inline `<style>` block in this file

> ⚠️ **Worth noting for the meeting**: PR description says "CSS inline (只留 chat view 用到的，~424 行)". Hie-rei's CLAUDE.md rule is "Never inline CSS in `<style>` blocks. Extract all styles into a dedicated file under `REI/src/` named `kaleidoscope-<feature>.css`".
>
> The catalog scanner's `inline-style` rule flags `style="..."` **attributes**, not `<style>` **blocks**. The block in forYou.html doesn't trigger the rule, but a strict reviewer might still raise the CLAUDE.md convention.
>
> This is a real edge case worth discussing with the team: should the scanner extend to flag `<style>` blocks too? Currently it doesn't.

---

## Stage 4 — Draft comments

For this clean PR, the skill's draft is short:

> **Draft comment for PR #301** (skill prepares; designer approves before posting):
>
> ✨ 看完了，整體乾淨。
>
> - mechanical scan 0 violations (TLDS tokens / spacing / inline-style attribute 都過)
> - 視覺對齊 chat-familyKaleida.html 來源，blockquote 樣式正確
> - action icons 改 outline stroke 是對的
>
> 一個 open question：repo CLAUDE.md 規範是 CSS 要抽到 `REI/src/kaleidoscope-<feature>.css`，這份用了 inline `<style>` block (~424 行)。考慮到這是 Heather 文字實驗用的拋棄式範本，是不是就保留 inline 比較方便她改？還是抽出來 reuse 更好？(這個是討論不是 blocker)

**The skill never auto-posts.** Designer reads, edits, says "OK 發出去" — then the skill hands off to `sd0x-dev-flow:pr-comment` to post.

---

## Stage 5 — Hand off to pr-comment skill

```bash
# After designer approves, skill invokes:
/sd0x-dev-flow:pr-comment 301 "<approved draft>"
```

`pr-comment` handles the actual `gh pr comment` API call. design-pr-review **never touches GitHub directly** — separation of concerns: this skill drafts, that skill posts. Designer always sees what's about to be posted.

---

## Summary — what to highlight in the meeting

| Property | What to point out |
|---|---|
| **Mechanical-first, LLM-second** | Stage 0 + 0.5 are pure shell scripts. The skill spends LLM tokens only on things scripts can't decide (Stage 3b/c/d/4). |
| **Skill assists, designer decides** | At every Q the designer has a choice. The skill never approves / blocks / auto-posts. |
| **Severity tags** | The flagging vocabulary distinguishes 🔴 Important (block-worthy) / 🟡 Worth flagging / 🟢 Worth noting / Nit. Designer chooses what to push back on. |
| **Clean PRs end fast** | This PR completes in ~5 minutes because catalog said "clean". Designer skips straight to visual review. |
| **Conflict markers are blocking** | If the catalog finds `<<<<<<< HEAD` left in a file, the skill surfaces immediately (before any walkthrough) and offers 3 paths (auto-resolve / abort / continue with comment). |
| **Out-of-scope detection** | If PR touches `.claude/hooks/` or `.github/workflows/`, skill aborts at Stage 0 and tells designer "not a design PR, escalate to RD". |

---

## What's in the workspace after this run

```
/tmp/design-review-301/
├── after/                          # full repo at PR head
├── before/                         # empty (file is new)
├── pr-meta.json                    # PR metadata cached for skill
├── violations.json                 # [] (clean)
├── html-diff.json                  # structured diff for cluster walkthrough
└── output/
    └── pr-301-scratch.md           # designer's review notes (would accumulate across stages)
```

Everything is in `/tmp/` (per workspace convention) — safe to delete to re-run.

---

## How to live-demo in meeting

If you want to **actually invoke the skill** in front of the team (vs reading this walkthrough):

```bash
cd ~/Jottacloud/vibe/hie-rei
claude    # opens Claude Code in hie-rei working dir where skill is registered
# then say:
"design PR review 301"
# or:
"幫我 review PR #301"
```

The skill walks you through stage by stage, you answer questions as the designer, and at the end you get a draft comment.

For backup, this markdown is the authoritative walk — same stages, same commands, captured output.
