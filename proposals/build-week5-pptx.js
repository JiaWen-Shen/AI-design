// Week 5: 讓 AI 讀對規範 — CLAUDE.md / memory / design-context — PPTX builder
// Design language mirrors Week 2/3/4 pptx (TLDS-aligned palette, Calibri).
// Run: node build-week5-pptx.js  →  week5-claudemd-and-context.pptx
//
// NOTE: how-to slides (S5/S9) use terminal-style MOCKUP panels as stand-in
// "screenshots". Replace with real captures of /init and /memory before final.

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x10";
pres.author = "Karen Shen";
pres.title = "讓 AI 讀對規範：CLAUDE.md、memory、design-context — Week 5";

// ---------- Palette (identical to week3/4) ----------
const C = {
  bg: "F6EFE8", bgSection: "153242", bgQuestion: "AFE0EF", bgWarning: "FFF7ED",
  primary: "D71920", accent: "0690A7", ink: "222222", text: "555555",
  muted: "8E8E8E", subtle: "ADADAD", line: "E5E0D8", rowAlt: "F0E8DC",
  figmaBg: "E7E5FE", figmaText: "5B5BD6", gitBg: "FFE5E6", gitText: "D71920",
  warningBg: "FEB912", warningText: "8A6510", greenBg: "CDE9DC", greenText: "0F7A4F",
  white: "FFFFFF", burgundy: "450105", dangerBg: "FEF2F2", dangerText: "DC2626",
  dangerBorder: "FCA5A5",
  term: "1E1E2E", termBar: "313244", termText: "CDD6F4", termGreen: "A6E3A1",
  termBlue: "89B4FA", termMuted: "7F849C", termYellow: "F9E2AF",
};
const FONT = "Calibri";
const MONO = "Consolas";
let pageNum = 0; // content slides auto-number from 1 (cover excluded)

// ---------- Helpers ----------
function bgify(slide) { slide.background = { color: C.bg }; }

function addEyebrow(slide, label, color) {
  slide.addText(label.toUpperCase(), {
    x: 0.6, y: 0.42, w: 9, h: 0.25, fontSize: 10, fontFace: FONT, bold: true,
    color: color || C.primary, align: "left", valign: "middle", charSpacing: 3, margin: 0,
  });
}
function addTitle(slide, zh, en) {
  slide.addText(zh, {
    x: 0.6, y: 0.76, w: 9.4, h: 0.6, fontSize: 28, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  if (en) slide.addText(en, {
    x: 0.6, y: 1.36, w: 9.4, h: 0.28, fontSize: 13, fontFace: FONT, italic: true,
    color: C.muted, align: "left", valign: "middle", margin: 0,
  });
}
function footer(slide, n) {
  slide.addText("Week 5 · GitHub for Designers", {
    x: 0.6, y: 5.95, w: 6, h: 0.25, fontSize: 8, fontFace: FONT,
    color: C.subtle, align: "left", valign: "middle", margin: 0,
  });
  if (n) slide.addText(String(n), {
    x: 9.0, y: 5.95, w: 0.5, h: 0.25, fontSize: 8, fontFace: FONT,
    color: C.subtle, align: "right", valign: "middle", margin: 0,
  });
}
function box(slide, x, y, w, h, bg, border) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: bg },
    line: border ? { color: border, width: 1 } : { color: bg, width: 0 }, rectRadius: 0.08,
  });
}
function pill(slide, x, y, label, bg, fg, w) {
  const pw = w || Math.max(0.8, 0.3 + label.length * 0.13);
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: pw, h: 0.34, fill: { color: bg }, line: { color: bg, width: 0 }, rectRadius: 0.17,
  });
  slide.addText(label, {
    x, y, w: pw, h: 0.34, fontSize: 11, fontFace: FONT, bold: true,
    color: fg, align: "center", valign: "middle", margin: 0,
  });
  return pw;
}

// Terminal-style mockup panel (stand-in screenshot).
// lines: [{t, c?}]  t=text, c=color(optional)
function terminalPanel(slide, x, y, w, h, titleText, lines) {
  // window
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: C.term }, line: { color: C.termBar, width: 1 }, rectRadius: 0.06,
  });
  // title bar
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.32, fill: { color: C.termBar }, line: { width: 0 } });
  // traffic lights
  ["E06C75", "E5C07B", "98C379"].forEach((col, i) =>
    slide.addShape(pres.shapes.OVAL, { x: x + 0.16 + i * 0.22, y: y + 0.1, w: 0.11, h: 0.11, fill: { color: col }, line: { width: 0 } })
  );
  slide.addText(titleText, {
    x: x + 0.9, y, w: w - 1, h: 0.32, fontSize: 9, fontFace: MONO,
    color: C.termMuted, align: "left", valign: "middle", margin: 0,
  });
  // body lines
  const runs = lines.map((ln) => ({
    text: (ln.t || "") + "\n",
    options: { fontFace: MONO, fontSize: ln.fs || 11, color: ln.c || C.termText, bold: !!ln.b },
  }));
  slide.addText(runs, {
    x: x + 0.22, y: y + 0.46, w: w - 0.44, h: h - 0.6,
    align: "left", valign: "top", lineSpacingMultiple: 1.18, margin: 0,
  });
}

