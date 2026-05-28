# design-pr-review skill — walkthrough on PR #357

> **Audience**: design team meeting reviewers. Walks every stage on a substantial real PR with real **before / after** diffs across multiple parallel files — exactly the case the skill is designed for.

**PR**: [hie-rei #357 — content: IAP Members wording + C2 Recurly embed Carol's buynow page](https://github.com/trendlife-general/hie-rei/pull/357)
**Author**: mei-hung_tmemu
**Diff**: +826 / -583 across **7 HTML files**
**Skill workspace**: `/tmp/design-review-357/`

---

## Why PR #357 is the right demo case

| Property | #301 (clean) | #342 (rich findings, mostly additions) | **#357 (full demo)** |
|---|---|---|---|
| Files | 1 HTML | 2 HTML + 5 MD | **7 HTML** |
| Tier | multi-screen | multi-screen | **system-change** |
| LOC | 591 | 1,299 | 1,621 |
| Findings | 0 | 260 | **164** |
| **Real modifications** | 0 files | mostly additions | **6 of 7 files modified** with proper before/after |
| Parallel-file pattern | n/a | n/a | **iap-upgrade × 5 variants** — perfect for cluster + compare-selector walk |

PR #357 is **the realistic case** designers actually face — same-family files (`iap-oot-annual` + `iap-oot-monthly` + 3 × `iap-upgrade-*`) modified in parallel. The compare view's file selector becomes useful exactly here.

---

## Stage 0 — Scope tier

```bash
bash scripts/scope-tier.sh --pr 357 --repo trendlife-general/hie-rei
```

```json
{
  "tier": "system-change",
  "design_surface": 7,
  "loc": 1621,
  "counts": { "html": 7, "md": 0, "css": 0, "img": 0 },
  "is_draft": false,
  "do_not_merge": false,
  "out_of_scope_count": 0
}
decision: pass
```

**Why `system-change`** (not `multi-screen`): rule says > 5 HTML or large diff → system-change. 7 HTML triggers it.

**What that means for designer**: skill labels this as **"design system 級的改動"** — multiple variants touched in parallel, so reviewer should check **consistency** across variants, not just visual correctness per file.

---

## Stage 0.5 — Mechanical pre-checks

### 0.5a — fetch-pr

All 7 files materialised at `/tmp/design-review-357/{before,after}/`. ✓

### 0.5b — auto-detect-violations: **164 findings**

| Type | Count |
|---|---|
| inline-style-hardcoded | 144 |
| inline-style-tokenized | 14 |
| inline-style-state | 6 |

**Per-file**:

| File | Findings | Diff size |
|---|---|---|
| `demo/demo-Subscription.html` | 149 | +4 / -262 (gutted) |
| `concept/concept-mei/buynow_v3.html` | 12 | +610 / 0 (new) |
| `views/iap-upgrade-member/iap-upgrade-member.html` | 1 | +31 / -50 |
| `views/iap-upgrade-memberPro/iap-upgrade-memberPro.html` | 1 | +31 / -50 |
| `views/iap-upgrade-usage/iap-upgrade-usage.html` | 1 | +26 / -37 |
| `views/iap-oot-annual/iap-oot-annual.html` | 0 | +62 / -92 |
| `views/iap-oot-monthly/iap-oot-monthly.html` | 0 | +62 / -92 |

> **🎯 Demo moment**: findings concentrated in `demo-Subscription.html` and the new `buynow_v3.html`. The 5 `iap-*` variant files have **0–1 findings each** because they're being **cleaned up** (more deletions than additions). The skill's catalog correctly reflects that the existing IAP views were already TLDS-compliant; the new buynow + demo aren't yet.

---

## Stage 1 — What the skill says to the designer

> 這個 PR「content: IAP Members wording + C2 Recurly embed Carol's buynow page」改動了 **7 個畫面**，是 **design system 級**的改動（多個 iap 變體並行調整）。
>
> 我先掃了一輪，找到 **164 個 inline-style 相關 finding** —— 主要集中在：
> - `demo-Subscription.html` (149) — 但這個檔在這個 PR 被大量刪減 (+4/-262)
> - 新加的 `buynow_v3.html` (12)
> - 5 個 `iap-*` 變體檔幾乎乾淨（每個 0–1 個）
>
> 我會 cluster by cluster 走，重點在 iap variant 變體間的一致性。要開始嗎？

---

## Stage 1.1 — PR state expectations

Not draft, no DO NOT MERGE → silent skip.

---

## Stage 1.2 — Conflict markers

`jq '[.[] | select(.type == "conflict-marker")]'` → `[]`. Skip.

---

## Stage 1.5 — Multi-author conflict scan

```json
{
  "authors": [{ "login": "mei-hung_tmemu", "commit_count": 2 }],
  "multi_author_files": [],
  "repeat_touch_files": []
}
```

Single-author (Mei), 2 commits, no parallel touches → silent pass.

---

## Stage 2 — Cluster planning

```
cluster-iap-upgrade   ← iap-oot-annual.html
                      ← iap-oot-monthly.html
                      ← iap-upgrade-member.html
                      ← iap-upgrade-memberPro.html
                      ← iap-upgrade-usage.html
   (5 parallel variants — review for consistency)

cluster-buynow        ← buynow_v3.html  (new, +610 LOC)

cluster-demo          ← demo-Subscription.html  (mostly deletion, low-risk)
```

Skill confirms with designer. Most time goes into `cluster-iap-upgrade` (the variant-consistency walk).

---

## Stage 3 — Cluster walkthrough

### Cluster: iap-upgrade (5 files)

#### 3a — Compare view ← **THIS IS THE STAGE TO DEMO**

```bash
node scripts/compute-html-diff.js --workspace /tmp/design-review-357 --file <each>
node scripts/make-compare-wrapper.js --workspace /tmp/design-review-357 --cluster cluster-iap-upgrade --files "<5 files comma-separated>"
# → /tmp/design-review-357/compare-cluster-iap-upgrade.html
```

**Real diff hunks per file** (not pure additions):

| File | hunks |
|---|---|
| iap-oot-annual.html | **17** |
| iap-oot-monthly.html | **17** |
| iap-upgrade-member.html | **9** |
| iap-upgrade-memberPro.html | **9** |
| iap-upgrade-usage.html | **8** |

→ **compare-cluster-iap-upgrade.html** is **already open in your browser**. File selector shows all 5; each one has real before/after diff content visible.

#### 3b — Visual walkthrough

> 五個 iap 變體 — annual / monthly / member / memberPro / usage — 平行改動了：
> - Members wording 統一更新（per PR description）
> - 都修了 17 / 9 / 8 個 hunk 不等
> - annual 跟 monthly 改動結構幾乎一樣 (+62/-92) — 兩個 variant 對齊
> - member / memberPro 改動也對齊 (+31/-50)
> - usage 較少 (+26/-37)
>
> 視覺上你看看 selector 切換 5 個檔，**一致性對嗎**？該對齊的有沒有對齊？該差異的（usage vs member-rank variants）有差異嗎？

#### 3c — PR description

Skill surfaces:
> Mei 的 PR 說明：IAP Members wording 統一 + C2 Recurly embed Carol's buynow page。
> Members 文字過去用 "Plan members" 之類，現在統一改 "Members"（per 內部討論）。
> Buynow v3 是 Carol 給的新 Recurly embed 版，先放 concept-mei/ 不污染 views/。

#### 3d — Findings enumeration (per cluster)

```bash
jq '[.[] | select(.file | startswith("design-handoff-2026July/views/iap-"))]' /tmp/design-review-357/violations.json
# → 3 findings total: 1 each in iap-upgrade-member, -memberPro, -usage
#   all type=inline-style-tokenized
```

> 3 個 finding 都是 `inline-style-tokenized`（用了 token 但 inline）。我看一下是不是同一個 pattern？
> [skill 讀 hunks，confirm 是 hover state inline]
>
> 是的，三檔的 hover state 都寫成 `style="color:var(--text3)"`。
> - severity preset: 🟢 **Worth noting**（minor — token 已用對，只是 inline）
> - 你想 flag 嗎？ A) flag（建議抽成 utility class） B) ignore（暫時 acceptable）

