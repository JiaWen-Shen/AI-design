#!/usr/bin/env python3
"""Render manifest.md files agent reads on skill activation.

Two manifests:
  - ~/.cache/design-context/manifest.md  — L1 sources (global)
  - <cwd>/.design-context/manifest.md    — L2 sources (project-scoped)

Each manifest lists active sources + concrete file paths agent should read.
"""
from __future__ import annotations

import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import _lib  # noqa: E402


def _read_lines_for(source: _lib.Source, cwd: Path) -> list[tuple[str, str | None]]:
    """Return (abs_path, last_updated_date) pairs agent should read.

    The date (YYYY-MM-DD of last commit) lets the agent spot stale specs —
    meeting feedback B.3: a silently-followed outdated requirement causes conflict.
    """
    # type=teams — single rendered consensus file
    if source.is_teams:
        base = source.resolved_cache(cwd)
        f = base / f"{source.id}.consensus.md"
        return [(str(f), None)] if f.exists() else []

    # Passthrough wins
    pt = source.passthrough_path(cwd)
    if pt and pt.exists():
        base = pt
    else:
        base = source.resolved_cache(cwd)

    pairs: list[tuple[str, str | None]] = []

    def add(rel: str) -> None:
        candidate = base / rel
        if candidate.exists():
            pairs.append((str(candidate), _lib.file_last_updated(base, rel)))

    for rel in source.read:
        add(rel)
    if source.read_index:
        add(source.read_index)

    # Fallback: top-level .md files of sparse paths
    if not pairs and source.sparse_paths:
        for sp in source.sparse_paths:
            sp_path = base / sp
            if sp_path.is_dir():
                for p in sorted(sp_path.glob("*.md"))[:5]:
                    rel = str(p.relative_to(base))
                    pairs.append((str(p), _lib.file_last_updated(base, rel)))

    return pairs


def _digest_path_for(source: _lib.Source, cwd: Path) -> Path | None:
    """Return path to per-source digest if it exists."""
    if source.is_l1:
        candidate = _lib.GLOBAL_CACHE_ROOT / f"{source.id}.last-update-digest.md"
    else:
        candidate = (cwd / _lib.PROJECT_CACHE_DIRNAME / f"{source.id}.last-update-digest.md")
    return candidate if candidate.exists() else None


def render_tier(sources: list[_lib.Source], tier: str, cwd: Path) -> str:
    relevant = [s for s in sources if s.tier.upper() == tier.upper()]
    if not relevant:
        return f"_No {tier} sources configured._\n"

    out = []
    for src in relevant:
        kind = "teams" if src.is_teams else "git"
        out.append(f"### {src.id} ({tier} · {kind})")
        if src.is_teams:
            tgt = (src.target or {})
            out.append(f"- Teams: `{tgt.get('chat_topic') or tgt.get('chat_id') or tgt.get('channel_id') or '?'}`")
            out.append(f"- Tags: {', '.join(src.tags) if src.tags else '(all in window)'}")
        else:
            out.append(f"- Repo: `{src.repo}`")

        pt = src.passthrough_path(cwd)
        if pt and pt.exists():
            out.append(f"- Mode: **passthrough** (working dir matches source)")
            out.append(f"- Base: `{pt}`")
        else:
            cache = src.resolved_cache(cwd)
            out.append(f"- Cache: `{cache}`")

        pairs = _read_lines_for(src, cwd)
        if pairs:
            out.append("- Read:")
            for p, date in pairs:
                stamp = f"  _(updated {date})_" if date else ""
                out.append(f"  - `{p}`{stamp}")
        else:
            out.append("- _No readable files found — run `scripts/sync.py` to populate cache._")

        digest = _digest_path_for(src, cwd)
        if digest:
            out.append(f"- Digest: `{digest}`")
        out.append("")
    return "\n".join(out)


def render_all(cwd: Path | None = None) -> tuple[Path | None, Path | None]:
    """Write both manifests. Returns (l1_path, l2_path)."""
    cwd = cwd or Path.cwd()
    sources = _lib.load_config()
    if not sources:
        return (None, None)

    l1_path = _lib.GLOBAL_CACHE_ROOT / "manifest.md"
    l1_path.parent.mkdir(parents=True, exist_ok=True)
    l1_path.write_text(
        "# design-context — L1 manifest (department rules, global)\n\n"
        f"Generated: {_lib.now_iso()}\n\n"
        "## Read\n\n" + render_tier(sources, "L1", cwd)
    )

    # L2 only if cwd looks like a project (has .git / .claude / CLAUDE.md)
    has_l2 = any(s.tier.upper() == "L2" for s in sources)
    l2_path = None
    is_project = (
        cwd != Path.home()
        and any((cwd / m).exists() for m in (".git", ".claude", "CLAUDE.md"))
    )
    if has_l2 and is_project:
        l2_path = cwd / _lib.PROJECT_CACHE_DIRNAME / "manifest.md"
        l2_path.parent.mkdir(parents=True, exist_ok=True)
        l2_path.write_text(
            "# design-context — L2 manifest (project specs)\n\n"
            f"Generated: {_lib.now_iso()}\nProject: `{cwd}`\n\n"
            "> ⚠ **Freshness check (meeting 2026-05-28 §B.3):** each file below shows its "
            "last-update date. A requirement is **intent, not ground truth** — if it is "
            "older than recent meeting-notes / Teams-consensus activity, treat it as "
            "possibly stale: surface the gap to the designer, don't silently follow it.\n\n"
            "## Read\n\n" + render_tier(sources, "L2", cwd)
        )
        # Add .gitignore so designer can't accidentally commit cache
        gi_path = cwd / _lib.PROJECT_CACHE_DIRNAME / ".gitignore"
        if not gi_path.exists():
            gi_path.write_text("# design-context cache — DO NOT EDIT (overwritten on sync)\n*\n!.gitignore\n!manifest.md\n!*.last-update-digest.md\n")

    return (l1_path, l2_path)


def main() -> int:
    l1, l2 = render_all()
    if l1:
        print(f"  ✓ wrote {l1}")
    if l2:
        print(f"  ✓ wrote {l2}")
    if not l1 and not l2:
        print("  (no sources configured)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
