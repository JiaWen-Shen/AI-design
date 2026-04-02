# Context Window Management：給設計師的 AI 協作指南

> 當你用 AI 工具（Claude Code、Cursor、Copilot）做介面設計時，了解 context window 的運作方式，能讓你的協作效率倍增。

---

## 什麼是 Context Window？

Context window 是 LLM 每次推理能「看到」的最大文字量（以 token 計算）。

- Claude：200K tokens（約 15 萬字中文）
- GPT-4：128K tokens
- 每次對話，模型必須把所有背景資訊塞進這個窗口

**核心問題：** LLM 沒有持久記憶。每次回應都是從 context window 裡的內容推理出來的。

---

## 為什麼設計師需要關心？

當你在 vibe coding（用 AI 對話生成介面）時：

1. **對話越長，品質越低** — 這不是「AI 變笨了」，是 context rot（上下文腐蝕）
2. **塞太多資訊反而有害** — 不相關的資訊會主動降低回應品質
3. **AI 不記得「之前說的」** — 你以為它記得，但它只是在讀你們的對話紀錄

> "Context engineering = 策略性地管理推理過程中可用的 token。找到最小的高訊號 token 集合，最大化預期結果的可能性。"
> — Anthropic Engineering

---

## 六個實用策略

### 1. 一個 Session 只做一件事

不要在同一個對話裡混著討論「整體架構」+「元件細節」+「色彩系統」。

**正確做法：**
- Session 1：Layout 骨架 → 確認 → commit
- Session 2：元件細節 → 確認 → commit
- Session 3：互動動效 → 確認 → commit

每段 commit 後開新對話，context 乾淨，AI 更精準。

> **來源：** Anthropic 建議每個 session 只處理一個 feature，完成端對端驗證後才標記完成。
> [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

---

### 2. 設計決策明確寫出來，不要假設 AI 記得

不要說「就像我們之前說的那樣」。重要決策在每次對話開頭重新陳述：

```
我用的是 Tailwind v4，元件庫是 shadcn/ui
主色是 blue-600，圓角統一用 rounded-xl
按鈕統一用 shadcn/ui Button
```

**更好的做法：** 把設計規範存成檔案（如 `CLAUDE.md` 或 `design-tokens.ts`），AI 讀檔案比讀你的描述更可靠，且不占你的對話 token。

> **來源：** Anthropic 官方推薦用 CLAUDE.md 存靜態指令，減少每次對話重複說明的 token 消耗。
> [Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

---

### 3. 長文件放前面，問題放後面

超過 20K token 的參考文件放在 prompt 前段，你的指令和問題放在最後。

```
[設計規範文件 — 放這裡]
[元件需求文件 — 放這裡]

---
請根據以上規範，幫我設計一個 user profile card 元件。
```

> **來源：** Anthropic 測試顯示，指令放在 context 末端可提升回應品質達 30%。
> [Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

---

### 4. 給精準的片段，不要丟整個檔案

GitHub 的研究發現，大型 codebase 中約 20% 的檔案會超過 context window 容量。切成 60 行以內的片段比整個檔案丟進去更有效。

**設計師的應用：**
- 不要把整份 Figma export 丟給 AI
- 截取你要處理的那個區塊的截圖或描述
- 只提供相關的 design token 和元件規格

> **來源：** GitHub Blog 研究指出不相關資訊會主動降低準確度。
> [Prompt Engineering Guide](https://github.blog/ai-and-ml/generative-ai/prompt-engineering-guide-generative-ai-llms/)
>
> LlamaIndex 測試顯示 chunk size 約 1,024 tokens 是 faithfulness 和 relevance 的最佳平衡。
> [Evaluating Ideal Chunk Size for RAG](https://www.llamaindex.ai/blog/evaluating-the-ideal-chunk-size-for-a-rag-system-using-llamaindex-6207e5d3fec5)

---

### 5. 長對話要主動摘要

對話超過 20 輪時，請 AI 幫你整理目前的設計決策：

```
幫我把目前的設計決策和已完成的元件整理成一份 spec，
我要拿去開新的對話繼續。
```

這比讓 AI 在 200 則訊息裡翻找有效得多。

> **來源：** Anthropic 的 compaction 機制就是將舊 context 自動摘要，保持對話品質。
> [Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction)

---

### 6. 用結構化格式管理跨 Session 狀態

如果你的設計專案需要跨多次對話，用 JSON 記錄進度比 Markdown 更安全——模型較不會意外修改結構化資料。

```json
{
  "project": "Dashboard Redesign",
  "completed": ["Header", "Sidebar", "User Avatar"],
  "in_progress": "Data Table",
  "next": ["Chart Components", "Export Dialog"],
  "design_decisions": {
    "color": "blue-600",
    "radius": "rounded-xl",
    "font": "Inter"
  }
}
```

每次開新 session，先貼這份 JSON 讓 AI 了解脈絡。

> **來源：** Anthropic 建議用 JSON（非 Markdown）儲存 feature checklist，模型較不會意外修改。
> [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

---

## 常見管理策略一覽

| 策略 | 說明 | 背書來源 |
|------|------|---------|
| Just-in-time 載入 | 需要時再載入資料，不要預先全塞 | Anthropic Engineering、Lilian Weng (OpenAI) |
| Compaction | 自動摘要舊對話，保持 context 聚焦 | Anthropic 官方文件 |
| Prompt Caching | 靜態指令快取，降低 90% token 成本 | Anthropic 官方文件 |
| Tool result clearing | 處理完的工具結果清除，釋放空間 | Anthropic Context Editing |
| Memory files | 跨 session 的持久記憶，存在 context 外 | Anthropic Memory Tool |
| MCP (Model Context Protocol) | 標準化 AI 連接外部資料的協議 | Anthropic、OpenAI、Cursor |
| Sub-agent 架構 | 委派子任務給專門 agent，回傳精簡摘要 | Anthropic Engineering |

---

## 參考資料

### Anthropic 官方文件
1. [Context Windows](https://platform.claude.com/docs/en/docs/build-with-claude/context-windows) — Context window 容量與限制
2. [Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction) — 自動摘要壓縮長對話
3. [Context Editing](https://platform.claude.com/docs/en/build-with-claude/context-editing) — Tool result clearing、Thinking block clearing
4. [Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) — 長 context 提示工程
5. [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — 快取靜態 context 降低成本
6. [Memory Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) — 跨 session 記憶工具

### Anthropic Engineering Blog
7. [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Context engineering 核心概念
8. [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — 長時間任務的 session 管理
9. [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) — Agent 設計原則

### 第三方研究
10. [OpenAI Agents SDK: Context](https://openai.github.io/openai-agents-python/context/) — OpenAI 的 context 管理架構
11. [GitHub Blog: Prompt Engineering Guide](https://github.blog/ai-and-ml/generative-ai/prompt-engineering-guide-generative-ai-llms/) — 程式碼 context 的最佳實踐
12. [LlamaIndex: Evaluating Ideal Chunk Size](https://www.llamaindex.ai/blog/evaluating-the-ideal-chunk-size-for-a-rag-system-using-llamaindex-6207e5d3fec5) — RAG chunk size 實驗
13. [Lilian Weng: LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) — LLM agent 記憶系統理論
14. [Model Context Protocol](https://modelcontextprotocol.io/introduction) — AI 連接外部資料的開放標準

---

*最後更新：2026-04-02*
