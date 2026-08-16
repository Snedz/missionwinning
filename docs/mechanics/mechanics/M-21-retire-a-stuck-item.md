---
id: M-21
type: mechanic
title: An item that keeps failing is taken out of the working set until a human puts it back
primitives:
  trigger: state-change
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: existing-habit
seen_in:
  - product: Anki leeches
    url: https://docs.ankiweb.net/leeches.html
    date: 2026-08-16
    class: E1
    retrieval: fetched
  - product: Anki deck options — lapses
    url: https://docs.ankiweb.net/deck-options.html#lapses
    date: 2026-08-16
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - Ease hell — repeatedly failing a card without a suspend just shrinks the interval until the session is only that card
produces:
  - B-02
  - B-03
backfires:
  - behavior: B-01
    how: if the first session can mark a lift a leech, the only act disappears
    class: E3
---

**The parts.** A review item fails (Again) enough times. The product **tags
it and takes it out of the queue** (Anki default: 8 lapses → suspend). It
does not come back until someone unsuspends it. Editing or deleting are
documented as human next steps, not automatic.

This is not M-18 (new work waits on due). This is not a daily cap. The
item had been due; it is now **removed from due**.

**Precondition.** `existing-habit` — a lapse counter needs a history of
review fails. A cold first set has none.

**Discarded this harvest (not this mechanic).** Linear Cycles: official
docs allow mid-cycle adds (auto-add + "After cycle" filter). Wordle:
one puzzle per calendar day is a date filter (M-20), and missed days
exist in a subscriber archive.
