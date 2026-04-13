# Git Subtree vs Submodule：Designer 獨立 Repo 策略測試報告

> 測試日期：2026-04-13
> 測試者：Karen Shen
> 目的：評估哪種 git 策略最適合設計師建立獨立工作 repo，並與跨團隊 parent repo 雙向同步

---

## 背景

REI Project 的設計團隊需要讓每位 designer 有自己的獨立 repo 工作，同時將成果同步回跨團隊的 parent repo（如 [TrendLife-UX-design-team](https://github.com/trendlife-general/TrendLife-UX-design-team)）。

Git 提供兩種方式管理「repo 裡面引用另一個 repo」：**subtree** 和 **submodule**。本報告以相同內容分別實測兩種方式，記錄完整操作流程與踩坑經驗。

## 測試用的 Repo

| Repo | 用途 | 連結 |
|------|------|------|
| TrendLife-UX-design-team | Parent repo（跨團隊共用） | [trendlife-general/TrendLife-UX-design-team](https://github.com/trendlife-general/TrendLife-UX-design-team) |
| cross_team_test | Designer 獨立 repo（subtree 版） | [karen-shen_tmemu/cross_team_test](https://github.com/karen-shen_tmemu/cross_team_test) |
| cross_team_test_submodule | Designer 獨立 repo（submodule 版） | [karen-shen_tmemu/cross_team_test_submodule](https://github.com/karen-shen_tmemu/cross_team_test_submodule) |

Parent repo 中的對應資料夾：
- `Karen-test/` → subtree，對應 cross_team_test
- `Karen-test-submodule/` → submodule，對應 cross_team_test_submodule

---

## 一、Subtree 測試

### 初始設定流程

```bash
# 1. 建立 designer 的獨立 repo
gh repo create karen-shen_tmemu/cross_team_test --private

# 2. 推送初始內容到 designer repo
cd cross_team_test && git add . && git commit && git push

# 3. 在 parent repo 加入 subtree（順序重要！）
cd TrendLife-UX-design-team
git remote add cross-team-test https://github.com/karen-shen_tmemu/cross_team_test.git
git subtree add --prefix=Karen-test cross-team-test main --squash
git push origin master
```

### Designer 日常操作（零特殊知識）

```bash
git clone https://github.com/karen-shen_tmemu/cross_team_test.git
# 修改檔案...
git add . && git commit -m "feat: update wireframe" && git push
# 結束。跟一般 repo 完全一樣。
```

### Maintainer 同步操作

```bash
# 從 designer repo 拉取變更到 parent repo
git subtree pull --prefix=Karen-test cross-team-test main --squash
git push origin master

# 反向：從 parent repo 推回 designer repo
git subtree push --prefix=Karen-test cross-team-test main
```

### 踩到的坑

1. **初始化順序錯誤**
   - ❌ 先在 parent repo 用 `git add` 建資料夾 → 再 `subtree push` 出去 → 之後 `subtree pull --squash` 失敗（`"was never added"`）
   - ✅ 先建獨立 repo → 再在 parent repo 用 `git subtree add --squash` 加入
   - 原因：`--squash` 需要 `subtree add` 產生的特殊 merge commit 來追蹤關係

2. **git subtree 不儲存 remote URL**
   - Merge commit 只記錄 `git-subtree-dir` 和 `git-subtree-split`（commit SHA）
   - 不記錄 remote URL → 新人不知道要連去哪
   - 解法：自建 `.subtrees.yml` 設定檔

3. **沒有內建通知機制**
   - Designer push 後，maintainer 不會收到通知
   - 解法：GitHub Actions 定期偵測 + 開 Issue

---

## 二、Submodule 測試

### 初始設定流程

```bash
# 1. 建立 designer 的獨立 repo
gh repo create karen-shen_tmemu/cross_team_test_submodule --private

# 2. 推送初始內容
cd cross_team_test_submodule && git add . && git commit && git push

# 3. 在 parent repo 加入 submodule
cd TrendLife-UX-design-team
git submodule add https://github.com/karen-shen_tmemu/cross_team_test_submodule.git Karen-test-submodule
git commit -m "chore: add Karen-test-submodule"
git push origin master
```

### Designer 日常操作（需要特殊知識）

```bash
# Clone（要記得加 --recurse-submodules）
git clone --recurse-submodules git@github.com:trendlife-general/TrendLife-UX-design-team.git

# ⚠️ 進入 submodule 後一定要先切 branch
cd Karen-test-submodule
git checkout main              # 不做的話是 detached HEAD！

# 修改檔案...

# Push 1: submodule 內部
git add . && git commit -m "feat: update wireframe"
git push origin main

# Push 2: 回到 parent repo 更新指標
cd ..
git add Karen-test-submodule
git commit -m "chore: update submodule pointer"
git push origin master
```

### Maintainer 同步操作

```bash
# 更新 submodule 到 remote 最新
git submodule update --remote Karen-test-submodule
git add Karen-test-submodule
git commit -m "chore: update submodule pointer"
git push origin master
```

### 踩到的坑

1. **Clone 後資料夾是空的** — 忘記 `--recurse-submodules` 或 `submodule update --init`
2. **Detached HEAD** — `submodule update` 後預設不在任何 branch，忘記 `checkout main` 就會丟 commit
3. **要 commit/push 兩次** — submodule 內一次 + parent repo 一次，忘記後者會導致其他人拿到舊版
4. **Parent diff 看不到內容** — 只顯示 `Subproject commit SHA 變了`，看不到 designer 改了什麼

---

## 三、並排比較

### Designer 操作 Effort

| 操作 | Subtree | Submodule |
|------|---------|-----------|
| Clone | `git clone <自己的 repo>` | `git clone --recurse-submodules <parent>` |
| 額外初始化 | 無 | `git checkout main`（每次 submodule update 後） |
| 工作目錄 | 自己 repo 的根目錄 | parent repo 的子資料夾 |
| Commit 次數 | **1 次** | **2 次**（submodule + parent） |
| Push 次數 | **1 次** | **2 次**（submodule + parent） |
| 忘記步驟的後果 | 無特殊風險 | 丟失 commit（detached HEAD） |
| 需要的 git 知識 | 基礎 | 中階（submodule 概念） |

### Maintainer 操作 Effort

| 操作 | Subtree | Submodule |
|------|---------|-----------|
| 初始設定 | `subtree add --squash`（順序重要） | `submodule add`（簡單直覺） |
| 同步 designer 變更 | `subtree pull --squash` + push | `submodule update --remote` + commit + push |
| 反向同步 | `subtree push` | 不需要（designer 直接 push） |
| 追蹤機制 | 需自建 `.subtrees.yml` + GitHub Actions | `.gitmodules` 自動維護 |
| 新人 onboarding | 完全透明 | 需教 `--recurse-submodules` |

### Project Member 可見性

| 面向 | Subtree | Submodule |
|------|---------|-----------|
| GitHub UI 顯示 | 普通資料夾 | 📁 `name @ commit` 可點擊連結 |
| 查看所有外部 repo | 讀 `.subtrees.yml`（手動維護） | `git submodule status`（原生指令） |
| 知道對應的 remote | 要查設定檔 | `.gitmodules` 有記錄 |
| CI/CD 支援 | 不需特殊設定 | `submodules: recursive` 原生支援 |

---

## 四、結論與建議

### 如果 Designer 手動操作 Git → 建議 Subtree

Subtree 的操作對 designer 完全透明，不需要學習任何新概念。
複雜度全部由 maintainer 承擔。

### 如果 Designer 使用 Claude Code → 建議 Submodule

Claude Code + CLAUDE.md 可以完全消化 submodule 的操作複雜度。
Designer 只要說「幫我 commit」，Claude 會自動處理：
1. `git checkout main`（防止 detached HEAD）
2. Submodule 內 commit + push
3. 回到 parent commit 指標 + push

消除操作複雜度後，submodule 的原生優勢全部保留：
- `.gitmodules` 自動追蹤
- GitHub UI 可見性
- `git submodule status` 原生查詢
- 不需要自建任何額外工具

### 建議的下一步

1. 為 designer 的 CLAUDE.md 制定 submodule 工作流規則（見 [sample_claude.md](./sample_claude.md)）
2. 選定一個真實的設計專案做 pilot
3. 收集 designer 使用 Claude Code 操作 submodule 的回饋
4. 決定是否推廣到所有設計師 repo

---

## 相關檔案

| 檔案 | 位置 | 說明 |
|------|------|------|
| `.subtrees.yml` | TrendLife-UX-design-team repo root | Subtree 對應關係 registry |
| `.github/workflows/subtree-sync-check.yml` | TrendLife-UX-design-team | 自動偵測 subtree 更新的 GitHub Actions |
| `.gitmodules` | TrendLife-UX-design-team repo root | Submodule 對應關係（git 自動維護） |
| `SUBTREE-WORKFLOW.md` | cross_team_test repo | Subtree 設定流程 + lessons learned |
| [sample_claude.md](./sample_claude.md) | 本資料夾 | Designer 用的 CLAUDE.md 範本 |
