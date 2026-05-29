#!/usr/bin/env bash
# classify-change.sh — shared change-type classification helpers.
#
# Sourced by:
#   - auto-detect-violations.sh  (Stage 0.5 inline-style sub-classification)
#   - attribute-conflict.sh      (local merge-conflict change_type)
#
# Pure functions, no external state, safe to source under `set -euo pipefail`.
# Echo a single classification token; never exit / never write files.

# classify_inline_style <style-body>
#   Sub-classify an inline style="..." body (without the wrapper) into one of:
#     hardcoded — literal value bypassing tokens (raw hex/rgb color, px/em literal)
#     tokenized — uses var(--token); only the inline placement is the violation
#     state     — JS-driven state toggle only (display:none / visibility:hidden /
#                 opacity:0 / pointer-events:none)
#   Moved verbatim from auto-detect-violations.sh — behaviour must stay identical.
classify_inline_style() {
  local body="$1"
  local has_token has_state has_hardcoded_color has_hardcoded_px

  has_token=$(echo "$body" | grep -cE 'var\(--' || true)
  # State-only properties: display/visibility/opacity/pointer-events that resolve to
  # "off" values. Mixed with anything else, fall through to hardcoded/tokenized.
  has_state=$(echo "$body" | tr ';' '\n' | sed -E 's/^[[:space:]]+//' | grep -cE '^(display:[[:space:]]*none|visibility:[[:space:]]*hidden|opacity:[[:space:]]*0(\.0+)?|pointer-events:[[:space:]]*none)$' || true)
  # Count of declarations (non-empty after split on ;)
  local n_props
  n_props=$(echo "$body" | tr ';' '\n' | sed -E 's/^[[:space:]]+//' | grep -cE '.+:.+' || true)
  has_hardcoded_color=$(echo "$body" | grep -cE '(color|background)[^:]*:[[:space:]]*(#[0-9a-fA-F]{3,8}|rgb|hsl)' || true)
  has_hardcoded_px=$(echo "$body" | grep -cE ':[[:space:]]*-?[0-9]+(\.[0-9]+)?(px|em|rem)' || true)

  if [ "$has_state" -gt 0 ] && [ "$has_state" -eq "$n_props" ]; then
    echo "state"
  elif [ "$has_hardcoded_color" -gt 0 ] || [ "$has_hardcoded_px" -gt 0 ]; then
    echo "hardcoded"
  elif [ "$has_token" -gt 0 ]; then
    echo "tokenized"
  else
    # No tokens, no obvious literals — could be a JS-driven calc, a value like flex-shrink:0,
    # transform:rotate, etc. Treat as tokenized (low priority) since it's not violating tokens.
    echo "tokenized"
  fi
}

# classify_change_region <file-ext> <region-text>
#   Classify a merge-conflict region (the combined ours+theirs content of one block)
#   into one of: css-property | text-wording | html-structure | mixed | other
#
#   Used by attribute-conflict.sh to tell the designer *what kind* of change each
#   side made ("Stanley changed CSS", "Mei changed wording"). Heuristic, not exact —
#   for MVP it only informs the human; no automatic resolution depends on it.
#
#   Decision order:
#     .css            → css-property (whole file is CSS)
#     .md             → text-wording (markdown prose)
#     .svg            → html-structure (markup)
#     .html/.htm      → inspect region:
#         tag add/remove/move present   → html-structure (or mixed if also css/text)
#         only prop:value declarations  → css-property
#         only text nodes               → text-wording
#         combination                   → mixed
#     anything else   → other
classify_change_region() {
  local ext="$1"
  local text="$2"

  case "$ext" in
    css) echo "css-property"; return 0 ;;
    md|markdown) echo "text-wording"; return 0 ;;
    svg) echo "html-structure"; return 0 ;;
    html|htm) : ;;  # fall through to region inspection
    *) echo "other"; return 0 ;;
  esac

  local has_tag has_css has_text
  # Markup tags: <tag ...> or </tag>
  has_tag=$(printf '%s' "$text" | grep -cE '</?[a-zA-Z][a-zA-Z0-9-]*([[:space:]][^>]*)?>' || true)
  # CSS-ish declarations: `name: value;` inside style="" or <style> or .css-like lines
  has_css=$(printf '%s' "$text" | grep -cE '[a-zA-Z-]+[[:space:]]*:[[:space:]]*[^;{}]+;' || true)
  # Text content: a line with word characters that is NOT pure markup and NOT a css decl
  has_text=$(printf '%s' "$text" \
    | grep -vE '^[[:space:]]*</?[a-zA-Z]' \
    | grep -vE '[a-zA-Z-]+[[:space:]]*:[[:space:]]*[^;{}]+;' \
    | grep -cE '[a-zA-Z0-9]' || true)

  local kinds=0
  [ "$has_tag" -gt 0 ] && kinds=$((kinds + 1))
  [ "$has_css" -gt 0 ] && kinds=$((kinds + 1))
  [ "$has_text" -gt 0 ] && kinds=$((kinds + 1))

  if [ "$kinds" -gt 1 ]; then
    echo "mixed"
  elif [ "$has_tag" -gt 0 ]; then
    echo "html-structure"
  elif [ "$has_css" -gt 0 ]; then
    echo "css-property"
  elif [ "$has_text" -gt 0 ]; then
    echo "text-wording"
  else
    echo "mixed"
  fi
}
