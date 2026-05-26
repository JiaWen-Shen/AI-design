#!/usr/bin/env bash
# fetch-pr.sh — Stage 1 of design-pr-review.
# Materialise full repo snapshots at base + head SHAs into the workspace,
# so HTML in the iframes can resolve all its dependencies (CSS, JS, JSON, other views).
#
# Usage:
#   fetch-pr.sh --pr <N> --repo <owner/repo> [--workspace <path>] [--repo-root <path>]
#
# Strategy:
#   1. If --repo-root given OR cwd is the repo → use `git archive` for full snapshots.
#      This pulls every file in the tree at each SHA. Dependencies resolve.
#   2. Otherwise → fall back to per-file fetch via gh API for design-surface files only.
#      iframes will 404 on unchanged dependencies; use only when repo isn't local.
#
# Layout:
#   $WORKSPACE/before/...     (whole tree at base_sha)
#   $WORKSPACE/after/...      (whole tree at head_sha)
#   $WORKSPACE/files.json     (only the changed design-surface files)

set -euo pipefail

PR=""
REPO=""
WORKSPACE=""
REPO_ROOT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --pr) PR="$2"; shift 2;;
    --repo) REPO="$2"; shift 2;;
    --workspace) WORKSPACE="$2"; shift 2;;
    --repo-root) REPO_ROOT="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

[ -z "$PR" ]   && { echo "ERROR: --pr is required" >&2; exit 64; }
[ -z "$REPO" ] && { echo "ERROR: --repo is required" >&2; exit 64; }
WORKSPACE="${WORKSPACE:-/tmp/design-review-${PR}}"
META="$WORKSPACE/pr-meta.json"
[ -f "$META" ] || { echo "ERROR: $META not found; run scope-tier.sh first" >&2; exit 1; }

BASE_REF=$(jq -r '.baseRefName' "$META")
HEAD_REF=$(jq -r '.headRefName' "$META")
BASE_SHA=$(jq -r '.baseRefOid' "$META")
HEAD_SHA=$(jq -r '.headRefOid' "$META")

mkdir -p "$WORKSPACE/before" "$WORKSPACE/after"

# --- Detect local repo clone ---
detect_repo_root() {
  # 1. Explicit --repo-root
  if [ -n "$REPO_ROOT" ] && [ -d "$REPO_ROOT/.git" ]; then
    echo "$REPO_ROOT"; return 0
  fi
  # 2. cwd is the repo
  if cwd_repo=$(git rev-parse --show-toplevel 2>/dev/null); then
    cwd_remote=$(git -C "$cwd_repo" remote get-url origin 2>/dev/null | sed -E 's#.*[/:]([^/:]+/[^/]+)(\.git)?$#\1#' | sed 's/\.git$//')
    if [ "$cwd_remote" = "$REPO" ]; then echo "$cwd_repo"; return 0; fi
  fi
  # 3. Conventional vibe location
  guess="$HOME/Jottacloud/vibe/$(basename "$REPO")"
  if [ -d "$guess/.git" ]; then
    guess_remote=$(git -C "$guess" remote get-url origin 2>/dev/null | sed -E 's#.*[/:]([^/:]+/[^/]+)(\.git)?$#\1#' | sed 's/\.git$//')
    if [ "$guess_remote" = "$REPO" ]; then echo "$guess"; return 0; fi
  fi
  return 1
}

LOCAL_ROOT=$(detect_repo_root 2>/dev/null || true)
ARCHIVE_OK="false"

if [ -n "$LOCAL_ROOT" ]; then
  # Ensure both SHAs are present locally; fetch from origin if missing.
  for sha in "$BASE_SHA" "$HEAD_SHA"; do
    if ! git -C "$LOCAL_ROOT" cat-file -e "${sha}^{commit}" 2>/dev/null; then
      echo "fetching $sha from origin..." >&2
      git -C "$LOCAL_ROOT" fetch origin "$sha" 2>/dev/null || \
        git -C "$LOCAL_ROOT" fetch origin 2>/dev/null || true
    fi
  done
  # Verify both SHAs reachable now.
  if git -C "$LOCAL_ROOT" cat-file -e "${BASE_SHA}^{commit}" 2>/dev/null \
     && git -C "$LOCAL_ROOT" cat-file -e "${HEAD_SHA}^{commit}" 2>/dev/null; then
    ARCHIVE_OK="true"
  fi
