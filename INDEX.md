# INDEX.md — Mission Winning map

**Agents: read [AGENTS.md](AGENTS.md) first, then this file, then the folder INDEX for your task area.**

---

## 1. Read order (new agents)

1. [AGENTS.md](AGENTS.md) — conventions, glossary, commands
2. [vision.md](vision.md) — product constitution
3. [ORCHESTRATION.md](ORCHESTRATION.md) — **what to do next** (horizons 0–3, gates, kill criteria)
4. [PLAN.md](PLAN.md) — build phases A–I detail
5. [LOG.md](LOG.md) — chronological dev log (newest first)
6. Everything below — only when your task requires it

---

## 2. Task → doc routing

| If you are… | Read first | Do not use as source of truth |
|-------------|------------|-------------------------------|
| **Deciding what to build next** | [ORCHESTRATION.md](ORCHESTRATION.md) | Old chat plans; infinite feature lists |
| Implementing a feature | [ORCHESTRATION.md](ORCHESTRATION.md) horizon gate + [PLAN.md](PLAN.md) + `src/*/INDEX.md` | Old chat plans in `~/.cursor/plans/` |
| Launch / deploy | [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md), [docs/archive/TRACK_D_GO_LIVE.md](docs/archive/TRACK_D_GO_LIVE.md), [docs/archive/SOFT_LAUNCH_DAY.md](docs/archive/SOFT_LAUNCH_DAY.md), [ENV.md](ENV.md), [docs/archive/BETA_LAUNCH_OPS.md](docs/archive/BETA_LAUNCH_OPS.md), [PRE_LAUNCH_PLAN.md](docs/archive/PRE_LAUNCH_PLAN.md) | [SETUP.md](SETUP.md) (one-time LLC/domain setup) |
| Social / launch posts | [docs/SOCIAL_LAUNCH.md](docs/SOCIAL_LAUNCH.md), [BETA_INVITE.md](BETA_INVITE.md) | — |
| Brand / press / media kit | [docs/brand-guidelines.md](docs/brand-guidelines.md), `/press`, `public/brand/` | — |
| LLC + Stripe | [docs/LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md), [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md), [docs/PRELAUNCH_CAPITAL.md](docs/PRELAUNCH_CAPITAL.md) | Paid ads before week-4; native apps before retention |
| Legal safety (AI / Terms / DMCA / labels) | [docs/LEGAL_SAFETY.md](docs/LEGAL_SAFETY.md), `/privacy`, `/terms`, `/dmca` | Session chat plans as counsel substitute |
| Pay-ready legal (six docs) | [docs/PAY_READY_LEGAL.md](docs/PAY_READY_LEGAL.md), `/refunds`, [docs/legal/](docs/legal/) | Claiming enterprise SLAs on consumer Bundle |
| Mobile / native apps | [docs/ANDROID_NATIVE.md](docs/ANDROID_NATIVE.md), [`apps/android`](apps/android), [apps/android/ARCHITECTURE.md](apps/android/ARCHITECTURE.md) | Expo/TWA as the Android product; starting iOS before Android Phase 1 ([docs/IOS_DEFERRED.md](docs/IOS_DEFERRED.md)) |
| Mobile (Expo prototype) | [docs/NATIVE_MOBILE.md](docs/NATIVE_MOBILE.md), [`apps/mobile`](apps/mobile) | Shipping Expo to Play as the product |
| Mobile (TWA optional) | [docs/TWA_MOBILE_PLAYBOOK.md](docs/TWA_MOBILE_PLAYBOOK.md) | Using TWA instead of Compose native |
| Wearables (Horizon 3) | [docs/WEARABLES.md](docs/WEARABLES.md) | Live OAuth/hubs until retention unlock |
| Premium / conversion | [REDTEAM.md](REDTEAM.md), [STRATEGY.md](STRATEGY.md) | — |
| **YC / product wedge** | [docs/YC_THESIS.md](docs/YC_THESIS.md), [STRATEGY.md](STRATEGY.md) | Pitching “everything app” as the company; [vision.md](vision.md) is constitution, not the YC one-liner |
| **Accelerator apps (Jul–Aug 2026)** | [docs/ACCELERATOR_SPRINT.md](docs/ACCELERATOR_SPRINT.md), [docs/applications/INDEX.md](docs/applications/INDEX.md) | Fabricating traction; Cardano pivot; flipping `PRIVATE_MODE` for demos |
| Journey UX (I-Day → Commissioned) | [JOURNEY.md](JOURNEY.md) | Build phases in [PLAN.md](PLAN.md) (different “phase”) |
| UI unification | [UX_UNIFIED_PLAN.md](docs/archive/UX_UNIFIED_PLAN.md) | — |
| Experience build (v4) | [docs/archive/ROADMAP_V4_EXPERIENCE.md](docs/archive/ROADMAP_V4_EXPERIENCE.md) | Old chat plans in `~/.cursor/plans/` |
| Design research / system | [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), [docs/DESTRUCTIVE_UX.md](docs/DESTRUCTIVE_UX.md) | — |
| SEO / growth analytics | [docs/SEO_ANALYTICS.md](docs/SEO_ANALYTICS.md), [docs/LIGHTHOUSE_BASELINE.md](docs/LIGHTHOUSE_BASELINE.md) | — |
| Stripe + premium | [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md) | — |
| Phantom USDC lifetime | [docs/PHANTOM_USDC_CHECKOUT.md](docs/PHANTOM_USDC_CHECKOUT.md) | — |
| Vision scorecard | [VISION_STATUS.md](VISION_STATUS.md) | — |
| Beta testers | [BETA_INVITE.md](BETA_INVITE.md) | — |
| Security | [PROTECTION.md](PROTECTION.md), [docs/OWASP_AUDIT.md](docs/OWASP_AUDIT.md), [docs/COMPLIANCE.md](docs/COMPLIANCE.md), [docs/AIKIDO.md](docs/AIKIDO.md) | Certification claims / Vanta substitutes as “done” |
| Vercel deploy | [VERCEL_DEPLOY_CHECKLIST.md](VERCEL_DEPLOY_CHECKLIST.md) | — |
| **Production / ops maturity (13 layers)** | [docs/PRODUCTION_STACK.md](docs/PRODUCTION_STACK.md), [docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md), [docs/CACHE_LADDER.md](docs/CACHE_LADDER.md) | Feature roadmaps; claiming all 13 “done” |
| Pre-launch checklist | [PRE_LAUNCH_PLAN.md](docs/archive/PRE_LAUNCH_PLAN.md) | — |
| Post-launch cadence | [docs/POST_LAUNCH_CADENCE.md](docs/POST_LAUNCH_CADENCE.md) | — |
| **User help** | [docs/help/INDEX.md](docs/help/INDEX.md) | — |
| **Architecture** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | — |
| **API reference** | [docs/API.md](docs/API.md), [app/api/INDEX.md](app/api/INDEX.md) | — |
| **Contributing** | [CONTRIBUTING.md](CONTRIBUTING.md) | — |
| **Doc hub (all audiences)** | [docs/README.md](docs/README.md) | — |

