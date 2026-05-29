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
declare -a MATERIALIZED=()   # design-surface files actually rendered (drives compare-meta below)

for file in "${FILES[@]}"; do
  kind=$(classify "$file")
  case "$kind" in html|md|css|svg|img) :;; *) continue;; esac   # design surface only
  MATERIALIZED+=("$file")

  mkdir -p "$WORKSPACE/before/$(dirname "$file")" "$WORKSPACE/after/$(dirname "$file")"
  # :2: = ours (before-pane), :3: = theirs (after-pane). For modify/delete or add/delete
  # conflicts one stage is ABSENT. Write via a temp file and only move on success; if the
  # stage is missing, REMOVE the destination (incl. the archived HEAD copy placed earlier)
  # so the wrapper renders that side as genuinely missing/deleted — never a fake 0-byte file.
  tmpb=$(mktemp); tmpt=$(mktemp)
  if GIT show ":2:$file" > "$tmpb" 2>/dev/null; then
    mv "$tmpb" "$WORKSPACE/before/$file"; base_ok=true
  else
    rm -f "$tmpb" "$WORKSPACE/before/$file"; base_ok=false
  fi
  if GIT show ":3:$file" > "$tmpt" 2>/dev/null; then
    mv "$tmpt" "$WORKSPACE/after/$file"; head_ok=true
  else
    rm -f "$tmpt" "$WORKSPACE/after/$file"; head_ok=false
  fi
  tmp=$(mktemp)
  jq --arg path "$file" --arg kind "$kind" \
     --argjson base_ok "$base_ok" --argjson head_ok "$head_ok" \
     '. + [{path:$path, kind:$kind, stat:"0,0", base_ok:$base_ok, head_ok:$head_ok, augmented:false}]' \
     "$FILE_OUT" > "$tmp" && mv "$tmp" "$FILE_OUT"
done

# --- 3. compare-meta.json: pane labels + per-file author tags + conflict banner ---
# Derive from attribution.json (if attribute-conflict.sh ran first); else generic.
# Author tags + banner use the first ACTUALLY-MATERIALIZED design file's attribution (not
# the raw FILES[0], which may be a skipped .js/.json conflict) — exact for the /merge 2b
# path (one --file at a time); approximate if several design files share a wrapper.
LEFT="Side A"; RIGHT="Side B"
LEFT_AUTHOR=""; RIGHT_AUTHOR=""; CHANGE_TYPE=""; INVOLVES_OTHER="false"; OTHER_AUTHOR=""; BANNER=""
ATTR="$WORKSPACE/attribution.json"
FIRST="${MATERIALIZED[0]:-}"
if [ -f "$ATTR" ]; then
  OURS_IS_YOU=$(jq -r '.ours_is_you' "$ATTR" 2>/dev/null || echo "true")
  if [ "$OURS_IS_YOU" = "false" ]; then
    LEFT="On main"; RIGHT="Your branch"   # rebase: before(:2:)=main, after(:3:)=your branch
  else
    LEFT="Your branch"; RIGHT="Incoming (main)"  # merge: before(:2:)=your branch, after(:3:)=incoming
  fi
  # before-pane = ours(:2:), after-pane = theirs(:3:)
  LEFT_AUTHOR=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.ours.author) // ""' "$ATTR" 2>/dev/null)
  RIGHT_AUTHOR=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.theirs.author) // ""' "$ATTR" 2>/dev/null)
  CHANGE_TYPE=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.change_type) // ""' "$ATTR" 2>/dev/null)
  INVOLVES_OTHER=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.involves_other_author) // false' "$ATTR" 2>/dev/null)
  OTHER_AUTHOR=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.other_author) // ""' "$ATTR" 2>/dev/null)
  if [ "$INVOLVES_OTHER" = "true" ] && [ -n "$OTHER_AUTHOR" ]; then
    BANNER="⚠ 此檔牽涉 ${OTHER_AUTHOR} 在 main 上的修改（${CHANGE_TYPE:-change}）— 下方 highlight 標出兩邊差異，紅=移除/綠=新增，請對照確認衝突處"
  fi
fi
jq -n --arg l "$LEFT" --arg r "$RIGHT" \
  --arg la "$LEFT_AUTHOR" --arg ra "$RIGHT_AUTHOR" --arg ct "$CHANGE_TYPE" \
  --arg io "$INVOLVES_OTHER" --arg banner "$BANNER" \
  '{ left_label: $l, right_label: $r, mode: "local-conflict",
     left_author:  (if $la == "" then null else $la end),
     right_author: (if $ra == "" then null else $ra end),
     change_type:  (if $ct == "" then null else $ct end),
     involves_other: ($io == "true"),
     banner: (if $banner == "" then null else $banner end) }' \
  > "$WORKSPACE/compare-meta.json"

echo "Materialized ${#FILES[@]} conflicted file(s) into $WORKSPACE/{before,after}" >&2
echo "  left='$LEFT'($LEFT_AUTHOR)  right='$RIGHT'($RIGHT_AUTHOR)  banner=$([ -n "$BANNER" ] && echo yes || echo no)" >&2
cat "$FILE_OUT"
