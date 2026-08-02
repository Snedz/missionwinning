# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02).

---

## 2026-08-01 — The bootstrap the visual gate could not run (`.254`)

The visual suite has four cases and **zero committed baselines**.
`home-reduced.png` never had one at all, so `/` — the most-linked page in the
product — has been silently self-approving on every run since the case was
written. The other three were deleted in `.221` for depicting the pre-Modernist
navy/emerald design.

`.200` had already fixed the worse half. The job used to run
`--update-snapshots || true` and then re-run against the files it had just
written, so it was green every time over nothing. It now fails loudly with
instructions instead.

**The instructions named a command nobody could run.**

    Bootstrap them deliberately, on a Linux runner:
      npx playwright test --config=playwright.config.ts --grep @visual --update-snapshots

This job is the only Linux/Chromium environment the project has. Baselines
generated anywhere else differ by font hinting and antialiasing alone, which is
exactly how a pixel comparison stops meaning anything. So the loud failure was
correct **and terminal**: the only way out of it was a command that could not be
executed, and the suite has had no baselines since.

### An input, not a flag

`bootstrap_baselines` is a named `workflow_dispatch` input, **defaulting false**,
that generates instead of checking. Deliberately not a shell flag and not an
auto-fallback:

- the normal path stays a loud failure;
- the weekly schedule supplies no inputs, so it can never reach the generate —
  a scheduled run that regenerates its own baselines is `.200`'s check that
  cannot fail, rebuilt;
- bootstrapping stays something a person decides to do.

The generate **asserts nothing**, on purpose. It writes the PNGs, the existing
`always()` upload carries them off the runner, and the real gate is a human
opening every file. `.221` deleted the old baselines rather than refresh them
precisely because *"the obvious response to four huge visual diffs is
`--update-snapshots` without looking, which launders whatever the app happens to
render that day into the new truth."* A pass/fail on freshly written files would
be that laundering with a green tick on it.

### The guard, narrowed rather than weakened

`ciTruth`'s *"the visual job fails when it has no baselines"* forbade
`--update-snapshots` anywhere in the step, and this change trips it.

The rule was blunter than its own reasoning. What made the old behaviour a
defect was never the flag — it was that the **default path** wrote its own
baselines and then re-read them. The rule is now about reachability: a generate
may exist, but only behind an explicit default-false input, and it must not
assert.

Six mutants, all killed: the generate moved onto the default path; the input
defaulting `true`; the generate asserting instead of exiting 0; `exit 1`
softened to `exit 0`; the exit code swallowed with `|| true`; and the input
renamed away while the generate stays.

### Near-miss, third of its kind

The block-extraction regex ended on `\n\s*fi` — which matched the `fi` inside
`find` on the next line. The guard read one line of the block it was judging and
failed on a fragment. That is the third time in this programme a lazy quantifier
has stopped somewhere plausible and wrong, after `.221`'s `border-radius: 0` and
`.223`'s `prLine: null`. Anchored to `\n\s*fi\n`.

### Three baselines, not four

`/bundle` self-skips while FREE_BETA redirects it to `/log`, refusing to
snapshot a page under the wrong name. It resumes automatically the day Bundle
ships. So this produces `guide-human-performance`, `exercise-squats` and
`home-reduced`.

### The review found something, which is the point

The three pages were rendered and **looked at**, against the Modernist rules:
paper ground, one red, radius 0, Archivo, no navy or emerald, and each image
actually the page its filename claims.

`exercise-squats` and `home-reduced` pass. Paper `#f3f2f2`, poster red on the
CTAs, square corners, Archivo throughout. The homepage's grey photo blocks are
`GrayscalePhoto`'s deliberate no-`base` state ("PHONE ON A BENCH, MID-SET"), not
missing assets.

**`guide-human-performance` does not.** Its chapter hero is a near-black render
with a teal/emerald glow — a silhouette against a green ring — which is the
navy/emerald palette `.131` retired, sitting on a paper page. Measured across
the whole set rather than judged from one image:

| Chapter hero | dark | green/teal | red |
|---|---|---|---|
| assessments-progress | 96% | 5% | 0% |
| getting-started-mw | 89% | 0% | 1% |
| human-performance | 89% | 6% | 0% |
| movement-mechanics | 99% | 1% | 0% |
| nutrition-recovery | 98% | 3% | 0% |
| programming-tuning | 97% | 4% | 0% |

