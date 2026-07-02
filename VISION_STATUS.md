# Vision vs Reality — Mission Winning

**Living comparison** against [vision.md](vision.md). Updated with build **2025.06-unified.60** (2026-06-29).

Use this doc when prioritizing work. Every feature should pass: *Does it serve free global accessibility or the right path?*

**Integration branch:** [PR #62](https://github.com/Snedz/missionwinning/pull/62) — Phase J + I1–I4 scaffold/MVP stack ready for merge after beta gates.

---

## North star check

| Vision promise | Status | Notes |
|----------------|--------|-------|
| **#1 health everything app** — unified, not fragmented | 🟡 Strong scaffold | Six pillars + Today hub + Win Score synergy |
| **Free core forever** — train, log, basics | 🟢 Shipped | Phases A–D; no paywall on core logger/library |
| **Super Bundle** — primary revenue | 🟡 Scaffold ready | `/bundle` + Stripe Checkout API + verified webhook; live keys when LLC ready |
| **Premium depth per pillar** | 🟡 Four MVPs | Mind, Move, Track, Learn gated; Fuel recipes/programs gated |
| **AI Coach — personal trainer in pocket** | 🟡 Premium-gated | Cloud LLM daily insight + plan generator; rules/offline free |
| **PWA offline everywhere** | 🔴 Blocked | Disabled while `PRIVATE_MODE=true`; offline coach + IndexedDB shipped |
| **Global i18n** | 🟢 Tier 1 body | Today/Welcome/Fuel/Active full for FR, DE, PT, IT, JA, KO, RU; 195 locale JSON files |
| **Bevel-style metric UI** | 🟢 Good | Readiness/Strain/Recovery rings, Mission Score |
| **Freeletics journey + streaks** | 🟢 Shipped | I-Day → Commissioned; challenges; leaderboard |
| **Evidence-based, holistic path** | 🟢 Core tone | Learn paths, disclaimers, no fad positioning |

Legend: 🟢 aligned · 🟡 partial · 🔴 gap

---

## Pillar scorecard (vision.md § Super App Structure)

| Pillar | Free tier (vision) | Free tier (app) | Premium (vision) | Premium (app) |
|--------|-------------------|-----------------|------------------|---------------|
| **/train** | Robust tracker, basic library | ⭐⭐⭐⭐ Logger, 200+ library, templates, form guides | AI Coach, 30+ plans | ⭐⭐⭐ Pro templates + **premium AI plan generator** |
| **/fuel** | Basic log, accessible recipes | ⭐⭐⭐⭐ Log, water, 12 recipes, barcode | Deep plans, coaching | ⭐⭐⭐ 92 server recipes + premium lock UI |
| **/move** | Basic flows, bodyweight | ⭐⭐⭐ 4 timed flows | Pliability / Skill Yoga depth | ⭐⭐⭐ **5 premium flows** gated |
| **/mind** | Basic habits, recovery | ⭐⭐⭐ Breathing, 3 guided, check-in | Calm/Waking Up depth | ⭐⭐⭐ **6 premium sessions** gated |
| **/track** | Core logging, streaks | ⭐⭐⭐ Manual activities, import | MapMyFitness-style GPS | ⭐⭐ **5 premium programs** + pace insight (no GPS yet) |
| **/learn** | Intros, basics, assessments | ⭐⭐⭐⭐ 8 free ISSA paths | Specialist programs | ⭐⭐⭐ **6 premium paths** gated |

**Synergy:** Win Score weights all six pillars — unique vs siloed competitors. Cross-pillar coach rules exist; deep recommendations still shallow.

---

## Parallel tracks (do not confuse)

| Track | Doc | Status |
|-------|-----|--------|
| **Build phases A–D, F** | [PLAN.md](PLAN.md) | ✅ Free core, journey, unified UI |
| **Member journey phases** | [JOURNEY.md](JOURNEY.md) | I-Day → Commissioned (in-app) |
| **PFT / America G1–G8** | [PLAN.md](PLAN.md) Phase G | ✅ Optional US track; feature-flagged |
| **Launch Phase H** | [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) | ⬜ Blocked on beta gates + Vercel secrets — code ready |
| **Premium Phase I** | [PLAN.md](PLAN.md) | 🟡 I1–I4 scaffold/MVP on PR #62; live Stripe + GPS later |
| **Rural equity Phase J** | [RURAL_EQUITY_PLAN.md](RURAL_EQUITY_PLAN.md) | 🟢 Shipped — Pathfinder, offline coach, IndexedDB, Village Card |

---

## Biggest gaps (priority order)

### 1. Phase H — Launch & global access
Vision cannot land until the app is **public and installable**. Blocked on: beta gates, Vercel env, `PRIVATE_MODE=false`, PWA enable, PROTECTION P0.

### 2. Live Super Bundle (Phase I1) — scaffold ready
**Shipped:** verified Stripe webhook + Checkout Session API + bundle UI wiring. **Remaining:** LLC + live Stripe keys in Vercel; `DEMO_PREMIUM=false`.

### 3. AI Coach v1 as premium Train (Phase I2) — shipped
Cloud LLM daily insight + `/api/coach/generate-plan` premium-gated; rule-based insight and offline templates stay free. Builder includes Train Coach plan generator UI.

### 4. i18n body copy Tier 1 (Phase I4) — shipped
Today, Welcome, Fuel (43 keys), Active (50 keys) full for FR, DE, PT, IT, JA, KO, RU. **Remaining:** Tier 2 expansion; AR RTL polish.

### 5. Premium pillar MVPs (Phase I3) — shipped (4/4)
Mind (6 sessions), Move (5 flows), Track (5 programs + pace insight), Learn (6 specialist paths). **Remaining:** GPS routes, Mind audio CDN when infra ready.

### 6. PFT track ops (Phase G ops)
Code shipped; production needs: Supabase migrations, `RESEND_API_KEY`, council legal sign-off before MAHA copy.

### 7. Rural equity & connectivity (Phase J) — shipped
Pathfinder assessment, offline/lite mode, IndexedDB outbox, bodyweight defaults, Village Health Card, offline coach v2. PWA still off while gated. See [RURAL_EQUITY_PLAN.md](RURAL_EQUITY_PLAN.md).

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
| Global equity | Low-resource regions | PWA + i18n + bodyweight library + Phase J metrics |
| Beta before public | I-Day ≥80%, BT ≥60% | Profile beta panel + `/api/beta/metrics` |

---

## Quick links

| Doc | Purpose |
|-----|---------|
| [vision.md](vision.md) | Values filter — read first |
| [PLAN.md](PLAN.md) | Build phases G / H / I / J |
| [RURAL_EQUITY_PLAN.md](RURAL_EQUITY_PLAN.md) | Rural, offline, Pathfinder, connectivity |
| [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) | Launch checklist |
| [UX_UNIFIED_PLAN.md](UX_UNIFIED_PLAN.md) | UI north stars (Bevel + Freeletics) |
| [LOG.md](LOG.md) | Shipped changelog |

*Review quarterly or after each major phase merge.*
