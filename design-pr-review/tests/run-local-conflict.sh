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
[ "$(jqv '.files[0].involves_other_author' "$A")" = "true" ] && ok "involves_other_author=true (Stanley≠Mei)" || bad "involves_other_author" "got $(jqv '.files[0].involves_other_author' "$A")"
[ "$(jqv '.files[0].other_author' "$A")" = "Stanley Tung" ] && ok "other_author=Stanley (main side)" || bad "other_author" "got $(jqv '.files[0].other_author' "$A")"
[ "$(jqv '.files[0].designer_author' "$A")" = "Mei Hung" ] && ok "designer_author=Mei (your branch)" || bad "designer_author" "got $(jqv '.files[0].designer_author' "$A")"

echo "== 2. materialize + compare chain =="
bash "$SCRIPTS/materialize-conflict-sides.sh" --repo-root "$FX" --workspace "$WS" >/dev/null 2>&1
[ -s "$WS/before/mockup-login.html" ] && ok "before/ has ours blob" || bad "before/" "missing"
[ -s "$WS/after/mockup-login.html" ] && ok "after/ has theirs blob" || bad "after/" "missing"
grep -q '#333333' "$WS/before/mockup-login.html" && ok "before = main side (#333333)" || bad "before content" "expected #333333"
grep -q '#222222' "$WS/after/mockup-login.html" && ok "after = branch side (#222222)" || bad "after content" "expected #222222"
[ "$(jqv '.left_label' "$WS/compare-meta.json")" = "On main" ] && ok "left_label='On main'" || bad "left_label" "got $(jqv '.left_label' "$WS/compare-meta.json")"
[ "$(jqv '.right_label' "$WS/compare-meta.json")" = "Your branch" ] && ok "right_label='Your branch'" || bad "right_label" "got $(jqv '.right_label' "$WS/compare-meta.json")"
[ "$(jqv '.left_author' "$WS/compare-meta.json")" = "Stanley Tung" ] && ok "compare-meta left_author=Stanley" || bad "left_author" "got $(jqv '.left_author' "$WS/compare-meta.json")"
[ "$(jqv '.right_author' "$WS/compare-meta.json")" = "Mei Hung" ] && ok "compare-meta right_author=Mei" || bad "right_author" "got $(jqv '.right_author' "$WS/compare-meta.json")"
[ "$(jqv '.involves_other' "$WS/compare-meta.json")" = "true" ] && ok "compare-meta involves_other=true" || bad "compare-meta involves_other" "got $(jqv '.involves_other' "$WS/compare-meta.json")"
[ "$(jqv '.banner' "$WS/compare-meta.json")" != "null" ] && ok "compare-meta banner present" || bad "banner" "missing"

node "$SCRIPTS/compute-html-diff.js" --workspace "$WS" >/dev/null 2>&1 && ok "compute-html-diff ran" || bad "compute-html-diff" "errored"
node "$SCRIPTS/summarise-css-diff.js" --workspace "$WS" >/dev/null 2>&1 && ok "summarise-css-diff ran" || bad "summarise-css-diff" "errored"
node "$SCRIPTS/make-compare-wrapper.js" --workspace "$WS" --cluster conflict --files "mockup-login.html" >/dev/null 2>&1 && ok "make-compare-wrapper ran" || bad "make-compare-wrapper" "errored"
W="$WS/compare-conflict.html"
[ -f "$W" ] && ok "compare-conflict.html produced" || bad "wrapper html" "missing"
grep -q 'On main' "$W" && ok "wrapper shows 'On main' pane label" || bad "pane label" "On main not rendered"
grep -q 'Your branch' "$W" && ok "wrapper shows 'Your branch' pane label" || bad "pane label" "Your branch not rendered"
grep -q 'Stanley Tung' "$W" && ok "wrapper shows other-author tag (Stanley) in-view" || bad "author tag" "Stanley not in wrapper"
grep -q 'conflict-banner' "$W" && ok "wrapper renders conflict banner" || bad "banner" "conflict-banner not in wrapper"
bash "$SCRIPTS/verify-wrapper.sh" --workspace "$WS" --cluster conflict >/dev/null 2>&1 && ok "verify-wrapper exit 0" || bad "verify-wrapper" "non-zero exit"

echo "== 3. merge fixture: orientation flips =="
FM=$(bash "$HERE/make-conflict-fixture.sh" --mode merge | tail -1)
WM="/tmp/test-conflict-merge-$$"; rm -rf "$WM"; mkdir -p "$WM"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FM" --workspace "$WM" >/dev/null 2>&1
[ "$(jqv '.op' "$WM/attribution.json")" = "merge" ] && ok "op=merge" || bad "op" "got $(jqv '.op' "$WM/attribution.json")"
[ "$(jqv '.ours_is_you' "$WM/attribution.json")" = "true" ] && ok "ours_is_you=true (merge)" || bad "ours_is_you" "got $(jqv '.ours_is_you' "$WM/attribution.json")"