All six, 89–99% dark, essentially zero red. `.137` re-inked the guidebook
**cover** and rebuilt the PDF; the six chapter heroes were not in that pass, and
nothing could have said so — `check-design-system` reads source, and these are
`.webp` files in `public/`. A palette rule that scans code cannot see a palette
baked into an asset. That is `.221`'s finding one layer out.

So `guide-human-performance.png` **is not a baseline to commit**. The image is
not wrong about what the page renders; it is wrong to enshrine, because the
approved truth would then be the off-brand state, and the PR that re-inks those
heroes would read as a regression. That is the laundering `.221` deleted the old
baselines to avoid. Recorded as its own item.

### Blocked, and named

Committing the CI-generated PNGs needs the `visual-diffs` artifact, and this
session's token cannot read Actions (`403 Resource not accessible by
integration` on the run endpoint, so also on artifacts). The images reviewed
above were rendered locally at the same viewport and `reducedMotion: 'reduce'`
— which answers every question in the review list, since all of them are about
design and content — but they are **not** committable baselines: local font
hinting and antialiasing differ from the runner, which is the entire reason the
suite requires CI-generated files.

The mechanism ships here and the run is dispatched. Downloading the artifact and
committing the two good baselines is founder-owned until this session has
Actions read access.

## 2026-08-01 — Replay a day (`.251`)

The other half of `.247`, and the last of the four product references. Tesla's
VPP dashboard lets you go back to a specific grid event and see what the fleet
actually did; `/history/[date]` is that pointed at a day the athlete lived —
every pillar, in order, with the neighbouring logged days a tap away.

`.247` built the index this reads from, so the route is a lookup rather than a
scan.

### It collects nothing of its own

`gatherJournalEntries` already walks every pillar store and returns one shape.
Writing a second cross-pillar collector — even a slightly better one — is
`.178`, which this repo has paid for six times in thirty builds. So
`buildDayRecord` **filters what that returns** and never re-derives it: when a
new pillar starts logging, both the Today strip and the replay gain it at once
or neither does.

### A day reads forwards

`gatherJournalEntries` is newest-first, which is right for a *feed* — the Today
strip has no end and recency is the point. A **bounded day being replayed** is
the opposite, and rendering it showed why: the 8pm check-in sat above the 7am
session, so the page described the evening before the morning. Sorted ascending,
it reads as the day was lived — the walk, the session, breakfast, the check-in.

Fourth time this run that rendering a screen caught what the diff could not.

### The two ways a replay lies

- **Empty when it should be full.** `gatherJournalEntries` takes a limit and
  sorts newest-first, so a small ceiling silently drops the *oldest* days — and
  a day rendering empty reads as *"you did nothing"* rather than *"this page
  could not see it."* `.208`'s shape. The ceiling is deliberately far above any
  real day and a test puts an old day behind 300 newer rows.
- **The wrong calendar day.** Bucketing goes through `localDateKeyFromIso`
  (`.245`), and the entries arrive with two timestamp shapes — real instants
  from workouts and wins, synthesised `${date}T12:00:00` strings from meals and
  check-ins. Both are correct through that function; slicing either would put an
  Auckland morning on the previous day. Pinned in `Pacific/Auckland`.

The date is user input straight off the URL, so a malformed one renders an empty
record rather than throwing, and `/history` links to the replay so the route is
not built-and-unreachable (`.195`).

**And the CI status is finally true.** `ad101b34` ran all **25** steps green —
Hero E2E included, which settles `.249` — and gitleaks scanned for the first
time in this repo's history: *10 commits, 30.32 MB, no leaks found*. Both
CONTEXT rows are corrected, including the long-standing claim that gitleaks was
red because of `8ea3527a`: the action scans **the PR's commits only**, so that
finding was never going to fire on a pull request.

Tests 1236 → 1243.

---

## 2026-08-01 — I ran the fill tool and committed it (`.250`)

Three findings, and the first is mine.

### 394 regenerated locale files, committed by accident

While checking which CI steps passed locally I ran `npm run export-locales`,
then committed with `git add -A`. That swept **394 regenerated locale files**
into a commit whose stated purpose was a one-line LOG heading fix.

`.222` cut `public/locales` from 30.8 MB to 2.1 MB and built the splitter as a
**re-runnable** script with a `--check` gate step for exactly one reason: *"a
cleanup that cannot be repeated undoes itself the next time the fill tool
runs."* I ran the fill tool. It undid itself.

Caught because CI's unit step went red on `.222`'s own three guards — *no
namespace file carries keys from another namespace*, *common.json does not come
back*, *the footprint stays down*. Reverted by restoring the path from the
parent commit; `public/locales` is byte-identical to its pre-accident tree.

**`git add -A` after running a generator is the whole defect.** The generator is
supposed to be runnable; committing its output is what breaks the invariant.

### Bare `npm test` does not run every test

The reason it reached CI at all. Locally `npm test` reports **1232** tests;
under the CI environment it reports **1235** — three of `.222`'s guards only
register with `PRIVATE_MODE`/`NEXT_PUBLIC_*` set. So "1232 passing" was true and
meaningless: the suite that would have caught this never ran on my machine.

Every check in this entry was therefore verified with the CI env exported, not
bare.

### Five guards ran only in the lane an agent can skip

`check-design-system` (`.221`, widened in `.244`), `bundle-budget` (`.209`),
`check-locale-split` (`.222`), `i18n:coverage` and `a11y` (`.200`) existed
**only** in `scripts/gate.mjs`. `ci.yml` already states the principle above its
first check — *"a guard nobody runs on a PR is not a guard, and branches from
other sessions never run the local gate"* — and five guards contradicted it.

That is `.200`/`.213`/`.219` with the lanes swapped: those waves found checks
living only in a billing-blocked workflow, so `npm run gate` became the real
gate. CI runs again now and is the enforcing lane, and the drift reversed
silently.

Four are added; `a11y` is exempted **with its reason** — it needs a running
server and its one local run flaked on axe measuring skeleton text at 1.05
contrast before the page settled. A step that can go red for a render race
makes CI a coin flip, and a check people re-run until green teaches them to
ignore it. Fix the settle race first.

**Ordering is load-bearing and now guarded.** `check-locale-split` must run
*before* `export-locales`, because the export recreates the unsplit shape —
verified by running it: "15 languages, all split" becomes "392 files carry keys
outside their namespace". A reorder is a one-line diff nobody would think twice
about.

**And my own comment broke my own guard.** The first ordering test used
`indexOf('npm run export-locales')` and failed instantly — on the **comment**
above the split step, which names that command while explaining the ordering.
Matched on the `run:` line instead. Prose is not execution; `check-design-system`
strips comments for the same reason.

### The keys my own features never translated

`i18n:coverage` is a ratchet at 710 and `.246`/`.247` pushed it to **722**:
thirteen `t('…')` literals with a `defaultValue` and no EN pack entry, which
renders English in all fifteen languages. Added to `trackLocales` and
`historyLocales`; the count is now **709**, one below the cap rather than twelve
above it.

Tests 1232 → 1236 (1235 under CI env before this entry's additions).

---

## 2026-08-01 — The gate CI could not pass (`.249`)

Actions billing cleared at **00:12 UTC** and the PR gate ran for the first time
in this programme. It found two things nobody could have seen while every job
was dying at `runner_id: 0` — and one of them had been latent since `.198`.

### The local gate and CI built different apps

`Today shows one red action at 19:00` failed on CI — on the retry too, so not
flaky — while passing locally. 51 passed, 1 failed.

`.198` found that `isPushSupported()` returns false without a VAPID public key,
so every component behind it rendered **nothing** in every e2e run this repo had
ever done, and the guards over those surfaces passed vacuously. Its fix was a
placeholder key in `BUILD_ENV`.

That went into [`gate.mjs`](scripts/gate.mjs) and **not** into
[`ci.yml`](.github/workflows/ci.yml). One fact, two homes, drifted
immediately (`.178`) — and invisible for as long as CI could not run.

**Proved, not assumed.** Rebuilt locally with the key removed: the test fails,
reproducing CI exactly. Rebuilt with it: passes. Causation, not correlation.

This is `.209`'s lesson pointed the other way. There, the gate measured a
configuration production does not serve. Here **CI measured a configuration the
local gate does not serve** — and the local gate is what every agent runs before
pushing, so a green local gate meant nothing about CI.

[`gateEnvParity.test.ts`](src/lib/gateEnvParity.test.ts) now compares the two
lists: every variable the local gate sets must be set in CI, **to the same
value**, because a placeholder that differs between lanes is the same defect
with extra steps. Both mutants — deleting the CI entry, and changing its value —
turn it red.

**The guard's own parser was wrong first.** One regex read both
`NAME: 'x',` and `NAME:\n  process.env.NAME || 'x',`, and its cross-line branch
let `PRIVATE_MODE: 'false',` reach past its own line to the *next* variable's
literal — reporting a disagreement that did not exist. Split into bounded
segments per declaration. `.212`'s rule holds for the tools as much as the code.

### What CI settled about the flakiness

Three local gate runs had failed on three *different* timing-sensitive tests,
each passing standalone, and `.244` recorded that as container flakiness. **CI
passed all three.** So that attribution was right — and it was also hiding a
fourth failure that was entirely real and entirely deterministic. A suite that
fails differently every run trains you to discount the next failure, which is
what nearly happened here.

Tests 1229 → 1232.

---

## 2026-08-01 — Give gitleaks the permission it needs to scan (`.248`)

Actions billing cleared at **00:12 UTC** and gitleaks ran for the first time.
It did not report a secret: it failed **before scanning anything**.

    GET /repos/Snedz/missionwinning/pulls/178/commits  ->  403
    'Resource not accessible by integration'
    'x-accepted-github-permissions': 'pull_requests=read'

`gitleaks-action@v2` lists a PR's commits to work out its scan range, and the
workflow declared **no `permissions:` block**, so the job inherited a
contents-only token. The secret gate could not scan a pull request at all, and
the red it produced said nothing about whether the diff holds a secret. Now
declares least privilege: `contents: read` + `pull-requests: read`.

CONTEXT recorded that red as the known finding in `8ea3527a` — a real Solana
treasury address in history, deliberately not allowlisted (founder call). Still
true of `master`; **not** why the check was failing. Both causes are now stated
separately.

Also corrects the Actions status, which this file had wrong in **both**
directions within one night: it claimed "cleared" while jobs were dying at
`runner_id: 0`, and the correction claimed "blocked" an hour before billing came
back. The Ops bullet no longer describes CI at all — two places describing one
fact is `.178`, and the fix is not a better sentence but **no** sentence. The
Status table now says to read `runner_id` before recording anything: **0 means
it never ran; non-zero means it ran and something is genuinely wrong.**

---

## 2026-08-01 — Days logged, and the caps they outlive (`.247`)

The "1,146 days of data" number from the member story — and it **cannot be
derived from what is stored**, because every store in this app is capped:

| Store | Cap |
|---|---|
| `workoutHistory` | `HISTORY_CAP` = 1000 |
| `sessionJournal` | 200 |
| `bodyMetrics` | 200 |

Those caps are right — `localStorage` is finite and `.210` measured what an
unbounded write path costs mid-set on the logger. But they mean a long-running
athlete's first months are **deleted**, so a count derived from surviving rows
would *shrink as they trained more*. The day **keys** are therefore kept
separately: ten bytes a day, ~3.6 KB per decade.

### One sweeper, not a writer at every call site

The obvious design is `recordDayWithData()` called wherever something is
logged — which is `.220`'s defect waiting to happen. That wave found a guard
named *"both streak readers apply the recency rule"* that opened two files when
there were four, and the two it missed were the two that mattered. Six log
sites is six chances to miss the seventh, and the failure is **silent**: the
day just never counts.

So nothing writes on log. `sweepDaysWithData` reads every dated store, unions
what it finds into the persisted set, and runs on load — idempotent, and a
sweep finding nothing new produces byte-identical content, which `.210`'s
`dedupeWrites` then skips without touching disk. A guard asks the question the
other way round: *of the keys holding dated rows, which does the sweep not
read?*

### `.245`'s guard caught `.247` on its first run

The first version carried `isInstant: boolean` per source and sliced ten
characters when it was false. `no calendar date is sliced off a stored ISO
string either` — written six hours earlier — went red on the new file, and it
was right twice over:

1. A blind `.slice(0, 10)` on something that turns out to be an instant yields
   the **UTC** date. The `.245` defect, reintroduced in the file that cites it.
2. The flag is a second, hand-maintained description of the data's shape
   (`.178`). Set it wrong on a new source and every day from that store lands
   one off, silently, east of UTC.

An ISO instant always contains `T`; a `YYYY-MM-DD` key never does. `dayKeyOf`
asks the **value**, so nothing has to remember to declare it. The exemption I
was about to write would have been the wrong fix.

### What the number is allowed to claim

**"Days logged", never "days on mission".** For an athlete already past a cap
when this shipped, the sweep can only see what survived, so the count is a
**lower bound**. "N days logged" is true either way; "days since you started"
would imply a continuity nothing here can prove, and inventing that is `.208`
on the most emotive number in the product.

### Verification

Six mutants: dropping the union with stored days, slicing an instant, dropping
day-key validation, inverting `firstDayWithData`, and re-introducing the
`.245` slice — all killed. The sixth, removing a redundant `new Set()`,
**survived**, because both callers already pass a set; `persist` now takes
`Set<string>` so duplicates cannot be expressed rather than being filtered by
code no test could reach — the same call `.246` made an hour earlier.

Rendered against a built server: 12 workout days ∪ 11 nutrition days =
**23 days logged**, genuinely distinct from the 12 sessions beside it. That
also caught the date printing as a raw `2026-07-10`; it is now formatted from
**local** fields, never `new Date(key)`, which parses as UTC midnight and
renders the previous day west of UTC.

Tests 1220 → 1229.

**Not done, named.** `/history/[date]` — Tesla's "replay a specific grid event"
pointed at a day the athlete actually lived — is the other half of `.247` and
is not here. `listDaysWithData()` is the index it needs and now exists.

---

## 2026-07-31 — Ask for a trend, get a chart (`.246`)

The feature `.245` was opened for, now that the buckets underneath it name the
right day. `TREND_METRICS` + `parseTrendQuery` + `resolveTrendSeries`, and a
card on `/track` that turns *"volume over 30 days"* into a chart.

### Rules, not a model — because the model is dark

`COACH_LLM_API_URL`/`_API_KEY`/`_MODEL` are all unset, so a model-backed parser
would answer **nothing** for every current user. Free beta already unlocks full
depth for everyone, so a 402 was never the obstacle either. Whatever ships has
to work with no network, no key and no account — which is the logger's own
promise. If a model is wired up later it resolves the phrasings these rules
decline; it does not become the thing that answers.

### It answers or it asks — it never guesses

The failure mode worth designing against is a chart of the **wrong** metric,
because it looks exactly like a right answer, and this repo has paid for
"confident number, wrong quantity" in `.208`, `.217`, `.220` and `.223`. So an
unmatched query returns `no-metric` and names what the app *can* chart, and an
ambiguous one returns its **candidates** as tappable choices.

"Weight" is the ambiguity that matters and it is not a corner case: in a
training app it is the scale or the bar, and the app measures both. Resolving
it by table order would answer half those queries wrong. `"my weight"` resolves
(English possessive means the scale); a bare `"weight"` refuses.

### Training, not health

No HRV, no resting heart rate, no sleep — and their absence is a decision. This
is a PWA with no wearable, and `sleepConsistency.ts` is already an explicit
refusal to print a sleep number it cannot compute. A registry offering them
would make the *asking* surface promise what the *measuring* surface refuses —
`.195` in reverse. A guard asserts no metric answers to one of those words.

### Two of my own guards were vacuous, and mutation is what said so

- A test that "fat" inside "fatigue" must not match proved **nothing**: no
  metric answers to a bare "fat", so no matching strategy could have failed it.
  Swapping whole-word matching for `includes()` walked straight through. It now
  uses `"inactive"` against the real `active` entry.
- The parser ranked matches by phrase length so a longer phrase would win.
  Removing that ranking changed **no** result — the situation it arbitrated
  cannot arise, because phrases are unique to one metric. So the ranking is
  **deleted** and the overlap is forbidden in the table instead: a new guard
  fails if one metric's phrase sits inside another's. Unrepresentable beats
  handled, and it removes code no test could exercise.

### Rendering settled the mark, again

Drawn as a `monotone` line, daily volume swept smooth humps between 0 and
5,000 — implying the volume built and decayed *within* each day. A daily bucket
is a **discrete total**: you trained on the 14th or you did not, and a rest day
is a real zero. Those are bars now. Body metrics stay a line, because a
bodyweight between two weigh-ins genuinely did vary continuously. A chart is a
claim, and the first one was interpolating.

Also honest about coverage: `resolveTrendSeries` returns body metrics at their
**real** length rather than padding to the window, so asking for ninety days
with three weigh-ins cannot draw a flat line back to an invented zero.

**Verification.** Six mutants: ambiguity-by-table-order, the bare-weight
refusal, substring matching, the phrase-collision invariant and `windowAssumed`
all killed; the sixth deleted the code it targeted. Three states screenshotted
at 390px against a built server (answer, refusal, ambiguity) — which is what
found the mark. Tests 1201 → 1220.

**Recorded.** `trend_asked` reports the **outcome** (`volume`, `no-metric`,
`ambiguous`) and never the query text: what someone types about their own body
is not telemetry. The refusal rate is the number worth watching.

---

## 2026-07-31 — The day a session lands on (`.245`)

> **Merge correction, written when this branch landed.** `.241` reached `master`
> first and fixed **the same defect in four of these files** — `todayTrends`,
> `pillarScoreInputs`, `challenges`, `TodayJournalStrip` — from the other end of
> the wave. Two sessions found one bug independently, which is worth recording
> rather than tidying away: it was reachable from both the trend work and the
> empty-state work, so the two lanes converged on it.
>
> `master`'s attribution stands in the code comments, because it shipped first.
> What is **this** entry's own is the part `.241` did not do: **widening the
> guard**, so the next instance is caught instead of found. `.241` fixed call
> sites; `DATE_SLICE_EXEMPT` and the sliced-from-storage rule below are why there
> is no fifth time. Three sites `.241` never reached — `backup`'s filename,
> `founderDigestCompose` and the founder panel's date column — came with it.
>
> The merge also **emptied `UTC_IS_CORRECT`**: `.241` exempted two files whose
> matching sites this branch had already rewritten, and the staleness rule caught
> both. First time either direction of that rule has fired on real work.

Opening `.245` — the "ask for a trend" registry — meant reading the function
every trend would be built from. [`buildTodayTrends`](src/lib/todayTrends.ts)
keys its buckets with `localDateKey` and keyed the **workouts** with
`completedAt.split('T')[0]`. Those are not the same day.

```
completedAt (stored) : 2026-07-31T21:00:00.000Z
UTC bucket  (before) : 2026-07-31
local day   (buckets): 2026-08-01   ← MISMATCH
```

Proved in `Pacific/Auckland` before anything was touched: an athlete training at
**10:00 on 1 August** had that session counted on **31 July**. East of UTC that
is the entire morning — most of when people train — landing one bar to the left,
with **today's own column reading zero** on the Today trend strip.

A query surface over that would have shipped wrong answers behind a nicer
interface, so the foundation went first.

### `.212`'s lesson, the fourth time

`.199` shipped a guard matching `split('T')[0]` and nothing else; `.212` widened
it to four spellings and fixed fifteen sites. Both versions require a literal
`toISOString()` **call** adjacent to the slice — and an ISO instant does not have
to be produced on the spot to be sliced. It is usually read back out of storage,
where it is already a plain string:

```ts
w.completedAt.split('T')[0]   // byte-for-byte the same bug, invisible to the guard
```

Widening it **before touching any call site** turned it red on eight files. Two
were false positives of a kind the rule cannot resolve by shape — `schoolClass.ts`
and `ExercisesPublicFilter.tsx` slice an **array**, not a date — so those carry
exemptions that state the value being sliced, plus a staleness check in the
`.219`/`.220` shape that fails when an exemption stops being true.

Six were real, and the two that matter most are not the trend strip:

- [`pillarScoreInputs`](src/lib/pillarScoreInputs.ts) compares a UTC date against
  `localWeekKey()`, so a Monday-morning pillar win east of UTC dated to Sunday
  and **fell outside the week it belonged to** — and this one feeds the
  **Mission Score**.
- [`challenges`](src/lib/challenges.ts) makes the identical comparison against
  `weekStart`, dropping the same wins from the weekly challenge.

Also fixed: `TodayJournalStrip` (a UTC day compared to a local `today` decided
whether an entry showed its *time* or its *date*, so this morning's entry read
"Jul 31"), `founderDigestCompose`, `backup`'s filename and the founder panel's
date column.

### The suite could not have caught it

Every existing case in `todayTrends.test.ts` builds its ISO strings from a local
wall-clock time and then runs in **UTC**, where both spellings agree. It proved
the aggregation while being structurally blind to which day anything landed on.
`.211`'s lesson with the sign flipped — there a fixture drifted and went red,
here it agreed with the code because both were evaluated in the one zone that
hides the difference.

The new sweep runs five zones, and the control values are the point: with the
defect restored, **UTC, Los Angeles, Midway and even Tokyo all still pass**.
Only Auckland (UTC+13) fails at 10:00 local. A single-zone test was never going
to see this.

**Verification.** One mutant — restoring `split('T')[0]` — killed by the
Auckland case. Tests 1192 → 1201.

**Deferred, with the reason.** The `TREND_METRICS` registry and the offline
`parseTrendQuery` are **not** in this entry. They are the feature `.245` was
opened for, and they belong on buckets that name the right day; shipping them
together would have buried a correctness fix inside a feature diff and made the
"which day is this" change impossible to review on its own. **Shipped in `.246`.**

---

## 2026-07-31 — The charts the guard could not see (`.244`)

`.221` built [`check-design-system.mjs`](scripts/check-design-system.mjs) so
the Modernist rules — paper/ink, **one red**, radius 0 — would be checked instead
of merely stated. It caught `Benchmarks1RMChart` still drawing Tailwind blue-500
and green-500 through a full-app rebrand.

It also had two holes, and both were occupied.

### The rule matched hex, so every other spelling of a colour was invisible

```tsx
// src/components/track/TrackPaceChart.tsx — the pre-rebrand dark theme, on paper
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
<YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.45)' }} />
```

White grid lines and white tick labels on a **paper** ground — `#f3f2f2`. Not
subtly off-brand: *invisible*. The chart had been drawing an unreadable Y axis
since the rebrand, and the guard written to catch exactly that survival could not
see it, because `rgba()` is not `#`.