function bullets(slide, x, y, w, items, opts = {}) {
  const runs = items.map((it) => {
    if (typeof it === "string") it = { t: it };
    return {
      text: it.t,
      options: {
        fontFace: FONT, fontSize: it.fs || opts.fs || 13,
        color: it.c || C.text, bold: !!it.b,
        bullet: it.nobullet ? false : { code: "2022", indent: 14 },
        indentLevel: it.lvl || 0, breakLine: true,
      },
    };
  });
  slide.addText(runs, { x, y, w, h: opts.h || 3.6, align: "left", valign: "top", lineSpacingMultiple: opts.ls || 1.25, margin: 0 });
}

function newSlide(eyebrow, zh, en) {
  const s = pres.addSlide();
  bgify(s);
  if (eyebrow) addEyebrow(s, eyebrow);
  addTitle(s, zh, en);
  footer(s, ++pageNum);
  return s;
}

// ================= SLIDES =================

// S1 — Cover
(() => {
  const s = pres.addSlide();
  s.background = { color: C.bgSection };
  s.addText("WEEK 5 · GITHUB FOR DESIGNERS", {
    x: 0.8, y: 1.7, w: 8.4, h: 0.3, fontSize: 12, fontFace: FONT, bold: true,
    color: C.bgQuestion, charSpacing: 3, align: "left", margin: 0,
  });
  s.addText("駕馭你的 Agent，還有持續合作", {
    x: 0.8, y: 2.1, w: 8.6, h: 0.9, fontSize: 36, fontFace: FONT, bold: true,
    color: C.white, align: "left", margin: 0,
  });
  s.addText("Master your agent — and keep collaborating", {
    x: 0.8, y: 3.0, w: 8.6, h: 0.45, fontSize: 18, fontFace: FONT, italic: true,
    color: C.subtle, align: "left", margin: 0,
  });
  s.addText("CLAUDE.md · memory · design-context", {
    x: 0.8, y: 3.7, w: 8.4, h: 0.4, fontSize: 14, fontFace: MONO,
    color: C.termBlue, align: "left", margin: 0,
  });
})();

// S2 — Recap & bridge
(() => {
  const s = newSlide("Part 1 · 駕馭 Agent", "讓 Agent 遵守你的規則", "Make your agent follow your rules", 0);
  box(s, 0.6, 2.0, 9.0, 1.0, C.white);
  s.addText([
    { text: "Week 4：", options: { bold: true, color: C.ink } },
    { text: "你已能用自然語言 commit / push / 開 PR。", options: { color: C.text } },
  ], { x: 0.9, y: 2.15, w: 8.4, h: 0.7, fontSize: 14, fontFace: FONT, valign: "middle", margin: 0 });
  s.addText("但你還在每次對話重講「不要順手改其他的地方」「出畫面不要用 emoji」嗎？", {
    x: 0.9, y: 3.35, w: 8.2, h: 0.6, fontSize: 16, fontFace: FONT, bold: true, color: C.primary, margin: 0,
  });
  bullets(s, 0.9, 4.2, 8.2, [
    { t: "規範可以寫成檔案，讓 AI 每次自動讀 → 這週 Part 1：CLAUDE.md & memory", b: true, c: C.ink },
    { t: "別人天天在改的需求 / 設計系統怎麼跟上？ → Part 2：design-context", c: C.text },
  ]);
})();

// S3 — What is CLAUDE.md
(() => {
  const s = newSlide("Part 1 · CLAUDE.md", "CLAUDE.md — 讓 AI 記住你的專案規範", "Your project's standing instructions", 3);
  bullets(s, 0.6, 2.0, 9.0, [
    { t: "放在專案根目錄的設定檔，Claude Code 每次自動讀取並遵守。", b: true, c: C.ink, fs: 15 },
    { t: "不用每次對話重講規範——寫一次，到處生效。", c: C.text, fs: 14 },
  ], { ls: 1.4 });
  box(s, 0.6, 3.25, 9.0, 1.7, C.figmaBg);
  s.addText("🎨 像 Figma 的 Design System", { x: 0.9, y: 3.45, w: 8.4, h: 0.4, fontSize: 14, fontFace: FONT, bold: true, color: C.figmaText, margin: 0 });
  s.addText("定義一次 token / component，整個團隊到處套用。CLAUDE.md 之於 AI，就像 Design System 之於設計——一份規範，貫穿每一次工作。", {
    x: 0.9, y: 3.9, w: 8.4, h: 0.9, fontSize: 13, fontFace: FONT, color: C.ink, valign: "top", margin: 0,
  });
})();

