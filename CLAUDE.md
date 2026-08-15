# CLAUDE.md

Working contract for Claude Code in this repo: **how the codebase is laid out, how work ships, and which conventions are enforced by code rather than prose.**

One rule governs everything below: **one fact, one home** (`.178`). Nothing here restates a fact another file owns — status, horizon gates and doc routing are *pointed at*, never copied. When this file and the spine disagree, **the spine wins**.

---

## 1. Boot order

1. [CONTEXT.md](CONTEXT.md) — boot file: `## Now` (**the only "where we are" block in the repo**), trap terms, hard rules
2. [AGENTS.md](AGENTS.md) — tool-agnostic contract (conventions · glossary · commands)
3. [INDEX.md](INDEX.md) — task → doc routing; **never open stale paths in §4**
4. [ORCHESTRATION.md](ORCHESTRATION.md) — horizon gates: what may be built *now*
5. The folder `INDEX.md` where you will work

Prefer indexed paths over repo-wide grep for planning docs. Never use old chat plans or `~/.cursor/plans/` as source of truth.

---

## 2. What this is

**Mission Winning** — Next.js 16 PWA + native Android, adaptive AI coaching for train-anywhere athletes. Six pillars (Train · Fuel · Move · Mind · Track · Learn) unified by the Mission Score. Solo founder + AI agents; the founder owns users, money, legal, secrets and `PRIVATE_MODE`, agents own code, tests, perf and docs — inside horizon gates.

Constitution: [vision.md](vision.md). Pitch the **Train + Mission Coach wedge**, never "everything app".

### Naming traps (full glossary: [AGENTS.md](AGENTS.md))

| Term | Means |
|------|-------|
| **Mission Coach** | AI weekly plan engine — `src/lib/coach/`, `/coach` |
| **Coaching** | Human 1:1 lead form — `/coaching`. Different thing. |
| **Today** | Route `/log` (`HomePage.tsx`), nav label "Today" |
| **Train** | Route `/active` — the logger |
| **Fuel** | Route `/nutrition` |
| Journey phase 0–3 | UX arc ([docs/JOURNEY.md](docs/JOURNEY.md)) ≠ build phases A–I ([docs/PLAN.md](docs/PLAN.md)) ≠ PFT G1–G8 |
| Horizon W / 0–3 | What may be built now — [ORCHESTRATION.md](ORCHESTRATION.md) |
| **Graph** | Four different things: `src/lib/graph/` (`npm run graph:ingest`) = memory of *our dev history* · `src/lib/ideaGraph/` + `docs/mechanics/` = the *idea* graph · `docs/GRAPH_LOOP.md` + `src/lib/loopQueue/` (`npm run queue:next`) = the *execution queue* · `/graph` = the machine-local skill that boots that queue from any directory |

---

## 3. Repo layout

| Path | Role |
|------|------|
| `app/` | Next.js App Router — **thin** route shells + metadata. Live app routes are under `app/(app)/`. |
| `app/api/**/route.ts` | HTTP handlers (~70 routes) — thin: rate limit → auth → Zod → delegate |
| `src/page-components/` | Full page UI (53 files); `app/(app)/foo/page.tsx` imports `FooPage` |
| `src/components/` | Reusable UI by feature (~33 folders) |
| `src/lib/` | Pure business logic, scoring, sync, API helpers (~290 modules + domain subfolders) |
| `src/hooks/` · `src/store/` | Client orchestration · Zustand active-workout store |
| `src/data/` | Static catalogs — exercises, recipes, guidebook, programs |
| `src/i18n/` | **The** runtime translation source (`*Locales.ts`). `src/locales/` is deprecated. |
| `packages/mw-core/` | Pure TS shared by web + mobile API (adaptSummary, seed plan, victory) |
| `apps/android/` | Compose Play product — [apps/android/AGENTS.md](apps/android/AGENTS.md) |
| `apps/mobile/` | Expo prototype — **flow reference only, never the Play product** |
| `supabase/` | Migrations + schema |
| `scripts/` | Gate checks, smokes, i18n tooling, deploy automation |
| `tests/e2e/` | Playwright (15 specs) |
| `docs/` | Everything not on the root spine — [docs/INDEX.md](docs/INDEX.md) |
| `seo/` · `media/` · `public/` | Growth research · media pipeline · static assets |

