#!/usr/bin/env bash
# serve-stop.sh — Stop the local HTTP server started by serve-compare.sh.
#
# Usage:
#   serve-stop.sh --workspace /tmp/design-review-<N>

set -euo pipefail

WORKSPACE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --workspace) WORKSPACE="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

[ -z "$WORKSPACE" ] && { echo "ERROR: --workspace required" >&2; exit 64; }

PID_FILE="$WORKSPACE/.server-pid"
PORT_FILE="$WORKSPACE/.server-port"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    kill "$PID" 2>/dev/null || true
    sleep 0.2
    ps -p "$PID" > /dev/null 2>&1 && kill -9 "$PID" 2>/dev/null || true
    echo "Stopped server (pid=$PID)"
  fi
  rm -f "$PID_FILE" "$PORT_FILE"
else
  echo "No server pid file at $PID_FILE"
fi
