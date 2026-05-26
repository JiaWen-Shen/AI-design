// text-diff-render.js — Browser-side side-by-side line diff renderer.
// Loaded as a <script> in compare-wrapper.html (injected by make-compare-wrapper.js).
//
// Exposed globals:
//   - loadTextDiff(leftFrame, rightFrame, entry, opts)
//     async; fetches entry.before + entry.after, computes a line-level diff, sets each
//     iframe's srcdoc to a side-by-side rendered diff. Each row has `data-line` so the
//     wrapper anchor router can scroll to a specific line.
//
// Perf cap: when before+after combined size exceeds TEXT_DIFF_PERF_CAP_BYTES, fall back
// to raw <pre> dump on each side and stamp `dataset.perfCapped = "1"` on the iframes so
// the anchor router can produce a friendlier "file too large" toast.

const TEXT_DIFF_PERF_CAP_BYTES = 500 * 1024;
const TEXT_DIFF_CONTEXT = 3;

function escTextDiff(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// LCS-based line diff. Returns an array of items:
//   { kind: 'eq', text, beforeLine, afterLine } | { kind: 'rm', text, beforeLine } | { kind: 'add', text, afterLine }
function computeBrowserLineDiff(beforeLines, afterLines) {
  const m = beforeLines.length;
  const n = afterLines.length;
  // dp[i][j] = LCS length of beforeLines[i..] and afterLines[j..]
  const dp = [];
  for (let i = 0; i <= m; i++) dp.push(new Uint32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (beforeLines[i] === afterLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (beforeLines[i] === afterLines[j]) {
      out.push({ kind: "eq", text: beforeLines[i], beforeLine: i + 1, afterLine: j + 1 });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: "rm", text: beforeLines[i], beforeLine: i + 1 });
      i++;
    } else {
      out.push({ kind: "add", text: afterLines[j], afterLine: j + 1 });
      j++;
    }
  }
  while (i < m) { out.push({ kind: "rm", text: beforeLines[i], beforeLine: i + 1 }); i++; }
  while (j < n) { out.push({ kind: "add", text: afterLines[j], afterLine: j + 1 }); j++; }
  return out;
}

// Group change rows into hunks with `context` lines of leading + trailing context.
// Adjacent change clusters within 2*context of each other are merged into one hunk.
function diffToHunks(diff, context) {
  const changeIndices = [];
  for (let i = 0; i < diff.length; i++) {
    if (diff[i].kind !== "eq") changeIndices.push(i);
  }
  if (changeIndices.length === 0) return [];

  const groups = [];
  let gStart = changeIndices[0];
  let gEnd = changeIndices[0];
  for (let k = 1; k < changeIndices.length; k++) {
    if (changeIndices[k] - gEnd <= 2 * context) {
      gEnd = changeIndices[k];
    } else {
      groups.push([gStart, gEnd]);
      gStart = changeIndices[k];
      gEnd = changeIndices[k];
    }
  }
  groups.push([gStart, gEnd]);

  return groups.map(([s, e]) => {
    const lo = Math.max(0, s - context);
    const hi = Math.min(diff.length - 1, e + context);
    const rows = [];
    for (let i = lo; i <= hi; i++) {
      const d = diff[i];
      if (d.kind === "eq") rows.push({ side: "both", text: d.text, beforeLine: d.beforeLine, afterLine: d.afterLine });
      else if (d.kind === "rm") rows.push({ side: "left", text: d.text, beforeLine: d.beforeLine });
      else rows.push({ side: "right", text: d.text, afterLine: d.afterLine });
    }
    const firstRow = rows[0];
    return {
      header: `@@ -${firstRow.beforeLine || "?"} +${firstRow.afterLine || "?"} @@`,
      rows,
    };
  });
}

