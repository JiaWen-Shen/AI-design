# design-pr-review skill — walkthrough on PR #342 (rich-findings demo)

> **Audience**: design team meeting reviewers. This walks every stage the skill goes through on a substantial real PR — Shuhan's Scam Check + DWM overhaul — and shows what 260 mechanical findings look like in practice.

**PR**: [hie-rei #342 — ✨ feat(2026July): Scam Check demo + DWM panel overhaul + LLM specs](https://github.com/trendlife-general/hie-rei/pull/342)
**Author**: shuhan-yang_tmemu
**Diff**: +907 / -249 across **7 files** (2 HTML demos + 5 markdown specs)
**Skill workspace**: `/tmp/design-review-342/`

---

## Why PR #342 is the right demo case

| Property | #301 (clean baseline) | **#342 (rich demo)** |
|---|---|---|
| Files | 1 HTML | **2 HTML + 5 MD** |
| LOC | 591 | **1,299** |
| Tier | multi-screen | multi-screen |
| Findings | **0** | **260** |
| Finding types | — | **4** (inline-style-hardcoded · inline-style-state · inline-style-tokenized · md-class-orphan) |
| Designer recognises author? | Yes (Mei) | Yes (Shuhan, recent) |

PR #342 exercises the catalog scanner thoroughly — designers can see exactly how the skill surfaces real maintainability concerns without being judgmental about visual design.

---

## Stage 0 — Scope tier (mechanical)

```bash
bash scripts/scope-tier.sh --pr 342 --repo trendlife-general/hie-rei
```

```json
{
  "pr": 342,
  "repo": "trendlife-general/hie-rei",
  "tier": "multi-screen",
  "design_surface": 7,
  "loc": 1299,
  "counts": { "html": 2, "md": 5, "css": 0, "img": 0, "other": 0 },
  "is_draft": false,
  "do_not_merge": false,
  "out_of_scope_count": 0,
  "out_of_scope_paths": []
}
decision: pass
```

**Branches checked**:
- ✅ Not `infra-mixed` (no hooks / workflows touched)
- ✅ Has design surface (2 HTML + 5 MD)
- ✅ No prior scratchpad
- → Proceed to Stage 0.5

---

## Stage 0.5 — Deterministic pre-checks

### 0.5a — fetch-pr

```bash
bash scripts/fetch-pr.sh --pr 342 --repo trendlife-general/hie-rei
```

All 7 files materialised at `/tmp/design-review-342/{before,after}/`.

### 0.5b — auto-detect-violations

```bash
bash scripts/auto-detect-violations.sh --pr 342 > /tmp/design-review-342/violations.json
```

**Result**: **260 findings.** Breakdown:

| Type | Count | What it means |
|---|---|---|
| **inline-style-hardcoded** | 159 | `style="width:24px"` — hex / px / vw not from TLDS tokens |
| **inline-style-tokenized** | 74 | `style="color:var(--text3)"` — uses token but **still inline** (violates "no inline CSS" rule) |
| **inline-style-state** | 20 | `style="display:none"` — visibility / state changes that should be CSS classes for maintainability |
| **md-class-orphan** | 7 | CHANGELOG.md mentions CSS class names that don't exist in current repo CSS |

**Per-file**:

| File | Findings | Types |
|---|---|---|
| `design-handoff-2026July/demo/demo-CDLP.html` | **249** | inline-style ×3 |
| `design-handoff-2026July/demo/demo-ScamCheck.html` | 4 | inline-style-hardcoded + tokenized |
| `CHANGELOG.md` | 7 | md-class-orphan |
| other 4 MD files | 0 | clean |

> **🎯 Demo moment**: when you show this breakdown to the team, point out that **demo-CDLP.html alone has 249 findings.** This isn't because Shuhan is sloppy — the file is a demo / handoff prototype where inline styles are common practice. The skill flags them so the **reviewer decides** whether each is acceptable for this kind of file or should be extracted to CSS.

### Sample findings (from violations.json)

**inline-style-hardcoded** (3 of 159):
```
demo-CDLP.html:670 — <lottie-player ... style="width:24px;height:24px" ...
demo-CDLP.html:769 — <img ... style="width:32px;height:32px;border-radius:50%;opacity:0.5">
demo-CDLP.html:822 — <div style="height:20px"></div>     ← spacer div
```

**inline-style-state** (3 of 20):
```
demo-CDLP.html:609 — <svg id="chat-title-arrow" ... style="display:none">
demo-CDLP.html:614 — <button class="chat-top-btn" id="protection-btn" ... style="display:none">
demo-CDLP.html:737 — <button class="panel-back-btn" ... style="visibility:hidden">
```

**inline-style-tokenized** (3 of 74):
```
demo-CDLP.html:658 — <svg ... style="flex-shrink:0;color:var(--text3)">
demo-CDLP.html:770 — <span ... style="color:var(--text3)">Leo</span>
demo-CDLP.html:774 — <span ... style="color:var(--text3)">Add</span>
```

**md-class-orphan** (1 of 7):
```
CHANGELOG.md:55 — references .values-ex-q / .values-ex-a / .values-example
  (these CSS classes were removed in PR #282 — CHANGELOG mention is now stale)
```

---

## Stage 1 — Scope summary (what designer sees)

> 這個 PR「feat(2026July): Scam Check demo + DWM panel overhaul + LLM specs」改動了 **2 個畫面 + 5 份 spec**，是**多畫面**改動級別。
>
> 我先掃了一輪，找到 **260 個可能想 flag 的地方** —— 主要在 demo-CDLP.html (249) 跟 demo-ScamCheck.html (4)。CHANGELOG.md 還有 7 處引用到的 CSS class 已經不存在。
>
> 種類分類：
> - 159 個 hardcoded inline style（像 `style="width:24px"` 沒走 token）
> - 74 個 tokenized inline style（用 `var(--text3)` token 但 still inline）
> - 20 個 state inline style（`style="display:none"` 可以走 CSS class）
> - 7 個 markdown 提到的 CSS class 不存在了
>
> 等等走畫面的時候會 cluster by cluster 跟你逐個討論。要先開始嗎？

---

## Stage 1.1 — PR state expectations

`is_draft = false`, `do_not_merge = false` → **silent skip.** This is a normal review.

---

## Stage 1.2 — Conflict markers

```bash
jq '[.[] | select(.type == "conflict-marker")]' /tmp/design-review-342/violations.json
# → []
```

**0 conflict markers** → skip.

---

## Stage 1.5 — Multi-author conflict scan

```bash
bash scripts/scan-conflicts.sh --pr 342 --repo trendlife-general/hie-rei
```

Likely outcome (single-author PR by shuhan-yang_tmemu): `multi_author_files: []`. Silent pass.

---

## Stage 2 — Cluster planning

With 7 files, the skill would propose clusters like:

| Cluster | Files | Theme |
|---|---|---|
| **cluster-cdlp** | demo-CDLP.html | Scam Check + DWM main demo |
| **cluster-scamcheck** | demo-ScamCheck.html | dedicated Scam Check demo |
| **cluster-spec-dwm** | LLM/darkweb-monitor-chat-spec.md, LLM/scamAlert.md | DWM + alert spec |
| **cluster-spec-misc** | LLM/pinned-chat-spec.md, LLM/webguard-chat-spec.md | small spec edits / removal |
| **cluster-changelog** | CHANGELOG.md | release-notes only |

Skill confirms cluster grouping with designer before walking. Designer can collapse / split.

---

## Stage 3 — Cluster walkthrough (per cluster)

### Cluster: cdlp — `demo-CDLP.html` (249 findings)

#### 3a — Compare view

```bash
node scripts/make-compare-wrapper.js \
  --workspace /tmp/design-review-342 \
  --cluster cluster-cdlp \
  --files "design-handoff-2026July/demo/demo-CDLP.html,design-handoff-2026July/demo/demo-ScamCheck.html"
# → /tmp/design-review-342/compare-cluster-cdlp.html
```

Browser opens with **before / after side-by-side at iPhone width**. Designer sees the actual visual change Shuhan made — new DWM panel overhaul + Scam Check entry points.

> 👉 **Live demo**: this file is already generated and open in your browser tab.

#### 3b — Visual scan with the designer

> 這個 cluster 的兩個 demo 加起來改動最多。Shuhan 的 PR 說明：
> - Scam Check 新 demo flow
> - DWM panel overhaul（新增 7 個 item 的 panel structure）
> - LLM 相關 spec 補完
>
> 視覺上你有想 flag 的地方嗎？

#### 3c — PR description / spec links

Skill surfaces the PR body so designer can cross-reference. With #342 the body is short — mostly diff highlights.

#### 3d — Per-cluster findings enumeration

```bash
jq '[.[] | select(.file == "design-handoff-2026July/demo/demo-CDLP.html")] | length'
# → 249
```

**Skill doesn't dump 249 lines at the designer.** Per the rubric, it groups:

> demo-CDLP.html 有 249 個 inline-style 相關 finding。我把它們分成 3 組讓你決定：
>
> **A. hardcoded sizes (159)** — 例：`style="width:24px;height:24px"` 在 icon 上
>   - severity preset: 🟡 **Worth flagging**（在 prototype demo file 可接受，但量大）
>   - 你想 flag 嗎？ A1) 全部flag · A2) 抽樣 flag · A3) 此檔不 flag（demo 檔特例）
>
> **B. tokenized inline (74)** — 例：`style="color:var(--text3)"`
>   - severity preset: 🟢 **Worth noting**（已用 token，只是 inline）
>   - A1) flag · A2) ignore
>
> **C. state inline (20)** — 例：`style="display:none"`
>   - severity preset: 🟢 **Worth noting**（狀態切換建議用 CSS class）
>   - A1) flag · A2) ignore

