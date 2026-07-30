# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30).

---

## 2026-07-30 — Two controls that write a number nobody asked for (`.206`)

Both bugs are the same shape: a control the athlete touches for one reason
quietly writes a second value they never entered.

**Editing reps zeroed the prescribed weight.** `updateSetInput` rebuilt the whole
`{reps, weight}` pair on every keystroke from `getSetInput(exIdx, setIdx, 10, 0)`,
and `resolveSetInput` returns those defaults *verbatim* for a **prescribed**
exercise. So a coached bench 3×5 @ 100kg, tapped once on reps, became
`{reps: 6, weight: 0}` and logged **6 × 0kg** — zero volume on the lift the coach
asked for, and then `getLastSessionSets` and `suggestNextSetTarget` computed next
week's prescription from a set the athlete never did. Every other `getSetInput`
call site passes `set.reps, set.weight`; this one alone passed `10, 0`, which is
exactly why the console *displayed* the prescription correctly right up to the
moment it was edited.

The second half was the base. `updateSetInput` read `setInputs` from the render
closure instead of the updater's `prev`, and "Apply targets" fires two
synchronous calls per set — so the weight call rebuilt from a base that did not
yet contain the reps the first call had just set, and a 3×5 prefilled as **10
reps**. That is verbatim the `.175` bug the surrounding comment claims was fixed.

The rule is now [`nextSetInput`](src/lib/workout/activeWorkoutHelpers.ts), a
function rather than an inline spread, because the defect is a *shape* — which
base, which field survives — and `.196` is the standing reminder that a rule
spelled as a shape can only be checked as one.
`activeWorkoutHelpers.test.ts` covered `resolveSetInput` thoroughly and **it was
never wrong**: what broke was the arguments a caller handed it, which no test of
a correct function can see.

**Fuel logged your goal as your lunch.** `MacroCalculator.applyTargets` called
`saveMacroTargets(...)` — the whole job — and then also unshifted
`{ name: 'Calc target protein 180g', protein, cals }` into `mw_nutrition_log`.
`NutritionPage` sums every row dated today into the day's **consumed** totals, so
setting a 2400 kcal / 180g target made Fuel report 2400 kcal already eaten before
a single meal, and fed `countHighProteinDaysFromNutritionLog` (threshold 150g),
inflating the Mission Score's Fuel pillar off a number the athlete had only
wished for. `.127` broken at the source: nothing said on thin data, least of all
a score.

And it wrote `logs.slice(0, 50)` — the only row cap in the codebase, where every
other writer keeps **90 days** via `pruneNutritionLogToDays`. At ~4 entries a day
that is under two weeks, so one tap of "Apply targets" deleted months of real
meals and `NutritionPage`'s own next write persisted the truncated array back.
`.170` already ruled non-food rows out of the Fuel diary; this is the same rule
one layer down, on the device log rather than the cloud table. **Deleting the
write fixes both**, and the guard is stated repo-wide — the food log is pruned by
age, never by row count — so the next writer that invents its own retention fails.

Four mutants killed: `reps-edit-zeroes-weight`, `apply-targets-stale-closure`,
`targets-logged-as-food`, `fuel-log-truncated-to-50`.

Tests 1041→1049.

---

## 2026-07-30 — The restore the app forgets, then destroys (`.205`)

The worst defect the `.204`–`.213` audits found, because it destroys the data an
athlete deliberately asked the app to protect.

[`backup.ts`](src/lib/backup.ts) and
[`importCsvRestore.ts`](src/lib/workout/importCsvRestore.ts) write the zustand
persist payload straight to `WORKOUT_STORE_KEY` and, by explicit design, leave the
refresh to the caller — the pure merge stays testable, the browser half stays
thin. That seam is right; what the callers did with it was not. Both ran
`setTimeout(() => router.refresh(), 1200)`, and **`router.refresh()` preserves
client-side React state by design**. The store was already hydrated. `persist`
re-reads storage only on rehydrate. Nothing asked it to rehydrate.

    New phone → restore a backup of 300 workouts → toast says "300 workouts
    merged, 12 settings restored. Reloading…" → nothing reloads → History and
    Today still show empty → the athlete logs one set → `persist` serialises its
    in-memory state over the file → **all 300 workouts are gone, permanently.**

Identical for Strong/Hevy CSV import. Both toasts end *"Reloading…"*, so the
athlete waits, sees the old history, and concludes the restore failed — which is
the more merciful reading of what happened.

