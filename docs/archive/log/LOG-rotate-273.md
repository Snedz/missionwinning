# Rotated for .273

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
