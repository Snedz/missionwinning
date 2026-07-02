# Mission Winning — Project Improvement Plan

**Date:** 2026-07-02 (rev 2) · **Reviewed against:** `master` @ `157f71f` (PR #60), integration branches PR #62 (product) and PR #63 (marketing), quality-gate branch PR #65.

This is a full-repo health review — architecture, CI/quality gates, test coverage, type safety, security posture, dependency health, branch hygiene, and docs — with a prioritized plan. Cross-reference [vision.md](vision.md) for product values and [VISION_STATUS.md](VISION_STATUS.md) for feature-gap tracking; this doc focuses on **engineering health**, not product scope.

---

## Executive summary

The product itself is in strong shape (six pillars, i18n depth, offline/rural equity work, marketing site, 237 passing logic tests on the integrated branches). The biggest risks are **process and integration**, not features:

1. **`master` is stale.** Nothing has merged since PR #60. Twelve PRs are open: two large integration branches (PR #62 product, PR #63 marketing), a stacked chain of 6 feature PRs (#43–#48), plus quality-gate PR #65 and doc PRs #61/#64. They diverge further every session.
2. **CI quality gate is written but not landed.** PR #65 adds `lint` + `typecheck` to CI and fixes all 54 ESLint errors and 11 `tsc` errors found in the tree — but it only covers `master`'s code. PR #62/#63 were written before the gate and will surface their own lint/type errors when rebased onto it.
3. **Test coverage is logic-only.** All tests exercise `src/lib/**` (35 test files vs 75 lib modules on `master`); zero tests cover the 144 React components/pages or the 24 API route handlers — including Stripe/PayPal webhooks, premium gating, and youth-consent flows (money + minors' data).
4. **`npm audit` reports 9 vulnerabilities (5 high)** — newly reviewed this pass. The high-severity ones all chain through `next-pwa` → `workbox` → `serialize-javascript` (RCE advisory). `next-pwa` 5.x is unmaintained; the practical fix is migrating to `@serwist/next` (its maintained successor). Two dev-chain advisories (`@babel/core`, `js-yaml`) are fixable today with a plain `npm audit fix`.
5. **Docs have sprawled** — 13+ root-level markdown files with overlapping scope (env setup alone spans `ENV.md`, `SETUP.md`, `VERCEL_DEPLOY_CHECKLIST.md`, `README.md`).

None of these block the product vision, but all compound the longer they're deferred. The plan below is ordered by leverage.

---

## Progress since rev 1

| Item | Status |
|------|--------|
| Fix ESLint errors (was 49–54) | ✅ Done in PR #65 — 0 errors, 5 hook-deps warnings remain |
| Fix `tsc --noEmit` errors (was 30+, 11 real) | ✅ Done in PR #65 — clean |
| Add lint + typecheck to CI | ✅ Done in PR #65 — `npm run lint` (`eslint .`) + `npm run typecheck` steps in `ci.yml` |
| Replace broken `next lint` script | ✅ Done in PR #65 — Next 16 removed `next lint`; now calls ESLint directly |
| Test-fixture type drift (`score.test.ts`, `workoutPr.test.ts`, `crossPillarCoach.test.ts`) | ✅ Fixed in PR #65 |
| Everything else below | ⬜ Open |

---

## Findings in detail

### 1. Branch & merge hygiene (top risk)

| Item | State |
|------|-------|
| `master` last merge | PR #60 (Phase G/H/I vision plan docs) |
| PR #65 (CI gates + lint/tsc fixes) | Small, green, ready — merge **first** |
| PR #62 (product: Phase J, I1–I5) | ~18 commits ahead, draft, unmerged |
| PR #63 (marketing: M0–M6) | ~25 commits ahead, draft, unmerged |
| PR #43→#48 | Stacked chain (set-type chips → history units → builder i18n → learn content → calculators → drop sets/meal scan) — real, tested feature work |
| PR #61, #64 | Docs-only (rural equity plan, this doc) — low risk, merge any time |
| PR #9 | Planning-doc PR from before Phase F2 — superseded; safe to close |

**Risk:** every day these stay open, the odds of a painful merge grow — especially PR #62 vs PR #63, which both touch `src/i18n.ts`, `app/page.tsx`, and `app/layout.tsx`. The stacked chain #43→#48 rebase-cascades on every base change. And once PR #65's CI gate lands, **every other open PR must pass lint + typecheck to merge** — the sooner they rebase, the smaller that delta.

### 2. CI / quality gates

`master`'s `ci.yml` runs: `npm test` → `export-locales` → `build`. PR #65 adds `lint` + `typecheck` ahead of tests and fixes all existing violations on the `master` codebase (54 ESLint errors incl. empty catches, `any` casts, unused vars; 11 tsc errors incl. real test-fixture drift that transpile-only `tsx --test` never caught).

**Remaining gaps:**
- 5 `react-hooks/exhaustive-deps` **warnings** are not enforced. At least one (`ActiveWorkoutPage` missing `nextSet` dep) is plausibly a real stale-closure bug in the rest-timer flow — worth a targeted look, then consider promoting the rule to `error`.
- PR #62/#63 predate the gate. Expect a cleanup pass on each after rebasing onto `master` + #65.
- CI runs on `push` to `cursor/**` and PRs to `master` — good. No caching issue; Node 22 + npm cache already configured.

### 3. Test coverage shape

- `master`: 119 tests / 35 test files over 75 `src/lib` modules. Integrated branches: 237 tests.
- **0** component tests against 144 `.tsx` files.
- **0** route-handler tests against 24 `app/api/**/route.ts` handlers.

Highest-stakes untested code, in order:
1. `app/api/stripe-webhook/route.ts` — HMAC verification (custom v1-scheme implementation with timing-safe compare + 5-min replay window; hand-rolled crypto **especially** deserves tests), enrollment grant.
2. `app/api/paypal-webhook/route.ts` — signature verification path.
3. `app/api/premium/*` — the 403-without-enrollment path is the revenue gate.
4. `app/api/youth/consent-*` — minors' data; legal exposure.
5. `app/api/school/class/*` — teacher PIN auth, class data export.

These are plain functions taking `NextRequest` — they can be tested with `node:test` + mock requests without any jsdom/testing-library setup. High value, low tooling cost.

### 4. Dependency security (new this pass)

`npm audit`: 9 vulnerabilities — 1 low, 3 moderate, **5 high**.

| Chain | Severity | Fix |
|-------|----------|-----|
| `next-pwa` → `workbox-webpack-plugin` → `rollup-plugin-terser` → `serialize-javascript` | High (RCE advisory) | No non-breaking fix; `next-pwa` 5.x is unmaintained. Migrate to `@serwist/next` (maintained fork) — moderate, contained change to `next.config` + SW entry. Mitigating factor: build-time dependency, not runtime-exposed, so acceptable to schedule rather than hotfix. |
| `@babel/core` (dev) | Low | `npm audit fix` — safe today |
| `js-yaml` (dev) | Moderate | `npm audit fix` — safe today |
| `postcss` < 8.5.10 (nested under `next`) | Moderate | Resolves via Next 16.2.7 → 16.2.10 minor bump |

Version freshness otherwise healthy — only patch/minor drift (Next 16.2.10, Supabase JS, Radix). Major jumps (Tailwind 4, TS 6, Recharts 3, Lucide 1.x, ESLint 10) deliberately deferred pre-launch — correct call.

### 5. Security posture (spot-checked, no criticals)

- Premium routes gate on Supabase enrollment + demo flag; `isDemoPremiumEnabled()` is dev-default-on / prod-default-off — correct, but **verify `DEMO_PREMIUM` is unset/false in Vercel prod** (highest-impact possible misconfiguration; already tracked in Phase H gates).
- `privateGate.ts` / `privateSession.ts` use signed tokens with expiry — solid.
- No hardcoded secrets found in source.
- **Not verified** (needs route tests, §3): rate limiting on `/api/leads`, `/api/fuel/*`, youth-consent endpoints.

### 6. Documentation sprawl

13 root markdown files. Overlaps:
- Env/deploy: `README.md`, `SETUP.md`, `ENV.md`, `VERCEL_DEPLOY_CHECKLIST.md`, `PROTECTION.md` — five docs sharing the same Vercel/Supabase/Stripe steps.
- Launch: `PRE_LAUNCH_PLAN.md` + `PLAN.md` Phase H section describe the same gate.
- Phase docs (`PLAN.md`, `VISION_STATUS.md`, `LOG.md`) update in parallel and drift (`VISION_STATUS.md` header says build `.45`; shipped work is at `.68` on the marketing branch).

---

## Prioritized plan

### P0 — Land the gate, then drain the queue (order matters)

1. **Merge PR #65 first.** It's small, green, and everything else should rebase onto its CI gate.
2. **Close PR #9** (superseded planning doc). Merge docs PRs #61/#64 whenever.
3. **Merge stacked chain #43 → #48** in order, rebasing each onto `master` and fixing any lint/type errors the new gate surfaces (expect small deltas — these are focused diffs).
4. **Merge PR #62 (product), then PR #63 (marketing)** — dedicated merge session; expect conflicts in `src/i18n.ts`, `app/page.tsx`, `app/layout.tsx` (marketing builds on product's i18n patterns, so product lands first). Each will need a lint/typecheck cleanup pass post-rebase. This is the **user decision point** — flagship branches, deserves focused attention rather than being folded into phase work.

### P1 — Quick security wins (can run parallel to P0)

5. `npm audit fix` for the dev-chain advisories (`@babel/core`, `js-yaml`) + minor bump Next 16.2.7 → 16.2.10 to clear the nested `postcss` advisory. Non-breaking.
6. Investigate the `ActiveWorkoutPage` `nextSet` hook-deps warning (possible rest-timer stale closure); fix or annotate, then promote `react-hooks/exhaustive-deps` from warn to error.

### P2 — Raise the test floor where the stakes are highest

7. Route-handler tests via `node:test` + mock `NextRequest` (no jsdom needed), priority order: `stripe-webhook` (esp. the hand-rolled signature verifier — valid sig, bad sig, replayed timestamp, malformed header), `paypal-webhook`, `premium/*` 403 paths, `youth/consent-*`, `school/class/*` auth.
8. Component testing incrementally (React Testing Library + jsdom) starting with revenue/safety UI: `UnlockButton`, bundle checkout pieces, youth-consent form. Not a blanket mandate for all 144 components.

### P3 — Maintenance pass (schedule post-P0)

9. **Migrate `next-pwa` → `@serwist/next`** to clear the 5 high-severity advisories and get off an unmaintained dependency. Contained change; test PWA install + offline flows after.
10. Consolidate `SETUP.md` + `ENV.md` + `VERCEL_DEPLOY_CHECKLIST.md` into one canonical `DEPLOY.md`; keep `PROTECTION.md` for the private-gate model; `README.md` stays the short entry point. Refresh stale build labels in `VISION_STATUS.md`.
11. House rule: phase docs update their build-label header in the **same commit** as the code change (already the practice on the marketing branch; state it explicitly).

### P4 — Post-launch technical debt (track only)

12. Major dependency upgrades (Tailwind 4, TypeScript 6, Recharts 3, Lucide 1.x, ESLint 10) — dedicated maintenance pass after Phase H public launch.
13. Bundle-size / Lighthouse audit on marketing landing + Today hub once PWA is enabled (blocked by `PRIVATE_MODE` today).

---

## Suggested execution order

```
P0.1   Merge PR #65 (CI gate)                      ← unblocks everything
P0.2   Close #9; merge docs #61/#64
P1.5   npm audit fix + Next 16.2.10 bump           ← parallel with P0
P0.3   Merge #43 → #48 chain (rebase + lint fix each)
P0.4   Merge PR #62 → master, then PR #63 → master (dedicated session)
P1.6   Rest-timer hook-deps investigation
P2.7   API route tests (money + minors' data)
P2.8   Component tests (revenue-critical UI)
P3.9   next-pwa → @serwist/next migration
P3.10  Docs consolidation
P4     Deferred to post-launch
```

Landing the CI gate **before** the big merges means conflict resolution on PR #62/#63 happens against a codebase CI can actually validate — the whole point of the gate.
