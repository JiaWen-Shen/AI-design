# 設計師 × AI Agent · Git Cheat Sheet

> 給設計師的精華速查表 — 不背指令，只記「什麼場景說什麼話」
> Designer's quick reference for talking to AI agents about Git

---

## 核心心法 · Core Mindset

1. **你不需要懂 git 指令，但要懂「現在處於什麼狀態」** — Agent 會挑指令，你決定方向。
2. **講「意圖」不講「指令」** — 說「想試試看 dark mode 不要影響別人」，不說「branch checkout」。
3. **被擋下來不是失敗，是 Git 在保護你** — 90% 的卡關只要說「幫我處理」就解決。
4. **不確定就先問，不要先做** — 「現在這樣 push 安全嗎？」永遠比事後 revert 划算。

---

## 三個狀態，先學會看 · The Three States

| 狀態 | 意思 | 同事看得到嗎？ |
|------|------|---------------|
| **A. 改了，還沒 commit** | 只在你電腦的工作區 | ❌ 看不到 |
| **B. commit 了，還沒 push** | 存進本機歷史紀錄 | ❌ 看不到 |
| **C. push 了** | 已上 GitHub | ✅ 看得到 |

> 卡關時，先問 agent：**「我現在處於 A / B / C 哪個狀態？」**

---

## 場景對照表 · What to Say When

### 開始工作 · Starting work

| 你想做的事 | 該對 Agent 說 |
|-----------|--------------|
| 開新的工作分支 | 「開一條 branch 叫 `karen/feature/header-redesign`」 |
| 確認自己在哪 | 「我現在在哪個 branch？」 |
| 切換到別條 branch | 「切到 main」 |
| 把遠端最新的拉下來 | 「先 pull 一下再開始」 |

### 想實驗，不影響別人 · Experiment safely

| 你想做的事 | 該對 Agent 說 |
|-----------|--------------|
| 試新方向 | 「開一條實驗 branch 叫 `karen/exp/dark-mode`，我想試 dark mode」 |
| 試完不要了 | 「這條 branch 不要了，幫我刪掉」 |
| 試到一半要先處理別的事 | 「先把現在的工作 stash 起來，等等再回來」 |

### 改完了，要交出去 · Hand-off

| 你想做的事 | 該對 Agent 說 |
|-----------|--------------|
| 存檔 + 寫紀錄 | 「commit 一下，訊息寫 `feat: redesign header layout`」 |
| 上傳到 GitHub | 「push 上去」 |
| 請工程師 review | 「開 Pull Request 合併到 main，標題寫 ⋯」 |

### 出狀況 · When things go wrong

| 症狀 | 該對 Agent 說 |
|------|--------------|
| `push` 被擋（rejected / non-fast-forward） | **「push 被擋了，幫我處理」** |
| 不知道哪裡壞了 | 「告訴我為什麼被擋」 |
| 改錯檔案想退回 | 「把 `Header.tsx` 還沒 commit 的改動丟掉」 |
| 同事改壞了想回到舊版 | 「找到上一次正常的 commit，revert 回那個版本」 |
| 切 branch 但工作做一半 | 「先 stash，切到 main，等等回來」 |

---

## ❌ 不要說的話 · Phrases to Avoid

這些字會讓 agent 觸發**破壞性指令**（force push / hard reset），有可能蓋掉同事的工作。

| 不要說 | 為什麼危險 | 改說 |
|--------|----------|------|
| 「強推」「force」「硬上」 | 觸發 `--force`，蓋掉遠端 | 「push 被擋了，幫我處理」 |
| 「蓋過去」「直接覆蓋」 | 同上 | 「整合進去」「合併」 |
| 「全部清掉」「重置」 | 觸發 `reset --hard`，本機改動消失 | 「丟掉我這次的改動」（指定範圍） |
| 「不管衝突直接合」 | 可能 silent overwrite | 「把衝突列出來給我看」 |

> Agent 看到這些字會「比較願意」執行不可逆操作，比平常更危險。

---

## 救援三步驟 · When in doubt

遇到任何看不懂的狀況，照這三句問就好：

1. 「**我現在的狀態是什麼？**」 — 確認在哪條 branch、有沒有未存的改動
2. 「**這個操作會影響到誰？**」 — 確認是只動本機，還是會推到遠端
3. 「**有沒有更安全的做法？**」 — 永遠先問再做

---

## Repo 的三種關係 · Know your role

打開一個 repo，先確認你的身份再動手：

| 關係 | 你能做什麼 | 該怎麼動 |
|------|----------|---------|
| **🟢 貢獻者**（你的團隊 repo） | 開 branch、commit、push、開 PR | 走完整流程 |
| **📘 讀者**（reference repo，例：design system） | 只看，幾乎不改 | 改之前先問「這 repo 我有權限動嗎？」 |
| **🏠 你自己的 repo** | 規則自己定 | 仍建議走 branch + PR，養成肌肉記憶 |

---

## 一句話 prompt 模板

```
我想 [做什麼]，目前在 [哪條 branch]，
請告訴我接下來的步驟，並在動 remote 之前先讓我確認。
```

**範例：**
> 我想把 `Header.tsx` 改成新的 layout，目前在 `main`，
> 請告訴我接下來的步驟，並在動 remote 之前先讓我確認。

---

*Based on the 6-week「GitHub for UI Designers」sharing series (W1 觀念對照 · W2 架構與 push 救援 · W3 名詞解惑)*
