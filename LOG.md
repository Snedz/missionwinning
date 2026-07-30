# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.193`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30).

---

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

## 2026-07-30 — Reachable, or deleted (`.195`)

The `.190`–`.194` wave computed the right things and shipped them where nobody
could get to them. Three separate recurrences of this repo's own documented
defect class, all verified against the code rather than inferred:

- **`.192`/`.193`/`.194` reached zero new athletes.** `HomePage` routes phases
  `i-day` and `basic` to [`HomeTodayLean`](src/page-components/HomeTodayLean.tsx),
  and the phase defaults via `phase ?? 'basic'` — so the shell every new user
  lands on is the lean one, and it contained **zero** references to the Day in
  Review card, the behavior impacts it carries, or the push opt-in nested inside
  it. Three PRs of work, mounted only in the dashboard shell.
- **`.184` live again.** `setJournalFeel` had no callers at all while
  [`JournalTimeline`](src/components/history/JournalTimeline.tsx) rendered
  `· Feel N/5`; the victory sheet wrote `energy` to the check-in and nothing to
  the journal entry. A field on screen that could only ever be blank.
- **Two `.178` two-definitions seams minted in one night.**
  `TodayDayReviewCard` re-implemented quarter-hour rounding inline while
  `roundToQuarterHour` sat in `behaviors.ts` — and the inline copy got the
  midnight wrap wrong, which is precisely the bug a second definition exists to
  produce. `BehaviorStrip` and `behaviorImpacts` both re-implemented
  `BEHAVIORS.find` while `behaviorById` sat with no callers. Auditing that
  turned up a **third** rounding, in `sleepConsistency.bedClock`.

**Deleted first**, because the smallest honest diff is a smaller one:
`EXTENDED_NAV_SECTIONS` + `extendedNavSectionsForPhase` (zero non-test
importers — `railGroupsForNav()` is the live path) and their four test cases;
the `dayReviewLines` export, moved into `dayReview.test.ts` as the local helper
it always was; both inline rounding copies; both local `BEHAVIORS.find`
lookups. Also deleted: the `navConfig.ts` comment claiming certain links "stay
in the header menu". There has been no header menu for months, and that comment
is why `/benchmarks` — a live, axe-swept, enabled-by-default surface — was
reachable from nothing but a typed URL. A comment that names a home which does
not exist reads like an answer, which is worse than silence.

New pure [`dayReviewMount.ts`](src/lib/today/dayReviewMount.ts) — one function,
both shells, deciding who sees the evening card. It also **hoists the hour gate
to the mount site**: that test used to live inside the card's own effect, so
09:00 downloaded `dayReview`, `sleepConsistency`, `behaviorImpacts`,
`behaviors`, `coach/load`, the opt-in and `pushClient` in order to render
`null`. `i-day` is excluded (an athlete twenty minutes in has no day to review);
every other phase is included, because the card already refuses itself when
there is nothing true to say. Founder call: the card mounts on the lean shell,
since self-suppression is the right gate, not a phase list.

`setJournalFeel` wired end to end — `log.id` threaded from the completion
handler through the same state that drives `victorySummary`, and through
[`ActiveEmptyState`](src/components/workout/ActiveEmptyState.tsx), which is the
**live** post-completion path (the inline sheet in `ActiveWorkoutPage` is dead
once `activeWorkout` is null). And `sleepConsistencyProgress` /
`sleepCollectingLine`, mirroring `behaviorImpacts.collectingLine`: below five
nights the band correctly says nothing, but to an athlete four nights in
"nothing" and "this feature is broken" look identical.

**The guards are the deliverable**, in the `surfaceReality.test.ts` idiom —
source-text reading, riding `npm test` inside `npm run gate`, which matters more
than usual while Actions is billing-blocked and the local gate is the only gate.
[`reachability.test.ts`](src/lib/reachability.test.ts): every wave export has a
caller (`ALLOWED_ORPHANS` is empty, and each row would cost a written reason);
a rendered field has a writer the product calls, targeting the row that
completion just saved; a Today card is rendered in **both** shells; one concept
has one definition. [`navTruth.test.ts`](src/lib/navTruth.test.ts): every path
of an enabled surface is in the bottom bar, the rail, `MoreSheet`'s quiet links,
or a `NAV_EXEMPT` row with a reason — carrying `/benchmarks` and `/programs` as
**founder decisions on the record** instead of rot.

