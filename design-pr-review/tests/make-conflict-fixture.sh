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

if [ "$MODE" = "modify-delete" ]; then
  # main DELETES the file (Stanley); Mei's branch MODIFIES it → modify/delete conflict.
  # One stage (the deleted side) is absent → materialize must NOT leave a fake 0-byte file.
  g checkout -q -b main-tmp
  g rm -q mockup-login.html
  commit_as "Stanley Tung" "stanley@example.com" "stanley: remove login mockup"
  g checkout -q main; g merge -q --ff-only main-tmp; g branch -q -d main-tmp
  g checkout -q -b mei/visual/login-accent "$(g rev-list --max-parents=0 HEAD | tail -1)"
  mockup "#222222"; g add mockup-login.html
  commit_as "Mei Hung" "mei@example.com" "mei: brighter login accent"
  g rebase main >/dev/null 2>&1 || true
  echo "$DIR"; exit 0
fi

if [ "$MODE" = "rebase-multi" ]; then
  # main: Stanley edits the accent line. Branch: Mei makes TWO commits on the same file
  # (so her side dominates file-level), then rebase onto main. Guards that multiple
  # same-author commits don't flip involves_other to false when main carries Stanley's edit.
  g checkout -q -b main-tmp; mockup "#333333"; g add mockup-login.html
  commit_as "Stanley Tung" "stanley@example.com" "stanley: darker accent"
  g checkout -q main; g merge -q --ff-only main-tmp; g branch -q -d main-tmp
  g checkout -q -b mei/visual/login-accent "$(g rev-list --max-parents=0 HEAD | tail -1)"
  mockup "#aaaaaa"; g add mockup-login.html; commit_as "Mei Hung" "mei@example.com" "mei: accent v1"
  mockup "#222222"; g add mockup-login.html; commit_as "Mei Hung" "mei@example.com" "mei: accent v2"
  g rebase main >/dev/null 2>&1 || true
  echo "$DIR"; exit 0
fi

if [ "$MODE" = "mixed-skip" ]; then
  # A NON-design conflict (app.js) sorts BEFORE the design conflict (mockup-login.html).
  # Guards that compare-meta's author/banner come from the materialized design file,
  # not the skipped first unmerged path.
  printf 'const c="#111";\n' > "$DIR/app.js"; g add app.js
  commit_as "Base Bot" "base@example.com" "base: app.js"
  BASE2=$(g rev-parse HEAD)
  g checkout -q -b main-tmp
  mockup "#333333"; printf 'const c="#333";\n' > "$DIR/app.js"; g add mockup-login.html app.js
  commit_as "Stanley Tung" "stanley@example.com" "stanley: edit both"
  g checkout -q main; g merge -q --ff-only main-tmp; g branch -q -d main-tmp
  g checkout -q -b mei/visual/login-accent "$BASE2"
  mockup "#222222"; printf 'const c="#222";\n' > "$DIR/app.js"; g add mockup-login.html app.js
  commit_as "Mei Hung" "mei@example.com" "mei: edit both"
  g rebase main >/dev/null 2>&1 || true
  echo "$DIR"; exit 0
fi

if [ "$MODE" = "multi-design" ]; then
  # TWO design (html) files both conflict → wrapper is multi-file → NO global banner.
  home() { printf '<!doctype html><html><head><style>.home{color:%s}</style></head><body>home</body></html>\n' "$1" > "$DIR/mockup-home.html"; }
  home "#111111"; g add mockup-home.html; commit_as "Base Bot" "base@example.com" "base: home"
  BASE2=$(g rev-parse HEAD)
  g checkout -q -b main-tmp
  mockup "#333333"; home "#333333"; g add mockup-login.html mockup-home.html
  commit_as "Stanley Tung" "stanley@example.com" "stanley: edit both designs"
  g checkout -q main; g merge -q --ff-only main-tmp; g branch -q -d main-tmp
  g checkout -q -b mei/visual/designs "$BASE2"
  mockup "#222222"; home "#222222"; g add mockup-login.html mockup-home.html
  commit_as "Mei Hung" "mei@example.com" "mei: edit both designs"
  g rebase main >/dev/null 2>&1 || true
  echo "$DIR"; exit 0
fi

if [ "$MODE" = "merge-only-author" ]; then
  # The OTHER side's conflicting content is introduced ONLY by a merge commit (an "evil
  # merge" that retouches the file during conflict resolution). `git log --no-merges MB..ref`
  # is then EMPTY for that side. Guards that an empty no-merges author set doesn't collapse
  # to one identity and silently auto-pass a genuine cross-author conflict.
  BASE0=$(g rev-parse HEAD)                    # Base Bot: mockup #111
  # side branch + main both advance WITHOUT touching the design file
  g checkout -q -b side "$BASE0"
  printf 'side\n' > "$DIR/side.txt"; g add side.txt
  commit_as "Side Dev" "side@example.com" "side: unrelated file"
  g checkout -q main
  printf 'mainline\n' > "$DIR/main.txt"; g add main.txt
  commit_as "Base Bot" "base@example.com" "main: unrelated file"
  # evil merge: resolve by re-theming the design file IN the merge commit (Stanley)
  g merge --no-commit --no-ff side >/dev/null 2>&1 || true
  mockup "#555555"; g add mockup-login.html
  commit_as "Stanley Tung" "stanley@example.com" "merge: side + retheme login (evil merge)"
  # designer branches from BASE0, edits same line, rebases onto main → conflict.
  # main side's only commit touching the file is the (excluded) merge commit.
  g checkout -q -b mei/visual/login-accent "$BASE0"
  mockup "#222222"; g add mockup-login.html
  commit_as "Mei Hung" "mei@example.com" "mei: brighter login accent"
  g rebase main >/dev/null 2>&1 || true
  echo "$DIR"; exit 0
fi

# --- The "main side" change lands first ---
# self mode: Mei is the main-side author too (her own earlier work) → involves_other=false.
# default:   Stanley is the main-side author → involves_other=true.
if [ "$MODE" = "self" ]; then
  MAIN_NAME="Mei Hung"; MAIN_EMAIL="mei@example.com"
else
  MAIN_NAME="Stanley Tung"; MAIN_EMAIL="stanley@example.com"
fi
g checkout -q -b main-tmp
mockup "#333333"
g add mockup-login.html
commit_as "$MAIN_NAME" "$MAIN_EMAIL" "main-side: darker login accent"
g checkout -q main
g merge -q --ff-only main-tmp
g branch -q -d main-tmp

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
