#!/usr/bin/env bash
# design-context SessionStart hook.
# Called by Claude Code when a session opens in a project that registered this hook.
# Behavior: silently spawn sync.py in background. Never blocks session startup.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
SYNC="$SKILL_DIR/scripts/sync.py"
LOG_DIR="$HOME/.cache/design-context/logs"

mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/session-start.log"

# Detach completely so session start is never blocked
(
  cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(pwd)"
  python3 "$SYNC" --quiet >> "$LOG" 2>&1
) &

disown 2>/dev/null || true
exit 0