**Phase naming trap:** Journey “Phase 0–3” ([JOURNEY.md](JOURNEY.md)) ≠ build phases A–I ([PLAN.md](PLAN.md)) ≠ PFT sub-phases G1–G8.

---

## 3. Code area index

| Area | INDEX | One concern |
|------|-------|-------------|
| Routes & API | [app/INDEX.md](app/INDEX.md) | Next.js pages and API handlers |
| Business logic | [src/lib/INDEX.md](src/lib/INDEX.md) | Pure TS domain code |
| Mission Coach engine | [src/lib/coach/INDEX.md](src/lib/coach/INDEX.md) | Weekly plan prediction |
| Shared pure TS (web + native) | [packages/mw-core/INDEX.md](packages/mw-core/INDEX.md) | adaptSummary, seed plan, victory |
| Native Expo app | [apps/mobile/INDEX.md](apps/mobile/INDEX.md) | Flow prototype only (not Play product) |
| Android Compose app | [apps/android/INDEX.md](apps/android/INDEX.md) | Play product path — Train + Coach |
| Fuel Coach engine | [src/lib/fuelCoach/INDEX.md](src/lib/fuelCoach/INDEX.md) | Adaptive meal plan |
| Full-page UI | [src/page-components/INDEX.md](src/page-components/INDEX.md) | Page components |
| Reusable UI | [src/components/INDEX.md](src/components/INDEX.md) | Feature components |
| Translations | [src/i18n/INDEX.md](src/i18n/INDEX.md) | Locale strings |
| Static content | [src/data/INDEX.md](src/data/INDEX.md) | Exercises, recipes, guidebook |
| Database | [supabase/INDEX.md](supabase/INDEX.md) | Migrations & schema |
| Scripts | [scripts/INDEX.md](scripts/INDEX.md) | Dev/deploy automation |
| Hooks | [src/hooks/INDEX.md](src/hooks/INDEX.md) | Client data orchestration |
| State | [src/store/INDEX.md](src/store/INDEX.md) | Zustand workout store |
| API handlers | [app/api/INDEX.md](app/api/INDEX.md) | Route inventory + auth |
| Reference docs | [docs/INDEX.md](docs/INDEX.md) | Help, architecture, ops, legal |