Designer picks per-group. Skill records the choices in scratchpad.

### Cluster: scamcheck — 4 findings, fast pass

### Cluster: changelog — 7 md-class-orphan findings

> CHANGELOG.md 提到的 CSS class `values-ex-q` / `values-ex-a` / `values-example` 在現有 repo 沒找到。
>
> 通常 CHANGELOG 是寫給「當時」的版本，引用過去存在但後來被刪掉的 class 是 OK 的（歷史紀錄）。
>
> 要 flag 嗎？通常選 **B. ignore**（it's a changelog, not live doc）。

This is exactly the kind of case where **skill assists but designer decides** — same finding type can be valid here and invalid in a live doc.

---

## Stage 4 — Draft comment

After designer walks all clusters, skill drafts a single PR comment (example, if designer accepted "flag inline-style-hardcoded sample" + "ignore changelog orphans"):

> **Draft for PR #342**:
>
> ✨ 看完了，視覺上 Scam Check + DWM 改得很整齊。幾個維護面想問你：
>
> 🟡 **demo-CDLP.html — inline-style 量大**
> Catalog 掃出 249 個 inline style，主要分三類：
> - 159 個 hardcoded（如 `style="width:24px"` 的 icon size）— 建議抽到 CSS class
> - 74 個用 token 但 inline（如 `style="color:var(--text3)"`）— 用 utility class 比較 reuse
> - 20 個 state inline（如 `style="display:none"`）— 用 `.is-hidden` class 更好維護
>
> 知道這是 demo / handoff 檔，inline 在這個 context 是常見做法。但量大到 reviewer 看 diff 會吃力。是不是 case-by-case 抽幾個熱點先處理？
>
> 🟢 **demo-ScamCheck.html — 4 個 inline-style**
> 小量，可以跟上面一起決定。
>
> CHANGELOG 引用的舊 class 是歷史紀錄，不用處理 👍