Root keeps only the spine: README · CONTEXT · AGENTS · INDEX · vision · ORCHESTRATION · LOG · CONTRIBUTING · SECURITY, plus the `CLAUDE.md` / `GEMINI.md` tool pointers.

### Where new code goes

```
app/(app)/foo/page.tsx          → thin route + metadata
src/page-components/FooPage.tsx → full page UI
src/components/foo/             → reusable pieces
src/hooks/useFoo.ts             → client orchestration
src/lib/foo.ts | foo/           → pure logic (+ colocated foo.test.ts)
app/api/foo/route.ts            → HTTP handler; logic in src/lib/fooServer.ts
src/i18n/*Locales.ts            → user-visible strings
```

- Past ~5 related lib files → promote to `src/lib/{domain}/` + `INDEX.md` (model: `src/lib/coach/`).
- New route → row in [app/INDEX.md](app/INDEX.md); nav entry in `src/lib/navConfig.ts` if it's a tab.
- New API route → Zod schema in `src/lib/apiSchemas.ts`, then [app/api/INDEX.md](app/api/INDEX.md) **and** [docs/API.md](docs/API.md).
- Edited a folder → update its `INDEX.md` if the file list or concerns changed.

---

## 4. Commands

```bash
npm run dev              # local dev server
npm run queue:next       # which loop runs next + which recipe (reads docs/GRAPH_LOOP.md)
npm run lint             # eslint app src --max-warnings 0
npm run typecheck        # tsc --noEmit (app + tests)
npm test                 # unit tests — tsx --test "src/**/*.test.ts" (~190 files)
npm run test:routes      # route contract tests — *.routetest.ts under react-server
npm run build            # production build (next build --webpack)
npm run gate             # FULL local gate — see below
npm run check-env        # verify .env.local
npm run e2e:critical     # Playwright, everything except @a11y/@visual
npm run gate-smoke       # deploy-perimeter curls (needs SMOKE_BASE_URL)
cd apps/android && ./gradlew :app:assembleDebug
```

Node 22 (CI). PR CI is [.github/workflows/ci.yml](.github/workflows/ci.yml); minutes-heavy jobs (critical e2e, Android, Lighthouse) are manual/weekly in `ci-extended.yml`. A push to `master` runs [.github/workflows/ratchets.yml](.github/workflows/ratchets.yml) — the no-build half of the gate, and the only workflow on that path. **Whether Actions is currently running is recorded in exactly one place — `CONTEXT.md` `## Now`** — do not restate it elsewhere.

### `npm run gate` — 21 steps, in order

`scripts/gate.mjs` runs everything CI would, on your machine, and builds with `PRIVATE_MODE=false` so the service worker compiles (the offline spec needs one). It starts and stops its own production server.

1. Port unoccupied · 2. Build label + hard rule 5 · 3. **Excellence gate** · 4. **Idea graph** · 5. Lint
6. Typecheck · 7. Unit tests · 8. Route contract tests · 9. **Coverage floors** · 10. i18n parity
11. i18n coverage · 12. Dependency advisories · 13. Design system · 14. Locale split · 15. Display type
16. Token sync (web ↔ www ↔ Android) · 17. **WWW build + checks (sites/www)** · 18. Production build · 19. Bundle budget
20. Hero e2e (`@gate`) · 21. Accessibility (`@a11y`)

> This list said **16 steps** until `.562`, and omitted **Coverage floors** entirely — the one ratchet that had been silently breached on `master` since `.544`. The port guard was missing too. **`.669` added Excellence gate** (Horizon W RESULT + surface stop-rule). A map of the gate that cannot see a step is how the step stops being run; `scripts/gate.mjs` numbers every step it executes, so the count is checkable against a single `npm run gate` run.

Not covered: `npm run e2e:visual` (needs deliberate Linux baselines) and Lighthouse (needs Chrome).

---

## 5. Conventions the gate enforces

Each of these exists because the failure already happened once. Breaking one turns the gate red — it is not style advice.

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

**API routes:** rate limit → auth (`supabaseRequestAuth.ts`, `requestAccess.ts`, `betaAdminAuth.ts`) → Zod (`apiSchemas.ts`) → delegate to `src/lib/*Server.ts`. Never return a Postgres `error.message` to the client (free schema map) — opaque code out, detail to the server log. Premium is decided by `premiumServer.ts` against Supabase, **never** by `localStorage`. Long-running cron routes declare `maxDuration`.

