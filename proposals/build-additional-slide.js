// Single-slide companion: Vibe Coding ≠ 全自動駕駛
// Output: additional-discussion.pptx — designed for copy-paste into main deck
// Run: node build-additional-slide.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x10";
pres.author = "Karen Shen";
pres.title = "Additional Discussion — Vibe Coding";

// ---------- Palette (mirror of build-week3-pptx.js, TLDS-aligned) ----------
const C = {
  bg: "F6EFE8",
  bgSection: "153242",
  bgQuestion: "AFE0EF",
  primary: "D71920",
  accent: "0690A7",
  ink: "222222",
  text: "555555",
  muted: "8E8E8E",
  subtle: "ADADAD",
  line: "E5E0D8",
  white: "FFFFFF",
  skyDeep: "0690A7",
};

const FONT = "Calibri";

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

// ==========================================================
// The slide
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

    s.addText(c.emoji, {
      x, y: cellY + 0.2, w: 2.84, h: 0.95,
      fontSize: 54, fontFace: FONT,
      align: "center", valign: "middle", margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 1.17, y: cellY + 1.22, w: 0.5, h: 0.025,
      fill: { color: C.primary }, line: { color: C.primary, width: 0 },
    });

    s.addText(c.zh, {
      x, y: cellY + 1.32, w: 2.84, h: 0.34,
      fontSize: 16, fontFace: FONT, bold: true, color: C.ink,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(c.en, {
      x, y: cellY + 1.68, w: 2.84, h: 0.26,
      fontSize: 11, fontFace: FONT, italic: true, color: C.muted,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(c.detail, {
      x: x + 0.2, y: cellY + 2.02, w: 2.44, h: 0.7,
      fontSize: 11, fontFace: FONT, color: C.text,
      align: "center", valign: "top", margin: 0, wrap: true,
    });
  });

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

pres.writeFile({ fileName: "additional-discussion.pptx" })
  .then(() => console.log("✅  additional-discussion.pptx written (1 slide)"))
  .catch(err => console.error("❌ ", err));
