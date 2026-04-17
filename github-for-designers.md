# GitHub for UI Designers

> 目標受眾：UI 設計師，想了解 Git/GitHub 基礎操作，搭配 AI 工具（Claude Code）進行版本管理。

### Weekly Sharing Plan

| Week | 主題 Topic | 涵蓋內容 Coverage |
|---|---|---|
| Week 1 | 為什麼設計師要學 Git？ Why Git for Designers? | Git vs Figma 協作模式差異（collaboration model）、核心觀念轉換（mindset shift） |
| Week 2 | Git 的基本架構 Git Architecture | Git vs GitHub、三個空間（working directory → staging → repository）、本機 vs 遠端（local vs remote） |
| Week 3 | Git 常見名詞解惑 Git Vocabulary | Commit vs Push、Branch vs Fork、判斷時機（decision guide）、Figma 類比總整理 |
| Week 4 | 用 AI 操作 Git Using AI for Git | Claude Code 操作示範（natural language → git commands）、使用時機、安全機制（safety mechanisms）、避免 push 錯路徑 |
| Week 5 | Repo 怎麼分層管理？ Repo Taxonomy | CLAUDE.md、四層 repo 架構（company / department / project / personal）、Design System 歸屬 |
| Week 6 | 多專案工作流 Multi-Repo Workflow | 一人多 repo 架構、每日流程（daily workflow）、Global CLAUDE.md 管理 |

---

<!-- ===== Week 1：為什麼設計師要學 Git？ Why Git for Designers? ===== -->

## 1. Git vs Figma — 協作模式的差異 Collaboration Model Comparison

