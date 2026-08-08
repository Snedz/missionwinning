# Vision vs Reality — Mission Winning

> **⚠️ STALE — do not use the per-pillar rows as current status.**
> Last refreshed at build `.109`; the repo is on `.170`, roughly sixty ships later.
> **Current status lives in exactly one place: [CONTEXT.md](../CONTEXT.md) `## Now`.**
> This file is kept for the vision-vs-reality *framing*, not for its status column.

**Living comparison** against [vision.md](../vision.md). Updated **2026-07-23** (build `2026.07-unified.109` — exercise-as-medicine thesis + Coach dose / victory feel / re-entry; **recruiting ≥10 users + founder Production promote remain the bottleneck**).

Use this doc when prioritizing work. Every feature should pass: *Does it serve free global accessibility or the right path?*

---

## North star check

| Vision promise | Status | Notes |
|----------------|--------|-------|
| **#1 health everything app** — unified, not fragmented | 🟡 Strong scaffold | Six pillars + Today hub + Win Score synergy; cross-pillar coach chips on Today; vision now states “coach that grows with you” ([vision.md](../vision.md)) |
| **Free core forever** — train, log, basics | 🟢 Shipped | Phases A–D; no paywall on core logger/library |
| **Super Bundle** — primary revenue | 🟡 Code + checkout | Webhook secret on prod + enrollment ping OK; Dashboard webhook + live `sk_` still founder |
| **Premium depth per pillar** | 🟢 Strong | GPS Track, Fuel Coach, Coach, Mind/Move/Learn premium depth shipped |
| **AI Coach — personal trainer in pocket** | 🟢 v1 shipped | Mission Coach engine + free taster week; premium regeneration + plan-voice |
| **PWA offline everywhere** | 🟡 Serwist ready | Serwist SW when `PRIVATE_MODE=false`; Lighthouse budget routes ≥90; still gated until public launch |
| **Global i18n** | 🟡 Partial | Tier 1/2 nav chrome; **es + fr + de** body shipped for core surfaces |
| **Bevel-style metric UI** | 🟢 Good | Unified `ProgressRing`; Mission Score + clinical rings; briefing Today + Victory body delta |
| **Freeletics journey + streaks** | 🟢 Shipped | I-Day → Commissioned; challenges; leaderboard |
| **Evidence-based, holistic path** | 🟢 Core tone | Learn paths, public `/guide` + `/exercises`, disclaimers |
| **Exercise as medicine thesis** | 🟢 Documented | [EXERCISE_AS_MEDICINE.md](EXERCISE_AS_MEDICINE.md) + vision §; wedge unchanged; consumer claim hygiene in brand/LEGAL |
| **Public SEO** | 🟡 Growing | Canonicals, OG overrides, JSON-LD, marketing landing, waitlist capture |

Legend: 🟢 aligned · 🟡 partial · 🔴 gap

---

## Pillar scorecard (vision.md § Super App Structure)

| Pillar | Free tier (vision) | Free tier (app) | Premium (vision) | Premium (app) |
|--------|-------------------|-----------------|------------------|---------------|
| **/train** | Robust tracker, basic library | ⭐⭐⭐⭐ Logger, Just Go, next-set targets, PR chip, templates, form guides | AI Coach, 30+ plans | ⭐⭐⭐ Mission Coach engine + taster; premium regen |
| **/fuel** | Basic log, accessible recipes | ⭐⭐⭐⭐ Log, NL + saved meals, cal-left bars, water, barcode, 12 recipes | Deep plans, coaching | ⭐⭐⭐ Fuel Coach + 92 server recipes |
| **/move** | Basic flows, bodyweight | ⭐⭐⭐ Timed flows + guided player | Pliability / Skill Yoga depth | ⭐⭐⭐ 11 premium multi-step flows |
| **/mind** | Basic habits, recovery | ⭐⭐⭐ Breathing, guided text, check-in | Calm/Waking Up depth | ⭐⭐⭐ 17 premium timed sessions |
| **/track** | Core logging, streaks | ⭐⭐⭐ Manual activities, import | MapMyFitness-style GPS | ⭐⭐⭐ GPS panel (premium-gated) |
| **/learn** | Intros, basics, assessments | ⭐⭐⭐⭐ 8 free paths + public guide | Specialist programs | ⭐⭐⭐ Course reader + 16 premium sections |

