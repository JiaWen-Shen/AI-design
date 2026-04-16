# Proposal: Designer Multi-Layer Repo Architecture

> **Author**: Karen Shen  
> **Date**: 2026-04-16  
> **Status**: Open for Discussion  

---

## Executive Summary

設計師在公司工作時，會接觸到多個層級的規範和專案。本 proposal 提出一個分層架構，依據「是否需要 Designer 貢獻內容」來選擇最適合的管理機制：

| Repo 類型 | Designer 角色 | 建議機制 |
|-----------|--------------|---------|
| **Project** | 需要貢獻（push 設計成果） | Git Submodule |
| **Company / Department** | 只需遵守（read-only） | Local Cache + TTL |
| **Personal** | 完全自主 | 直接管理 / Cloud Sync |

---

## Problem Statement

### 現況

目前 Designer 使用 Claude Code 時：
- **Project 規範**：透過 submodule 機制運作良好
- **Company / Department 規範**：沒有標準化的引用方式
  - 有些 designer 不知道規範存在
  - 有些 designer 忘記更新
  - Agent 不一定會在正確時機讀取規範

### 痛點

1. **規範遵守不一致**：Agent 可能忽略 Company/Department 層級的規則
2. **更新不同步**：規範更新後，Designer 可能繼續用舊版
3. **操作負擔**：如果要求 Designer pull 多個 repo，增加學習成本

---

## Proposed Solution

### 三層架構總覽

```
┌─────────────────────────────────────────────────────────────────┐
│                     Designer's Workspace                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Company    │  │  Department  │  │   Project    │          │
│  │    Rules     │  │  Guidelines  │  │    Work      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌─────────────────────────────┐    ┌─────────────┐            │
│  │   Local Cache + TTL         │    │  Submodule  │            │
│  │   (read-only, auto-fetch)   │    │  (read/write)│            │
│  └─────────────────────────────┘    └─────────────┘            │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │              Personal Repo                        │          │
│  │   ~/.claude/CLAUDE.md (global settings)          │          │
│  │   ~/work/personal/* (personal projects)          │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Type 1: Project Repo（需要 Designer Contribute）

### 適用情境
- Designer 需要 push 自己的設計成果
- 需要版本控制、協作、PR review

### 機制：Git Submodule（現有架構）

```
Team-Parent-Repo/
├── designer-alice/      ← Alice 的 submodule（獨立 repo）
├── designer-bob/        ← Bob 的 submodule（獨立 repo）
└── shared-assets/       ← 共用資源
```

### Designer 操作
1. Clone parent repo（自動拉 submodule）
2. 在自己的 submodule 裡工作
3. Push 到自己的 repo
4. Phase B: 更新 parent pointer

### 權限
- Read/Write on own submodule
- Read on parent repo

---

## Type 2: Company / Department Repo（Designer 只需 Follow）

### 適用情境
- 公司政策、部門規範、設計 guidelines
- Designer 不需要貢獻，只需要遵守
- 更新頻率低（季度/月度）

### 機制：Local Cache + TTL

#### 什麼是 TTL？

**TTL = Time To Live（存活時間）**

快取機制的一個設定：「這份資料可以用多久，過期就要重新拿」

```
設定 TTL = 24 小時

Session 1（Day 1 早上 9:00）
  └─ Cache 不存在 → fetch 規範 → 存到本地

Session 2（Day 1 下午 2:00，5 小時後）
  └─ Cache 存在 + 未過期 → 直接讀本地（不 fetch）

Session 3（Day 2 早上 10:00，25 小時後）
  └─ Cache 過期 → 重新 fetch → 更新 cache
```

#### 運作流程

```
Designer 開啟 Claude Code
         │
         ▼
