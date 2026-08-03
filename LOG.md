## 2026-08-03 — Cold-start Coach stopped shaming new athletes (`.263`)

Phone dogfood after I-Day on a Sunday: Mission Coach painted Mon/Wed/Fri as
**Missed** and opened with *"Life happened — 3 sessions missed"* for someone who
had never had a plan. Seed placed the default mid-week pattern in the past; when
every session was already past, adapt marked them missed and had nothing left to
re-spread — so the week strip stayed a wall of shame.

**Fixes (hero / A5-allowed):**
- `generateWeek` schedules only remaining days of the current week
  (`scheduleFromOffset` + `mapToCalendar(…, notBefore)`).
- `adaptPlan` re-opens a late-week collapse onto days still left as **planned**,
  and drops unplaceable cold-start past days instead of labeling them missed.
- `usePremium` free-beta snapshot is a stable reference (no more
  getServerSnapshot infinite-loop warning).
- Logged bodyweight sets read `8 × BW`, not `8 × 0 kg`.
- I-Day hides America/PFT/kids goal chips while `america` is parked.
- GPS panel title is "GPS track" when unlocked (not "(Premium)" under free beta).

Also in `.263` (follow-up commits on the same PR):
- Public story aligned: invite-only beta bar + private gate copy (no more
  "OPEN BETA" next to "Launching soon").
- Log console shows **BW** (tap to add load) instead of a 0 kg stepper.



# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md).

---

## 2026-08-02 — The coverage number that measured a third of the repo (`.262`)

The ask was to analyse test coverage and propose where to improve it. The analysis
came first and changed what was worth building, because the headline number turned
out to be the finding.

`npm test` is **1,186 tests, 230 suites, green in 29s**, and `src/lib` is genuinely
well covered — 185 test files against 285 sources. Run the suite under
`node --test --experimental-test-coverage` and it answers **92.0% lines**. Both
facts are true and together they mislead, because **V8 can only report a file it
loaded**. The report reached **271 of 657** source files. The other **386 are absent
from it — not scored zero, absent** — so the average is taken over the reached 41%.

That is `.213`'s defect one level up. There, `ciTruth` accepted any check appearing
in a workflow, and every workflow was billing-blocked, so the guard against *checks
that do not run* was satisfied by workflows that **could not run**. Here a metric
whose name claims the codebase has as its denominator whatever happened to get
imported. Neither is visible from inside a green run, and this one is worse for
being quoted.

### The denominator, fixed

[`scripts/coverage.mjs`](scripts/coverage.mjs) re-runs both lanes with lcov
reporters, enumerates every `.ts`/`.tsx` under `src/` and `packages/mw-core/`, and
**counts a file no test loads as untested, by name**. It reports reach per area and
ratchets three floors: `untestedFiles` may only fall, the two percentages may only
rise. `coverageBudget.test.ts` pins the high-water marks separately, the `.202`
shape — a floor that follows reality is not a floor, it is a changelog of the debt.

It is **gate step 7 and a `ci.yml` step**, both. `.213` found the gate and CI had
silently diverged; `.200` and `.219` were each a check that existed, was documented,
and executed nowhere. Being in the local gate and being in CI are different
guarantees, and only one of them survives a human forgetting.

Two things it deliberately does *not* measure with a percentage. `src/components`,
`src/page-components` and `src/hooks` are **295 files / 42,090 lines with no unit
tests at all** — Playwright is the net there, which is a real choice and still
leaves them invisible to this number, so they show as reach 0% rather than being
excluded into invisibility. And `packages/mw-core` is walked explicitly, because it
is excluded from `tsconfig.json`, from `npm run lint` and from `npm test`'s own glob
— a dropped file there is invisible to every other check in the repo.

**The esbuild filter is load-bearing.** `tsx` transforms through esbuild, whose CJS
banner (`__name`, `__export`, `__copyProps`, …) lcov reports as functions — always
called, so they only inflate. On `fuelStreak.ts` they are 6 of 10 reported functions:
80% where the real answer is 1 of 2. Deleting the filter would raise function
coverage everywhere without a line of test being written, which is why a guard pins
it: `.212`'s shape, a check keyed to an artifact of the tooling rather than to the
thing it claims to see.

### Why the ratchet is on functions

Line % is the metric that produced the two numbers this was built to catch.

