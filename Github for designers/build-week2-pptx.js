// Week 2: Git 的基本架構 — PPTX builder
// Design language aligned to Week 1 Figma (sans-serif, blue accent, light bg, generous space)
// Run: node build-week2-pptx.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x10"; // 10" × 6.25"  (matches Week 1's 1440×900)
pres.author = "Karen Shen";
pres.title = "Git 的基本架構 — Week 2";

// ---------- Palette (mirrors Week 1) ----------
const C = {
  bg: "F8FAFC",         // near-white background
  bgQuestion: "EAF2FF", // soft blue for question slides

  primary: "1A66FF",    // bright accent blue (eyebrow, accent line, Git tag)
  ink: "111827",        // near-black headings
  text: "374151",       // body
  muted: "6B7280",      // English subtitle, secondary
  subtle: "9CA3AF",     // tertiary
  line: "E5E7EB",       // borders / separators
  rowAlt: "F3F4F6",     // subtle alternating row bg

  figmaBg: "F3E8FF",    // Figma label pill bg
  figmaText: "8B5CF6",  // Figma purple
  gitBg: "DBEAFE",      // Git label pill bg
  gitText: "1A66FF",    // Git blue (same as primary)

  white: "FFFFFF",
};

const FONT = "Calibri"; // single sans-serif throughout

// ---------- Helpers ----------
function addEyebrow(slide, label) {
  // small bold blue ALL CAPS at top-left
  slide.addText(label.toUpperCase(), {
    x: 0.6, y: 0.45, w: 9, h: 0.25,
    fontSize: 10, fontFace: FONT, bold: true,
    color: C.primary, align: "left", valign: "middle",
    charSpacing: 3, margin: 0,
  });
}

function addTitle(slide, zh, en) {
  slide.addText(zh, {
    x: 0.6, y: 0.8, w: 9, h: 0.6,
    fontSize: 30, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  if (en) {
    slide.addText(en, {
      x: 0.6, y: 1.4, w: 9, h: 0.32,
      fontSize: 14, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });
  }
}

// Pill label like Week 1's Figma/Git tags
function addPill(slide, x, y, label, bg, fg) {
  const w = Math.max(0.7, 0.25 + label.length * 0.11);
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h: 0.32,
    fill: { color: bg }, line: { color: bg, width: 0 },
    rectRadius: 0.16,
  });
  slide.addText(label, {
    x, y, w, h: 0.32,
    fontSize: 11, fontFace: FONT, bold: true,
    color: fg, align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 1 — Cover
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Week badge (blue pill, like Week 1)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 2.4, w: 1.05, h: 0.36,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    rectRadius: 0.18,
  });
  s.addText("Week 2 / 6", {
    x: 0.8, y: 2.4, w: 1.05, h: 0.36,
    fontSize: 11, fontFace: FONT, bold: true,
    color: C.white, align: "center", valign: "middle", margin: 0,
  });

  // Chinese title (large bold)
  s.addText("Git 的基本架構", {
    x: 0.8, y: 2.85, w: 9, h: 0.85,
    fontSize: 44, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });

  // English subtitle
  s.addText("Git Architecture", {
    x: 0.8, y: 3.7, w: 9, h: 0.5,
    fontSize: 26, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });

  // accent line + tagline
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 4.4, w: 0.6, h: 0.04,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("GitHub for UI Designers", {
    x: 0.8, y: 4.5, w: 9, h: 0.3,
    fontSize: 12, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 2 — Agenda / Overview (Week 1 style row list)
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "AGENDA");
  addTitle(s, "這週會講什麼", "What we'll cover today");

  const items = [
    { n: "01", zh: "Git vs GitHub", en: "The first thing people confuse",
      sub: "最常搞混的第一題", subEn: "GitHub hosts Git repos + a collaboration layer" },
    { n: "02", zh: "從 GitHub Clone 到電腦", en: "Cloning a repo onto your machine",
      sub: "新人上路的第一步", subEn: "Getting started — the first step" },
    { n: "03", zh: "三個空間 + 本機 vs 遠端", en: "Three zones + Local vs Remote",
      sub: "程式碼的旅程", subEn: "The journey of your code" },
    { n: "04", zh: "同一份檔案的三種狀態", en: "Three states of one file",
      sub: "為什麼同事看不到我的改動？", subEn: "Why colleagues don't see your edits" },
    { n: "05", zh: "Branch — 平行世界的工作空間", en: "Branch — parallel workspaces",
      sub: "Git 最強大的功能之一", subEn: "One of Git's most powerful features" },
    { n: "06", zh: "Push 被擋怎麼辦", en: "When push gets rejected",
      sub: "對 AI 說「處理一下」就好", subEn: "Just say \"handle it\" — and don't say force" },
  ];

  // separator line above list
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.0, w: 9, h: 0.005,
    fill: { color: C.line }, line: { color: C.line, width: 0 },
  });

  items.forEach((it, i) => {
    const y = 2.15 + i * 0.65;
    // Small index pill
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: y + 0.1, w: 0.65, h: 0.32,
      fill: { color: C.gitBg }, line: { color: C.gitBg, width: 0 },
      rectRadius: 0.16,
    });
    s.addText(it.n, {
      x: 0.6, y: y + 0.1, w: 0.65, h: 0.32,
      fontSize: 11, fontFace: FONT, bold: true,
      color: C.primary, align: "center", valign: "middle", margin: 0,
    });

    // Topic
    s.addText(it.zh, {
      x: 1.45, y: y + 0.02, w: 4.5, h: 0.32,
      fontSize: 16, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(it.en, {
      x: 1.45, y: y + 0.34, w: 4.5, h: 0.26,
      fontSize: 11, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    // Sub
    s.addText(it.sub, {
      x: 6.0, y: y + 0.02, w: 3.6, h: 0.32,
      fontSize: 13, fontFace: FONT,
      color: C.text, align: "left", valign: "middle", margin: 0,
    });
    s.addText(it.subEn, {
      x: 6.0, y: y + 0.34, w: 3.6, h: 0.26,
      fontSize: 10.5, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    // row separator
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: y + 0.58, w: 9, h: 0.005,
      fill: { color: C.line }, line: { color: C.line, width: 0 },
    });
  });
}

// ==========================================================
// Slide 3 — Git vs GitHub (comparison-table style like Week 1)
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Comparison");
  addTitle(s, "Git 還是 GitHub？", "GitHub hosts Git repos and adds a collaboration layer on top");

  // Header row
  addPill(s, 3.05, 2.05, "Figma-style label", C.figmaBg, C.figmaText); // placeholder removed below
  // re-add proper labels at correct positions
  // Actually use simpler label text instead of pills for column heads
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.0, w: 9, h: 0,
    line: { color: C.line, width: 0 },
  });
}

