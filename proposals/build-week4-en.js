// Week 4 — English-only build. Captures user edits to slides 2/3/4 from restored deck.
// Output: week4-en.pptx (21 slides, English-only).
// Run: node build-week4-en.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x10";
pres.author = "Karen Shen";
pres.title = "Talking to Claude Code for Git × design-pr-review — Week 4";

// ---------- Palette ----------
const C = {
  bg: "F6EFE8",
  bgSection: "153242",
  bgQuestion: "AFE0EF",
  bgWarning: "FFF7ED",
  primary: "D71920",
  accent: "0690A7",
  ink: "222222",
  text: "555555",
  muted: "8E8E8E",
  subtle: "ADADAD",
  line: "E5E0D8",
  rowAlt: "F0E8DC",
  figmaBg: "E7E5FE",
  figmaText: "5B5BD6",
  gitBg: "FFE5E6",
  gitText: "D71920",
  warningBg: "FEB912",
  warningText: "8A6510",
  greenBg: "CDE9DC",
  greenText: "0F7A4F",
  white: "FFFFFF",
  burgundy: "450105",
  skyDeep: "0690A7",
  dangerBg: "FEF2F2",
  dangerText: "DC2626",
  dangerBorder: "FCA5A5",
};

const FONT = "Calibri";

// ---------- Helpers ----------
function addEyebrow(slide, label, color) {
  slide.addText(label.toUpperCase(), {
    x: 0.6, y: 0.45, w: 9, h: 0.25,
    fontSize: 10, fontFace: FONT, bold: true,
    color: color || C.primary,
    align: "left", valign: "middle", charSpacing: 3, margin: 0,
  });
}

function addTitleEn(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.6, y: 0.82, w: 9.4, h: 0.62,
    fontSize: 28, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 1.44, w: 9.4, h: 0.28,
      fontSize: 13, fontFace: FONT, italic: true,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });
  }
}

function hLine(slide, y, x, w) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x || 0.6, y, w: w || 9, h: 0.004,
    fill: { color: C.line }, line: { color: C.line, width: 0 },
  });
}

function box(slide, x, y, w, h, bg, border) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: bg },
    line: border ? { color: border, width: 1 } : { color: bg, width: 0 },
    rectRadius: 0.1,
  });
}

