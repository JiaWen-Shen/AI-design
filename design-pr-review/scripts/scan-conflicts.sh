#!/usr/bin/env bash
# scan-conflicts.sh — Stage 1.5 of design-pr-review.
# Detect multi-author overlap signals worth surfacing to the reviewer.
# No LLM. Pure gh CLI + jq.
#
# Usage:
#   scan-conflicts.sh --pr <N> --repo <owner/repo> [--workspace <path>]
#
# Output: JSON
#   {
#     authors: [{login, name, commit_count}],
#     multi_author_files: [{path, authors:[{login,sha,msg}]}],
#     repeat_touch_files: [{path, touch_count, authors}]
#   }

set -euo pipefail

PR=""
REPO=""
WORKSPACE=""

while [ $# -gt 0 ]; do
  case "$1" in
    --pr) PR="$2"; shift 2;;
    --repo) REPO="$2"; shift 2;;
    --workspace) WORKSPACE="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

[ -z "$PR" ]   && { echo "ERROR: --pr is required" >&2; exit 64; }
[ -z "$REPO" ] && { echo "ERROR: --repo is required" >&2; exit 64; }
WORKSPACE="${WORKSPACE:-/tmp/design-review-${PR}}"
META="$WORKSPACE/pr-meta.json"
[ -f "$META" ] || { echo "ERROR: $META not found; run scope-tier.sh first" >&2; exit 1; }

# Pull commits + per-commit changed files via gh API.
COMMITS_JSON="$WORKSPACE/commits.json"
gh api "repos/$REPO/pulls/$PR/commits" --paginate > "$COMMITS_JSON"

# author summary
AUTHORS=$(jq -c '
  [ .[] | {login: (.author.login // .commit.author.email), name: .commit.author.name} ]
  | group_by(.login)
  | map({login: .[0].login, name: .[0].name, commit_count: length})
' "$COMMITS_JSON")

# per-commit touched-files mapping (needs separate calls).
# For perf we limit to design-surface files only — read from pr-meta.json files.
DESIGN_FILES=$(jq -r '.files[].path
  | select(test("\\.(html?|md|css|svg)$"))' "$META")

# Build a flat list: (commit_sha, login, file_path) for every commit × file overlap.
TOUCHES_JSON="$WORKSPACE/touches.json"
echo "[]" > "$TOUCHES_JSON"

jq -c '.[]' "$COMMITS_JSON" | while read -r commit; do
  SHA=$(echo "$commit" | jq -r '.sha')
  LOGIN=$(echo "$commit" | jq -r '.author.login // .commit.author.email')
  MSG=$(echo "$commit" | jq -r '.commit.message' | head -1)
  # Fetch commit's file list
  FILES=$(gh api "repos/$REPO/commits/$SHA" --jq '.files[].filename' 2>/dev/null || true)
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    # Only consider design surface
    case "$f" in
      *.html|*.htm|*.md|*.css|*.svg) :;;
      *) continue;;
    esac
    tmp=$(mktemp)
    jq --arg sha "$SHA" --arg login "$LOGIN" --arg path "$f" --arg msg "$MSG" \
       '. + [{sha:$sha, login:$login, path:$path, msg:$msg}]' \
       "$TOUCHES_JSON" > "$tmp" && mv "$tmp" "$TOUCHES_JSON"
  done <<< "$FILES"
done

# Multi-author files: any file touched by >1 distinct login.
MULTI_AUTHOR=$(jq -c '
  group_by(.path)
  | map({
      path: .[0].path,
      authors: ( map({login, sha, msg}) ),
      distinct_logins: ( map(.login) | unique )
    })
  | map(select(.distinct_logins | length > 1))
  | map({path, authors})
' "$TOUCHES_JSON")

# Repeat-touch files: same file touched >= 3 times (sign of churn / back-and-forth).
REPEAT=$(jq -c '
  group_by(.path)
  | map({
      path: .[0].path,
      touch_count: length,
      authors: ( map(.login) | unique )
    })
  | map(select(.touch_count >= 3))
' "$TOUCHES_JSON")

jq -n \
  --argjson authors "$AUTHORS" \
  --argjson multi "$MULTI_AUTHOR" \
  --argjson repeat "$REPEAT" \
  '{ authors: $authors, multi_author_files: $multi, repeat_touch_files: $repeat }'
