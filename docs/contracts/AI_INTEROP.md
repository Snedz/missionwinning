# Contract: AI / multi-agent interoperability

**Version:** 1.0.0  
**Status:** Operational conventions + domain resume cards  
**Horizon:** Always

---

## Purpose

Multiple agentic tools (Cursor, Claude Code, Grok/xAI, Gemini, etc.) and optional runtime LLMs (Mission Coach) must resume work without chat archaeology and without leaking INTERNAL strategy.

## Boot order (every tool)

1. [CONTEXT.md](../../CONTEXT.md) — status  
2. [AGENTS.md](../../AGENTS.md) — conventions  
3. [INDEX.md](../../INDEX.md) — task routing  
4. [ORCHESTRATION.md](../../ORCHESTRATION.md) — horizon gates  
5. Folder `INDEX.md` for the domain you touch  
6. Relevant [contracts](INDEX.md)

Do not use `~/.cursor/plans`, `.hermes/plans`, or chat history as source of truth.

## Domain resume card (required shape)

Every domain with ≥5 lib files ships `INDEX.md` with:

```markdown
## Agent resume card
- Purpose:
- Non-goals:
- Entry files:
- Tests to run:
- Forbidden:
- Horizon gate:
- Upstream contracts:
- Downstream consumers:
```

Model: [src/lib/identity/INDEX.md](../../src/lib/identity/INDEX.md), [src/lib/coach/INDEX.md](../../src/lib/coach/INDEX.md).

## Runtime LLM rules

| Rule | Detail |
|------|--------|
| Provider-swappable | `src/lib/coachLlmClient.ts` — prefer ZDR |
| Fail closed | Rules coach if LLM/ZDR unavailable |
| No secret prompts in git | Operator keys in env only |
| Classification | Never paste INTERNAL strategy into user-visible coach copy |
| Health claims | [EXERCISE_AS_MEDICINE.md](../EXERCISE_AS_MEDICINE.md) hygiene |

## Pure core preference

Business rules that Android, web, and future games must share live in `packages/mw-core` (no DOM, no Supabase). Agents should implement pure functions + tests first.

## Parallel agents

| Practice | Why |
|----------|-----|
| One domain per branch when possible | Merge conflicts + label treadmill |
| Worktrees for isolation | Existing Conductor / gstack pattern |
| Classification check before commit | INTERNAL stays out of product git |
| Ship protocol | LOG + CONTEXT + build label same commit |

## Forbidden for all agents

- Flip `PRIVATE_MODE` or repo visibility  
- Invent traction  
- Commit `.env.local`, treasury keys, or `ops/`  
- Gate the free logger  
- Import social standing into coach/planner modules
