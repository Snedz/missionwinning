# Receipt — the nutrition log's retention window, and a time bomb that went off

## What was found

`npm run test` on this repo was **1 red out of 4,811** on the branch I happened to be
on, and it had been red for days without anyone seeing it, because the CI that would
have shown it is billing-blocked.

```
test at src/lib/nutritionQuickLog.test.ts:30:3
✖ replaces today and keeps older days
  assert.ok(next.some((r) => r.name === 'Old'));
```

**Node's error message quoted the wrong assertion** (`assert.equal(recent[1][0],
'Eggs')`, which belongs to a different test in the same file) because the runner
transpiles TypeScript and the source map is off by a test block. The assertion that
actually failed is line 42. I chased the quoted one first and it passed — so the
failure was somewhere else in the file, and the file was small enough to read.

## The defect

`mergeTodayIntoNutritionLog(prev, todayEntries, today, days)` replaces the rows for
`today` and then prunes the log to the retention window. The prune was anchored to
**the wall clock**:

```ts
return pruneNutritionLogToDays([...older, ...todayRows], days);   // now = new Date()
```

so the window was *the last 90 days from now*, not *the last 90 days ending on the
day you were given*. Two consequences:

1. **The function's `today` argument was a lie.** Merging a day other than today
   pruned against a different window than the caller expected.
2. **The test was a time bomb.** Its fixture is fixed-dated — `Old` is 2026-07-20,
   `today` is 2026-07-24 — so it passed when it was written and started failing
   once "Old" aged past a 90-day window measured from the real date. It went off
   around 2026-10-18. The test was the fuse; the implementation was the reason.

In production `today` IS now, so no user's log changes. This only makes the
function honest about the day it was handed — and makes the test stable forever.

## The fix

```ts
return pruneNutritionLogToDays(
  [...older, ...todayRows],
  days,
  new Date(`${today}T12:00:00`),
);
```

`pruneNutritionLogToDays` already took a `now` parameter; the merge just never
passed it.

## The tests

Two new cases, both of which FAIL against the previous implementation:

- *keeps the days before the day being merged, however long ago that day was* — a
  merge for 2020-01-05 keeps a row from 2020-01-01, and the old code pruned it
  because the window was measured from 2026.
- *still prunes rows older than the retention window before the merged day* — the
  window still prunes; it just prunes relative to the merged day.

The existing July fixture is left exactly as it was: with the fix it is correct
forever, and rewriting it to relative dates would have hidden the defect rather
than fixed it.

## Verify

── verify summary ──
PASS  build-label 0.2s
PASS  earnback-copy 0.5s
PASS  typecheck      26.2s
PASS  lint           14.5s
PASS  test           49.5s
PASS  build          118.2s
PASS  health         1.6s

VERIFY: PASS

Suite: **5,065 tests, 5,065 pass, 0 fail** on `origin/master` with this change.

## The part that matters more than the fix

**This repo's CI cannot start** (the GitHub Actions spending limit is unresolved —
that is the founder's filed ask, `founder_ask.txt`, 15 hours old). So a red test
here is *invisible* until the limit is raised, and the moment it is raised this
one turns the public app's CI red and blocks every PR on it.

That is worth knowing before the limit is raised: **raise it, and this fix has to
be merged first**, or the first thing the founder sees is a red build and no
explanation.
