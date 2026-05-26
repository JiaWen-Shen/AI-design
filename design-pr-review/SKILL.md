---
name: design-pr-review
description: "Walk a designer-reviewer through a GitHub PR that ships HTML mockups + MD specs. Mechanically scopes the PR, opens before/after side-by-side, flags potential design-system violations as questions (never decisions), drafts friendly comments, hands off to sd0x-dev-flow:pr-comment for posting. Triggers on 'review this design PR', '設計 PR review', '/design-pr-review', PR URLs in design repos."
---

# design-pr-review

Assist a designer-reviewer (not engineer) reviewing a design PR. Walks them through visual diff, structured rubric, multi-author conflict highlights, and drafts friendly comments. **Decisions stay with the designer.** Never block merge, never auto-post.

## When to Use

- Designer wants to review a PR whose changed files are mostly `*.html` + `*.md` + `*.css` + `*.svg`
- Invoked as `/design-pr-review <N>`, `/design-pr-review <PR-URL>`, or natural-language requests like 「幫我 review 這個 PR」, 「review this design PR」
- A PR URL appears in conversation and the repo is a known design repo (e.g. trendlife-general/hie-rei, trendlife-ui-mockup)

## When NOT to Use

| Need | Use Instead |
|------|-------------|
| Code review (engineer reviewing engineer's code) | `sd0x-dev-flow:codex-review-fast` or `sd0x-dev-flow:pr-review` |
| Just post a comment without walking the rubric | `sd0x-dev-flow:pr-comment` |
| Read existing review threads on a PR | `sd0x-dev-flow:load-pr-review` |
| PR status overview only | `sd0x-dev-flow:pr-summary` |

## Core Principle

**Skill assists; designer decides.** This skill mechanically scopes the PR and surfaces patterns, then asks the designer one question at a time. It never:

- Judges whether a design is "good"
- Adds a comment to the draft without explicit designer approval
- Posts anything to GitHub without an explicit "OK 發出去"
- Blocks merge or approves PR
- Uses git / engineering jargon with the designer (see `references/designer-comms.md`)

**Mechanical-first, LLM-second.** Any catalog-detectable issue (hex hardcoded, non-token spacing, inline style) is scanned by `scripts/auto-detect-violations.sh` before any LLM work. The LLM only weighs in on what can't be detected mechanically.

## Workflow

Two mechanical pre-passes (Stage 0, 0.5) feed into the 5-stage review. Each stage's commands and decisions are below.

### Stage 0 — Scope tier + idempotent resume (mechanical)

```bash
bash scripts/scope-tier.sh --pr <N> [--repo <owner/repo>]
```

Outputs JSON: `{ pr, repo, tier, design_surface, counts, loc, out_of_scope_count, out_of_scope_paths, scratchpad_path, scratchpad_exists }`.

Branch logic (evaluated in order — first match wins):
- `tier == "infra-mixed"` → **abort**, tell designer:
  > 「這個 PR 動到了不該由設計師改的檔案（hooks / workflows / 其他 skills）：
  >  [列 out_of_scope_paths]
  >  這類改動 blast radius 大，要請 RD review，不適合走 design PR review 流程。」
- `tier == "no-design-surface"` → abort, tell designer: 「這個 PR 沒有設計檔案（HTML/MD/CSS/SVG），不適用這個流程。」
- `scratchpad_exists == true` → AskUserQuestion: 「找到之前的 review 進度，要繼續還是重來？」
- Otherwise → proceed.

Tier table:
- `infra-mixed` — PR includes `.claude/hooks/`, `.github/workflows/`, or `.claude/skills/` paths. Wins over every design tier; flow aborts.
- `copy-only` — only MD changed
- `single-screen` — ≤ 1 HTML, < 100 LOC
- `multi-screen` — ≤ 5 HTML
- `system-change` — > 5 HTML or large diff

### Stage 0.5 — Deterministic pre-checks (mechanical, before any LLM)

```bash
bash scripts/fetch-pr.sh --pr <N> --repo <owner/repo>
bash scripts/auto-detect-violations.sh --pr <N> [--repo-root <path>] > /tmp/design-review-<N>/violations.json
```

`fetch-pr.sh` materialises before/after copies of every design-surface file under `/tmp/design-review-<N>/{before,after}/`.

`auto-detect-violations.sh` runs the catalog of mechanical rules (hex hardcoded, non-token spacing/type, inline-style, md-class-orphan, conflict-marker) against the **after** files. Rules that depend on `style.md` are no-op if `style.md` isn't present in the repo.

**Do not show findings to the designer here** (except conflict-marker — see Stage 1's early-surface step). All other findings become the input to Stage 3d's offer prompts.

### Stage 1 — Fetch & scope summary

`pr-meta.json` is already on disk from Stage 0. Read it and tell the designer in plain language:

> 這個 PR「<title>」改動了 [N 個畫面] / [N 份 spec]，是 [tier 描述] 的改動。
> 我先掃了一輪，找到 [M 個] 可能想 flag 的地方，等等走畫面的時候逐個問你。
> 要先開始嗎？

Translate `tier` to designer-friendly:
- `copy-only` → 「純文字 / spec 改動」
- `single-screen` → 「單一畫面的小改」
- `multi-screen` → 「多畫面改動」
- `system-change` → 「design system 級的改動」

### Stage 1.1 — PR state expectations (Draft / DO NOT MERGE)

`scope-tier.sh` JSON output includes `is_draft` and `do_not_merge` (set per the convention in `hie-rei/CLAUDE.md` › "PR States — Draft / DO NOT MERGE"). Before the cluster walkthrough begins, set expectations for the designer when either flag is true. Don't ask 「要不要 review」 — both states mean review is still appropriate per the convention; ask only what tone to use.

Branch:
- `is_draft == true AND do_not_merge == false` → tell designer once, then continue:
  > 這個 PR 是 draft，作者還在工作中、開出來收 early feedback。Review 還是可以做，但 tone 偏「探索 / 給方向」而不是「最終 sign-off」。要繼續嗎？
- `do_not_merge == true AND is_draft == false` → tell designer once, then continue:
  > PR 標題有「DO NOT MERGE」，作者標示「review OK 但先別 merge」（通常是在等別的東西完成）。Review 內容照常走、留 comment 沒問題。要繼續嗎？
- `is_draft == true AND do_not_merge == true` → combine:
  > 這個 PR 是 draft，標題也有「DO NOT MERGE」—— 兩個訊號都說「先別 merge」。Review 可以做，tone 偏 early feedback。要繼續嗎？
- Both false → skip this stage silently.

The designer's answer is binary: continue (proceed to Stage 1.2) or pause (skill exits cleanly, scratchpad preserved for resume). Do not push back if they pause — author may need to be contacted offline first.

### Stage 1.2 — Early-surface conflict markers (blocking)

Before scope summary lands, check `violations.json` for any `type == "conflict-marker"` finding:

```bash
jq '[.[] | select(.type == "conflict-marker")]' /tmp/design-review-<N>/violations.json
```

If the array is non-empty: **stop the normal flow and surface immediately.** These mean the PR file is literally broken — designer needs to know before walking clusters. Use the template in `references/designer-comms.md` › "Asking about a conflict-marker finding":

> 等一下，`<file>` 第 <line> 行有一段奇怪的符號 `<<<<<<< HEAD`。這是上次合併別人的改動時沒清乾淨的殘留，畫面通常會壞掉。你想怎麼處理？
> A. 我幫你處理 — 我把衝突兩邊的內容秀給你看，你選保留哪邊，我清掉標記
> B. 找 RD 幫忙 — 暫停 review，等 RD 處理完再繼續
> C. 繼續往下走 — 留 comment 給 PR 作者，我繼續 review

Branch:
- **A → Agent-assisted resolve** (see "Conflict-marker resolve workflow" section below)
- **B → Abort** the skill cleanly. Tell designer: 「OK，等你處理完再叫我繼續。」 Scratchpad keeps any partial state so resume works.
- **C → Continue** to Stage 1.5. The conflict-marker finding stays in violations.json and will surface again in Stage 3d for the affected cluster, where it gets logged as 🔴 Important in the draft (Stage 4) per `severity-tags.md`.

Multiple conflict-marker findings → process **one at a time** with the same 3 choices. Don't batch.

### Stage 1.5 — Multi-author conflict scan (mechanical)

```bash
bash scripts/scan-conflicts.sh --pr <N> --repo <owner/repo>
```

Reads commits from gh API, groups by file × author.

Decision:
- If `multi_author_files.length == 0` AND `repeat_touch_files.length == 0` → silently skip; nothing to surface.
- Otherwise → tell designer: 「這個 PR 裡有 [X] 個檔案是多人改的，要看一下嗎？」 If yes, present each conflict file with its authors + commits. **Do not judge** which author is "right"; just surface the fact.

### Stage 2 — Cluster into screens

Use filename heuristics + MD spec narrative to group changed files into screen clusters:

- Same directory → same cluster
- Filenames sharing a prefix or token → likely same cluster
- An HTML file + an MD file with related names → same cluster (the spec for the screen)

Ask the designer: 「這次動到 [X] 個畫面（cluster 名 1 / 2 / 3），要按畫面看還是按檔案看？預設按畫面。」

Designer can reorder, skip, or restructure clusters.

### Stage 3 — Per-cluster walkthrough

For each cluster:

**3a. Visual comparison**

```bash
node scripts/compute-html-diff.js --workspace /tmp/design-review-<N>
# Per-selector CSS property diff. Skip when no .css file is in files.json.
node scripts/summarise-css-diff.js --workspace /tmp/design-review-<N>
node scripts/make-compare-wrapper.js \
  --workspace /tmp/design-review-<N> \
  --cluster <cluster-name> \
  --files "<rel-path-1>,<rel-path-2>"
bash scripts/serve-compare.sh \
  --workspace /tmp/design-review-<N> \
  --cluster <cluster-name>
```

`summarise-css-diff.js` parses the before/after CSS files (handling multi-line
rules, comma-separated selectors, and `@media` / `@supports` / `@keyframes`
nesting) and writes per-selector property changes to `css-diff.json`. The
wrapper consumes this to (a) populate the CSS file's right-side panel, and
(b) for augmented HTML consumers, surface the intersection of changed CSS
selectors with classes/IDs actually used in the file so the designer knows
where the CSS-only visual delta lands.

**Verify before showing to designer:**

```bash
bash scripts/verify-wrapper.sh --workspace /tmp/design-review-<N> --cluster <cluster-name>
```

This runs 12 static invariant checks against the build artifacts (IIFE syntax,
violation scope, CSS parser coverage, anchor data-* resolvability, augmented
labelling, ask-Claude button layout, hover contrast CSS). It exits non-zero
on any FAIL — never serve a wrapper that didn't pass. Add `--strict` for
pre-release sign-off (warnings become failures). Each check is named after
the regression class it guards against; adding a new invariant is a copy-paste
of an existing assert block.

**Playwright smoke** (optional, ~2s per cluster) for the dynamic UI cases
verify-wrapper can't reach (anchor click flow, clipboard behaviour, hover
contrast computed-style):

```bash
# First-time setup (per machine):
cd ~/.claude/skills/design-pr-review
npm install && npx playwright install chromium

# Run smoke against a built workspace:
bash scripts/run-smoke.sh /tmp/design-review-<N> <cluster-name>
```

The runner reuses `serve-compare.sh` (auto-starts/stops) and runs four tests:
every panel anchor has a resolvable target, hover state keeps `.css-rm/add/chg`
readable, 📋 copies a well-formed context blob, 📋 (header) captures session state.
Subagent dispatch friendly — exit code = pass/fail, no interactive prompts.

**Why a local server, not `open <file>`?** Browsers (Chrome/Safari) treat each `file://` URL as a separate origin, so the wrapper cannot reach into the iframe documents — click-to-anchor and sync scroll would silently fail. `serve-compare.sh` spins up a tiny `python3 -m http.server` bound to 127.0.0.1, making the wrapper and iframes same-origin. It reuses an existing server if one is already running for this workspace.

Tell the designer where to look: 「畫面開好了，左 before、右 after。上面 jump bar 可以切檔，右邊 panel 列了變更區域跟我掃到的 issue — 點 selector 會直接跳到畫面上對應的位置。」 Wait for them to take a look.

At end of review, stop the server:

```bash
bash scripts/serve-stop.sh --workspace /tmp/design-review-<N>
```

**3b. Spec reference**

If the cluster includes MD files, Read the relevant section and surface it: 「對應的 spec 在 `<file>` 的「<section>」這段，等等如果要比對的話我這邊已經讀好了。」 Don't dump full content into the conversation — keep it brief.

**3c. PR-shape aware rubric**

Read `references/rubric.md` and pick 2–4 dimensions based on the tier × cluster signal table. Walk them with the designer **one at a time**:

> 第一個面向是「視覺一致性」— 這個畫面的 color / spacing / 字體看起來都用 style.md 的 token 嗎？

Wait for response. Append to scratchpad. Move to next dimension. Apply tone rules from `references/tone-rules.md` when wording the question.

**3d. Surface mechanical findings (Offer mode)**

Filter `/tmp/design-review-<N>/violations.json` to findings whose `file` falls within the current cluster. **Enumerate every filtered finding** — see Critical Rules › "Mechanical findings are facts". Do not pre-filter, sample, or judge which ones are worth asking.

For each finding, ask the designer one at a time:

> 我注意到 `<file>:<line>` 有 [type 翻譯成中文]: `<actual>`. 要 flag 為 nit 嗎？

If designer says yes → append to scratchpad with severity tag. If no → append to scratchpad's "considered but skipped" section (the reasoning trail). If "skip all of this type" → record and stop asking about that type (designer-initiated bulk skip is the only valid skip-without-asking).

**3e. Mid-review modify → re-confirm loop**

If the designer asks Claude to modify a file during walkthrough (e.g. 「Claude 把這個 hex 改掉」):

1. Make the edit using Edit tool
2. **Immediately re-run** `make-compare-wrapper.js` for the affected cluster
3. `open` the regenerated compare wrapper
4. AskUserQuestion: 「改完了，畫面看起來 OK 嗎？要保留還是回退？」
5. OK → continue rubric; not OK → revert the edit, log in scratchpad as「考慮過 X 改法但設計師回退」

### Stage 4 — Scratchpad → synthesize → draft

**4a. Scratchpad path**

Determine `output/` location:
- If current cwd is the PR's repo → `<repo>/output/pr-<N>-scratch.md`
- Otherwise → `/tmp/design-review-<N>/output/pr-<N>-scratch.md`

Append entries as Stage 3 runs. Format (append-only):

```markdown
## Cluster: <cluster-name>

- <YYYY-MM-DD HH:MM> · <dimension> · <designer's observation>
- <YYYY-MM-DD HH:MM> · auto-detect · <type> at <file:line> → <yes/no/skip>
```

**4b. Synthesize draft when designer says "OK 來整理"**

Read scratchpad + repo rubric docs. For each scratchpad entry the designer flagged:

1. Pick severity from `references/severity-tags.md` (default per `rubric.md`, adjust per designer's tone)
2. Pick dimension name as the comment's sub-heading
3. Apply 7 tone rules from `references/tone-rules.md`
4. Cite reference doc explicitly (no generic design tips)
5. Bundle ≥ 3 same-type same-file instances into one comment

Build comments list — each is `{ path, line, side, body }`:
- HTML modifications → default top-level summary entry (not inline). `body` includes the file path in the prose.
- MD spec modifications → default inline at the line referenced.
- Exception: HTML changes that are a single contiguous new component → inline at component start.

**4c. Write the full draft**

```
<repo>/output/pr-<N>-review-<YYYY-MM-DD>.md
```

Sections:
- Top-level summary (will be the PR review body)
- Inline comments (will be posted as review thread comments)
- Considered but not flagged (LOCAL ONLY — never posted; reasoning trail)

### Stage 5 — Handoff to `pr-comment`

Write `comments.json` to `/tmp/design-review-<N>/comments.json`:

```json
{
  "summary": "...top-level review summary...",
  "comments": [
    { "path": "<file>", "line": <n>, "side": "RIGHT", "body": "..." }
  ]
}
```

Invoke `sd0x-dev-flow:pr-comment` skill:

```bash
bash scripts/run-skill.sh pr-comment pr-comment.js \
  prepare --pr <N> --repo <owner/repo> --input /tmp/design-review-<N>/comments.json
```

`pr-comment` owns: dry-run preview, AskUserQuestion gate, SHA drift detection, atomic submit. **Do not bypass it** — it already implements every safety rail this skill needs for posting.

On success → report the review URL to the designer in plain language: 「送出去了，PR 那邊可以看到 review。網址：<url>」

## Conflict-marker resolve workflow (Stage 1.2 choice A)

Triggered when designer picks "A. 我幫你處理" for a conflict-marker finding. Each conflict block is handled one at a time.

### Steps

1. **Read the conflict block.** Use Read tool on `<repo-root>/<file>` with `offset` near the finding's line. Capture from `<<<<<<< <ref>` to `>>>>>>> <ref>`.

2. **Validate the block is well-formed.** Required structure:
   - One `^<<<<<<< ` start line
   - Exactly one `^=======$` middle separator
   - One `^>>>>>>> ` end line
   - No nested markers (no second `<<<<<<<` before the matching `>>>>>>>`)

   If validation fails → **fall back to choice B**: tell designer 「這個 conflict 看起來有點怪（標記不完整或有巢狀），我自己處理不安全，建議請 RD 幫忙。」

3. **Show both sides to the designer** in markdown code blocks:

   > 這段 conflict 兩邊長這樣:
   > **HEAD 邊**（你自己這邊的版本）:
   > ```
   > <content between <<<<<<< and =======>
   > ```
   > **Incoming 邊**（另一位設計師合進來的版本，from `<ref>`）:
   > ```
   > <content between ======= and >>>>>>>>
   > ```
   > 你想保留哪邊？或要兩邊都保留 / 我自己貼一段給你？

4. **Apply the edit** using Edit tool. Replace the entire block (from `<<<<<<<` line through `>>>>>>>` line inclusive) with:
   - Chosen side's content only (markers removed)
   - Or both sides concatenated (if designer picks "兩邊都保留")
   - Or designer's pasted content (if "我自己貼一段")

5. **Trigger Stage 3e re-confirm loop.** Re-run `make-compare-wrapper.js` for the affected cluster → re-open browser → AskUserQuestion 「改完了，畫面看起來 OK 嗎？要保留還是回退？」

6. **Scratchpad entry.** Append: `<timestamp> · conflict-resolve · <file>:<line> · kept=<HEAD|incoming|both|custom>`. This is the audit trail — future archaeology needs to know which side was kept and why.

7. **Move to next conflict-marker finding**, or back to Stage 1.5 if all resolved.

### Fallback triggers (skill MUST escalate to choice B)

- Block validation fails (incomplete / nested markers)
- Same file has ≥ 3 independent conflict blocks (too much for safe agent handling — invite human resolve instead)
- Designer's chosen side produces obviously unbalanced HTML/CSS (e.g., closing tag count mismatch within the edited region)
- Designer ambivalent / asks repeated questions about which side is "theirs" — agent doesn't have enough context to decide for them

### Commit message hint

If the PR later gets a follow-up commit from this resolve workflow, suggest commit message: `resolve conflict markers in <file>`. Records the conflict-resolution event in git history for archaeology.

## Critical rules

### Mechanical findings are facts — never downgrade

Every entry in `violations.json` filtered to the current cluster MUST be surfaced to the designer in Stage 3d, exactly once, one at a time.

The LLM may **NOT**:
- Pre-filter what it considers "obvious" or "low value"
- Bundle findings together at ask-time without explicit designer consent (Stage 4b bundling is for the final draft, not for skipping questions)
- Stop asking mid-list because "the rest are similar"
- Decide a finding is a false positive — that's the designer's call

The LLM **MAY upgrade**: notice issues beyond the catalog (e.g. visual inconsistency grep can't detect) and surface them as additional questions, clearly tagged as LLM-observation rather than mechanical finding.

The only valid downgrade is the designer's explicit "skip" — and it goes to scratchpad's "considered but skipped" section (reasoning trail), never silently dropped.

### NEVER

- ❌ Add a comment to draft without designer explicit yes
- ❌ Post to GitHub without going through `pr-comment` skill's gate
- ❌ Run rubric dimensions all at once — always one question at a time
- ❌ Use git / engineering jargon with the designer (see `references/designer-comms.md`)
- ❌ Take a screenshot via chrome-devtools MCP (use `open` per `feedback_html_preview_workflow.md`)
- ❌ Make file edits during walkthrough without re-rendering + re-confirming
- ❌ Decide a design is "good" or "bad" — only frame as questions
- ❌ Re-detect what `auto-detect-violations.sh` already detected — that wastes LLM tokens

### ALWAYS

- ✅ Run `verify-wrapper.sh` after every cluster build — never serve a wrapper that didn't pass
- ✅ Tell designer about the 📋 (header) button in the header — when something feels off, click it and paste back to chat for a real reproducer (closes the diagnosis loop without me having to ask "what did you click?")
- ✅ Run Stage 0 + 0.5 (mechanical) before any LLM walk
- ✅ Translate tier / counts into plain language for the designer
- ✅ Append every scratchpad entry as it happens (don't batch)
- ✅ Cite a specific doc section when drafting a suggestion
- ✅ Bundle ≥ 3 same-type same-file mechanical findings into one comment
- ✅ Save "considered but not flagged" entries to local artifact (reasoning trail)
- ✅ Hand off posting to `pr-comment` skill
- ✅ Report review URL on successful submit

## Verification checklist (per review)

Before reporting "done" to the designer:

- [ ] `pr-meta.json` exists at `/tmp/design-review-<N>/pr-meta.json`
- [ ] `files.json` exists with at least one design-surface file
- [ ] `violations.json` exists (may be `[]` if no rules fired)
- [ ] At least one `compare-<cluster>.html` was opened in browser per cluster
- [ ] Every scratchpad entry has a designer-confirmed flag-or-skip decision
- [ ] Draft file exists at `<repo>/output/pr-<N>-review-<date>.md`
- [ ] `comments.json` exists at `/tmp/design-review-<N>/comments.json`
- [ ] `pr-comment` dry-run preview was shown
- [ ] Designer explicit「OK 發出去」before submit
- [ ] Review URL reported on success

## Trust signal, not merge gate

This skill produces a structured review. It is **input to the designer-reviewer's judgment**, never a replacement for it. Merge decisions remain with the designer and the team's review process. PRs are iterative; design conventions have accepted exceptions; the reviewer holds context this skill can't see.

## File structure

```
.
├── SKILL.md
├── scripts/
│   ├── scope-tier.sh                # Stage 0 — mechanical tier + resume check
│   ├── fetch-pr.sh                  # Stage 1 / 0.5 — gh CLI wrapper, materialise before/after
│   ├── scan-conflicts.sh            # Stage 1.5 — multi-author detection
│   ├── auto-detect-violations.sh    # Stage 0.5 — catalog scan, NDJSON merge
│   ├── compute-html-diff.js         # Stage 3a — DOM-aware line range + selector extraction
│   ├── summarise-css-diff.js        # Stage 3a — per-selector CSS property diff (multi-line + @media aware)
│   ├── make-compare-wrapper.js      # Stage 3a — side-by-side iframe + jump bar + panel
│   ├── verify-wrapper.sh            # Stage 3a — 12 static invariant checks on build artifacts
│   ├── run-smoke.sh                 # Stage 3a — Playwright smoke runner (serve + test + tear down)
│   ├── serve-compare.sh             # Stage 3a — local HTTP server (avoids file:// CORS)
│   └── serve-stop.sh                # Stage 3a — stop the local server at review end
├── references/
│   ├── rubric.md                    # Dimension table + tier × cluster selection rules
│   ├── tone-rules.md                # 7 friendly-comment rules + bundle policy
│   ├── severity-tags.md             # 🔴 / 🟡 / 🟣 model + how to pick
│   └── designer-comms.md            # Plain-language vocabulary translation
├── tests/
│   └── wrapper-smoke.spec.js        # Playwright smoke (4 tests, ~2s/cluster)
├── playwright.config.js             # Playwright config (clipboard perms, headless)
└── package.json                     # @playwright/test devDep
```

## References to read at execution time

- `references/rubric.md` — read in Stage 3c
- `references/tone-rules.md` — read in Stage 4b
- `references/severity-tags.md` — read in Stage 4b
- `references/designer-comms.md` — read once at start; refer back when tempted to use jargon
- `~/Jottacloud/.claude/skills/designer-submodule/SKILL.md` — communication protocol
- `~/Jottacloud/.claude/projects/-Users-karen-shen-Jottacloud-vibe/memory/feedback_html_preview_workflow.md` — preview rule
- `~/.claude/plugins/cache/sd0xdev-marketplace/sd0x-dev-flow/3.0.11/skills/pr-comment/SKILL.md` — posting handoff target

## v2 backlog (not in scope now)

1. Local-branch mode (review own work pre-PR — same rubric / scratchpad, skip Stage 5)
2. Move into `hie-rei/.claude/skills/` for the design team
3. Use `load-pr-review` to pull prior reviewer comments and dedupe before flagging
4. Optional Playwright pixel-diff snapshot artifact for the local review record