Widening the pattern to the functional forms — **before touching any call site**,
which is `.212`'s rule — returned five hits. Three were live drift; two were
already allowlisted under this same rule id. One of the three was a **sixth
leftover in the guidebook block `.221` had already cleaned**:

```css
.magazine-screen-bar { background: hsl(0 0% 100%); }
/* …under a token whose own comment reads: */
--background: 0 4% 95%; /* paper #f3f2f2 — the only ground, never pure white */
```

`.221` fixed four raw radii and a `#0a0c10` navy in that same block. This one
survived the pass for precisely the reason the chart whites did.

### And a rule cannot match styling that is *absent*

```tsx
// src/components/track/BodyMetricsCard.tsx
<Tooltip formatter={…} />   // no contentStyle at all
```

recharts' stock white box, `#ccc` border, its own radius — three rebrand rules
broken at once with **nothing in the file for a pattern to match**. Every rule
above asks *"is this value wrong?"*; a missing prop has no value to be wrong.

The stronger fix would make it unrepresentable, and recharts forbids it:
`findAllByType` matches chart children on `displayName || name` and reads props
off **that** element, so a `<ChartTooltip>` wrapper is either ignored outright or
— with a faked `displayName` — matched with its defaults sitting unread in the
inner element. Checked against the installed 2.15.4 source rather than assumed.
So the guard carries it: `unstyled-chart-tooltip` fails any `<Tooltip>` that does
not spread `CHART_TOOLTIP`.

