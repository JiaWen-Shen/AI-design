# Cross-Device Sync（跨裝置同步）

多台機器接力做事的標準操作。

## 核心模型

```
裝置 A (公司 MBP)    裝置 B (家裡 MBP)    裝置 C (公司 iMac)
      \                  |                   /
       \                 |                  /
        +-----> GitHub remote <-----+
                      (Git is the only source of truth)
```

**只有兩種東西需要跨裝置同步**：
1. **設定**（`~/.claude/`）→ 用 `dotclaude` git repo
2. **工作目錄**（`<WORK_DIR>/*`）→ 每個專案各自 push 到自己的 remote

**不要用** iCloud / Dropbox / Jottacloud 等雲端同步資料夾來放 `.git/`——雲端同步會 race condition 砸爛 git refs（HEAD 變空檔、ref 截斷、conflicted copy 滿天飛）。雲端只適合放**沒有 `.git/`** 的純文件。

## 三個必備檔

| 檔案 | 路徑 | 用途 |
|---|---|---|
| Ledger | `~/.claude/projects/<encoded>/memory/cross-device-sync.md` | 跨裝置待辦交接區，開工流程自動讀 |
| Device list | MEMORY 的「Devices」段 | 記每台機器的 hostname + 角色 |
| Daily summary | `<WORK_DIR>/daily-summaries/YYYY-MM-DD.md` | 收工時寫，隔天/換裝置開工讀 |

## Ledger 結構

完整範本在 `templates/cross-device-ledger.md`。三個段落：

### 🔴 Pending — 任一裝置開工時請處理

裝置 A 發現要做但本機做不到的事 → 寫進 Pending → 裝置 B 開工時 agent 自動讀到 → 浮到儀表板 PRIORITY。

範本：

```markdown
- **YYYY-MM-DD `<發源裝置>` → 指派 `<目標裝置>`**：<一句話描述>
  - **背景**：<為什麼這件事卡在跨裝置>
  - **目標裝置動作**：
    1. `ls <path>` — 確認目錄
    2. <具體 bash 指令>
  - **完成後**：把這個 entry 改 Done + 標日期
```

### 🆕 新專案啟動 — 另一台裝置可能需要 clone

開新 repo 時寫進來，讓另一台知道要 clone。

範本：

```markdown
- **YYYY-MM-DD `<裝置名>`**：開了 `<專案名>`（類型：standalone / monorepo subdir / 個人 skill / 團隊 skill）
  - Remote: `<gh-account>/<repo-name>` (private/public)
  - 本機: `<WORK_DIR>/<name>/`
  - 另一台 catch-up:
    ```bash
    cd <WORK_DIR> && gh repo clone <account>/<repo>
    ```
  - 狀態：⏳ 等另一台 clone
```

### ✅ Done

完成的項目從上面兩段搬下來，標日期 + 完成裝置。不刪，當歷史保留。

## Device-Sync 流程

「換裝置 / 切到這台 / 另一台來」時 agent 跑這個：

```bash
# 1. 拉最新 dotclaude 設定
cd ~/dotclaude && git fetch && git status -uno

# 2. 若 behind 就 pull
git pull

# 3. 確認 symlinks 正確（CLAUDE.md / skills / hooks / scripts → ~/.claude/）
bash ~/dotclaude/scripts/bootstrap-symlinks.sh

# 4. 給用戶看「另一台最近做了什麼」
git log --oneline -10

# 5. 進工作目錄看狀態
cd <WORK_DIR> && git status -sb

# 6. 讀 ledger Pending 段——另一台有沒有指派任務給本機
```

## 新裝置 Bootstrap（第一次設定）

```bash
# 1. Clone dotclaude（你自己的設定 repo）
git clone https://github.com/<YOUR-ACCOUNT>/dotclaude.git ~/dotclaude

# 2. 建 symlinks
bash ~/dotclaude/scripts/bootstrap-symlinks.sh
# 把 ~/dotclaude/{CLAUDE.md,settings.json,skills,hooks,commands,scripts}
# symlink 到 ~/.claude/

# 3. 裝 CLI 工具（rtk / gh / direnv 等）
bash ~/dotclaude/scripts/bootstrap-tools.sh

# 4. 設定 gh auth（每台都要）
gh auth login

# 5. 建工作目錄
mkdir -p ~/projects && cd ~/projects
# Clone 你需要的 repo
```

