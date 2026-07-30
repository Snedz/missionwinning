# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30).

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
