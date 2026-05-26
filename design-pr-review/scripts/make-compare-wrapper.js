#!/usr/bin/env node
// make-compare-wrapper.js — Stage 3a of design-pr-review.
// Generate a side-by-side comparison HTML for one cluster of design files.
// No LLM. Pure file IO + templating.
//
// Usage:
//   node make-compare-wrapper.js --workspace /tmp/design-review-<N> \
//     --cluster <name> --files "<relpath1>,<relpath2>,..."
//
// Reads:
//   $WORKSPACE/before/<path>
//   $WORKSPACE/after/<path>
//   $WORKSPACE/html-diff.json
//   $WORKSPACE/violations.json   (optional — from auto-detect-violations.sh)
//
// Writes:
//   $WORKSPACE/compare-<cluster>.html

"use strict";

const fs = require("node:fs");
const path = require("node:path");

function parseArgs() {
  const args = process.argv.slice(2);
  let workspace = "", cluster = "", filesArg = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--workspace") workspace = args[++i];
    else if (args[i] === "--cluster") cluster = args[++i];
    else if (args[i] === "--files") filesArg = args[++i];
  }
  if (!workspace || !cluster || !filesArg) {
    console.error("ERROR: --workspace, --cluster, --files all required");
    process.exit(64);
  }
  return { workspace, cluster, files: filesArg.split(",").map(s => s.trim()).filter(Boolean) };
}

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { return fallback; }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function fileExists(p) { try { fs.statSync(p); return true; } catch { return false; } }