Twelve mutants killed: `evening-card-readiness-only`, `card-mounts-at-nine`,
`i-day-reviews-nothing`, `feel-written-nowhere`,
`feel-written-to-the-wrong-entry`, `two-roundings`, `two-lookups`,
`sleep-silent-while-collecting`, `orphan-allowlist-as-escape-hatch`,
`nav-exempt-without-a-reason`, `card-mounted-only-in-a-comment`, and
`card-missing-from-lean-shell` — **which survived its first run.** The shell
guard counted name occurrences, and the deleted JSX left the name behind inside
`dynamic(() => import('@/components/today/TodayDayReviewCard'))`. An
importing-is-not-using hole in the test written specifically to catch
importing-is-not-using. It now requires the JSX tag. That is the fifth mutant
across this wave to survive first contact, and the fifth to expose a hole in a
**test** rather than in the code — which is the entire argument for running them.

LOG rotated: `.180`–`.188` moved to
[docs/archive/log/LOG-2026-07-29_to_2026-07-30.md](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md)
(the file was 35KB against a 20KB rule). Tests 923→939 (four dead nav cases
deleted, twenty added); route tests 7, unchanged.

**Recorded, not fixed:** `NEXT_PUBLIC_SURFACES=wedge` parks `/mind`, which takes
the behavior journal *and* sleep consistency offline entirely. That is a
deployment-configuration consequence, not code debt — noted so nobody ships
wedge-only and wonders where `.190`/`.191` went.

## 2026-07-30 — The doorbell, not the letter (`.194`)

Last PR of the behavior-journal wave: the opt-in evening day-review push.

**The push carries no numbers, because the row it is sent from carries none.**
[`20260801_day_review_push.sql`](supabase/migrations/20260801_day_review_push.sql)
adds exactly two columns — a chosen hour (a preference integer of the same class
as `days_per_week`) and its own send marker. The `20260730` migration already
refused to store a three-value load zone, on the reasoning that a per-session
stream of zones is reconstructable training history through the back door; a
caffeine count or a sleep figure is categorically worse than that. So the server
knows only *when* to ring. The review itself is composed on the device, from
data that never left it, when the athlete opens the app.

Pure [`dayReviewNudge.ts`](src/lib/dayReviewNudge.ts) decides: only at the hour
the athlete chose (18–22, strictly opt-in — no hour means no push, ever), only
once per local day, never without a time zone, and **never on a night the
wind-down note already spoke**. `windDownDue` carries the mirror of that clause,
so the one-push-per-evening rule holds from both directions rather than one. The
push-fatigue research is blunt about why: roughly a third of users uninstall past
six notifications, and even a single weekly push costs about a tenth of them. One
a day, at a named hour, or none.

Its own cron route and hourly workflow (at :11, offset from wind-down's :07 so
the two evening sweeps do not race on the same table), and its own
`mw-day-review` tag — a shared tag would let one kind replace the other's
unopened notification.

Falsified: `second-push-same-evening` in **both** directions,
`behaviors-on-push-row` (a column-allowlist test proving no behavior-shaped
field can serialize onto the row, plus a leak check for caffeine, bed time,
alcohol, sleep-debt and review text), `push-copy-contains-numbers`,
`hour-null-fires`, `no-timezone-sends`, `marker-same-day-resends`.

**Ships dark**, exactly as wind-down did: VAPID unset means nothing sends, and
the workflow skips loudly without `CRON_SECRET`/`SMOKE_BASE_URL`. Founder owns
the migration, the keys, and arming the workflow. Tests 906→923.

**The wave is complete** (`.190`–`.194`): twelve evidence-graded behaviors →
sleep consistency → a digest that cannot lie → impacts correlated to the barbell
→ an evening doorbell that knows nothing about you.
