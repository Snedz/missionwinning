# Track 03 — Token router (gas pipeline)

**Status:** paper only (2026-09-19). Not commissioned. Not a Mission Winning ship. Not a GRAPH_LOOP letter.

**Claim:** tokens are energy; a router is a pipeline. An indie operator can own a disk-first valve that refuses to move gas until a claim is on disk, and that never opens a paid well unless an `ALLOW_PAID` hatch is explicit.

| File | Concern |
|------|---------|
| [FRAMEWORK.md](FRAMEWORK.md) | Metaphor, five-stage pipeline, laws, M1 caps, kill |
| [SELL_FIRST.md](SELL_FIRST.md) | Offer, buyer, objections — sell the meter before the pipe |
| [BUILD_LATER.md](BUILD_LATER.md) | Marketplace, semantic cache, Martian-clone, ads wrap — later or never |
| [HOW_IT_GETS_DONE.md](HOW_IT_GETS_DONE.md) | Disk layout, stage I/O, hatch, tests |
| [CURSOR_TODO.md](CURSOR_TODO.md) | Ordered agent tickets (M0 paper is this folder) |
| [SOURCES.md](SOURCES.md) | Citations, retrieved 2026-09-19 |
| [INDUSTRY_LANDSCAPE.md](INDUSTRY_LANDSCAPE.md) | OpenRouter · LiteLLM · Portkey · Helicone · Martian · CF · Together/Fireworks · Freebuff |
| [registry.schema.yaml](registry.schema.yaml) | Proposed on-disk registry / claim / receipt schema |

**In this product repo today:** Mission Winning already fail-closes LLM dollars in `src/lib/llm/spendLimit.ts` (`LLM_DAILY_USD_CENTS`, default 15¢/identity/day). That is a *spend brake on one provider*. This track proposes a *router* — a different machine — that could later sit in front of local, free, and (hatched) paid wells. Do not wire it into Coach without a founder commission.

**PR title for this paper:** `research(bangers): token-router-pipeline framework`
