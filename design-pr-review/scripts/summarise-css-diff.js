#!/usr/bin/env node
// summarise-css-diff.js — Stage 3a addition for CSS-heavy PRs.
// For each CSS file in workspace/files.json, parse the full before / after files
// into a selector-keyed rule map, then diff the maps to emit per-selector
// property changes. Handles multi-line rules, @media / @supports / @keyframes
// nesting, and comma-separated selector lists.
//
// Usage:
//   node summarise-css-diff.js --workspace /tmp/design-review-<N>
//
// Reads:
//   $WORKSPACE/files.json
//   $WORKSPACE/before/<path>
//   $WORKSPACE/after/<path>
//
// Writes:
//   $WORKSPACE/css-diff.json
//     { files: [{ path, change, hunks: [{ perSelector: [{selector, mediaContext, removed, added, changed, line}] }] }] }
//
// The output shape preserves a `hunks` array (one synthetic hunk per file) so
// existing consumers (make-compare-wrapper.js) keep working without changes.

"use strict";

const fs = require("node:fs");
const path = require("node:path");

function parseArgs() {
  const args = process.argv.slice(2);
  let workspace = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--workspace") workspace = args[++i];
  }
  if (!workspace) {
    console.error("ERROR: --workspace required");
    process.exit(64);
  }
  return { workspace };
}

// Tokenizer-style CSS parser. Returns a Map keyed by `<mediaContext> → <selector>`
// (or just `<selector>` at top level), where each entry is
// `{ selector, mediaContext, decls: {prop: value}, line }`.
//
// When the same selector appears multiple times in one file (which is legal
// and common), later declarations win — same as the browser's cascade for
// equal-specificity rules within a single sheet.
//
// Skips /* … */ comments anywhere. Tracks at-rule nesting (@media / @supports
// / @keyframes) via a context stack so a `.foo` inside @media gets a distinct
// key from the base `.foo`, preventing the diff from collapsing them.
function parseCss(text) {
  const rules = new Map();
  if (!text) return rules;
  const len = text.length;
  let i = 0;
  let line = 1;
  const contextStack = [];

  function skipWsAndComments() {
    while (i < len) {
      const c = text[i];
      if (c === " " || c === "\t" || c === "\r") {
        i++;
      } else if (c === "\n") {
        line++;
        i++;
      } else if (c === "/" && text[i + 1] === "*") {
        i += 2;
        while (i < len && !(text[i] === "*" && text[i + 1] === "/")) {
          if (text[i] === "\n") line++;
          i++;
        }
        i += 2; // consume */
      } else {
        break;
      }
    }
  }

  // Read characters up to one of the stop chars, respecting (...) nesting and
  // /* ... */ comments. Returns the collected string and leaves `i` on the stop char.
  function readUntil(stops) {
    let out = "";
    let parenDepth = 0;
    while (i < len) {
      const c = text[i];
      if (c === "/" && text[i + 1] === "*") {
        i += 2;
        while (i < len && !(text[i] === "*" && text[i + 1] === "/")) {
          if (text[i] === "\n") line++;
          i++;
        }
        i += 2;
        continue;
      }
      if (parenDepth === 0 && stops.includes(c)) break;
      if (c === "(") parenDepth++;
      else if (c === ")") parenDepth--;
      if (c === "\n") line++;
      out += c;
      i++;
    }
    return out;
  }

  while (i < len) {
    skipWsAndComments();
    if (i >= len) break;

    if (text[i] === "}") {
      contextStack.pop();
      i++;
      continue;
    }

    const headLine = line;
    const head = readUntil(["{", ";", "}"]).trim();

    if (i >= len) break;

    if (text[i] === ";") {
      // Statement-level at-rule like `@import "..."` or stray `;` — discard.
      i++;
      continue;
    }
    if (text[i] === "}") {
      // Malformed block end without an opening brace — bail to avoid infinite loop.
      i++;
      continue;
    }

    // text[i] === '{'
    i++; // consume {

    if (head.startsWith("@")) {
      // @media / @supports / @keyframes etc. — push context, body parsed at top level.
      contextStack.push(head);
      continue;
    }

    // Style rule. Parse declarations until matching '}'.
    const decls = {};
    while (i < len && text[i] !== "}") {
      skipWsAndComments();
      if (i >= len || text[i] === "}") break;

      const prop = readUntil([":", ";", "}"]).trim();
      if (i >= len || text[i] !== ":") {
        // Malformed declaration — recover by skipping to next ; or }.
        if (i < len && text[i] === ";") i++;
        continue;
      }
      i++; // consume :
      const value = readUntil([";", "}"]).trim();
      if (i < len && text[i] === ";") i++;
      if (prop) decls[prop] = value;
    }
    if (i < len && text[i] === "}") i++;

    const selectors = head.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean);
    const mediaContext = contextStack.join(" ");
    for (const sel of selectors) {
      const key = mediaContext ? `${mediaContext} → ${sel}` : sel;
      const existing = rules.get(key);
      if (existing) {
        // Later occurrence — merge / override declarations.
        Object.assign(existing.decls, decls);
      } else {
        rules.set(key, { selector: sel, mediaContext, decls: { ...decls }, line: headLine });
      }
    }
  }

  return rules;
}