// S4 — Example
(() => {
  const s = newSlide("Part 1 · CLAUDE.md", "寫一次，每次對話都生效", "Write once, applies every session", 4);
  terminalPanel(s, 0.6, 2.0, 9.0, 3.6, "CLAUDE.md", [
    { t: "## 修改原則", c: C.termYellow, b: true },
    { t: "- 只動該動的，不要順手改其他地方", c: C.termText },
    { t: "- 沿用既有 style，不順手 reformat", c: C.termText },
    { t: "" },
    { t: "## 出圖規範", c: C.termYellow, b: true },
    { t: "- 投影片 / 畫面不要用 emoji（跨工具會 glitch）", c: C.termText },
    { t: "- 中英混排用中文標點", c: C.termText },
  ]);
})();

// S5 — How to create/maintain (screenshot)
(() => {
  const s = newSlide("Part 1 · CLAUDE.md · how-to", "怎麼建立、更新 CLAUDE.md", "Create & update it", 5);
  bullets(s, 0.6, 1.95, 4.3, [
    { t: "/init", b: true, c: C.primary, fs: 14 },
    { t: "掃過專案自動生成草稿，問你存哪", c: C.text, fs: 12, lvl: 1 },
    { t: "直接編輯檔案", b: true, c: C.ink, fs: 14 },
    { t: "純文字 markdown，隨時開來改", c: C.text, fs: 12, lvl: 1 },
    { t: "跟 Claude 講", b: true, c: C.ink, fs: 14 },
    { t: "「把這條寫進 CLAUDE.md」", c: C.text, fs: 12, lvl: 1 },
    { t: "@import（進階）", b: true, c: C.ink, fs: 14 },
    { t: "@docs/git-rules.md 引入別檔", c: C.text, fs: 12, lvl: 1 },
  ], { ls: 1.18 });
  terminalPanel(s, 5.1, 1.95, 4.5, 3.7, "Terminal — /init", [
    { t: "› /init", c: C.termGreen, b: true },
    { t: "" },
    { t: "Analyzing project structure…", c: C.termMuted },
    { t: "Found: package.json, src/, tests/", c: C.termText },
    { t: "" },
    { t: "Generated CLAUDE.md draft ✓", c: C.termGreen },
    { t: "Where should I save it?", c: C.termText },
    { t: "  1) ./CLAUDE.md", c: C.termBlue },
    { t: "  2) ./.claude/CLAUDE.md", c: C.termBlue },
    { t: "" },
    { t: "// mockup — 換真實截圖", c: C.termMuted, fs: 9 },
  ]);
})();

// S6 — Two levels
(() => {
  const s = newSlide("Part 1 · CLAUDE.md", "全域 vs 專案 — CLAUDE.md 有兩個家", "Global vs project — two homes", 6);
  box(s, 0.6, 2.0, 4.35, 3.2, C.white, C.line);
  pill(s, 0.85, 2.2, "全域 GLOBAL", C.figmaBg, C.figmaText, 1.9);
  s.addText("~/.claude/CLAUDE.md", { x: 0.85, y: 2.65, w: 3.9, h: 0.35, fontSize: 12, fontFace: MONO, color: C.ink, bold: true, margin: 0 });
  bullets(s, 0.85, 3.1, 3.9, [
    { t: "跟著「你」，所有專案通用", c: C.text, fs: 12 },
    { t: "個人偏好：命名、收工流程、commit 習慣", c: C.text, fs: 12 },
    { t: "不進 git", c: C.muted, fs: 11 },
  ], { ls: 1.2 });
  box(s, 5.25, 2.0, 4.35, 3.2, C.white, C.line);
  pill(s, 5.5, 2.2, "專案 PROJECT", C.gitBg, C.gitText, 2.0);
  s.addText("<repo>/CLAUDE.md", { x: 5.5, y: 2.65, w: 3.9, h: 0.35, fontSize: 12, fontFace: MONO, color: C.ink, bold: true, margin: 0 });
  bullets(s, 5.5, 3.1, 3.9, [
    { t: "跟著「專案」，這個 repo 專屬", c: C.text, fs: 12 },
    { t: "帳號、設計系統路徑、團隊慣例", c: C.text, fs: 12 },
    { t: "checked into git，全團隊共用", c: C.muted, fs: 11 },
  ], { ls: 1.2 });
  s.addText("／init 預設寫的是專案層。", { x: 0.6, y: 5.35, w: 9, h: 0.3, fontSize: 12, fontFace: FONT, italic: true, color: C.muted, align: "center", margin: 0 });
})();

