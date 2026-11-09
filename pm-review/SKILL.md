---
name: pm-review
description: 手動抓取 trendlife 的 omni-SMB PM 規格更新，比對 HIE live 設計與規格，印出附證據的完整 Markdown 報告並開啟檔案。設計師說「檢查 PM 更新」、「比對 PM 與 HIE 畫面」、「整理 PM 新需求」或 /pm-review 時使用。
---

# PM requirement review

由設計師手動觸發；一次處理指定 commit、日期範圍或最新一筆有關的 PM 更新。只讀 PM repo 與 HIE 現況，產出可供設計師判斷的草稿。報告可寫入本機檔案；不要發 Teams 訊息、寫回 PM repo、建立 PR、commit 或安排排程。

## 範圍與輸入

- 來源：`trendlife-general/trendlife` 的 `01-omni-for-business/01-proposal-and-roadmap/`、`02-experience-spec/`、`03-prototype/`。排除 `04-user-study/`；只處理 omni-SMB 內容，混入 Family 的更新須分開列為範圍外。
- 模式：預設檢查 `.md` 的需求/功能變動；設計師提到「畫面」、「prototype」、「UI」或相關 HTML 時，同時檢查三個來源資料夾內與本次更新相關的 `.html`（尤其 `03-prototype`）與 HIE live 畫面。HTML 若是 Markdown 的閱讀版，也要核對是否有實質內容變動；不要把自動化 Engine B 的「只讀 .md」規則套到手動比對。
- 設計師可給 commit SHA、GitHub 連結、日期範圍或功能名稱。資訊不足時先用來源路徑的最近 commits 找候選，顯示日期、作者、標題與涉及檔案；若有多筆合理候選，請設計師選一筆或一段範圍。不要猜最後看過的 SHA，也不要把整個 monorepo 的最新 commit 當 PM 更新。
- 預設繁中；`--lang en` 用英文。不要因為本機沒有 Teams、service account、PAT 或 LLM API key 就阻止只讀流程。

## 1. 抓取並固定版本

1. 在 HIE repo 先 `git fetch origin`，記下 `origin/main` SHA；確認本機 live 檔是否有未提交變更。預設以 `origin/main` 作可重現的基準，並說明本機是否另有工作版；設計師明確要求比對未提交畫面時才改用工作版。不要修改或清除設計師的檔案。
2. 用有 trendlife 讀取權限的 GitHub 登入執行 `gh api`。查三個來源路徑的 commits，按日期與 SHA 去重；對每個候選取 `repos/trendlife-general/trendlife/commits/<sha>` 的完整檔案清單，排除不屬於 omni-SMB 的變動。需要下一頁就翻頁；API 清單不完整時停止並明講，不用片段結果下結論。
3. 單筆更新以該 commit 的 parent 為舊版、該 commit 為新版。多筆更新以最早納入 commit 的 parent 為舊版、最後納入 commit 為新版；列出中間 commits。以 GitHub compare 或兩端原檔計算實際 `A/M/D/R` 與 unified diff，不能只用 commit message 推論。確認每個重要 `.md` 的完整前後文；API `patch` 缺失或截斷時改讀兩端 blob，仍取不到就標「未驗證」。
4. 紀錄來源 repo、ref/SHA、檔案路徑、blob SHA 與 GitHub blob 連結。刪除或改名檔要同列舊、新路徑；不要把改名當新需求。

可用的查詢起點：

```bash
gh api 'repos/trendlife-general/trendlife/commits?path=01-omni-for-business/03-prototype&sha=main&per_page=30'
gh api 'repos/trendlife-general/trendlife/commits/<sha>'
gh api 'repos/trendlife-general/trendlife/compare/<base>...<head>'
```

三個來源路徑都要查；上述 `03-prototype` 僅示範語法。不能存取來源時，說明缺少哪個 repo/檔案權限，請設計師提供可讀原檔或處理登入；不要用記憶中的 PM 內容替代。

## 2. 比對 HIE live 現況

1. 從變動內容判定 desktop、mobile 或兩者。desktop 基準是 `projects/omni-SMB/workspace/design co-work/desktop/`；mobile 是 `projects/omni-SMB/workspace/design co-work/app/`。`projects/omni-SMB/app/handoff/` 是凍結匯出，不可當 live 基準。
2. 先找同功能的 `app-level-spec.md`、`PROGRESS.md`、`demo/*.md`、`demo/*.decision.md`，再看相關 `views/*.html` 與 `demo/*.html`。畫面比對也要讀 PM 的正式 spec；若 prototype 比正式 spec 新，明確標「PM prototype 已改、正式 spec 尚未對齊」。看不到相應檔案時標「未找到」，不要說 HIE 沒做。
3. 逐項標記 `已對齊`、`部分對齊`、`有落差`、`待 PM 確認` 或 `未驗證`。每項都給 PM 與 HIE 的檔案/行號；畫面差異說明使用者流程與功能行為，再補視覺差異。不要由 agent 決定採納 PM 方案。
4. 列出實際比過的每個檔案：PM 用 path + ref/SHA + blob 與固定 SHA 的 GitHub 連結；HIE 已提交版本用 path + `origin/main` SHA + blob 與固定 SHA 連結。若設計師指定未提交的 HIE 工作版，改列本機絕對路徑與檔案 SHA-256，不附不存在的 GitHub blob 連結。本機畫面若與引述的 HIE SHA 不同，明標「本機工作版預覽，非該 SHA 的比對證據」。

## 3. 整理給設計師

重要度依 `情境設定 > 功能邏輯 > solution > 畫面細節` 排序；只寫已驗證內容。**只產出一份完整 Markdown 報告**，包含標題（PM 名、產品/模組、日期）、範圍與前後 SHA、變動清單、依重要度整理的 PM 變動、逐項 HIE 對照表、待 PM/設計師決定事項、確切比對檔清單與連結。每個結論附來源 path/行號；保留「未驗證」與正式 spec 落後 prototype 的情況。

1. 將完整報告寫成 `.md`。設計師指定路徑時用該路徑；否則用 `mktemp -d "${TMPDIR:-/tmp}/pm-review.XXXXXX"` 建立本機暫存目錄，在其中寫 `report.md`。不要覆寫既有報告，也不要將預設報告寫進 HIE 或 PM repo。
2. 讀回檔案，**在對話印出相同的完整內容**，並附檔案絕對路徑。不要再另寫 Teams 短版或套用 200 字元限制。
3. 寫入成功後用 macOS `open "<報告檔絕對路徑>"` 開啟檔案。若開啟失敗，明確回報原因與檔案路徑，不要聲稱已開啟；不需啟動本機 server。
4. 請設計師確認落差判定；agent 不自行宣稱設計已對齊或需求已定案。

## 完成檢查

- 有沒有漏掉範圍內的 `.md`，或在畫面模式漏掉三個來源資料夾內相關的 `.html`？
- HIE 比對是否真的讀到 live 平台的 spec、decision 與相關畫面？
- 報告是否指出有證據的實質落差？若沒有，就明寫「目前未查到已驗證落差」，不可硬湊。
- 已提交版本的 SHA、blob、路徑與連結是否對得上；未提交版本的本機路徑與 SHA-256 是否對得上？
- 本機預覽若與固定 SHA 不同，是否明確標出版本差異？
- 對話內容是否與寫入的 Markdown 一致，且已實際開啟檔案或清楚回報開啟失敗？
