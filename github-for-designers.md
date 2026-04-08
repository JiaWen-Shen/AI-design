# GitHub for UI Designers：教學簡報大綱

> 目標受眾：UI 設計師，想了解 Git/GitHub 基礎操作，搭配 AI 工具（Claude Code）進行版本管理。

---

## 1. Git vs Figma — 協作模式的差異

設計師已經熟悉 Figma 的協作方式。Git 的邏輯不同，但核心目的一樣：讓多人同時工作而不互相覆蓋。

### 協作模式對照表

|                     | Figma                          | Git                                      |
|---------------------|--------------------------------|------------------------------------------|
| **同步方式**         | 瀏覽器 ↔ 雲端（自動即時）         | 本機 ↔ GitHub（手動 `pull` / `push`）      |
| **協作模型**         | 多人同時編輯同一份                | 每人有自己的副本，改完再合併                  |
| **可見性**           | 改動即可見                       | 你決定什麼時候讓別人看到                     |
| **存檔**            | 自動儲存                         | 手動決定存什麼、存到哪（`commit`）            |
| **版本歷史**         | 系統自動記錄                     | `commit message` 就是版本歷史               |
| **錯誤回復**         | Undo / Version History          | 需主動建立 Branch 保護                      |
| **衝突處理**         | 系統自動合併，衝突不可見           | Merge conflict 需手動選擇保留哪個版本        |
| **離線工作**         | 需要網路                         | 可離線 `commit`，之後再 `push`              |
| **平行工作流**       | Figma Branch（付費功能）          | Branch 是免費的核心工作流程                  |

### 常見場景對照

| 場景                       | Figma 的做法                         | Git 的做法                                                    |
|----------------------------|--------------------------------------|--------------------------------------------------------------|
| 不想影響別人，自己先改改看    | Duplicate page                       | 開一條 branch                                                 |
| 改好了，交付給團隊           | 把 draft 移回 main page + 留言通知    | `commit` → `push` → 開 Pull Request                          |
| 同事改壞了，想回到之前的版本  | Version History 找回                  | `git log` 找到那個 commit → `git revert`                      |

### 核心觀念轉換

Figma 的設計哲學是**「即時、自動、所見即所得」**。Git 則是**「刻意、手動、你來決定」**：

- **你決定什麼時候存**（commit）
- **你決定存什麼**（staging）
- **你決定什麼時候讓別人看到**（push）
- **你決定怎麼合併**（merge / PR review）

**為何 Git 不能像 Figma 一樣即時同步？**

Figma 管理的是視覺畫面——改了馬上看到結果。但 Git 管理的是程式碼，程式碼需要經過**編譯（compile）**才能執行。每一次改動都可能牽動其他部分，所以需要一個「確認點」（commit）來標記：這個狀態是可以運作的。即時同步反而危險——你改到一半的程式碼，同事 pull 下去可能直接壞掉。

---

## 2. Git 的基本架構
Git v.s Github?
- **三個空間**：Working Directory → Staging Area → Repository
- **本機 vs 遠端**：Local repo ↔ GitHub（對應 Figma 的「瀏覽器 ↔ 雲端」）
- **關鍵名詞**：commit、branch、merge、pull/push、PR
 - Commit v.s push?
 - Branch v.s fork?
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