echo "== 4. self fixture: both sides same author → auto-pass path =="
FS=$(bash "$HERE/make-conflict-fixture.sh" --mode self | tail -1)
WSF="/tmp/test-conflict-self-$$"; rm -rf "$WSF"; mkdir -p "$WSF"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FS" --workspace "$WSF" >/dev/null 2>&1
[ "$(jqv '.files[0].involves_other_author' "$WSF/attribution.json")" = "false" ] && ok "involves_other_author=false (Mei vs Mei → auto-pass)" || bad "involves_other_author" "got $(jqv '.files[0].involves_other_author' "$WSF/attribution.json")"

echo "== 5. binary fixture =="
FB=$(bash "$HERE/make-conflict-fixture.sh" --mode binary | tail -1)
WB="/tmp/test-conflict-binary-$$"; rm -rf "$WB"; mkdir -p "$WB"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FB" --workspace "$WB" >/dev/null 2>&1
[ "$(jqv '.files[0].binary' "$WB/attribution.json")" = "true" ] && ok "binary detected" || bad "binary" "got $(jqv '.files[0].binary' "$WB/attribution.json")"

echo "== 6. modify/delete fixture: absent stage → no fake empty file =="
FMD=$(bash "$HERE/make-conflict-fixture.sh" --mode modify-delete | tail -1)
WMD="/tmp/test-conflict-md-$$"; rm -rf "$WMD"; mkdir -p "$WMD"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FMD" --workspace "$WMD" >/dev/null 2>&1
bash "$SCRIPTS/materialize-conflict-sides.sh" --repo-root "$FMD" --workspace "$WMD" >/dev/null 2>&1
md_base=$(jqv '.[0].base_ok' "$WMD/files.json"); md_head=$(jqv '.[0].head_ok' "$WMD/files.json")
if [ "$md_base" = "false" ] || [ "$md_head" = "false" ]; then ok "modify/delete: one side flagged absent (base_ok=$md_base head_ok=$md_head)"; else bad "modify/delete absent" "both sides present (base_ok=$md_base head_ok=$md_head)"; fi
absent_empty=0
[ "$md_base" = "false" ] && [ -f "$WMD/before/mockup-login.html" ] && absent_empty=1
[ "$md_head" = "false" ] && [ -f "$WMD/after/mockup-login.html" ] && absent_empty=1
if [ "$absent_empty" = "0" ]; then ok "modify/delete: absent side truly missing (no 0-byte file)"; else bad "modify/delete" "left a fake empty file"; fi

echo "== 7. multi-commit rebase: same-author commits don't hide the other author =="
FRM=$(bash "$HERE/make-conflict-fixture.sh" --mode rebase-multi | tail -1)
WRM="/tmp/test-conflict-rm-$$"; rm -rf "$WRM"; mkdir -p "$WRM"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FRM" --workspace "$WRM" >/dev/null 2>&1
if [ "$(jqv '.files[0].involves_other_author' "$WRM/attribution.json")" = "true" ]; then ok "multi-commit rebase: involves_other=true (Stanley still surfaced)"; else bad "involves_other regression" "got $(jqv '.files[0].involves_other_author' "$WRM/attribution.json")"; fi

echo "== 8. mixed-skip fixture: banner survives a non-design conflict sorted first =="
FMX=$(bash "$HERE/make-conflict-fixture.sh" --mode mixed-skip | tail -1)
WMX="/tmp/test-conflict-mx-$$"; rm -rf "$WMX"; mkdir -p "$WMX"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FMX" --workspace "$WMX" >/dev/null 2>&1
bash "$SCRIPTS/materialize-conflict-sides.sh" --repo-root "$FMX" --workspace "$WMX" >/dev/null 2>&1
if [ "$(jqv '.banner' "$WMX/compare-meta.json")" != "null" ] && [ "$(jqv '.left_author' "$WMX/compare-meta.json")" != "null" ]; then ok "mixed-skip: compare-meta author+banner from materialized design file (not skipped .js)"; else bad "mixed-skip" "banner/author blank (FIRST took the skipped file?)"; fi

echo "== 9. multi design-file conflict: no misleading global banner =="
FM2=$(bash "$HERE/make-conflict-fixture.sh" --mode multi-design | tail -1)
WM2="/tmp/test-conflict-m2-$$"; rm -rf "$WM2"; mkdir -p "$WM2"
bash "$SCRIPTS/attribute-conflict.sh" --repo-root "$FM2" --workspace "$WM2" >/dev/null 2>&1
bash "$SCRIPTS/materialize-conflict-sides.sh" --repo-root "$FM2" --workspace "$WM2" >/dev/null 2>&1
if [ "$(jqv '.multi_file' "$WM2/compare-meta.json")" = "true" ] && [ "$(jqv '.banner' "$WM2/compare-meta.json")" = "null" ]; then ok "multi design-file: multi_file=true, banner suppressed (no misleading global banner)"; else bad "multi-design banner" "multi_file=$(jqv '.multi_file' "$WM2/compare-meta.json") banner=$(jqv '.banner' "$WM2/compare-meta.json")"; fi

echo
echo "RESULT: $PASS passed, $FAIL failed"
# cleanup fixtures + workspaces
rm -rf "$WS" "$WM" "$WB" "$WSF" "$WMD" "$WRM" "$WMX" "$WM2" "$FX" "$FM" "$FB" "$FS" "$FMD" "$FRM" "$FMX" "$FM2" 2>/dev/null || true
[ "$FAIL" -eq 0 ]
