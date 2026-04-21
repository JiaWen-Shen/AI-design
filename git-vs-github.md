# Git vs GitHub

一句話：**Git 是工具，GitHub 是服務**。

## 類比

> Git : GitHub ≈ 引擎 : 線上車廠
> Claude Code : Claude Design ≈ CLI : GUI

Git 自己就能完整運作；GitHub 是建在 Git 之上的協作平台。

## 本質差異

| 面向 | Git | GitHub |
|---|---|---|
| **是什麼** | 分散式版本控制**軟體**（2005 Linus Torvalds 寫的） | **雲端服務 / 公司**（2008 創立，2018 被 Microsoft 買下） |
| **在哪裡跑** | 你本機 | 網站（github.com） |
| **要不要網路** | ❌ 不需要 | ✅ 需要 |
| **花錢嗎** | 免費 open source | 免費 + 付費方案 |
| **誰管資料** | 你自己（repo 在你硬碟） | GitHub（也就是 Microsoft） |
| **替代品** | 幾乎沒有（Mercurial 已式微） | GitLab、Bitbucket、Gitea、Codeberg |

## Git 管什麼

- **Commit**：存快照
- **Branch**：分支
- **Merge / rebase**：合併
- **History / diff / blame**：看歷史

這些全部**不需要 GitHub** 也能做。你可以在一台沒網路的電腦上用 Git 一輩子。

## GitHub 加了什麼

Git 沒有的協作功能：

| 功能 | 用途 |
|---|---|
| **Remote hosting** | 把你本機的 repo 推到雲端備份 / 共享 |
| **Pull Request** | Code review 流程（Git 本身沒有 PR 這個概念） |
| **Issues** | Bug / 任務追蹤 |
| **Actions** | CI/CD 自動化 |
| **Pages** | 靜態網站 hosting（`trendlife-ui-mockup` 就跑在 GitHub Pages） |
| **Account / 權限** | 誰能 read / write |
| **Wiki / Discussions** | 文件與討論 |

## 常見混淆

| 指令 | 是 Git 還是 GitHub？ |
|---|---|
| `git commit` | **Git**（本機操作） |
| `git push` | **Git 指令**，但要 push 去**某個 remote**——那個 remote 常常是 GitHub（也可以是 GitLab、或你家的伺服器） |
| `git pull` | 同上 |
| `gh pr create` | **GitHub**（`gh` 是 GitHub 的 CLI 工具） |
| `gh auth switch` | **GitHub** |
| **Pull Request / PR** | **GitHub**（Git 本身沒這個概念，只有 `git request-pull` 古早指令） |
| **Fork** | **GitHub**（概念是 GitHub 發明的） |
| **Clone** | **Git**（把 repo 複製到本機） |

## 換一個角度

### 你可以只用 Git 不用 GitHub 嗎？

可以：
- 本機自己版本控制
- 在公司內網架 Git server
- 用 email 傳 patch（Linux kernel 到今天還是這樣）
- 改用 GitLab / Bitbucket / Codeberg

### 你可以只用 GitHub 不用 Git 嗎？

勉強可以（GitHub 網頁能直接編輯檔案、GitHub Desktop / VS Code 整合把 Git 藏起來），但**底下還是 Git**——只是你沒直接敲指令。

## 對設計師最實用的三個觀念

1. **「Git 管歷史、GitHub 管協作」**——在本機改檔、commit 是 Git 的事；push / PR / review 才進 GitHub 的地盤。
2. **Remote 不等於 GitHub**——`origin` 是「某個遠端位置」的名字，習慣上指 GitHub，但不一定。（`trendlife-ui-mockup` 有 `origin` + `personal` 兩個 remote 就是例子）
3. **帳號屬於 GitHub 不屬於 Git**——所以切帳號是 `gh auth switch`，不是 `git` 指令。
