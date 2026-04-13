# CLAUDE.md — Designer Submodule Workflow

> 這是給使用 git submodule 工作流的設計師 repo 的 CLAUDE.md 範本。
> 請根據實際 repo 名稱和路徑修改後放入 parent repo 的 `.claude/` 或 repo root。

---

## Submodule 工作規則

本 repo 使用 git submodule 管理 designer 的獨立工作資料夾。
Claude Code 必須遵守以下規則，確保 submodule 操作正確無誤。

### Clone 規則

- Clone parent repo 時**一定要**加 `--recurse-submodules`：
  ```bash
  git clone --recurse-submodules <parent-repo-url>
  ```
- 如果已經 clone 但 submodule 資料夾是空的，執行：
  ```bash
  git submodule update --init --recursive
  ```

### 進入 Submodule 工作前（最重要！）

- 進入 submodule 資料夾後，**第一件事**必須確認目前在正確的 branch：
  ```bash
  cd <submodule-folder>
  git checkout main
  ```
- **絕對不可以**在 detached HEAD 狀態下 commit。如果 `git status` 顯示 `HEAD detached at ...`，必須先 `git checkout main`。
- 每次執行 `git submodule update` 之後，submodule 都會回到 detached HEAD，必須重新 `git checkout main`。

### Commit + Push 流程（雙重提交）

Designer 修改 submodule 內的檔案後，需要 **兩次** commit + push：

**第一次：submodule 內部**
```bash
cd <submodule-folder>
git checkout main              # 確認在 main branch
git add <修改的檔案>
git commit -m "feat: <描述>"
git push origin main
```

**第二次：回到 parent repo 更新指標**
```bash
cd ..                          # 回到 parent repo root
git add <submodule-folder>
git commit -m "chore: update <submodule-folder> pointer"
git push origin master         # 注意：parent repo 的主 branch 可能是 master
```

> ⚠️ 如果忘記第二次 commit，其他人 pull parent repo 後看到的還是舊版。

### Pull 最新變更

從 remote 拉取 submodule 最新內容：
```bash
# 在 parent repo root
git submodule update --remote <submodule-folder>
git add <submodule-folder>
git commit -m "chore: update <submodule-folder> pointer"
git push origin master
```

### 常見陷阱與防護

| 陷阱 | 症狀 | 防護 |
|------|------|------|
| Detached HEAD | `git status` 顯示 `HEAD detached` | 每次進入 submodule 先 `git checkout main` |
| 只 push submodule | Parent repo 的 `git diff` 顯示 submodule 有變更 | 記得回 parent 做第二次 commit + push |
| Clone 後資料夾空的 | Submodule 資料夾存在但沒有檔案 | 執行 `git submodule update --init` |
| Parent diff 看不到內容 | 只顯示 `Subproject commit SHA changed` | 這是正常的，要進入 submodule 才能看 diff |

### 自動化 Checklist

當 designer 說「幫我 commit」或「幫我 push」時，Claude Code 應自動執行：

1. `cd <submodule-folder>`
2. `git status` — 確認有變更
3. `git branch` — 確認在 `main`（不是 detached HEAD）
   - 如果 detached → `git checkout main`
4. `git add <檔案>` + `git commit`
5. `git push origin main`
6. `cd ..`（回到 parent root）
7. `git add <submodule-folder>`
8. `git commit -m "chore: update <submodule-folder> pointer"`
9. `git push origin master`

---

## 範例設定（請依實際情況修改）

```yaml
# 將以下資訊替換為實際值
parent_repo: trendlife-general/TrendLife-UX-design-team
parent_branch: master
submodule_folder: Karen-test-submodule
submodule_repo: karen-shen_tmemu/cross_team_test_submodule
submodule_branch: main
```

---

## Git 帳號注意事項

- 執行 `git push` 前，用 `gh auth status` 確認目前登入的帳號
- 如果 parent repo 屬於 enterprise org（如 `trendlife-general`），需要 SAML SSO 授權
- SSH 和 gh CLI OAuth token 的 SSO 授權是**分開的**，兩邊都要設

---

## 給 Maintainer 的備註

此 CLAUDE.md 的目的是讓 Claude Code 自動處理 submodule 的操作複雜度，讓 designer 只需要：
- 在 submodule 資料夾內正常編輯檔案
- 說「幫我 commit」或「幫我 push」

所有 branch 切換、雙重 commit、指標更新都由 Claude Code 自動完成。