### Cluster: buynow_v3.html (1 file, new, 12 findings)

```
inline-style-hardcoded: 8
inline-style-tokenized: 2
inline-style-state: 2
```

> Mei 新加 buynow_v3.html — Carol 給的 Recurly embed 版本，放在 `concept-mei/`（個人 concept，不在 views/）。
> 12 個 finding 全在這檔。考慮到這是「Carol 給的 embed code 直接整理進來」的範本性質，inline-style 是來源代碼的特性，不見得要清。
>
> 你的判斷？A) flag 全部請 Mei 抽 CSS B) flag 重點幾個 C) 此檔 概念性 prototype，不 flag（明確標 concept-mei/ 為個人空間，acceptable）

### Cluster: demo-Subscription.html (1 file, 149 findings)

> 這檔 +4 / -262 — Mei 把大部分內容刪了，剩 4 行新增。149 finding 是「after 還留下的 inline style」。
>
> 因為主要是**刪減**，flag 的價值低（這檔在 PR 後變成 stub）。
> 預設選 B) ignore（這檔在 rework 中，等下一個 PR 處理）。

---

## Stage 4 — Draft comment (after designer walks all clusters)

Example draft if designer chose: 「iap cluster ignore minor」 / 「buynow_v3 flag 重點」 / 「demo-Subscription skip」:

