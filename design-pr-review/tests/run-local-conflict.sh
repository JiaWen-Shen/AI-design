#!/usr/bin/env bash
# run-local-conflict.sh — end-to-end test for the local merge-conflict path.
# Builds fixtures, runs attribute → materialize → compare chain, asserts results.
# Exit 0 = all pass. Subagent-friendly (no prompts).
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL="$(cd "$HERE/.." && pwd)"
SCRIPTS="$SKILL/scripts"
PASS=0; FAIL=0
ok()  { printf '  ✓ %s\n' "$1"; PASS=$((PASS+1)); }
bad() { printf '  ✗ %s — %s\n' "$1" "$2"; FAIL=$((FAIL+1)); }
jqv() { jq -r "$1" "$2" 2>/dev/null; }

echo "== 1. rebase fixture: attribute-conflict =="
FX=$(bash "$HERE/make-conflict-fixture.sh" --mode rebase | tail -1)
WS="/tmp/test-conflict-rebase-$$"
rm -rf "$WS"; mkdir -p "$WS"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FX" --workspace "$WS" >/dev/null 2>&1
A="$WS/attribution.json"
[ -f "$A" ] && ok "attribution.json written" || bad "attribution.json" "missing"
[ "$(jqv '.op' "$A")" = "rebase" ] && ok "op=rebase" || bad "op" "got $(jqv '.op' "$A")"
[ "$(jqv '.ours_is_you' "$A")" = "false" ] && ok "ours_is_you=false (rebase)" || bad "ours_is_you" "got $(jqv '.ours_is_you' "$A")"
[ "$(jqv '.files[0].ours.author' "$A")" = "Stanley Tung" ] && ok "ours.author=Stanley (main side)" || bad "ours.author" "got $(jqv '.files[0].ours.author' "$A")"
[ "$(jqv '.files[0].theirs.author' "$A")" = "Mei Hung" ] && ok "theirs.author=Mei (branch)" || bad "theirs.author" "got $(jqv '.files[0].theirs.author' "$A")"
[ "$(jqv '.files[0].change_type' "$A")" = "css-property" ] && ok "change_type=css-property" || bad "change_type" "got $(jqv '.files[0].change_type' "$A")"
[ "$(jqv '.files[0].proposed_side' "$A")" = "null" ] && ok "proposed_side=null (no rules in MVP)" || bad "proposed_side" "expected null"

echo "== 2. materialize + compare chain =="
bash "$SCRIPTS/materialize-conflict-sides.sh" --repo-root "$FX" --workspace "$WS" >/dev/null 2>&1
[ -s "$WS/before/mockup-login.html" ] && ok "before/ has ours blob" || bad "before/" "missing"
[ -s "$WS/after/mockup-login.html" ] && ok "after/ has theirs blob" || bad "after/" "missing"
grep -q '#333333' "$WS/before/mockup-login.html" && ok "before = main side (#333333)" || bad "before content" "expected #333333"
grep -q '#222222' "$WS/after/mockup-login.html" && ok "after = branch side (#222222)" || bad "after content" "expected #222222"
[ "$(jqv '.left_label' "$WS/compare-meta.json")" = "On main" ] && ok "left_label='On main'" || bad "left_label" "got $(jqv '.left_label' "$WS/compare-meta.json")"
[ "$(jqv '.right_label' "$WS/compare-meta.json")" = "Your branch" ] && ok "right_label='Your branch'" || bad "right_label" "got $(jqv '.right_label' "$WS/compare-meta.json")"

node "$SCRIPTS/compute-html-diff.js" --workspace "$WS" >/dev/null 2>&1 && ok "compute-html-diff ran" || bad "compute-html-diff" "errored"
node "$SCRIPTS/summarise-css-diff.js" --workspace "$WS" >/dev/null 2>&1 && ok "summarise-css-diff ran" || bad "summarise-css-diff" "errored"
node "$SCRIPTS/make-compare-wrapper.js" --workspace "$WS" --cluster conflict --files "mockup-login.html" >/dev/null 2>&1 && ok "make-compare-wrapper ran" || bad "make-compare-wrapper" "errored"
W="$WS/compare-conflict.html"
[ -f "$W" ] && ok "compare-conflict.html produced" || bad "wrapper html" "missing"
grep -q '>On main<' "$W" && ok "wrapper shows 'On main' pane label" || bad "pane label" "On main not rendered"
grep -q '>Your branch<' "$W" && ok "wrapper shows 'Your branch' pane label" || bad "pane label" "Your branch not rendered"
bash "$SCRIPTS/verify-wrapper.sh" --workspace "$WS" --cluster conflict >/dev/null 2>&1 && ok "verify-wrapper exit 0" || bad "verify-wrapper" "non-zero exit"

echo "== 3. merge fixture: orientation flips =="
FM=$(bash "$HERE/make-conflict-fixture.sh" --mode merge | tail -1)
WM="/tmp/test-conflict-merge-$$"; rm -rf "$WM"; mkdir -p "$WM"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FM" --workspace "$WM" >/dev/null 2>&1
[ "$(jqv '.op' "$WM/attribution.json")" = "merge" ] && ok "op=merge" || bad "op" "got $(jqv '.op' "$WM/attribution.json")"
[ "$(jqv '.ours_is_you' "$WM/attribution.json")" = "true" ] && ok "ours_is_you=true (merge)" || bad "ours_is_you" "got $(jqv '.ours_is_you' "$WM/attribution.json")"

echo "== 4. binary fixture =="
FB=$(bash "$HERE/make-conflict-fixture.sh" --mode binary | tail -1)
WB="/tmp/test-conflict-binary-$$"; rm -rf "$WB"; mkdir -p "$WB"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FB" --workspace "$WB" >/dev/null 2>&1
[ "$(jqv '.files[0].binary' "$WB/attribution.json")" = "true" ] && ok "binary detected" || bad "binary" "got $(jqv '.files[0].binary' "$WB/attribution.json")"

echo
echo "RESULT: $PASS passed, $FAIL failed"
# cleanup fixtures + workspaces
rm -rf "$WS" "$WM" "$WB" "$FX" "$FM" "$FB" 2>/dev/null || true
[ "$FAIL" -eq 0 ]
