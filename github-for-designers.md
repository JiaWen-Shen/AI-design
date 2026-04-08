# GitHub for UI Designers：教學簡報大綱

> 目標受眾：UI 設計師，想了解 Git/GitHub 基礎操作，搭配 AI 工具（Claude Code）進行版本管理。

---

## 1. Git vs Figma — 協作模式的差異

- **對照表**：同步方式、協作模型、存檔、版本歷史、衝突處理、離線、平行工作流
- **常見場景對照**：交付改動、避免衝突、回溯版本
- **核心觀念轉換**：從「自動即時同步」→「你決定什麼時候讓別人看到」

---

## 2. Git 的基本架構

- **三個空間**：Working Directory → Staging Area → Repository
- **本機 vs 遠端**：Local repo ↔ GitHub（對應 Figma 的「瀏覽器 ↔ 雲端」）
- **關鍵名詞**：commit、branch、merge、pull/push、PR
- **用 Figma 類比解釋**：commit ≈ 存檔點、branch ≈ Figma Branch、PR ≈ 設計審查

---

## 3. 用 Claude Code 操作 Git

- **為什麼設計師不需要背指令**：用自然語言描述意圖，AI 執行 git 操作
- **常用操作示範**：
  - 「幫我建一個新 branch」
  - 「把目前的改動 commit 起來」
  - 「推上去開 PR」
  - 「這個檔案改壞了，幫我回到上一版」
- **Claude Code 的安全機制**：破壞性操作會先確認、不會自動 push
- **避免 push 錯路徑**：
  - `git remote -v` 確認目前指向哪個 repo
  - Team repo vs Personal repo 的 remote 別搞混
  - 多帳號切換時確認身份（`gh auth status`）
  - 用 Claude Code 時可以先問「目前的 remote 是哪裡？」再 push
- **CLAUDE.md 的角色**：讓 AI 記住你的 commit 慣例和專案規範

---

## 4. 具體實踐建議

### Team Repo
- 資料夾結構（Member folder 模式）
- Branch 策略：main 保護、feature branch per task
- PR + Review 流程：為什麼設計師也該做 code review
- `.gitignore`：哪些檔案不該進 repo（.env、node_modules、.DS_Store）

### Personal Repo
- 學習筆記、side project、作品集的版本管理
- 直接在 main 工作 vs 用 branch 的時機
- GitHub Pages 展示作品的可能性

---

*最後更新：2026-04-08*
