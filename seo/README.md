# SEO Workspace — missionwinning.com

Working folder for SEO notes, exports, briefs, and reports. Agents: read this first, then [STRATEGY.md](../STRATEGY.md) (positioning, wedge customer, SEO KPIs) and [docs/SEO_ANALYTICS.md](../docs/SEO_ANALYTICS.md) (events + funnel setup).

## Project context

| | |
|---|---|
| **Site** | https://missionwinning.com (single domain, no subdomains in scope) |
| **OpenSEO project** | `Default` — id `abdf037a-2175-421d-8781-dcc56a0393d0` (US / en) |
| **Search Console** | Connected natively in OpenSEO (`sc-domain:missionwinning.com`) — use `get_search_console_performance`, no CSV exports needed |
| **Market** | Global English first (wherever Reddit/PH/IndieHackers outreach lands); product built for low-resource markets (BR, IN, NG, ID, EE, RU) — multi-language SEO later |
| **Site stage** | Pre-public-launch (July 2026). `PRIVATE_MODE` gate still on → GSC shows 0 impressions. Organic baseline starts when the gate flips. |
| **Stack** | Next.js PWA on Vercel. `app/sitemap.ts` + `app/robots.ts` exist. |

## SEO-relevant public routes

`/` (landing) · `/guide/*` · `/exercises/*` · `/compare` · `/paths` · `/press` · `/welcome` · `/youth`

## Goals (from docs/STRATEGY.md, year one)

1. **Indexed public URLs** — growth on `/guide/*`, `/exercises/*`, `/compare` (Search Console).
2. **Weekly organic sessions** — baseline after `PRIVATE_MODE=false`; tracked in PostHog + GSC.
3. SEO serves the #1 business metric: week-4 retained weekly loggers. Organic content should funnel visitors into the no-account tracker (try in 30 seconds), not just collect traffic.

## Positioning (write in these terms)

> The free workout tracker that works anywhere — no account, no app store, no paywall on the basics.

- **Wedge customer**: the *train-anywhere lifter* — home/park/garage, bodyweight or minimal equipment, subscription-fatigued, any country.
- **Their words**: "not another subscription", "works offline", "no account needed", "actually free, not free-trial free", "I just want to log my sets".
- **Competitors/substitutes**: Strong, Hevy, Jefit (tracker free tiers), MyFitnessPal (nutrition), Calm/Pliability/Waking Up (bundle pillars), Freeletics (model inspiration), notes apps/spreadsheets.
- **Do not target**: "everything app" language for users (founder-speak, not user-speak); avoid leading with the bundle — lead with the free tracker.

## Folder layout

| Folder | Contents |
|---|---|
| `gsc/` | Manual Search Console exports if ever needed (native connection preferred) |
| `keywords/` | Keyword research outputs, saved/tagged term lists |
| `competitors/` | Competitor and landscape analyses |
| `content/` | Content briefs for /guide, /exercises, /compare pages |
| `outreach/` | Link prospecting and outreach drafts |
| `reports/` | Periodic performance reports |

## Preferences

- Keep research scoped to the wedge (train-anywhere lifter) until activation holds — six pillars serve everyone, but marketing to everyone acquires no one.
- OpenSEO credits are limited (~469 as of 2026-07-19); confirm before batches over 2,000 credits.
- Next planned workflow: **keyword-research** seeded from wedge terms ("free workout tracker", "bodyweight workout log", "workout tracker no account", "offline workout app").
