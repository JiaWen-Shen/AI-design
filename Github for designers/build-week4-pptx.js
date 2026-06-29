// Week 4: 用 AI 操作 Git × design-pr-review skill — PPTX builder
// Design language mirrors Week 2 & 3 pptx
// Run: node build-week4-pptx.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x10";
pres.author = "Karen Shen";
pres.title = "用 AI 操作 Git × design-pr-review — Week 4";

// ---------- Palette (TLDS-aligned, identical to week3) ----------
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

function box(slide, x, y, w, h, bg, border) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: bg },
    line: border ? { color: border, width: 1 } : { color: bg, width: 0 },
    rectRadius: 0.1,
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

// Renders a "可以說 vs 不要說 + 可能後果" row.
// rowH should leave room for the want title (~0.5) + ✅ list + ❌ phrase + ⚠ consequence card.
function sayRowWithImpact(slide, y, rowH, want, wantEn, sayList, dontPhrase, impact) {
  // Want column
  slide.addText(want, {
    x: 0.6, y, w: 2.7, h: 0.28,
    fontSize: 12, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  slide.addText(wantEn, {
    x: 0.6, y: y + 0.28, w: 2.7, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  const innerY = y + 0.55;

  // ✅ column (stack)
  sayList.forEach((s, i) => {
    slide.addText("✓", {
      x: 3.4, y: innerY + i * 0.30, w: 0.25, h: 0.28,
      fontSize: 12, fontFace: FONT, bold: true, color: C.greenText,
      align: "left", valign: "middle", margin: 0,
    });
    slide.addText(s, {
      x: 3.65, y: innerY + i * 0.30, w: 3.0, h: 0.28,
      fontSize: 10.5, fontFace: FONT, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // ❌ phrase
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

  // ⚠ consequence card
  const impactY = innerY + 0.32;
  const impactH = Math.max(0.35, rowH - (impactY - y) - 0.08);
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.75, y: impactY, w: 3.15, h: impactH,
    fill: { color: C.dangerBg }, line: { color: C.dangerBorder, width: 0.75 }, rectRadius: 0.05,
  });
  slide.addText("⚠ " + impact, {
    x: 6.85, y: impactY + 0.04, w: 2.95, h: impactH - 0.08,
    fontSize: 9, fontFace: FONT, italic: true, color: C.dangerText,
    align: "left", valign: "top", margin: 0, wrap: true,
  });

  // Bottom divider
  hLine(slide, y + rowH - 0.05);
}

// Renders one ✅ / ❌ row inside a "可以說 / 不要說" slide.
function sayRow(slide, y, want, wantEn, sayList, dontList) {
  // Want column
  slide.addText(want, {
    x: 0.6, y, w: 2.7, h: 0.26,
    fontSize: 12, fontFace: FONT, bold: true, color: C.ink,
    align: "left", valign: "middle", margin: 0,
  });
  slide.addText(wantEn, {
    x: 0.6, y: y + 0.26, w: 2.7, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  // ✅ column
  sayList.forEach((s, i) => {
    slide.addText("✓", {
      x: 3.4, y: y + i * 0.32, w: 0.25, h: 0.28,
      fontSize: 12, fontFace: FONT, bold: true, color: C.greenText,
      align: "left", valign: "middle", margin: 0,
    });
    slide.addText(s, {
      x: 3.65, y: y + i * 0.32, w: 3.0, h: 0.28,
      fontSize: 10.5, fontFace: FONT, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // ❌ column
  dontList.forEach((d, i) => {
    slide.addText("✗", {
      x: 6.75, y: y + i * 0.32, w: 0.25, h: 0.28,
      fontSize: 12, fontFace: FONT, bold: true, color: C.dangerText,
      align: "left", valign: "middle", margin: 0,
    });
    slide.addText(d, {
      x: 7.0, y: y + i * 0.32, w: 2.9, h: 0.28,
      fontSize: 10.5, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
  });
}

// Header for the say / don't-say slides.
function sayHeader(slide, y) {
  slide.addText("你想做的事", {
    x: 0.6, y, w: 2.7, h: 0.26,
    fontSize: 11, fontFace: FONT, bold: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  slide.addText("可以說", {
    x: 3.4, y, w: 3.25, h: 0.26,
    fontSize: 11, fontFace: FONT, bold: true, color: C.greenText,
    align: "left", valign: "middle", margin: 0,
  });
  slide.addText("不要說", {
    x: 6.75, y, w: 3.15, h: 0.26,
    fontSize: 11, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(slide, y + 0.32);
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
  s.addText("用 AI 操作 Git × design-pr-review", {
    x: 0.8, y: 2.65, w: 9.2, h: 0.9,
    fontSize: 36, fontFace: FONT, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  s.addText("Talking to Claude Code for Git × design-pr-review v2", {
    x: 0.8, y: 3.55, w: 9.2, h: 0.5,
    fontSize: 20, fontFace: FONT, color: C.muted,
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
      zh: "用 AI 操作 Git", en: "Talking to Claude Code about Git",
      items: ["三週主題回顧 mini-map", "六大主題 × 可以說 / 不要說", "永遠避開的話 + 安全分類"],
    },
    {
      label: "B", color: C.figmaText, bg: C.figmaBg,
      zh: "design-pr-review skill 再講一次", en: "design-pr-review — deep dive",
      items: ["3 個 stage 拆解 + Demo", "pr-comment 接力", "實戰 case + 邊界"],
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

    s.addText(p.zh, {
      x: 1.25, y, w: 3.6, h: 0.36,
      fontSize: 17, fontFace: FONT, bold: true,
      color: C.ink, align: "left", valign: "middle", margin: 0,
    });
    s.addText(p.en, {
      x: 1.25, y: y + 0.36, w: 3.6, h: 0.24,
      fontSize: 10.5, fontFace: FONT, color: C.muted,
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
// Slide 3 — Section A divider
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgSection };

  addEyebrow(s, "Part A  ·  AI × Git", C.white);

  s.addText("把三週講過的主題", {
    x: 0.8, y: 1.5, w: 8.5, h: 0.7,
    fontSize: 28, fontFace: FONT, color: "D0DEFF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("變成「對 Claude Code 怎麼說」", {
    x: 0.8, y: 2.2, w: 8.5, h: 1.0,
    fontSize: 42, fontFace: FONT, bold: true, color: C.white,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("From concepts to AI-friendly phrasing", {
    x: 0.8, y: 3.2, w: 8.5, h: 0.4,
    fontSize: 18, fontFace: FONT, italic: true, color: "B8CCFF",
    align: "left", valign: "middle", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.8, w: 1.0, h: 0.04,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  s.addText("Week 2 #17 + #21 的延伸 — 六大主題 × 可以說 / 不要說", {
    x: 0.8, y: 3.92, w: 8.5, h: 0.3,
    fontSize: 13, fontFace: FONT, color: "B8CCFF",
    align: "left", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 4 — Week 1–3 主題 mini-map
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  三週主題回顧  —  01");
  addTitle(s, "三週講了哪些主題？", "Three-week topic map");

  s.addText("這六大主題會在後面變成「可以說 / 不要說」的對話清單。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  const weeks = [
    {
      label: "Week 1", color: C.muted,
      title: "Git 是什麼 + 為什麼設計師要會",
      topics: ["Git/GitHub 概念", "為什麼要 version control"],
    },
    {
      label: "Week 2", color: C.figmaText,
      title: "進 repo 開始工作",
      topics: ["Clone / Setup", "Branch / Switch", "Push / Pull / Reject"],
    },
    {
      label: "Week 3", color: C.primary,
      title: "Git 名詞 + 三種 Working Repo",
      topics: ["Commit vs Push", "Staged / Stash / Discard", "PR / Merge / Conflict", "Type A / B / C repo"],
    },
  ];

  weeks.forEach((w, i) => {
    const y = 2.5 + i * 1.55;

    // Week badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y, w: 1.2, h: 0.42,
      fill: { color: w.color }, line: { color: w.color, width: 0 }, rectRadius: 0.08,
    });
    s.addText(w.label, {
      x: 0.6, y, w: 1.2, h: 0.42,
      fontSize: 12, fontFace: FONT, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Title
    s.addText(w.title, {
      x: 2.0, y, w: 7.6, h: 0.42,
      fontSize: 15, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });

    // Topic pills row
    let px = 2.0;
    w.topics.forEach((t) => {
      const pw = 0.32 + t.length * 0.13;
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

    if (i < weeks.length - 1) hLine(s, y + 1.25);
  });

  // Bottom hint
  box(s, 0.6, 6.95, 8.8, 0.04, C.line);
}

// ==========================================================
// Slide 5 — Clone / Setup ✅❌ + 可能後果
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Clone / Setup  —  02");
  addTitle(s, "Clone / Setup — 對 Claude Code 怎麼說", "Cloning and connecting a repo");

  s.addText("壞字眼會讓 AI 跑到完全不同的動作 — 後果欄列實際會出事的情境。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.22);

  sayRowWithImpact(s, 2.62, 1.30,
    "把 repo 抓下來", "Clone a repo",
    ["「clone trendlife-general/hie-rei」", "「把 hie-rei 抓到 ~/work/」"],
    "「下載這個」",
    "AI 可能跑 GitHub 網頁的 Download ZIP — 你拿到的是 zip,沒有 .git 目錄、沒有 remote 連結。之後 commit / push / pull 全做不了,要重 clone 才能進正常流程。"
  );

  sayRowWithImpact(s, 3.92, 1.30,
    "把本機資料夾接到 GitHub", "Connect local folder to GitHub",
    ["「把這個資料夾連到 GitHub 上的 <org/repo>」", "「在 GitHub 開一個 <repo>,把本機連上去」"],
    "「設成我的 repo」",
    "「設成」AI 會猜 fork / init / rename / change ownership 其中之一;「我的」可解讀成個人 GitHub 或本機。最糟:fork 不該 fork 的 repo、或在錯位置 git init 蓋掉既有歷史。"
  );

  sayRowWithImpact(s, 5.22, 1.20,
    "指代陷阱(全主題通用)", "Reference traps",
    ["repo / branch / 檔名直接念出來", "「clone trendlife-general/hie-rei」"],
    "「這個 / 那個 / 連結這個 repo」",
    "AI 會抓 chat 中最近提到的 repo — 可能不是你現在想要的。已知災情:把 design system repo 當產品 repo 動了 token。"
  );

  // Bottom rule of thumb
  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule:repo / 檔案 / branch 名稱直接念出來,動詞要精確(clone / fork / init 不一樣)。", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 6 — Branch / Switch ✅❌
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Branch / Switch  —  03");
  addTitle(s, "Branch / Switch — 對 Claude Code 怎麼說", "Branching and switching");

  s.addText("Week 2 #17 那張延伸——加上「不要說」欄。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.3);

  sayRow(s, 2.72,
    "開新 branch 開始工作", "Start a new branch",
    ["「開一條 branch 叫 `feature/header-redesign`」", "「從 main 開 `fix/typo`」"],
    ["「開個分支」（沒名字 AI 會自己編）"]
  );
  hLine(s, 3.45);

  sayRow(s, 3.62,
    "切到別的 branch", "Switch branches",
    ["「切到 `main`」", "「跳到 `feature/dark-mode`」"],
    ["「換到那個」「切回去」（指代不清）"]
  );
  hLine(s, 4.35);

  sayRow(s, 4.52,
    "看目前在哪", "Check current branch",
    ["「我現在在哪條 branch？」", "「給我 `git status`」"],
    ["「看一下狀況」（範圍太廣）"]
  );
  hLine(s, 5.25);

  sayRow(s, 5.42,
    "刪掉不要的 branch", "Delete a branch",
    ["「刪掉 `feature/abandoned` 這條 branch（local）」"],
    ["「清掉舊的」「整理一下」（不知刪哪條）"]
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule：branch 名稱完整念出來，並指明 local 還是 remote。", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 7 — Commit / Push ✅❌ + 可能後果
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Commit / Push  —  04");
  addTitle(s, "Commit / Push — 對 Claude Code 怎麼說", "Recording changes and pushing");

  s.addText("Commit 跟 push 是兩件事 — 講錯字 AI 會做別的事,最糟丟改動或推錯 branch。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.22);

  sayRowWithImpact(s, 2.62, 0.97,
    "把改動 commit", "Commit changes",
    ["「把這次改動 commit,message:<x>」"],
    "「存檔」",
    "AI 可能跑 git stash(改動進暫存區,沒 commit 紀錄)、或只 git add 沒 commit。之後 push 你以為上去了但遠端根本沒看到。"
  );

  sayRowWithImpact(s, 3.59, 0.97,
    "推上 GitHub", "Push to remote",
    ["「push 到我這條 branch」"],
    "「上傳 / 同步上去」",
    "AI 可能跑 git push --all(推所有 branch)、push 到錯 remote、或 history 衝突時順手加 --force。最糟:你的 wip 含機密資訊被 push 到公開 repo。"
  );

  sayRowWithImpact(s, 4.56, 0.97,
    "拉同事的最新版", "Pull latest",
    ["「拉一下 main 最新的」", "「git pull origin main」"],
    "「更新一下」",
    "AI 可能跑 git pull --rebase(把你未 push 的 commit rebase 掉)、或 git reset --hard origin/main(本機未 commit 改動全部消失,救不回來)。"
  );

  sayRowWithImpact(s, 5.53, 0.97,
    "看 commit 紀錄", "View commit history",
    ["「給我最近 10 個 commit」", "「git log --oneline -10」"],
    "「歷史」",
    "AI 跑全 log 把 chat 灌爆、或誤解為「重寫歷史」= git rebase -i 或 filter-branch,一旦 push --force 上去隊友本機歷史全對不上。"
  );

  // Bottom rule
  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule:commit / push / pull / log 分開講,動詞精確讓 AI 不能猜範圍。", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 8 — Staged / Discard / Stash ✅❌
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Staged / Discard / Stash  —  05");
  addTitle(s, "Staged / Discard / Stash — 對 Claude Code 怎麼說", "Controlling scope of a commit");

  s.addText("這組最容易出事——「清掉 / 重置」會把改動丟掉。明確指範圍。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.3);

  sayRow(s, 2.72,
    "只把某幾個檔加進 commit", "Stage specific files",
    ["「把 `src/foo.tsx` 加進這次 commit」", "「只 stage `settings/*.html`」"],
    ["「加進去」（哪個？）「全選」"]
  );
  hLine(s, 3.45);

  sayRow(s, 3.62,
    "丟掉某個檔的改動", "Discard changes to a file",
    ["「丟掉 `settings.html` 的改動」", "「revert `App.jsx` 回到 HEAD」"],
    ["「reset」（範圍太大）「清掉」「回到原本」"]
  );
  hLine(s, 4.35);

  sayRow(s, 4.52,
    "暫存目前狀態等等回來", "Stash work-in-progress",
    ["「把目前狀態 stash 起來等等回來」", "「stash 一下，標籤 `wip-dark-mode`」"],
    ["「先放著」「先存著」（會被當 commit）"]
  );
  hLine(s, 5.25);

  sayRow(s, 5.42,
    "拿回 stash 的東西", "Restore stashed work",
    ["「把剛剛 stash 的拿回來」", "「`stash pop`」"],
    ["「之前那個」（哪一個 stash？）"]
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.dangerBg, C.dangerText);
  s.addText("⚠️  Rule：「丟掉 / 清掉」會永久刪改動——先 commit 或 stash 再說。", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.dangerText,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 9 — PR / Merge / Conflict ✅❌
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  PR / Merge / Conflict  —  06");
  addTitle(s, "PR / Merge / Conflict — 對 Claude Code 怎麼說", "Pull requests, merging, conflicts");

  s.addText("「合併」太模糊——branch merge？PR merge？squash？rebase？指明動作。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.3);

  sayRow(s, 2.72,
    "開 PR", "Open a pull request",
    ["「開 PR 把 `feature/x` 合進 `main`，title：`<x>`」", "「`gh pr create` 一下」"],
    ["「送出去 review」（送哪？）"]
  );
  hLine(s, 3.45);

  sayRow(s, 3.62,
    "把 main 最新的併進來", "Rebase / merge main into branch",
    ["「幫我把 PR #310 rebase 到 main」", "「`merge main` 進我這條 branch」"],
    ["「同步一下」「更新分支」（不知用 rebase 還 merge）"]
  );
  hLine(s, 4.35);

  sayRow(s, 4.52,
    "解 conflict", "Resolve a conflict",
    ["「解一下這個 conflict，保留我這邊（ours）」", "「保留 main 那邊（theirs）的 `App.jsx`」"],
    ["「處理一下」（保留誰？）「整合」"]
  );
  hLine(s, 5.25);

  sayRow(s, 5.42,
    "PR merge 進 main", "Merge the PR",
    ["「PR #310 squash merge」", "「`gh pr merge --squash`」"],
    ["「合進去」（squash？rebase？merge commit？）"]
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule：「合併」永遠加 squash / merge / rebase 其中一個動詞。", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 10 — Working Repo Type A/B/C ✅❌
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Working Repo A / B / C  —  07");
  addTitle(s, "三種 Working Repo — 對 Claude Code 怎麼說", "Different repo types, different phrasing");

  s.addText("Week 3 Part C 的三種類型——你在哪一種 repo，講話方式不一樣。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.3);

  sayRow(s, 2.72,
    "A 協作 repo（你有寫入）", "Collaboration repo",
    ["「開 PR 把 `<branch>` 合進 main」", "「commit + push 到我這條 branch」"],
    ["「直接 push 到 main」（會被擋 / 沒 review）"]
  );
  hLine(s, 3.45);

  sayRow(s, 3.62,
    "B 引用 repo（你是讀者）", "Reference repo (DS、規範)",
    ["「同步最新的 design system tokens」", "「checkout 最新 tag」"],
    ["「我要改」（沒寫入權限，AI 還是會試）"]
  );
  hLine(s, 4.35);

  sayRow(s, 4.52,
    "C 個人 repo", "Personal repo",
    ["「commit + push，message：`<x>`」"],
    ["—（個人 repo 約束最少）"]
  );
  hLine(s, 5.25);

  sayRow(s, 5.42,
    "搞不清楚是哪一種", "Not sure which type",
    ["「這個 repo 我有寫入權限嗎？」", "「看一下 `git remote -v` + `gh repo view`」"],
    ["直接動手做（可能踩權限或 review 規範）"]
  );

  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule：動手前先確認你在哪一種 repo，決定要不要走 PR。", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 11 — 永遠避開的話 + Force Push 後果（visual）
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Never Say  —  08", C.dangerText);
  addTitle(s, "永遠避開這些話", "Phrases that trigger destructive actions");

  s.addText("這些字眼會讓 AI 跑 `--force` / `reset --hard` / `rm -rf`——救不回來。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // ===== LEFT: don't-say list =====
  s.addText("避開這些字眼", {
    x: 0.6, y: 2.4, w: 4.4, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });

  const dontSay = [
    "強推上去 / force push it",
    "不管它了直接推 / just push it",
    "直接蓋過去 / just overwrite",
    "整個重來 / start over",
    "刪掉所有東西 / delete everything",
    "--force / --force-with-lease",
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

  // ===== RIGHT: force push consequence (visual) =====
  s.addText("為什麼會出事——Force Push 後果", {
    x: 5.2, y: 2.4, w: 4.4, h: 0.3,
    fontSize: 14, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });

  // Before
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
  s.addText("(▲ = 隊友剛 push 的 commit)", {
    x: 5.2, y: 3.25, w: 4.4, h: 0.22,
    fontSize: 9, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  // Arrow
  s.addText("AI force push ↓", {
    x: 5.2, y: 3.6, w: 4.4, h: 0.26,
    fontSize: 11, fontFace: FONT, italic: true, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });

  // After
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
  s.addText("(▲ 不見了——被你的 commit 蓋掉)", {
    x: 5.2, y: 4.3, w: 4.4, h: 0.22,
    fontSize: 9, fontFace: FONT, italic: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });

  // Result tag
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2, y: 4.75, w: 4.4, h: 0.5,
    fill: { color: "FEE2E2" }, line: { color: C.dangerText, width: 0.75 }, rectRadius: 0.05,
  });
  s.addText("隊友的 commit 從遠端消失 — 要靠 reflog 才救得回來", {
    x: 5.2, y: 4.75, w: 4.4, h: 0.5,
    fontSize: 10.5, fontFace: FONT, bold: true, color: C.dangerText,
    align: "center", valign: "middle", margin: 0,
  });

  // Bottom band
  box(s, 0.6, 6.55, 8.8, 0.42, C.dangerBg, C.dangerText);
  s.addText("如果真的要 force push — 換 `--force-with-lease`，並且自己下指令，不要靠 AI 翻譯。", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 11.5, fontFace: FONT, bold: true, color: C.dangerText,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 12 — 安全 vs 危險動作分類表
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part A  ·  Auto vs Confirm  —  09");
  addTitle(s, "讓 AI 自己跑 vs 必須先看", "When to auto-run vs require confirmation");

  s.addText("動作的「可逆性」決定要不要先停下來看——不可逆的永遠先確認。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // ===== LEFT: Auto-run =====
  box(s, 0.6, 2.4, 4.3, 4.0, C.greenBg, C.greenText);
  s.addText("✓  讓 AI 自己跑", {
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
    "`git fetch`（不會動 working dir）",
    "`gh pr view <num>`",
  ];
  safe.forEach((cmd, i) => {
    s.addText("• " + cmd, {
      x: 0.85, y: 3.25 + i * 0.4, w: 4.0, h: 0.36,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0,
    });
  });

  // ===== RIGHT: Confirm first =====
  box(s, 5.1, 2.4, 4.3, 4.0, C.dangerBg, C.dangerText);
  s.addText("⚠  必須先看", {
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
    "`git rebase --onto` / 大範圍 rebase",
    "`git branch -D` / `git tag -d`",
    "`rm -rf` / 刪檔",
    "`gh pr merge` / 任何 merge 動作",
  ];
  danger.forEach((cmd, i) => {
    s.addText("• " + cmd, {
      x: 5.35, y: 3.25 + i * 0.4, w: 4.0, h: 0.36,
      fontSize: 11, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0,
    });
  });

  // Bottom rule
  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule：read 動作放心讓 agent 跑；write 動作先確認 → 看 diff → 再 yes。", {
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
  s.addText("把設計 PR review 的步驟自動化", {
    x: 0.8, y: 2.5, w: 8.5, h: 0.48,
    fontSize: 22, fontFace: FONT, color: "D0DEFF",
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
// Slide 14 — 安裝 / 觸發方式
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Setup  —  01");
  addTitle(s, "怎麼啟動", "How to trigger the skill");

  s.addText("hie-rei main 已經內建——不用裝任何東西，直接觸發。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // Trigger ways
  const triggers = [
    { kind: "Slash command", value: "/design-pr-review <PR-number>" },
    { kind: "Natural language", value: "review this design PR #321" },
    { kind: "中文觸發", value: "幫我 review 設計 PR #321" },
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

  // Prereq band
  box(s, 0.6, 5.4, 8.8, 1.1, C.greenBg, C.greenText);
  s.addText("前提", {
    x: 0.8, y: 5.5, w: 1.5, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: C.greenText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "• 你的 Claude Code 已 clone hie-rei 並切到 main\n", options: { color: C.ink } },
    { text: "• 已 ", options: { color: C.ink } },
    { text: "gh auth login", options: { fontFace: "Consolas", color: C.figmaText, bold: true } },
    { text: " 並有目標 repo 的讀取權限\n", options: { color: C.ink } },
    { text: "• PR 是設計類型（HTML mockup + spec.md）", options: { color: C.ink } },
  ], {
    x: 0.8, y: 5.8, w: 8.4, h: 0.65,
    fontSize: 11, fontFace: FONT,
    align: "left", valign: "top", margin: 0,
  });

  hLine(s, 6.7);
  s.addText("Karen 5/21 merge 到 hie-rei main · 全 design team 可用 · PR #291", {
    x: 0.6, y: 6.78, w: 8.8, h: 0.24,
    fontSize: 10, fontFace: FONT, italic: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 15 — 3 個 stage 拆解
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Workflow  —  02");
  addTitle(s, "Skill 做的 3 件事", "Three stages, one click");

  s.addText("每個 stage 都會把結果交還給你決定下一步——你還是駕駛。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  const stages = [
    {
      n: "1", title: "Scope PR",
      desc: "自動列出改動檔案、辨識 mockup 與 spec.md，過濾不相關的設定檔。",
      output: "→ 一份 changed-file 清單，附上每個檔的角色",
    },
    {
      n: "2", title: "Before / After Side-by-side",
      desc: "瀏覽器自動開兩個分頁——main 版本 vs PR 版本，並列對齊。",
      output: "→ 視覺差異一眼看出",
    },
    {
      n: "3", title: "Violation Flag + Multi-author Scan",
      desc: "Design system 違反項以「提問」方式 flag；同檔多 author 改 → 標出衝突點。",
      output: "→ 給你 review 留言的素材",
    },
  ];

  stages.forEach((st, i) => {
    const y = 2.5 + i * 1.35;
    // Number badge
    s.addShape(pres.shapes.OVAL, {
      x: 0.6, y, w: 0.7, h: 0.7,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });
    s.addText(st.n, {
      x: 0.6, y, w: 0.7, h: 0.7,
      fontSize: 24, fontFace: FONT, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Title
    s.addText(st.title, {
      x: 1.5, y, w: 7.8, h: 0.36,
      fontSize: 16, fontFace: FONT, bold: true, color: C.ink,
      align: "left", valign: "middle", margin: 0,
    });
    // Desc
    s.addText(st.desc, {
      x: 1.5, y: y + 0.38, w: 7.8, h: 0.36,
      fontSize: 12, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
    // Output
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
  addTitle(s, "Stage 1：Scope PR", "Auto-list changed files, identify roles");

  s.addText("Skill 自動跑 `gh pr diff` + 辨識每個檔的角色——你不用手動爬。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // Screenshot placeholder
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.4, w: 6.0, h: 4.2,
    fill: { color: C.white },
    line: { color: C.subtle, width: 1, dashType: "dash" },
  });
  s.addText("📸  Stage 1 截圖位置（手動插入）", {
    x: 0.6, y: 4.2, w: 6.0, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("PR <新> · scope 後的 changed-file 清單", {
    x: 0.6, y: 4.6, w: 6.0, h: 0.5,
    fontSize: 10.5, fontFace: FONT, color: C.subtle,
    align: "center", valign: "middle", margin: 0,
  });

  // Side notes
  box(s, 6.8, 2.4, 2.6, 4.2, C.figmaBg, C.figmaText);
  s.addText("✓  自動做的事", {
    x: 6.95, y: 2.55, w: 2.3, h: 0.32,
    fontSize: 12, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 2.92, 6.95, 2.3);
  [
    "跑 `gh pr diff <num>` 抓檔案清單",
    "辨識每個檔角色：\nmockup / spec / asset / config",
    "過濾無關的設定檔",
    "標出 commit 數 + author 數",
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
  addTitle(s, "Stage 2：Before / After Side-by-side", "Visual diff in the browser");

  s.addText("自動開兩個瀏覽器分頁——main 版本左、PR 版本右，靠肉眼最快。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // Screenshot placeholder
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.4, w: 6.0, h: 4.2,
    fill: { color: C.white },
    line: { color: C.subtle, width: 1, dashType: "dash" },
  });
  s.addText("📸  Stage 2 截圖位置（手動插入）", {
    x: 0.6, y: 4.2, w: 6.0, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("PR <新> · before / after 並列截圖", {
    x: 0.6, y: 4.6, w: 6.0, h: 0.5,
    fontSize: 10.5, fontFace: FONT, color: C.subtle,
    align: "center", valign: "middle", margin: 0,
  });

  // Side notes
  box(s, 6.8, 2.4, 2.6, 4.2, C.figmaBg, C.figmaText);
  s.addText("✓  自動做的事", {
    x: 6.95, y: 2.55, w: 2.3, h: 0.32,
    fontSize: 12, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 2.92, 6.95, 2.3);
  [
    "Checkout main 起 local server",
    "Checkout PR 起 second port",
    "Browser 並列開兩個 tab",
    "保留滾動同步（手動）",
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
  addTitle(s, "Stage 3：Violation Flag + Multi-author Scan", "Flag as questions, not verdicts");

  s.addText("Skill 不下定論——它「提問」。同檔多 author 改 → 自動標衝突點。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // Screenshot placeholder
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.4, w: 6.0, h: 4.2,
    fill: { color: C.white },
    line: { color: C.subtle, width: 1, dashType: "dash" },
  });
  s.addText("📸  Stage 3 截圖位置（手動插入）", {
    x: 0.6, y: 4.2, w: 6.0, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("PR <新> · DS violation 提問清單 + multi-author 標記", {
    x: 0.6, y: 4.6, w: 6.0, h: 0.5,
    fontSize: 10.5, fontFace: FONT, color: C.subtle,
    align: "center", valign: "middle", margin: 0,
  });

  // Side notes
  box(s, 6.8, 2.4, 2.6, 4.2, C.figmaBg, C.figmaText);
  s.addText("✓  自動做的事", {
    x: 6.95, y: 2.55, w: 2.3, h: 0.32,
    fontSize: 12, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 2.92, 6.95, 2.3);
  [
    "比對 design tokens，flag 可疑值",
    "用「提問」語氣（不下定論）",
    "掃同檔多 author → 衝突點",
    "輸出 draft 友善 tone 留言",
  ].forEach((t, i) => {
    s.addText("•  " + t, {
      x: 6.95, y: 3.1 + i * 0.62, w: 2.3, h: 0.55,
      fontSize: 10.5, fontFace: FONT, color: C.ink,
      align: "left", valign: "top", margin: 0, wrap: true,
    });
  });
}

// ==========================================================
// Slide 19 — pr-comment 接力
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Handoff  —  06");
  addTitle(s, "design-pr-review → pr-comment 接力", "Hand off the draft to pr-comment");

  s.addText("design-pr-review 只寫 draft，不直接 post——你看過、改過、才發布。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // Flow boxes
  const steps = [
    { title: "1. Skill 跑完", desc: "輸出 draft 留言（友善 tone）", bg: C.figmaBg, fg: C.figmaText },
    { title: "2. 你手動審", desc: "刪掉誤判、改 wording、加自己的看法", bg: C.bgQuestion, fg: C.skyDeep },
    { title: "3. /pr-comment 發布", desc: "確認後一次性送到 GitHub PR 上", bg: C.greenBg, fg: C.greenText },
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

  // Why this split
  box(s, 0.6, 4.7, 8.8, 1.8, C.bgWarning, C.warningText);
  s.addText("為什麼拆兩段？", {
    x: 0.8, y: 4.85, w: 8.4, h: 0.32,
    fontSize: 13, fontFace: FONT, bold: true, color: C.warningText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 5.2, 0.8, 8.4);
  [
    "Skill 是副駕，不是駕駛 — 它幫你打草稿，但「按下發送」永遠是你的責任",
    "PR 留言會被 GitHub email 通知到全 team — 一次錯字會發給所有人",
    "你的審查 = wording 不卡、跟團隊文化合、保留設計師判斷",
  ].forEach((t, i) => {
    s.addText("• " + t, {
      x: 0.85, y: 5.32 + i * 0.36, w: 8.3, h: 0.32,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "left", valign: "middle", margin: 0,
    });
  });

  // Trigger
  box(s, 0.6, 6.7, 8.8, 0.32, C.figmaBg, C.figmaText);
  s.addText("Trigger：/pr-comment（接力 skill，已內建在 hie-rei main）", {
    x: 0.6, y: 6.7, w: 8.8, h: 0.32,
    fontSize: 11, fontFace: FONT, bold: true, color: C.figmaText,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Slide 20 — 實戰 case + L1/L2 + 邊界
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addEyebrow(s, "Part B  ·  Battle-tested  —  07");
  addTitle(s, "實戰測過的 3 種 PR + 不做的事", "Stress-tested cases + boundaries");

  s.addText("三種 PR 形態都跑過——把驗收 metrics + skill 邊界一次說清楚。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  hLine(s, 2.22);

  // ===== LEFT: 3 PR cases =====
  s.addText("跑過的 3 種 PR", {
    x: 0.6, y: 2.4, w: 4.4, h: 0.3,
    fontSize: 13, fontFace: FONT, bold: true, color: C.figmaText,
    align: "left", valign: "middle", margin: 0,
  });

  const cases = [
    { pr: "PR #284", kind: "copy-only", note: "純文案改 — 確認沒誤判 visual 改動" },
    { pr: "PR #282", kind: "CSS refactor", note: "改 style 沒改結構 — DS token 比對" },
    { pr: "PR #281", kind: "large multi-screen", note: "多畫面大型改動 — 三個 stage 都觸發" },
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

  // Metric badge
  box(s, 0.6, 5.5, 4.4, 1.0, C.greenBg, C.greenText);
  s.addText("L1 + L2 驗收結果", {
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
  s.addText("L1 = 自動化檢查 · L2 = 設計師主觀驗收", {
    x: 0.8, y: 6.22, w: 4.0, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });

  // ===== RIGHT: Boundaries =====
  box(s, 5.2, 2.4, 4.2, 4.1, C.dangerBg, C.dangerText);
  s.addText("Skill 不做的事", {
    x: 5.38, y: 2.55, w: 3.9, h: 0.32,
    fontSize: 13, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });
  s.addText("Boundaries — what the skill won't do", {
    x: 5.38, y: 2.85, w: 3.9, h: 0.22,
    fontSize: 9.5, fontFace: FONT, italic: true, color: C.muted,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(s, 3.15, 5.38, 3.9);

  const nots = [
    "不下定論 — 都是「提問」",
    "不自動 approve PR",
    "不直接 post 留言 — 一定走 pr-comment",
    "不寫設計師的 critique — 只給素材",
    "不取代你的判斷 — 副駕",
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
  addTitle(s, "兩個主軸，一條原則", "Two threads, one principle");

  hLine(s, 2.0);

  // Three takeaway cards
  const cards = [
    {
      icon: "💬", zh: "說話要明確",
      en: "Be specific",
      detail: "repo / 檔案 / branch / commit 名稱直接念出來。不要「這個 / 那個」。AI 不會猜對。",
      bg: C.gitBg, fg: C.primary,
    },
    {
      icon: "🛑", zh: "危險動作先看",
      en: "Confirm destructive ops",
      detail: "push / reset / rebase / merge / rm — 永遠先 diff、先確認，再下手。",
      bg: C.dangerBg, fg: C.dangerText,
    },
    {
      icon: "🤝", zh: "Skill 是副駕",
      en: "Skill is co-pilot",
      detail: "design-pr-review 給你素材，pr-comment 讓你發布。判斷跟責任永遠是你的。",
      bg: C.figmaBg, fg: C.figmaText,
    },
  ];

  cards.forEach((c, i) => {
    const x = 0.6 + i * 3.08;
    const y = 2.3;
    const h = 3.8;
    box(s, x, y, 2.84, h, C.white, c.fg);

    // Icon row
    box(s, x, y, 2.84, 1.0, c.bg);
    s.addText(c.icon, {
      x, y: y + 0.1, w: 2.84, h: 0.8,
      fontSize: 36, fontFace: FONT,
      align: "center", valign: "middle", margin: 0,
    });

    // zh title
    s.addText(c.zh, {
      x, y: y + 1.15, w: 2.84, h: 0.36,
      fontSize: 17, fontFace: FONT, bold: true, color: C.ink,
      align: "center", valign: "middle", margin: 0,
    });
    // en subtitle
    s.addText(c.en, {
      x, y: y + 1.52, w: 2.84, h: 0.26,
      fontSize: 11, fontFace: FONT, italic: true, color: C.muted,
      align: "center", valign: "middle", margin: 0,
    });
    // divider
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 1.17, y: y + 1.85, w: 0.5, h: 0.025,
      fill: { color: c.fg }, line: { color: c.fg, width: 0 },
    });

    // detail
    s.addText(c.detail, {
      x: x + 0.2, y: y + 2.0, w: 2.44, h: 1.7,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "center", valign: "top", margin: 0, wrap: true,
    });
  });

  // Bottom band
  hLine(s, 6.35);
  box(s, 0.6, 6.5, 8.8, 0.5, C.bgQuestion, C.skyDeep);
  s.addText("Hands on the wheel  ·  Eyes on the diff  ·  Mind on the design", {
    x: 0.6, y: 6.5, w: 8.8, h: 0.5,
    fontSize: 13, fontFace: FONT, bold: true, italic: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Output
// ==========================================================
pres.writeFile({ fileName: "week4-ai-git-and-prr.pptx" })
  .then(() => console.log("✅  week4-ai-git-and-prr.pptx written (21 slides)"))
  .catch((e) => console.error(e));
