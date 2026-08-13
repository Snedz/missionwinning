# F-017 verify ledger (`.762`)

Written after the verify loop. Plan: [PLAN.md](PLAN.md). Not product truth after merge — ORCHESTRATION + LOG win.

## What was verified (function)

| Check | Result | How |
|-------|--------|-----|
| I-Day `STEP_ORDER` welcome → profile; Continue → `finish()` → `/log` | **Pass (source)** | `WelcomePage` has no `'signin'` step, no `SignInPanel`, no Skip-sign-in. `/welcome` is outside `app/(app)/` — no `AppHeader` chip. |
| Header Sign in hidden until first workout; never on `/active`; `getUser` skipped when hidden | **Pass + hardened** | Predicate table holds. `normalizeAppPath` now strips hash and treats nullish as `/` so a null `usePathname()` cannot throw on first paint. `HeaderAuthChip` coerces `usePathname() ?? ''`. |
| Today Sign-in only after `workoutHistory.length > 0`; no “Keep this diary” | **Pass (source)** | Lean + Dashboard pass the same signal. Header `hasFirstWorkout && !userEmail`. No diary strip in source. |
| Train does not mount `SignInPrompt`; `handleLogSet` does not await auth | **Pass (source + discover)** | Page and one-hop workout children have no prompt. Fuel still mounts it (`.697` fail-open stays). `handleLogSet` has no `await` / `getUser`. |
| `TAP_BUDGET` = 5; Skip-sign-in gone | **Pass (spec read)** | `tests/e2e/first-90.spec.ts` still `const TAP_BUDGET = 5`. Cold case is Begin → Continue → Start → Log. E2E itself was **not** run (Playwright / Actions). |
| Speech never owns first paint / set-log table | **Pass (source)** | Named first-paint modules + one-hop Active imports do not import `@/lib/speech`. Debrief speech stays on Victory (out of first-set). |
| Free logger ungated; `PRIVATE_MODE` untouched | **Pass (diff)** | No gate / env / promote. |

## What was verified (design)

Source + layout review of Welcome → Today Lean → `/active` first-set. **Not a phone screenshot pass.**

| Surface | Finding |
|---------|---------|
| Welcome | Two steps. Quiet own header (monogram + “Get started”). One red CTA. Session preview is metric (name + movements), not account chrome. Begin fallback now matches EN (`Begin`) so pre-hydrate first paint is not “Continue”. |
| Today Lean | One docked Start. No Sign-in link pre-workout. First Steps is workout-only (F-004), not a signup wall. Coach invite requires `totalSessions >= 1`. Lean stays lean. |
| Train | No `SignInPrompt`, no diary strip, no speech on the set table. Header chip off. Set-log / Log console remain first paint once a session exists. Did **not** restyle N1 / density / empty-bar. |

**Craft:** first-set path does not look like a signup funnel in source. Remaining chrome (First Steps workout row, LiveHeartRate, jot field) is not account chrome — left alone per refuse list.

## What was fixed in this PR

1. `normalizeAppPath` / chip predicate: nullish + hash (`/active#x` after first workout must stay hidden).
2. `HeaderAuthChip`: `usePathname() ?? ''` so a null path cannot crash the header.
3. Welcome `welcomeBegin` `defaultValue` `'Continue'` → `'Begin'` (EN pack already `Begin`; fallback was the profile-step word).
4. Extended `firstSetUngated.test.ts` (edges, discover children, TAP_BUDGET, speech, handleLogSet, no diary strip).

## Hypothesis

“Merge landed the contract, but first-paint chrome or a missed SignInPrompt / header-chip edge may still fail a cold phone.”

**Conclusion:** the contract landed. No missed `SignInPrompt` on Train or one-hop children. The real edge was pathname: hash / nullish could show the chip on Train or throw. Hardened. Welcome Begin fallback was the only first-paint copy defect.

## What is still blocked

- **Cold path not run in a browser this session.** No Chromium walk of Welcome → `/log` → `/active` → Log set. Do not treat this PR as phone-proven.
- **Preview SSO (F-035) / Hobby.** `[skip vercel]` on every commit. No Preview. No production promote.
- **GitHub Actions minutes.** Not burned. Merge bar is Cursor-local green + craft LGTM.
- **Excellence RESULT** still `unscored`. Override on the commit.

## Prod-ready?

**Not claimed.** Local unit guards for the cold-path *contract* are green
(`firstSetUngated`, `localFirstRestGuard`, `localFirstCopy`, `contextBudget`,
`buildInfo`, `check-build-label`). The actual cold phone path was not executed
here.
