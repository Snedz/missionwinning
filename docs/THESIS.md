# THESIS — what Mission Winning is

One page. Everything else about the idea is spread across ~20 documents; this is the page you read first and the page you hand to someone else.

**It points, it does not restate** (`.178`, one fact one home). Status → [CONTEXT.md](../CONTEXT.md) `## Now`. What may be built now → [ORCHESTRATION.md](../ORCHESTRATION.md). Prices → `src/lib/bundleConfig.ts`. Content counts → `src/lib/contentFloors.ts`. The constitution → [vision.md](../vision.md). Where those disagree with this file, they win — except on the wedge sentence, which lives here.

---

## 1. Three layers. Never collapse them.

| Layer | What it is | Where it belongs |
|---|---|---|
| **North star** | Human capability is infrastructure. The free adaptive coaching layer for anyone with a phone. | [vision.md](../vision.md) — constitution, decade horizon |
| **Narrative** | Consumer AI for a billion people; coaching quality was a privilege, now it is software. | Full YC memo → private mission-ops (`strategy/YC_THESIS.md`) |
| **Wedge** | Train + Mission Coach for train-anywhere athletes. | **This file.** Every public surface, every form, every intro. |

Leading with the north star is the recurring failure. The internal red-team 1-star review (private mission-ops) names the cost: *"a six-room house where five rooms are wallpaper photos of rooms."* Pitch the wedge; the north star is where the wedge goes.

## 2. The wedge, in two beats

> **Free forever workout logger — no account, works offline.**
> **And it reads your training load the way a strap would, without one.**

**Why two beats and not one.** The first beat is the trust wedge and the acquisition mechanic: it is what the ICP actually says out loud (*"not another subscription"*, *"actually free, not free-trial free"*), and it gets people through the door. But on its own it is a **policy**, and a funded competitor can copy a pure policy in a quarter — unlimited free tiers, offline mode, the same slogans.

The second beat is a **capability**, and it is already shipped. `src/lib/coach/load.ts` implements Foster session-RPE and an EWMA acute:chronic workload ratio computed from logged sets alone; it returns `null` under 14 days rather than a plausible number; `loadGuard.ts` feeds it back into planning cap-only — a high band may hold a rise, never force a deload, never touch session shape. That is the readiness claim WHOOP sells a strap and a subscription for, derived from a free logger, and refusing to speak before it has evidence. Copying it is a coaching-model problem, not a pricing decision.

**Do not** oversell beat two. It is a **consistency and load** signal, never physiology. `load.ts`'s own header explains that ACWR is descriptive, not predictive, and was never validated for recreational lifters. Say what it is.

**Not an SEO target.** `seo/keywords/opportunity-brief-2026-07-19.md:14` measured it: "no account" / "offline" have ~10–20 searches/month. This sentence is conversion copy and the hook for a community post. Acquisition is calculators, beginner calisthenics and `/compare` — and none of it accrues while `PRIVATE_MODE` is on.

## 3. Who it is for

The **train-anywhere lifter**: trains at home, in a park, or a garage; bodyweight or minimal kit; subscription-fatigued; any country. 18–40, aiming at 3–5 sessions a week. Write marketing in their words: *not another subscription*, *works offline*, *no account needed*, *actually free*. Full ICP memo: private mission-ops `strategy/STRATEGY.md`.

Defined by negative space — the person the wearable-first market cannot serve. *"Most people who need coaching have a phone and a park."* They do not buy first; they adopt free tools that respect them and pay later, and **trust here means free stayed free**.

Explicitly not for: wearable owners (competitors own them), enterprise, clinical use, children's literacy, US schools as the beachhead, crypto natives.

## 4. What is actually shipped

Honesty about our own depth — premium was once "recipes and a promise" and that is **no longer fully true**, and two of the six pillars are still thinner than the word "pillar" implies.

| | State |
|---|---|
| **Train** | Deep. Competitive logger — set kinds, supersets, PRs, plate calculator, rest timer, durable offline outbox. |
| **Mission Coach** | Deep, and under-sold. Deterministic seeded week generation, split planning by experience/goal, fatigue transforms, real load progression with RPE branches, and adaptation that re-spreads a missed week. Rules, not an LLM — and better for it. |
| **Fuel** | Deep. Barcode, food search, NL meal parsing, macro targets, photo logging. |
| **Move · Mind** | Real catalogs (32+48 flows, 32+60 sessions) behind **one shared timer**. Mind's daily check-in is the one live mechanism. |
| **Track** | A form, plus GPS. Wearable OAuth is wired for six providers and every sync returns empty. |
| **Learn** | ~5,300 free words presented as a guidebook. `/library` over 228 exercises is the strong part and is filed under Train. |
| **Money** | Complete: Stripe Checkout + webhook, Play Billing, USDC. Switched off by one default-true flag pending EIN. |
| **Retention** | Complete: anonymous push, nudges with a test-enforced tone contract, rewards, crons. Dark for want of three env vars. |

