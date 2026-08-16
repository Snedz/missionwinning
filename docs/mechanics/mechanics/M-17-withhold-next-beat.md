---
id: M-17
type: mechanic
title: The next beat is withheld until the current act is produced
primitives:
  trigger: state-change
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: ephemeral
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: Yousician Wait To Play
    url: https://support.yousician.com/hc/en-us/articles/206912609-The-best-way-to-practice-guitar
    date: 2026-08-16
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - Tutorial software that will not advance until a quiz is perfect — people click through or leave; the wait becomes a gate, not a teacher
produces:
  - B-01
  - B-03
backfires:
  - behavior: B-01
    how: if the product cannot detect the act, the wait never ends, or it invents a sensor; either one is a new tap or a fake instrument
    class: E3
---

**The parts.** A current prescribed act is outstanding · the product **does not
present the next beat** · the same surface accepts the act · only then does the
next beat appear. Yousician's help names this Wait To Play: the song pauses
until the correct note. Detection is whatever that product already uses as
"the note happened." The duration of the pause is not the primitive.

This is not a confirmation modal before commit (that is a tap). This is not
M-16 (a window after commit). The beat after the act has not been shown yet.

**Precondition.** `none` only if the act is something the product already
detects. For Yousician that is audio. For this repo that is a logged set. A
version that waits for "correct form" needs a sensor we do not have and fails
this field.

**Discarded this harvest (not this mechanic).** NASA Degani checklist
(NASA-CR-177549): crew challenge-response, `precondition` is a second person.
PhysiApp discomfort log: the first-person mark is a different primitive; the
dashboard needs a clinician graph. Both inbox files discarded.
