# GitHub for UI Designers

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
Staging 讓你**主動挑選**要存什麼，而不是一股腦全存。(建立好的工作流程可以略過此流程)

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

**Branch vs Fork？** (optional)

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

### 為什麼設計師不需要背指令

傳統的 Git 操作需要在終端機輸入指令，例如：

```bash
git checkout -b feature/new-header
git add src/components/Header.tsx
git commit -m "feat: add new header component"
git push origin feature/new-header
```

對設計師來說，這些指令不直覺。但有了 Claude Code，你只需要用自然語言說出意圖，AI 會幫你執行正確的 Git 指令。

### 常用操作示範

| 你對 Claude Code 說 | Claude Code 實際執行 | 對應的 Git 概念 |
|---|---|---|
| 「幫我建一個新的 branch，叫 header-redesign」 | `git checkout -b header-redesign` | 建立分支 |
| 「把目前的改動存起來」 | `git add` + `git commit` | 暫存 + 提交 |
| 「推上去，然後開一個 PR」 | `git push` + `gh pr create` | 推送 + 建立 Pull Request |
| 「這個檔案改壞了，回到上一版」 | `git restore <file>` | 還原檔案 |
| 「最近三次 commit 改了什麼？」 | `git log --oneline -3` | 查看歷史 |
| 「目前在哪個 branch？」 | `git branch --show-current` | 確認目前分支 |

不需要記住右邊那欄的指令，知道何時該做什麼事情就夠了：

| 時機 | 你該做的事 |
|---|---|
| 開始一個新任務 | 開 branch（避免直接改 main）。需要先移動到專案資料夾下 |
| 改到一個段落，想存檔 | commit（建立存檔點） |
| 想讓團隊看到你的改動 | push（上傳到 GitHub） |
| 早上開工，先同步最新 | pull（下載別人的更新） |
| 改壞了，想放棄這次修改 | restore（還原到上次 commit 的狀態） |
| 任務做完，想合併回主線 | 開 PR → 請人 review → merge |

### Claude Code 的安全機制

Claude Code 在執行 Git 操作時有內建的安全設計：

- **破壞性操作會先確認**：`push --force`、`reset --hard`、刪除 branch 等操作，Claude Code 會先問你確認
- **不會自動 push**：commit 完不會自己推上去，你可以先檢查再決定
- **敏感檔案保護**：不會把 `.env`（含密碼 / API key）加入 commit

這意味著你可以放心讓 AI 幫你操作，不太會不小心搞壞東西。

### 避免 push 錯路徑

這是實際工作中最容易踩的坑——尤其當你同時有 team repo 和 personal repo 時。

**問題場景**：你在公司的 team repo 裡工作，但 push 的時候不小心推到自己的 personal repo（或反過來）。

**預防方式**：

1. **Push 前先確認 remote**：問 Claude Code「目前的 remote 是指向哪裡？」
   - Claude Code 會執行 `git remote -v`，告訴你目前指向哪個 repo
2. **多帳號切換要確認身份**：如果你有多個 GitHub 帳號（例如公司帳號 + 個人帳號），push 前問「我目前是用哪個 GitHub 帳號？」
   - Claude Code 會執行 `gh auth status` 確認
3. **養成習慣**：每次開新的工作 session 時，先確認你在對的 repo 和對的帳號

---

## 4. 具體實踐建議

### CLAUDE.md — 讓 AI 記住你的專案規範

`CLAUDE.md` 是一個放在專案根目錄的設定檔，讓 Claude Code 記住你的專案規範：

```markdown
# CLAUDE.md 範例

## Commit 規範
- 使用 Conventional Commits：feat: / fix: / chore:
- Commit message 要說明 what + why

## 專案特殊設定
- Push 前須切換到正確的 GitHub 帳號
- 中英混排使用中文標點
```

有了這個檔案，你不用每次對話都重複說明規範——Claude Code 會自動讀取並遵守。就像在 Figma 裡設定好 Design System 一樣，定義一次，到處適用。

## Repo 的四層架構

一個設計師在公司裡會碰到的 repo，可以分成四個層級：

| 層級 | 內容 | 範例 | 誰維護 |
|---|---|---|---|
| **Company** | 全公司共用的價值觀、政策、規範 | shared values、company policy、onboarding docs | Admin / Tech Lead |
| **Department** | 部門層級的共用資源 | design system、UI component library | 設計部門 |
| **Project** | 專案層級的產出 | PRD、project workflow、專案程式碼 | 專案成員 |
| **Personal** | 個人的設定與學習 | 個人 settings、workflow 筆記、side project | 你自己 |


