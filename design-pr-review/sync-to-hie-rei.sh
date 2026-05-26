#!/bin/bash
# Sync the design-pr-review skill from this AI-design copy → hie-rei's vendored copy.
#
# When to run: after editing the skill here AND wanting the design team to get it.
# Edits stay here until you actively sync; team gets the update via a hie-rei PR.
#
# What this does:
#   1. rsync core skill files (SKILL.md, README.md, scripts/, references/, tests/,
#      package*.json, playwright.config.js) from AI-design/design-pr-review/ to
#      hie-rei/.claude/skills/design-pr-review/
#   2. Excludes hie-rei-managed files: designer-guide.html/pdf, .gitignore,
#      Jottacloud "conflicted copy" leftovers, build artifacts
#   3. Shows git status in hie-rei so you can see what will change
#   4. Stops there — you decide branch / commit / PR per hie-rei's /commit + /merge
#      workflow. (Auto-staging is intentionally NOT done to keep this script
#      reversible — diff first, decide explicitly.)
#
# Usage:
#   ./sync-to-hie-rei.sh           # dry-run preview
#   ./sync-to-hie-rei.sh --apply   # actually copy

set -eu

SRC="$HOME/Jottacloud/vibe/AI-design/design-pr-review"
DST="$HOME/Jottacloud/vibe/hie-rei/.claude/skills/design-pr-review"

APPLY=false
[[ "${1:-}" == "--apply" ]] && APPLY=true

if [ ! -d "$DST" ]; then
  echo "ERROR: hie-rei skill folder not found: $DST" >&2
  echo "Expected hie-rei cloned at $HOME/Jottacloud/vibe/hie-rei/" >&2
  exit 1
fi

RSYNC_ARGS=(
  -a
  --delete-excluded
  --include="SKILL.md"
  --include="README.md"
  --include="package.json"
  --include="package-lock.json"
  --include="playwright.config.js"
  --include="PLAN-*.md"
  --include="scripts/"
  --include="scripts/***"
  --include="references/"
  --include="references/***"
  --include="tests/"
  --include="tests/***"
  --exclude="*"
)

if $APPLY; then
  echo "== Applying sync: $SRC/ → $DST/ =="
  rsync "${RSYNC_ARGS[@]}" "$SRC/" "$DST/"
  echo
  echo "== hie-rei git status =="
  cd "$HOME/Jottacloud/vibe/hie-rei"
  git status --short .claude/skills/design-pr-review/ 2>&1 | sed 's/^/  /' || true
  echo
  echo "Next:"
  echo "  cd ~/Jottacloud/vibe/hie-rei"
  echo "  git checkout -b karen/<type>/<slug>          # or use existing feature branch"
  echo "  git add .claude/skills/design-pr-review/     # explicit paths only"
  echo "  git commit -m '...'"
  echo "  git push -u origin <branch>"
  echo "  gh pr create --base main --title '...'"
else
  echo "== DRY RUN: $SRC/ → $DST/ =="
  rsync "${RSYNC_ARGS[@]}" --itemize-changes --dry-run "$SRC/" "$DST/" \
    | grep -v "^\.d\.\.t" \
    | sed 's/^/  /' || true
  echo
  echo "Run with --apply to actually copy."
fi
