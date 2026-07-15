# Vision vs Reality — Mission Winning

**Living comparison** against [vision.md](vision.md). Updated **2026-07-11** (pre-launch quality bar; build `2026.07-unified.54`).

Use this doc when prioritizing work. Every feature should pass: *Does it serve free global accessibility or the right path?*

---

## North star check

| Vision promise | Status | Notes |
|----------------|--------|-------|
| **#1 health everything app** — unified, not fragmented | 🟡 Strong scaffold | Six pillars + Today hub + Win Score synergy; cross-pillar coach chips on Today |
| **Free core forever** — train, log, basics | 🟢 Shipped | Phases A–D; no paywall on core logger/library |
| **Super Bundle** — primary revenue | 🟡 Code + checkout | `/bundle`, Stripe webhook → `enrollments`; founder wires live links |
| **Premium depth per pillar** | 🟢 Strong | GPS Track, Fuel Coach, Coach, Mind/Move/Learn premium depth shipped |
| **AI Coach — personal trainer in pocket** | 🟢 v1 shipped | Mission Coach engine + free taster week; premium regeneration + plan-voice |
| **PWA offline everywhere** | 🔴 Blocked | Disabled while `PRIVATE_MODE=true` |
| **Global i18n** | 🟡 Partial | Tier 1/2 nav chrome; **es + fr + de** body shipped for core surfaces |
| **Bevel-style metric UI** | 🟢 Good | Unified `ProgressRing`; Mission Score + clinical rings; briefing Today + Victory body delta |
| **Freeletics journey + streaks** | 🟢 Shipped | I-Day → Commissioned; challenges; leaderboard |
| **Evidence-based, holistic path** | 🟢 Core tone | Learn paths, public `/guide` + `/exercises`, disclaimers |
| **Public SEO** | 🟡 Growing | Sitemap, JSON-LD, link mesh on guide/exercise/compare pages |

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
| **Experience v4** | [docs/ROADMAP_V4_EXPERIENCE.md](docs/ROADMAP_V4_EXPERIENCE.md) | ✅ Shipped PR #73 |
| **v5 + Phase I depth** | [PLAN.md](PLAN.md) Phase I | 🟡 Engines + Mind/Move/Learn/I5 + de body shipped; live Stripe remaining |
| **Member journey phases** | [JOURNEY.md](JOURNEY.md) | I-Day → Commissioned (in-app) |
| **PFT / America G1–G8** | [PLAN.md](PLAN.md) Phase G | ✅ Optional US track; feature-flagged |
| **Launch Phase H** | [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) | ⬜ Blocked on beta + Vercel secrets |
| **Premium Phase I** | [PLAN.md](PLAN.md) | 🟡 Code ready; founder wires live Stripe |

---

## Biggest gaps (priority order)

### 1. Phase H — Beta cohort + env finish
Vercel connected; migrations verified. Still need: live Stripe env, service-role on Vercel if missing, **≥10 beta users** (currently 0 profiles). Day-of: [docs/TRACK_D_GO_LIVE.md](docs/TRACK_D_GO_LIVE.md).

### 2. Live Super Bundle ops (Phase I1)
Code path: Stripe checkout → webhook → `enrollments` → `usePremium`. Founder: live links + webhook verify.

### 3. `/log` Lighthouse toward 90
Slim readiness shipped (`readinessIndex` + stored `muscleGroups`). Baseline still ~78* — re-measure with `LIGHTHOUSE_SNAPSHOT=1 npm run lighthouse-budget`.

### 4. Form media depth (PROTECTION P2)
15 hero SVGs + cues fallback shipped; expand toward top-50 video/GIF when retention justifies.

### 5. i18n — more locales after PMF (Phase I4)
es + fr + **de** body shipped for Today/Fuel/Active/Welcome/Coach. Do not spray remaining languages pre-PMF.

### 6. PFT track ops (Phase G ops)
Code shipped; production migrations applied; council legal sign-off before `NEXT_PUBLIC_SHOW_MAHA_COPY=true`.

---

## What we should *not* do yet (vision filter)

- Gate core workout logging
- US-only features on global Today hub (keep `/america` optional)
- Native apps before PWA + retention proof
- Full 9-language i18n pre-PMF

---

## Build label

Current: see [`src/lib/buildInfo.ts`](src/lib/buildInfo.ts). Confirm Profile footer matches Vercel production after deploy.
