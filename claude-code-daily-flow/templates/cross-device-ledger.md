---
name: ledger
description: 跨裝置待辦交接區。開工流程讀「Pending」+「新專案啟動」兩段，把未處理項目浮到儀表板 PRIORITY
metadata:
  node_type: memory
  type: project
---

# 跨裝置同步 ledger

開工流程會自動讀本檔的「Pending」+「新專案啟動」段落。完成的項目移到「Done」並標日期。

## 🔴 Pending — 任一裝置開工時請處理

<!--
範本：
- **YYYY-MM-DD `<發源裝置>` → 指派 `<目標裝置>`**：<一句話描述>
  - **背景**：<為什麼這件事卡在跨裝置>
  - **目標裝置動作**：
    1. `ls <path>` — 確認目錄
    2. <具體 bash 指令>
  - **完成後**：把這個 entry 改 Done + 標日期
-->

（目前無待辦）

## 🆕 新專案啟動 — 另一台裝置可能需要 clone

開工流程也讀此段：找狀態為 ⏳ 且**非本裝置**開啟的項目，若本機無對應路徑 → 浮到儀表板 PRIORITY 並附 clone 指令。完成 clone 後把該 entry 狀態改為 ✅ + 標日期與裝置（**不刪 entry**，當歷史保留）。

### Entries

<!--
範本：
- **YYYY-MM-DD `<裝置名>`**：開了 `<專案名>`（類型：standalone / monorepo subdir / 個人 skill / 團隊 skill）
  - Remote: `<gh-account>/<repo-name>` (private/public)
  - 本機: `<WORK_DIR>/<name>/`
  - 用途：<一句話>
  - 另一台 catch-up:
    ```bash
    cd <WORK_DIR> && gh repo clone <account>/<repo>
    ```
  - 狀態：⏳ 等另一台 clone
-->

（目前無新專案）

## ✅ Done

<!--
完成後從上面兩段搬下來，標：
- 完成日期
- 完成裝置
- 一句話結論

不刪 entry，當歷史保留——之後若同類問題再出現，可以回溯。
-->