**Perimeter:** `proxy.ts` runs surface parking (`isPathEnabled`) before the `PRIVATE_MODE` gate, so a parked API is unreachable regardless of the gate. CSP lives in `next.config.js`.

---

## 6. Testing model

- **Unit** — colocated `foo.test.ts` next to `foo.ts`, run by `tsx --test`. Test real behavior (scoring, auth rules, parsing), not getters.
- **Route contract** — `*.routetest.ts`, run with `--conditions=react-server` so `server-only` resolves to a no-op and handler wiring can be tested, not just pure decisions.
- **E2E** — Playwright, `tests/e2e/`. Tags: `@gate` (hero paths, runs in the gate and PR CI), `@a11y` (axe, ~30 routes), `@visual` (needs Linux-generated baselines). Default project is **mobile-chrome at 390×844**; `desktop-chrome` at 1440×900 runs only `surface-split.spec.ts`, because the desktop app is a *different design*, not this one reflowed.

### How guards are written here

This repo has paid repeatedly for checks that could not fail. Before adding a test, clear these:

- **No vacuous guards.** A name claiming a scope wider than its enumeration is the recurring defect (`for (const file of ['a.ts','b.ts'])` under a name that says "all readers"). **Discover rather than enumerate** — fail on an unreviewed file *and* on a stale allowlist entry.
- **A guard keyed to one spelling of a defect has only ever tested that spelling.** Assert a parsed shape where you can; where only source text is available, enumerate the spellings and say why the list is closed.
- **Falsify it.** Mutate the code so the new test *should* go red, and confirm it does. "N mutants killed" belongs in the LOG entry.
- **Assert preconditions, never skip past them** (`if (kind !== 'strength') return` is a green test that ran nothing).
- **No date literals in fixtures** — a test with a date literal in it is a test with an expiry date.
- **A check that always fails measures as much as one that always passes** — ratchets over binary red.

---

## 7. Ship protocol

**Hard rule 5: every ship updates [LOG.md](LOG.md) + `CONTEXT.md` `## Now` + the build label — in the same commit.**

- Build label is `APP_BUILD_LABEL` in [src/lib/buildInfo.ts](src/lib/buildInfo.ts), format `YYYY.MM-unified.N`. Bump it **past the base branch's** value; `scripts/check-build-label.mjs` verifies that, plus that `LOG.md` carries a heading ending in `` (`.N`) `` and `CONTEXT.md` mentions the full label.
- The check **skips branches that touch no `src|app|scripts|supabase` path** — a docs-only PR does not mint a version.
- Commit / PR titles read `Short prose title (.N) (#PR)`; LOG headings read `## YYYY-MM-DD — Title (`.N`)`.
- `LOG.md` keeps ≤15 entries / ≤20KB — rotate older whole `##` sections to `docs/archive/log/` and list them in [docs/archive/INDEX.md](docs/archive/INDEX.md).
- `## Now` keeps ≤25 bullets — rotate the oldest *shipped* entries to `docs/archive/`, never the standing Status table.
- Branch from `master` (`feat/…`, `fix/…`), one concern per PR, never force-push `master`, never commit `.env.local` or keys (`npm run secrets:scan`).

---

## 8. Hard rules and do-nots

1. **Horizon rule** — build only what [ORCHESTRATION.md](ORCHESTRATION.md) currently allows. No new pillars / locales / America / F5 without an explicit founder override.
2. **The free logger is never gated. Ever.**
3. Agents never flip `PRIVATE_MODE`, never invent traction numbers, never mark founder tasks done.
4. Do not open stale/deleted paths — [INDEX.md](INDEX.md) §4. Highlights: `src/lib/coachPlan.ts`, `CoachPlanCard.tsx`, `app/api/coach/plan/route.ts` (**deleted** — use `src/lib/coach/`); `src/locales/` (**deprecated**); empty ghost dirs under `app/about/` etc. (routes live in `app/(app)/`).
5. Docs match reality — see §7.
6. `.claude/skills/` is **design/marketing/SEO tooling only** — never app architecture ([.claude/skills/README.md](.claude/skills/README.md)).
7. Android lane: `apps/android/**` only; do not rewrite `src/lib/coach/planEngine.ts` from it, do not ship Expo as the product, do not start iOS before Android Phase 1 is accepted.

