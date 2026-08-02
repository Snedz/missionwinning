# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.227` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02).

---

## 2026-08-02 — The notification that says nothing (`.228`)

A third batch of Pump Club screenshots, and the notification centre in it is the
best **bad** example the series has produced. Thirteen rows; eleven read, word
for word, *"A new article is out! A new article has been published!"* The title
restates the body, the body restates the title, and **neither names the
article**. Information per row: none.

### We shipped it

[`cron/nudges/route.ts`](app/api/cron/nudges/route.ts) built the signed-in push
by taking the email's **first line, truncated to 140 characters**. For
`week1-recap` that is *"Mission Winning — your first week on the path:"* — a
colon introducing the two numbers that made the message worth sending, both of
them on the lines the slice discarded. The reference's defect at one-app scale,
in our words.

Deriving copy at the send site did something worse than produce a bad string: it
put the string **out of reach of the tone contract**. `reentryTone.ts` sweeps
`nudgeCopy` on every run, and this body did not exist until the cron executed.
So each kind now composes its own push beside its email, from the same inputs —
`week1-recap` carries the sessions and the volume, `week-behind` carries the
target and the count. The privacy contract that keeps `dayReviewPush`
deliberately contentless does not reach these: that one is sent from a row that
holds no behaviour data **by design**, while this path is already composing an
email out of the numbers.

**Tags are required now, not optional.** [`pushPayload.ts`](src/lib/pushPayload.ts)
added `tag` so *"an evening wind-down would not silently replace a comeback the
athlete had not opened"* — and then comeback and both email mirrors shipped
without one, all three falling through to the `mw-nudge` default. Same tag
replaces. The two cron routes that *did* set tags did it with their own string
literals beside a comment explaining why it must be unique, while the copy
functions one import away had none: two spellings of one fact, which is how the
third kind ends up colliding by accident (`.178`). The copy owns the tag; the
routes carry it.

**And the welcome screen still promised a kind that was deleted.** The pre-account
opt-in offered *"training reminders (streak at risk, next step)"* in four
languages. `streak-at-risk` was removed deliberately — it fired on a
consecutive-day premise `reentry.ts` rejects — and its copy would now fail
`findToneViolations` outright. Reworded to the two kinds that actually send.

### The settings screen said two and meant five

`ProfileRemindersCard` described device notifications as *"Two kinds"* and named
two. A signed-in athlete with the toggle on can receive **five**: those two, the
evening review configured one row below, and the two that ride with the weekly
emails. The reference's one genuinely good structural idea in this batch is a
settings screen where every kind says **when it fires**, so that is what the card
does now — as statements, not switches, because there is still one subscription
behind them and inventing per-kind preferences would mean a column, a control
and a `pushPrefsReachable` entry each.

`WindDownOptIn` — the one surface in the app that asks an athlete to grant
notification permission — had **six raw string literals in JSX and no
`useTranslation` at all**. A permission ask nobody can read is a permission
nobody grants. New [`notificationLocales.ts`](src/i18n/notificationLocales.ts)
(the `zeroStateLocales` shape) carries it and the trigger lines; coverage came in
**one under the cap**, so the ratchet moved 710→709.

### Dismissed or finished, the checklist was gone forever

`.225` gave First Steps one mount: a Today card whose Dismiss writes a flag
`useDismissed` **never clears**, and which also retires itself on completion.
Both endings terminal, no reset control anywhere. The reference puts its
checklist in the nav drawer with a progress bar, and that idea lands on a real
hole rather than a missing ornament.

`MoreSheet`'s own header already calls it *"a status board rather than a menu"*
and it already reads live figures per row, so the checklist goes there: next
step, a segmented `MeterBar`, and the same sheet — which turns Dismiss from
*gone* into **moved off Today**, the thing it should always have meant. The
label says so now, in all six translated languages.

[`firstStepsReachable.test.ts`](src/lib/journey/firstStepsReachable.test.ts)
counts the doors and **discovers them** rather than naming a file (`.220`), then
asserts the harder half: at least one mount must not read the dismiss key. Two
mounts both gated on `dismissed` would satisfy a count and change nothing.

### The step that could not tick

`syncJourneyPhase` recomputed `s.basic`, **returned** when Basic was incomplete,
and only recomputed `s.readiness` past that early return. `AssessmentsPage`
writes `mw_last_assessment` and touches no journey state, so finishing the PAR-Q
left `readiness.parq` false until a *workout* was logged — and that flag is step
six of the checklist, whose whole lean-shell audience is the Basic-phase athlete.
The screen built to tell a new athlete what they had done was telling them they
had not done the thing they had just finished.

`firstSteps.test.ts` could not see it: that suite builds a `JourneyState` literal
and asks `getFirstSteps` about it — a fair test of the checklist, structurally
blind to whoever fills the state in. The defect lived entirely in the sentence
that populates it, which is `.205` exactly (`mergeBackup` was always correct; the
line after it was not). The new test goes **through** `syncJourneyPhase`, and its
companion asserts the fix moved a *snapshot* and not a *gate* — a completed PAR-Q
must still leave you in Basic, because `allBasicDone` is `b.workout` and `.223`
is what a second definition cost.

**Founder calls, both deferred with the reason recorded:** the reminder-at-a-set-time
(genuinely absent rather than broken — nothing in this app fires *before* a
session, so it is a column, a control, a cron branch and a new copy kind) and the
completion badge (it would be the app's **first durable earned record**; nothing
persists achievements today, and commissioning itself leaves no revisitable
trace). An in-app inbox is refused outright: greenfield, for a channel that has
never delivered a message.

**Stated plainly, because it decides how to read all of the above:** VAPID keys
unset, `PRIVATE_MODE` on, no `CRON_SECRET` — **zero notifications have ever been
delivered**, and none of this is visible in dev. That is the argument for doing
it now rather than against: the first push a beta tester ever receives should not
be the truncated one.

**Not done, named:** the four English-only surfaces (`EN_ONLY_SURFACE`) are
unchanged; per-kind mute, quiet hours and snooze do not exist; the notification
SW still ships one icon and no actions.

Tests 1233→1237. i18n coverage cap 710→709. Locale namespaces 30→31.

---

## 2026-08-02 — The language switcher half the app ignores (`.227`)

`.226` closed by naming two functions as unfinished business: *"`utils.formatDate`
and `benchmarks.formatChartDate` still pass `undefined` as the locale, so they
follow the browser rather than the app's language switcher."* Measuring before
fixing turned two into **42 sites across 22 files**, plus **17 `localeCompare`
calls in 12** — in a product shipping **fifteen languages including Arabic**.

### An argument you reach by not passing one

`Intl` formatting consults the ambient locale whenever the first argument is
missing, and `undefined` is a *legal value that means exactly that*. So
`d.toLocaleDateString()` and `d.toLocaleDateString(undefined, {…})` are the same
call, and neither looks like a mistake at the call site. An athlete who set the app
to Spanish got Spanish copy, Spanish nav, Spanish pillar names — and **`8/2/2026`
with `1,234` separators**. In German every grouped number on every screen was
wrong; in Hindi the *shape* was wrong, since `12,34,567` groups in lakh.

The repo already had the right answer and had used it once: `HistoryCalendar`,
written last wave, derives its month name from `i18n.language` and its header
explains why. One correct implementation, a lone island, and `.178`'s definition
of a missing home.

**The fix is a required positional.** `formatLocalDate(iso, lang)` in the new
[`lib/i18n/formatLocale.ts`](src/lib/i18n/formatLocale.ts) does not accept an
optional language, because *the defect is an optional first argument* and an
optional first argument cannot be its own fix. The compiler now catches call site
43 before any scan has to; `useLocaleFormat()` binds it once per component so
complying costs nothing, which is the difference between a rule that holds and one
people route around. `utils.formatDate` ended the wave with **zero call sites** and
was deleted — `.222`'s precedent, dead code kept alive by its importers.

### Closing the list on the right axis

`.212` earned this repo's rule — *a guard keyed to one spelling of a defect has
only ever tested that spelling* — by closing its own list on the wrong axis: it
enumerated ways to **slice** an ISO string and so never saw the ways to **compare**
one, missing fifteen sites. So [`localeFormat.test.ts`](src/lib/i18n/localeFormat.test.ts)
closes on *"how does a value reach the browser locale"*, and JavaScript has exactly
three doors: the three `toLocale*String` methods, any `Intl.*` constructor, and
`localeCompare`. `Intl` is matched as `new Intl.<anything>(` rather than by name,
so a constructor TC39 adds next year cannot slip through the way a name list would
— and the mutant proving it uses `new Intl.NumberFormat()`, **a spelling no file in
this repo actually contained**, which is the test `.212` says to run.

### The sort that claimed to be linguistic

Seventeen `localeCompare` calls, and **thirteen were ordering `YYYY-MM-DD` keys and
ISO timestamps** — a linguistic comparison of strings containing no language, which
cannot return anything `<` would not, and pays for a collator to say so (`.210`
clocked one of these running per tick on `/active`). Those became `compareKeys`.
Two were leaderboard **tiebreaks**, where the requirement is that a rank not move
with the viewer's language — also `compareKeys`, and a quiet defect fixed on the
way. Only two sort actual language and take a locale. The rule is therefore
absolute with **no allowlist**, which is the strongest form available: an allowlist
that fills up has replaced the rule it was meant to enforce.

**Four surfaces are English and only English** — the nudge email, the session
debrief, the share card, the school report — and their numbers now say so through
`EN_ONLY_SURFACE` rather than by accident. Before this, a German browser rendered
`1.234` *inside a hardcoded English sentence*: not localisation, just the one token
in ninety disagreeing with its neighbours.

### `.226` was wrong about `/mind`, and the ratchet is what said so

D8 recorded `/mind`'s 34 red actions as *"one Start per guided-session card — class
2, and precisely why /mind is a card farm rather than a screen"*, framing a screen
redesign. It was **one line**: `GuidedStepPlayer` hardcoded `variant="fitness"`, and
both callers render `compact` in a grid, so ten mind sessions and every Move flow
inherited it. Demoted to `outline` — and `outline` rather than the ink variants
because that card is only ink while *running*, and Start renders only when idle, on
paper; `onInkSolid` there would be near-white on paper, `.155`'s 1.01:1 defect in
the other palette. **`/mind` 34 → 2.**

