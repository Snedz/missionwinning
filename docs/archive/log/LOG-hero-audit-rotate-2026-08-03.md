# Rotated from LOG.md 2026-08-03 (hero audit .263)

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