// S7 — Precedence
(() => {
  const s = newSlide("Part 1 · CLAUDE.md", "兩個都讀，誰說了算？", "Both are read — who wins?", 7);
  bullets(s, 0.6, 2.0, 9.0, [
    { t: "Claude Code 兩個都載入：全域先、專案後（越近工作目錄越後讀）", b: true, c: C.ink, fs: 14 },
    { t: "衝突時 → 專案層更具體，覆寫全域", b: true, c: C.primary, fs: 14 },
  ], { ls: 1.35 });
  box(s, 0.6, 3.15, 9.0, 1.3, C.bgWarning, C.warningBg);
  s.addText("⚠ 衝突實例", { x: 0.85, y: 3.3, w: 8.4, h: 0.3, fontSize: 12, fontFace: FONT, bold: true, color: C.warningText, margin: 0 });
  s.addText([
    { text: "全域說：", options: { color: C.text } },
    { text: "用個人帳號  ", options: { bold: true, color: C.ink } },
    { text: "／  專案說：", options: { color: C.text } },
    { text: "用工作帳號", options: { bold: true, color: C.ink } },
    { text: "  →  在這個專案，聽專案的。", options: { bold: true, color: C.gitText } },
  ], { x: 0.85, y: 3.7, w: 8.4, h: 0.6, fontSize: 14, fontFace: FONT, valign: "middle", margin: 0 });
  box(s, 0.6, 4.7, 9.0, 0.75, C.greenBg);
  s.addText("心智模型：全域 = 預設值，專案 = 在地覆寫（override）", {
    x: 0.85, y: 4.7, w: 8.5, h: 0.75, fontSize: 14, fontFace: FONT, bold: true, color: C.greenText, valign: "middle", margin: 0,
  });
})();

// S8 — What is memory
(() => {
  const s = newSlide("Part 1 · memory", "memory — Claude 自動累積的長期記憶", "What Claude accumulates across sessions", 8);
  bullets(s, 0.6, 2.0, 9.0, [
    { t: "除了你寫的 CLAUDE.md，Claude Code 會把對話中學到的事實「自動」存成持久記憶。", b: true, c: C.ink, fs: 14 },
    { t: "你的角色、偏好、專案現況、給過的回饋 → 下次開新對話自動帶回。", c: C.text, fs: 13 },
  ], { ls: 1.35, h: 1.3 });
  box(s, 0.6, 3.45, 9.0, 0.8, C.bgQuestion);
  s.addText([
    { text: "檔案：", options: { bold: true, color: C.burgundy } },
    { text: "~/.claude/projects/<專案>/memory/MEMORY.md", options: { fontFace: MONO, color: C.ink, bold: true } },
    { text: "（索引，開機載前 200 行）+ 主題檔（按需載入）", options: { color: C.text } },
  ], { x: 0.85, y: 3.45, w: 8.5, h: 0.8, fontSize: 12.5, fontFace: FONT, valign: "middle", margin: 0 });
  box(s, 0.6, 4.45, 9.0, 0.75, C.dangerBg, C.dangerBorder);
  s.addText("⚠ machine-local，不跨裝置（跟進 git 的 CLAUDE.md 不同）", {
    x: 0.85, y: 4.45, w: 8.5, h: 0.75, fontSize: 13, fontFace: FONT, bold: true, color: C.dangerText, valign: "middle", margin: 0,
  });
})();