function main() {
  const { workspace, cluster, files: filesRaw } = parseArgs();
  // Drop cluster entries that don't exist on EITHER side — caller's path was wrong (typo,
  // renamed file, or stale cluster list). Without this guard the wrapper renders the file
  // as "modified" with both panes falling through to the empty placeholder, which prints
  // "新檔案" + "已刪除" simultaneously — semantically nonsense and confusing to designers.
  const files = filesRaw.filter(f => {
    const ok = fileExists(path.join(workspace, "before", f))
            || fileExists(path.join(workspace, "after", f));
    if (!ok) console.error(`[make-compare-wrapper] dropping missing file: ${f}`);
    return ok;
  });
  if (files.length === 0) {
    console.error("ERROR: no cluster files exist in before/ or after/");
    process.exit(1);
  }
  const htmlDiff = loadJson(path.join(workspace, "html-diff.json"), { files: [] });
  const violations = loadJson(path.join(workspace, "violations.json"), []);
  const cssDiff = loadJson(path.join(workspace, "css-diff.json"), { files: [] });
  // pr-meta.json carries PR number, title, author, url — surfaced in the header badge.
  const prMeta = loadJson(path.join(workspace, "pr-meta.json"), {});
  // touches.json (from scan-conflicts.sh) — flat [{sha, login, path, msg}] of every
  // commit-touches-file pair. Group by path so each toc-card can show "ⓒ N commits".
  const touches = loadJson(path.join(workspace, "touches.json"), []);
  const touchesByPath = new Map();
  for (const t of (Array.isArray(touches) ? touches : [])) {
    if (!t || !t.path) continue;
    const arr = touchesByPath.get(t.path) || [];
    if (!arr.some(x => x.sha === t.sha)) arr.push(t);
    touchesByPath.set(t.path, arr);
  }
  // files.json knows direct vs augmented (consumers of changed CSS/JS)
  const filesIndex = loadJson(path.join(workspace, "files.json"), []);
  const filesIndexArr = Array.isArray(filesIndex) ? filesIndex : (filesIndex.files || []);
  const fileMeta = new Map(filesIndexArr.map(f => [f.path, f]));
  const diffIndex = new Map(htmlDiff.files.map(f => [f.path, f]));
  const cssDiffIndex = new Map(cssDiff.files.map(f => [f.path, f]));
  const violIndex = new Map();
  for (const v of violations) {
    if (!violIndex.has(v.file)) violIndex.set(v.file, []);
    violIndex.get(v.file).push(v);
  }

  // Build per-file jump entries.
  // HTML files contribute DOM selectors; MD files contribute heading anchors with
  // {level, text} from compute-html-diff's md_headings field.
  const jumpEntries = [];
  for (const f of files) {
    const d = diffIndex.get(f);
    if (!d) {
      jumpEntries.push({ file: f, label: f, selectors: [], mdHeadings: [] });
      continue;
    }
    const selectors = [...new Set(d.hunks.flatMap(h => h.selectors || []))];
    // Deduplicate MD headings by text — multiple hunks may share an enclosing section.
    // Each heading carries one segment list per hunk so the panel can render git's
    // word-diff porcelain segments with precise inline highlights.
    const headingMap = new Map();
    for (const h of d.hunks) {
      for (const heading of (h.md_headings || [])) {
        const key = heading.level + ":" + heading.text;
        let entry = headingMap.get(key);
        if (!entry) {
          entry = { level: heading.level, text: heading.text, hunkSegments: [] };
          headingMap.set(key, entry);
        }
        if (h.segments && h.segments.length) entry.hunkSegments.push(h.segments);
      }
    }
    const mdHeadings = [...headingMap.values()];
    jumpEntries.push({ file: f, label: f, selectors, mdHeadings, change: d.change });
  }

  // The wrapper renders one file at a time (first non-augmented by default).
  const primary = files.find(f => {
    const m = fileMeta.get(f);
    return !m || !m.augmented;
  }) || files[0];

  // --- TOC drawer card rendering ---
  const iconFor = (file) => {
    if (/\.(html|htm)$/i.test(file)) return '📄';
    if (/\.(md|markdown)$/i.test(file)) return '📝';
    if (/\.css$/i.test(file)) return '🎨';
    if (/\.(js|mjs|cjs|json)$/i.test(file)) return '📜';
    if (/\.svg$/i.test(file)) return '🖼';
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(file)) return '🖼';
    return '📦';
  };
  const pathTail = (file) => {
    const parts = file.split('/');
    if (parts.length <= 2) return file;
    return '…/' + parts.slice(-2).join('/');
  };
  const modeFor = (file) => {
    if (/\.(html|htm)$/i.test(file)) return 'visual';
    if (/\.(md|markdown)$/i.test(file)) return 'md';
    if (/\.svg$/i.test(file)) return 'svg';
    return 'textDiff';
  };
  // Compute, for an augmented HTML consumer, which selectors from the upstream changed CSS
  // actually appear (as class/id usage) in this HTML. That intersection is the *real* set
  // of CSS-driven visual changes affecting this file — useful to surface so the designer
  // knows where to look even though the HTML markup itself wasn't touched.
  function selectorsUsedByAugmented(file) {
    const meta = fileMeta.get(file);
    if (!meta || !meta.augmented || !meta.augmented_via) return [];
    const cssEntry = cssDiffIndex.get(meta.augmented_via);
    if (!cssEntry || !cssEntry.hunks) return [];
    const candidates = new Set();
    for (const h of cssEntry.hunks) {
      for (const s of (h.perSelector || [])) {
        if (s.selector) candidates.add(s.selector);
      }
    }
    if (candidates.size === 0) return [];
    const afterPath = path.join(workspace, "after", file);
    let html = "";
    try { html = fs.readFileSync(afterPath, "utf8"); } catch { return []; }
    const used = [];
    for (const sel of candidates) {
      // Cheap heuristic: extract class / id tokens from the selector and check presence.
      // Sufficient for the common case (.foo, #bar, .foo .bar). Complex selectors fall
      // back to substring match which is permissive but acceptable as an "is this
      // selector relevant?" signal.
      const tokens = sel.match(/[.#][A-Za-z_][\w-]*/g) || [];
      let hit = false;
      if (tokens.length) {
        hit = tokens.every(tok => {
          const name = tok.slice(1);
          if (tok.startsWith('.')) {
            return new RegExp(`class\\s*=\\s*"[^"]*\\b${name}\\b`).test(html);
          }
          return new RegExp(`id\\s*=\\s*"${name}"`).test(html);
        });
      } else {
        // Tag-only or complex selector — substring lookup
        hit = html.includes(sel);
      }
      if (hit) used.push(sel);
    }
    return used;
  }

  const summaryFor = (f) => {
    if (/\.(md|markdown)$/i.test(f.file)) {
      const headings = f.mdHeadings ? f.mdHeadings.length : 0;
      const hunks = (diffIndex.get(f.file) || {}).hunks || [];
      return `md · ${headings} headings · ${hunks.length} hunks`;
    }
    if (/\.css$/i.test(f.file)) {
      const css = cssDiffIndex.get(f.file);
      const selCount = (css && css.hunks)
        ? css.hunks.reduce((acc, h) => acc + (h.perSelector || []).length, 0)
        : 0;
      return `textDiff · ${selCount} selectors`;
    }
    if (/\.(html|htm)$/i.test(f.file)) {
      const meta = fileMeta.get(f.file) || {};
      if (meta.augmented) {
        // HTML markup unchanged — visual delta is purely CSS-driven. Label clearly +
        // count how many of the changed CSS selectors actually apply to this file.
        const usedCount = selectorsUsedByAugmented(f.file).length;
        return usedCount > 0
          ? `CSS-only · ${usedCount} selector${usedCount === 1 ? '' : 's'} used here`
          : `CSS-only · via ${pathTail(meta.augmented_via || '')}`;
      }
      const selCount = f.selectors ? f.selectors.length : 0;
      return `visual · ${selCount} changed regions`;
    }
    if (/\.svg$/i.test(f.file)) return 'svg · modified';
    const hunks = (diffIndex.get(f.file) || {}).hunks || [];
    return `textDiff · ${hunks.length} hunks`;
  };

  // Detailed multi-line summary for the TOC card's hover tooltip.
  // Browsers render `\n` in the `title` attribute as line breaks in native tooltips.
  function tooltipFor(entry) {
    const lines = [entry.file];
    const meta = fileMeta.get(entry.file) || {};
    if (meta.augmented) lines.push(`↳ consumer of ${meta.augmented_via}`);
    const d = diffIndex.get(entry.file);
    if (/\.(md|markdown)$/i.test(entry.file)) {
      if (entry.mdHeadings && entry.mdHeadings.length) {
        lines.push('Headings:');
        for (const h of entry.mdHeadings.slice(0, 8)) {
          lines.push('  ' + '#'.repeat(h.level) + ' ' + h.text);
        }
        if (entry.mdHeadings.length > 8) lines.push(`  …+${entry.mdHeadings.length - 8} more`);
      }
    } else if (/\.css$/i.test(entry.file)) {
      const css = cssDiffIndex.get(entry.file);
      if (css && css.hunks) {
        const items = [];
        for (const h of css.hunks) {
          for (const s of h.perSelector || []) {
            const parts = [];
            for (const k of Object.keys(s.removed || {})) parts.push(`-${k}`);
            for (const k of Object.keys(s.added || {})) parts.push(`+${k}`);
            for (const k of Object.keys(s.changed || {})) parts.push(`${k}: → …`);
            items.push(`  ${s.selector} { ${parts.join(', ')} }`);
          }
        }
        if (items.length) {
          lines.push('Selector changes:');
          for (const it of items.slice(0, 8)) lines.push(it);
          if (items.length > 8) lines.push(`  …+${items.length - 8} more`);
        }
      }
    } else if (/\.(html|htm)$/i.test(entry.file)) {
      if (entry.selectors && entry.selectors.length) {
        lines.push('Changed selectors:');
        for (const s of entry.selectors.slice(0, 8)) lines.push('  ' + s);
        if (entry.selectors.length > 8) lines.push(`  …+${entry.selectors.length - 8} more`);
      } else if (d && d.hunks) {
        lines.push(`${d.hunks.length} hunks changed`);
      }
    } else if (d && d.hunks) {
      lines.push(`${d.hunks.length} hunks changed`);
    }
    return lines.join('\n');
  }

  // Build HTML detail block for the popup dialog. Natural-language Chinese prose so the
  // designer reads it like a paragraph (not a stat table). Falls back to bullet list only
  // when the data is genuinely list-shaped (e.g. > 5 selectors / headings).
  function detailHtmlFor(entry) {
    const meta = fileMeta.get(entry.file) || {};
    const d = diffIndex.get(entry.file);
    const out = [];
    out.push(`<header><strong>${escapeHtml(entry.file)}</strong></header>`);

    // Lead sentence: type + change scope
    if (meta.augmented) {
      out.push(`<p>這個檔案沒有在 PR 中直接被改，但因為它載入了 <code>${escapeHtml(pathTail(meta.augmented_via || ''))}</code>，CSS 改動會影響它的視覺呈現。建議在 BEFORE/AFTER 看實際 render 差別。</p>`);
    }

    if (/\.(md|markdown)$/i.test(entry.file)) {
      const headings = entry.mdHeadings || [];
      const hunkCount = d && d.hunks ? d.hunks.length : 0;
      if (headings.length === 0 && hunkCount === 0) {
        out.push(`<p>沒有抓到具體變更段落（可能是空 commit 或 metadata-only 改動）。</p>`);
      } else if (headings.length === 0) {
        out.push(`<p>spec 文件有 <strong>${hunkCount}</strong> 處改動，但沒抓到所屬的 heading section（改動可能落在 heading 之外的段落）。</p>`);
      } else {
        const list = headings.length <= 3
          ? headings.map(h => `<code>${escapeHtml('#'.repeat(h.level) + ' ' + h.text)}</code>`).join('、')
          : null;
        if (list) {
          out.push(`<p>spec 文件動到 ${list} ${headings.length > 1 ? '這 ' + headings.length + ' 個 section' : '這個 section'}（共 ${hunkCount} 處 hunks）。</p>`);
        } else {
          out.push(`<p>spec 文件動到以下 ${headings.length} 個 sections（共 ${hunkCount} 處 hunks）：</p>`);
          out.push('<ul>' + headings.map(h => `<li><code>${escapeHtml('#'.repeat(h.level))}</code> ${escapeHtml(h.text)}</li>`).join('') + '</ul>');
        }
      }
    } else if (/\.css$/i.test(entry.file)) {
      const css = cssDiffIndex.get(entry.file);
      const allChanges = [];
      if (css && css.hunks) {
        for (const h of css.hunks) {
          for (const s of h.perSelector || []) {
            allChanges.push(s);
          }
        }
      }
      // Summarize the property changes across all selectors into a one-line verb chunk.
      // e.g. "移除 padding × 2"
      const verbCount = {};
      for (const s of allChanges) {
        for (const k of Object.keys(s.removed || {})) verbCount['移除 `' + k + '`'] = (verbCount['移除 `' + k + '`'] || 0) + 1;
        for (const k of Object.keys(s.added || {})) verbCount['新增 `' + k + '`'] = (verbCount['新增 `' + k + '`'] || 0) + 1;
        for (const k of Object.keys(s.changed || {})) verbCount['調整 `' + k + '`'] = (verbCount['調整 `' + k + '`'] || 0) + 1;
      }
      const verbs = Object.keys(verbCount).map(v => verbCount[v] > 1 ? `${v} × ${verbCount[v]}` : v);
      if (allChanges.length === 0) {
        out.push(`<p>這個 CSS 檔有改動但沒抓到 selector 級的屬性變化（可能只是格式調整或註解）。</p>`);
      } else {
        const selList = allChanges.length <= 3
          ? allChanges.map(s => `<code>${escapeHtml(s.selector)}</code>`).join('、')
          : null;
        if (selList) {
          out.push(`<p>這個 CSS 改動了 ${selList} 共 <strong>${allChanges.length}</strong> 個 selector，主要是 ${verbs.join('、')}。</p>`);
        } else {
          out.push(`<p>這個 CSS 改動了 <strong>${allChanges.length}</strong> 個 selector，主要是 ${verbs.join('、')}。詳細列表如下：</p>`);
          out.push('<ul>' + allChanges.map(s => {
            const parts = [];
            for (const k of Object.keys(s.removed || {})) parts.push(`<span class="css-rm">−${escapeHtml(k)}</span>`);
            for (const k of Object.keys(s.added || {})) parts.push(`<span class="css-add">+${escapeHtml(k)}</span>`);
            for (const k of Object.keys(s.changed || {})) parts.push(`<span class="css-chg">${escapeHtml(k)}: → …</span>`);
            const lineLabel = s.line ? ` <small class="muted">L${s.line}</small>` : '';
            return `<li><code>${escapeHtml(s.selector)}</code>${lineLabel} — ${parts.join(' · ')}</li>`;
          }).join('') + '</ul>');
        }
      }
    } else if (/\.(html|htm)$/i.test(entry.file)) {
      const sels = entry.selectors || [];
      const hunkCount = d && d.hunks ? d.hunks.length : 0;
      if (meta.augmented) {
        // Augmented HTML — already explained in lead sentence; just point at viewing tip.
        out.push(`<p class="muted">沒有直接抓到變更區域（這個檔本身沒被 PR 改）。重點是看左右 iframe 的視覺差。</p>`);
      } else if (sels.length === 0 && hunkCount === 0) {
        out.push(`<p>沒抓到具體變更區域。</p>`);
      } else if (sels.length === 0) {
        out.push(`<p>HTML 有 <strong>${hunkCount}</strong> 處改動，但沒抓到對應的 DOM selector（可能改在裸文字或屬性上）。</p>`);
      } else {
        const selList = sels.length <= 3
          ? sels.map(s => `<code>${escapeHtml(s)}</code>`).join('、')
          : null;
        if (selList) {
          out.push(`<p>HTML 動到 ${selList} ${sels.length > 1 ? '這 ' + sels.length + ' 個區域' : '這個區域'}（共 ${hunkCount} 處 hunks）。</p>`);
        } else {
          out.push(`<p>HTML 動到以下 ${sels.length} 個區域（共 ${hunkCount} 處 hunks）：</p>`);
          out.push('<ul>' + sels.map(s => `<li><code>${escapeHtml(s)}</code></li>`).join('') + '</ul>');
        }
      }
    } else if (/\.svg$/i.test(entry.file)) {
      out.push(`<p>這個 SVG 有改動。直接看左右 iframe 的視覺對照。</p>`);
    } else if (d && d.hunks) {
      out.push(`<p>有 <strong>${d.hunks.length}</strong> 處改動（${escapeHtml(entry.file.split('.').pop())} 檔，會在右側用 textDiff 顯示）。</p>`);
    } else {
      out.push(`<p class="muted">沒有額外摘要可顯示。</p>`);
    }
    return out.join('');
  }

  // Stable element id for a file's expandable commit list. The chip references this
  // via data-target so the JS toggle can find it without DOM walking.
  function fileSlug(file) {
    return 'cdet-' + file.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  }
  // PR repo for building per-commit GitHub URLs. Derived from prMeta.url which is
  // "https://github.com/<owner>/<repo>/pull/<n>". Null when running on a non-PR fixture.
  const repoFullName = (() => {
    const m = (prMeta && prMeta.url || "").match(/github\.com\/([^/]+\/[^/]+)\/pull/);
    return m ? m[1] : null;
  })();
  function commitsDetailHtml(entry) {
    const fileTouches = touchesByPath.get(entry.file) || [];
    if (!fileTouches.length) return '';
    const items = fileTouches.map(t => {
      const sha7 = (t.sha || '').slice(0, 7);
      const shaLabel = repoFullName && t.sha
        ? `<a class="sha" href="https://github.com/${escapeHtml(repoFullName)}/commit/${escapeHtml(t.sha)}" target="_blank" rel="noopener">${escapeHtml(sha7)}</a>`
        : `<span class="sha">${escapeHtml(sha7)}</span>`;
      return `<li>${shaLabel}<span class="login">${escapeHtml(t.login || '?')}</span><span class="msg">${escapeHtml(t.msg || '')}</span></li>`;
    }).join('');
    return `<div class="commits-detail" id="${escapeHtml(fileSlug(entry.file))}" hidden><ul>${items}</ul></div>`;
  }

  function tocCard(entry) {
    const meta = fileMeta.get(entry.file) || {};
    const change = entry.change || meta.change || (meta.augmented ? 'augmented' : 'modified');
    const via = meta.augmented ? ` <span class="chip augmented">↳ via ${escapeHtml(pathTail(meta.augmented_via || '?'))}</span>` : '';
    // ⓒ chip: click to expand the commit list below the card. Tooltip retains the
    // compact "sha · msg — sha · msg" summary for quick hover-scan.
    const fileTouches = touchesByPath.get(entry.file) || [];
    const commitChip = fileTouches.length
      ? `<span class="commit-chip" data-toggle="commits" data-target="${escapeHtml(fileSlug(entry.file))}" title="${escapeHtml(fileTouches.map(t => (t.sha || '').slice(0,7) + ' · ' + (t.msg || '')).join(' — '))}" role="button" tabindex="0">ⓒ ${fileTouches.length} commit${fileTouches.length > 1 ? 's' : ''}</span>`
      : '';
    // ⓘ button is a SIBLING (not nested) so a real <button> inside <button> isn't created.
    // commits-detail is also rendered as a sibling AFTER toc-item so its <ul> isn't nested
    // inside the toc-card button (which would be invalid HTML).
    return `<div class="toc-item">
      <button class="toc-card" data-file="${escapeHtml(entry.file)}">
        <div><span class="toc-icon">${iconFor(entry.file)}</span><span class="toc-path">${escapeHtml(pathTail(entry.file))}</span></div>
        <div class="toc-meta"><span class="chip ${escapeHtml(change)}">${escapeHtml(change)}</span><span>${escapeHtml(summaryFor(entry))}</span>${commitChip}${via}</div>
      </button>
      <button class="card-info" data-info-for="${escapeHtml(entry.file)}" aria-label="Details" title="See details">ⓘ</button>
    </div>${commitsDetailHtml(entry)}`;
  }

  // Split entries: direct (PR-changed) vs augmented (consumers of changed CSS/JS).
  // Augmented entries grouped by `augmented_via` inside collapsible <details>.
  const directEntries = [];
  const augmentedByVia = new Map();
  for (const j of jumpEntries) {
    const meta = fileMeta.get(j.file) || {};
    if (meta.augmented) {
      const via = meta.augmented_via || 'unknown';
      if (!augmentedByVia.has(via)) augmentedByVia.set(via, []);
      augmentedByVia.get(via).push(j);
    } else {
      directEntries.push(j);
    }
  }

  const tocMarkup = [
    '<div class="drawer-group-title">Direct (' + directEntries.length + ')</div>',
    directEntries.map(tocCard).join(''),
    ...[...augmentedByVia.entries()].map(([via, entries]) => `
      <details class="augmented-group">
        <summary>Consumers of ${escapeHtml(pathTail(via))} (${entries.length})</summary>
        ${entries.map(tocCard).join('')}
      </details>`)
  ].join('');

  const isMdPath = (p) => /\.md$/i.test(p);
  const isCssPath = (p) => /\.css$/i.test(p);

  // Group HTML selectors by class/id prefix (first hyphen-segment).
  // Selectors like ".sidebar-family-icon-wrap" / "#sidebar-search-results" cluster
  // under "sidebar"; ".ep-card" / ".ep-card-icon" cluster under "ep". This mirrors
  // the typical mockup convention where related UI lives under a common prefix,
  // making it visually obvious which container a selector belongs to.
  function getSelectorPrefix(sel) {
    // Strip leading tag, leave .class or #id; pull first hyphen segment.
    const stripped = sel.replace(/^[a-z][a-z0-9-]*/i, '');
    const m = /^[.#]([a-z][a-z0-9]+)[-_]/i.exec(stripped);
    return m ? m[1].toLowerCase() : null;
  }

  // Build the "💬 ask Claude" button. Click copies a context-rich prompt to the
  // clipboard so the designer can paste back to chat without manually describing
  // file/line/selector. Designed for on-demand use — only points the designer is
  // genuinely confused about — so per-row clutter is kept minimal (low-opacity
  // icon that brightens on hover).
  function askBtn(ctx) {
    const payload = escapeHtml(JSON.stringify(ctx));
    return `<button class="ask-claude" data-ctx="${payload}" title="複製這個位置的 context — 貼到 chat 問 agent 或貼到 PR comment 都可以">📋</button>`;
  }

  function renderHtmlSelectors(selectors, parentFile) {
    const groups = new Map(); // prefix → selectors[]
    const singletons = [];
    for (const sel of selectors) {
      const prefix = getSelectorPrefix(sel);
      if (!prefix) { singletons.push(sel); continue; }
      if (!groups.has(prefix)) groups.set(prefix, []);
      groups.get(prefix).push(sel);
    }
    // Promote groups with only 1 selector to singletons (no group ceremony).
    for (const [prefix, items] of [...groups.entries()]) {
      if (items.length === 1) { singletons.push(items[0]); groups.delete(prefix); }
    }
    const btn = (s) => `<button class="anchor" data-selector="${escapeHtml(s)}"><code>${escapeHtml(s)}</code></button>${askBtn({file: parentFile, selector: s})}`;
    const out = [];
    // Render named groups first (open by default).
    for (const [prefix, items] of groups) {
      // data-group-selectors carries the JSON list so the click handler can flash all at once.
      const groupPayload = escapeHtml(JSON.stringify(items));
      out.push(`<li class="sel-group"><details open>
        <summary>
          <strong>${escapeHtml(prefix)}</strong> · ${items.length} selectors
          <button class="anchor-group" data-group-selectors="${groupPayload}" title="一次打開容器並 flash 群組內所有 selector">👁</button>
        </summary>
        <ul>${items.map(s => `<li>${btn(s)}</li>`).join('')}</ul>
      </details></li>`);
    }
    // Then singletons (loose, no group wrapping).
    for (const s of singletons) {
      out.push(`<li>${btn(s)}</li>`);
    }
    return out.join('');
  }

  // Render the per-selector CSS diff summary built by summarise-css-diff.js.
  function renderCssSummary(file) {
    const entry = cssDiffIndex.get(file);
    if (!entry || !entry.hunks || !entry.hunks.length) return "";
    const items = [];
    for (const h of entry.hunks) {
      for (const s of h.perSelector || []) {
        const parts = [];
        for (const k of Object.keys(s.removed || {})) {
          parts.push(`<span class="css-rm">−${escapeHtml(k)}: ${escapeHtml(s.removed[k])}</span>`);
        }
        for (const k of Object.keys(s.added || {})) {
          parts.push(`<span class="css-add">+${escapeHtml(k)}: ${escapeHtml(s.added[k])}</span>`);
        }
        for (const k of Object.keys(s.changed || {})) {
          parts.push(`<span class="css-chg">${escapeHtml(k)}: ${escapeHtml(s.changed[k].from)} → ${escapeHtml(s.changed[k].to)}</span>`);
        }
        // line is from summarise-css-diff.js (post-change CSS parser); wrap in an
        // anchor button so clicking jumps the textDiff iframe to that line.
        const lineAttr = s.line ? ` data-line="${s.line}"` : "";
        const lineLabel = s.line ? ` <small class="lineno">L${s.line}</small>` : "";
        const ask = askBtn({ file, line: s.line || null, selector: s.selector, mediaContext: s.mediaContext || null });
        items.push(`<li><button class="anchor"${lineAttr} title="跳到 line ${s.line || '?'}"><code>${escapeHtml(s.selector)}</code>${lineLabel}<br>${parts.join("<br>")}</button>${ask}</li>`);
      }
    }
    if (!items.length) return "";
    return `<h4>CSS 變更摘要（per selector）</h4><ul class="css-summary">${items.join("")}</ul>`;
  }

  // Render a hunk's git word-diff porcelain segments. Walk segments, accumulating
  // each logical line's del-side / add-side, and emit -/+ rows with inline <mark>
  // wrapping only the changed substrings. `eol` segments flush a logical line.
  function renderHunkBody(segments) {
    const out = [];
    let del = [], add = [], hasDel = false, hasAdd = false;

    function flush() {
      const emitDel = hasDel || del.some(s => s.type === "del");
      const emitAdd = hasAdd || add.some(s => s.type === "add");
      if (emitDel) {
        const html = del.map(s =>
          s.type === "del"
            ? `<mark class="diff-del-mark">${escapeHtml(s.text)}</mark>`
            : escapeHtml(s.text)
        ).join("");
        out.push(`<span class="diff-del">-${html}</span>`);
      }
      if (emitAdd) {
        const html = add.map(s =>
          s.type === "add"
            ? `<mark class="diff-add-mark">${escapeHtml(s.text)}</mark>`
            : escapeHtml(s.text)
        ).join("");
        out.push(`<span class="diff-add">+${html}</span>`);
      }
      del = []; add = []; hasDel = false; hasAdd = false;
    }

    for (const seg of segments) {
      if (seg.type === "eol") { flush(); continue; }
      if (seg.type === "ctx") { del.push(seg); add.push(seg); continue; }
      if (seg.type === "del") { del.push(seg); hasDel = true; continue; }
      if (seg.type === "add") { add.push(seg); hasAdd = true; continue; }
    }
    flush();
    return out.join("\n");
  }

  const sidePanel = jumpEntries.map(j => {
    let sels;
    if (isMdPath(j.file)) {
      // MD: show heading anchors (level + text). data-md-heading carries raw text; the
      // wrapper click handler slugifies it to match the id renderMd() assigned.
      sels = j.mdHeadings && j.mdHeadings.length
        ? j.mdHeadings.map(h => {
            const prefix = "#".repeat(h.level);
            const btn = `<button class="anchor" data-md-heading="${escapeHtml(h.text)}" title="跳到 ${escapeHtml(prefix + ' ' + h.text)}"><code>${escapeHtml(prefix)} ${escapeHtml(h.text)}</code></button>`;
            const ask = askBtn({ file: j.file, mdHeading: h.text });
            // Raw diff snippet — collapsed by default. git porcelain word-diff segments
            // give us substring-level changed regions to highlight inline.
            let diffHtml = "";
            if (h.hunkSegments && h.hunkSegments.length) {
              const rendered = h.hunkSegments.map(renderHunkBody).join("\n");
              diffHtml = `<details class="diff-snippet"><summary>看 diff（${h.hunkSegments.length} hunk${h.hunkSegments.length > 1 ? 's' : ''}）</summary><pre>${rendered}</pre></details>`;
            }
            return `<li>${btn}${ask}${diffHtml}</li>`;
          }).join("")
        : "<li><em>無 heading — 看整檔</em></li>";
    } else if (isCssPath(j.file)) {
      sels = "<li><em>CSS only — 看右側摘要</em></li>";
    } else {
      const meta = fileMeta.get(j.file) || {};
      if (meta.augmented && !j.selectors.length) {
        // HTML markup unchanged — visual delta is CSS-driven via meta.augmented_via.
        // Surface the intersection (changed CSS selectors that this HTML actually uses)
        // so the designer knows WHERE in this screen the visual change shows up.
        const usedSels = selectorsUsedByAugmented(j.file);
        if (usedSels.length) {
          sels = renderHtmlSelectors(usedSels, j.file);
        } else {
          const via = escapeHtml(pathTail(meta.augmented_via || ''));
          sels = `<li><em>CSS-only · via ${via} — 沒有 selector 命中本檔，看整體 render 差別</em></li>`;
        }
      } else {
        sels = j.selectors.length
          ? renderHtmlSelectors(j.selectors, j.file)
          : "<li><em>無 selector — 看整檔</em></li>";
      }
    }
    const cssSummary = isCssPath(j.file) ? renderCssSummary(j.file) : "";
    const viols = (violIndex.get(j.file) || []);
    let violList = "";
    if (viols.length) {
      // Group violations by type — so 189 inline-styles don't visually drown a single
      // off-token color. Each type renders as a <details> block whose <summary> shows
      // count; collapsed by default when the group has >5 entries to keep the panel
      // scannable.
      const byType = new Map();
      for (const v of viols) {
        if (!byType.has(v.type)) byType.set(v.type, []);
        byType.get(v.type).push(v);
      }
      const renderItem = (v) => {
        const m = (v.snippet || "").match(/(?:id|class)="([^"\s]+)/);
        const sel = m ? (m[0].startsWith('id=') ? `#${m[1]}` : `.${m[1].split(/\s+/)[0]}`) : "";
        const btn = sel
          ? `<button class="anchor" data-selector="${escapeHtml(sel)}" title="跳到 ${escapeHtml(sel)}">📍</button> `
          : "";
        const selPrefix = sel ? `<code class="anchor-sel">${escapeHtml(sel)}</code> ` : "";
        const ask = askBtn({ file: j.file, line: v.line, selector: sel || null, type: v.type, actual: v.actual, snippet: v.snippet });
        const sev = v.severity || "nit";
        const sevBadge = `<span class="sev sev-${escapeHtml(sev)}" title="severity: ${escapeHtml(sev)}">${escapeHtml(sev)}</span>`;
        return `<li data-sev="${escapeHtml(sev)}">${sevBadge} ${btn}${selPrefix}<strong>${escapeHtml(v.type)}</strong> · line ${v.line} · <code>${escapeHtml(v.actual)}</code> ${ask}<br><small>${escapeHtml(v.snippet)}</small></li>`;
      };
      // Sort groups: block > warn > nit so the most actionable bucket lands at the top.
      const sevOrder = { block: 0, warn: 1, nit: 2 };
      const sortedGroups = [...byType.entries()].sort((a, b) => {
        const sa = sevOrder[(a[1][0] && a[1][0].severity) || "nit"] ?? 9;
        const sb = sevOrder[(b[1][0] && b[1][0].severity) || "nit"] ?? 9;
        return sa - sb;
      });
      const groupsHtml = sortedGroups.map(([type, list]) => {
        const items = list.map(renderItem).join("");
        const open = list.length <= 5 ? " open" : "";
        const groupSev = (list[0] && list[0].severity) || "nit";
        return `<details class="viol-group" data-sev="${escapeHtml(groupSev)}"${open}><summary><span class="sev sev-${escapeHtml(groupSev)}">${escapeHtml(groupSev)}</span> <strong>${escapeHtml(type)}</strong><span class="viol-count">${list.length}</span></summary><ul>${items}</ul></details>`;
      }).join("");
      // Severity summary in heading: block N · warn N · nit N
      const sevCounts = viols.reduce((acc, v) => {
        const s = v.severity || "nit";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      const sevSummary = ["block", "warn", "nit"]
        .filter(s => sevCounts[s])
        .map(s => `<span class="sev sev-${s}">${s}</span> ${sevCounts[s]}`)
        .join(" · ");
      violList = `<div class="violations-block"><h4>機械偵測（${viols.length}）<span class="sev-summary">${sevSummary}</span></h4>${groupsHtml}</div>`;
    }
    const metaForLabel = fileMeta.get(j.file) || {};
    const navLabel = isMdPath(j.file)
      ? '變更段落（點 heading 跳到 spec 段落）'
      : isCssPath(j.file)
        ? '變更 selector（點 selector 跳到 CSS 行）'
        : (metaForLabel.augmented
            ? `CSS-only 變更 · via <code>${escapeHtml(pathTail(metaForLabel.augmented_via || ''))}</code>（點 selector 看本檔被影響處）`
            : '變更區域（點 selector 跳到畫面位置）');
    return `
      <section data-file="${escapeHtml(j.file)}">
        <h3>${escapeHtml(j.file)}</h3>
        <h4>${navLabel}</h4>
        <ul>${sels}</ul>
        ${cssSummary}
        ${violList}
      </section>`;
  }).join("");

  // Resolve iframe src URLs relative to wrapper file location.
  // Wrapper lives at $WORKSPACE/compare-<cluster>.html, files are at $WORKSPACE/before/<path> + after/<path>
  // Missing side → styled placeholder document so the pane reads as "intentionally empty"
  // rather than a load error. Greyed bg + centered message + side label.
  const emptyPlaceholder = (side, reason) => {
    const css = "body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#ececec;color:#888;font:13px/1.5 system-ui,'PingFang TC',sans-serif;text-align:center;padding:24px;}"
              + ".empty-block{filter:grayscale(1) opacity(0.8);}"
              + ".empty-icon{font-size:42px;display:block;margin-bottom:12px;opacity:0.4;}"
              + ".empty-title{font-size:15px;font-weight:600;color:#666;margin-bottom:6px;}"
              + ".empty-sub{font-size:12px;color:#999;}"
              + "@media (prefers-color-scheme: dark){body{background:#252525;color:#888;}.empty-title{color:#aaa;}.empty-sub{color:#777;}}";
    const icon = side === "before" ? "🆕" : "🗑️";
    const title = side === "before" ? "新檔案" : "已刪除";
    const sub = side === "before" ? "no base version — added in this PR" : "removed in this PR";
    const html = `<!doctype html><meta charset='utf-8'><style>${css}</style><div class='empty-block'><span class='empty-icon'>${icon}</span><div class='empty-title'>${title}</div><div class='empty-sub'>${sub}</div><div class='empty-sub' style='margin-top:8px;font-style:italic;'>${reason}</div></div>`;
    return "data:text/html;charset=utf-8," + encodeURIComponent(html);
  };
  const beforeSrc = (f) => fileExists(path.join(workspace, "before", f))
    ? `before/${f}` : emptyPlaceholder("before", f);
  const afterSrc = (f) => fileExists(path.join(workspace, "after", f))
    ? `after/${f}` : emptyPlaceholder("after", f);

  const filesMap = JSON.stringify(Object.fromEntries(
    files.map(f => [f, { before: beforeSrc(f), after: afterSrc(f) }])
  ));

  // Per-file detail HTML for the popup dialog (one entry per file in the cluster).
  const popupDetailsMap = JSON.stringify(Object.fromEntries(
    jumpEntries.map(j => [j.file, detailHtmlFor(j)])
  ));

  // Read standalone render modules to inject into the wrapper's <script>.
  // Keeping them out of the template literal avoids all backtick / backslash escape pain.
  const mdRenderSrc = fs.readFileSync(path.join(__dirname, "md-render.js"), "utf8");
  const textDiffRenderSrc = fs.readFileSync(path.join(__dirname, "text-diff-render.js"), "utf8");

  const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<title>design-pr-review · ${escapeHtml(cluster)}</title>
<style>
  /* === Material-inspired tokens (capped scope: surfaces, primary, status, shape, elevation, type, spacing) === */
  :root {
    color-scheme: light dark;
    /* Surfaces */
    --surface: #fffbfe;
    --surface-variant: #f3eef7;
    --surface-container: #eee5f3;
    --surface-dim: #ddd6e0;
    --on-surface: #1d1b20;
    --on-surface-variant: #49454f;
    --outline: #cac4d0;
    --outline-variant: #e2dde5;
    /* Brand */
    --primary: #6750a4;
    --on-primary: #ffffff;
    --primary-container: #eaddff;
    --on-primary-container: #21005d;
    /* Status (added / removed / changed; semantic for diff) */
    --status-add: #15693a;
    --status-add-container: #d6f4e2;
    --status-rm: #a52a2a;
    --status-rm-container: #fde4e4;
    --status-chg: #8a5500;
    --status-chg-container: #fdecc7;
    /* Shape */
    --r-xs: 4px; --r-sm: 6px; --r-md: 10px; --r-lg: 16px; --r-pill: 999px;
    /* Spacing (4-point grid) */
    --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-6: 24px; --s-8: 32px;
    /* Elevation */
    --elev-1: 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
    --elev-2: 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.06);
    /* Typography scale */
    --t-label-sm: 11px;
    --t-body-sm: 12px;
    --t-body-md: 13px;
    --t-title-sm: 14px;
    --t-title-md: 16px;
    --t-title-lg: 20px;
    /* Drawer */
    --drawer-w: 240px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --surface: #141218;
      --surface-variant: #2b2930;
      --surface-container: #211f26;
      --surface-dim: #1d1b20;
      --on-surface: #e6e0e9;
      --on-surface-variant: #cac4d0;
      --outline: #938f99;
      --outline-variant: #49454f;
      --primary: #d0bcff;
      --on-primary: #381e72;
      --primary-container: #4f378b;
      --on-primary-container: #eaddff;
      --status-add: #6ec48c;
      --status-add-container: #173a23;
      --status-rm: #ff8a8a;
      --status-rm-container: #4a1a1a;
      --status-chg: #e0c068;
      --status-chg-container: #3a2d0e;
    }
  }
  body.drawer-collapsed { --drawer-w: 0px; }

  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100vh; }
  body {
    font: var(--t-body-md)/1.45 system-ui, -apple-system, "PingFang TC", "Segoe UI", sans-serif;
    color: var(--on-surface);
    background: var(--surface);
    display: grid;
    grid-template-columns: var(--drawer-w) 1fr;
    transition: grid-template-columns 200ms ease;
  }

  /* === Drawer (TOC) === */
  .drawer {
    background: var(--surface-container);
    border-right: 1px solid var(--outline-variant);
    overflow: hidden;
    overflow-y: auto;
    transition: opacity 200ms ease;
  }
  body.drawer-collapsed .drawer { opacity: 0; pointer-events: none; }
  .drawer-header {
    padding: var(--s-3) var(--s-4);
    font-size: var(--t-label-sm);
    color: var(--on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid var(--outline-variant);
    position: sticky; top: 0;
    background: var(--surface-container);
    z-index: 1;
  }
  .drawer-group-title {
    padding: var(--s-3) var(--s-4) var(--s-1);
    font-size: var(--t-label-sm);
    color: var(--on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .toc-item { display: flex; align-items: stretch; min-width: 0; }
  .toc-item .toc-card { flex: 1 1 auto; min-width: 0; }
  .toc-item .card-info {
    flex: 0 0 28px;
    width: 28px;
    background: transparent;
    border: none;
    color: var(--on-surface-variant);
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    align-self: center;
    margin-right: var(--s-2);
    border-radius: var(--r-xs);
    transition: color 120ms ease, background 120ms ease;
  }
  .toc-item .card-info:hover { color: var(--primary); background: var(--surface-variant); }
  .toc-item .card-info:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }

  /* Popup dialog for detailed per-file info */
  .popup-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.18);
    z-index: 200;
    display: none;
  }
  .popup-backdrop.show { display: block; }
  .popup-dialog {
    position: absolute;
    background: var(--surface);
    color: var(--on-surface);
    border: 1px solid var(--outline-variant);
    border-radius: var(--r-md);
    box-shadow: var(--elev-2);
    width: 480px;
    max-width: 90vw;
    max-height: 70vh;
    overflow: auto;
    padding: var(--s-4) var(--s-4) var(--s-3);
  }
  .popup-dialog header { font-size: var(--t-title-sm); margin: 0 0 var(--s-2); }
  .popup-dialog header strong { word-break: break-all; }
  .popup-dialog h5 { font-size: var(--t-label-sm); margin: var(--s-3) 0 var(--s-1); text-transform: uppercase; letter-spacing: 0.04em; color: var(--on-surface-variant); }
  .popup-dialog ul { margin: 0; padding-left: var(--s-4); }
  .popup-dialog li { margin: var(--s-1) 0; font-size: var(--t-body-sm); list-style: none; }
  .popup-dialog code { background: var(--surface-variant); padding: 1px var(--s-1); border-radius: var(--r-xs); font-size: var(--t-label-sm); }
  .popup-dialog p.muted, .popup-dialog small.muted { color: var(--on-surface-variant); font-size: var(--t-body-sm); }
  .popup-dialog .popup-close {
    position: absolute; top: var(--s-2); right: var(--s-2);
    background: transparent; border: none;
    width: 28px; height: 28px;
    cursor: pointer; font-size: 18px;
    color: var(--on-surface-variant);
    border-radius: var(--r-xs);
  }
  .popup-dialog .popup-close:hover { background: var(--surface-variant); }

  /* Violation list — surface the element selector before the type */
  .anchor-sel {
    background: var(--surface-variant) !important;
    color: var(--on-surface-variant) !important;
    margin-right: var(--s-1);
    font-size: var(--t-label-sm);
  }

  .toc-card {
    display: block; width: 100%;
    padding: var(--s-2) var(--s-4);
    margin: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    text-align: left;
    font: inherit;
    color: inherit;
    cursor: pointer;
    border-left: 3px solid transparent;
  }
  .toc-card:hover { background: var(--surface-variant); }
  .toc-card.active { background: var(--primary-container); border-left-color: var(--primary); color: var(--on-primary-container); }
  /* Inner row containing the icon + path. Flex with min-width:0 so the path can
     shrink and trigger ellipsis instead of overflowing into the (i) info button. */
  .toc-card > div:first-child { display: flex; align-items: center; min-width: 0; }
  .toc-card .toc-icon { flex: 0 0 auto; width: 18px; margin-right: var(--s-2); font-size: 14px; }
  .toc-card .toc-path {
    flex: 1 1 auto; min-width: 0;
    font-size: var(--t-body-md);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .toc-card .toc-meta {
    margin-top: 2px;
    margin-left: 26px;
    font-size: var(--t-label-sm);
    color: var(--on-surface-variant);
    display: flex; gap: var(--s-1); align-items: center; flex-wrap: wrap;
  }
  .toc-card.active .toc-meta { color: var(--on-primary-container); opacity: 0.8; }

  /* ⓒ commit chip — file touched by N commits. Tooltip carries sha + headline. */
  .toc-card .commit-chip {
    display: inline-flex; align-items: center;
    padding: 1px 6px;
    background: var(--surface-variant, #ece6f0);
    color: var(--on-surface-variant, #555);
    border-radius: var(--r-xs, 4px);
    font-size: var(--t-label-sm, 11px);
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: help;
    white-space: nowrap;
  }
  .toc-card.active .commit-chip { background: rgba(255,255,255,0.5); color: var(--on-primary-container); }
  .commit-chip[data-toggle] { cursor: pointer; user-select: none; }
  .commit-chip[data-toggle]:hover { background: var(--primary-container); color: var(--on-primary-container); }
  .commit-chip[data-toggle][aria-expanded="true"]::after { content: " ▾"; font-size: 9px; opacity: 0.7; }

  /* Expanded commit list (sibling of toc-item). */
  .commits-detail {
    margin: 0 var(--s-4) var(--s-2);
    padding: var(--s-2) var(--s-3);
    background: var(--surface-variant, #ece6f0);
    border-left: 2px solid var(--primary, #6750a4);
    border-radius: var(--r-xs, 4px);
    font-size: var(--t-label-sm, 11px);
  }
  .commits-detail ul { list-style: none; padding: 0; margin: 0; }
  .commits-detail li { padding: 4px 0; border-bottom: 1px dotted var(--outline-variant, #ccc); display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }
  .commits-detail li:last-child { border-bottom: none; }
  .commits-detail .sha {
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    background: var(--surface, #fff);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 10.5px;
    color: var(--primary, #6750a4);
    text-decoration: none;
    flex: 0 0 auto;
  }
  .commits-detail a.sha:hover { text-decoration: underline; }
  .commits-detail .login { color: var(--on-surface-variant, #666); font-size: 10.5px; flex: 0 0 auto; }
  .commits-detail .msg { flex: 1 1 100%; color: var(--on-surface, #222); margin-top: 1px; line-height: 1.4; word-break: break-word; }
  .chip {
    display: inline-flex;
    padding: 1px var(--s-2);
    border-radius: var(--r-pill);
    font-size: var(--t-label-sm);
    line-height: 1.4;
  }
  .chip.added    { background: var(--status-add-container); color: var(--status-add); }
  .chip.modified { background: var(--surface-variant); color: var(--on-surface-variant); }
  .chip.removed  { background: var(--status-rm-container); color: var(--status-rm); }
  .chip.augmented { background: var(--surface-variant); color: var(--on-surface-variant); font-style: italic; }

  /* === App shell (right of drawer) === */
  .app { display: grid; grid-template-rows: auto 1fr; height: 100vh; overflow: hidden; }
  .app-header {
    padding: var(--s-3) var(--s-4);
    display: flex; align-items: center; gap: var(--s-3);
    border-bottom: 1px solid var(--outline-variant);
    background: var(--surface);
    box-shadow: var(--elev-1);
    z-index: 2;
  }
  .app-header h1 { font-size: var(--t-title-md); margin: 0; font-weight: 600; }
  .app-header .meta { color: var(--on-surface-variant); font-size: var(--t-body-sm); }
  .app-header .spacer { flex: 1; }

  /* PR badge — number + author, opens GitHub PR on click. */
  .app-header .pr-badge {
    display: inline-flex; align-items: center; gap: var(--s-1);
    padding: 4px var(--s-2);
    background: var(--primary-container, #e8f0fe);
    color: var(--on-primary-container, #0a66c2);
    border-radius: var(--r-sm, 6px);
    text-decoration: none;
    font-size: var(--t-label-sm);
    font-weight: 600;
    transition: background 0.15s ease;
  }
  .app-header .pr-badge:hover { background: var(--primary-hover, #d2e3fc); text-decoration: none; }
  .app-header .pr-badge .pr-num { letter-spacing: 0.02em; }
  .app-header .pr-badge .pr-author { font-weight: 500; opacity: 0.78; }
  .app-header .pr-badge .pr-author::before { content: "· by "; opacity: 0.6; }
  .app-header .pr-title-meta {
    max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    color: var(--on-surface-variant); font-size: var(--t-body-sm); font-style: italic;
  }
  .icon-btn {
    background: transparent;
    border: 1px solid var(--outline);
    color: var(--on-surface);
    width: 32px; height: 32px;
    border-radius: var(--r-sm);
    cursor: pointer;
    font-size: 14px;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .icon-btn:hover { background: var(--surface-variant); }
  .app-body { display: grid; grid-template-columns: 1fr 1fr 280px; grid-template-rows: auto 1fr; overflow: hidden; }
  .pane-label {
    background: var(--surface-variant);
    color: var(--on-surface-variant);
    font-size: var(--t-label-sm);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: var(--s-1) var(--s-3);
    border-bottom: 1px solid var(--outline-variant);
    border-right: 1px solid var(--outline-variant);
    line-height: 1.4;
  }
  .pane-label:last-child { border-right: none; }
  iframe {
    width: 100%; height: 100%;
    border: 0;
    border-right: 1px solid var(--outline-variant);
    background: var(--surface);
  }
  /* Visual mode (HTML mockup): the mockup .device CSS is fixed-size 375 by 790, but
     uses max-height calc(100dvh - 60px) which clamps the height to whatever the
     iframe viewport allows. If iframe is shorter than ~850 px, device gets squashed
     and the phone looks fat. Solution: fix iframe at 860 px tall (device 790 + 60 px
     breathing for ring/shadow) and 440 px wide (device 375 + room for shadow), then
     let the surrounding .app-body scroll vertically when the row cannot fit it. */
  iframe[data-mode="visual"] {
    width: 100%;
    max-width: 440px;
    height: 860px;
    margin: 0 auto;
    display: block;
    background: var(--surface-variant);
  }
  /* When visual-mode iframes exceed the row height, let the app-body scroll vertically
     so the designer can pan down to the bottom of the phone preview. */
  .app-body { overflow-y: auto; }
  .pane-label { position: sticky; top: 0; z-index: 2; }
  iframe[data-mode="svg"] {
    background-color: var(--surface);
    background-image:
      linear-gradient(45deg, var(--surface-variant) 25%, transparent 25%),
      linear-gradient(-45deg, var(--surface-variant) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--surface-variant) 75%),
      linear-gradient(-45deg, transparent 75%, var(--surface-variant) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  }

  /* === Side panel === */
  .panel {
    background: var(--surface-container);
    padding: var(--s-4);
    overflow-y: auto;
    border-left: 1px solid var(--outline-variant);
  }
  .panel h3 { font-size: var(--t-title-sm); margin: 0 0 var(--s-2); color: var(--on-surface); font-weight: 600; }
  .panel h4 { font-size: var(--t-label-sm); margin: var(--s-3) 0 var(--s-1); color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
  .panel ul { margin: 0; padding-left: var(--s-4); list-style: none; }
  .panel li { margin: var(--s-1) 0; font-size: var(--t-body-sm); }
  .panel section { display: none; padding-bottom: var(--s-4); }
  .panel section.active { display: block; }

  /* Selector group accordions in HTML panel — visually nest related selectors. */
  .panel li.sel-group { list-style: none; margin-left: -16px; padding: 0; }
  .panel li.sel-group > details { padding: 0; margin: var(--s-1) 0; }
  .panel li.sel-group > details > summary {
    cursor: pointer;
    padding: var(--s-1) var(--s-2);
    font-size: var(--t-label-sm);
    color: var(--on-surface-variant);
    list-style: none;
    background: var(--surface-variant);
    border-radius: var(--r-xs);
  }
  .panel li.sel-group > details > summary::before { content: '▾ '; }
  .panel li.sel-group > details:not([open]) > summary::before { content: '▸ '; }
  .panel li.sel-group > details > summary:hover { background: var(--surface-dim); }
  .panel li.sel-group > details > summary { display: flex; align-items: center; gap: var(--s-2); }
  .panel li.sel-group > details > summary > strong { flex: 1; }
  .panel li.sel-group > details > ul { margin-left: var(--s-3); padding-left: var(--s-2); border-left: 2px solid var(--outline-variant); }

  /* Mechanical violations block — visually distinct from selectors above, sticky heading,
     grouped by violation type with collapsible <details>. */
  .panel .violations-block {
    background: var(--status-chg-container);
    border-radius: var(--r-md);
    padding: var(--s-2) var(--s-3) var(--s-3);
    margin-top: var(--s-3);
  }
  .panel .violations-block h4 {
    position: sticky;
    top: calc(var(--s-4) * -1);
    background: var(--status-chg-container);
    color: var(--status-chg);
    padding: var(--s-2) 0;
    margin: 0 0 var(--s-2);
    z-index: 2;
    border-bottom: 1px solid var(--outline-variant);
  }
  .panel .violations-block details.viol-group {
    margin: var(--s-2) 0;
  }
  .panel .violations-block details.viol-group > summary {
    cursor: pointer;
    padding: var(--s-1) var(--s-2);
    font-size: var(--t-label-sm);
    background: var(--surface);
    border-radius: var(--r-xs);
    list-style: none;
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }
  .panel .violations-block details.viol-group > summary::before { content: '▾ '; }
  .panel .violations-block details.viol-group:not([open]) > summary::before { content: '▸ '; }
  .panel .violations-block details.viol-group > summary:hover { background: var(--surface-dim); }
  .panel .violations-block .viol-count {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    color: var(--status-chg);
    font-weight: 600;
  }
  .panel .violations-block ul {
    margin: 0;
    padding-left: var(--s-3);
  }
  .panel .violations-block li > small {
    color: var(--on-surface-variant);
    word-break: break-all;
  }

  /* Severity badge — 3 tiers (block / warn / nit). Color comes from the existing
     status tokens so dark mode follows the rest of the wrapper. */
  .sev {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 1px 5px;
    border-radius: var(--r-xs);
    vertical-align: 1px;
  }
  .sev-block {
    background: var(--status-rm-container);
    color: var(--status-rm);
  }
  .sev-warn {
    background: var(--status-chg-container);
    color: var(--status-chg);
  }
  .sev-nit {
    background: var(--surface-variant);
    color: var(--on-surface-variant);
  }
  .sev-summary {
    margin-left: var(--s-2);
    font-size: var(--t-label-sm);
    font-weight: normal;
    text-transform: none;
    letter-spacing: 0;
  }
  .sev-summary .sev {
    margin-left: var(--s-1);
  }
  .anchor-group {
    background: var(--primary-container);
    color: var(--on-primary-container);
    border: 1px solid var(--outline-variant);
    border-radius: var(--r-xs);
    padding: 0 var(--s-2);
    font-size: var(--t-label-sm);
    line-height: 20px;
    cursor: pointer;
  }
  .anchor-group:hover { background: var(--primary); color: var(--on-primary); }

  /* === CSS summary === */
  .css-summary { padding-left: 0 !important; }
  .css-summary li { margin: var(--s-1) 0; padding: 0; border-bottom: 1px dotted var(--outline-variant); }
  .css-summary li:last-child { border-bottom: none; }
  .css-summary code { background: var(--surface-variant); padding: 1px var(--s-1); border-radius: var(--r-xs); font-size: var(--t-label-sm); }
  .css-summary .lineno { color: var(--on-surface-variant); font-weight: normal; }
  .css-rm  { color: var(--status-rm); }
  .css-add { color: var(--status-add); }
  .css-chg { color: var(--status-chg); }

  /* === MD raw diff snippet (under heading anchor) === */
  .diff-snippet { margin: var(--s-1) 0 var(--s-2) var(--s-2); font-size: var(--t-label-sm); }
  .diff-snippet summary { cursor: pointer; color: var(--on-surface-variant); padding: 2px 0; user-select: none; }
  .diff-snippet summary:hover { color: var(--on-surface); }
  .diff-snippet pre {
    margin: var(--s-1) 0 0;
    padding: var(--s-2);
    background: var(--surface-variant);
    border-left: 3px solid var(--outline-variant);
    border-radius: var(--r-xs);
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 12px;
    line-height: 1.45;
  }
  .diff-snippet pre .diff-add { color: var(--status-add, #1f883d); background: rgba(31,136,61,0.08); display: block; }
  .diff-snippet pre .diff-del { color: var(--status-rm, #cf222e); background: rgba(207,34,46,0.08); display: block; }
  .diff-snippet pre mark { color: inherit; }
  .diff-snippet pre .diff-add-mark { background: rgba(31,136,61,0.35); padding: 0 2px; border-radius: 2px; font-weight: 600; }
  .diff-snippet pre .diff-del-mark { background: rgba(207,34,46,0.35); padding: 0 2px; border-radius: 2px; font-weight: 600; text-decoration: line-through; text-decoration-color: rgba(207,34,46,0.5); }

  /* === Anchor button (Material-inspired filled-tonal) === */
  .anchor {
    display: block; width: 100%;
    background: var(--primary-container);
    color: var(--on-primary-container);
    border: 1px solid transparent;
    padding: var(--s-1) var(--s-2);
    font: inherit;
    cursor: pointer;
    border-radius: var(--r-sm);
    text-align: left;
    transition: background 120ms ease;
  }
  .anchor:hover { background: var(--primary); color: var(--on-primary); }
  /* When the anchor's bg flips to deep primary, the inner status colors
     (dark red/green/brown designed for light bg) lose contrast. Swap to the
     -container pastel variants — still semantic, but bright enough to pop. */
  .anchor:hover .css-rm,
  .anchor:focus .css-rm { color: var(--status-rm-container); }
  .anchor:hover .css-add,
  .anchor:focus .css-add { color: var(--status-add-container); }
  .anchor:hover .css-chg,
  .anchor:focus .css-chg { color: var(--status-chg-container); }
  /* Same for the small line-number label so it stays readable on dark bg. */
  .anchor:hover .lineno,
  .anchor:focus .lineno { color: var(--on-primary); opacity: 0.85; }
  .anchor.miss { opacity: 0.45; cursor: not-allowed; background: var(--surface-variant); color: var(--on-surface-variant); }
  .anchor.miss:hover { background: var(--surface-variant); color: var(--on-surface-variant); }
  .anchor code { background: transparent; padding: 0; font-size: var(--t-body-sm); }

  /* === Ask-Claude button (per-anchor context copier) === */
  /* Sits inline beside the anchor button via flex layout below. Visibility set
     above the "barely there" threshold so designers discover the feature, but
     muted enough not to compete with the anchor itself. */
  .ask-claude {
    background: var(--surface-variant);
    color: var(--on-surface-variant);
    border: 1px solid transparent;
    cursor: pointer;
    opacity: 0.75;
    padding: 4px 6px;
    font-size: 13px; line-height: 1;
    border-radius: var(--r-sm);
    flex: none; align-self: stretch;
    display: inline-flex; align-items: center;
    transition: opacity 120ms ease, background 120ms ease, color 120ms ease;
  }
  .ask-claude:hover {
    opacity: 1;
    background: var(--primary);
    color: var(--on-primary);
    border-color: var(--primary);
  }
  /* Lay out anchor + ask-claude side-by-side. Without this the block-display
     .anchor takes the whole row and pushes 💬 onto the next line. */
  .panel li:has(.ask-claude),
  .css-summary li:has(.ask-claude) {
    display: flex;
    gap: 4px;
    align-items: stretch;
    margin: 4px 0;
  }
  .panel li:has(.ask-claude) > .anchor,
  .css-summary li:has(.ask-claude) > .anchor { flex: 1; min-width: 0; }

  /* === Toast === */
  .toast {
    position: fixed; bottom: var(--s-4); left: 50%; transform: translateX(-50%);
    background: var(--on-surface); color: var(--surface);
    padding: var(--s-2) var(--s-3);
    border-radius: var(--r-sm);
    font-size: var(--t-body-sm);
    z-index: 100;
    opacity: 0;
    transition: opacity 200ms ease;
    pointer-events: none;
    box-shadow: var(--elev-2);
    max-width: 480px;
  }
  .toast.show { opacity: 1; }

  /* === BEFORE / AFTER labels === */
  .label {
    position: absolute;
    padding: var(--s-1) var(--s-2);
    font-size: var(--t-label-sm);
    background: var(--on-surface);
    color: var(--surface);
    border-radius: var(--r-xs);
    z-index: 10;
    pointer-events: none;
    opacity: 0.7;
  }

  /* Augmented section toggle */
  details.augmented-group { padding: 0; }
  details.augmented-group > summary {
    padding: var(--s-2) var(--s-4);
    cursor: pointer;
    font-size: var(--t-label-sm);
    color: var(--on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    list-style: none;
  }
  details.augmented-group > summary::before { content: '▸ '; }
  details.augmented-group[open] > summary::before { content: '▾ '; }
  details.augmented-group > summary:hover { background: var(--surface-variant); }
</style>
</head>
<body>
<aside class="drawer" id="drawer" role="navigation" aria-label="File index">
  <div class="drawer-header">Files in PR</div>
  ${tocMarkup}
</aside>
<div class="app">
  <header class="app-header">
    <button class="icon-btn" id="drawer-toggle" title="Toggle drawer (⌘B)" aria-label="Toggle drawer">☰</button>
    ${prMeta && prMeta.number ? `<a class="pr-badge" href="${escapeHtml(prMeta.url || '#')}" target="_blank" rel="noopener" title="${escapeHtml(prMeta.title || '')}">
      <span class="pr-num">PR #${escapeHtml(String(prMeta.number))}</span>
      <span class="pr-author">${escapeHtml((prMeta.author && (prMeta.author.name || prMeta.author.login)) || 'unknown')}</span>
    </a>` : ""}
    <h1>${escapeHtml(cluster)}</h1>
    <span class="meta" id="active-meta"></span>
    <div class="spacer"></div>
    ${prMeta && prMeta.title ? `<span class="pr-title-meta" title="${escapeHtml(prMeta.title)}">${escapeHtml(prMeta.title.length > 60 ? prMeta.title.slice(0, 58) + "…" : prMeta.title)}</span>` : ""}
    <button class="icon-btn" id="feedback-btn" title="這裡奇怪？複製當下 state（active file / 最後互動 / console errors）給 Claude 回報" aria-label="Copy session state">📋</button>
  </header>
  <div class="app-body">
    <div class="pane-label">BEFORE</div>
    <div class="pane-label">AFTER</div>
    <div class="pane-label">Anchors</div>
    <iframe id="left" src=""></iframe>
    <iframe id="right" src=""></iframe>
    <aside id="panel" class="panel">${sidePanel}</aside>
  </div>
</div>
<div id="toast" class="toast"></div>
<div class="popup-backdrop" id="popup-backdrop">
  <div class="popup-dialog" id="popup-dialog" role="dialog" aria-modal="true">
    <button class="popup-close" id="popup-close" aria-label="Close">×</button>
    <div id="popup-content"></div>
  </div>
</div>
<script>
${mdRenderSrc}
</script>
<script>
${textDiffRenderSrc}
</script>
<script>
(() => {
  const filesMap = ${filesMap};
  const popupDetails = ${popupDetailsMap};
  const primaryFile = ${JSON.stringify(primary)};
  // PR + cluster context for the ask-Claude prompt builder
  const prMeta = ${JSON.stringify(prMeta || {})};
  const clusterName = ${JSON.stringify(cluster)};
  const left = document.getElementById('left');
  const right = document.getElementById('right');
  const panel = document.getElementById('panel');
  const toast = document.getElementById('toast');
  const drawer = document.getElementById('drawer');
  const drawerToggle = document.getElementById('drawer-toggle');
  const activeMeta = document.getElementById('active-meta');
  const buttons = document.querySelectorAll('.toc-card');
  const feedbackBtn = document.getElementById('feedback-btn');

  // Lightweight observer for Layer-3 feedback capture. Tracks just enough
  // session state that "🐛 這裡奇怪" can hand Claude a real reproducer
  // (current file, last anchor interaction, last toast, JS errors, viewport)
  // without needing the designer to describe what they did.
  const feedbackState = {
    activeFile: null,
    lastAnchorClick: null,
    lastToast: null,
    consoleErrors: [],
  };
  // Capture uncaught errors + console.error calls — wrapper has lots of moving
  // parts (iframe access, clipboard, selector parsing) and silent failures are
  // the worst kind to debug remotely.
  window.addEventListener('error', (e) => {
    feedbackState.consoleErrors.push({
      t: new Date().toISOString(),
      msg: String(e.message || e),
      where: e.filename ? (e.filename + ':' + e.lineno) : null,
    });
    if (feedbackState.consoleErrors.length > 20) feedbackState.consoleErrors.shift();
  });
  const _origConsoleError = console.error.bind(console);
  console.error = function (...args) {
    feedbackState.consoleErrors.push({
      t: new Date().toISOString(),
      msg: args.map(a => { try { return String(a); } catch { return '?'; } }).join(' '),
    });
    if (feedbackState.consoleErrors.length > 20) feedbackState.consoleErrors.shift();
    _origConsoleError(...args);
  };

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
    feedbackState.lastToast = { t: new Date().toISOString(), msg: String(msg) };
  }

  // renderMd() and loadMd() are injected from md-render.js at wrapper-build time.


  // Dispatch file extension → render mode. See SKILL.md for the contract.
  function pickMode(file) {
    if (/\.(html|htm)$/i.test(file))      return 'visual';
    if (/\.(md|markdown)$/i.test(file))   return 'md';
    if (/\.svg$/i.test(file))             return 'svg';
    return 'textDiff'; // .css, .js, .json, .txt, no-ext, etc.
  }

  function show(file) {
    const entry = filesMap[file];
    if (!entry) return;
    feedbackState.activeFile = file;
    const mode = pickMode(file);
    // Clear opposing attribute so the chosen mechanism (src vs srcdoc) takes effect:
    // once srcdoc is set, it beats src per spec, so we have to removeAttribute('srcdoc')
    // when switching back to a real URL load.
    left.removeAttribute('src');     right.removeAttribute('src');
    left.removeAttribute('srcdoc');  right.removeAttribute('srcdoc');
    left.dataset.mode = mode;        right.dataset.mode = mode;

    if (mode === 'md') {
      loadMd(left, entry.before);
      loadMd(right, entry.after);
    } else if (mode === 'textDiff') {
      loadTextDiff(left, right, entry);
    } else if (mode === 'svg') {
      // SVG: load directly into iframe; the wrapper's iframe parent CSS adds a checkered
      // background so transparent regions are visually distinguishable.
      left.src = entry.before;
      right.src = entry.after;
    } else {
      // visual: HTML rendered via http snapshot, relative CSS/JS refs resolve within same side.
      left.src = entry.before;
      right.src = entry.after;
    }
    buttons.forEach(b => b.classList.toggle('active', b.dataset.file === file));
    panel.querySelectorAll('section').forEach(s => s.classList.toggle('active', s.dataset.file === file));
    // Validate anchors against the newly loaded after iframe once it's ready.
    right.addEventListener('load', annotateMissingAnchors, { once: true });
  }

  buttons.forEach(b => b.addEventListener('click', () => show(b.dataset.file)));

  // --- Drawer toggle (Cmd+B / button / viewport) ---
  function setDrawer(collapsed) {
    document.body.classList.toggle('drawer-collapsed', collapsed);
  }
  drawerToggle && drawerToggle.addEventListener('click', () => {
    setDrawer(!document.body.classList.contains('drawer-collapsed'));
  });

  // 🐛 feedback button — capture wrapper state into a paste-ready markdown
  // blob so the designer can drop a real reproducer into chat without us
  // having to ask "what were you looking at when it went weird?".
  function buildFeedbackBlob() {
    const url = prMeta.url || '';
    const repo = (url.split('github.com/')[1] || '').split('/pull/')[0] || '';
    const lines = [];
    lines.push('🐛 design-pr-review feedback');
    if (repo && prMeta.number) lines.push('- PR: ' + repo + '#' + prMeta.number);
    else if (prMeta.title) lines.push('- PR: ' + prMeta.title);
    lines.push('- Cluster: ' + clusterName);
    lines.push('- Active file: ' + (feedbackState.activeFile || '(none)'));
    if (feedbackState.lastAnchorClick) {
      const c = feedbackState.lastAnchorClick;
      const what = c.mdHeading ? ('heading: ' + c.mdHeading)
                 : c.selector ? ('selector: \`' + c.selector + '\`')
                 : c.line ? ('line: ' + c.line)
                 : '(empty anchor — no resolvable target)';
      lines.push('- Last anchor click: ' + what + (c.file ? ' (in ' + c.file + ')' : ''));
    } else {
      lines.push('- Last anchor click: (none)');
    }
    if (feedbackState.lastToast) {
      lines.push('- Last toast: "' + feedbackState.lastToast.msg + '"');
    }
    if (feedbackState.consoleErrors.length) {
      lines.push('- Console errors (' + feedbackState.consoleErrors.length + '):');
      for (const e of feedbackState.consoleErrors.slice(-5)) {
        lines.push('  - ' + e.msg + (e.where ? ' @ ' + e.where : ''));
      }
    }
    lines.push('- Viewport: ' + window.innerWidth + '×' + window.innerHeight);
    lines.push('- User agent: ' + navigator.userAgent);
    lines.push('');
    lines.push('我覺得這裡奇怪因為：');
    return lines.join('\\n');
  }
  feedbackBtn && feedbackBtn.addEventListener('click', async () => {
    const blob = buildFeedbackBlob();
    try {
      await navigator.clipboard.writeText(blob);
      showToast('已 copy 當下 state 到剪貼簿 — 貼到 chat 給 Claude 看');
    } catch {
      try { window.prompt('複製下列文字後貼到 chat：', blob); } catch {}
    }
  });
  window.addEventListener('keydown', (e) => {
    // Cmd+B (macOS) / Ctrl+B (other)
    if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      setDrawer(!document.body.classList.contains('drawer-collapsed'));
    }
  });
  // First-load viewport rule: collapse below 1280px to give iframes breathing room.
  if (window.innerWidth < 1280) setDrawer(true);

  // --- Popup dialog for TOC card details (ⓘ button) ---
  const popupBackdrop = document.getElementById('popup-backdrop');
  const popupDialog = document.getElementById('popup-dialog');
  const popupContent = document.getElementById('popup-content');
  const popupClose = document.getElementById('popup-close');
  function hidePopup() { popupBackdrop && popupBackdrop.classList.remove('show'); }
  function showPopupNear(triggerEl, file) {
    if (!popupBackdrop || !popupDialog || !popupContent) return;
    popupContent.innerHTML = popupDetails[file] || ('<header><strong>' + file + '</strong></header><p class="muted">沒有額外摘要</p>');
    popupBackdrop.classList.add('show');
    // Position near the trigger; clamp to viewport.
    const r = triggerEl.getBoundingClientRect();
    const dlgWidth = 480;
    const margin = 8;
    let left = r.right + margin;
    if (left + dlgWidth > window.innerWidth - margin) {
      left = Math.max(margin, r.left - dlgWidth - margin);
    }
    let top = Math.max(margin, r.top);
    popupDialog.style.left = left + 'px';
    popupDialog.style.top = top + 'px';
  }
  drawer && drawer.addEventListener('click', (e) => {
    // ⓒ chip → toggle commit list expansion (sibling .commits-detail).
    const chip = e.target.closest('.commit-chip[data-toggle="commits"]');
    if (chip) {
      e.stopPropagation();
      e.preventDefault();
      const target = document.getElementById(chip.dataset.target);
      if (target) {
        const willOpen = target.hidden;
        target.hidden = !willOpen;
        chip.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      }
      return;
    }
    const info = e.target.closest('.card-info');
    if (!info) return;
    e.stopPropagation();
    e.preventDefault();
    showPopupNear(info, info.dataset.infoFor);
  });
  // Keyboard support — Enter / Space toggles the chip when focused.
  drawer && drawer.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const chip = e.target.closest && e.target.closest('.commit-chip[data-toggle="commits"]');
    if (!chip) return;
    e.preventDefault();
    chip.click();
  });
  popupClose && popupClose.addEventListener('click', hidePopup);
  popupBackdrop && popupBackdrop.addEventListener('click', (e) => {
    // Click on backdrop (not on the dialog itself) closes
    if (e.target === popupBackdrop) hidePopup();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupBackdrop && popupBackdrop.classList.contains('show')) hidePopup();
  });

  // --- Drawer arrow-key navigation ---
  // When focus is anywhere inside the drawer, ↑/↓ moves between toc-card buttons,
  // Enter activates. Buttons are focusable natively.
  drawer && drawer.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const all = [...drawer.querySelectorAll('.toc-card')];
    const idx = all.indexOf(document.activeElement);
    if (idx < 0) return;
    e.preventDefault();
    const next = e.key === 'ArrowDown' ? Math.min(all.length - 1, idx + 1) : Math.max(0, idx - 1);
    all[next].focus();
  });

  // Update header meta whenever show() runs.
  const origShow = show;
  show = function(file) {
    origShow(file);
    if (activeMeta) {
      const mode = pickMode(file);
      activeMeta.textContent = '· ' + file + ' · ' + mode;
    }
  };

  // Anchor: click a selector in the side panel → scroll both iframes to it + visual flash.
  // Handles three cases:
  //   (a) element found, visible        → scroll to it, flash on it
  //   (b) element found, hidden (0 box) → force-show its hidden ancestors temporarily,
  //                                       scroll to and flash the real element, then restore.
  //                                       Toast tells designer this is a forced reveal.
  //   (c) element not found             → toast that the selector doesn't resolve
  function getComputedDisplay(el) {
    try { return el.ownerDocument.defaultView.getComputedStyle(el).display; }
    catch { return ''; }
  }

  // Walk up from the element, recording every ancestor whose CSS hides it.
  // Catches four common hiding mechanisms: display:none, visibility:hidden, opacity:0,
  // and transform-based slide-out (translateX/Y > 50% of viewport — the typical pattern
  // for drawer/sheet/modal slide-ins that aren't yet opened).
  function findHidingAncestors(el) {
    const hiders = [];
    let p = el;
    while (p && p.nodeType === 1) {
      const win = p.ownerDocument.defaultView || window;
      const cs = win.getComputedStyle(p);
      let hides = false;
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') {
        hides = true;
      }
      if (!hides && cs.transform && cs.transform !== 'none') {
        // matrix(a,b,c,d,tx,ty) → indices 4,5;  matrix3d(... tx,ty,tz ...) → 12,13
        // Threshold 50 px: catches typical drawer/sheet slide-outs (often 280–400 px)
        // while ignoring small polish translations (hover lift, micro-interactions).
        const m = /matrix(?:3d)?\(([^)]+)\)/.exec(cs.transform);
        if (m) {
          const vals = m[1].split(',').map(s => parseFloat(s.trim()));
          const tx = vals.length === 6 ? vals[4] : (vals[12] || 0);
          const ty = vals.length === 6 ? vals[5] : (vals[13] || 0);
          if (Math.abs(tx) > 50 || Math.abs(ty) > 50) {
            hides = true;
          }
        }
      }
      if (hides) hiders.push(p);
      p = p.parentElement;
    }
    return hiders;
  }

  // Force-show by overriding inline style on every hider. Also clears transform so
  // slide-out drawers/sheets pop into view at identity position.
  function temporarilyShow(hiders) {
    const saved = hiders.map(el => ({
      el,
      prevDisplay:    el.style.display,
      prevVisibility: el.style.visibility,
      prevOpacity:    el.style.opacity,
      prevTransform:  el.style.transform,
      prevHiddenAttr: el.getAttribute('hidden'),
    }));
    hiders.forEach(el => {
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
      if (el.hasAttribute('hidden')) el.removeAttribute('hidden');
    });
    return () => {
      saved.forEach(({ el, prevDisplay, prevVisibility, prevOpacity, prevTransform, prevHiddenAttr }) => {
        el.style.display    = prevDisplay;
        el.style.visibility = prevVisibility;
        el.style.opacity    = prevOpacity;
        el.style.transform  = prevTransform;
        if (prevHiddenAttr !== null) el.setAttribute('hidden', prevHiddenAttr);
      });
    };
  }

  function flash(el) {
    const prevOutline = el.style.outline;
    const prevOffset  = el.style.outlineOffset;
    const prevBg      = el.style.background;
    const prevTrans   = el.style.transition;
    const prevBoxShadow = el.style.boxShadow;
    el.style.transition = 'outline 0.2s ease, background 0.2s ease, box-shadow 0.2s ease';
    // Bigger outline + drop shadow so the element pops even when modal-positioned.
    el.style.outline = '4px solid #ff5252';
    el.style.outlineOffset = '4px';
    el.style.background = 'rgba(255, 235, 100, 0.55)';
    el.style.boxShadow = '0 0 0 12px rgba(255, 82, 82, 0.18)';
    return () => {
      el.style.outline = prevOutline;
      el.style.outlineOffset = prevOffset;
      el.style.background = prevBg;
      el.style.boxShadow = prevBoxShadow;
      setTimeout(() => { el.style.transition = prevTrans; }, 300);
    };
  }

  const FLASH_MS = 2200;

  // Walk up to find the first ancestor with a reasonable layout box (width > 32 && height > 32).
  // Used when the target element itself is empty after a force-show (e.g. a placeholder div
  // whose content is populated by JS at modal-open time).
  function ancestorWithSize(el) {
    let p = el.parentElement;
    while (p) {
      const r = p.getBoundingClientRect();
      if (r.width > 32 && r.height > 32) return p;
      p = p.parentElement;
    }
    return null;
  }

  // Mirror right iframe's scroll position to the left iframe so before/after stay aligned.
  function mirrorScroll() {
    try {
      const rd = right.contentDocument || right.contentWindow.document;
      const ld = left.contentDocument  || left.contentWindow.document;
      if (!rd || !ld) return;
      const rdoc = rd.scrollingElement || rd.documentElement;
      const ldoc = ld.scrollingElement || ld.documentElement;
      ldoc.scrollTop  = rdoc.scrollTop;
      ldoc.scrollLeft = rdoc.scrollLeft;
    } catch { /* cross-origin or not ready */ }
  }

  // Find the nearest ancestor with actual scrollable overflow inside the iframe.
  // Skips containers whose scrollHeight matches clientHeight (no scroll needed).
  function nearestScroller(el, doc) {
    let p = el && el.parentElement;
    while (p && p !== doc.body) {
      if (p.scrollHeight > p.clientHeight + 1) return p;
      p = p.parentElement;
    }
    return null;
  }

  // Scroll the nearest scrollable ancestor by the minimum amount needed to
  // place the focal element ~24 px below that scroller's top edge. Avoids
  // native scrollIntoView, which on bottom-sheet mockups walks up to an
  // overflow:hidden device frame and maxes out, pushing the target above
  // the visible area.
  function smartScrollInside(focal, doc) {
    const scroller = nearestScroller(focal, doc);
    if (!scroller) {
      focal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const fr = focal.getBoundingClientRect();
    const sr = scroller.getBoundingClientRect();
    const outside = fr.bottom < sr.top || fr.top > sr.bottom;
    if (!outside) return; // already visible inside the scroller
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    const desired = Math.max(0, Math.min(maxScroll, scroller.scrollTop + (fr.top - sr.top) - 24));
    try { scroller.scrollTo({ top: desired, behavior: 'smooth' }); }
    catch { scroller.scrollTop = desired; }
  }

  function jumpTo(selector) {
    let status = 'not-found';   // not-found | visible | revealed | revealed-empty | cross-origin
    // Suppress cross-pane sync during smart-scroll + flash so the smooth
    // animation isn't interrupted by the sync handler.
    suppressSyncFor(800);
    try {
      const doc = right.contentDocument || right.contentWindow.document;
      const el = doc.querySelector(selector);
      if (!el) {
        showToast('Selector 在 after 畫面找不到（' + selector + '）');
        return;
      }

      // Always check for hidden ancestors first — an element with non-zero
      // layout dimensions can still be invisible if an ancestor has opacity:0
      // or transform:translate(...) > 50 px (bottom-sheet pattern).
      const hiders = findHidingAncestors(el);
      if (hiders.length === 0) {
        smartScrollInside(el, doc);
        const restoreFlash = flash(el);
        setTimeout(restoreFlash, FLASH_MS);
        setTimeout(mirrorScroll, 400);
        status = 'visible';
        return;
      }
      let restoreShow = temporarilyShow(hiders);
      // Force layout reflow.
      // eslint-disable-next-line no-unused-expressions
      el.getBoundingClientRect();

      // Nuclear fallback: targeted force-show didn't expose the element. Walk every
      // ancestor up to body and force-show indiscriminately — covers hiding mechanisms
      // we don't detect (class-toggled state, JS-driven visibility, exotic CSS).
      let nuclearRect = el.getBoundingClientRect();
      if (nuclearRect.width <= 1 && nuclearRect.height <= 1) {
        const allAncestors = [];
        let p = el.parentElement;
        while (p && p !== doc.body) { allAncestors.push(p); p = p.parentElement; }
        if (doc.body) allAncestors.push(doc.body);
        const restoreNuclear = temporarilyShow(allAncestors);
        // eslint-disable-next-line no-unused-expressions
        el.getBoundingClientRect();
        nuclearRect = el.getBoundingClientRect();
        // Chain both restores together so cleanup runs both.
        const prevRestoreShow = restoreShow;
        restoreShow = () => { restoreNuclear(); prevRestoreShow(); };
      }

      // After force-show, check if target itself has a visible box.
      const newRect = nuclearRect;
      let target = el;
      if (newRect.width <= 1 || newRect.height <= 1) {
        // Target is still empty/zero-sized (e.g. JS-populated placeholder).
        // Fall back to the nearest sized ancestor inside the now-revealed tree.
        const anc = ancestorWithSize(el);
        if (anc) { target = anc; status = 'revealed-empty'; }
        else     { status = 'revealed-empty'; }
      } else {
        status = 'revealed';
      }

      // Hidden-modal elements are typically inside position:fixed overlays.
      // scrollIntoView on them scrolls the iframe to weird offsets while the
      // overlay itself is already pinned to viewport. Instead, reset iframe
      // scroll to the top so the natural mockup layer is the baseline, and
      // let the now-visible overlay sit on top of it. The flash highlights
      // the actual target within the overlay.
      const docEl = doc.scrollingElement || doc.documentElement;
      const ancestorIsFixed = (function () {
        let p = target;
        while (p && p.nodeType === 1 && p !== doc.body) {
          const cs = (p.ownerDocument.defaultView || window).getComputedStyle(p);
          if (cs.position === 'fixed' || cs.position === 'sticky') return true;
          p = p.parentElement;
        }
        return false;
      })();
      if (ancestorIsFixed) {
        // Pinned overlay — just reset scroll so the page baseline is the natural state.
        try { docEl.scrollTo({ top: 0, behavior: 'smooth' }); } catch { docEl.scrollTop = 0; }
      } else {
        // Use smart scroll: manual delta on nearest scrollable, avoids the
        // overflow:hidden device frame max-out problem.
        smartScrollInside(target, doc);
      }
      const restoreFlash = flash(target);
      setTimeout(() => { restoreFlash(); restoreShow(); }, FLASH_MS);
      // Mirror left after scroll settles (force-show may have shifted layout).
      setTimeout(mirrorScroll, 400);
    } catch (e) {
      status = 'cross-origin';
    }
    switch (status) {
      case 'visible':        break;
      case 'revealed':       showToast('元素預設隱藏 — 已強制顯示並 flash，' + (FLASH_MS / 1000) + ' 秒後復原'); break;
      case 'revealed-empty': showToast('元素為空容器（runtime 才填內容）— flash 到包覆它的可見區塊'); break;
      case 'cross-origin':   showToast('無法存取 iframe（cross-origin？確認是否走 http://127.0.0.1:8765）'); break;
      case 'not-found':      /* toast already shown above */ break;
    }
  }

  // Mark anchors whose selector doesn't resolve in the current after iframe,
  // so the designer doesn't waste a click. Also collapse fully-unresolvable
  // groups — diff-detected selectors that never appear in the post-change
  // DOM (e.g. inside a hidden search/demo panel) are pure noise for review.
  function annotateMissingAnchors() {
    panel.querySelectorAll('section.active .anchor').forEach(btn => {
      const sel = btn.dataset.selector;
      if (!sel) return;
      try {
        const doc = right.contentDocument || right.contentWindow.document;
        const hit = doc.querySelector(sel);
        btn.classList.toggle('miss', !hit);
        btn.title = hit ? ('跳到 ' + sel) : ('找不到 ' + sel + '（可能是 PR 新增 / 移除的元素）');
      } catch { /* ignore */ }
    });
    // Hide groups where every selector is .miss.
    panel.querySelectorAll('section.active li.sel-group').forEach(li => {
      const anchors = li.querySelectorAll('.anchor[data-selector]');
      if (!anchors.length) return;
      const allMiss = [...anchors].every(a => a.classList.contains('miss'));
      li.style.display = allMiss ? 'none' : '';
    });
    // Hide singleton .anchor li items whose selector is missing.
    panel.querySelectorAll('section.active > ul > li').forEach(li => {
      if (li.classList.contains('sel-group')) return;
      const a = li.querySelector('.anchor[data-selector]');
      if (a && a.classList.contains('miss')) li.style.display = 'none';
    });
  }

  // MD anchor: jump to a heading inside the rendered-markdown srcdoc iframes.
  // renderMd() assigns each heading id = slugify(text); we slugify the same way.
  // Uses multiple scroll methods because srcdoc iframes ignore scrollTo() silently
  // in some browsers — whichever wins, wins.
  function jumpToMdHeading(text) {
    const slug = slugify(text);
    let foundRight = false;
    [right, left].forEach(frame => {
      try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        const el = doc.getElementById(slug);
        if (!el) return;
        if (frame === right) foundRight = true;
        const rect = el.getBoundingClientRect();
        const win = frame.contentWindow;
        const docEl = doc.scrollingElement || doc.documentElement;
        const body = doc.body;
        const targetY = Math.max(0, docEl.scrollTop + rect.top - 20);
        try { el.scrollIntoView({ block: 'start' }); } catch {}
        try { docEl.scrollTop = targetY; } catch {}
        try { if (body) body.scrollTop = targetY; } catch {}
        try { win.scrollTo(0, targetY); } catch {}
        const restoreFlash = flash(el);
        setTimeout(restoreFlash, FLASH_MS);
      } catch { /* ignore */ }
    });
    if (!foundRight) showToast('找不到對應的 heading（' + text + '）');
  }

  // Anchor router: dispatch by attribute precedence — md-heading > selector > line.
  // Each branch shows a toast on miss (never silent).
  function jumpToLine(n) {
    const num = parseInt(n, 10);
    if (!Number.isFinite(num)) {
      showToast('line 號碼無效（' + n + '）');
      return;
    }
    if (right.dataset.perfCapped === '1') {
      showToast('檔案太大未表格化（> 500 KB），請手動翻');
      return;
    }
    let foundRight = false, foundLeft = false;
    // Suppress cross-pane sync during the smooth scroll so the animation
    // can complete without being cancelled by the sync handler round-trip.
    suppressSyncFor(800);
    [right, left].forEach(frame => {
      try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        const row = doc.querySelector('[data-line="' + num + '"]');
        if (!row) return;
        if (frame === right) foundRight = true;
        else foundLeft = true;
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const restoreFlash = flash(row);
        setTimeout(restoreFlash, FLASH_MS);
      } catch { /* ignore */ }
    });
    if (!foundRight && !foundLeft) {
      showToast('找不到第 ' + num + ' 行');
    } else if (!foundRight && foundLeft) {
      // Removed-only rule case — anchor's line only exists in BEFORE. Make this
      // explicit so the designer knows why only one side scrolled.
      showToast('跳到 BEFORE 第 ' + num + ' 行（這段在 AFTER 已移除）');
    }
  }

  // Group jump: opens the container ONCE for all child selectors, then flashes
  // every resolvable one simultaneously. Avoids the "individual click only shows
  // one selector at a time" problem when several share the same container.
  function jumpToGroup(selectors) {
    if (!Array.isArray(selectors) || !selectors.length) return;
    // Suppress cross-pane sync for the duration of the group's smooth scroll
    // + flash window so the animation isn't interrupted by the sync handler.
    suppressSyncFor(800);
    let doc;
    try { doc = right.contentDocument || right.contentWindow.document; }
    catch { showToast('無法存取 iframe（cross-origin？）'); return; }
    const hits = [];
    const missing = [];
    for (const sel of selectors) {
      try {
        const el = doc.querySelector(sel);
        if (el) hits.push({ sel, el }); else missing.push(sel);
      } catch { missing.push(sel); }
    }
    if (!hits.length) {
      showToast('群組內 selector 都找不到（' + selectors.length + ' 個）');
      return;
    }
    // Union of all hiders across hits + nuclear fallback if any target is still 0-sized.
    const hiderSet = new Set();
    for (const { el } of hits) for (const a of findHidingAncestors(el)) hiderSet.add(a);
    let restoreShow = temporarilyShow([...hiderSet]);
    hits.forEach(({ el }) => el.getBoundingClientRect()); // reflow
    const stillHidden = hits.filter(({ el }) => {
      const r = el.getBoundingClientRect();
      return r.width <= 1 && r.height <= 1;
    });
    if (stillHidden.length) {
      const allAnc = new Set();
      for (const { el } of stillHidden) {
        let p = el.parentElement;
        while (p && p !== doc.body) { allAnc.add(p); p = p.parentElement; }
        if (doc.body) allAnc.add(doc.body);
      }
      const restoreNuclear = temporarilyShow([...allAnc]);
      const prev = restoreShow;
      restoreShow = () => { restoreNuclear(); prev(); };
    }
    // Resolve final targets (fall back to nearest sized ancestor for empty containers).
    const flashTargets = hits.map(({ el }) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return ancestorWithSize(el) || el;
      return el;
    });
    // Scroll: aim for the inline targets' common ancestor with block:'start'
    // so a mixed group (tiny icon + section + fixed bottom card) lands at the
    // section's top instead of centering on a 18-px icon and pushing context
    // off-screen.
    const docEl = doc.scrollingElement || doc.documentElement;
    const isFixedAncestor = (t) => {
      let p = t;
      while (p && p.nodeType === 1 && p !== doc.body) {
        const cs = (p.ownerDocument.defaultView || window).getComputedStyle(p);
        if (cs.position === 'fixed' || cs.position === 'sticky') return true;
        p = p.parentElement;
      }
      return false;
    };
    const inlineTargets = flashTargets.filter(t => !isFixedAncestor(t));
    if (inlineTargets.length) {
      // Common ancestor of inline targets, walked up to a meaningful size.
      let focal = inlineTargets[0];
      for (let i = 1; i < inlineTargets.length; i++) {
        while (focal && !focal.contains(inlineTargets[i])) focal = focal.parentElement;
        if (!focal) { focal = doc.body; break; }
      }
      while (focal && focal !== doc.body) {
        const r = focal.getBoundingClientRect();
        if (r.height >= 40) break;
        focal = focal.parentElement;
      }
      smartScrollInside(focal || inlineTargets[0], doc);
    } else {
      // All targets are pinned/sticky overlays — reset scroll so they sit at natural position.
      try { docEl.scrollTo({ top: 0, behavior: 'smooth' }); } catch { docEl.scrollTop = 0; }
    }
    const restoreFlashes = flashTargets.map(flash);
    setTimeout(() => {
      restoreFlashes.forEach(fn => fn());
      restoreShow();
    }, FLASH_MS);
    setTimeout(mirrorScroll, 400);
    if (missing.length) {
      showToast('Flash ' + flashTargets.length + '/' + selectors.length + '；' + missing.length + ' 個找不到');
    }
  }

  // Build a markdown-friendly context blob for the clipboard. Designer pastes
  // into either Claude chat (then asks a question) or a GitHub PR comment
  // (then writes their review note). Single neutral format covers both —
  // no trailing "問題：" framing since that reads awkwardly in a comment.
  // String concatenation (not template strings) because this script is
  // embedded inside an outer Node template literal — backticks would collide.
  function buildAskPrompt(ctx) {
    const url = prMeta.url || '';
    const afterHost = url.split('github.com/')[1] || '';
    const repo = afterHost.split('/pull/')[0] || '';
    const prTag = (repo && prMeta.number) ? '[' + repo + '#' + prMeta.number + ']'
                : prMeta.number ? '[PR #' + prMeta.number + ']'
                : '';
    const head1Parts = [];
    if (prTag) head1Parts.push(prTag);
    if (ctx.file) head1Parts.push(ctx.file);
    if (ctx.line) head1Parts.push('L' + ctx.line);
    // Backticks here are escaped because this IIFE sits inside an outer Node
    // template literal — an unescaped backtick would terminate it. After one
    // level of unescaping the rendered JS emits markdown code-spans correctly.
    if (ctx.selector) head1Parts.push('\`' + ctx.selector + '\`');
    else if (ctx.mdHeading) head1Parts.push('heading: ' + ctx.mdHeading);
    const lines = [];
    if (head1Parts.length) lines.push(head1Parts.join(' · '));
    if (ctx.mediaContext) lines.push('Media context: \`' + ctx.mediaContext + '\`');
    if (ctx.type) {
      lines.push('Auto-detect: **' + ctx.type + '**'
        + (ctx.actual ? ' · \`' + ctx.actual + '\`' : ''));
    }
    if (ctx.snippet) lines.push('> \`' + ctx.snippet + '\`');
    // Trailing blank line so paste flows naturally into the designer's own text.
    lines.push('');
    // Double-backslash the newline escape: the outer Node template literal
    // consumes one level so the rendered JS source still has the escape and
    // produces real newlines at runtime.
    return lines.join('\\n');
  }

  async function copyAskContext(ctx) {
    const prompt = buildAskPrompt(ctx);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('已 copy 位置 context — 貼到 chat 問 agent 或貼到 PR comment 都可以');
    } catch {
      // Fallback for non-secure contexts: surface the text in a prompt() the
      // designer can Cmd-C from.
      try { window.prompt('複製下列文字後貼到 chat：', prompt); } catch {}
    }
  }

  panel.addEventListener('click', (e) => {
    const ask = e.target.closest('.ask-claude');
    if (ask) {
      e.preventDefault();
      e.stopPropagation();
      try {
        const ctx = JSON.parse(ask.dataset.ctx || '{}');
        copyAskContext(ctx);
      } catch {
        showToast('context 解析失敗');
      }
      return;
    }
    const g = e.target.closest('.anchor-group');
    if (g) {
      // Stop the click from toggling the parent <details> (button is inside <summary>).
      e.preventDefault();
      e.stopPropagation();
      try {
        const sels = JSON.parse(g.dataset.groupSelectors || '[]');
        // Force the group open so the user sees what's flashing.
        const det = g.closest('details');
        if (det && !det.open) det.open = true;
        jumpToGroup(sels);
      } catch {
        showToast('群組資料解析失敗');
      }
      return;
    }
    const a = e.target.closest('.anchor');
    if (!a) return;
    feedbackState.lastAnchorClick = {
      t: new Date().toISOString(),
      selector: a.dataset.selector || null,
      line: a.dataset.line || null,
      mdHeading: a.dataset.mdHeading || null,
      file: feedbackState.activeFile,
    };
    if (a.dataset.mdHeading) { jumpToMdHeading(a.dataset.mdHeading); return; }
    if (a.dataset.selector)  { jumpTo(a.dataset.selector); return; }
    if (a.dataset.line)      { jumpToLine(a.dataset.line); return; }
    showToast('anchor 沒有可解析的 target');
  });

  // Sync scroll between iframes when same-origin.
  //
  // Caveat: when a jump (jumpTo / jumpToLine / jumpToMdHeading) triggers a
  // smooth scrollIntoView on one pane, the FIRST 2-3 px of smooth animation
  // fires a scroll event that this handler propagates as an INSTANT scrollTo
  // on the opposite pane. The opposite pane's instant scroll fires its own
  // scroll event which (after one rAF) round-trips back and cancels the
  // ongoing smooth scroll on the original pane. Net result: smooth jumps
  // move ~2 px and stop, looking like "click does nothing".
  //
  // Fix: when a programmatic jump kicks off, set suppressSyncUntil to
  // now+800ms; the listener short-circuits while that window is open so the
  // smooth animation completes uninterrupted. User-initiated scrolls outside
  // that window sync normally.
  let syncing = false;
  let suppressSyncUntil = 0;
  function suppressSyncFor(ms) { suppressSyncUntil = Date.now() + ms; }
  function syncScroll(src, dst) {
    if (syncing) return;
    try {
      const s = src.contentWindow;
      const d = dst.contentWindow;
      s.addEventListener('scroll', () => {
        if (Date.now() < suppressSyncUntil) return;
        syncing = true;
        d.scrollTo(s.scrollX, s.scrollY);
        requestAnimationFrame(() => syncing = false);
      }, { passive: true });
    } catch { /* cross-origin or not ready */ }
  }
  left.addEventListener('load', () => syncScroll(left, right));
  right.addEventListener('load', () => syncScroll(right, left));

  // Initial
  // Activate the primary file (first non-augmented) on load; fall back to first card.
  if (primaryFile && filesMap[primaryFile]) show(primaryFile);
  else if (buttons[0]) show(buttons[0].dataset.file);
})();
</script>
</body>
</html>`;

  const outPath = path.join(workspace, `compare-${cluster}.html`);
  fs.writeFileSync(outPath, html);
  process.stdout.write(JSON.stringify({ written: outPath, cluster, files: files.length }));
}

main();
