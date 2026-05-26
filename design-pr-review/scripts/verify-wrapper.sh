#!/usr/bin/env bash
# verify-wrapper.sh — Stage 3a post-build verification.
# Runs a battery of static invariant checks against the artifacts produced by
# fetch-pr → auto-detect-violations → compute-html-diff → summarise-css-diff →
# make-compare-wrapper. Catches the build-time + data-shape bug classes that
# accumulated across recent PR runs (template-literal escape collisions,
# scope leaks, parser regressions, null-line anchors, missing-file fallthroughs).
#
# Usage:
#   verify-wrapper.sh --workspace /tmp/design-review-<N> --cluster <name>
#                     [--strict]
#
# Behaviour:
#   - Each check prints PASS/FAIL/WARN to stdout with rationale.
#   - Exits 0 only when every FAIL-level check passes (WARNs don't block).
#   - --strict turns WARNs into FAILs (use for pre-release sign-off).
#
# Adding a new invariant: copy an existing assert_* block, give it a slug name,
# call it from main(). Keep each check focused on ONE bug class so the failure
# message tells the operator what regression it caught.
#
# Implementation note: node helpers are written to temp files (not heredoc
# inside command substitution) because bash 3.2 (default on macOS) mis-lexes
# heredoc bodies containing " when nested in $(...).

set -euo pipefail

WORKSPACE=""
CLUSTER=""
STRICT=0

while [ $# -gt 0 ]; do
  case "$1" in
    --workspace) WORKSPACE="$2"; shift 2;;
    --cluster)   CLUSTER="$2";   shift 2;;
    --strict)    STRICT=1;       shift;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

[ -z "$WORKSPACE" ] && { echo "ERROR: --workspace required" >&2; exit 64; }
[ -z "$CLUSTER" ]   && { echo "ERROR: --cluster required"   >&2; exit 64; }

WRAPPER="$WORKSPACE/compare-${CLUSTER}.html"
FILES_JSON="$WORKSPACE/files.json"
VIOL_JSON="$WORKSPACE/violations.json"
CSS_JSON="$WORKSPACE/css-diff.json"

for f in "$WRAPPER" "$FILES_JSON"; do
  [ -f "$f" ] || { echo "ERROR: missing $f — run the build first" >&2; exit 1; }
done

# Stash node helpers in a tmpdir we clean up at the end.
HELPER_DIR=$(mktemp -d)
trap 'rm -rf "$HELPER_DIR"' EXIT

FAILS=0
WARNS=0

pass() { printf '  ✓ %s\n' "$1"; }
fail() { printf '  ✗ %s — %s\n' "$1" "$2"; FAILS=$((FAILS+1)); }
warn() {
  if [ "$STRICT" -eq 1 ]; then
    printf '  ✗ %s (strict) — %s\n' "$1" "$2"; FAILS=$((FAILS+1));
  else
    printf '  ⚠ %s — %s\n' "$1" "$2"; WARNS=$((WARNS+1));
  fi
}

