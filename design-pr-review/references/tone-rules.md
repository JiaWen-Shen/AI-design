# Friendly comment tone — design-pr-review

Borrowed from `sd0x-dev-flow:pr-comment`'s 7 rules, adapted for design context. Every comment drafted in Stage 4 must pass all seven before going into the comments.json handoff.

## Rules

| # | Rule | Description | Design-specific example |
|---|------|-------------|--------------------------|
| 1 | **Questions over commands** | Ask "would it make sense to..." instead of "change this to..." | ✅ "Would it make sense to use `--spacing-md` here?" ❌ "Change 14px to 16px." |
| 2 | **Code, not person** | Subject is the design / file, not "you" | ✅ "The disabled state isn't defined here." ❌ "You forgot the disabled state." |
| 3 | **Explain why** | Give the reason, not just the what | ✅ "If hover and active look the same, users on slow devices can't tell the click registered." ❌ "Hover and active are too similar." |
| 4 | **Assume good intent** | Confirm rather than accuse | ✅ "Just want to confirm — this is meant to be smaller than the spec calls for, right?" ❌ "This doesn't match the spec." |
| 5 | **Praise first** | Acknowledge before suggesting | ✅ "The empty state copy reads really well. One thought on the icon though..." ❌ "The icon is wrong." |
| 6 | **No emoji** | Unless the PR's own thread uses them, or designer asks | — |
| 7 | **Follow PR language** | Match the language the PR title and other comments use | If PR title is English → comment in English. If 中文 → comment in 中文. |

## Severity tag in the comment

Lead each comment with the severity tag from `severity-tags.md`:

```
🔴 Important · 互動狀態
按鈕在沒填 email 時的 disabled state 看起來還沒做。
若使用者點下去沒反應、也沒視覺回饋，會以為是 bug。
這個 state 在 `design-conventions.md` 的 Interaction states 第 2 條有定義。
```

The dimension name after the severity tag tells the PR author *what category* the comment belongs to — useful when they triage the review.

## What NOT to do in tone

- **Don't sandwich** — "Praise first" rule does NOT mean fake praise before every comment. If there's nothing to praise on this specific element, skip the praise on this specific comment. Save it for top-level summary.
- **Don't preach** — quoting design principles ("UI should be intuitive") without specific repo doc anchor is noise.
- **Don't speculate about author motive** — "you probably forgot..." / "I assume you didn't notice..." are accusations dressed as charity.
- **Don't pile on** — if there are 5 instances of the same issue, write one comment with "5 places like this, e.g. line 88 — same suggestion applies to lines 124, 156, 201, 234." Not 5 separate comments.

## Top-level review summary

The top-level summary (posted as PR review body, not inline) opens with a one-line tally:

```
2 important · 3 nit · 1 question
```

Then 2–4 sentences of overall framing:

```
這個 PR 把登入流程拆成 3 個畫面，整體視覺一致。
有兩處想跟你確認：disabled state 的設計，以及 wording 在 step 2 / step 3 的對齊。
其他都是小調整。
```

If verdict is positive overall, lead with that:

```
整體看起來很乾淨，有幾個 nit 想丟給你考慮。
```

If no issues found:

```
看完了，沒有想 flag 的點。三個畫面跟 spec 對得很好，互動狀態也都齊。
```
