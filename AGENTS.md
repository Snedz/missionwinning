# AGENTS.md — Mission Winning

**Read this file first.** Then read [INDEX.md](INDEX.md) before exploring or grepping the repo.

Works in Cursor, Claude Code, Grok, Copilot, and other agents — tool-agnostic conventions.

---

## Start here

1. Read [INDEX.md](INDEX.md) — doc routing, task → file map, stale paths.
2. Read the `INDEX.md` in the folder you are about to edit.
3. Prefer indexed paths over repo-wide grep for planning docs.
4. Do not use old chat plans in `~/.cursor/plans/` as source of truth — use `PLAN.md` and `LOG.md`.

---

## Architecture

| Layer | Path | Role |
|-------|------|------|
| Routes | `app/` | Thin Next.js wrappers; metadata only |
| Pages | `src/page-components/` | Full page UI |
| Components | `src/components/` | Reusable UI by feature |
| Logic | `src/lib/` | Pure business logic, API helpers, scoring |
| State | `src/store/` | Zustand (`workoutStore.ts`) |
| Hooks | `src/hooks/` | Client data/orchestration |
| Data | `src/data/` | Static catalogs (exercises, recipes, guidebook) |
| i18n | `src/i18n/` | Translation strings (`*Locales.ts`) |
| API | `app/api/` | Route handlers (thin; logic in `src/lib/`) |

**Pattern:** `app/(app)/foo/page.tsx` imports `FooPage` from `src/page-components/FooPage.tsx`.

**Tests:** `src/lib/**/*.test.ts` — run with `npm test` (`tsx --test`).

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
