// Week 4 — Companion build for Slide 5 + 7 ONLY.
// Output: week4-p5-p7.pptx (2 slides). Open it, copy these two slides into the
// hand-edited week4 deck to replace the existing p5 and p7. Avoids clobbering
// the user's manual edits on other slides.
// Run: node build-week4-p5-p7.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x10";
pres.author = "Karen Shen";
pres.title = "Week 4 — p5 + p7 update";

const C = {
  bg: "F6EFE8",
  bgQuestion: "AFE0EF",
  ink: "222222",
  text: "555555",
  muted: "8E8E8E",
  subtle: "ADADAD",
  line: "E5E0D8",
  greenText: "0F7A4F",
  greenBg: "CDE9DC",
  white: "FFFFFF",
  skyDeep: "0690A7",
  dangerBg: "FEF2F2",
  dangerText: "DC2626",
  dangerBorder: "FCA5A5",
  primary: "D71920",
};

const FONT = "Calibri";

// ---------- helpers (subset, mirrors build-week4-pptx.js) ----------
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
  slide.addText("不要說 + 可能後果", {
    x: 6.75, y, w: 3.15, h: 0.26,
    fontSize: 11, fontFace: FONT, bold: true, color: C.dangerText,
    align: "left", valign: "middle", margin: 0,
  });
  hLine(slide, y + 0.32);
}

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

  // ✅ column
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
    "AI 可能跑 GitHub 網頁的 Download ZIP — 你拿到的是 zip，沒有 .git 目錄、沒有 remote 連結。之後 commit / push / pull 全做不了，要重 clone 才能進正常流程。"
  );

  sayRowWithImpact(s, 3.92, 1.30,
    "把本機資料夾接到 GitHub", "Connect local folder to GitHub",
    ["「把這個資料夾連到 GitHub 上的 <org/repo>」", "「在 GitHub 開一個 <repo>，把本機連上去」"],
    "「設成我的 repo」",
    "「設成」 AI 會猜 fork / init / rename / change ownership 其中之一；「我的」可解讀成個人 GitHub 或本機。最糟：fork 不該 fork 的 repo、或在錯位置 git init 蓋掉既有歷史。"
  );

  sayRowWithImpact(s, 5.22, 1.20,
    "指代陷阱（全主題通用）", "Reference traps",
    ["repo / branch / 檔名直接念出來", "「clone trendlife-general/hie-rei」"],
    "「這個 / 那個 / 連結這個 repo」",
    "AI 會抓 chat 中最近提到的 repo — 可能不是你現在想要的。已知災情：把 design system repo 當產品 repo 動了 token。"
  );

  // Bottom rule of thumb
  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule：repo / 檔案 / branch 名稱直接念出來，動詞要精確（clone / fork / init 不一樣）。", {
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

  s.addText("Commit 跟 push 是兩件事 — 講錯字 AI 會做別的事，最糟丟掉改動或推錯 branch。", {
    x: 0.6, y: 1.86, w: 9.2, h: 0.28,
    fontSize: 13, fontFace: FONT, color: C.text,
    align: "left", valign: "middle", margin: 0,
  });

  sayHeader(s, 2.22);

  // 4 rows × 0.97 each, header consumes ~0.42
  sayRowWithImpact(s, 2.62, 0.97,
    "把改動 commit", "Commit changes",
    ["「把這次改動 commit，message：<x>」"],
    "「存檔」",
    "AI 可能跑 git stash（改動進暫存區，沒 commit 紀錄）、或只 git add 沒 commit。之後 push 你以為上去了但遠端根本沒看到。"
  );

  sayRowWithImpact(s, 3.59, 0.97,
    "推上 GitHub", "Push to remote",
    ["「push 到我這條 branch」"],
    "「上傳 / 同步上去」",
    "AI 可能跑 git push --all（推所有 branch）、push 到錯 remote、或 history 衝突時順手加 --force。最糟：你的 wip 包含機密資訊被 push 到公開 repo。"
  );

  sayRowWithImpact(s, 4.56, 0.97,
    "拉同事的最新版", "Pull latest",
    ["「拉一下 main 最新的」", "「git pull origin main」"],
    "「更新一下」",
    "AI 可能跑 git pull --rebase（把你未 push 的 commit rebase 掉）、或 git reset --hard origin/main（本機未 commit 改動全部消失，救不回來）。"
  );

  sayRowWithImpact(s, 5.53, 0.97,
    "看 commit 紀錄", "View commit history",
    ["「給我最近 10 個 commit」", "「git log --oneline -10」"],
    "「歷史」",
    "AI 跑全 log 把 chat 灌爆、或誤解為「重寫歷史」=  git rebase -i 或 filter-branch，一旦 push --force 上去隊友的 local 歷史全對不上。"
  );

  // Bottom rule
  box(s, 0.6, 6.55, 8.8, 0.42, C.bgQuestion, C.skyDeep);
  s.addText("Rule：commit / push / pull / log 分開講，動詞讓 AI 不能猜範圍。", {
    x: 0.6, y: 6.55, w: 8.8, h: 0.42,
    fontSize: 12, fontFace: FONT, bold: true, color: C.skyDeep,
    align: "center", valign: "middle", margin: 0,
  });
}

// ==========================================================
// Output
// ==========================================================
pres.writeFile({ fileName: "week4-p5-p7.pptx" })
  .then(() => console.log("✅  week4-p5-p7.pptx written (2 slides)"))
  .catch((e) => console.error(e));
