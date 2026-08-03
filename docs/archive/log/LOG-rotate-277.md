# Rotated for .277

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
