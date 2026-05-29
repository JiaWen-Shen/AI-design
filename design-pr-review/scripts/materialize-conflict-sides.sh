#!/usr/bin/env bash
# materialize-conflict-sides.sh — feed local merge-conflict sides into the existing
# compare-wrapper contract (before/ = ours/:2:, after/ = theirs/:3:).
#
# Reuses the same workspace layout fetch-pr.sh produces, so the unchanged Stage 3a
# chain (compute-html-diff.js → summarise-css-diff.js → make-compare-wrapper.js →
# verify-wrapper.sh → serve-compare.sh) renders the two conflict sides side by side.
#
# Strategy:
#   1. git archive HEAD into BOTH before/ and after/ → shared dependency tree
#      (CSS/JS/images resolve identically in both iframes).
#   2. Overlay the conflicted files: `git show :2:` into before/, `git show :3:` into after/
#      → only the conflicted files differ between the two sides.
#   3. files.json = conflicted design-surface files.
#   4. compare-meta.json = pane labels derived from attribution.json's ours_is_you.
#
# Usage:
#   materialize-conflict-sides.sh [--repo-root <path>] [--workspace <path>]
#                                 [--file <relpath>]   # repeatable; default = all unmerged

set -euo pipefail

REPO_ROOT=""
WORKSPACE=""
declare -a ONLY_FILES=()

while [ $# -gt 0 ]; do
  case "$1" in
    --repo-root) REPO_ROOT="$2"; shift 2;;
    --workspace) WORKSPACE="$2"; shift 2;;
    --file) ONLY_FILES+=("$2"); shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

if [ -z "$REPO_ROOT" ]; then
  REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
fi
[ -n "$REPO_ROOT" ] && [ -d "$REPO_ROOT/.git" ] || { echo "ERROR: not a git repo (use --repo-root)" >&2; exit 1; }
GIT() { git -C "$REPO_ROOT" "$@"; }

BASENAME="$(basename "$REPO_ROOT")"
WORKSPACE="${WORKSPACE:-/tmp/design-conflict-${BASENAME}}"
mkdir -p "$WORKSPACE/before" "$WORKSPACE/after"

classify() {
  case "$1" in
    *.html|*.htm) echo "html";;
    *.md)         echo "md";;
    *.css)        echo "css";;
    *.svg)        echo "svg";;
    *.png|*.jpg|*.jpeg|*.gif|*.webp) echo "img";;
    *.js|*.mjs|*.cjs|*.json|*.txt) echo "text";;
    *) echo "other";;
  esac
}

# --- Collect conflicted files ---
declare -a FILES=()
if [ "${#ONLY_FILES[@]}" -gt 0 ]; then
  FILES=("${ONLY_FILES[@]}")
else
  while IFS= read -r f; do [ -n "$f" ] && FILES+=("$f"); done < <(GIT diff --name-only --diff-filter=U 2>/dev/null || true)
fi
[ "${#FILES[@]}" -eq 0 ] && { echo "ERROR: no conflicted files" >&2; exit 1; }

# --- 1. Shared dependency tree: archive HEAD into both sides ---
( cd "$WORKSPACE/before" && rm -rf -- * 2>/dev/null || true; GIT archive HEAD | tar -x -C "$WORKSPACE/before" )
( cd "$WORKSPACE/after"  && rm -rf -- * 2>/dev/null || true; GIT archive HEAD | tar -x -C "$WORKSPACE/after" )

# --- 2. Overlay conflict sides + build files.json ---
FILE_OUT="$WORKSPACE/files.json"
echo "[]" > "$FILE_OUT"

for file in "${FILES[@]}"; do
  kind=$(classify "$file")
  case "$kind" in html|md|css|svg|img) :;; *) continue;; esac   # design surface only

  mkdir -p "$WORKSPACE/before/$(dirname "$file")" "$WORKSPACE/after/$(dirname "$file")"
  # :2: = ours (before-pane), :3: = theirs (after-pane). Either may be absent
  # (add/delete conflict) — leave the archived HEAD copy in that case.
  GIT show ":2:$file" > "$WORKSPACE/before/$file" 2>/dev/null || true
  GIT show ":3:$file" > "$WORKSPACE/after/$file"  2>/dev/null || true

  base_ok=$( [ -s "$WORKSPACE/before/$file" ] && echo true || echo false )
  head_ok=$( [ -s "$WORKSPACE/after/$file"  ] && echo true || echo false )
  tmp=$(mktemp)
  jq --arg path "$file" --arg kind "$kind" \
     --argjson base_ok "$base_ok" --argjson head_ok "$head_ok" \
     '. + [{path:$path, kind:$kind, stat:"0,0", base_ok:$base_ok, head_ok:$head_ok, augmented:false}]' \
     "$FILE_OUT" > "$tmp" && mv "$tmp" "$FILE_OUT"
done

# --- 3. compare-meta.json pane labels ---
# Derive from attribution.json (if attribute-conflict.sh ran first); else generic.
LEFT="Side A"; RIGHT="Side B"
ATTR="$WORKSPACE/attribution.json"
if [ -f "$ATTR" ]; then
  OURS_IS_YOU=$(jq -r '.ours_is_you' "$ATTR" 2>/dev/null || echo "true")
  if [ "$OURS_IS_YOU" = "false" ]; then
    # rebase: ours(:2:,before)=main side, theirs(:3:,after)=your branch
    LEFT="On main"; RIGHT="Your branch"
  else
    # merge: ours(:2:,before)=your branch, theirs(:3:,after)=incoming (main)
    LEFT="Your branch"; RIGHT="Incoming (main)"
  fi
fi
jq -n --arg l "$LEFT" --arg r "$RIGHT" \
  '{ left_label: $l, right_label: $r, mode: "local-conflict" }' \
  > "$WORKSPACE/compare-meta.json"

echo "Materialized ${#FILES[@]} conflicted file(s) into $WORKSPACE/{before,after}" >&2
echo "  left='$LEFT'  right='$RIGHT'" >&2
cat "$FILE_OUT"
