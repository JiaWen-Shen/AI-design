#!/usr/bin/env bash
# serve-compare.sh — Serve a design-review workspace over a local HTTP server,
# then open the compare wrapper in the default browser.
#
# Why: Chrome and Safari treat each file:// URL as a separate origin, so the
# wrapper cannot read the iframe documents (querySelector throws SecurityError).
# Serving over http://localhost makes the wrapper and iframes same-origin,
# enabling click-to-anchor and sync scroll.
#
# Usage:
#   serve-compare.sh --workspace /tmp/design-review-<N> --cluster <name> [--port <P>]
#
# Side effects:
#   - Writes the chosen port to $WORKSPACE/.server-port
#   - Writes the server PID to $WORKSPACE/.server-pid
#   - Background-runs `python3 -m http.server <port>` until killed by serve-stop.sh
#     (or until system reboot).

set -euo pipefail

WORKSPACE=""
CLUSTER=""
PORT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --workspace) WORKSPACE="$2"; shift 2;;
    --cluster) CLUSTER="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done

[ -z "$WORKSPACE" ] && { echo "ERROR: --workspace required" >&2; exit 64; }
[ -z "$CLUSTER"   ] && { echo "ERROR: --cluster required" >&2; exit 64; }
[ -d "$WORKSPACE" ] || { echo "ERROR: workspace not found: $WORKSPACE" >&2; exit 1; }

WRAPPER="$WORKSPACE/compare-$CLUSTER.html"
[ -f "$WRAPPER" ] || { echo "ERROR: wrapper not found: $WRAPPER" >&2; exit 1; }

PID_FILE="$WORKSPACE/.server-pid"
PORT_FILE="$WORKSPACE/.server-port"

# Reuse existing server if still alive.
if [ -f "$PID_FILE" ] && [ -f "$PORT_FILE" ]; then
  EXISTING_PID=$(cat "$PID_FILE")
  EXISTING_PORT=$(cat "$PORT_FILE")
  if ps -p "$EXISTING_PID" > /dev/null 2>&1; then
    PORT="$EXISTING_PORT"
    echo "Reusing existing server (pid=$EXISTING_PID, port=$PORT)"
  else
    rm -f "$PID_FILE" "$PORT_FILE"
  fi
fi

# Pick a free port if not reusing.
if [ -z "${PORT:-}" ]; then
  # Try the conventional 8765 first, then walk upward.
  for try in 8765 8766 8767 8768 8769 8770 8780 8790; do
    if ! lsof -iTCP:$try -sTCP:LISTEN >/dev/null 2>&1; then
      PORT=$try
      break
    fi
  done
  [ -z "${PORT:-}" ] && { echo "ERROR: no free port" >&2; exit 1; }
fi

# Start server if we just picked a fresh port.
if [ ! -f "$PID_FILE" ]; then
  cd "$WORKSPACE"
  nohup python3 -m http.server "$PORT" --bind 127.0.0.1 \
    > "$WORKSPACE/.server.log" 2>&1 &
  echo $! > "$PID_FILE"
  echo "$PORT" > "$PORT_FILE"
  # Give server a moment to bind.
  for _ in 1 2 3 4 5; do
    sleep 0.1
    curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" 2>/dev/null \
      | grep -qE '^(200|301|404)$' && break
  done
  echo "Started server (pid=$(cat "$PID_FILE"), port=$PORT)"
fi

URL="http://127.0.0.1:$PORT/compare-$CLUSTER.html"
echo "Opening $URL"
open "$URL"
