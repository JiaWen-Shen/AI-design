// Week 3: Git 常見名詞解惑 + 三種 Working Repo — PPTX builder v2
// Design language mirrors Week 1 Figma + Week 2 pptx
// Run: node build-week3-pptx.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x10";
pres.author = "Karen Shen";
pres.title = "Git 常見名詞解惑 — Week 3";

// ---------- Palette (TLDS-aligned, from trendlife-general/vxd-skill tokens/colors.md) ----------
const C = {
  bg: "F6EFE8",          // brand/cream — page bg (warm alt to white)
  bgSection: "153242",   // brand/charcoal — section divider bg
  bgQuestion: "AFE0EF",  // brand/sky — info card bg (paler than primary)
  bgWarning: "FFF7ED",
  primary: "D71920",     // brand/trend-red — one prominent brand moment per view
  accent: "0690A7",      // brand/light-teal — interactive / secondary
  ink: "222222",         // gray90 — primary text
  text: "555555",        // gray60 — secondary text
  muted: "8E8E8E",       // gray50 — tertiary
  subtle: "ADADAD",      // gray40
  line: "E5E0D8",        // cream-tinted line
  rowAlt: "F0E8DC",
  figmaBg: "E7E5FE",     // lilac-adjacent tint for "Figma" callouts
  figmaText: "5B5BD6",
  gitBg: "FFE5E6",       // soft red tint for Git callouts
  gitText: "D71920",
  warningBg: "FEB912",   // brand/yellow
  warningText: "8A6510",
  greenBg: "CDE9DC",
  greenText: "0F7A4F",
  white: "FFFFFF",
  burgundy: "450105",    // brand/burgundy — premium / dark hero
  skyDeep: "0690A7",     // alias for clarity
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

function addTitle(slide, zh, en) {
  slide.addText(zh, {
    x: 0.6, y: 0.82, w: 9.4, h: 0.62,
    fontSize: 30, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  if (en) {
    slide.addText(en, {
      x: 0.6, y: 1.44, w: 9.4, h: 0.28,
      fontSize: 13, fontFace: FONT,
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

function pill(slide, x, y, label, bg, fg, w) {
  const pw = w || Math.max(0.8, 0.3 + label.length * 0.12);
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: pw, h: 0.3,
    fill: { color: bg }, line: { color: bg, width: 0 }, rectRadius: 0.15,
  });
  slide.addText(label, {
    x, y, w: pw, h: 0.3,
    fontSize: 11, fontFace: FONT, bold: true,
    color: fg, align: "center", valign: "middle", margin: 0,
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
  s.addText("Week 3 / 6", {
    x: 0.8, y: 2.2, w: 1.1, h: 0.36,
    fontSize: 11, fontFace: FONT, bold: true,
    color: C.white, align: "center", valign: "middle", margin: 0,
  });
  s.addText("Git 名詞速查 + 三種 Working Repo", {
    x: 0.8, y: 2.65, w: 9.2, h: 0.9,
    fontSize: 38, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Git Vocabulary + Working Repo Types", {
    x: 0.8, y: 3.55, w: 9.2, h: 0.5,
    fontSize: 22, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 4.25, w: 0.6, h: 0.04,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("GitHub for UI Designers", {
    x: 0.8, y: 4.35, w: 9, h: 0.3,
    fontSize: 12, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
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

  const parts = [
    {
      label: "A", color: C.primary, bg: C.gitBg,
      zh: "Git 名詞速查", en: "Vocabulary Quick Reference",
      items: ["Commit vs Push", "Branch vs Fork + 何時開 branch"],
    },
    {
      label: "B", color: "16A34A", bg: C.greenBg,
      zh: "Changes 管理", en: "Managing Changes — Quick Review",
      items: ["Staged / Unstaged / Discard / Stash", "Agent Session 保存", "PR Review 流程 + 原則"],
    },
    {
      label: "C", color: C.primary, bg: C.primary,
      zh: "三種 Working Repo", en: "Three Working Repo Types — Main Focus",
      items: ["Type A 協作 repo", "Type B 引用 repo（DS + 部門規範）", "Type C 個人 repo"],
      isMain: true,
    },
  ];

  hLine(s, 2.02);

  parts.forEach((p, i) => {
    const y = 2.15 + i * 1.35;

    // Badge
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

    s.addText(p.zh, {
      x: 1.25, y: y, w: 3.5, h: 0.36,
      fontSize: 17, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.en, {
      x: 1.25, y: y + 0.36, w: 3.5, h: 0.24,
      fontSize: 10.5, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });

    p.items.forEach((item, si) => {
      s.addShape(pres.shapes.OVAL, {
        x: 5.1, y: y + si * 0.3 + 0.12, w: 0.08, h: 0.08,
        fill: { color: p.isMain ? C.primary : p.color },
        line: { color: p.isMain ? C.primary : p.color, width: 0 },
      });
      s.addText(item, {
        x: 5.3, y: y + si * 0.3, w: 4.5, h: 0.28,
        fontSize: 12.5, fontFace: FONT,
        color: p.isMain ? C.primary : C.text,
        bold: p.isMain,
        align: "left", valign: "middle", margin: 0,
      });
    });

    hLine(s, y + 1.27);
  });
}

// ==========================================================
// Slide 3 — Commit vs Push（Part A）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Git 名詞速查  —  01");
  addTitle(s, "Commit vs Push", "What's the difference?");

  const cols = [
    { label: "Commit", color: C.primary, x: 2.3, w: 3.3 },
    { label: "Push", color: C.figmaText, x: 5.8, w: 3.6 },
  ];
  const rows = [
    { label: "做了什麼", labelEn: "Action",
      cols: ["在本機建立存檔點", "把存檔點上傳到 GitHub"] },
    { label: "誰看得到", labelEn: "Visibility",
      cols: ["只有你", "團隊所有人"] },
    { label: "可以反悔嗎", labelEn: "Reversible?",
      cols: ["可以，push 之前都在你電腦裡", "Push 後別人可能已經看到"] },
    { label: "Figma 類比", labelEn: "Figma analogy",
      cols: ["存檔（Cmd+S）", "分享連結給同事"] },
  ];

  // Headers
  cols.forEach(c => {
    s.addText(c.label, {
      x: c.x, y: 2.05, w: c.w, h: 0.32,
      fontSize: 16, fontFace: FONT, bold: true, color: c.color,
      align: "left", valign: "middle", margin: 0,
    });
  });
  hLine(s, 2.44);

  rows.forEach((r, i) => {
    const y = 2.56 + i * 0.82;
    if (i % 2 === 1) {
      box(s, 0.6, y - 0.06, 9, 0.82, C.rowAlt);
    }
    s.addText(r.label, { x: 0.8, y, w: 1.4, h: 0.3, fontSize: 12, fontFace: FONT, bold: true, color: C.text, align: "left", valign: "middle", margin: 0 });
    s.addText(r.labelEn, { x: 0.8, y: y + 0.3, w: 1.4, h: 0.22, fontSize: 10, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0 });
    cols.forEach((c, ci) => {
      s.addText(r.cols[ci], { x: c.x, y, w: c.w, h: 0.68, fontSize: 13, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: [0,4,0,0], wrap: true });
    });
    hLine(s, y + 0.74);
  });

  // Key insight
  box(s, 0.6, 5.88, 9, 0.4, C.gitBg);
  s.addText("💡  可以 commit 很多次再一起 push；Push 的時機：收工、換裝置、要給人看", {
    x: 0.6, y: 5.88, w: 9, h: 0.4,
    fontSize: 12.5, fontFace: FONT, bold: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 4 — Branch vs Fork（合併決策指南 + 情境）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Git 名詞速查  —  02");
  addTitle(s, "Branch vs Fork", "And when to use which");

  // Left: compact compare table (top half)
  const tableRows = [
    { label: "在哪裡", a: "同一個 repo 裡", b: "複製到你自己的帳號" },
    { label: "誰用", a: "有寫入權限的人", b: "外部貢獻者" },
    { label: "Figma 類比", a: "Figma Branch", b: "Duplicate 整個檔到 Draft" },
  ];

  s.addText("Branch", { x: 2.1, y: 2.05, w: 3.0, h: 0.3, fontSize: 15, fontFace: FONT, bold: true, color: C.primary, align: "left", valign: "middle", margin: 0 });
  s.addText("Fork", { x: 5.3, y: 2.05, w: 3.0, h: 0.3, fontSize: 15, fontFace: FONT, bold: true, color: C.figmaText, align: "left", valign: "middle", margin: 0 });
  hLine(s, 2.4);

  tableRows.forEach((r, i) => {
    const y = 2.5 + i * 0.68;
    if (i % 2 === 1) box(s, 0.6, y - 0.05, 8.6, 0.68, C.rowAlt);
    s.addText(r.label, { x: 0.7, y, w: 1.3, h: 0.58, fontSize: 11.5, fontFace: FONT, bold: true, color: C.text, align: "left", valign: "middle", margin: 0 });
    s.addText(r.a, { x: 2.1, y, w: 3.0, h: 0.58, fontSize: 12, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0 });
    s.addText(r.b, { x: 5.3, y, w: 3.5, h: 0.58, fontSize: 12, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0 });
    hLine(s, y + 0.6);
  });

  // Divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 4.56, w: 9, h: 0.004,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });

  // Bottom: decision + scenarios side by side
  s.addText("怎麼判斷？", { x: 0.7, y: 4.68, w: 3.8, h: 0.28, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
  s.addText("常見情境", { x: 5.2, y: 4.68, w: 4.2, h: 0.28, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });

  const decisions = [
    { q: "你是 repo 成員？", a: "Branch", ac: C.primary, ab: C.gitBg },
    { q: "改別人的開源專案？", a: "Fork", ac: C.figmaText, ab: C.figmaBg },
    { q: "拿當模板？", a: "Fork", ac: C.figmaText, ab: C.figmaBg },
  ];
  decisions.forEach((d, i) => {
    const y = 5.04 + i * 0.34;
    s.addText(d.q, { x: 0.7, y, w: 2.6, h: 0.3, fontSize: 11.5, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0 });
    pill(s, 3.4, y, d.a, d.ab, d.ac, 0.72);
  });

  const scenarios = [
    { s: "改公司 repo 自己負責的頁面", a: "Branch", ac: C.primary, ab: C.gitBg },
    { s: "幫開源 design system 修 icon", a: "Fork", ac: C.figmaText, ab: C.figmaBg },
    { s: "personal repo 做實驗", a: "Branch", ac: C.primary, ab: C.gitBg },
  ];
  scenarios.forEach((sc, i) => {
    const y = 5.04 + i * 0.34;
    s.addText(sc.s, { x: 5.2, y, w: 2.9, h: 0.3, fontSize: 11, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0 });
    pill(s, 8.2, y, sc.a, sc.ab, sc.ac, 0.72);
  });
}

// ==========================================================
// Slide 5 — 開 Branch 的時機 + 三種方式
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Git 名詞速查  —  03");
  addTitle(s, "什麼時候開 Branch？怎麼開？", "When and how to create a branch");

  // Top: timing rule
  box(s, 0.6, 2.05, 9, 0.52, C.gitBg);
  s.addText("原則：編輯開始前就開，不是 commit 的時候才開", {
    x: 0.6, y: 2.05, w: 9, h: 0.52,
    fontSize: 14, fontFace: FONT, bold: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });

  // Flow: 開 branch → 編輯 → commit → push → PR
  const steps = ["開 Branch", "編輯", "Commit", "Push", "開 PR"];
  const stepColors = [C.primary, C.ink, C.ink, C.ink, C.figmaText];
  steps.forEach((step, i) => {
    const x = 0.55 + i * 1.82;
    box(s, x, 2.72, 1.5, 0.46, i === 0 ? C.primary : C.rowAlt, i === 0 ? null : C.line);
    s.addText(step, {
      x, y: 2.72, w: 1.5, h: 0.46,
      fontSize: 13, fontFace: FONT, bold: true,
      color: i === 0 ? C.white : stepColors[i],
      align: "center", valign: "middle", margin: 0,
    });
    if (i < steps.length - 1) {
      s.addText("→", {
        x: x + 1.5, y: 2.78, w: 0.32, h: 0.34,
        fontSize: 14, fontFace: FONT, color: C.muted,
        align: "center", valign: "middle", margin: 0,
      });
    }
  });

  // Rescue note
  box(s, 0.6, 3.3, 9, 0.4, C.warningBg, "FCD34D");
  s.addText("💡  忘了開就直接在 main 改了？只要還沒 commit，現在開 branch，改動會自動跟過去", {
    x: 0.6, y: 3.3, w: 9, h: 0.4,
    fontSize: 11.5, fontFace: FONT, color: C.warningText,
    align: "center", valign: "middle", margin: 0,
  });

  // Three ways table
  hLine(s, 3.85);
  s.addText("三種開 Branch 的方式", {
    x: 0.6, y: 3.92, w: 9, h: 0.32,
    fontSize: 14, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });

  const ways = [
    { label: "GitHub 網頁", desc: "Branch 切換器 → 輸入新名稱 → Enter", when: "小改動、改文件，不需要本機跑程式", badge: "可以", bc: C.greenBg, bfg: C.greenText },
    { label: "對 Agent 說", desc: "「幫我開一條 branch 叫 feat/xxx」", when: "用 Claude Code 工作時（最常用）", badge: "最推薦", bc: C.gitBg, bfg: C.primary },
    { label: "指令", desc: "git checkout -b feat/xxx", when: "自己熟悉指令，想手動控制", badge: "進階", bc: C.rowAlt, bfg: C.muted },
  ];

  ways.forEach((w, i) => {
    const y = 4.36 + i * 0.56;
    if (i % 2 === 1) box(s, 0.6, y - 0.04, 9, 0.56, C.rowAlt);
    s.addText(w.label, { x: 0.75, y, w: 1.6, h: 0.48, fontSize: 12.5, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
    s.addText(w.desc, { x: 2.45, y, w: 3.6, h: 0.48, fontSize: 11.5, fontFace: FONT, color: C.primary, italic: true, align: "left", valign: "middle", margin: 0 });
    s.addText(w.when, { x: 6.15, y, w: 2.4, h: 0.48, fontSize: 10.5, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0 });
    pill(s, 8.65, y + 0.08, w.badge, w.bc, w.bfg);
    hLine(s, y + 0.5);
  });
}

// ==========================================================
// Slide 6 — Staged / Unstaged / Discard（Part B）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Changes 管理  —  01", "16A34A");
  addTitle(s, "查看 Changes + Discard", "Viewing and reverting your changes");

  // Three state badges
  const states = [
    { badge: "S", bg: C.gitBg, fg: C.primary, label: "Staged", desc: "已選好要 commit 的改動" },
    { badge: "M", bg: C.warningBg, fg: C.warningText, label: "Unstaged", desc: "改了但還沒決定要不要存" },
    { badge: "U", bg: C.greenBg, fg: C.greenText, label: "Untracked", desc: "全新檔案，Git 還不認識" },
  ];

  states.forEach((st, i) => {
    const x = 0.6 + i * 3.1;
    box(s, x, 2.05, 2.9, 0.84, st.bg);
    s.addText(st.badge, { x, y: 2.05, w: 0.6, h: 0.84, fontSize: 20, fontFace: "Courier New", bold: true, color: st.fg, align: "center", valign: "middle", margin: 0 });
    s.addText(st.label, { x: x + 0.62, y: 2.12, w: 2.2, h: 0.32, fontSize: 14, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
    s.addText(st.desc, { x: x + 0.62, y: 2.44, w: 2.2, h: 0.36, fontSize: 10.5, fontFace: FONT, color: C.muted, align: "left", valign: "top", margin: 0, wrap: true });
  });

  box(s, 0.6, 3.02, 9, 0.38, C.rowAlt);
  s.addText("用 Claude Code 時通常不用手動管理 — Agent 會自動判斷該 commit 哪些檔", {
    x: 0.6, y: 3.02, w: 9, h: 0.38,
    fontSize: 12, fontFace: FONT, color: C.text, italic: true,
    align: "center", valign: "middle", margin: 0,
  });

  // Discard section
  hLine(s, 3.55);
  s.addText("Discard Changes — 還原不想要的改動", {
    x: 0.6, y: 3.62, w: 9, h: 0.32,
    fontSize: 14, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });

  const discardRows = [
    { want: "放棄單一檔案", say: "「把 Header.tsx 還原到上次 commit 的狀態」", safe: true },
    { want: "放棄所有改動", say: "「放棄所有未 commit 的改動」", safe: false },
    { want: "只是想看看上一版", say: "「顯示 Header.tsx 上次 commit 的內容」", safe: true },
  ];

  discardRows.forEach((r, i) => {
    const y = 4.04 + i * 0.56;
    if (i % 2 === 1) box(s, 0.6, y - 0.04, 9, 0.56, C.rowAlt);
    s.addText(r.want, { x: 0.75, y, w: 2.2, h: 0.48, fontSize: 12.5, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
    box(s, 3.05, y + 0.06, 5.5, 0.36, "EFF6FF", C.line);
    s.addText(r.say, { x: 3.05, y: y + 0.06, w: 5.5, h: 0.36, fontSize: 11.5, fontFace: FONT, color: C.primary, italic: true, align: "center", valign: "middle", margin: 0 });
    pill(s, 8.65, y + 0.1, r.safe ? "安全" : "⚠️ 慎", r.safe ? C.greenBg : C.warningBg, r.safe ? C.greenText : C.warningText, 0.78);
    hLine(s, y + 0.5);
  });

  box(s, 0.6, 5.74, 9, 0.4, C.warningBg, "FCD34D");
  s.addText("⚠️  Discard 不可逆 — 改動會真的消失。不確定就先 commit 或 stash", {
    x: 0.6, y: 5.74, w: 9, h: 0.4,
    fontSize: 12.5, fontFace: FONT, bold: true, color: C.warningText,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 7 — Stash（Part B）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Changes 管理  —  02", "16A34A");
  addTitle(s, "Stash：暫存但不 commit", "Save work-in-progress without committing");

  s.addText("改到一半要切任務？先把改動「收起來」，之後再拿出來繼續。", {
    x: 0.6, y: 1.86, w: 9, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  const stashRows = [
    { s: "要切 branch，但目前改動還沒好", say: "「先 stash 目前的改動」" },
    { s: "處理完緊急事，想繼續剛才的工作", say: "「把 stash 的東西拿回來」" },
    { s: "看看 stash 裡有什麼", say: "「列出目前的 stash」" },
    { s: "stash 的東西不要了", say: "「清掉 stash」" },
  ];

  stashRows.forEach((r, i) => {
    const y = 2.35 + i * 0.76;
    if (i % 2 === 1) box(s, 0.6, y - 0.04, 9, 0.76, C.rowAlt);
    s.addText(r.s, { x: 0.75, y: y + 0.06, w: 4.5, h: 0.56, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0, wrap: true });
    box(s, 5.4, y + 0.1, 4.1, 0.42, "EFF6FF", C.line);
    s.addText(r.say, { x: 5.4, y: y + 0.1, w: 4.1, h: 0.42, fontSize: 12, fontFace: FONT, color: C.primary, italic: true, align: "center", valign: "middle", margin: 0 });
    hLine(s, y + 0.68);
  });

  // Stash vs Discard
  box(s, 0.6, 5.44, 9, 0.72, C.rowAlt, C.line);
  s.addText("Stash vs Discard", { x: 0.8, y: 5.5, w: 2, h: 0.28, fontSize: 12, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });

  const compare = [
    { label: "Stash", text: "改動保留，收起來，隨時拿回來", color: C.primary },
    { label: "Discard", text: "改動消失，⚠️ 無法復原", color: C.warningText },
  ];
  compare.forEach((c, i) => {
    pill(s, 0.8 + i * 4.5, 5.86, c.label, i === 0 ? C.gitBg : C.warningBg, c.color, 1.0);
    s.addText(c.text, { x: 1.9 + i * 4.5, y: 5.84, w: 3.3, h: 0.34, fontSize: 11.5, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0 });
  });
}

// ==========================================================
// Slide 8 — Agent Session 怎麼保存？（Part B）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Changes 管理  —  03");
  addTitle(s, "Agent Session 怎麼保存？", "Saving code vs. agent context when you pause");

  s.addText("重開機或明天繼續時，Code 的狀態跟 Agent 的記憶是兩件事，要分開處理。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // ── Left: Code ──
  box(s, 0.6, 2.38, 4.1, 3.1, C.gitBg, C.gitText);
  s.addText("💾  Code 的狀態", {
    x: 0.78, y: 2.52, w: 3.7, h: 0.34,
    fontSize: 13, fontFace: FONT, bold: true, color: C.gitText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Git 負責", {
    x: 0.78, y: 2.84, w: 3.7, h: 0.26,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 3.08, 0.78, 3.7);
  [
    "改好了 → commit + push",
    "改到一半不想 commit\n→  git stash（本機）\n→  WIP commit（需跨裝置時）",
  ].forEach((t, i) => {
    s.addText("•  " + t, {
      x: 0.78, y: 3.16 + i * 1.08, w: 3.7, h: 1.0,
      fontSize: 12, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });

  // ── Right: Agent memory ──
  box(s, 5.1, 2.38, 4.3, 3.1, C.figmaBg, C.figmaText);
  s.addText("🧠  Agent 的記憶", {
    x: 5.28, y: 2.52, w: 3.9, h: 0.34,
    fontSize: 13, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("對話 context — 要主動保存", {
    x: 5.28, y: 2.84, w: 3.9, h: 0.26,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 3.08, 5.28, 3.9);
  [
    "Session 關掉就消失\n下次開啟 agent 是「失憶」的",
    "暫停前：叫 agent 把進度、\n下一步寫成一份 handoff note",
    "下次開工：讓 agent 讀那份 note\n接回來繼續",
  ].forEach((t, i) => {
    s.addText("•  " + t, {
      x: 5.28, y: 3.16 + i * 0.76, w: 3.9, h: 0.72,
      fontSize: 12, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });

  // ── Bottom takeaway ──
  hLine(s, 5.64);
  box(s, 0.6, 5.74, 8.8, 0.44, "EAF2FF", C.primary);
  s.addText("Code 靠 Git 保存　　Agent 記憶靠你叫它「先寫下來」", {
    x: 0.6, y: 5.74, w: 8.8, h: 0.44,
    fontSize: 13, fontFace: FONT, bold: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 9 — Subtitle / Section transition（Part B）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgSection };

  addEyebrow(s, "Part B  ·  Changes 管理  —  04", C.white);

  s.addText("回到 main", {
    x: 0.8, y: 1.5, w: 8.5, h: 1.0,
    fontSize: 46, fontFace: FONT, bold: true, color: C.white,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Sharing your work — Pull Request review", {
    x: 0.8, y: 2.5, w: 8.5, h: 0.48,
    fontSize: 22, fontFace: FONT, color: "AFE0EF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.15, w: 1.0, h: 0.04,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("個人 commit 完，怎麼把改動交給別人看、討論、合進 main", {
    x: 0.8, y: 3.28, w: 8.5, h: 0.3,
    fontSize: 13, fontFace: FONT, color: "B8D4DE",
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 10 — PR Review 流程（橫向流程 + 角色職責）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Changes 管理  —  05");
  addTitle(s, "PR Review 流程", "Open PR → Review → Merge");

  s.addText("從個人分支進到團隊 main，中間是一段協作儀式 — 兩個角色都會碰到。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  // ── Horizontal flow（5 steps, 較緊湊）──
  const flow = [
    { zh: "Branch + Commit", en: "個人分支" },
    { zh: "Open PR", en: "開 PR" },
    { zh: "Review", en: "Reviewer 審查" },
    { zh: "Iterate", en: "回應 / 修改" },
    { zh: "Merge", en: "合進 main" },
  ];

  const flowY = 2.28;
  const stepW = 1.55;
  const arrowW = 0.3;
  const totalW = 5 * stepW + 4 * arrowW;
  const flowStartX = (10.0 - totalW) / 2;

  flow.forEach((step, i) => {
    const x = flowStartX + i * (stepW + arrowW);
    const isLast = i === flow.length - 1;
    const bg = isLast ? C.primary : (i === 2 ? C.skyDeep : C.white);
    const fg = (isLast || i === 2) ? C.white : C.ink;
    const border = (isLast || i === 2) ? bg : C.line;

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: flowY, w: stepW, h: 0.7,
      fill: { color: bg },
      line: { color: border, width: 1 },
      rectRadius: 0.08,
    });
    s.addText(step.zh, {
      x, y: flowY + 0.06, w: stepW, h: 0.3,
      fontSize: 12.5, fontFace: FONT, bold: true, color: fg,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(step.en, {
      x, y: flowY + 0.36, w: stepW, h: 0.28,
      fontSize: 10, fontFace: FONT,
      color: (isLast || i === 2) ? "DCEEF3" : C.muted,
      align: "center", valign: "middle", margin: 0,
    });

    if (i < flow.length - 1) {
      const ax = x + stepW + 0.04;
      s.addShape(pres.shapes.RIGHT_TRIANGLE, {
        x: ax, y: flowY + 0.26, w: 0.22, h: 0.18,
        fill: { color: C.muted }, line: { color: C.muted, width: 0 },
        rotate: 90,
      });
    }
  });

  hLine(s, 3.12);

  // ── Bottom: Full checklists (moved from old slide 11) ──
  const colY = 3.24;
  const colH = 3.36;

  // Requester column
  box(s, 0.6, colY, 4.3, colH, C.gitBg, C.gitText);
  s.addText("📤  Requester 的功課", {
    x: 0.78, y: colY + 0.12, w: 4.0, h: 0.32,
    fontSize: 13, fontFace: FONT, bold: true, color: C.gitText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("讓 reviewer 用最少力氣看懂", {
    x: 0.78, y: colY + 0.44, w: 4.0, h: 0.22,
    fontSize: 10.5, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, colY + 0.7, 0.78, 4.0);
  [
    "PR 範圍小 — 一個 PR 只解一件事",
    "Description 三段：what / why / how to test",
    "貼 before/after 截圖或預覽連結",
    "Tag 對的 reviewer，不亂撒網",
    "回應每條 comment（修了 / 不同意 / 之後）",
    "改完 push 再 ping，不要邊改邊催",
  ].forEach((t, i) => {
    s.addText("☐  " + t, {
      x: 0.78, y: colY + 0.82 + i * 0.4, w: 4.0, h: 0.38,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });

  // Reviewer column
  box(s, 5.1, colY, 4.3, colH, "DCEEF3", C.skyDeep);
  s.addText("📥  Reviewer 的功課", {
    x: 5.28, y: colY + 0.12, w: 4.0, h: 0.32,
    fontSize: 13, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("提問為主，幫作者把盲點找出來", {
    x: 5.28, y: colY + 0.44, w: 4.0, h: 0.22,
    fontSize: 10.5, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, colY + 0.7, 5.28, 4.0);
  [
    "先讀 description，掃 PR scope",
    "只 review 改動的範圍，不順手碰整檔",
    "對照 before/after — 視覺差異 vs 預期",
    "提問優先於下決定（「這是 DS 嗎？」）",
    "區分 violation（必修）vs 偏好（討論）",
    "Tone 友善、指出位置 + 建議方向",
  ].forEach((t, i) => {
    s.addText("☐  " + t, {
      x: 5.28, y: colY + 0.82 + i * 0.4, w: 4.0, h: 0.38,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });

  // Takeaway
  hLine(s, 6.7);
  s.addText("把對方需要的資訊準備好，review 才不會變成猜謎或拉鋸戰", {
    x: 0.6, y: 6.78, w: 8.8, h: 0.3,
    fontSize: 11.5, fontFace: FONT, bold: true, italic: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 11 — Merge Conflict 怎麼發生、怎麼處理（Part B）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Changes 管理  —  06");
  addTitle(s, "Merge Conflict — 怎麼發生、怎麼處理", "Why conflicts happen & how to handle them");

  s.addText("Git 沒法自動合併兩條 branch 對同一段 code 的不同改動 — 需要人來判斷。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // ── Left: 為什麼會發生（3 個常見原因）──
  box(s, 0.6, 2.38, 4.3, 4.0, C.warningBg, C.warningText);
  s.addText("⚠️  為什麼會發生", {
    x: 0.78, y: 2.52, w: 4.0, h: 0.34,
    fontSize: 14, fontFace: FONT, bold: true, color: C.warningText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Common causes", {
    x: 0.78, y: 2.86, w: 4.0, h: 0.22,
    fontSize: 10, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 3.12, 0.78, 4.0);

  const causes = [
    { t: "Branch 開太久沒同步 main", d: "main 已經往前走、你的 branch 還停在分岔點" },
    { t: "兩條 branch 改到同一段 code", d: "你跟同事改了同一個 component / 同一行 css" },
    { t: "同檔多人同時編輯", d: "多個設計師動同一個 mockup html" },
  ];
  causes.forEach((c, i) => {
    const y = 3.26 + i * 1.0;
    s.addText((i + 1) + ".  " + c.t, {
      x: 0.78, y, w: 4.0, h: 0.34,
      fontSize: 12, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(c.d, {
      x: 1.0, y: y + 0.36, w: 3.8, h: 0.5,
      fontSize: 10.5, fontFace: FONT, color: C.text,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });

  // ── Right: 處理原則 ──
  box(s, 5.1, 2.38, 4.3, 4.0, "DCEEF3", C.skyDeep);
  s.addText("🧭  原則上怎麼處理", {
    x: 5.28, y: 2.52, w: 4.0, h: 0.34,
    fontSize: 14, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Handling principles", {
    x: 5.28, y: 2.86, w: 4.0, h: 0.22,
    fontSize: 10, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 3.12, 5.28, 4.0);

  const handle = [
    "開 PR 前先 git pull main + rebase（或 merge）",
    "Conflict 出現先看清楚兩邊內容、不要憑感覺挑",
    "不確定該保哪邊 → 找另一位 author 一起確認",
    "解完跑一次 build / 預覽 → 確認沒漏改",
    "衝突太大就 retreat — 把 PR 拆小再來",
  ];
  handle.forEach((t, i) => {
    s.addText("•  " + t, {
      x: 5.28, y: 3.22 + i * 0.6, w: 4.0, h: 0.56,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });

  // Takeaway
  hLine(s, 6.5);
  s.addText("衝突不是錯誤，是 git 把判斷權交還給人 — 慢慢來、別硬接", {
    x: 0.6, y: 6.6, w: 8.8, h: 0.34,
    fontSize: 12, fontFace: FONT, bold: true, italic: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 12 — design-pr-review skill（Part B）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Changes 管理  —  07");
  addTitle(s, "我寫了個 skill 來自動化這件事", "design-pr-review — a Claude Code skill");

  s.addText("checklist 太多項記不住？我寫了個 skill 把這些步驟跑起來，連最後一條多人改的衝突點也會自動掃。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // ── Left: 功能列表 ──
  box(s, 0.6, 2.38, 4.1, 3.4, C.figmaBg, C.figmaText);
  s.addText("🤖  Skill 做這些事", {
    x: 0.78, y: 2.52, w: 3.7, h: 0.34,
    fontSize: 13, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 2.92, 0.78, 3.7);
  [
    "自動 scope PR\n（只看改動的檔案）",
    "Before / After side-by-side\n（mockup 視覺差異）",
    "Design-system violation\n以「提問」方式 flag 出來",
    "多人改的衝突檔案掃描\n（同檔多 author → 標出來）",
    "Draft 友善 tone 的留言\n交給 pr-comment 發佈",
  ].forEach((t, i) => {
    s.addText("•  " + t, {
      x: 0.78, y: 3.02 + i * 0.55, w: 3.7, h: 0.5,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });

  // ── Right: Screenshot placeholder ──
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.0, y: 2.38, w: 4.4, h: 3.4,
    fill: { color: C.white },
    line: { color: C.subtle, width: 1, dashType: "dash" },
  });
  s.addText("📸  截圖位置（手動插入）", {
    x: 5.0, y: 3.7, w: 4.4, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("PR #259 mixed bottom-sheet\nside-by-side + selector group", {
    x: 5.0, y: 4.1, w: 4.4, h: 0.5,
    fontSize: 10.5, fontFace: FONT, color: C.subtle,
    align: "center", valign: "middle", margin: 0,
  });

  // ── Bottom: trigger 詞 ──
  hLine(s, 5.92);
  box(s, 0.6, 6.02, 8.8, 0.44, C.bgQuestion, C.primary);
  s.addText("Trigger：「review this design PR」 / 「設計 PR review」 / /design-pr-review", {
    x: 0.6, y: 6.02, w: 8.8, h: 0.44,
    fontSize: 12, fontFace: FONT, bold: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 13 — Section Divider C
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgSection };

  addEyebrow(s, "Part C  ·  Main Focus", C.white);

  s.addText("三種 Working Repo", {
    x: 0.8, y: 1.5, w: 8.5, h: 1.0,
    fontSize: 46, fontFace: FONT, bold: true, color: C.white,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Three Working Repo Types", {
    x: 0.8, y: 2.5, w: 8.5, h: 0.48,
    fontSize: 22, fontFace: FONT, color: "D0DEFF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.15, w: 1.0, h: 0.04,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  s.addText("Type A 協作 repo  ·  Type B 引用 repo  ·  Type C 個人 repo", {
    x: 0.8, y: 3.28, w: 8.5, h: 0.3,
    fontSize: 13, fontFace: FONT, color: "B8CCFF",
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 9 — 三種類型總覽
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "三種 Working Repo  —  總覽");
  addTitle(s, "你跟這個 repo 的關係是什麼？", "What's your relationship with this repo?");

  const types = [
    {
      type: "A", label: "協作 repo", labelEn: "Collaboration",
      example: "產品 repo、team repo",
      role: "貢獻者（有寫入權限）",
      mechanism: "Branch → PR → Merge",
      freq: "每天都在改",
      bg: C.gitBg, fg: C.primary,
    },
    {
      type: "B", label: "引用 repo", labelEn: "Reference",
      example: "Design System、部門規範",
      role: "讀者（很少編輯）",
      mechanism: "Agent hooks + local cache",
      freq: "跟著版本更新",
      bg: C.figmaBg, fg: C.figmaText,
    },
    {
      type: "C", label: "個人 repo", labelEn: "Personal",
      example: "Side project、實驗、dotfiles",
      role: "擁有者（完全自主）",
      mechanism: "Commit + Push（無 PR）",
      freq: "自己決定",
      bg: C.greenBg, fg: C.greenText,
    },
  ];

  types.forEach((t, i) => {
    const x = 0.5 + i * 3.17;
    const cardW = 3.0;

    // Card header
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.05, w: cardW, h: 3.82,
      fill: { color: C.rowAlt }, line: { color: C.line, width: 1 }, rectRadius: 0.12,
    });

    // Type badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.15, y: 2.15, w: 0.46, h: 0.46,
      fill: { color: t.bg }, line: { color: t.bg, width: 0 }, rectRadius: 0.1,
    });
    s.addText(t.type, { x: x + 0.15, y: 2.15, w: 0.46, h: 0.46, fontSize: 17, fontFace: FONT, bold: true, color: t.fg, align: "center", valign: "middle", margin: 0 });

    s.addText(t.label, { x: x + 0.72, y: 2.2, w: 2.1, h: 0.28, fontSize: 15, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
    s.addText(t.labelEn, { x: x + 0.72, y: 2.48, w: 2.1, h: 0.22, fontSize: 10, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0 });

    hLine(s, 2.76, x + 0.15, cardW - 0.3);

    const rows = [
      { key: "典型例子", val: t.example },
      { key: "我的角色", val: t.role },
      { key: "核心機制", val: t.mechanism },
      { key: "改動頻率", val: t.freq },
    ];
    rows.forEach((r, ri) => {
      const ry = 2.86 + ri * 0.72;
      s.addText(r.key, { x: x + 0.2, y: ry, w: cardW - 0.4, h: 0.26, fontSize: 10, fontFace: FONT, bold: true, color: C.muted, align: "left", valign: "middle", margin: 0 });
      s.addText(r.val, { x: x + 0.2, y: ry + 0.26, w: cardW - 0.4, h: 0.36, fontSize: 11.5, fontFace: FONT, color: C.ink, align: "left", valign: "top", margin: 0, wrap: true });
    });
  });
}

// ==========================================================
// Slide 10 — Type A：概念 + 日常流程
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Type A  ·  協作 Repo  —  01");
  addTitle(s, "你是貢獻者", "You have write access — work with your team");

  // Left: concept
  s.addText("核心觀念", { x: 0.6, y: 2.05, w: 4.3, h: 0.3, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
  const concepts = [
    "Main branch = 團隊共識版本，不直接改",
    "你的工作在 branch 上進行",
    "改好了 → PR → review → merge 才進 main",
    "Agent 幫你 commit + push，你決定 PR 時機",
  ];
  concepts.forEach((c, i) => {
    s.addShape(pres.shapes.OVAL, { x: 0.65, y: 2.46 + i * 0.44 + 0.1, w: 0.08, h: 0.08, fill: { color: C.primary }, line: { color: C.primary, width: 0 } });
    s.addText(c, { x: 0.86, y: 2.46 + i * 0.44, w: 3.9, h: 0.4, fontSize: 12.5, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0, wrap: true });
  });

  // Vertical divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.08, y: 2.05, w: 0.004, h: 3.8,
    fill: { color: C.line }, line: { color: C.line, width: 0 },
  });

  // Right: daily flow
  s.addText("日常同步流程", { x: 5.3, y: 2.05, w: 4.3, h: 0.3, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });

  const flowSteps = [
    { icon: "☀️", when: "開工前", action: "pull main，更新到最新" },
    { icon: "🌿", when: "工作中", action: "branch 上 commit，視情況把 main merge 進來" },
    { icon: "🚀", when: "收工前", action: "push branch，視情況開 PR" },
  ];
  flowSteps.forEach((f, i) => {
    const y = 2.46 + i * 1.1;
    box(s, 5.3, y, 4.3, 0.96, i % 2 === 0 ? C.rowAlt : C.bg, C.line);
    s.addText(f.icon, { x: 5.35, y: y + 0.08, w: 0.5, h: 0.8, fontSize: 20, align: "center", valign: "middle", margin: 0 });
    s.addText(f.when, { x: 5.9, y: y + 0.06, w: 3.5, h: 0.3, fontSize: 11, fontFace: FONT, bold: true, color: C.muted, align: "left", valign: "middle", margin: 0 });
    s.addText(f.action, { x: 5.9, y: y + 0.34, w: 3.5, h: 0.46, fontSize: 12.5, fontFace: FONT, color: C.ink, align: "left", valign: "middle", margin: 0, wrap: true });
  });
}

// ==========================================================
// Slide 11 — Type A：同步注意 + 除錯
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Type A  ·  協作 Repo  —  02");
  addTitle(s, "該注意什麼 + 怎麼除錯", "What to watch out for + common fixes");

  // Watch out section
  s.addText("該注意什麼", { x: 0.6, y: 2.05, w: 9, h: 0.3, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
  hLine(s, 2.4);

  const warnings = [
    { icon: "1", text: "Pull 前先 commit 或 stash — 否則本機改動可能跟遠端衝突", level: "warning" },
    { icon: "2", text: "確認你在對的 branch — 不要在 main 上直接改", level: "warning" },
    { icon: "3", text: "PR 開了之後若 main 繼續有改動，要 sync（GitHub 的「Update branch」）", level: "info" },
  ];

  warnings.forEach((w, i) => {
    const y = 2.5 + i * 0.6;
    box(s, 0.6, y + 0.04, 0.36, 0.36, w.level === "warning" ? C.warningBg : C.gitBg, w.level === "warning" ? "FCD34D" : C.primary);
    s.addText(w.icon, { x: 0.6, y: y + 0.04, w: 0.36, h: 0.36, fontSize: 13, fontFace: FONT, bold: true, color: w.level === "warning" ? C.warningText : C.primary, align: "center", valign: "middle", margin: 0 });
    s.addText(w.text, { x: 1.1, y, w: 8.4, h: 0.48, fontSize: 12.5, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0, wrap: true });
    hLine(s, y + 0.54);
  });

  // Debug section
  s.addText("怎麼除錯", { x: 0.6, y: 4.36, w: 9, h: 0.3, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
  hLine(s, 4.72);

  const bugs = [
    { err: "rejected (non-fast-forward)", fix: "先 pull，再 push" },
    { err: "CONFLICT", fix: "手動解，或對 agent 說「幫我解這個 conflict」" },
    { err: "不確定在哪個 branch", fix: "問 agent「我現在在哪個 branch？」或看 VS Code 左下角" },
  ];

  bugs.forEach((b, i) => {
    const y = 4.82 + i * 0.5;
    if (i % 2 === 1) box(s, 0.6, y - 0.04, 9, 0.5, C.rowAlt);
    box(s, 0.65, y + 0.06, 3.3, 0.3, "FEE2E2", "FECACA");
    s.addText(b.err, { x: 0.65, y: y + 0.06, w: 3.3, h: 0.3, fontSize: 10.5, fontFace: "Courier New", color: "DC2626", align: "center", valign: "middle", margin: 0 });
    s.addText("→", { x: 4.05, y, w: 0.3, h: 0.48, fontSize: 13, color: C.muted, align: "center", valign: "middle", margin: 0 });
    s.addText(b.fix, { x: 4.4, y, w: 5.1, h: 0.48, fontSize: 12, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0, wrap: true });
    hLine(s, y + 0.44);
  });
}

// ==========================================================
// Slide 12 — Type B：你是「讀者」
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Type B  ·  引用 Repo  —  01");
  addTitle(s, "你是「讀者」，不是「貢獻者」", "You consume this repo — rarely edit it");

  // Role box
  box(s, 0.6, 2.05, 9, 0.46, C.figmaBg);
  s.addText("這個 repo 存在的目的：讓你的 Agent 知道規範是什麼，才能幫你設計出符合標準的東西", {
    x: 0.6, y: 2.05, w: 9, h: 0.46,
    fontSize: 12.5, fontFace: FONT, color: C.figmaText,
    align: "center", valign: "middle", margin: 0,
  });

  // Two content types
  hLine(s, 2.62);
  s.addText("Type B 包含兩種內容，處理方式相同", {
    x: 0.6, y: 2.68, w: 9, h: 0.28,
    fontSize: 13, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });

  const types = [
    {
      label: "Design System", icon: "🎨",
      items: ["設計 token（色票名稱、spacing、字型規格）", "元件使用規則（什麼時候用哪個 variant）", "Do's & Don'ts"],
      bg: C.figmaBg, fg: C.figmaText,
    },
    {
      label: "部門規範 / Conventions", icon: "📋",
      items: ["Design conventions、決策記錄", "Template、toolkit 文件", "Brand voice、用字規範"],
      bg: C.gitBg, fg: C.primary,
    },
  ];

  types.forEach((t, i) => {
    const x = 0.55 + i * 4.72;
    const w = 4.45;
    box(s, x, 3.08, w, 2.5, C.rowAlt, C.line);

    s.addText(t.icon + "  " + t.label, {
      x: x + 0.18, y: 3.16, w: w - 0.36, h: 0.38,
      fontSize: 14, fontFace: FONT, bold: true, color: t.fg,
      align: "left", valign: "middle", margin: 0,
    });
    hLine(s, 3.58, x + 0.18, w - 0.36);

    t.items.forEach((item, ii) => {
      s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: 3.7 + ii * 0.5 + 0.12, w: 0.08, h: 0.08, fill: { color: t.fg }, line: { color: t.fg, width: 0 } });
      s.addText(item, { x: x + 0.4, y: 3.7 + ii * 0.5, w: w - 0.58, h: 0.46, fontSize: 11.5, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0, wrap: true });
    });
  });

  // Bottom note
  box(s, 0.6, 5.7, 9, 0.46, C.rowAlt, C.line);
  s.addText("Agent 讀這些內容 → 才能在幫你寫 code 或生成設計時，自動遵守你的 DS 規範與部門標準", {
    x: 0.6, y: 5.7, w: 9, h: 0.46,
    fontSize: 12, fontFace: FONT, color: C.text, italic: true,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 13 — Type B：Agent Hooks + Local Cache 機制
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Type B  ·  引用 Repo  —  02");
  addTitle(s, "Agent 怎麼拿到這些內容？", "How does your agent access the reference repo?");

  // Flow diagram
  const flowItems = [
    { label: "Department\nRepo", sub: "GitHub Remote", bg: C.figmaBg, fg: C.figmaText, x: 0.5 },
    { label: "fetch &\ncron-job", sub: "Agent hooks\n自動定期執行", bg: C.gitBg, fg: C.primary, x: 3.3, isArrow: true },
    { label: "Local Cache", sub: "TTL: weekly\n本機快取", bg: C.greenBg, fg: C.greenText, x: 6.1 },
  ];

  flowItems.forEach((f, i) => {
    if (f.isArrow) {
      // Arrow connector
      s.addShape(pres.shapes.RECTANGLE, {
        x: 2.9, y: 3.12, w: 0.5, h: 0.04,
        fill: { color: C.primary }, line: { color: C.primary, width: 0 },
      });
      box(s, f.x, 2.7, 2.5, 1.0, f.bg, C.primary);
      s.addText(f.label, { x: f.x, y: 2.76, w: 2.5, h: 0.5, fontSize: 14, fontFace: FONT, bold: true, color: f.fg, align: "center", valign: "middle", margin: 0 });
      s.addText(f.sub, { x: f.x, y: 3.26, w: 2.5, h: 0.38, fontSize: 10.5, fontFace: FONT, color: f.fg, align: "center", valign: "middle", margin: 0 });
      s.addShape(pres.shapes.RECTANGLE, {
        x: 5.8, y: 3.12, w: 0.5, h: 0.04,
        fill: { color: C.primary }, line: { color: C.primary, width: 0 },
      });
      // Arrow heads
      s.addText("→", { x: 2.75, y: 2.98, w: 0.5, h: 0.3, fontSize: 16, color: C.primary, align: "center", valign: "middle", margin: 0 });
      s.addText("→", { x: 5.75, y: 2.98, w: 0.5, h: 0.3, fontSize: 16, color: C.primary, align: "center", valign: "middle", margin: 0 });
    } else {
      box(s, f.x, 2.7, 2.5, 1.0, f.bg, C.line);
      s.addText(f.label, { x: f.x, y: 2.76, w: 2.5, h: 0.5, fontSize: 14, fontFace: FONT, bold: true, color: f.fg, align: "center", valign: "middle", margin: 0 });
      s.addText(f.sub, { x: f.x, y: 3.26, w: 2.5, h: 0.38, fontSize: 10, fontFace: FONT, color: C.muted, align: "center", valign: "middle", margin: 0 });
    }
  });

  // Agent reads from cache
  s.addText("↓", { x: 7.1, y: 3.72, w: 0.5, h: 0.3, fontSize: 16, color: C.muted, align: "center", valign: "middle", margin: 0 });
  box(s, 5.8, 4.08, 2.9, 0.56, C.rowAlt, C.line);
  s.addText("Agent 讀取 → 套用規範", { x: 5.8, y: 4.08, w: 2.9, h: 0.56, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "center", valign: "middle", margin: 0 });

  // Key points
  hLine(s, 4.78);
  const keyPoints = [
    { icon: "✅", text: "自動執行 — 平常你不需要做任何事" },
    { icon: "📅", text: "TTL weekly — DS 改動慢，週更一次夠用" },
    { icon: "⚙️", text: "設定一次（通常由 department 統一配置），之後 hooks 自動維護" },
  ];
  keyPoints.forEach((k, i) => {
    s.addText(k.icon + "  " + k.text, {
      x: 0.6, y: 4.9 + i * 0.42, w: 9, h: 0.38,
      fontSize: 12.5, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
  });
}

// ==========================================================
// Slide 14 — Type B：你的責任邊界
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Type B  ·  引用 Repo  —  03");
  addTitle(s, "你需要做什麼？", "Your responsibilities with a reference repo");

  const rows = [
    {
      when: "平常", whenEn: "Normal operation",
      action: "什麼都不用做", detail: "Hooks 自動幫你維持 local cache 最新",
      badge: "自動", bc: C.greenBg, bfg: C.greenText,
    },
    {
      when: "發現規範過時", whenEn: "Cache looks stale",
      action: "手動觸發一次 fetch", detail: "確認 cron-job 有在跑，或手動 pull Department repo",
      badge: "偶爾", bc: C.warningBg, bfg: C.warningText,
    },
    {
      when: "要回饋修正", whenEn: "Want to fix or update the convention",
      action: "切換成 Type A 流程", detail: "到 Department repo 開 branch → 改 → PR，不要改 local cache",
      badge: "少見", bc: C.figmaBg, bfg: C.figmaText,
    },
  ];

  hLine(s, 2.05);
  rows.forEach((r, i) => {
    const y = 2.16 + i * 1.18;
    if (i % 2 === 1) box(s, 0.6, y - 0.06, 9, 1.18, C.rowAlt);

    pill(s, 0.65, y + 0.2, r.badge, r.bc, r.bfg, 0.88);
    s.addText(r.when, { x: 1.65, y, w: 2.4, h: 0.34, fontSize: 14, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
    s.addText(r.whenEn, { x: 1.65, y: y + 0.34, w: 2.4, h: 0.24, fontSize: 10, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0 });
    s.addText(r.action, { x: 4.2, y, w: 5.2, h: 0.34, fontSize: 14, fontFace: FONT, bold: true, color: C.primary, align: "left", valign: "middle", margin: 0 });
    s.addText(r.detail, { x: 4.2, y: y + 0.36, w: 5.2, h: 0.54, fontSize: 11.5, fontFace: FONT, color: C.muted, align: "left", valign: "top", margin: 0, wrap: true });

    hLine(s, y + 1.1);
  });

  // Hard rule
  box(s, 0.6, 5.7, 9, 0.46, "FEE2E2", "FECACA");
  s.addText("🚫  不要直接改 local cache 裡的內容 — 下次 fetch 會被覆蓋，改了等於沒改", {
    x: 0.6, y: 5.7, w: 9, h: 0.46,
    fontSize: 12.5, fontFace: FONT, bold: true, color: "DC2626",
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 15 — Type C：個人 Repo
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Type C  ·  個人 Repo");
  addTitle(s, "完全自主 — 規則自己定", "Your repo, your rules");

  // Left: setup + flow
  s.addText("設置 & 日常流程", { x: 0.6, y: 2.05, w: 4.3, h: 0.3, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
  hLine(s, 2.4, 0.6, 4.3);

  const flowItems2 = [
    { step: "1", text: "建 GitHub repo + .gitignore", sub: ".env / node_modules / .DS_Store" },
    { step: "2", text: "Commit + Push（沒有 PR 壓力）", sub: "建議：每次工作結束 push 一次" },
    { step: "3", text: "跨裝置：git pull 拿最新", sub: "換電腦後先 pull，再開始工作" },
  ];
  flowItems2.forEach((f, i) => {
    const y = 2.52 + i * 1.0;
    box(s, 0.6, y, 0.44, 0.44, C.greenBg, C.greenText);
    s.addText(f.step, { x: 0.6, y, w: 0.44, h: 0.44, fontSize: 16, fontFace: FONT, bold: true, color: C.greenText, align: "center", valign: "middle", margin: 0 });
    s.addText(f.text, { x: 1.18, y, w: 3.72, h: 0.3, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
    s.addText(f.sub, { x: 1.18, y: y + 0.3, w: 3.72, h: 0.26, fontSize: 10.5, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0 });
  });

  // Vertical divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.08, y: 2.05, w: 0.004, h: 3.6,
    fill: { color: C.line }, line: { color: C.line, width: 0 },
  });

  // Right: watch out
  s.addText("該注意什麼", { x: 5.3, y: 2.05, w: 4.3, h: 0.3, fontSize: 13, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
  hLine(s, 2.4, 5.3, 4.3);

  const watchouts = [
    { icon: "🔐", text: "不要 commit .env（API key、密碼）", level: "danger" },
    { icon: "👁️", text: "Public repo 特別小心，不要放任何內部資料", level: "danger" },
    { icon: "📝", text: "Commit message 要讓三個月後的自己看得懂", level: "info" },
  ];
  watchouts.forEach((w, i) => {
    const y = 2.52 + i * 0.96;
    box(s, 5.3, y, 4.3, 0.82, w.level === "danger" ? "FEE2E2" : C.rowAlt, w.level === "danger" ? "FECACA" : C.line);
    s.addText(w.icon, { x: 5.4, y: y + 0.06, w: 0.5, h: 0.7, fontSize: 20, align: "center", valign: "middle", margin: 0 });
    s.addText(w.text, { x: 5.96, y: y + 0.06, w: 3.5, h: 0.7, fontSize: 12.5, fontFace: FONT, color: w.level === "danger" ? "DC2626" : C.ink, align: "left", valign: "middle", margin: 0, wrap: true });
  });

  // Bottom: rescue
  box(s, 0.6, 5.7, 9, 0.46, C.warningBg, "FCD34D");
  s.addText("發現 .env 已經 commit 了？→ 對 agent 說「幫我把 .env 從 git 記錄裡移除」", {
    x: 0.6, y: 5.7, w: 9, h: 0.46,
    fontSize: 12, fontFace: FONT, color: C.warningText,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 16 — 三種類型決策指南
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "三種 Working Repo  —  決策指南");
  addTitle(s, "遇到一個 repo，你應該用哪種方式對待它？", "Which type applies to this repo?");

  const questions = [
    {
      q: "這個 repo 我需要改東西、跟人協作？",
      qEn: "Do I need to edit and collaborate?",
      yes: "Type A  協作 repo",
      hint: "Branch → PR → Merge",
      bc: C.primary, bb: C.gitBg,
    },
    {
      q: "這個 repo 我只是要讀它的規範或文件？",
      qEn: "Do I just need to read it for reference?",
      yes: "Type B  引用 repo",
      hint: "Agent hooks + local cache",
      bc: C.figmaText, bb: C.figmaBg,
    },
    {
      q: "這個 repo 完全是我自己的、沒有協作壓力？",
      qEn: "Is this purely mine — no team, no review?",
      yes: "Type C  個人 repo",
      hint: "Commit + Push，自己決定節奏",
      bc: C.greenText, bb: C.greenBg,
    },
  ];

  hLine(s, 2.05);
  questions.forEach((q, i) => {
    const y = 2.16 + i * 1.2;
    if (i % 2 === 1) box(s, 0.6, y - 0.06, 9, 1.2, C.rowAlt);

    // Question
    s.addText(q.q, { x: 0.7, y, w: 5.4, h: 0.38, fontSize: 15, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
    s.addText(q.qEn, { x: 0.7, y: y + 0.38, w: 5.4, h: 0.24, fontSize: 10.5, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0 });
    s.addText("→", { x: 6.2, y: y + 0.12, w: 0.3, h: 0.5, fontSize: 16, color: C.muted, align: "center", valign: "middle", margin: 0 });

    // Answer card
    box(s, 6.6, y + 0.05, 3.0, 0.9, q.bb, q.bc);
    s.addText(q.yes, { x: 6.7, y: y + 0.1, w: 2.8, h: 0.38, fontSize: 13, fontFace: FONT, bold: true, color: q.bc, align: "left", valign: "middle", margin: 0 });
    s.addText(q.hint, { x: 6.7, y: y + 0.48, w: 2.8, h: 0.36, fontSize: 10.5, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0 });

    hLine(s, y + 1.12);
  });

  // Note: one repo can be both
  box(s, 0.6, 5.72, 9, 0.44, C.rowAlt, C.line);
  s.addText("💡  同一個 repo 可能兩種都有 — 平常你是 Type B 讀者，偶爾有 feedback 時暫時切換成 Type A 貢獻者", {
    x: 0.6, y: 5.72, w: 9, h: 0.44,
    fontSize: 11.5, fontFace: FONT, color: C.text,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 17 — Key Takeaway
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
      zh: "Commit = 存檔；Push = 分享。Branch 在任務開始前開。",
      en: "Commit saves locally. Push shares. Always branch before you start editing.",
    },
    {
      n: "2",
      zh: "三種 Repo，三種對待方式 — 你的角色決定你怎麼做",
      en: "Collaboration = branch+PR  /  Reference = agent reads  /  Personal = just push",
    },
    {
      n: "3",
      zh: "Type B 的 DS 與部門規範，靠 Agent hooks 自動同步 — 你不需要手動管",
      en: "Reference repos are auto-synced via hooks. You only act when cache looks stale.",
    },
  ];

  points.forEach((p, i) => {
    const y = 2.2 + i * 1.2;
    box(s, 0.6, y + 0.12, 0.6, 0.6, C.primary);
    s.addText(p.n, { x: 0.6, y: y + 0.12, w: 0.6, h: 0.6, fontSize: 20, fontFace: FONT, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s.addText(p.zh, { x: 1.4, y, w: 8.1, h: 0.44, fontSize: 17, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0, wrap: true });
    s.addText(p.en, { x: 1.4, y: y + 0.46, w: 8.1, h: 0.36, fontSize: 11.5, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0, wrap: true });
    hLine(s, y + 1.12);
  });
}

// ==========================================================
// Slide 18 — 下週預告
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgQuestion };

  addEyebrow(s, "Next Week");
  s.addText("Week 4", { x: 0.8, y: 1.0, w: 8.5, h: 0.42, fontSize: 14, fontFace: FONT, bold: true, color: C.primary, align: "left", valign: "middle", margin: 0 });
  s.addText("用 AI 操作 Git", { x: 0.8, y: 1.42, w: 8.5, h: 0.82, fontSize: 40, fontFace: FONT, bold: true, color: C.ink, align: "left", valign: "middle", margin: 0 });
  s.addText("Using AI for Git Operations", { x: 0.8, y: 2.24, w: 8.5, h: 0.44, fontSize: 20, fontFace: FONT, color: C.muted, align: "left", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.84, w: 0.6, h: 0.04, fill: { color: C.primary }, line: { color: C.primary, width: 0 } });

  const previews = [
    "Claude Code 操作示範 — 把中文指令變成正確的 git 動作",
    "什麼時候信任 Agent？什麼時候要自己確認？",
    "避免 push 錯路徑的防呆技巧",
  ];
  previews.forEach((p, i) => {
    s.addShape(pres.shapes.OVAL, { x: 0.84, y: 3.04 + i * 0.54 + 0.13, w: 0.08, h: 0.08, fill: { color: C.primary }, line: { color: C.primary, width: 0 } });
    s.addText(p, { x: 1.1, y: 3.04 + i * 0.54, w: 8.3, h: 0.46, fontSize: 14, fontFace: FONT, color: C.text, align: "left", valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.8, w: 10, h: 0.45, fill: { color: C.primary }, line: { color: C.primary, width: 0 } });
  s.addText("GitHub for UI Designers  ·  Week 3 / 6  ·  Karen Shen", {
    x: 0, y: 5.8, w: 10, h: 0.45,
    fontSize: 11, fontFace: FONT, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 19 — Additional Discussion · Vibe Coding 像自動駕駛
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Additional Discussion  ·  個人心得");
  addTitle(s, "Vibe Coding ≠ 全自動駕駛", "Stay in the driver's seat, even with an AI co-pilot");

  s.addText("把 agent 當副駕，不是把方向盤整個丟過去 — 你還是駕駛，要看路、確認方向、必要時接管。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.36,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.3);

  // ── 3-cell analogy ──
  const cells = [
    { emoji: "🤖", zh: "Agent 可以幫", en: "It can help", detail: "寫 code、跑步驟、改錯字、查文件" },
    { emoji: "👁️", zh: "你要看路", en: "Stay watching", detail: "方向對不對、有沒有偏掉、要不要踩煞車" },
    { emoji: "🧭", zh: "方向你決定", en: "You steer", detail: "終點是什麼、為什麼這樣做、責任是你的" },
  ];

  const cellY = 2.5;
  const cellH = 2.8;
  cells.forEach((c, i) => {
    const x = 0.6 + i * 3.08;
    box(s, x, cellY, 2.84, cellH, C.white, C.line);

    // Emoji (big)
    s.addText(c.emoji, {
      x, y: cellY + 0.2, w: 2.84, h: 0.95,
      fontSize: 54, fontFace: FONT,
      align: "center", valign: "middle", margin: 0,
    });

    // Divider under emoji
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 1.17, y: cellY + 1.22, w: 0.5, h: 0.025,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });

    // zh title
    s.addText(c.zh, {
      x, y: cellY + 1.32, w: 2.84, h: 0.34,
      fontSize: 16, fontFace: FONT, bold: true, color: C.ink,
      align: "center", valign: "middle", margin: 0,
    });
    // en
    s.addText(c.en, {
      x, y: cellY + 1.68, w: 2.84, h: 0.26,
      fontSize: 11, fontFace: FONT, italic: true, color: C.muted,
      align: "center", valign: "middle", margin: 0,
    });
    // detail
    s.addText(c.detail, {
      x: x + 0.2, y: cellY + 2.02, w: 2.44, h: 0.7,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "center", valign: "top", margin: 0, wrap: true,
    });
  });

  // ── Bottom takeaway band ──
  hLine(s, 5.5);
  box(s, 0.6, 5.65, 8.8, 1.3, C.bgQuestion, C.skyDeep);

  s.addText("把 agent 用在「加速執行」上，不是「代你判斷」上", {
    x: 0.6, y: 5.78, w: 8.8, h: 0.46,
    fontSize: 17, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("Hands on the wheel  ·  Eyes on the road  ·  Mind on the destination", {
    x: 0.6, y: 6.28, w: 8.8, h: 0.3,
    fontSize: 11.5, fontFace: FONT, italic: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("— Karen's personal note from vibe coding the past 6 months", {
    x: 0.6, y: 6.62, w: 8.8, h: 0.26,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Output
// ==========================================================
pres.writeFile({ fileName: "week3-git-vocabulary.pptx" })
  .then(() => console.log("✅  week3-git-vocabulary.pptx written (24 slides)"))
  .catch(err => console.error("❌ ", err));
