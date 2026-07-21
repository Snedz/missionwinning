# STRATEGY — Mission Winning

**The business plan on one page, then the detail.** Written 2026-07-02 as part of the launch package. Companion docs: [REDTEAM.md](REDTEAM.md) (what could kill this) · [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) (the founder's copy-paste critical path) · [vision.md](vision.md) (the constitution — unchanged).

---

## The one-page lean plan

| | |
|---|---|
| **Problem** | Serious training tools are paywalled, fragmented across 5+ subscriptions, app-store-gated, and useless offline. Billions of people train with no equipment and no budget — no major tracker is built for them. |
| **Solution** | One installable web app: complete free workout tracker + nutrition, mobility, mind, activity, and learning basics, scored together (Win Score). Premium bundle adds depth, never gates the core. |
| **Customer** | The *train-anywhere lifter*: trains at home, in a park, or a garage gym; bodyweight or minimal equipment; subscription-fatigued; any country. (Full profile below.) |
| **Revenue** | Super Bundle subscription (monthly / 12-month / lifetime founders tier) via Stripe Payment Links → verified webhook → enrollments. Later: per-pillar unlocks, B2B/team plans, coaching. |
| **Moat (today)** | Honesty + accessibility positioning (free-forever PWA, no account, offline) and the unified six-pillar Win Score. **Truth: there is no defensible moat yet — speed and trust are the strategy.** |
| **First 90 days** | Days 1–14: unblock deploy, 10 beta users, hit journey gates. Days 15–45: public launch (PH/Reddit/communities), 1,000 visitors → measure activation. Days 46–90: wire Stripe, founders offer to the list, build AI Coach v1 only if activation holds. |
| **#1 metric (year one)** | **Week-4 retained weekly loggers** — users who log ≥1 workout in week 4 after first workout. Everything else (users, sessions, languages, pillars) is vanity until this number holds. |
| **SEO KPIs (year one)** | **Indexed public URLs** (Search Console) — target growth on `/guide/*`, `/exercises/*`, `/compare`. **Weekly organic sessions** — baseline after `PRIVATE_MODE=false`; track in PostHog + Search Console. See [docs/SEO_ANALYTICS.md](docs/SEO_ANALYTICS.md). |

---

## Ideal customer profile (v1 wedge)

Six pillars serve everyone — but *marketing to everyone acquires no one*. The wedge is the *train-anywhere lifter*:

- **Who**: 18–40, trains or wants to train 3–5×/week, at home / park / minimal gym. Global — the product's offline-PWA + bodyweight-first design is *literally built* for markets like Brazil, India, Nigeria, Indonesia, Eastern Europe — but the first beachhead is wherever English outreach lands (Reddit, IndieHackers, PH).
- **Daily frustrations**: "Strong/Hevy locked routines behind a paywall *again*." "MyFitnessPal wants $20/mo to scan a barcode." "I don't have a gym, every app assumes a rack." "My phone has 3GB and one bar of signal at the park."
- **What they've tried**: notes app / spreadsheet (breaks at progression tracking), free tiers of Strong/Hevy/Jefit (hit limits), YouTube programs (no tracking), abandoning tracking entirely.
- **Where they are online**: r/bodyweightfitness (2.5M), r/homegym, r/fitness30plus, r/xxfitness, calisthenics Discord servers, Telegram fitness groups (RU/BR/IN), YouTube comment sections of Hybrid Calisthenics / FitnessFAQs, IndieHackers & Product Hunt (early-adopter slice).
- **Buying trigger**: they don't "buy" first — they *adopt* free tools that respect them, then pay when a specific wall appears (want a structured plan, want depth) *and* they trust the maker. Trust here = free stayed free.
- **Their words** (write marketing in these): "not another subscription", "works offline", "no account needed", "actually free, not free-trial free", "I just want to log my sets".

## Positioning statement

> **Adaptive AI coaching for train-anywhere athletes — free offline logging (no account), weekly plans from logs alone (no wearable).** Super Bundle adds Coach depth and the other pillars when you want them — never gates the logger.

Lead with **logger + Mission Coach** (concrete, sharp, competitive). The six-pillar “everything app” story is expansion *after* the wedge wins — second sentence / below the fold, not the company one-liner. Full YC form, competition matrix, and apply-only-after traction bar: [docs/YC_THESIS.md](docs/YC_THESIS.md). Constitution stays [vision.md](vision.md).

---

## Pricing

**Framework**: anchor to the stack it replaces (Strong $6/mo + MFP $20/mo + Calm $15/mo + Pliability $20/mo ≈ $60/mo), price at a fraction, keep founders pricing honest (a real permanent discount for early trust, not fake urgency).

| Tier | Price | Role |
|---|---|---|
| **Free core** | $0 forever | The mission + the funnel. Complete tracker, no account. |
| **Bundle monthly** | $11.99/mo | Reference price; most visible anchor. |
| **Bundle 12-month** | $59/yr (~$4.92/mo) | **The founders offer.** Push everyone here: annual cash flow, retention, honest 50%+ savings story. First 500 customers keep this price for life ("Founders 500"). |
| **Lifetime founders** | $149 one-time | Cash-flow bootstrap during beta; cap at 100–200 units, then retire. |

Rules: the current `bundleConfig.ts` tiers (3mo/$33, 12mo/$96, lifetime/$149) should be simplified toward the above when Stripe links are created — final call is the founder's; **never discount the monthly** (it's the anchor); raise prices for *new* customers as premium depth ships (founders keep theirs — that's the loyalty story).

**Why subscription-with-lifetime-escape**: subscription fatigue is the wedge customer's defining trait. Offering a fair annual + a capped lifetime converts exactly the people who refuse monthlies, without giving up recurring revenue as default.

---

## First 10 users (private beta) — 14-day zero-budget plan

**Goal**: 10+ real humans through I-Day; hit PLAN.md gates (I-Day ≥80%, Basic Training ≥60%).

- **Days 1–2 — warm circle (target 5)**: personally message friends/family/coworkers who train. Script: *"I built a free workout tracker that works offline on any phone — no account, no app store. Can you try it for a week and tell me where it confused you? Takes 3 min to start: [link + access code]"*. Personal asks, one at a time — not a broadcast.
- **Days 3–7 — communities you already inhabit (target 5–10)**: pick 2 subreddits + 1 Discord *where you genuinely participate*. Give value first (answer form/programming questions), then use the builder-story angle: *"I got tired of paywalled trackers so I built a free one that works offline — looking for 10 beta testers, honest feedback wanted."* Builder stories are welcomed where ads are banned; read each community's self-promo rules first.
- **Days 8–14 — follow-up loop**: DM every tester at day 2 and day 7: *"Did you get a workout in? What almost stopped you?"* Watch the Profile beta panel funnel. Fix the top confusion within 48h and tell the tester you fixed it — that converts testers into advocates.

**First 100 (public, days 15–45)**: Product Hunt + Hacker News "Show HN" (the no-account offline demo is the hook — a visitor can try the logger in 30 seconds without signing up), r/InternetIsBeautiful, one honest launch post per community from the beta list, and a 30–60s screen-recording of I-Day → first workout → Win Score for Shorts/TikTok. Measure: visitor → I-Day start → first workout, weekly. **Copy kit:** [docs/SOCIAL_LAUNCH.md](docs/SOCIAL_LAUNCH.md).

---

## Revenue activation (when Stripe exists)

1. Founder creates Stripe account + 2 Payment Links (12-month $59, lifetime $149) — runbook §4.
2. Paste 3 env vars into Vercel; checkout is live (`UnlockButton` switches from waitlist to checkout automatically).
3. Email the accumulated waitlist (`leads` table: `waitlist-*` + `launch-waitlist` sources): founders offer, 72-hour honest window, then lifetime tier closes at cap.
4. Do not build new premium features to sell the first 50 bundles — sell what exists (92 premium recipes, 44 premium programs, full Learn paths) + the founders price + the mission. The first 50 customers are buying trust and momentum.

## Systems that scale without the founder

| Task | System |
|---|---|
| Payments → premium | Already automated (webhook → enrollments). Never grant premium manually. |
| Beta metrics | Already automated (`/api/beta/metrics` + Profile panel). Check twice a week, not hourly. |
| Waitlist → launch emails | Resend broadcast from `leads` export. Template once, reuse. |
| Support | One `support@` inbox; hold a public FAQ; answer patterns, not individuals — every repeated question becomes app copy. |
| Content/marketing | Batch: one filming session → month of Shorts. Repurpose Learn content as posts. Kit: [docs/SOCIAL_LAUNCH.md](docs/SOCIAL_LAUNCH.md). |
| Code | CI runs tests (already set up); `gate-smoke` before every deploy; Claude Code sessions for feature work with `/code-review` before merge. |

**Founder-only (cannot delegate)**: talking to users weekly, pricing decisions, the vision filter, legal/entity setup.

---

## What we deliberately do NOT do until Week-4 retention holds

New pillars/features, more languages, native apps, video content, GPS, wearables, B2B, the America track, paid ads. Every one of these is listed in somebody's roadmap graveyard. The list above is the discipline; [REDTEAM.md](REDTEAM.md) is the reason.