function sayHeader(slide, y) {
  slide.addText("What you want", {
    x: 0.6, y, w: 2.7, h: 0.26,
    fontSize: 11, fontFace: FONT, bold: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  slide.addText("Say this", {
    x: 3.4, y, w: 3.25, h: 0.26,
    fontSize: 11, fontFace: FONT, bold: true, color: C.greenText,
    align: "left", valign: "middle", margin: 0,
  });
  slide.addText("Don't say + consequence", {
    x: 6.75, y, w: 3.15, h: 0.26,
    fontSize: 11, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(slide, y + 0.32);
}

// Entry can be:
//   - string                      → single line, English-only (for commands/code)
//   - { zh, en }                  → two-line bilingual (ZH on top, EN italic muted below)
const ENTRY_H_SINGLE = 0.34;
const ENTRY_H_BILINGUAL = 0.50;

function entryHeight(e) {
  return (typeof e === "object" && e !== null) ? ENTRY_H_BILINGUAL : ENTRY_H_SINGLE;
}

function renderEntry(slide, x, y, w, mark, markColor, entry, bodyColor) {
  slide.addText(mark, {
    x, y, w: 0.25, h: 0.28,
    fontSize: 12, fontFace: FONT, bold: true, color: markColor,
    align: "left", valign: "top", margin: 0,
  });
  if (typeof entry === "object" && entry !== null) {
    slide.addText(entry.zh, {
      x: x + 0.25, y, w: w - 0.25, h: 0.26,
      fontSize: 10.5, fontFace: FONT, color: bodyColor,
      align: "left", valign: "top", margin: 0,
    });
    slide.addText(entry.en, {
      x: x + 0.25, y: y + 0.24, w: w - 0.25, h: 0.22,
      fontSize: 9, fontFace: FONT, italic: true, color: C.muted,
      align: "left", valign: "top", margin: 0,
    });
  } else {
    slide.addText(entry, {
      x: x + 0.25, y, w: w - 0.25, h: 0.30,
      fontSize: 10.5, fontFace: FONT, color: bodyColor,
      align: "left", valign: "middle", margin: 0,
    });
  }
}

function sayRow(slide, y, want, sayList, dontList) {
  slide.addText(want.zh || want, {
    x: 0.6, y, w: 2.7, h: 0.28,
    fontSize: 12, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  if (want.en) {
    slide.addText(want.en, {
      x: 0.6, y: y + 0.28, w: 2.7, h: 0.22,
      fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  }
  let cursor = y;
  sayList.forEach((s) => {
    const h = entryHeight(s);
    renderEntry(slide, 3.4, cursor, 3.25, "✓", C.greenText, s, C.ink);
    cursor += h;
  });
  cursor = y;
  dontList.forEach((d) => {
    const h = entryHeight(d);
    renderEntry(slide, 6.75, cursor, 3.15, "✗", C.dangerText, d, C.text);
    cursor += h;
  });
}

function sayRowWithImpact(slide, y, rowH, want, sayList, dontPhrase, impact) {
  slide.addText(want.zh || want, {
    x: 0.6, y, w: 2.7, h: 0.28,
    fontSize: 12, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  if (want.en) {
    slide.addText(want.en, {
      x: 0.6, y: y + 0.28, w: 2.7, h: 0.22,
      fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  }

  const innerY = y + 0.35;

  let cursor = innerY;
  sayList.forEach((s) => {
    renderEntry(slide, 3.4, cursor, 3.25, "✓", C.greenText, s, C.ink);
    cursor += entryHeight(s);
  });

  // ✗ phrase (bilingual support via { zh, en })
  if (typeof dontPhrase === "object" && dontPhrase !== null) {
    slide.addText("✗", {
      x: 6.75, y: innerY, w: 0.25, h: 0.28,
      fontSize: 12, fontFace: FONT, bold: true, color: C.dangerText,
      align: "left", valign: "top", margin: 0,
    });
    slide.addText(dontPhrase.zh, {
      x: 7.0, y: innerY, w: 2.9, h: 0.26,
      fontSize: 10.5, fontFace: FONT, bold: true, color: C.dangerText,
      align: "left", valign: "top", margin: 0,
    });
    slide.addText(dontPhrase.en, {
      x: 7.0, y: innerY + 0.24, w: 2.9, h: 0.22,
      fontSize: 9, fontFace: FONT, italic: true, color: C.muted,
      align: "left", valign: "top", margin: 0,
    });
  } else {
    slide.addText("✗", {
      x: 6.75, y: innerY, w: 0.25, h: 0.28,
      fontSize: 12, fontFace: FONT, bold: true, color: C.dangerText,
      align: "left", valign: "middle", margin: 0,
    });
    slide.addText(dontPhrase, {
      x: 7.0, y: innerY, w: 2.9, h: 0.28,
      fontSize: 10.5, fontFace: FONT, bold: true, color: C.dangerText,
      align: "left", valign: "middle", margin: 0,
    });
  }

  const impactY = innerY + (typeof dontPhrase === "object" ? 0.52 : 0.32);
  const impactH = Math.max(0.32, rowH - (impactY - y) - 0.08);
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.75, y: impactY, w: 3.15, h: impactH,
    fill: { color: C.dangerBg }, line: { color: C.dangerBorder, width: 0.75 }, rectRadius: 0.05,
  });
  slide.addText("⚠ " + impact, {
    x: 6.85, y: impactY + 0.04, w: 2.95, h: impactH - 0.08,
    fontSize: 9, fontFace: FONT, italic: true, color: C.dangerText,
    align: "left", valign: "top", margin: 0, wrap: true,
  });

  hLine(slide, y + rowH - 0.05);
}

// ==========================================================
// Slide 1 — Cover
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 2.2, w: 1.1, h: 0.36,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 }, rectRadius: 0.18,
  });
  s.addText("Week 4 / 6", {
    x: 0.8, y: 2.2, w: 1.1, h: 0.36,
    fontSize: 11, fontFace: FONT, bold: true,
    color: C.white, align: "center", valign: "middle", margin: 0,
  });
  s.addText("Talking to Claude Code for Git", {
    x: 0.8, y: 2.65, w: 9.2, h: 0.7,
    fontSize: 36, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  s.addText("and design-pr-review v2", {
    x: 0.8, y: 3.35, w: 9.2, h: 0.5,
    fontSize: 22, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 4.0, w: 0.6, h: 0.04,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("GitHub for UI Designers", {
    x: 0.8, y: 4.1, w: 9, h: 0.3,
    fontSize: 12, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 2 — Agenda  (user edit: B title is just "design-pr-review skill")
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Agenda");
  addTitleEn(s, "What we'll cover today");

  const parts = [
    {
      label: "A", color: C.primary, bg: C.gitBg,
      title: "Talking to Claude Code about Git",
      subtitle: "Six topics × Say / Don't say",
      items: ["Three-week topic map", "Six topics × Say / Don't say", "Phrases to always avoid + safety zones"],
    },
    {
      label: "B", color: C.figmaText, bg: C.figmaBg,
      title: "design-pr-review skill",
      subtitle: "deep dive",
      items: ["Three-stage breakdown + Demo", "Handoff to pr-comment", "Battle-tested cases + boundaries"],
      isMain: true,
    },
  ];

  hLine(s, 2.02);

  parts.forEach((p, i) => {
    const y = 2.4 + i * 1.9;

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: y + 0.1, w: 0.46, h: 0.46,
      fill: { color: p.isMain ? C.primary : p.bg },
      line: { color: p.isMain ? C.primary : p.bg, width: 0 }, rectRadius: 0.1,
    });
    s.addText(p.label, {
      x: 0.6, y: y + 0.1, w: 0.46, h: 0.46,
      fontSize: 17, fontFace: FONT, bold: true,
      color: p.isMain ? C.white : p.color,
      align: "center", valign: "middle", margin: 0,
    });

    s.addText(p.title, {
      x: 1.25, y, w: 3.6, h: 0.36,
      fontSize: 17, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.subtitle, {
      x: 1.25, y: y + 0.36, w: 3.6, h: 0.24,
      fontSize: 10.5, fontFace: FONT, italic: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });

    p.items.forEach((item, si) => {
      s.addShape(pres.shapes.OVAL, {
        x: 5.2, y: y + si * 0.34 + 0.12, w: 0.08, h: 0.08,
        fill: { color: p.isMain ? C.primary : p.color },
        line: { color: p.isMain ? C.primary : p.color, width: 0 },
      });
      s.addText(item, {
        x: 5.4, y: y + si * 0.34, w: 4.5, h: 0.32,
        fontSize: 12.5, fontFace: FONT,
        color: p.isMain ? C.primary : C.text,
        bold: p.isMain,
        align: "left", valign: "middle", margin: 0,
      });
    });

    hLine(s, y + 1.7);
  });
}

// ==========================================================
// Slide 3 — Section A divider  (user edit: "Github operation" + simpler main title)
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgSection };
  addEyebrow(s, "Part A  ·  AI × Git", C.white);

  s.addText("GitHub operation", {
    x: 0.8, y: 1.5, w: 8.5, h: 0.6,
    fontSize: 22, fontFace: FONT, italic: true, color: "D0DEFF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Talking to Claude Code", {
    x: 0.8, y: 2.1, w: 8.5, h: 1.1,
    fontSize: 48, fontFace: FONT, bold: true, color: C.white,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("From concepts to AI-friendly phrasing", {
    x: 0.8, y: 3.25, w: 8.5, h: 0.4,
    fontSize: 18, fontFace: FONT, italic: true, color: "B8CCFF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.85, w: 1.0, h: 0.04,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  s.addText("Extension of Week 2 #17 + #21 — Six topics × Say / Don't say", {
    x: 0.8, y: 3.95, w: 8.5, h: 0.3,
    fontSize: 13, fontFace: FONT, color: "B8CCFF",
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 4 — Three-week mini-map  (user edit: removed intro + Type A/B/C pill)
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Three-week recap  —  01");
  addTitleEn(s, "What we've covered", "Three-week topic map");

  hLine(s, 2.2);

  const weeks = [
    {
      label: "Week 1", color: C.muted,
      title: "What is Git + why designers care",
      topics: ["Git / GitHub basics", "Why version control"],
    },
    {
      label: "Week 2", color: C.figmaText,
      title: "Working inside a repo",
      topics: ["Clone / Setup", "Branch / Switch", "Push / Pull / Reject"],
    },
    {
      label: "Week 3", color: C.primary,
      title: "Git vocabulary + Working repo types",
      topics: ["Commit vs Push", "Staged / Stash / Discard", "PR / Merge / Conflict"],
    },
  ];

  weeks.forEach((w, i) => {
    const y = 2.5 + i * 1.45;

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y, w: 1.2, h: 0.42,
      fill: { color: w.color }, line: { color: w.color, width: 0 }, rectRadius: 0.08,
    });
    s.addText(w.label, {
      x: 0.6, y, w: 1.2, h: 0.42,
      fontSize: 12, fontFace: FONT, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    s.addText(w.title, {
      x: 2.0, y, w: 7.6, h: 0.42,
      fontSize: 15, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });

    let px = 2.0;
    w.topics.forEach((t) => {
      const pw = 0.32 + t.length * 0.10;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: px, y: y + 0.55, w: pw, h: 0.34,
        fill: { color: C.white }, line: { color: w.color, width: 1 }, rectRadius: 0.17,
      });
      s.addText(t, {
        x: px, y: y + 0.55, w: pw, h: 0.34,
        fontSize: 10.5, fontFace: FONT, color: w.color, bold: true,
        align: "center", valign: "middle", margin: 0,
      });
      px += pw + 0.12;
    });

    if (i < weeks.length - 1) hLine(s, y + 1.18);
  });
}

// ==========================================================
// Slide 5 — Clone / Setup + consequence
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Clone / Setup  —  02");
  addTitleEn(s, "Cloning and connecting a repo", "What to say, what to avoid");

  s.addText("Bad phrasing sends AI down a different path — the consequence column shows what actually goes wrong.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.22);

  sayRowWithImpact(s, 2.62, 1.30,
    { zh: "把 repo 抓下來", en: "Clone a repo" },
    [{ zh: "「clone trendlife-general/hie-rei」", en: '"clone trendlife-general/hie-rei"' }],
    { zh: "「下載這個」", en: '"download this"' },
    "AI may trigger GitHub's web Download ZIP — you get a zip with no .git, no remote. commit / push / pull all fail."
  );

  sayRowWithImpact(s, 3.92, 1.30,
    { zh: "把本機資料夾接到 GitHub", en: "Connect local folder to GitHub" },
    [{ zh: "「把資料夾連到 GitHub 上的 <org/repo>」", en: '"connect this folder to GitHub <org/repo>"' }],
    { zh: "「設成我的 repo」", en: '"make it my repo"' },
    '"Make it" → AI guesses fork / init / rename. "My" → personal GitHub or local? Worst case: fork the wrong repo, or git init clobbers history.'
  );

  sayRowWithImpact(s, 5.22, 1.30,
    { zh: "指代陷阱（全主題通用）", en: "Reference traps (any topic)" },
    [{ zh: "repo / branch / 檔名直接念出來", en: "Spell out repo / branch / file names" }],
    { zh: "「這個 / 那個 / 連結這個 repo」", en: '"this / that / link this repo"' },
    "AI grabs whichever repo was last mentioned in chat — likely not the one you mean now."
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule: name the repo / file / branch explicitly. Verbs must be precise (clone / fork / init are different).", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 6 — Branch / Switch
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Branch / Switch  —  03");
  addTitleEn(s, "Branching and switching", "Open, switch, check, delete");

  s.addText("Week 2 #17 expanded — with a \"don't say\" column added.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.3);

  sayRow(s, 2.72,
    { zh: "開新 branch 開始工作", en: "Start a new branch" },
    [{ zh: "「開一條 branch 叫 feature/header-redesign」", en: '"open branch feature/header-redesign"' }],
    [{ zh: "「開個分支」（沒名字 AI 會自己編）", en: '"open a branch" (no name — AI invents one)' }]
  );
  hLine(s, 3.45);

  sayRow(s, 3.62,
    { zh: "切到別的 branch", en: "Switch branches" },
    [{ zh: "「切到 main」", en: '"switch to main"' }],
    [{ zh: "「換到那個」「切回去」（指代不清）", en: '"switch to that one" / "switch back" (ambiguous)' }]
  );
  hLine(s, 4.35);

  sayRow(s, 4.52,
    { zh: "看目前在哪", en: "Check current branch" },
    [{ zh: "「我現在在哪條 branch？」", en: '"which branch am I on?"' }],
    [{ zh: "「看一下狀況」（範圍太廣）", en: '"look at the situation" (too broad)' }]
  );
  hLine(s, 5.25);

  sayRow(s, 5.42,
    { zh: "刪掉不要的 branch", en: "Delete a branch" },
    [{ zh: "「刪掉 feature/abandoned 這條 branch（local）」", en: '"delete branch feature/abandoned (local)"' }],
    [{ zh: "「清掉舊的」「整理一下」（不知刪哪條）", en: '"clean up the old ones" / "tidy up" (which one?)' }]
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule: spell out branch names. Say local or remote.", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 7 — Commit / Push + consequence
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Commit / Push  —  04");
  addTitleEn(s, "Recording changes and pushing", "Wrong word, wrong action");

  s.addText("Commit and push are two different actions — vague words make AI do something else; worst case, lose changes or push to the wrong branch.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.32,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.26);

  sayRowWithImpact(s, 2.62, 1.30,
    { zh: "把改動 commit", en: "Commit changes" },
    [{ zh: "「把這次改動 commit，message：<x>」", en: '"commit this with message: <x>"' }],
    { zh: "「存檔」", en: '"save it"' },
    "AI may run git stash (changes go to the stash, no commit record) or only git add. You think it's pushed; the remote sees nothing."
  );

  sayRowWithImpact(s, 3.92, 1.30,
    { zh: "推上 GitHub", en: "Push to remote" },
    [{ zh: "「push 到我這條 branch」", en: '"push to my branch"' }],
    { zh: "「上傳 / 同步上去」", en: '"upload / sync it up"' },
    "AI may run git push --all (push every branch), push to the wrong remote, or add --force on conflict. Worst case: WIP with secrets pushed to a public repo."
  );

  sayRowWithImpact(s, 5.22, 1.30,
    { zh: "拉同事的最新版", en: "Pull latest" },
    [{ zh: "「拉一下 main 最新的」", en: '"pull latest main"' }],
    { zh: "「更新一下」", en: '"update it"' },
    "AI may run git pull --rebase (rebase your unpushed commits), or git reset --hard origin/main (local uncommitted changes gone, unrecoverable)."
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule: commit / push / pull / log are separate verbs. Be precise so AI can't guess the scope.", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 8 — Staged / Discard / Stash
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Staged / Discard / Stash  —  05");
  addTitleEn(s, "Controlling the scope of a commit", "Stage, discard, stash");

  s.addText("This group is the easiest to wreck — \"clean / reset\" deletes changes. Always be explicit about scope.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.3);

  sayRow(s, 2.72,
    { zh: "只把某幾個檔加進 commit", en: "Stage specific files" },
    [{ zh: "「把 src/foo.tsx 加進這次 commit」", en: '"stage src/foo.tsx for this commit"' }],
    [{ zh: "「加進去」「全選」（哪個？）", en: '"add it" / "select all" (which?)' }]
  );
  hLine(s, 3.45);

  sayRow(s, 3.62,
    { zh: "丟掉某個檔的改動", en: "Discard a file's changes" },
    [{ zh: "「丟掉 settings.html 的改動」", en: '"discard changes to settings.html"' }],
    [{ zh: "「reset」「清掉」「回到原本」（範圍太大）", en: '"reset" / "clear it" / "go back" (too broad)' }]
  );
  hLine(s, 4.35);

  sayRow(s, 4.52,
    { zh: "暫存目前狀態等等回來", en: "Stash work-in-progress" },
    [{ zh: "「把目前狀態 stash 起來等等回來」", en: '"stash this and come back to it"' }],
    [{ zh: "「先放著」「先存著」（會被當 commit）", en: '"keep it aside" / "save it for now"' }]
  );
  hLine(s, 5.25);

  sayRow(s, 5.42,
    { zh: "拿回 stash 的東西", en: "Restore stashed work" },
    [{ zh: "「把剛剛 stash 的拿回來」", en: '"bring back the last stash"' }],
    [{ zh: "「之前那個」（哪一個 stash？）", en: '"that earlier one" (which stash?)' }]
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.dangerBg, C.dangerText);
  s.addText("⚠  Rule: \"discard / clear\" permanently deletes changes — commit or stash before saying it.", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.dangerText,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 9 — PR / Merge / Conflict
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  PR / Merge / Conflict  —  06");
  addTitleEn(s, "Pull requests, merging, conflicts", "Name the verb you actually mean");

  s.addText('"Merge" is ambiguous — branch merge? PR merge? squash? rebase? Always name the action.', {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.3);

  sayRow(s, 2.72,
    { zh: "開 PR", en: "Open a pull request" },
    [{ zh: "「開 PR 把 feature/x 合進 main，title：<x>」", en: '"open PR from feature/x into main, title: <x>"' }],
    [{ zh: "「送出去 review」（送哪？）", en: '"send it out for review" (send where?)' }]
  );
  hLine(s, 3.45);

  sayRow(s, 3.62,
    { zh: "把 main 最新的併進來", en: "Bring main into branch" },
    [{ zh: "「幫我把 PR #310 rebase 到 main」", en: '"rebase PR #310 onto main"' }],
    [{ zh: "「同步一下」「更新分支」（rebase 還 merge？）", en: '"sync it up" / "update the branch" (rebase or merge?)' }]
  );
  hLine(s, 4.35);

  sayRow(s, 4.52,
    { zh: "解 conflict", en: "Resolve a conflict" },
    [{ zh: "「解這個 conflict，保留我這邊（ours）」", en: '"resolve this conflict, keep mine (ours)"' }],
    [{ zh: "「處理一下」（保留誰？）", en: '"deal with it" (keep whose?)' }]
  );
  hLine(s, 5.25);

  sayRow(s, 5.42,
    { zh: "PR merge 進 main", en: "Merge the PR" },
    [{ zh: "「PR #310 squash merge」", en: '"squash merge PR #310"' }],
    [{ zh: "「合進去」（squash？rebase？merge commit？）", en: '"merge it in" (squash? rebase? merge commit?)' }]
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText('Rule: never say "merge" alone — always pair it with squash / merge / rebase.', {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 10 — Working Repo Type A / B / C
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Working Repo A / B / C  —  07");
  addTitleEn(s, "Three repo types, three ways to talk", "Different repo, different phrasing");

  s.addText("From Week 3 Part C — the type of repo you're in changes how you talk to AI.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.3);

  sayRow(s, 2.72,
    { zh: "A  協作 repo（你有寫入）", en: "A  Collaboration (you can write)" },
    [{ zh: "「開 PR 把 <branch> 合進 main」", en: '"open a PR to merge <branch> into main"' }],
    [{ zh: "「直接 push 到 main」（會被擋）", en: '"push directly to main" (blocked)' }]
  );
  hLine(s, 3.45);

  sayRow(s, 3.62,
    { zh: "B  引用 repo（你是讀者）", en: "B  Reference (DS, guidelines)" },
    [{ zh: "「同步最新的 design system tokens」", en: '"sync the latest design system tokens"' }],
    [{ zh: "「我要改」（沒寫入權限，AI 還是會試）", en: '"I want to edit" (no write access — AI tries anyway)' }]
  );
  hLine(s, 4.35);

  sayRow(s, 4.52,
    { zh: "C  個人 repo", en: "C  Personal repo" },
    [{ zh: "「commit + push，message：<x>」", en: '"commit + push, message: <x>"' }],
    [{ zh: "—（個人 repo 約束最少）", en: "— (personal repos have the fewest constraints)" }]
  );
  hLine(s, 5.25);

  sayRow(s, 5.42,
    { zh: "搞不清楚是哪一種", en: "Not sure which type" },
    [{ zh: "「我有這個 repo 的寫入權限嗎？」", en: '"do I have write access to this repo?"' }],
    [{ zh: "直接動手（可能踩權限或 review 規範）", en: "Just acting — may trip permissions / review rules" }]
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule: identify which type of repo you're in before acting. Decide whether a PR is required.", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 11 — Never say + force push consequence
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Never Say  —  08", C.dangerText);
  addTitleEn(s, "Phrases that trigger destructive actions", "Words that map to --force / reset --hard / rm -rf");

  s.addText("These phrases make AI run --force / reset --hard / rm -rf — unrecoverable.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // LEFT — don't-say list
  s.addText("Phrases to avoid", {
    x: 0.6, y: 2.4, w: 4.4, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });

  const dontSay = [
    '"force push it"',
    '"just push it"',
    '"just overwrite"',
    '"start over"',
    '"delete everything"',
    '"--force / --force-with-lease"',
  ];
  dontSay.forEach((phrase, i) => {
    const y = 2.78 + i * 0.46;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y, w: 4.4, h: 0.38,
      fill: { color: C.dangerBg }, line: { color: C.dangerBorder, width: 0.75 }, rectRadius: 0.05,
    });
    s.addText("✗", {
      x: 0.7, y, w: 0.3, h: 0.38,
      fontSize: 14, fontFace: FONT, bold: true, color: C.dangerText,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(phrase, {
      x: 1.05, y, w: 3.3, h: 0.38,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // RIGHT — force push consequence
  s.addText("Why it breaks — force push consequence", {
    x: 5.2, y: 2.4, w: 4.4, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });

  s.addText("Before:", {
    x: 5.2, y: 2.9, w: 1, h: 0.24,
    fontSize: 10, fontFace: FONT, bold: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "● ─ ● ─ ", options: { color: C.primary, bold: true } },
    { text: "▲", options: { color: C.dangerText, bold: true } },
  ], {
    x: 6.1, y: 2.9, w: 3.5, h: 0.3,
    fontSize: 18, fontFace: "Consolas",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("(▲ = teammate's just-pushed commit)", {
    x: 5.2, y: 3.25, w: 4.4, h: 0.22,
    fontSize: 9, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  s.addText("AI force push ↓", {
    x: 5.2, y: 3.6, w: 4.4, h: 0.26,
    fontSize: 11, fontFace: FONT, italic: true, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });

  s.addText("After:", {
    x: 5.2, y: 3.95, w: 1, h: 0.24,
    fontSize: 10, fontFace: FONT, bold: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "● ─ ● ─ ", options: { color: C.primary, bold: true } },
    { text: "●", options: { color: "F59E0B", bold: true } },
    { text: " ─ ", options: { color: C.subtle } },
    { text: "●", options: { color: "F59E0B", bold: true } },
  ], {
    x: 6.1, y: 3.95, w: 3.5, h: 0.3,
    fontSize: 18, fontFace: "Consolas",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("(▲ gone — overwritten by your commits)", {
    x: 5.2, y: 4.3, w: 4.4, h: 0.22,
    fontSize: 9, fontFace: FONT, italic: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2, y: 4.75, w: 4.4, h: 0.5,
    fill: { color: "FEE2E2" }, line: { color: C.dangerText, width: 0.75 }, rectRadius: 0.05,
  });
  s.addText("Teammate's commit vanishes from remote — only reflog can save it", {
    x: 5.2, y: 4.75, w: 4.4, h: 0.5,
    fontSize: 10.5, fontFace: FONT, bold: true, color: C.dangerText,
    align: "center", valign: "middle", margin: 0,
  });

  box(s, 0.6, 6.55, 8.8, 0.42, C.dangerBg, C.dangerText);
  s.addText("If you really must force push — use --force-with-lease, and run the command yourself. Don't let AI translate it.", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 11.5, fontFace: FONT, bold: true, color: C.dangerText,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 12 — Auto vs Confirm
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Auto vs Confirm  —  09");
  addTitleEn(s, "Auto-run vs Confirm-first", "Reversibility decides who pulls the trigger");

  s.addText("Reversibility decides whether to pause — irreversible actions always need confirmation.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // LEFT — Auto-run
  box(s, 0.6, 2.4, 4.3, 4.0, C.greenBg, C.greenText);
  s.addText("✓  Let AI run it", {
    x: 0.78, y: 2.54, w: 4.0, h: 0.34,
    fontSize: 14, fontFace: FONT, bold: true, color: C.greenText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Safe — read-only or trivially reversible", {
    x: 0.78, y: 2.84, w: 4.0, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 3.12, 0.78, 4.0);

  const safe = [
    "`git status`",
    "`git diff` / `git diff --staged`",
    "`git log` / `git show`",
    "`git branch -l` / `gh pr list`",
    "`git fetch` (no working dir change)",
    "`gh pr view <num>`",
  ];
  safe.forEach((cmd, i) => {
    s.addText("• " + cmd, {
      x: 0.85, y: 3.25 + i * 0.4, w: 4.0, h: 0.36,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0,
    });
  });

  // RIGHT — Confirm first
  box(s, 5.1, 2.4, 4.3, 4.0, C.dangerBg, C.dangerText);
  s.addText("⚠  Confirm first", {
    x: 5.28, y: 2.54, w: 4.0, h: 0.34,
    fontSize: 14, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Destructive or hard-to-reverse", {
    x: 5.28, y: 2.84, w: 4.0, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 3.12, 5.28, 4.0);

  const danger = [
    "`git push` / `git push --force-with-lease`",
    "`git reset --hard` / `git clean -fd`",
    "`git rebase --onto` / wide rebase",
    "`git branch -D` / `git tag -d`",
    "`rm -rf` / file delete",
    "`gh pr merge` / any merge action",
  ];
  danger.forEach((cmd, i) => {
    s.addText("• " + cmd, {
      x: 5.35, y: 3.25 + i * 0.4, w: 4.0, h: 0.36,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0,
    });
  });

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule: let agent run reads. For writes — confirm, view diff, then yes.", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 13 — Section B divider
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgSection };
  addEyebrow(s, "Part B  ·  design-pr-review skill", C.white);

  s.addText("design-pr-review skill", {
    x: 0.8, y: 1.5, w: 8.5, h: 1.0,
    fontSize: 46, fontFace: FONT, bold: true, color: C.white,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Automating the design PR review steps", {
    x: 0.8, y: 2.5, w: 8.5, h: 0.48,
    fontSize: 22, fontFace: FONT, italic: true, color: "D0DEFF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.15, w: 1.0, h: 0.04,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  s.addText("Scope → Side-by-side → Violation flag + Multi-author scan", {
    x: 0.8, y: 3.28, w: 8.5, h: 0.3,
    fontSize: 13, fontFace: FONT, color: "B8CCFF",
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 14 — Setup / trigger
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Setup  —  01");
  addTitleEn(s, "How to trigger the skill", "Already in hie-rei main");

  s.addText("Already built into hie-rei main — no install. Just trigger it.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  const triggers = [
    { kind: "Slash command", value: "/design-pr-review <PR-number>" },
    { kind: "Natural language", value: "review this design PR #321" },
    { kind: "Casual phrasing", value: "help me review the design in PR #321" },
  ];

  triggers.forEach((t, i) => {
    const y = 2.5 + i * 0.85;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y, w: 2.2, h: 0.65,
      fill: { color: C.figmaBg }, line: { color: C.figmaBg, width: 0 }, rectRadius: 0.08,
    });
    s.addText(t.kind, {
      x: 0.6, y, w: 2.2, h: 0.65,
      fontSize: 12, fontFace: FONT, bold: true, color: C.figmaText,
      align: "center", valign: "middle", margin: 0,
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 2.95, y, w: 6.4, h: 0.65,
      fill: { color: C.white }, line: { color: C.line, width: 1 }, rectRadius: 0.08,
    });
    s.addText(t.value, {
      x: 3.1, y, w: 6.2, h: 0.65,
      fontSize: 13, fontFace: "Consolas", color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
  });

  box(s, 0.6, 5.4, 8.8, 1.1, C.greenBg, C.greenText);
  s.addText("Prerequisites", {
    x: 0.8, y: 5.5, w: 2.5, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: C.greenText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "• Your Claude Code has hie-rei cloned and checked out to main\n", options: { color: C.ink } },
    { text: "• ", options: { color: C.ink } },
    { text: "gh auth login", options: { fontFace: "Consolas", color: C.figmaText, bold: true } },
    { text: " with read access to the target repo\n", options: { color: C.ink } },
    { text: "• The PR is a design PR (HTML mockup + spec.md)", options: { color: C.ink } },
  ], {
    x: 0.8, y: 5.8, w: 8.4, h: 0.65,
    fontSize: 11, fontFace: FONT,
    align: "left", valign: "top", margin: 0,
  });

  hLine(s, 6.7);
  s.addText("Merged into hie-rei main on 5/21 · Available to the full design team · PR #291", {
    x: 0.6, y: 6.78, w: 8.8, h: 0.24,
    fontSize: 10, fontFace: FONT, italic: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 15 — Three stages
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Workflow  —  02");
  addTitleEn(s, "Three things the skill does", "Three stages, one click");

  s.addText("Each stage returns its output to you so you decide what's next — you stay in the driver's seat.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  const stages = [
    {
      n: "1", title: "Scope the PR",
      desc: "Auto-list changed files. Identify mockup vs spec.md. Filter unrelated config files.",
      output: "→ a list of changed files with each file's role labelled",
    },
    {
      n: "2", title: "Before / After Side-by-side",
      desc: "Open two browser tabs automatically — main version on the left, PR version on the right.",
      output: "→ visual diff at a glance",
    },
    {
      n: "3", title: "Violation flag + Multi-author scan",
      desc: "Surface design-system violations as questions (not verdicts). Flag files touched by multiple authors.",
      output: "→ material for your review comments",
    },
  ];

  stages.forEach((st, i) => {
    const y = 2.5 + i * 1.35;
    s.addShape(pres.shapes.OVAL, {
      x: 0.6, y, w: 0.7, h: 0.7,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });
    s.addText(st.n, {
      x: 0.6, y, w: 0.7, h: 0.7,
      fontSize: 24, fontFace: FONT, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    s.addText(st.title, {
      x: 1.5, y, w: 7.8, h: 0.36,
      fontSize: 16, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.desc, {
      x: 1.5, y: y + 0.38, w: 7.8, h: 0.36,
      fontSize: 12, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.output, {
      x: 1.5, y: y + 0.76, w: 7.8, h: 0.28,
      fontSize: 11, fontFace: FONT, italic: true, color: C.figmaText,
      align: "left", valign: "middle", margin: 0,
    });

    if (i < stages.length - 1) hLine(s, y + 1.2);
  });
}

// ==========================================================
// Slide 16 — Stage 1 Demo
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Stage 1 Demo  —  03");
  addTitleEn(s, "Stage 1 — Scope the PR", "Auto-list changed files, label roles");

  s.addText("The skill runs gh pr diff plus role detection — you don't have to crawl the diff manually.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.4, w: 6.0, h: 4.2,
    fill: { color: C.white },
    line: { color: C.subtle, width: 1, dashType: "dash" },
  });
  s.addText("\u{1F4F8}  Stage 1 screenshot (insert manually)", {
    x: 0.6, y: 4.2, w: 6.0, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("PR #320 · changed-file list after scope", {
    x: 0.6, y: 4.6, w: 6.0, h: 0.5,
    fontSize: 10.5, fontFace: FONT, color: C.subtle,
    align: "center", valign: "middle", margin: 0,
  });

  box(s, 6.8, 2.4, 2.6, 4.2, C.figmaBg, C.figmaText);
  s.addText("✓  What it does", {
    x: 6.95, y: 2.55, w: 2.3, h: 0.32,
    fontSize: 12, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 2.92, 6.95, 2.3);
  [
    "Runs `gh pr diff <num>` to get changed files",
    "Labels each file role:\nmockup / spec / asset / config",
    "Filters unrelated config files",
    "Counts commits and authors",
  ].forEach((t, i) => {
    s.addText("•  " + t, {
      x: 6.95, y: 3.1 + i * 0.78, w: 2.3, h: 0.7,
      fontSize: 10.5, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });
}

// ==========================================================
// Slide 17 — Stage 2 Demo
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Stage 2 Demo  —  04");
  addTitleEn(s, "Stage 2 — Before / After Side-by-side", "Visual diff in the browser");

  s.addText("Two browser tabs open automatically — main on the left, PR on the right. Eyes do the diffing.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.4, w: 6.0, h: 4.2,
    fill: { color: C.white },
    line: { color: C.subtle, width: 1, dashType: "dash" },
  });
  s.addText("\u{1F4F8}  Stage 2 screenshot (insert manually)", {
    x: 0.6, y: 4.2, w: 6.0, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("PR #320 · before / after side-by-side", {
    x: 0.6, y: 4.6, w: 6.0, h: 0.5,
    fontSize: 10.5, fontFace: FONT, color: C.subtle,
    align: "center", valign: "middle", margin: 0,
  });

  box(s, 6.8, 2.4, 2.6, 4.2, C.figmaBg, C.figmaText);
  s.addText("✓  What it does", {
    x: 6.95, y: 2.55, w: 2.3, h: 0.32,
    fontSize: 12, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 2.92, 6.95, 2.3);
  [
    "Checkout main on a local server",
    "Checkout PR on a second port",
    "Open both tabs side-by-side",
    "Manual scroll sync",
  ].forEach((t, i) => {
    s.addText("•  " + t, {
      x: 6.95, y: 3.1 + i * 0.62, w: 2.3, h: 0.55,
      fontSize: 10.5, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });
}

// ==========================================================
// Slide 18 — Stage 3 Demo
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Stage 3 Demo  —  05");
  addTitleEn(s, "Stage 3 — Flag as questions, not verdicts", "Plus multi-author scan");

  s.addText("The skill never decides — it asks. When multiple authors touch the same file, those points are flagged.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.4, w: 6.0, h: 4.2,
    fill: { color: C.white },
    line: { color: C.subtle, width: 1, dashType: "dash" },
  });
  s.addText("\u{1F4F8}  Stage 3 screenshot (insert manually)", {
    x: 0.6, y: 4.2, w: 6.0, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("PR #320 · DS-violation prompts + multi-author markers", {
    x: 0.6, y: 4.6, w: 6.0, h: 0.5,
    fontSize: 10.5, fontFace: FONT, color: C.subtle,
    align: "center", valign: "middle", margin: 0,
  });

  box(s, 6.8, 2.4, 2.6, 4.2, C.figmaBg, C.figmaText);
  s.addText("✓  What it does", {
    x: 6.95, y: 2.55, w: 2.3, h: 0.32,
    fontSize: 12, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 2.92, 6.95, 2.3);
  [
    "Compare with design tokens, flag suspicious values",
    "Phrases findings as questions (no verdict)",
    "Scan multi-author files for conflict points",
    "Draft friendly-tone comments",
  ].forEach((t, i) => {
    s.addText("•  " + t, {
      x: 6.95, y: 3.1 + i * 0.62, w: 2.3, h: 0.55,
      fontSize: 10.5, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });
}

// ==========================================================
// Slide 19 — pr-comment handoff
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Handoff  —  06");
  addTitleEn(s, "design-pr-review → pr-comment handoff", "Draft, review, then post");

  s.addText("design-pr-review only drafts — it never posts. You review, edit, then publish.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  const steps = [
    { title: "1. Skill runs", desc: "Outputs draft comments in a friendly tone", bg: C.figmaBg, fg: C.figmaText },
    { title: "2. You review", desc: "Remove false positives, edit wording, add your own take", bg: C.bgQuestion, fg: C.skyDeep },
    { title: "3. /pr-comment posts", desc: "Submit to the GitHub PR in one batch after confirmation", bg: C.greenBg, fg: C.greenText },
  ];

  steps.forEach((st, i) => {
    const x = 0.6 + i * 3.0;
    box(s, x, 2.5, 2.8, 1.8, st.bg, st.fg);
    s.addText(st.title, {
      x: x + 0.15, y: 2.62, w: 2.5, h: 0.36,
      fontSize: 14, fontFace: FONT, bold: true, color: st.fg,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.desc, {
      x: x + 0.15, y: 3.04, w: 2.5, h: 1.1,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
    if (i < steps.length - 1) {
      s.addText("→", {
        x: x + 2.85, y: 3.05, w: 0.2, h: 0.7,
        fontSize: 24, fontFace: FONT, bold: true, color: C.muted,
        align: "center", valign: "middle", margin: 0,
      });
    }
  });

  box(s, 0.6, 4.7, 8.8, 1.8, C.bgWarning, C.warningText);
  s.addText("Why two stages?", {
    x: 0.8, y: 4.85, w: 8.4, h: 0.32,
    fontSize: 13, fontFace: FONT, bold: true, color: C.warningText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 5.2, 0.8, 8.4);
  [
    "The skill is a co-pilot, not the driver — it drafts, but pressing send is your call",
    "PR comments email the whole team via GitHub — one typo reaches everyone",
    "Your review = wording stays clean, fits team voice, designer judgment preserved",
  ].forEach((t, i) => {
    s.addText("• " + t, {
      x: 0.85, y: 5.32 + i * 0.36, w: 8.3, h: 0.32,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
  });

  box(s, 0.6, 6.7, 8.8, 0.32, C.figmaBg, C.figmaText);
  s.addText("Trigger: /pr-comment (handoff skill, already in hie-rei main)", {
    x: 0.6, y: 6.7, w: 8.8, h: 0.32,
    fontSize: 11, fontFace: FONT, bold: true, color: C.figmaText,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 20 — Battle-tested + L1/L2 + boundaries
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Battle-tested  —  07");
  addTitleEn(s, "Three PR types tested + things it won't do", "Stress-tested cases + boundaries");

  s.addText("All three PR shapes ran through the skill — here's the metric and the boundaries.", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  s.addText("Three PRs tested", {
    x: 0.6, y: 2.4, w: 4.4, h: 0.3,
    fontSize: 13, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });

  const cases = [
    { pr: "PR #284", kind: "copy-only", note: "Pure copy — confirm no false-positive on visuals" },
    { pr: "PR #282", kind: "CSS refactor", note: "Style only, no structure — DS-token check" },
    { pr: "PR #281", kind: "large multi-screen", note: "Many screens, big change — all three stages fire" },
  ];

  cases.forEach((c, i) => {
    const y = 2.78 + i * 0.85;
    box(s, 0.6, y, 4.4, 0.75, C.white, C.line);
    s.addText(c.pr, {
      x: 0.75, y: y + 0.05, w: 1.4, h: 0.32,
      fontSize: 13, fontFace: FONT, bold: true, color: C.primary,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(c.kind, {
      x: 2.2, y: y + 0.05, w: 2.7, h: 0.32,
      fontSize: 11.5, fontFace: FONT, italic: true, color: C.figmaText,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(c.note, {
      x: 0.75, y: y + 0.38, w: 4.1, h: 0.32,
      fontSize: 10, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
  });

  box(s, 0.6, 5.5, 4.4, 1.0, C.greenBg, C.greenText);
  s.addText("L1 + L2 acceptance", {
    x: 0.8, y: 5.55, w: 4.0, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: C.greenText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "L1 ", options: { bold: true, color: C.greenText } },
    { text: "12 / 12  ", options: { fontFace: "Consolas", color: C.ink } },
    { text: "·  L2 ", options: { bold: true, color: C.greenText } },
    { text: "5 / 5", options: { fontFace: "Consolas", color: C.ink } },
  ], {
    x: 0.8, y: 5.88, w: 4.0, h: 0.34,
    fontSize: 16, fontFace: FONT,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("L1 = automated checks · L2 = designer-judged", {
    x: 0.8, y: 6.22, w: 4.0, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  box(s, 5.2, 2.4, 4.2, 4.1, C.dangerBg, C.dangerText);
  s.addText("Things the skill won't do", {
    x: 5.38, y: 2.55, w: 3.9, h: 0.32,
    fontSize: 13, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Boundaries", {
    x: 5.38, y: 2.85, w: 3.9, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 3.15, 5.38, 3.9);

  const nots = [
    "Never delivers a verdict — only questions",
    "Never auto-approves a PR",
    "Never posts directly — always via pr-comment",
    "Doesn't write the designer's critique",
    "Never replaces your judgment — co-pilot only",
  ];
  nots.forEach((n, i) => {
    s.addText("✗  " + n, {
      x: 5.38, y: 3.3 + i * 0.55, w: 3.9, h: 0.45,
      fontSize: 11.5, fontFace: FONT, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
  });
}

// ==========================================================
// Slide 21 — Key Takeaway
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Key Takeaway");
  addTitleEn(s, "Two threads, one principle", "What to walk away with");

  hLine(s, 2.0);

  const cards = [
    {
      icon: "\u{1F4AC}", title: "Speak precisely",
      detail: "Name the repo / file / branch / commit. Never \"this\" / \"that\". AI won't guess right.",
      bg: C.gitBg, fg: C.primary,
    },
    {
      icon: "\u{1F6D1}", title: "Confirm destructive actions",
      detail: "push / reset / rebase / merge / rm — always diff and confirm before pulling the trigger.",
      bg: C.dangerBg, fg: C.dangerText,
    },
    {
      icon: "\u{1F91D}", title: "Skill is co-pilot",
      detail: "design-pr-review drafts the material, pr-comment lets you publish. Judgment and ownership stay with you.",
      bg: C.figmaBg, fg: C.figmaText,
    },
  ];

  cards.forEach((c, i) => {
    const x = 0.6 + i * 3.08;
    const y = 2.3;
    const h = 3.8;
    box(s, x, y, 2.84, h, C.white, c.fg);

    box(s, x, y, 2.84, 1.0, c.bg);
    s.addText(c.icon, {
      x, y: y + 0.1, w: 2.84, h: 0.8,
      fontSize: 36, fontFace: FONT,
      align: "center", valign: "middle", margin: 0,
    });

    s.addText(c.title, {
      x, y: y + 1.15, w: 2.84, h: 0.36,
      fontSize: 17, fontFace: FONT, bold: true, color: C.ink,
      align: "center", valign: "middle", margin: 0,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 1.17, y: y + 1.6, w: 0.5, h: 0.025,
      fill: { color: c.fg }, line: { color: c.fg, width: 0 },
    });

    s.addText(c.detail, {
      x: x + 0.2, y: y + 1.75, w: 2.44, h: 1.95,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "center", valign: "top", margin: 0, wrap: true,
    });
  });

  hLine(s, 6.35);
  box(s, 0.6, 6.5, 8.8, 0.5, C.bgQuestion, C.skyDeep);
  s.addText("Hands on the wheel  ·  Eyes on the diff  ·  Mind on the design", {
    x: 0.6, y: 6.5, w: 8.8, h: 0.5,
    fontSize: 13, fontFace: FONT, bold: true, italic: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
pres.writeFile({ fileName: "week4-en.pptx" })
  .then(() => console.log("✅  week4-en.pptx written (21 slides, English-only)"))
  .catch((e) => console.error(e));