> **Draft for PR #357** (skill prepares; designer approves):
>
> ✨ 看完了，IAP variants wording 統一、Recurly embed 整理進 concept-mei/ 都對齊預期。
>
> 🟢 **iap-upgrade variants — 一致性 OK**
> 5 個變體 (annual / monthly / member / memberPro / usage) 改動 pattern 對齊，wording 一致更新到 "Members"。3 個小的 `style="color:var(--text3)"` inline 在 hover state — token 有用對，只是 inline，可以之後跟 utility class 一起整理。
>
> 🟡 **buynow_v3.html (新檔) — 12 個 inline-style**
> 知道是 Carol 給的 Recurly embed 直接整理進來。建議至少把幾個 reusable spacing / typography 抽到 CSS 方便後續 Recurly variants 重用。
> 範例：line 145 的 `style="padding:16px 20px;font-size:14px;color:var(--text2)"` → 可以變 `.recurly-card-body` class。
>
> demo-Subscription.html 主要是刪減 (-262 lines)，這次 PR 不處理 inline-style 是 OK 的 ✅

**Skill never auto-posts.** Designer reads → edits → "OK 發出去" → handoff to `sd0x-dev-flow:pr-comment`.

---

## Meeting demo run order (~10 min)

| Time | Action | What to point out |
|---|---|---|
| 0:00 | Walkthrough md, Stage 0 | Tier = **system-change** — multi-variant changes. "Skill knows this isn't single-screen change." |
| 1:00 | Stage 0.5 findings table | **164 findings concentrated in 2 files**, the other 5 files lean clean. Show the catalog's intelligence by file. |
| 2:30 | **Open compare-cluster-iap-upgrade.html** | Switch file in selector — show **real before/after diff** for each of 5 variants. This is the centerpiece. |
| 5:00 | Stage 3d iap cluster | "3 findings, all the same pattern" — show skill's grouping prevents 164-line dump |
| 6:30 | Stage 3d buynow_v3 | Demo of **context-aware finding**: same inline-style finding type, but **judgement varies by file context** (concept-mei prototype vs views/ canonical) |
| 8:00 | Stage 4 draft comment | "skill drafts severity-tagged, designer ships" |
| 9:00 | Q&A | Catalog expansion, severity tier, cluster granularity |

---

## Artifacts in workspace

```
/tmp/design-review-357/
├── after/                                   # full repo at PR head
├── before/                                  # full repo at base
├── pr-meta.json                             # PR metadata
├── violations.json                          # 164 findings
├── files.json
├── html-diff.json                           # 7 files × {1,4,17,17,9,9,8} hunks
├── compare-cluster-iap-upgrade.html         # ← already open in your browser
└── SKILL-WALKTHROUGH.md                     # this doc
```

---

## Three-PR comparison (carry to meeting if you want a fast tour)

If you want a 3-PR tour for a 15-min slot:

1. **#301 Mei forYou.html** (clean baseline, 0 findings) — show what skill says when nothing to flag — ~2 min
2. **#357 Mei IAP** (full real-world demo) — main course — ~10 min
3. **#342 Shuhan Scam Check** (mass findings, 260) — close with "how catalog scales" — ~3 min

All three workspaces (`/tmp/design-review-{301,342,357}/`) live alongside each other; you can flip between browser tabs.

---

## Live invoke fallback

```bash
cd ~/Jottacloud/vibe/hie-rei
claude
# then:
"review design PR 357"
```

Skill walks each cluster interactively, you answer as the designer.
