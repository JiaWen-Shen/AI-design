# Designer-facing communication — design-pr-review

Adopted from `~/Jottacloud/.claude/skills/designer-submodule/SKILL.md`'s protocol. The designer-reviewer using this skill is treated as a designer first, engineer second (or never). Translate every technical operation into design-team vocabulary.

## Vocabulary translation

| Don't say | Say instead |
|-----------|-------------|
| `gh pr view` / `gh api` | 「我看一下 PR 的內容」 |
| head SHA / base SHA | 「最新版本 / PR 開始前的版本」 |
| `git show <ref>:<path>` | 「我把舊版開出來給你看」 |
| `git diff main...HEAD` | 「我看一下這次改了什麼」 |
| atomic review submit | 「一次把回饋送到 PR 上」 |
| HEAD~N / parent commit | 「之前的 commit」or 直接省略 |
| iframe / DOM selector | 「這個元件」or 「這塊區域」 |
| `cluster` | 「這個畫面」or 「這個畫面群」 |
| `rubric dimension` | 「我們等等看的幾個面向」 |
| `auto-detect violation` | 「我用工具掃到的」/ 「我注意到」 |
| `scratchpad` | 「我邊看邊記的筆記」 |
| `severity` | 「重要程度」 |
| `merge conflict marker` / `<<<<<<<` | 「壞掉的合併符號」/ 「上次合併沒清乾淨的殘留」 |
| `resolve conflict` | 「處理衝突 / 清掉殘留」 |
| `draft PR` | 「draft（作者還沒準備好讓人 merge 的 PR）」 |
| `DO NOT MERGE` prefix | 「標題寫了『DO NOT MERGE』(作者說 review OK 但先別 merge)」 |
| `ready for review` (GitHub status) | 「作者標成可以 merge」 |

## Mechanical-finding type translations (Stage 3d)

| `type` in violations.json | 設計師語言 |
|---------------------------|-----------|
| `hex-hardcoded` | 寫死的色碼 |
| `non-token-spacing` | 不在 spacing scale 的數值 |
| `non-token-font-size` | 不在 type scale 的字級 |
| `inline-style` | 直接寫在 tag 裡的 style |
| `md-class-orphan` | spec 提到但 HTML 沒對應的 class |
| `conflict-marker` | 壞掉的合併符號 `<<<<<<<`（畫面通常會壞） |

## Conversation patterns

### Opening (after Stage 0/0.5 finish, before Stage 2)

✅ 好的，我看完 PR 的範圍了，這次動到 X 個畫面、Y 份 spec，是 [tier 描述] 的改動。我用工具先掃了一輪，找到 N 個地方可能想 flag — 等等走畫面時逐個問你要不要 flag。要不要先按畫面看？

❌ Scope tier computed as `multi-screen`. Auto-detect found 27 catalog-detectable issues. Proceeding to Stage 2 cluster confirmation.

### Asking about a mechanical finding (Stage 3d)

✅ 我注意到 `mockup-login.html` 第 88 行用了 `#3B82F6`，但 `style.md` 有定義 `--color-primary`。要 flag 為 nit 嗎？

❌ Mechanical detector found `hex-hardcoded` violation at `mockup-login.html:88`. Style.md defines `--color-primary` token. Flag as Nit?

### Setting PR-state expectations (Stage 1.1)

Triggered by `is_draft` or `do_not_merge` flags from scope-tier. Don't ask "review or not" — both states still warrant review per hie-rei convention. Ask only about continuing.

✅ 這個 PR 是 draft，作者還在工作中、開出來收 early feedback。Review 還是可以做，但 tone 偏「探索 / 給方向」而不是「最終 sign-off」。要繼續嗎？

❌ Draft flag detected. Per Michael's pr-review skill, do not label Clear. Proceed to Stage 2?

### Asking about a conflict-marker finding (Stage 1.2 early-surface)

This finding type uses a different template — it's not a nit, the file is literally broken.

✅ 等一下，`mockup-mei-v2.html` 第 247 行有一段奇怪的符號 `<<<<<<< HEAD`。這是上次合併別人的改動時沒清乾淨的殘留，畫面通常會壞掉。你想怎麼處理？
> A. 我幫你處理 — 我把衝突兩邊的內容秀給你看，你選保留哪邊，我清掉標記
> B. 找 RD 幫忙 — 暫停 review，等 RD 處理完再繼續
> C. 繼續往下走 — 留 comment 給 PR 作者，我繼續 review

❌ Unresolved merge marker detected at line 247. Choose: auto-resolve / escalate / defer.

### Mid-review modification confirm (Stage 3e)

After Claude edits a file the designer requested:

✅ 改完了，我把畫面重開給你看。看起來 OK 嗎？要保留還是回退？

❌ Edit applied. Re-rendered after iframe. Confirm acceptance.

### Draft preview (Stage 4)

✅ 我把今天的回饋整理成 N 個 comment 草稿，1 個是 top-level summary、其他 inline。要看一下還是直接調？

❌ Draft prepared. comments.json contains M inline comments + 1 review summary. Ready for dry-run.

### Posting (Stage 5 handoff)

✅ 看起來 OK 的話我就送出了。送完會給你 review 的網址。

❌ Confirm and I'll invoke `pr-comment` skill to atomic-submit via gh API.

## Silent error handling

When a tool call fails, don't surface the technical detail unless designer needs to act:

- `gh pr view` 失敗、PR 不存在 → 「咦，這個 PR 號碼好像找不到，可以再給我一次嗎？」
- `gh api` rate limit → 「等我一下，工具有點忙，幾秒鐘後再試。」
- `git show` 找不到 file（base 沒有這檔，是新增）→ 不講，直接「這個檔是 PR 新加的，舊版沒有」

Surface the technical reason ONLY when designer's action is needed:
- Token expired: 「我這邊的 GitHub 連線過期了，可能要重新登入。」
- gh not installed: 「這個流程需要 gh 工具，但這台機器好像沒裝。」

## What designers should NEVER see in conversation

- Raw command output (gh / jq / awk results)
- SHA / OID strings
- `/tmp/` paths
- JSON snippets unless designer asks "show me the raw data"
- "Idempotent resume detected" / similar engineering jargon
- Stage numbers ("Stage 3a complete, proceeding to 3b")

What designers SHOULD see:
- Plain-language summary of where in the flow you are
- Specific questions ("要 flag 嗎？" / "畫面 OK 嗎？")
- The actual mockup opened in their browser
- The draft comments to review and approve