[`apiSchemas.ts`](src/lib/apiSchemas.ts) measured **98.23% lines / 23.91%
functions**. It is Zod: `z.object({…})` executes at module load, so anything that
imports the file "covers" nearly every line of it while the refinements, the bounds
and the parse paths never run. **35 schemas exported; three were named anywhere in
the suite** — and this is the input validation for all **67 API routes**.
`payments.ts` is the same shape at **73.54% lines / 33.33% functions**: the covered
part is the price constants, and `createCheckoutForPlan`, `getStripeCheckoutUrl` and
`openBillingPortal` are unexecuted. The file reads three-quarters covered because
something imports `SUPER_BUNDLE_PRICE`.

So the script prints, every run, the files where line % and function % disagree
most. That is the one thing a single coverage percentage structurally cannot say.

### The schemas, fed

[`apiSchemas.test.ts`](src/lib/apiSchemas.test.ts) takes that file to **100% lines /
100% functions**. One valid fixture and at least one invalid per schema, and the
invalid ones target the bound that actually matters rather than a generic type
error: `childAge: 18` (the COPPA line), `dayReviewHour: 23` (`.194`'s evening
window), `rpe: 5` against a 6–10 scale, an invite code carrying the `1` its alphabet
excludes precisely so it cannot be read as `I`, and a referral code in the invite
format — the two must not be interchangeable, or `.218`'s funnel gets credited
twice. The schema list is **discovered from the module**, so schema 36 fails this
file until it has fixtures (`.220`: a guard whose name claims a scope wider than its
list has only ever tested the list).

