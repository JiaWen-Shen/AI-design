#!/usr/bin/env python3
"""Show design-context status: sources, cache freshness, cron state."""
from __future__ import annotations

import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import _lib  # noqa: E402


TTL_SECONDS = {
    "session+30min": 30 * 60,
    "hourly": 3600,
    "daily": 86400,
    "weekly": 7 * 86400,
}


def age_seconds(iso: str) -> float:
    try:
        dt = datetime.fromisoformat(iso)
    except ValueError:
        return float("inf")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - dt).total_seconds()


def human_age(seconds: float) -> str:
    if seconds == float("inf"):
        return "never"
    if seconds < 60:
        return f"{int(seconds)}s"
    if seconds < 3600:
        return f"{int(seconds/60)}m"
    if seconds < 86400:
        return f"{seconds/3600:.1f}h"
    return f"{seconds/86400:.1f}d"


def is_stale(source: _lib.Source, age: float) -> bool:
    limit = TTL_SECONDS.get(source.ttl, 86400)
    return age > limit


def check_cron() -> str:
    label = "com.karenshen.design-context.sync"
    try:
        out = subprocess.run(
            ["launchctl", "list"], capture_output=True, text=True, check=False
        ).stdout
    except FileNotFoundError:
        return "launchctl unavailable"
    for line in out.splitlines():
        if label in line:
            parts = line.split()
            pid = parts[0] if parts else "?"
            return f"installed (PID/status: {pid})"
    return "not installed"


def main() -> int:
    sources = _lib.load_config()
    print(f"design-context status — {_lib.now_iso()}\n")
    print(f"Config:  {_lib.CONFIG_PATH}")
    print(f"L1 cache: {_lib.GLOBAL_CACHE_ROOT}")
    print(f"Cron:    {check_cron()}\n")

    if not sources:
        print("(no sources configured — run scripts/init.sh)")
        return 0

    cwd = Path.cwd()
    print(f"{'id':<20} {'tier':<4} {'age':>8} {'state':<12} cache")
    print("-" * 80)
    for src in sources:
        state_path = _lib.state_file_for(src, cwd)
        state = _lib.read_state(state_path)
        last = state.get("last_fetch", "")
        age = age_seconds(last) if last else float("inf")
        if not last:
            label = "uninitialised"
        elif is_stale(src, age):
            label = "STALE"
        else:
            label = "fresh"

        pt = src.passthrough_path(cwd)
        cache = pt if pt and pt.exists() else src.resolved_cache(cwd)
        cache_str = str(cache)
        if len(cache_str) > 50:
            cache_str = "…" + cache_str[-49:]

        print(f"{src.id:<20} {src.tier:<4} {human_age(age):>8} {label:<12} {cache_str}")

    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