┌─────────────────────────────────┐
│  SessionStart Hook 自動觸發      │
│  執行 fetch-guidelines.sh       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  檢查 cache 是否過期             │
│  （比對檔案修改時間 vs TTL）      │
└─────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
 未過期      已過期
    │         │
    │    ┌────┴────┐
    │    ▼         │
    │  curl fetch  │
    │  更新 cache   │
    │    │         │
    └────┼─────────┘
         ▼
┌─────────────────────────────────┐
│  輸出 cached content             │
│  → 注入 session context         │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Agent 開始工作                  │
│  已知道所有 Company/Dept 規範    │
└─────────────────────────────────┘
```

#### 目錄結構

```
~/.claude/
├── CLAUDE.md                    # Personal 全域設定
├── settings.json                # hooks, permissions
├── cache/                       # ← 規範快取目錄
│   ├── company-policy.md        # Company 規範快取
│   ├── dept-guidelines.md       # Department 規範快取
│   └── .meta.json               # TTL metadata
└── scripts/
    └── fetch-guidelines.sh      # TTL fetch 腳本
```

#### Designer 操作

**零操作** — 全自動

- SessionStart Hook 在每次開 session 時自動執行
- TTL 過期時自動 fetch 最新版
- Designer 完全不需要知道這個機制存在

#### 權限

- Read-only on Company/Dept repo
- 或直接用 public raw GitHub URL

### 為什麼選 Local Cache + TTL？

| 方案 | 確保 Agent 讀到 | Designer 操作 | Token 消耗 |
|------|----------------|--------------|-----------|
| 每次 WebFetch | ✅ | 零 | 高（每次 ~5,000 tokens） |
| Git Sparse Checkout | ❓ 要主動讀 | 需 clone + pull | 低 |
| Skill 化 | ❓ 要主動載入 | 需下載 skill | 低 |
| **Local Cache + TTL** | ✅ Hook 強制注入 | **零** | **低**（TTL 內不重複 fetch） |

**選擇 Local Cache + TTL 的原因**：
1. **強制性**：Hook 在 session 開始時自動執行，Agent 無法跳過
2. **零操作**：Designer 完全不需要做任何事
3. **省 Token**：TTL 內不重複 fetch，省 90%+ token

#### Token 消耗比較

假設 Department CLAUDE.md = 18KB ≈ 5,000 tokens

| 方案 | 每次 Session | 每天 10 Sessions |
|------|-------------|-----------------|
| 每次 WebFetch | ~5,000 tokens | ~50,000 tokens |
| **Local Cache + TTL** | ~5,000 首次，之後 0 | **~5,000 tokens** |

**省 90%+ token 消耗**

---

## Type 3: Personal Repo（Designer 個人空間）

### 適用情境
- 個人 side projects
- 全域 Claude Code 設定
- 跨裝置同步

### 組成

| 位置 | 用途 |
|------|------|
| `~/.claude/CLAUDE.md` | 全域 Claude Code 設定 |
| `~/.claude/settings.json` | hooks、permissions |
| `~/work/personal/*` | 個人 side projects |

### 跨裝置同步選項

1. **Personal GitHub repo**：`~/.claude/` 整個資料夾作為 repo
2. **Cloud sync**（Dropbox/iCloud/Jottacloud）：symlink 到 sync 資料夾
3. **Dotfiles repo**：納入個人 dotfiles 管理

### Designer 操作
- 自己管理（或 Agent 協助）

### 權限
- Full control

---

## Context 載入順序

當 Designer 開啟 Claude Code session 時，context 載入順序：

```
Session Context
═══════════════

1. [SessionStart Hook Output]        ← 最先載入
   ├── === Company Policy ===
   │   （from ~/.claude/cache/company-policy.md）
   │
   └── === Department Guidelines ===
       （from ~/.claude/cache/dept-guidelines.md）

2. [Project CLAUDE.md]               ← 第二載入
   （from ~/work/team-project/CLAUDE.md）

3. [Global CLAUDE.md]                ← 最後載入
   （from ~/.claude/CLAUDE.md）
```

---

## 各層級的更新方式

| 層級 | 更新頻率 | 誰更新 | Designer 要做什麼 |
|------|---------|-------|------------------|
| Company | 季度 | Admin | 零（TTL 自動 fetch） |
| Department | 月度 | Team Lead | 零（TTL 自動 fetch） |
| Project | 每天 | Team | `git pull`（或說「sync」） |
| Personal | 隨時 | 自己 | 自己編輯 |

---

## Implementation Plan

### Phase 1: 建立文件結構
- 建立 `architecture/` 目錄
- 撰寫架構說明文件

### Phase 2: 實作 Local Cache + TTL
- 開發 `fetch-guidelines.sh` 腳本
- 建立 `settings-snippet.json`（hook 設定範例）
- 建立 `.meta.json` 範例

### Phase 3: 整合與測試
- 測試 TTL 機制
- 測試 Hook 注入
- End-to-end 驗證

### Phase 4: 文件化
- 更新 `AI-design/github-for-designers.md`（Week 5）
- 建立 Designer 設定指南

---

## Risks & Mitigations

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| 網路斷線時無法 fetch | 首次 session 無規範 | 使用 stale cache + warning |
| TTL 設太長，規範更新後 Designer 用舊版 | 規範不一致 | 建議 TTL = 24 小時；緊急更新時通知 Designer 清 cache |
| Cache 目錄被誤刪 | 下次自動重建 | 低風險，自動恢復 |

---

## Success Metrics

1. **100% 規範覆蓋**：每個 Designer session 都載入 Company/Dept 規範
2. **零操作**：Designer 不需要手動更新規範
3. **Token 節省 90%+**：相比每次 WebFetch

---

## Next Steps

1. Review and approve this proposal
2. Implement Phase 1-2（架構 + 腳本）
3. Pilot test with 1-2 designers
4. Roll out to full team

---

## Next Phase: Hooks & Sources Configuration

### 目前的 Gap

Local Cache + TTL 工具包已實作完成，但存在一個關鍵問題：

```
sources.json 需要填 URL → 但 Designer 怎麼知道該填什麼？
```

目前流程：
```
Designer 安裝工具包
    ↓
打開 sources.json
    ↓
❓ 要填什麼 URL？
❓ Company 規範在哪？
❓ 我的 Department 規範是哪個？
```

### 缺少的環節

| 層級 | 負責人 | 應該做什麼 | 目前狀態 |
|------|--------|-----------|---------|
| Company | Admin | 公告 Company CLAUDE.md 的 raw URL | ❓ 未定義 |
| Department | Team Lead | 公告 Dept CLAUDE.md 的 raw URL | ❓ 未定義 |
| **Designer** | 自己 | 填入正確的 sources.json | ❓ 不知道該填什麼 |

### 理想流程

```
Company/Dept Admin 維護「official sources registry」
                    ↓
           ┌────────┴────────┐
           ▼                 ▼
     方案 A               方案 B
  集中式 registry      分散式配置
           │                 │
           ▼                 ▼
  Designer 選部門      各部門 repo 自帶
  → 自動套用設定        sources.json
```

### 預期產出

1. **標準化的 sources 配置格式** — 讓各部門 Admin 有依循的規範
2. **Setup script 改進** — 讓 Designer 能輕鬆選擇自己的部門
3. **文件化的 URL registry** — 公司/部門規範的 canonical URL 清單

---

## Discussion: Department Repo 配置方案

> ⚠️ 此章節需要團隊討論後決定

### 議題 1：Sources Registry 放在哪裡？

| 方案 | 說明 | 優點 | 缺點 |
|------|------|------|------|
| **A. 集中式** | 公司層級維護一份 `all-sources.json`，包含所有部門 | 統一管理、版本控制 | 需要 Admin 維護、部門異動時要更新 |
| **B. 分散式** | 各部門 repo 自帶 `sources.json`，Designer clone 後即可用 | 各部門自主、彈性高 | 格式可能不一致、需要教育 |
| **C. 混合式** | Company 層級放公司規範；部門規範各自管理 | 分層負責 | 複雜度較高 |

**討論問題**：
- 誰有權限修改 sources registry？
- 部門重組時如何處理？
- 新部門加入的流程？

---

### 議題 2：Designer 如何知道自己該用哪個配置？

| 方案 | 說明 | Designer 操作 |
|------|------|--------------|
| **A. 手動選擇** | Setup script 提供部門選單 | `bash setup.sh` → 選擇部門 |
| **B. 自動偵測** | 根據 email domain 或 git config 判斷 | 零操作（需要 convention） |
| **C. 部門 Repo 自帶** | 部門 Repo 裡已有 `.claude/cache/sources.json` | Clone 後自動套用 |

**討論問題**：
- Designer 可能跨部門協作，如何處理？
- 新人 onboarding 時誰負責設定？

---

### 議題 3：規範 URL 的權限管理

| 方案 | 說明 | 優點 | 缺點 |
|------|------|------|------|
| **A. Public raw URL** | 用 public repo 或 gist | 零權限設定 | 規範對外公開 |
| **B. Private repo + token** | 用 GitHub token 存取 private repo | 規範保密 | Token 管理複雜 |
| **C. Internal server** | 公司內部 server 提供 | 完全內網 | 需要架設、維護 |

**討論問題**：
- 公司規範是否可以對外公開？
- 如果需要 private，token 如何安全發放？

---

### 議題 4：TTL 設定由誰決定？

| 選項 | 說明 |
|------|------|
| **統一 24 小時** | 簡單、一致 |
| **各 source 自訂** | Company = 168h（週更）、Dept = 24h（日更） |
| **Designer 可覆寫** | 環境變數 `CLAUDE_TTL_HOURS` 覆寫 |

**討論問題**：
- 緊急更新時如何通知 Designer 清 cache？
- 是否需要「強制更新」機制？

---

### 待決定事項清單

- [ ] Sources registry 採用哪種方案？（集中/分散/混合）
- [ ] Designer 選擇部門的方式？（手動/自動/repo 自帶）
- [ ] 規範 URL 的權限層級？（public/private/internal）
- [ ] TTL 設定策略？
- [ ] 誰負責維護 Company 層級的 sources？
- [ ] 誰負責維護 Department 層級的 sources？
- [ ] 新人 onboarding 流程如何整合？

---

## Appendix: Technical Details

### fetch-guidelines.sh 腳本（草稿）

```bash
#!/bin/bash
# ~/.claude/scripts/fetch-guidelines.sh

CACHE_DIR="$HOME/.claude/cache"
TTL_HOURS=${TTL_HOURS:-24}

mkdir -p "$CACHE_DIR"

# 定義 sources
declare -A SOURCES=(
  ["dept-guidelines.md"]="https://raw.githubusercontent.com/trendlife-general/TrendLife-UX-design-team/master/CLAUDE.md"
)

for file in "${!SOURCES[@]}"; do
  url="${SOURCES[$file]}"
  cache_file="$CACHE_DIR/$file"
  
  # 檢查 TTL
  need_fetch=false
  if [ ! -f "$cache_file" ]; then
    need_fetch=true
  elif [ $(find "$cache_file" -mmin +$((TTL_HOURS * 60)) 2>/dev/null) ]; then
    need_fetch=true
  fi
  
  # Fetch if needed
  if [ "$need_fetch" = true ]; then
    curl -sf "$url" -o "$cache_file.tmp" && mv "$cache_file.tmp" "$cache_file"
  fi
  
  # Output
  [ -f "$cache_file" ] && cat "$cache_file"
done
```

### SessionStart Hook 設定

```json
{
  "hooks": {
    "SessionStart": [{
      "type": "command",
      "command": "bash ~/.claude/scripts/fetch-guidelines.sh"
    }]
  }
}
```
