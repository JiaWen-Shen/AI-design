#!/usr/bin/env bash
# Copy the AI-design source skill into a HIE checkout. No staging or commit.
set -euo pipefail

src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="${HOME}/Jottacloud/vibe/TM-workspace/HIE"
apply=false

while (($#)); do
  case "$1" in
    --apply) apply=true; shift ;;
    --target) [[ $# -ge 2 ]] || { echo "--target needs a directory" >&2; exit 2; }; repo="$2"; shift 2 ;;
    *) echo "Usage: bash sync-to-hie-rei.sh [--apply] [--target HIE-checkout]" >&2; exit 2 ;;
  esac
done

[[ -f "$src/SKILL.md" ]] || { echo "Missing source SKILL.md" >&2; exit 1; }
[[ -d "$repo/.claude/skills" && -d "$repo/.agents/skills" ]] || {
  echo "Missing HIE skill directories: $repo" >&2
  exit 1
}
if $apply; then
  branch="$(git -C "$repo" branch --show-current)"
  [[ -n "$branch" && "$branch" != main ]] || {
    echo "Apply to a HIE feature branch, not main or detached HEAD: $repo" >&2
    exit 1
  }
fi

for runtime in .claude .agents; do
  dst="$repo/$runtime/skills/pm-review"
  if $apply; then
    mkdir -p "$dst"
    rsync -a --itemize-changes "$src/SKILL.md" "$dst/SKILL.md"
  elif [[ -d "$dst" ]]; then
    rsync -a --dry-run --itemize-changes "$src/SKILL.md" "$dst/SKILL.md"
  else
    echo "Would create $dst/SKILL.md"
  fi
done
