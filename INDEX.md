# INDEX.md — Mission Winning map

**Agents: read [CONTEXT.md](CONTEXT.md) first (boot file), then [AGENTS.md](AGENTS.md), then this file, then the folder INDEX for your task area.**

---

## 1. Read order (new agents)

0. [CONTEXT.md](CONTEXT.md) — **boot file**: current status (`## Now`), trap terms, hard rules
1. [AGENTS.md](AGENTS.md) — conventions, glossary, commands
2. [vision.md](vision.md) — product constitution
3. [ORCHESTRATION.md](ORCHESTRATION.md) — **what to do next** (horizons 0–3, gates, kill criteria)
4. [docs/PLAN.md](docs/PLAN.md) — build phases A–I detail
5. [LOG.md](LOG.md) — chronological dev log (newest first; older entries in `docs/archive/log/`)
6. Everything below — only when your task requires it

---

## 2. Task → doc routing

| If you are… | Read first | Do not use as source of truth |
|-------------|------------|-------------------------------|
| **Deciding what to build next** | [ORCHESTRATION.md](ORCHESTRATION.md) | Old chat plans; infinite feature lists |
| Implementing a feature | [ORCHESTRATION.md](ORCHESTRATION.md) horizon gate + [docs/PLAN.md](docs/PLAN.md) + `src/*/INDEX.md` | Old chat plans in `~/.cursor/plans/` |
| Launch / deploy | **[docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) — the single source**, then [docs/ENV.md](docs/ENV.md) for what each var means | Everything in `docs/archive/` (`SOFT_LAUNCH_DAY`, `BETA_LAUNCH_OPS`, `PRE_LAUNCH_PLAN`, `LAUNCH_READY`, `TRACK_D_GO_LIVE`, `SETUP`) — all **superseded 2026-07-19** and all still contradicting the runbook |
| Phone dogfood notes (founder) | **[docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) §3a** — template + poke list; paste friction to agents before inventing ships | Chat-only “test it” without written notes |
| Social / launch posts | [docs/SOCIAL_LAUNCH.md](docs/SOCIAL_LAUNCH.md), [docs/BETA_INVITE.md](docs/BETA_INVITE.md) | — |
| Brand / press / media kit | [docs/brand-guidelines.md](docs/brand-guidelines.md), `/press`, `public/brand/` | — |
| **Brand mascot (Scout)** | [docs/MASCOT.md](docs/MASCOT.md), `public/brand/mascot/`, [media/FLOW_PROMPTS.md](media/FLOW_PROMPTS.md) § Mascot | Duo-style guilt retention; mascot spam on Train logger; replacing MW monogram |
| **Product imagery / form diagrams / Learn art** | [docs/MEDIA_SYSTEM.md](docs/MEDIA_SYSTEM.md), [media/FLOW_PROMPTS.md](media/FLOW_PROMPTS.md), [`media/manifest.json`](media/manifest.json), `public/form-guides/`, `public/learn/`, `public/art/` | Runtime image-gen APIs; photoreal form photos as Train default |
| **Exercise as medicine / mood evidence claims** | [docs/EXERCISE_AS_MEDICINE.md](docs/EXERCISE_AS_MEDICINE.md), [docs/LEGAL_SAFETY.md](docs/LEGAL_SAFETY.md), [docs/brand-guidelines.md](docs/brand-guidelines.md) | Inventing 92%/SSRI stats; leading the landing hero with clinical depression; claiming MW treats depression |
| Book / guidebook (Beyond the Basics) | [docs/STRATEGY.md](docs/STRATEGY.md) § book, [docs/guidebook-originality-log.md](docs/guidebook-originality-log.md), `src/data/guidebook/` | Verbatim ISSA text (originality log is mandatory) |
| LLC + Stripe | [docs/LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md) (incl. §1d pre-EIN individual Stripe), [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md), [docs/PRELAUNCH_CAPITAL.md](docs/PRELAUNCH_CAPITAL.md) | Waiting for LLC before any charges; paid ads before week-4 |
| Crypto / stablecoin strategy | [docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md), [docs/PHANTOM_USDC_CHECKOUT.md](docs/PHANTOM_USDC_CHECKOUT.md) | Pitching MW as a crypto company; new chains/SKUs in Horizon 0 |
| Pre-revenue entity + take-a-dollar gate | [docs/PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md), [docs/legal/ENTITY_RESEARCH.md](docs/legal/ENTITY_RESEARCH.md), [docs/legal/OPERATING_AGREEMENT_DRAFT.md](docs/legal/OPERATING_AGREEMENT_DRAFT.md) | [docs/archive/SETUP.md](docs/archive/SETUP.md) payments section (stale PayPal-first); filing without counsel |
| Stripe dispute shield | [docs/STRIPE_DISPUTE_OPS.md](docs/STRIPE_DISPUTE_OPS.md), [docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md](docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md) | Auto-fighting chargebacks; Radar for Platforms (not Connect) |
| Legal safety (AI / Terms / DMCA / labels) | [docs/LEGAL_SAFETY.md](docs/LEGAL_SAFETY.md), `/privacy`, `/terms`, `/dmca` | Session chat plans as counsel substitute |
| **Counsel engagement pack** | [docs/legal/COUNSEL_BRIEF.md](docs/legal/COUNSEL_BRIEF.md), [docs/legal/exports/](docs/legal/exports/) (frozen EN legal text) | Agents inventing formation state / postal; marking DMCA filed without founder |
| Pay-ready legal (six docs) | [docs/PAY_READY_LEGAL.md](docs/PAY_READY_LEGAL.md), `/refunds`, [docs/legal/](docs/legal/) | Claiming enterprise SLAs on consumer Bundle |
| Mobile / native apps | [docs/MOBILE_PLAYBOOK.md](docs/MOBILE_PLAYBOOK.md), [docs/ANDROID_NATIVE.md](docs/ANDROID_NATIVE.md), [`apps/android`](apps/android), [apps/android/ARCHITECTURE.md](apps/android/ARCHITECTURE.md) | Expo/TWA as the Android product; starting iOS before Android Phase 1 ([docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md)) |
| UX process / design standards | [docs/UX_PLAYBOOK.md](docs/UX_PLAYBOOK.md) + [docs/DESIGN_ORCHESTRATION.md](docs/DESIGN_ORCHESTRATION.md) | Projects with no problem-register entry; hi-fi mockups outside code |
| Mobile (Expo prototype) | [docs/NATIVE_MOBILE.md](docs/NATIVE_MOBILE.md), [`apps/mobile`](apps/mobile) | Shipping Expo to Play as the product |
| Mobile (TWA optional) | [docs/TWA_MOBILE_PLAYBOOK.md](docs/TWA_MOBILE_PLAYBOOK.md) | Using TWA instead of Compose native |
| Wearables (Horizon 3) | [docs/WEARABLES.md](docs/WEARABLES.md) | Live OAuth/hubs until retention unlock |
| Premium / conversion | [docs/REDTEAM.md](docs/REDTEAM.md), [docs/STRATEGY.md](docs/STRATEGY.md) | — |
| **YC / product wedge** | [docs/YC_THESIS.md](docs/YC_THESIS.md), [docs/STRATEGY.md](docs/STRATEGY.md) | Pitching “everything app” as the company; [vision.md](vision.md) is constitution, not the YC one-liner |
| **Accelerator apps (Jul–Aug 2026)** | [docs/ACCELERATOR_SPRINT.md](docs/ACCELERATOR_SPRINT.md); paste answers local-only — [docs/applications/README.md](docs/applications/README.md) | Fabricating traction; Cardano pivot; flipping `PRIVATE_MODE` for demos; committing paste packs |
| Journey UX (I-Day → Commissioned) | [docs/JOURNEY.md](docs/JOURNEY.md) | Build phases in [docs/PLAN.md](docs/PLAN.md) (different “phase”) |
| **Site flow / IA (chip floorplan)** | [docs/FLOW_ARCHITECTURE.md](docs/FLOW_ARCHITECTURE.md) — dies, buses, critical path, dual pads | Landing redesigns; “everything hub”; conflating `/coach` with `/coaching` |
| UI unification | [UX_UNIFIED_PLAN.md](docs/archive/UX_UNIFIED_PLAN.md) | — |
| Experience build (v4) | [docs/archive/ROADMAP_V4_EXPERIENCE.md](docs/archive/ROADMAP_V4_EXPERIENCE.md) | Old chat plans in `~/.cursor/plans/` |
| Design research / system | [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), [docs/DESTRUCTIVE_UX.md](docs/DESTRUCTIVE_UX.md) | — |
| **UI excellence / brand program** | [docs/DESIGN_ORCHESTRATION.md](docs/DESIGN_ORCHESTRATION.md) (craft waves D0–D3) + [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) + [docs/ADAPTIVE_LAYOUT.md](docs/ADAPTIVE_LAYOUT.md) + [apps/android/UX.md](apps/android/UX.md) | Landing teardown / new pillars in Horizon 0; old chat plans |
| **Free-first beta (LLC wait)** | [docs/FREE_BETA.md](docs/FREE_BETA.md) + [docs/LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md) §1d | Showing Bundle/checkout while FREE_BETA on |
| **Return loop for anonymous athletes** | [docs/RETURN_LOOP_PLAN.md](docs/RETURN_LOOP_PLAN.md) + [src/lib/reentry.ts](src/lib/reentry.ts) | Account-gated push/nudges as the retention answer; streak-loss copy |
| UI/UX audit (hero flows) | [docs/DESIGN_REVIEW.md](docs/DESIGN_REVIEW.md) | Landing redesigns while beta gates red |
| SEO / growth analytics | [docs/SEO_ANALYTICS.md](docs/SEO_ANALYTICS.md), [docs/LIGHTHOUSE_BASELINE.md](docs/LIGHTHOUSE_BASELINE.md) | — |
| Stripe + premium | [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md) | — |
| Phantom USDC lifetime | [docs/PHANTOM_USDC_CHECKOUT.md](docs/PHANTOM_USDC_CHECKOUT.md) | — |
| Crypto rails (strategy) | [docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md) | — |
| Vision scorecard | [docs/VISION_STATUS.md](docs/VISION_STATUS.md) | — |
| Beta testers | [docs/BETA_INVITE.md](docs/BETA_INVITE.md) | — |
| Security | [docs/PROTECTION.md](docs/PROTECTION.md), [docs/OWASP_AUDIT.md](docs/OWASP_AUDIT.md), [docs/COMPLIANCE.md](docs/COMPLIANCE.md), [docs/AIKIDO.md](docs/AIKIDO.md) | Certification claims / Vanta substitutes as “done” |
| Vercel deploy | [docs/VERCEL_DEPLOY_CHECKLIST.md](docs/VERCEL_DEPLOY_CHECKLIST.md) | — |
| **Open source** | [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md), [LICENSE](LICENSE), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [CONTRIBUTING.md](CONTRIBUTING.md) | Flipping `PRIVATE_MODE`; inventing a new license |
| **Secrets / keys** | [docs/SECRETS.md](docs/SECRETS.md), [docs/ENV.md](docs/ENV.md), [SECURITY.md](SECURITY.md) | Committing `.env.local`; pasting live keys into docs |
| **Production / ops maturity (13 layers)** | [docs/PRODUCTION_STACK.md](docs/PRODUCTION_STACK.md), [docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md), [docs/CACHE_LADDER.md](docs/CACHE_LADDER.md) | Feature roadmaps; claiming all 13 “done” |
| Pre-launch checklist | [docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) | `docs/archive/PRE_LAUNCH_PLAN.md` — **superseded 2026-07-19**, was routed here until `.170` |
| Post-launch cadence | [docs/POST_LAUNCH_CADENCE.md](docs/POST_LAUNCH_CADENCE.md) | — |
| **User help** | [docs/help/INDEX.md](docs/help/INDEX.md) | — |
| **Architecture** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | — |
| **API reference** | [docs/API.md](docs/API.md), [app/api/INDEX.md](app/api/INDEX.md) | — |
| **Contributing** | [CONTRIBUTING.md](CONTRIBUTING.md) | — |
| **Doc hub (all audiences)** | [docs/README.md](docs/README.md) | — |