// S9 — How to use memory (screenshot)
(() => {
  const s = newSlide("Part 1 · memory · how-to", "它自動記，你負責校正", "It remembers; you keep it honest", 9);
  bullets(s, 0.6, 1.95, 4.3, [
    { t: "自動累積", b: true, c: C.ink, fs: 14 },
    { t: "不用手動加；Claude 自己寫進 memory/", c: C.text, fs: 12, lvl: 1 },
    { t: "想要它記", b: true, c: C.ink, fs: 14 },
    { t: "說「記住我用工作帳號」", c: C.text, fs: 12, lvl: 1 },
    { t: "自動帶回", b: true, c: C.ink, fs: 14 },
    { t: "下次新對話相關記憶自動出現", c: C.text, fs: 12, lvl: 1 },
    { t: "檢視 / 校正", b: true, c: C.primary, fs: 14 },
    { t: "/memory 瀏覽、開檔編輯、開關", c: C.text, fs: 12, lvl: 1 },
  ], { ls: 1.18 });
  terminalPanel(s, 5.1, 1.95, 4.5, 3.7, "Terminal — /memory", [
    { t: "› /memory", c: C.termGreen, b: true },
    { t: "" },
    { t: "Loaded memory & rules:", c: C.termText },
    { t: "  ~/.claude/CLAUDE.md", c: C.termBlue },
    { t: "  ./CLAUDE.md", c: C.termBlue },
    { t: "  memory/MEMORY.md", c: C.termBlue },
    { t: "", },
    { t: "Auto memory: ON", c: C.termGreen },
    { t: "[o] open  [t] toggle  [q] quit", c: C.termMuted },
    { t: "" },
    { t: "// mockup — 換真實截圖", c: C.termMuted, fs: 9 },
  ]);
})();

