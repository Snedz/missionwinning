# Keyword opportunity brief — 2026-07-19

Source: OpenSEO `research_keywords` (seeds: free workout tracker, workout log app, bodyweight workout plan) + `get_keyword_metrics` (50 curated wedge terms) + SERP checks on the two anchors. US/en. Raw data: [research-raw-2026-07-19.json](research-raw-2026-07-19.json), full table: [research-2026-07-19.csv](research-2026-07-19.csv). ~172 credits spent, 297 remaining.

## Headline findings

1. **Free calculators are the biggest asymmetric opportunity.** The app already ships 1RM, TDEE/macro, and strength-standards calculators — but they're not public SEO pages. The query space is enormous and soft:
   - `tdee calculator` 550,000/mo KD 38 · `1rm calculator` 110,000/mo KD 7 · `macro calculator` 110,000/mo KD 31 · `one rep max calculator` 90,500/mo KD 12 · `strength standards` 6,600/mo KD 10 · `strength level calculator` 4,400/mo KD 0
   - SERP check on `1rm calculator`: a Lovable-hosted page and a Weebly page rank top-20 — a fast public calculator page can break in. These pages are also the natural top-of-funnel for the no-account tracker.
2. **`/guide` content should lead with beginner calisthenics plans.** `calisthenics workout plan for beginners` is 12,100/mo at KD 0; SERP verified soft (squatwolf, cardiopanda, planetgains — no fortress domains). Supporting cluster: `bodyweight exercises for beginners` (8,100/23), `park workout` (2,900/0), `calisthenics workout plan pdf` (1,900/0), `bodyweight workout plan` (1,900/20) + pdf variants.
3. **A zero-KD "military calisthenics" cluster exists** and fits the brand (PFT/commissioning features, /youth): `free military calisthenics workout for women` (1,300/0), `free military workout plan` (1,000/0), `military workout program pdf free download` (720/0), plus 5+ long-tail variants — all KD 0. One strong pillar page + free PDF could own the cluster.
4. **`/compare` targets are small but free wins:** `hevy vs strong` (390/0), `strong app review` (170/3), `fitbod alternative` (110/0), `strong app alternative` (20/19), `jefit alternative` (10/12). Low volume, perfect intent — searchers are subscription-fatigued tracker users, exactly the wedge.
5. **Head app terms are hard — don't lead with them.** `best workout tracker app` (2,400/63), `workout tracker app free` (1,000/61), `free workout tracker` (480/63). The accessible wedge variants are `free workout apps without subscription` (1,300/29) and `best fitness tracker without subscription` (880/25).
6. **"No account" / "offline" terms have almost no search volume** (10–20/mo). They're conversion copy and community-post hooks, not SEO targets. Validated: don't build pages around them.

## Priority table (shortlist)

| Keyword | Intent | Volume | KD | CPC | Priority | Target page |
|---|---|---:|--:|--:|---|---|
| tdee calculator | informational | 550,000 | 38 | $1.08 | P1 | public /calculators/tdee |
| 1rm calculator | informational | 110,000 | 7 | $1.37 | P1 | public /calculators/1rm |
| macro calculator | informational | 110,000 | 31 | $0.86 | P1 | public /calculators/macros |
| one rep max calculator | informational | 90,500 | 12 | $1.43 | P1 | same page as 1rm |
| calisthenics workout plan for beginners | informational | 12,100 | 0 | $2.62 | P1 | /guide pillar |
| bodyweight exercises for beginners | informational | 8,100 | 23 | $3.17 | P1 | /guide or /exercises hub |
| strength standards | informational | 6,600 | 10 | $0.79 | P2 | /calculators/strength-standards |
| strength level calculator | informational | 4,400 | 0 | — | P2 | same page |
| park workout | informational | 2,900 | 0 | $0.73 | P2 | /guide |
| calisthenics workout plan pdf | informational | 1,900 | 0 | $1.04 | P1 | /guide + free PDF download |
| bodyweight workout plan | informational | 1,900 | 20 | $4.22 | P2 | /guide pillar |
| free military calisthenics workout for women | informational | 1,300 | 0 | $3.41 | P2 | military pillar |
| free workout apps without subscription | informational | 1,300 | 29 | $4.72 | P2 | landing / listicle guide |
| free military workout plan | informational | 1,000 | 0 | $2.78 | P2 | military pillar |
| best fitness tracker without subscription | informational | 880 | 25 | $2.09 | P3 | guide/blog |
| bodyweight workout plan pdf | informational | 720 | 15 | $2.40 | P2 | /guide + PDF |
| military workout program pdf free download | informational | 720 | 0 | $2.29 | P2 | military pillar PDF |
| hevy vs strong | informational | 390 | 0 | $0.01 | P2 | /compare |
| workout tracker template | informational | 390 | 4 | $0.15 | P3 | free template + tracker CTA |
| strong app review | informational | 170 | 3 | — | P3 | /compare |
| progressive overload app | informational | 140 | 18 | $4.82 | P3 | feature page/guide |
| fitbod alternative | commercial | 110 | 0 | $3.06 | P3 | /compare |
| open source fitness app | informational | 70 | 13 | — | P3 | /press or about-open-source page |
| best workout tracker app | commercial | 2,400 | 63 | $2.54 | P4 (later) | /compare hub |
| workout tracker app free | transactional | 1,000 | 61 | $2.22 | P4 (later) | landing |

## Risks / caveats

- `calisthenics workout plan for beginners` SERP has an AI Overview on top — expect reduced CTR; the free-PDF + interactive-tracker angle is the differentiation AI Overviews can't serve.
- Calculator SERPs include entrenched tool sites (strengthlevel, calculator.net, exrx); KD is low but winning likely means page-2 → page-1 over months, helped by internal links from guide content and any earned links.
- All volumes are US; global English demand is higher but unmeasured here. Multi-language variants are a later phase.
- Site is still behind PRIVATE_MODE — none of this accrues until public URLs are indexable.

## Suggested next actions

1. Save the shortlist to OpenSEO with tags (`page:calculators`, `topic:guide-calisthenics`, `topic:military`, `page:compare`, `topic:tracker-app`).
2. Ship public, no-auth calculator pages (1RM first: KD 7, tool already built) with sitemap entries before/at launch.
3. Run `keyword-clustering` to map the full 250-term CSV onto /guide, /exercises, /compare page structure.
4. After launch + first indexing, re-pull GSC and hydrate striking-distance queries.
