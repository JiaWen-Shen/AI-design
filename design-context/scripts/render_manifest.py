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


def _read_lines_for(source: _lib.Source, cwd: Path) -> list[str]:
    """Return absolute paths agent should read for this source."""
    # Passthrough wins
    pt = source.passthrough_path(cwd)
    if pt and pt.exists():
        base = pt
    else:
        base = source.resolved_cache(cwd)

    paths: list[str] = []

    # Explicit read list (L1 style)
    for rel in source.read:
        candidate = base / rel
        if candidate.exists():
            paths.append(str(candidate))

    # Read index (L2 style)
    if source.read_index:
        candidate = base / source.read_index
        if candidate.exists():
            paths.append(str(candidate))

    # If no explicit read list, fall back to listing top-level .md files of sparse paths
    if not paths and source.sparse_paths:
        for sp in source.sparse_paths:
            sp_path = base / sp
            if sp_path.is_dir():
                # Add up to 5 representative .md files
                mds = sorted(sp_path.glob("*.md"))[:5]
                paths.extend(str(p) for p in mds)

    return paths


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
        out.append(f"### {src.id} ({tier})")
        out.append(f"- Repo: `{src.repo}`")

        pt = src.passthrough_path(cwd)
        if pt and pt.exists():
            out.append(f"- Mode: **passthrough** (working dir matches source)")
            out.append(f"- Base: `{pt}`")
        else:
            cache = src.resolved_cache(cwd)
            out.append(f"- Cache: `{cache}`")

        paths = _read_lines_for(src, cwd)
        if paths:
            out.append("- Read:")
            for p in paths:
                out.append(f"  - `{p}`")
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
