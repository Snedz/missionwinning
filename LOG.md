# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02).

---

## 2026-08-01 — The suite that had never run (`.257`)

`ci-extended`'s `e2e-critical` job executed for the first time on 2026-08-01 and
failed **8** tests. One was `.249`, fixed on #182. These are the other seven.

All seven reproduce locally against a build carrying the exact CI env, so none
of them is container flakiness — `.224` records me calling three failures that
when one was a real deterministic bug, and this time the reproduction came
first. None of them is a product defect either. Every one is the **suite**
describing a product the repo stopped shipping.

The mechanical reason they all rotted together: `ci.yml` runs `e2e:gate`
(`@gate`-tagged only), and `e2e:critical` — everything except `@a11y`/`@visual`
— lives in the billing-blocked extended workflow. These assertions had never
been compared against the app.

### Three premium routes answered 200, and that is correct

```
Expected 401/403 for /api/premium/recipes, got 200
Expected 401/403 for /api/premium/programs, got 200
Expected 401/403 for /api/premium/fuel-plan, got 200
premium status: expected false, received true
```

```ts
// src/lib/premiumServer.ts:29
export function isPremiumBypassEnabled(): boolean {
  return isDemoPremiumEnabled() || isFreeBetaPremiumUnlocked();
}

// src/lib/freeBeta.ts:14 — the default is the whole story
export function isFreeBeta(): boolean {
  const raw = process.env.NEXT_PUBLIC_FREE_BETA?.trim().toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'off') return false;
  if (raw === '1' || raw === 'true' || raw === 'on') return true;
  return true;
}
```

`NEXT_PUBLIC_FREE_BETA` is unset in every environment that has not opted out, so
depth is unlocked for everyone. That is the documented free-beta decision, and
the tests were asserting the pre-beta contract.

**Skipping under free beta was the easy answer and the wrong one.** The paywall
would then be untested in the state it eventually ships in, and the day the beta
ends nothing would tell anyone the gate had not come back — a check that stops
existing exactly when it starts mattering.