[Week1 slides](https://www.figma.com/slides/eqXah6XQOmEoE7PUDuBbSM)

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

<!-- ===== Week 2：Git 的基本架構 Git Architecture ===== -->

## 2. Git 的基本架構 Git Architecture

### 新人上路：把專案 Clone 到你的電腦 Getting Started — Clone a Project

剛加入新專案，工程師給了你一個 GitHub 連結，然後呢？這節帶你完成從「拿到連結」到「能在電腦上開始工作」的全部流程。全程用 Claude Code 操作，你只需要準備兩件事。

#### 你需要準備的資訊

| 需要什麼 | 哪裡取得 |
|---|---|
| **Repo 的 Clone 網址** | 從 GitHub 頁面取得（下面說明） |
| **本機資料夾的位置** | 你自己決定（下面說明） |

準備好這兩件事，告訴 Claude Code，它會幫你完成剩下的步驟。

#### 從 GitHub 取得 Clone 網址

打開工程師給你的 GitHub 連結，你會看到 repo 的主頁面。

**① 找到右上方的綠色 Code 按鈕，點擊**

```
owner-name / repo-name
──────────────────────────────────────────────
About    Issues    Pull requests    Actions  ...

                          ← 在這一排最右邊
                         ┌──────────┐
                         │ <> Code ▾│  ← 點這個綠色按鈕
                         └──────────┘
```

**② 選 HTTPS 標籤，點右邊的複製圖示**

```
┌──────────────────────────────────────┐
│  Clone                               │
│  ──────────────────────────────────  │
│  HTTPS  │  SSH  │  GitHub CLI        │  ← 選 HTTPS
│                                      │
│  https://github.com/owner/repo.git   │
│                                 [⎘]  │  ← 點這個複製
└──────────────────────────────────────┘
```

複製到的網址長這樣：`https://github.com/company/design-system.git`

> **HTTPS vs SSH**：初次使用選 HTTPS，不需要額外設定。公司環境若工程師已幫你設定過 SSH key，可以選 SSH——不確定就問工程師。

> **沒有權限，看不到 Clone 網址？** 代表你還不是這個 repo 的成員。請工程師或主管把你加入（repo 頁面 → Settings → Collaborators and teams），加入後再重試。

#### 決定本機資料夾位置

Clone 之前先確定資料夾要放哪。建議規劃一套你記得住的結構，往後就不需要每次思考：

```
~/work/
├── company/        ← 公司 repo 放這裡
├── personal/       ← 個人 repo
└── learning/       ← 練習用
```

**最重要的一條規則**：不要放在 iCloud / Dropbox / OneDrive 等雲端同步資料夾內，會跟 Git 衝突產生奇怪的問題。路徑也不要有中文或空格。

詳細原則和更多常見問題見後面「本機資料夾該放哪裡？」章節。

#### 告訴 Claude Code

把網址和目標位置一起說：

```
「幫我把這個 repo clone 到 ~/work/company/ 底下：
https://github.com/company/design-system.git」
```

Agent 會自動確認目標資料夾存在、執行 clone、回報完成後的本機路徑。

#### Clone 完成後：用 VS Code 開啟

```
VS Code → File → Open Folder → 選擇 ~/work/company/design-system/
```

左下角出現 branch 名稱（通常是 `main`），代表這個資料夾已在 Git 管理下，可以開始工作了。

#### Clone 失敗常見原因

| 錯誤訊息 | 原因 | 解法 |
|---|---|---|
| `Permission denied` | 還不是 repo 成員 | 請工程師將你加入 repo |
| `Repository not found` | 網址錯誤，或 private repo 但未登入 | 確認網址，確認已登入正確的 GitHub 帳號 |
| `destination path already exists` | 目標位置已有同名資料夾 | 換個路徑，或請 Claude Code 確認那個資料夾的狀態 |

---

### Git vs GitHub？

這是最常搞混的第一個問題：簡單來說 GitHub 是 Git 的網頁版

| | Git | GitHub |
|---|---|---|
| **是什麼** | 版本控制工具（軟體） | 雲端託管平台（網站） |
| **安裝在哪** | 你的電腦上(CLI) | 瀏覽器打開 github.com |

對工程師來說，可以完全在 CLI 上面操作 Git，GitHub 只是視覺化查看的地方

#### GitHub 重點頁面介紹

Repo 主頁上有幾個區域你會常用到：

| 區域 | 在哪裡 | 用途 |
|---|---|---|
| **Code 按鈕** | 主頁右上方，綠色 | 取得 Clone 網址、下載 zip |
| **Commits** | 主頁 → `X commits` 連結 | 查看所有版本歷史，每條 commit 對應一個存檔點 |
| **Branches 下拉** | 主頁左上角 `⎇ main ▾` | 切換和查看所有 branch |
| **Pull Requests tab** | 上方導覽列 | 查看待 review 的改動、確認你的改動有沒有被合併 |
| **Issues tab** | 上方導覽列 | 任務 / 問題追蹤（有些專案用，有些用其他工具） |
| **Actions tab** | 上方導覽列 | 自動化流程，工程師維護，了解即可 |
| **Settings** | 上方導覽列（需有權限才看得到） | 管理 repo 成員、branch 保護規則 |

對設計師最重要的兩個：**Code**（取得 Clone 網址、查看目前檔案）和 **Pull Requests**（確認你的改動已上傳、發出 review 請求）。

<!-- TODO: 加入 GitHub repo 主頁截圖，標註 Code 按鈕、Commits 連結、Branch 下拉、PR tab -->

### 三個空間：程式碼的旅程

Git 把你的改動分成三個階段，每個階段都是你主動推進的：

```
Working Directory  →  Staging Area  →  Repository
  （本機正在改的檔案）    （準備要存的改動）    （正式的版本紀錄）
      （本機操作）        （`git add`）     （`git commit`）
```

為什麼要多一個 Staging Area？因為你可能改了 10 個檔案，但只想先存其中 3 個。
Staging 讓你**主動挑選**要存什麼，而不是一股腦全存。

#### 用 AI Agent 操作時

好消息：**用 Claude Code 時，Staging 這一步通常會自動處理**。

| 階段 | 傳統 Git 指令 | 對 Claude Code 說 | Agent 會做什麼 |
|---|---|---|---|
| Working → Staging | `git add Header.tsx` | （不用說，自動處理） | 自動判斷哪些檔案該加 |
| Staging → Repository | `git commit -m "..."` | 「把這些改動存起來」 | `git add` + `git commit`，自動寫 commit message |
| 全部一起 | `git add . && git commit` | 「commit 目前的進度」 | 自動完成兩步 |

**什麼時候需要手動控制 Staging？**

當你想「只存部分檔案」時，要明確告訴 Agent：

- 「只 commit `Header.tsx`，其他檔案先不要」
- 「`config.json` 的改動先不要存，我還在測試」

如果沒特別說，Agent 會把所有相關改動一起 commit——這通常是你要的，但偶爾需要更細的控制。

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

### 本機資料夾 vs Remote Repo：一對一的關係

這是很多設計師一開始會搞混的：**GitHub 上的 repo 和你電腦裡的資料夾，是兩個獨立存在的東西**。

```
GitHub（雲端）                    你的電腦（本機）
┌─────────────────┐              ┌─────────────────┐
│  company/       │    clone     │  ~/work/        │
│  design-system  │  ─────────→  │  design-system/ │
│  (remote repo)  │              │  (本機資料夾)    │
└─────────────────┘              └─────────────────┘
        ↑                                 │
        └──── push / pull ────────────────┘
```

| 概念 | 說明 |
|---|---|
| **Remote repo** | GitHub 上的專案，是「雲端正本」 |
| **Clone** | 第一次把 remote repo 下載到本機 |
| **本機資料夾** | clone 下來後，你電腦裡的那個資料夾 |
| **連結關係** | 本機資料夾「記得」它是從哪個 remote 來的，push / pull 都透過這個連結 |

**重點**：Clone 之後，本機資料夾和 remote repo 就建立了連結。之後的 push / pull 都是透過這個連結同步。

### 本機資料夾該放哪裡？

Clone 專案時，你需要決定要把資料夾放在電腦的哪個位置。這個選擇會影響你的工作效率。

#### 用 VS Code 開始工作時

**VS Code 是以「資料夾」為單位工作的**。每次打開 VS Code，你需要選擇要開啟哪個資料夾：

```
File → Open Folder → 選擇你的專案資料夾
```

| 情境 | 你該開啟的資料夾 |
|---|---|
| 在 design-system 專案工作 | `~/work/company/design-system/` |
| 切換到另一個專案 | 再開一個 VS Code 視窗，開啟另一個資料夾 |
| 想同時看兩個專案 | 兩個 VS Code 視窗，各開一個資料夾 |

**為什麼這很重要？**
- Git 操作是「對目前開啟的資料夾」執行的
- 開錯資料夾 → commit / push 會跑到錯的 repo
- VS Code 左下角會顯示目前資料夾對應的 branch，確認你在對的地方

> 💡 **小技巧**：VS Code 的 `File → Open Recent` 可以快速切換最近開過的專案資料夾。

#### 建議的資料夾結構

```
~/work/                      ← 所有工作相關的專案都放這裡
├── personal/                ← 個人專案
│   ├── design-playground/
│   └── my-portfolio/
├── company/                 ← 公司專案
│   ├── design-system/
│   └── product-website/
└── learning/                ← 練習用
    └── git-practice/
```

#### 選擇位置的原則

| 原則 | 說明 | 範例 |
|---|---|---|
| **集中管理** | 所有專案放在同一個父資料夾下 | `~/work/` 而不是散落各處 |
| **分層整理** | 依專案類型分子資料夾 | `personal/`、`company/`、`learning/` |
| **路徑簡短** | 避免太深的巢狀結構 | `~/work/design-system/` ✅ <br> `~/Documents/Projects/2024/Company/Design/System/` ❌ |
| **避開同步資料夾** | 不要放在 iCloud / Dropbox / OneDrive 同步的位置 | 會跟 Git 衝突，產生奇怪的問題 |
| **英文路徑** | 資料夾名稱用英文，避免中文和空格 | `design-system` ✅ <br> `設計系統` ❌ <br> `design system` ❌ |

#### 常見問題

| 問題 | 原因 | 解法 |
|---|---|---|
| 「找不到我的專案在哪」 | 專案散落在不同位置 | 統一放 `~/work/` 底下 |
| 「Git 一直出現奇怪的衝突」 | 放在 iCloud / Dropbox 同步資料夾 | 移到非同步的位置 |
| 「路徑有亂碼」 | 資料夾名稱有中文 | 改用英文命名 |
| 「Claude Code 說找不到 repo」 | 沒有 cd 到正確的資料夾 | 先確認目前位置：「我現在在哪個資料夾？」 |

### 本機檔案 vs 遠端檔案：誰是「正本」？

這是設計師最常搞混的觀念：**同一個檔案，本機和遠端各有一份，而且可能不一樣。**

| | 本機（Local） | 遠端（Remote / GitHub） |
|---|---|---|
| **儲存在哪** | 你的電腦硬碟 | GitHub 伺服器 |
| **誰能看到** | 只有你 | 有 repo 權限的人都能看 |
| **什麼時候更新** | 你編輯 → 存檔 → commit | 你 push 之後 |
| **Figma 類比** | 本機草稿 / 離線編輯 | 雲端上的正式版本 |

**重點**：Git 不會自動幫你同步。你 commit 了 ≠ 別人看得到，必須 push 才會更新遠端。

### 情境舉例：同一份檔案的三種狀態

假設你正在改 `Header.tsx` 這個檔案：

#### 情境 A：你改了，還沒 commit

```
本機 Header.tsx：有你的新改動
遠端 Header.tsx：還是舊的
```

→ 只有你看得到改動，隨時可以放棄（`git restore`）

#### 情境 B：你 commit 了，還沒 push

```
本機 Header.tsx：新版（已存檔）
遠端 Header.tsx：還是舊的
```

→ 你的改動已經「存檔」在本機 repo，但團隊還看不到。可以繼續改、繼續 commit，等都改好再一次 push。

#### 情境 C：你 push 了

```
本機 Header.tsx：新版
遠端 Header.tsx：新版（同步了）
```

→ 團隊現在可以 pull 取得你的改動了。

### 用 Agent 檢查本機 vs 遠端狀態

不確定目前檔案是什麼狀態時，直接問 Claude Code：

| 你想知道的 | 對 Claude Code 說 | Agent 會告訴你什麼 |
|---|---|---|
| 我改了什麼？ | 「目前有哪些檔案被修改？」 | 列出所有改動的檔案，標示已 staged / 未 staged |
| 有沒有 commit？ | 「我剛剛的改動有 commit 嗎？」 | 告訴你最後一次 commit 包含什麼 |
| 有沒有 push？ | 「本機和遠端差了什麼？」 | 列出還沒 push 的 commit，或告訴你已同步 |
| 遠端有沒有新東西？ | 「遠端有沒有我還沒 pull 的更新？」 | 告訴你是否需要 pull |
| 完整狀態報告 | 「幫我檢查一下目前 git 狀態」 | 一次回報：branch、改動、commit、push 狀態 |

**VS Code 對照**：

| Agent 回報 | VS Code 對應位置 |
|---|---|
| 「有 2 個檔案被修改」 | Source Control 面板的 Changes 區塊 |
| 「有 3 個 commit 還沒 push」 | 左下角 branch 名稱旁的 ↑3 |
| 「遠端有 1 個新 commit」 | 左下角 branch 名稱旁的 ↓1 |
| 「目前在 feature/header 分支」 | 左下角狀態列 |

**建議習慣**：每次請 Agent 操作完 Git 後，花 3 秒看一眼 VS Code 左下角和 Source Control 面板，確認狀態符合預期。

### 常見問題：「我明明改了，為什麼同事說沒看到？」

**原因排查清單**：

| 檢查項目 | 怎麼確認 | 沒做到會怎樣 |
|---|---|---|
| 有 commit 嗎？ | `git status` 顯示 nothing to commit | 改動只在 working directory，隨時可能不見 |
| 有 push 嗎？ | `git log origin/main..HEAD` 沒東西 | commit 只在你的電腦，遠端還是舊的 |
| push 到對的 branch 嗎？ | 確認 branch 名稱 | 推到別的 branch，同事在 main 看不到 |
| 同事有 pull 嗎？ | 請同事跑 `git pull` | 遠端更新了，但同事的本機還是舊的 |

**對 Claude Code 說**：「幫我確認 Header.tsx 的改動有沒有 push 到遠端？」

### Branch：平行世界的工作空間

Branch 是 Git 最強大的功能之一——讓你在不影響主線的情況下，開一個「平行世界」做實驗。

```
main ──●──●──●──────────────●── （穩定的主線）
              \            /
               ●──●──●──●      （你的 branch：header-redesign）
```

#### 為什麼要用 Branch？

| 情境 | 不用 Branch | 用 Branch |
|---|---|---|
| 想試新設計，但怕改壞 | 改了就回不去，或要手動備份 | 隨時可以切回 main，branch 裡亂改沒關係 |
| 設計還沒確定，先給 PM 看 | 改動直接影響團隊 | branch 上的改動只有你看得到，確認後再合併 |
| 同時做兩個任務 | 改動混在一起，難以追蹤 | 每個任務一條 branch，清楚分開 |

#### Branch 命名建議

好的 branch 名稱讓團隊一眼知道這條 branch 在做什麼：

```
feature/header-redesign     ← 新功能
fix/login-button-alignment  ← 修 bug
experiment/dark-mode-test   ← 實驗性質，可能不會合併
```

**格式**：`類型/簡短描述`，用 `-` 連接單字，全小寫

| 類型 | 用途 | 範例 |
|---|---|---|
| `feature/` | 新功能、新頁面 | `feature/user-profile` |
| `fix/` | 修復問題 | `fix/carousel-overflow` |
| `experiment/` | 實驗、還不確定要不要用 | `experiment/new-animation` |
| `refactor/` | 重構、整理程式碼 | `refactor/component-structure` |

#### 何時該使用 Branch？

| 情境 | 用 Branch？ | 原因 |
|---|---|---|
| 想試新東西，但不確定會不會用 | ✅ 是 | 實驗失敗可以直接刪掉，main 不受影響 |
| 做一個會花好幾天的功能 | ✅ 是 | 避免半成品影響主線 |
| 要交付給別人 review | ✅ 是 | 團隊 repo 通常要求開 PR |
| 修一個很小的 typo（個人 repo） | ❌ 不用 | 直接在 main commit 就好 |
| 公司 / 團隊 repo 的任何改動 | ✅ 是 | 通常有 branch 保護規則，不能直接 push main |

**簡單判斷法**：
- **個人 repo**：小改動直接 main，大改動或實驗開 branch
- **團隊 repo**：一律開 branch，透過 PR 合併（正規流程，但現在的專案模式仍在探索中）

#### 對 Claude Code 說

| 你想做的事 | 對 Claude Code 說 |
|---|---|
| 開新 branch 開始工作 | 「開一條 branch 叫 feature/header-redesign」 |
| 看目前在哪條 branch | 「我現在在哪個 branch？」 |
| 切到別的 branch | 「切到 main」 |
| 做完了，想合併回 main | 「push 上去，然後開 PR 合併到 main」 |
| 這條 branch 不要了 | 「刪掉 feature/header-redesign 這條 branch」 |

#### 如何查看 Branch 狀態（VS Code）

VS Code 提供多種方式讓你隨時確認目前的 branch 狀態：

| 位置 | 顯示什麼 | 怎麼看 |
|---|---|---|
| **左下角狀態列** | 目前所在的 branch 名稱 | 直接看，例如顯示 `main` 或 `feature/header-redesign` |
| **Source Control 面板** | 未 commit 的改動 | 左側第三個 icon（分支圖示），展開看 Changes / Staged Changes |
| **Branch 下拉選單** | 所有本機 branch 列表 | 點左下角 branch 名稱，會跳出選單 |
| **Git Graph 套件** | 視覺化 branch 歷史 | 安裝 Git Graph 套件後，可以看到完整的分支圖 |

**快速確認清單**：

| 你想知道的 | VS Code 怎麼看 | 對 Claude Code 說 |
|---|---|---|
| 我在哪個 branch？ | 看左下角 | 「我現在在哪個 branch？」 |
| 有哪些 branch？ | 點左下角 branch 名稱開選單 | 「列出所有 branch」 |
| 這個 branch 有沒有 push 過？ | Source Control 面板會顯示 ↑ 數字（待 push 的 commit 數） | 「這個 branch 有沒有推到遠端？」 |
| branch 之間差了什麼？ | 用 Git Graph 套件看 | 「main 和我的 branch 差了哪些 commit？」 |

**推薦安裝的 VS Code Extension**：

| Extension | 用途 | 建議 |
|---|---|---|
| **Git Graph** | 視覺化 branch 歷史，看分支圖最直覺 | ⭐ 必裝，設計師友善 |
| **GitLens** | 每一行顯示誰改的、什麼時候改的 | 資訊量大，進階再裝 |
| **Git History** | 查看單一檔案的修改歷史 | 比 GitLens 輕量 |

> 💡 **新手建議**：先裝 Git Graph 就夠了，熟悉之後再考慮其他。

<!-- TODO: 加入 VS Code 左下角 branch 狀態列截圖 -->

#### Branch 工作流程建議

1. **開工**：從 main 開一條新 branch（`feature/你的任務`）
2. **工作中**：在 branch 上 commit，可以 commit 很多次
3. **完成**：push branch → 開 Pull Request → 請人 review
4. **合併**：review 通過後 merge 回 main
5. **收尾**：刪掉用完的 branch（保持整潔）

```
你的每日流程：

1. git pull（同步最新）
2. 開 branch（或切到昨天的 branch 繼續）
3. 改東西 → commit → 改東西 → commit ...
4. 做完 → push → 開 PR
5. 收工前確認都 push 了
```

#### 實際例子：用 Branch 做實驗

假設你想試試看新的 dark mode 配色，但不確定會不會用：

**Step 1**：開一條實驗用的 branch

對 Claude Code 說：「開一條 branch 叫 experiment/dark-mode」

```
main ──●──●──●
              \
               ● ← 你現在在這裡（experiment/dark-mode）
```

**Step 2**：在 branch 上隨意改、隨意 commit

對 Claude Code 說：「commit 目前的進度」（可以 commit 很多次，不用怕）

```
main ──●──●──●
              \
               ●──●──● ← 你的實驗進度
```

**Step 3**：決定要不要合併

| 結果 | 你說 | 會發生什麼 |
|---|---|---|
| 實驗成功，想用 | 「開 PR 合併到 main」 | dark mode 進入主線 |
| 實驗失敗，不要了 | 「切回 main，刪掉 experiment/dark-mode」 | 像沒發生過一樣，main 不受影響 |
| 還沒決定，先放著 | 「切回 main」 | branch 還在，之後可以繼續 |

**重點**：Branch 的價值在於「可以反悔」——不管實驗成功或失敗，main 都維持乾淨穩定。

### Week 2 Key Takeaway

1. **個人工作也建議用 repo 管理**
   - 不要只存在本機——電腦壞了、檔案誤刪就沒了
   - 建立 personal repo，push 到 GitHub 當備份
   - 養成習慣：改完 → commit → push

2. **在 personal repo 練習 branch 操作**
   - 個人 repo 最自由，怎麼玩都不會影響別人
   - 熟悉開 branch → commit → merge 的流程
   - 之後應用到團隊 repo 會更順手

3. **公司 / 部門 / 專案 repo 的分層管理**
   - 目前建議用資料夾結構區分（`~/work/company/`、`~/work/personal/`）
   - 之後會介紹更進階的多層 repo 管理方式（Week 5）

---

<!-- ===== Week 3：Git 常見名詞解惑 Git Vocabulary ===== -->

### 容易搞混的名詞 Confusing Terms

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

### 管理你的 Changes

在 commit 之前，你的改動會經過幾個狀態。了解這些狀態，才能決定「要存什麼」和「要丟掉什麼」。

#### 查看目前的 Changes

**VS Code Source Control 面板**（左側第三個 icon）會顯示所有改動：

```
Source Control
├── Staged Changes      ← 已經準備好要 commit 的
│   └── Header.tsx (M)
└── Changes             ← 改了但還沒決定要不要存的
    ├── Footer.tsx (M)
    └── config.json (M)
```

| 狀態 | 意思 | VS Code 顯示 |
|---|---|---|
| **Staged** | 已選好要存的改動，下次 commit 會包含 | 在「Staged Changes」區塊 |
| **Unstaged** | 改了但還沒決定要不要存 | 在「Changes」區塊 |
| **Untracked** | 全新檔案，Git 還不認識 | 檔名旁顯示 **U** |

#### Staged vs Unstaged：我該在意嗎？

**用 Claude Code 時，通常不用手動管理**——Agent 會自動判斷哪些檔案該 commit。

但如果你想要更細的控制：

| 你想做的 | 對 Claude Code 說 |
|---|---|
| 只 commit 部分檔案 | 「只 commit Header.tsx，其他先不要」 |
| 看目前哪些會被 commit | 「目前 staged 了哪些檔案？」 |
| 把某個檔案從 staged 移除 | 「把 config.json unstage，我還要再改」 |

**VS Code 操作**：在 Source Control 面板，點檔案旁的 `+` 可以 stage，點 `-` 可以 unstage。

#### Discard Changes：還原不想要的改動

改壞了？想放棄某個檔案的修改？

| 你想做的 | 對 Claude Code 說 | 會發生什麼 |
|---|---|---|
| 放棄單一檔案的改動 | 「把 Header.tsx 還原到上次 commit 的狀態」 | 這個檔案的改動消失，回到乾淨狀態 |
| 放棄所有改動 | 「放棄所有未 commit 的改動」 | ⚠️ 所有改動都會消失，謹慎使用 |
| 只是想看看上一版長怎樣 | 「顯示 Header.tsx 上次 commit 的內容」 | 不會改動檔案，只是讓你看 |

**VS Code 操作**：在 Changes 區塊，點檔案旁的 ↩️（Discard Changes）可以還原單一檔案。

> ⚠️ **注意**：Discard 是不可逆的——改動會真的消失。如果不確定，先 commit 或 stash。

#### Stash：暫存但不 commit

有時候你改到一半，但需要先切到別的 branch 處理緊急事情。這時候可以用 **Stash**——把目前的改動「暫時收起來」，之後再拿出來繼續。

| 情境 | 對 Claude Code 說 |
|---|---|
| 要切 branch，但目前改動還沒好 | 「先 stash 目前的改動」 |
| 處理完緊急事情，想繼續剛才的工作 | 「把 stash 的東西拿回來」 |
| 看看 stash 裡有什麼 | 「列出目前的 stash」 |
| stash 的東西不要了 | 「清掉 stash」 |

**Stash vs Commit 的差別**：

| | Stash | Commit |
|---|---|---|
| **用途** | 暫存，之後繼續改 | 存檔點，代表「這個狀態是 OK 的」 |
| **可見性** | 只有你，不會出現在 git log | 會出現在 git log |
| **適合情境** | 改到一半要切換任務 | 改好了，想留下紀錄 |

**什麼時候用 Stash？**
- 改到一半，需要緊急切 branch
- 想試試看另一個做法，但當前的改動還想保留
- 同事說「你先 pull 一下最新的」，但你有未 commit 的改動

---

<!-- ===== Week 4：用 AI 操作 Git Using AI for Git ===== -->

## 3. 用 Claude Code 操作 Git Using AI for Git Operations

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

### 我該怎麼確認 AI 對 Git 的操作是正確的？ How to Verify AI Git Operations

讓 AI 幫你操作 Git 很方便，但「方便」不等於「不用看」。就像設計師交付前會 Review 自己的畫面一樣，每次 AI 操作完 Git，你也應該花 10 秒確認結果。

#### 三個確認時機

| 時機 | 你該問的問題 | 對 Claude Code 說 |
|---|---|---|
| **Commit 之後** | 存了什麼？有沒有多存或少存？ | 「剛剛那個 commit 包含哪些檔案？」 |
| **Push 之前** | 要推到哪裡？用哪個帳號？ | 「確認一下 remote 和目前帳號」 |
| **操作結果不確定時** | 目前 repo 是什麼狀態？ | 「目前 git status 是什麼？」 |

#### 看懂 Git Status — 用 VS Code 和 CLI 對照

`git status` 是最重要的確認工具。你不需要自己打指令，但要看懂 Claude Code 回報的結果。同時，VS Code 左邊的 **Source Control 欄位**（第三個 icon，分支圖示）會即時顯示一樣的資訊：

```
Changes to be committed:        ← 已經準備好要存的（綠色）
  modified:   src/Header.tsx
  new file:   src/Logo.svg

Changes not staged for commit:  ← 改了但還沒準備存的（紅色）
  modified:   src/Footer.tsx

Untracked files:                ← 全新的檔案，Git 還不認識
  src/Banner.tsx
```

| CLI 顯示（Claude Code 回報） | VS Code Source Control 欄位 | 檔名旁的標記 |
|---|---|---|
| **Changes to be committed** | 「Staged Changes」區塊 | **A**（新增）/ **M**（修改） |
| **Changes not staged** | 「Changes」區塊 | **M**（橘色） |
| **Untracked files** | 「Changes」區塊 | **U**（灰色，Untracked） |
| 檔案被刪除 | 「Changes」區塊 | **D**（紅色，Deleted） |

> **快速確認法**：Claude Code 說「已 commit」之後，看一眼 VS Code Source Control——如果 Staged Changes 區塊清空了，代表存檔成功。如果還有檔案留在 Changes 區塊，代表有東西沒存到。

<!-- TODO: 加入 VS Code Source Control 面板截圖，標註 Staged Changes / Changes / U / M / D 標記 -->

#### 四個常見的「不對勁」訊號

這些情況出現時，先暫停，問 Claude Code 發生什麼事：

| 看到什麼 | 可能的問題 | 怎麼問 |
|---|---|---|
| Commit 裡出現 `.env` 或 `credentials` | 敏感資訊差點被存進去 | 「這個 commit 有沒有包含敏感檔案？」 |
| Push 的目標是 `main` 而不是你的 branch | 直接推到主線，可能影響團隊 | 「我現在是在哪個 branch？」 |
| `git status` 顯示一堆你沒碰過的檔案 | 可能切錯 repo，或 AI 動到不該動的地方 | 「這些檔案是誰改的？跟我的任務有關嗎？」 |
| Commit message 跟你做的事對不上 | AI 誤判了你的意圖 | 「等一下，我改的是 X，為什麼 message 寫 Y？幫我改」 |

> **VS Code 對照**：在 Source Control 欄位點任何一個檔案，右邊會打開 **diff 檢視**，左右對照修改前後的差異。綠色是新增的行，紅色是刪除的行。這跟 Claude Code 回報的 `git diff` 是同一個東西，只是用圖形介面呈現。

<!-- TODO: 加入 VS Code diff 檢視截圖，標註綠色（新增）與紅色（刪除） -->

#### Push 前的最後確認清單

每次 AI 說「已經準備好 push 了」，花 10 秒跑這個清單：

- [ ] **帳號對嗎？** — 公司 repo 用公司帳號，個人 repo 用個人帳號
- [ ] **Remote 對嗎？** — 推到正確的 repo（不是推到 fork 或其他 repo）
- [ ] **Branch 對嗎？** — 推到你的 branch，不是直接推 main
- [ ] **內容對嗎？** — commit 包含的檔案都是你預期的

> **VS Code 對照**：左下角狀態列會顯示目前的 **branch 名稱**（例如 `main` 或 `feature/header-redesign`）。如果看到你在 `main` 上，但你不該直接改 main，先喊停。

<!-- TODO: 加入 VS Code 左下角 branch 名稱截圖 -->

如果你不確定任何一項，直接問 Claude Code：「push 之前幫我確認一下：帳號、remote、branch、commit 內容。」一句話就能跑完整個清單。

#### 在 GitHub 上再確認一次

Push 完之後，打開 GitHub 網頁確認：

1. 進到你的 repo 頁面
2. 切到你的 branch
3. 點最新的 commit，看看 **Files changed** 是不是你預期的改動
4. 如果要開 PR，在 PR 頁面的 **Files changed** tab 可以看到所有差異

<!-- TODO: 加入 GitHub PR Files changed 頁面截圖 -->

這就像設計發布之後去確認更新是否正確。**發布之後驗證一次，是專業工作流程的一部分。**

### 實戰案例：IDE 按 Discard 沒反應？可能是 Submodule

**情境**：你在 VS Code 裡看到一個檔案有改動標記（`M`），但按了 Discard Changes 一直沒反應，改動怎麼都消不掉。

**原因**：這個「檔案」其實不是檔案，而是一個 **Submodule**——它是「一個 repo 裡面嵌著另一個 repo」。IDE 的 Discard 功能只能處理普通檔案，對 submodule 無效。

**怎麼辨識？** 用 `git diff` 看到的是這樣的內容：

```diff
-Subproject commit abc1234
+Subproject commit abc1234-dirty
```

看到 `Subproject commit` 和 `-dirty`，就代表這是 submodule，而且 submodule 裡面有未 commit 的改動。

**怎麼處理？**

對 Claude Code 說：「這個 submodule 裡面是什麼狀態？」Claude Code 會進去 submodule 檢查，告訴你裡面有哪些檔案被修改或刪除。然後你可以決定：

| 你想做的事 | 對 Claude Code 說 |
|---|---|
| 還原，回到乾淨狀態 | 「把 submodule 裡的改動還原」 |
| 這些改動是對的，幫我存起來 | 「在 submodule 裡 commit 這些改動」 |

**重點**：遇到 IDE 操作「沒反應」的情況，不要反覆點——用 Claude Code 問一下實際狀態，通常幾秒就能解決。

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

<!-- ===== Week 5：Repo 怎麼分層管理？ Repo Taxonomy ===== -->

## 4. 具體實踐建議 Practical Guidelines

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

<!-- ===== Week 6：多專案工作流 Multi-Repo Workflow ===== -->

### 一人多 Repo 的工作架構 Multi-Repo Workflow

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

*最後更新：2026-04-14*
