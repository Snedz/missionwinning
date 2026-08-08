# Rotated for `.616`

## 2026-08-08 — A missed day is narrated, not deleted (`.601`)

`adaptPlan`'s ordinary branch — a day missed *and* future days still ahead — ended `sessions = [...doneSessions, ...reassigned]`. Every missed session was dropped from the week.

**The stated reason did not apply to this branch.** The comment said dropping them stopped the week strip "painting Missed on days the plan left" — but nothing left those days. The branch *above* re-opens the **missed** sessions themselves onto the days that remain, which is why it must dedupe against `placedIds`; this branch re-spreads **`remaining`**, the still-future sessions, and never touches `missed` at all. There was no duplicate to avoid. The filter deleted the only record that a day had been missed.

**The cost was the entire adaptation story.** `summarizeCoachAdaptations` filters `status === 'missed'`, so it saw none: no "Life happened…" beat, `hasCoachAdaptationSignal` false, `CoachAdaptBanner` returning `null` — in the file whose own header calls it *"demo-critical: partners must see log/miss → week changed in ≤60s"* — and the re-entry block gone with it. The athlete missed Monday and the week quietly got smaller with nothing said. Horizon W criterion 4 is "missed day → re-entry without shame"; there was no re-entry at all.

**The beat's own copy proves the intent.** *"Life happened — missed {days}. **Remaining days are re-spread** so the week still fits. No shame; just continue."* That sentence describes this branch exactly — and this branch was the one case that could never render it. The message was written for the code path that deleted its own trigger.

Keeping them is also what the rest of the app already assumes: `PlanSessionCard` gives a missed session a deliberate dashed border and "Missed" badge, never dimmed past contrast, because *"it is behind you, not hidden from you (Horizon W criterion 4)"*. Hiding a missed day is not kindness — it is the plan losing the athlete's week. The fix is one line: `[...doneSessions, ...missed, ...reassigned]`.

**`WeekStrip` was shouting the wrong day.** `SessionGlyph` drew every non-done glyph in `text-primary`, so a missed day carried the same red dumbbell as a live one, immediately beside the strikethrough that exists to say the opposite — the loudest thing in the row was the day the athlete did not train. Muted, matching `.127`'s rule that missed days are de-emphasised by border, never by opacity (dimming the container also dims the label past 4.5:1).

**2191 tests were green over the drop**, so the new guard drives `adaptPlan` end to end and asserts the beat, the signal, the re-spread and the absence of duplicates.

Mutants: 3 killed — restore the drop → 3 red; missed glyph back to the live accent → red; remove the cold-start `placedIds` dedupe → red. **That third one took three attempts, and the failures are the finding.** The first two versions of the dedupe test used an all-missed fixture, which takes the `: []` arm of `doneSessions.length > 0 ? … : []` — so the filter I was mutating was *unreachable* and the suite stayed green twice. `CLAUDE.md` §6's *assert preconditions, never skip past them*, met from the fixture side rather than the `if`-guard side: the test now seeds a done session and asserts it reached that arm before checking for duplicates. Tests 2183 → 2191.
