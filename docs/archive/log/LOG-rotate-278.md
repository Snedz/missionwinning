# Rotated for .278

## 2026-08-03 — Cold-start Coach stopped shaming new athletes (`.263`)

Phone dogfood after I-Day on a Sunday: Mission Coach painted Mon/Wed/Fri as
**Missed** and opened with *"Life happened — 3 sessions missed"* for someone who
had never had a plan. Seed placed the default mid-week pattern in the past; when
every session was already past, adapt marked them missed and had nothing left to
re-spread — so the week strip stayed a wall of shame.

**Fixes (hero / A5-allowed):**
- `generateWeek` schedules only remaining days of the current week
  (`scheduleFromOffset` + `mapToCalendar(…, notBefore)`).
- `adaptPlan` re-opens a late-week collapse onto days still left as **planned**,
  and drops unplaceable cold-start past days instead of labeling them missed.
- `usePremium` free-beta snapshot is a stable reference (no more
  getServerSnapshot infinite-loop warning).
- Logged bodyweight sets read `8 × BW`, not `8 × 0 kg`.
- I-Day hides America/PFT/kids goal chips while `america` is parked.
- GPS panel title is "GPS track" when unlocked (not "(Premium)" under free beta).

Also in `.263` (follow-up commits on the same PR):
- Public story aligned: invite-only beta bar + private gate copy (no more
  "OPEN BETA" next to "Launching soon").
- Log console shows **BW** (tap to add load) instead of a 0 kg stepper.