**Synergy:** Win Score weights all six pillars. Cross-pillar coach rules + actionable chips on Today + post-session CTAs.

---

## Parallel tracks (do not confuse)

| Track | Doc | Status |
|-------|-----|--------|
| **Build phases A–D, F** | [PLAN.md](PLAN.md) | ✅ Free core, journey, unified UI |
| **Experience v4** | [docs/archive/ROADMAP_V4_EXPERIENCE.md](archive/ROADMAP_V4_EXPERIENCE.md) | ✅ Shipped PR #73 |
| **v5 + Phase I depth** | [PLAN.md](PLAN.md) Phase I | 🟡 Engines + Mind/Move/Learn/I5 + de body shipped; live Stripe remaining |
| **Member journey phases** | [JOURNEY.md](JOURNEY.md) | I-Day → Commissioned (in-app) |
| **PFT / America G1–G8** | [PLAN.md](PLAN.md) Phase G | ✅ Optional US track; feature-flagged |
| **Launch Phase H** | [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) | 🟡 Env/migrations/digest/webhook ping done; blocked on **≥10 beta** |
| **Premium Phase I** | [PLAN.md](PLAN.md) | 🟡 Code ready; Payment Links + webhook path; Sessions `sk_` optional next |

---

## Biggest gaps (priority order)

Full sequencing: [ORCHESTRATION.md](../ORCHESTRATION.md) (Horizon W → 0 → 3).

### 1. Horizon W — Wedge excellence (agents) — **#1 gap**
Train → Today → Victory → Coach habit loop must pass founder phone criteria before recruiting. Streams W1–W4 in ORCHESTRATION. Do **not** treat ≥10 beta as a substitute for making the product worthy.

### 2. Horizon 0 — Phase H beta cohort (founder) — **after excellence**
Env/migrations/digest/webhook path largely green. Then: **phone hero QA + ≥10 beta** (gates I-Day ≥80% / BT ≥60%), public flip. Day-of: [docs/archive/TRACK_D_GO_LIVE.md](archive/TRACK_D_GO_LIVE.md) · flip smoke: [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md).

### 3. Horizon 1 — Live Super Bundle + public (Phase I1)
Code path: Stripe checkout → webhook → `enrollments` → `usePremium`. Pricing: monthly **$11.99** / founders 12-mo **$59** / lifetime **$149**. Then `PRIVATE_MODE=false` + PWA offline promise.

### 4. Horizon 1 eng — performance / decomp — **done**
Lighthouse budget routes **≥90** (`/`, `/log`, guide, exercises). Serwist, logger E2E, Active/Today decomp, `src/lib/workout/` shipped. Residual decomp optional only.

### 5. Horizon 2 — week-4 retention wall metric
Prove habit loop before scale. See [docs/POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md).

### 6. Horizon 3 — Form media / i18n / SEO / TWA (post-PMF only)
Form media top-20; more locales; SEO compound; TWA if PWA install fails.

### 7. PFT track ops (Phase G ops) — optional channel
Code shipped; legal sign-off before `NEXT_PUBLIC_SHOW_MAHA_COPY=true`.

---

## What we should *not* do yet (vision filter)

- Gate core workout logging
- US-only features on global Today hub (keep `/america` optional)
- Native apps before PWA + retention proof
- Full 9-language i18n pre-PMF

---

## Build label

Current: `2026.07-unified.110` — see [`src/lib/buildInfo.ts`](../src/lib/buildInfo.ts). Confirm Profile footer matches Vercel production after founder promote.
