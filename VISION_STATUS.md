# Vision vs Reality — Mission Winning

**Living comparison** against [vision.md](vision.md). Updated with build **2025.06-unified.45** (2026-06-29).

Use this doc when prioritizing work. Every feature should pass: *Does it serve free global accessibility or the right path?*

---

## North star check

| Vision promise | Status | Notes |
|----------------|--------|-------|
| **#1 health everything app** — unified, not fragmented | 🟡 Strong scaffold | Six pillars + Today hub + Win Score synergy |
| **Free core forever** — train, log, basics | 🟢 Shipped | Phases A–D; no paywall on core logger/library |
| **Super Bundle** — primary revenue | 🔴 UI only | `/bundle` + demo unlock; no live Stripe fulfillment |
| **Premium depth per pillar** | 🔴 Mostly placeholders | Unlock cards; recipes/programs partially gated |
| **AI Coach — personal trainer in pocket** | 🟡 Partial | Daily insight (rules/LLM) exists but **not premium**; no plan generator |
| **PWA offline everywhere** | 🔴 Blocked | Disabled while `PRIVATE_MODE=true` |
| **Global i18n** | 🟡 Partial | Tier 1/2 nav chrome; ~90% body copy still EN |
| **Bevel-style metric UI** | 🟢 Good | Readiness/Strain/Recovery rings, Mission Score |
| **Freeletics journey + streaks** | 🟢 Shipped | I-Day → Commissioned; challenges; leaderboard |
| **Evidence-based, holistic path** | 🟢 Core tone | Learn paths, disclaimers, no fad positioning |

Legend: 🟢 aligned · 🟡 partial · 🔴 gap

---

## Pillar scorecard (vision.md § Super App Structure)

| Pillar | Free tier (vision) | Free tier (app) | Premium (vision) | Premium (app) |
|--------|-------------------|-----------------|------------------|---------------|
| **/train** | Robust tracker, basic library | ⭐⭐⭐⭐ Logger, 200+ library, templates, form guides | AI Coach, 30+ plans | ⭐ Unlock + pro templates; no AI plans |
| **/fuel** | Basic log, accessible recipes | ⭐⭐⭐⭐ Log, water, 12 recipes, barcode | Deep plans, coaching | ⭐⭐ 92 server recipes only |
| **/move** | Basic flows, bodyweight | ⭐⭐⭐ 4 timed flows | Pliability / Skill Yoga depth | ⭐ Unlock card only |
| **/mind** | Basic habits, recovery | ⭐⭐⭐ Breathing, 3 guided, check-in | Calm/Waking Up depth | ⭐ Unlock card only |
| **/track** | Core logging, streaks | ⭐⭐⭐ Manual activities, import | MapMyFitness-style GPS | ⭐ Unlock card only |
| **/learn** | Intros, basics, assessments | ⭐⭐⭐⭐ 8 free ISSA paths | Specialist programs | ⭐⭐ Marketing pages; no course UX |

**Synergy:** Win Score weights all six pillars — unique vs siloed competitors. Cross-pillar coach rules exist; deep recommendations still shallow.

---

## Parallel tracks (do not confuse)

| Track | Doc | Status |
|-------|-----|--------|
| **Build phases A–D, F** | [PLAN.md](PLAN.md) | ✅ Free core, journey, unified UI |
| **Member journey phases** | [JOURNEY.md](JOURNEY.md) | I-Day → Commissioned (in-app) |
| **PFT / America G1–G8** | [PLAN.md](PLAN.md) Phase G | ✅ Optional US track; feature-flagged |
| **Launch Phase H** | [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) | ⬜ Blocked on beta + Vercel secrets |
| **Premium Phase I** | [PLAN.md](PLAN.md) | ⬜ Post-launch revenue depth |

---

## Biggest gaps (priority order)

### 1. Phase H — Launch & global access
Vision cannot land until the app is **public and installable**. Blocked on: beta gates, Vercel env, `PRIVATE_MODE=false`, PWA enable, PROTECTION P0.

### 2. Live Super Bundle (Phase I1)
Vision’s sustainability model. Today: demo email grant. Need: verified Stripe webhook → `enrollments` → premium APIs.

### 3. AI Coach v1 as premium Train (Phase I2)
Vision explicitly positions Coach as premium. Today: free daily insight. Need: plan generator, fatigue-aware adjustments, bundle gate.

### 4. i18n body copy Tier 1 (Phase I4)
Vision: “everyone, everywhere.” Today: language switch changes nav only. Need: Today, Fuel, Active, Welcome JSON per lang.

### 5. One premium pillar MVP (Phase I3)
Prove bundle value: pick **Track GPS**, **Mind audio**, or **Move video** — replace Unlock placeholder with real depth.

### 6. PFT track ops (Phase G ops)
Code shipped; production needs: Supabase migrations, `RESEND_API_KEY`, council legal sign-off before MAHA copy.

---

## What we should *not* do yet (vision filter)

- Gate core workout logging
- US-only features on global Today hub (keep `/america` optional)
- MAHA / Council `member` copy without legal OK
- Apple native app before PWA launch
- Video CDN for all 200 exercises before launch

---

## Success metrics (from vision.md)

| Metric | Target | How to measure today |
|--------|--------|----------------------|
| Free users / sessions | Freeletics-scale long-term | Supabase profiles + journey_events |
| Habit formation | Streaks, consistency | Training streak, Win Score, challenges |
| Bundle conversion | Meaningful % to premium | `enrollments` (when live) |
| Multi-pillar retention | Synergy proof | Pillar wins + commissioned rate |
| Global equity | Low-resource regions | PWA + i18n + bodyweight library |
| Beta before public | I-Day ≥80%, BT ≥60% | Profile beta panel + `/api/beta/metrics` |

---

## Quick links

| Doc | Purpose |
|-----|---------|
| [vision.md](vision.md) | Values filter — read first |
| [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) | Founder critical path to public + revenue |
| [STRATEGY.md](STRATEGY.md) | Business plan, ICP, pricing, GTM |
| [REDTEAM.md](REDTEAM.md) | Assumptions audit + pre-mortem (quarterly) |
| [PLAN.md](PLAN.md) | Build phases G / H / I |
| [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) | Launch checklist |
| [UX_UNIFIED_PLAN.md](UX_UNIFIED_PLAN.md) | UI north stars (Bevel + Freeletics) |
| [LOG.md](LOG.md) | Shipped changelog |

*Review quarterly or after each major phase merge.*
