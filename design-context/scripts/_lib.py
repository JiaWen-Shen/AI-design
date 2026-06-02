"""Shared helpers for design-context scripts.

Keep dependencies minimal: only pyyaml beyond stdlib. Designers should not
need anything beyond `pip3 install --user pyyaml`.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    sys.stderr.write(
        "[design-context] pyyaml not installed. Run:\n"
        "    pip3 install --user pyyaml\n"
    )
    sys.exit(1)


CONFIG_PATH = Path.home() / ".config" / "design-context" / "sources.yaml"
GLOBAL_CACHE_ROOT = Path.home() / ".cache" / "design-context"
GLOBAL_STATE_DIR = GLOBAL_CACHE_ROOT  # last-fetch.json + manifest.md live here too
PROJECT_CACHE_DIRNAME = ".design-context"


@dataclass
class Source:
    id: str
    tier: str            # "L1" or "L2"
    cache: Path
    ttl: str             # "weekly" | "daily" | "session+30min" | ...
    type: str = "git"    # "git" (clone/sparse) | "teams" (MSGRAPH tagged messages)
    repo: str = ""       # required for type=git; unused for type=teams
    read: list[str] = field(default_factory=list)
    sparse_paths: list[str] = field(default_factory=list)
    read_index: str | None = None
    local_passthrough: dict[str, Any] | None = None
    # type=teams config
    target: dict[str, Any] | None = None   # {chat_topic|chat_id|team+channel}
    tags: list[str] = field(default_factory=list)   # ["#共識","#conclusion"]
    lookback: str = "30d"
    notify_on_update: dict[str, Any] = field(default_factory=lambda: {
        "digest": True,
        "desktop": True,
        "threshold": {"files_changed": 1, "lines_changed": 20},
    })

    @property
    def is_l1(self) -> bool:
        return self.tier.upper() == "L1"

    @property
    def is_l2(self) -> bool:
        return self.tier.upper() == "L2"

    @property
    def is_teams(self) -> bool:
        return self.type.lower() == "teams"

    @property
    def is_git(self) -> bool:
        return self.type.lower() == "git"

    def resolved_cache(self, cwd: Path) -> Path:
        """Resolve cache path. L1 expands ~; L2 relative to cwd."""
        raw = str(self.cache)
        if raw.startswith("~"):
            return Path(os.path.expanduser(raw))
        if Path(raw).is_absolute():
            return Path(raw)
        # relative -> resolve against cwd
        return (cwd / raw).resolve()

    def passthrough_path(self, cwd: Path) -> Path | None:
        """If cwd matches local_passthrough rule, return direct path; else None."""
        if not self.local_passthrough:
            return None
        match = self.local_passthrough.get("cwd_matches")
        if not match:
            return None
        # match against any ancestor's name
        for p in [cwd, *cwd.parents]:
            if p.name == match:
                direct = self.local_passthrough.get("direct_path", ".")
                return (p / direct).resolve()
        return None


def load_config(path: Path | None = None) -> list[Source]:
    # Resolve at call time so monkeypatching CONFIG_PATH works in tests.
    if path is None:
        path = CONFIG_PATH
    if not path.exists():
        return []
    with path.open() as f:
        data = yaml.safe_load(f) or {}
    sources = []
    for raw in data.get("sources", []):
        sources.append(Source(
            id=raw["id"],
            tier=raw["tier"],
            type=raw.get("type", "git"),
            repo=raw.get("repo", ""),
            cache=Path(raw["cache"]),
            ttl=raw.get("ttl", "weekly"),
            read=raw.get("read", []),
            sparse_paths=raw.get("sparse_paths", []),
            read_index=raw.get("read_index"),
            local_passthrough=raw.get("local_passthrough"),
            target=raw.get("target"),
            tags=raw.get("tags", []),
            lookback=raw.get("lookback", "30d"),
            notify_on_update=raw.get("notify_on_update", {
                "digest": True,
                "desktop": True,
                "threshold": {"files_changed": 1, "lines_changed": 20},
            }),
        ))
    return sources


def state_file_for(source: Source, cwd: Path) -> Path:
    """Path to per-source state file (last-fetch.json)."""
    if source.is_l1:
        return GLOBAL_STATE_DIR / f"{source.id}.state.json"
    # L2 -> project-local
    return (cwd / PROJECT_CACHE_DIRNAME / f"{source.id}.state.json").resolve()


def read_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError:
        return {}


def write_state(path: Path, state: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, default=str))


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def run(cmd: list[str], cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess:
    """Run a subprocess, capturing output. Print stderr on failure for debug."""
    proc = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )
    if check and proc.returncode != 0:
        sys.stderr.write(
            f"[design-context] command failed: {' '.join(cmd)}\n"
            f"  stdout: {proc.stdout.strip()}\n"
            f"  stderr: {proc.stderr.strip()}\n"
        )
        raise subprocess.CalledProcessError(proc.returncode, cmd, proc.stdout, proc.stderr)
    return proc


def git(args: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess:
    return run(["git", *args], cwd=cwd, check=check)


def file_last_updated(cache: Path, rel: str) -> str | None:
    """Return YYYY-MM-DD of the last commit that touched `rel` inside a git cache.

    Used to surface requirement freshness so the agent can spot stale specs
    (meeting feedback B.3: an outdated requirement silently followed = conflict).
    Returns None if not a git repo or file untracked.
    """
    if not (cache / ".git").exists():
        return None
    res = run(
        ["git", "log", "-1", "--format=%cs", "--", rel],
        cwd=cache, check=False,
    )
    out = res.stdout.strip()
    return out or None


def filter_messages_by_tags(messages: list[dict[str, Any]], tags: list[str]) -> list[dict[str, Any]]:
    """Keep only messages whose text contains at least one of `tags`.

    Pure function (no I/O) so it is unit-testable. If `tags` is empty, returns
    all messages unchanged (no tag convention yet = pull everything).
    """
    if not tags:
        return list(messages)
    lowered = [t.lower() for t in tags]
    out = []
    for m in messages:
        text = (m.get("text") or "").lower()
        if any(t in text for t in lowered):
            out.append(m)
    return out


def osascript_notify(title: str, body: str, subtitle: str = "") -> None:
    """Fire a macOS notification. Silent failure if osascript unavailable."""
    script_parts = [f'display notification "{body}"', f'with title "{title}"']
    if subtitle:
        script_parts.append(f'subtitle "{subtitle}"')
    script_parts.append('sound name "Glass"')
    script = " ".join(script_parts)
    try:
        subprocess.run(["osascript", "-e", script], check=False, capture_output=True)
    except FileNotFoundError:
        pass
