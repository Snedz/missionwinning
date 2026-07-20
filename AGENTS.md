# AGENTS.md — Mission Winning

**Read this file first.** Then read [INDEX.md](INDEX.md) before exploring or grepping the repo.

Works in Cursor, Claude Code, Grok, Copilot, and other agents — tool-agnostic conventions.

---

## Start here

1. Read [INDEX.md](INDEX.md) — doc routing, task → file map, stale paths.
2. Read [ORCHESTRATION.md](ORCHESTRATION.md) — horizon gates (what is allowed *now* vs post-PMF).
3. Read the `INDEX.md` in the folder you are about to edit.
4. Prefer indexed paths over repo-wide grep for planning docs.
5. Do not use old chat plans as source of truth — use `ORCHESTRATION.md`, `PLAN.md`, and `LOG.md`.

**Horizon rule:** In Horizon 0 (pre-public beta), only hero bugs, launch unblock, and CI. Refuse new pillars/locales/redesigns unless the founder explicitly overrides.

---

## Architecture

| Layer | Path | Role |
|-------|------|------|
| Routes | `app/` | Thin Next.js wrappers; metadata only |
| Pages | `src/page-components/` | Full page UI |
| Components | `src/components/` | Reusable UI by feature |
| Logic | `src/lib/` | Pure business logic, API helpers, scoring |
| State | `src/store/` | Zustand — [src/store/INDEX.md](src/store/INDEX.md) |
| Hooks | `src/hooks/` | Client hooks — [src/hooks/INDEX.md](src/hooks/INDEX.md) |
| Data | `src/data/` | Static catalogs (exercises, recipes, guidebook) |
| i18n | `src/i18n/` | Translation strings (`*Locales.ts`) |
| API | `app/api/` | Route handlers — [app/api/INDEX.md](app/api/INDEX.md) |
| Native apps | `apps/android/` | Compose Play product — [docs/ANDROID_NATIVE.md](docs/ANDROID_NATIVE.md) |
| Shared core | `packages/mw-core/` | Pure TS shared by web + mobile API |
| Expo prototype | `apps/mobile/` | Flow reference only — not Play |

**Pattern:** `app/(app)/foo/page.tsx` imports `FooPage` from `src/page-components/FooPage.tsx`.

**Android:** `cd apps/android && ./gradlew :app:assembleDebug` — wedge Train + Coach; keep web PWA for SEO. iOS deferred until Android Phase 1 accepted.

**Tests:** `src/lib/**/*.test.ts` — run with `npm test` (`tsx --test`). Critical UI flows: `npm run e2e:critical` (`tests/e2e/`).

---

## Naming glossary

| Term | Means | Canonical paths |
|------|--------|-----------------|
| **Mission Coach** | AI weekly training plan engine | `src/lib/coach/`, `/coach`, `useCoachPlan`, `CoachPage` |
| **Coaching** | Human 1:1 coaching lead form | `/coaching`, `CoachingPage.tsx` |
| **Daily coach insight** | Today one-liner (LLM or rules) | `coachDailyServer.ts`, `/api/coach/daily-insight`, `CoachInsightCard` |
| **Cross-pillar coach** | Today rule overrides from pillars | `crossPillarCoach.ts` |
| **Today / Home** | Main dashboard | Route `/log`, `HomePage.tsx`, nav label "Today" |
| **Fuel** | Nutrition pillar | Route `/nutrition`, `NutritionPage.tsx`, nav label "Fuel" |
| **Train** | Active workout / logger | Route `/active`, `ActiveWorkoutPage.tsx` |
| **Journey phase** | I-Day → Commissioned UX | `JOURNEY.md`, `missionJourney.ts` — not build phases in `PLAN.md` |
| **Build phase** | Roadmap A–I | `PLAN.md` — not journey "Phase 0–3" |

---

## Commands

```bash
npm run dev          # local dev server
npm run typecheck    # tsc --noEmit (tests + app)
npm test             # unit tests (src/lib/**/*.test.ts)
npm run build        # production build
npm run lint         # eslint
npm run e2e          # Playwright smoke (needs SMOKE_BASE_URL)
npm run gate-smoke   # curl deploy checks (needs SMOKE_BASE_URL)
npm run check-env    # verify .env.local
```

---

## Do not

- Edit deleted placeholders: `src/lib/coachPlan.ts`, `CoachPlanCard.tsx`, `app/api/coach/plan/route.ts` — use `src/lib/coach/` only.
- Treat `.claude/skills/` as app architecture — design/marketing skills only (see `.claude/skills/README.md`).
- Use `src/locales/` — deprecated; runtime i18n is `src/i18n/`.
- Open empty ghost dirs under `app/about/`, etc. — live routes are in `app/(app)/` (see `app/INDEX.md`).

---

## Adding new work

1. **New feature domain (>5 lib files):** Create `src/lib/{domain}/` + `INDEX.md` — follow `src/lib/coach/`.
2. **New route:** Add row to `app/INDEX.md`; thin wrapper in `app/(app)/`, UI in `page-components/`.
3. **New planning doc:** Add to root `INDEX.md` task routing; if superseded, move to `docs/archive/` and mark stale in INDEX.
4. **New agent tool:** Point it at `AGENTS.md` + `INDEX.md` (Cursor: `.cursor/rules/read-index-first.mdc`).

---

## Skills

[`.claude/skills/`](.claude/skills/) — UI/brand/design tooling only. App rules live in this file.

---

## Documentation map

| Audience | Entry |
|----------|--------|
| All | [docs/README.md](docs/README.md) |
| Customers | [docs/help/INDEX.md](docs/help/INDEX.md) |
| Developers | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API.md](docs/API.md), [CONTRIBUTING.md](CONTRIBUTING.md) |
| Agents | This file + [INDEX.md](INDEX.md) + [docs/AGENT_RECIPES.md](docs/AGENT_RECIPES.md) |
| Ops maturity | [docs/PRODUCTION_STACK.md](docs/PRODUCTION_STACK.md), [docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md), [docs/CACHE_LADDER.md](docs/CACHE_LADDER.md) |

When you add or change an API route, update [app/api/INDEX.md](app/api/INDEX.md) and [docs/API.md](docs/API.md).
When you add a feature folder, add or update its `INDEX.md`.

---

## Common tasks (recipes)

| Task | Steps |
|------|--------|
| **New page route** | `app/(app)/foo/page.tsx` → `src/page-components/FooPage.tsx` → row in `app/INDEX.md` |
| **New API route** | `app/api/foo/route.ts` → logic in `src/lib/` → Zod in `apiSchemas.ts` → `app/api/INDEX.md` + `docs/API.md` |
| **New lib domain** | After ~5 files: `src/lib/foo/` + `INDEX.md` (model: `src/lib/coach/`) |
| **New coach rule** | `crossPillarCoach.ts` or `coach/adapt.ts` + colocated `*.test.ts` |
| **New i18n string** | `src/i18n/*Locales.ts` — not `src/locales/` |

Full playbooks: [docs/AGENT_RECIPES.md](docs/AGENT_RECIPES.md).

---

## Do not grep / open (stale)

See [INDEX.md](INDEX.md) §4. Highlights:

- `src/lib/coachPlan.ts`, `CoachPlanCard.tsx`, `app/api/coach/plan/route.ts` — **deleted**
- `src/locales/` — **deprecated**; use `src/i18n/`
- `~/.cursor/plans/*.plan.md` — session plans, not repo truth
- Empty ghost dirs under `app/about/`, etc. — routes live in `app/(app)/`

