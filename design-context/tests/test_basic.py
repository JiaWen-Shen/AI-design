"""Minimal sanity tests for design-context scripts.

Run with: pytest tests/  (or `python3 -m pytest`)
No external network, no real git clones — pure unit-level structure checks.
"""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

import pytest

SKILL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SKILL_DIR / "scripts"))


def test_lib_imports():
    import _lib  # noqa: F401


def test_source_dataclass_defaults():
    import _lib
    s = _lib.Source(
        id="x", tier="L1", repo="git@host:org/x.git", cache=Path("~/.cache/x"), ttl="weekly",
    )
    assert s.is_l1 is True
    assert s.is_l2 is False
    assert s.read == []
    assert s.notify_on_update["digest"] is True


def test_source_resolved_cache_expands_tilde(tmp_path):
    import _lib
    s = _lib.Source(
        id="x", tier="L1", repo="r", cache=Path("~/.cache/design-context/x"), ttl="weekly",
    )
    resolved = s.resolved_cache(tmp_path)
    assert resolved.is_absolute()
    assert "design-context" in str(resolved)
    assert "~" not in str(resolved)


def test_source_resolved_cache_relative_to_cwd(tmp_path):
    import _lib
    s = _lib.Source(
        id="x", tier="L2", repo="r", cache=Path(".design-context/x"), ttl="daily",
    )
    resolved = s.resolved_cache(tmp_path)
    assert resolved == (tmp_path / ".design-context/x").resolve()


def test_passthrough_matches_ancestor():
    import _lib
    s = _lib.Source(
        id="x", tier="L2", repo="r", cache=Path(".x"), ttl="daily",
        local_passthrough={"cwd_matches": "REI-Project", "direct_path": "./docs"},
    )
    cwd = Path("/tmp/REI-Project/teams/HIE/src")
    pt = s.passthrough_path(cwd)
    assert pt is not None
    assert str(pt).endswith("REI-Project/docs")


def test_passthrough_no_match_returns_none():
    import _lib
    s = _lib.Source(
        id="x", tier="L2", repo="r", cache=Path(".x"), ttl="daily",
        local_passthrough={"cwd_matches": "REI-Project", "direct_path": "./docs"},
    )
    assert s.passthrough_path(Path("/tmp/unrelated/foo")) is None


def test_passthrough_no_config_returns_none():
    import _lib
    s = _lib.Source(id="x", tier="L1", repo="r", cache=Path("~/x"), ttl="weekly")
    assert s.passthrough_path(Path("/anywhere")) is None


def test_load_config_missing_returns_empty(tmp_path):
    import _lib
    assert _lib.load_config(tmp_path / "nonexistent.yaml") == []


def test_load_config_parses_yaml(tmp_path):
    import _lib
    cfg = tmp_path / "sources.yaml"
    cfg.write_text(
        "sources:\n"
        "  - id: foo\n"
        "    tier: L1\n"
        "    repo: git@host:foo.git\n"
        "    cache: ~/.cache/foo\n"
        "    ttl: weekly\n"
        "    read: [SKILL.md]\n"
    )
    srcs = _lib.load_config(cfg)
    assert len(srcs) == 1
    assert srcs[0].id == "foo"
    assert srcs[0].read == ["SKILL.md"]


def test_state_file_for_l1_goes_global(tmp_path):
    import _lib
    s = _lib.Source(id="x", tier="L1", repo="r", cache=Path("~/x"), ttl="weekly")
    p = _lib.state_file_for(s, tmp_path)
    assert "x.state.json" in str(p)


def test_state_file_for_l2_is_project_local(tmp_path):
    import _lib
    s = _lib.Source(id="x", tier="L2", repo="r", cache=Path(".x"), ttl="daily")
    p = _lib.state_file_for(s, tmp_path)
    assert str(p).startswith(str(tmp_path))
    assert ".design-context" in str(p)


def test_read_write_state_roundtrip(tmp_path):
    import _lib
    p = tmp_path / "state.json"
    _lib.write_state(p, {"a": 1, "b": "hello"})
    assert _lib.read_state(p) == {"a": 1, "b": "hello"}


def test_read_state_missing_returns_empty(tmp_path):
    import _lib
    assert _lib.read_state(tmp_path / "no.json") == {}


def test_now_iso_is_parseable():
    import _lib
    from datetime import datetime
    iso = _lib.now_iso()
    # Should round-trip through fromisoformat
    assert datetime.fromisoformat(iso) is not None


def test_sync_looks_like_project_rejects_home(monkeypatch, tmp_path):
    import sync
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    assert sync.looks_like_project(tmp_path) is False


def test_sync_looks_like_project_accepts_git_dir(tmp_path):
    import sync
    (tmp_path / ".git").mkdir()
    assert sync.looks_like_project(tmp_path) is True


def test_sync_looks_like_project_accepts_claude_md(tmp_path):
    import sync
    (tmp_path / "CLAUDE.md").touch()
    assert sync.looks_like_project(tmp_path) is True


def test_sync_looks_like_project_rejects_empty(tmp_path):
    import sync
    assert sync.looks_like_project(tmp_path) is False


def test_status_age_seconds_handles_invalid():
    import status
    assert status.age_seconds("not-a-date") == float("inf")


def test_status_human_age_buckets():
    import status
    assert status.human_age(30) == "30s"
    assert status.human_age(120).endswith("m")
    assert status.human_age(3700).endswith("h")
    assert status.human_age(90000).endswith("d")
    assert status.human_age(float("inf")) == "never"


def test_status_is_stale_threshold():
    import status, _lib
    s = _lib.Source(id="x", tier="L1", repo="r", cache=Path("~/x"), ttl="daily")
    assert status.is_stale(s, 100) is False         # 100s ago = fresh
    assert status.is_stale(s, 86400 * 2) is True    # 2 days ago = stale


def test_render_manifest_no_sources_returns_none(tmp_path, monkeypatch):
    import render_manifest, _lib
    monkeypatch.setattr(_lib, "CONFIG_PATH", tmp_path / "missing.yaml")
    l1, l2 = render_manifest.render_all(tmp_path)
    assert l1 is None and l2 is None


def test_add_source_preset_writes_config(tmp_path, monkeypatch):
    import add_source, _lib
    monkeypatch.setattr(_lib, "CONFIG_PATH", tmp_path / "sources.yaml")
    rc = add_source.add_preset("vxd-skill")
    assert rc == 0
    data = (tmp_path / "sources.yaml").read_text()
    assert "vxd-skill" in data
    assert "trendlife-general/vxd-skill" in data


def test_add_source_preset_idempotent(tmp_path, monkeypatch):
    import add_source, _lib
    monkeypatch.setattr(_lib, "CONFIG_PATH", tmp_path / "sources.yaml")
    add_source.add_preset("vxd-skill")
    add_source.add_preset("vxd-skill")
    text = (tmp_path / "sources.yaml").read_text()
    assert text.count("id: vxd-skill") == 1