---

## 4. Stale / deleted / do not open

| Path | Status |
|------|--------|
| `src/lib/coachPlan.ts` | **Deleted** — use `src/lib/coach/` |
| `src/components/metrics/CoachPlanCard.tsx` | **Deleted** — use `src/components/coach/` |
| `app/api/coach/plan/route.ts` | **Deleted** — use client `src/lib/coach/` + `/api/coach/plan-voice` |
| `src/locales/` | **Deprecated** — use `src/i18n/` |
| `app/about/`, `app/vision/`, etc. (empty) | **Removed** — routes live in `app/(app)/` |
| `~/.cursor/plans/*.plan.md` | Session plans — not repo truth |

---

## 5. Root planning docs (full list)

| File | Purpose |
|------|---------|
| [vision.md](vision.md) | Constitution |
| [STRATEGY.md](STRATEGY.md) | Business plan |
| [REDTEAM.md](REDTEAM.md) | Assumptions audit |
| [PLAN.md](PLAN.md) | Build roadmap |
| [LOG.md](LOG.md) | Dev log |
| [JOURNEY.md](JOURNEY.md) | Mission journey UX |
| [UX_UNIFIED_PLAN.md](docs/archive/UX_UNIFIED_PLAN.md) | UI unification |
| [PRE_LAUNCH_PLAN.md](docs/archive/PRE_LAUNCH_PLAN.md) | Launch checklist |
| [docs/SOCIAL_LAUNCH.md](docs/SOCIAL_LAUNCH.md) | Social + launch post kit |
| [docs/LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md) | LLC → Stripe · trademark · counsel |
| [docs/archive/SOFT_LAUNCH_DAY.md](docs/archive/SOFT_LAUNCH_DAY.md) | Public flip day |
| [docs/TWA_MOBILE_PLAYBOOK.md](docs/TWA_MOBILE_PLAYBOOK.md) | Deferred Play/iOS shells |
| [docs/WEARABLES.md](docs/WEARABLES.md) | Multi-vendor wearables (Apple, Google, Whoop, …) |
| [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) | Founder critical path |
| [VERCEL_DEPLOY_CHECKLIST.md](VERCEL_DEPLOY_CHECKLIST.md) | Deploy steps |
| [BETA_INVITE.md](BETA_INVITE.md) | Beta kit |
| [docs/issa-source-map.md](docs/issa-source-map.md) | ISSA topic map → guidebook |
| Magazine PDF | `public/magazine/beyond-the-basics.pdf` · print source `/guide/print` |
| [ENV.md](ENV.md) | Environment variables |
| [SETUP.md](SETUP.md) | One-time setup |
| [PROTECTION.md](PROTECTION.md) | Security checklist |
| [docs/COMPLIANCE.md](docs/COMPLIANCE.md) | SOC2/ISO/HIPAA map-only control monitor (not a certification) |
| [VISION_STATUS.md](VISION_STATUS.md) | Vision scorecard |
