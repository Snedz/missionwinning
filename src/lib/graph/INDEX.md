# src/lib/graph/

> One concern: turning this repo's own development history into graph memory an agent can traverse.

## Agent resume card

- **Purpose:** Parse `LOG.md` + `docs/archive/log/` + `CONTEXT.md` into dated episodes, refuse anything that must not leave the machine, and shape the Opus 5 extraction request that builds the graph.
- **Non-goals:** Product runtime. Nothing here is imported by `app/` or by any `src/lib/*Server.ts`; it exists for `scripts/graph-ingest.ts` and the local Graphiti MCP server. No athlete data is ever an episode.
- **Entry files:** `episodes.ts`, `redact.ts`, `extractionPrompt.ts`
- **Tests to run:** `src/lib/graph/*.test.ts`, `src/lib/time/localDate.test.ts`
- **Forbidden:** Ingesting anything git ignores, anything under `NOT_HISTORY`, or any episode carrying a credential shape. Deriving a `reference_time` through `Date` — heading dates are read verbatim (`time/localDate.ts` documents why).
- **Horizon gate:** Development tooling. Not a product surface; the free logger and `PRIVATE_MODE` are untouched.
- **Upstream contracts:** `.gitleaks.toml` owns the placeholder allowlist; `.gitignore` (via `git check-ignore`) owns which paths are secret-bearing.
- **Downstream consumers:** `scripts/graph-ingest.ts` → `.graph/graph.json` (gitignored).

## Read order

1. `episodes.ts` — markdown → `GraphEpisode[]`, reference_time read not derived
2. `redact.ts` — the two gates: path (git's answer) and content (credential shapes)
3. `extractionPrompt.ts` — stable cached prefix, ontology, structured-output schema, request body

## Why the prefix is long

`assertCacheablePrefix` fails the run below 512 tokens, the Opus 5 minimum. Below it, prompt
caching does not error — it simply does not happen, and every episode bills at full input rate
with no signal anywhere. The ontology is genuinely useful at that length (nine entity types, ten
relations, canonicalisation rules), so the guard and the content pull the same way; it is not
padding.

## Why two gates and not one

An extraction pass is an exfiltration path with a friendly name. The path gate asks `git
check-ignore` rather than consulting a hand-typed list, so a new secret-bearing directory is
denied without an edit here — the `.220` lesson about names that claim more than their
enumeration. The content gate exists because `LOG.md` is hand-written and hand-written files
acquire pasted keys. Findings report a rule name and a line number, never the matched text: a
leak detector that prints the leak into CI logs has moved the problem, not solved it.
