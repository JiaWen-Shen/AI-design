# Rubric — design-pr-review

This is the master rubric the skill walks with the designer-reviewer. **Never run all dimensions.** Pick 2–4 relevant to the cluster's change type. The Stage 3c table below maps trigger conditions → dimensions.

Every suggestion the skill drafts in Stage 4 must cite the relevant reference doc from the `Reference` column. If the cited doc doesn't exist in the PR's repo, downgrade the suggestion to a question ("does the repo have a convention for X?") rather than asserting a violation.

## Dimensions

### 視覺一致性 (visual consistency)
- **Trigger**: any HTML / CSS change touches color, spacing, typography
- **Severity default**: 🟡 Nit
- **Reference**: `style.md` (color tokens, type scale, spacing scale)
- **Designer prompt**: Are the colors / spacing / fonts using tokens defined in `style.md`?
- **Mechanical companions**: `hex-hardcoded`, `non-token-font-size`, `non-token-spacing` from auto-detect

### Layout
- **Trigger**: grid / flex container changes, alignment changes, container sizing
- **Severity default**: 🟡 Nit
- **Reference**: `style.md` (grid system), `design-conventions.md` (layout patterns)
- **Designer prompt**: Does the layout follow the repo's grid system? Is alignment consistent with sibling screens?

### 互動狀態完整 (interaction states)
- **Trigger**: new component, change to interactive element (button, link, input, toggle)
- **Severity default**: 🔴 Important
- **Reference**: `design-conventions.md` (interaction state checklist)
- **Designer prompt**: Are hover / active / disabled / focus states defined? Any state missing?

### 互動行為 (interaction behavior)
- **Trigger**: any change to an interactive element's trigger, feedback, or transition
- **Severity default**: 🔴 Important
- **Reference**: `design-conventions.md` (interaction patterns)
- **Designer prompt**: What's the expected trigger, feedback, transition? Match the repo's interaction grammar?

### Spec ↔ HTML 對齊 (spec / implementation alignment)
- **Trigger**: MD spec file changes in the same PR (or HTML changes a component the MD describes)
- **Severity default**: 🔴 Important
- **Reference**: the MD spec itself
- **Designer prompt**: Does the HTML match what the MD says? Any clause in MD with no HTML counterpart, or vice versa?
- **Mechanical companion**: `md-class-orphan` from auto-detect

### Copy / wording
- **Trigger**: any text content change (HTML text node, MD prose)
- **Severity default**: 視 case — 主訊息 🔴, 微調 🟡
- **Reference**: copy doc if exists, else `design-conventions.md`'s tone section
- **Designer prompt**: Tone consistent? Translation pairs aligned? Truncation / overflow considered?

### Accessibility
- **Trigger**: form, interactive element, motion, color-only signaling
- **Severity default**: 🟡 Nit (escalate to 🔴 if user-blocking)
- **Reference**: `a11y.md` or `design-conventions.md` accessibility section
- **Designer prompt**: Focus ring visible? `aria-*` on custom controls? Color-only signal has a non-color counterpart? Reduced-motion handled?

### Empty / error state
- **Trigger**: new flow, form, async data view
- **Severity default**: 🟡 Nit
- **Reference**: `design-conventions.md` (empty/error state patterns)
- **Designer prompt**: What does the user see when there's no data / when something fails?

### Animation / motion
- **Trigger**: any `transition`, `animation`, `@keyframes` change
- **Severity default**: 🟡 Nit
- **Reference**: `design-conventions.md` (motion language)
- **Designer prompt**: Duration / easing aligned with repo's motion language? Respects `prefers-reduced-motion`?

### Responsive
- **Trigger**: layout change at viewport ≥1 breakpoint
- **Severity default**: 🟡 Nit
- **Reference**: `style.md` (breakpoints)
- **Designer prompt**: Tested at each breakpoint? Component reflow expected?

## Stage 3c — Dimension selection by tier and cluster shape

Stage 0 has computed `SCOPE_TIER` (`copy-only` / `single-screen` / `multi-screen` / `system-change`). Combine that with the cluster's `change` field from `html-diff.json` to pick dimensions.

| Tier × cluster signal | Required dimensions | Optional (ask designer if time) |
|---|---|---|
| `copy-only` (MD only) | Copy/wording, Spec↔HTML alignment | — |
| `single-screen` + HTML modified | 視覺一致性, Spec↔HTML alignment | Layout, Interaction states |
| `single-screen` + new component | 互動狀態完整, 互動行為, 視覺一致性 | Empty/error state, Accessibility |
| `multi-screen` | 互動狀態完整, 視覺一致性, Spec↔HTML alignment, Layout | Animation, Responsive |
| `system-change` (CSS / token / global class) | 視覺一致性 (cross-screen impact), Layout, 互動狀態完整 | every other dimension flagged by spot-check |

Within each dimension, **ask the designer one question at a time**. Do not flood with a checklist — that recreates rubric fatigue. Wait for the answer, append to scratchpad, move on.

## Reference doc citation format

When drafting a suggestion in Stage 4, cite explicitly:

> 建議：依 `design-conventions.md` 的「Interaction states」第 2 條，按鈕的 disabled state 需要明確的視覺差異（不是只改 opacity）。

Not:

> ~~建議：按鈕的 disabled state 應該更明顯。~~ (no source — generic design tip)

If a doc section title isn't easy to locate, use the doc filename + first 5 chars of the matching paragraph as the anchor:

> 依 `style.md` (「Spacing scale...」段落)
