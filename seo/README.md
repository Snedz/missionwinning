# SEO Workspace — missionwinning.com

Working folder for SEO notes, exports, briefs, and reports. Agents: read this first, then [STRATEGY.md](../STRATEGY.md) (positioning, wedge customer, SEO KPIs) and [docs/SEO_ANALYTICS.md](../docs/SEO_ANALYTICS.md) (events + funnel setup). Prep index: [PREP_INDEX.md](./PREP_INDEX.md). GSC checklist: [gsc/PREP_CHECKLIST.md](./gsc/PREP_CHECKLIST.md).

## Project context

| | |
|---|---|
| **Site** | https://missionwinning.com (single domain, no subdomains in scope) |
| **OpenSEO project** | `Default` — id `abdf037a-2175-421d-8781-dcc56a0393d0` (US / en) |
| **Search Console** | Connected natively in OpenSEO (`sc-domain:missionwinning.com`) — use `get_search_console_performance`, no CSV exports needed |
| **Market** | Global English first (wherever Reddit/PH/IndieHackers outreach lands); product built for low-resource markets (BR, IN, NG, ID, EE, RU) — multi-language SEO later |
| **Site stage** | Pre-public-launch (Aug 2026). `PRIVATE_MODE` gate still on → GSC shows 0 impressions. Organic baseline starts when the gate flips. Invite-only / private beta — not open beta. |
| **Stack** | Next.js PWA on Vercel. `app/sitemap.ts` + `app/robots.ts` exist. |

## MatrAIx gates (Growth copy)

- **F-005:** Train+Coach / free forever offline logger only — no in-app social Feed / community / everything-app merchandising.
- **F-016:** Do not lead with Super Bundle / checkout; free forever offline logger is the wedge.
- **F-008:** While `PRIVATE_MODE=true`, no open-beta / "we're live/public" status claims.

## SEO-relevant public routes (honest)

**Indexable while gated (typical):** `/guide/*` · `/exercises/*` · `/calculators/1rm` · `/calculators/tdee` · `/calculators/strength-standards` · `/paths` · `/press` · `/welcome`

**Gated / not a public SEO landing:** `/` → `/private` while `PRIVATE_MODE` on.

**Not live — do not pitch:** `/compare` (removed; craft re-ship gate) · `/bundle` (absent during free beta).

## Goals (from docs/STRATEGY.md, year one)

1. **Indexed public URLs** — growth on `/guide/*`, `/exercises/*`, `/calculators/*` (Search Console). `/compare` only after Craft re-ships.
2. **Weekly organic sessions** — baseline after `PRIVATE_MODE=false`; tracked in PostHog + GSC. Pre-flip baseline = **zero** (do not invent).
3. SEO serves the #1 business metric: week-4 retained weekly loggers. Organic content should funnel visitors into the no-account tracker (try in 30 seconds), not just collect traffic.

## Positioning (write in these terms)

> The free workout tracker that works anywhere — no account, no app store, free forever on the logger.

- **Wedge customer**: the *train-anywhere lifter* — home/park/garage, bodyweight or minimal equipment, subscription-fatigued, any country.
- **Their words**: "not another subscription", "works offline", "no account needed", "actually free, not free-trial free", "I just want to log my sets".
- **Competitors/substitutes**: Strong, Hevy, Jefit (tracker free tiers), Alpha Progression (closest Coach twin), Fitbod/Freeletics (AI programming), notes apps/spreadsheets.
- **Do not target**: "everything app" / Feed-first language for users; avoid leading with Bundle — lead with the free forever offline logger + Mission Coach from logs.

## Folder layout

| Folder | Contents |
|---|---|
| `gsc/` | Search Console prep checklist + manual exports if ever needed (native connection preferred) |
| `keywords/` | Keyword research outputs, saved/tagged term lists |
| `competitors/` | Competitor and landscape analyses |
| `content/` | Content briefs for /guide, /exercises, /compare pages |
| `launch/` | Phase B draft kits (DO NOT PUBLISH while gated) |
| `outreach/` | Link prospecting and outreach drafts |
| `reports/` | Periodic performance reports |

## Preferences

- Keep research scoped to the wedge (train-anywhere lifter) until activation holds — six pillars serve everyone, but marketing to everyone acquires no one.
- OpenSEO credits are limited (~469 as of 2026-07-19); confirm before batches over 2,000 credits.
- Next planned workflow: **keyword-research** seeded from wedge terms ("free workout tracker", "bodyweight workout log", "workout tracker no account", "offline workout app").
