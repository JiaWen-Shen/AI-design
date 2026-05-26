#!/usr/bin/env node
// compute-html-diff.js — Stage 3a of design-pr-review.
// For each design-surface file, extract changed line ranges from `git diff --no-index`
// and record nearest enclosing element selectors so the overlay can highlight them.
// No LLM. Pure file IO + regex.
//
// Usage:
//   node compute-html-diff.js --workspace /tmp/design-review-<N>
//
// Reads:
//   $WORKSPACE/before/<file>
//   $WORKSPACE/after/<file>
//   $WORKSPACE/files.json
//
// Writes:
//   $WORKSPACE/html-diff.json
//     { files: [{ path, kind, hunks: [{ before_range, after_range, selectors }] }] }

"use strict";

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function parseArgs() {
  const args = process.argv.slice(2);
  let workspace = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--workspace") workspace = args[++i];
  }
  if (!workspace) {
    console.error("ERROR: --workspace is required");
    process.exit(64);
  }
  return { workspace };
}

function safeDiff(beforePath, afterPath) {
  // Use git's word-diff porcelain format so the wrapper can highlight only the
  // diverging substring (not the whole line). The custom regex splits on common
  // separators so URL paths and identifiers fragment at meaningful boundaries.
  // Exit code 1 = differences found (expected), 0 = same, >1 = error.
  try {
    return execFileSync(
      "git",
      [
        "diff", "--no-index",
        "--word-diff=porcelain",
        "--word-diff-regex=[A-Za-z0-9_]+|[^[:space:]]",
        "--unified=0",
        "--", beforePath, afterPath,
      ],
      { encoding: "utf8" }
    );
  } catch (err) {
    if (err.status === 1) return err.stdout || "";
    throw err;
  }
}

function parseHunks(diffText) {
  // Porcelain word-diff body format (per `man git-diff`):
  //   ' <text>'  context segment (unchanged within the line)
  //   '-<text>'  removed segment
  //   '+<text>'  added segment
  //   '~'        end-of-line marker
  // We carry segments forward to the wrapper so it can rebuild the - and + lines
  // and highlight only the changed substrings.
  const hunks = [];
  const lines = diffText.split(/\r?\n/);
  const headRe = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
  let cur = null;
  for (const line of lines) {
    const m = headRe.exec(line);
    if (m) {
      if (cur) hunks.push(cur);
      const beforeStart = +m[1];
      const beforeCount = m[2] ? +m[2] : 1;
      const afterStart  = +m[3];
      const afterCount  = m[4] ? +m[4] : 1;
      cur = {
        before_range: [beforeStart, beforeStart + Math.max(0, beforeCount - 1)],
        after_range:  [afterStart,  afterStart  + Math.max(0, afterCount  - 1)],
        segments: [],
      };
      continue;
    }
    if (!cur) continue;
    if (line.startsWith("\\")) continue;            // "\ No newline at EOF"
    if (line === "~")           { cur.segments.push({ type: "eol" }); continue; }
    if (line.startsWith(" "))   { cur.segments.push({ type: "ctx", text: line.slice(1) }); continue; }
    if (line.startsWith("-"))   { cur.segments.push({ type: "del", text: line.slice(1) }); continue; }
    if (line.startsWith("+"))   { cur.segments.push({ type: "add", text: line.slice(1) }); continue; }
    // Anything else (file headers etc.) is ignored.
  }
  if (cur) hunks.push(cur);
  return hunks;
}

// For an MD file, find the nearest enclosing heading at or above `lineNum`.
// Returns an array with a single { level, text } (the deepest enclosing heading) so
// the panel doesn't list ancestor headings whose own lines weren't part of the diff.
// Empty if no heading found.
function findMdHeadings(afterText, lineNum) {
  const lines = afterText.split(/\r?\n/);
  const idx = Math.min(Math.max(lineNum - 1, 0), lines.length - 1);
  for (let i = idx; i >= 0; i--) {
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(lines[i] || "");
    if (!m) continue;
    return [{ level: m[1].length, text: m[2].trim() }];
  }
  return [];
}

