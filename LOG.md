# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.195`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30).

---

## 2026-07-30 — One week, one answer (`.199`)

Two live bugs. Not hygiene — wrong numbers on screen, and a coach feature that
could never fire.

### The week started on different days depending on which file you asked

Monday-offset arithmetic was re-derived **eight times across seven files**, and
**four of those derivations were wrong**, each in a different band of the world:

- `activityLog`, `challenges` and `pillarScoreInputs` called `toISOString()` on a
  local date. `toISOString()` is UTC by definition, so east of UTC the answer was
  the previous day for most of the evening. Reproduced under `TZ=Asia/Tokyo`:
  the week began **Sunday 07-26** when the correct Monday was **07-27**.
- `coach/splitPlanner` anchored to local noon first — which reads as a fix, and
  covers every offset strictly inside ±12. Not UTC+13 or UTC+14. Reproduced
  under `TZ=Pacific/Kiritimati`: same off-by-one-week, at every hour of the day.
- `historyAnalytics` held **two more** the audit had not found, and they bucket
  and label the weekly volume chart. Both noon-anchored, both UTC-derived.

So `getWeeklyStats()`, the weekly challenge state, the pillar-win counter and the
volume chart disagreed with the coach plan and the week recap about which week it
was. Timezone- **and** time-of-day-dependent, which is exactly why a suite that
runs near UTC midday never saw it.

Pulling that thread found the same mistake in its smaller form: `const today =
new Date().toISOString().split('T')[0]` — a **UTC** date written into records
keyed by **local** dates. **36 call sites across 24 files**, including the
training streak (`streaks.ts`), pillar wins, macro targets, assessments, GPS
activities and the daily coach-insight cache key. A Tokyo athlete training at
08:00 local was writing yesterday's date.

New [`src/lib/time/localDate.ts`](src/lib/time/localDate.ts) is the one
implementation: `localDateKey`, `localDateKeyFromIso`, `startOfLocalWeek`,
`localWeekKey`. **The rule is that a calendar date is a local fact and
`toISOString()` is an instant in UTC** — the two coincide only for a narrow band
of longitudes, which is not a property to build on. Five duplicate local-date
formatters collapsed into it as well.

**A comment I wrote and could not defend.** The first draft justified the
`setHours`/`setDate` ordering as a DST guard. A mutant that swapped the order
survived, so I swept 2026 across nine DST-heavy zones (Santiago, Beirut, Havana,
Lord Howe, Chatham …) at six hours a day: **zero** dates where the two orders
disagree. The claim was false. It is deleted rather than tested — a comment
asserting a mechanism nobody verified is the `.195` header-menu defect in prose,
and I had just written a whole PR about that.

### The coach branch that could never run

`savePreferredDays` (`coach/schedulePrefs.ts`) had **zero callers**. It was the
only writer of `mw_preferred_days`, so `loadPreferredDays()` always returned
`[]`, so `mapToCalendar`'s `preferredDays.length >= count` was never true and the
even-spread fallback always ran. Its sibling `saveDaysPerWeek` *is* wired, which
is why the pair read as finished. `.176`/`.196` a third time.

Sharpest detail: `splitPlanner.test.ts` **already had** a test called *"honors
preferredDays"* — and it passes them in directly. It proved the branch worked
while nothing on earth could reach it. That is the `.195` shape stated as
precisely as it gets.

Fixed by wiring the control it never had, into the existing training-profile card
next to days-per-week. The stored numbers are **offsets from Monday**, not
`getDay()` values — same space as `defaultPreferredOffsets`, and getting it wrong
would shift a whole plan by a day with no error, so the module says so.

### Guards

`reachability.test.ts` gains: start-of-local-week and local-date-formatting as
`SINGLE_DEFINITION` concepts, `schedulePrefs` in `WAVE_MODULES`, and a standalone
rule that **no calendar date is derived from `toISOString()`** anywhere in
product source. `time/localDate.test.ts` runs every hour of a week through nine
zones from UTC+14 to UTC−11, including a non-integer offset (Chatham, +12:45),
and asserts they all name the same Monday.

### Falsification

Killed: `week-start-utc-date`, `noon-anchor-instead`, `sunday-off-by-one`,
`seventh-week-definition`, `utc-date-returns`, `preferred-days-never-written`,
and `feel-written-nowhere` re-run as a regression check.

