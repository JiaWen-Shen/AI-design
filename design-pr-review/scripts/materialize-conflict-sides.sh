#!/usr/bin/env bash
# materialize-conflict-sides.sh — feed local merge-conflict sides into the existing
# compare-wrapper contract (before/ = ours side, after/ = theirs side).
#
# Reuses the same workspace layout fetch-pr.sh produces, so the unchanged Stage 3a
# chain (compute-html-diff.js → summarise-css-diff.js → make-compare-wrapper.js →
# verify-wrapper.sh → serve-compare.sh) renders the two conflict sides side by side.
#
# Strategy (faithful per-side trees — NOT HEAD for both):
#   1. git archive the OURS side's complete tree into before/, the THEIRS side's into
#      after/. Each pane then carries that side's own CSS/JS/assets, so a conflicted
#      HTML renders against the right dependencies (no cross-side bleed).
#   2. files.json = conflicted design-surface files, base_ok/head_ok per side from
#      whether the file exists in that side's tree (modify/delete → that side absent).
#   3. compare-meta.json = pane labels (+ author tags + conflict banner ONLY when a
#      single design file is materialized — a global banner can't honestly describe a
#      multi-file wrapper; the /merge 2b path always renders one --file at a time).
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

# --- Resolve per-side refs (prefer attribution.json; else detect) ---
ATTR="$WORKSPACE/attribution.json"
OURS_REF="HEAD"; THEIRS_REF=""; OURS_IS_YOU="true"
if [ -f "$ATTR" ]; then
  OURS_REF="$(jq -r '.ours_ref // "HEAD"' "$ATTR" 2>/dev/null)"
  THEIRS_REF="$(jq -r '.theirs_ref // ""' "$ATTR" 2>/dev/null)"
  # NB: jq's `//` treats `false` as empty, so `.ours_is_you // true` would wrongly yield
  # true for a rebase. Read raw and default only on null/missing.
  OURS_IS_YOU="$(jq -r '.ours_is_you' "$ATTR" 2>/dev/null)"
  case "$OURS_IS_YOU" in true|false) :;; *) OURS_IS_YOU="true";; esac