// Slide 3 (rewrite cleanly)
pres.slides.pop(); // remove the buggy slide above
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Comparison");
  addTitle(s, "Git 還是 GitHub？", "GitHub hosts Git repos and adds a collaboration layer on top");

  // Column headers
  s.addText("Git", {
    x: 2.5, y: 2.05, w: 3.4, h: 0.32,
    fontSize: 18, fontFace: FONT, bold: true,
    color: C.primary, align: "left", valign: "middle", margin: 0,
  });
  s.addText("GitHub", {
    x: 6.0, y: 2.05, w: 3.4, h: 0.32,
    fontSize: 18, fontFace: FONT, bold: true,
    color: C.figmaText, align: "left", valign: "middle", margin: 0,
  });

  // separator under headers
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.5, w: 9, h: 0.005,
    fill: { color: C.line }, line: { color: C.line, width: 0 },
  });

  const rows = [
    { label: "是什麼", labelEn: "What",
      a: "軟體 / 指令（CLI）", aEn: "Software / CLI tool",
      b: "網站 / 服務", bEn: "Website / service" },
    { label: "在哪裡", labelEn: "Where",
      a: "你的電腦", aEn: "On your computer",
      b: "github.com（瀏覽器）", bEn: "github.com (browser)" },
    { label: "怎麼用", labelEn: "How",
      a: "打指令", aEn: "Type commands",
      b: "點按鈕、看頁面", bEn: "Click, view pages" },
  ];

  rows.forEach((r, i) => {
    const y = 2.7 + i * 1.0;
    if (i % 2 === 0) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y: y - 0.05, w: 9, h: 0.95,
        fill: { color: C.rowAlt }, line: { color: C.rowAlt, width: 0 },
      });
    }
    // label
    s.addText(r.label, {
      x: 0.8, y: y, w: 1.5, h: 0.3,
      fontSize: 13, fontFace: FONT, bold: true,
      color: C.text, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.labelEn, {
      x: 0.8, y: y + 0.3, w: 1.5, h: 0.26,
      fontSize: 10, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });
    // Git col
    s.addText(r.a, {
      x: 2.5, y: y, w: 3.3, h: 0.3,
      fontSize: 13, fontFace: FONT,
      color: C.text, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.aEn, {
      x: 2.5, y: y + 0.3, w: 3.3, h: 0.26,
      fontSize: 10, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });
    // GitHub col
    s.addText(r.b, {
      x: 6.0, y: y, w: 3.3, h: 0.3,
      fontSize: 13, fontFace: FONT,
      color: C.text, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.bEn, {
      x: 6.0, y: y + 0.3, w: 3.3, h: 0.26,
      fontSize: 10, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });
  });

  // small note
  s.addText("Git 本身就能跑在任何伺服器；GitHub 在 Git 之上加了 Pull Request、Review、Issues 等協作功能", {
    x: 0.6, y: 5.85, w: 9, h: 0.22,
    fontSize: 11, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Git can run on any server. GitHub adds collaboration features (PRs, reviews, issues) on top.", {
    x: 0.6, y: 6.05, w: 9, h: 0.18,
    fontSize: 10, fontFace: FONT,
    color: C.subtle, align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 4 — GitHub 頁面導覽（截圖 + 三個 callout）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "GitHub Page");
  addTitle(s, "GitHub 重點頁面導覽", "Three things to spot on a repo page");

  // 左側截圖（截圖比例約 16:10，已含紅色標記 ①②③）
  // 截圖位於 ../assets/Github-repo.jpg，相對 proposals/ 為 ../assets/
  s.addImage({
    path: "assets/Github-repo.jpg",
    x: 0.6, y: 2.0, w: 5.6, h: 3.5,
    sizing: { type: "contain", w: 5.6, h: 3.5 },
  });

  // 細邊框讓截圖在 near-white 背景上有定義
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.0, w: 5.6, h: 3.5,
    fill: { type: "none" }, line: { color: C.line, width: 0.75 },
  });

  // 右側三個 callout
  const callouts = [
    {
      n: "1",
      title: "Repo 名稱",
      titleEn: "Repository name",
      desc: "trendlife-general / hie-rei = 帳號 / 專案名。Repo（repository）就是一個 Git 專案的容器。",
      descEn: "owner / repo. A repository is the container for one Git project.",
    },
    {
      n: "2",
      title: "Code",
      titleEn: "Code tab",
      desc: "看檔案、取得 clone 網址、下載 zip。預設停在這頁。",
      descEn: "Browse files, get the clone URL, download zip. Default landing tab.",
    },
    {
      n: "3",
      title: "Pull Requests",
      titleEn: "Pull requests",
      desc: "請別人 review 你的改動、看別人的改動。設計師最常進的頁面。",
      descEn: "Request a review on your changes, or review others'. Designers' most-used tab.",
    },
  ];

  callouts.forEach((c, i) => {
    const y = 2.0 + i * 1.2;

    // 紅色圓圈編號（對應截圖上的標記）
    s.addShape(pres.shapes.OVAL, {
      x: 6.45, y: y, w: 0.4, h: 0.4,
      fill: { color: "E11D48" }, line: { color: "E11D48", width: 0 },
    });
    s.addText(c.n, {
      x: 6.45, y: y, w: 0.4, h: 0.4,
      fontSize: 14, bold: true, fontFace: FONT,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    // 中文標題
    s.addText(c.title, {
      x: 6.95, y: y - 0.02, w: 2.8, h: 0.3,
      fontSize: 14, bold: true, fontFace: FONT,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    // 英文小字
    s.addText(c.titleEn, {
      x: 6.95, y: y + 0.24, w: 2.8, h: 0.22,
      fontSize: 10, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    // 中文說明
    s.addText(c.desc, {
      x: 6.95, y: y + 0.48, w: 2.8, h: 0.4,
      fontSize: 10, fontFace: FONT,
      color: C.text, align: "left", valign: "top", margin: 0,
    });
    // 英文說明
    s.addText(c.descEn, {
      x: 6.95, y: y + 0.86, w: 2.8, h: 0.3,
      fontSize: 9, fontFace: FONT, italic: true,
      color: C.muted, align: "left", valign: "top", margin: 0,
    });
  });

  // 底部 takeaway
  s.addText("設計師最重要的兩個：Code（取得連結）與 Pull Requests（請人 review）", {
    x: 0.6, y: 5.85, w: 9, h: 0.22,
    fontSize: 11, fontFace: FONT,
    color: C.text, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Two tabs that matter most: Code (get the URL) and Pull Requests (ask for review)", {
    x: 0.6, y: 6.05, w: 9, h: 0.18,
    fontSize: 10, fontFace: FONT,
    color: C.subtle, align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 5 — 常用操作清單（截圖 + 三個操作入口 callout）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Common Actions");
  addTitle(s, "常用操作清單", "Where to click for the things you'll do most");

  // 左側截圖（已含紅色標記 ①②③）
  s.addImage({
    path: "assets/Github-important_functions.jpg",
    x: 0.6, y: 2.0, w: 5.6, h: 3.5,
    sizing: { type: "contain", w: 5.6, h: 3.5 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.0, w: 5.6, h: 3.5,
    fill: { type: "none" }, line: { color: C.line, width: 0.75 },
  });

  // 右側三個 callout — 對應截圖標記順序（① Code、② Branches、③ Pull requests）
  const callouts = [
    {
      n: "1",
      title: "Code 按鈕",
      titleEn: "Code button",
      desc: "右上方綠色按鈕。點開複製 HTTPS 網址 → 貼給 Claude Code 就能 clone 到本機。",
      descEn: "Top-right green button. Copy the HTTPS URL → give it to Claude Code to clone.",
    },
    {
      n: "2",
      title: "Branches",
      titleEn: "Branches list",
      desc: "看現在有哪些 branch、誰在做什麼。也能從這裡刪掉舊 branch。",
      descEn: "See active branches and who's working on what. Delete old ones from here.",
    },
    {
      n: "3",
      title: "Pull requests",
      titleEn: "Pull requests tab",
      desc: "建立新的 PR、看別人開的 PR、留 review 留言。Branch 改完要被 merge 都從這裡走。",
      descEn: "Open a new PR, review others', leave comments. The merge gate for every branch.",
    },
  ];

  callouts.forEach((c, i) => {
    const y = 2.0 + i * 1.2;

    s.addShape(pres.shapes.OVAL, {
      x: 6.45, y: y, w: 0.4, h: 0.4,
      fill: { color: "E11D48" }, line: { color: "E11D48", width: 0 },
    });
    s.addText(c.n, {
      x: 6.45, y: y, w: 0.4, h: 0.4,
      fontSize: 14, bold: true, fontFace: FONT,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    s.addText(c.title, {
      x: 6.95, y: y - 0.02, w: 2.8, h: 0.3,
      fontSize: 14, bold: true, fontFace: FONT,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(c.titleEn, {
      x: 6.95, y: y + 0.24, w: 2.8, h: 0.22,
      fontSize: 10, fontFace: FONT,
      color: C.muted, align: "left", valign: "middle", margin: 0,
    });

    s.addText(c.desc, {
      x: 6.95, y: y + 0.48, w: 2.8, h: 0.4,
      fontSize: 10, fontFace: FONT,
      color: C.text, align: "left", valign: "top", margin: 0,
    });
    s.addText(c.descEn, {
      x: 6.95, y: y + 0.86, w: 2.8, h: 0.3,
      fontSize: 9, fontFace: FONT, italic: true,
      color: C.muted, align: "left", valign: "top", margin: 0,
    });
  });

  // 底部 takeaway
  s.addText("90% 的設計師日常，這三個入口就夠用：拿程式碼、切換 branch、發 / 看 PR", {
    x: 0.6, y: 5.85, w: 9, h: 0.22,
    fontSize: 11, fontFace: FONT,
    color: C.text, align: "left", valign: "middle", margin: 0,
  });
  s.addText("90% of designer-daily flows live in these three: get code, switch branch, open / review a PR.", {
    x: 0.6, y: 6.05, w: 9, h: 0.18,
    fontSize: 10, fontFace: FONT,
    color: C.subtle, align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 6 — 新人上路：兩件事 (two-card)
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Clone");
  addTitle(s, "新人上路：把專案 Clone 到電腦", "Getting started — cloning a project");

  s.addText("你只需要準備兩件事", {
    x: 0.6, y: 2.0, w: 9, h: 0.3,
    fontSize: 14, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Only two things to prepare", {
    x: 0.6, y: 2.3, w: 9, h: 0.25,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  const cards = [
    { x: 0.6, n: "1", title: "Repo 的 Clone 網址", titleEn: "The clone URL",
      desc: "從 GitHub 主頁右上角的綠色 Code 按鈕取得", descEn: "From the green Code button at the top-right of the repo page",
      hint: "工程師會提供 repo 連結", hintEn: "Engineer provides it" },
    { x: 5.2, n: "2", title: "本機資料夾的位置", titleEn: "Where on your machine",
      desc: "你自己決定要放在哪個資料夾", descEn: "You decide which local folder to use",
      hint: "建議 ~/work/ 底下分層管理", hintEn: "Recommended: ~/work/ tree" },
  ];

  cards.forEach((c) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: c.x, y: 2.85, w: 4.2, h: 2.8,
      fill: { color: C.white }, line: { color: C.line, width: 1 },
      rectRadius: 0.1,
    });
    // big numeral
    s.addText(c.n, {
      x: c.x + 0.3, y: 3.0, w: 0.8, h: 0.7,
      fontSize: 48, fontFace: FONT, bold: true,
      color: C.primary, align: "left", valign: "top", margin: 0,
    });
    // title
    s.addText(c.title, {
      x: c.x + 1.25, y: 3.05, w: 2.85, h: 0.36,
      fontSize: 15, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(c.titleEn, {
      x: c.x + 1.25, y: 3.4, w: 2.85, h: 0.26,
      fontSize: 11, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    // desc
    s.addText(c.desc, {
      x: c.x + 0.3, y: 4.05, w: 3.6, h: 0.7,
      fontSize: 12, fontFace: FONT, color: C.text,
      align: "left", valign: "top", margin: 0,
    });
    s.addText(c.descEn, {
      x: c.x + 0.3, y: 4.55, w: 3.6, h: 0.55,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "top", margin: 0,
    });
    // hint at bottom
    s.addText(c.hint + "  ·  " + c.hintEn, {
      x: c.x + 0.3, y: 5.2, w: 3.6, h: 0.3,
      fontSize: 10, fontFace: FONT, color: C.subtle,
      align: "left", valign: "middle", margin: 0,
    });
  });

  s.addText("準備好 → 告訴 Claude Code → Agent 完成剩下的步驟  ·  Ready → tell Claude Code → agent handles the rest", {
    x: 0.6, y: 5.85, w: 9, h: 0.3,
    fontSize: 11, fontFace: FONT, bold: true,
    color: C.primary, align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 7 — 取得 Clone 網址
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Clone");
  addTitle(s, "從 GitHub 取得 Clone 網址", "Two clicks to copy the HTTPS link");

  // Step 1
  s.addShape(pres.shapes.OVAL, {
    x: 0.7, y: 2.2, w: 0.4, h: 0.4,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("1", {
    x: 0.7, y: 2.2, w: 0.4, h: 0.4,
    fontSize: 13, fontFace: FONT, bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("找到右上方的綠色 Code 按鈕，點擊", {
    x: 1.25, y: 2.18, w: 7.5, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Find the green Code button at the top-right, click it", {
    x: 1.25, y: 2.5, w: 7.5, h: 0.26,
    fontSize: 11, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });

  // mock button
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.25, y: 2.95, w: 1.4, h: 0.45,
    fill: { color: "1F883D" }, line: { color: "1F883D", width: 0 }, rectRadius: 0.05,
  });
  s.addText("< > Code  ▾", {
    x: 1.25, y: 2.95, w: 1.4, h: 0.45,
    fontSize: 12, fontFace: FONT, bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });

  // Step 2
  s.addShape(pres.shapes.OVAL, {
    x: 0.7, y: 3.85, w: 0.4, h: 0.4,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });
  s.addText("2", {
    x: 0.7, y: 3.85, w: 0.4, h: 0.4,
    fontSize: 13, fontFace: FONT, bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("選 HTTPS 標籤，點右邊的複製圖示", {
    x: 1.25, y: 3.83, w: 7.5, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Select the HTTPS tab, then click the copy icon on the right", {
    x: 1.25, y: 4.15, w: 7.5, h: 0.26,
    fontSize: 11, fontFace: FONT,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });

  // mock dropdown
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.25, y: 4.55, w: 6.0, h: 1.05,
    fill: { color: C.white }, line: { color: C.line, width: 1 },
    rectRadius: 0.05,
  });
  s.addText("HTTPS   |   SSH   |   GitHub CLI", {
    x: 1.4, y: 4.62, w: 5.8, h: 0.3,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("https://github.com/owner/repo.git", {
    x: 1.4, y: 5.0, w: 4.5, h: 0.35,
    fontSize: 11, fontFace: "Consolas", color: C.primary,
    align: "left", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.65, y: 5.0, w: 0.45, h: 0.4,
    fill: { color: C.gitBg }, line: { color: C.primary, width: 1 },
    rectRadius: 0.05,
  });
  s.addText("⎘", {
    x: 6.65, y: 5.0, w: 0.45, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });

  // tip on right
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.6, y: 4.55, w: 1.95, h: 1.05,
    fill: { color: C.gitBg }, line: { color: C.gitBg, width: 0 },
    rectRadius: 0.05,
  });
  s.addText([
    { text: "HTTPS vs SSH", options: { bold: true, fontSize: 11, color: C.primary, breakLine: true } },
    { text: "初次使用選 HTTPS", options: { fontSize: 10, color: C.text, breakLine: true } },
    { text: "First time? Pick HTTPS", options: { fontSize: 9, color: C.muted } },
  ], {
    x: 7.7, y: 4.6, w: 1.8, h: 0.95,
    fontFace: FONT, align: "left", valign: "top", margin: 0,
  });
}

// ==========================================================
// Slide 8 — 決定本機資料夾位置
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Clone");
  addTitle(s, "決定本機資料夾位置", "Pick a folder on your machine");

  // left: folder structure (dark code block)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 2.2, w: 4.7, h: 2.4,
    fill: { color: "1F2937" }, line: { color: "1F2937", width: 0 }, rectRadius: 0.05,
  });
  s.addText([
    { text: "~/work/", options: { color: "5EEAD4", breakLine: true } },
    { text: "├── company/        ", options: { color: C.white } },
    { text: "← company repos", options: { color: "94A3B8", breakLine: true } },
    { text: "├── personal/       ", options: { color: C.white } },
    { text: "← personal", options: { color: "94A3B8", breakLine: true } },
    { text: "└── learning/       ", options: { color: C.white } },
    { text: "← practice", options: { color: "94A3B8" } },
  ], {
    x: 0.8, y: 2.35, w: 4.4, h: 2.15,
    fontSize: 13, fontFace: "Consolas",
    align: "left", valign: "top", margin: 0, paraSpaceAfter: 4,
  });

  // right: principles
  s.addText("選擇原則", {
    x: 5.6, y: 2.2, w: 4, h: 0.32,
    fontSize: 16, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Principles", {
    x: 5.6, y: 2.5, w: 4, h: 0.26,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  const rules = [
    { t: "集中管理", en: "Centralized", d: "全部放同一個父資料夾", dEn: "One parent folder" },
    { t: "路徑簡短", en: "Keep paths short", d: "避免太深的巢狀", dEn: "Avoid deep nesting" },
    { t: "英文路徑", en: "English only", d: "不要用中文或空格", dEn: "No CJK or spaces" },
  ];
  rules.forEach((r, i) => {
    const yy = 2.95 + i * 0.6;
    s.addShape(pres.shapes.OVAL, {
      x: 5.6, y: yy + 0.06, w: 0.18, h: 0.18,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });
    s.addText("✓", {
      x: 5.6, y: yy + 0.06, w: 0.18, h: 0.18,
      fontSize: 9, fontFace: FONT, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(r.t, {
      x: 5.85, y: yy, w: 1.6, h: 0.28,
      fontSize: 13, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.en, {
      x: 5.85, y: yy + 0.26, w: 1.6, h: 0.22,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.d + "  ·  " + r.dEn, {
      x: 7.5, y: yy + 0.04, w: 2.1, h: 0.45,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // bottom hint
  s.addText("放哪裡其實不嚴格 — 重點是路徑乾淨、找得到、自己順手", {
    x: 0.6, y: 5.85, w: 9, h: 0.22,
    fontSize: 11, fontFace: FONT,
    color: C.text, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Where doesn't matter much — clean path, easy to find, comfortable for you.", {
    x: 0.6, y: 6.05, w: 9, h: 0.18,
    fontSize: 10, fontFace: FONT,
    color: C.subtle, align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 9 — Clone 失敗常見原因
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Clone");
  addTitle(s, "Clone 失敗？三個最常見的原因", "Three common clone errors");

  const errors = [
    { msg: "Permission denied", cause: "還不是這個 repo 的成員", causeEn: "Not a member of this repo yet",
      fix: "請工程師或主管把你加入 repo", fixEn: "Ask an engineer / lead to add you" },
    { msg: "Repository not found", cause: "網址錯誤或 private repo 未登入", causeEn: "Wrong URL, or private repo not logged in",
      fix: "確認網址、確認 GitHub 帳號已登入", fixEn: "Verify URL & that you're signed in" },
    { msg: "destination already exists", cause: "目標位置已有同名資料夾", causeEn: "A folder with that name already exists",
      fix: "換個路徑，或請 Claude Code 看看那個資料夾", fixEn: "Pick a new path, or ask Claude Code to check" },
  ];

  errors.forEach((e, i) => {
    const y = 2.15 + i * 1.25;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: y, w: 9, h: 1.1,
      fill: { color: C.white }, line: { color: C.line, width: 1 },
      rectRadius: 0.08,
    });
    // error msg (mono red header)
    s.addText(e.msg, {
      x: 0.85, y: y + 0.12, w: 4, h: 0.32,
      fontSize: 14, fontFace: "Consolas", bold: true, color: "DC2626",
      align: "left", valign: "middle", margin: 0,
    });
    // cause
    s.addText("原因  Cause", {
      x: 0.85, y: y + 0.5, w: 1.5, h: 0.24,
      fontSize: 9.5, fontFace: FONT, bold: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(e.cause, {
      x: 2.4, y: y + 0.5, w: 2.7, h: 0.26,
      fontSize: 11.5, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(e.causeEn, {
      x: 2.4, y: y + 0.74, w: 2.7, h: 0.22,
      fontSize: 9.5, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    // divider
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.3, y: y + 0.5, w: 0.005, h: 0.5,
      fill: { color: C.line }, line: { color: C.line, width: 0 },
    });
    // fix
    s.addText("解法  Fix", {
      x: 5.5, y: y + 0.5, w: 1.2, h: 0.24,
      fontSize: 9.5, fontFace: FONT, bold: true, color: C.primary,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(e.fix, {
      x: 6.7, y: y + 0.5, w: 2.85, h: 0.26,
      fontSize: 11.5, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(e.fixEn, {
      x: 6.7, y: y + 0.74, w: 2.85, h: 0.22,
      fontSize: 9.5, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  });
}

// ==========================================================
// Slide 10 — 三個空間
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Architecture");
  addTitle(s, "三個空間：程式碼的旅程", "Working Directory → Staging → Repository");

  const stages = [
    { label: "Working Directory", sub: "本機正在改的檔案", subEn: "Files you're editing", color: C.muted },
    { label: "Staging Area", sub: "準備要存的改動", subEn: "Changes queued to save", color: C.primary },
    { label: "Repository", sub: "正式的版本紀錄", subEn: "Saved version history", color: C.figmaText },
  ];

  const startX = 0.6;
  const boxW = 2.6, boxH = 1.4;
  stages.forEach((st, i) => {
    const x = startX + i * 3.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 2.3, w: boxW, h: boxH,
      fill: { color: C.white }, line: { color: st.color, width: 1.5 },
      rectRadius: 0.08,
    });
    s.addText(st.label, {
      x: x + 0.1, y: 2.4, w: boxW - 0.2, h: 0.5,
      fontSize: 15, fontFace: FONT, bold: true, color: st.color,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(st.sub, {
      x: x + 0.1, y: 2.95, w: boxW - 0.2, h: 0.3,
      fontSize: 11.5, fontFace: FONT, color: C.text,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(st.subEn, {
      x: x + 0.1, y: 3.25, w: boxW - 0.2, h: 0.28,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "center", valign: "middle", margin: 0,
    });
    if (i < stages.length - 1) {
      s.addText("→", {
        x: x + boxW, y: 2.3, w: 0.55, h: boxH,
        fontSize: 28, fontFace: FONT, bold: true, color: C.primary,
        align: "center", valign: "middle", margin: 0,
      });
    }
    if (i === 0) {
      s.addText("git add", {
        x: x + boxW, y: 3.75, w: 0.55, h: 0.3,
        fontSize: 9.5, fontFace: "Consolas", color: C.muted,
        align: "center", valign: "middle", margin: 0,
      });
    } else if (i === 1) {
      s.addText("git commit", {
        x: x + boxW - 0.15, y: 3.75, w: 0.85, h: 0.3,
        fontSize: 9.5, fontFace: "Consolas", color: C.muted,
        align: "center", valign: "middle", margin: 0,
      });
    }
  });

  // why staging
  s.addText("為什麼需要 Staging？", {
    x: 0.6, y: 4.4, w: 4.5, h: 0.32,
    fontSize: 14, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Why staging?", {
    x: 0.6, y: 4.7, w: 4.5, h: 0.26,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("你可能改了 10 個檔案，但只想先存 3 個。Staging 讓你主動挑選要存什麼。", {
    x: 0.6, y: 5.05, w: 4.5, h: 0.6,
    fontSize: 11, fontFace: FONT, color: C.text,
    align: "left", valign: "top", margin: 0,
  });
  s.addText("You edited 10 files but want to save only 3 — staging lets you pick.", {
    x: 0.6, y: 5.62, w: 4.5, h: 0.5,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "left", valign: "top", margin: 0,
  });

  // AI callout
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.3, y: 4.4, w: 4.3, h: 1.6,
    fill: { color: C.gitBg }, line: { color: C.gitBg, width: 0 },
    rectRadius: 0.08,
  });
  s.addText("用 Claude Code 時", {
    x: 5.5, y: 4.5, w: 4, h: 0.3,
    fontSize: 13, fontFace: FONT, bold: true, color: C.primary,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("When using Claude Code", {
    x: 5.5, y: 4.78, w: 4, h: 0.26,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Staging 通常自動處理", {
    x: 5.5, y: 5.1, w: 4, h: 0.28,
    fontSize: 12, fontFace: FONT, bold: true, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Staging is handled automatically — say \"save these changes\"", {
    x: 5.5, y: 5.4, w: 4, h: 0.5,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "left", valign: "top", margin: 0,
  });
}

// ==========================================================
// Slide 11 — 本機 vs 遠端
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Architecture");
  addTitle(s, "本機 vs 遠端", "Local vs Remote — a one-to-one link");

  // left box: local
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 2.5, w: 3.3, h: 2.6,
    fill: { color: C.white }, line: { color: C.primary, width: 1.5 },
    rectRadius: 0.08,
  });
  s.addText("你的電腦", {
    x: 0.7, y: 2.65, w: 3.3, h: 0.36,
    fontSize: 16, fontFace: FONT, bold: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("Local", {
    x: 0.7, y: 3.0, w: 3.3, h: 0.26,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Working Directory", options: { breakLine: true } },
    { text: "↓", options: { color: C.muted, breakLine: true } },
    { text: "Staging Area", options: { breakLine: true } },
    { text: "↓", options: { color: C.muted, breakLine: true } },
    { text: "Local Repository" },
  ], {
    x: 0.7, y: 3.4, w: 3.3, h: 1.6,
    fontSize: 11, fontFace: "Consolas", color: C.text,
    align: "center", valign: "top", margin: 0, paraSpaceAfter: 2,
  });

  // right box: remote
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.0, y: 2.5, w: 3.3, h: 2.6,
    fill: { color: C.white }, line: { color: C.figmaText, width: 1.5 },
    rectRadius: 0.08,
  });
  s.addText("GitHub", {
    x: 6.0, y: 2.65, w: 3.3, h: 0.36,
    fontSize: 16, fontFace: FONT, bold: true, color: C.figmaText,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("Remote", {
    x: 6.0, y: 3.0, w: 3.3, h: 0.26,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("Remote Repository", {
    x: 6.0, y: 3.85, w: 3.3, h: 0.36,
    fontSize: 12, fontFace: "Consolas", color: C.text,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("（雲端正本 · cloud master）", {
    x: 6.0, y: 4.2, w: 3.3, h: 0.28,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });

  // push arrow (local → remote)
  s.addShape(pres.shapes.LINE, {
    x: 4.05, y: 3.15, w: 1.9, h: 0,
    line: { color: C.primary, width: 2, endArrowType: "triangle" },
  });
  s.addText("push", {
    x: 4.05, y: 2.78, w: 1.9, h: 0.32,
    fontSize: 13, fontFace: FONT, bold: true, color: C.primary,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("讓別人看到 · share with team", {
    x: 4.05, y: 3.22, w: 1.9, h: 0.25,
    fontSize: 9.5, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });

  // pull arrow (remote → local)
  s.addShape(pres.shapes.LINE, {
    x: 4.05, y: 4.3, w: 1.9, h: 0,
    line: { color: C.figmaText, width: 2, beginArrowType: "triangle" },
  });
  s.addText("pull", {
    x: 4.05, y: 3.93, w: 1.9, h: 0.32,
    fontSize: 13, fontFace: FONT, bold: true, color: C.figmaText,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("同步最新 · get latest", {
    x: 4.05, y: 4.37, w: 1.9, h: 0.25,
    fontSize: 9.5, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });

  // bottom note
  s.addText("Clone 之後，本機資料夾和 remote repo 建立「一對一」連結，之後 push / pull 都透過它同步", {
    x: 0.6, y: 5.45, w: 9, h: 0.3,
    fontSize: 12, fontFace: FONT, color: C.text,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("After clone, local folder & remote repo are linked 1:1 — push / pull uses that link", {
    x: 0.6, y: 5.75, w: 9, h: 0.28,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 12 — 三種狀態
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "File States");
  addTitle(s, "同一份 Header.tsx，三種狀態", "Three states of one file — why colleagues can't see your edits");

  const states = [
    { x: 0.6, tag: "A", title: "改了，還沒 commit", titleEn: "Edited, not committed",
      local: "新版 New", remote: "舊的 Old",
      note: "只有你看得到", noteEn: "Only you see it; can be discarded", color: C.muted },
    { x: 3.65, tag: "B", title: "commit 了，還沒 push", titleEn: "Committed, not pushed",
      local: "新版 New", remote: "舊的 Old",
      note: "存檔在本機", noteEn: "Saved locally, team still can't see", color: C.primary },
    { x: 6.7, tag: "C", title: "push 了", titleEn: "Pushed",
      local: "新版 New", remote: "新版 New ✓",
      note: "團隊可以 pull 到了", noteEn: "Team can now pull your changes", color: C.figmaText },
  ];

  states.forEach((st) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: st.x, y: 2.2, w: 2.9, h: 3.0,
      fill: { color: C.white }, line: { color: C.line, width: 1 },
      rectRadius: 0.08,
    });
    // top tag
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: st.x + 0.2, y: 2.35, w: 1.0, h: 0.3,
      fill: { color: st.color }, line: { color: st.color, width: 0 },
      rectRadius: 0.15,
    });
    s.addText(`Case ${st.tag}`, {
      x: st.x + 0.2, y: 2.35, w: 1.0, h: 0.3,
      fontSize: 10, fontFace: FONT, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(st.title, {
      x: st.x + 0.2, y: 2.75, w: 2.55, h: 0.32,
      fontSize: 13, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.titleEn, {
      x: st.x + 0.2, y: 3.07, w: 2.55, h: 0.26,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });

    // mini comparison
    s.addText("本機 Local", {
      x: st.x + 0.2, y: 3.5, w: 1.1, h: 0.26,
      fontSize: 9.5, fontFace: FONT, bold: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.local, {
      x: st.x + 1.3, y: 3.5, w: 1.5, h: 0.26,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText("遠端 Remote", {
      x: st.x + 0.2, y: 3.8, w: 1.1, h: 0.26,
      fontSize: 9.5, fontFace: FONT, bold: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.remote, {
      x: st.x + 1.3, y: 3.8, w: 1.5, h: 0.26,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });

    // divider
    s.addShape(pres.shapes.RECTANGLE, {
      x: st.x + 0.2, y: 4.2, w: 2.55, h: 0.005,
      fill: { color: C.line }, line: { color: C.line, width: 0 },
    });
    s.addText(st.note, {
      x: st.x + 0.2, y: 4.3, w: 2.55, h: 0.3,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "left", valign: "top", margin: 0,
    });
    s.addText(st.noteEn, {
      x: st.x + 0.2, y: 4.6, w: 2.55, h: 0.5,
      fontSize: 9.5, fontFace: FONT, color: C.muted,
      align: "left", valign: "top", margin: 0,
    });
  });

  // bottom note
  s.addText("Git 不會自動同步：你 commit 了 ≠ 別人看得到，必須 push 才會更新遠端", {
    x: 0.6, y: 5.45, w: 9, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: C.ink,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("Git doesn't auto-sync — commit ≠ team can see it. You must push.", {
    x: 0.6, y: 5.75, w: 9, h: 0.28,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 13 — Branch 概念
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Branch");
  addTitle(s, "Branch — 平行世界的工作空間", "A parallel universe for experiments");

  // branch diagram on left
  // main line
  s.addShape(pres.shapes.LINE, {
    x: 0.7, y: 2.95, w: 5.3, h: 0,
    line: { color: C.primary, width: 3 },
  });
  [0.7, 1.7, 2.7, 5.0].forEach((xx) => {
    s.addShape(pres.shapes.OVAL, {
      x: xx - 0.1, y: 2.85, w: 0.2, h: 0.2,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });
  });
  s.addText("main (穩定的主線 · stable line)", {
    x: 0.7, y: 2.5, w: 5.3, h: 0.3,
    fontSize: 11, fontFace: FONT, bold: true, color: C.primary,
    align: "left", valign: "middle", margin: 0,
  });

  // branch lines
  s.addShape(pres.shapes.LINE, { x: 2.7, y: 2.95, w: 0.5, h: 0.7, line: { color: C.figmaText, width: 2 } });
  s.addShape(pres.shapes.LINE, { x: 3.2, y: 3.65, w: 1.3, h: 0, line: { color: C.figmaText, width: 3 } });
  s.addShape(pres.shapes.LINE, { x: 4.5, y: 3.65, w: 0.5, h: -0.7, line: { color: C.figmaText, width: 2 } });
  [3.3, 3.7, 4.1, 4.5].forEach((xx) => {
    s.addShape(pres.shapes.OVAL, {
      x: xx - 0.1, y: 3.55, w: 0.2, h: 0.2,
      fill: { color: C.figmaText }, line: { color: C.figmaText, width: 0 },
    });
  });
  s.addText("experiment/header-redesign", {
    x: 2.7, y: 3.85, w: 3.2, h: 0.3,
    fontSize: 10.5, fontFace: FONT, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });

  // right: why branch
  s.addText("為什麼要用 Branch？", {
    x: 6.3, y: 2.5, w: 3.3, h: 0.32,
    fontSize: 14, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Why branch?", {
    x: 6.3, y: 2.8, w: 3.3, h: 0.26,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  const reasons = [
    { zh: "想試新東西又怕改壞", en: "Try without risk" },
    { zh: "團隊多人協作", en: "Team collaboration" },
    { zh: "同時做兩個任務不混一起", en: "Keep parallel tasks separate" },
  ];
  reasons.forEach((r, i) => {
    const yy = 3.2 + i * 0.6;
    s.addShape(pres.shapes.OVAL, {
      x: 6.3, y: yy + 0.07, w: 0.16, h: 0.16,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });
    s.addText(r.zh, {
      x: 6.55, y: yy, w: 3.05, h: 0.28,
      fontSize: 12, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.en, {
      x: 6.55, y: yy + 0.26, w: 3.05, h: 0.24,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // bottom callout
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.4, w: 9, h: 0.7,
    fill: { color: C.gitBg }, line: { color: C.gitBg, width: 0 }, rectRadius: 0.05,
  });
  s.addText("核心價值：Branch 上的改動只有你看得到。失敗就刪，成功再合併。", {
    x: 0.85, y: 5.45, w: 8.5, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: C.primary,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Core value: changes on a branch are yours alone — delete if it fails, merge if it works.", {
    x: 0.85, y: 5.75, w: 8.5, h: 0.3,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 14 — Branch 命名
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Branch");
  addTitle(s, "Branch 命名慣例", "name/type/short-description — name first in team repos, lowercase with hyphens");

  const prefixes = [
    { type: "feature/", use: "新功能、新頁面", useEn: "New features / pages", example: "karen/feature/user-profile", color: C.primary },
    { type: "fix/", use: "修復問題", useEn: "Fix a bug", example: "kevin/fix/carousel-overflow", color: "DC2626" },
    { type: "experiment/", use: "實驗性質，可能不會合併", useEn: "Experiments, may not merge", example: "shuhan/experiment/dark-mode-test", color: C.figmaText },
    { type: "refactor/", use: "重構、整理程式碼", useEn: "Clean-up / restructuring", example: "peter/refactor/component-structure", color: C.muted },
  ];

  prefixes.forEach((p, i) => {
    const y = 2.3 + i * 0.85;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: y, w: 9, h: 0.72,
      fill: { color: C.white }, line: { color: C.line, width: 1 },
      rectRadius: 0.06,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: y, w: 0.06, h: 0.72,
      fill: { color: p.color }, line: { color: p.color, width: 0 },
    });
    s.addText(p.type, {
      x: 0.85, y: y + 0.18, w: 1.85, h: 0.4,
      fontSize: 16, fontFace: "Consolas", bold: true, color: p.color,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.use, {
      x: 2.85, y: y + 0.1, w: 2.9, h: 0.3,
      fontSize: 12, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.useEn, {
      x: 2.85, y: y + 0.4, w: 2.9, h: 0.26,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.example, {
      x: 5.85, y: y + 0.18, w: 3.7, h: 0.4,
      fontSize: 12, fontFace: "Consolas", color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // footer callout: explain name prefix
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.85, w: 9, h: 0.65,
    fill: { color: C.gitBg }, line: { color: C.gitBg, width: 0 }, rectRadius: 0.05,
  });
  s.addText("團隊 repo 把自己名字放最前面，避免和別人撞名、也方便 review 時一眼認出是誰的 branch", {
    x: 0.85, y: 5.9, w: 8.5, h: 0.3,
    fontSize: 11.5, fontFace: FONT, bold: true, color: C.primary,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("In team repos, put your name first — prevents name clashes and makes ownership obvious during review.", {
    x: 0.85, y: 6.2, w: 8.5, h: 0.28,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 15 — 何時該用 Branch
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Branch");
  addTitle(s, "何時該用 Branch？", "When to branch — a simple rule");

  const cases = [
    { ok: true, case: "想試新東西，不確定會不會用", caseEn: "Trying something uncertain", why: "失敗可直接刪掉 · Delete on failure" },
    { ok: true, case: "會花好幾天的功能", caseEn: "Multi-day feature", why: "避免半成品影響主線 · Protect main from WIP" },
    { ok: true, case: "要交付給別人 review", caseEn: "Needs review from others", why: "團隊通常要求 PR · PRs expected" },
    { ok: false, case: "個人 repo 的小 typo", caseEn: "Tiny typo in personal repo", why: "直接 main commit 就好 · Just commit to main" },
    { ok: true, case: "公司 / 團隊 repo 的任何改動", caseEn: "Any change in team repos", why: "通常有 branch 保護 · Branch protection" },
  ];

  cases.forEach((c, i) => {
    const y = 2.2 + i * 0.62;
    if (i % 2 === 0) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y: y - 0.05, w: 9, h: 0.6,
        fill: { color: C.rowAlt }, line: { color: C.rowAlt, width: 0 },
      });
    }
    s.addShape(pres.shapes.OVAL, {
      x: 0.85, y: y + 0.1, w: 0.3, h: 0.3,
      fill: { color: c.ok ? C.primary : C.subtle }, line: { color: c.ok ? C.primary : C.subtle, width: 0 },
    });
    s.addText(c.ok ? "✓" : "✕", {
      x: 0.85, y: y + 0.1, w: 0.3, h: 0.3,
      fontSize: 13, fontFace: FONT, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(c.case, {
      x: 1.35, y: y + 0.04, w: 4.6, h: 0.28,
      fontSize: 13, fontFace: FONT, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(c.caseEn, {
      x: 1.35, y: y + 0.32, w: 4.6, h: 0.22,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(c.why, {
      x: 6.1, y: y + 0.1, w: 3.5, h: 0.4,
      fontSize: 10.5, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  });

  s.addText("簡單判斷法：個人 repo 小改直接 main，實驗開 branch；團隊 repo 一律 branch", {
    x: 0.6, y: 5.55, w: 9, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: C.primary,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Rule of thumb: personal repo — small edits on main, bigger ones on a branch. Team repo — always branch.", {
    x: 0.6, y: 5.85, w: 9, h: 0.28,
    fontSize: 10, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 16 — 實戰：Dark Mode 實驗
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Branch");
  addTitle(s, "實戰：用 Branch 做 Dark Mode 實驗", "In practice — try dark mode on a branch (3 steps)");

  const steps = [
    { x: 0.6, n: "1", title: "開實驗用 branch", titleEn: "Open an experiment branch",
      say: "「開一條 branch 叫 experiment/dark-mode」", sayEn: "\"Open branch experiment/dark-mode\"",
      result: "你已經在新 branch", resultEn: "You're on a new branch" },
    { x: 3.65, n: "2", title: "隨意改、隨意 commit", titleEn: "Edit and commit freely",
      say: "「commit 目前的進度」", sayEn: "\"Commit current progress\"",
      result: "進度都存在 branch 上", resultEn: "All progress saved on the branch" },
    { x: 6.7, n: "3", title: "決定要不要用", titleEn: "Decide — keep or drop",
      say: "成功 → 「合併到 main」\n失敗 → 「刪掉 branch」", sayEn: "Success → \"merge to main\"\nFail → \"delete branch\"",
      result: "main 永遠維持乾淨", resultEn: "main always stays clean" },
  ];

  steps.forEach((st) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: st.x, y: 2.3, w: 2.9, h: 3.0,
      fill: { color: C.white }, line: { color: C.line, width: 1 },
      rectRadius: 0.08,
    });
    s.addShape(pres.shapes.OVAL, {
      x: st.x + 0.25, y: 2.45, w: 0.55, h: 0.55,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });
    s.addText(st.n, {
      x: st.x + 0.25, y: 2.45, w: 0.55, h: 0.55,
      fontSize: 18, fontFace: FONT, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(st.title, {
      x: st.x + 0.95, y: 2.5, w: 1.85, h: 0.28,
      fontSize: 13, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.titleEn, {
      x: st.x + 0.95, y: 2.78, w: 1.85, h: 0.22,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });

    // say
    s.addText("對 Agent 說 · Tell agent", {
      x: st.x + 0.25, y: 3.2, w: 2.5, h: 0.22,
      fontSize: 9, fontFace: FONT, bold: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText([
      { text: st.say, options: { color: C.primary, breakLine: true } },
      { text: st.sayEn, options: { italic: true, fontSize: 9, color: C.muted } },
    ], {
      x: st.x + 0.25, y: 3.42, w: 2.5, h: 1.05,
      fontSize: 10.5, fontFace: FONT,
      align: "left", valign: "top", margin: 0, paraSpaceAfter: 3,
    });

    // result
    s.addShape(pres.shapes.RECTANGLE, {
      x: st.x + 0.25, y: 4.65, w: 2.5, h: 0.005,
      fill: { color: C.line }, line: { color: C.line, width: 0 },
    });
    s.addText(st.result, {
      x: st.x + 0.25, y: 4.75, w: 2.5, h: 0.26,
      fontSize: 11, fontFace: FONT, bold: true, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(st.resultEn, {
      x: st.x + 0.25, y: 5.0, w: 2.5, h: 0.24,
      fontSize: 9.5, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  });

  s.addText("Branch 的價值在於「可以反悔」  ·  Branches let you undo — main always stays clean", {
    x: 0.6, y: 5.55, w: 9, h: 0.3,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 17 — 對 Claude Code 說
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Branch");
  addTitle(s, "對 Claude Code 說", "Talking to Claude Code — natural language → Git commands");

  const rows = [
    { want: "開新 branch 開始工作", wantEn: "Start a new branch", say: "「開一條 branch 叫 feature/header-redesign」", sayEn: "\"Open branch feature/header-redesign\"" },
    { want: "看目前在哪條 branch", wantEn: "Check current branch", say: "「我現在在哪個 branch？」", sayEn: "\"Which branch am I on?\"" },
    { want: "切到別的 branch", wantEn: "Switch branches", say: "「切到 main」", sayEn: "\"Switch to main\"" },
    { want: "做完了，合併回 main", wantEn: "Done — merge back", say: "「push 上去，然後開 PR 合併到 main」", sayEn: "\"Push and open a PR to main\"" },
    { want: "這條 branch 不要了", wantEn: "Discard the branch", say: "「刪掉 feature/header-redesign 這條 branch」", sayEn: "\"Delete branch feature/header-redesign\"" },
  ];

  // header
  s.addText("你想做的事", { x: 0.8, y: 2.05, w: 3.3, h: 0.28, fontSize: 12, bold: true, color: C.text, fontFace: FONT, align: "left", valign: "middle", margin: 0 });
  s.addText("What you want", { x: 0.8, y: 2.32, w: 3.3, h: 0.22, fontSize: 10, color: C.muted, fontFace: FONT, align: "left", valign: "middle", margin: 0 });
  s.addText("對 Claude Code 說", { x: 4.4, y: 2.05, w: 5.2, h: 0.28, fontSize: 12, bold: true, color: C.text, fontFace: FONT, align: "left", valign: "middle", margin: 0 });
  s.addText("What to say", { x: 4.4, y: 2.32, w: 5.2, h: 0.22, fontSize: 10, color: C.muted, fontFace: FONT, align: "left", valign: "middle", margin: 0 });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.7, w: 9, h: 0.005,
    fill: { color: C.line }, line: { color: C.line, width: 0 },
  });

  rows.forEach((r, i) => {
    const y = 2.85 + i * 0.6;
    if (i % 2 === 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y: y - 0.05, w: 9, h: 0.6,
        fill: { color: C.rowAlt }, line: { color: C.rowAlt, width: 0 },
      });
    }
    s.addText(r.want, { x: 0.8, y: y, w: 3.3, h: 0.26, fontSize: 12, color: C.ink, fontFace: FONT, align: "left", valign: "middle", margin: 0 });
    s.addText(r.wantEn, { x: 0.8, y: y + 0.26, w: 3.3, h: 0.22, fontSize: 9.5, color: C.muted, fontFace: FONT, align: "left", valign: "middle", margin: 0 });
    s.addText(r.say, { x: 4.4, y: y, w: 5.2, h: 0.26, fontSize: 12, color: C.primary, fontFace: FONT, align: "left", valign: "middle", margin: 0 });
    s.addText(r.sayEn, { x: 4.4, y: y + 0.26, w: 5.2, h: 0.22, fontSize: 9.5, italic: true, color: C.muted, fontFace: FONT, align: "left", valign: "middle", margin: 0 });
  });

  s.addText("不用背指令——知道「什麼時候該做什麼事」就夠了  ·  No need to memorize commands — just know when to do what", {
    x: 0.6, y: 5.95, w: 9, h: 0.28,
    fontSize: 11, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 18 — Setup: push 被擋了？
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgQuestion };
  addEyebrow(s, "PART 2 · Push Rejected");
  addTitle(s, "如果 push 被擋了，怎麼辦？", "When commit & push gets rejected");

  // Mock terminal error
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.0, y: 2.1, w: 8, h: 1.5,
    fill: { color: "1F2937" }, line: { color: "1F2937", width: 0 }, rectRadius: 0.06,
  });
  s.addText("$ git push", {
    x: 1.25, y: 2.2, w: 7.5, h: 0.28,
    fontSize: 12, fontFace: "Consolas", color: "9CA3AF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("! [rejected]    main -> main (non-fast-forward)", {
    x: 1.25, y: 2.55, w: 7.5, h: 0.3,
    fontSize: 13, fontFace: "Consolas", bold: true, color: "FCA5A5",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("hint: Updates were rejected because the remote contains work", {
    x: 1.25, y: 2.92, w: 7.5, h: 0.26,
    fontSize: 11, fontFace: "Consolas", color: "D1D5DB",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("      that you do not have locally.", {
    x: 1.25, y: 3.18, w: 7.5, h: 0.26,
    fontSize: 11, fontFace: "Consolas", color: "D1D5DB",
    align: "left", valign: "middle", margin: 0,
  });

  // Thesis 1
  s.addText("這不是失敗——是 Git 在保護你不要蓋掉別人剛 push 的東西", {
    x: 0.6, y: 4.0, w: 9, h: 0.36,
    fontSize: 16, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("This isn't failure — it's Git protecting you from overwriting others", {
    x: 0.6, y: 4.38, w: 9, h: 0.26,
    fontSize: 11, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  // Action hint card (blue)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.05, w: 9, h: 0.95,
    fill: { color: "DBEAFE" }, line: { color: "93C5FD", width: 0.75 }, rectRadius: 0.06,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 5.05, w: 0.06, h: 0.95,
    fill: { color: "1E40AF" }, line: { color: "1E40AF", width: 0 },
  });
  s.addText("90% 情況下，對 AI 說「push 被擋了，幫我處理」就解決", {
    x: 0.85, y: 5.15, w: 8.5, h: 0.36,
    fontSize: 15, fontFace: FONT, bold: true, color: "1E3A8A",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("In 90% of cases, just say \"push was rejected, please handle it\" — done.", {
    x: 0.85, y: 5.52, w: 8.5, h: 0.28,
    fontSize: 11, fontFace: FONT, italic: true, color: "1E40AF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("細節下面三頁說明 · Details on next 3 slides", {
    x: 0.85, y: 5.78, w: 8.5, h: 0.22,
    fontSize: 9, fontFace: FONT, italic: true, color: "3B82F6",
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 19 — 四種常見情境（push reject 的變體）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Scenarios");
  addTitle(s, "為什麼會被擋？四種常見情境", "Four common reasons — same symptom");

  const variants = [
    {
      tag: "最常見",
      tagBg: "DBEAFE",
      tagFg: "1E40AF",
      zh: "別人剛 push 到同一個 branch",
      en: "Teammate pushed to the same branch",
      detail: "你在 main 上工作，期間隊友剛推了 commit 上去",
      detailEn: "Teammate pushed to main while you were editing",
    },
    {
      tag: "常見",
      tagBg: "D1FAE5",
      tagFg: "065F46",
      zh: "多裝置切換沒先 pull",
      en: "Switched device without pulling first",
      detail: "在 A 機 push 後，B 機繼續工作但忘了 pull",
      detailEn: "Pushed from A, kept working on B without pulling",
    },
    {
      tag: "偶發",
      tagBg: "FEF3C7",
      tagFg: "92400E",
      zh: "AI 在背景動過你沒注意",
      en: "AI did some git work last session",
      detail: "Claude 上一輪 session 自動 commit/push 過，你不知道",
      detailEn: "AI auto-committed in a prior session you didn't see",
    },
    {
      tag: "罕見",
      tagBg: "F3F4F6",
      tagFg: "374151",
      zh: "自己的 branch 也被推過",
      en: "Your own branch was pushed elsewhere",
      detail: "hie-rei 用 <name>/feature/ 命名後幾乎不會撞",
      detailEn: "Rare in hie-rei due to <name>/feature/ naming",
    },
  ];

  variants.forEach((v, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 4.55;
    const y = 1.95 + row * 1.65;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.4, h: 1.45,
      fill: { color: C.white }, line: { color: C.line, width: 1 }, rectRadius: 0.06,
    });
    // Tag pill
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2, y: y + 0.18, w: 0.85, h: 0.28,
      fill: { color: v.tagBg }, line: { color: v.tagBg, width: 0 }, rectRadius: 0.14,
    });
    s.addText(v.tag, {
      x: x + 0.2, y: y + 0.18, w: 0.85, h: 0.28,
      fontSize: 10, fontFace: FONT, bold: true, color: v.tagFg,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(v.zh, {
      x: x + 0.2, y: y + 0.55, w: 4.0, h: 0.32,
      fontSize: 13.5, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(v.en, {
      x: x + 0.2, y: y + 0.85, w: 4.0, h: 0.22,
      fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(v.detail, {
      x: x + 0.2, y: y + 1.08, w: 4.0, h: 0.32,
      fontSize: 10.5, fontFace: FONT, color: C.text,
      align: "left", valign: "top", margin: 0,
    });
  });

  // Bottom callout
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.5, w: 9, h: 0.7,
    fill: { color: "DBEAFE" }, line: { color: "93C5FD", width: 0.75 }, rectRadius: 0.05,
  });
  s.addText("症狀都長一樣——你不需要分辨是哪種，AI 看 git 自己就知道", {
    x: 0.85, y: 5.58, w: 8.5, h: 0.32,
    fontSize: 12, fontFace: FONT, bold: true, color: "1E40AF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Same symptom — you don't need to diagnose. AI will figure it out.", {
    x: 0.85, y: 5.9, w: 8.5, h: 0.26,
    fontSize: 10, fontFace: FONT, italic: true, color: "1E40AF",
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 20 — 設計師該做什麼：對 AI 說「處理一下」
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Designer Actions");
  addTitle(s, "對 AI 說：「處理一下」", "Three ways to ask AI to handle it");

  // Section header
  s.addText("有效的講法（任一即可）", {
    x: 0.6, y: 1.85, w: 9, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true, color: "059669",
    align: "left", valign: "middle", margin: 0,
  });

  const prompts = [
    {
      zh: "「push 被擋了，幫我處理」",
      en: "\"Push was rejected, please handle it\"",
    },
    {
      zh: "「先把別人的更新拉下來再 push」",
      en: "\"Pull the remote updates first, then push\"",
    },
    {
      zh: "「告訴我為什麼被擋」",
      en: "\"Tell me why it was rejected\"",
    },
  ];

  prompts.forEach((p, i) => {
    const y = 2.25 + i * 0.7;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: y, w: 9, h: 0.6,
      fill: { color: "ECFDF5" }, line: { color: "6EE7B7", width: 1 }, rectRadius: 0.06,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: y, w: 0.08, h: 0.6,
      fill: { color: "059669" }, line: { color: "059669", width: 0 },
    });
    s.addText("✓", {
      x: 0.8, y, w: 0.3, h: 0.6,
      fontSize: 18, fontFace: FONT, bold: true, color: "059669",
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(p.zh, {
      x: 1.2, y: y + 0.05, w: 8.3, h: 0.32,
      fontSize: 14, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.en, {
      x: 1.2, y: y + 0.34, w: 8.3, h: 0.24,
      fontSize: 10, fontFace: FONT, italic: true, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // AI will do header
  s.addText("AI 接著會做的事  ·  What AI will do", {
    x: 0.6, y: 4.55, w: 9, h: 0.28,
    fontSize: 12, fontFace: FONT, bold: true, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  const steps = [
    { zh: "看一下 remote 上是什麼狀態", en: "Check remote state" },
    { zh: "把別人的更新整合進你的 local", en: "Integrate teammate's updates into your local" },
    { zh: "再 push 一次", en: "Push again" },
    { zh: "有衝突就問你——不會 silent overwrite", en: "Show conflicts to you, never overwrite silently" },
  ];

  steps.forEach((step, i) => {
    const y = 4.95 + i * 0.3;
    s.addText("→", {
      x: 0.85, y, w: 0.3, h: 0.24,
      fontSize: 12, fontFace: FONT, bold: true, color: C.primary,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText([
      { text: step.zh, options: { color: C.text } },
      { text: "    " + step.en, options: { color: C.muted, italic: true, fontSize: 9 } },
    ], {
      x: 1.15, y, w: 8.5, h: 0.24,
      fontSize: 11, fontFace: FONT,
      align: "left", valign: "middle", margin: 0,
    });
  });
}

// ==========================================================
// Slide 21 — 不該說的話 + Force Push 後果
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Designer Actions (continued)");
  addTitle(s, "不要說：「強推」、「force」、「蓋過去」", "Phrases that trigger force push");

  // ===== LEFT: don't-say list =====
  s.addText("避開這些字眼", {
    x: 0.6, y: 1.85, w: 4.4, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true, color: "DC2626",
    align: "left", valign: "middle", margin: 0,
  });

  const dontSay = [
    "強推上去 / force push it",
    "不管它了直接推 / just push it",
    "直接蓋過去 / just overwrite",
    "我要 --force / --force-with-lease",
  ];

  dontSay.forEach((phrase, i) => {
    const y = 2.3 + i * 0.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y, w: 4.4, h: 0.42,
      fill: { color: "FEF2F2" }, line: { color: "FCA5A5", width: 0.75 }, rectRadius: 0.05,
    });
    s.addText("✗", {
      x: 0.7, y, w: 0.3, h: 0.42,
      fontSize: 14, fontFace: FONT, bold: true, color: "DC2626",
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(phrase, {
      x: 1.05, y, w: 3.3, h: 0.42,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // ===== RIGHT: force push consequence =====
  s.addText("為什麼會出事——Force Push 的後果", {
    x: 5.2, y: 1.85, w: 4.4, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true, color: "DC2626",
    align: "left", valign: "middle", margin: 0,
  });

  // Before label
  s.addText("Before:", {
    x: 5.2, y: 2.35, w: 1, h: 0.24,
    fontSize: 10, fontFace: FONT, bold: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "● ─ ● ─ ", options: { color: C.primary, bold: true } },
    { text: "▲", options: { color: "DC2626", bold: true } },
  ], {
    x: 6.1, y: 2.35, w: 3.5, h: 0.3,
    fontSize: 18, fontFace: "Consolas",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("(▲ = 隊友剛 push 的 commit)", {
    x: 5.2, y: 2.7, w: 4.4, h: 0.22,
    fontSize: 9, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  // Arrow
  s.addText("AI force push ↓", {
    x: 5.2, y: 3.05, w: 4.4, h: 0.26,
    fontSize: 11, fontFace: FONT, italic: true, bold: true, color: "DC2626",
    align: "left", valign: "middle", margin: 0,
  });

  // After label
  s.addText("After:", {
    x: 5.2, y: 3.4, w: 1, h: 0.24,
    fontSize: 10, fontFace: FONT, bold: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "● ─ ● ─ ", options: { color: C.primary, bold: true } },
    { text: "●", options: { color: "F59E0B", bold: true } },
    { text: " ─ ", options: { color: C.subtle } },
    { text: "●", options: { color: "F59E0B", bold: true } },
  ], {
    x: 6.1, y: 3.4, w: 3.5, h: 0.3,
    fontSize: 18, fontFace: "Consolas",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("(▲ 不見了——被你 commit 覆蓋)", {
    x: 5.2, y: 3.75, w: 4.4, h: 0.22,
    fontSize: 9, fontFace: FONT, italic: true, color: "DC2626",
    align: "left", valign: "middle", margin: 0,
  });

  // Result tag
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2, y: 4.2, w: 4.4, h: 0.5,
    fill: { color: "FEE2E2" }, line: { color: "DC2626", width: 0.75 }, rectRadius: 0.05,
  });
  s.addText("→ 隊友的工作消失了", {
    x: 5.35, y: 4.22, w: 4.15, h: 0.26,
    fontSize: 12, fontFace: FONT, bold: true, color: "DC2626",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Their work is gone", {
    x: 5.35, y: 4.45, w: 4.15, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: "991B1B",
    align: "left", valign: "middle", margin: 0,
  });

  // Bottom: don't worry, hooks block it
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 5.35, w: 9, h: 0.85,
    fill: { color: "DBEAFE" }, line: { color: "93C5FD", width: 0.75 }, rectRadius: 0.05,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 5.35, w: 0.06, h: 0.85,
    fill: { color: "1E40AF" }, line: { color: "1E40AF", width: 0 },
  });
  s.addText("別擔心：hie-rei 的 hooks 已經機械擋下 force push——說錯話也跑不出來。", {
    x: 0.85, y: 5.45, w: 8.5, h: 0.32,
    fontSize: 12.5, fontFace: FONT, bold: true, color: "1E3A8A",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Don't worry — hie-rei's hooks already block force push, even if your wording is off. (Next slide)", {
    x: 0.85, y: 5.8, w: 8.5, h: 0.3,
    fontSize: 10, fontFace: FONT, italic: true, color: "1E40AF",
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 22 — Safety Net（Michael 的 hooks 補充說明）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Safety Net");
  addTitle(s, "你不是一個人在防範這些", "You're not defending alone");

  // Big shield-style hero card
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.95, w: 9, h: 1.7,
    fill: { color: "ECFDF5" }, line: { color: "10B981", width: 1 }, rectRadius: 0.08,
  });

  // Shield emoji as visual anchor
  s.addText("🛡️", {
    x: 0.85, y: 2.15, w: 1.2, h: 1.2,
    fontSize: 60, fontFace: FONT,
    align: "center", valign: "middle", margin: 0,
  });

  // Main message
  s.addText("Michael 已經在這個 repo 裡寫了 git hooks", {
    x: 2.2, y: 2.15, w: 7.2, h: 0.4,
    fontSize: 18, fontFace: FONT, bold: true, color: "065F46",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Michael set up git hooks for this repo", {
    x: 2.2, y: 2.55, w: 7.2, h: 0.28,
    fontSize: 12, fontFace: FONT, italic: true, color: "047857",
    align: "left", valign: "middle", margin: 0,
  });

  s.addText("AI 想做剛才提的那些危險操作（force push、git add . 全部、commit 含 secret⋯）會被自動擋下，不用擔心一不小心犯錯。", {
    x: 2.2, y: 2.95, w: 7.2, h: 0.4,
    fontSize: 12, fontFace: FONT, color: "065F46",
    align: "left", valign: "top", margin: 0,
  });
  s.addText("Hooks block AI from running the dangerous operations we just talked about — you can't accidentally break things.", {
    x: 2.2, y: 3.32, w: 7.2, h: 0.3,
    fontSize: 10, fontFace: FONT, italic: true, color: "047857",
    align: "left", valign: "top", margin: 0,
  });

  // Scope warning card
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 3.95, w: 9, h: 1.55,
    fill: { color: "FEF3C7" }, line: { color: "FEF3C7", width: 0 }, rectRadius: 0.06,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 3.95, w: 0.06, h: 1.55,
    fill: { color: "D97706" }, line: { color: "D97706", width: 0 },
  });

  s.addText("⚠️  但是 — 這層保護只在這個 repo 裡有效", {
    x: 0.85, y: 4.05, w: 8.6, h: 0.35,
    fontSize: 14, fontFace: FONT, bold: true, color: "78350F",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("This safety net only applies inside this repo", {
    x: 0.85, y: 4.4, w: 8.6, h: 0.26,
    fontSize: 10.5, fontFace: FONT, italic: true, color: "92400E",
    align: "left", valign: "middle", margin: 0,
  });

  s.addText("離開這個 repo（你的個人專案、其他 team 的 repo）就沒有這套防呆。", {
    x: 0.85, y: 4.78, w: 8.6, h: 0.32,
    fontSize: 12, fontFace: FONT, color: "78350F",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Outside this repo (your own projects, other teams' repos), there's no safety net.", {
    x: 0.85, y: 5.13, w: 8.6, h: 0.28,
    fontSize: 10, fontFace: FONT, italic: true, color: "92400E",
    align: "left", valign: "middle", margin: 0,
  });

  // Bottom takeaway
  s.addText("→ 養成不對 AI 說「強推」「force」「直接覆蓋」的習慣，離開 repo 也帶得走。", {
    x: 0.6, y: 5.78, w: 9, h: 0.3,
    fontSize: 11.5, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Build the habit of not saying \"force\" / \"overwrite\" — discipline travels with you.", {
    x: 0.6, y: 6.08, w: 9, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.subtle,
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 23 — Key Takeaway
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Takeaway");
  addTitle(s, "這週記住三件事", "Three things to remember from Week 2");

  const takeaways = [
    { n: "01", title: "個人工作也要用 repo 管理", titleEn: "Use a repo for personal work too",
      desc: "不要只存在本機——電腦壞了、檔案誤刪就沒了。建立 personal repo，push 到 GitHub 當備份。",
      descEn: "Don't rely on local-only files. Create a personal repo and push to GitHub as backup." },
    { n: "02", title: "在 personal repo 練習 branch", titleEn: "Practice branching in your personal repo",
      desc: "個人 repo 最自由，怎麼玩都不影響別人。熟悉「開 branch → commit → merge」的流程。",
      descEn: "Personal repos are the safest playground — master branch → commit → merge before team work." },
    { n: "03", title: "用資料夾結構分層管理", titleEn: "Organize folders in layers",
      desc: "~/work/company/、~/work/personal/，看路徑就知道在哪一層。降低 push 錯 repo 的風險。",
      descEn: "~/work/company/ vs ~/work/personal/ — the path alone tells you what layer you're in." },
  ];

  takeaways.forEach((t, i) => {
    const y = 2.15 + i * 1.2;
    s.addText(t.n, {
      x: 0.6, y: y, w: 1.2, h: 1.0,
      fontSize: 56, fontFace: FONT, bold: true, color: C.primary,
      align: "left", valign: "top", margin: 0,
    });
    s.addText(t.title, {
      x: 1.95, y: y + 0.05, w: 7.6, h: 0.36,
      fontSize: 16, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(t.titleEn, {
      x: 1.95, y: y + 0.4, w: 7.6, h: 0.26,
      fontSize: 11, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(t.desc, {
      x: 1.95, y: y + 0.7, w: 7.6, h: 0.32,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "left", valign: "top", margin: 0,
    });
    s.addText(t.descEn, {
      x: 1.95, y: y + 1.0, w: 7.6, h: 0.28,
      fontSize: 10, fontFace: FONT, color: C.muted,
      align: "left", valign: "top", margin: 0,
    });
  });
}

// ==========================================================
// Slide 24 — Next Week
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Next Week");

  // Week badge
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.0, w: 1.05, h: 0.36,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    rectRadius: 0.18,
  });
  s.addText("Week 3 / 6", {
    x: 0.6, y: 1.0, w: 1.05, h: 0.36,
    fontSize: 11, fontFace: FONT, bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });

  s.addText("Git 常見名詞解惑", {
    x: 0.6, y: 1.5, w: 9, h: 0.7,
    fontSize: 36, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Git Vocabulary — words that look confusingly similar", {
    x: 0.6, y: 2.2, w: 9, h: 0.4,
    fontSize: 18, fontFace: FONT, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  // accent line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.85, w: 0.6, h: 0.04,
    fill: { color: C.primary }, line: { color: C.primary, width: 0 },
  });

  const previews = [
    { zh: "Commit vs Push", en: "存檔還是分享？ · Save locally or share?" },
    { zh: "Branch vs Fork", en: "同一個 repo 還是複製一份？ · Same repo or a copy?" },
    { zh: "Stash vs Discard", en: "改到一半要切分支怎麼辦？ · Mid-edit branch switch" },
  ];
  previews.forEach((p, i) => {
    const y = 3.3 + i * 0.95;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: y, w: 0.04, h: 0.8,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });
    s.addText(p.zh, {
      x: 0.85, y: y + 0.05, w: 8.6, h: 0.34,
      fontSize: 16, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.en, {
      x: 0.85, y: y + 0.42, w: 8.6, h: 0.3,
      fontSize: 12, fontFace: FONT, color: C.muted,
      align: "left", valign: "middle", margin: 0,
    });
  });

  s.addText("See you next week!  ·  下週見！", {
    x: 0.6, y: 6.0, w: 9, h: 0.25,
    fontSize: 11, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
pres.writeFile({ fileName: "week2-git-architecture.pptx" })
  .then((name) => console.log(`✓ Created: ${name}`))
  .catch((err) => { console.error(err); process.exit(1); });
