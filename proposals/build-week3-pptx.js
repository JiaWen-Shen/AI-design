// Week 3: Git 常見名詞解惑 — PPTX builder
// Design language mirrors Week 1 Figma + Week 2 pptx
// Run: node build-week3-pptx.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x10"; // 10" × 6.25"
pres.author = "Karen Shen";
pres.title = "Git 常見名詞解惑 — Week 3";

// ---------- Palette ----------
const C = {
  bg: "F8FAFC",
  bgSection: "1A66FF",  // full-bleed section divider
  bgQuestion: "EAF2FF",
  bgWarning: "FFF7ED",  // warm amber for warning slide
  primary: "1A66FF",
  ink: "111827",
  text: "374151",
  muted: "6B7280",
  subtle: "9CA3AF",
  line: "E5E7EB",
  rowAlt: "F3F4F6",
  figmaBg: "F3E8FF",
  figmaText: "8B5CF6",
  gitBg: "DBEAFE",
  gitText: "1A66FF",
  warningBg: "FEF3C7",
  warningText: "D97706",
  white: "FFFFFF",
};

const FONT = "Calibri";

// ---------- Helpers ----------
function addEyebrow(slide, label) {
  slide.addText(label.toUpperCase(), {
    x: 0.6, y: 0.45, w: 9, h: 0.25,
    fontSize: 10, fontFace: FONT, bold: true,
    color: C.primary, align: "left", valign: "middle",
    charSpacing: 3, margin: 0,
  });
}

function addEyebrowWhite(slide, label) {
  slide.addText(label.toUpperCase(), {
    x: 0.6, y: 0.45, w: 9, h: 0.25,
    fontSize: 10, fontFace: FONT, bold: true,
    color: "FFFFFF", align: "left", valign: "middle",
    charSpacing: 3, margin: 0,
  });
}

function addTitle(slide, zh, en) {
  slide.addText(zh, {
    x: 0.6, y: 0.82, w: 9.4, h: 0.62,
    fontSize: 30, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  if (en) {
    slide.addText(en, {
      x: 0.6, y: 1.44, w: 9.4, h: 0.3,
      fontSize: 13, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });
  }
}

function addPill(slide, x, y, label, bg, fg) {
  const w = Math.max(0.7, 0.3 + label.length * 0.11);
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h: 0.3,
    fill: { color: bg }, line: { color: bg, width: 0 },
    rectRadius: 0.15,
  });
  slide.addText(label, {
    x, y, w, h: 0.3,
    fontSize: 11, fontFace: FONT, bold: true,
    color: fg, align: "center", valign: "middle", margin: 0,
  });
}

// Full-width separator line
function hLine(slide, y) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y, w: 9, h: 0.004,
    fill: { color: C.line }, line: { color: C.line, width: 0 },
  });
}

// Comparison table: headers + rows
// cols: [{ label, labelEn, x, w }]
// rows: [{ label, labelEn, cols: [text, ...] }]
function addCompareTable(slide, startY, colHeaders, rows, rowH = 0.9) {
  // Column headers
  colHeaders.forEach(h => {
    slide.addText(h.label, {
      x: h.x, y: startY, w: h.w, h: 0.32,
      fontSize: 16, fontFace: FONT, bold: true,
      color: h.color || C.primary,
      align: "left", valign: "middle", margin: 0,
    });
    if (h.labelEn) {
      slide.addText(h.labelEn, {
        x: h.x, y: startY + 0.32, w: h.w, h: 0.22,
        fontSize: 10, fontFace: FONT,
        color: C.muted, align: "left", valign: "middle", margin: 0,
      });
    }
  });

  const headerH = colHeaders[0]?.labelEn ? 0.6 : 0.4;
  hLine(slide, startY + headerH);

  rows.forEach((row, i) => {
    const y = startY + headerH + 0.1 + i * rowH;
    if (i % 2 === 1) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y: y - 0.06, w: 9, h: rowH,
        fill: { color: C.rowAlt }, line: { color: C.rowAlt, width: 0 },
      });
    }
    // Row label
    slide.addText(row.label, {
      x: 0.6, y: y, w: 1.55, h: 0.32,
      fontSize: 12, fontFace: FONT, bold: true,
      color: C.text, align: "left", valign: "middle", margin: 0,
    });
    if (row.labelEn) {
      slide.addText(row.labelEn, {
        x: 0.6, y: y + 0.32, w: 1.55, h: 0.22,
        fontSize: 10, fontFace: FONT,
        color: C.muted, align: "left", valign: "middle", margin: 0,
      });
    }
    // Cells
    row.cols.forEach((cell, ci) => {
      const col = colHeaders[ci];
      slide.addText(cell, {
        x: col.x, y: y, w: col.w, h: rowH - 0.15,
        fontSize: 13, fontFace: FONT,
        color: C.text, align: "left", valign: "middle",
        margin: [0, 4, 0, 0], wrap: true,
      });
    });

    hLine(slide, y + rowH - 0.1);
  });
}

