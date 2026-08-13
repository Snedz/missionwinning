# Frozen plan — Free plate math + warmup (logger)

**Status:** FROZEN. Implement only this file.  
**Ship:** `2026.07-unified.705`  
**Excellence-Override:** free plate math + warmup (logger)  
**Lane:** Engineering-Web · Horizon W · Train logger (`/active`)  
**Free forever.** Not Super Bundle bait. No trial. No `PRIVATE_MODE` flip.

Overnight brief: Strong-class garage utility **on the set row**. Do not invent a new tab. Do not collide with F-013 smart defaults (#489) or E-Adjacency (#487) — those PRs exist on the same master tip; **extend or skip**, do not rewrite their cells or dial order.

---

## Problem

A train-anywhere athlete loading a bar needs two answers without leaving the live set:

1. **Which plates per side?**
2. **What warmup loads before the work?**

What master already has (do not rebuild):

| Already shipped | Where | Gap |
|-----------------|-------|-----|
| Greedy plate math | `src/lib/plateCalculator.ts` | Used by header **Plates** sheet + `/calculators` tab, **not the set row** |
| Warmup as a set kind | `setKind.ts` · LogConsole Kind expand · desktop footer chips | Buried behind Kind (F-003 collapsed it). No Strong-style ramp. Set column always shows 1, 2, 3 |
| Session header Plates | `ActiveSessionChrome` | Keep. Not a substitute for seeing plates on the load |

`/calculators` already has a Plates tab — **do not add another**.

---

## Set-row grammar (what ships)

Live barbell row (compact `SetLogRow` + desktop `SetLogTable` + compact `LogConsole`):

```
W     PREVIOUS          40 kg
      8 × 40            10 + 5 / side

1     PREVIOUS          100 kg
      8 × 100           25 + 10 + 5 / side     [Log set]
```

- **W** in the set column for warmup; working sets numbered **1..n skipping warmups** (Strong).
- **Plate line** under the load when the exercise is bar-loaded and weight > bar: compact `25 + 10 + 5 / side` from existing `calculatePlatesPerSide` + `formatPlateList`. Honest empty (no line) for BW / dumbbell / cable / machine / weight ≤ bar.
- **Prev cell is untouchable** — E-Adjacency (#487) stacks Target above PREVIOUS there. Plates never go in Prev.
- **Log set stays the sole poster-red primary** (F-003 / `.694`). Plate line is muted ink, not a second primary.

---

## A. Plate math on the live set

**Pure** (extend `plateCalculator.ts`, do not fork):

- `isBarLoadedEquipment(equipment?: string)` — true for `Barbell` and `Trap Bar` only (catalog `equipment` field, case-insensitive). Do not guess from the exercise name.
- `setRowPlateLine({ equipment, weight, units })` → `string | null`  
  null when not bar-loaded, weight ≤ `defaultBarWeight`, or no plates.  
  Otherwise `formatPlateList(perSide, '')` so the row can append `/ side`.

**UI (live set only — same “only the live row” rule as E-Adjacency):**

| Surface | What |
|---------|------|
| Compact `SetLogRow` (`isNext`) | Muted plate hint under the metric (`data-testid="set-row-plates"`). **Not** a 44px competing CTA — header Plates stays the 44px sheet opener. |
| Compact `LogConsole` | Same line under the weight stepper (`data-testid="log-console-plates"`). Tappable ≥44px ink control → existing `PlateCalculatorSheet` (bar / remainder / Apply). |
| Desktop `SetLogTable` active weight cell | Same line under the input (`data-testid="set-table-plates"`). Tappable → same sheet. |
| Completed / idle rows | No plate line (F-003 density). |

Keep `ActiveSessionChrome` Plates + `PlateCalculatorSheet` + `/calculators` as they are.

Live compact row uses **dial weight** (parent passes it) so the hint tracks the console, not the stale template.

**Free:** these modules must not import premium / Bundle / trial. Guard discovers the new files rather than enumerating a closed list.

---

## B. Warmup on the set row

**Pure** `src/lib/workout/warmupRamp.ts` (new, colocated test):

Ramp of **three** steps off the **working** load, garage olympic defaults:

| % of work | Reps |
|-----------|------|
| 40% | 8 |
| 60% | 5 |
| 80% | 3 |

Each step: `roundToStep` with `weightStep(units)`, then skip if `≤ bar` or `≥ work` or duplicate of another step. Empty result → do not insert.

Working load (first hit wins):

1. Live dial when the live set is a **working** set and weight > 0
2. First incomplete working set’s planned weight > 0
3. Last completed **working** set
4. Else null → hide **Add warmups**

`insertWarmupSets(sets, ramp)` inserts the ramp immediately before the first incomplete set. **Idempotent:** if incomplete warmup weights already match the ramp in order, return sets unchanged.

`setRowOrdinal(sets, idx)` → `{ warmup: true, label: 'W' }` or `{ warmup: false, label: '1'.. }` counting only non-warmup sets up to idx.

**UI:**

- Set column shows `setRowOrdinal` label on every row (`SetLogRow` + `SetLogTable`).
- Live set number is a ≥44px **Work ↔ Warmup** toggle (`data-testid="set-row-warmup-toggle"` / `set-table-warmup-toggle`). Does **not** reopen the four-kind strip (F-003). Failure / drop stay behind Kind.
- Exercise footer, next to **Add Set**: outline **Add warmups** (`data-testid="active-add-warmups"`) when bar-loaded **and** a working load exists **and** the ramp is not already present. One tap inserts. Hidden when already present (idempotent).

**Carry (compose with F-013, do not rewrite dial order):**

`priorCompletedInExercise` must skip `kind === 'warmup'` so logging a warmup cannot prefill the next **work** set with 40/60/80%. Do **not** change `resolveSetInput`’s prescribed-vs-carry-vs-suggestion order — that is F-013’s (#489) cell. Skipping warmup in the existing helper is the extend; F-013 rebase keeps the skip if it still calls this function.

---

## C. Collisions — skip / extend

| PR | Owns | This ship |
|----|------|-----------|
| #487 E-Adjacency | Target stacked **above PREVIOUS** in the Prev cell | **Do not** rewrite `SetLogTable` Prev `<td>` / `SetLogRow` prev span. No Target/cite work. |
| #489 F-013 | `resolveSetInput` / `resolveActiveSetDial` session carry beats prescription on the **next** set; `log-console-reps` / `log-console-weight` | **Do not** reorder `resolveSetInput`. **Do not** add those testids (theirs). Skip warmup inside `priorCompletedInExercise` only. |
| #477 `.698` · #478 `.699` · #494/492 `.704` | Build labels | Label **`.705`**. Do not steal `.698`–`.704`. |

No restyle of Today/Train chrome. No N1 www. No `#485`. No new nav item. No Android this ship.

---

## Out of scope (hard)

- Custom plate inventory / bumper vs iron / collar / ez-bar picker (sheet bar field already exists)
- Auto-insert warmups without a tap
- Numbering W1/W2 (all warmups are **W**)
- Gating behind account, trial, or Super Bundle
- `/calculators` tab changes
- Freshness selection, account-lite F-017, Victory, Coach plan engine

---

## Tests (falsify, then keep)

- `plateCalculator.test.ts` — `isBarLoadedEquipment` closed list; `setRowPlateLine` null vs `25 + 20` (100 kg / 20 kg bar); 225 lb exact.
- `warmupRamp.test.ts` — 100 kg → 40/60/80 rounded; skip ≤ bar; idempotent insert; ordinal W then 1,2; mutants: empty ramp when work ≤ bar.
- `priorCompletedInExercise` skips warmup (so F-013 cannot carry 40 kg onto work).
- Source guard: new plate/warmup UI + lib files do not import premium/Bundle/trial; `SetLogTable` Prev cell still has no plate helper.
- Density: LogConsole / SetLogTable still exactly one `primary-action` (existing `.694` guards).
- i18n keys in `activeWorkoutLocales.ts` (`...en` fills other packs). Coverage stays 0 uncovered.

---

## Docs / ship protocol (same commit as the code)

- This file (already frozen)
- `LOG.md` + rotate oldest live entry (`.669`) so the file stays at 15
- `CONTEXT.md` `## Now` one bullet for `.705`
- `APP_BUILD_LABEL` → `2026.07-unified.705`
- `src/lib/workout/INDEX.md` + `src/components/workout/INDEX.md`
- Help: one line on getting-started — plates + warmup on the Train set row, free

Commit trailer:

```
Excellence-Override: free plate math + warmup (logger)
```

Draft PR. Preview at most one. Never flip `PRIVATE_MODE`.