// Render one side (before or after) as an HTML table for use as iframe srcdoc.
// `data-line` is set on rows that have a real line number on that side so the wrapper
// anchor router can resolve `data-line="N"` clicks via getElementById-style query.
function renderTextDiffSide(hunks, side) {
  const isBefore = side === "before";
  const out = [];
  out.push("<!doctype html><meta charset=\"utf-8\"><style>");
  out.push("body { margin: 0; font: 12px/1.4 ui-monospace, Menlo, Monaco, monospace; color: #1a1a1a; background: #fff; }");
  out.push("table { width: 100%; border-collapse: collapse; }");
  out.push("td { padding: 0 6px; vertical-align: top; }");
  out.push(".ln { user-select: none; color: #999; text-align: right; min-width: 44px; font-feature-settings: \"tnum\"; }");
  out.push(".hunk-header td { background: #eef; color: #557; padding: 4px 6px; font-weight: 600; font-family: ui-monospace, Menlo, monospace; }");
  out.push(".ctx { background: #fff; }");
  out.push(".rm  { background: #fde8e8; }");
  out.push(".add { background: #e6f6ec; }");
  out.push(".ph  { background: #fafafa; }");
  out.push(".txt { white-space: pre-wrap; word-break: break-all; font-family: inherit; }");
  out.push(".rm .txt::before  { content: \"−\"; color: #c00; margin-right: 4px; }");
  out.push(".add .txt::before { content: \"+\"; color: #0a7; margin-right: 4px; }");
  out.push(".ctx .txt::before { content: \" \"; margin-right: 4px; }");
  out.push("@media (prefers-color-scheme: dark) {");
  out.push("  body { color: #eaeaea; background: #1a1a1a; }");
  out.push("  .hunk-header td { background: #2a2a3a; color: #aac; }");
  out.push("  .ctx { background: #1a1a1a; }");
  out.push("  .rm  { background: #4a1a1a; }");
  out.push("  .add { background: #143a1f; }");
  out.push("  .ph  { background: #222; }");
  out.push("}");
  out.push("</style><table>");

  for (const hunk of hunks) {
    out.push(`<tr class="hunk-header"><td colspan="2">${escTextDiff(hunk.header)}</td></tr>`);
    for (const row of hunk.rows) {
      let cls, lineNum, showContent;
      if (row.side === "both") {
        cls = "ctx";
        lineNum = isBefore ? row.beforeLine : row.afterLine;
        showContent = true;
      } else if (row.side === "left") {
        cls = isBefore ? "rm" : "ph";
        lineNum = isBefore ? row.beforeLine : "";
        showContent = isBefore;
      } else {
        cls = isBefore ? "ph" : "add";
        lineNum = isBefore ? "" : row.afterLine;
        showContent = !isBefore;
      }
      const dataLine = (cls !== "ph") ? ` data-line="${lineNum}"` : "";
      const content = showContent ? escTextDiff(row.text) : "&nbsp;";
      out.push(`<tr class="${cls}"${dataLine}><td class="ln">${lineNum || "&nbsp;"}</td><td class="txt">${content}</td></tr>`);
    }
  }
  out.push("</table>");
  return out.join("");
}

// Fallback: dump raw text into a <pre> for files too large to diff.
function renderTextDiffPerfCap(text, label, totalKB) {
  const reason = `<p style="font-family:system-ui;padding:12px 20px;color:#888;background:#fafafa;margin:0;border-bottom:1px solid #eee">${escTextDiff(label)} · 檔案太大（${totalKB.toFixed(0)} KB &gt; ${TEXT_DIFF_PERF_CAP_BYTES / 1024} KB），未表格化</p>`;
  const body = `<pre style="margin:0;padding:12px 20px;font:12px/1.4 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-all">${escTextDiff(text)}</pre>`;
  return `<!doctype html><meta charset="utf-8"><body style="margin:0">${reason}${body}</body>`;
}

async function loadTextDiff(leftFrame, rightFrame, entry) {
  try {
    const [bRes, aRes] = await Promise.all([
      entry.before ? fetch(entry.before) : Promise.resolve(null),
      entry.after  ? fetch(entry.after)  : Promise.resolve(null),
    ]);
    const beforeText = (bRes && bRes.ok) ? await bRes.text() : "";
    const afterText  = (aRes && aRes.ok) ? await aRes.text()  : "";

    const totalBytes = beforeText.length + afterText.length;
    if (totalBytes > TEXT_DIFF_PERF_CAP_BYTES) {
      const kb = totalBytes / 1024;
      leftFrame.srcdoc  = renderTextDiffPerfCap(beforeText, "BEFORE", kb);
      rightFrame.srcdoc = renderTextDiffPerfCap(afterText,  "AFTER",  kb);
      leftFrame.dataset.perfCapped  = "1";
      rightFrame.dataset.perfCapped = "1";
      return;
    }

    const beforeLines = beforeText.split(/\r?\n/);
    const afterLines  = afterText.split(/\r?\n/);
    const diff = computeBrowserLineDiff(beforeLines, afterLines);
    const hunks = diffToHunks(diff, TEXT_DIFF_CONTEXT);

    leftFrame.srcdoc  = renderTextDiffSide(hunks, "before");
    rightFrame.srcdoc = renderTextDiffSide(hunks, "after");
    leftFrame.dataset.perfCapped  = "";
    rightFrame.dataset.perfCapped = "";
  } catch (e) {
    const msg = `<p style="font-family:system-ui;color:#c44;padding:20px">載入失敗：${escTextDiff(String(e))}</p>`;
    leftFrame.srcdoc = msg;
    rightFrame.srcdoc = msg;
  }
}
