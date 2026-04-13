# Git Subtree vs Submodule：Designer Independent Repo Strategy Test Report

# Git Subtree vs Submodule：Designer 獨立 Repo 策略測試報告

> Test date: 2026-04-13 | Tester: Karen Shen
>
> Purpose: Evaluate which git strategy best supports designers building independent work repos with bidirectional sync to a cross-team parent repo.
>
> 測試日期：2026-04-13 ｜ 測試者：Karen Shen
>
> 目的：評估哪種 git 策略最適合設計師建立獨立工作 repo，並與跨團隊 parent repo 雙向同步

---

## Background | 背景

The REI Project design team needs each designer to have their own independent repo while syncing deliverables back to the cross-team parent repo (e.g., [TrendLife-UX-design-team](https://github.com/trendlife-general/TrendLife-UX-design-team)).

REI Project 的設計團隊需要讓每位 designer 有自己的獨立 repo 工作，同時將成果同步回跨團隊的 parent repo（如 [TrendLife-UX-design-team](https://github.com/trendlife-general/TrendLife-UX-design-team)）。

Git provides two ways to manage "a repo referencing another repo": **subtree** and **submodule**. This report tests both approaches end-to-end with identical content, documenting the full workflow and lessons learned.

Git 提供兩種方式管理「repo 裡面引用另一個 repo」：**subtree** 和 **submodule**。本報告以相同內容分別實測兩種方式，記錄完整操作流程與踩坑經驗。

## Test Repos | 測試用的 Repo

| Repo | Purpose / 用途 | Link / 連結 |
|------|------|------|
| TrendLife-UX-design-team | Parent repo (cross-team shared) / 跨團隊共用 | [trendlife-general/TrendLife-UX-design-team](https://github.com/trendlife-general/TrendLife-UX-design-team) |
| cross_team_test | Designer independent repo (subtree version) / subtree 版 | [karen-shen_tmemu/cross_team_test](https://github.com/karen-shen_tmemu/cross_team_test) |
| cross_team_test_submodule | Designer independent repo (submodule version) / submodule 版 | [karen-shen_tmemu/cross_team_test_submodule](https://github.com/karen-shen_tmemu/cross_team_test_submodule) |

Corresponding folders in parent repo / Parent repo 中的對應資料夾：
- `Karen-test/` → subtree, maps to cross_team_test / 對應 cross_team_test
- `Karen-test-submodule/` → submodule, maps to cross_team_test_submodule / 對應 cross_team_test_submodule

---

## 1. Subtree Test | Subtree 測試

### Initial Setup | 初始設定流程

```bash
# 1. Create designer's independent repo
#    建立 designer 的獨立 repo
gh repo create karen-shen_tmemu/cross_team_test --private

# 2. Push initial content to designer repo
#    推送初始內容到 designer repo
cd cross_team_test && git add . && git commit && git push

# 3. Add subtree in parent repo (order matters!)
#    在 parent repo 加入 subtree（順序重要！）
cd TrendLife-UX-design-team
git remote add cross-team-test https://github.com/karen-shen_tmemu/cross_team_test.git
git subtree add --prefix=Karen-test cross-team-test main --squash
git push origin master
```

### Designer Daily Workflow (Zero Special Knowledge) | Designer 日常操作（零特殊知識）

```bash
git clone https://github.com/karen-shen_tmemu/cross_team_test.git
# Edit files... / 修改檔案...
git add . && git commit -m "feat: update wireframe" && git push
# Done. Identical to any normal repo.
# 結束。跟一般 repo 完全一樣。
```

### Maintainer Sync Operations | Maintainer 同步操作

```bash
# Pull designer's changes into parent repo
# 從 designer repo 拉取變更到 parent repo
git subtree pull --prefix=Karen-test cross-team-test main --squash
git push origin master

# Reverse: push from parent repo back to designer repo
# 反向：從 parent repo 推回 designer repo
git subtree push --prefix=Karen-test cross-team-test main
```

### Pitfalls | 踩到的坑

1. **Wrong initialization order / 初始化順序錯誤**
   - ❌ Creating folder with `git add` first → then `subtree push` → later `subtree pull --squash` fails (`"was never added"`)
   - ❌ 先在 parent repo 用 `git add` 建資料夾 → 再 `subtree push` 出去 → 之後 `subtree pull --squash` 失敗（`"was never added"`）
   - ✅ Create independent repo first → then use `git subtree add --squash` in parent repo
   - ✅ 先建獨立 repo → 再在 parent repo 用 `git subtree add --squash` 加入
   - Reason: `--squash` requires the special merge commit created by `subtree add` to track the relationship
   - 原因：`--squash` 需要 `subtree add` 產生的特殊 merge commit 來追蹤關係

2. **git subtree doesn't store remote URL / 不儲存 remote URL**
   - Merge commit only records `git-subtree-dir` and `git-subtree-split` (commit SHA)
   - Merge commit 只記錄 `git-subtree-dir` 和 `git-subtree-split`（commit SHA）
   - Doesn't record remote URL → newcomers don't know where to connect
   - 不記錄 remote URL → 新人不知道要連去哪
   - Solution: create a `.subtrees.yml` config file / 解法：自建 `.subtrees.yml` 設定檔

3. **No built-in notification mechanism / 沒有內建通知機制**
   - After designer pushes, maintainer gets no notification
   - Designer push 後，maintainer 不會收到通知
   - Solution: GitHub Actions periodic detection + open Issue / 解法：GitHub Actions 定期偵測 + 開 Issue

---

## 2. Submodule Test | Submodule 測試

### Initial Setup | 初始設定流程

```bash
# 1. Create designer's independent repo
#    建立 designer 的獨立 repo
gh repo create karen-shen_tmemu/cross_team_test_submodule --private

# 2. Push initial content
#    推送初始內容
cd cross_team_test_submodule && git add . && git commit && git push

# 3. Add submodule in parent repo
#    在 parent repo 加入 submodule
cd TrendLife-UX-design-team
git submodule add https://github.com/karen-shen_tmemu/cross_team_test_submodule.git Karen-test-submodule
git commit -m "chore: add Karen-test-submodule"
git push origin master
```

### Designer Daily Workflow (Requires Special Knowledge) | Designer 日常操作（需要特殊知識）

```bash
# Clone (must add --recurse-submodules)
# Clone（要記得加 --recurse-submodules）
git clone --recurse-submodules git@github.com:trendlife-general/TrendLife-UX-design-team.git

# ⚠️ Must checkout branch after entering submodule
# ⚠️ 進入 submodule 後一定要先切 branch
cd Karen-test-submodule
git checkout main              # Without this → detached HEAD! / 不做的話是 detached HEAD！

# Edit files... / 修改檔案...

# Push 1: inside submodule / submodule 內部
git add . && git commit -m "feat: update wireframe"
git push origin main

# Push 2: back to parent repo to update pointer / 回到 parent repo 更新指標
cd ..
git add Karen-test-submodule
git commit -m "chore: update submodule pointer"
git push origin master
```

### Maintainer Sync Operations | Maintainer 同步操作

```bash
# Update submodule to remote latest / 更新 submodule 到 remote 最新
git submodule update --remote Karen-test-submodule
git add Karen-test-submodule
git commit -m "chore: update submodule pointer"
git push origin master
```

### Pitfalls | 踩到的坑

1. **Empty folder after clone / Clone 後資料夾是空的** — forgot `--recurse-submodules` or `submodule update --init` / 忘記加 `--recurse-submodules` 或 `submodule update --init`
2. **Detached HEAD** — `submodule update` defaults to no branch; forgetting `checkout main` leads to lost commits / `submodule update` 後預設不在任何 branch，忘記 `checkout main` 就會丟 commit
3. **Must commit/push twice / 要 commit/push 兩次** — once inside submodule + once in parent repo; forgetting the latter means others see the old version / submodule 內一次 + parent repo 一次，忘記後者會導致其他人拿到舊版
4. **Parent diff hides content / Parent diff 看不到內容** — only shows `Subproject commit SHA changed`, not what the designer actually changed / 只顯示 `Subproject commit SHA 變了`，看不到 designer 改了什麼

---

## 3. Side-by-Side Comparison | 並排比較

### Designer Effort | Designer 操作 Effort

| Operation / 操作 | Subtree | Submodule |
|------|---------|-----------|
| Clone | `git clone <own repo>` | `git clone --recurse-submodules <parent>` |
| Extra init / 額外初始化 | None / 無 | `git checkout main` (after every submodule update) |
| Working directory / 工作目錄 | Own repo root / 自己 repo 的根目錄 | Subfolder in parent repo / parent repo 的子資料夾 |
| Commits per save | **1** | **2** (submodule + parent) |
| Pushes per save | **1** | **2** (submodule + parent) |
| Risk of forgetting steps / 忘記步驟的後果 | No special risk / 無特殊風險 | Lost commits (detached HEAD) / 丟失 commit |
| Git knowledge required | Basic / 基礎 | Intermediate (submodule concepts) / 中階 |

### Maintainer Effort | Maintainer 操作 Effort

| Operation / 操作 | Subtree | Submodule |
|------|---------|-----------|
| Initial setup / 初始設定 | `subtree add --squash` (order matters) / 順序重要 | `submodule add` (simple & intuitive) / 簡單直覺 |
| Sync designer changes / 同步 designer 變更 | `subtree pull --squash` + push | `submodule update --remote` + commit + push |
| Reverse sync / 反向同步 | `subtree push` | Not needed (designer pushes directly) / 不需要 |
| Tracking mechanism / 追蹤機制 | Manual `.subtrees.yml` + GitHub Actions / 需自建 | `.gitmodules` auto-maintained / 自動維護 |
| New member onboarding | Fully transparent / 完全透明 | Must teach `--recurse-submodules` |

### Project Member Visibility | Project Member 可見性

| Aspect / 面向 | Subtree | Submodule |
|------|---------|-----------|
| GitHub UI display / 顯示 | Normal folder / 普通資料夾 | `name @ commit` clickable link / 可點擊連結 |
| View all external repos / 查看所有外部 repo | Read `.subtrees.yml` (manual) / 手動維護 | `git submodule status` (native) / 原生指令 |
| Find remote URL / 知道對應的 remote | Check config file / 要查設定檔 | `.gitmodules` has it / 有記錄 |
| CI/CD support | No special config / 不需特殊設定 | `submodules: recursive` native support / 原生支援 |

---

## 4. Conclusion & Recommendation | 結論與建議

### If designers operate git manually → Subtree recommended | 如果 Designer 手動操作 Git → 建議 Subtree

Subtree operations are completely transparent to designers — no new concepts to learn. All complexity is absorbed by the maintainer.

Subtree 的操作對 designer 完全透明，不需要學習任何新概念。複雜度全部由 maintainer 承擔。

### If designers use Claude Code → Submodule recommended | 如果 Designer 使用 Claude Code → 建議 Submodule

Claude Code + CLAUDE.md can fully absorb submodule's operational complexity. The designer only needs to say "help me commit", and Claude Code automatically handles:

Claude Code + CLAUDE.md 可以完全消化 submodule 的操作複雜度。Designer 只要說「幫我 commit」，Claude 會自動處理：

1. `git checkout main` (prevent detached HEAD / 防止 detached HEAD)
2. Commit + push inside submodule / Submodule 內 commit + push
3. Return to parent, commit pointer + push / 回到 parent commit 指標 + push

Once operational complexity is eliminated, submodule's native advantages are fully preserved:

消除操作複雜度後，submodule 的原生優勢全部保留：

- `.gitmodules` auto-tracking / 自動追蹤
- GitHub UI visibility / GitHub UI 可見性
- `git submodule status` native query / 原生查詢
- No extra tooling needed / 不需要自建任何額外工具

### Additional consideration: Push scope clarification | 額外考量：Push 範圍確認

When a designer says "push", Claude Code should clarify: save to **personal repo only**, or also **sync to the team repo**? This gives designers control over when their work is shared, without needing to understand the two-phase commit process.

當 designer 說「推上去」時，Claude Code 應確認：只存到**個人 repo**，還是也同步到**團隊 repo**？這讓 designer 可以控制何時分享成果，而不需要理解雙重 commit 流程。

### Recommended Next Steps | 建議的下一步

1. Define submodule workflow rules in designer's CLAUDE.md (see [sample_claude.md](./sample_claude.md))
2. 為 designer 的 CLAUDE.md 制定 submodule 工作流規則（見 [sample_claude.md](./sample_claude.md)）

3. Select a real design project for pilot / 選定一個真實的設計專案做 pilot

4. Collect designer feedback on using Claude Code with submodules / 收集 designer 使用 Claude Code 操作 submodule 的回饋

5. Decide whether to roll out to all designer repos / 決定是否推廣到所有設計師 repo

---

## Related Files | 相關檔案

| File / 檔案 | Location / 位置 | Description / 說明 |
|------|------|------|
| `.subtrees.yml` | TrendLife-UX-design-team repo root | Subtree mapping registry / 對應關係 registry |
| `.github/workflows/subtree-sync-check.yml` | TrendLife-UX-design-team | GitHub Actions to detect subtree updates / 自動偵測 subtree 更新 |
| `.gitmodules` | TrendLife-UX-design-team repo root | Submodule mappings (git auto-maintained) / 對應關係（git 自動維護） |
| `SUBTREE-WORKFLOW.md` | cross_team_test repo | Subtree setup process + lessons learned / 設定流程 + lessons learned |
| [sample_claude.md](./sample_claude.md) | This folder / 本資料夾 | CLAUDE.md template for designers / Designer 用的 CLAUDE.md 範本 |
