# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30).

---

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

---

## 2026-07-31 — The status doc that archived the governing fact (`.213`)

Last of the `.204`–`.213` wave, and it closes a defect I introduced in `.203`.

**`CONTEXT.md` stopped saying the beta gates were red.** `ORCHESTRATION.md`
§Do-not-build bars features while they are — *"Only hero bugs / launch
unblock"* — and what makes them red is REDTEAM **A5**'s falsifier having fired.
That fact lived in `## Now` **only inside the `.170` ship bullet**, and `.203`
rotated `.123`–`.189` to the archive. For ten builds an agent booting cold read
CONTEXT, saw no red gate, and would have concluded features were allowed.

`contextBudget.test.ts` — which I wrote in the same PR — counted bullets,
checked the archive existed, and checked the budget was stated. It asserted
**nothing about which facts survive**. *A budget guard that counts without
checking content will happily let you archive the truth.*

The fix is not "never rotate". It is that these facts do not belong in ship
bullets at all: `## Now` now opens with a standing **Status table** — gate state,
`PRIVATE_MODE`, `MAIL_POSTAL_ADDRESS`, Actions, VAPID/cron/Sentry/Upstash,
pending migrations, gitleaks — and a `MUST_STATE` list fails the build naming
**the question `## Now` can no longer answer** rather than a missing string.

**`ciTruth` counted dead workflows as coverage.** `.200`'s rule accepts a check
that appears in any workflow YAML. Every workflow here is billing-blocked — jobs
die in seconds with `runner_id: 0`. So the guard I wrote to catch *checks that do
not run* was satisfied by workflows that **cannot run**: the same defect, one
level up, inside the guard against it. The proof is `npm run security-audit`,
which **exits 1 today** (48 advisories, 17 high) and lives only in `ci.yml`, so
it has been red-by-omission for this suite's entire life.

Honest scope, because overstating it would be its own failure: the worst
advisories (axios CVSS 8.7, `bigint-buffer` 7.5) enter solely through
`@phantom`/`@solana`, and that path is unreachable today — `/bundle` 307s during
free beta, `PhantomLifetimePayButton` returns null, the SDK is already
`dynamic()`. **CI truth and maintenance debt, not live exposure.** `next` and
`sharp` are the reachable ones.

**And the eighth vacuous guard, in the guard I had just written for that.** My
first version opened `if (CI_CAN_RUN) return;`, so the mutant that flips one
boolean disabled the entire assertion and survived. A guard switched off by a
flag nothing checks is a comment with a semicolon. `CI_CAN_RUN` is now pinned to
what `CONTEXT.md` records, so flipping it requires also saying, where a human
reads, that Actions works again.

**Two more checks that reported passes they had not measured.** `gate-smoke.ts`
pushed `ok: true` with detail *"skipped"* for the PWA probe **and** the
unlocked-`/welcome` probe, so "All gate checks passed" counted two things that
never ran — the same shape `ci-extended.yml` documents for the visual job. They
go to a separate `skipped` list now, printed and counted apart. **No policy
changed**: the service worker stays deliberately off while `PRIVATE_MODE=true`.

**Lint budget ratcheted 10 → 0**, and both outstanding warnings cleared — one
`STORAGE_KEYS` leftover I left in `.203`, one unused `LOCALE_FILES` import I left
in `.212`. The budget had allowed ten warnings since it was introduced while the
real count was one, which is exactly the slack a `.202`-style ratchet exists to
remove.

Killed: `now-block-drops-the-gate-state`, `dead-workflow-counts-as-running`
(survived first run — see above), `pwa-check-green-when-skipped`.

Tests 1092→1097. **This closes the `.204`–`.213` plan.**