**My first version of the field-survival rule was vacuous, and the mutant is what
said so.** Rule 2 exists for `.184`: `mobileSyncSetSchema.note` was missing from the
schema while Android sent it on every set, and zod strips unknown keys silently — so
the request succeeded, returned 200, and the athlete's note was gone. A stripping
validator **fails open**, which is why the round trip has to be asserted rather than
the rejection. My draft read the declared keys off `schema.shape` and asked whether
each came back. Delete `note` from the shape and it is no longer declared, so the
loop no longer asks about it: the guard took its expectations from the code under
test, and removing the code removed the assertion. **The `.184` regression survived
the test written for it.** Comparing the fixture's key set against the schema's
closes it in both directions (`.219`'s shape) — a field dropped leaves the fixture
over-supplying, a field added leaves it under-supplying, and either way a human
decides which side was right.

Defaults are pinned separately, because a removed `.default()` changes what lands in
the column and fails no parse.

### Falsification

**12 mutants on the schemas**, all killed after the rule-2 fix: dropping `note`
(`.184`), `dayReviewHour` 22→23, the `deleteSamples` default, `childAge` 17→18 and
its upper bound removed entirely, a new unfixtured schema, a new field on an
existing one, the referral alphabet loosened to include `0/1/I/O`, the 12-turn chat
cap, the 50-workout sync cap, `parseJsonBody` returning an empty error,
`parseQuery` never rejecting.

**Two of the mutants were themselves wrong**, which is the `.221` lesson repeating:
one Perl substitution interpolated `$/` inside `\Q…\E` and silently matched nothing,
so a "surviving" mutant had never been applied; a second replaced a quote character
and produced a syntax error rather than a behaviour change, which reads as a kill
and is not one. Both were re-run properly. *A mutant that did not apply is a green
you have not earned.*

**7 mutants on the ratchet** — the gate step removed, the CI step removed, the
esbuild filter emptied, `mw-core` dropped from the walk, a floor lowered, a floor
raised, a floor deleted — all killed. And one end to end: **adding a source file
with no test turns `npm run coverage` red** with exit 1 and an actionable message,
which is the only evidence the mechanism does the job it was built for.

Tests **1186 → 1199**. Typecheck, lint, unit and route lanes all green.

### The divergence this PR is about, found by this PR's own CI run

`build-and-test` went red on the first push, on a test this branch does not
touch: `first-90.spec.ts` → *"Today shows one red action at 19:00 @gate"*, failing
its own precondition — *the push opt-in must be mounted*.

`isPushSupported()` returns false without a VAPID public key, so every component
behind it renders nothing. `.198` added a placeholder to `gate.mjs` for exactly
this reason, and the spec's comment records the key as *"unset in CI until now"* —
**but it never reached `ci.yml`'s env block**, on this branch or on master or in
any workflow in the repo. So the test could pass under `npm run gate` and **never
in CI**. Not flaky: deterministic, and red on every PR since `.211`.

Which is `.213` arriving in this PR's own CI run — the gate and `ci.yml` had
diverged again, and a comment claiming they had not is what kept it invisible. The
placeholder is now in `ci.yml` with the same safety note recorded at the constant
in `gate.mjs`: it is the public half of a keypair and only gates whether the UI
draws; nothing can subscribe, because the server has no private key and no test
grants notification permission.

**Verified in both directions rather than pushed hopefully** — built without the
key and reproduced the identical failure locally, then built with it and ran the
lane `ci.yml` runs: **52/52 @gate tests pass**.

And `ci.yml:99`'s comment — *"a11y / visual / Lighthouse stay in CI extended"* —
is corrected, not deleted. Visual and Lighthouse do; **a11y does not**, because
`ci-extended.yml` has no such job, so those 34 tests run in `npm run gate` and
nowhere else. `gate.mjs`'s own header already called this line out as false and it
was still here. Whether to spend PR minutes on the a11y lane is a founder call, so
the comment now states what is true rather than the lane being silently added.

**Found twice, independently.** While this branch was in flight, PR #185 landed
the same VAPID fix on `master` (`dafc8e8`) — reached from the other direction, and
it also carried the key into `ci-extended.yml`, which `e2e:critical` needs for the
same reason. The merge here takes **master's wording** and drops this branch's
duplicate comment: one fix, one explanation, since two prose accounts of one env
var is the `.178` shape in the documentation rather than the code. Worth recording
because a defect surfacing in two sessions on the same night is evidence about the
defect, not about either session — it was reachable from both the coverage angle
and the CI-hygiene angle because it had been sitting in the gate/CI seam since
`.211`.

`gitleaks` remains red — the pre-existing finding recorded in `CONTEXT.md`
(commit `8ea3527a`, a real Solana treasury address scrubbed from the working file
but still in history). Founder call, deliberately not allowlisted; unrelated to
this branch.

### Then the revenue path, which the script said was the worst of it

Second half of the same ship. `stripeServer.ts`, `checkoutServer.ts`,
`premiumServer.ts` and `stripeDisputeNotify.ts` were **loaded by no test at all** —
408 lines deciding whether an athlete can pay and whether a payment becomes
premium. They are `server-only`, which throws under plain `tsx`, so they sat in the
lane nothing reached.

**Exploring first changed the shape of the fix.** Two of the four are untestable
where they stand, not by accident: `createCheckoutSession` calls `getStripe()` on
its first line and `grantEnrollmentFromWebhook` reaches Supabase on its own, so
every decision inside them was gated behind a live credential. Both got the `.223`
treatment — the pure decision lifted into a dependency-free module both sides
import, exactly as `journey/basicComplete.ts` was:

- [`checkout/checkoutParams.ts`](src/lib/checkout/checkoutParams.ts) — what Stripe
  is asked to charge. Every assertion on it is about a mistake that **does not
  fail**: `lifetime` in `subscription` mode is a recurring charge on a one-off
  product and Stripe bills it happily forever; the attribution triple on the wrong
  carrier is a payment that cannot be matched to a user; dropping
  `customer_creation: 'always'` leaves lifetime buyers — the ones who paid most —
  with no Customer for the Billing Portal to open.
- [`premium/enrollmentRow.ts`](src/lib/premium/enrollmentRow.ts) — what a paid
  webhook writes. Same class: `premium_granted: false`, a non-`active` status or an
  un-normalized email all insert cleanly and leave the buyer with a receipt, a row
  saying they are enrolled, and no premium.

**And the extraction found a real defect on the way.** The rule for *what may be
written to an `auth.users` foreign key* existed **twice, byte-identical** —
`stripeWebhook.ts:51` choosing an id off a Checkout Session, and an inline copy at
`premiumServer.ts:104` deciding whether to put that id in the `INSERT`. `.178` on
the two files that turn a payment into an entitlement, and the drift is quiet in
the expensive direction: loosen the reader and the writer silently discards the id;
loosen the writer and the insert takes an id no auth user owns, which is a
foreign-key error on the row that grants somebody what they just paid for. One
definition now, in [`authUserId.ts`](src/lib/authUserId.ts), with a guard that
**discovers** further copies rather than checking the two I happened to fix.

[`money.routetest.ts`](src/lib/money.routetest.ts) covers the server halves in the
`test:routes` lane. **No network is involved, and that is the point** — an
unconfigured Stripe returns 503 before constructing a client, and an absent service
role makes the enrollment throw before reaching Supabase. The refusals *are* the
contract, and nothing was checking them. What it pins: partial configuration
disables checkout **entirely** rather than per-plan (two of three prices set reads
as "Stripe works" and makes one plan quietly unbuyable); `DEMO_PREMIUM` cannot
unlock premium in production, whatever the environment says; the webhook's replay
window actually refuses a correctly-signed event from ten minutes ago; a verified
purchase that cannot be enrolled **500s**, because Stripe only retries on non-2xx
and that retry is the only thing that eventually gives the buyer what they paid
for; and the dispute and expired-session side channels never 500, because that
would make Stripe retry the grant riding in the same event.

[`payments.test.ts`](src/lib/payments.test.ts) takes the client half from
**73.54% lines / 33.33% functions to 87.89 / 60.00**. These functions are the
athlete's error messages: 401 is *sign in*, 503 is *not configured*, 404 from the
portal is *you have no Stripe customer* — collapsing any of them into the generic
"Checkout failed" is a conversion bug, not a cosmetic one.

`stripeServer.ts` 0 → **100 / 100**. `stripeWebhook.ts` **98.18 / 100**.
Reach **41.2% → 42.1%**, untested files **386 → 382**, functions **66.94 → 67.10**.
Tests **1199 → 1229**, route lane **12 → 32**.

**21 mutants, none survived** — lifetime billed as a subscription, the metadata
carrier swapped, `customer_creation` dropped, `payment_method_types` pinned,
`premium_granted: false`, the FK guard removed, every error retried as email-only,
the UUID version/variant nibbles loosened, 503 collapsed to a generic error, the
session cookie dropped from the checkout POST, the config check reduced to one
price, `appOrigin`'s trailing-slash strip removed, the production `DEMO_PREMIUM`
guard disabled, the webhook 200ing on a failed enrollment, the replay window
widened to a day, the signature check bypassed outright — plus a re-added duplicate
of the UUID pattern, to confirm the one-definition guard fires rather than
decorating.

**One honest note on the line-% floor.** It went *down*, 91.84 → 91.80, and that is
the correct direction: a 400-line server module no test imported contributed to
neither side of the fraction, and reaching it puts all its unexecuted branches into
the denominator. Ratcheting line % tightly would punish exactly the change the
other two floors exist to reward, so it is held as a collapse guard and
`untestedFiles` is the primary ratchet. Noted at both constants.

### And then the launch gate, which had been wrong once already

`betaMetricsServer.ts` — **337 lines, loaded by no test**, computing the figure
[ORCHESTRATION.md](ORCHESTRATION.md) keys the launch decision off. `.223` already
found a defect in it and it was this exact shape: a private `allBasicDone`
demanding all five pillars while the product had narrowed to the first workout, so
`basicCompletePct` scored testers against a rule the app no longer implemented and
the gate could not go green no matter how well the beta went. **That fix gave the
predicate a test. It did not give one to the consumer that turns the predicate into
the decision.**

Same treatment, third time: the maths moved to dependency-free
[`beta/funnelAggregate.ts`](src/lib/beta/funnelAggregate.ts), with `now` injected
so the 14-day window can be asserted rather than left to rot (`.211`/`.212`). What
is pinned is a set of numbers that are wrong quietly and in one direction — a gate
that cannot open, or one that opens early — where the dashboard cannot tell you,
because the dashboard *is* the thing that is wrong: the 10-user floor, I-Day ≥80,
Basic ≥**60** (the launch gate, not the softer 40 target that sits beside it in the
same object), commissioning reported but deliberately never gating, rounding rather
than truncation, and the boundary day of the signup window.

**One real fix went in with it.** `phaseCounts[js.phase] = (…) + 1` mints a key for
any string, and `journey_state` is a jsonb column — the TypeScript type is a claim
about the writer, not a guarantee about the row. `phaseCounts` renders as a fixed
four-row breakdown, so a legacy phase value is a bucket the panel cannot show and a
total that stops matching the rows above it. Unknown phases are now counted in the
total and given no bucket.

Two smaller ones alongside. [`beta/inviteShareLink.ts`](src/lib/beta/inviteShareLink.ts)
puts `PRIVATE_ACCESS_SECRET` into a URL on purpose, which makes the empty case the
one that matters: `params.set('access', '')` yields a link that *looks* gated and
opens nothing, and with `MAIL_POSTAL_ADDRESS` still unset these are pasted into
messages by hand, with no send-time validation in between. And
[`betaMetrics.routetest.ts`](src/lib/betaMetrics.routetest.ts) covers
`isBetaAdminEmail` — the allowlist between an arbitrary signed-in account and every
invitee's email address — plus `.214`'s rule on the read side: with no service role
every panel query returns **null, not an empty aggregate**, because a zeroed
dashboard reads as a failed beta when the truth is a missing key.

**A guard I had to repair rather than satisfy.** `launchTruth.test.ts`'s
*"the founder dashboard imports the basic-complete rule rather than restating it"*
went red on the extraction — the rule was still imported exactly once, one hop
further along. That guard asserted a literal import line in one named file, which is
this repo's own `.212`/`.220` shape appearing *inside* a guard: keyed to a spelling
rather than to the property it names. It now **follows the import chain** and
**discovers** redefinitions across `src/` and `app/` instead of watching the single
file that forked last time. Confirmed stronger, not weaker: re-forking the rule
inside the *new* module turns it red, which the original could not have seen.

**22 mutants, one survivor, and the survivor is equivalent.** The twelve on the gate
include the `.223` regression itself (Basic requiring all five pillars), the gate
dropping the headcount floor, the gate quoting the soft 40 target instead of the 60
launch gate, truncation instead of rounding, a 7-day window, an exclusive boundary,
and a null profile list reading as launch-ready. The survivor is
`.filter(Boolean)` on the admin allowlist: removing it leaves `allowed = ['']`,
which looks alarming and is inert, because the only address it could match is the
empty string and `if (!email) return false` has already refused it. **Checked rather
than argued** — 81 combinations of nine env values against nine emails, zero
behavioural differences — and recorded at the test, because a test written to kill
that mutant would pin the implementation rather than the rule.

Reach **42.1% → 42.4%**, untested files **382 → 381**, functions **67.10 → 67.36**.
Tests **1229 → 1253**, route lane **32 → 38**. Floors tightened to match.

### The ratchet caught master, which is the point

Merging master in turned `npm run coverage` **red**: 381 → 391 untested files.
Twelve new source files had landed with no tests, and CI failed on the coverage
step before anyone read the diff.

The floor's own failure message describes the escape hatch, and this is what
going through it honestly looks like — **look at what moved the number, then
split it**:

- **Ten are UI** — seven components, a page-component and two hooks. Playwright
  is the net there, which is a deliberate choice and still leaves them invisible
  to this measurement. Floor raised for these, with the reason recorded at the
  constant rather than in a commit message nobody re-reads.
- **Two were logic, and got tests instead.**
  [`today/firstStepsDismissed.ts`](src/lib/today/firstStepsDismissed.ts) — whose
  own header explains that a dismissed card still consumes a `pinned` slot
  forever, so the screen is quietly one block shorter than the budget intends —
  and [`trends/resolveTrendSeries.ts`](src/lib/trends/resolveTrendSeries.ts),
  which holds one honest sentence implemented two opposite ways: body metrics are
  **entries** and must never be padded (two weigh-ins padded to ninety days is a
  body-fat chart plunging to 0% and back), while daily buckets **are** buckets and
  a rest day genuinely reads zero. Swap them and nothing errors; the chart just
  lies.

So the floor is 389, not 391 — a ratchet that does not stop the number moving, it
makes somebody look at what moved it.

**A guard I wrote wrong, then wrote again.** The first version of the
"every askable metric has a source" rule asserted that resolved points came back
numeric and full-length — and **deleting an entire series from `buildTodayTrends`
did not turn it red**, because `values[i] ?? 0` dutifully produced fourteen zeroes
of the right type. Downstream, a metric with no source is indistinguishable from a
metric with no data. It now asserts at the seam instead, comparing the registry's
non-body ids against what `buildTodayTrends` actually emits — and both
falsifications fire: removing a series names it, truncating one names it.

Worth recording on the way past: `TrendMetricId` is declared **twice** with
genuinely different unions — everything askable in `trends/trendMetrics.ts`, only
what is emitted in `todayTrends.ts` — which is precisely what lets that seam
drift, and why the guard compares strings rather than letting the compiler
pretend the two are one type.

Eight mutants on the two new tests; one survivor, equivalent, and it is the one
that produced the guard above.

### Not done, and named

Every one of these is a file no test currently loads, found by the script rather
than asserted by it:

- **The rest of the revenue path** — `paypalWebhook.ts` and all three of
  `cryptoCheckout/{intent,confirm,buildTransfer}.ts`. The crypto side already has
  `verifyTransfer`, `intentExpiry` and `confirm.security` tests; the intent
  construction and the transfer builder do not. And the e2e that would cover the
  premium gates — `premium-gate.spec.ts`, `premium-pillars.spec.ts` — is in
  `e2e:critical`, which runs **only** on `ci-extended.yml`'s Monday cron, so a
  regression there can merge and sit for seven days.
- **Authorization helpers** — `api/betaAdminAuth.ts`, `schoolClassAccess.ts`,
  `mobileAccess.ts`, `supabaseRequestAuth.ts`, `youthConsentServer.ts`,
  `wearables/oauthState.ts`. `.211` moved the teacher-PIN rate limit into
  `resolveTeacherClassAccess`; nothing asserts it is still there.
- **Route contracts** — 67 routes, 4 `.routetest.ts` files. The lane works
  (`llmRoutesQuota.routetest.ts` is the model); it wants one table-driven pass for
  unauth → 401/403, missing service role → **503 not `[]`** (`.214`'s rule, asserted
  nowhere), over-limit → 429, and Zod rejection shape.
- **`packages/mw-core`** — 7 files, 0 test files, and a test written there would not
  run: the glob is `src/**/*.test.ts`. `victory.ts` sits at 54.55% lines / 55.56%
  functions, reached only through a barrel, and it is shared with Android.
- **`ci.yml:99`** still claims `a11y / visual / Lighthouse stay in CI extended`.
  `ci-extended.yml` has no a11y job — the 34 a11y tests run in `npm run gate` and
  nowhere else. `gate.mjs`'s own header calls out this exact false comment.
## 2026-08-02 — The workflow that failed on every push (`.261`)

A pass over the six free GitHub security settings. The repo scored well on file
presence — `SECURITY.md`, `dependabot.yml` and `codeql.yml` all exist and are
thorough — and the finding is that **four of the six became unavailable eight
minutes before the audit started.**

### The repo went private, and took four checks with it

`missionwinning` flipped public → private at **2026-08-02 00:49Z**, between one
reconnaissance pass and the next. Measured on both sides:

| Feature | While public | Now |
|---|---|---|
| Secret scanning + push protection | scanning **on** | `secret-scanning/alerts` → **404, disabled** |
| Code scanning | default setup readable | `code-scanning/default-setup` → **403** |
| Private vulnerability reporting | `{"enabled":true}` | → **404** |
| Dependency Review API | — | `dependency-graph/compare` → **403** |
| Dependabot alerts | — | **204, unaffected** (3 open, all high) |

All four are Advanced Security entitlements on a private repo. None is a config
error and none is fixable in this repo — they are platform state, which is why
they now live as a Status row in `CONTEXT.md` rather than as a doc that asserts
they are on. `gitleaks` is left as the only secret gate.

It also re-dates a premise several workflow headers argue from: Actions minutes
are free only on **public** repos, so the "lean CI" comments in `ci.yml` and
`gitleaks.yml` — which read as stale while the repo was public — are load-bearing
again.

### The workflow that had been failing on every push

`apply-migration.yml` declares `on: workflow_dispatch` and nothing else. It had
**five runs on `push`** since the flip — `master` and every open branch — each
reported as `.github/workflows/apply-migration.yml` rather than by its `name:`,
with *"This run likely failed because of a workflow file issue."*

A workflow cannot run on an event it does not declare. Both symptoms are the same
one: the file does not parse, so GitHub can read neither `on:` nor `name:`, and
surfaces the failure against the push instead. The cause is one line:

```yaml
if: ${{ secrets.SUPABASE_DB_URL == '' }}
```

`secrets` is not an available context in a step-level `if:`. It does not evaluate
false — it invalidates the file. `aikido.yml`'s header has documented this exact
trap since it was written (*"`if: secrets.X != ''` is unreliable on GitHub Actions
— use an env gate step instead"*), and uses the env-gate pattern this one now
copies.

### Underneath it, the preferred path had never worked

Fixing the parse error made a second defect reachable. The SQL step reads
`.env.production` unconditionally, but only the legacy Vercel step writes it — and
that step is skipped exactly when `SUPABASE_DB_URL` is set, which is the path the
header calls *preferred*. Every preferred-path run would have died on `ENOENT`
before a connection string was ever chosen.

That is the third distinct way this workflow has failed to apply a migration, and
its own header names the first two and the lesson: *"A migration path that has
never once succeeded … is worse than no migration path at all: it reads as
working."* **Not falsified by execution** — the workflow needs production
credentials — so it is reasoned from the code path and stated as such.

### CodeQL's cron now buys a guaranteed failure

`codeql.yml` last genuinely succeeded **2026-08-01** (run 30693504626), while
public. On a private repo the analyze step's upload 403s, and the job carries
`continue-on-error: true` — so the monthly cron would spend ~5 minutes of a
now-metered quota to produce a hidden failure. Cron commented out with a restore
note; `workflow_dispatch` kept, so the config survives a flip back.

### Not done, named

- **PR #120** (`chore/github-security-hardening`, open since 2026-07-28) is an
  earlier pass at this same checklist, written while public. **100 commits
  behind**, conflicts in three of its eleven files, and every doc change now
  asserts a false state: `SECRETS.md` ticks `[x]` for push protection and code
  scanning, `controls.yaml` records CodeQL default setup as compliance evidence,
  `VERCEL_DEPLOY_CHECKLIST.md` asserts Actions are free, and `SECURITY.md` makes a
  404ing advisory link the *preferred* reporting channel. It also adds a
  `dependency-review.yml` that cannot run here. **Recommend closing, not
  rebasing** — the compliance docs are its most stale part, not its most valuable.
- **Branch protection** on `master` — still none, no rulesets. Protected branches
  need GitHub Pro or higher on a private repo; the plan is not readable without
  the `user` scope.
- **Aikido is a green no-op.** `AIKIDO_SECRET_KEY` is unset, so the gate returns
  `configured=false` and every real step skips — runs pass in 7–9s having scanned
  nothing. `ci.yml`'s `npm audit --audit-level=high` is `continue-on-error: true`
  and cannot fail. Both are the shape `.224` was named for; neither is fixed here,
  because one needs a credential and the other is a policy call.
- **LOG.md is over its own rotation rule** — 25 entries / 108KB against ≤15 /
  ≤20KB. Pre-existing; not rotated here.

### Carried, not authored

`gitleaks.yml`'s `permissions:` block was already on `master` (`.224` carrying
`.235`). Reached independently here from the same 403 and **dropped as redundant**
— and `.224`'s diagnosis corrects mine: the failures predate the flip (#181, #182)
and hit the **first run of every PR**, so visibility was never the cause.

---

## 2026-08-02 — The system that kept generating the wrong palette (`.259`)

`.258` found six off-brand guidebook heroes. This is **why they existed**, and it
is not that someone forgot a pass.

`.131` re-inked the app to paper / ink / one red. The media system was never
told. `docs/MEDIA_SYSTEM.md` and `media/FLOW_PROMPTS.md` carried **66 references
to navy / emerald / brass and 37 hardcoded hex**, including the one line every
prompt in the pack inherits:

```
Always prepend the brand block from MEDIA_SYSTEM
(navy `#0a0c10`, emerald `#27b07d`, brass `#c7a860`).
```

So the six heroes were the **documented system working exactly as written**.
Anyone following it — founder or agent, this session or the next — would have
produced more of them. Fixing the six without fixing this would have been
re-inking the output of a machine still set to the wrong colour.

### The proof it was stale rather than merely vague

`MEDIA_SYSTEM.md` specifies the form-diagram language as *"Background Navy
`#0a0c10`, Figure stroke Near-white `#e8eaed`, Motion arrows Emerald `#27b07d`,
Joint marks Brass `#c7a860`"*.

The 30 shipped SVGs in `public/form-guides/`:

```
209 × #ec3013   (--accent-poster)
172 × #201e1d   (--foreground)
 96 × #6f6b69   (mid grey)
 30 × #f3f2f2   (--background)
```

They were re-inked eleven builds ago. The doc describing them was not, so it
actively contradicted the files it documents — and would have talked the next
person out of the correct palette.

### One home for colour

`.178` one layer above code: the brand's colour had two homes, `src/index.css`
and the media docs, and only one of them is what ships.

Both docs re-inked. `src/index.css` is now the single source, and
`src/lib/mediaPaletteTruth.test.ts` checks everything else against it:

- resolves every `--token` from HSL to hex, so the comparison is against what
  the product actually renders rather than a second list of hex;
- bans the retired hex **and the colour words** — the words are how it spread,
  since `FLOW_PROMPTS.md` said "navy ground, emerald arrows" far more often than
  it said `#0a0c10`, and a generator does not care which form it reads;
- requires every hex the docs name to be a real token, which caught `#e8eaed`
  and `#1a1f28` — two invented colours I had not spotted by eye;
- checks the SVGs too. That is possible precisely because an SVG is *source*:
  `.258` could not check the heroes this way because a palette baked into a
  `.webp` is invisible to static analysis and needed a histogram and a narrowly
  justified threshold. Here the colours are in the file, so the rule is exact.

`topo-brass` and `bundle-brass` are shipped filenames, not prose, so they are
named in `LEGACY_ASSET_IDS` with a staleness test rather than matched by the
word ban. Renaming them is a real change — new files, updated references, a
redirect — not a find-and-replace.

This is the relationship `check-token-sync` already enforces between the web
tokens and the Android Kotlin ones, extended to the documents that tell a
generator what to draw.

### What this does not do

It does not re-ink the six heroes, the `public/art/` decoratives or the Scout
mascot kit. Those need generated art, and the generated bytes cannot reach this
container — the session's egress policy denies the image CDN
(`403` on `CONNECT` to `d8j0ntlcm91z4.cloudfront.net:443`), reported rather than
routed around per `/root/.ccr/README.md`.

What changes is that the next attempt starts from a prompt pack that names the
right colours, and `.258`'s ratchet plus this guard mean neither the assets nor
the specification can quietly drift again.

Tests 1191→1198.

## 2026-08-02 — The palette a checker could not see (`.258`)

`.131` re-inked the app to paper / ink / one red. `.137` re-inked the guidebook
**cover** and rebuilt the PDF. The six chapter heroes were in neither pass, and
nothing in this repo could have said so: `check-design-system.mjs` reads source,
and a palette baked into a `.webp` is invisible to it.

```
/learn/human-performance-hero.webp      ink  86%   brand   0%
/learn/movement-mechanics-hero.webp     ink  97%   brand   0%
/learn/programming-tuning-hero.webp     ink  89%   brand   0%
/learn/getting-started-mw-hero.webp     ink  92%   brand   0%
/learn/nutrition-recovery-hero.webp     ink  84%   brand   0%
/learn/assessments-progress-hero.webp   ink  90%   brand   0%
```

Near-black with teal accents, on paper-ground chapter pages, for eleven builds.

It was found by eye during the `.234` baseline review and written into a LOG
entry — which is precisely the form this repo has learned not to trust. The
`opacity` rule in `WeekStrip.tsx` was also correct, also written down, and also
protected only the file it was in; `.236` paid for that three files away.

### The general version of this check did not survive its own numbers

The first draft measured every image in `public/`. It reported fifteen
candidates, and two of them ended the idea:

```
public/pwa-512x512.png                     ink 85%   brand 0%
public/learn/movement-mechanics-hero.webp  ink 97%   brand 0%
```

**No threshold separates those.** The icon is *supposed* to be a dark tile; the
hero is *supposed* to sit inside a paper page. The difference is where the asset
is used, which a pixel histogram cannot see — so a repo-wide rule would have
been an exemption list doing all the work, which is `.220`'s defect wearing a
new hat. Deleted rather than shipped.

What replaced it is narrow and has a concrete justification: these six render
inside `/guide/<chapter>`, whose ground is `--background` (#f3f2f2). Nearly
black there is wrong, and *that* is checkable. The set is discovered from
`src/data/guidebook/chapters.ts` rather than listed, so a seventh chapter is
covered the day it is written.

### Chroma, not saturation

The first measurement disagreed with itself between runs and filed dark navy
under "cool". HSL saturation is the wrong discriminator: a pixel of `(0,0,20)`
is *fully saturated blue* at 4% lightness. `(max-min)/255` asks the question
that actually matters — is there visible colour here at all — and the numbers
became stable and reproducible.

Worth recording because a guard built on a measurement its author does not trust
is the same defect as no guard, and I nearly shipped one.

### It ships as a ratchet

Green with the debt unlisted would be `.200`'s check that cannot fail. Red on
arrival would be a gate nobody can make green, which is how a gate gets switched
off. So the six are declared in `KNOWN_OFF_PALETTE`, anything new fails, and an
entry that *starts passing* must be deleted — a stale entry quietly re-permits
the thing it documents.

The first run printed `✓ 6 guidebook heroes in palette`. That was false: six of
six are off-palette and merely declared. `.208` — a number stated more
confidently than it can be supported — corrected to name the debt on every run.

### Two mutants that did not mutate

Both survived the first run, and neither was a gap in the guard:

- `mutantSrc: '/learn/mutant-hero.webp'` does not match the discovery regex
  `src:\s*'(\/learn\/[^']+)'` — capital `S`. It added no hero at all.
- Loosening `MAX_INK_PCT` alone leaves `MIN_BRAND_PCT` firing at 0% brand, so
  the declared six stayed off-palette and the ratchet had nothing to report.

A mutant that does not mutate is a green run that proves nothing — the same
shape as the vacuous assertions this programme keeps finding, arriving through
the tooling meant to catch them. Rebuilt properly, both kill: a seventh
undeclared chapter fails, and loosening *both* thresholds trips the
staleness rule because the declared entries start passing.

### The re-ink is blocked, not done

Replacement art generates, but the bytes cannot reach this repo: the session's
egress policy denies the image CDN.

```
connect_rejected — gateway answered 403 to CONNECT
host: d8j0ntlcm91z4.cloudfront.net:443
```

`/root/.ccr/README.md` is explicit that a 403 is an organisation policy denial to
be reported rather than retried or routed around, so that is what this does. The
founder can download the art, or the host can be allowed; either way the ratchet
above is what stops the six becoming seven in the meantime.

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
