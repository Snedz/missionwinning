# PLAN.md — Next cite is BW, not 0 kg (`.1009`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the live-BW-cite freeze.
**Lane:** Engineering-Web · Train · **Horizon:** 0
**Label:** `2026.07-unified.1009` (master is `.1008` / `727c6f484`
Find a past session). Title stays **Next cite is BW,
not 0 kg (.1009)**.
**Excellence-Override:** leftover live BW cite
(Victory/Prev already honest; Next/Last still print 0 kg)

---

## 0. What this is

Just Go push-ups look broken on the
line they are about to log. Victory
says 8 reps. Prev says BW. Next still
says 0 kg. Guest. First set ungated.
Today stays one Start.

`PRIVATE_MODE` stays on. Live www
stays `.696`. Do not promote. Do
not merge.

Full lock: [docs/PLAN.md](docs/PLAN.md)
frozen section `.1009`.

---

## 1. Investigate (done)

Header interpolates `nextTarget.weight`.
`formatTargetLabel` is `reps × weight`.
Ghost interpolates `ghost.weight`.
`formatSetRowLine` already knows BW.

---

## 2. Lock

1. Next / Last / after-complete cites
   for a bodyweight row print BW, not
   `0 kg`. Vest is `BW + 20`.
2. Loaded rows stay `5 × 100 kg`.
   Empty next / no ghost invents
   nothing.
3. Reuse `formatSetRowLine` /
   `formatSetRowPrev`. No second
   grammar.
4. No Today chrome. No Feed.
5. `[skip vercel]` on every commit.
   Do not merge this PR yourself.