**Two survived first run.** `setdate-before-sethours` survived because the hazard
it modelled does not exist — that is the false comment above, and the response
was to delete the claim, not to invent a test for it. `preferred-days-never-written`
survived because deleting the call left the *import* behind, and `mentions()`
counted it: **the identical importing-is-not-using hole `.198` hit with
`dynamic(() => import('…/TodayDayReviewCard'))`.** Third appearance of that hole
in two PRs. Fixed once, in the helper — `mentions()` now strips import statements
before counting — rather than a third time at a call site.

Tests 988→999. LOG rotated (`.196`).

## 2026-07-30 — The rule the test was not measuring (`.198`)

The fix is two words. The deliverable is what had to happen before those two
words could be trusted.

`.194` put a **second poster-red button on Today** — a default-variant shadcn
`Button` renders `bg-primary-fill`, and the design docks exactly one red action.
Two tests should have caught it. Neither did:

- *"Today offers exactly one primary action"* counts elements carrying the
  **`.primary-action` class**. The offending button had the colour without the
  class. The test measured the implementation, not the design.
- *"every control on the logger is thumb-sized"* is scoped to **`/active`**.
  The button was 36px (`size="sm"`) on `/log`.

Two green tests, neither measuring the thing it is named for.

**Guard 1 — appearance, not class name.** `helpers/redActions.ts` reads each
control's **computed background** and matches it against the three reds the
system defines. The rule is stated as *the dock owns red, the cards do not*,
rather than "at most one red button": the hero renders a grey Just Go variant in
some states, so a page-wide count of one was satisfied by the offending card
button alone while the real CTA was not even red.

**Guard 2 — the sweep reaches more than one screen.** The 44px body moved to
`helpers/thumbSweep.ts` and now runs on `/active`, `/log` (09:00 and 19:00) and
`/mind`. **On its first run it found roughly thirty undersized controls** — the
breathing pattern chips, every 1–5 rating button in the check-in, and each
guided-session transport control, all 36px. All fixed here. It also surfaced
something systemic and **not** fixed: the Button primitive's *default* size is
`h-10`, 40px, under the 44px floor `.125` set. Raising it changes every button
in the app, so it is named here as a founder call rather than made quietly.

**Guard 3 — the budget from outside.** `todayBlockBudget.test.ts` proves
`planTodayBlocks` respects the cap; that is a claim about a function. The
dashboard could stop calling it and stay green. An e2e case counts what actually
rendered, importing `TODAY_MAX_TOP_LEVEL_BLOCKS` so the two bounds cannot drift.

**Guard 4 — the cheap version, in `check-display-type`.** A script that runs in
a second and names the file, so the failure arrives when the line is written
rather than at the end of a browser run. **It found a second red CTA on its
first run** — a red-filled `Log check-in →` link in `TodayJournalStrip` — now
outline. The one exemption (`MuscleFreshnessStrip`'s progress-bar fill, inside
an `aria-hidden` span) matches on the class string rather than the file, so it
cannot also excuse a button added to that file later, and costs a written reason.

**The part worth recording.** Guard 1 passed with the bug still in place **three
times** while being written, each time because the surface was not on screen:
the day-review card returns null without data to review (by design, `.192`); the
push opt-in needs a VAPID public key, **unset in every e2e run this repo has ever
done**, so every push surface has always rendered nothing under test; and the
opt-in mounts only after an `await import('@/lib/pushClient')` resolves. A colour
assertion against an absent element is green and meaningless. The test now waits
for both the card and the button explicitly and fails on the precondition if
either stops rendering — and `gate.mjs` injects a placeholder VAPID public key,
the same shape as the placeholder Supabase keys already there. That is a
genuinely new hole closed: it was not just this guard that was blind.

The falsification proof, run end to end: with the red button restored, the legacy
`.primary-action` assertion **passes** while Guard 1 **fails**, naming the
button and its colour — `card surfaces must not use the docked action's red —
found 1: Turn on [rgb(221, 42, 14)]`.

Killed: `second-red-cta` (both guards), `budget-drifts-in-css`,
`allowlist-without-a-reason`. `sweep-scoped-back-to-active` and
`evening-untested` are established by construction rather than by a mutant run —
the widened sweep found thirty real offenders the `/active`-only version never
saw, and at 09:00 `dayReviewMayMount` means there is no card to measure.

