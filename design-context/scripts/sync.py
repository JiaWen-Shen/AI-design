#!/usr/bin/env python3
"""Sync all configured design-context sources.

For each source in ~/.config/design-context/sources.yaml:
  - clone if missing (L1 = shallow; L2 = sparse-checkout)
  - else: git pull --ff-only, capture diff vs previous HEAD
  - write per-source last-update-digest.md if changes
  - fire macOS notification if changes exceed threshold

Idempotent. Safe to run from cron or SessionStart hook.
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import _lib  # noqa: E402
import fetch_teams  # noqa: E402


def sync_teams(source: _lib.Source, cwd: Path) -> dict:
    """Sync a type=teams source: fetch tagged messages → markdown cache.

    'changed' = rendered markdown differs from the previous cache file.
    Network/auth errors propagate to caller (sync_pass logs per-source).
    """
    cache_dir = source.resolved_cache(cwd)
    cache_dir.mkdir(parents=True, exist_ok=True)
    out_file = cache_dir / f"{source.id}.consensus.md"

    prev = out_file.read_text() if out_file.exists() else ""
    msgs = fetch_teams.fetch(source.target or {}, source.tags, source.lookback)
    md = fetch_teams.render_markdown(
        source.id, fetch_teams._target_desc(source.target or {}), msgs, source.tags
    )
    # Ignore the timestamp header line when deciding if content changed.
    def _strip_ts(t: str) -> str:
        return "\n".join(ln for ln in t.splitlines() if not ln.startswith("# ") and "sync" not in ln[:40])
    changed = _strip_ts(md) != _strip_ts(prev)
    out_file.write_text(md)

    lines_changed = abs(len(md.splitlines()) - len(prev.splitlines())) if changed else 0
    diff = {
        "prev_sha": "", "new_sha": "",
        "files_changed": 1 if changed else 0,
        "lines_changed": lines_changed,
        "commits": [], "diff_summary": f"{len(msgs)} tagged messages",
        "changed": changed, "msg_count": len(msgs),
    }

    _lib.write_state(_lib.state_file_for(source, cwd), {
        "source_id": source.id, "last_fetch": _lib.now_iso(),
        "type": "teams", "msg_count": len(msgs), "changed": changed,
    })
    if changed:
        write_digest(source, cache_dir, diff, cwd)
        if should_notify(source, diff):
            _lib.osascript_notify(
                title=f"design-context: {source.id}",
                body=f"{len(msgs)} tagged messages updated", subtitle=source.tier,
            )
    return {
        "id": source.id, "mode": "teams", "path": str(out_file),
        "changed": changed, "files_changed": diff["files_changed"],
        "lines_changed": lines_changed,
    }


def ensure_clone(source: _lib.Source, cwd: Path) -> Path:
    """Clone the source if cache missing. Return the cache path."""
    cache = source.resolved_cache(cwd)
    cache.parent.mkdir(parents=True, exist_ok=True)

    if (cache / ".git").exists():
        return cache

    if source.is_l1:
        # Plain shallow clone — small repos, full content
        _lib.run([
            "git", "clone", "--depth", "1", "--filter=blob:none",
            source.repo, str(cache),
        ])
    else:
        # L2 — sparse-checkout for big repos
        _lib.run([
            "git", "clone", "--depth", "1", "--filter=blob:none",
            "--sparse", source.repo, str(cache),
        ])
        if source.sparse_paths:
            _lib.git(["sparse-checkout", "set", *source.sparse_paths], cwd=cache)

    return cache


def fetch_and_diff(source: _lib.Source, cache: Path) -> dict:
    """Pull latest; return diff summary vs previous HEAD.

    Returns dict with: prev_sha, new_sha, files_changed, lines_changed,
    commits (list of dicts), diff_summary (str), changed (bool).
    """
    # Record previous HEAD
    prev_sha = _lib.git(["rev-parse", "HEAD"], cwd=cache).stdout.strip()

    # Pull. --ff-only avoids merge accidents.
    fetch = _lib.git(["fetch", "--depth", "50", "origin"], cwd=cache, check=False)
    if fetch.returncode != 0:
        return {
            "prev_sha": prev_sha, "new_sha": prev_sha,
            "files_changed": 0, "lines_changed": 0,
            "commits": [], "diff_summary": "",
            "changed": False,
            "error": fetch.stderr.strip(),
        }

    # Reset to remote (sparse-friendly; merge with sparse-checkout is fiddly)
    default_branch = _lib.git(
        ["symbolic-ref", "refs/remotes/origin/HEAD"], cwd=cache, check=False
    ).stdout.strip().rsplit("/", 1)[-1] or "main"
    _lib.git(["reset", "--hard", f"origin/{default_branch}"], cwd=cache, check=False)

    new_sha = _lib.git(["rev-parse", "HEAD"], cwd=cache).stdout.strip()

    if prev_sha == new_sha:
        return {
            "prev_sha": prev_sha, "new_sha": new_sha,
            "files_changed": 0, "lines_changed": 0,
            "commits": [], "diff_summary": "",
            "changed": False,
        }

    # Stat diff
    stat = _lib.git(
        ["diff", "--shortstat", prev_sha, new_sha], cwd=cache, check=False
    ).stdout.strip()
    files_changed = lines_changed = 0
    # e.g. " 3 files changed, 120 insertions(+), 45 deletions(-)"
    import re
    if m := re.search(r"(\d+) files? changed", stat):
        files_changed = int(m.group(1))
    if mi := re.search(r"(\d+) insertions?", stat):
        lines_changed += int(mi.group(1))
    if md := re.search(r"(\d+) deletions?", stat):
        lines_changed += int(md.group(1))

    # Commit log
    log = _lib.git(
        ["log", "--pretty=format:%h|%an|%s", f"{prev_sha}..{new_sha}"],
        cwd=cache, check=False,
    ).stdout.strip()
    commits = []
    for line in log.splitlines():
        parts = line.split("|", 2)
        if len(parts) == 3:
            commits.append({"sha": parts[0], "author": parts[1], "subject": parts[2]})

    # Per-file diff stat
    diff_summary = _lib.git(
        ["diff", "--stat", prev_sha, new_sha], cwd=cache, check=False
    ).stdout.strip()

    return {
        "prev_sha": prev_sha,
        "new_sha": new_sha,
        "files_changed": files_changed,
        "lines_changed": lines_changed,
        "commits": commits,
        "diff_summary": diff_summary,
        "changed": True,
    }


def write_digest(source: _lib.Source, cache: Path, diff: dict, cwd: Path) -> Path:
    """Write last-update-digest.md for this source."""
    digest_dir = cache.parent if source.is_l1 else (cwd / _lib.PROJECT_CACHE_DIRNAME)
    digest_dir.mkdir(parents=True, exist_ok=True)
    digest_path = digest_dir / f"{source.id}.last-update-digest.md"

    lines = [
        f"# {source.id} — sync {_lib.now_iso()}",
        "",
        f"- Repo: `{source.repo}`",
        f"- Previous HEAD: `{diff['prev_sha'][:10]}`",
        f"- New HEAD: `{diff['new_sha'][:10]}`",
        f"- Files changed: **{diff['files_changed']}**, lines: **{diff['lines_changed']}**",
        "",
    ]

    if not diff["changed"]:
        lines.append("_No changes since previous sync._")
    else:
        lines.append("## Commits")
        for c in diff["commits"]:
            lines.append(f"- `{c['sha']}` **{c['author']}** — {c['subject']}")
        lines.append("")
        lines.append("## Files")
        lines.append("```")
        lines.append(diff["diff_summary"])
        lines.append("```")
        lines.append("")
        lines.append(
            "> Agent: when designing, surface relevant changes inline if they "
            "affect the requested feature."
        )

    digest_path.write_text("\n".join(lines))
    return digest_path


def should_notify(source: _lib.Source, diff: dict) -> bool:
    if not diff["changed"]:
        return False
    cfg = source.notify_on_update or {}
    if not cfg.get("desktop", False):
        return False
    th = cfg.get("threshold", {})
    return (
        diff["files_changed"] >= th.get("files_changed", 1)
        and diff["lines_changed"] >= th.get("lines_changed", 1)
    )


def sync_one(source: _lib.Source, cwd: Path) -> dict:
    """Sync a single source. Returns summary dict for caller logging."""
    # type=teams → MSGRAPH path, not git
    if source.is_teams:
        return sync_teams(source, cwd)

    # Local passthrough — skip sync if working dir is source repo itself
    passthrough = source.passthrough_path(cwd)
    if passthrough and passthrough.exists():
        return {
            "id": source.id,
            "mode": "passthrough",
            "path": str(passthrough),
            "changed": False,
        }

    cache = ensure_clone(source, cwd)
    diff = fetch_and_diff(source, cache)

    # State file
    state_path = _lib.state_file_for(source, cwd)
    _lib.write_state(state_path, {
        "source_id": source.id,
        "last_fetch": _lib.now_iso(),
        "head_sha": diff["new_sha"],
        "prev_sha": diff["prev_sha"],
        "changed": diff["changed"],
    })

    if diff["changed"]:
        write_digest(source, cache, diff, cwd)
        if should_notify(source, diff):
            body = (
                f"{diff['files_changed']} files, +{diff['lines_changed']} lines "
                f"by {diff['commits'][0]['author'] if diff['commits'] else 'unknown'}"
            )
            _lib.osascript_notify(
                title=f"design-context: {source.id}",
                body=body,
                subtitle=source.tier,
            )

    return {
        "id": source.id,
        "mode": "clone" if not (cache / ".git").exists() else "sync",
        "path": str(cache),
        "changed": diff["changed"],
        "files_changed": diff["files_changed"],
        "lines_changed": diff["lines_changed"],
    }


REGISTERED_PROJECTS = _lib.GLOBAL_CACHE_ROOT / "registered-projects.txt"


def looks_like_project(cwd: Path) -> bool:
    """Heuristic: cwd is a project iff it has .git, .claude/, or CLAUDE.md.

    Avoids accidentally registering HOME or unrelated dirs.
    """
    if cwd == Path.home():
        return False
    return any((cwd / m).exists() for m in (".git", ".claude", "CLAUDE.md"))


def register_cwd(cwd: Path, force: bool = False) -> bool:
    """Add cwd to the list cron uses to iterate L2 projects.

    Returns True if added or already present, False if rejected.
    """
    if not force and not looks_like_project(cwd):
        return False
    REGISTERED_PROJECTS.parent.mkdir(parents=True, exist_ok=True)
    existing = []
    if REGISTERED_PROJECTS.exists():
        existing = [
            line.strip()
            for line in REGISTERED_PROJECTS.read_text().splitlines()
            if line.strip()
        ]
    cwd_str = str(cwd)
    if cwd_str not in existing:
        existing.append(cwd_str)
        REGISTERED_PROJECTS.write_text("\n".join(existing) + "\n")
    return True


def registered_projects() -> list[Path]:
    if not REGISTERED_PROJECTS.exists():
        return []
    return [
        Path(line.strip())
        for line in REGISTERED_PROJECTS.read_text().splitlines()
        if line.strip() and Path(line.strip()).is_dir()
    ]


def sync_pass(cwd: Path, sources: list[_lib.Source], only: str | None, quiet: bool) -> None:
    """Single pass for a given cwd. Used both directly and by --all-registered."""
    targets = [s for s in sources if not only or s.id == only]
    # Skip L2 sources if cwd is not a real project dir (avoid polluting HOME with .design-context/)
    if not looks_like_project(cwd):
        targets = [s for s in targets if not s.is_l2]
    if not quiet:
        print(f"[design-context] sync @ {cwd}  ({len(targets)} sources)")
    for src in targets:
        try:
            r = sync_one(src, cwd)
            if not quiet:
                tag = "↻" if r["changed"] else "✓"
                extra = (
                    f" ({r['files_changed']} files, {r['lines_changed']} lines)"
                    if r["changed"] else ""
                )
                print(f"  {tag} {r['id']:<20} {r['mode']:<12} {r['path']}{extra}")
        except Exception as e:
            sys.stderr.write(f"[design-context] {src.id} failed: {e}\n")

    from render_manifest import render_all
    render_all(cwd)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="Sync only this source id")
    parser.add_argument("--quiet", action="store_true", help="Suppress per-source log")
    parser.add_argument(
        "--all-registered",
        action="store_true",
        help="Sync L1 once + iterate over all registered project dirs for L2",
    )
    parser.add_argument(
        "--register",
        action="store_true",
        help="Register current dir so cron syncs L2 here",
    )
    args = parser.parse_args()

    sources = _lib.load_config()
    if not sources:
        sys.stderr.write(
            "[design-context] no sources configured. Run scripts/init.sh\n"
        )
        return 1

    cwd = Path.cwd()
    if args.register:
        added = register_cwd(cwd, force=True)
        if not args.quiet:
            print(f"[design-context] registered: {cwd}" if added else f"[design-context] skipped registration of {cwd}")

    if args.all_registered:
        # L1 once (in HOME so any L2 with relative cache won't accidentally write here)
        l1_only = [s for s in sources if s.is_l1]
        sync_pass(Path.home(), l1_only, args.only, args.quiet)
        # L2 in each registered project
        for proj in registered_projects():
            l2_only = [s for s in sources if s.is_l2]
            sync_pass(proj, l2_only, args.only, args.quiet)
        return 0

    # Auto-register cwd on each normal run (covers session-start path too)
    register_cwd(cwd)
    sync_pass(cwd, sources, args.only, args.quiet)
    return 0


if __name__ == "__main__":
    sys.exit(main())