---

## 9. Docs map

| Need | Entry |
|------|-------|
| Status / gates | [CONTEXT.md](CONTEXT.md) `## Now` |
| What to build next | [ORCHESTRATION.md](ORCHESTRATION.md), [docs/PLAN.md](docs/PLAN.md) |
| Where the next idea comes from | [docs/IDEA_LOOP.md](docs/IDEA_LOOP.md), graph in [docs/mechanics/](docs/mechanics/INDEX.md) |
| Which loop runs next | `npm run queue:next` — [docs/AGENT_RECIPES.md](docs/AGENT_RECIPES.md) §14, router in [src/lib/loopQueue/](src/lib/loopQueue/INDEX.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| API reference | [docs/API.md](docs/API.md), [app/INDEX.md](app/INDEX.md), [app/api/INDEX.md](app/api/INDEX.md) |
| How to add code | [CONTRIBUTING.md](CONTRIBUTING.md), [docs/AGENT_RECIPES.md](docs/AGENT_RECIPES.md) |
| Agent graph memory (dev tooling) | [docs/GRAPH_MEMORY.md](docs/GRAPH_MEMORY.md) — ingest at low effort, traverse at high; not product runtime |
| Launch / deploy | [docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) (single source), [docs/VERCEL_DEPLOY_CHECKLIST.md](docs/VERCEL_DEPLOY_CHECKLIST.md) |
| Env / secrets | [docs/ENV.md](docs/ENV.md), [docs/SECRETS.md](docs/SECRETS.md), [.env.example](.env.example) |
| Security | [docs/PROTECTION.md](docs/PROTECTION.md), [docs/OWASP_AUDIT.md](docs/OWASP_AUDIT.md), [SECURITY.md](SECURITY.md) |
| Design system | [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), [docs/DESIGN_ORCHESTRATION.md](docs/DESIGN_ORCHESTRATION.md) |
| Mobile native (Android + iOS) | [docs/MOBILE_PLAYBOOK.md](docs/MOBILE_PLAYBOOK.md), [docs/ANDROID_NATIVE.md](docs/ANDROID_NATIVE.md), [apps/android/AGENTS.md](apps/android/AGENTS.md) |
| UX process / standards | [docs/UX_PLAYBOOK.md](docs/UX_PLAYBOOK.md) |
| Everything else | [docs/README.md](docs/README.md), [INDEX.md](INDEX.md) §2 |

---

## gstack (machine-local tooling — not repo architecture)

Installed once per machine in your user config, not this repo:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

Requires `bun` (`brew install bun`). Run `/gstack-upgrade` to update.

**Web browsing:** use the **`/browse`** skill for **all** web browsing. **Never use the `mcp__claude-in-chrome__*` tools.**

**Planning & review** — `/office-hours` (YC-style review of an idea or plan) · `/autoplan` (CEO + design + eng + DX reviews back-to-back) · `/plan-ceo-review` · `/plan-eng-review` · `/plan-design-review` · `/plan-devex-review` · `/review` (code review) · `/devex-review` (live DX audit) · `/careful` (destructive-command guardrails)

**Design** — `/design-consultation` (design system with font + color previews) · `/design-shotgun` (variants + comparison board) · `/design-html` (production HTML/CSS) · `/design-review` (visual QA: spacing, hierarchy, AI-slop)

**Browser & QA** — `/browse` · `/connect-chrome` (AI-controlled Chromium + sidebar) · `/qa` (QA and fix) · `/qa-only` (report only) · `/setup-browser-cookies`

**Ship & deploy** — `/ship` (merge base, tests, diff review, VERSION bump, CHANGELOG, push, PR) · `/land-and-deploy` · `/canary` (post-deploy monitoring) · `/benchmark` (perf regressions) · `/setup-deploy`

**Investigate & document** — `/investigate` (root-cause debugging) · `/retro` (weekly retrospective) · `/document-release` · `/document-generate` · `/learn`

**Edit boundaries** — `/freeze` (restrict edits to one directory) · `/guard` (freeze + destructive-command warnings) · `/unfreeze`

**Other** — `/codex` (OpenAI Codex CLI wrapper) · `/cso` (Chief Security Officer mode) · `/setup-gbrain` · `/gstack-upgrade`

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
