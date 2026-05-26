#!/usr/bin/env bash
# auto-detect-violations.sh — Stage 0.5 of design-pr-review.
# Mechanical scan of design-surface files for catalog-detectable issues.
# No LLM. Pure grep / awk against repo's rubric source files (style.md / design-conventions.md).
#
# Usage:
#   auto-detect-violations.sh --pr <N> [--workspace <path>] [--repo-root <path>]
#
# Output: JSON array of findings
#   [{file, line, type, expected, actual, snippet}]
#
# Detection rules (each rule contributes findings independently):
#   - hex-hardcoded: literal #rgb / #rrggbb in HTML/CSS when style.md defines color tokens
#   - non-token-font-size: font-size: <value> not in style.md type scale
#   - non-token-spacing:   padding/margin/gap with raw px not in style.md spacing scale
#   - md-class-orphan:     MD spec mentions `.class` not found in any HTML
#   - inline-style-hardcoded: inline style="..." with literal value bypassing tokens (warn)
#   - inline-style-tokenized: inline style="..." that uses var(--token) (nit — only placement violates)
#   - inline-style-state:     inline style="..." that's just a JS-driven state toggle (nit)
#
# Rules are deliberately conservative — false positives waste designer attention.

set -euo pipefail

PR=""
WORKSPACE=""
REPO_ROOT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --pr) PR="$2"; shift 2;;
    --workspace) WORKSPACE="$2"; shift 2;;
    --repo-root) REPO_ROOT="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

[ -z "$PR" ] && { echo "ERROR: --pr is required" >&2; exit 64; }
WORKSPACE="${WORKSPACE:-/tmp/design-review-${PR}}"
AFTER="$WORKSPACE/after"
[ -d "$AFTER" ] || { echo "ERROR: $AFTER not found; run fetch-pr.sh first" >&2; exit 1; }

# Locate rubric source files. Search inside $AFTER first (PR may have added them),
# then in $REPO_ROOT, then skip silently if absent (rule disabled).
find_rubric() {
  local name="$1"
  for base in "$AFTER" "$REPO_ROOT"; do
    [ -z "$base" ] && continue
    local hit
    hit=$(find "$base" -type f -name "$name" 2>/dev/null | head -1)
    [ -n "$hit" ] && { echo "$hit"; return 0; }
  done
  return 1
}

STYLE_MD=$(find_rubric "style.md" || true)
CONVENTIONS_MD=$(find_rubric "design-conventions.md" || true)

# Extract color tokens (`--color-*: #hex` or `#hex` listed in markdown table)
EXTRACT_TOKENS=()
if [ -n "$STYLE_MD" ]; then
  # CSS custom properties: --color-foo: #112233
  while IFS= read -r tok; do EXTRACT_TOKENS+=("$tok"); done < <(
    grep -oE '\-\-color[-a-zA-Z0-9_]*' "$STYLE_MD" | sort -u
  )
fi

# Extract spacing scale ints (px values from style.md spacing section)
SPACING_SCALE=()
if [ -n "$STYLE_MD" ]; then
  while IFS= read -r v; do SPACING_SCALE+=("$v"); done < <(
    awk '/spacing|--spacing/{flag=1} flag{print}' "$STYLE_MD" \
      | grep -oE '[0-9]+px' | sort -u
  )
fi

# Extract font-size scale
TYPE_SCALE=()
if [ -n "$STYLE_MD" ]; then
  while IFS= read -r v; do TYPE_SCALE+=("$v"); done < <(
    awk '/font|--font|type-scale/{flag=1} flag{print}' "$STYLE_MD" \
      | grep -oE '[0-9]+px' | sort -u
  )
fi

TMP_FINDINGS=$(mktemp)
: > "$TMP_FINDINGS"   # NDJSON: one finding per line, merged at end.

# --- Scope: build absolute-path lists from files.json (direct + indirect) ---
# Each rule scans only these paths. Findings tagged `source` so panel can split direct vs
# indirect (indirect = HTML/CSS consumers of changed CSS/JS, auto-detected by fetch-pr.sh).
FILES_JSON="$WORKSPACE/files.json"
[ -f "$FILES_JSON" ] || { echo "ERROR: $FILES_JSON not found; run fetch-pr.sh first" >&2; exit 1; }