[`backup.test.ts`](src/lib/backup.test.ts) covers `mergeBackup` thoroughly and
could not see this: **the merge was always correct.** The defect lived entirely in
the sentence after it. That is why the new guard reads call sites rather than
merge results — "which function did you call after writing storage" is a fact
about the code, not about a return value.

New [`reloadAfterRestore.ts`](src/lib/storage/reloadAfterRestore.ts) gives the
rule a name and one home: *a function that writes storage behind a live store
must say how the store learns.* A full document reload, not
`persist.rehydrate()` — rehydrating repopulates the store, but every other module
that cached a read at mount (history analytics, the Today digest, challenges)
would still hold pre-restore values, and the copy has been promising a reload the
whole time.

The guard also pins the copy: a toast that says "Reloading…" must be attached to
something that reloads.

Two mutants, both killed with three failures each: `restore-without-rehydrate`,
`csv-import-without-rehydrate`.

**Process note, recorded because it is the second occurrence.** My mutant cleanup
used `git checkout --` on files holding *uncommitted* work, which silently
reverted the fix itself — exactly what happened in `.202`. The new guard caught it
on the next run, which is the guard doing its job, but the rule is now explicit:
**commit before mutating, every time.** A falsification run that can destroy the
thing it is verifying is not a safe procedure.

Tests 1035→1041.

---

## 2026-07-30 — The invite that discarded its own code (`.204`)

The beta gate is red because there are fewer than 10 users. The mechanism for
getting users had a one-line bug that silently threw the invite code away.

`src/emails/templates/beta-invite.html` linked to
`https://www.missionwinning.com/?invite=MW-ALPHA-2026`. `proxy.ts` redirected
every gated request with `NextResponse.redirect(new URL('/private', request.url))`
— and the `URL` constructor replaces the path **and the query**:

```
new URL('/private', 'https://x.com/?invite=MW-B-ABC12')  →  'https://x.com/private'
```

`PrivateTeaserClient` reads `?invite=` to decide whether the invitee screen
renders at all. So every invited tester arrived with the code stripped,
`isInvitee` false, and was shown the **public waitlist form** with the code field
folded inside a `<details>`. The one screen written for an invited tester was
unreachable from the one email that exists to send them there. `docs/BETA_INVITE.md`
says the link should be `/private?invite=…` and `print-beta-invite.ts` emits that;
only the shipped HTML disagreed, so a doc, a script and a template described one
URL and one of them was wrong.

The same line dropped `?next=`, which the gate also reads (`:41`, `:71`) — and
nothing in the repo ever set it, because this redirect was the only route to that
page. It was dead code guarding the return path for every bookmark, push URL and
share link. **Cloning instead of constructing fixes both**, and turns `?next=`
from a dead parameter into the thing it was written to be.

**Why nine waves missed it.** `scripts/gate.mjs` builds with `PRIVATE_MODE=false`
— deliberately, since that is what compiles the service worker `offline.spec.ts`
needs. So all 50 e2e cases and all 33 a11y cases run against a configuration **no
beta user will ever load**, and the first code path every invited tester touches
had never been executed by a test. That is `.200`'s thesis — *a guard nobody runs
is a guard that does not exist* — applied to the deployed configuration. New
[`privateGateRedirect.routetest.ts`](src/lib/privateGateRedirect.routetest.ts)
calls `proxy()` directly under `PRIVATE_MODE=true` and asserts on the `Location`
header a browser would follow: 18ms, against ~3 minutes for a second gated build.

**Onboarding could take a session away.** `startWorkout` replaces `activeWorkout`
outright, which is right at its seventeen other call sites — each is an athlete
tapping "start this workout". `WelcomePage.finish()` is the exception: there the
call is a side effect of finishing I-Day, and a returning athlete reaches it by
accident, because `/` renders marketing for anyone past the gate and its only
prominent CTA leads back into onboarding. New `hasLoggedWork` draws the line at a
**completed set** — a session started and abandoned is noise, but a logged set is
the first thing the app holds that the athlete cannot reproduce from memory. The
guard sits at the one call site rather than in the store, because changing the
store's contract would break the seventeen calls that mean exactly what they say.

