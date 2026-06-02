---
name: design-context
description: Load when designer needs to reference department design rules (VXD/TLDS tokens, brand, conventions), project PM specs (requirements, decisions, meeting notes), or team consensus from Teams (tagged #共識/#conclusion messages) while designing. Triggers when user says "design from <spec>", "請根據 <spec> 做設計", "用部門規範", "follow VXD", "依照 TLDS", "design rules", "design refresh", "design status", or asks for design help that requires PM context. Pulls latest content from registered Type-B reference sources (git repos + Teams, cron + on-demand), surfaces what changed since last session, and flags requirements that look stale versus newer meeting/Teams activity.
allowed-tools: Read Write Edit Grep Glob Bash
metadata:
  version: "0.1.0"
  author: karen_shen@trendmicro.com
---

# design-context

讀者關係（Type B）的 reference content 同步器 — 把部門規範 (L1) + 專案 PM 規格 (L2) 拉到 designer 工作環境，並保證 agent 在做設計時讀到對的東西。

---

## Overview — 這個 skill 幫設計師做什麼

設計師用 Claude Code 設計時，常見痛點：規範散落、忘了更新、agent 不一定讀到。這個 skill 解決：

- **自動同步部門規範**（TLDS tokens / brand / motion，L1）→ 設計自動合規，不用每次手貼。
- **自動同步專案 PM 需求 + 會議結論**（L2）→ 設計前讀到最新版。
- **納入 Teams 團隊共識**（`type: teams`，抓 `#共識`/`#conclusion` tagged 訊息）。
- **變更主動提醒**：規範/需求動了 → macOS 通知 + 下次設計時 agent inline 帶入。
- **過時防呆**：requirement 比近期會議/Teams 舊 → agent 提醒「可能過時」、不盲從。

### 操作流程 Flow

```
1. init.sh            一次設定：選來源 → 寫 sources.yaml → 裝 cron + hook
        │
        ▼
2. 背景持續同步        cron 每 30 分 + SessionStart hook 拉最新 → 本地 cache
        │
        ▼
3. 講人話觸發          「請根據 Q1 做設計」/「用部門規範」/「拉最新 PM spec」
        │
        ▼
4. agent 讀 manifest   最新規範 + 需求 + 共識 + 各檔 freshness 日期
        │
        ▼
5. 給設計建議          帶入規範；requirement 看起來過時就主動提醒，不盲從
        │
        ▼
6. 要改規範            回 source repo 開 PR（cache 唯讀）→ 下次 sync 自動更新
```

詳細指令見下方 [Commands](#commands)；一頁速查見 `USAGE.md`。

---

## On Activation — Read Immediately

When this skill loads, read ALL of the following before responding. Skip any path that does not exist (skill may not be fully initialised yet).

**Manifest (sources actually configured on this machine):**
```
~/.cache/design-context/manifest.md
./.design-context/manifest.md
```

The manifest lists every active source and points to the files agent should read. Read each file in the manifest's `## Read` section.

**Update digest (what changed since last sync):**
```
~/.cache/design-context/last-update-digest.md
./.design-context/last-update-digest.md
```

If a digest exists and was written in the last 7 days, read it. When giving design guidance, surface relevant changes inline — e.g. "注意 Q15 family setup 上週剛從 read-only 改成 plan-owner full access，你之前設計的 read-only flow 可能要調整".

### ⚠ Freshness rule — don't blindly follow a stale requirement (meeting 2026-05-28 §B.3)

A requirement doc is **starting intent, not ground truth.** Designs evolve in discussion (Sylvia/Heather feedback, Teams 共識) faster than the requirement file gets rewritten. Silently coding to an outdated requirement is how conflicts get manufactured.

Before designing from any L2 spec:
1. The manifest lists each file's **last-update date**. Compare the requirement's date against the newest **meeting-notes** and **Teams-consensus** activity.
2. If the requirement is **older** than recent meeting/Teams activity on the same topic → it may be stale. **Surface the gap to the designer** — e.g. 「這份 Q15 requirement 上次更新 4/12，但 5/20 的會議結論和 Teams #共識 之後又動過，可能已過時。你要以哪個為準？」 — and **do not silently follow the old requirement.**
3. **文件是參考，不是真實。** When requirement / meeting / Teams / current design conflict, present the conflict and let the designer decide. Never auto-resolve by trusting one source.

If manifest is missing, tell user to run:
```bash
bash <skill-path>/scripts/init.sh
```

---

## What this skill does

**核心定位**（會議 2026-05-28 §B.1）：持續同步 **requirement + 會議結論（meeting notes）**，並把 **Teams 團隊共識** 也納為設計 source。in-line design notes（回應 PM）為次要/未來。

Designer 在 Claude Code 裡設計時，需要的 reference：

| Tier | 例子 | 怎麼來 | 更新頻率 |
|---|---|---|---|
| **L1 部門規範** | TLDS tokens、brand voice、design system convention（`trendlife-general/vxd-skill`） | Plain shallow clone 到 `~/.cache/design-context/<repo>/` | Cron weekly + on-demand |
| **L2 專案 PM 規格** | PM requirements、**會議結論**、決策記錄（`trendlife-general/REI-Project/docs/*`） | Sparse-checkout 到 `<cwd>/.design-context/<repo>/` | SessionStart 增量 pull + cron 每 30 分鐘 |
| **L2 Teams 共識** (`type: teams`) | group chat / channel 裡帶 tag（`#共識`/`#conclusion`）的訊息 | MSGRAPH 抓 tagged 訊息 → markdown（`scripts/fetch_teams.py`） | cron 每 30 分鐘；需 `MSGRAPH_ACCESS_TOKEN` |

Designer **不該編輯** cache — 要改規範就回 source repo 開 PR（Type A 流程）。

> **誠實邊界（§B.2/B.6）**：工具只能「持續同步 + 提醒」，補不了「源頭沒回寫文件」這個溝通問題。skill 不保證內容正確，只保證你看到的是最新版 + 標出可能過時處。

---

## Commands

| Trigger | What happens |
|---|---|
| `design from <spec>` / 「請根據 <spec> 做設計」 | Skill 觸發，agent 讀 manifest + 該 spec + digest，開始給設計建議 |
| `design status` / 「context 還新嗎」 | `scripts/status.sh` 印出各 source 上次 sync 時間 + 是否 stale |
| `design refresh` / 「拉最新 PM spec」 | `scripts/sync.sh` 跑一輪手動同步 |
| `design rules` / 「目前有哪些規範」 | 列出所有 active sources + 它們的角色 |
| `follow VXD` / 「用部門規範」/「依照 TLDS」 | 確保 L1 規範被讀進 context |

---

## Architecture

```
            Source repos (GitHub Remote)
                       │
        ┌──────────────┴──────────────┐
        ▼                              ▼
  L1: vxd-skill                  L2: REI-Project
  (department rules)             (project specs)
        │                              │
   git clone --depth 1            git clone --depth 1
   --filter=blob:none             --filter=blob:none --sparse
        │                              │
        ▼                              ▼
  ~/.cache/design-context/      <cwd>/.design-context/
        │                              │
        └──────────────┬───────────────┘
                       ▼
              manifest.md (generated)
              last-update-digest.md (after sync)
                       │
                       ▼
              Claude Code agent reads
              (forced by On Activation block above)
```

**Sync triggers** (兩條保險)：
- **launchd cron** — `com.karenshen.design-context.sync` 每 30 分鐘背景跑
- **SessionStart hook** — Claude Code 開 session 時偵測 TTL，過期就背景 spawn sync（不阻塞）

**Update notification** (B + D)：
- **(B) macOS notification** — Sync 發現 diff 超過閾值（>2 檔 or >50 行），`osascript display notification` 即時跳
- **(D) Inline diff digest** — Sync 寫 `last-update-digest.md`（含 author、commit msg、diff stat、key changes 摘要）；agent 用 trigger 詞觸發 skill 時讀進來，給設計建議時自然帶入

---

## Setup

第一次使用：
```bash
bash <this-skill-dir>/scripts/init.sh
```

互動式設定：選 L1 source（預設 vxd-skill）+ L2 source（依當前 cwd 推薦）→ 寫 `~/.config/design-context/sources.yaml` → 第一次 sync → 安裝 launchd plist → 註冊 SessionStart hook 到當前專案 `.claude/settings.json`。

---

## Editing rules content (Type A redirect)

想改部門規範或 PM 規格？**不要動 cache** — cache 是 read-only 副本，下次 sync 會被覆蓋。

正確流程（Type A）：
1. `gh repo clone trendlife-general/<source-repo>`
2. `git checkout -b your-fix`
3. 改 source 檔案
4. `git push` + 開 PR
5. PR merge 後下次 cron 拉到，cache 自動更新

---

## Gotchas

- **Cache 是 read-only。** **Why:** Sync 會覆蓋。改動 cache 等於沒改。**Fix:** 走 Type A flow，去 source repo 開 PR。

- **L2 sparse-checkout 路徑寫死在 sources.yaml。** **Why:** 不同專案的 spec 路徑慣例不同。**Fix:** Init 時 skill 會 detect cwd 並建議；不對就手動改 `~/.config/design-context/sources.yaml`。

- **Working dir 已經是 source repo 時不重複 clone。** **Why:** Designer 直接 cd 到 REI-Project 工作時，PM spec 就在 `./docs/requirements/`，再 clone 一份是浪費。**Fix:** `local_passthrough.cwd_matches` 配置觸發直連路徑。

- **macOS notification 需要 osascript 權限。** **Why:** 第一次 osascript 跳通知會被系統權限攔。**Fix:** Init 時提示用戶在系統設定授權 Terminal/iTerm/Ghostty 通知權限。

- **Cron 跑時 SSH key passphrase 會卡。** **Why:** Cron 不在登入 session，拿不到 keychain。**Fix:** Init 偵測 SSH config 有 `UseKeychain yes` 沒，沒的話提示加。

---

## Related skills

- `vxd-skill`（被當 L1 source 拉進來）— 提供 TLDS tokens、brand、motion specs。design-context 拉它，agent 同時可載入它的 SKILL.md 取得詳細規則。
- `aidea-harness`（不重疊）— 產新 PRD/UX proposal 的 multi-agent plugin。產出物可註冊為 design-context 的 L2 source（future）。
