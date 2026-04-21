# Claude Design Sharing — Draft v2 Refined Copy

Phase A output. All new-slide wording + image specs for your review.
Existing slides reused as-is are not included here (see `claude-design-sharing.pptx` v1).

---

## Slide#2 · Table of Contents *(NEW)*

**Eyebrow:** WHAT WE'LL COVER
**Title:** Table of Contents

**Body (4 lanes + 2 sections):**

| # | Section | One-liner |
|---|---------|-----------|
| Q1 | What's different from Claude Code? | The GUI-vs-CLI story |
| Q2 | How does Claude Design help us? | Pain points it solves today |
| Q3 | Does it improve delivery quality? | Where it helps, where it doesn't |
| Q4 | Do we still need Figma? | Design tool vs. production tool |
| — | Hands-on walkthrough | A designer's first run |
| — | What's next | Long-term outcomes |

**Image spec:** No image required. Clean typographic TOC. 4 numbered Q-cards on top row + 2 section-pills underneath. Use same eyebrow blue used elsewhere in the deck.

---

## Slide#3 · Section Subtitle *(NEW)*

**Eyebrow:** SECTION 01
**Title (oversized):** Let's start with the questions most people care about.
**Sub (optional):** Four questions. Four honest answers.

**Image spec:** No image. Full-bleed subtitle slide — big type, generous whitespace. Matches the style of old Slide#8 "Hands-on" section divider.

---

## Slide#4 · Q1 *(NEW — question prompt card)*

**Eyebrow:** QUESTION 01
**Title:** What's the difference between Claude Code and Claude Design?

**Image spec:** Minimal. A small Q icon or just a large "01" numeral in the corner. Keep the whole slide about the question.

---

## Slide#5 (was A1) · Callout — GitHub vs. Git analogy *(NEW)* ⭐

**Eyebrow:** ANSWER 01 · IN ONE LINE
**Headline (big):**
> Claude Design : Claude Code  ≈  GitHub : Git

**Supporting line (1 sentence):**
A GUI layer that directs the same underlying work — built for designers who don't live in the terminal.

**Body bullets (3 short):**
- Claude Code = the engine (CLI, Git-native, full control)
- Claude Design = the console (visual canvas, inline controls, one-click export)
- Same brains, different cockpit.

**Image spec (a1-github-vs-git.png):**
- **Concept:** Two panels side-by-side, labeled "CLI" and "GUI".
- **Left panel (CLI):** A dark terminal window showing `$ git commit -m "…"` style lines. Green-on-black, monospace. Small `git` mark in the corner.
- **Right panel (GUI):** A light window frame showing a simplified GitHub Desktop-style UI — commit history list with small avatars, a "Push" button highlighted. Small GitHub octocat in the corner.
- **Between them:** A horizontal arrow or "≈" sign. Under the two panels, a second row showing the same layout re-labeled "Claude Code" (terminal) and "Claude Design" (canvas with a chat sidebar + design preview).
- **Style:** Flat 2D, line-weight icons, 2-color (template blue + neutral gray), no photography.

---