# ── Helper A: extract IIFE script + run node --check on it ─────────────
cat > "$HELPER_DIR/check_iife.js" <<'NODE'
const fs = require('fs');
const os = require('os');
const wrapperPath = process.argv[2];
const html = fs.readFileSync(wrapperPath, 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
if (scripts.length < 3) {
  console.error('expected >=3 <script> blocks, found ' + scripts.length);
  process.exit(2);
}
const body = scripts[scripts.length - 1]
  .replace(/^<script>/, '').replace(/<\/script>$/, '');
const tmp = os.tmpdir() + '/_verify_iife_' + process.pid + '.js';
fs.writeFileSync(tmp, body);
try {
  require('child_process').execFileSync(
    process.execPath, ['--check', tmp], { stdio: ['ignore', 'ignore', 'pipe'] }
  );
  console.log(body.length);
  process.exit(0);
} catch (e) {
  const stderr = (e.stderr || '').toString();
  console.error(stderr.split('\n').slice(0, 5).join('\n'));
  process.exit(1);
} finally {
  try { fs.unlinkSync(tmp); } catch {}
}
NODE

# ── Helper B: extract cluster file list from filesMap in wrapper ───────
cat > "$HELPER_DIR/extract_files_map.js" <<'NODE'
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const m = html.match(/const filesMap = (\{[\s\S]*?\});/);
if (!m) process.exit(0);
try {
  const obj = JSON.parse(m[1]);
  console.log(Object.keys(obj).join('\n'));
} catch {}
NODE

# ── Helper C: count .anchor buttons missing a resolvable data-* attr ───
cat > "$HELPER_DIR/check_anchor_attrs.js" <<'NODE'
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const re = /<button class="anchor(?:[^"]*)?"([^>]*)>/g;
let m, orphans = 0, total = 0;
while ((m = re.exec(html)) !== null) {
  total++;
  const attrs = m[1];
  const ok = /data-(line|selector|md-heading|group-selectors)=/.test(attrs);
  if (!ok) orphans++;
}
console.log(JSON.stringify({ total, orphans }));
NODE

# ── Helper D: SVG sizing-only inline-style check (replaces fragile jq) ──
cat > "$HELPER_DIR/check_svg_carveout.js" <<'NODE'
const fs = require('fs');
const v = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let leaks = 0;
for (const x of v) {
  if (x.type !== 'inline-style') continue;
  const s = x.snippet || '';
  if (!/^[\s\S]*<svg[^>]+style="[^"]+"/.test(s)) continue;
  const m = s.match(/style="([^"]+)"/);
  if (!m) continue;
  const props = m[1].split(';').map(p => p.trim().split(':')[0].trim()).filter(Boolean);
  const sizingOnly = props.length > 0 && props.every(p => p === 'width' || p === 'height');
  if (sizingOnly) leaks++;
}
console.log(leaks);
NODE

# ── Helper E: direct/augmented consistency check ────────────────────────
cat > "$HELPER_DIR/check_direct_augmented.js" <<'NODE'
const fs = require('fs');
const filesIdx = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const violations = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const augMap = new Map();
for (const f of filesIdx) augMap.set(f.path, !!f.augmented);
let bad = 0;
for (const v of violations) {
  if (v.source === 'direct' && augMap.get(v.file) === true) bad++;
}
console.log(bad);
NODE

echo "🔎 verify-wrapper: workspace=$WORKSPACE cluster=$CLUSTER"
echo

# ───────────────────────────────────────────────────────────────────────
# [A] Build-time syntax
# ───────────────────────────────────────────────────────────────────────
echo "── [A] build-time syntax ──"

if iife_out=$(node "$HELPER_DIR/check_iife.js" "$WRAPPER" 2>&1); then
  pass "wrapper IIFE <script> passes node --check (${iife_out} chars)"
else
  fail "wrapper IIFE <script> has syntax errors" "$iife_out"
fi

if grep -q '<!doctype html>' "$WRAPPER" && grep -q '</html>' "$WRAPPER"; then
  pass "wrapper has well-formed doctype + close tag"
else
  fail "wrapper missing doctype or close tag" "template likely truncated"
fi

echo

# ───────────────────────────────────────────────────────────────────────
# [B] Workspace consistency
# ───────────────────────────────────────────────────────────────────────
echo "── [B] workspace consistency ──"

# B1: every cluster file in filesMap exists on disk
cluster_files=$(node "$HELPER_DIR/extract_files_map.js" "$WRAPPER" 2>/dev/null || true)
if [ -n "$cluster_files" ]; then
  missing=""
  total_cluster=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    total_cluster=$((total_cluster + 1))
    if [ ! -f "$WORKSPACE/before/$f" ] && [ ! -f "$WORKSPACE/after/$f" ]; then
      missing="${missing}${missing:+, }$f"
    fi
  done <<< "$cluster_files"
  if [ -z "$missing" ]; then
    pass "all $total_cluster cluster files exist in before/ or after/"
  else
    fail "cluster file(s) missing from disk" "$missing"
  fi
