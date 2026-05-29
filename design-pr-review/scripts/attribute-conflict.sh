#!/usr/bin/env bash
# attribute-conflict.sh — reusable conflict-attribution engine.
#
# For each conflicted file, work out WHO authored each side and WHAT KIND of change
# it is, so a human-facing flow (hie-rei /merge Conflict Resolution UX, or — Phase 2 —
# design-pr-review remote Stage 1.2) can say "On main: Stanley's CSS / On your branch:
# Mei's wording" instead of guessing.
#
# MVP scope:
#   - file-level author attribution (who last changed the file on each side)
#   - change_type via lib/classify-change.sh
#   - NO rules file → proposed_side is always null (surface facts only).
#     Phase 2 adds per-repo rule matching to fill proposed_side.
#
# Designed ref-agnostic so the same engine serves local (HEAD vs MERGE_HEAD/rebase)
# and future remote (PR base vs head) callers.
#
# Usage:
#   attribute-conflict.sh [--repo-root <path>] [--workspace <path>]
#                         [--ours-ref <ref>] [--theirs-ref <ref>]
#                         [--file <relpath>]            # repeatable; default = all unmerged
#
# Output: attribution.json (also echoed to stdout)
#   { "op": "merge|rebase|cherry-pick|unknown",
#     "ours_ref": "...", "theirs_ref": "...", "ours_is_you": true|false,
#     "files": [ { "path", "binary", "change_type",
#                  "ours":   {"author","confidence"},
#                  "theirs": {"author","confidence"},
#                  "proposed_side": null, "rule_matched": null } ] }

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/classify-change.sh
. "$SCRIPT_DIR/lib/classify-change.sh"

REPO_ROOT=""
WORKSPACE=""
OURS_REF=""
THEIRS_REF=""
declare -a ONLY_FILES=()

while [ $# -gt 0 ]; do
  case "$1" in
    --repo-root) REPO_ROOT="$2"; shift 2;;
    --workspace) WORKSPACE="$2"; shift 2;;
    --ours-ref) OURS_REF="$2"; shift 2;;
    --theirs-ref) THEIRS_REF="$2"; shift 2;;
    --file) ONLY_FILES+=("$2"); shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

# Resolve repo root.
if [ -z "$REPO_ROOT" ]; then
  REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
fi
[ -n "$REPO_ROOT" ] && [ -d "$REPO_ROOT/.git" ] || { echo "ERROR: not a git repo (use --repo-root)" >&2; exit 1; }

GIT() { git -C "$REPO_ROOT" "$@"; }

BASENAME="$(basename "$REPO_ROOT")"
WORKSPACE="${WORKSPACE:-/tmp/design-conflict-${BASENAME}}"
mkdir -p "$WORKSPACE"

# --- Determine operation kind + ours/theirs orientation ---
# merge:      HEAD = your branch (ours, :2:),  MERGE_HEAD = incoming (theirs, :3:)  → ours_is_you=true
# rebase:     HEAD = the base being replayed onto (main side, :2:),
#             REBASE_HEAD = your commit being applied (:3:)                          → ours_is_you=false
# cherry-pick: like merge for orientation                                            → ours_is_you=true
GITDIR="$(GIT rev-parse --git-dir 2>/dev/null)"
case "$GITDIR" in /*) : ;; *) GITDIR="$REPO_ROOT/$GITDIR";; esac

OP="unknown"
OURS_IS_YOU="true"
if [ -f "$GITDIR/MERGE_HEAD" ]; then
  OP="merge"; OURS_IS_YOU="true"
  [ -z "$THEIRS_REF" ] && THEIRS_REF="MERGE_HEAD"
elif [ -d "$GITDIR/rebase-merge" ] || [ -d "$GITDIR/rebase-apply" ]; then
  OP="rebase"; OURS_IS_YOU="false"
  if [ -z "$THEIRS_REF" ]; then
    if GIT rev-parse -q --verify REBASE_HEAD >/dev/null 2>&1; then
      THEIRS_REF="REBASE_HEAD"
    elif [ -f "$GITDIR/rebase-merge/stopped-sha" ]; then
      THEIRS_REF="$(cat "$GITDIR/rebase-merge/stopped-sha")"
    fi
  fi
elif [ -f "$GITDIR/CHERRY_PICK_HEAD" ]; then
  OP="cherry-pick"; OURS_IS_YOU="true"
  [ -z "$THEIRS_REF" ] && THEIRS_REF="CHERRY_PICK_HEAD"
fi
[ -z "$OURS_REF" ] && OURS_REF="HEAD"
[ -z "$THEIRS_REF" ] && THEIRS_REF="(unknown)"

# --- Collect conflicted files ---
declare -a FILES=()
if [ "${#ONLY_FILES[@]}" -gt 0 ]; then
  FILES=("${ONLY_FILES[@]}")
else
  while IFS= read -r f; do [ -n "$f" ] && FILES+=("$f"); done < <(GIT diff --name-only --diff-filter=U 2>/dev/null || true)
fi

# Merge-base for log-range attribution (best-effort; may fail mid-rebase).
MB=""
if [ "$THEIRS_REF" != "(unknown)" ]; then
  MB="$(GIT merge-base "$OURS_REF" "$THEIRS_REF" 2>/dev/null || true)"
fi

# dominant_author <ref> <file>
#   Prefer the merge-base..<ref> range (commits that side added since divergence);
#   fall back to the file's last commit on that ref. Echo "author<TAB>confidence".
dominant_author() {
  local ref="$1" file="$2" who=""
  if [ -n "$MB" ]; then
    who=$(GIT log --no-merges --format='%an' "$MB..$ref" -- "$file" 2>/dev/null \
          | sed '/^$/d' | sort | uniq -c | sort -rn | head -1 | sed -E 's/^[[:space:]]*[0-9]+[[:space:]]*//')
    if [ -n "$who" ]; then printf '%s\tlog-range' "$who"; return 0; fi
  fi
  who=$(GIT log -1 --format='%an' "$ref" -- "$file" 2>/dev/null || true)
  if [ -n "$who" ]; then printf '%s\tlast-commit' "$who"; return 0; fi
  printf '\tunknown'
}