## Slide#6 · Q1's existing comparison table
*(Reused — old Slide#7 "How Claude Design Compares", no change)*

---

## Slide#7 · Q2 *(NEW — question prompt card)*

**Eyebrow:** QUESTION 02
**Title:** How can Claude Design help us?

---

## Slide#8 (was A2) · Callout — Easier on-ramp *(NEW)* ⭐

**Eyebrow:** ANSWER 02 · IN ONE LINE
**Headline (big):**
> A designer-friendly alternative to Claude Code.

**Supporting line:**
Lower the learning curve. Keep the output quality. Let designers ship prototypes without becoming terminal users.

**Body (3 bullets matching the deep-dive that follows):**
- No CLI. No Git. Just a canvas and a chat box.
- Pre-built scaffolding: design system import, design-decision prompts, export paths.
- The next 3 slides break down exactly which pain points it removes.

**Image spec (a2-cli-vs-gui.png):**
- **Concept:** A single designer persona (simple figure icon) at the center. Two paths branching out.
- **Left path (dimmed):** "Claude Code" — a thin line to a terminal icon, labeled "steep curve".
- **Right path (highlighted, template blue):** "Claude Design" — a thicker line to a canvas-with-chat icon, labeled "start here".
- **Subtle below:** Small arrows from both paths converging to the same destination icon labeled "Prototype · Slide · One-pager".
- **Style:** Minimal line-art, 2-color, room for text to breathe.

---

## Slides#9–11 · Q2's in-depth answer
*(Reused — old Slide#4 Pain Points + old Slide#5 In short + old Slide#6 What Claude Design Solved. Zero changes. They now serve as the supporting evidence for A2.)*

---

## Slide#12 · Q3 *(NEW — question prompt card)*

**Eyebrow:** QUESTION 03
**Title:** Does Claude Design improve the quality of design delivery?

---

## Slide#13 (was A3) · Callout — Yes and No *(NEW)* ⭐

**Eyebrow:** ANSWER 03 · HONESTLY
**Headline (big):**
> Yes — for structure. No — for ceiling.

**Supporting line:**
Claude Design codifies good process into the UI. But the ceiling of what's possible still belongs to Claude Code.

**Body (3 stacked points):**

1. **What it improves** — a structured path: import a design system → answer design-decision prompts → produce consistent output. Designers who'd skip these steps in Figma get them for free.

2. **The analogy** — point-and-shoot vs. DSLR · automatic vs. manual transmission. Easier to drive. Narrower range.

3. **Where Claude Code still wins** — persistent docs (`CLAUDE.md`, `design_conventions.md`, requirements), Git-based version control, fine-grained harness, reproducible builds.

**Image spec (a3-camera-car-analogy.png):**
- **Concept:** Two-by-one grid of analogy pairs.
- **Top row:** "Point-and-shoot" camera (simple icon) ↔ "DSLR" camera (icon with visible lens/dials). Labeled under each.
- **Bottom row:** "Automatic" gear shift icon (P-R-N-D stub) ↔ "Manual" gear shift icon (H-pattern stub).
- **Between each pair:** A thin vertical bar separator, no arrow — these are peer comparisons, not progressions.
- **Caption underneath the grid:** "Claude Design → easier to drive · Claude Code → wider range"
- **Style:** Flat line icons, 2-color (blue + gray), consistent stroke weight.

---

## Slide#14 · Q4 *(NEW — question prompt card)*

**Eyebrow:** QUESTION 04
**Title:** Do we still need Figma?

---

## Slide#15 (was A4) · Callout — Figma + Claude Design coexist *(NEW)* ⭐

**Eyebrow:** ANSWER 04 · YES, FOR NOW
**Headline (big):**
> Yes — they do different jobs.

**Two-column body:**

| Figma | Claude Design |
|---|---|
| **Design tool** | **Design production tool** |
| Ideation. Detail polish. Pixel-level craft. | Fast mockups. Prototypes. Slide/one-pager output. |
| Shared component libraries, plugins, community. | AI-generated scaffolding, one-click variations. |

**Integration note (full-width strip under the table):**
Figma's MCP bridges the two — export a Claude Design output into a Figma file for final touch, or import a legacy Figma project as context for Claude Code to build on.

**Footer line (1 sentence):**
No matter how tech grows, painters still need pens and canvas.

**Image spec (a4-figma-mcp-flow.png):**
- **Concept:** A bidirectional flow diagram with 3 nodes.
- **Left node:** Claude Code (terminal-window icon, labeled).
- **Center node:** Figma MCP (small plug/bridge icon, labeled "MCP bridge").
- **Right node:** Figma file (Figma-logo-shaped card, labeled).
- **Arrows:** Two curved bidirectional arrows between Claude Code ↔ MCP ↔ Figma, each labeled:
  - Export direction: "Claude Design output → polish in Figma"
  - Import direction: "Legacy Figma project → context for Claude Code"
- **Style:** Horizontal layout, flat line, template blue for the bridge + gray for end-nodes, subtle curved arrows.

---

## Slide#16 · Q4's supporting slide
*(Reused — old Slide#19 "Figma official skills", no change.)*

---

## Slides#17–26 · Hands-on walkthrough
*(Reused — all 10 slides of old Slides#8–17 "Hands-on" section. Old #10 is the section subtitle page, kept.)*

---

## Slide#27 · Conclusion
*(Reused — old Slide#21, no change.)*

---

## Slide#28 · What's Next
*(Reused — old Slide#20, no change.)*

---

## Slide#29 · Ryan Mather quote
*(Reused — old Slide#22, no change.)*

---

## Slide#30 · References *(NEW)*

**Eyebrow:** APPENDIX
**Title:** References

**List (clean citations, clickable in PPTX):**

1. **Anthropic.** *Introducing Claude Design by Anthropic Labs.*
   https://www.anthropic.com/news/claude-design-anthropic-labs

2. **Claude (@claudeai).** Launch post on X. April 2026.
   https://x.com/claudeai/status/2045156267690213649

3. **Ryan Mather (@Flomerboy).** *Tips for getting the best results out of Claude Design.* X thread, April 2026.
   https://x.com/Flomerboy/status/2045162321589252458

4. **Anthropic.** *Claude Design.* https://claude.ai/design

5. **Figma.** *Figma Skills: Code to design workflows.*
   https://www.figma.com/community/skills

6. **Rasmus Andersson (@rsms).** Quote on design vs. design-production tools. X post, April 2026.
   https://x.com/rsms/status/2045239193971179851

**Image spec:** No image. Two-column list, small eyebrow, small font. Appendix-style.

---

## Decisions confirmed (2026-04-21)

- Hands-on section: keep all 10 slides, nothing dropped (old #10 = section subtitle page).
- Image style: **filled flat shapes** (template blue + accent).
- Rasmus source: https://x.com/rsms/status/2045239193971179851 — added to References.

Total deck: **31 slides** (1 cover + 30 numbered).

---

## Open questions for you before Phase B

### 1. Hands-on slides — which 2 of 10 to drop?

Old deck's hands-on section has 10 slides (old #8–17). Draft 2 allocates 8 slots (Slide#13–20 in your numbering). Candidates to drop:

| Old# | Slide | Drop candidate? |
|------|-------|-----------------|
| 8 | Hands-on section divider | keep — it's the section opener |
| 9 | Design System (overview) | keep — sets up what follows |
| 10 | Hands-on (title card, currently empty) | **drop candidate 1** — you flagged Slide 10 as "untitled空白頁" yesterday |
| 11 | Design system import | keep |
| 12 | Design system import – result | keep |
| 13 | Start to design | keep |
| 14 | Sketch canva | keep |
| 15 | Before starting – design decisions | keep |
| 16 | Before starting – design decisions (duplicate) | **drop candidate 2** — yesterday's notes called it a near-duplicate |
| 17 | Outcome | keep |

Proposal: drop #10 and #16. → 8 slides for Slide#13–20. OK?

### 2. Image style preference

All 4 callout images described above assume **flat 2-color line icons** (template blue + neutral gray). Alternatives:

- **A. Flat line icons** (current proposal) — minimalist, reads fast, matches template
- **B. Filled flat shapes** — slightly more playful, uses template accent colors
- **C. Isometric 3D** — more polished but heavier, may clash with TrendLife template
- **D. Real screenshots composited** (for a1 — actual terminal + actual GitHub Desktop; for a4 — actual Figma + Claude Design UI) — most concrete but slower to produce

Preferred?

### 3. Rasmus quote on References slide

The Rasmus Andersson quote on old Slide#21 (Conclusion) — do you have the exact source URL? If not, I'll omit it from References and just credit inline on Slide#25 as-is.

---

## Next step

Once the above three questions are answered, I'll move to **Phase B** (produce the 4 PNGs) and then **Phase C** (python-pptx rebuild).