That correction exists because the sweep **fails when a route comes in under its
cap**. A ratchet that only catches regressions is half a ratchet: the fix would
otherwise have landed as a still-green run with the wrong story still filed beside
the number. The story had been written from source and never measured — the shape
this repo keeps paying for.

### The twin doc that had a guard, and the one that did not

`LOG.md`'s header and `CLAUDE.md` §7 have both said *"≤15 entries / ≤20KB"* since
they were written, and **nothing ever checked it**: the only automated reader is
`check-build-label.mjs`, which asks whether the current version is *mentioned*. The
file had reached **27 entries / 127,015 bytes** — 6.4× the byte rule. One file over,
`CONTEXT.md`'s `## Now` has `contextBudget.test.ts` and was inside budget. Same
repo, same rule, same archive directory; the checked twin stayed honest and the
unchecked one drifted 6×. `.221` in the docs lane.

**And the rule could never have been met.** Entries here average ~5.6KB because the
house style explains the defect class rather than naming the change — the most
valuable thing in this repo. Fifteen of those is ~84KB; obeying 20KB would mean
keeping **three**. An unmeetable rule is not a strict rule, it is an ignored one.
So the count stays a hard cap, `.200`–`.211` rotate to the archive, and the size
becomes a **ratchet** in `bundle-budget`'s shape: the file may shrink, never grow.
[`logBudget.test.ts`](src/lib/logBudget.test.ts) also checks that rotation
**archived** rather than deleted, deriving the boundary from the files so it keeps
checking the current one — `.213`'s lesson, that a budget guard counting without
checking content will let you archive the truth.

**A third instance of a familiar own-goal:** that guard's first draft failed on
`LOG.md`'s own sentence explaining that the 20KB figure was retired — after `.226`
did the identical thing twice. `check-design-system` wrote the rule down once
already: *a guard that punishes documented reasoning gets switched off.* It now
reads the rule line, not the prose beneath it.

**Not done, named:** `variant="fitness"` is byte-identical to `default`; its
docblock says *"10+ call sites, fold in at the Phase 3 recut"* and there are **56**,
across 45 files — the count is recorded, the fold left to the recut its author
conditioned it on. `toFixed` is a fourth locale hazard the guard **cannot** see
(it is not ambient — it hardcodes `.` as the decimal separator, so `4.2k` reads as
four hundred and twenty in German); ~60 call sites, several feeding values back
into inputs, so it is named rather than swept. Class-2 red debt still stands at
`/coach` 4, `/profile` 4, `/track` 3, `/builder` 3.

Tests 1215→1233. `/mind` 34→2. LOG 27 entries/127KB → 15/84KB.

---

## 2026-08-02 — The screens with nothing on them (`.226`)

Five more Arnold's Pump Club screenshots. Lined up, they are one subject seen
five times: **what a screen says when the athlete has no data.** A month calendar
of thirty red ✕. A page reading `ALL GROUPS (0)` above nothing. And two
zero-states that explain themselves and offer one action.

Two of them are how to do it. Two are how not to. Mission Winning shipped one of
the second kind.

### The void, on a real route

`LeaderboardTable` rendered unconditionally: a bordered box, a four-column header
strip (`# / Operator / Score / Δ`), then an empty `<ul>`. On the class scope that
is the **normal** state, not an edge — `rank.ts:74` builds class entries from
`classRows` alone and pacers are excluded by design — so a class with nothing
synced got a heading and a column header over a void, beneath a line reading
*"0 operators"*. The reference screenshot, shipped.

`/programs` had the same defect on a filter miss: `{filteredPrograms.map(…)}`
with no fallback branch.

### The rule was written down, and wrong about its own component

`DESIGN_REVIEW.md` has said *"not a blank void"* since it was written; `grep`
finds `EmptyState` in no script and no test. Worse, the line said **"dashed
invite + CTA"** while `EmptyState`'s own docblock records that the dashed box was
deliberately deleted in `.139` — *"a dashed rounded box on a `bg-muted/20` fill
with a 10%-opacity red icon chip and centred copy: four things the system does
not do."* Anyone fixing empty states from the checklist would have rebuilt a
retired treatment.

### The harness existed, pointed one property away

`a11y.spec.ts` renders **all sixteen signed-in routes with zero data** on every
gate run and asserts only that they are accessible. **A blank screen is
maximally accessible** — no contrast failures, no unlabelled controls, no focus
traps, because it has nothing.

The inverse was true of the other rule. `first-90` asserts Today offers *exactly
one* primary action, and `expectOneRedAction` was called for `/log` alone. A
ceiling on how much a screen may ask; **no floor under how little it may
offer**, on fifteen of sixteen routes.

Fifth suite in this repo found pointing at its own assumptions rather than at the
product, after `.129` sitemap, `.157` a11y routes, `.162` viewport, `.165` gate
port.

### What the sweep measured

`zero-state.spec.ts`'s first run was the inventory, not a pass: **nine of fifteen
routes over the one-red-action rule, `/mind` at 51.** Two classes hid in that number.

**Class 1 — red as a *selected* state, fixed.** `variant={x ? 'default' :
'outline'}` at twenty sites: filter chips, unit toggles, privacy and reminder
switches, days-per-week picks — plus `bg-primary-fill` on two 1–5 rating scales.
A selection is not an action. New `selected` variant carries what `.225` already
settled for tabs: tint ground under a 2px poster rule. `/programs` 2→0,
`/assessments` 2→1, `/track` 6→3, `/move` 2→1, `/profile` 5→4, `/mind` 51→34.

**Class 2 — one red CTA per list card, recorded not silenced.** `/coach` draws
"Start this session" on every `PlanSessionCard`; `/mind` on every guided session.
That is a composition decision per screen, not a colour swap. So the rule ships
as a **per-route ratchet** with a written reason each — the shape
`i18n-coverage` and `bundle-budget` already use. Caps are set to measured truth,
and going *under* fails too, asking you to lock the gain in.

### The rest of the voids

