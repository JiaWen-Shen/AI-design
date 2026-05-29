#!/usr/bin/env bash
# make-conflict-fixture.sh — build a throwaway git repo in a known conflict state,
# for testing attribute-conflict.sh / materialize-conflict-sides.sh / the /merge wiring.
#
# Mirrors the meeting scenario: Stanley pushed first (lands on main), Mei's branch
# changed the same line, then `git rebase main` surfaces the conflict.
#
# After rebase conflict:
#   ours   (:2:, HEAD)        = main side  = Stanley's change
#   theirs (:3:, REBASE_HEAD) = branch side = Mei's change
#   → attribute-conflict.sh reports op=rebase, ours_is_you=false,
#     ours.author=Stanley, theirs.author=Mei
#
# Usage:
#   make-conflict-fixture.sh [--dir <path>] [--mode rebase|merge|binary]
#   Prints the repo path on the last stdout line.
set -euo pipefail

DIR=""
MODE="rebase"
while [ $# -gt 0 ]; do
  case "$1" in
    --dir) DIR="$2"; shift 2;;
    --mode) MODE="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 64;;
  esac
done
[ -z "$DIR" ] && DIR="$(mktemp -d "${TMPDIR:-/tmp}/conflict-fixture-XXXXXX")"

# Isolate from the user's global git config / hooks / signing.
g() { git -C "$DIR" -c init.defaultBranch=main -c commit.gpgsign=false \
        -c core.hooksPath=/dev/null "$@"; }
commit_as() { # commit_as <name> <email> <msg>
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" \
  GIT_COMMITTER_NAME="$1" GIT_COMMITTER_EMAIL="$2" \
    g commit -q -m "$3"
}

rm -rf "$DIR"; mkdir -p "$DIR"
g init -q

mockup() { # write mockup-login.html with a given accent color
  cat > "$DIR/mockup-login.html" <<HTML
<!doctype html>
<html>
<head>
<style>
.login-btn { color: $1; padding: 12px; }
</style>
</head>
<body>
<button class="login-btn">Sign in</button>
</body>
</html>
HTML
}

# --- base commit (neutral author) ---
mockup "#111111"
g add mockup-login.html
commit_as "Base Bot" "base@example.com" "base: login mockup"

if [ "$MODE" = "binary" ]; then
  # Binary conflict: a tiny PNG differs on two branches.
  # Real PNG signature + a NUL byte so it's unambiguously binary (grep -I detects it).
  png() { printf '\x89PNG\r\n\x1a\n\x00\x00\x00\x0dIHDR%s\x00' "$1" > "$DIR/logo.png"; }
  png "AAAA"; g add logo.png; commit_as "Base Bot" "base@example.com" "base: logo"
  g checkout -q -b mei/visual/logo
  png "MMMM"; g add logo.png; commit_as "Mei Hung" "mei@example.com" "mei: new logo"
  g checkout -q main
  png "SSSS"; g add logo.png; commit_as "Stanley Tung" "stanley@example.com" "stanley: logo tweak"
  g checkout -q mei/visual/logo
  g rebase main >/dev/null 2>&1 || true
  echo "$DIR"; exit 0
fi

# --- Stanley's change lands on main first ---
g checkout -q -b stanley-tmp
mockup "#333333"
g add mockup-login.html
commit_as "Stanley Tung" "stanley@example.com" "stanley: darker login accent"
g checkout -q main
g merge -q --ff-only stanley-tmp
g branch -q -d stanley-tmp

# --- Mei's branch off base, same line changed ---
g checkout -q -b mei/visual/login-accent "$(g rev-list --max-parents=0 HEAD | tail -1)"
mockup "#222222"
g add mockup-login.html
commit_as "Mei Hung" "mei@example.com" "mei: brighter login accent"

if [ "$MODE" = "merge" ]; then
  # Merge main into mei's branch → HEAD(ours)=Mei, MERGE_HEAD(theirs)=Stanley(main).
  g merge main >/dev/null 2>&1 || true
else
  # rebase (default): replay Mei's commit onto main → HEAD(ours)=Stanley(main),
  # REBASE_HEAD(theirs)=Mei. Matches /merge's `git rebase origin/main`.
  g rebase main >/dev/null 2>&1 || true
fi

echo "$DIR"