declare -a SCAN_HTML=() SCAN_CSS=() SCAN_MD=()
# Lookup-only corpus for md-class-orphan — includes indirect (augmented) consumers
# so a class defined in an untouched consumer HTML still counts as "defined".
declare -a LOOKUP_HTML_CSS=()
# path → "direct" or "indirect", and via (only for indirect)
get_source() { jq -r --arg p "$1" 'first(.[] | select(.path == $p) | (if .augmented then "indirect" else "direct" end)) // "direct"' "$FILES_JSON"; }
get_via()    { jq -r --arg p "$1" 'first(.[] | select(.path == $p) | (.augmented_via // ""))' "$FILES_JSON"; }

# Findings are only emitted on direct files: indirect (augmented) files weren't
# changed by this PR, so flagging pre-existing markup there is pure noise.
while IFS=$'\t' read -r relpath kind augmented; do
  full="$AFTER/$relpath"
  [ -f "$full" ] || continue
  case "$kind" in
    html|css)
      LOOKUP_HTML_CSS+=("$full")
      ;;
  esac
  [ "$augmented" = "true" ] && continue
  case "$kind" in
    html) SCAN_HTML+=("$full");;
    css)  SCAN_CSS+=("$full");;
    md)   SCAN_MD+=("$full");;
  esac
done < <(jq -r '.[] | [.path, .kind, (.augmented // false | tostring)] | @tsv' "$FILES_JSON")

# Combined html+css list for rules that span both (hex / token / spacing / font-size).
# Use `${arr[@]+"${arr[@]}"}` to safely expand empty arrays under `set -u`.
declare -a SCAN_HTML_CSS=()
SCAN_HTML_CSS+=(${SCAN_HTML[@]+"${SCAN_HTML[@]}"})
SCAN_HTML_CSS+=(${SCAN_CSS[@]+"${SCAN_CSS[@]}"})

# Bail early when no files at all — emit empty array and exit clean.
if [ "${#SCAN_HTML[@]}" -eq 0 ] && [ "${#SCAN_CSS[@]}" -eq 0 ] && [ "${#SCAN_MD[@]}" -eq 0 ]; then
  echo "[]"
  rm -f "$TMP_FINDINGS"
  exit 0
fi

add_finding() {
  # add_finding <file> <line> <type> <expected> <actual> <snippet>
  # Skip if line is not a positive integer (defensive against malformed grep output).
  case "$2" in
    ''|*[!0-9]*) return 0 ;;
  esac
  local src via
  src=$(get_source "$1")
  via=$(get_via "$1")
  if [ "$src" = "indirect" ]; then
    jq -c -n \
       --arg file "$1" --argjson line "$2" --arg type "$3" \
       --arg expected "$4" --arg actual "$5" --arg snippet "$6" \
       --arg via "$via" \
       '{file:$file, line:$line, type:$type, expected:$expected, actual:$actual, snippet:$snippet, source:"indirect", via:$via}' \
       >> "$TMP_FINDINGS"
  else
    jq -c -n \
       --arg file "$1" --argjson line "$2" --arg type "$3" \
       --arg expected "$4" --arg actual "$5" --arg snippet "$6" \
       '{file:$file, line:$line, type:$type, expected:$expected, actual:$actual, snippet:$snippet, source:"direct"}' \
       >> "$TMP_FINDINGS"
  fi
}