else
  warn "could not parse filesMap from wrapper" "skipping cluster existence check"
fi

# B2: every violation.file is in files.json
if [ -f "$VIOL_JSON" ]; then
  leak_count=$(jq -r --slurpfile fi "$FILES_JSON" '
    ($fi[0] | map(.path) | unique) as $known |
    [.[] | select(.file as $f | $known | index($f) | not)] | length
  ' "$VIOL_JSON" 2>/dev/null || echo "ERR")
  case "$leak_count" in
    0)   pass "all violations.file paths are in files.json";;
    ERR) warn "could not check violation scope" "jq failed";;
    *)   fail "violations.json has files not in files.json" "$leak_count entries — scope leak regression";;
  esac

  # B3: direct-flagged violations match augmented=false
  if bad=$(node "$HELPER_DIR/check_direct_augmented.js" "$FILES_JSON" "$VIOL_JSON" 2>/dev/null); then
    if [ "$bad" = "0" ]; then
      pass "every direct-flagged violation matches augmented=false"
    else
      fail "violation.source mismatch with files.json" "$bad entries — direct/indirect classification broke"
    fi
  else
    warn "could not check direct/augmented consistency" "helper failed"
  fi

  # B4: SVG sizing-only inline-style carve-out
  if leaks=$(node "$HELPER_DIR/check_svg_carveout.js" "$VIOL_JSON" 2>/dev/null); then
    if [ "$leaks" = "0" ]; then
      pass "SVG sizing-only carve-out holds"
    else
      fail "SVG sizing inline-style leaked into violations" "$leaks entries — carve-out regression"
    fi
  else
    warn "could not check SVG carve-out" "helper failed"
  fi
else
  warn "violations.json not present" "auto-detect-violations may have been skipped"
fi

# B5–B7: css-diff coverage + line quality + parser regression
if [ -f "$CSS_JSON" ]; then
  missing_css=$(jq -r --slurpfile cd "$CSS_JSON" '
    ($cd[0].files | map(.path) | unique) as $seen |
    [.[] | select(.kind == "css" and .base_ok == true and .head_ok == true)
         | select(.path as $p | $seen | index($p) | not)] | length
  ' "$FILES_JSON" 2>/dev/null || echo "ERR")
  case "$missing_css" in
    0)   pass "every CSS file in files.json appears in css-diff.json";;
    ERR) warn "could not check CSS coverage" "jq failed";;
    *)   fail "CSS files missing from css-diff.json" "$missing_css entries — summarise-css-diff dropped them";;
  esac

  null_line_sels=$(jq -r '
    [.files[].hunks[]?.perSelector[]?
      | select((.line // .lineBefore // .lineAfter) == null)] | length
  ' "$CSS_JSON" 2>/dev/null || echo "ERR")
  case "$null_line_sels" in
    0)   pass "every css-diff perSelector entry has a usable line anchor";;
    ERR) warn "could not check perSelector lines" "jq failed";;
    *)   fail "CSS perSelector entries with no line anchor at all" "$null_line_sels entries → 'no resolvable target' regression";;
  esac

  parser_empty=$(jq -r '
    [.files[] | select(.change == "modified"
      and ([.hunks[]?.perSelector[]?] | length) == 0)] | length
  ' "$CSS_JSON" 2>/dev/null || echo "ERR")
  case "$parser_empty" in
    0)   pass "no modified CSS file has 0 perSelector entries";;
    ERR) warn "could not check parser coverage" "jq failed";;
    *)   warn "$parser_empty CSS file(s) modified but parsed 0 selectors" "may be format-only; or parser regression";;
  esac