**Phase naming trap:** Journey “Phase 0–3” ([docs/JOURNEY.md](docs/JOURNEY.md)) ≠ build phases A–I ([docs/PLAN.md](docs/PLAN.md)) ≠ PFT sub-phases G1–G8 ≠ Android horizons A–F ([docs/ANDROID_NATIVE.md](docs/ANDROID_NATIVE.md)). Mobile work uses named gates (Accept B · week-4 · iOS lane open), not new numbers.

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
| Root `STRATEGY.md` / `PLAN.md` / `REDTEAM.md` / `JOURNEY.md` / `LAUNCH_RUNBOOK.md` / `ENV.md` / `PROTECTION.md` / `BETA_INVITE.md` / `VISION_STATUS.md` / `VERCEL_DEPLOY_CHECKLIST.md` | **Moved 2026-07-21** → same name under `docs/` |
| Root `ACCEPTABLE_USE.md` | **Moved** → `docs/legal/ACCEPTABLE_USE.md` |
| Root `SETUP.md` | **Archived** (stale PayPal-first) → `docs/archive/SETUP.md` |
| `docs/IOS_DEFERRED.md` | **Renamed** → `docs/IOS_PLAYBOOK.md` |

---

## 5. Planning docs (root spine + docs/)

Root keeps only the spine: README · CONTEXT · AGENTS · INDEX · vision · ORCHESTRATION · LOG · CONTRIBUTING · SECURITY (+ CLAUDE/GEMINI tool pointers). Everything else lives under `docs/`.

