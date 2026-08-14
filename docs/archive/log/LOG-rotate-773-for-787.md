# Rotated from LOG.md when `.787` landed

## 2026-08-14 — Coach chat local RAG + ReAct (`.773`)

Premium chat stuffed one prompt and hoped. It now retrieves catalog + guidebook
summaries in-process (BM25 + alias expand), then a ReAct loop of ZDR one-shots
may cite the last working set, the week, form notes, or the load band. Cap two
tool rounds. No vendor Collections, Files, or stateful Responses. Citations are
slimmed facts — never raw logs. Chat stays premium. The free logger is
untouched.

**Ship:** `src/lib/coach/agent/` (retrieve · tools · react · mcp · facts ·
corpus). `fetchCoachChat` / `streamCoachChat` run the loop. Client sends
`slimCoachLogFacts`. grok-4.6 reasoning pinned `low`.

Label `.773` (onto master `.772`).

Excellence-Override: coach local RAG

Rotated LOG oldest → [docs/archive/log/LOG-rotate-758-for-773.md](docs/archive/log/LOG-rotate-758-for-773.md).
