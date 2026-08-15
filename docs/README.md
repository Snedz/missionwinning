# Mission Winning — Documentation Hub

One entry point for **athletes & teachers**, **developers**, and **AI agents**.

---

## For athletes & teachers

User guides in plain language (no code paths):

| Guide | Topic |
|-------|--------|
| [help/INDEX.md](help/INDEX.md) | Full help library index |
| [help/getting-started.md](help/getting-started.md) | Install, I-Day, first workout |
| [help/pillars.md](help/pillars.md) | Train, Fuel, Move, Mind, Track, Learn |
| [help/mission-coach.md](help/mission-coach.md) | Weekly AI coach plan |
| [help/fuel-and-nutrition.md](help/fuel-and-nutrition.md) | Logging, barcode, photo estimate |
| [help/fitness-test-and-school.md](help/fitness-test-and-school.md) | PFT, class codes, teacher PIN |
| [help/pt-safety.md](help/pt-safety.md) | Hard sessions — stop is allowed; not medical care |
| [help/pregnancy-safety.md](help/pregnancy-safety.md) | Pregnancy / miscarriage / postpartum — not medical care |
| [help/premium-and-billing.md](help/premium-and-billing.md) | Super Bundle, free vs paid |
| [help/privacy-and-data.md](help/privacy-and-data.md) | Your data, backup, youth consent |
| [help/faq.md](help/faq.md) | Common questions |
| [help/troubleshooting.md](help/troubleshooting.md) | Offline, sync, gate password |

*English only today; in-app `/help` routes may render these later.*

---

## For developers & agents

| Doc | Purpose |
|-----|---------|
| [../ORCHESTRATION.md](../ORCHESTRATION.md) | Long-term horizons, gates, what to build next |
| [GRAPH_LOOP.md](GRAPH_LOOP.md) | Agent graph execution queue — one concern per loop |
| [GAUNTLET_LOOP.md](GAUNTLET_LOOP.md) | Grading protocol — builder never grades itself |
| [PRODUCTION_STACK.md](PRODUCTION_STACK.md) | 13-layer production scorecard (ops maturity) |
| [CACHE_LADDER.md](CACHE_LADDER.md) | Browser / CDN / Redis / Postgres — ideal vs MW |
| [BACKUP_RESTORE.md](BACKUP_RESTORE.md) | User export + Supabase operator recovery |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Layers, state, request lifecycle |
| [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md) | Site IA chip floorplan — dies, buses, critical path, dual pads |
| [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) | Native mobile umbrella — stack, backbone, UX laws, gates |
| [UX_PLAYBOOK.md](UX_PLAYBOOK.md) | UX operating system — process, standards, problem register |
| [NATIVE_MOBILE.md](NATIVE_MOBILE.md) | Expo prototype (reference only) |
| [ANDROID_NATIVE.md](ANDROID_NATIVE.md) | Android Compose get-started + AI orchestration |
| [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md) | iOS playbook — deferred until Accept B + week-4 + founder gate |
| [API_MOBILE.md](API_MOBILE.md) | `/api/mobile/*` Coach + workouts |
| [API.md](API.md) | All API routes — auth, rate limits, schemas |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Setup, PR workflow, where to put code |
| [OPEN_SOURCE.md](OPEN_SOURCE.md) | AGPL · public flip · operator secrets |
| [CLASSIFICATION.md](CLASSIFICATION.md) · [DUAL_REPO.md](DUAL_REPO.md) · [OPS_LOCAL.md](OPS_LOCAL.md) | Public product vs private mission-ops · local Continuity dashboard |
| [contracts/INDEX.md](contracts/INDEX.md) | Identity · economy · module · AI interop |
| [SECRETS.md](SECRETS.md) | Secrets program · vaults · gitleaks · rotate-on-leak |
| [ENV.md](ENV.md) | Environment variables |
| [../app/INDEX.md](../app/INDEX.md) | Routes and API inventory |
| [../src/lib/INDEX.md](../src/lib/INDEX.md) | Business logic map |
| [../src/hooks/INDEX.md](../src/hooks/INDEX.md) | React hooks |
| [../src/store/INDEX.md](../src/store/INDEX.md) | Zustand workout store |

### Ops & security

| Doc | Purpose |
|-----|---------|
| [BETA_LAUNCH_OPS.md](archive/BETA_LAUNCH_OPS.md) | Founder launch checklist |
| [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md) | Stripe webhooks + premium |
| [OWASP_AUDIT.md](OWASP_AUDIT.md) | Security sweep status |
| [AIKIDO.md](AIKIDO.md) | Aikido Cursor MCP + CRITICAL-deps CI gate |
| [COMPLIANCE.md](COMPLIANCE.md) | Control monitor (SOC2/ISO/HIPAA map-only) |
| [SEO_ANALYTICS.md](SEO_ANALYTICS.md) | PostHog + Search Console |
| [LIGHTHOUSE_BASELINE.md](LIGHTHOUSE_BASELINE.md) | Performance baselines |

### Legal & sourcing

| Doc | Purpose |
|-----|---------|
| [LEGAL_SAFETY.md](LEGAL_SAFETY.md) | AI disclosure, arbitration, DMCA, store data inventory |
| [EXERCISE_AS_MEDICINE.md](EXERCISE_AS_MEDICINE.md) | Evidence thesis + allowed/forbidden mood/SSRI claims |
| [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md) | Six docs before payments |
| [issa-source-map.md](issa-source-map.md) | Guidebook source mapping |
| [guidebook-originality-log.md](guidebook-originality-log.md) | Originality tracking |

---

## For AI agents

1. [../AGENTS.md](../AGENTS.md) — conventions, glossary, commands
2. [../INDEX.md](../INDEX.md) — task → doc routing, stale paths
3. Folder `INDEX.md` for the area you edit
4. [AGENT_RECIPES.md](AGENT_RECIPES.md) — copy-paste task playbooks

### Agent quick paths

| Task | Read first |
|------|------------|
| New feature | `PLAN.md` + relevant `src/*/INDEX.md` |
| New API route | `app/api/INDEX.md` + `docs/API.md` + `src/lib/apiSchemas.ts` |
| Mission Coach | `src/lib/coach/INDEX.md` |
| Journey UX | `JOURNEY.md` + `src/components/journey/INDEX.md` |
| Security change | `PROTECTION.md` + `docs/OWASP_AUDIT.md` |
| Customer copy | `docs/help/` — plain language, no file paths |

---

## Product planning (repo root)

See [../INDEX.md](../INDEX.md) §5 for `PLAN.md`, `LOG.md`, `JOURNEY.md`, `STRATEGY.md`, and the full list.
