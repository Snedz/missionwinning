# Graph memory — agent recall of this repo's history

> **Development tooling, not product.** Nothing here runs in a user request. The ZDR one-shot rule
> that governs `src/lib/coach/` (no Files, no Collections, no Batch — [src/lib/coach/INDEX.md](../src/lib/coach/INDEX.md))
> is about athlete traffic on xAI and does not apply to an agent reading the repo's own
> git-tracked prose. The free logger, `PRIVATE_MODE`, and the Coach path are untouched.

## Why

This repo compacts by hand, and the compaction is lossy on purpose. `LOG.md` keeps ≤15 entries and
rotates the rest to `docs/archive/log/`; `CONTEXT.md` `## Now` keeps ≤25 bullets. Both budgets are
enforced by tests. What gets rotated out is exactly what a new session needs and cannot see: why a
guard exists, which fix was tried and reverted, what a defect class was called the last three times
it appeared.

Measured at `.835`: **515 files, 795 dated episodes, ~194K tokens.** That corpus is timestamped,
append-only, and nobody re-reads it. A temporal graph is the right shape for it — entities and
dated edges an agent traverses instead of re-reading.

## Setup

```bash
# 1. Password and key (both local-only; .env.local is gitignored)
echo 'NEO4J_PASSWORD=<choose one>' >> .env.local
echo 'ANTHROPIC_API_KEY=<key>'     >> .env.local

# 2. Neo4j — one container, volume under .graph/ (gitignored)
docker compose -f docker-compose.graph.yml up -d

# 3. MCP server for Claude Code
cp .mcp.json.example .mcp.json     # .mcp.json is gitignored on purpose — see below

# 4. See exactly what would be sent, without sending it
npm run graph:ingest -- --dry-run

# 5. Small live run, then the full backfill
npm run graph:ingest -- --limit 5
npm run graph:ingest
```

**`.mcp.json` is not committed.** A live server block would make every agent session launch
`uvx graphiti-mcp` against a Neo4j nobody has running — including CI and network-restricted
sandboxes. This matches how the repo already treats local agent state (`.hermes/`, `.gstack/`,
`ops/`, `.local-preview/`) and how `CLAUDE.md` treats gstack: machine-local tooling, not repo
architecture.

> **Unverified:** the Graphiti env keys in `.mcp.json.example` (`MODEL_NAME`, `MODEL_EFFORT`,
> `NEO4J_URI`) come from the write-up this work followed and could not be checked against
> Graphiti's own documentation from an egress-restricted environment. Confirm them against the
> `graphiti-mcp` README on first run and correct the example file. Everything in `src/lib/graph/`
> and `scripts/graph-ingest.ts` is verified against the Claude API reference and covered by tests.

## The split: cheap ingest, careful traversal

Two model-facing jobs that want opposite settings. This is the whole cost story.

| | Ingest (extraction) | Traversal (query) |
|---|---|---|
| Volume | ~800 calls, one per episode | rare, interactive |
| Judgment | mechanical pattern-matching | multi-hop synthesis |
| Effort | `low` | `high`, `max` for deep multi-hop |
| Prefix | stable, cached | conversational |
| Mode | Batch API, overnight | synchronous |

Ingest settings live in `src/lib/graph/extractionPrompt.ts` and are asserted by its colocated
tests. Traversal effort is your own session's setting.

**Traversal rules.** Pull the relevant subgraph first, then reason only over those facts — a graph
that is queried by dumping it into context is a slower vector store. Every answer cites the edges
it used, so a wrong answer is traceable to a wrong edge rather than to "the model said so".

## What the config gets right that the source write-up did not

This was built from a public thread. Four of its details are wrong in ways that fail **silently**,
which is why they are called out here rather than quietly fixed:

| Source | Corrected |
|---|---|
| `extra_headers={"effort": "low"}` | `output_config: {effort: "low"}` — a body field. Unknown headers are ignored, so as written every call runs at the default `high`: correct-looking config, 5× bill, no error |
| A ~100-token extraction prompt, costed as 600 | The prefix must clear **512 tokens** on Opus 5 (1024 on 4.8, 2048 on 4.7, 4096 on 4.6). Below the minimum, caching does not error — `cache_creation_input_tokens` is just `0`. `assertCacheablePrefix` makes it a startup failure |
| `"Return JSON only"` in prose | `output_config.format` with a JSON schema — constrains decoding instead of requesting it |
| `max_tokens=2000`, no `thinking` | Thinking is **on by default** on Opus 5 (unlike 4.8/4.7) and `max_tokens` caps thinking *plus* output. A tight cap truncates mid-object |
| "effort is part of the cache key — never toggle" | Not in the documented invalidation hierarchy (tool definitions, model, `speed`, system content, `tool_choice`/images/`thinking`, message content). Separate ingest and query sessions anyway — because **model** and **tool set** invalidate |

Two further gaps: `reference_time` is read from the LOG heading rather than left to the model, and
the corpus is gated before it is sent (below).

## What never enters the graph

An extraction pass is an exfiltration path with a friendly name: point it at a tree and it reads
what is there, posts it to a third party, and writes the result to a database that outlives the
session. Two gates, in `src/lib/graph/redact.ts`:

- **Path** — sources are an allowlist (`LOG.md`, `CONTEXT.md`, `docs/archive/log/`), and every
  candidate is additionally checked against `git check-ignore`. Deriving from git rather than a
  hand-typed list means a new gitignored secrets directory is denied with no edit. `NOT_HISTORY`
  additionally excludes committed-but-not-history trees (`public/`, `media/`, `src/i18n/packs/`,
  `.claude/skills/`).
- **Content** — episodes are scanned for credential shapes before any network call. Findings report
  a rule name and a line number, **never** the matched text. `.gitleaks.toml` supplies the
  placeholder allowlist so documented `xai-...` / `sk_live_...` samples do not cry wolf; a gate that
  fires on placeholders is a gate someone disables.

No athlete or user data is ever an episode. This graph is about the codebase.

## Cost

Measured on the real corpus (795 episodes, ~194K tokens of body text, ~882-token cached prefix):

| | |
|---|---|
| Cached prefix | 701K tokens × $0.50/M = **$0.35** |
| Episode text | 194K × $2.50/M (batch) = **$0.49** |
| Output (~400/episode) | 318K × $12.50/M (batch) = **$3.98** |
| **Backfill total** | **≈ $4.82**, one time |
| Same work uncached, unbatched | ≈ $12.45 |

Re-ingest is idempotent: episode ids are stable, so a replay upserts rather than duplicating.
Incremental runs after a ship are a handful of episodes, i.e. cents.

## Verifying it worked

`scripts/graph-ingest.ts` prints the token split at the end and **warns loudly on zero cache
reads** — the one failure mode that costs 10× while still succeeding. Then ask a multi-hop question
and check the citations, e.g. *"why were the visual baselines deleted rather than refreshed?"* — the
answer should trace to the archived `.221` / `.254` entries with edges pointing at them, not to a
plausible-sounding summary.

## Files

| Path | Role |
|------|------|
| [src/lib/graph/](../src/lib/graph/INDEX.md) | Pure logic: episodes, redaction, extraction request |
| `scripts/graph-ingest.ts` | IO: filesystem, git, Batch API (`npm run graph:ingest`) |
| `docker-compose.graph.yml` | Neo4j dev service |
| `.mcp.json.example` | Graphiti MCP block to copy to a local `.mcp.json` |
| `.graph/` | Gitignored: Neo4j volume, dry-run output, extracted graph |