// ==========================================================
// Slide 1 — Cover
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Week badge
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 2.2, w: 1.1, h: 0.36,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    rectRadius: 0.18,
  });
  s.addText("Week 3 / 6", {
    x: 0.8, y: 2.2, w: 1.1, h: 0.36,
    fontSize: 11, fontFace: FONT, bold: true,
    color: C.white, align: "center", valign: "middle", margin: 0,
  });

  // Chinese title
  s.addText("Git 常見名詞解惑", {
    x: 0.8, y: 2.65, w: 9.2, h: 0.9,
    fontSize: 44, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });

  // English subtitle
  s.addText("Git Vocabulary", {
    x: 0.8, y: 3.55, w: 9.2, h: 0.5,
    fontSize: 26, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });

  // Accent line + series label
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 4.25, w: 0.6, h: 0.04,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("GitHub for UI Designers", {
    x: 0.8, y: 4.35, w: 9, h: 0.3,
    fontSize: 12, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 2 — Agenda
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Agenda");
  addTitle(s, "這週會講什麼", "What we'll cover today");

  const items = [
    {
      n: "A", zh: "容易搞混的名詞", en: "Confusing Terms",
      subs: ["Commit vs Push", "Branch vs Fork", "怎麼判斷用哪個"],
    },
    {
      n: "B", zh: "管理你的 Changes", en: "Managing Changes",
      subs: ["Staged vs Unstaged", "Discard — 還原不想要的改動", "Stash — 暫存但不 commit"],
    },
  ];

  hLine(s, 2.0);

  items.forEach((it, i) => {
    const y = 2.15 + i * 1.65;

    // Section pill (A / B)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: y + 0.12, w: 0.45, h: 0.45,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
      rectRadius: 0.1,
    });
    s.addText(it.n, {
      x: 0.6, y: y + 0.12, w: 0.45, h: 0.45,
      fontSize: 16, fontFace: FONT, bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    // Topic
    s.addText(it.zh, {
      x: 1.25, y: y, w: 8, h: 0.38,
      fontSize: 18, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(it.en, {
      x: 1.25, y: y + 0.38, w: 8, h: 0.26,
      fontSize: 11.5, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    // Sub-items
    const subY = y + 0.72;
    it.subs.forEach((sub, si) => {
      s.addShape(pres.shapes.OVAL, {
        x: 1.28, y: subY + si * 0.3 + 0.08, w: 0.08, h: 0.08,
        fill: { color: C.primary }, line: { color: C.primary, width: 0 },
      });
      s.addText(sub, {
        x: 1.5, y: subY + si * 0.3, w: 7.5, h: 0.28,
        fontSize: 13, fontFace: FONT,
        color: C.text, align: "left", valign: "middle", margin: 0,
      });
    });

    hLine(s, y + 1.58);
  });
}

// ==========================================================
// Slide 3 — Section Divider A
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgSection };

  addEyebrowWhite(s, "Part A");

  s.addText("容易搞混的名詞", {
    x: 0.8, y: 1.5, w: 8.5, h: 1.1,
    fontSize: 48, fontFace: FONT, bold: true,
    color: C.white, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Confusing Terms", {
    x: 0.8, y: 2.6, w: 8.5, h: 0.5,
    fontSize: 22, fontFace: FONT,
    color: "D0DEFF", align: "left", valign: "middle", margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.3, w: 1.0, h: 0.04,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  s.addText("Commit vs Push　·　Branch vs Fork　·　決策指南", {
    x: 0.8, y: 3.45, w: 8.5, h: 0.3,
    fontSize: 13, fontFace: FONT,
    color: "B8CCFF", align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 4 — Commit vs Push 對照表
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Confusing Terms — 01");
  addTitle(s, "Commit vs Push", "What's the difference?");

  const cols = [
    { label: "Commit", color: C.primary, x: 2.3, w: 3.3 },
    { label: "Push", color: C.figmaText, x: 5.8, w: 3.6 },
  ];

  const rows = [
    {
      label: "做了什麼", labelEn: "Action",
      cols: ["在本機建立一個存檔點", "把存檔點上傳到 GitHub"],
    },
    {
      label: "誰看得到", labelEn: "Visibility",
      cols: ["只有你", "團隊所有人"],
    },
    {
      label: "可以反悔嗎", labelEn: "Reversible?",
      cols: ["可以，還沒 push 之前都在你電腦裡", "push 之後別人可能已經看到了"],
    },
    {
      label: "Figma 類比", labelEn: "Figma analogy",
      cols: ["存檔（Cmd+S）", "分享連結給同事"],
    },
  ];

  addCompareTable(s, 2.0, cols, rows, 0.82);
}

// ==========================================================
// Slide 5 — Commit vs Push 流程圖
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Confusing Terms — 01");
  addTitle(s, "兩個動作，兩個時機", "Two actions, two moments");

  // 三個方塊：本機改動 → Commit → Push → GitHub
  const boxes = [
    { x: 0.5, label: "本機改動", labelEn: "Local changes", bg: C.rowAlt, fg: C.ink },
    { x: 3.3, label: "Commit", labelEn: "存檔點建立", bg: C.gitBg, fg: C.primary },
    { x: 6.1, label: "GitHub", labelEn: "遠端，團隊可見", bg: C.figmaBg, fg: C.figmaText },
  ];

  boxes.forEach(b => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: b.x, y: 2.4, w: 2.6, h: 1.4,
      fill: { color: b.bg }, line: { color: C.line, width: 1 },
      rectRadius: 0.12,
    });
    s.addText(b.label, {
      x: b.x, y: 2.5, w: 2.6, h: 0.55,
      fontSize: 18, fontFace: FONT, bold: true,
      color: b.fg, align: "center", valign: "middle", margin: 0,
    });
    s.addText(b.labelEn, {
      x: b.x, y: 3.05, w: 2.6, h: 0.35,
      fontSize: 11, fontFace: FONT,
      color: C.muted, align: "center", valign: "middle", margin: 0,
    });
  });

  // Arrows
  // Arrow 1: 本機→Commit（git commit）
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.05, y: 3.06, w: 0.35, h: 0.04,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("git commit / Claude Code", {
    x: 2.92, y: 3.85, w: 1.0, h: 0.38,
    fontSize: 10, fontFace: FONT,
    color: C.primary, align: "center", valign: "middle", margin: 0, italic: true,
  });

  // Arrow 2: Commit→GitHub（git push）
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.85, y: 3.06, w: 0.35, h: 0.04,
    fill: { color: C.figmaText }, line: { color: C.figmaText, width: 0 },
  });
  s.addText("git push / Claude Code", {
    x: 5.72, y: 3.85, w: 1.0, h: 0.38,
    fontSize: 10, fontFace: FONT,
    color: C.figmaText, align: "center", valign: "middle", margin: 0, italic: true,
  });

  // Key insight
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.5, w: 8.8, h: 0.52,
    fill: { color: C.gitBg }, line: { color: C.gitBg, width: 0 },
    rectRadius: 0.1,
  });
  s.addText("💡  可以 commit 很多次，累積好再一口氣 push — 不是每次 commit 都要立刻 push", {
    x: 0.5, y: 4.5, w: 8.8, h: 0.52,
    fontSize: 13, fontFace: FONT,
    color: C.primary, align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 6 — Branch vs Fork 對照表
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Confusing Terms — 02");
  addTitle(s, "Branch vs Fork", "Two ways to work without breaking the original");

  const cols = [
    { label: "Branch", color: C.primary, x: 2.3, w: 3.3 },
    { label: "Fork", color: C.figmaText, x: 5.8, w: 3.6 },
  ];

  const rows = [
    {
      label: "在哪裡", labelEn: "Location",
      cols: ["同一個 repo 裡面", "複製一整個 repo 到你的帳號"],
    },
    {
      label: "誰用", labelEn: "Who uses it",
      cols: ["團隊成員（有寫入權限）", "外部貢獻者（沒有直接寫入權限）"],
    },
    {
      label: "Figma 類比", labelEn: "Figma analogy",
      cols: ["Figma Branch（同一個檔案分支）", "Duplicate 整個 Figma 到自己的 Draft"],
    },
    {
      label: "什麼時候用", labelEn: "When to use",
      cols: ["日常開發，每個任務開一條", "貢獻別人的開源專案"],
    },
  ];

  addCompareTable(s, 2.0, cols, rows, 0.82);
}

// ==========================================================
// Slide 7 — 決策指南：Branch 還是 Fork？
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Confusing Terms — 02");
  addTitle(s, "怎麼判斷該用哪個？", "Branch or Fork — a decision guide");

  hLine(s, 2.0);

  const questions = [
    {
      q: "你是這個 repo 的成員嗎？",
      qEn: "Are you a member of this repo?",
      yes: "→ 用 Branch",
      yesEn: "You have write access — branch directly",
      yesColor: C.primary,
    },
    {
      q: "你想改別人的開源專案？",
      qEn: "Want to contribute to someone else's open-source project?",
      yes: "→ 用 Fork",
      yesEn: "Fork → PR back to the original repo",
      yesColor: C.figmaText,
    },
    {
      q: "你想拿別人的專案當模板？",
      qEn: "Want to use someone's project as a starting point?",
      yes: "→ Fork 或 Use this template",
      yesEn: "Your copy, your repo — no connection to the original",
      yesColor: C.figmaText,
    },
  ];

  questions.forEach((q, i) => {
    const y = 2.18 + i * 1.2;

    // Question number
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: y + 0.12, w: 0.4, h: 0.4,
      fill: { color: C.rowAlt }, line: { color: C.line, width: 1 },
      rectRadius: 0.08,
    });
    s.addText(String(i + 1), {
      x: 0.6, y: y + 0.12, w: 0.4, h: 0.4,
      fontSize: 14, fontFace: FONT, bold: true,
      color: C.muted, align: "center", valign: "middle", margin: 0,
    });

    // Question text
    s.addText(q.q, {
      x: 1.2, y: y, w: 5.5, h: 0.36,
      fontSize: 15, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(q.qEn, {
      x: 1.2, y: y + 0.36, w: 5.5, h: 0.26,
      fontSize: 10.5, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    // Answer pill
    const ansW = Math.max(1.4, 0.3 + q.yes.length * 0.14);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.9, y: y + 0.1, w: ansW, h: 0.38,
      fill: { color: q.yesColor }, line: { color: q.yesColor, width: 0 },
      rectRadius: 0.19,
    });
    s.addText(q.yes, {
      x: 6.9, y: y + 0.1, w: ansW, h: 0.38,
      fontSize: 12, fontFace: FONT, bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });
    s.addText(q.yesEn, {
      x: 6.9, y: y + 0.52, w: 2.8, h: 0.28,
      fontSize: 10, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    hLine(s, y + 1.12);
  });
}

// ==========================================================
// Slide 8 — 設計師常見情境
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Confusing Terms — 02");
  addTitle(s, "設計師最常碰到的情境", "Common scenarios for UI designers");

  hLine(s, 2.0);

  const rows = [
    {
      scenario: "在公司 team repo 裡改自己負責的頁面",
      scenarioEn: "Editing your own pages in the company repo",
      answer: "Branch",
      answerColor: C.primary,
      answerBg: C.gitBg,
    },
    {
      scenario: "想幫開源 design system 修一個 icon",
      scenarioEn: "Contributing a fix to an open-source design system",
      answer: "Fork → PR",
      answerColor: C.figmaText,
      answerBg: C.figmaBg,
    },
    {
      scenario: "想拿同事的 side project 當起點自己做",
      scenarioEn: "Using a colleague's project as a template",
      answer: "Fork",
      answerColor: C.figmaText,
      answerBg: C.figmaBg,
    },
    {
      scenario: "在自己的 personal repo 做實驗",
      scenarioEn: "Experimenting in your own personal repo",
      answer: "Branch（或直接 main）",
      answerColor: C.primary,
      answerBg: C.gitBg,
    },
  ];

  rows.forEach((r, i) => {
    const y = 2.18 + i * 0.9;
    if (i % 2 === 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y: y - 0.06, w: 9, h: 0.9,
        fill: { color: C.rowAlt }, line: { color: C.rowAlt, width: 0 },
      });
    }

    s.addText(r.scenario, {
      x: 0.8, y: y, w: 6.5, h: 0.34,
      fontSize: 14, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.scenarioEn, {
      x: 0.8, y: y + 0.34, w: 6.5, h: 0.26,
      fontSize: 10.5, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    const aw = Math.max(1.0, 0.3 + r.answer.length * 0.13);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 7.5, y: y + 0.14, w: aw, h: 0.36,
      fill: { color: r.answerBg }, line: { color: r.answerBg, width: 0 },
      rectRadius: 0.18,
    });
    s.addText(r.answer, {
      x: 7.5, y: y + 0.14, w: aw, h: 0.36,
      fontSize: 12, fontFace: FONT, bold: true,
      color: r.answerColor, align: "center", valign: "middle", margin: 0,
    });

    hLine(s, y + 0.82);
  });
}

