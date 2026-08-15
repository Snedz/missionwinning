---
id: M-15
type: mechanic
title: Show the number the user will misread correctly
primitives:
  trigger: state-change
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: session
  reversibility: no
  forgiveness: no
  optimum_direction: more
  precondition: none
seen_in:
  - product: XCOM 2 — displayed hit chance is a presentation value; hidden aim assists apply on every difficulty except the top one
    url: https://www.gamedeveloper.com/design/jake-solomon-explains-the-careful-use-of-randomness-in-i-xcom-2-i-
    date: 2016-02-11
    class: E2
    retrieval: indexed
    why_not_e1: search-index synthesis only; gamedeveloper.com was blocked in harvest 1
also_seen_in_failures:
  - Whoop Strain and most composite wellness indices — inputs published, the combining function not, so the user cannot audit the number they are asked to act on. A Steam mod exists purely to remove XCOM's assists, so the dissenting population is real and organised
produces:
  - B-03
---

Recorded **because it is refused.** It is the exact negative pole of `M-08`, and
a graph that only stored the mechanics it likes would let a future translator
re-derive this and present it as new.

**The claim, and it is a serious one made by a serious designer.** Jake Solomon,
on the record: *"That 85 percent isn't actually 85 percent. Behind the scenes, we
wanted to match the player's psychological feeling about that number."* The
reasoning is that a user reads a probability **emotionally, not
mathematically** — 85% reads as "that basically should not miss" — so rather than
correct the reading, correct the system until the outcome matches the reading.
Hidden assists run on every difficulty except Legend; the top difficulty is the
honest one.

**Why it dies here.** `X-07` — never invent traction, never state a number the
measurement does not support. This whole codebase is built the other way: `ratio`
returns `null` under fourteen days rather than a plausible-looking value, the
adapt banner has to earn itself by diffing sessions, and the Mission Score's
parameters were **renamed** so lifetime data became a typecheck failure. Shipping
a confidence number calibrated to misreading is that discipline inverted.

**What survives the refusal, and it is not nothing.** The underlying observation
is true and useful: **users read a number emotionally, and a technically correct
number can still mislead.** The legal response is to change the *number shown*,
not the truth behind it — pick a unit the athlete reads correctly, or show a band
instead of a point estimate. `load.ts` already does the honest version by
refusing to show a ratio it cannot support.

`H-11` is the translation, recorded `killed`, so the anti-library has a
fingerprint to match against.
