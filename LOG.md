# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.188`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30).

---

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

## 2026-07-30 — Correlate to the barbell (`.193`)

The thesis of the whole wave, and the part no competitor can copy.

Every behavior-correlation product on the market resolves to HRV, resting heart
rate, or a proprietary recovery score. Those are proxies — no lifter's coach has
ever asked what their HRV did. This app already logs the thing they *would* ask
about, so [`behaviorImpacts.ts`](src/lib/journal/behaviorImpacts.ts) correlates
behaviors to **session load**. WHOOP can tell you alcohol cost you four
milliseconds of HRV; we can tell you your sessions ran twelve percent lighter,
and WHOOP cannot, because they do not have your sets.

**Statistical honesty, structurally rather than statistically.** WHOOP shows an
impact at five yes and five no observations; across ten behaviors and six
outcomes that is sixty comparisons per athlete, which is why their most repeated
review complaint is that everything appeared to hurt. Three defences: **one
pre-registered outcome per behavior**, declared in `behaviors.ts` before any data
exists, so you cannot fish for the metric that moved; **ten flagged and ten
unflagged** sessions, double their bar; and **"collecting" as a first-class
designed state** — an athlete seven sessions in sees "7 of 10", not silence and
not a premature claim. Most products hide that state. It is the most credible
thing we can show.

A day the athlete did not log is **excluded, never counted as a "no"**. The
absence of an answer is not an answer, and treating it as a control arm would
manufacture findings out of forgetfulness (`unlogged-counted-as-unflagged`).

**Deliberately a separate module with a disjoint union.** Widening
`ReadinessFactor` so caffeine could ride along would let the readiness engine
start firing off a coffee count — the exact one-word-two-definitions failure
`.178` was written to prevent. `impacts.ts` is untouched, and the separation is
proven twice: a `@ts-expect-error` that behavior factors are not assignable to
readiness factors, and a runtime assertion that `computeImpacts` returns
byte-identical output with and without behavior data present.

**`next-day-lag-pairs-same-day` survived its first run.** The alcohol fixture had
check-ins on every day, so same-day pairing found matches too and the assertion
could not tell the two apart. Rebuilt decisively — check-ins only on even days,
sessions only on odd — so same-day pairing finds nothing at all and any result
can only have come from the lag. Third time this wave a mutant found a hole in a
test rather than the code.

Also killed: `impact-under-threshold-speaks`, `n-missing-from-line`,
`noise-as-insight`, `causal-language`, `tombstones-count`,
`collecting-state-hidden`. Surfaces as a Behaviors row on the weekly recap, and
an established finding can become the Day in Review's reason — collecting states
deliberately cannot, because the digest reports findings, not progress bars.
Tests 891→906. Next: `.194` evening push.

## 2026-07-30 — A digest that cannot lie (`.192`)

The evening **Day in Review** — the direct answer to the founder's screenshot,
built the opposite way from the thing it answers.

WHOOP's evening narrative is currently their most-attacked feature: their AI
coach has been caught fabricating a statistic and then discussing it as fact.
That is not a bug you patch out of a generated narrative — it is what generation
is. So every sentence in [`dayReview.ts`](src/lib/dayReview.ts) is a template
slot filled from local state. It **cannot hallucinate a number**, it renders
offline in a gym basement with no signal, and the code that writes it is code
you can read. A cloud-narrative competitor cannot make that claim, and it costs
us nothing we wanted.

**One fact, one reason, one option** — not a wall of metrics. The fact is what
happened today, the reason is context the athlete supplied, the option is one
thing they might do, phrased as an offer they can decline. And `null` when the
day holds nothing true: a card that appears every evening regardless is exactly
how a competitor's no-input commentary became a running joke
(`digest-speaks-with-nothing-to-say`).

The refusals are the feature. It shares the **push tone contract** through
`findToneViolations` — one contract rather than a second one that can drift, so
no absence length and no streak-loss language (streak-protection in a lifting app
means training when you should not). No prescriptions or medical framing, no
invented precision, and **no "strain floor"**: the screenshot's phrase comes from
a personalized daily target we do not compute, over a ratio contested enough that
`.177` already made our own ACWR low end deliberately inert. The module header
names *both* things called "strain" in this codebase, because `.178` was caused
by exactly that kind of one-word-two-definitions drift. It never reads
`getTrainingStreak` — that value is localStorage-overridable and so unfit for a
factual sentence, proven by a purity test that sets the override and asserts the
output is byte-identical.

**`strain-floor-claim` survived its first run.** No fixture produced a
below-average session, because session load is RPE × duration and every fixture
shared a duration — so the branch where that claim would live never rendered.
Fixtures now vary minutes, plus an explicit branch-coverage guard asserting both
comparison sentences appear. Second time this wave a mutant found a hole in the
tests rather than the code, which is the point of running them.

Also killed: `digest-names-absence-length`, `seconds-precision`,
`option-becomes-an-order`, `medical-causal-framing`, `tombstone-counts-as-today`.
The card doubles as a capture surface (one tap logs tonight's bed time, rounded
to the quarter hour). Tests 877→891. Next: `.193` behavior impacts.

## 2026-07-30 — The number we will not print (`.191`)

The screenshot that started this wave said *"sleep debt is now 2h 7m 48s."*
This ships the honest version of that, and the interesting work was deciding
what **not** to build.

We cannot compute sleep debt. There is no HealthKit web API on iOS and no
background sync in a PWA, so the only sleep signal available is what the athlete
taps — and self-reported sleep timing disagrees with measured sleep by an hour
or more, which makes seconds of resolution theatre rather than confidence. A
quantified physiological deficit is also the shape of output that reads as a
device claim rather than a wellness feature, and the FDA's 2026 guidance is
explicit that UI outputs count as claims.

