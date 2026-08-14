# Frozen: PT safety — stop-is-legal before hard sessions (`.727`)

**Status:** FROZEN. Implement only this plan. Do not rewrite [PR #505](https://github.com/Snedz/missionwinning/pull/505) (field test). This PR must work on `master` even if #505 never merges.

**Label:** `2026.07-unified.727` (occupied `.698`–`.726`). Draft PR. One Preview max.

**Excellence-Override:** PT safety warning

---

## Goal

A max-effort session is never the silent default. Stopping is allowed. We do **not** claim we can prevent sudden collapse or medical emergencies.

Context that must **not** appear in product copy, comments shipped to users, help, or tests' asserted strings: a named casualty, unit, “sudden cardiac arrest” as a product claim. Do not clone USMC/ACFT branding.

---

## Non-goals (hard bans)

- Do not flip `PRIVATE_MODE`.
- Do not mint `.698` or `.699`.
- Do not implement ECG, wearable HR as a gate, or PAR-Q as a gate of the logger. `/assessments` stays optional and unconnected to Log set.
- Do not import chat or score into the new module.
- Do not rewrite PR #505 / field-test session templates / ACFT tables.
- Do not rewrite the legal pack. No EIN. Texas LLC already present.
- Do not block free logging of a **normal** set. The sheet is pre-start only.
- Do not add a new tab, pillar, locale, or America/PFT clone.

---

## Product

One reusable **hard-session warning** sheet (`AdaptiveOverlay`), shown **before** a marked hard session starts — never before a normal Just Go / seeded / prescribed training set.

### Copy the sheet must say (EN)

1. Strenuous / max-effort work can be dangerous.
2. Stop if chest pain, faint, severe shortness of breath, or you cannot talk.
3. This is not medical care. The app cannot prevent a medical emergency.
4. Call **local emergency services**, not the app.
5. Consult a clinician before max tests if you have a relevant condition or are unsure.
6. Stopping is allowed. Primary: continue. Secondary: Back (always works).

### Copy bans (must fail CI if they ship in this feature’s files)

pass/fail-as-identity · recruiter · MEPS · “we keep you safe” · “prevents cardiac events” · government test · elite ranking vs other users · shame for stopping (quit/lazy/failed as identity) · USMC / ACFT as product name · “sudden cardiac arrest” as a claim we prevent.

### Skip / Back

Back closes the sheet and **does not start** the hard session. It never disables Log set on a session that already has completed work. First-mission `/active` Start (normal seed) must not open this sheet — e2e first-90 forbids extra “Not now” chrome; this sheet’s dismiss label is **Back**, not “Not now”.

---

## What is a “hard session” (closed list)

Pure module `src/lib/workout/hardSession.ts`. One definition. Discoverable kinds, not a fuzzy “test” substring on every name (`Tester`, `latest`).

`needsHardSessionWarning(input)` is true when any of:

| Mark | On master today | When #505 merges |
|------|-----------------|------------------|
| `kind: 'pft'` or `'pft-mini'` | `/fitness-test` Continue → events | unchanged |
| `kind: 'field-test'` | unused | #505 passes this or starts a named field test |
| `fieldTest=1` search param | unused (we do **not** start a field test) | warning if a session is also starting |
| Closed **exact** names (case-insensitive): `Peaking — 1RM Test`, `Week 3 — Session 4 (Test)`, `Field test`, `Five-event field test` | 1RM / program test starts | field-test name without rewriting #505 |
| Session **name** matches closed regexes: `\b2[\s-]?miles?\b`, `\b1\s*rm\s*test\b`, `\bmax[\s-]?test\b`, `\bmax[\s-]?effort\b` | any existing 2-mile / max / test **session title** | same |

False for: empty/Just Go/Coach day names, “Push”, AMRAP WODs, exercise names like World's Greatest Stretch, any session with `hasLoggedWork` (never a logger gate).

---

## UX wiring (master)

1. **PFT** (`FitnessTestRunner`): tapping Continue to events opens the sheet first. Continue → existing `proceedFromProfile`. Back → stay on profile. Acknowledge once per page visit.
2. **Train** (`ActiveWorkoutPage`): when `activeWorkout` exists, name/kind/param is hard, and **no completed set yet**, open the sheet **instead of** (not under) the Mind check-in. Continue → dismiss, then check-in may offer as today. Back → `cancelActiveWorkout()` only if `!hasLoggedWork`. Log set / rest paths never call this.
3. **Export** `HardSessionWarningSheet` + `needsHardSessionWarning` so #505 can wrap its start later. Do not add field-test templates here.

---

## Help + legal (minimal)

- New `docs/help/pt-safety.md` — plain language: hard sessions, stop rules, not medical care, call local emergency services, Back always works, logger of a normal set is never blocked. No casualty names. No “we keep you safe.”
- `docs/help/INDEX.md` + `docs/INDEX.md` help table: add the row.
- `docs/help/fitness-test-and-school.md`: one pointer to PT safety (PFT mile run is strenuous). `docs/help/field-test.md` **does not exist on master** — do not invent that file; write pt-safety so #505 can link later.
- **Terms EN only:** append one tight sentence to `infoTermsEducationalBody` in `src/i18n/infoLocales.ts` (educational disclaimer). Do not rewrite About, Privacy, counsel exports, or non-EN overrides. No EIN.

---

## Files (expected)

| Path | Role |
|------|------|
| `src/lib/workout/hardSession.ts` | Pure predicate + closed marks |
| `src/lib/workout/hardSession.test.ts` | True for marks; false for normal set / Push / AMRAP / logged work |
| `src/lib/workout/hardSessionCopyGuard.test.ts` | Forbidden phrases cannot ship in this feature’s sources + EN strings + help |
| `src/components/workout/HardSessionWarningSheet.tsx` | AdaptiveOverlay sheet |
| `src/page-components/ActiveWorkoutPage.tsx` + `ActiveWorkoutSheets.tsx` | Train wiring |
| `src/components/fitness-test/FitnessTestRunner.tsx` | PFT wiring |
| `src/i18n/activeWorkoutLocales.ts` | EN keys (other langs `...en`) |
| `src/i18n/infoLocales.ts` | One EN educational sentence |
| `docs/help/pt-safety.md` | Help |
| INDEX rows in `src/lib/workout/`, `src/components/workout/`, help |
| `src/lib/buildInfo.ts` · `LOG.md` · `CONTEXT.md` `## Now` | Ship protocol `.727` |

---

## Tests

- Predicate: PFT / field-test kind / `fieldTest=1` / closed names / 2-mile name → true. `Push`, Just Go, AMRAP WOD, empty name → false.
- Copy-guard: banned phrases absent from hardSession module, sheet, EN hardSession* strings, `pt-safety.md`, and the new Terms sentence. Extract user-facing strings; comments may name the ban.
- Wiring: Active source includes the sheet and `hasLoggedWork` short-circuit; `handleLogSet` / log-set path does not import/call the warning. FitnessTestRunner opens it before events.
- `hardSession.ts` does not import `score`, coach chat, or rewards (source scan).
- `check-build-label` → `.727` past master `.697`.
- Falsify: a mutant adding “we keep you safe” or skipping the `hasLoggedWork` gate must fail.

---

## Ship

- Bump `APP_BUILD_LABEL` to `2026.07-unified.727`.
- LOG heading `## YYYY-MM-DD — PT safety: stop-is-legal before hard sessions (\`.727\`)`. Rotate oldest LOG section (`.669`) to stay ≤15.
- `## Now`: add `.727` bullet; rotate oldest shipped version bullet (`.636`) to stay ≤25. Do not drop Status table / Excellence / Horizon W / PRIVATE_MODE facts.
- Commit trailer: `Excellence-Override: PT safety warning`
- Draft PR title: `PT safety: stop-is-legal before hard sessions (.727)`
- Plan commit: `[skip vercel]`. Implement commit may create the one Preview. Follow-ups `[skip vercel]`.