| File | Purpose |
|------|---------|
| [vision.md](vision.md) | Constitution |
| [docs/STRATEGY.md](docs/STRATEGY.md) | Business plan |
| [docs/REDTEAM.md](docs/REDTEAM.md) | Assumptions audit |
| [docs/PLAN.md](docs/PLAN.md) | Build roadmap |
| [LOG.md](LOG.md) | Dev log |
| [docs/JOURNEY.md](docs/JOURNEY.md) | Mission journey UX |
| [UX_UNIFIED_PLAN.md](docs/archive/UX_UNIFIED_PLAN.md) | UI unification |
| [PRE_LAUNCH_PLAN.md](docs/archive/PRE_LAUNCH_PLAN.md) | Launch checklist |
| [docs/SOCIAL_LAUNCH.md](docs/SOCIAL_LAUNCH.md) | Social + launch post kit |
| [docs/LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md) | LLC → Stripe · §1d pre-EIN interim · trademark · counsel |
| [docs/PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md) | Take-a-dollar gate · interim sole-prop · dispute shield |
| [docs/STRIPE_DISPUTE_OPS.md](docs/STRIPE_DISPUTE_OPS.md) | Chargeback alerts · Radar · thresholds |
| [docs/archive/SOFT_LAUNCH_DAY.md](docs/archive/SOFT_LAUNCH_DAY.md) | Public flip day |
| [docs/MOBILE_PLAYBOOK.md](docs/MOBILE_PLAYBOOK.md) | Native mobile umbrella (stack · process · UX laws) |
| [docs/UX_PLAYBOOK.md](docs/UX_PLAYBOOK.md) | UX operating system (problem register · standards · research ops) |
| [docs/TWA_MOBILE_PLAYBOOK.md](docs/TWA_MOBILE_PLAYBOOK.md) | Optional web-PWA Play packaging (iOS shell superseded) |
| [docs/WEARABLES.md](docs/WEARABLES.md) | Multi-vendor wearables (Apple, Google, Whoop, …) |
| [docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) | Founder critical path |
| [docs/VERCEL_DEPLOY_CHECKLIST.md](docs/VERCEL_DEPLOY_CHECKLIST.md) | Deploy steps |
| [docs/BETA_INVITE.md](docs/BETA_INVITE.md) | Beta kit |
| [docs/issa-source-map.md](docs/issa-source-map.md) | ISSA topic map → guidebook |
| Magazine PDF | `public/magazine/beyond-the-basics.pdf` · print source `/guide/print` |
| [docs/ENV.md](docs/ENV.md) | Environment variables |
| [docs/archive/SETUP.md](docs/archive/SETUP.md) | One-time setup — **archived, stale PayPal-first** |
| [docs/PROTECTION.md](docs/PROTECTION.md) | Security checklist |
| [docs/COMPLIANCE.md](docs/COMPLIANCE.md) | SOC2/ISO/HIPAA map-only control monitor (not a certification) |
| [docs/VISION_STATUS.md](docs/VISION_STATUS.md) | Vision scorecard |
