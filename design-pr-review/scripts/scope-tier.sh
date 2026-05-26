#!/usr/bin/env bash
# scope-tier.sh — Stage 0 of design-pr-review.
# Mechanically compute PR scope tier + idempotent resume check.
# No LLM. Pure shell + gh CLI.
#
# Usage:
#   scope-tier.sh --pr <N> [--repo <owner/repo>] [--format json|env] [--workspace <path>]
#
# Output (default json):
#   { pr, repo, tier, design_surface, counts: {html,md,css,img,other}, loc,
#     scratchpad_exists, scratchpad_path, workspace }

set -euo pipefail

PR=""
REPO=""
FORMAT="json"
WORKSPACE=""
FIXTURE=""
TEST_MODE="${TEST_MODE:-0}"

while [ $# -gt 0 ]; do
  case "$1" in
    --pr) PR="$2"; shift 2;;
    --repo) REPO="$2"; shift 2;;
    --format) FORMAT="$2"; shift 2;;
    --workspace) WORKSPACE="$2"; shift 2;;
    --fixture) FIXTURE="$2"; TEST_MODE=1; shift 2;;
    --test) TEST_MODE=1; shift;;
    -h|--help)
      sed -n '2,12p' "$0"; exit 0;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

# In test mode, --fixture is required and PR/REPO are read from fixture.
if [ "$TEST_MODE" = "1" ]; then
  [ -z "$FIXTURE" ] && { echo "ERROR: --fixture required in test mode" >&2; exit 64; }
  [ -f "$FIXTURE" ] || { echo "ERROR: fixture not found: $FIXTURE" >&2; exit 1; }
  # Pull PR/REPO from fixture if not provided.
  [ -z "$PR" ] && PR=$(jq -r '.number // empty' "$FIXTURE")
  [ -z "$REPO" ] && REPO=$(jq -r '.repo // "test/test"' "$FIXTURE")
fi

if [ -z "$PR" ]; then
  echo "ERROR: --pr is required" >&2
  exit 64
fi

