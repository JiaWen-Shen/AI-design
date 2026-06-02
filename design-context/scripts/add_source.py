#!/usr/bin/env python3
"""Interactively add a source to sources.yaml.

Usage:
  python3 add_source.py                       # full interactive
  python3 add_source.py --preset vxd-skill    # use a bundled preset
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import yaml  # type: ignore

import _lib  # noqa: E402


PRESETS = {
    "vxd-skill": {
        "id": "vxd-skill",
        "tier": "L1",
        "repo": "git@github.com:trendlife-general/vxd-skill.git",
        "cache": "~/.cache/design-context/vxd-skill",
        "ttl": "weekly",
        "read": [
            "SKILL.md",
            "tlds/tokens/foundation.md",
            "tlds/tokens/colors.md",
            "tlds/tokens/spacing.md",
            "tlds/tokens/typography.md",
            "tlds/tokens/motion.md",
            "tlds/tokens/grid.md",
            "tlds/brand/color.md",
            "tlds/brand/typography.md",
            "tlds/brand/logo.md",
        ],
        "notify_on_update": {
            "digest": True, "desktop": True,
            "threshold": {"files_changed": 1, "lines_changed": 20},
        },
    },
    "rei-pm-specs": {
        "id": "rei-pm-specs",
        "tier": "L2",
        "repo": "git@github.com:trendlife-general/REI-Project.git",
        "cache": ".design-context/rei-project",
        "ttl": "session+30min",
        "sparse_paths": [
            "docs/requirements",
            "docs/project",
            "docs/design",
            "docs/ui",
            "teams/PM",
        ],
        "read_index": "docs/requirements/REQUIREMENTS-INDEX.md",
        "local_passthrough": {
            "cwd_matches": "REI-Project",
            "direct_path": "./docs",
        },
        "notify_on_update": {
            "digest": True, "desktop": True,
            "threshold": {"files_changed": 2, "lines_changed": 50},
        },
    },
}


def load_or_empty() -> dict:
    if _lib.CONFIG_PATH.exists():
        with _lib.CONFIG_PATH.open() as f:
            return yaml.safe_load(f) or {"sources": []}
    return {"sources": []}


def save(data: dict) -> None:
    _lib.CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _lib.CONFIG_PATH.open("w") as f:
        yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)


def add_preset(name: str) -> int:
    if name not in PRESETS:
        sys.stderr.write(f"Unknown preset: {name}. Available: {list(PRESETS)}\n")
        return 1
    data = load_or_empty()
    existing = {s["id"] for s in data["sources"]}
    if PRESETS[name]["id"] in existing:
        print(f"  ↻ {name} already in config, skipping")
        return 0
    data["sources"].append(PRESETS[name])
    save(data)
    print(f"  ✓ added preset '{name}' to {_lib.CONFIG_PATH}")
    return 0


def prompt(question: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    ans = input(f"{question}{suffix}: ").strip()
    return ans or default


def add_interactive() -> int:
    print("\nAdd source to design-context\n")
    sid = prompt("Source id (slug)")
    if not sid:
        print("aborted")
        return 1
    tier = prompt("Tier (L1=department/global, L2=project)", "L2")
    repo = prompt("Repo URL (git@github.com:org/name.git)")
    if not repo:
        print("aborted")
        return 1

    if tier.upper() == "L1":
        cache = prompt("Cache path", f"~/.cache/design-context/{sid}")
        ttl = prompt("TTL", "weekly")
        entry = {"id": sid, "tier": "L1", "repo": repo, "cache": cache, "ttl": ttl}
    else:
        cache = prompt("Cache path (relative to working dir)", f".design-context/{sid}")
        ttl = prompt("TTL", "session+30min")
        sparse_csv = prompt("Sparse paths (comma-separated)", "docs/requirements")
        entry = {
            "id": sid, "tier": "L2", "repo": repo, "cache": cache, "ttl": ttl,
            "sparse_paths": [p.strip() for p in sparse_csv.split(",") if p.strip()],
        }

    data = load_or_empty()
    if any(s["id"] == sid for s in data["sources"]):
        print(f"  ! source '{sid}' already exists — edit {_lib.CONFIG_PATH} manually")
        return 2
    data["sources"].append(entry)
    save(data)
    print(f"\n  ✓ added '{sid}' to {_lib.CONFIG_PATH}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preset", help=f"Use a bundled preset: {list(PRESETS)}")
    args = parser.parse_args()

    if args.preset:
        return add_preset(args.preset)
    return add_interactive()


if __name__ == "__main__":
    sys.exit(main())