// ==========================================================
// Slide 9 — Section Divider B
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgSection };

  addEyebrowWhite(s, "Part B");

  s.addText("管理你的 Changes", {
    x: 0.8, y: 1.5, w: 8.5, h: 1.1,
    fontSize: 44, fontFace: FONT, bold: true,
    color: C.white, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Managing Changes", {
    x: 0.8, y: 2.6, w: 8.5, h: 0.5,
    fontSize: 22, fontFace: FONT,
    color: "D0DEFF", align: "left", valign: "middle", margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.3, w: 1.0, h: 0.04,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  s.addText("查看 Changes　·　Staged / Unstaged　·　Discard　·　Stash", {
    x: 0.8, y: 3.45, w: 8.5, h: 0.3,
    fontSize: 13, fontFace: FONT,
    color: "B8CCFF", align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 10 — 查看目前的 Changes
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Managing Changes — 01");
  addTitle(s, "查看目前的 Changes", "VS Code Source Control panel");

  // VS Code panel mock
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 2.1, w: 3.8, h: 2.7,
    fill: { color: "1E1E1E" }, line: { color: "333333", width: 1 },
    rectRadius: 0.1,
  });
  // Panel title
  s.addText("SOURCE CONTROL", {
    x: 0.7, y: 2.2, w: 3.6, h: 0.3,
    fontSize: 10, fontFace: FONT, bold: true,
    color: "BBBBBB", align: "left", valign: "middle",
    charSpacing: 2, margin: 0,
  });
  // Mock lines
  const mockLines = [
    { indent: 0, text: "▸ Staged Changes", color: "CCCCCC", bold: true },
    { indent: 1, text: "Header.tsx  M", color: "6CC644" },
    { indent: 0, text: "▾ Changes", color: "CCCCCC", bold: true },
    { indent: 1, text: "Footer.tsx  M", color: "6CC644" },
    { indent: 1, text: "config.json  M", color: "6CC644" },
    { indent: 0, text: "▾ Untracked Files", color: "CCCCCC", bold: true },
    { indent: 1, text: "NewBanner.tsx  U", color: "73C991" },
  ];

  mockLines.forEach((l, i) => {
    s.addText(l.text, {
      x: 0.75 + l.indent * 0.22, y: 2.62 + i * 0.32, w: 3.5, h: 0.28,
      fontSize: 11, fontFace: "Courier New",
      color: l.color, bold: l.bold || false,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // State table (right side)
  const stateRows = [
    { state: "Staged", stateEn: "已選好要 commit 的", badge: "S", badgeColor: C.primary, badgeBg: C.gitBg },
    { state: "Unstaged", stateEn: "改了但還沒決定要不要存", badge: "M", badgeColor: "D97706", badgeBg: "FEF3C7" },
    { state: "Untracked", stateEn: "全新檔案，Git 還不認識", badge: "U", badgeColor: "16A34A", badgeBg: "DCFCE7" },
  ];

  s.addText("三種狀態", {
    x: 4.9, y: 2.1, w: 4.8, h: 0.36,
    fontSize: 15, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Three states of your changed files", {
    x: 4.9, y: 2.45, w: 4.8, h: 0.26,
    fontSize: 10.5, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 2.78);

  stateRows.forEach((r, i) => {
    const y = 2.9 + i * 0.82;

    // Badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 4.9, y: y + 0.08, w: 0.38, h: 0.38,
      fill: { color: r.badgeBg }, line: { color: r.badgeBg, width: 0 },
      rectRadius: 0.06,
    });
    s.addText(r.badge, {
      x: 4.9, y: y + 0.08, w: 0.38, h: 0.38,
      fontSize: 13, fontFace: "Courier New", bold: true,
      color: r.badgeColor, align: "center", valign: "middle", margin: 0,
    });

    s.addText(r.state, {
      x: 5.4, y: y, w: 4.2, h: 0.34,
      fontSize: 14, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.stateEn, {
      x: 5.4, y: y + 0.34, w: 4.2, h: 0.26,
      fontSize: 11, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    hLine(s, y + 0.74);
  });
}

// ==========================================================
// Slide 11 — Staged vs Unstaged：我該在意嗎？
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Managing Changes — 01");
  addTitle(s, "Staged vs Unstaged：我該在意嗎？", "Do I need to care about staging?");

  // Highlight box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 2.08, w: 9, h: 0.5,
    fill: { color: C.gitBg }, line: { color: C.gitBg, width: 0 },
    rectRadius: 0.1,
  });
  s.addText("用 Claude Code 時，通常不用手動管理 — Agent 會自動判斷哪些檔案該 commit", {
    x: 0.6, y: 2.08, w: 9, h: 0.5,
    fontSize: 13.5, fontFace: FONT, bold: true,
    color: C.primary, align: "center", valign: "middle", margin: 0,
  });

  s.addText("但如果你想要更細的控制，可以這樣說：", {
    x: 0.6, y: 2.72, w: 9, h: 0.3,
    fontSize: 13, fontFace: FONT,
    color: C.text, align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 3.06);

  const rows = [
    {
      want: "只 commit 部分檔案",
      wantEn: "Commit only some files",
      say: "「只 commit Header.tsx，其他先不要」",
    },
    {
      want: "看目前哪些會被 commit",
      wantEn: "See what's currently staged",
      say: "「目前 staged 了哪些檔案？」",
    },
    {
      want: "把某個檔案從 staged 移除",
      wantEn: "Remove a file from staging",
      say: "「把 config.json unstage，我還要再改」",
    },
  ];

  rows.forEach((r, i) => {
    const y = 3.18 + i * 0.9;
    if (i % 2 === 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y: y - 0.06, w: 9, h: 0.9,
        fill: { color: C.rowAlt }, line: { color: C.rowAlt, width: 0 },
      });
    }

    s.addText(r.want, {
      x: 0.8, y: y, w: 3.8, h: 0.32,
      fontSize: 14, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.wantEn, {
      x: 0.8, y: y + 0.32, w: 3.8, h: 0.26,
      fontSize: 10.5, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    // Speech bubble style for the Claude Code prompt
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 4.8, y: y + 0.06, w: 4.8, h: 0.52,
      fill: { color: C.rowAlt }, line: { color: C.line, width: 1 },
      rectRadius: 0.12,
    });
    s.addText(r.say, {
      x: 4.8, y: y + 0.06, w: 4.8, h: 0.52,
      fontSize: 12.5, fontFace: FONT,
      color: C.primary, align: "center", valign: "middle", margin: 0, italic: true,
    });

    hLine(s, y + 0.82);
  });
}

// ==========================================================
// Slide 12 — Discard Changes
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Managing Changes — 02");
  addTitle(s, "Discard Changes：還原不想要的改動", "Reverting unwanted changes");

  hLine(s, 2.02);

  const rows = [
    {
      want: "放棄單一檔案的改動",
      wantEn: "Discard one file",
      say: "「把 Header.tsx 還原到上次 commit 的狀態」",
      result: "這個檔案的改動消失，回到乾淨狀態",
    },
    {
      want: "放棄所有改動",
      wantEn: "Discard everything",
      say: "「放棄所有未 commit 的改動」",
      result: "⚠️ 所有改動消失，謹慎使用",
    },
    {
      want: "只是想看看上一版",
      wantEn: "Just preview the previous version",
      say: "「顯示 Header.tsx 上次 commit 的內容」",
      result: "不會改動檔案，只讓你看",
    },
  ];

  rows.forEach((r, i) => {
    const y = 2.15 + i * 1.05;
    if (i % 2 === 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y: y - 0.06, w: 9, h: 1.05,
        fill: { color: C.rowAlt }, line: { color: C.rowAlt, width: 0 },
      });
    }

    s.addText(r.want, {
      x: 0.8, y: y, w: 3.0, h: 0.34,
      fontSize: 13.5, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.wantEn, {
      x: 0.8, y: y + 0.34, w: 3.0, h: 0.26,
      fontSize: 10.5, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });
    s.addText("對 Claude Code 說：", {
      x: 0.8, y: y + 0.6, w: 3.0, h: 0.24,
      fontSize: 10, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 3.95, y: y + 0.06, w: 5.5, h: 0.42,
      fill: { color: "EFF6FF" }, line: { color: C.line, width: 1 },
      rectRadius: 0.1,
    });
    s.addText(r.say, {
      x: 3.95, y: y + 0.06, w: 5.5, h: 0.42,
      fontSize: 11.5, fontFace: FONT,
      color: C.primary, align: "center", valign: "middle", margin: 0, italic: true,
    });
    s.addText(r.result, {
      x: 3.95, y: y + 0.56, w: 5.5, h: 0.3,
      fontSize: 11, fontFace: FONT,
      color: i === 1 ? C.warningText : C.muted,
      align: "left", valign: "middle", margin: 0,
    });

    hLine(s, y + 0.97);
  });

  // Warning callout
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.3, w: 9, h: 0.52,
    fill: { color: C.warningBg }, line: { color: "FCD34D", width: 1 },
    rectRadius: 0.1,
  });
  s.addText("⚠️  Discard 是不可逆的 — 改動會真的消失。不確定時，先 commit 或 stash 再說", {
    x: 0.6, y: 5.3, w: 9, h: 0.52,
    fontSize: 13, fontFace: FONT, bold: true,
    color: C.warningText, align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 13 — Stash 概念 + Claude Code 對話
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Managing Changes — 03");
  addTitle(s, "Stash：暫存但不 commit", "Save your work-in-progress without committing");

  // Concept line
  s.addText("改到一半要切任務？先把改動「收起來」，之後再拿出來繼續。", {
    x: 0.6, y: 1.85, w: 9, h: 0.3,
    fontSize: 13, fontFace: FONT,
    color: C.text, align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  const stashRows = [
    {
      situation: "要切 branch，但目前改動還沒好",
      situationEn: "Need to switch branch but work isn't done",
      say: "「先 stash 目前的改動」",
    },
    {
      situation: "處理完緊急事，想繼續剛才的工作",
      situationEn: "Back from the detour — resume where you left off",
      say: "「把 stash 的東西拿回來」",
    },
    {
      situation: "看看 stash 裡有什麼",
      situationEn: "Check what's been stashed",
      say: "「列出目前的 stash」",
    },
    {
      situation: "Stash 的東西不要了",
      situationEn: "Done with the stashed changes",
      say: "「清掉 stash」",
    },
  ];

  stashRows.forEach((r, i) => {
    const y = 2.35 + i * 0.8;
    if (i % 2 === 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y: y - 0.05, w: 9, h: 0.8,
        fill: { color: C.rowAlt }, line: { color: C.rowAlt, width: 0 },
      });
    }

    s.addText(r.situation, {
      x: 0.8, y: y, w: 4.8, h: 0.34,
      fontSize: 13.5, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.situationEn, {
      x: 0.8, y: y + 0.34, w: 4.8, h: 0.26,
      fontSize: 10.5, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.8, y: y + 0.1, w: 3.7, h: 0.4,
      fill: { color: "EFF6FF" }, line: { color: C.line, width: 1 },
      rectRadius: 0.1,
    });
    s.addText(r.say, {
      x: 5.8, y: y + 0.1, w: 3.7, h: 0.4,
      fontSize: 12, fontFace: FONT,
      color: C.primary, align: "center", valign: "middle", margin: 0, italic: true,
    });

    hLine(s, y + 0.72);
  });
}

// ==========================================================
// Slide 14 — Stash vs Commit 對照表
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Managing Changes — 03");
  addTitle(s, "Stash vs Commit", "When to use which");

  const cols = [
    { label: "Stash", color: C.primary, x: 2.3, w: 3.3 },
    { label: "Commit", color: C.figmaText, x: 5.8, w: 3.6 },
  ];

  const rows = [
    {
      label: "用途", labelEn: "Purpose",
      cols: ["暫存，之後繼續改", "存檔點，代表「這個狀態是 OK 的」"],
    },
    {
      label: "可見性", labelEn: "Visibility",
      cols: ["只有你，不會出現在 git log", "會出現在 git log，有紀錄"],
    },
    {
      label: "適合情境", labelEn: "Best for",
      cols: ["改到一半要切換任務", "改好了，想留下正式紀錄"],
    },
  ];

  addCompareTable(s, 2.0, cols, rows, 1.0);

  // Tip
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.4, w: 9, h: 0.44,
    fill: { color: C.gitBg }, line: { color: C.gitBg, width: 0 },
    rectRadius: 0.1,
  });
  s.addText("💡  不確定要不要 commit？先 stash — 不影響 git log，保留彈性", {
    x: 0.6, y: 5.4, w: 9, h: 0.44,
    fontSize: 13, fontFace: FONT,
    color: C.primary, align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 15 — What's next + 什麼時候用 Stash
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Managing Changes — 03");
  addTitle(s, "什麼時候用 Stash？", "When should you reach for stash?");

  hLine(s, 2.02);

  const scenarios = [
    {
      icon: "⚡",
      zh: "改到一半，需要緊急切 branch",
      en: "Mid-task and need to switch branch immediately",
    },
    {
      icon: "🔀",
      zh: "想試試看另一個做法，但當前的改動還想保留",
      en: "Exploring an alternative approach — want to keep current work safe",
    },
    {
      icon: "⬇️",
      zh: "同事說「你先 pull 一下最新的」，但你有未 commit 的改動",
      en: "Need to pull latest, but have local changes that aren't ready to commit",
    },
  ];

  scenarios.forEach((sc, i) => {
    const y = 2.2 + i * 1.16;

    s.addText(sc.icon, {
      x: 0.6, y: y + 0.16, w: 0.7, h: 0.7,
      fontSize: 28, align: "center", valign: "middle", margin: 0,
    });

    s.addText(sc.zh, {
      x: 1.5, y: y + 0.02, w: 7.8, h: 0.4,
      fontSize: 16, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(sc.en, {
      x: 1.5, y: y + 0.44, w: 7.8, h: 0.28,
      fontSize: 11.5, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    hLine(s, y + 1.08);
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.6, w: 9, h: 0.4,
    fill: { color: C.rowAlt }, line: { color: C.line, width: 1 },
    rectRadius: 0.08,
  });
  s.addText("🧯  無論如何：不確定就先 stash，比 discard 安全，也比亂 commit 乾淨", {
    x: 0.6, y: 5.6, w: 9, h: 0.4,
    fontSize: 12, fontFace: FONT,
    color: C.text, align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 16 — Key Takeaway
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Key Takeaway");
  addTitle(s, "本週三件事", "Three things to remember");

  hLine(s, 2.02);

  const points = [
    {
      n: "1",
      zh: "Commit = 存檔　Push = 分享",
      en: "Commit saves locally. Push shares with the team. You control the timing.",
    },
    {
      n: "2",
      zh: "Branch 給有權限的人，Fork 給外部貢獻者",
      en: "Branch = inside the repo. Fork = copy to your own account.",
    },
    {
      n: "3",
      zh: "不確定要不要存？先 Stash，比 Discard 安全",
      en: "Stash keeps changes; Discard loses them. When in doubt, stash.",
    },
  ];

  points.forEach((p, i) => {
    const y = 2.2 + i * 1.18;

    // Number badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: y + 0.16, w: 0.58, h: 0.58,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
      rectRadius: 0.12,
    });
    s.addText(p.n, {
      x: 0.6, y: y + 0.16, w: 0.58, h: 0.58,
      fontSize: 20, fontFace: FONT, bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    s.addText(p.zh, {
      x: 1.4, y: y + 0.04, w: 8.1, h: 0.4,
      fontSize: 18, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.en, {
      x: 1.4, y: y + 0.46, w: 8.1, h: 0.38,
      fontSize: 12, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    hLine(s, y + 1.1);
  });
}

// ==========================================================
// Slide 17 — 下週預告
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgQuestion };

  addEyebrow(s, "Next Week");

  s.addText("Week 4", {
    x: 0.8, y: 1.0, w: 8.5, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true,
    color: C.primary, align: "left", valign: "middle", margin: 0,
  });
  s.addText("用 AI 操作 Git", {
    x: 0.8, y: 1.45, w: 8.5, h: 0.85,
    fontSize: 40, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Using AI for Git Operations", {
    x: 0.8, y: 2.3, w: 8.5, h: 0.45,
    fontSize: 20, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 2.9, w: 0.6, h: 0.04,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });

  const previews = [
    "Claude Code 操作示範 — 把中文說的動作變成 git 指令",
    "什麼時候信任 AI？什麼時候要自己確認？",
    "避免 push 錯路徑的防呆技巧",
  ];

  previews.forEach((p, i) => {
    s.addShape(pres.shapes.OVAL, {
      x: 0.84, y: 3.08 + i * 0.55 + 0.12, w: 0.08, h: 0.08,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });
    s.addText(p, {
      x: 1.1, y: 3.08 + i * 0.55, w: 8.3, h: 0.46,
      fontSize: 14, fontFace: FONT,
      color: C.text, align: "left", valign: "middle", margin: 0,
    });
  });

  // Footer
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.8, w: 10, h: 0.45,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("GitHub for UI Designers  ·  Week 3 / 6  ·  Karen Shen", {
    x: 0, y: 5.8, w: 10, h: 0.45,
    fontSize: 11, fontFace: FONT,
    color: C.white, align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Output
// ==========================================================
pres.writeFile({ fileName: "week3-git-vocabulary.pptx" })
  .then(() => console.log("✅  week3-git-vocabulary.pptx written"))
  .catch(err => console.error("❌ ", err));