# Allow PR to be a full URL (extract number + repo)
if [[ "$PR" =~ ^https?://github\.com/([^/]+/[^/]+)/pull/([0-9]+) ]]; then
  REPO="${REPO:-${BASH_REMATCH[1]}}"
  PR="${BASH_REMATCH[2]}"
fi

# Default repo from cwd if not given
if [ -z "$REPO" ]; then
  REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || true)
  if [ -z "$REPO" ]; then
    echo "ERROR: --repo is required (cannot infer from cwd)" >&2
    exit 64
  fi
fi

WORKSPACE="${WORKSPACE:-/tmp/design-review-${PR}}"
mkdir -p "$WORKSPACE"

# --- Fetch metadata ---
META_FILE="$WORKSPACE/pr-meta.json"
if [ "$TEST_MODE" = "1" ]; then
  # Test mode: load fixture instead of hitting gh.
  cp "$FIXTURE" "$META_FILE"
else
  if ! gh pr view "$PR" --repo "$REPO" \
         --json number,title,body,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,files,author,commits,url \
         > "$META_FILE" 2>"$WORKSPACE/pr-meta.err"; then
    echo "ERROR: gh pr view failed for $REPO#$PR" >&2
    cat "$WORKSPACE/pr-meta.err" >&2
    exit 1
  fi
fi

ALL_FILES=$(jq -r '.files[].path' "$META_FILE")

# --- Draft / DO NOT MERGE signal detection ---
# Convention defined in hie-rei CLAUDE.md › "PR States — Draft / DO NOT MERGE".
# Mechanical detection only: is_draft from GitHub flag, do_not_merge from title prefix.
IS_DRAFT=$(jq -r '.isDraft // false' "$META_FILE")
PR_TITLE=$(jq -r '.title // ""' "$META_FILE")
PR_BODY=$(jq -r '.body // ""' "$META_FILE")
# Match the documented prefix `DO NOT MERGE:` (case-insensitive) plus a couple of
# common variants that show up in the wild. Anchored to the title's start because
# the convention is a prefix; we still scan body as a fallback since some authors
# put it in the description by accident.
DO_NOT_MERGE=false
if echo "$PR_TITLE" | grep -qiE "^(DO NOT MERGE|DON'?T MERGE)(:| )"; then
  DO_NOT_MERGE=true
fi
if [ "$DO_NOT_MERGE" = false ] && echo "$PR_BODY" | grep -qiE "(^|\n)(DO NOT MERGE|DON'?T MERGE)(:| )"; then
  DO_NOT_MERGE=true
fi

# --- Out-of-scope path detection (hooks/workflows/skills) ---
# Designers should not touch these — blast radius extends beyond design surface.
# Source-of-truth rule borrowed from hie-rei .claude/skills/pr-review (Michael).
OUT_OF_SCOPE=$(echo "$ALL_FILES" | awk '
  /(^|\/)\.claude\/hooks\// { print; next }
  /(^|\/)\.github\/workflows\// { print; next }
  /(^|\/)\.claude\/skills\// { print; next }
')
OUT_OF_SCOPE_COUNT=$(echo "$OUT_OF_SCOPE" | awk 'NF { c++ } END { print c+0 }')

# --- Count buckets ---
# awk is safer than grep -c here: returns a single integer even with no match,
# and never trips set -e.
count() { echo "$ALL_FILES" | awk -v re="$1" 'NF && $0 ~ re { c++ } END { print c+0 }'; }
HTML_COUNT=$(count '\.html?$')
MD_COUNT=$(count '\.md$')
CSS_COUNT=$(count '\.css$')
IMG_COUNT=$(count '\.(png|jpg|jpeg|gif|svg|webp)$')
TOTAL=$(echo "$ALL_FILES" | awk 'NF { c++ } END { print c+0 }')
OTHER=$((TOTAL - HTML_COUNT - MD_COUNT - CSS_COUNT - IMG_COUNT))
DESIGN_SURFACE=$((HTML_COUNT + MD_COUNT + CSS_COUNT + IMG_COUNT))

# --- LOC from diff ---
if [ "$TEST_MODE" = "1" ]; then
  LOC=$(jq -r '.loc // 0' "$FIXTURE")
else
  LOC=$(gh pr diff "$PR" --repo "$REPO" 2>/dev/null | wc -l | tr -d ' ' || echo 0)
fi

# --- Tier decision ---
# infra-mixed wins over every design tier: out-of-scope paths must abort the flow
# regardless of how much design surface is present.
if [ "$OUT_OF_SCOPE_COUNT" -gt 0 ]; then
  TIER="infra-mixed"
elif [ "$DESIGN_SURFACE" -eq 0 ]; then
  TIER="no-design-surface"
elif [ "$HTML_COUNT" -eq 0 ] && [ "$CSS_COUNT" -eq 0 ]; then
  TIER="copy-only"
elif [ "$HTML_COUNT" -le 1 ] && [ "$LOC" -lt 100 ]; then
  TIER="single-screen"
elif [ "$HTML_COUNT" -le 5 ]; then
  TIER="multi-screen"
else
  TIER="system-change"
fi

# --- Idempotent resume check ---
# Prefer the repo's own working tree if we are inside it; else fall back to workspace.
REPO_ROOT=$(git -C . rev-parse --show-toplevel 2>/dev/null || echo "")
SCRATCH_DIR=""
if [ -n "$REPO_ROOT" ]; then
  REMOTE_OWNER=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null \
                 | sed -E 's#.*[/:]([^/:]+/[^/]+)(\.git)?$#\1#' | sed 's/\.git$//' || echo "")
  if [ "$REMOTE_OWNER" = "$REPO" ]; then
    SCRATCH_DIR="$REPO_ROOT/output"
  fi
fi
SCRATCH_DIR="${SCRATCH_DIR:-$WORKSPACE/output}"
SCRATCHPAD="$SCRATCH_DIR/pr-${PR}-scratch.md"
SCRATCH_EXISTS="false"
[ -f "$SCRATCHPAD" ] && SCRATCH_EXISTS="true"

# --- Emit ---
case "$FORMAT" in
  env)
    # Emit out_of_scope_paths as a newline-separated block, terminated by a sentinel.
    OOS_BLOCK=""
    if [ "$OUT_OF_SCOPE_COUNT" -gt 0 ]; then
      OOS_BLOCK=$(echo "$OUT_OF_SCOPE" | awk 'NF')
    fi
    cat <<EOF
