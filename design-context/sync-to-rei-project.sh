#!/bin/bash
# Sync the design-context skill from this AI-design source-of-truth → REI-Project's
# vendored copy at REI-Project/.claude/skills/design-context/.
#
# When to run: after editing the skill here AND wanting the design team to get it.
# Edits stay here until you actively sync; team gets the update via a REI-Project PR.
#
# Usage:
#   ./sync-to-rei-project.sh           # dry-run preview
#   ./sync-to-rei-project.sh --apply   # actually copy

set -eu

SRC="$HOME/Jottacloud/vibe/AI-design/design-context"
DST="$HOME/Jottacloud/vibe/REI-Project/.claude/skills/design-context"

APPLY=false
[[ "${1:-}" == "--apply" ]] && APPLY=true

if [ ! -d "$HOME/Jottacloud/vibe/REI-Project" ]; then
  echo "ERROR: REI-Project not cloned at $HOME/Jottacloud/vibe/REI-Project" >&2
  echo "Clone first:" >&2
  echo "  cd ~/Jottacloud/vibe && git clone git@github.com:trendlife-general/REI-Project.git" >&2
  exit 1
fi

mkdir -p "$DST"

RSYNC_ARGS=(
  -a
  --delete-excluded
  --include="SKILL.md"
  --include="README.md"
  --include="sources.example.yaml"
  --include=".claude-plugin/"
  --include=".claude-plugin/***"
  --include="scripts/"
  --include="scripts/*.py"
  --include="scripts/*.sh"
  --include="hooks/"
  --include="hooks/*.sh"
  --include="templates/"
  --include="templates/*.plist"
  --include="templates/*.md"
  --exclude="*"
)

if $APPLY; then
  echo "== Applying sync: $SRC/ → $DST/ =="
  rsync "${RSYNC_ARGS[@]}" "$SRC/" "$DST/"
  echo
  echo "== REI-Project git status (.claude/skills/design-context/) =="
  cd "$HOME/Jottacloud/vibe/REI-Project"
  git status --short .claude/skills/design-context/ 2>&1 | sed 's/^/  /' || true
  echo
  echo "Next:"
  echo "  cd ~/Jottacloud/vibe/REI-Project"
  echo "  git checkout -b karen/feat/design-context-skill"
  echo "  git add .claude/skills/design-context/"
  echo "  git commit -m 'feat(skills): add design-context skill — sync L1+L2 reference content'"
  echo "  git push -u origin karen/feat/design-context-skill"
  echo "  gh pr create --base main --title 'feat(skills): design-context skill'"
else
  echo "== DRY RUN: $SRC/ → $DST/ =="
  rsync "${RSYNC_ARGS[@]}" --itemize-changes --dry-run "$SRC/" "$DST/" \
    | grep -v "^\.d\.\.t" \
    | sed 's/^/  /' || true
  echo
  echo "Run with --apply to actually copy."
fi