`/benchmarks` stopped hiding its four one-tap Quick Starters inside the has-data
branch — they were visible only to athletes who already had benchmark data, and
hidden from the one person its empty copy addresses (*"complete workouts with
logged sets"*). `/learn/course` stopped swallowing a fetch failure into
`setChapters([])`, which is why its single muted `<p>` had to *guess*, branching
on `isFreeBeta()` between "check your connection" and "sign in with your bundle
email" — two diagnoses for one silent failure, and no retry either way. `/move`
and `/mind`'s `ErrorState`s got an `onAction`, because `ErrorState` renders no
retry unless handed one. History's filter miss got a way out, and its pillar-wins
line stopped being hardcoded English that spoke in raw URLs (*"Use /move or
/mind"*).

`EmptyState`'s CTA is `outline`, not `fitness` — a red fill on nine routes, from
the primitive whose entire job is "here is the one thing to do".

### The calendar marks only what happened

`/history` gains a **Calendar** segment: ink fill = trained, a small ink rule =
logged something else, 2px poster outline = today, everything else blank paper.
**No day is ever marked missed.**

That is criterion 4, and it is also the only honest option. `coach/storage.ts`
persists **one** plan and `savePlan` overwrites it; `adaptPlan` flips
`planned → missed` in place; `generateWeek` seeds from *current* body scores. What
an athlete meant to do in March is not recoverable, so a red ✕ would be an
invention as well as a reproach — thirty of them on the screen a lapsed athlete
opens first.

*"Logged"* is a fifth state the reference does not have: the day you used the app
without lifting. And retention is part of the honesty — nutrition prunes at 90
days, check-ins cap at 90 entries, pillar wins at 100, so an old month shows
fewer logged days than the athlete had, and the grid **says so** rather than
reporting a storage limit as behaviour.

Month helpers live in `localDate.ts` under its own rule. Month length comes from
`new Date(y, m, 0)`, so leap February answers 29 without a rule anyone has to
remember. Monday-first, matching `startOfLocalWeek` rather than becoming the
seventh derivation of when a week begins. Weekday initials and the month name
come from `i18n.language`, not the browser locale.

### The date rule's fifth spelling — and the guard could not have caught it

`.212` widened `reachability.test.ts` from one slicing spelling to four and
closed the list *"because these are the only three ways JavaScript has to take
the date half of an ISO string"*. True — and it examined only the **slicing**
half. Every pattern required a literal `toISOString()` call, so none could see
the same defect performed on an ISO string that was **already stored**:

```ts
w.completedAt.split('T')[0] >= weekStart   // pillarScoreInputs, challenges
const day = at.split('T')[0];              // TodayJournalStrip
```

`completedAt` is a UTC instant. All three compared its **UTC** date half against
a **local** key — `weekStartIso()`, `state.weekStart`, `localDateKey()`. Exactly
the frame mismatch `.212` found in `weekRecap`, three more times, surviving the
sweep written for it because the guard was keyed to *how the date was produced*
rather than to *what it was*. It now matches the shape.

`todayTrends.ts` carried both defects in one loop — the banned spelling, and **no
tombstone filter at all**, so a deleted session kept its volume in Today's
sparklines. Fourth reader found not dropping tombstones after `.223`.

Widening caught two sites that are **not** defects — a founder admin panel and a
server-composed email, where UTC is the only frame that exists. Those are an
allowlist with reasons, checked in both directions: a reason under 40 characters
fails, and so does an exemption whose file would now pass anyway.

### Verification

Mutation-tested, every rule: restoring `EmptyState`'s red fails four routes,
**none of them `/log`** — exactly the gap. An empty `<ul>` on `/library` fails
the headed-void rule. Removing `LeaderboardTable`'s zero branch fails its unit
guard, which is a *source* guard because `/leaderboard` is parked and the e2e
sweep cannot reach it. Routing `localMonthDays` through `toISOString` fails the
timezone sweep — and `process.env.TZ` was confirmed to actually switch before
that sweep was trusted.

**Two of my own drafts were wrong and running them is what said so.** The
leaderboard's off-palette rule first failed on the string `text-red-400` inside
the comment explaining that `text-red-400` had been removed —
`check-design-system` solved this once and says why: *a guard that punishes
documented reasoning gets switched off*. And the calendar's first draft faded
future days with `text-muted-foreground/50`, which axe measured at **2.42:1** —
the same alpha-on-a-contrast-token defect `.225` fixed three times in one wave.
Rendered, not inferred: `/history` in `en` and `ar` (RTL, `dir=rtl`, month name
`أغسطس 2026`), axe clean, month navigation confirmed to move.

**Not done, named:** class-2 red debt is capped, not paid — `/mind` at 34 is a
card farm and needs a composition pass, as do `/coach`, `/track` and `/nutrition`.
`WeekStrip` and `Skeleton` still carry their own hardcoded English day arrays;
the calendar derives its own rather than adding a third. `utils.formatDate` and
`benchmarks.formatChartDate` still pass `undefined` as the locale, so they follow
the browser rather than the app's language switcher.

---

## 2026-08-02 — The screen that said how you were doing before what to do (`.225`)

The brief was five screenshots of Arnold's Pump Club (iOS), handed over as
design references for the website and the web app.

**The first finding is that almost none of it is a styling problem.** The
Modernist rebrand (wave D5) settled paper/ink, one red, Archivo, radius 0, 2px
rules; the reference is a rounded-card, soft-shadow, glowing-FAB app. Copying
its look would undo a founder-commissioned rebrand and fail gate step 10 on the
first hex. What it is genuinely better at is **the shape of the daily screen**
and **the first-run contract** — and three of those ideas landed on defects that
were already here.

### Today was answering the wrong question first

Replaying `planTodayBlocks` against the declared prices, on a readiness
athlete's evening screen:

```
visible: header · dashboard · coach-invite · day-review · week-recap
hidden : coach-week · freshness · guidebook
```

`coach-invite` is a card asking the athlete to go and get a weekly plan. It was
on the screen while `coach-week` — the weekly plan — was inside the "Today
details" disclosure. At `commissioned` with the beta banner up, the session and
the week were hidden together. Horizon W criterion 2 is *"one clear next session
on Today"*, and the screen was leading with the Mission Score.

Re-priced, not re-budgeted: `coach-today` 35→12, `coach-week` 45→14,
`dashboard` 10→22, `coach-invite` 25→40 and restricted to `basic`, where it no
longer overlaps the real week strip. `TODAY_MAX_TOP_LEVEL_BLOCKS` is untouched —
that argument lives in the one file written to hold it. Both shells now price
from one table rather than two lists of numbers that have to agree.

**And a dismissed card was still spending a slot.** `planTodayBlocks` computes
`room = max - pinned.length` from the *candidate list*, not from what each
candidate renders, so `BetaWelcomeBanner` returning `null` still cost a pinned
top-level block — permanently, since the dismissal is permanent. The budget
never saw it hide.

### Two Today screens, degrading two different ways

`HomeTodayLean` had no block budget at all: it stacked whatever mounted, in
source order, with no ceiling — and it belongs to the cohort least able to
absorb a feed. It also rendered `JourneyHero` inline while the dashboard
portalled it to `ScreenDock`, so `i-day`/`basic` athletes, whose next action is
the entire reason the screen exists, were the only ones who could scroll it away.

### The checklist the app could already fill in

`detectBasicMilestones` has computed workout / fuel / move / mind / learn since
the journey engine shipped, and `detectReadinessMilestones` computes the health
screen. **Four of those six displayed nowhere** — `BASIC_STEPS` is a
one-element array, so the stepper reads "Step 1 of 1" forever. The data for a
real checklist was already on the device; the banner above it said the path in
prose as three static chips that looked identical on day one and day ninety.

`FirstStepsCard` + `FirstStepsSheet` replace it, each row carrying a line of
*why* — "try a mobility flow" is a chore, "five minutes on the days you do not
train is what keeps the streak reachable" is a reason. **Nothing here gates
anything, and that is the whole risk.** `.223` cost the launch gate because
`allBasicDone` meant two things, and this puts a six-item checklist on Today
five of whose items are exactly the pillars Horizon W called "free, not gated
chores". So `basicComplete` stays `b.workout`, is never consulted, and a guard
asserts both — including that `basicComplete.ts` may not so much as mention
`firstSteps`.

### Continuity, and the part of it that is not honest yet

`CoachTodayCard` printed a session name and nothing else. It now leads with
`SESSION 14 · PUSH / PULL / LEGS` — an ordinal counted from logged history
(tombstones dropped, the `.223` lesson), and a block name **read out of the plan
that exists** rather than re-derived by calling `chooseSplit` twice.

There is **no week number**. `useCoachPlan` overwrites the previous plan every
Monday, so nothing knows this is week three, and a field nothing writes is
`.195` with a nicer label. The guard reads `useCoachPlan` to confirm the plan is
still discarded — so the day plan history becomes durable, it fails and asks to
be deleted deliberately rather than quietly outliving its reason.

### Four answers to "what does selected look like"

`.seg`/`.seg-opt` sat in `index.css` since the rebrand with **zero call sites**,
while `ui/tabs.tsx`, `HistoryPage` and two strips in `FuelLogSheet` each drew
the control their own way. Two spent the screen's one do-this-now colour on a
tab. One was invisible: `bg-card` on a `bg-card` parent, 1.01:1 — the same trap
`.155` found on the check-in scales. And the unused CSS was wrong too
(`bg-primary-fill`), so the primitive disagreed with the two live components
that had it right. All of it is now one `SegmentedControl` drawing
`is-active-tab`, which is what the tab bar already draws.

### The guard that knew two spellings of red

Found by rendering the screen rather than reading the diff: `TodayWeekSection`'s
"Start Today's Workout" is a red `variant="fitness"` inside `main`, beside the
docked hero. `redActions.ts` allows **zero** red controls in `main` and never
caught it — that card lives in the details disclosure, which mounts only from
`readiness` up, and the hero e2e stops earlier.

`check-display-type` could not have caught it either, and that is the more
useful half. It knew a red *class* and a `<Button>` with the variant *omitted* —
but not a variant that is named and red. `fitness` is defined as
`bg-primary-fill`; its own comment calls it "the plain red fill". `.212`
verbatim: a guard keyed to one spelling of a defect has only ever tested that
spelling. The red variant list is now **derived from `button.tsx`**, so a new
red-filled variant is caught the day it is added, and both vacuity paths — an
unparseable variant map, an empty derived set — were confirmed to exit 1.

### The Design lane's entry doc was still enforcing the old brand

`DESIGN_ORCHESTRATION.md`'s lock table named navy `#0a0c10`, emerald `#27b07d`
and brass `#c7a860`, its type row read "Barlow Condensed · Inter · IBM Plex
Mono", and its card row allowed "≤1 glow per screen". Its own escape clause said
that described the outgoing system *"until the token-swap PR rewrites
DESIGN_SYSTEM.md and brand-guidelines.md"* — that PR was `.131`, ten builds
earlier. An agent opening the Design lane cold was being told to build navy.
`.221`'s defect one level up: the rules nothing checks, now actively wrong.

### Three contrast failures the a11y suite had been red on

`npm run a11y` is gate step 17 and **gate-only** — it appears in zero workflows,
so nothing had run it since the rebrand. Two routes were failing, both from the
same habit: fading a token chosen for its contrast.

- **`/coach`** — `PlanSessionCard` dimmed a missed session with `opacity-60`,
  which dims the text with the container: #747372 on #eeeded (4.04:1) and
  #8c8b8b on #eeeded (2.9:1). `.127` fixed this exact thing in `WeekStrip`
  (*"de-emphasised by border not opacity, because dimming the container also
  dims the day label past 4.5:1"*) and missed this file. Now a dashed 2px rule
  on a transparent ground — and it belongs to this wave anyway, since a missed
  session must stay readable to be *behind you* rather than hidden.
- **`/profile`** — the demo-mode notice ran `text-status-warn/90` on a 10% amber
  fill: #976115 on #e2dbd3, **3.79:1**. Restoring full strength gave #8f5300 on
  #e2dbd3, **4.49:1** — still short by a hundredth, because the fill darkens the
  ground the text has to beat. So the fill goes and a 2px rule carries it; the
  Modernist answer was structural the whole time. `text-status-warn/90` was in
  two more components (`SchoolClassPanel`, `WorkoutVictorySheet`) and all three
  are fixed, because the defect is the habit, not the instance.

**Gate note:** steps 1–15 pass. Steps 16–17 could not run under `npm run gate`
in this container — @playwright/test 1.61.1 resolves chromium **1228** and the
image ships **1194** — so both suites were run against the installed binary with
an `executablePath` override: **52 @gate passed, 34 @a11y passed**.

---

### Public surfaces

One honest status bar on both public shells — the open-beta line lived in the
landing page's fifth section and on no other URL, while the free core is the
strongest thing about the product. **Ink, not red**: the reference's bar is a
sale countdown, this is a status, and red is the one do-this-now colour. It
disappears with `isFreeBeta()` rather than becoming a slot that has to be filled.

`app/robots.ts` defaulted to the **apex** host while `seoMetadata`, `sitemap`
and `publicSeo` all default to `www` — so with `NEXT_PUBLIC_SITE_URL` unset,
robots.txt advertised a sitemap on a host no canonical, OG tag or JSON-LD ever
names. Both now read `siteBaseUrl()`.

**Refused from the reference, on purpose:** the red ✕ on missed days (`WeekStrip`
already strikes them through, and criterion 4 is "re-entry without shame"), the
glowing AI FAB, sale countdowns, and *"members who publicly share their goals
are 70% more likely to succeed"* — an invented number.

**Not done, named:** the eleven pillar screens from wave D6 are still held for
founder review; `/private`'s entry anatomy was left alone (it already runs
headline → lede → one action → foot → legal); and the new copy ships English-only
via `defaultValue` — `npm run i18n:fill` has not been run for the ~14 new keys.

Verified at 390×844 in a real browser, not inferred: Today's order, the card and
sheet, the segmented control's computed colours and keyboard, and axe clean with
the sheet **open** (`.215`).
## 2026-08-01 — The column that hid four more controls (`.224`)

`.223` shipped `tests/e2e/fuel-floating-action.spec.ts` after "Log weight" was
found **100% occluded** by the Fuel FAB at 375px. It guards that one control and
leaves the rest of the column as a `TODO(founder)` with three options and one
instruction: *tag the describe block `@gate` only if it passes.*

This is the decision, and what the decision found.

### The policy

**A control may share the column; it may not *be* the column** — `overlapPx < width`.

The other two options are both unavailable rather than merely stricter or looser:

- *Zero overlap* cannot pass. The FAB is 121px wide in a 295px content column, and
  the meal-description input is 295px. Every full-width control on the page fails
  by construction, so the rule could only ever be a ratchet, never a gate — which
  is what the TODO said, and measuring agrees.
- *Guard only the named control* re-guards one bug and none of its siblings. The
  reported defect was never specific to "Log weight"; it is specific to being a
  short control in the end corner, and the page had four more of those.

The line the surviving rule draws is the line the bug is actually on. A wide
control clipped at one edge stays visible and reachable at every scroll offset. A
control narrower than its own overlap is somewhere inside the FAB's x-range
*entirely*, so the offset that brings it level with the FAB hides all of it.

### Four live ones, and they were all alignment

Measured at 375px, FAB at `x=[238,359]`:

| Control | x | width | overlap |
|---|---|---|---|
| "Use base" (`FuelAdaptBanner`) | `[251,322]` | 71 | 71 |
| "Edit targets" (`FuelTargetsEditor`) | `[248,335]` | 87 | 87 |
| "Snack" meal tab (`FuelQuickLogPanel`) | `[266,325]` | 59 | 59 |
| water stepper "+" (`FuelQuickLogPanel`) | `[302,335]` | 33 | 33 |

None of these is about what the control *says*. Three are `justify-between` or
`ms-auto` — an end-aligned short button, which on a phone means the bottom-end
corner, which is the corner a viewport-fixed FAB owns. The fourth is four
left-packed meal chips, where the fourth chip lands there by arithmetic.

So the fixes are alignment: `flex-col items-start` until `sm` on the two rows that
end-align a small button, `sm:ms-auto` on the water stepper, and a two-up grid for
the meal tabs.

**`grid-cols-4` would have moved that chip without fixing it** — four equal
columns across 295px is ~69px each and the last one still ends at the container
edge, still inside a 121px FAB, still fully occluded. Half-width tabs clear the
FAB's left edge whatever the label says in any locale, which is the property
worth having rather than a width that happens to work in English.

### The guard was checked against the bug it is named after

A guard whose failure mode has never been observed is `.204`'s defect. Reverting
one fix — `sm:ms-auto` back to `ms-auto` — fails the spec with

```
+     "label": "+",
+     "overlapPx": 33,
+     "width": 33,
```

which is the control, the number, and the reason, without opening a screenshot.

One narrowing the first draft needed: `overlapPx >= width` holds vacuously for a
zero-width element (`0 >= 0`), reporting a control that cannot be hidden because
it is not drawn. The filter requires `width > 0`.

`@gate` e2e 52→53. No unit tests changed; this is entirely a browser-measured
invariant and a layout consequence of it. Two failures in `hero-flows` (public
exercise-page CTA) and `premium-pillars` (Mind guided-session player) reproduce
unchanged on a clean tree — pre-existing, neither on the Fuel path.

### Carried, not authored: one CI block (it was two)

Actions is running again, and both of its checks were red on this PR for reasons
that have nothing to do with a Fuel column.

`build-and-test` failed on `first-90`'s *"Today shows one red action at 19:00"* —
the push opt-in is not mounted, because `ci.yml`'s build env omitted
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` while `scripts/gate.mjs` sets it (`.198`). Same
controlled experiment either way: a local build without the key reproduces the
failure exactly, and with it all 53 pass. `gitleaks` never scanned anything — it
403s on `ScanPullRequest` listing the PR's commits, because that job declares no
`permissions:` block and inherits a repository default without `pull_requests`.
Identical failure on #185, an unrelated diff, while PRs opened directly are green.

Both already had correct fixes on `fix/ci-extended-env-parity` (`.235`), open at
the time, whose own note reads *"#178, #179, #180 and #181 all carry an identical
block. The conflict is textual, not semantic — take either side."* So both were
carried here **verbatim** rather than re-authored, on the theory that identical
text merges as a no-op.

**Then #185 merged the `ci.yml` half to master with a different comment**, which
is the conflict that note predicted, and this branch took master's side whole —
so `ci.yml` is no longer part of this ship at all. `gitleaks.yml` still is:
master does not have that block yet. Neither is my finding; the diagnosis was
reached independently, the fix was not.

### The gate that went green on a retry

With `ci.yml` fixed the job passed — and its summary read **`1 flaky`, 52
passed**. `offline.spec.ts`'s *"a set logged offline survives, and reconnecting
does not lose it"* had failed and passed on retry, so the checkmark was green
and the spec guarding **the offline promise** had not actually held. That is the
`.235` complaint one file over: a check people re-run until it passes is a check
they have stopped reading.

The cause is in the product, not the test:

```ts
// @serwist/next sw-entry.ts
if (self.__SERWIST_SW_ENTRY.reloadOnOnline) {
  window.addEventListener("online", () => location.reload());
}
```

`next.config.js` sets `reloadOnOnline: true`, so **the app reloads itself the
moment connectivity returns** — and the spec's next line was
`page.goto('/active')`, against a page already at `/active`. Two navigations,
same URL, started microseconds apart: *"Navigation to /active is interrupted by
another navigation to /active"*.

**The race was never 50/50, and measuring said so.** With the `goto` removed
entirely, reconnecting fires **two** main-frame navigations and wipes a marker
stamped on `window` — the reload always happens; the `goto` only sometimes got
there first. Ten local runs of the unfixed spec passed, which is exactly why
this survived: it is a CI-timing coin flip, not a local one.

So the spec now waits for the reload the product performs instead of driving a
competing one. Deterministic, and a truer assertion — that reload is what a
returning athlete actually gets. **Awaited, not assumed**: `reloadOnOnline: false`
+ rebuild kills it with `page.waitForEvent: Timeout 15000ms exceeded while
waiting for event "framenavigated"`, so it cannot go vacuous if that option is
ever turned off. One mutant, killed.

### One flake reported rather than fixed

`first-90`'s *"every control in the feedback sheet is thumb-sized"* failed once,
in the first full-suite run after the merge, and has not reproduced since —
three full `@gate` suites and a run in isolation, all green.

The obvious hypothesis is **wrong**: `boundingBox()` does report the transformed
rectangle, so a control measured mid-animation would measure short — but
`AdaptiveOverlay`'s entrance is `slide-in-from-bottom`, a *translate*, which does
not change height, and the `zoom-in-95` that would is `md:` only while this suite
runs at 390px. No cause established, so no fix: a speculative change here would
be a guard written about a defect nobody has characterised, which is how this
repo gets tests that cannot fail. Written down instead, with what is ruled out.

### The status doc that contradicted itself about its own CI

`CONTEXT.md` `## Now` answered *"does CI run?"* **twice, with opposite answers** —
the standing Status table said *"billing-blocked. Every job dies in seconds with
`runner_id: 0`"*, while the Ops bullet twelve lines down said *"cleared; Actions
works again"*. `CLAUDE.md` states the rule this breaks: *whether Actions is
currently running is recorded in exactly one place — do not restate it
elsewhere.* `gate.mjs`'s header records the repo paying for this exact
contradiction once already, across two files; it had since moved inside one.

Measured today, both rows are now true rather than merely current: Actions ran
`build-and-test` to completion in 7m22s on this PR, and gitleaks is green. The
gitleaks row also attributed its redness to the `8ea3527a` Solana address, which
was never the cause — on a `pull_request` event the action scans only the PR's
own commits, so that history is not in scope at all. The finding stands and stays
un-allowlisted; the row now says what actually made the check red.

The Ops bullet no longer restates the Actions fact. **No guard written for this
one**, deliberately: the only mechanical rule available is "the word Actions
appears in one place", and existing ship bullets narrate CI history legitimately
(`.213` does), so that check would fail on correct content. A guard keyed to a
spelling of *"is it blocked"* is the shape this repo has already paid for four
times.

---

## 2026-07-31 — The gate that could not go green (`.223`)

The brief was four product references — WHOOP's AI charts and voice journaling,
a member story built on 1,146 days of data, Tesla's live VPP dashboard. Research
into what each would build on here found something worth shipping ahead of any of
them: **the surfaces they point at are already broken, and one of the breaks is
the launch gate itself.**

### One name, two answers, and the launch decision paid for it

```ts
// src/lib/missionJourney.ts — what the product implements
// Horizon W: Basic Training = first workout only. Other pillars stay free, not gated chores.
return b.workout;

// src/lib/betaMetricsServer.ts — what the founder dashboard measured
return b.workout && b.fuel && b.move && b.mind && b.learn;
```

Horizon W narrowed Basic Training to the first workout. The client followed. The
server copy did not — and it is the one that computes `basicCompletePct`, which
`launchReady` gates on at **≥60**.

So a tester who did everything the product asks of them registered as
*Basic-incomplete*. The gate used to decide whether ten beta users are ready to
launch was scoring them against a rule the app had stopped implementing, and it
could not go green regardless of how well the beta went.

`.178` at its most expensive. A word meaning two things costs whoever trusts the
number, and here that is the launch decision.

One definition now, in a new dependency-free `src/lib/journey/basicComplete.ts`
that both sides import. Not an export from `missionJourney.ts`: importing that
module drags `safeStorage`, `pillarLog`, `streaks` and `justGoSession` into a
`server-only` bundle to reach one predicate that reads its argument and nothing
else. The type import is erased at compile time, so the new module has no runtime
dependencies at all.

### A deleted session still counted, on a card meant for a public feed

`weekRecap.ts` filtered workout history by date and nothing else, while
`dayReview.ts:86` and `behaviorImpacts.ts:123` both drop `deletedAt` rows. Those
three numbers — sessions, sets, volume — are not confined to a screen:
`buildRecapCardData` prints them onto the PNG an athlete shares publicly.

`.208`, the same shape as the PR chip that fired on the one set kind the rest of
the app declines to trust: a celebration the app cannot support.

### A PR line nothing could ever have supplied

`buildWeeklyDebrief` counted records like this:

```ts
if ((log as { personalRecords?: number }).personalRecords) {
```

`personalRecords` exists **nowhere else in the repo**. Nothing writes it. So `prs`
was structurally always 0, and two surfaces were dead on arrival — the recap
card's PR line and the Today card's *"N PR marks this week"*. The hand-written
`as` cast is precisely what stopped the compiler from pointing at it (`.195`, with
the type system silenced on purpose).

Counting it honestly turned out not to be available, and the reason is the real
finding: `isPersonalRecord` — the definition `.208` hardened, which refuses sets
to failure — runs at log time and `logSet` stores `isPr` on the **active** set.
But `CompletedWorkoutLog.exercises[].sets` is `{ reps, weight, kind?, rpe? }`.
**The flag is discarded the moment the session is saved.** The brass chip an
athlete earns is off the record five seconds later.

Reviving the line therefore means persisting `isPr` through completion, and that
type syncs to `workout_logs` — a schema change with sync-v2 merge and revision
consequences, which is a different PR from one about numbers that lie. Deleted,
with the condition for its return written into a test.

### The guard that proved the formatting of a dead feature

`shareCard.test.ts` built a `WeeklyDebrief` by hand with `train.prs: 2`, then
asserted the card said *"2 personal records"*. Green for the whole life of the
bug. It proved the formatting worked and could not notice that no debrief the app
can produce has ever carried a nonzero `prs` — a fixture supplying the very thing
production cannot.

### The guards, and two of them were wrong first

New `src/lib/launchTruth.test.ts`, seven rules, discovering rather than
enumerating (`.220`): no domain rule stated twice with two answers; the dashboard
imports the basic-complete rule rather than restating it; every reader that
windows workout history drops tombstones; no cast invents a field nothing writes;
and the recap card's PR claim is cross-checked against whether `isPr` survives
completion — so when that changes, the test fails and the line may come back.

Running them is what caught two mistakes of my own:

- The duplicate-name rule returned **18 hits**, nearly all legitimate — `clamp`,
  `num`, `formatDuration`, and Next's `generateStaticParams`/`generateMetadata`,
  which every dynamic route is *required* to define. A guard needing an
  eighteen-entry allowlist is an allowlist wearing a guard's name. Narrowed to
  what actually bit: both copies must answer about the same **project** type.
- `/prLine:\s*(?!null)/` matched `prLine: null`, because `\s*` backtracks to zero
  width and the lookahead is then tested against a space. The identical backtrack
  `.221` hit on `border-radius: 0` and wrote down — reproduced anyway. The value
  is captured and tested in code now.

The cast rule's exemptions are all one thing: shapes this repo receives and never
produces (xAI completions, Open Food Facts, PayPal, Play Billing, Apple Health).
Each carries `why` + `fixWhen`, and a stale-entry check fails if a file stops
casting.

Tests 1178→1186.

---

## 2026-07-31 — Take the weight out (`.222`)

The brief was the "product excellence at the edges" thesis: capabilities keep
improving where they lie askance to the primary vector, and the mechanism is
**part and process elimination**. That maps here for a specific reason — the
primary vector is blocked on `MAIL_POSTAL_ADDRESS`, which no agent can set.

So: weight out of the Model X.

### The same translations, three times

| Copy | Size | Reaches the app via |
|---|---|---|
| `src/i18n/*Locales.ts` | 504 KB | compiled in, `hydrateResources.ts` |
| `src/i18n/packs/*.json` | 1.1 MB | `applyLocalePack` |
| `public/locales/**` (435 files) | **32 MB** | fetched by `LocaleHttpSync` |

Not variants. `public/locales/ja/common.json` and `src/i18n/packs/ja.json` shared
**947 keys with 100% byte-identical values**.

### And every athlete paid for it, every load

`LocaleHttpSync` is mounted in `app/i18n-pwa-provider.tsx:199` and fetched
`common.json` — the **entire** 1,687-key catalogue, whether you opened `/log` or
`/guide`, at **40–49 KB gzipped**, with `cache: 'no-cache'` so the browser cache
never helped — to merge in values already present in the bundle.

`.209` spent a whole PR taking 306 KB of locale packs off the critical path. This
put ~45 KB back where `bundle-budget.mjs` **cannot see it**: that budget measures
gzipped *initial JS*, and this is a runtime `fetch`. A budget measuring one thing
while the cost moved somewhere it cannot look — the shape this repo keeps
finding.

### Three changes

**The hotfix path is kept, and made opt-in.** Founder call. Correcting a string
without a deploy is a real capability; it just was not worth its price. A
translator turns it on with `?locale-http=1` (sticky across reloads) and off with
`=0`; the `NEXT_PUBLIC_LOCALE_HTTP` kill switch still wins over both. Nothing
about the loader, the merge or the fallback changed — only *when* it runs.

**The packs are split to the English schema.** English was the only one already
correct: 0.24 MB with disjoint namespaces, while `ja/coach.json` and
`ja/fuel.json` shared 947 keys. `scripts/split-locale-packs.mjs` trims every
language to the keys English declares for that namespace and drops `common.json`
(every key again, a fourth copy — and `fetchLocaleHttpOverrides` *preferred* it,
so leaving it would have kept the loader on the 1,687-key file).

**30.8 MB → 2.1 MB. 93% removed.** `public/` went 38 MB → 5.4 MB.

It is a re-runnable script with a `--check` gate step rather than 406 hand
edits, because translations get regenerated and a cleanup that cannot be repeated
undoes itself the next time the fill tool runs.

### Verified on the wire, not in the diff

`.221`'s lesson, applied on arrival. A built server, Playwright network capture,
fresh browser per language, service workers blocked:

```
en: locale-reqs=0    ja: locale-reqs=0    es: locale-reqs=0
```

Zero. And Spanish still renders translated — *"Día I", "Aproximadamente dos
minutos", "Bienvenido, miembro de la misión"* — so the split moved bytes without
moving meaning. The opt-in path still fetches (58 requests, confirmed).

Japanese `/welcome` shows English, and that is **pre-existing**: `ja/welcome.json`
was 51 of 51 keys identical to English before the split as well. Checked rather
than assumed, because "my change broke Japanese" and "Japanese was never
translated here" look identical from a screenshot.

### Two things found on the way

**Removing `common.json` exposed a latent conflict.** Four keys are declared in
**two namespaces with different English values** — `fuelTitle` is the Fuel page
heading in `fuel.json` and the Today card heading in `today.json`. Whichever
merges last wins, and `common.json` was silently resolving it. `.178` in the
data. Inert for athletes now that nothing fetches these files, so it is recorded
with a guard and the fix stated — splitting the key needs call-site edits, which
is a different PR from one about weight.

**`localeCommonJsonPath` became dead code kept alive only by its own test.** Once
`common.json` was gone it had exactly one reference left: the assertion checking
it. Both went. The best part is no part.

### Falsification

`http-sync-fetches-by-default`, `kill-switch-loses-to-opt-in`,
`pack-regrows-full-catalogue`, `common-json-returns`,
`footprint-ratchet-raised`, `copies-drift`, `new-namespace-collision`.

## 2026-07-31 — The design rules nothing checked (`.221`)

You asked for a plan to improve the web design. I measured before proposing, and
the honest headline is that **the design system is in good shape** — the
Modernist rebrand is coherent, the tokens are well built, and the contrast
reasoning is documented at the call sites rather than assumed. `src/index.css`
holds **zero** hex literals outside comments and routes every `font-family`
through a token.

So this is one PR, not a wave. Padding it would have been inventing work.

### What was actually wrong

`scripts/check-token-sync.mjs` pins token *values* against `index.css` and two
Android Kotlin files. **It never opens a `.tsx`.**

That is structurally the blind spot `.202` found in `i18n-parity`: a checker that
compares definitions to each other cannot see what components do. Component drift
was invisible **by construction**.

Which is how [`Benchmarks1RMChart`](src/components/benchmarks/Benchmarks1RMChart.tsx)
kept drawing **Tailwind blue-500 and green-500** through a full-app rebrand, on a
live nav surface, while the grid, axes, tooltip and `borderRadius: 0` in that
same file were all correctly re-inked. The series colours read as "data colours"
rather than brand ones. On a paper/ink/one-red system they are the same thing.

### The three drifts

- **The chart.** `#3b82f6` / `#22c55e` → tokens. The palette gives one hue, not
  two, so the series are distinguished by **dash** as well — which WCAG 1.4.1
  asks for regardless — and the split carries meaning: the measured lift is solid
  and takes the accent, the derived estimate is dashed and quiet.
- **The drop zone.** `FileDropZone`'s drag-over state was
  `shadow-[0_0_0_1px_…,0_0_28px_-4px_…]` plus `scale-[1.01]` — **a 28px red
  glow**, the pre-rebrand idiom recoloured, while `.131` says glows were retired
  and `.136` claims blur and shadow reached zero. Now a poster-red border on the
  same tinted fill, like every other active surface.
- **The guidebook.** Four raw `border-radius` values and `#0a0c10` — the
  pre-rebrand navy — in a block whose every other value already aliased
  paper/ink. Raw CSS bypasses the Tailwind radius collapse entirely, so `/guide`
  kept rounded buttons and a dark figure placeholder through the whole re-ink.
  Plus one more the scanner found: `border-radius: 8px` in the printable teacher
  report.

### The guard, and the requirement that nearly sank it

`scripts/check-design-system.mjs` is **gate step 16** — `.200`, `.213` and `.219`
all turned on the same fact, that a check living only in a billing-blocked
workflow has never run.

**Its hardest requirement is not firing on comments.** A naive scan of this repo
reports ~35 hex colours and 6 shadows, and *almost all are prose* — `MobileNav`
explaining a 3.84:1 contrast choice, `PressPage`'s own brand guidance *"Don't:
Round, stretch, rotate, or shadow the mark"*. Explaining a colour decision at the
call site is exactly the habit this codebase should keep. A guard that punishes
it gets switched off inside a week.

Three bugs in my own first draft, each caught by running it:

1. **It flagged `border-radius: 0`** — the thing it exists to ask for. The
   lookahead `\s*(?!0\b|…)` fails because `\s*` backtracks to zero width and the
   test is then applied to a space. Values are captured and checked in code now.
2. **Every line number was wrong**, because stripping comments deleted their
   lines. Comments are blanked in place, newlines preserved.
3. **It missed inline `//` comments** — the `MobileNav` one sits after a ternary
   (`: // muted-foreground …`), so a comment was being read as code. Handled,
   with a `[^:]` guard so `https://` survives.

Exemptions are **per rule, not per file**: the press kit may hold raw swatches —
they are its content — but it may not grow a glow. Ten entries, each stating why
and what would change it, none stale (asserted with exemptions off, so the
question is "would this file fail without its entry?").

### The cross-check the scanner surfaced

Worth more than the rule that found it. [`shareCard.ts`](src/lib/share/shareCard.ts)
draws to a canvas, where CSS variables do not exist, so its five colours are a
**hand-copy of `BRAND_HEX`**. Its own comment says so.

That is a second definition of the palette (`.178`) on the app's most public
artifact. If the palette moves and the card does not, every share posted
afterwards carries last season's brand and nothing in the repo would say so. The
two are now asserted equal.

### And the backlog was lying

`CONTEXT.md`'s `.155` entry listed seven design items as *"Still open"*. **Five
had already shipped** — `LibraryDetailSheet` is on `AdaptiveOverlay` and says so
in its own comment, the offline "Waiting to sync" list landed in `.211`/`.216`,
the plate squares are 2px-outlined, the Adjust "Applied" panel has its keys, and
`estimateMealFromDescription` is wired into `FuelLogSheet` and `NutritionPage`.

A backlog that sends the next agent to redo finished work is `.213`'s defect
inverted: a status doc asserting a state that is not true.

### The copy named the colours

Caught by rendering the screen rather than trusting the diff. The chart's own
card description read:

> *Estimated (blue) from all sets · Actual (green) from 1-rep attempts only*

Changing the lines would have made that sentence **false** — the app describing
its chart in colours it no longer draws. The string was duplicated across **221
files** (the locale packs plus the source default) in eight languages.

All of them now describe the **stroke** instead — *"Estimated (dashed) · Actual
(solid)"* and the equivalent in each language — which is also the accessible
form, since naming a colour is a colour-only reference of exactly the kind WCAG
1.4.1 asks you to avoid. The chart change and the copy change fix the same
problem from two directions.

No guard would have caught this: it is prose, not a token. Rendering the page
did.

**Falsification.** Verified by re-introducing each drift: `glow-reintroduced`,
`off-palette-hex-passes`, `raw-border-radius-passes`, `second-typeface-passes`,
`comment-counted-as-violation` (the guard must **not** fire on documented
reasoning), `allowlist-without-reason`, `stale-allowlist-entry`,
`check-not-in-gate`, `share-card-drifts-from-brand`.

## 2026-07-31 — The streak, the other three (`.220`)

`.217` fixed **one writer and one reader**. There were three and four.

### The guard that let them through

`.217` shipped this, named *"both streak readers apply the recency rule"*:

```ts
for (const file of ['src/lib/streaks.ts', 'src/lib/fuelStreak.ts']) {
```

Those are the two files I had already looked at. **Twelfth vacuous guard in this
run of work**, and the same shape as every one before it — a check whose *name*
claims a scope wider than its *enumeration*.

The two it missed were the two that mattered.

### An athlete with no workouts, showing a streak

`readTrainingStreakFromStorage` in
[`workoutPersistLite.ts`](src/lib/workout/workoutPersistLite.ts) was a bare
`parseInt` of `mw_streak` — no history, no recency. It feeds **Today's lean
shell**.

`HomeTodayLean` does overwrite that value from history — but only
`if (history.length > 0)`, which is precisely the case where the raw number is
wrong. So an athlete with **zero workouts** and a non-zero `mw_streak` saw a
training streak they had never earned.

Where did a non-zero `mw_streak` come from with no workouts? An **ungated button
on `/assessments`**:

```ts
const bumpStreak = () => {
  const cur = parseInt(readRaw(STORAGE_KEYS.streak) || '0');
  writeRaw(STORAGE_KEYS.streak, String(Math.max(1, cur + 1)));
};
```

Fired by `startRecommended` — on **starting** a suggested session, not finishing
one. No date, no same-day guard, no recency. Five taps, five days of "streak",
for a workout that had not happened. That is `.206`'s class: a control touched
for one reason quietly writing a value the athlete never entered.

**And the two compound into a hero-path defect.** `HomeTodayLean:251` reads:

```tsx
{journeyState.phase === 'basic' && streak === 0 && ( … 'Log a set — Mission Coach shapes the week …' )}
```

So the invented streak **suppressed the one prompt that screen exists to give
someone who has never trained.** The app told a new user they were on a run, and
hid the nudge to start.

### A third derivation of "consecutive days"

`recordWorkoutCompleted` in [`challenges.ts`](src/lib/challenges.ts) had its own:

```ts
const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
streak = diffDays === 1 ? streak + 1 : 1;
```

The millisecond arithmetic `.199` and `.212` were both about, and `.217`
replaced everywhere else. It also wrote the override **without** the date `.217`
made mandatory — so the value was already unreadable, dead code that looked live.
Worse than dead: a loaded gun for anyone who later "restores" the override branch
and silently brings back the streak that never breaks.

All three are gone. The workout **history** is the authority, and
`getTrainingStreak` derives from it.

### The real deliverable is the guard

Listing files is what failed. So the guard now **discovers** them: it walks
`src/`, finds every file referencing `STORAGE_KEYS.streak` or `STREAK_KEY`, and
fails on any that is not in a reviewed allowlist — the shape `.219` used for
advisories, one day later.

It also fails on a **stale** allowlist entry, because a list naming files that no
longer touch the key looks more considered than it is. That direction caught
something immediately: `workoutPersistLite` was in my first draft of the
allowlist and no longer references the key at all.

**Falsification.** Reverting each of the three fixed paths turns the discovering
guard red: `cold-path-reads-raw-override`, `assessments-button-inflates-streak`,
`challenges-writes-dateless-override`.

## 2026-07-31 — A security check that can actually fail (`.219`)

Two defects. The second is the one worth reading.

### It had never run

`npm run security-audit` appeared in exactly one place —
`.github/workflows/ci.yml` — and every job in that workflow dies in seconds at
`runner_id: 0`. It was absent from `scripts/gate.mjs`.

`.200` fixed precisely this for the a11y suite (*"the guards that never ran"*).
`.213` found it again for this check, said so, and deferred the fix. It is now
**gate step 15**.

### And it could not have failed usefully if it had

The old script was `npm audit --audit-level=high`. That exits 1 for as long as
**any** unfixable advisory exists — and four of them have no published fix at
all. So the check was permanently red, which means **a new high advisory landing
tomorrow would have been invisible**.

A check that always fails measures exactly as much as one that always passes.
That is this wave's own defect class one level up, and it is why nine vacuous
guards were worth finding.

The rule is therefore not *"no advisories"*. It is **no advisory we have not
looked at**, with the count only ever allowed to fall.

### The unit nearly cost a real improvement

`npm audit fix` cleared **four high advisories with no breaking change**:
`GHSA-3jxr-9vmj-r5cp`, `GHSA-4c8g-83qw-93j6`, `GHSA-52cp-r559-cp3m`,
`GHSA-v2hh-gcrm-f6hx`.

But npm's own headline went from **17 high packages to 23**, and I very nearly
reverted the lockfile on that basis. Distinct high **advisories** had actually
fallen from 17 to 13. The package tally rose because the fix reshaped eslint's
subtree, so more packages inherited the same advisory.

**Counting the wrong unit made a real improvement look like a regression** —
which is exactly the failure the new script exists to prevent, encountered while
writing it. `security-audit.mjs` counts advisory IDs, and a unit test pins the
distinction with a fixture of one advisory across three packages.

### Recorded, not silenced

The remaining 13 are allowlisted, and every entry must carry **why it is
accepted** and **what would change that** — asserted by the test, because an
allowlist of bare identifiers is a mute button while one that has to state its
reasoning is a decision someone can disagree with later.

| Advisory | Why accepted |
|---|---|
| postcss ×2 | No published fix. Runs at build time over our own stylesheets; no path by which a user supplies CSS. |
| sharp | No published fix. Optimises only local assets committed to the repo — re-check if remote image sources are ever enabled. |
| brace-expansion | Reached only through eslint, glob and lighthouse — tooling that runs on our own repository. |
| axios ×8, bigint-buffer | Fixable only by a breaking downgrade of the payment SDK, behind a `dynamic()` import on `/bundle`. |

The count is a ratchet that only moves down — `.202` (i18n coverage) and `.209`
(bundle budget) are the same shape, and the same rule applies: a cap that follows
reality is not a cap.

### Falsification

Removing one entry from the allowlist turns the check **red**, naming the
advisory and the packages carrying it. That mattered more than usual here: a
security gate nobody has ever seen fail is indistinguishable from one that cannot.

Killed: `new-high-advisory-passes` (verified by dropping `sharp` from ACCEPTED),
`ratchet-moves-up`, `allowlist-without-reason`, `check-not-in-gate`,
`packages-counted-instead-of-advisories`.

## 2026-07-31 — The invite that could silently never redeem (`.218`)

`.170`'s bug, **fourth instance**, on the one path the beta gate measures.

### Three one-shot calls

```ts
void fetch('/api/beta/invites/redeem', { ... })
  .then(...)
  .catch(() => { /* non-fatal */ });
```

`markInviteLanded`, `redeemInviteFromAttribution` and
`redeemReferralFromAttribution`. Each fired once — `redeemInviteFromAttribution`
from `syncJourneyOnSignIn` and **never again** — so a tester signing in on a
train, in a lift, or on gym wifi lost the redemption permanently. The
attribution sat in `localStorage` and nothing retried it.

### The lost row is not the damage

`first_landed_at` and `signed_up_user_id` are what the founder invite panel
reads. A dropped redeem makes that dashboard report **a tester who never arrived
and never converted** — while they are sitting there using the app.

That is the instrument a private beta is steered by, reporting the opposite of
what happened, on the exact metric REDTEAM A5 fires on: *"14 days… still no 10
beta users."*

### The answer already existed

`.179` built it and `.170` named it — *"that one needs an outbox retry, not a
polish fix."* Six kinds ride the durable outbox: `workout.upsert`, `coach.plan`,
`journey.state`, `leaderboard.push`, `pft.push`, `feedback.submit`. They retry,
dedupe, survive a reload, and appear on the offline screen. The three on the
critical path did not.

All three now do, through
[`attributionSync.ts`](src/lib/sync/attributionSync.ts). No new transport, no new
retry logic, no new endpoint.

### Which failures are final — the part that needed care

**4xx is done, not retried.** An invalid or already-redeemed code cannot become
valid by asking again, so retrying would burn `MAX_ATTEMPTS` and then sit in the
queue marked `stuck` — permanently visible on the offline screen, and alarming
for something that actually worked.

**Except 429 and 408, and that is not theoretical.** All three routes rate-limit
at **5/min/IP** (`referral/route.ts:91`, `invites/redeem/route.ts:19`,
`invites/landed/route.ts:18`), and beta testers behind one gym's wifi, one
office, or one carrier NAT share an IP. My first draft mapped every 4xx to
"done", which would have silently discarded exactly the redemptions this module
exists to save — **the original bug, reintroduced by the fix for it.** Caught by
reading the routes rather than assuming their behaviour.

`OfflineContent`'s `KIND_LABEL` is `Record<OutboxKind, …>`, so adding the kinds
made the compiler demand labels for them. A pending invite is now visible rather
than silent, enforced by the type system rather than by remembering.

### Falsification — eight mutants, two survivors, both about the tests

`network-throw-marks-done` survived: turning `post()`'s `catch` into
`return true` broke nothing, because **every delivery test registered its own
stub handler and none of them ever called `post()`**. The module's core error
handling — the thing this entire PR is about — had no test. Eleventh
vacuous-coverage finding in this run of work, and a new shape: not a guard
measuring the wrong thing, but a suite that exercised the queue and never the
thing being queued. Two cases now register the **real** handlers and stub
`fetch`.

`kinds-share-a-dedupe-key` survived, and here the honest answer was that the
mutant is not a defect. The outbox dedupes on `(kind, dedupeKey)`, so a shared
key string across kinds is harmless by construction. The test's name promised
more than it measured; it now says what it actually proves — that each helper
enqueues at all.

Killed: `redeem-fire-and-forget`, `4xx-retries-forever`, `rate-limit-dropped`,
`double-signin-double-redeems`, `landed-never-enqueued`,
`handlers-never-registered`, plus both survivors after the fixes.

## 2026-07-31 — The streak that never breaks (`.217`)

The app's most-visible number could not go down.

### The defect

[`getTrainingStreak`](src/lib/streaks.ts) had two branches and **neither asked
when the athlete last trained**:

```ts
const stored = parseInt(readRaw(STREAK_KEY) || '0', 10);
if (Number.isFinite(stored) && stored > 0) return stored;   // forever
...
const dates = [...new Set(history.map(localDateKeyFromIso))].sort().reverse();
let streak = 1;                                              // from dates[0],
for (...) { if (diff === 1) streak++; else break; }          // whenever that was
```

Train five consecutive days, stop for three months, still see **"5-day streak"**.
The loop walks backwards correctly. It simply never asks *when* `dates[0]` was.

### Why this is not a chip on Today

| Consumer | What the overstatement did |
|---|---|
| [`weekRecap.ts`](src/lib/weekRecap.ts) | Shared debrief text **and the share-card title** — publicly visible |
| [`missionJourney.ts:224`](src/lib/missionJourney.ts) | `streak >= 7 \|\| recent14 >= 5` — a stale 7 **permanently satisfied a commissioning milestone** |
| [`computeLocalStats.ts`](src/lib/leaderboard/computeLocalStats.ts) | `computeWinScore` and the **public leaderboard** |

Look at the shape of `missionJourney:224`. `recent14` **is** date-bounded. The
author knew to bound by recency in the second half of that expression and not the
first.

**And the repo already knew.** `dayReview.ts:43` says in prose:

> *Deliberately does **not** read `getTrainingStreak`: that value can be
> overridden by a localStorage key, so it is unfit for a factual sentence.*

One consumer noticed the number was untrustworthy and routed around it locally.
Three others kept consuming it as fact.

### Two streaks, one correct half each

`fuelStreak` **wrote** correctly and had all along — same-day is a no-op,
yesterday increments, a gap resets to 1 — and then **read** a bare `parseInt` of
the stored number, so it never decayed. Log protein Monday, open Nutrition
Friday, still Monday's count. It needed no new storage: `fuelLastLogDate` was
already written on every bump; the reader just never asked for it.

`streaks` had neither half — while the correct writer sat one file over.

So both now share [`streakRecency.ts`](src/lib/streakRecency.ts):

- **live = today or yesterday, else 0.** Founder call, recorded: hard truth, no
  grace period. Yesterday counts because someone who trained last night and opens
  the app at 07:00 has broken nothing — and a rule that punished them would make
  the number depend on what time you looked at it.
- The walk moves by **expected calendar day**, not by differencing UTC
  milliseconds. The old arithmetic happened to work because both sides parse to
  UTC midnight, but it is the spelling `.199` and `.212` were both about.
- New `previousLocalDateKey` in [`localDate.ts`](src/lib/time/localDate.ts),
  because "yesterday" had two derivations — one correct inline in `fuelStreak`,
  one implicit in `streaks`' millisecond diff. A calendar fact with two
  derivations is `.178` waiting to happen, which is why that module exists.
- The override gained the **date it never had**. It was a counter with no
  timestamp, so nothing could distinguish a run of 5 ending today from one ending
  in April — and nothing stopped three pillar-win taps in one afternoon adding
  +3 to a *day* streak.

### The tests asserted the defect

Six cases, all green, all pinning `2026-07-10` against code that reads the real
clock. One of them — `prefers positive localStorage override` — set a stored `9`
against a single ancient workout and asserted `9`.

That is `.211`'s date bomb with the sign flipped. There the fixture drifted away
from the clock and the suite went red overnight; here it drifted away and the
suite **stayed green**, because the code under test had no opinion about time. A
test that pins a calendar date to check a rule *about* calendar dates is testing
the fixture.

All twelve are now derived from the same clock the code reads.

### Falsification — nine mutants, two survivors, both resolved honestly

`writer-loses-the-date` survived, and the guard was mine. It asserted
`/streakLastBump/` appeared in `bumpTrainingStreak`'s body — but the body
**reads** that key as well as writing it, so deleting the write left the check
green while every override silently stopped being honoured. **Tenth vacuous guard
in this run of work**, and the same shape as `.215`'s survivor: a search wider
than the thing it names. Replaced with a behavioural round-trip — bump, read
back, bump twice on one day, bump after a gap.

`unparseable-day-breaks-walk` also survived, and here the honest answer was the
opposite: the `.filter(Boolean)` genuinely is **not** load-bearing. `''` sorts
before every real date, so after the reverse it is always last and can only
terminate a walk it would never have continued. The filter stays as
belt-and-braces and the comment now says so, rather than claiming a protection no
test backs.

The DST guard was checked for vacuity before being trusted: reverting
`previousLocalDateKey` to a `Date.parse` implementation turns it red under
`Europe/Berlin`, so it responds to the timezone it claims to test — `.212`'s
requirement.

Killed: `stale-streak-survives`, `override-ignores-recency`,
`fuel-streak-never-decays`, `yesterday-counts-as-broken`,
`leaderboard-reads-raw-streak`, `same-day-taps-increment`,
`bump-continues-stale-run`, `writer-loses-the-date` (after the fix),
`previous-day-via-Date.parse`.

## 2026-07-31 — The instruction that pointed at nothing (`.216`)

Closes the loop the feedback wave opened. `.214` gave the notes a reader, `.215`
gave athletes a way to write them. This makes the weekly ritual performable.

### The line

`POST_LAUNCH_CADENCE` §3 is the constitution's one qualitative loop: *"Talk to 2
users (or read 2 feedback emails) → fix the #1 confusion within 48h — ship, tell
the tester."* `founderDigestCompose.ts` faithfully emitted it every Monday:

```
  - Talk to 2 users or read 2 feedback emails
```

**No feedback email has ever been sent to anyone.** There is no feedback template
in `emailServer`, `RESEND_API_KEY` is unset, and the notes land in `public.leads`
where — until `.214` — nothing in the repository read them. The digest's single
qualitative action pointed at an inbox that does not exist.

It survived for the same reason the notes did: **the digest cannot send either.**
`weekly-digest/route.ts` returns 503 without `CRON_SECRET` and skips without
`FOUNDER_DIGEST_EMAIL`, and both are unset. A dead instruction inside a dead
channel — nobody was reading the thing that was wrong.

### Not a reword

Rewriting the line to point at the panel would have been a one-word fix and the
wrong one. The digest now **carries the notes**: newest five inline, each with
its date, sender and prose, and a count of how many more are waiting.

A digest that says *go read your feedback* asks you to remember where it lives. A
digest that carries the prose **is** the ritual.

Three things had to be true for that to be honest.

**One definition of the inbox.** `.214` put the query inline in
`app/api/beta/feedback/route.ts`; the digest needs the same rows. Two copies of a
filter is two chances to drift, and drift here is **silent** — the wrong
`package_interest` returns zero rows, which is indistinguishable from nobody
having written in. [`feedbackServer.ts`](src/lib/feedbackServer.ts) now owns it
and both callers go through it. `.178` again: one definition per word. The guard
asserts neither caller says `.from('leads')`.

**A failed read never prints as an empty inbox.** Those are opposite facts
prescribing opposite actions — one says check a key, the other says go find
users. And an empty inbox now says what it means rather than shrugging:

```
  No notes yet.
  Nobody has written in. That is the beta gate, not a quiet week —
  REDTEAM A5 fires at 14 days with fewer than 10 users.
```

**The digest reads past what it prints.** It fetches 50 and prints 5, because
"+N more" can only be truthful if the read went beyond the print limit. Fetching
exactly the print limit would make that line permanently absent — a silent
"that is all of it" that never measured anything. The guard compares the two
constants rather than trusting them.

### The count that makes "#1" a real question

*"Fix the #1 confusion"* is not a property of a list. It is a property of what is
**new since you last looked**, and a panel showing 40 notes newest-first looks
identical on the Monday three arrived and the Monday none did.

[`feedbackUnread.ts`](src/lib/feedbackUnread.ts) marks where you stopped. Two
decisions in it are load-bearing:

- **By timestamp, not by count.** A count-based mark ("I had read 12") reports
  zero new the moment one note arrives and one falls off the 100-row cap — the
  length is unchanged and the new note is invisible. `.202`'s rule: a measurement
  that can be satisfied without measuring is not a measurement.
- **Marking read stamps the newest loaded note, not `Date.now()`.** The wall
  clock would also bury anything that arrived between the fetch and the click —
  a note provably unseen, hidden by the act of dismissing a different one.

Never-read returns **everything**, not zero. Unparseable timestamps count as
unread. Both err toward "look at this", which costs a glance; the other direction
hides a real note forever, because nothing ever moves it back above the mark.

Device-local on purpose: a reading position is not data, `leads` has RLS with
zero policies so there is no client-writable surface anyway, and syncing it would
need a table and a migration for a fact exactly one person holds.

### What still does not work, stated rather than implied

The digest **cannot be delivered today**. Section 5 is verified through
`?dryRun=1`; the **in-app panel is the path that works**. Writing the section
anyway is deliberate — the composer is pure and tested, so the content is correct
on the day the secrets are set rather than discovered broken then.

**Falsification.** Twelve mutants, **none survived**:
`digest-still-points-at-nothing`, `digest-omits-feedback`,
`broken-read-prints-as-empty`, `truncation-silent`,
`fetch-limit-equals-print-limit`, `second-query-definition`,
`multiline-note-flattened`, `unread-count-never-advances`, `unread-by-length`,
`unparseable-note-hidden`, `mark-read-stamps-now`, `panel-shows-no-unread`.

## 2026-07-31 — The button in You (`.215`)

The half the founder actually asked for, shipped **second** on purpose. `.214`
gave the notes a reader first, because pointing more people at a column nobody
could read is not an improvement — it is a louder version of the same defect.

### What was wrong with the way in

Before this, the only route from an athlete to a human ran through `/feedback`,
linked from [`LegalNav`](src/components/layout/LegalNav.tsx) in **muted 14px,
between "Beta guide" and "Terms of Service"**, behind an `includeFeedback` flag.
The primary listening channel of a private beta was styled as a disclaimer.

And the instrument behind the link is the wrong one. It asks for key results, a
testimonial, a 1–5 rating and "the biggest action you took" — it collects
**proof for a launch page**. Nobody reaches for that when the timer jumped or a
button did nothing. It also **requires an email address**, in a product whose
whole thesis is that logging needs no account.

### The card

[`ProfileFeedbackCard`](src/components/profile/ProfileFeedbackCard.tsx) renders
on Profile for **every** user. Not behind `showOwnerTools()` — which is exactly
how `BetaAdminPanel` and `ProfileOwnerTools` are gated two lines away on the same
page, so the wrong spelling is one character off and would read as correct in
review. It would also be undetectable in testing: the founder is the one account
that always sees it. `feedbackReachable.test.ts` asserts against both that
spelling and the `email &&` variant, because the anonymous athlete is both the
one this product is built for and the one with no other way to reach us.

It takes an `outline` button, not a second poster-red fill. `ProfileDayReviewRow`
set that precedent and `.194`/`.198` are the reason it exists.

### The sheet

On the shared `AdaptiveOverlay`, not a route: someone reporting that the timer
jumped is mid-session, and sending them to `/feedback` asks them to abandon the
thing they are complaining about. One question. **Email optional**, with copy
that states what leaving it blank costs rather than nagging.

Optional turned out to mean changing three layers, each of which rejected a
blank address on its own:

- [`apiSchemas.ts`](src/lib/apiSchemas.ts) — `email` was `z.string().email()`,
  required.
- [`app/api/leads/route.ts`](app/api/leads/route.ts) — now requires an address
  **per source**: the waitlist still needs one, a bug report does not.
- [`supabase.ts`](src/lib/supabase.ts) — omits the field rather than sending
  `''`, which `z.string().email().optional()` rejects.

Any one of those reverting puts the barrier back **with the sheet's copy still
promising it is optional** — the app lying about itself, which is the `.170`
class this repo keeps finding. So the guard reads all three.

Delivery reuses `.179`'s durable outbox verbatim — `enqueueFeedback`, already
registered, already retrying, already dedupe-keyed per note, and already labelled
"Feedback note" on the offline screen. No second transport.

### Two things a form does not do

**It counts down against the real limit.** `goals` caps at 2000 in the schema and
the route re-slices to 2000 again, both silently — and the context block is packed
into that same field. A note written to the limit would lose its tail, which is
the part written last and cared about most. `MAX_NOTE_CHARS` is the column limit
minus a worst-case context reserve, the textarea enforces it, and the test
composes a deliberately worst-case note and asserts the total still fits.

**It attaches where you were.** This is the part that needed new code. The sheet
lives on Profile, so `usePathname()` alone would tag every note `/profile` —
context that *looks* like a fact and answers nothing. [`screenTrail.ts`](src/lib/screenTrail.ts)
keeps a four-entry session-scoped breadcrumb written by `AppLayout`, and the note
carries `Screen` **and** `Came from`. Both, not one chosen by a heuristic: the
athlete may equally be reporting something about Profile itself, and guessing
would discard the right answer half the time. When there is no previous screen the
line is **omitted** rather than written as `none` — an absent line reads as "we
don't know", which is true.

### The guards, and two that were nominal

Nine unit tests in
[`feedbackReachable.test.ts`](src/lib/feedbackReachable.test.ts), split across the
two shapes this wave keeps re-learning: **reachability** (`.195`) and **vacuity**
(`.204`, `.207`, `.210`, `.213`).

Two e2e guards had to be widened rather than merely added, because as written they
would have reported green on untouched code:

- The **thumb sweep** had never visited `/profile`. `.194` put a 36px button on
  Today and nothing failed because the sweep only knew `/active`; the sweep is a
  helper now, and this is the same gap one screen over. `/profile` joins the list,
  and `expectThumbSized` takes a scope — the sheet is portaled to `document.body`,
  so a selector rooted at `main` cannot see a single one of its controls.

  **It failed on its first run, on fourteen controls this PR did not write.** The
  units pair, Save Goals, the backup/restore/import row and the language `<select>`
  at 37–40px; four assessment buttons, the five days-per-week chips and sync Retry
  at 36px. Every one of them on the settings screen every athlete uses, none of
  them ever measured. They are fixed here rather than exempted — a guard widened
  and then narrowed around what it found is the vacuous-guard pattern wearing a
  different hat.
- **axe** already covered `/profile`, with the sheet closed. A route passing says
  nothing about an overlay that is not open, so there is now a run that opens it.

### Falsification, and the ninth vacuous guard

Twelve named mutants. Eleven were caught. **One survived, and it was mine.**

`sheet-requires-email (schema)` reverted `leadsBodySchema.email` to required and
the suite stayed green. The guard searched `apiSchemas.ts` file-wide for an
`email` field carrying `.optional()` — and matched `inviteCreateBodySchema.email`
**150 lines below**, a different schema that is optional for its own unrelated
reasons. So the check reported that a note with no address was accepted while the
schema rejected it.

This is the **ninth** guard in the `.204`–`.215` wave that measured nothing, and
the fourth I wrote myself inside the PR about that exact defect class. The shape
is always the same: a source-text assertion whose search is wider than the thing
it names. The fix is always the same too — anchor the slice. The guard now
extracts `leadsBodySchema`'s own body and matches inside it, and the mutant fails
it.

Caught: `feedback-card-not-rendered`, `card-gated-to-owner`,
`sheet-requires-email` (route), `sheet-requires-email` (Send button),
`sheet-requires-email` (schema, after the fix), `context-not-attached`,
`trail-never-recorded`, `previous-screen-falls-back-to-current`,
`oversized-note-silently-trimmed` (reserve), `oversized-note-silently-trimmed`
(textarea), `sheet-fetches-directly`, `trail-repeats-not-collapsed`.

## 2026-07-31 — The note nobody could read (`.214`)

Opens the `.214`–`.218` feedback wave. The founder asked for a Submit-feedback
button; exploring first changed the answer, because **feedback already works.**

`.179` did the hard half properly — a note rides the durable outbox, retries
offline, dedupes, and has tests. Its own header calls these notes *"the 'why I
almost quit' interview record the beta exists to collect."* They land in
`public.leads`.

**And nothing has ever read them.** `betaMetricsServer.ts:98` selects
`package_interest` and nothing else, so the founder panel displayed one line —
`feedback-page  7` — while the rating, the testimonial and the prose sat in a
column **no code in the repository has ever named.** Repo-wide, no SELECT of
`leads.goals` existed.

Two more facts that make it worse. `founderDigestCompose.ts:87` instructs the
founder to *"read 2 feedback emails"* that have never existed. And
`app/api/leads/route.ts:157` fired `maybeSendLeadConfirmation` on **every**
insert, so a beta tester who wrote a testimonial received *"You're on the
Mission Winning list — Your interest tag: feedback-page"* with an unsubscribe
link, and got `confirmed_at` stamped as though they had joined the launch list.
On the one interaction where a user did us a favour, we replied with a marketing
receipt.

So this is `.195` turned around: that wave asked *"was it built, and can anyone
get to it?"* about what the app **shows**. This asks it about what a user
**sends**. New [`feedbackReadable.test.ts`](src/lib/feedbackReadable.test.ts)
states the rule — *an inbound channel needs a named reader, and the path from
arrival to a human must be assertable.*

**The read path.** New `app/api/beta/feedback/route.ts`: founder-only,
service-role, newest-first, capped at 100. `leads` has RLS enabled and **zero
policies** (`20260705_leads_api_only.sql` dropped the last), so there is no
client read to build on — this route is the only way the prose can reach a
human. `BetaAdminPanel` renders it with `whitespace-pre-wrap`, because the form
packs four answers into one newline-separated field and collapsing them runs the
whole note into a single paragraph.

**A misconfigured server must not look like silence.** No service role returns
**503**, not `[]`; the panel keeps `null` (not loaded / not permitted) and `[]`
(genuinely none) visually distinct. An empty list on a broken read would invite
the single most expensive wrong conclusion this panel can produce.

**One definition of "is this the founder".** `authorizeBetaAdmin` was written
inline in the invites route and again in the metrics route, and this needed a
third — so it moved to [`api/betaAdminAuth.ts`](src/lib/api/betaAdminAuth.ts)
and both existing routes now call it. Three copies of an authorization predicate
is how one ends up quietly more permissive (`.178`). It fails closed on missing
configuration, which is correct: an unconfigured admin check defaulting to open
would expose every tester's feedback to anonymous traffic on deploy.

**And one tag, because there has only ever been one.** The form set
`package_interest: 'beta-feedback'` **and** `source: 'feedback-page'`, which
reads as a two-level taxonomy. It never was — `supabase.ts:303,310-311` computes
`source = source || package_interest` and writes that single value to both
columns, so `'beta-feedback'` was discarded on **every submission ever made**.
Now [`FEEDBACK_SOURCE_TAG`](src/lib/feedbackSource.ts), shared by the writer, the
email skip and the reader; a literal in three files is a literal that drifts, and
when it drifts here the panel silently shows nothing.

Killed: `feedback-prose-unreadable`, `panel-shows-counts-only`,
`tester-gets-waitlist-email`, `tag-drifts-from-reader`.

Tests 1097→1103. Next: `.215` the button in You, on a context-aware sheet.
