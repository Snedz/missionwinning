# CONTEXT.md — boot file (read first, every tool)

One screen of truth for any AI tool or human joining cold. Read this, then [AGENTS.md](AGENTS.md), then [INDEX.md](INDEX.md). Keep `## Now` current: update it on every ship, in the same commit as the [LOG.md](LOG.md) entry.

---

## What this is

**Mission Winning** · www.missionwinning.com · "Train Anywhere. Win Daily."

> Adaptive AI coaching for train-anywhere athletes — free offline logging (no account), weekly plans from logs alone (no wearable). Super Bundle adds Coach depth and the other pillars — it never gates the logger.

- Six pillars — Train · Fuel · Move · Mind · Track · Learn — unified by the Mission Score. Constitution: [vision.md](vision.md). Pitch the **Train + Mission Coach wedge**, never "everything app" ([docs/YC_THESIS.md](docs/YC_THESIS.md)).
- Surfaces: Next.js 16 PWA (repo root) · native Android Compose ([apps/android](apps/android), v1.17.0) · iOS deferred ([docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md)) · "Beyond the Basics" guidebook (`/guide` + magazine PDF).
- Solo founder + AI agents. Founder owns users, money, legal, secrets, `PRIVATE_MODE`. Agents own code, tests, perf, docs — inside horizon gates.

---

## Now (2026-07-22 · web `2026.07-unified.95` · Android `1.17.0`)

> The ONLY "where we are" block in the repo — [ORCHESTRATION.md](ORCHESTRATION.md) points here.

- **Horizon 0 (pre-public beta).** Site live behind the `PRIVATE_MODE` gate. Boss metric: week-4 retained weekly loggers.
- **#1 bottleneck (founder-owned): recruit ≥10 beta users** + phone hero QA — [docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) §3. Beta cohort target 2026-08-02.
- Founder queue: Stripe Dashboard webhook events (`checkout.session.*` + `charge.dispute.*`) · `FOUNDER_DIGEST_EMAIL` · Checkout custom text → `/refunds` · [docs/PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md) · Phantom treasury + one signed pay · Android Accept B + upload keystore + Play Internal · apply customs/prefs Supabase migration · rotate GH Actions `VERCEL_TOKEN` · Wave A Upstash + Sentry.
- Agents queue: keep CI green · hero bugs · launch scripts/docs (Horizon 0); Android F5 gated ([apps/android/BACKLOG.md](apps/android/BACKLOG.md)).
- Shipped: **web `.95`** public `/guide` practice CTAs → welcome/exercises (not gated pillar URLs) + magazine body render; **`.94`** invite smoke / landing density / week4-smoke; Android **1.17.0** hub UX.
- In flight: none.

---

## Read next

[AGENTS.md](AGENTS.md) (conventions · glossary · commands) → [INDEX.md](INDEX.md) (task → doc routing · stale paths §4) → [ORCHESTRATION.md](ORCHESTRATION.md) (horizons · gates · departments) → the folder `INDEX.md` where you'll work.

---

## Trap terms (full glossary: AGENTS.md)

| Term | Means |
|------|-------|
| Mission Coach | AI plan engine — `src/lib/coach/`, `/coach` (≠ `/coaching` human-lead form) |
| Today | Route `/log` (`HomePage.tsx`), nav label "Today" |
| Train | Route `/active` — the logger |
| Fuel | Route `/nutrition` |
| Journey phase 0–3 | UX arc ([docs/JOURNEY.md](docs/JOURNEY.md)) ≠ build phases A–I ([docs/PLAN.md](docs/PLAN.md)) ≠ PFT G1–G8 |
| Horizon 0–3 | What may be built now — [ORCHESTRATION.md](ORCHESTRATION.md) |
| Wedge | Train + Mission Coach — the go-to-market story |
| Super Bundle | The one premium sub: $11.99/mo · $59/yr founders · $149 lifetime |
| PRIVATE_MODE | Site gate — only the founder flips it |
| mw-core | [packages/mw-core](packages/mw-core) — pure TS shared coach/workout logic |

---

## Commands

`npm run typecheck` · `npm test` · `npm run build` · `npm run lint` — full list in AGENTS.md §Commands.
Android: `cd apps/android && ./gradlew :app:assembleDebug`.

---

## Hard rules

1. **Horizon rule** — Horizon 0 allows only hero bugs, launch unblock, CI. No new pillars/locales/redesigns without explicit founder override.
2. **The free logger is never gated. Ever.**
3. Agents never flip `PRIVATE_MODE`, never invent traction numbers, never mark founder tasks done.
4. Do not open stale/deleted paths — [INDEX.md](INDEX.md) §4.
5. Docs match reality: every ship updates [LOG.md](LOG.md) + this file's `## Now` (+ build label).
