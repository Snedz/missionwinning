# PLAN.md — Next cite is 0:45, not mute (`.1014`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the duration-cite freeze.
**Lane:** Engineering-Web · Train · **Horizon:** 0
**Label:** `2026.07-unified.1014` (master is `.1013` / `3a28b75fa`
Our export comes back). Title stays **Next cite
is 0:45, not mute (.1014)**.
**Excellence-Override:** leftover duration Next/Last after
BW cite (`.1009`) (not a Feed)

---

## 0. What this is

Prev already says 0:45 for a plank.
Next / Last / after-complete still
dropped `durationSeconds`, so the
cite stayed mute. Empty invents
nothing. Guest. First set ungated.
Today stays one Start.

`PRIVATE_MODE` stays on. Live www
stays `.696`. Do not promote. Do
not merge.

Full lock: [docs/PLAN.md](docs/PLAN.md)
frozen section `.1014`.

---

## 1. Investigate (done)

`formatSetRowLine` already prints
`0:45` when seconds are passed.
`suggestNextSetTarget` bails on
`lastReps < 1`. Ghost filters
`reps > 0`. `formatTargetLabel`
never forwarded the hold.

---

## 2. Lock

1. Next, Last ghost, and after-complete
   cite a logged hold as `0:45`.
2. Missing hold invents nothing.
   Do not treat reps as seconds.
3. Copy last hold. Do not add +1s.
4. No Today chrome. No Feed.
5. Do not smash import `.1013` /
   titles `.1012` / export `.1011` /
   BW cite `.1009`.
6. `[skip vercel]` on every commit.
   Do not merge this PR yourself.
