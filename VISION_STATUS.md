# Vision vs Reality — Mission Winning

**Living comparison** against [vision.md](vision.md). Updated post **v4 experience build + v5 polish** (2026-07-05).

Use this doc when prioritizing work. Every feature should pass: *Does it serve free global accessibility or the right path?*

---

## North star check

| Vision promise | Status | Notes |
|----------------|--------|-------|
| **#1 health everything app** — unified, not fragmented | 🟡 Strong scaffold | Six pillars + Today hub + Win Score synergy; cross-pillar coach chips on Today |
| **Free core forever** — train, log, basics | 🟢 Shipped | Phases A–D; no paywall on core logger/library |
| **Super Bundle** — primary revenue | 🟡 Code + checkout | `/bundle`, Stripe webhook → `enrollments`; founder wires live links |
| **Premium depth per pillar** | 🟡 Partial | GPS Track premium, Coach taster gate, recipes/programs gated |
| **AI Coach — personal trainer in pocket** | 🟡 v1 shipped | Mission Coach engine + free taster week; premium regeneration + plan-voice |
| **PWA offline everywhere** | 🔴 Blocked | Disabled while `PRIVATE_MODE=true` |
| **Global i18n** | 🟡 Partial | Tier 1/2 nav chrome; es body wave for Today/Fuel/Active in progress |
| **Bevel-style metric UI** | 🟢 Good | Readiness/Strain/Recovery rings, Mission Score tick-up animation |
| **Freeletics journey + streaks** | 🟢 Shipped | I-Day → Commissioned; challenges; leaderboard |
| **Evidence-based, holistic path** | 🟢 Core tone | Learn paths, public `/guide` + `/exercises`, disclaimers |
| **Public SEO** | 🟡 Growing | Sitemap, JSON-LD, link mesh on guide/exercise/compare pages |

Legend: 🟢 aligned · 🟡 partial · 🔴 gap

---

## Pillar scorecard (vision.md § Super App Structure)

| Pillar | Free tier (vision) | Free tier (app) | Premium (vision) | Premium (app) |
|--------|-------------------|-----------------|------------------|---------------|
| **/train** | Robust tracker, basic library | ⭐⭐⭐⭐ Logger, 200+ library, templates, form guides | AI Coach, 30+ plans | ⭐⭐⭐ Mission Coach engine + taster; premium regen |
| **/fuel** | Basic log, accessible recipes | ⭐⭐⭐⭐ Log, water, 12 recipes, barcode, empty-state CTA | Deep plans, coaching | ⭐⭐ 92 server recipes only |
| **/move** | Basic flows, bodyweight | ⭐⭐⭐ 4 timed flows | Pliability / Skill Yoga depth | ⭐ Unlock card only |
| **/mind** | Basic habits, recovery | ⭐⭐⭐ Breathing, 3 guided, check-in | Calm/Waking Up depth | ⭐ Unlock card only |
| **/track** | Core logging, streaks | ⭐⭐⭐ Manual activities, import | MapMyFitness-style GPS | ⭐⭐ GPS panel (premium-gated) |
| **/learn** | Intros, basics, assessments | ⭐⭐⭐⭐ 8 free ISSA paths + public guide | Specialist programs | ⭐⭐ Marketing pages; no course UX |

**Synergy:** Win Score weights all six pillars. Cross-pillar coach rules + actionable chips on Today.

---

## Parallel tracks (do not confuse)

| Track | Doc | Status |
|-------|-----|--------|
| **Build phases A–D, F** | [PLAN.md](PLAN.md) | ✅ Free core, journey, unified UI |
| **Experience v4** | [docs/ROADMAP_V4_EXPERIENCE.md](docs/ROADMAP_V4_EXPERIENCE.md) | ✅ Shipped PR #73 |
| **v5 polish + Phase I depth** | Roadmap v5 plan | 🟡 In progress — polish, Stripe hardening, Coach UX |
| **Member journey phases** | [JOURNEY.md](JOURNEY.md) | I-Day → Commissioned (in-app) |
| **PFT / America G1–G8** | [PLAN.md](PLAN.md) Phase G | ✅ Optional US track; feature-flagged |
| **Launch Phase H** | [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) | ⬜ Blocked on beta + Vercel secrets |
| **Premium Phase I** | [PLAN.md](PLAN.md) | 🟡 Stripe + Coach + Track GPS depth |

---

## Biggest gaps (priority order)

### 1. Phase H — Launch & global access
Vision cannot land until the app is **public and installable**. Blocked on: beta gates, Vercel env, `PRIVATE_MODE=false`, PWA enable, PROTECTION P0.

### 2. Live Super Bundle ops (Phase I1)
Code path: Stripe checkout → webhook → `enrollments` → `usePremium`. Founder: live links, rotate `PRIVATE_ACCESS_SECRET`, verify with `scripts/verify-stripe-enrollment.mjs`.

### 3. Coach premium polish (Phase I2)
Engine + taster gate shipped. Remaining: more plan depth, fatigue signals, marketing copy on locked state.

### 4. i18n body copy Tier 1 (Phase I4)
es Today/Fuel/Active body keys filled in v5; expand after beta traction.

### 5. Premium pillar depth beyond Track GPS (Phase I3)
Mind audio or Move video — next proof points for bundle value.

### 6. PFT track ops (Phase G ops)
Code shipped; production needs: Supabase migrations, `RESEND_API_KEY`, council legal sign-off before MAHA copy.

---

## What we should *not* do yet (vision filter)

- Gate core workout logging
- US-only features on global Today hub (keep `/america` optional)
- Native apps before PWA + retention proof
- Full 9-language i18n pre-PMF

---

## Build label

Profile build string should reflect **post-v4** deploys (not `2025.06-unified.45`). Check Vercel production after merge.
