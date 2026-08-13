# Frozen: F-017 first set without an account (`.730`)

**Status:** FROZEN. Implement only this plan.

**Label:** `2026.07-unified.730` (occupied `.698`–`.729`). Draft PR. One Preview max.

**Excellence-Override:** F-017 first set without account

---

## Discovery (why this, not a duplicate)

| Existing | State | This PR |
|----------|--------|---------|
| Master `.696` / `.697` | Local-first **copy** + session-expired **fail-open**. Log set already never awaits auth. **Signup chrome still on the first-set path.** | Closes the chrome wall |
| [#493](https://github.com/Snedz/missionwinning/pull/493) F-017 account-lite (`.700`) | Draft, not on master. Broader: Keep this diary, 15-lang gate copy, OS-permission deferral, I-Day skip | **Do not copy** diary / gate i18n / permissions. Same first-set ungated core, tighter |
| `#505` field test · `#519` PT warning · `#728` Preview gate · `#729` transparency | Occupied / out of lane | Do not touch |
| Fallback (rest-skip legal / empty-bar log anyway) | **Not used.** F-017 is **not** on master. I-Day still has a sign-in step; Train still mounts `SignInPrompt`; header **Sign in** chip paints on a cold phone | — |

**Defect on master:** a cold invited phone can log a set (Skip exists; `handleLogSet` is ungated) but the **first-set path still is a signup wall**: I-Day step 3 is Sign in, the app header chips **Sign in**, Train mounts `SignInPrompt` under the logger, Today Lean always paints a Sign-in link (`userEmail={null}`).

---

## Goal

A cold phone logs the first set with **no account**. No signup step, no Sign-in chip, no SignInPrompt on Train. Account stays on Profile — never mid-set, never before the first log.

`PRIVATE_MODE` / `FREE_BETA` / Stripe / EIN unchanged. Free logger never gated.

---

## Non-goals (hard bans)

- Do not flip `PRIVATE_MODE`.
- Do not mint `.698`–`.729`.
- Do not rewrite [#493](https://github.com/Snedz/missionwinning/pull/493) Keep this diary / 15-lang gate / F-008 waitlist copy.
- Do not rewrite `#505` field test, `#519` PT warning, `#728`, `#729`.
- Do not add a guest-mode stack, identity merge, or device-link before first log.
- Do not force Coach, weekly-plan wall, or OS permission on I-Day.
- Do not restyle N1 / landing / logger density (F-003 stays).
- Do not block Log set / rest. Empty-bar and rest-skip copy are out of concern.

---

## Product

### 1. I-Day — no sign-in step

`WelcomePage` `STEP_ORDER` is `welcome` → `profile` only. **Continue** on profile calls `finish()` (Today `/log`, same F-004 land). The `signin` step UI is removed (dead wall). Sign-in remains on `/profile`. Edit-profile path unchanged (already finishes from profile).

`first-90` tap budget: drop the Skip-sign-in tap. **Never raise** `TAP_BUDGET`. Lower to **5** (Begin → Continue → Start → Log = 4).

### 2. Train — no SignInPrompt

`ActiveWorkoutPage` does **not** mount `SignInPrompt`. Start / Log set stay the boss. `SignInPrompt` stays for Fuel / other surfaces. `.697` fail-open on the component itself is unchanged.

### 3. Header Sign in chip — off until first workout, never on `/active`

Pure `showHeaderSignInChip({ hasFirstWorkout, pathname })`:

| hasFirstWorkout | pathname | show |
|-----------------|----------|------|
| false | any | **false** (cold / first session) |
| true | `/active` or `/active/*` | **false** (never mid-set) |
| true | other | true (quiet wayfinding) |
| (signed-in) | — | chip already returns null when email present |

`HeaderAuthChip` **must not call `getUser`** when the predicate is false (cold path stays auth-free).

### 4. Today first-session status — no Sign-in link

`TodayPageHeader`: when `hasFirstWorkout` is false, do **not** render the Sign-in `<a>`. After first workout, unsigned athletes still see the existing local-first optional line. Lean + dashboard both pass `workoutHistory.length > 0` (same signal as F-004).

No new “Keep this diary” strip.

---

## Files (expected)

| Path | Role |
|------|------|
| `src/lib/firstSetUngated.ts` | Pure `showHeaderSignInChip` (+ pathname normalize) |
| `src/lib/firstSetUngated.test.ts` | Predicate table + Welcome/Active/header wiring |
| `src/page-components/WelcomePage.tsx` | Drop signin step |
| `src/page-components/ActiveWorkoutPage.tsx` | Unmount SignInPrompt |
| `src/components/layout/HeaderAuthChip.tsx` | Predicate; skip `getUser` when hidden |
| `src/components/today/TodayPageHeader.tsx` | Hide sign-in link pre-first-workout |
| `src/page-components/HomeTodayLean.tsx` + `HomeTodayDashboard.tsx` | Pass `hasFirstWorkout` |
| `src/lib/localFirstCopy.test.ts` | Active no longer wires SignInPrompt constants |
| `src/lib/localFirstRestGuard.test.ts` | Assert Active does not mount SignInPrompt |
| `tests/e2e/first-90.spec.ts` | No Skip-sign-in tap; budget 5 |
| `docs/help/getting-started.md` + `faq.md` | First set needs no account |
| INDEX rows: `src/lib/`, layout, today, help |
| `src/lib/buildInfo.ts` · `LOG.md` · `CONTEXT.md` `## Now` | Ship protocol `.730` |

No new i18n keys (hide chrome; existing local-first strings stay).

---

## Tests

- Predicate: no first workout → chip off; `/active` → chip off; other + first workout → on.
- Welcome source: `handleProfileNext` calls `finish()`; `STEP_ORDER` has no `signin`; no `setStep('signin')`.
- Active source: no `<SignInPrompt`.
- Header: `getUser` only after predicate true; uses `workoutHistory.length` (do not invent a flag).
- Today header: Lean/Dashboard pass `hasFirstWorkout` from `workoutHistory.length`.
- `localFirstRestGuard`: Log set still no auth await; Active does not mount prompt.
- Falsify: mutant restoring `setStep('signin')` or remounting SignInPrompt on Active → red.
- `check-build-label` → `.730` past master `.697`.
- `check-excellence-gate` — override present (Welcome + header are surface).

---

## Ship

- Bump `APP_BUILD_LABEL` to `2026.07-unified.730`.
- LOG heading `## YYYY-MM-DD — F-017 first set without an account (\`.730\`)`. Rotate oldest (`.669`) to stay ≤15.
- `## Now`: add `.730` bullet; rotate oldest shipped version bullet (`.636`) to stay ≤25. Keep Status table / Excellence / Horizon W / `PRIVATE_MODE`.
- Commit trailer: `Excellence-Override: F-017 first set without account`
- Draft PR title: `F-017 first set without an account (.730)`
- Plan commit: `[skip vercel]`. Implement commit may create the one Preview. Follow-ups `[skip vercel]`.
