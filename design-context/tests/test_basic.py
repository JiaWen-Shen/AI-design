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


# --- revision 2026-05-28: type/teams + freshness + tag filter ---

def test_source_defaults_to_git_type():
    import _lib
    s = _lib.Source(id="x", tier="L1", repo="r", cache=Path("~/x"), ttl="weekly")
    assert s.is_git is True and s.is_teams is False


def test_source_teams_type_and_fields():
    import _lib
    s = _lib.Source(
        id="t", tier="L2", cache=Path(".x"), ttl="daily", type="teams",
        target={"chat_topic": "HIE Design"}, tags=["#共識"], lookback="14d",
    )
    assert s.is_teams is True and s.is_git is False
    assert s.repo == ""               # repo optional for teams
    assert s.target["chat_topic"] == "HIE Design"
    assert s.lookback == "14d"


def test_load_config_parses_teams_source(tmp_path):
    import _lib
    cfg = tmp_path / "sources.yaml"
    cfg.write_text(
        "sources:\n"
        "  - id: hie\n"
        "    tier: L2\n"
        "    type: teams\n"
        "    cache: .design-context/hie\n"
        "    ttl: session+30min\n"
        "    target: {chat_topic: HIE Design}\n"
        "    tags: ['#共識', '#conclusion']\n"
        "    lookback: 30d\n"
    )
    s = _lib.load_config(cfg)[0]
    assert s.is_teams and s.type == "teams"
    assert s.tags == ["#共識", "#conclusion"]
    assert s.target["chat_topic"] == "HIE Design"


def test_filter_messages_by_tags_keeps_matching():
    import _lib
    msgs = [
        {"text": "這版就這樣辦 #共識"},
        {"text": "隨便聊聊"},
        {"text": "#CONCLUSION final call"},
    ]
    kept = _lib.filter_messages_by_tags(msgs, ["#共識", "#conclusion"])
    assert len(kept) == 2  # case-insensitive on the tag


def test_filter_messages_empty_tags_returns_all():
    import _lib
    msgs = [{"text": "a"}, {"text": "b"}]
    assert _lib.filter_messages_by_tags(msgs, []) == msgs


def test_file_last_updated_none_when_not_git(tmp_path):
    import _lib
    assert _lib.file_last_updated(tmp_path, "anything.md") is None


def test_fetch_teams_parse_lookback_relative():
    import fetch_teams
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    secs = (now - fetch_teams.parse_lookback("7d")).total_seconds()
    assert abs(secs - 7 * 86400) < 5          # ~7 days within tolerance
    assert fetch_teams.parse_lookback("garbage") < now  # falls back to ~30d


def test_fetch_teams_normalize_filters_old_and_strips_html():
    import fetch_teams
    from datetime import datetime, timezone, timedelta
    since = datetime.now(timezone.utc) - timedelta(days=7)
    raw = [
        {"id": "1", "createdDateTime": (datetime.now(timezone.utc)).isoformat().replace("+00:00", "Z"),
         "from": {"user": {"displayName": "Mei"}},
         "body": {"contentType": "html", "content": "<p>hi <b>#共識</b></p>"}},
        {"id": "2", "createdDateTime": "2000-01-01T00:00:00Z",  # too old
         "from": {"user": {"displayName": "Old"}},
         "body": {"contentType": "text", "content": "ancient"}},
    ]
    out = fetch_teams.normalize(raw, since)
    assert len(out) == 1
    assert out[0]["author"] == "Mei"
    assert "#共識" in out[0]["text"] and "<b>" not in out[0]["text"]


def test_fetch_teams_render_markdown_has_caveat():
    import fetch_teams
    md = fetch_teams.render_markdown(
        "hie", "HIE Design",
        [{"author": "Mei", "timestamp": "2026-05-20T10:00", "text": "ok #共識", "url": ""}],
        ["#共識"],
    )
    assert "Teams consensus" in md
    assert "參考" in md  # honest-boundary caveat present
    assert "Mei" in md