The engineering asset that does not show up in a feature list: an **anti-fabrication discipline** enforced by tests — em-dashes instead of invented zeros, `null` under 14 days, `adapt.ts` earning its "your week changed" banner by diffing, content counts derived from the catalog. Most consumer fitness apps ship the opposite.

## 5. Competition, and the honest moat

Short form — Hevy/Strong win logger UX and social; Freeletics wins brand; HYBRD/Imperfect win wearable-native AI; we win free-core-forever, no app-store tax, and coaching that needs no sensor. Pricing experiments and full YC matrix: private mission-ops.

**There is no defensible moat yet.** What exists: shipping velocity, free-core trust, and — newly promoted into the pitch — one capability that is a model rather than a policy. The thing that would actually become a moat is the one we do not have: **an owned relationship with users** (email habit, founder brand, community). Without that, the next ad wins.

That is in direct tension with the headline promise, and the tension is unresolved: **no account** is the trust wedge, and every return channel needs identity. [docs/RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md) solves the plumbing (device-keyed push). It does not solve the strategy. The product shape that would: the Mission Score is a **weekly grade that resets**, points are the **odometer** — so the odometer is the thing worth keeping, and "your history outlives your phone" is a reason to identify that an athlete actually wants, offered after value and never as a wall.

## 6. The one metric

**Week-4 retained weekly loggers.** Users, sessions, languages and pillars are vanity until it holds. Definition and target: [docs/POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md) and [ORCHESTRATION.md](../ORCHESTRATION.md).

It is currently **uncomputable** — the `mw_week4_retention()` migration is unapplied, so ten users would still produce no readable number. Fixing that outranks anything on this page.

## 7. Open questions this file will not decide

1. **Geography vs the global thesis.** Fifteen locales and a product argued for Lagos, Mumbai and Jakarta — while `src/lib/legal/supportedRegions.ts` blocks checkout for the EEA, UK, Switzerland, all 57 OIC states (Indonesia included) and Canada. That excludes the paying markets for `de`, `it`, `fr`, `ar`, `id` and much of `es`/`pt`. **No document argues this tradeoff.** Either the block is over-broad or the thesis needs restating as "free everywhere, paid where we are licensed."
2. **"AI Coach" as a phrase.** The plan engine is rules and the LLM is unconfigured. The rules are the better product; the word may still be a claim we do not want to defend.
3. **Pricing.** Six decisions still open in [docs/PRICING_REVIEW_2026-08.md](PRICING_REVIEW_2026-08.md), including whether "Founders 500" and the lifetime cap stay marketing-only — neither is coded.
4. **The cofounder gap**, for any competitive accelerator batch.

## 8. Copy waiting on founder sign-off

Positioning is founder-owned and `ORCHESTRATION.md` forbids landing redesign as agent work, so **none of this is merged**. It is one sentence added in four places, not a redesign. `.608` shipped the product side — the load band is now on `/coach` with its honest pre-evidence state — so the claim is true before it is made.

| Where | Today | Proposed second beat |
|---|---|---|
| `LandingPage.tsx:158-169` | H1 *"Log a set. / Your week rewrites itself."* | Keep the H1. Add beneath the stat tiles: *"And it reads your training load the way a strap would — without one."* |
| `README.md:6-8` | *"…weekly plans that adapt from your logs alone (no wearable required)."* | *"…weekly plans that adapt from your logs alone — including a training-load reading most apps need a $300 strap for."* |
| `docs/brand-guidelines.md:18-20` medium boilerplate | *"…adaptive Mission Coach from your logs — no wearable required."* | Same, plus: *"Load and readiness are computed from logged sets, and stay silent until there are two weeks of them."* |
| YC form one-liner (private memo) | *"…weekly plans that adapt from logs alone (no wearable required)."* | Append: *"including acute:chronic training load, which the category sells hardware for."* |

Three constraints on whatever wording is chosen. It must stay **descriptive** — load, not recovery, not physiology, not a prediction (`REDTEAM` A8, and `load.ts`'s own header). It must not displace *"actually free"*, which is the phrase the ICP research found people using. And it is **not an SEO target**: `seo/keywords/opportunity-brief-2026-07-19.md:14` measured these terms at ~10–20 searches/month. This is conversion copy and the hook for a community post.

## 9. Standing rules

- The free logger is never gated. Ever. (Hard rule 2 — the unlock condition in the do-not-build table is the word *Never*.)
- Agents never flip `PRIVATE_MODE`, never invent traction, never mark founder tasks done.
- Re-run [docs/REDTEAM.md](REDTEAM.md) §1 before any big bet. An assumption without named falsifying evidence is faith, not analysis.