**`Tooltip` names two different components here.** The first version returned
eight hits in files with no chart in them — `SetLogRow`, `TodayDashboardHeader`,
`PillarScoreBreakdown` — all the Radix `<Tooltip><TooltipTrigger>`, which takes
no `contentStyle`. A `.178` collision in the *tag name*, and a guard keyed to the
word would have demanded a chart prop on a hover hint. Keyed to the **import**
instead.

### The one accent meant two different things

`History1RMChart` and `Benchmarks1RMChart` plot the **same two series** and had
assigned them opposite colours: red was *estimated* on History and *actual* on
Benchmarks. `.221` re-inked the second file and nothing pointed at the first, so
the fix landed on one screen and the drift stayed on the other.

New [`chartTheme.ts`](src/components/charts/chartTheme.ts) exports the pair by
**meaning** — `measured` (solid, one accent) and `derived` (dashed, quiet) —
because naming them `red`/`grey` is what lets the next chart pick afresh. The
dash is not decoration: a one-hue palette cannot separate two series by colour,
which is what WCAG 1.4.1 asks you to avoid anyway. Four recharts files now take
their grid, axes and tooltip from one place.

The guards **discover rather than enumerate** (`.220`): every file importing
`CHART_SERIES` must map `actual → measured` and `estimated → derived`, and every
chart drawing an axis must import the shared chrome. Naming the two files I had
already looked at is the vacuous-guard shape this programme keeps paying for.