fi
[ "$THEIRS_REF" = "(unknown)" ] && THEIRS_REF=""
if [ -z "$THEIRS_REF" ]; then
  GITDIR="$(GIT rev-parse --git-dir 2>/dev/null)"; case "$GITDIR" in /*) :;; *) GITDIR="$REPO_ROOT/$GITDIR";; esac
  if [ -f "$GITDIR/MERGE_HEAD" ]; then THEIRS_REF="MERGE_HEAD"
  elif GIT rev-parse -q --verify REBASE_HEAD >/dev/null 2>&1; then THEIRS_REF="REBASE_HEAD"; fi
fi
THEIRS_OK="false"
if [ -n "$THEIRS_REF" ] && GIT rev-parse -q --verify "${THEIRS_REF}^{commit}" >/dev/null 2>&1; then THEIRS_OK="true"; fi

# --- 1. Faithful per-side trees ---
# Fully reset each side: `rm -rf -- *` skips dotfiles/dot-dirs, so a tracked hidden asset
# from a previous run would survive in the basename-reused workspace and render as stale
# current-side content. Remove and recreate the dirs so each tree contains only this side.
rm -rf "$WORKSPACE/before" "$WORKSPACE/after"
mkdir -p "$WORKSPACE/before" "$WORKSPACE/after"
GIT archive "$OURS_REF" | tar -x -C "$WORKSPACE/before"
if [ "$THEIRS_OK" = "true" ]; then GIT archive "$THEIRS_REF" | tar -x -C "$WORKSPACE/after"
else GIT archive HEAD | tar -x -C "$WORKSPACE/after"; fi

# --- 2. files.json (conflicted design-surface files; presence per side from its tree) ---
FILE_OUT="$WORKSPACE/files.json"
echo "[]" > "$FILE_OUT"
declare -a MATERIALIZED=()

for file in "${FILES[@]}"; do
  kind=$(classify "$file")
  case "$kind" in html|md|css|svg|img) :;; *) continue;; esac   # design surface only
  MATERIALIZED+=("$file")

  base_ok=false; head_ok=false
  GIT cat-file -e "${OURS_REF}:$file" 2>/dev/null && base_ok=true
  # ours side absent (ours deleted it) → archive didn't include it; make sure it's gone
  [ "$base_ok" = "false" ] && rm -f "$WORKSPACE/before/$file"

  if [ "$THEIRS_OK" = "true" ]; then
    GIT cat-file -e "${THEIRS_REF}:$file" 2>/dev/null && head_ok=true
    [ "$head_ok" = "false" ] && rm -f "$WORKSPACE/after/$file"
  else
    # Degraded fallback (theirs ref unresolvable): overlay the :3: stage blob onto the
    # HEAD-based after/ tree so at least the conflicted file shows the theirs content.
    mkdir -p "$WORKSPACE/after/$(dirname "$file")"
    tmpt=$(mktemp)
    if GIT show ":3:$file" > "$tmpt" 2>/dev/null; then mv "$tmpt" "$WORKSPACE/after/$file"; head_ok=true
    else rm -f "$tmpt" "$WORKSPACE/after/$file"; head_ok=false; fi
  fi

  tmp=$(mktemp)
  jq --arg path "$file" --arg kind "$kind" \
     --argjson base_ok "$base_ok" --argjson head_ok "$head_ok" \
     '. + [{path:$path, kind:$kind, stat:"0,0", base_ok:$base_ok, head_ok:$head_ok, augmented:false}]' \
     "$FILE_OUT" > "$tmp" && mv "$tmp" "$FILE_OUT"
done

# --- 3. compare-meta.json: pane labels (+ author/banner only for a single design file) ---
LEFT="Side A"; RIGHT="Side B"
LEFT_AUTHOR=""; RIGHT_AUTHOR=""; CHANGE_TYPE=""; INVOLVES_OTHER="false"; OTHER_AUTHOR=""; BANNER=""
if [ -f "$ATTR" ]; then
  if [ "$OURS_IS_YOU" = "false" ]; then
    LEFT="On main"; RIGHT="Your branch"          # rebase: before=main, after=your branch
  else
    LEFT="Your branch"; RIGHT="Incoming (main)"  # merge: before=your branch, after=incoming
  fi
  # Author tags + banner ONLY when exactly one design file is rendered — a single global
  # banner cannot honestly describe a multi-file wrapper (a later file may have a different
  # author). The /merge 2b flow always passes one --file, so it gets the banner.
  if [ "${#MATERIALIZED[@]}" -eq 1 ]; then
    FIRST="${MATERIALIZED[0]}"
    LEFT_AUTHOR=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.ours.author) // ""' "$ATTR" 2>/dev/null)
    RIGHT_AUTHOR=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.theirs.author) // ""' "$ATTR" 2>/dev/null)
    CHANGE_TYPE=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.change_type) // ""' "$ATTR" 2>/dev/null)
    INVOLVES_OTHER=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.involves_other_author) // false' "$ATTR" 2>/dev/null)
    OTHER_AUTHOR=$(jq -r --arg p "$FIRST" '(.files[]|select(.path==$p)|.other_author) // ""' "$ATTR" 2>/dev/null)
    if [ "$INVOLVES_OTHER" = "true" ] && [ -n "$OTHER_AUTHOR" ]; then
      BANNER="⚠ 此檔牽涉 ${OTHER_AUTHOR} 在 main 上的修改（${CHANGE_TYPE:-change}）— 下方 highlight 標出兩邊差異，紅=移除/綠=新增，請對照確認衝突處"
    fi
  fi
fi
jq -n --arg l "$LEFT" --arg r "$RIGHT" \
  --arg la "$LEFT_AUTHOR" --arg ra "$RIGHT_AUTHOR" --arg ct "$CHANGE_TYPE" \
  --arg io "$INVOLVES_OTHER" --arg banner "$BANNER" \
  --argjson multi "$( [ "${#MATERIALIZED[@]}" -gt 1 ] && echo true || echo false )" \
  '{ left_label: $l, right_label: $r, mode: "local-conflict", multi_file: $multi,
     left_author:  (if $la == "" then null else $la end),
     right_author: (if $ra == "" then null else $ra end),
     change_type:  (if $ct == "" then null else $ct end),
     involves_other: ($io == "true"),
     banner: (if $banner == "" then null else $banner end) }' \
  > "$WORKSPACE/compare-meta.json"

echo "Materialized ${#MATERIALIZED[@]} design file(s); ours=$OURS_REF theirs=$THEIRS_REF (ok=$THEIRS_OK)" >&2
echo "  left='$LEFT'($LEFT_AUTHOR)  right='$RIGHT'($RIGHT_AUTHOR)  banner=$([ -n "$BANNER" ] && echo yes || echo no)" >&2
cat "$FILE_OUT"
