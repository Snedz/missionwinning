# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.198`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30).

---

## 2026-07-30 — Measured, and it can only shrink (`.202`)

**`i18n-parity.ts` never opens a `.tsx`.** Its only filesystem read is its own
allowlist; everything else compares locale packs **to each other**. That is a
real check — it catches a key present in EN and missing in Japanese — but it is
structurally blind to the bigger problem: a key a component *uses* that exists in
**no pack at all**. All fifteen languages agree they don't have it, so parity is
trivially satisfied.

Measured for the first time: **665 of 1538 literal keys (43%) exist in no EN
pack.** Because every call site is `t('key', { defaultValue: 'English' })`,
nobody sees raw key names — they see **English**, silently, in fourteen
non-English languages. The `@gate` test asserting no raw keys leak has always
passed, and always will. The app looks translated and is not.

Founder call was **measure and ratchet, no translation work**. So
[`i18n-coverage.ts`](scripts/i18n-coverage.ts) counts the gap, fails on any
**new** uncovered key, and its cap can only ever be lowered. In the gate, because
`i18n:parity` cannot see these keys by construction and so nothing else would.

**The cap shipped at 710, not 665, and that is worth understanding.** Five
components — `TodayDayReviewCard`, `DayReviewOptIn`, `BehaviorStrip`,
`DailyCheckIn`, `BreathingTimer` — had **no `useTranslation` at all**. Giving
them one added 42 keys and the count went *up*. That is measurement widening, not
debt growing: those strings were previously hardcoded English with **no key**,
invisible to the counter and impossible for anyone to translate. Now translating
them is a data change rather than a code change. It is the only legitimate reason
this number rises, it is documented at the constant, and
[`i18nCoverage.test.ts`](src/lib/i18nCoverage.test.ts) pins a checked-in
high-water mark so the next raise has to edit two files with the reason in the
diff.

**`BehaviorStrip` now uses the key pairs the library always shipped.**
`behaviors.ts` has carried `labelKey`/`receiptKey` beside `labelDefault`/
`receiptDefault` since `.190`, and **nothing had ever read them** — every
consumer took the English. The library was built i18n-ready and its only renderer
ignored that for eleven builds. Twelve behavior questions and their evidence
receipts are translatable for the first time.

Killed: `ratchet-raised-instead-of-lowered`, `key-never-added-to-a-pack`,
`component-with-no-t`, `coverage-script-not-in-gate`, `raw-default-over-the-key`.

**Two process notes, both mine.** `key-never-added-to-a-pack` survived its first
run because I wrote it as a *swap* — one uncovered key for another — which leaves
a total-count ratchet unmoved. A real regression *adds* a key; rewritten that
way, it kills. And my mutant cleanup used `git checkout --` on two files whose
`.202` work was **uncommitted**, silently reverting them. The coverage check
caught it on the next run, which is the first time in this wave a guard I had
just written caught me destroying my own work rather than shipping a defect.

Tests 1012→1016.

## 2026-07-30 — The screen that must not break (`.201`)

The app is fully client-rendered and has **no nested `error.tsx` segment
boundaries** — `app/error.tsx:8-10` says so outright. That single fact is what
makes every finding here severe: a throw anywhere on a render path does not
degrade one component, it replaces the entire route with the global error
screen.

**`MobileNav` threw inside `useMemo`.** A `MOBILE_TAB_HREFS` entry missing from
`PRIMARY_NAV` blanked *every mobile screen* — the bar is on all of them. A typo
in a list of five strings would have taken out the product on phones. It now
drops the unresolvable href (four tabs beat zero screens) and
[`mobileNavTabs.test.ts`](src/lib/mobileNavTabs.test.ts) catches the mismatch
where failing is free. A render-path throw is not a safety net; it *is* the
failure.

**Six `activeWorkout!` assertions on the logger.** Each was true in practice —
the handlers only fire from a rendered session — but this is the one screen the
product promises never breaks, and an assertion is a promise the compiler stops
checking. Narrowed once per handler, returning the values the callers already
handle.

**Then the e2e guard found something neither audit had.** A `@gate` case that
loads `/active` with four kinds of corrupt persisted storage: two of them
**blanked the screen**. `activeWorkout: 42` and `{ id: 'x' }` — valid JSON, wrong
shape — both produced *"That wasn't supposed to happen."* Every consumer did
`activeWorkout.exercises[i].sets[j]`, and `partialize` persists whatever shape
the store held while what comes *back* is whatever is on the device: an older
build's shape, a half-written record, a quota-truncated string.

Fixed at rehydration with `isUsableActiveWorkout` — one check covering every
consumer, including the ones written next year, rather than a guard at each read
site. It **rejects the whole session when any exercise is unusable** rather than
filtering: a half-restored session that silently loses sets is worse than a clean
empty state, because the athlete can start again in one tap but cannot recover
data the app quietly dropped.

