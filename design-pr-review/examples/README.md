# design-pr-review — Worked Examples

Each file walks the skill end-to-end on a real PR, captured 2026-05-28 for the HIE skill-review discussion. Use these as:
- **Onboarding**: see what the skill output looks like before invoking it
- **Calibration**: compare your judgement to a documented walkthrough
- **Demo material**: presentation-ready stage-by-stage records

| File | PR | Author | Tier | Findings | Why it's interesting |
|---|---|---|---|---|---|
| [pr-301-clean-baseline.md](./pr-301-clean-baseline.md) | hie-rei #301 | mei-hung_tmemu | multi-screen | **0** | Clean PR — what the skill says when nothing to flag |
| [pr-342-mass-findings.md](./pr-342-mass-findings.md) | hie-rei #342 | shuhan-yang_tmemu | multi-screen | **260** | 4 finding types, mostly additions — how the catalog scales |
| [pr-357-multi-variant-cluster.md](./pr-357-multi-variant-cluster.md) | hie-rei #357 | mei-hung_tmemu | system-change | **164** | 5 parallel IAP variants — cluster + compare-selector walk |

## Reproducing locally

Each walkthrough includes the actual shell commands used. To reproduce on any machine:

```bash
SKILL=~/Jottacloud/vibe/AI-design/design-pr-review

# Stage 0 + 0.5 (mechanical pre-pass)
bash $SKILL/scripts/scope-tier.sh --pr <N> --repo trendlife-general/hie-rei
bash $SKILL/scripts/fetch-pr.sh --pr <N> --repo trendlife-general/hie-rei
bash $SKILL/scripts/auto-detect-violations.sh --pr <N> > /tmp/design-review-<N>/violations.json

# Stage 3a (compare wrapper + server)
node $SKILL/scripts/compute-html-diff.js --workspace /tmp/design-review-<N> --file "<path>"
node $SKILL/scripts/make-compare-wrapper.js --workspace /tmp/design-review-<N> --cluster "<name>" --files "<a,b,c>"
bash $SKILL/scripts/serve-compare.sh --workspace /tmp/design-review-<N> --cluster "<name>"
```

Workspace lives in `/tmp/design-review-<N>/` (ephemeral). Walkthrough md is the persistent record.