# --- Rule: hex-hardcoded ---
# Trigger when style.md exists and defines color tokens.
if [ "${#EXTRACT_TOKENS[@]}" -gt 0 ] && [ "${#SCAN_HTML_CSS[@]}" -gt 0 ]; then
  pattern='#[0-9a-fA-F]{6}([^0-9a-fA-F]|$)'
  grep -HnE "$pattern" "${SCAN_HTML_CSS[@]}" 2>/dev/null | while IFS= read -r match; do
    [ -z "$match" ] && continue
    file=$(echo "$match" | cut -d: -f1)
    line=$(echo "$match" | cut -d: -f2)
    snippet=$(echo "$match" | cut -d: -f3- | sed 's/^[[:space:]]*//')
    hex=$(echo "$snippet" | grep -oE '#[0-9a-fA-F]{3,8}' | head -1)
    rel=${file#$AFTER/}
    add_finding "$rel" "$line" "hex-hardcoded" \
      "a token defined in style.md" "$hex" "$snippet"
  done || true
fi

# --- Rule: non-token-spacing ---
if [ "${#SPACING_SCALE[@]}" -gt 0 ] && [ "${#SCAN_HTML_CSS[@]}" -gt 0 ]; then
  allowed=$(printf '%s|' "${SPACING_SCALE[@]}")
  allowed="${allowed%|}"
  grep -HnE '(padding|margin|gap)[^;]*: *[0-9]+px' "${SCAN_HTML_CSS[@]}" 2>/dev/null | while IFS= read -r match; do
    [ -z "$match" ] && continue
    file=$(echo "$match" | cut -d: -f1)
    line=$(echo "$match" | cut -d: -f2)
    snippet=$(echo "$match" | cut -d: -f3- | sed 's/^[[:space:]]*//')
    val=$(echo "$snippet" | grep -oE '[0-9]+px' | head -1)
    echo "$val" | grep -qE "^($allowed)$" && continue
    rel=${file#$AFTER/}
    add_finding "$rel" "$line" "non-token-spacing" \
      "a value in style.md spacing scale: ${SPACING_SCALE[*]}" "$val" "$snippet"
  done || true
fi

# --- Rule: non-token-font-size ---
if [ "${#TYPE_SCALE[@]}" -gt 0 ] && [ "${#SCAN_HTML_CSS[@]}" -gt 0 ]; then
  allowed=$(printf '%s|' "${TYPE_SCALE[@]}")
  allowed="${allowed%|}"
  grep -HnE 'font-size: *[0-9]+px' "${SCAN_HTML_CSS[@]}" 2>/dev/null | while IFS= read -r match; do
    [ -z "$match" ] && continue
    file=$(echo "$match" | cut -d: -f1)
    line=$(echo "$match" | cut -d: -f2)
    snippet=$(echo "$match" | cut -d: -f3- | sed 's/^[[:space:]]*//')
    val=$(echo "$snippet" | grep -oE '[0-9]+px' | head -1)
    echo "$val" | grep -qE "^($allowed)$" && continue
    rel=${file#$AFTER/}
    add_finding "$rel" "$line" "non-token-font-size" \
      "a value in style.md type scale: ${TYPE_SCALE[*]}" "$val" "$snippet"
  done || true
fi

# --- Rule: inline-style attribute (sub-classified) ---
# A blanket "any inline style is a violation" produces too much noise: tokenized inline
# styles (style="color:var(--text3)") still respect the design system, and JS-driven
# state toggles (style="display:none") are awkward to move to CSS. Sub-classify the
# raw inline-style hit into one of three types so the panel + designer can triage:
#   - inline-style-hardcoded : style body contains a literal value that bypasses tokens
#                              (raw hex/rgb color, px/em literal not in token scale, etc.)
#                              — these are the true design-system-violating cases.
#   - inline-style-tokenized : style body uses var(--token); inline placement is the only
#                              violation. Lowest priority; many are legitimate (one-off).
#   - inline-style-state     : style body is a JS-driven state toggle only
#                              (display:none, visibility:hidden, opacity:0,
#                              pointer-events:none). Moving to CSS class is often worse
#                              than the inline; surface but de-prioritise.
#
# Carve-out: <svg style="width:Npx[;height:Mpx]"> is the standard HTML5 way to size
# inline SVG icons and is universally accepted in mockup repos. Flagging these wastes
# the designer's attention — every icon would fire. Skip when the matched element is
# an <svg> AND the style declarations are limited to width/height.
classify_inline_style() {
  # Args: style body (without style="..." wrapper)
  # Echoes one of: hardcoded / tokenized / state
  local body="$1"
  local has_token has_state has_hardcoded_color has_hardcoded_px

  has_token=$(echo "$body" | grep -cE 'var\(--' || true)
  # State-only properties: display/visibility/opacity/pointer-events that resolve to
  # "off" values. Mixed with anything else, fall through to hardcoded/tokenized.
  has_state=$(echo "$body" | tr ';' '\n' | sed -E 's/^[[:space:]]+//' | grep -cE '^(display:[[:space:]]*none|visibility:[[:space:]]*hidden|opacity:[[:space:]]*0(\.0+)?|pointer-events:[[:space:]]*none)$' || true)
  # Count of declarations (non-empty after split on ;)
  local n_props
  n_props=$(echo "$body" | tr ';' '\n' | sed -E 's/^[[:space:]]+//' | grep -cE '.+:.+' || true)
  has_hardcoded_color=$(echo "$body" | grep -cE '(color|background)[^:]*:[[:space:]]*(#[0-9a-fA-F]{3,8}|rgb|hsl)' || true)
  has_hardcoded_px=$(echo "$body" | grep -cE ':[[:space:]]*-?[0-9]+(\.[0-9]+)?(px|em|rem)' || true)

  if [ "$has_state" -gt 0 ] && [ "$has_state" -eq "$n_props" ]; then
    echo "state"
  elif [ "$has_hardcoded_color" -gt 0 ] || [ "$has_hardcoded_px" -gt 0 ]; then
    echo "hardcoded"
  elif [ "$has_token" -gt 0 ]; then
    echo "tokenized"
  else
    # No tokens, no obvious literals — could be a JS-driven calc, a value like flex-shrink:0,
    # transform:rotate, etc. Treat as tokenized (low priority) since it's not violating tokens.
    echo "tokenized"
  fi
}

if [ "${#SCAN_HTML[@]}" -gt 0 ]; then
  grep -HnE ' style="[^"]+"' "${SCAN_HTML[@]}" 2>/dev/null | while IFS= read -r match; do
    [ -z "$match" ] && continue
    file=$(echo "$match" | cut -d: -f1)
    line=$(echo "$match" | cut -d: -f2)
    snippet=$(echo "$match" | cut -d: -f3- | sed 's/^[[:space:]]*//')
    # Skip <svg ... style="..."> when only width / height are present.
    if echo "$snippet" | grep -qE '<svg[^>]+style="[^"]+"'; then
      style_body=$(echo "$snippet" | grep -oE 'style="[^"]+"' | head -1 | sed -E 's/^style="//; s/"$//')
      # Strip whitespace, drop trailing ;, split on ;, keep property names only.
      props=$(echo "$style_body" | tr ';' '\n' | sed -E 's/^[[:space:]]+//; s/:.*$//' | tr -d ' ' | grep -v '^$' | sort -u)
      # Allowed props for svg sizing-only carve-out.
      non_sizing=$(echo "$props" | grep -vE '^(width|height)$' || true)
      [ -z "$non_sizing" ] && continue
    fi
    # Extract style body for sub-classification
    style_body=$(echo "$snippet" | grep -oE 'style="[^"]+"' | head -1 | sed -E 's/^style="//; s/"$//')
    subtype=$(classify_inline_style "$style_body")
    rel=${file#$AFTER/}
    case "$subtype" in
      hardcoded)
        add_finding "$rel" "$line" "inline-style-hardcoded" \
          "extract to a stylesheet and use a design token (literal value bypasses tokens)" \
          "inline style with hardcoded value" "$snippet"
        ;;
      tokenized)
        add_finding "$rel" "$line" "inline-style-tokenized" \
          "extract to a stylesheet (style uses tokens correctly, only the inline placement is the violation)" \
          "inline style attribute (tokens used)" "$snippet"
        ;;
      state)
        add_finding "$rel" "$line" "inline-style-state" \
          "consider a CSS class toggled by JS instead of inline state (low priority — inline is sometimes intentional)" \
          "JS-driven state toggle (display/visibility/opacity/pointer-events)" "$snippet"
        ;;
    esac
  done || true
fi

# --- Rule: conflict-marker ---
# Unresolved git merge markers in after-state files. The file is literally broken
# post-merge; rendering will fail or display garbage. Pattern is git's standard
# output: `<<<<<<< <ref>` at line start. Detecting the start marker is enough —
# one start marker per conflict block, so we won't double-emit for the same block.
# False-positive risk: a markdown doc explaining how merge conflicts look. Rare in
# design-handoff content; if it becomes a problem, add a carve-out for fenced code
# blocks. For now, trust that <<<<<<<<space> at line start is essentially never
# legitimate in HTML/CSS/MD design files.
declare -a SCAN_ALL=()
SCAN_ALL+=(${SCAN_HTML[@]+"${SCAN_HTML[@]}"})
SCAN_ALL+=(${SCAN_CSS[@]+"${SCAN_CSS[@]}"})
SCAN_ALL+=(${SCAN_MD[@]+"${SCAN_MD[@]}"})
if [ "${#SCAN_ALL[@]}" -gt 0 ]; then
  grep -HnE '^<{7}( |$)' "${SCAN_ALL[@]}" 2>/dev/null | while IFS= read -r match; do
    [ -z "$match" ] && continue
    file=$(echo "$match" | cut -d: -f1)
    line=$(echo "$match" | cut -d: -f2)
    snippet=$(echo "$match" | cut -d: -f3- | sed 's/^[[:space:]]*//')
    marker=$(echo "$snippet" | grep -oE '^<{7}[^[:space:]]*( [^[:space:]]+)?' | head -1)
    rel=${file#$AFTER/}
    add_finding "$rel" "$line" "conflict-marker" \
      "no unresolved merge conflict markers" "$marker" "$snippet"
  done || true
fi

# --- Rule: md-class-orphan ---
# Class mentioned in MD spec but not present in any direct OR indirect HTML/CSS file.
# Indirect (augmented) files participate in lookup so a class defined in an untouched
# consumer still counts as "defined" — otherwise we'd false-positive on every MD that
# references a stable class living in a consumer HTML the PR didn't touch.
if [ "${#SCAN_MD[@]}" -gt 0 ] && [ "${#LOOKUP_HTML_CSS[@]}" -gt 0 ]; then
  HTML_GREP="$WORKSPACE/.html-grep"
  cat "${LOOKUP_HTML_CSS[@]}" > "$HTML_GREP" 2>/dev/null
  grep -HnE '`\.[a-zA-Z][a-zA-Z0-9_-]+`' "${SCAN_MD[@]}" 2>/dev/null | while IFS= read -r match; do
    [ -z "$match" ] && continue
    file=$(echo "$match" | cut -d: -f1)
    line=$(echo "$match" | cut -d: -f2)
    snippet=$(echo "$match" | cut -d: -f3- | sed 's/^[[:space:]]*//')
    cls=$(echo "$snippet" | grep -oE '\`\.[a-zA-Z][a-zA-Z0-9_-]+\`' | head -1 | tr -d '`')
    [ -z "$cls" ] && continue
    name=${cls#.}
    grep -qE "(class=\"[^\"]*\b${name}\b|\.${name}\b)" "$HTML_GREP" && continue
    rel=${file#$AFTER/}
    add_finding "$rel" "$line" "md-class-orphan" \
      "a matching class in HTML/CSS" "$cls" "$snippet"
  done || true
  rm -f "$HTML_GREP"
fi

# --- Ignore list ---
# Optional .design-pr-review-ignore file at repo root (or inside the PR's after-state).
# Each non-empty non-comment line is "<rule>:<glob>":
#   inline-style-state:**           — skip all state-only inline styles
#   *:fixtures/**                   — skip everything under fixtures/
#   inline-style-tokenized:demo/**  — skip tokenized inline styles only in demo files
# Glob semantics follow Python fnmatch (shell-style): * matches any chars (including /),
# ? matches single char, [seq] matches a char in seq.
IGNORE_FILE=""
for base in "$AFTER" "$REPO_ROOT"; do
  [ -z "$base" ] && continue
  cand="$base/.design-pr-review-ignore"
  if [ -f "$cand" ]; then
    IGNORE_FILE="$cand"
    break
  fi
done

IGNORED_COUNT=0
if [ -n "$IGNORE_FILE" ] && [ -s "$TMP_FINDINGS" ]; then
  before_count=$(wc -l < "$TMP_FINDINGS" | tr -d ' ')
  FILTERED=$(mktemp)
  python3 - "$IGNORE_FILE" "$TMP_FINDINGS" > "$FILTERED" <<'PY'
import sys, json, fnmatch
with open(sys.argv[1]) as f:
    rules = []
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"): continue
        if ":" not in line: continue
        t, g = line.split(":", 1)
        rules.append((t.strip(), g.strip()))

def matches(entry):
    for t, g in rules:
        if (t == "*" or entry.get("type") == t) and fnmatch.fnmatch(entry.get("file", ""), g):
            return True
    return False

with open(sys.argv[2]) as f:
    for line in f:
        s = line.strip()
        if not s: continue
        try:
            e = json.loads(s)
        except Exception:
            print(s)
            continue
        if not matches(e):
            print(s)
PY
  mv "$FILTERED" "$TMP_FINDINGS"
  after_count=$(wc -l < "$TMP_FINDINGS" | tr -d ' ')
  IGNORED_COUNT=$((before_count - after_count))
fi

# Count findings before cleanup for the event log.
FINDING_COUNT=$(wc -l < "$TMP_FINDINGS" 2>/dev/null | tr -d ' ' || echo 0)
# grep -c outputs the count (0 or N) AND exits 1 when count == 0. The previous form
# `... || echo 0` appended a second "0" on top of grep's "0", giving "0\n0" which
# then broke arithmetic `[ "$CONFLICT_COUNT" -gt 0 ]`. Use `|| true` to swallow the
# exit code without polluting stdout.
CONFLICT_COUNT=$(grep -c '"type":"conflict-marker"' "$TMP_FINDINGS" 2>/dev/null || true)
[ -z "$CONFLICT_COUNT" ] && CONFLICT_COUNT=0

# Emit final: NDJSON → JSON array, with severity tier added per-rule.
#
# Severity model:
#   block — must fix before merge (conflict-marker — file is literally broken)
#   warn  — true design-system violation (hardcoded value, missing class, etc.)
#   nit   — convention violation but design intent is preserved (tokenized inline,
#           JS-driven state toggle, non-token spacing/typography under prototype churn)
#
# Mapping is intentionally narrow: only conflict-marker is block, only the
# "literal value bypasses tokens" rules are warn. Everything else is nit so the
# review panel surfaces it without crying wolf. Designers escalate nit → warn in
# their flag decision when context calls for it.
if [ -s "$TMP_FINDINGS" ]; then
  jq -s '
    map(. + {
      severity: (
        if .type == "conflict-marker" then "block"
        elif .type == "inline-style-hardcoded" or .type == "hex-hardcoded" or .type == "md-class-orphan" then "warn"
        else "nit"
        end
      )
    })
  ' "$TMP_FINDINGS"
else
  echo "[]"
fi
rm -f "$TMP_FINDINGS"

# --- Event log to stderr (machine-readable for hooks / subagent dispatch) ---
{
  echo "[SCRIPT: auto-detect-violations]"
  echo "event: scan_complete"
  echo "status: clean"
  echo "decision: pass"
  if [ "$IGNORED_COUNT" -gt 0 ]; then
    echo "reason: $FINDING_COUNT findings ($CONFLICT_COUNT conflict-marker, rest catalog rules); $IGNORED_COUNT filtered by .design-pr-review-ignore"
  else
    echo "reason: $FINDING_COUNT findings ($CONFLICT_COUNT conflict-marker, rest catalog rules)"
  fi
  if [ "$CONFLICT_COUNT" -gt 0 ]; then
    echo "action: SKILL.md Stage 1.2 early-surface conflict-marker findings before cluster walk"
  else
    echo "action: Findings feed into Stage 3d per-cluster enumeration"
  fi
} >&2