## 新專案 Flow

「開新專案 / 建立新專案 / new project」觸發。

### 觸發辨識

- 直接觸發詞：「開新專案」「建立新專案」「new project」「start project」→ 直接進流程
- 模糊觸發：「我想做一個 X」「我要寫一個 X」→ **先反問**「是要開新專案嗎？」確認後才進，**不可默默建檔**

### 最低必問 checklist（不可跳過、不可合併）

1. **類型**：
   - standalone code repo
   - monorepo 子目錄
   - 個人 skill（自己用）
   - 團隊 skill（要 ship 給團隊）
   - 文件 / 筆記專案

2. **Skill disambiguation**（任務看起來像 skill 必問）：
   - 「自己用 vs 團隊共用？」
   - 不確定預設 **團隊結構**（個人改團隊難、團隊改個人易）

3. **Remote 位置**：
   - 新 repo（哪個 gh 帳號 + 名稱 + private/public）
   - 加進現有 repo（哪個）
   - 不建 remote

4. **本機位置**：
   - 預設 `<WORK_DIR>/<name>/`
   - 其他類型依規則調整

### 建立後必做

1. `git init` + 基本 `.gitignore`（node_modules、.env、.DS_Store、*.log）
2. 用對的 gh 帳號 `gh repo create` + 推 initial commit
3. **寫進 `cross-device-sync.md` 的「🆕 新專案啟動」段落**（含 remote URL + 本機路徑 + clone 指令），確保另一台裝置開工會看到

## 多 GitHub 帳號管理

很多人有「個人 GitHub」+「公司 GitHub」兩個帳號。慣例：

```bash
# 列出 active 帳號
gh auth status

# 切換
gh auth switch -u <username>

# push 因帳號不符 403 時：直接切 → push → 切回主帳號，不用問
```

**Convention**：每個 repo 第一次 push 前先確認 active 帳號對不對，免得 403 卡 commit history。

## 常見坑

### Jottacloud / iCloud / Dropbox 不能放 `.git/`

雲端同步會：
- 砸爛 ref 檔（截斷成空字串）
- 重建 `.git/` 干擾（剝 execute bit、加 conflicted copy）
- HEAD 不見導致 git 完全壞掉

如果 repo 一定要放雲端目錄（例：團隊共用空間），用 `git --separate-git-dir` 把 `.git/` 放本機：

```bash
git init --separate-git-dir=~/.gitstores/<project>.git <project-path>
```

`.git/` 在本機、working tree 在雲端，互不干擾。

### 雙裝置同時改同一份檔

雲端同步會產生 `<file>(Username's conflicted copy YYYY-MM-DD).<ext>`。
**Convention**：每個工作時段開始前先 `git pull` + 另一台收工前 `git push`。

### `.claude/` 不要放雲端

`~/.claude/` 裡有 plugin cache、transcripts、會被腳本動的狀態檔。放雲端會：
- 衝突大量 plugin cache 檔
- 多裝置 transcripts 混在一起
- 砍掉腳本剛寫的 state 檔

解法：`~/.claude/` 留本機，`~/dotclaude/` 是你**主動 commit** 的設定 repo，兩者用 symlink 接起來（見 bootstrap-symlinks.sh）。

### Memory 明細檔忘記 commit

memory 系統是檔案——MEMORY.md + 一堆 `<topic>.md`。**沒 git-add 就不存在於 dotclaude**。
換裝置 pull 完只會看到 MEMORY.md 索引、看不到內容。

**Convention**：寫完 memory `git add` + `git commit` + `git push`，不要等收工。

## Device List 範本

放在 MEMORY「Devices」段：

```markdown
## Devices
- **A 機 — 公司 MBP** — `hostname -s` = `<XXX>`。主力工作機
- **B 機 — 家裡 MBP** — `hostname -s` = `<YYY>`。下班 / 週末
- **C 機 — 公司 iMac** — `hostname -s` = `<ZZZ>`。會議室 / 副螢幕
```

開工流程跑 `hostname -s` 比對，知道現在在哪台。