So [`sleepConsistency.ts`](src/lib/sleepConsistency.ts) reports **regularity**,
which is the better metric anyway: in a 60,000-person accelerometry study, how
consistent sleep timing was predicted outcomes more strongly than how long
people slept. Two taps a day produce it, and no wearable company owns it.

Banded, never a stopwatch: `steady | drifting | scattered` from the median
absolute deviation of bed times, plus "N of your last 7 nights were later than
that." Silent under five logged nights in a fortnight. The midnight problem is
handled by anchoring the day at noon — on raw clock minutes, 23:45 and 00:15
look 23½ hours apart, which would label every ordinary sleeper scattered
(`midnight-wrap`).

Refusals, each a killed mutant: `under-min-nights-speaks`, `seconds-precision`,
`sleep-debt-number`, `sri-score-leaks` (bands only, never a score out of a
hundred), `missing-night-counts-as-zero`, `prescriptive-line`. That last one
**survived its first run** — the tone test only covered the short form of the
sentence, so a "you should fix that" planted in the late-nights clause went
unnoticed. The test now asserts over both shapes the line can take; a copy
constitution that only reads half the copy is not one.

Tests 862→877. Next: `.192` Day in Review.

## 2026-07-30 — Twelve questions, each with its receipts (`.190`)

First PR of the behavior-journal wave. WHOOP's journal offers 300+ trackable
behaviors and then advises tracking no more than ten; that tension is their
defect, and their loudest review complaint — "every positive action seemed to
have negative impacts" — is what a low significance bar over dozens of
behavior×outcome pairs produces. So this ships **twelve**, chosen on evidence,
each carrying a tier (A/B/C) and a one-sentence receipt the athlete can open.

New pure [`behaviors.ts`](src/lib/behaviors.ts): nine new fields (bed/wake time
at quarter-hour resolution, protein target, caffeine servings + time of last,
creatine, hydration, alcohol servings, screen-in-bed, late meal, rest day) —
sleep quality, soreness and stress already exist as 1–5 ratings and stay where
they are. Two things in the registry exist to make the correlations honest
later: **one pre-registered outcome per behavior** (you cannot fish for the
metric that happens to move) and **a declared lag** (alcohol tonight is a claim
about tomorrow's session). The C-tier receipt on late meals says outright that
the research is unsettled — grading our own questions is the point.

**The dangerous half was the storage.** `normalizeCheckIn` and
`upsertTodayPartial` are whitelist reconstructions: they rebuild a check-in
field by field, and every read passes through the first while every
victory-sheet reply chip passes through the second. A field added to one and not
the other is destroyed with no error anywhere. Both were edited together, and
both mutants are killed (`field-dropped-on-read`,
`partial-upsert-wipes-behaviors` — the latter is the real scenario: log
behaviors in the morning, tap a reply chip that evening, lose the morning).
`MAX_ENTRIES` 30→90, because a thirty-day window could never fill a correlation
that needs paired observations on both sides — the cap would have quietly capped
the feature (`history-truncated-at-30`).

Counts are not ratings: zero servings is a real answer, eight is eight, and the
1–5 clamp guarding the rating fields would have rewritten both
(`count-clamped-to-five`). The journal footer renders them as "Caffeine 2", never
"2/5" (`count-rendered-as-N-of-5`). Also killed: `bad-time-string-throws`,
`receipt-missing-for-behavior`, `weak-evidence-relabelled-strong`.

Everything is optional, free, and device-only; the pre-session sheet is
deliberately untouched — an athlete standing at a barbell is not asked how much
coffee they drank. Deliberately absent: medication, reproductive and
recreational-substance categories, which are special-category data and a surface
this app has no reason to hold. Tests 835→862. Next: `.191` sleep consistency.

## 2026-07-30 — The untestable half, tested (`.189`)

`.188` shipped with an honest gap in its own PR body: the spend routes
transitively import `server-only`, which throws under plain `tsx`, so the
*wiring* went untested while only the pure decisions were falsified. That gap
was in the worst possible place — the difference between "quota refuses" and
"quota refuses **and the athlete still gets the free product**" is invisible to
every pure test in the repo.

Node's own exports map had the answer: `server-only` resolves to an empty module
under the `react-server` condition. New lane `npm run test:routes`
(`tsx --conditions=react-server`), wired into `gate.mjs` and `ci.yml` beside the
unit tests; `*.routetest.ts` deliberately does not match the `*.test.ts` glob, so
the two lanes stay separate (835 unit, 7 route).

Seven contracts pinned, all on the degrade path: an exhausted daily-insight quota
still answers **200 with the rules insight** (not 429); a dark LLM env never
consults the quota and never says "quota"; a signed-out visitor always gets the
plan-voice rules briefing; chat's 429 `coach_quota` is the deliberate exception
(no rules engine to answer with) and unconfigured still reads `coach_offline`,
because a founder who never set keys must never be told they hit a spending limit
they never had. Determinism without a network or a shared bucket: caps driven to
`0`, whose kill switch refuses before the limiter is consulted, and a unique IP
per case.

**The mutant `.188` could not run now runs and dies**: `quota-blocks-rules-path`
(wire the quota as a route-wide 429) passes every pure test in the repo and fails
here. Also killed: `plan-voice-gate-moved-up` (cost gate back in front of the free
briefing — the exact defect the route's comment exists to prevent) and
`dark-env-reads-as-quota`. Tests 835→842.

