---
id: M-13
type: mechanic
title: A receipt that arrives, not one you visit
primitives:
  trigger: calendar
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: existing-habit
seen_in:
  - product: Screen-time tracking — longitudinal field study; tracking improved digital self-awareness but was less likely to reduce usage
    url: https://www.journals.uchicago.edu/doi/abs/10.1086/714365
    date: 2021-07-01
    class: E2
    retrieval: indexed
    why_not_e1: peer-reviewed (Journal of the Association for Consumer Research 6:3) but read via search index only
  - product: The same data delivered by push notification instead — usage fell in 75% of participants during the intervention week
    url: https://arxiv.org/pdf/2507.14702
    date: 2025-07-19
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - Spotify Wrapped 2024 and Facebook Year in Review 2014 — arriving receipts that the recipient audited against their own memory and found wrong. The second led with a photo of a user's dead child, pre-filled
produces:
  - B-02
backfires:
  - behavior: B-02
    how: consumers prefer informational tracking over nudges despite rating it less effective, and the preference is strongest among the most dependent — so the version people choose is the version that does not work
    class: E2
    url: https://www.journals.uchicago.edu/doi/abs/10.1086/714365
---

**The distinction, and it is one line.** A receipt you must **visit** changes
awareness. A receipt that **arrives** changes behaviour. Same data, same numbers,
opposite outcome — and the backfire is that people, asked to choose, take the
version that does not work, most strongly the people who need it most.

`M-08` is the receipt mechanic in this graph. It is currently the *visiting*
kind: `retained_week_4` renders at `/account/under-the-hood`, behind a settings
screen, for an athlete who went looking.

**Why this is recorded and not built.** `precondition: existing-habit` **and** a
live delivery channel. Ours is dark — VAPID keys unset, so push ships inert, and
the hourly cron sweeps `exit 0`. That is arithmetic, not preference. Any
candidate translating this is `blocked-on-telemetry` until the founder sets three
env vars, and saying so is cheaper than building a surface that cannot fire.

**The failure column earns its place here.** An arriving receipt is audited
against the one dataset the company does not hold — the recipient's own memory of
their year. Wrapped 2024 disagreed with users about what they had listened to and
they concluded the *measurement* was broken, not their memory. Facebook's 2014
recap pre-filled a dead child's photo into a Christmas Eve feed; the author's own
prescription was **do not pre-fill, ask first**. Both are the same mechanic as
Whoop's weekly assessment. The difference is pre-fill and opt-in placement.

For a training product the analogue is exact: an arriving weekly receipt that
tells an athlete something they know to be wrong about their own week costs more
trust than the receipt was ever going to buy.