else
  warn "css-diff.json not present" "summarise-css-diff may have been skipped"
fi

echo

# ───────────────────────────────────────────────────────────────────────
# [B] Wrapper anchor quality
# ───────────────────────────────────────────────────────────────────────
echo "── [B] wrapper anchor quality ──"

# B8: every .anchor has resolvable data-* attr
if anchor_json=$(node "$HELPER_DIR/check_anchor_attrs.js" "$WRAPPER" 2>/dev/null); then
  total=$(echo "$anchor_json" | jq -r .total)
  orphans=$(echo "$anchor_json" | jq -r .orphans)
  if [ "$orphans" = "0" ]; then
    pass "all $total .anchor buttons have a resolvable data-* attr"
  else
    fail ".anchor buttons missing resolvable data-* attr" "$orphans of $total → no resolvable target on click"
  fi
else
  warn "could not parse anchor buttons" "wrapper structure may have changed"
fi

# Count pattern matches without tripping `set -o pipefail`. `grep | wc -l`
# returns wc's count on stdout AND grep exits 1 when no match — with
# pipefail that triggers a `|| echo 0` fallback that double-prints,
# leaving the variable as "0\n0" which breaks `[ "$v" -gt 0 ]`. awk
# always exits 0 and `+0` coerces missing to 0.
count_matches() { awk -v pat="$2" 'index($0, pat) {n++} END{print n+0}' "$1"; }

# B9: augmented HTML labelled CSS-only
# Count augmented HTML AMONG cluster files only — the wrapper renders one
# cluster at a time, so checking the whole files.json (which may have
# augmented files in other clusters) gives false positives.
aug_html_in_cluster=0
if [ -n "$cluster_files" ]; then
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    meta=$(jq -r --arg p "$f" 'first(.[] | select(.path == $p) | "\(.kind)|\(.augmented // false)")' "$FILES_JSON" 2>/dev/null)
    case "$meta" in
      html\|true) aug_html_in_cluster=$((aug_html_in_cluster + 1));;
    esac
  done <<< "$cluster_files"
fi
if [ "$aug_html_in_cluster" -gt 0 ]; then
  css_only_count=$(count_matches "$WRAPPER" 'CSS-only')
  if [ "$css_only_count" -gt 0 ]; then
    pass "augmented HTML labelled 'CSS-only' ($css_only_count hits, $aug_html_in_cluster files)"
  else
    fail "augmented HTML not labelled 'CSS-only'" "regressed to bare 'visual · 0 changed regions'"
  fi
else
  pass "no augmented HTML in cluster (CSS-only label N/A)"
fi

# B10: ask-claude buttons + flex layout
ask_count=$(count_matches "$WRAPPER" 'class="ask-claude"')
if [ "$ask_count" -gt 0 ]; then
  if grep -q 'li:has(.ask-claude)' "$WRAPPER" && grep -q 'display: flex' "$WRAPPER"; then
    pass "$ask_count ask-claude buttons + flex layout rule present"
  else
    fail "ask-claude buttons present but flex layout CSS missing" "button drops to next line"
  fi
else
  warn "no ask-claude buttons in wrapper" "L3 feedback infra missing"
fi

# B11: anchor:hover contrast override
if grep -q 'anchor:hover .css-rm' "$WRAPPER"; then
  pass "anchor:hover contrast override CSS present"
else
  warn "anchor:hover contrast override CSS missing" ".css-rm/add/chg may be invisible on hover bg"
fi

echo
echo "── summary ──"
echo "  FAIL: $FAILS   WARN: $WARNS"
if [ "$FAILS" -gt 0 ]; then
  echo "❌ wrapper failed verification — fix before showing to designer"
  exit 1
fi
if [ "$STRICT" -eq 1 ] && [ "$WARNS" -gt 0 ]; then
  echo "❌ strict mode: warnings treated as failures"
  exit 1
fi
echo "✅ wrapper passed verification"
exit 0