Also: `healthImport.ts` parsed JSON with no guard, contained only because its one
caller happens to sit inside an upload queue's catch — a property of the caller,
not the function. And `ProgramTemplatesPanel`'s `.find(…)!` was dereferenced
unguarded twenty lines later.

Corrupt-storage resilience had been unit-tested per parser and **never end to
end**, which is exactly why the two store failures survived: the parsers were all
fine, and the crash was in what happened to the parsed value afterwards.

Killed: `nav-tab-with-no-item`, `shape-check-accepts-anything`,
`sets-not-checked`. No mutant survived — but the e2e guard found two real
defects during construction, which is the same thing arriving earlier.

Tests 1003→1012; `@gate` e2e 46→50, plus 33 a11y. Gate 6.1 min.

## 2026-07-30 — The guards that never ran (`.200`)

`.195`–`.199` closed one defect class: *a thing was built and nothing asserted
anyone could reach it.* This is that class applied to the checks themselves, and
the repo had two live instances.

**`npm run a11y` executed nowhere.** 33 tests over 30 routes — excluded from
`npm run gate`, whose own closing line said so, and absent from every workflow,
while [`ci.yml`](.github/workflows/ci.yml) carried a comment claiming a11y
"stays in CI extended". `grep -rn a11y .github/workflows/` returned **zero
hits**. The suite has existed since `.157`.

Run for the first time, it found **one real serious violation**: `/compare`'s
comparison table scrolls horizontally with no keyboard access
(`scrollable-region-focusable`), so every column past the fold existed only for
people with a pointer. Fixed with `tabIndex` + a named region. **32 of 33 passed
on the first run** — the suite was in far better shape than "never executed"
suggested, which is its own small lesson about assuming rot.

`a11y` now runs **inside the gate**, reusing the server the hero lane already
started, so the marginal cost is the run and not another build. Gate: 46 e2e +
33 a11y.

`eslint`'s `jsx-a11y/no-noninteractive-tabindex` and axe genuinely disagree
here, and **axe is right** — the lint rule is a static heuristic about element
types, axe measures the rendered box. One narrow disable, with that reasoning
written at the call site.

**The visual-regression job passed vacuously.** With no committed baselines it
ran `--update-snapshots || true` and then re-ran `e2e:visual`, which found the
snapshots it had just written. Green on every run, over zero baselines — the job
could not fail. Now the absence of baselines is a loud failure with bootstrap
instructions, because `visual.spec.ts` argues at length that a known-wrong
baseline is worse than none and bootstrapping is a deliberate act. **Baselines
were deliberately not generated here**: this container runs Chromium 1194
against a repo pinning 1228, and at 2% tolerance those would likely diff on a
correctly-provisioned runner — founder call, recorded.

**One fact, one home.** `gate.mjs`'s header asserted *"Actions works again as of
2026-07-29"* while `CONTEXT.md` recorded it re-blocked on the 30th; the repo
contradicted itself about its own CI in two files. The gate now points at
CONTEXT rather than restating it. Same shape: `ci.yml` inlined
`npm audit --audit-level=high` while `package.json` already defined
`security-audit` — two spellings of one check, now one.

Guard — [`ciTruth.test.ts`](src/lib/ciTruth.test.ts): every npm script this repo
treats as a check runs in the gate or a workflow, or sits in `NOT_RUN` with a
written reason; the reverse (no stale exemptions); a11y specifically in the
**gate**, not merely in some schedule; and the visual step must not write its own
baselines, must not swallow its exit code, and must `exit 1` when baselines are
missing. *A guard nobody runs is a guard that does not exist* — PR #142's
discarded baselines and this a11y orphan stated as one rule.

**Three things this suite caught on its own first run**, all of them mine:

1. `secrets:scan` looked like it ran in CI because `gitleaks.yml`'s *header
   comment* mentions `npm run secrets:scan`. A guard reading a comment as
   execution is the `.195` header-menu defect again. Workflow YAML is now
   comment-stripped before matching, and the `NOT_RUN` reason was rewritten —
   it had been wrong about how the scan runs.
2. The visual check flagged **its own help text**, because the step now *tells*
   the reader to run `--update-snapshots`. `echo` lines are excluded: the rule is
   about what a step runs, not what it says.
3. Changing ci.yml to `npm run security-audit` broke compliance control
   **MW-MON-003**, which grepped for the literal string `npm audit` — a third
   place encoding the same fact, measuring a spelling rather than the thing it is
   about. The probe now accepts either.

Killed on first run: `a11y-dropped-from-gate`, `visual-passes-with-no-baseline`,
`not-run-table-without-a-reason`, `script-not-run-anywhere`.

Tests 999→1003. Gate 3.7→5.7 min.

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
