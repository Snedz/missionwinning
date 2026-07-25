# CONTEXT.md — boot file (read first, every tool)

One screen of truth for any AI tool or human joining cold. Read this, then [AGENTS.md](AGENTS.md), then [INDEX.md](INDEX.md). Keep `## Now` current: update it on every ship, in the same commit as the [LOG.md](LOG.md) entry.

---

## What this is

**Mission Winning** · www.missionwinning.com · "Train Anywhere. Win Daily."

> Adaptive AI coaching for train-anywhere athletes — free offline logging (no account), weekly plans from logs alone (no wearable). Super Bundle adds Coach depth and the other pillars — it never gates the logger.

- Six pillars — Train · Fuel · Move · Mind · Track · Learn — unified by the Mission Score. Constitution: [vision.md](vision.md). Pitch the **Train + Mission Coach wedge**, never "everything app" ([docs/YC_THESIS.md](docs/YC_THESIS.md)). Evidence thesis (structured exercise vs vague advice — not a depression product): [docs/EXERCISE_AS_MEDICINE.md](docs/EXERCISE_AS_MEDICINE.md). Crypto is a **payment rail** (Lifetime USDC), not the product ([docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md)).
- Surfaces: Next.js 16 PWA (repo root) · native Android Compose ([apps/android](apps/android), v1.24.1) · iOS deferred ([docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md)) · "Beyond the Basics" guidebook (`/guide` + magazine PDF).
- Solo founder + AI agents. Founder owns users, money, legal, secrets, `PRIVATE_MODE`. Agents own code, tests, perf, docs — inside horizon gates.

---

## Now (2026-07-25 · web `2026.07-unified.128` · Android `1.24.1`)

> The ONLY "where we are" block in the repo — [ORCHESTRATION.md](ORCHESTRATION.md) points here.

- **Horizon W — wedge excellence.** Web craft 1–6 + **Fuel estimate accuracy** (edit-before-log, better NL match, honest photo sources).
- **Logger reliability (`.123`):** fixed `/active` **Start Workout stuck disabled** (zustand ran `onRehydrateStorage` inside `create()` → swallowed TDZ error → `hasHydrated` never true). Web now on **sync v2** (`clientId`/`revision`/tombstones) behind a **durable outbox** — [src/lib/sync/INDEX.md](src/lib/sync/INDEX.md); all device writes go through [src/lib/storage/INDEX.md](src/lib/storage/INDEX.md). Hero + offline e2e now gate every PR.
- **Free-first beta (~4 weeks):** LLC + EIN pending — **no Bundle UI** + **full depth unlocked** + **full More nav** (journey train-only deferred) ([docs/FREE_BETA.md](docs/FREE_BETA.md)).
- **Surface parking (`.124`):** `NEXT_PUBLIC_SURFACES` ([src/lib/surface.ts](src/lib/surface.ts), [docs/ENV.md](docs/ENV.md)) parks non-wedge surfaces — **america · school · wearables · leaderboard · cryptoRails · paypal off by default**; six pillars stay on. `=wedge` parks the secondary pillars too (founder call). Parked = out of nav, 404 in `proxy.ts`, out of sitemap. Nothing deleted. Hero e2e passes in full wedge mode, so **the free logger is provably never gated**.
- **First 90 seconds (`.125`):** cold visitor → logged set is now a **budget test** (`tests/e2e/first-90.spec.ts`, 6 taps, no interstitial, one primary CTA, every logger control ≥44px — the ± steppers were 36px). Re-entry after a gap is calm and smaller, not a broken streak ([src/lib/reentry.ts](src/lib/reentry.ts)). `first_set_logged` carries `secondsFromStart`.
- **Homepage rebuild (`.126`):** `/` was the only page ignoring the briefing type system in `src/index.css`, so its H1 rendered in **Inter not Barlow Condensed**. Now on `.display-hero` / `.eyebrow`, restructured as the product loop (log → adapt → anywhere → free → start). Signature: [`LogToPlanHero`](src/components/landing/LogToPlanHero.tsx) runs the **real** `suggestNextSetTarget` engine — no hardcoded dashboard numbers. `CoachAdaptDemo` is visitor-driven, not an auto-carousel. Audience page at `/compare/test-prep`.
- **Quality pass (`.127`):** **`npm run a11y` green (10/10, was 8 failing + flaky)** — emerald split into `--primary` (accent on navy, 7.08:1) and `--primary-fill` (white text, 5.38:1) since no single value serves both; `--muted-foreground` 58→62%. Every declared `OutboxKind` now has a handler (`fuel.plan` removed — it writes to device storage, not a cloud). Cross-device **edits and deletes propagate** via the `updated_at` cursor. **`npm run gate`** runs the whole CI gate locally while Actions is blocked. Storage ratchet 59→53.
- **Storage ratchet empty (`.128`):** all 53 remaining files migrated to [safeStorage](src/lib/storage/INDEX.md) — `LEGACY_DIRECT_STORAGE` **deleted** from `eslint.config.js`, so a bare `localStorage` call is now a plain lint error with no allowlist to join (only `src/lib/backup.ts` stays exempt, since it must prefix-scan `mw_*` at runtime). ~200 call sites; ~40 hand-rolled `try/catch` and ~35 SSR guards **removed** rather than added, because `safeStorage` is SSR-safe and never throws. Every key resolves through `STORAGE_KEYS`.
- **Media system:** Google Flow · Scout mascot — [docs/MEDIA_SYSTEM.md](docs/MEDIA_SYSTEM.md).
- **Ops:** prod ships via **Vercel Deploy Hook + GitHub webhook** (unmetered, no Actions) — [docs/VERCEL_DEPLOY_CHECKLIST.md](docs/VERCEL_DEPLOY_CHECKLIST.md) §1.1; `deploy-production` is now **manual-only** fallback. **Actions is currently blocked** (every workflow fails in <5s with no logs = billing) → the PR gate is inert, so run **`npm run gate`** locally until cleared. OSS public-ready (AGPL + CoC) — founder flips GitHub Public — [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md). Promote **`.128`**; keep Supabase Site URL on www.
- Agents **must** ship wedge habit-loop + free acquisition. Refuse new pillars / America / locale farms / F5.
- **Founder:** Accept B on Android + phone excellence → invites → YC F26. **Wire the Deploy Hook webhook** ([checklist §1.1](docs/VERCEL_DEPLOY_CHECKLIST.md)) then promote `.128`; clear Actions billing to restore the PR gate.

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

1. **Horizon rule** — Horizon W: build wedge excellence (Train/Today/Victory/Coach). No new pillars/locales/America/F5 without explicit founder override. ≥10 beta only after excellence sign-off.
2. **The free logger is never gated. Ever.**
3. Agents never flip `PRIVATE_MODE`, never invent traction numbers, never mark founder tasks done.
4. Do not open stale/deleted paths — [INDEX.md](INDEX.md) §4.
5. Docs match reality: every ship updates [LOG.md](LOG.md) + this file's `## Now` (+ build label).
