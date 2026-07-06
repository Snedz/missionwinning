# INDEX.md — Mission Winning map

**Agents: read [AGENTS.md](AGENTS.md) first, then this file, then the folder INDEX for your task area.**

---

## 1. Read order (new agents)

1. [AGENTS.md](AGENTS.md) — conventions, glossary, commands
2. [vision.md](vision.md) — product constitution
3. [PLAN.md](PLAN.md) — **current** build roadmap (phases A–I)
4. [LOG.md](LOG.md) — chronological dev log (newest first)
5. Everything below — only when your task requires it

---

## 2. Task → doc routing

| If you are… | Read first | Do not use as source of truth |
|-------------|------------|-------------------------------|
| Implementing a feature | [PLAN.md](PLAN.md) + relevant `src/*/INDEX.md` | Old chat plans in `~/.cursor/plans/` |
| Launch / deploy | [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md), [ENV.md](ENV.md), [docs/BETA_LAUNCH_OPS.md](docs/BETA_LAUNCH_OPS.md), [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) | [SETUP.md](SETUP.md) (one-time LLC/domain setup) |
| Premium / conversion | [REDTEAM.md](REDTEAM.md), [STRATEGY.md](STRATEGY.md) | — |
| Journey UX (I-Day → Commissioned) | [JOURNEY.md](JOURNEY.md) | Build phases in [PLAN.md](PLAN.md) (different “phase”) |
| UI unification | [UX_UNIFIED_PLAN.md](UX_UNIFIED_PLAN.md) | — |
| Experience build (v4) | [docs/ROADMAP_V4_EXPERIENCE.md](docs/ROADMAP_V4_EXPERIENCE.md) | Old chat plans in `~/.cursor/plans/` |
| SEO / growth analytics | [docs/SEO_ANALYTICS.md](docs/SEO_ANALYTICS.md), [docs/LIGHTHOUSE_BASELINE.md](docs/LIGHTHOUSE_BASELINE.md) | — |
| Stripe + premium | [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md) | — |
| Vision scorecard | [VISION_STATUS.md](VISION_STATUS.md) | — |
| Beta testers | [BETA_INVITE.md](BETA_INVITE.md) | — |
| Security | [PROTECTION.md](PROTECTION.md), [docs/OWASP_AUDIT.md](docs/OWASP_AUDIT.md) | — |
| Vercel deploy | [VERCEL_DEPLOY_CHECKLIST.md](VERCEL_DEPLOY_CHECKLIST.md) | — |
| Pre-launch checklist | [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) | — |
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
| [UX_UNIFIED_PLAN.md](UX_UNIFIED_PLAN.md) | UI unification |
| [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) | Launch checklist |
| [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) | Founder critical path |
| [VERCEL_DEPLOY_CHECKLIST.md](VERCEL_DEPLOY_CHECKLIST.md) | Deploy steps |
| [BETA_INVITE.md](BETA_INVITE.md) | Beta kit |
| [ENV.md](ENV.md) | Environment variables |
| [SETUP.md](SETUP.md) | One-time setup |
| [PROTECTION.md](PROTECTION.md) | Security checklist |
| [VISION_STATUS.md](VISION_STATUS.md) | Vision scorecard |
