# Severity tags — design-pr-review

Adopted from Anthropic's official Code Review severity model, adapted for design review. **Never blocks merge** — these are signals, not gates.

## The three tags

| Marker | Severity | Meaning for design |
|--------|----------|--------------------|
| 🔴 | Important | A design issue that should be fixed before merge: broken interaction, missing required state, copy that misleads, accessibility user-blocker. |
| 🟡 | Nit | A minor issue worth flagging but not blocking: token misalignment, spacing nit, polish opportunity. |
| 🟣 | Pre-existing | An issue that exists in the codebase but was not introduced by this PR. Flag it as a separate concern; don't expect the PR author to fix in this PR. |

## How to pick severity

Default rules from `rubric.md`'s dimension table take precedence. When a dimension's default is "視 case":

- **🔴 Important** if the issue:
  - Breaks the user task (button doesn't work as expected, text is unreadable)
  - Is a user-blocking accessibility issue (focus trap, missing label)
  - Misleads the user (wrong wording, wrong icon meaning)
  - Breaks the design system in a way other PRs will copy from

- **🟡 Nit** if the issue:
  - Affects polish but doesn't break the task
  - Is a token / token alignment miss
  - Is a single-instance spacing / typography tweak
  - Is a "could be cleaner" refactor opportunity in the design

- **🟣 Pre-existing** if the issue:
  - Was already in the file before this PR touched it
  - Is in a part of the code the PR didn't modify but you noticed in passing
  - Should be tracked separately (suggest opening a separate issue / PR)

## When in doubt — ask, don't escalate

If unsure whether an issue is 🔴 or 🟡, draft it as 🟡 and add a question to the comment body:

```
🟡 Nit · 互動狀態
disabled state 看起來只是 opacity:0.5。
依 `design-conventions.md` 是建議用獨立色彩 token。
（不確定這在這個畫面算 important 還是 nit — 看你怎麼判斷）
```

Designer reviewers should never have to defend "why I marked this 🔴". Hedging is cheap; over-claiming is expensive.

## Pairing with cluster signals

When a cluster has **many mechanical violations of the same type** (e.g., 27 inline-style instances), bundle them as one 🟡 Nit referring to the pattern, not 27 separate comments:

```
🟡 Nit · 視覺一致性
看到 27 個 inline `style="..."` 的地方（例如 line 47、52、96...），
依 `design-conventions.md` 的 CSS rules 第 3 條，建議抽到 stylesheet。
要全做還是這個 PR 只動該動的、其他另開？
```

Bundle threshold: **≥ 3 instances of the same mechanical violation type** in the same file → bundle.