// S10 — CLAUDE.md vs memory table
(() => {
  const s = newSlide("Part 1", "你寫死的規範 vs 會長出來的記憶", "Rules you author vs memory that accrues", 10);
  const cols = [3.0, 3.2, 3.2];
  const x0 = 0.6; let y = 2.05;
  const rowH = 0.62;
  const headers = ["", "CLAUDE.md", "memory"];
  const rows = [
    ["誰寫", "你手動寫", "Claude 自動累積（可校正）"],
    ["內容", "規範、慣例、指令", "事實、偏好、現況、回饋"],
    ["何時變", "你編輯 / /init", "對話中自動長"],
    ["範圍", "全域 / 專案（可進 git）", "跟著你、machine-local"],
    ["怎麼動它", "/init、編輯檔、@import", "說「記住」/ /memory 校正"],
  ];
  // header
  let cx = x0;
  headers.forEach((h, i) => {
    box(s, cx, y, cols[i], rowH, i === 0 ? C.bg : C.bgSection);
    if (h) s.addText(h, { x: cx, y, w: cols[i], h: rowH, fontSize: 14, fontFace: FONT, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    cx += cols[i];
  });
  y += rowH;
  rows.forEach((r, ri) => {
    cx = x0;
    r.forEach((cell, ci) => {
      const bg = ci === 0 ? C.rowAlt : (ri % 2 ? C.white : "FBF7F1");
      box(s, cx, y, cols[ci], rowH, bg, C.line);
      s.addText(cell, {
        x: cx + 0.12, y, w: cols[ci] - 0.24, h: rowH,
        fontSize: ci === 0 ? 13 : 12, fontFace: FONT, bold: ci === 0,
        color: ci === 0 ? C.ink : C.text, align: ci === 0 ? "center" : "left", valign: "middle", margin: 0,
      });
      cx += cols[ci];
    });
    y += rowH;
  });
})();

// S — Maintenance principles (keep lean)
(() => {
  const s = newSlide("Part 1 · 維護", "維護原則 — 保持精簡", "Keep them lean");
  box(s, 0.6, 1.95, 4.35, 2.55, C.white, C.line);
  pill(s, 0.85, 2.15, "行數上限 / 載入成本", C.bgQuestion, C.burgundy, 2.7);
  bullets(s, 0.85, 2.7, 3.9, [
    { t: "MEMORY.md：索引開機只載「前 200 行 / 25KB」", c: C.ink, fs: 12, b: true },
    { t: "→ 索引保持精簡，細節拆主題檔", c: C.text, fs: 11, lvl: 1 },
    { t: "CLAUDE.md：每次全載 = token 成本", c: C.ink, fs: 12, b: true },
    { t: "→ 越短越好，一條一個重點", c: C.text, fs: 11, lvl: 1 },
  ], { ls: 1.2, h: 1.7 });
  box(s, 5.25, 1.95, 4.35, 2.55, C.white, C.line);
  pill(s, 5.5, 2.15, "維護原則", C.gitBg, C.gitText, 1.7);
  bullets(s, 5.5, 2.7, 3.9, [
    { t: "只記「現在有效」的規範 / 事實", c: C.ink, fs: 12, b: true },
    { t: "過時就刪——錯的記憶比沒記憶更糟", c: C.text, fs: 11, lvl: 1 },
    { t: "不堆歷史", c: C.ink, fs: 12, b: true },
    { t: "歷史留 commit / 日誌，別塞進規範檔", c: C.text, fs: 11, lvl: 1 },
  ], { ls: 1.2, h: 1.7 });
  box(s, 0.6, 4.7, 9.0, 0.85, C.greenBg);
  s.addText([
    { text: "建議維護方式：", options: { bold: true, color: C.greenText } },
    { text: "定期 ", options: { color: C.ink } },
    { text: "/memory", options: { fontFace: MONO, color: C.ink, bold: true } },
    { text: " 檢視 + prune；CLAUDE.md 太長就用 ", options: { color: C.ink } },
    { text: "@import", options: { fontFace: MONO, color: C.ink, bold: true } },
    { text: " 拆成 reference 檔。", options: { color: C.ink } },
  ], { x: 0.9, y: 4.7, w: 8.4, h: 0.85, fontSize: 13, fontFace: FONT, valign: "middle", margin: 0 });
})();

// S — Enforcement power & limits
(() => {
  const s = newSlide("Part 1 · 強制力與限制", "規則有多硬？", "How strong is it, really?");
  box(s, 0.6, 1.95, 4.35, 2.7, C.greenBg);
  pill(s, 0.85, 2.15, "做得到 · 強制力", C.greenText, C.white, 2.3);
  bullets(s, 0.85, 2.7, 3.9, [
    { t: "每次 session 自動載入，agent 會「盡量」遵守", c: C.ink, fs: 12.5 },
    { t: "比口頭叮嚀可靠——規則固定在 context 裡", c: C.text, fs: 12 },
    { t: "多數情況有效", c: C.text, fs: 12 },
  ], { ls: 1.3, h: 1.8 });
  box(s, 5.25, 1.95, 4.35, 2.7, C.dangerBg, C.dangerBorder);
  pill(s, 5.5, 2.15, "做不到 · 限制", C.dangerText, C.white, 2.3);
  bullets(s, 5.5, 2.7, 3.9, [
    { t: "不是鐵律：長對話 / context 壓力下仍可能漏看或違反", c: C.ink, fs: 12.5 },
    { t: "規則越多越雜 → 注意力被稀釋", c: C.text, fs: 12 },
    { t: "memory 可能記錯 / 過時", c: C.text, fs: 12 },
  ], { ls: 1.3, h: 1.8 });
  box(s, 0.6, 4.85, 9.0, 0.8, C.bgSection);
  s.addText([
    { text: "CLAUDE.md / memory = 強力提示；", options: { bold: true, color: C.white } },
    { text: "要「機械式」擋住危險操作（誤 push main、rm -rf）得靠 hooks。", options: { color: C.bgQuestion } },
  ], { x: 0.9, y: 4.85, w: 8.4, h: 0.8, fontSize: 13.5, fontFace: FONT, valign: "middle", margin: 0 });
})();

// S11 — Both static & yours (transition)
(() => {
  const s = newSlide("Part 1 → Part 2", "但這些都是「你」的、寫好就靜在那", "But these are yours — and they sit still", 11);
  bullets(s, 0.6, 2.1, 9.0, [
    { t: "CLAUDE.md：你寫了才有。", c: C.ink, fs: 15 },
    { t: "memory：你的個人記憶，machine-local。", c: C.ink, fs: 15 },
  ], { ls: 1.5, h: 1.2 });
  box(s, 0.6, 3.7, 9.0, 1.2, C.bgSection);
  s.addText("它們不會自己跟上「別人」天天在改的東西——部門設計系統、PM 需求、會議結論。", {
    x: 0.9, y: 3.7, w: 8.4, h: 1.2, fontSize: 16, fontFace: FONT, bold: true, color: C.white, valign: "middle", margin: 0,
  });
  s.addText("→ Part 2：design-context", { x: 0.6, y: 5.1, w: 9, h: 0.4, fontSize: 15, fontFace: FONT, bold: true, color: C.primary, align: "center", margin: 0 });
})();

// S12 — The gap
(() => {
  const s = newSlide("Part 2 · design-context", "有些規範不是你的，而且天天變", "Some rules aren't yours — and they change daily", 12);
  const items = [
    ["部門 Design System", "VXD 維護的 tokens / 元件"],
    ["PM 需求文件", "requirement、決策"],
    ["會議結論", "口頭 / Teams 裡的共識"],
  ];
  let x = 0.6;
  items.forEach((it) => {
    box(s, x, 2.1, 2.86, 1.5, C.white, C.line);
    s.addText(it[0], { x: x + 0.15, y: 2.25, w: 2.56, h: 0.5, fontSize: 14, fontFace: FONT, bold: true, color: C.ink, margin: 0 });
    s.addText(it[1], { x: x + 0.15, y: 2.8, w: 2.56, h: 0.7, fontSize: 12, fontFace: FONT, color: C.text, valign: "top", margin: 0 });
    x += 3.0;
  });
  box(s, 0.6, 3.95, 9.0, 0.9, C.bgWarning);
  s.addText("抄進 CLAUDE.md → 隔天就過期。你要的不是「寫死」，是「持續拉到最新」。", {
    x: 0.9, y: 3.95, w: 8.4, h: 0.9, fontSize: 15, fontFace: FONT, bold: true, color: C.warningText, valign: "middle", margin: 0,
  });
  s.addText("（這類「只讀不改的參考」= Week 3 講的 Type B）", { x: 0.6, y: 5.0, w: 9, h: 0.3, fontSize: 11, fontFace: FONT, italic: true, color: C.muted, align: "center", margin: 0 });
})();

// S13 — Enter design-context
(() => {
  const s = newSlide("Part 2 · design-context", "design-context — 自動把最新規範與需求餵給 AI", "Keeps the AI's context fresh, automatically", 13);
  const steps = [
    ["GitHub repos", C.gitBg, C.gitText],
    ["本地 cache", C.bgQuestion, C.burgundy],
    ["agent 讀取", C.greenBg, C.greenText],
  ];
  let x = 0.95;
  steps.forEach((st, i) => {
    box(s, x, 2.7, 2.3, 1.0, st[1]);
    s.addText(st[0], { x, y: 2.7, w: 2.3, h: 1.0, fontSize: 15, fontFace: FONT, bold: true, color: st[2], align: "center", valign: "middle", margin: 0 });
    if (i < 2) s.addText("▶", { x: x + 2.3, y: 2.7, w: 0.5, h: 1.0, fontSize: 18, fontFace: FONT, bold: true, color: C.muted, align: "center", valign: "middle", margin: 0 });
    x += 2.8;
  });
  s.addText("cron + session-start 背景同步", { x: 0.95, y: 3.85, w: 2.3, h: 0.3, fontSize: 10, fontFace: FONT, italic: true, color: C.muted, align: "center", margin: 0 });
  s.addText("skill 觸發即讀", { x: 6.55, y: 3.85, w: 2.3, h: 0.3, fontSize: 10, fontFace: FONT, italic: true, color: C.muted, align: "center", margin: 0 });
  s.addText("我們團隊已做出來的 skill：解決「引用專案設定檔 + 持續讀最新需求」。", {
    x: 0.6, y: 4.6, w: 9, h: 0.5, fontSize: 14, fontFace: FONT, bold: true, color: C.ink, align: "center", margin: 0,
  });
})();

// S14 — L1 / L2
(() => {
  const s = newSlide("Part 2 · design-context", "L1 部門規範、L2 專案需求", "L1 department rules · L2 project specs", 14);
  box(s, 0.6, 2.0, 4.35, 3.0, C.white, C.line);
  pill(s, 0.85, 2.2, "L1 部門規範", C.figmaBg, C.figmaText, 2.2);
  bullets(s, 0.85, 2.75, 3.9, [
    { t: "vxd-skill：TLDS tokens、brand、motion、元件", c: C.text, fs: 12 },
    { t: "shallow clone（只拉最新整包）", c: C.muted, fs: 11 },
  ], { ls: 1.25, h: 2.0 });
  box(s, 5.25, 2.0, 4.35, 3.0, C.white, C.line);
  pill(s, 5.5, 2.2, "L2 專案需求", C.gitBg, C.gitText, 2.2);
  bullets(s, 5.5, 2.75, 3.9, [
    { t: "REI-Project/docs：requirement、決策、會議記錄", c: C.text, fs: 12 },
    { t: "sparse checkout（只拉該資料夾，一天多 commit 也不肥）", c: C.muted, fs: 11 },
  ], { ls: 1.25, h: 2.0 });
  s.addText("L1/L2 = 別人版的「設定檔 / 需求」——你不用手抄，skill 幫你持續拉。", {
    x: 0.6, y: 5.2, w: 9, h: 0.35, fontSize: 13, fontFace: FONT, italic: true, color: C.muted, align: "center", margin: 0,
  });
})();

// S15 — Staying fresh
(() => {
  const s = newSlide("Part 2 · design-context", "背景自動拉 + 設計前強制讀", "Auto-pull + read-before-design", 15);
  bullets(s, 0.6, 2.0, 9.0, [
    { t: "cron 每 30 分背景 fetch 最新（launchd）", b: true, c: C.ink, fs: 13 },
    { t: "SessionStart hook 補刀（cron 漏接時）", c: C.text, fs: 13 },
    { t: "skill On Activation：強制 agent 設計前先讀 manifest + 最新異動 digest", c: C.text, fs: 13 },
  ], { ls: 1.3, h: 2.0 });
  box(s, 0.6, 4.0, 9.0, 1.1, C.greenBg);
  s.addText("觸發詞（講人話就會啟動）", { x: 0.85, y: 4.12, w: 8.4, h: 0.3, fontSize: 12, fontFace: FONT, bold: true, color: C.greenText, margin: 0 });
  s.addText("「請根據 Q1-ONBOARDING 做設計」　「用部門規範」　「拉最新 PM spec」", {
    x: 0.85, y: 4.5, w: 8.4, h: 0.5, fontSize: 14, fontFace: FONT, color: C.ink, margin: 0,
  });
})();

// S16 — Notifications
(() => {
  const s = newSlide("Part 2 · design-context", "規範變了，主動提醒你", "When specs change, you hear about it", 16);
  bullets(s, 0.6, 2.0, 9.0, [
    { t: "sync 偵測到超過 threshold 的異動：", b: true, c: C.ink, fs: 14 },
    { t: "macOS 通知即時跳出（即使 Claude Code 關著）", c: C.text, fs: 13, lvl: 1 },
    { t: "寫 digest，下次設計時 agent inline 提醒", c: C.text, fs: 13, lvl: 1 },
  ], { ls: 1.3, h: 2.0 });
  box(s, 0.6, 3.9, 9.0, 1.0, C.bgQuestion);
  s.addText("「Q15 家庭設定規格昨天被改寫——你既有的設計需要重看。」", {
    x: 0.9, y: 3.9, w: 8.4, h: 1.0, fontSize: 15, fontFace: FONT, bold: true, italic: true, color: C.burgundy, valign: "middle", margin: 0,
  });
  s.addText("避免「埋頭做完才發現規格早就變了」。", { x: 0.6, y: 5.05, w: 9, h: 0.3, fontSize: 12, fontFace: FONT, color: C.muted, align: "center", margin: 0 });
})();

// S17 — Meeting / Teams consensus (roadmap)
(() => {
  const s = newSlide("Part 2 · roadmap", "把會議結論與團隊共識也納入", "Pull in meeting outcomes & team consensus", 17);
  pill(s, 0.6, 1.95, "規劃中 ROADMAP", C.warningBg, C.warningText, 2.0);
  bullets(s, 0.6, 2.55, 9.0, [
    { t: "meeting notes 納為設計 source", c: C.ink, fs: 14 },
    { t: "Teams 訊息加人工 tag（#共識 #conclusion #Stanley #BD）→ agent 精準抓團隊默契", c: C.ink, fs: 14 },
    { t: "來源未來擴到 email", c: C.text, fs: 13 },
  ], { ls: 1.4, h: 2.2 });
  s.addText("依 5/28 design 回饋會議結論——擴充 design-context 的讀取來源。", {
    x: 0.6, y: 4.9, w: 9, h: 0.4, fontSize: 12, fontFace: FONT, italic: true, color: C.muted, align: "center", margin: 0,
  });
})();

// S18 — Honest caveat + bridge
(() => {
  const s = newSlide("Part 2 · 收尾", "工具補不了「源頭沒更新」", "A tool can't fix specs nobody updates", 18);
  bullets(s, 0.6, 2.0, 9.0, [
    { t: "根因常是 PM/RD 沒把口頭/會議結論回寫文件——這是溝通問題。", c: C.ink, fs: 14 },
    { t: "design-context 是「持續同步 + 提醒」，不是「保證正確」；先把流程做對再自動化。", c: C.text, fs: 14 },
  ], { ls: 1.4, h: 1.3 });
  box(s, 0.6, 3.25, 9.0, 0.95, C.dangerBg, C.dangerBorder);
  pill(s, 0.9, 3.42, "風險", C.dangerText, C.white, 0.9);
  s.addText("若硬抓「過時的 requirement」，反而跟現行設計打架、製造 conflict。", {
    x: 1.95, y: 3.25, w: 7.4, h: 0.95, fontSize: 14, fontFace: FONT, bold: true, color: C.dangerText, valign: "middle", margin: 0,
  });
  box(s, 0.6, 4.55, 9.0, 0.85, C.bgSection);
  s.addText("Week 6 →　一人多 repo 的每日 workflow，怎麼把這些層在日常串起來。", {
    x: 0.9, y: 4.55, w: 8.4, h: 0.85, fontSize: 14, fontFace: FONT, bold: true, color: C.white, valign: "middle", margin: 0,
  });
})();

pres.writeFile({ fileName: "week5-claudemd-and-context.pptx" }).then((f) => console.log("✓ wrote", f));