// Diff two parsed-CSS maps. Emits one entry per selector-key that changed.
// Property-level: a key gone from before→after is `removed`; new in after is
// `added`; present on both sides with different values is `changed`.
function diffRules(beforeMap, afterMap) {
  const keys = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  const out = [];
  for (const key of keys) {
    const before = beforeMap.get(key);
    const after = afterMap.get(key);
    const bDecls = before ? before.decls : {};
    const aDecls = after ? after.decls : {};
    const removed = {};
    const added = {};
    const changed = {};
    for (const k of Object.keys(bDecls)) {
      if (!(k in aDecls)) removed[k] = bDecls[k];
      else if (aDecls[k] !== bDecls[k]) changed[k] = { from: bDecls[k], to: aDecls[k] };
    }
    for (const k of Object.keys(aDecls)) {
      if (!(k in bDecls)) added[k] = aDecls[k];
    }
    const hasChange =
      Object.keys(removed).length ||
      Object.keys(added).length ||
      Object.keys(changed).length;
    if (!hasChange) continue;
    const meta = after || before;
    // Prefer the after-side line for the anchor target. For fully-removed rules
    // (selector gone in after) fall back to before.line — jumpToLine searches
    // both iframes, so the click still flashes the source side correctly.
    const afterLine = after ? after.line : null;
    const beforeLine = before ? before.line : null;
    out.push({
      selector: meta.selector,
      mediaContext: meta.mediaContext,
      removed,
      added,
      changed,
      line: afterLine || beforeLine || null,
      lineBefore: beforeLine,
      lineAfter: afterLine,
    });
  }
  // Sort by after-side line so the panel reads top-to-bottom matching the file.
  out.sort((a, b) => {
    if (a.line == null && b.line == null) return 0;
    if (a.line == null) return 1;
    if (b.line == null) return -1;
    return a.line - b.line;
  });
  return out;
}

function buildSummaryLines(perSelector) {
  if (perSelector.length === 0) {
    return ["沒抓到 selector 級變更（可能只是格式調整或註解）"];
  }
  return perSelector.map((s) => {
    const parts = [];
    for (const k of Object.keys(s.removed)) parts.push(`-${k}: ${s.removed[k]}`);
    for (const k of Object.keys(s.added)) parts.push(`+${k}: ${s.added[k]}`);
    for (const k of Object.keys(s.changed)) parts.push(`${k}: ${s.changed[k].from} → ${s.changed[k].to}`);
    const label = s.mediaContext ? `${s.mediaContext} → ${s.selector}` : s.selector;
    return `${label} { ${parts.join("; ")} }`;
  });
}

function main() {
  const { workspace } = parseArgs();
  const filesIndexPath = path.join(workspace, "files.json");
  if (!fs.existsSync(filesIndexPath)) {
    console.error(`ERROR: ${filesIndexPath} not found; run fetch-pr.sh first`);
    process.exit(1);
  }
  const filesIndex = JSON.parse(fs.readFileSync(filesIndexPath, "utf8"));
  const files = Array.isArray(filesIndex) ? filesIndex : (filesIndex.files || []);

  const out = { files: [] };
  for (const entry of files) {
    if (entry.kind !== "css") continue;
    if (!entry.base_ok || !entry.head_ok) {
      // Whole-file add/remove — caller can render the entire file as the summary.
      out.files.push({
        path: entry.path,
        change: entry.head_ok ? "added" : "removed",
        hunks: [],
      });
      continue;
    }
    const beforePath = path.join(workspace, "before", entry.path);
    const afterPath = path.join(workspace, "after", entry.path);
    let beforeText = "", afterText = "";
    try { beforeText = fs.readFileSync(beforePath, "utf8"); } catch {}
    try { afterText = fs.readFileSync(afterPath, "utf8"); } catch {}

    const beforeMap = parseCss(beforeText);
    const afterMap = parseCss(afterText);
    const perSelector = diffRules(beforeMap, afterMap);
    const summary = buildSummaryLines(perSelector);

    // Synthetic single-hunk envelope keeps the output shape compatible with the
    // hunk-iterating consumers in make-compare-wrapper.js.
    out.files.push({
      path: entry.path,
      change: "modified",
      hunks: perSelector.length ? [{ header: "@@ whole-file diff @@", summary, perSelector }] : [],
    });
  }

  const outPath = path.join(workspace, "css-diff.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  process.stdout.write(JSON.stringify({ written: outPath, file_count: out.files.length }));
}

main();