**Design System 該放哪？**

大部分情況放 **Department 層級**——由設計部門擁有和維護，工程師和其他專案是「取用」的關係。建議獨立成一個 repo（如 `company/design-system`），而不是塞在某個專案 repo 裡。這樣當多個專案同時引用時，更新才不會互相干擾。

### 一人多 Repo 的工作架構

設計師通常同時支援多個專案，意味著你每天可能在好幾個 repo 之間切換：

```
一個設計師的日常：

Personal repo       ──  自己的設定、學習筆記
Department repo     ──  design system（跨專案共用）
Project A repo      ──  正在支援的專案
Project B repo      ──  同時支援的另一個專案
```

#### 建議的本機資料夾結構

```
~/work/
├── personal/            ← Personal repos
│   └── my-settings/
├── department/          ← Department repos
│   └── design-system/
└── projects/            ← Project repos
    ├── project-a/
    └── project-b/
```

分層放的好處：**看資料夾路徑就知道你在哪一層**，降低 push 錯 repo 的風險。

#### 每天的工作流程

| 步驟 | 動作 | 說明 |
|---|---|---|
| 1. 早上開工 | pull 所有正在參與的 repo | 同步到最新狀態 |
| 2. 確認任務 | 判斷今天的任務屬於哪個 repo | 改元件規格 → design-system、做頁面 → project-a |
| 3. 專注工作 | 一次只在一個 repo 裡工作 | commit 完 → push → 再切到下一個 repo |
| 4. 收工前 | 確認每個改過的 repo 都 push 了 | 避免改動只留在本機 |

#### 不同層級的 Git 操作規則

| | Company | Department | Project | Personal |
|---|---|---|---|---|
| **直接 push main？** | 不行 | 不行 | 不行 | 可以 |
| **需要開 PR？** | 是 | 是 | 是 | 不需要 |
| **需要 review？** | 是（Admin） | 是（設計主管） | 是（專案成員） | 不需要 |
| **影響範圍** | 全公司 | 全部門 | 單一專案 | 只有你 |
| **改動頻率** | 低（季度） | 中（迭代週期） | 高（每天） | 看你自己 |

越上層的 repo 影響越大，流程越嚴格。Personal repo 最自由，可以隨意嘗試。

### 用 Global CLAUDE.md 管理多 Repo

前面提到每個 repo 可以有自己的 `CLAUDE.md`。但如果你同時參與多個 repo，還可以設定一份**全域的 CLAUDE.md**（放在 `~/.claude/CLAUDE.md`），寫上跨 repo 通用的規則。Claude Code 每次啟動都會讀這份檔案，不管你在哪個 repo 裡。

建議在全域 CLAUDE.md 加上這四類規則：

#### 1. 多帳號切換

如果你有多個 GitHub 帳號（例如公司帳號 + 個人帳號），寫清楚對應關係，讓 AI 幫你把關：

```markdown
## Multi-Account Safety
- 個人帳號：JiaWen-Shen（用於個人 repo）
- 工作帳號：karen-shen_tmemu（用於公司 repo）
- Push 前必須確認 gh auth status，確認帳號與目標 repo 匹配
- Push 完成後切回工作帳號
```

#### 2. Repo 切換安全檢查

同時支援多專案時，最怕切過去之後忘記前一個 repo 還有沒存的改動：

```markdown
## Multi-Repo Workflow
- 切換到不同 repo 工作前，先確認前一個 repo 的改動已 commit + push
- 每次開始工作前，確認自己在正確的 repo 和正確的 branch
```

#### 3. 收工時檢查所有 Repo

如果你一天碰了三個 repo，收工時不該只檢查最後一個：

```markdown
## Session Handoff
- 收工前檢查所有今天碰過的 repo，確認都已 commit + push
- 記錄每個 repo 目前的進度和下一步
```

#### 4. 新 Repo 建立慣例

確保每個新 repo 從第一天就有基本規範：

```markdown
## New Repo Checklist
- 建立 CLAUDE.md，記錄：repo 層級、對應 GitHub 帳號、專案規範
- 加入 .gitignore（node_modules、.env、.DS_Store）
- 設定 remote 並確認指向正確的 organization / 個人帳號
```

這樣的設定等於幫你建了一套「AI 協作的 SOP」——不管你在哪個 repo 工作，Claude Code 都會遵守同一套安全規則。

---

*最後更新：2026-04-08*