fi

if [ "$ARCHIVE_OK" = "true" ]; then
  # Full-tree snapshots via git archive — dependencies will resolve in iframes.
  echo "Using git archive from $LOCAL_ROOT" >&2
  ( cd "$WORKSPACE/before" && rm -rf -- * 2>/dev/null || true; \
    git -C "$LOCAL_ROOT" archive "$BASE_SHA" | tar -x -C "$WORKSPACE/before" )
  ( cd "$WORKSPACE/after"  && rm -rf -- * 2>/dev/null || true; \
    git -C "$LOCAL_ROOT" archive "$HEAD_SHA" | tar -x -C "$WORKSPACE/after" )
else
  # Fallback: per-file fetch via gh API. iframes may 404 on unchanged dependencies.
  echo "WARNING: local repo clone not found — falling back to gh API per-file fetch." >&2
  echo "         iframes may show unstyled content if HTML depends on unchanged files." >&2
  fetch_blob() {
    local sha="$1" path="$2" dest="$3"
    mkdir -p "$(dirname "$dest")"
    if ! gh api "repos/$REPO/contents/$path?ref=$sha" \
          --jq '.content' 2>/dev/null | base64 -d > "$dest" 2>/dev/null; then
      rm -f "$dest"; return 1
    fi
  }
  jq -r '.files[].path' "$META" | while IFS= read -r p; do
    fetch_blob "$BASE_SHA" "$p" "$WORKSPACE/before/$p" || true
    fetch_blob "$HEAD_SHA" "$p" "$WORKSPACE/after/$p"  || true
  done
fi

# --- Build files.json from PR metadata (only changed design-surface files) ---
classify() {
  case "$1" in
    *.html|*.htm) echo "html";;
    *.md)         echo "md";;
    *.css)        echo "css";;
    *.svg)        echo "svg";;
    *.png|*.jpg|*.jpeg|*.gif|*.webp) echo "img";;
    # .js / .json / .txt / generic text → textDiff mode in the wrapper
    *.js|*.mjs|*.cjs|*.json|*.txt) echo "text";;
    *) echo "other";;
  esac
}

FILE_OUT="$WORKSPACE/files.json"
echo "[]" > "$FILE_OUT"

jq -c '.files[]' "$META" | while read -r entry; do
  PATH_=$(echo "$entry" | jq -r '.path')
  STATUS=$(echo "$entry" | jq -r '.additions, .deletions' | paste -sd, -)
  KIND=$(classify "$PATH_")
  case "$KIND" in html|md|css|svg|img|text) :;; *) continue;; esac

  BASE_OK="false"; HEAD_OK="false"
  [ -f "$WORKSPACE/before/$PATH_" ] && BASE_OK="true"
  [ -f "$WORKSPACE/after/$PATH_"  ] && HEAD_OK="true"

  tmp=$(mktemp)
  jq --arg path "$PATH_" --arg kind "$KIND" --arg stat "$STATUS" \
     --argjson base_ok "$( [ "$BASE_OK" = "true" ] && echo true || echo false )" \
     --argjson head_ok "$( [ "$HEAD_OK" = "true" ] && echo true || echo false )" \
     '. + [{path:$path, kind:$kind, stat:$stat, base_ok:$base_ok, head_ok:$head_ok, augmented:false}]' \
     "$FILE_OUT" > "$tmp" && mv "$tmp" "$FILE_OUT"
done

