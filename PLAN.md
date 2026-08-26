# PLAN.md — Library skips deleted sessions (`.1010`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the library-tomb skip freeze.
**Lane:** Engineering-Web · Library · **Horizon:** 0
**Label:** `2026.07-unified.1010` (master is `.1009` / `20faec3ab`
Next cite is BW, not 0 kg). Title stays **Library
skips deleted sessions (.1010)**.
**Excellence-Override:** leftover library spark/count
after History tombstone (`.1006`) (not a Feed)

---

## 0. What this is

Delete a bogus Monday. History skips
it. Library still counts it in
“Logged in N sessions” and the
volume spark. Empty invents nothing.
Guest. First set ungated. Today stays
one Start.

`PRIVATE_MODE` stays on. Live www
stays `.696`. Do not promote. Do
not merge.

Full lock: [docs/PLAN.md](docs/PLAN.md)
frozen section `.1010`.

---

## 1. Investigate (done)

`countExerciseHistory` has no
`deletedAt`. Spark walks reversed
history with no skip. History
charts already use `liveHistory`.
This-movement history already skips.

---

## 2. Lock

1. Library session count and spark
   skip `deletedAt`. Tomb-only is
   empty.
2. Empty / missing invents nothing.
3. Do not smash History skip.
4. No Today chrome. No Feed.
5. `[skip vercel]` on every commit.
   Do not merge this PR yourself.
