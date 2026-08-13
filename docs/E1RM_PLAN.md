# Frozen plan — educational e1RM on the exercise row (`.739`)

**Status:** FROZEN 2026-08-13. Implement this file; do not reopen formula, CTA, or medical scope.
**Label:** `2026.07-unified.739` (past master `.697`; `.698`–`.738` left for sibling drafts).
**Excellence-Override:** e1RM estimate

---

## Decision (named formula)

**Epley.** `weight × (1 + reps / 30)`, via the existing `epley1rm` in `src/lib/calcHelpers.ts`.

Not Brzycki. Not the hybrid in `estimate1rm` (`src/lib/coach/progress.ts`, Brzycki ≤10 / Epley >10). That hybrid stays the coach / benchmarks / percent-load number. The live row is an **educational Epley readout from this session’s working sets**, named in copy so the athlete can look the formula up.

A logged single (`reps === 1`) is the weight itself — Epley is not applied to a 1-rep set (it would invent ~3%). Reps above 12 do not feed (same cap as `MAX_REPS_FOR_E1RM`; that range is work capacity, not a 1RM estimate).

---

## What ships

After a **completed working set** is on the Active exercise card, show one quiet line on that exercise header:

`est. 1RM ~{{e1rm}} {{unit}} (Epley) — formula estimate, not a tested max`

- Best Epley among countable completed sets on **this exercise, this session**.
- Same unit as the logged load (no kg/lb conversion).
- Guests: local sets only. No account, no API, no premium gate.
- Default **on**. Hide from the exercise overflow menu; persist on-device (`mw_show_session_e1rm`). Show again from the same menu.
- Free.

---

## What does not feed the formula

| Set | Why |
|-----|-----|
| Warmup (`kind === 'warmup'`, badge **W**) | Not evidence of strength — `countsTowardStrengthEstimate` |
| Failure | Same predicate; not a new rule |
| Load 0 / bodyweight skip (`weight <= 0`) | Nothing to extrapolate |
| Incomplete / planned rows | Not saved yet |
| Reps ≤ 0 or > 12 | Refuse |

---

## Safety (non-negotiable)

Copy must say this is an **estimate from the Epley formula**, not a tested max.

**Banned in this feature’s EN strings** (guarded):

- “your max”
- “test your 1RM” / “test your max”
- prescription / “do this weight”
- medical / “safe PT”
- USMC / ACFT-official branding

**Do not add:**

- A “test your 1RM” CTA
- Field-test / max-effort session chrome — held in #505 / #519
- A new faint / chest-pain / can’t-talk hard-session flow (already exists; do not duplicate)
- Coach planner input, rewards, leaderboard, or percent-load rewrite

---

## Files

| Path | Change |
|------|--------|
| `src/lib/workout/sessionE1rm.ts` | Pure: Epley from sets + hide pref + EN copy constants |
| `src/lib/workout/sessionE1rm.test.ts` | Formula + warmup / load-0 exclusion |
| `src/lib/workout/sessionE1rmCopy.test.ts` | Copy does not say “your max”; names Epley + estimate |
| `src/components/workout/ActiveExerciseHeader.tsx` | Line after a countable saved set |
| `src/components/workout/ActiveExerciseMoreMenu.tsx` | Hide / show |
| `src/i18n/activeWorkoutLocales.ts` | EN keys; other langs inherit via `...en` |
| `src/lib/storage/keys.ts` | `showSessionE1rm` |
| `docs/help/e1rm.md` | Athlete help — educational, no test CTA |
| INDEX rows for workout / help / this plan | One-line |

No new route. No API. No Android this PR.

---

## Tests (done bar)

1. Epley: `100 × 5` → `117` (`Math.round(100 × (1 + 5/30))`).
2. Warmup-only and `weight === 0` → `null`.
3. Copy constants + header defaultValues: no “your max”; must contain “Epley” and “estimate” and “not a tested max”.
4. Pref default visible; `'0'` hides.

---

## Ship protocol

Same commit as the code: `LOG.md` + `CONTEXT.md` `## Now` + `APP_BUILD_LABEL` `.739`.
Rotate LOG (≤15) and Now (≤25). Draft PR. Do not merge. Do not flip `PRIVATE_MODE`. Do not invent traction. No secrets, no EIN.

`[skip vercel]` on intermediate commits. One Preview at end if Hobby allows.

---

## Out of scope

History / benchmarks charts (already have estimates). Calculator page. Field test. Hard-session warning. Prescriptions from this number. “Your max” language anywhere in this ship.