# --- Auto-augment: HTML consumers of changed CSS/JS ---
# For each changed .css / .js, grep the after snapshot for files that consume it via
# <link>, <script src>, or @import. Append those consumers as entries flagged
# `augmented: true`, with `augmented_via` pointing back at the changed file. The wrapper
# uses this to render consumers under the changed file in the TOC and to load them in
# visual mode so the CSS/JS impact is reviewable as rendered output.
if [ "$ARCHIVE_OK" = "true" ]; then
  CONSUMERS_TMP=$(mktemp)
  : > "$CONSUMERS_TMP"
  jq -c '.files[]' "$META" | while read -r entry; do
    P=$(echo "$entry" | jq -r '.path')
    case "$P" in
      *.css|*.js) :;;
      *) continue;;
    esac
    BASENAME=$(basename "$P")
    # Match the basename only when it appears as a whole path segment (preceded by
    # quote/slash, followed by quote/`>`/whitespace) so we don't false-positive on
    # `kaleidoscope-<basename>` or other substring collisions.
    BASENAME_ESCAPED=$(printf '%s' "$BASENAME" | sed 's/[][\\.*^$/]/\\&/g')
    PATTERN="[\"'/]$BASENAME_ESCAPED[\"'>[:space:]]"
    # 1. HTML files that <link> or <script src> the changed asset.
    # `|| true` shields the loop from `set -e` when grep finds nothing.
    HTML_HITS=$(grep -rlE --include='*.html' --include='*.htm' "$PATTERN" "$WORKSPACE/after" 2>/dev/null || true)
    if [ -n "$HTML_HITS" ]; then
      echo "$HTML_HITS" | while IFS= read -r hit; do
        # Skip files already in the PR diff — they're direct, not augmented.
        REL=${hit#$WORKSPACE/after/}
        jq -e --arg p "$REL" 'any(.[]; .path == $p)' "$FILE_OUT" > /dev/null && continue
        echo "$REL|$P" >> "$CONSUMERS_TMP"
      done || true
    fi
    # 2. CSS files that @import the changed file (only when changed file is CSS).
    # Wrap in `|| true` because grep / xargs return non-zero when there are no hits, which
    # would otherwise tank the loop under `set -euo pipefail`.
    case "$P" in *.css)
      IMPORTERS=$(grep -rl --include='*.css' -F "@import" "$WORKSPACE/after" 2>/dev/null || true)
      if [ -n "$IMPORTERS" ]; then
        echo "$IMPORTERS" | xargs grep -lE "$PATTERN" 2>/dev/null \
          | while IFS= read -r hit; do
              REL=${hit#$WORKSPACE/after/}
              jq -e --arg p "$REL" 'any(.[]; .path == $p)' "$FILE_OUT" > /dev/null && continue
              echo "$REL|$P" >> "$CONSUMERS_TMP"
            done || true
      fi
      ;;
    esac
  done

  # De-duplicate (a consumer may reference multiple changed files; keep first via for now).
  if [ -s "$CONSUMERS_TMP" ]; then
    awk -F'|' '!seen[$1]++' "$CONSUMERS_TMP" > "${CONSUMERS_TMP}.uniq"
    mv "${CONSUMERS_TMP}.uniq" "$CONSUMERS_TMP"

    while IFS='|' read -r REL VIA; do
      [ -z "$REL" ] && continue
      KIND=$(classify "$REL")
      case "$KIND" in html|md|css|svg|img|text) :;; *) continue;; esac
      BASE_OK="false"; HEAD_OK="false"
      [ -f "$WORKSPACE/before/$REL" ] && BASE_OK="true"
      [ -f "$WORKSPACE/after/$REL"  ] && HEAD_OK="true"
      tmp=$(mktemp)
      jq --arg path "$REL" --arg kind "$KIND" --arg via "$VIA" \
         --argjson base_ok "$( [ "$BASE_OK" = "true" ] && echo true || echo false )" \
         --argjson head_ok "$( [ "$HEAD_OK" = "true" ] && echo true || echo false )" \
         '. + [{path:$path, kind:$kind, stat:"0,0", base_ok:$base_ok, head_ok:$head_ok, augmented:true, augmented_via:$via}]' \
         "$FILE_OUT" > "$tmp" && mv "$tmp" "$FILE_OUT"
    done < "$CONSUMERS_TMP"
  fi
  rm -f "$CONSUMERS_TMP"
fi

jq -n \
  --arg pr "$PR" --arg repo "$REPO" --arg workspace "$WORKSPACE" \
  --arg base "$BASE_REF" --arg head "$HEAD_REF" \
  --arg base_sha "$BASE_SHA" --arg head_sha "$HEAD_SHA" \
  --arg method "$( [ "$ARCHIVE_OK" = "true" ] && echo git-archive || echo gh-api-per-file )" \
  --slurpfile files "$FILE_OUT" \
  '{
    pr: ($pr | tonumber), repo: $repo, workspace: $workspace,
    base_ref: $base, head_ref: $head, base_sha: $base_sha, head_sha: $head_sha,
    fetch_method: $method,
    file_count: ($files[0] | length),
    files: $files[0]
  }'