// Find the nearest enclosing tag-with-id-or-class above the given line in the after file.
function findSelectors(afterText, lineNum) {
  const lines = afterText.split(/\r?\n/);
  const idx = Math.min(lineNum - 1, lines.length - 1);
  const seen = new Set();
  const results = [];

  // Walk upward up to 200 lines to find ancestors with id / class.
  const start = Math.max(0, idx - 200);
  for (let i = idx; i >= start; i--) {
    const line = lines[i] || "";
    // Match opening tags: <tag id="..." class="..."> or <tag class="...">
    const tagMatches = line.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g);
    for (const tm of tagMatches) {
      const tag = tm[1];
      if (/^(br|hr|img|input|link|meta)$/i.test(tag)) continue;
      const attrs = tm[2];
      const idAttr = /id="([^"]+)"/.exec(attrs);
      const classAttr = /class="([^"]+)"/.exec(attrs);
      if (idAttr) {
        const sel = `#${idAttr[1]}`;
        if (!seen.has(sel)) { seen.add(sel); results.push(sel); }
      } else if (classAttr) {
        const cls = classAttr[1].trim().split(/\s+/)[0];
        const sel = `${tag}.${cls}`;
        if (!seen.has(sel)) { seen.add(sel); results.push(sel); }
      }
      if (results.length >= 3) return results;
    }
  }
  return results;
}

function main() {
  const { workspace } = parseArgs();
  const filesIndexPath = path.join(workspace, "files.json");
  if (!fs.existsSync(filesIndexPath)) {
    console.error(`ERROR: ${filesIndexPath} not found; run fetch-pr.sh first`);
    process.exit(1);
  }
  const filesIndex = JSON.parse(fs.readFileSync(filesIndexPath, "utf8"));
  // fetch-pr.sh wraps the file list inside `.files`; tolerate either shape.
  const files = Array.isArray(filesIndex) ? filesIndex : (filesIndex.files || []);

  const out = { files: [] };
  for (const entry of files) {
    if (!["html", "md", "css", "svg"].includes(entry.kind)) continue;
    const beforePath = path.join(workspace, "before", entry.path);
    const afterPath  = path.join(workspace, "after",  entry.path);

    // Handle add/remove: if one side is missing, treat as whole-file change.
    let diffText = "";
    if (entry.base_ok && entry.head_ok) {
      diffText = safeDiff(beforePath, afterPath);
    } else if (entry.head_ok) {
      // Added file: synthesise a single hunk for the whole file.
      const lineCount = fs.readFileSync(afterPath, "utf8").split(/\r?\n/).length;
      out.files.push({
        path: entry.path,
        kind: entry.kind,
        change: "added",
        hunks: [{ before_range: [0, 0], after_range: [1, lineCount], selectors: [] }],
      });
      continue;
    } else if (entry.base_ok) {
      out.files.push({
        path: entry.path,
        kind: entry.kind,
        change: "removed",
        hunks: [],
      });
      continue;
    } else {
      continue;
    }

    const hunks = parseHunks(diffText);
    // Anchor extraction:
    //   HTML → nearest enclosing tag with id / class (DOM selectors)
    //   MD   → nearest enclosing heading (text + level)
    let afterText = "";
    if (entry.kind === "html" || entry.kind === "md") {
      afterText = fs.readFileSync(afterPath, "utf8");
    }
    const enriched = hunks.map(h => {
      let selectors = [];
      let mdHeadings = [];
      if (entry.kind === "html") {
        selectors = findSelectors(afterText, h.after_range[0]);
      } else if (entry.kind === "md") {
        mdHeadings = findMdHeadings(afterText, h.after_range[0]);
      }
      return { ...h, selectors, md_headings: mdHeadings };
    });

    out.files.push({
      path: entry.path,
      kind: entry.kind,
      change: "modified",
      hunks: enriched,
    });
  }

  const outPath = path.join(workspace, "html-diff.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  process.stdout.write(JSON.stringify({ written: outPath, file_count: out.files.length }));
}

main();
