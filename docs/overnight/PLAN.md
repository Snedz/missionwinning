# Frozen: F-017 verify + iterate first set without an account (`.762`)

**Status:** FROZEN. Verify and fix only this plan. Do not expand scope.

**Label:** `2026.07-unified.762` — F-017 verify/iterate.

Master already minted `.746` (the #523 / reserved-`.730` ship) through `.761` (e1RM). The original brief asked for `.747` / then `.750`; both are taken. `check-build-label` requires a label strictly past `origin/master`. Do not reuse `.730` or `.750`.

**Excellence-Override:** F-017 first-set verify iterate

**Lane:** Engineering-Web + Design craft on the first-set path only.

---

## Discovery (why verify, not a new feature)

| Existing | State | This PR |
|----------|--------|---------|
| [#523](https://github.com/Snedz/missionwinning/pull/523) / `.746` (reserved `.730`) | Merged to master (`cdf19fa`). Contract: I-Day welcome → profile → `/log`; Train never mounts `SignInPrompt`; header chip off until first workout and never on `/active`; Today Sign-in only after `workoutHistory.length > 0`; `TAP_BUDGET` 5 | **Verify the function and the craft.** Fix gaps in this same PR. |
| `src/lib/firstSetUngated.test.ts` | Predicate table + source-scan wiring. Does **not** discover child mounts, TAP_BUDGET, speech, or pathname edges beyond a few literals | Extend until a mutant that remounts account chrome on the cold path goes red |
| Hypothesis (non-binding) | Merge landed the contract, but first-paint chrome or a missed `SignInPrompt` mount / header-chip edge may still fail a cold phone | Investigate. Reach an independent conclusion. Discard the hypothesis if wrong. |

This is a **VERIFY + FIX loop**. If the code already matches the contract, still add the missing tests and a short [VERIFY.md](VERIFY.md) ledger.

---

## Goal

A cold phone (fresh storage) logs the first set with **no account** and **no signup chrome**. The path looks like a field instrument, not a funnel.

`PRIVATE_MODE` / `FREE_BETA` / Stripe / EIN unchanged. Free logger never gated. No production promote. No Vercel Preview.

---

## What “prod-ready” means (this PR)

All of the following, or the PR **must not claim** production-ready:

1. **Function tests green locally** for the cold path (unit + source-scan / discover guards listed below). `npm test` on the F-017 files, plus the colocated guards they extend.
2. **Design of Welcome → `/log` → `/active` first-set is craft-LGTM:** quiet header, metric-first logger, set-log table is first paint on `/active`, no account chrome / banners / “Keep this diary” strip. Fix craft by **removing chrome**, not by adding copy.
3. **`TAP_BUDGET` stays 5.** Never raised. Speech never owns first paint. Speech never replaces the set-log table.
4. **No new i18n keys** unless a real string is missing for this path.
5. **No `PRIVATE_MODE` change, no spine-label steal, no Preview deploy.** `[skip vercel]` on every commit.
6. **Honesty:** if the cold path could not be run in a real browser (dev server + fresh storage), the PR says so. Tests + source review are not a phone.

Cursor-local green (`npm test` on the touched guards, lint/typecheck if src changes) is the merge bar while Actions minutes are red. Do not burn GitHub Actions. Do not open a Vercel Preview (Hobby `api-deployments-free-per-day` is already burned).

---

## What I will check (function)

Cold phone / fresh storage contract:

| # | Check | Pass |
|---|--------|------|
| 1 | I-Day `STEP_ORDER` is `welcome` → `profile` only. Continue calls `finish()` and lands `/log` (F-004). No signup wall. Sign-in stays on `/profile`. | Source + unit. `/welcome` is outside `app/(app)/` (own header, no `AppHeader` chip). |
| 2 | App-header Sign in chip hidden until first workout. Hidden on `/active` even after. `getUser` is not called when the chip is hidden. | `showHeaderSignInChip` table + `HeaderAuthChip` wiring. Pathname edges: trailing slash, query, `/active/*`. |
| 3 | Today header: Sign-in link only after `workoutHistory.length > 0`. No “Keep this diary” strip. Lean + Dashboard both pass the same signal. | Header + both Today shells. |
| 4 | One Start → `/active` → weight/reps → Log set. No account chrome under the logger. `handleLogSet` must not await auth (already asserted in `localFirstRestGuard`; keep + extend). | Page + **discovered children** of Active (not only the page file). |
| 5 | After the first workout, Sign in may appear as quiet wayfinding on Today / Profile — **never** on `/active`. | Predicate + header. |
| 6 | `TAP_BUDGET` is 5 in `tests/e2e/first-90.spec.ts`. Skip-sign-in tap is gone. | Unit reads the spec (e2e itself is not run in this PR — Playwright/Chromium + Actions). |
| 7 | Speech never owns first paint on `/active`. Speech never replaces the set-log table. Debrief speech after Victory is out of the first-set path. | Discover imports on Active first-paint modules. |
| 8 | Free logger stays ungated. No `PRIVATE_MODE` flip. No production promote. | Diff review. |

---

## What I will check (design)

Visual north star: Bevel-inspired premium dark UI, metric-first layout.

| Surface | Pass |
|---------|------|
| Welcome | Two steps. Begin → Continue. No Sign-in step, no Skip-sign-in, no account banner. Quiet brand header (own chrome, not the app chip). |
| Today (`/log`) Lean, first session | One Start. No Sign-in link. No “Keep this diary”. Lean stays lean. |
| Train (`/active`) first set | Set-log table is first paint once a session exists. No `SignInPrompt`, no account strip, no speech chrome on the table. Header chip off. |

If the first-set path looks cheap, sparse, or like a signup funnel: **remove chrome**. Do not add copy. Do not restyle N1 / www. Do not restyle logger density (F-003 stays).

---

## What I will refuse (hard bans)

- Do not flip `PRIVATE_MODE`. Do not promote production. Do not open a Vercel Preview.
- Do not burn GitHub Actions. Do not treat Actions red as a product fail.
- Do not copy #493 extras (Keep this diary, 15-lang gate copy, OS-permission deferral).
- Do not touch #505 field test, #519 PT warning, #728 Preview gate, #729 transparency.
- Do not add a guest-mode stack, identity merge, or Coach force.
- Do not restyle N1 / landing / www.
- Do not change empty-bar / rest-skip copy.
- Do not invent traction. Do not gate the free logger.
- Do not change geo-blocks in `src/lib/legal/supportedRegions.ts`.
- Do not touch PT / pregnancy / field-test copy (counsel-hold).
- Do not raise `TAP_BUDGET`. Do not add i18n keys unless a real string is missing.
- Do not mint `.697`–`.729` or reuse `.730` / `.746`–`.749`.

---

## Tests to write / extend

Extend `src/lib/firstSetUngated.test.ts` (and only add a sibling if a second concern appears). Prefer **discover** over enumerate.

| Guard | Asserts | Mutant that must die |
|-------|---------|----------------------|
| Predicate edges | `normalizeAppPath` / `isActiveLoggerPath` / `showHeaderSignInChip` for `''`, `/`, query, trailing slash, `/active/foo`, `/log/` | Chip true on `/active?x=1` after first workout |
| I-Day | `STEP_ORDER` welcome+profile; no `signin` step type; `handleProfileNext` → `finish()`; no `<SignInPanel` | Restoring `setStep('signin')` |
| Train page | Active does not import or mount `SignInPrompt` | Remounting `<SignInPrompt` on the page |
| Train children | Discover modules imported by `ActiveWorkoutPage` (one hop). None mount `SignInPrompt` | Prompt moved into `ActiveSessionChrome` / dock / empty state |
| Header | `getUser` only after `showChip`; `workoutHistory.length`; early return | Calling `getUser` when `showChip` is false |
| Today | Lean + Dashboard pass `workoutHistory.length > 0`; header `hasFirstWorkout && !userEmail`; no “Keep this diary” | Always-on Sign-in `<a>` |
| TAP_BUDGET | `tests/e2e/first-90.spec.ts` still `const TAP_BUDGET = 5`; no Skip-sign-in tap | Raising to 6 or restoring Skip |
| handleLogSet | No `async` / `await` / `getUser` / `getSession` (keep `localFirstRestGuard`; add a first-set pointer so F-017 has one home) | `await getUser()` before `logSetAndAdvance` |
| Speech | Active first-paint modules (`ActiveWorkoutPage`, `ActiveExerciseList`, `LogConsole`, `ActiveSessionChrome`, `ActiveEmptyState`) do not import `@/lib/speech` | Speech owning the set table |

Do not run `npm run e2e` / `npm run gate` / GitHub Actions. Do not start a production build unless a typecheck failure requires it.

---

## Files (expected)

| Path | Role |
|------|------|
| `docs/overnight/PLAN.md` | This frozen plan |
| `docs/overnight/VERIFY.md` | Ledger: what was verified, what was fixed, what is still blocked |
| `docs/overnight/INDEX.md` | Point at verify plan + ledger |
| `src/lib/firstSetUngated.test.ts` | Extended guards |
| `src/lib/firstSetUngated.ts` | Only if a real predicate gap |
| First-set path components | Only if verify finds a function or craft defect |
| `src/lib/buildInfo.ts` · `LOG.md` · `CONTEXT.md` `## Now` | Ship protocol `.762` |

No new i18n keys (hide chrome; existing local-first strings stay).

---

## Ship

- Bump `APP_BUILD_LABEL` to `2026.07-unified.762`.
- LOG heading `## YYYY-MM-DD — F-017 first-set verify (\`.762\`)`. Rotate oldest to stay ≤15.
- `## Now`: add `.762` bullet; rotate oldest shipped version bullet to stay ≤25. Keep Status table / Excellence / Horizon W / `PRIVATE_MODE`.
- Commit trailer: `Excellence-Override: F-017 first-set verify iterate`
- Every commit: `[skip vercel]`
- Draft PR title: `F-017 first-set verify iterate (.762)`
- PR body lists what was verified, what was fixed, and what is still blocked (Preview SSO F-035 / Hobby). Do not claim production-ready if the cold path was not actually run in a browser.
