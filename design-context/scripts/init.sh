#!/usr/bin/env bash
# design-context first-time bootstrap.
#
# Walks designer through:
#   1. dependency check (python3 + pyyaml)
#   2. pick L1 source (default: vxd-skill)
#   3. pick L2 source (default: rei-pm-specs if cwd looks REI-related)
#   4. first sync
#   5. install launchd cron (every 30 min)
#   6. register SessionStart hook into project .claude/settings.json

set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
CWD="$(pwd)"

echo "=========================================="
echo "  design-context init"
echo "=========================================="
echo "Skill dir: $SKILL_DIR"
echo "Working dir: $CWD"
echo

# --- 1. Dependency check -------------------------------------------------
echo "→ Checking dependencies..."

PYTHON3="$(command -v python3 || true)"
if [[ -z "$PYTHON3" ]]; then
    echo "  ✗ python3 not found. Install Python 3 first."
    exit 1
fi
echo "  ✓ python3: $PYTHON3"

if ! "$PYTHON3" -c "import yaml" 2>/dev/null; then
    echo "  ! pyyaml not installed."
    read -r -p "    Install via 'pip3 install --user pyyaml'? [Y/n] " yn
    if [[ "${yn:-Y}" =~ ^[Yy]$ || -z "${yn:-}" ]]; then
        "$PYTHON3" -m pip install --user pyyaml
    else
        echo "  ✗ aborting (pyyaml required)"
        exit 1
    fi
fi
echo "  ✓ pyyaml"

# --- 2. Pick L1 source ---------------------------------------------------
echo
echo "→ L1 — Department rules (global, cached in ~/.cache/design-context/)"
read -r -p "  Add 'vxd-skill' (TLDS tokens + brand)? [Y/n] " yn
if [[ "${yn:-Y}" =~ ^[Yy]$ || -z "${yn:-}" ]]; then
    "$PYTHON3" "$SCRIPT_DIR/add_source.py" --preset vxd-skill
fi

# --- 3. Pick L2 source ---------------------------------------------------
echo
echo "→ L2 — Project PM specs (per-project, cached in <project>/.design-context/)"

# Auto-detect REI
SUGGEST_REI=0
if [[ "$CWD" == *"REI-Project"* || "$CWD" == *"rei-hie"* || "$CWD" == *"hie-rei"* ]]; then
    SUGGEST_REI=1
fi

if [[ $SUGGEST_REI -eq 1 ]]; then
    read -r -p "  Detected REI-related project. Add 'rei-pm-specs'? [Y/n] " yn
else
    read -r -p "  Add 'rei-pm-specs' (REI-Project docs/requirements + more)? [y/N] " yn
fi
if [[ "${yn:-N}" =~ ^[Yy]$ ]]; then
    "$PYTHON3" "$SCRIPT_DIR/add_source.py" --preset rei-pm-specs
fi

# --- 4. First sync -------------------------------------------------------
echo
echo "→ Initial sync (may take a moment — first L1 clone is ~30MB; L2 sparse <5MB)..."
"$PYTHON3" "$SCRIPT_DIR/sync.py" --register

# --- 5. Install launchd cron --------------------------------------------
echo
read -r -p "→ Install launchd cron job (every 30 min background sync)? [Y/n] " yn
if [[ "${yn:-Y}" =~ ^[Yy]$ || -z "${yn:-}" ]]; then
    PLIST_SRC="$SKILL_DIR/templates/launchd-cron.plist"
    PLIST_DST="$HOME/Library/LaunchAgents/com.karenshen.design-context.sync.plist"
    mkdir -p "$(dirname "$PLIST_DST")"

    # Substitute placeholders
    sed -e "s|{{PYTHON3}}|$PYTHON3|g" \
        -e "s|{{SKILL_DIR}}|$SKILL_DIR|g" \
        -e "s|{{HOME}}|$HOME|g" \
        "$PLIST_SRC" > "$PLIST_DST"

    # Bootout if already loaded (re-install)
    launchctl bootout "gui/$(id -u)" "$PLIST_DST" 2>/dev/null || true
    launchctl bootstrap "gui/$(id -u)" "$PLIST_DST"
    echo "  ✓ installed: $PLIST_DST"
    echo "  ✓ verify with: launchctl list | grep design-context"
fi

# --- 6. Register SessionStart hook --------------------------------------
echo
read -r -p "→ Register SessionStart hook in this project's .claude/settings.json? [Y/n] " yn
if [[ "${yn:-Y}" =~ ^[Yy]$ || -z "${yn:-}" ]]; then
    SETTINGS_DIR="$CWD/.claude"
    SETTINGS="$SETTINGS_DIR/settings.json"
    HOOK_CMD="bash \"$SKILL_DIR/hooks/session-start.sh\""

    mkdir -p "$SETTINGS_DIR"
    if [[ ! -f "$SETTINGS" ]]; then
        cat > "$SETTINGS" <<JSON
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {"type": "command", "command": "$HOOK_CMD"}
        ]
      }
    ]
  }
}
JSON
        echo "  ✓ created $SETTINGS"
    else
        # Merge using python (handles existing JSON safely)
        "$PYTHON3" - "$SETTINGS" "$HOOK_CMD" <<'PYEOF'
import json, sys
from pathlib import Path

settings_path = Path(sys.argv[1])
hook_cmd = sys.argv[2]

data = json.loads(settings_path.read_text())
hooks = data.setdefault("hooks", {})
session_start = hooks.setdefault("SessionStart", [])

# Look for existing entry with empty matcher; reuse if found
target = None
for entry in session_start:
    if entry.get("matcher", "") == "":
        target = entry
        break
if target is None:
    target = {"matcher": "", "hooks": []}
    session_start.append(target)

# Check if our command already there
hook_list = target.setdefault("hooks", [])
if not any(h.get("command") == hook_cmd for h in hook_list):
    hook_list.append({"type": "command", "command": hook_cmd})

settings_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
print(f"  ✓ merged hook into {settings_path}")
PYEOF
    fi
fi

echo
echo "=========================================="
echo "  done — try it out:"
echo "    python3 $SCRIPT_DIR/status.py"
echo "    python3 $SCRIPT_DIR/sync.py"
echo "    cat ~/.cache/design-context/manifest.md"
echo "=========================================="