SCOPE_TIER=$TIER
PR=$PR
REPO=$REPO
WORKSPACE=$WORKSPACE
DESIGN_SURFACE=$DESIGN_SURFACE
HTML_COUNT=$HTML_COUNT
MD_COUNT=$MD_COUNT
CSS_COUNT=$CSS_COUNT
IMG_COUNT=$IMG_COUNT
LOC=$LOC
SCRATCHPAD=$SCRATCHPAD
SCRATCH_EXISTS=$SCRATCH_EXISTS
IS_DRAFT=$IS_DRAFT
DO_NOT_MERGE=$DO_NOT_MERGE
OUT_OF_SCOPE_COUNT=$OUT_OF_SCOPE_COUNT
OUT_OF_SCOPE_PATHS<<__OOS_END__
$OOS_BLOCK
__OOS_END__
EOF
    ;;
  json|*)
    # Build out_of_scope_paths JSON array from newline-separated list.
    if [ "$OUT_OF_SCOPE_COUNT" -gt 0 ]; then
      OOS_JSON=$(echo "$OUT_OF_SCOPE" | jq -R . | jq -s 'map(select(length > 0))')
    else
      OOS_JSON='[]'
    fi
    jq -n \
      --arg pr "$PR" \
      --arg repo "$REPO" \
      --arg tier "$TIER" \
      --arg workspace "$WORKSPACE" \
      --arg scratchpad "$SCRATCHPAD" \
      --argjson html "$HTML_COUNT" \
      --argjson md "$MD_COUNT" \
      --argjson css "$CSS_COUNT" \
      --argjson img "$IMG_COUNT" \
      --argjson other "$OTHER" \
      --argjson design_surface "$DESIGN_SURFACE" \
      --argjson loc "$LOC" \
      --argjson scratch_exists "$( [ "$SCRATCH_EXISTS" = "true" ] && echo true || echo false )" \
      --argjson out_of_scope_count "$OUT_OF_SCOPE_COUNT" \
      --argjson out_of_scope_paths "$OOS_JSON" \
      --argjson is_draft "$IS_DRAFT" \
      --argjson do_not_merge "$DO_NOT_MERGE" \
      '{
        pr: ($pr | tonumber),
        repo: $repo,
        tier: $tier,
        workspace: $workspace,
        design_surface: $design_surface,
        loc: $loc,
        counts: { html: $html, md: $md, css: $css, img: $img, other: $other },
        is_draft: $is_draft,
        do_not_merge: $do_not_merge,
        out_of_scope_count: $out_of_scope_count,
        out_of_scope_paths: $out_of_scope_paths,
        scratchpad_path: $scratchpad,
        scratchpad_exists: $scratch_exists
      }'
    ;;
esac

# --- Event log to stderr (machine-readable for hooks / subagent dispatch) ---
# Format borrowed from hie-rei pr-review preflight: 5-line block with last line
# carrying the most actionable signal. stdout stays clean JSON/env for the
# normal consumer; stderr is the side channel.
{
  echo "[SCRIPT: scope-tier]"
  echo "event: scope_complete"
  echo "status: clean"
  echo "decision: pass"
  if [ "$TIER" = "infra-mixed" ]; then
    echo "reason: tier=$TIER (out_of_scope=$OUT_OF_SCOPE_COUNT) — design-pr-review should abort"
    echo "action: Tell designer to escalate to RD; skip remaining stages"
  elif [ "$TIER" = "no-design-surface" ]; then
    echo "reason: tier=$TIER (no HTML/MD/CSS/SVG) — flow not applicable"
    echo "action: Tell designer this PR isn't in scope for design-pr-review"
  else
    echo "reason: tier=$TIER, design_surface=$DESIGN_SURFACE files, loc=$LOC"
    echo "action: Proceed to Stage 0.5 (fetch-pr + auto-detect-violations)"
  fi
} >&2
