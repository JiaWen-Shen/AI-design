# design-pr-review

A Claude Code skill that walks a **designer-reviewer** through a GitHub PR whose deliverables are HTML mockups + Markdown specs. Mechanically scopes the PR, opens before/after side-by-side, flags potential design-system violations as questions (never decisions), drafts friendly comments, and hands off to `sd0x-dev-flow:pr-comment` for posting.

**Decisions stay with the designer.** Never blocks merge, never auto-posts.

See [`SKILL.md`](./SKILL.md) for the full skill contract, workflow, and conventions.

## Layout

```
.
├── SKILL.md                    # Skill entry — read this first
├── references/                 # Rubric, tone rules, severity tags, designer-facing comms
└── scripts/                    # Stage 0–3a mechanical pre-pass (gh CLI, regex, line diff)
    ├── scope-tier.sh           # PR-size tier auto-sizing + idempotent resume
    ├── fetch-pr.sh             # gh wrapper + auto-augment HTML consumers of changed CSS/JS
    ├── scan-conflicts.sh       # Multi-author overlap red flags
    ├── auto-detect-violations.sh  # Mechanical lint (hex / token / state / inline-style / md-class-orphan)
    ├── compute-html-diff.js    # DOM-aware selector + MD heading extraction per hunk
    ├── summarise-css-diff.js   # Per-selector CSS change summary with line anchors
    ├── make-compare-wrapper.js # Side-by-side wrapper (4 modes: visual / md / svg / textDiff)
    ├── md-render.js            # Markdown → HTML for srcdoc rendering
    ├── text-diff-render.js     # Browser-side line diff with 500KB perf cap
    └── serve-{compare,stop}.sh # Local HTTP server (avoids file:// CORS in iframes)
```

## Install (cross-device)

The canonical location is `~/Jottacloud/.claude/skills/design-pr-review/` with a symlink at `~/.claude/skills/design-pr-review/`. This repo is a secondary durable channel for the skill.

## Status

- v1 — shipped (HTML selectors, MD heading anchors, CSS per-selector summary, posting handoff)
- v2 — in development (TOC drawer, 4-mode dispatch, unified anchor router, Material-inspired polish, scope-fixed auto-detect with indirect-consumer scan)

Full v2 plan and Codex adversarial review responses in the local plan file (not in this repo).
