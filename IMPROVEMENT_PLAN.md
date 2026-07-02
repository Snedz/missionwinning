# Mission Winning — Project Improvement Plan

**Date:** 2026-07-02 · **Reviewed against:** `master` @ `157f71f` (PR #60), integration branches PR #62 (product) and PR #63 (marketing).

This is a full-repo health review — architecture, CI/quality gates, test coverage, type safety, security posture, branch hygiene, and docs — with a prioritized plan. Cross-reference [vision.md](vision.md) for product values and [VISION_STATUS.md](VISION_STATUS.md) for feature-gap tracking; this doc focuses on **engineering health**, not product scope.

---

## Executive summary

The product itself is in strong shape (six pillars, 237 passing logic tests, i18n depth, offline/rural equity work, marketing site). The biggest risks are **process**, not features:

1. **`master` is stale.** Nothing has merged since PR #60. Two large integration branches (PR #62 product, PR #63 marketing) and a stacked chain of 6 feature PRs (#43–#48) sit unmerged, diverging further every session.
2. **CI doesn't catch real problems.** Lint and typecheck aren't part of CI — and there are currently **49 lint errors** and **30+ `tsc` errors** in the tree that would fail a real quality gate.
3. **Test coverage is logic-only.** All 237 tests exercise `src/lib/**`; zero tests cover the 160 React components/pages or the 29 API routes (several of which gate premium content and payments).
4. **Docs have sprawled** — 16 root-level markdown files with overlapping scope (env setup alone spans `ENV.md`, `SETUP.md`, `VERCEL_DEPLOY_CHECKLIST.md`, `README.md`).

None of these block the product vision, but all of them compound the longer they're deferred. The plan below is ordered by leverage: cheap, high-value fixes first.

---

## Findings in detail

### 1. Branch & merge hygiene

| Item | State |
|------|-------|
| `master` last merge | PR #60 (Phase G/H/I vision plan docs) |
| PR #62 (product: Phase J, I1–I5) | 18 commits ahead of `master`, draft, unmerged |
| PR #63 (marketing: M0–M6) | 25 commits ahead of `master`, draft, unmerged |
| PR #43→#48 | Stacked chain (train drop-sets, fuel photo scan, calculators, builder i18n, history units) — real, tested feature work, unmerged since 2026-07-01 |
| PR #9 | Planning-doc-only PR from before Phase F2 — superseded by all shipped phases since; safe to close |

**Risk:** every day these branches stay open, the odds of a painful merge (especially PR #62 vs PR #63, which both touch `i18n.ts`, `app/page.tsx`, and `app/layout.tsx`) go up. Stacked PRs #43→#48 rebase-cascade on every change to the base.

### 2. CI / quality gates

`.github/workflows/ci.yml` runs: `npm test` → `npm run export-locales` → `npm run build`. It does **not** run `next lint` or `tsc --noEmit`.

Running both locally today surfaces:
- **49 ESLint errors / 7 warnings** — empty catch blocks (`no-empty`), `any` usage (`@typescript-eslint/no-explicit-any`), unused vars, one `react-hooks/exhaustive-deps` bug (`ActiveWorkoutPage` missing `nextSet` dependency — likely a real stale-closure bug in the rest-timer flow).
- **30+ TypeScript errors** under `tsc --noEmit`, mostly:
  - Test files import with explicit `.ts` extensions (`allowImportingTsExtensions` not set) — cosmetic, fixable via `tsconfig.json`.
  - **Real drift bugs:** `score.test.ts` builds a `CompletedWorkoutLog` missing the now-required `startedAt` field; `workoutPr.test.ts` passes an `id` field `SetLog` no longer accepts; `offlineCoach.test.ts` uses a muscle-group/status key that no longer exists in the enum. These pass today only because `tsx --test` transpiles without type-checking — meaning the *types* have already drifted from the *tests*, silently.

### 3. Test coverage shape

- 58 test files covering 99 non-test `src/lib/*.ts` modules (~58% file coverage, logic layer only).
- **0** component tests (`*.test.tsx`) against 160 `.tsx` files in `src/components`, `src/page-components`, `app/`.
- **0** route-handler tests against 29 `app/api/**/route.ts` handlers, including Stripe/PayPal webhooks, premium gating (`/api/premium/*`), and youth-consent flows — the highest-stakes code in the repo (money + minors' data).

### 4. Security posture (spot-checked, no criticals found)

- `isPremiumForUser` / premium routes correctly gate on Supabase enrollment + demo-mode flag; `isDemoPremiumEnabled()` is dev-default-on, prod-default-off — correct, but **must be explicitly verified `DEMO_PREMIUM=false` in Vercel prod env** (already tracked in `PLAN.md` Phase H gates — reinforcing it here since it's the single highest-impact misconfiguration possible).
- `privateGate.ts` / `privateSession.ts` use signed tokens with JWT expiry checks, not raw secret comparison (with one intentional legacy fallback) — solid.
- No hardcoded secrets found in source (only `support@missionwinning.com`-style constants and doc references to env var *names*).
- **Not verified in this pass** (would need route-handler tests, see §3): rate limiting on `/api/leads`, `/api/fuel/*`, and youth-consent endpoints against abuse; CSRF posture on webhook endpoints beyond signature verification.

### 5. Documentation sprawl

16 root markdown files. Overlapping concerns:
- Env/deploy setup: `README.md`, `SETUP.md`, `ENV.md`, `VERCEL_DEPLOY_CHECKLIST.md`, `PROTECTION.md` — five docs, each with a subset of the same Vercel/Supabase/Stripe steps.
- Launch: `PRE_LAUNCH_PLAN.md`, `LAUNCH_DAY.md`, `PLAN.md` (Phase H section) — three docs describing the same gate.

Not urgent, but every new phase currently updates 3–4 docs in parallel (`LOG.md`, `PLAN.md`, `VISION_STATUS.md`, plus a phase-specific plan doc) — real risk of them drifting out of sync (e.g. `PLAN.md` says "Last updated build `.59`" while shipped work is already past `.68` on the marketing branch).

### 6. Dependency freshness

Healthy — only patch/minor version drift (Next 16.2.7→16.2.10, Supabase JS, Radix). Major version jumps available but **deliberately deferred** (Tailwind 4, TypeScript 6, Recharts 3, Lucide 1.x) — correct call pre-launch; revisit post-launch.

---

## Prioritized plan

### P0 — Unblock the pipeline (do first, low risk, high leverage)

1. **Merge or close PR #9** (stale planning doc, superseded) — one-line decision, removes noise.
2. **Merge stacked chain #43 → #48** into `master` in order (small, self-contained feature diffs) once each passes CI. This is the cheapest way to stop compounding rebase pain.
3. **Merge PR #62 (product) then PR #63 (marketing) into `master`**, resolving the expected overlap in `i18n.ts` / `app/page.tsx` / `app/layout.tsx` directly (marketing branch already builds on product's i18n patterns, so product should land first). This is a **user decision point** (these are the two flagship integration branches) — recommend scheduling this as its own dedicated merge session rather than folding into future phase work.
4. **Add `next lint` and `tsc --noEmit` to `ci.yml`** as required steps — but only *after* clearing current errors (below), so the gate starts green and stays green.

### P1 — Close the quality-gate hole (small, mechanical)

5. Fix the 49 ESLint errors: mostly delete-unused-var and empty-block fixes; the one real bug (`ActiveWorkoutPage` missing `nextSet` dep) needs a careful look since it affects rest-timer correctness.
6. Fix `tsconfig.json` to set `allowImportingTsExtensions: true` (or strip `.ts` suffixes from test imports) to kill the ~20 cosmetic import errors.
7. Fix the 3 real type-drift bugs surfaced by `tsc`: add `startedAt` to `score.test.ts`'s fixture, remove the stray `id` field in `workoutPr.test.ts`, fix the stale muscle-group/status key in `offlineCoach.test.ts`. These indicate the underlying types changed after the tests were written — worth a quick audit for any *production* code paths with the same drift, not just tests.
8. Re-enable lint + typecheck in CI (item 4) once 5–7 are clean.

### P2 — Raise the test floor where the stakes are highest

9. Add integration-style tests for the highest-risk API routes first: `/api/stripe-webhook`, `/api/premium/*` (403-without-enrollment path), `/api/youth/consent-*`. These can be plain `node:test` files that call the route handler functions directly with mock `NextRequest` objects — no need for a full testing-library/jsdom setup to get high-value coverage here.
10. Introduce component testing incrementally (React Testing Library + jsdom) starting with the components most connected to revenue/safety: `UnlockButton`, checkout flow pieces on `BundlePage`, and the youth-consent form — not a blanket mandate to test all 160 components immediately.

### P3 — Documentation consolidation

11. Collapse `SETUP.md` + `ENV.md` + `VERCEL_DEPLOY_CHECKLIST.md` into one canonical `DEPLOY.md`; keep `PROTECTION.md` focused purely on the private-gate security model; keep `README.md` as the short entry point that links out.
12. Add a single "last synced build" convention: every phase doc (`PLAN.md`, `VISION_STATUS.md`) should update its build-label header in the *same commit* as the code change, not as a follow-up — this is already the practice on the marketing branch (M0–M6 each bumped `buildInfo.ts` + `LOG.md` together); worth stating explicitly as a house rule so it holds across all contributors/agents.

### P4 — Post-launch technical debt (not urgent, track only)

13. Major dependency upgrades (Tailwind 4, TypeScript 6, Recharts 3, Lucide 1.x) — schedule for a dedicated maintenance pass after Phase H public launch, since each carries breaking-change risk not worth taking pre-launch.
14. Bundle-size / performance audit (Lighthouse on the marketing landing + Today hub) once PWA is enabled (Phase H) — currently blocked by `PRIVATE_MODE`, so premature to measure now.

---

## Suggested execution order

```
P0.1  Close PR #9
P0.2  Merge #43 → #48 (stacked chain, in order)
P1.5–P1.7  Fix lint + tsc errors (can happen in parallel with P0, same branch or a dedicated cleanup PR)
P1.4/P1.8  Land CI lint + typecheck gate
P0.3  Merge PR #62 → master, then PR #63 → master (dedicated session; expect i18n.ts / app/page.tsx / app/layout.tsx conflicts)
P2.9  API route tests for money + minors' data paths
P2.10 Component tests for revenue-critical UI
P3    Docs consolidation (any time, no dependencies)
P4    Deferred to post-launch
```

This ordering fixes the pipeline and quality gate *before* attempting the highest-risk merge (P0.3), so that merge conflict resolution happens against a codebase CI can actually validate.
