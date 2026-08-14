# src/lib/coach/agent/

> One concern: in-process RAG + tools + ReAct for premium Mission Coach chat.

## Agent resume card

- **Purpose:** Prompt → Context → local retrieval → MCP-shaped tools → ReAct loop, so chat quotes logs and catalog notes instead of stuffing a single prompt and hoping.
- **Non-goals:** Vendor Collections / Files / embeddings APIs; stateful Responses (`previous_response_id`); a network MCP server; planner reads of rank or social; new user-visible "AI" chrome.
- **Entry files:** `retrieve.ts`, `tools.ts`, `react.ts`, `mcp.ts`, `facts.ts`, `corpus.ts`
- **Tests to run:** `src/lib/coach/agent/*.test.ts`, `src/lib/coachChatServer.test.ts`, `src/lib/llm/usage.test.ts`
- **Forbidden:** Importing `src/lib/rewards/`, `leaderboard/`, `social/`. Sending raw workout logs. Using xAI Collections (ZDR-forbidden — see parent INDEX).
- **Horizon gate:** W4 Coach continuity. Chat stays premium; the free logger is untouched.
- **Upstream contracts:** [docs/contracts/AI_INTEROP.md](../../../../docs/contracts/AI_INTEROP.md), ZDR rules in [src/lib/coach/INDEX.md](../INDEX.md), log citation contract in `logCitation.ts`.
- **Downstream consumers:** `src/lib/coachChatServer.ts` (`/api/coach/chat`).

## Read order

1. `types.ts` — docs, world, tool spec, ReAct parse
2. `facts.ts` — compact log / week citations (client-safe; no guidebook import)
3. `retrieve.ts` — tokenize, HyDE expand, BM25-lite, rerank, NDCG, MRR
4. `corpus.ts` — server-only catalog + guidebook summaries (memoised)
5. `tools.ts` — MCP-shaped registry + `dispatchCoachTool`
6. `mcp.ts` — JSON-RPC `initialize` / `tools/list` / `tools/call` over the same registry
7. `react.ts` — Thought / Action / Observation / Final, max 2 tool rounds, one-shot completions

## Why local RAG

`COACH_LLM_*` is ZDR-only. xAI Collections, Files, Batch, and stateful Responses are forbidden. Retrieval is therefore a local BM25 + alias expansion + lexical rerank over text we already ship. A later embedding index would be a new vendor surface, not a swap of this module's types.