### Rendering it found two more the scan never could

`.221` noted that a screenshot caught what static analysis could not. It did
again, twice, both in charts I was already fixing:

- The body-metrics tooltip read **`: 80.8 kg`**. recharts renders the separator
  whenever `name` is non-nil, and this single-series formatter returns `''` —
  so a stray leading colon had been sitting there, unreadable until the box
  behind it was styled enough to read.
- The volume chart's legend read **`volume`** — the raw `dataKey`, lowercase and
  untranslated, in all eight languages. The formatter translated it for the
  *tooltip*; nothing did for the legend. Naming the series once fixes both
  readers and retires a dead branch, since that chart has no sessions series for
  `t('historySessionsLabel')` to have ever labelled.

### A failure message that read as a pass

Chasing a flaky gate failure cost a full run and turned up
[`thumbSweep.ts`](tests/e2e/helpers/thumbSweep.ts) reporting
`Math.round(box.height)` while asserting on the raw float — so a control
measuring 43.99 failed with *"controls under 44px tall: (no text) h=44"*. A
number that reads as passing, printed by the guard that just failed. `.219`'s
lesson — counting the wrong thing makes the truth unreadable — applied to a
message rather than a metric.

**Verification.** Five mutants, all killed: the rgba white, the pure-white bar,
the stripped tooltip spread, a swapped `measured`/`derived`, and a dropped
`chartTheme` import. Three charts screenshotted at 390px against a built server.
Tests 1186 → 1192.