# conflict_region_text <file>
#   Echo the combined text of all conflict hunks (between <<<<<<< and >>>>>>>) in the
#   working-tree file. If no markers (e.g. ref-only remote use), diff the stage blobs.
conflict_region_text() {
  local file="$1" full="$REPO_ROOT/$file"
  if [ -f "$full" ] && grep -qE '^<{7}( |$)' "$full" 2>/dev/null; then
    LC_ALL=C awk '
      /^<{7}( |$)/ {inblk=1; next}
      /^={7}$/     {next}
      /^>{7}( |$)/ {inblk=0; next}
      /^\|{7}( |$)/{base=1; next}      # diff3 base section start
      inblk && !base {print}
      /^>{7}( |$)/ {base=0}
    ' "$full"
    return 0
  fi
  # Fallback: diff the two staged blobs (works when no working-tree markers).
  diff <(GIT show ":2:$file" 2>/dev/null || true) \
       <(GIT show ":3:$file" 2>/dev/null || true) 2>/dev/null || true
}

# is_binary <file>
is_binary() {
  local file="$1"
  # A staged blob that grep flags as binary, or numstat showing '-' (binary) counts.
  if GIT show ":2:$file" 2>/dev/null | grep -qI . 2>/dev/null; then
    return 1   # has text → not binary
  fi
  # No text in :2: (could be empty or binary). Treat empty as text, binary as binary.
  local sz
  sz=$(GIT show ":2:$file" 2>/dev/null | wc -c | tr -d ' ')
  [ "${sz:-0}" -gt 0 ] && return 0 || return 1
}

ENTRIES="[]"
for file in "${FILES[@]}"; do
  ext="${file##*.}"
  ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"

  if is_binary "$file"; then
    binary="true"; change_type="binary"
  else
    binary="false"
    region="$(conflict_region_text "$file")"
    change_type="$(classify_change_region "$ext" "$region")"
  fi

  # `read` returns non-zero on a no-trailing-newline line; guard it under `set -e`.
  IFS=$'\t' read -r ours_author ours_conf < <(dominant_author "$OURS_REF" "$file") || true
  IFS=$'\t' read -r theirs_author theirs_conf < <(dominant_author "$THEIRS_REF" "$file") || true

  entry=$(jq -n \
    --arg path "$file" --arg binary "$binary" --arg ct "$change_type" \
    --arg oa "$ours_author" --arg oc "$ours_conf" \
    --arg ta "$theirs_author" --arg tc "$theirs_conf" \
    '{
       path: $path,
       binary: ($binary == "true"),
       change_type: $ct,
       ours:   { author: (if $oa == "" then null else $oa end), confidence: $oc },
       theirs: { author: (if $ta == "" then null else $ta end), confidence: $tc },
       proposed_side: null,
       rule_matched: null
     }')
  ENTRIES=$(jq -c --argjson e "$entry" '. + [$e]' <<<"$ENTRIES")
done

OUT=$(jq -n \
  --arg op "$OP" --arg ours "$OURS_REF" --arg theirs "$THEIRS_REF" \
  --arg oiy "$OURS_IS_YOU" --argjson files "$ENTRIES" \
  '{ op: $op, ours_ref: $ours, theirs_ref: $theirs,
     ours_is_you: ($oiy == "true"), files: $files }')

echo "$OUT" | tee "$WORKSPACE/attribution.json"
