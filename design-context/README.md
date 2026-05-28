# design-context

Claude Code skill that pulls **Type-B reference content** (department rules + project PM specs) into your local environment and ensures your AI agent reads the right rules when designing.

> **What's "Type B"?** A repo you read but don't edit (vs. Type A = collaborate, branch+PR; Type C = personal). Examples: design system tokens, brand guidelines, PM specs. See `AI-design/proposals/week3-git-vocabulary.pdf` for the framework.

---

## Why this exists

Designers using Claude Code need two kinds of context to design correctly:

1. **L1 — Department rules**: TLDS tokens, brand voice, motion specs, component conventions (lives in `trendlife-general/vxd-skill`)
2. **L2 — Project PM specs**: requirements, decisions, meeting notes (lives in `trendlife-general/REI-Project/docs/`)

Without this skill, your agent either ignores those rules (generates non-compliant designs) or you have to paste them in every session (tedious + error-prone). This skill keeps a fresh local copy and forces the agent to read it on activation.

## How it works

```
GitHub repos ──cron+session-start──▶ local cache ──skill activation──▶ agent reads
```

- **Cron** (`launchd`, every 30 min): pulls latest content in background
- **SessionStart hook**: extra safety, pulls if cron missed
- **`SKILL.md` "On Activation"**: when designer triggers skill, agent is forced to read manifest + digest before responding

## Install

```bash
# From wherever you cloned/symlinked this skill:
bash scripts/init.sh
```

Interactive setup:
1. Adds default sources (vxd-skill for L1, REI-Project for L2 if you're in a REI working dir)
2. Writes `~/.config/design-context/sources.yaml`
3. Runs first sync
4. Installs `launchd` cron
5. Registers SessionStart hook into your project's `.claude/settings.json`

## Daily use

### Triggers (what designer types)

**Chinese (natural):**
- 「請根據 Q1-ONBOARDING 做設計」
- 「用部門規範做這個」
- 「依照 TLDS」/「follow VXD」
- 「context 還新嗎」
- 「拉最新 PM spec」

**English (short):**
- `design from <spec>`
- `design status`
- `design refresh`
- `design rules`

### What happens when triggered

1. Claude Code matches skill via `SKILL.md` description
2. `On Activation` block forces agent to read `manifest.md` + `last-update-digest.md`
3. Agent gives design help grounded in actual rules + recent PM changes

## Updating rules / specs

Found something to fix in the rules? **Do not edit the cache** — it's read-only and will be overwritten on next sync.

Correct flow (Type A):
```bash
gh repo clone trendlife-general/<source-repo>
cd <source-repo>
git checkout -b your-fix
# edit, commit, push, open PR
```

After PR merges, your local cache picks it up on next sync (within 30 min).

## Notification behavior

When sync detects changes above threshold:
- **macOS notification**: pops immediately even if Claude Code is closed
- **Update digest** written to cache; agent reads it on next skill activation and surfaces relevant changes inline ("Q15 family setup spec was rewritten yesterday — your existing read-only design needs revisiting")

Threshold per source (configurable in `sources.yaml`):
- L1 (department): 1 file or 20 lines (low — rules changes matter)
- L2 (PM specs): 2 files or 50 lines (avoid spam on routine wording tweaks)

## Files

| Path | Purpose |
|---|---|
| `SKILL.md` | Skill metadata + On Activation pattern |
| `.claude-plugin/plugin.json` | Plugin manifest |
| `sources.example.yaml` | Config template |
| `scripts/init.sh` | First-time bootstrap |
| `scripts/sync.sh` | Pull all sources (cron + hook share this) |
| `scripts/render-manifest.sh` | Generate `manifest.md` from `sources.yaml` |
| `scripts/status.sh` | Show cache freshness + cron state |
| `scripts/add-source.sh` | Add new source interactively |
| `hooks/session-start.sh` | SessionStart hook body |
| `templates/launchd-cron.plist` | launchd job template |
| `sync-to-rei-project.sh` | Deploy this skill to REI-Project (Karen-only) |

## Verification

```bash
bash scripts/status.sh             # all sources fresh?
launchctl list | grep design-context   # cron registered?
ls ~/.cache/design-context/        # L1 caches?
ls .design-context/                # L2 caches in current project?
```

## Limitations

- macOS only (uses `launchd`, `osascript`). Linux/Windows could swap for systemd-timer + libnotify but not implemented v0.1.
- Requires SSH access to source repos. HTTPS+gh CLI fallback not implemented v0.1.
- No vector search inside cache (REI-Project has its own knowledge-search skill for that).

## Source-of-truth & distribution

- **Development**: `~/Jottacloud/vibe/AI-design/design-context/` (Karen's working copy)
- **Deployment**: `REI-Project/.claude/skills/design-context/` (synced via `sync-to-rei-project.sh`)
- Other projects can copy from REI-Project or symlink from development copy
