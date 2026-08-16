# AGENTS.md — Mission Winning

**Read [CONTEXT.md](CONTEXT.md) first** (one-screen status + hard rules), then this file, then [INDEX.md](INDEX.md) before exploring or grepping the repo.

Works in Cursor, Claude Code, Grok, Copilot, Gemini, and other agents — tool-agnostic conventions. `CLAUDE.md` / `GEMINI.md` are thin pointers into this same spine.

---

## Start here

1. Read [CONTEXT.md](CONTEXT.md) — current status (`## Now`), trap terms, hard rules.
2. Read [INDEX.md](INDEX.md) — doc routing, task → file map, stale paths.
3. Read [ORCHESTRATION.md](ORCHESTRATION.md) — horizon gates (what is allowed *now* vs post-PMF).
4. Read the `INDEX.md` in the folder you are about to edit.
5. Prefer indexed paths over repo-wide grep for planning docs.
6. Do not use old chat plans as source of truth — use `ORCHESTRATION.md`, `docs/PLAN.md`, and `LOG.md`.
7. Private continuity (diary, strategy full text, Mission Control dashboard): mount `ops/` / mission-ops — [docs/OPS_LOCAL.md](docs/OPS_LOCAL.md). Run `npm run ops:dashboard` locally when available.

**Horizon rule:** **Horizon W (now)** — agents **must** ship Train / Today / Victory / Coach wedge excellence until founder phone sign-off. ≥10 beta is a **public-flip** gate after that — not a build freeze. Refuse new pillars / locales / America / F5 unless the founder explicitly overrides.

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
| **Journey phase** | I-Day → Commissioned UX | `docs/JOURNEY.md`, `missionJourney.ts` — not build phases in `docs/PLAN.md` |
| **Build phase** | Roadmap A–I | `docs/PLAN.md` — not journey "Phase 0–3" |
| **Harness** | Outer agent loop (`/harness`) | `docs/GRAPH_LOOP.md`, `docs/harness/`, `npm run harness`. `/graph` is an alias |
| **Graph** | Two recall systems, not the process | `src/lib/graph/` (`npm run graph:ingest`) · `src/lib/ideaGraph/` + `docs/mechanics/` |

---

## Commands

```bash
npm run dev          # local dev server
npm run typecheck    # tsc --noEmit (tests + app)
npm test             # unit tests (src/lib/**/*.test.ts)
npm run build        # production build
npm run lint         # eslint
npm run gate         # FULL local gate: lint + typecheck + tests + i18n + display-type + token-sync + build + hero e2e
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
- Commit `.hermes/`, `ops/`, or accelerator paste packs — LOCAL/INTERNAL ([docs/CLASSIFICATION.md](docs/CLASSIFICATION.md)).
- Use session plans (`.hermes`, `~/.grok/sessions`, `~/.cursor/plans`) as product truth — use ORCHESTRATION + [docs/contracts/](docs/contracts/INDEX.md) + LOG.

---

## Adding new work

1. **New feature domain (>5 lib files):** Create `src/lib/{domain}/` + `INDEX.md` — follow `src/lib/coach/`.
2. **New route:** Add row to `app/INDEX.md`; thin wrapper in `app/(app)/`, UI in `page-components/`.
3. **New planning doc:** Add to root `INDEX.md` task routing; if superseded, move to `docs/archive/` and mark stale in INDEX.
4. **New agent tool:** Point it at `CONTEXT.md` + `AGENTS.md` + `INDEX.md` via a thin root pointer file (model: `CLAUDE.md`, `GEMINI.md`; Cursor: `.cursor/rules/read-index-first.mdc`). Never duplicate spine content into tool files.

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
| **Which loop runs next** | `npm run harness` — names the row, the route and the recipe; recipe 14. Empty queue + empty harvest → Horizon W path (recipe 15) |
| **Next idea (queue residual thin)** | [docs/IDEA_LOOP.md](docs/IDEA_LOOP.md) — one row per run; recipe 13 |
| **Next graph loop** | [docs/GRAPH_LOOP.md](docs/GRAPH_LOOP.md) — one open loop per PR; recipe 11 |
| **Gauntlet campaign round** | [docs/GAUNTLET_LOOP.md](docs/GAUNTLET_LOOP.md) — LEAD / BUILDER / CRITIC; recipe 12 |

Full playbooks: [docs/AGENT_RECIPES.md](docs/AGENT_RECIPES.md).

---

## Do not grep / open (stale)

See [INDEX.md](INDEX.md) §4. Highlights:

- `src/lib/coachPlan.ts`, `CoachPlanCard.tsx`, `app/api/coach/plan/route.ts` — **deleted**
- `src/locales/` — **deprecated**; use `src/i18n/`
- `~/.cursor/plans/*.plan.md` — session plans, not repo truth
- Empty ghost dirs under `app/about/`, etc. — routes live in `app/(app)/`

---

## Cursor Cloud specific instructions

Durable, non-obvious notes for agents on a VM where the update script (`npm install`) has already run. Standard commands live in §Commands above and in [CLAUDE.md](CLAUDE.md) §4 — use those; this section only records gotchas.

- **Runtime:** this is the web PWA at the repo root (Next.js 16 + Turbopack). It is the only service that must run for end-to-end testing of the wedge (Train / Today / Coach / Fuel). Android (`apps/android`) and the Expo prototype (`apps/mobile`) are separate products with their own toolchains and are not needed for web work.
- **Node 22 is required** but is not pinned by any `.nvmrc`/`engines`; the VM already runs Node 22. `nvm` is present — do not let it silently downgrade the shell to an older default.
- **No env vars are needed to run or test the web app in dev.** `npm run dev` boots with an empty/absent `.env.local`. In dev the private gate is **off** (`isPrivateModeEnabled()` is only true in a production build with `PRIVATE_MODE` unset/true), free-beta is **on** so premium depth is unlocked, and Supabase/Stripe/Redis/LLM all degrade gracefully (localStorage "demo mode", in-memory rate limits, rule-based coach). Add Supabase URL + anon key to `.env.local` only when testing auth/cloud-sync/enrollment flows.
- **Hello-world flow:** `/active` is the free Train logger. From a fresh state I-Day is Begin → Continue (lands `/log`); Today Start opens Train. Log a set by entering weight/reps and clicking **Log set**. No account. No Skip-sign-in step.
- **`npm install` prints a harmless `EBADENGINE` warning** for `lighthouse` (wants Node ≥22.19; only used by the optional `npm run lighthouse-budget`). It does not affect install, dev, test, or build.
- **E2E/gate need Chromium.** `npm run gate`, `npm run e2e:*`, and `npm run a11y` run Playwright, whose browsers are not installed by the update script (`npx playwright install chromium` first). Plain `npm run dev`/`test`/`build`/`lint`/`typecheck` need no browser.
- **Actions minutes red:** merge bar is Cursor-local green — [docs/CI_LOCAL.md](docs/CI_LOCAL.md). `[skip vercel]` on every commit unless the founder asked for a Preview. Do not treat `build-and-test` red as a product fail.