Gate e2e 39→46. Tests 988, unchanged — this PR is e2e and script guards.

## 2026-07-30 — One pass over the day (`.197`)

Today grew a card at a time, and each card read the day for itself. By `.196` a
single render ran `loadCheckIns()` **five times**, computed
`computeBehaviorImpacts(history, checkIns)` **twice with byte-identical
arguments**, and built the entire weekly debrief on a Tuesday in order to read
`isFullDebrief` off it and discover it was not the weekend.

**The fix is deliberately not per-card memoisation** — that is what produced
this. Four correct caches over four identical computations is still four
computations, and each one hides its cost inside a component where the
duplication is invisible. New [`todayDigest.ts`](src/lib/today/todayDigest.ts)
owns the day and the cards read fields off it; new
[`useTodayDigest`](src/hooks/useTodayDigest.ts) reads storage once, holds it in
state (device storage is not a React input — a quick-log write has to trigger
the re-read explicitly) and exposes `refresh()`.

`isFullDebriefDay` is pure date arithmetic and **is** the debrief's own test,
not a heuristic that could drift from it — pinned by a test that runs both
across a whole week. So `buildWeeklyDebrief` is now imported dynamically and
only on Sunday or Monday. It is injected rather than imported into the digest
for one reason: *"it ran zero times"* is a property a test can assert, and a
comment claiming "we skip this midweek" is not.

New [`todayBlockBudget.ts`](src/lib/today/todayBlockBudget.ts):
`TODAY_MAX_TOP_LEVEL_BLOCKS = 7` and `planTodayBlocks`. Every feature since
`.170` added a permanent `+1` to this screen and none removed anything, because
no PR is ever the one that made Today long — a commissioned athlete on a Sunday
evening with a re-entry card saw eleven top-level blocks, which is a feed, not a
dashboard. Overflow is **not deletion**: blocks past the budget spill into the
"Today details" disclosure that already exists. Pinned blocks (header, beta
banner, re-entry) never spill, because a budget that can hide the page header is
a bug wearing a constraint's hat. Priority decides *what spills*, never *what
order things read in* — sorting the visible screen would make cards jump between
renders as their conditions flip. The number is **a judgement, not a
measurement**, and it lives alone in one file precisely so it can be argued with.

**A silent correctness bug, found while pulling the catalog off the Today
chain.** `buildMuscleHeatmap` resolved muscles with `EXERCISES.find()` against a
catalog whose extended modules load lazily — only the base set exists at import
time — so **every session built from an extended-catalog exercise contributed
zero**, and the athlete saw those muscles reported as untrained. No error, no
warning, and no failing test, because the fixture had always used `bench-press`.
Now stored groups first (`resolveMajorMuscleGroups`, as `readinessIndex` already
did), catalog as the fallback for logs written before the snapshot existed. The
first attempt at this deleted the fallback and regressed those old logs; the
existing test caught it, which is the system working.

Also: `shareCard` moved to `await import()` inside the handler (canvas
rendering, paid for only by someone who taps Share); `totalVolume` and
`getTrainingStreak` memoised — both walk the whole history and both ran on every
render, including every keystroke in the customise dialog; `StaggerReveal`
70→50ms with the index capped at 6, so the last block fades in at 340ms instead
of **740ms** — past roughly 400ms a delay stops reading as motion and starts
reading as waiting. `TodayWeekRecapCard`'s `forceFull` prop had **zero callers
anywhere** and is deleted under the `.195` rule.

Guards: [`todayPerf.test.ts`](src/lib/todayPerf.test.ts) — no static import of
`shareCard` or `weeklyDebrief` from the Today path, `loadCheckIns` called
**only** in the digest hook, and each correlation with exactly one call site.
Plus a 32-combination budget matrix over the conditional cards, and a heatmap
fixture whose exercise the base catalog has never heard of.

Seven mutants; **one survived first run.** `two-identical-impact-passes`
recomputed `computeBehaviorImpacts` for the evening review and walked through the
behavioural test, because "ran exactly once" is *not observable through the
return value* — a second pass over the same arrays produces an equal result. The
property lives in the number of call sites, so that is now what is asserted, and
the guard says plainly that it is a shape rule and why injection was not the
answer here. Killed on first run: `tuesday-pays-for-sunday`,
`budget-as-suggestion`, `header-spilled-into-more`, `catalog-static-again`,
`card-reads-storage-again`, `heatmap-forgets-the-log`.

