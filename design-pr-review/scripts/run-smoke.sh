#!/usr/bin/env bash
# run-smoke.sh — Layer-2 Playwright smoke runner.
#
# Usage:
#   run-smoke.sh <workspace> <cluster>
#
# Assumes the workspace has already been built (fetch-pr + detect + diff +
# wrapper). Spins up serve-compare.sh, points playwright at it, tears down
# on exit. Suitable for direct invocation OR for a subagent dispatch — both
# stdout and exit code reflect the test outcome.
#
# First-time install:
#   cd ~/.claude/skills/design-pr-review
#   npm install
#   npx playwright install --with-deps chromium

set -euo pipefail

WORKSPACE="${1:-}"
CLUSTER="${2:-}"
[ -z "$WORKSPACE" ] || [ -z "$CLUSTER" ] && {
  echo "Usage: $0 <workspace> <cluster>" >&2; exit 64;
}
[ -d "$WORKSPACE" ] || { echo "ERROR: workspace $WORKSPACE not found" >&2; exit 1; }
[ -f "$WORKSPACE/compare-${CLUSTER}.html" ] || {
  echo "ERROR: wrapper for cluster '$CLUSTER' not found — run make-compare-wrapper first" >&2; exit 1;
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Start serve-compare in background; capture the port it picked.
bash "$SCRIPT_DIR/serve-compare.sh" --workspace "$WORKSPACE" --cluster "$CLUSTER" >/dev/null 2>&1 || true
sleep 0.5
PORT=$(cat "$WORKSPACE/.server-port" 2>/dev/null || echo "")
[ -z "$PORT" ] && { echo "ERROR: serve-compare did not record .server-port" >&2; exit 1; }

cleanup() {
  bash "$SCRIPT_DIR/serve-stop.sh" --workspace "$WORKSPACE" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "🧪 smoke: workspace=$WORKSPACE cluster=$CLUSTER port=$PORT"
cd "$SKILL_DIR"

if [ ! -d node_modules/@playwright ]; then
  echo "❌ Playwright not installed. Run:" >&2
  echo "   cd $SKILL_DIR && npm install && npx playwright install --with-deps chromium" >&2
  exit 1
fi

SMOKE_PORT="$PORT" SMOKE_CLUSTER="$CLUSTER" SMOKE_WORKSPACE="$WORKSPACE" \
  npx playwright test tests/wrapper-smoke.spec.js
