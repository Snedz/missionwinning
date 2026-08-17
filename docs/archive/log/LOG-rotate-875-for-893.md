# Rotated from LOG.md for `.893`

## 2026-08-16 — The harvest paste stamped a UTC day (`.875`)

`pasteHarvestFile` defaulted `today` to `new Date().toISOString().slice(0, 10)`
— the hard rule named in CLAUDE.md §5, whose own entry records that the defect
*"shipped a wrong shared week east of UTC"*. It arrived at `.871` and has been
red on `master` ever since: `reachability.test.ts` has been failing on every
run, and every PR merged over it.

It is not cosmetic, and it is not a rounding question. Between local midnight
and UTC midnight the two spellings disagree outright — at 00:30 JST on the 17th
(15:30 UTC on the 16th) `toISOString()` yields `2026-08-16` while the day
locally is the 17th. The harvest row this stamps is the dated queue entry the
next spawn reads to decide what has already been mined, so for that window it
files today's work under yesterday. Measured under `TZ=Asia/Tokyo`, not
reasoned about: the container is UTC, where the two agree and nothing looks
wrong — which is exactly why the guard exists and why running the suite locally
in one timezone is not evidence.

No new test. `reachability.test.ts` already discovers every product source and
fails on an unreviewed one; it was already red and naming this file. A second
guard for a defect the existing ratchet catches would be the vacuous kind — the
falsification is that reverting the one line turns it back red.

**Ship:** `localDateKey()` in `pasteHarvest.ts`. Suite 3652/3653 → 3653/3653.

Label `.875` (onto `.874`).

Excellence-Override: `src/lib/loopQueue` is a surface path and RESULT is unscored; this is the hard-rule breach in CLAUDE.md §5 that has held `master` red since `.871`, and it renders no athlete chrome.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-860-for-875.md](docs/archive/log/LOG-rotate-860-for-875.md).
