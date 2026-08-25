# PLAN.md — Restore a deleted session (`.1006`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the restore-deleted-session freeze.
**Lane:** Engineering-Web · History · **Horizon:** 0
**Label:** `2026.07-unified.1006` (master is `.1005` / `a6856d74`
Start history from this date). Title stays **Restore a deleted
session (.1006)**.
**Excellence-Override:** leftover undo of one finished History
log (not a second home, not wipe-account, not live cancel)

---

## 0. What this is

`.1003` already tombstones one finished
session. Copy still says it cannot be
recovered. Missing: Restore on History
for a bogus Monday they just deleted.

Confirm on delete stays. Empty /
not-deleted / missing invents nothing.
Do not undelete a live session. Not
wipe-account. Guest. First set ungated.
Today stays one Start.

`PRIVATE_MODE` stays on. Live www
stays `.696`. Do not promote. Do
not merge.

Full lock: [docs/PLAN.md](docs/PLAN.md)
frozen section `.1006`.

---

## 1. Investigate (done — hypothesis holds; no Today leak)

Checked on `origin/master` `.1005`
(`a6856d741fc1aac15ad2d0b6d98763a6a58c46a1`).

| Claim | Verified |
|-------|----------|
| Delete is already a tombstone | **Yes.** `applyDeleteFinishedSession` sets `deletedAt`. List / week strip / this-movement / PR skip it. |
| Copy says cannot recover | **Yes.** Confirm + surface tests. Detail `closeSelected()` after delete. |
| Restore would survive a cloud pull | **No.** Merge drops tombstones. Three sites: tombstone always wins. |
| Restore on Today | **No.** Lean is one Start. Keep that lock. |

**Verdict: keep.** Undo the tombstone on
History. Fix revision-wins so restore
does not lose to the next pull.

---

## 2. Lock

1. Delete stays confirm-gated. Drop
   “cannot be recovered”.
2. `decideRestoreFinishedSession` /
   `applyRestoreFinishedSession`. Empty
   / not-deleted / missing / live →
   nothing.
3. After delete, keep the detail on
   the tombstone with Restore.
   Overflow **Deleted sessions** when
   any tombstone exists.
4. Revision wins, including clearing
   `deletedAt`. Merge keeps tombstones.
   `HISTORY_CAP` still slices live rows.
5. No Today chrome. No second Start.
   No `/private` leak. No Feed.
6. `[skip vercel]` on every commit.
   Do not merge this PR yourself.