**Two cards reached the athletes who no longer needed them.** `BetaWelcomeBanner`
— *"Finish I-Day, log one workout, then open Mission Coach"* — was mounted in
`HomeTodayDashboard` only, and `HomePage` sends `i-day` and `basic` to the lean
shell. `detectBasicMilestones` requires all five pillars, so an athlete stays
`basic` well past their first workout: the instructions appeared only after the
thing they instruct was done. `TodayReentryCard` had the same mount and the same
consequence, and a `basic` athlete can accumulate real history and lapse. Both now
gate on shared [`todayGuidanceMount.ts`](src/lib/today/todayGuidanceMount.ts),
the `.195` `dayReviewMount` pattern — `i-day` still excluded, because the first
run is the one screen that must stay bare.

One claim from the audit was **refuted rather than fixed**: the lapsed-before-first-workout
cohort does not need a re-entry card, because `computeReentry` returns `NONE` for
zero history on purpose — *"Never logged: that is onboarding, not re-entry."* The
mount rule defers to that rather than overriding it.

Four mutants, all killed, none survived first run: `invite-code-dropped-again`
(2 unit + 3 route failures), `welcome-dead-ends`, `onboarding-clobbers-active-session`,
`banner-only-in-one-shell`. The redirect guard **did** fail its own first run —
it matched the broken spelling inside the explanatory comment shipped with the
fix, which is `ciTruth`'s workflow-header trap again. Comments are not code, and
a guard that reads prose as behaviour will eventually be satisfied by an apology
for the bug.

Tests 1022→1035, routes 7→12. Opens the `.204`–`.213` wave.

**Still founder-owned:** `MAIL_POSTAL_ADDRESS` is unset, and
`scripts/send-beta-invite.ts` hard-exits without it while `renderEmail.ts` refuses
to render. This PR fixes the link; the email still cannot be sent until that is set.

---

## 2026-07-30 — State the repo can be trusted about (`.203`)

Documentation as an executable contract. Every finding here is the wave's defect
class one more time: *a thing exists, and nothing asserts anyone can act on it.*

**Four migrations were on disk and in no founder checklist.** The audit found two;
[`migrationLedger.test.ts`](src/lib/migrationLedger.test.ts) found two more on its
first run. `20260731_llm_usage.sql` (the `.188` spend ledger) had one parenthetical
in `ENV.md`; `20260801_day_review_push.sql` (`.194`/`.196`) had **nothing**;
`20260719_wearable_connections.sql` and `20260720_perf_indexes.sql` had nothing
either. All four gate merged, shipping features. A migration nobody wrote down is
a migration nobody applies — and this is a repo where **9 of 28 are already
recorded as pending**.

The guard asserts three things: every file on disk appears in the runbook, the
runbook names nothing that no longer exists, and **every entry says what breaks
without it**. That last one caught three older entries — `push_subscriptions`,
`referrals`, `beta_invites` — that named their contents but not their
consequence. `ls` gives you a filename; the runbook's whole value is the
sentence saying what stays broken until you run it.

**`CONTEXT.md` had 79 bullets and 103KB in a block whose own header calls it
"One screen of truth for any AI tool or human joining cold."** It is the first
thing `CLAUDE.md` tells an agent to read, so every cold boot paid 103KB of
mostly-superseded context before touching code. Same `+1`-per-feature pattern
`.197` fixed on the Today screen, and no PR is ever the one that made it long —
**I added seven of those bullets in a single day.** `.123`–`.189` rotated to
[docs/archive/CONTEXT-now-2026-07-30.md](docs/archive/CONTEXT-now-2026-07-30.md);
79 → 21 bullets, 103KB → 33KB. Nothing deleted, everything archived, and the full
record was always LOG.md. Budget of 25 stated in the block itself and enforced by
[`contextBudget.test.ts`](src/lib/contextBudget.test.ts) — a cap nobody can see
is a cap nobody keeps.

**Two more `.184`-class findings closed.** `ProfileOwnerTools` read
`mw_contributors`, which **nothing writes** — so "Members: 12,400" and the
revenue derived from it were constants dressed as stored data, on a card whose
title said "(Demo)" while its figures did not. Founder-gated, so the blast radius
is one person: the one making decisions from it. Now named illustrative, the fake
read is gone, and the key is deleted (no reader, no writer, nothing left).

`restorePremiumCourseProgressForUser` had **zero callers** while
`markPremiumSectionComplete` wrote its mirror on every completion — written
forever, read never. Wired into sign-in, where the parallel fuel mirror is
already read from. The learn path was the one left half-connected.

Killed: `migration-not-in-the-ledger`, `ledger-entry-with-no-reason`,
`context-now-unbounded`.

Tests 1016→1022. **This closes the `.199`–`.203` plan.**

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