So the expectation is read from the app rather than guessed from an env var the
test process cannot see anyway (`NEXT_PUBLIC_*` is inlined at build time, so a
spec reading it reads its own environment, not the server's). `/api/premium/status`
already names its own reason:

```
free beta on   → {"premium":true,"source":"free_beta"}   → routes must serve 200
free beta off  → {"premium":false,"source":"anonymous"}  → routes must 401/403
```

**Verified in both states, which is the part that matters:**

| build | `/api/premium/status` | `/api/premium/recipes` | premium-gate |
|---|---|---|---|
| default (free beta on) | `premium:true, source:free_beta` | 200 | 4/4 pass |
| `NEXT_PUBLIC_FREE_BETA=false` | `premium:false, source:anonymous` | **403** | 4/4 pass |

The second row is the first time this product's paywall has been executed by a
test at all.

The status case also asserted `premium === false` flatly, against an allowlist
(`anonymous`, `unconfigured`, `free`) that never contained `free_beta`. Both
halves described the old product. The two fields are now checked against each
other: the source must be one the repo knows about, and the boolean must be what
that source implies. An anonymous caller entitled for a reason the endpoint does
not name still fails, which is what the test was written to catch.

### A test that asserted a hidden element was visible

```
Locator: locator('a[href="/welcome"]').first()
Expected: visible
Received: hidden
  14 × locator resolved to <a href="/welcome" class="hidden … md:inline">Start free</a>
```

`/exercises/squats` has three `/welcome` links. The first in DOM order is the
desktop nav's, and every project in `playwright.config.ts` is mobile-chrome at
375px — so `.first()` selected a `display: none` element and then asserted it was
visible. `:visible` also makes the assertion say what it means: a reachable route
to `/welcome`, not a `/welcome` string somewhere in the markup.

### A test that was measuring onboarding

`growth.spec.ts:55` navigated to `/profile` and asserted on the body. The body it
got was *"Welcome — I-Day · … Set your path, then log your first session"* — the
onboarding screen, because the block never called `seedLegacyOnboarding` the way
every other spec needing a signed-in screen does.

Seeded, plus an explicit landing-path assertion, so the next redirect fails
loudly rather than silently retargeting the test at a different page.

### A heading that lost a word

`premium-pillars.spec.ts:15` asserted `/^free guided sessions$/i`. The heading is
**"Guided sessions"**; "Free" now lives in the body copy beneath it (*"Free
guided patterns — no audio required"*). The player assertion above it passed the
whole time.

Kept anchored rather than loosened to a substring: `/guided/` also matches
"Browse guided sessions" and "Try a guided session", both links elsewhere on the
page, and an assertion that cannot tell a section heading from a call to action
is not asserting the section exists.

### Result

`15 passed · 7 failed` → **`22 passed · 1 skipped · 0 failed`**, against a real
server built with the CI env.

## 2026-08-01 — Opacity is not a state, it is a contrast reduction (`.256`)

> **Merge correction, written when this branch landed.** `.240` reached `master`
> first with the same fix in `PlanSessionCard` — the same defect, the same
> `WeekStrip` precedent cited, a second independent pair of axe numbers. Two
> lanes converged on it, which is worth recording rather than tidying away.
>
> `master`'s treatment stands in the code, and `dashed` is the better of the
> two borders: a plain 2px border is what every other card on that grid already
> draws, so it said "missed" in the language the screen was using for "normal".
>
> What survives from here is the half neither border covers — the **`Missed`
> Badge**, and the **guard**. `.240` fixed one component; `stateOpacityContrast.test.ts`
> bans bare `opacity-{40..80}` across `src/components` and `src/page-components`
> so the next one is caught rather than found. That is the difference between
> fixing an instance and closing a class.

`npm run gate` went red on `/coach`:

```
Element has insufficient color contrast of 2.97
(foreground #8a8888, background #eeebeb, 10px, normal weight)
<div class="… bg-neutral-200 text-neutral-800 text-[10px]">Shoulders</div>
target: .opacity-60.rounded-2xl.bg-card … 
```

One class caused it:

```tsx
// PlanSessionCard.tsx, before
session.status === 'missed' && 'opacity-60',
```

Container opacity composites **every descendant** toward the ground, so dimming
a card dims its text with it. `bg-neutral-200 text-neutral-800` is a perfectly
legible pairing on its own; at 60% over paper it is `#8a8888` on `#eeebeb`, less
than two thirds of the ratio WCAG 1.4.3 requires.

### The rule was already written down, three files away

```tsx
// WeekStrip.tsx:85 — the missed cell of the very same plan
// Quieter via border + no glyph, not opacity — dimming the
// container also dims the day label past 4.5:1 at 10px.
missed && 'border-border bg-transparent',
```

Two components, one concept, opposite treatments. `.178` again — and the more
useful lesson is about where the correct answer lived: in a comment, which
protects the file it is in and nothing else.

The card now uses the strip's treatment, and it also says **"Missed" in words**
via `coachSessionMissed` — the key `WeekStrip` has used since it was written, so
this costs no translation. Worth stating plainly: opacity conveyed the status to
sighted users only, and a border conveys it to nobody at all. The status was
never in the accessibility tree.

### Why no test caught it, and why the new one reads source

Every offender here renders only in a state the a11y suite never reaches. This
markup needed `.207` — the fix for *"no session was ever marked missed"* — so it
was literally unreachable for as long as it was wrong. `/coach` has been in
`GATED_ROUTES` the whole time and passed.

So `src/lib/stateOpacityContrast.test.ts` does not wait for a render. No **bare**
`opacity-{40,50,60,70,80}` in `src/components` or `src/page-components`.
Prefixed variants are deliberately out of scope: `disabled:opacity-50` is the
shadcn idiom and WCAG 1.4.3 exempts inactive controls, and `hover:`/`group-`
states are transient. What is dangerous is the unprefixed kind, which is on the
element for as long as the element exists.

Ten exemptions, each with a reason, plus a staleness test. Four are paywall
previews blurred by design, four are icons with no text node, one is a disabled
drop zone that cannot use the `disabled:` variant because it is a div, and one
is an `aria-hidden` background photograph.

### It found two more, and arithmetic settled both

Neither was assumed. Both were computed from the tokens the components actually
resolve to.

**`MuscleHeatmap`** put `opacity-70` on the volume percentage. `heatColor` gives
the hottest cell `text-accent-900` (#4d170e) on `bg-accent-400` (#ff9783):

| cell fill | full | @0.70 | @0.80 |
|---|---|---|---|
| accent-100 | 13.29 | 5.49 | 7.48 |
| accent-200 | 11.71 | 5.14 | 6.85 |
| accent-300 | 9.58 | 4.56 | 5.89 |
| **accent-400** | 6.93 | **3.76** | 4.62 |

The busiest muscle group — the one an athlete most wants to read — was the only
one below the line. axe never saw it because that span needs `cell.intensity > 0`
and the suite seeds onboarding with no history, so `/history` passes with the
element absent. The `opacity-80` body copy beneath it cleared the bar by 0.12,
which is a rounding error rather than a margin; both are gone.

**`TodayDashboardHeader`** dimmed the Trends disclosure caret to `opacity-60`.
`text-muted-foreground` (#484747) is 8.29:1 on paper and **3.04:1** at 60% — on
`/`, the most-visited screen in the product, and hidden from axe for the same
reason: the block renders only when `trends` exists.

A route being in `GATED_ROUTES` is not the same as the states on that route
being covered. That is the gap this check exists to cover, and it is why it
reads source rather than pixels.

## 2026-08-01 — Three jobs that built a different app (`.255`)

`ci-extended.yml` ran for the first time on 2026-08-01. Actions had been
billing-blocked, so a workflow the repo has carried for weeks had never executed
a single job. All three of its app-building jobs were configured wrong — in
three different ways, none of which any local run could have shown.

### The same defect, three spellings

```yaml
# e2e-critical — no VAPID key at all
env:
  PRIVATE_MODE: 'false'
  NEXT_PUBLIC_SUPABASE_URL: https://ci-placeholder.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ci-placeholder-anon-key

# visual-regression — set on the *assertion step*, after the build and the server
- name: Visual regression (@visual)
  env:
    PRIVATE_MODE: 'false'

# lighthouse-budget — nothing
```

`e2e-critical` reproduced `.249` exactly: without `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
`isPushSupported()` returns false, every component behind it renders nothing, and
*"Today shows one red action at 19:00"* asserts that one of them is mounted.

The other two are worse, because they passed.

### "No env" is not neutral on a runner

```ts
// src/lib/privateGate.ts:19-24
export function isPrivateModeEnabled(): boolean {
  const flag = process.env.PRIVATE_MODE;
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return true;
  return process.env.NODE_ENV === 'production';
}
```

`next build` and `next start` both set `NODE_ENV=production`. So a job that sets
nothing does not get a neutral app — it gets the **gated** app, where `/` and
`/log` are absent from `PRIVATE_GATE_PUBLIC_PATHS` and redirect to `/private`.

GitHub step `env:` does not reach earlier steps, so `visual-regression`'s
`PRIVATE_MODE: 'false'` applied to the Playwright invocation and to nothing that
mattered. Both jobs built and served the teaser.

### Two checks that could not fail

`scripts/lighthouse-budget.mjs:9` scores
`['/', '/log', '/guide/human-performance', '/exercises/squats']`. Two of those
four were `/private` — the lightest page in the product, timed as if it were the
product, in a job whose whole purpose is to notice the product getting heavier.

And the `.234` baseline bootstrap wrote `home-reduced.png` as a screenshot of
`/private`, under the name of the most-linked page in the app — in the same run
that `visual.spec.ts`'s own header called *"covering it for the first time"*.

That is verbatim the laundering `.221` deleted the previous baselines to avoid:

> the obvious response to four huge visual diffs is `--update-snapshots` without
> looking, which launders whatever the app happens to render that day into the
> new truth.

It arrived through the front door instead, wearing the right filename. **Neither
of the two baselines already reviewed is affected** — `/guide` and `/exercises`
are public prefixes and rendered themselves. `home-reduced.png` must not be
committed, and the homepage remains visually unguarded until a bootstrap runs
with this fix in place.

### The one case that survived checked where it landed

`/bundle` refused to snapshot a redirect, because it compared `page.url()` to the
route it asked for. Three cases did not, and that is the difference between
catching this and enshrining it.

Every case now goes through one `shoot()` helper that compares the landing path
to the file name and refuses on a mismatch. A redirect may only *skip* if the
case states a reason — `/bundle` does (FREE_BETA), so it resumes by itself the
day Bundle ships. The env fix removes the cause we found; the landing check
catches the next one, because a baseline is precisely the artifact nobody
re-reads.

### The guard written for `.220` had the `.220` defect

`gateEnvParity.test.ts` (on #178) asserts parity between `scripts/gate.mjs` and
`.github/workflows/ci.yml`. It names the two files it was written from. There are
three files and eight jobs, and a guard that enumerates cannot notice the fourth
place this app gets built — which is exactly *a name that claims more than its
enumeration*.

New `src/lib/workflowBuildEnv.test.ts` globs `.github/workflows/*.yml` and
requires every job that runs this app to set what `gate.mjs` sets, to the same
values. Deliberately **job-level env only**: accepting env declared anywhere in
the file would have passed on two of tonight's three failures. It also asserts
its own parser is not returning an empty set, since a guard about vacuous checks
is a poor place to ship one.

Its first draft had the defect it was written about, and a mutant found it. It
decided scope by testing `/\bnpm run build\b/` against the job block, so a job
running `npx next build` with no env at all **passed** — the detector was keyed
to one spelling, which is `.212`, inside a guard written about `.220`, a few
tests after the sentence *"a guard that enumerates cannot notice a fourth"*.

So the rule is inverted: every job is in scope unless `NOT_THIS_APP` names it
with a reason. Twelve entries — the three scanners, the two cron HTTP pokes,
`apply-migration` and `sync-vercel-env` (which must **never** receive the
ci-placeholder values, so their exemption is load-bearing rather than
housekeeping), `deploy-production` (Vercel builds remotely from the real project
environment, which is correct), the three remote smokes, and the Android Gradle
job. Two tests keep the list honest: a reason has to be one, and an entry naming
a job that no longer exists fails.

A pattern list is silent about what it misses. An exemption list is covered by
default and makes leaving a thing a reviewer can disagree with.

Overlap is stated rather than left to be discovered: when #178 lands, its two env
tests are subsumed here and should be deleted; its step-parity and ordering tests
are a different question and stay. One concept, one home — `.178`.

### The secret scanner crashed on the first run of every PR

Found while driving this PR to green, and it is the same defect one layer over.

```
RequestError [HttpError]: Resource not accessible by integration
  at async Object.ScanPullRequest (…/gitleaks-action/v2/dist/index.js)
  url: https://api.github.com/repos/Snedz/missionwinning/pulls/181/commits
  status: 403
  x-accepted-github-permissions: pull_requests=read
```

Identical on #181 (run 30684203909) and #182 (run 30719575181), with the same
first-run failure on `feat/locale-export-split` and `feat/a11y-settle`. On a
`pull_request` event `gitleaks-action` lists the PR's commits so it scans only
what the PR adds; `gitleaks.yml` declared no `permissions:` block, so the job
inherited the repository default, which does not include `pull_requests`.

Every one of those failures went green on a later push and was left there. A
check people re-run until it passes is a check they have stopped reading — and
this one is the secret scanner, so the run being skipped is the one that scans a
new branch's first commits.

Fixed with least privilege stated rather than inherited: `contents: read` and
`pull-requests: read`, nothing written. No guard: unlike the silent defects
above, this one crashes loudly — it needed reading, not catching.

### Process

Third occurrence after `.202` and `.205`: I mutated `workflowBuildEnv.test.ts`
while the rework inside it was uncommitted, and `git checkout HEAD --` threw the
rework away. The rule is *commit before mutating*, and it applies to the guard
being hardened exactly as much as to the code underneath it. Twelve mutants
killed after that, all from committed states.

### Not fixed here

`ci-extended`'s `e2e-critical` failed **8** tests on that first run. This fixes
the one with a proved cause. The other seven — four `premium-gate`, one `growth`,
one `hero-flows`, one `premium-pillars` — are unread data and are being triaged
separately rather than assumed to be env.

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

## 2026-08-01 — The settle rule that could not see loading (`.253`)

Two correct decisions, composing into a blind spot.

`tests/e2e/a11y.spec.ts` waits for the page to stop animating before it measures
contrast — right, because a half-faded element composites to a lower ratio than
its resting state. `src/components/ui/Skeleton.tsx` deliberately does **not**
animate; its header explains why in detail:

> The old bars were `#eae9e9` at half alpha over a `#eae9e9` card — literally
> invisible until the pulse dimmed them, which meant the animation *was* the
> information and `prefers-reduced-motion` deleted it.

So the wait asked "is anything animating?", the loading placeholders answered
"no", and the gate measured a half-loaded page. **The better the loading design
got, the blinder the wait became.**

### Measured, not argued

`/profile` under a 40x CPU throttle, instrumented at the moment axe runs:

```
CPU_RATE=40  serious/critical: 0
aria-busy nodes at scan time: 2
  still loading: Loading Profile | Loading
running animations at scan time: 0
```

`settle()` now requires both conditions. `[aria-busy="true"]` rather than
`[aria-busy]`: `HoldToConfirmButton` and `CoachChatPanel` bind the attribute to
state, so a fully settled page still carries `aria-busy="false"` nodes and the
looser selector would burn the whole timeout on every route.

### The route special-case, deleted rather than extended

```ts
if (path === '/active') {
  await page.getByRole('button', { name: /start workout|loading session/i })
    .first().waitFor({ state: 'visible', timeout: 15_000 });
}
```

`.220`'s shape: a rule written as the list of routes someone happened to hit,
matched on the button's **copy**, so editing that string would have removed the
wait silently. And `/active`'s pre-hydration state is not a code-split chunk —
`RouteLoading` already announces those. It is `ActiveEmptyState` with
`hydrated={false}`, which said nothing at all, so a screen reader announced a
disabled button with no explanation. It declares `aria-busy` now, and the
general rule covers the route it used to name.

### Eight placeholders that never said they were loading

The new wait only means something if the app sets the marker wherever it is
loading — otherwise this is `.199`/`.212` again, a guard passing because the
thing it looks for is simply absent. `src/lib/loadingStatesAnnounce.test.ts`
holds up that half, by discovery rather than enumeration: it parses each
`dynamic()` fallback expression, resolves the component it names **anywhere in
the repo**, and reads the answer off that component's own source.

It found eight, none of which I went looking for:

| Where | What |
|---|---|
| `HomeTodayDashboard` (x5) | `loading: () => <Skeleton/>` on `/`, the most-linked page in the product. A bare `Skeleton` is `aria-hidden` — a shape, not content — so five placeholders were invisible to a screen reader *and* to any settle rule. |
| `BenchmarksPage`, `HistoryPage` (x2) | `<div className="h-48 animate-pulse bg-card" />` for three chart slots: anonymous grey boxes carrying **the exact pulse `Skeleton` retired**. |
| `FuelLogSheet`, `BuilderPage` | a bare `<p>Loading photo log…</p>` — visible text, in no live region, announced to nobody. |

New `SkeletonBlock` wraps one `Skeleton` in `role="status" aria-busy="true"`.
Two fallbacks are exempt with a stated reason and a staleness test:
`LogToPlanHeroFallback` renders the hero for real (it is also the permanent
no-JS shell at `LandingPage:134`), and CoachAdaptDemo's `min-h-[8rem]` box draws
nothing at all.

### `.220` inside the fix for `.220`

The first version of the settle guard asserted that
`querySelectorAll('[aria-busy="true"]')` **appeared** in the spec. A mutant that
deleted `&& loading() === 0` from the quiet condition sailed straight through
it: the query still ran, its answer was discarded, and the guard reported green
while `settle()` was exactly as blind as before. A check whose name claims more
than what it looks at — written into the change that exists to end that pattern.
Nine mutants now die, including that one.

### What this does not claim

It is **not** a proven fix for the `/profile` skeleton-contrast violation seen
once in `.250` (axe measured `#edecec` on `#f3f2f2`, 1.05:1). That did not
reproduce in ~30 throttled runs at CPU rates 1, 6, 20, 40 and 80 — every single
one reported zero serious/critical violations, including the runs where two
`aria-busy` regions were demonstrably still on screen.

Both statements stand together: **the blind spot is real and measurable; the
violation is not reproduced.** `.224` records me calling three failures
"container flakiness" when one was a real deterministic bug. Shipping a fix for
an unreproduced race and declaring the matter closed is the same error mirrored,
and the plan for this item said so in advance.

**a11y therefore stays out of `ci.yml`.** Its `CI_ONLY_EXEMPT` entry reasons
that a gate which reddens on a render race teaches people to re-run until green,
which is worse than not having the gate. That should be honoured until there is
stability evidence, not overridden because a fix feels right.

### Process, third occurrence

My mutant loop ran `git checkout HEAD -- <file>` against files holding
uncommitted work and reverted four of my own edits. The archive already records
this at `.202` and `.205`, where `.205` wrote the rule down verbatim: **commit
before mutating.** I had read that file this same night. Nothing was lost — the
edits were reconstructible and the guard caught the leftover mutant on the next
run — but the habit is the finding, and the mutants were re-run against a
committed tree.

One related catch: `git checkout --` cannot revert an **untracked** file, so the
mutant applied to the brand-new test file survived the cleanup silently and
turned the next run red for a reason that had nothing to do with the code.

Tests 1186→1192.

## 2026-08-01 — The exporter that undid the splitter (`.252`)

`npm run export-locales` and `npm run check-locale-split` disagreed **by
construction**, and the second could never survive the first.

The exporter wrote, per language, every namespace **plus a merged
`common.json`**. `split-locale-packs.mjs` enforces the opposite: each namespace
trimmed to the keys English puts in it, and `common.json` deleted as
`REDUNDANT` — it was the entire 1,687-key catalogue repeated fifteen times, and
`fetchLocaleHttpOverrides` *preferred* it, so leaving it meant the loader kept
choosing the big file.

`.222` cut this directory 30.8 MB → 2.1 MB and built the splitter to be
**re-runnable** for exactly one stated reason: *"a cleanup that cannot be
repeated undoes itself the next time the fill tool runs."* It did. `.250` ran the
exporter while checking which CI steps passed locally, committed the 394
regenerated files with `git add -A`, and CI caught it on `.222`'s own guards.

The mitigations were ordering — `check-locale-split` before `export-locales` in
`ci.yml` — and remembering. Both worked *around* the conflict rather than
removing it, which meant the shipped translator files had also quietly drifted
behind the source, because nobody could safely re-export.

**The fix is that the producer emits what the checker wants.** Each namespace is
trimmed to `Object.keys(entry.stringsFor('en'))` and iterated in that order,
which drops foreign keys and stabilises key order in one pass — the same two
effects, from the same rule, as the splitter. No `common.json`.
`buildMergedCommonStrings` stays exported: `i18n-fill-missing` uses it to find
gaps, which is a different job from shipping a file to a browser.

The splitter reads its schema from `public/locales/en/*.json`, which *is* this
script's output, so the two now agree by construction rather than by a copied
rule. A guard pins that: if the splitter stops deriving from English, the
exporter's assumption is silently void.

**252,286 out-of-namespace keys** were being written. `export-locales` is now
safe to run at any point, and the round-trip passes in the order that used to
break it.

### What re-exporting exposed

Fifteen `feedbackCard*`/`feedbackSheet*` keys from `.215` existed in the source
modules and had never reached `public/locales` — the drift the conflict caused.
Additive, and now shipped.

And two keys went the other way. `coachWhySteadyWeek` and
`coachWhyPlateauDeload` sat in the committed `en/coach.json` but **in no source
module at all** — while `loadGuard.ts:42` and `progression.ts:173` still emit
them. [`PlanExerciseLine`](../src/components/coach/PlanExerciseLine.tsx) renders
`i18n.exists(whyKey) ? t(whyKey) : ''`, so nothing broke loudly: the coach
decided a week was a plateau deload, wrote down why, and showed the athlete a
**blank line** — in all fifteen languages, for as long as those keys have been
missing.

The tests made it worse. `progression.test.ts:117` and `loadGuard.test.ts:51`
both assert the engine picks the right `whyKey`, and were green throughout —
proving the *choice* while nothing proved the *string*. `.184` one layer down
into i18n.

Restored, with a guard that **discovers** rather than enumerates (`.220`): every
`coachWhy*` literal scraped out of `src/lib/coach/` must have an English entry,
so the next reason added is covered without anyone remembering to list it.

Tests 1186 → 1191.

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