Tests 961→988.

## 2026-07-30 — The hour the athlete picked (`.196`)

`.176`, closed. `.194` shipped a `day_review_hour` column, a migration, a cron
that selects on it, an hourly workflow and a tone-tested push — and exactly one
writer: [`DayReviewOptIn`](src/components/today/DayReviewOptIn.tsx), which
**returned early whenever a push subscription already existed**. That is every
athlete who had turned on the wind-down note, which is precisely the population
that would want an evening review. `day_review_hour` stayed NULL, `dayReviewDue`
was always false, and the feature fired for nobody. Every test passed, because
every test asked whether the decision was *correct* and none asked whether the
input could ever arrive.

**The fix is one row of a truth table.** New pure
[`dayReviewPrefs.ts`](src/lib/dayReviewPrefs.ts) makes `dayReviewOfferState` a
total function over its input, and the row is `hasPush: true, storedHour: null →
'offer'`. Having push and having an evening hour are different facts: a device
with push was asked about the *wind-down* note, and nothing had ever asked it
about this. Written as a function rather than a chain of early returns for a
plain reason — a decision spelled `if (…) return;` can only be read by
re-deriving it, while a decision spelled as a function over an input can be
enumerated by a test, and this one now is, across all 32 combinations.

`readDayReviewHour` never throws and never guesses: it reads whatever is on the
device, including values from an older build, and **anything unparseable means
not opted in rather than a default hour**. An unrequested nightly notification is
the one failure this feature cannot have.

**A one-time offer is not a setting.** The other half of the `.176` shape was
that the picker lived inside a card which remembers it already asked — dismiss it
once and the column was unreachable for good; choose 20:00 and you could never
move it to 21:00. New
[`ProfileDayReviewRow`](src/components/profile/ProfileDayReviewRow.tsx) gives it
a permanent home next to the other push preferences, gated on `pushSupported`
rather than `pushOn` so that choosing an hour is itself how the review gets
turned on — gating it behind push already being enabled would rebuild the dead
end from the other side.

**`null` and `undefined` stay distinguishable, and that distinction is the
safety property.** `null` is the athlete choosing Off and must reach the column
as a NULL, or the note keeps arriving after they said stop. `undefined` is an
unrelated sync — a Profile mount, a finished session — which knows nothing about
this preference and must leave it standing. Collapsing them is a real defect in
either direction: one way the athlete cannot turn it off, the other way any
passive page mount silently turns it off for them. `apiSchemas` gained
`.nullable()`; `buildSubscriptionRow` already omitted `undefined` and now carries
a note saying why it must keep doing so.

Guard: [`pushPrefsReachable.test.ts`](src/lib/pushPrefsReachable.test.ts) walks
the chain every preference must survive — type → row builder → client → cadence
sync → **a named control the athlete can actually operate**, wired into a screen
rather than only into a card that remembers it asked. *A server column the user
cannot set is a column that stays NULL forever*, as one executable rule.
`control: null` is a legitimate answer for a field the app derives, and costs a
written reason.

Seven mutants; **two survived first run, both holes in the guards rather than in
the code.** `cadence-clobbers-hour` walked through a source-text check because
grepping for a field name cannot tell `{ dayReviewHour: storedHour }` from
`...(storedHour !== null ? {…} : {})` — and those two differ by whether opening
Profile on a laptop silently clears the hour set on a phone. The rule became
`cadenceHourPatch`, a function whose output a test can hold instead of its
spelling. `hour-never-leaves-the-device` walked through because the guard sliced
from `readPushCadence` to the *end of the file* and matched a different function
two hundred lines below — a guard against an omission that could not see the
omission. Both now kill. Killed on the first run:
`optin-hidden-when-push-on` (the `.176` recurrence itself),
`hour-out-of-band-accepted`, `garbage-falls-back-to-a-default-hour`,
`off-is-just-undefined`, `no-control-for-the-column`.

Tests 939→961. **Ships dark** — VAPID unset, so nothing sends; the setting is
stored and synced, and the doorbell rings when the founder adds the keys.