**Not done, and named rather than quietly dropped:** the **8 open Dependabot
PRs** (#110–#118) plus #120. `postcss`, `js-yaml` and `fast-uri` clear three high
advisories directly. They are stuck because CI cannot verify them and the local
gate is the substitute — but landing eight dependency bumps is a different kind
of change from this wave, each wanting its own build and its own falsification,
and folding them into a documentation PR would have been the wrong shape.
Founder-visible in the Status table now.

---

## 2026-07-31 — A guard that measured a spelling (`.212`)

**This is a defect in my own `.199` work, and it is the fourth appearance of the
same lesson in this programme.**

`.199` shipped a rule — *no calendar date is derived from `toISOString()`* — that
matched `toISOString().split('T')[0]` **and nothing else**. It passed `.199`'s
own falsification because my mutants used the spelling the regex knew.

**Fifteen live call sites used the other one.** Widening the regex first, before
touching any of them, turned it red on **twelve files** — which is the only
evidence that a guard can see the defect it claims to prevent.

The one that mattered: **`weekRecap.ts` shared the wrong week.**
`weekStart.toISOString().slice(0, 10)` applied to a correct *local* Monday from
`startOfLocalWeek()`. East of UTC, local Monday 00:00 is still Sunday in UTC, so
the field whose own JSDoc says *"Local Monday as `YYYY-MM-DD`"* reported a
Sunday — and it is not internal: it reaches `weeklyDebrief` →
`TodayWeekRecapCard`'s **shared text** and the share-card title, while
`useCoachPlan().weekStart` said the correct Monday. Two answers for the same week,
in the same product, in the same evening.

`weekRecap.test.ts`'s assertion was `typeof recap.weekStart === 'string'`, which
is why `.199` — the PR about exactly this class of bug — did not catch it. It now
sweeps **six timezones × four hours**, including UTC+14 and UTC−11, and asserts
the value is both the right date and an actual Monday. Verified to respond to
`TZ`: reverting `weekRecap.ts` alone turns it red, which a timezone test that
silently ignored `process.env.TZ` would not.

The other fourteen — `coach/load.ts` (ACWR, feeds Coach and readiness),
`coach/progress.ts`, `nutritionQuickLog`, `healthImport`, `wearables/mapSamples`,
`SessionCheckInSheet`, `BodyMetricsSheet`, `ProgressPhotosCard`,
`FuelWeightStrip`, `nudgeCopy`, `BetaAdminPanel` — all now call `localDateKey`.

**The rule, written down because it keeps recurring:** *a guard keyed to one
spelling of a defect has only ever tested that spelling.* Where a parsed shape
can be asserted, assert that. Where only source text is available — as here —
enumerate the spellings **explicitly** and say why the list is closed. It is
closed here because `split('T')`, `slice(0,10)`, `substring(0,10)` and
`substr(0,10)` are the only ways JavaScript has to take the date half of an ISO
string; `substr` is included because it is deprecated, not removed.

Killed: `slice-spelled-utc-date`, `substring-spelled-utc-date`,
`week-recap-shares-the-wrong-week`.

Tests 1091→1092.

---

## 2026-07-31 — The queue that stops forever, and the cache that keeps your data (`.211`)

Four defects on the offline path, in the module whose own header promises
*"Nothing is ever dropped for failing… losing a workout is not an option."*

**A hung fetch killed the outbox for the life of the tab.** `flushing` is cleared
in a `finally`, and `finally` runs on **settle** — a promise that never settles
never runs it. So every later `flush()` returned 0 forever, including the
`online` and `visibilitychange` paths in `useOutboxDrain`. The queue kept
accepting work, the UI kept saying "pending", and nothing left the device until a
reload. No handler passes a signal, and `supabase-js` sets no default timeout.
This is the product's own stated scenario: captive-portal gym wifi, or a TCP
connection that goes dead-air without an RST.

Two independent belts, because either alone can be defeated: each handler now
races a **20s** timeout, and the `flushing` flag itself expires after 120s so a
flush that somehow escapes the race cannot wedge the queue permanently. A
timeout resolves `false`, which is already an ordinary failure — the existing
backoff handles it, and no new state appears anywhere.

**The cap dropped the work it had just been handed.** `save()` did
`ops.slice(0, MAX_QUEUE)` while `enqueue` pushes to the **end**, so at 500 ops
every new `workout.upsert` was truncated away by the same call that added it.
New pure [`capQueue`](src/lib/sync/outbox.ts) states the order plainly: a logged
workout is never dropped while anything else could go instead; among the rest the
**oldest** goes first, because a superseded coach plan or leaderboard push has
already been overtaken; and only a queue that is *all* workouts sheds its oldest
workout, by which point the device is far past any recoverable state.

**Authenticated API responses sat in CacheStorage for 24 hours.** `app/sw.ts`
passed serwist's `defaultCache` unmodified, whose `/api/*` entry is
`NetworkFirst` with `maxAgeSeconds: 86400`. That stored `/api/premium/status`,
`/api/wearables/status` and — on a product with a `/api/youth/consent-*` surface
— `/api/school/class/[code]/export`, a CSV of student names and scores. It
survived sign-out and was served to the next user of a shared phone while
offline. Serwist's own auth exemption matches `/api/auth/*`; this app's callback
is **`/auth/callback`**, which fell through to the catch-all bucket. Explicit
`NetworkOnly` matchers for both, **before** the spread — nothing offline reads an
API response, so this costs nothing.

**The teacher PIN was brute-forceable through the routes that did not limit it.**
`/api/school/class/[code]/verify` caps PIN attempts at 5/minute; its siblings
`stats`, `leaderboard` and `export` authenticate with the same PIN and had **no
limit at all**. The limit now lives inside `resolveTeacherClassAccess`, so every
consumer inherits it and the next route added does too. Only PIN attempts are
counted — a signed-in creator should not be throttled by someone else guessing at
their class code.

**Also:** six routes returned `error.message` from a Supabase failure straight to
the client, naming tables, columns and constraints — a free schema map for anyone
probing the mobile sync surface. Opaque codes now; the detail goes to the server
log, where the person debugging it is. And the four cron routes declare
`maxDuration`: they send email serially and call `markNudged` only after the
loop, so at Vercel's 10–15s default the function was killed mid-loop, the batch
was never marked, and the next daily run **re-sent to everyone already emailed** —
each timeout widening the duplicate window.

**A test with a date literal in it is a test with an expiry date.** Three
`first-90.spec.ts` cases pinned `page.clock.setFixedTime(new Date('2026-07-30T…'))`
while `seedEveningReview` writes its check-in under the **real** current date.
They passed all evening and failed the moment the clock rolled past midnight,
because the day-review card looked for a day the fixture had not seeded and
`composeDayReview` correctly returned null. New `fixedTimeAt(hour)` derives the
day from the same clock the fixtures use, so "at 19:00" means the evening *of the
seeded day* rather than of one particular Thursday. Not a `.211` regression —
found by it.

Six mutants killed: `newest-op-dropped`, `handler-can-hang-forever`,
`flush-flag-sticks`, `api-response-cached`, `pin-brute-forceable`,
`cron-resends`. None survived.

Tests 1078→1091.

---

## 2026-07-30 — The logger wrote your whole history every second (`.210`)

`tickElapsed` and `tickRestTimer` each call `set()` on a one-second interval,
and zustand's persist middleware calls `setItem()` after **every** `set()` — it
does not diff the partialized slice. `elapsedSeconds` was in `partialize`, so
every tick ran `partialize` + `JSON.stringify` + a synchronous
`localStorage.setItem` of `savedWorkouts + workoutHistory + activeWorkout`.

Benchmarked on realistic 6-exercise/4-set logs:

| history | payload | `JSON.stringify` |
|---|---|---|
| 50 sessions | 163 KB | 0.85 ms |
| 200 sessions | 647 KB | 3.45 ms |
| 500 sessions | 1,616 KB | 9.64 ms |

A mid-tier Android is 4–6× slower and the synchronous disk write costs about as
much again, so a 200-session athlete lost roughly **30–50 ms of main thread per
second while logging, 60–100 ms/s during rest**. On the wedge screen, mid-set,
on the cheapest phone in the target market — and at 1.6 MB it walks toward the
5 MB localStorage ceiling.

**Two halves, because either alone leaves the write in place.**
`elapsedSeconds` leaves `partialize` and is **derived from
`activeWorkout.startedAt`** instead of counted — which is also more correct: the
counter only advanced while the tab was open, so a session resumed after twenty
minutes away reported the time the *tab* had been open rather than the time the
athlete had been training. And [`dedupeWrites`](src/store/persistDedupe.ts)
skips any `setItem` whose bytes are already on disk. Together a tick now
produces an identical payload and is skipped outright.

**Throttling was deliberately not added.** The obvious companion fix is to
coalesce writes to ~1/2 s with a trailing flush on `pagehide`. This is the path
that holds sessions nobody can reproduce from memory — `.205` was the last
defect here — and a deferred write that fails to flush is data loss, while the
browser events that would flush it are exactly the ones that fire unreliably on
mobile. **Skipping a byte-identical write cannot lose anything**, because the
value on disk is already the value being written. That asymmetry is the whole
argument, and it is recorded at the function.

Killed: `elapsed-back-in-partialize`, `dedupe-removed`, `dedupe-always-writes`,
`elapsed-counted-not-derived`.

**Two self-inflicted misses worth recording.** The SSR fallback shipped as
`undefined!` and every store test died on `Cannot read properties of undefined
(reading 'setItem')` — `browserStorage()` now gives an in-memory stand-in, the
same promise `safeStorage` makes for `mw_*` keys. And the wiring guard bounded
its slice with `indexOf('getRecentHistory:')` from position 0, which found the
`WorkoutState` **interface** 400 lines *above* `tickElapsed` and produced a
backwards slice — vacuously true. The first correction still matched
`tickElapsed: () => void;`; only anchoring on the implementation's brace worked.
Sixth and seventh vacuous-guard instances in this programme, both in a guard
written minutes earlier.

Tests 1066→1078. **`/active` render cost — the per-set history scan, the two
`localStorage` reads in render, the `localeCompare` sort per tick — is not in
this PR.** Those are re-render work, not disk writes, and belong with a
`React.memo` pass rather than bolted onto a persistence change. Carried forward.

---

## 2026-07-30 — 306 KB of translations on every route (`.209`)

Measured, not estimated, and the largest user-visible win in the wave.

`localeHttpLoader.ts` needed exactly two facts per namespace — its name and its
filename — and got them by importing `LOCALE_EXPORTS` from
`@/lib/exportLocales`. That module imports 28 `*Locales.ts` files **and**
`@/i18n/localePacks`, which imports 14 `packs/*.json` totalling 1.1 MB on disk.
And `localeHttpLoader` is reached from the **root layout**:

```
app/layout.tsx → I18nPwaProvider → LocaleHttpSync → localeHttpLoader
               → exportLocales → localePacks → 14 × packs/*.json
```

Every link static. The result was one `chunks/7660-…js` at **1,053,845 B raw /
313,839 B gzipped**, loaded as a plain `<script async>` on `/`, `/log` **and**
`/active` — 44 % of the initial JS on the logger. An English user in Nairobi on
3G downloaded Thai, Vietnamese and Hindi before first paint.

That silently defeated the design `i18n/hydrateResources.ts` documents in its own
header (*"dynamic imports keep ~8k LOC of `*Locales.ts` out of first paint"*) and
`src/i18n.ts`'s *"minimal EN first paint"*. **Both were true of the source and
false of the build**, which is the whole reason a byte budget is worth more than
a comment.

The fix is a new [`localeExportManifest.ts`](src/i18n/localeExportManifest.ts)
with **zero imports** — 28 `{namespace, filename}` rows and nothing else.
`localeHttpLoader` reads that; `exportLocales` reads it too and derives
`LocaleNamespace` from the array rather than declaring the union a second time,
so the list exists once. The remaining `import type { ExportLang }` is erased at
compile time.

**Measured after, same method as before:**

| route | gzipped initial JS |
|---|---|
| `/` (gated teaser) | **164.0 KB** |
| `/log` | **262.8 KB** (was 44 % locale pack) |
| `/active` | **418.8 KB** |

The megachunk no longer exists in the build, and a byte-level scan of every
chunk still referenced from `/log` finds **no locale-pack strings at all** —
checked for `Platos` (es), `ครั้ง` (th) and `तकरार` (hi) rather than trusting the
chunk name.

**The step that would have caught it.** `todayPerf.test.ts` says so in its own
words — *"a bundle-size assertion would be better and does not exist here."* New
[`scripts/bundle-budget.mjs`](scripts/bundle-budget.mjs) is that assertion, wired
into `npm run gate` straight after the build. It reads the **prerendered HTML**,
not the build manifest, because the question is not which chunks the graph
contains but which `<script>` tags the browser actually fetches — the only form
of the question a user experiences. Ratcheted the `.202` way: caps move down
only, with the high-water marks checked into
[`bundleBudget.test.ts`](src/lib/bundleBudget.test.ts) so a raise cannot pass
unnoticed. It also refuses to pass when `.next/` is missing, rather than
reporting green for a measurement it did not take.

A second, cheaper rule runs in the unit lane and needs no build: nothing on the
root-layout path may **value**-import `@/lib/exportLocales` or
`@/i18n/localePacks`, and the manifest itself must import nothing.

**The budget failed on its own first gate run**, and the reason is worth
recording. I calibrated it against a default `npm run build`, where `/` is the
six-chunk `/private` teaser at 164 KB. `gate.mjs` builds `PRIVATE_MODE=false`,
where `/` is the real landing page — 20 chunks, 247.4 KB. That is the `.204`
asymmetry in a new place: **the gate measures a configuration production does not
currently serve.** The caps are now set against what the gate builds, because a
cap the gate cannot check is not a cap, and the note at the constant says so.

Killed: `locale-packs-back-on-the-critical-path`,
`byte-budget-raised-instead-of-lowered`, `budget-not-in-gate`.

Tests 1061→1066.

---

## 2026-07-30 — Numbers the product overstates (`.208`)

Two celebrations the app could not support.

**Four filters for one quantity.** [`percentLoad.ts`](src/lib/workout/percentLoad.ts)
says in prose that the prescriptions, the /benchmarks cards, the live PR chip and
the debrief "all quote the same number". They did not:

| site | warmup | failure | drop |
|---|---|---|---|
| `countsTowardPr` — **the live PR chip** | excl | **incl** | excl |
| `benchmarks.ts` — 1RM chart | excl | excl | incl |
| `coach/progress.ts` `isCountable` | excl | excl | incl |
| `setMath.ts` `loadBearingSets` — prescribed load | excl | excl | incl |

Prior best bench 100×6 (e1RM 116.1); log 100×8 marked **failure** → 124.1 → the
brass chip fires and `isPr` is written into the log, while the chart, the debrief
and next session's prescribed load all skip that set and still say 116.1.
Verbatim the failure `benchmarks.ts:4-9` claims was already fixed.

The majority is also the defensible answer: a set to failure gives the highest
and least repeatable e1RM reading, which is exactly why the three estimate
consumers refuse it — so the celebration was firing on the one kind of set the
rest of the app declines to trust.

**The `drop` disagreement was left standing, deliberately.** It is a taste
judgement, not a numeric one: a drop set is evidence (it should feed e1RM) but
the burnout at the end of the work is not a moment to celebrate. So `.208` splits
the two reasons into two names — `countsTowardStrengthEstimate` for what the app
*believes*, `countsTowardPr` for what it *celebrates* — rather than flattening a
deliberate choice to make a table look tidy. Three consumers now delegate;
`reachability.test.ts` fails a fifth copy.

**The PR that could never not happen.** `estimateOneRepMax` returns 0 above 12
reps, because no 1RM formula is fitted there. So `getBestPriorSet` can only ever
return a set of 12 reps or fewer — and for an athlete who trains high-rep only it
returned **null forever**, while `isPersonalRecord` answered `if (!prior) return
true`. Goblet squats at 20kg × 20: a PR on set one, and a PR on set two hundred,
with the chip and the haptic every time, and `isPr` written into the log so it is
on the record too. A celebration that cannot fail to happen carries no
information. Checking the *new* set first is the fix: no estimate, no claim — and
the genuine first-estimable-set case still reads as a PR, correctly.

**Two existing tests encoded the old behaviour** (`failure sets count toward
volume and PR`, `drop sets skip PR`) with no stated rationale. The first was the
bug written down; it now says what it means and why. The second was a real
decision and survives, restated.

Killed: `pr-chip-counts-failure-sets`, `high-rep-permanent-pr`,
`fifth-countable-definition`.

Tests 1058→1061. **The streak-decay item planned for `.208` is not in this PR** —
it is a separate wrong number with its own blast radius (`StreakChip`,
`WorkoutVictorySheet`, `computeWinScore`, the leaderboard snapshot) and folding
it in would have made the falsification of these two harder to read. Carried
forward, still open.

---

## 2026-07-30 — The coach that thinks it is always Monday (`.207`)

Three defects at one call site, and the test that should have caught them was
the reason they survived.

`useCoachPlan` called `adaptPlan(existing, ctx, weekStart)` — passing the start
of the week as **today**. So `todayDayOffset(weekStart, today)` was always `0`:

- `dayOffset < todayOffset` never matched, so **no session was ever marked
  missed** on the automatic path, and the "life happened — N sessions missed,
  remaining days re-spread" adaptation could not fire at all.
- The low-readiness recovery swap targets `dayOffset === todayOffset`. On a
  Thursday with readiness 30 the coach swapped **Monday's** session — a day
  already gone — and left Thursday's heavy squat day exactly where it was. The
  athlete asked for a lighter day and got one retroactively, on a day they had
  already trained.

The real date was in scope the whole time: `todayOffset` sits three lines above,
derived from the clock, and is passed to `adaptForEquipmentChange` on the very
next line.

**The revision was a claim nobody had to earn.** `adaptPlan` returned
`plan.revision + 1` unconditionally, and `useCoachPlan` guards its save with
`next.revision !== existing.revision` — always true. Every mount rewrote the plan
and called `scheduleCoachPush()`. Downstream `hasCoachAdaptationSignal` is
`revision > 1`, so `CoachAdaptBanner` told **every athlete, on every visit** that
the coach had adapted their week, including when nothing had changed. `.127`:
nothing said on thin data. An unchanged week now returns the same object.

**The cycle.** `savePlan` dispatches `mw-coach-plan-changed`; `useCoachPlan`
listens and calls `refresh()`, which called `savePlan` again — and
`dispatchEvent` is synchronous, so this recurses on one stack.
`HomeTodayDashboard` mounts two `useCoachPlan()` consumers. **I did not execute
it** — that needs a browser and a mounted React tree — so rather than claim a
reproduction I did not run, the new
[`adaptTermination.test.ts`](src/lib/coach/adaptTermination.test.ts) pins the
property that closes the cycle: `adaptPlan` is idempotent, on **every day of the
week**, so the `!==` guard is false on the second pass and `savePlan` is not
called again. Worth having regardless — an adapt that is not idempotent means the
plan an athlete sees depends on how many times a component happened to mount.

**The vacuous assertion.** `adapt.test.ts`'s "marks past planned sessions as
missed" passed `today = weekStart` and then asserted `missed.length >= 0`, which
is true of every array ever created. It was green for the entire life of the bug
it was named after. Rewritten to a real Thursday and a real count, plus the
opposite direction (nothing is missed on Monday).

**One mutant survived first run**, and it was my own new guard:
`recovery-swap-hits-the-wrong-day`. The test read
`if (session?.kind !== 'strength') return;` — and the fixture has **no session on
day 3 at all**, so it returned without asserting anything. Fifth vacuous guard in
this programme, same shape every time. Preconditions are now asserted, never
skipped past, and the days either side are marked done so the missed-session
re-spread cannot move the session under test.

Killed: `today-is-always-monday`, `revision-always-bumps`,
`recovery-swap-hits-the-wrong-day`.

Tests 1049→1058.

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
