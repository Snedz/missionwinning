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
7. Private continuity (diary, strategy full text, Mission Control dashboard): mount `ops/` / mission-ops — [docs/OPS_LOCAL.md](docs/OPS_LOCAL.md). Run `npm run ops:dashboard` locally when available. Competitive product names and store stills live only in `ops/intel/`. Do not write them in this repo.

**Horizon rule:** **Horizon 0 (now)** — RESULT is pass. Release is **Alpha 0.1.0**. Offer is free tracker or Super Bundle. Agents take Horizon 0 path tickets (keep CI green, Alpha chrome, flip-prep). Wedge excellence still required. Postal is later. There is no 10-invite beta. Refuse new pillars / locales / America / F5 unless the founder explicitly overrides.

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
npm run verify       # MERGE GATE: typecheck + lint + test + build + /api/health smoke → PASS/FAIL
npm run verify:fast  # same minus build/health (inner loop only)
npm run gate         # FULL local gate: lint + typecheck + tests + i18n + display-type + token-sync + build + hero e2e
npm run e2e          # Playwright smoke (needs SMOKE_BASE_URL)
npm run gate-smoke   # curl deploy checks (needs SMOKE_BASE_URL)
npm run check-env    # verify .env.local
```

---

## Verify before "done"

Every agent change must end with `npm run verify` exiting 0, and the PR body must paste the `verify summary` block.
- What "done" means: [docs/agents/DONE_CONTRACT.md](docs/agents/DONE_CONTRACT.md)
- Adding or pruning tests: [docs/agents/TEST_AUDIT.md](docs/agents/TEST_AUDIT.md)
- A red step is a stop, not a retry loop: after 3 failed attempts, stop and name the blocker.

### `npm run gate` — 22 steps, in order

`scripts/gate.mjs` runs everything CI would, on your machine, and builds with `PRIVATE_MODE=false` so the service worker compiles (the offline spec needs one). It starts and stops its own production server.

1. Port unoccupied · 2. Build label + hard rule 5 · 3. **Excellence gate** · 4. **Competitor names** (ops denylist; no-op if unmounted) · 5. **Idea graph**
6. Lint · 7. Typecheck · 8. Unit tests · 9. Route contract tests · 10. **Coverage floors**
11. i18n parity · 12. i18n coverage · 13. Dependency advisories · 14. Design system · 15. Locale split
16. Display type · 17. Token sync (web ↔ www ↔ Android) · 18. **WWW build + checks (sites/www)** · 19. Production build · 20. Bundle budget
21. Hero e2e (`@gate`) · 22. Accessibility (`@a11y`)

> This list said **16 steps** until `.562`, and omitted **Coverage floors** entirely — the one ratchet that had been silently breached on `master` since `.544`. The port guard was missing too. **`.669` added Excellence gate** (Horizon W RESULT + surface stop-rule). A map of the gate that cannot see a step is how the step stops being run; `scripts/gate.mjs` numbers every step it executes, so the count is checkable against a single `npm run gate` run.

Not covered: `npm run e2e:visual` (needs deliberate Linux baselines) and Lighthouse (needs Chrome).

### Enforced engineering rules

| Rule | Enforced by |
|------|-------------|
| **Never call `localStorage` directly** — use `@/lib/storage/safeStorage`; a bare call throws in Safari private mode and can blank the page | `eslint.config.js` (`no-restricted-globals`, error) |
| **Never derive a calendar date from `toISOString()`** — use `localDateKey` / `previousLocalDateKey` in `src/lib/time/localDate.ts` | unit guard; the defect shipped a wrong shared week east of UTC |
| **Every cloud write rides the durable outbox** (`src/lib/sync/outbox.ts`) — no raw `void fetch(...).catch(() => {})` | `sync/` guards; a one-shot fetch loses a tester's data on gym wifi |
| **One definition per domain rule** — no second private copy of a predicate | `src/lib/launchTruth.test.ts` |
| **The planner is blind to standing** — nothing under `src/lib/coach/` or `packages/mw-core/src/` may reach rewards/leaderboard/social, transitively, by static or dynamic import. The logging path may **emit** through a declared door symbol and must discard the result; it may never read back | `src/lib/domainBoundary.test.ts` (C1–C3, C7) + `reentryTone.ts` `club-identity` (C4) — the week is planned from logs alone, so social comparison is an input-integrity attack, not a tone problem ([docs/IDENTITY_SOCIAL_PLAN.md](docs/IDENTITY_SOCIAL_PLAN.md)) |
| **Design tokens only** — paper/ink, radius 0, Archivo, light-only; red is exactly three tokens (`--accent-poster` fills/chrome · `--primary-fill` button fills · `--primary` small text) | `check-design-system` (strips comments first, by design) + `check-token-sync` (pins web ↔ Android Kotlin) |
| **No off-palette hex, raw border-radius, glow/elevation or second typeface in components** | `check-design-system` |
| **Strings live in `src/i18n/*Locales.ts`** — never `src/locales/`, never a key that exists in no pack | `i18n:parity` (packs vs packs) + `i18n:coverage` (opens `.tsx`) |
| **Locale packs stay split to the English schema**; nothing on the root-layout path may value-import locale bodies | `check-locale-split` + `bundle-budget` |
| **Initial gzipped JS only ratchets down**, measured off prerendered HTML | `scripts/bundle-budget.mjs` |
| **Display type** — no `text-*` utility nullifying a `.display-*` clamp | `check-display-type` |
| **Every idea-graph constraint has a live enforcer** — an `X-` node names a file and an anchor string that must both still exist, so a rule cannot go on being cited after the test that enforced it was renamed away. Mechanics are recorded as a closed set of behavioural primitives, never as prose, so a feature cannot be filed as a mechanic | `idea:validate` ([docs/IDEA_LOOP.md](docs/IDEA_LOOP.md)) — prose diversity rules were tried first and failed sixteen queue rows in a row |
| **Every migration is written into the runbook** | `src/lib/migrationLedger.test.ts` |
| **`CONTEXT.md` `## Now` stays ≤25 bullets and keeps stating the governing facts** | `src/lib/contextBudget.test.ts` (`MUST_STATE`) |

Guard authoring and falsification: [docs/agents/TEST_AUDIT.md](docs/agents/TEST_AUDIT.md). In API handlers use rate limit → auth → Zod → delegate; keep the verified-user entitlement decision in `premiumServer.ts` and return opaque database errors to clients. `proxy.ts` checks the surface flag before the private gate.

Every ship touching `src`, `app`, `scripts`, or `supabase` bumps `APP_BUILD_LABEL` in `src/lib/buildInfo.ts` past the base branch and updates `LOG.md` and `CONTEXT.md` `## Now` in the same commit. Keep at most 15 live LOG entries and 25 Now bullets. Never use the Vercel skip tag (`[skip vercel]`) in a commit or squash message: it cancels the Production deploy.

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
| **Which loop runs next** | `npm run harness` — names the row, the route and the recipe; recipe 14. Surface hops walk the six-stage pipeline in ORCHESTRATION (research → plan → daily → tests → complex-if-stuck → Fable 5). Empty queue + empty harvest → path (15), then vision gauntlet (`docs/gauntlet/VISION.md`, recipe 12). Start: `/harness` or `/harness 2 hours` |
| **Next idea (queue residual thin)** | [docs/IDEA_LOOP.md](docs/IDEA_LOOP.md) — one row per run; recipe 13 |
| **Next graph loop** | [docs/GRAPH_LOOP.md](docs/GRAPH_LOOP.md) — one open loop per PR; recipe 11 |
| **Gauntlet campaign round** | [docs/GAUNTLET_LOOP.md](docs/GAUNTLET_LOOP.md) — LEAD / BUILDER / CRITIC; recipe 12 |
| **Competitor names** | `npm run names:check` when `ops/` is mounted. Named intel only in `ops/intel/`. |
| **Nightly code cleanup** | Recipe 18 in [docs/AGENT_RECIPES.md](docs/AGENT_RECIPES.md). One concern per PR; never delete `firstSetUngated.ts` ledger comments; never collapse mission-os CapResult files; never split Train/Today UI or `workoutStore` overnight |

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

Durable, non-obvious notes for agents on a VM where the update script (`npm install`) has already run. Standard commands live in [§Commands](#commands) above — use those; this section only records gotchas.

- **Runtime:** this is the web PWA at the repo root (Next.js 16). Android (`apps/android`) has a separate toolchain and is not needed for web tests.
- **Node 22 is required.** Use Node 22.19+ for the optional Lighthouse budget.
- **No env vars are needed to run or test the web app in dev.** `npm run dev` boots with an empty/absent `.env.local`. In dev the private gate is **off** (`isPrivateModeEnabled()` is only true in a production build with `PRIVATE_MODE` unset/true), free-beta is **on** so premium depth is unlocked, and Supabase/Stripe/Redis/LLM all degrade gracefully (localStorage "demo mode", in-memory rate limits, rule-based coach). Add Supabase URL + anon key to `.env.local` only when testing auth/cloud-sync/enrollment flows.
- **Hello-world flow:** `/active` is the free Train logger. From a fresh state I-Day is Begin → Continue (lands `/log`); Today Start opens Train. Log a set by entering weight/reps and clicking **Log set**. No account. No Skip-sign-in step.
- **E2E/gate need Chromium.** `npm run gate`, `npm run e2e:*`, and `npm run a11y` run Playwright, whose browsers are not installed by the update script (`npx playwright install chromium` first). Plain `npm run dev`/`test`/`build`/`lint`/`typecheck` need no browser.
- **CI availability:** See [CONTEXT.md](CONTEXT.md) and [docs/CI_LOCAL.md](docs/CI_LOCAL.md).


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