**Skill never auto-posts.** Designer reviews, edits, says "OK 發出去" → handoff to `sd0x-dev-flow:pr-comment`.

---

## Stage 5 — Handoff

Same as #301 — `sd0x-dev-flow:pr-comment` posts via `gh pr comment`. design-pr-review never touches GitHub directly.

---

## Meeting demo run order (~10 min)

| Time | Slide / action | What to point out |
|---|---|---|
| 0:00 | Walkthrough md, Stage 0 | "Mechanical pre-pass — pure shell, before LLM" |
| 1:00 | Stage 0.5 findings breakdown | **260 findings · 4 types · 1 file dominates (249)** — show real catalog scale |
| 2:00 | Open compare-cluster-cdlp.html in browser | Side-by-side at iPhone width — visual diff for Stage 3a |
| 3:30 | Stage 3d enumeration sample | "Skill doesn't dump 249 lines — it groups by category + severity, asks designer per-group" |
| 5:00 | CHANGELOG.md md-class-orphan example | Show how same finding type means different things in different files — **designer judgement matters** |
| 6:30 | Stage 4 draft comment | "skill drafts, designer edits, never auto-posts" |
| 8:00 | Q&A | Catalog expansion ideas, severity tier discussion |

---

## Artifacts in workspace

```
/tmp/design-review-342/
├── after/                              # full repo at PR head
├── before/                             # full repo at base
├── pr-meta.json                        # PR metadata
├── violations.json                     # 260 findings, indexed by file/type
├── files.json                          # changed files manifest
├── compare-cluster-cdlp.html           # ← browser opens this (Stage 3a)
└── SKILL-WALKTHROUGH.md                # ← this doc
```

---

## Live invoke fallback

If you want to **actually run the skill** in front of the team:

```bash
cd ~/Jottacloud/vibe/hie-rei
claude
# then:
"review design PR 342"
```

The skill walks each cluster interactively, you answer as the designer, finishes with a posted-or-drafted comment.

---

## Comparison shortcut to #301

`#301` is also fetched at `/tmp/design-review-301/` with its own walkthrough — use as **"clean PR" counter-example** ("most PRs in the wild are noisier than that; here's the rich case"). 2-slide quick comparison:

| | #301 (Mei forYou.html) | #342 (Shuhan Scam Check) |
|---|---|---|
| Files | 1 HTML | 2 HTML + 5 MD |
| Findings | **0** | **260** |
| Skill output | "looks clean, just ship" | per-category enumeration walk |
| Designer time | ~5 min | ~10 min |
