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

Figma 是一個 Application，管理的是視覺畫面——改了馬上看到結果。但 Git 管理的是程式碼，程式碼需要經過**編譯（compile）**才能執行。
每一次改動都可能牽動其他部分，所以需要一個「確認點」（commit）來標記：這個狀態是可以運作的。
即時同步反而危險，改到一半的程式碼，其他人 pull 下去可能直接壞掉。

---

## 2. Git 的基本架構

### Git vs GitHub？

這是最常搞混的第一個問題：簡單來說 GitHub 是 Git 的網頁版

| | Git | GitHub |
|---|---|---|
| **是什麼** | 版本控制工具（軟體） | 雲端託管平台（網站） |
| **安裝在哪** | 你的電腦上(CLI) | 瀏覽器打開 github.com |

對工程師來說，可以完全在 CLI 上面操作 Git，GitHub 只是視覺化查看的地方

#### GitHub 重點頁面介紹

### 三個空間：程式碼的旅程

Git 把你的改動分成三個階段，每個階段都是你主動推進的：

```
Working Directory  →  Staging Area  →  Repository
  （本機正在改的檔案）    （準備要存的改動）    （正式的版本紀錄）
      （本機操作）        （`git add`）     （`git commit`）
```

為什麼要多一個 Staging Area？因為你可能改了 10 個檔案，但只想先存其中 3 個。
Staging 讓你**主動挑選**要存什麼，而不是一股腦全存。

### 本機 vs 遠端

```
你的電腦（Local）          GitHub（Remote）
┌──────────────┐         ┌──────────────┐
│  Working Dir │         │              │
│      ↓       │  push → │   Remote     │
│  Staging     │         │   Repository │
│      ↓       │  ← pull │              │
│  Local Repo  │         │              │
└──────────────┘         └──────────────┘
```

- **push**：把本機的 commit 上傳到 GitHub（「讓別人看到」）
- **pull**：把 GitHub 上別人的改動下載到本機（「同步最新狀態」）

### 容易搞混的名詞

**Commit vs Push？**

| | Commit | Push |
|---|---|---|
| **做了什麼** | 在本機建立一個存檔點 | 把存檔點上傳到 GitHub |
| **誰看得到** | 只有你 | 團隊所有人 |
| **可以反悔嗎** | 可以，還沒 push 之前都在你電腦裡 | push 之後別人可能已經看到了 |
| **Figma 類比** | 存檔 | 分享連結給同事 |

**Branch vs Fork？**

| | Branch | Fork |
|---|---|---|
| **在哪裡** | 同一個 repo 裡面 | 複製一整個 repo 到你的帳號下 |
| **誰用** | 團隊成員（有權限的人） | 外部貢獻者（沒有直接寫入權限） |
| **Figma 類比** | Figma Branch（同一個檔案裡分支） | Duplicate 整個 Figma 檔案到自己的 Draft |
| **什麼時候用** | 日常開發，每個任務開一條 | 想貢獻別人的開源專案時 |

**怎麼判斷該用哪個？**

- **你是這個 repo 的成員嗎？** → 是 → 用 **Branch**
- **你想改別人的開源專案？** → 是 → 用 **Fork**（fork 到自己帳號 → 改 → 開 PR 回原 repo）
- **你想拿別人的專案當模板自己用？** → 用 **Fork** 或 GitHub 的 **Use this template**

設計師最常碰到的情境：

| 情境 | 用 Branch 還是 Fork |
|---|---|
| 在公司 team repo 裡改自己負責的頁面 | Branch |
| 想幫開源 design system 修一個 icon | Fork → PR |
| 想拿同事的 side project 當起點自己做 | Fork |
| 在自己的 personal repo 做實驗 | Branch（或直接在 main） |

### 用 Figma 類比總整理

| Git 概念 | Figma 對應 | 一句話說明 |
|---|---|---|
| `commit` | 存檔 + 版本註記 | 建立一個可回溯的存檔點 |
| `branch` | Figma Branch | 在不影響 main 的情況下平行開發 |
| `merge` | Merge Branch 回 main | 把分支的成果合併回主線 |
| `pull request` | 設計審查 / Design Review | 請團隊看過你的改動，確認後才合併 |
| `clone` | Duplicate 到本機 | 第一次把遠端 repo 下載到你的電腦 |
| `pull` | 重新整理畫布（取得最新） | 把遠端的更新同步到本機 |
| `push` | 發布 / 分享連結 | 把本機的改動上傳到遠端 |

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