**Not done, recorded.** `historySessionsLabel` is now unused but still declared
in the type, the English defaults and eight locale packs — removing a key across
all of them is a ripple this PR should not carry. And the e2e suite is **flaky in
CI-class containers**: three full gate runs failed on three *different*
timing-sensitive tests (thumb sweep, axe on `/profile` measuring skeleton text at
1.05 contrast, offline reconnect), each of which passes standalone. Gate steps
1–16 were green on every run.

## 2026-08-02 — The notification that says nothing (`.243`)

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

`.240` gave First Steps one mount: a Today card whose Dismiss writes a flag
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

## 2026-08-02 — The language switcher half the app ignores (`.242`)

`.241` closed by naming two functions as unfinished business: *"`utils.formatDate`
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

### `.241` was wrong about `/mind`, and the ratchet is what said so

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
`LOG.md`'s own sentence explaining that the 20KB figure was retired — after `.241`
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

## 2026-08-02 — The screens with nothing on them (`.241`)

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
A selection is not an action. New `selected` variant carries what `.240` already
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
the same alpha-on-a-contrast-token defect `.240` fixed three times in one wave.
Rendered, not inferred: `/history` in `en` and `ar` (RTL, `dir=rtl`, month name
`أغسطس 2026`), axe clean, month navigation confirmed to move.

**Not done, named:** class-2 red debt is capped, not paid — `/mind` at 34 is a
card farm and needs a composition pass, as do `/coach`, `/track` and `/nutrition`.
`WeekStrip` and `Skeleton` still carry their own hardcoded English day arrays;
the calendar derives its own rather than adding a third. `utils.formatDate` and
`benchmarks.formatChartDate` still pass `undefined` as the locale, so they follow
the browser rather than the app's language switcher.

---

## 2026-08-02 — The screen that said how you were doing before what to do (`.240`)

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
