---
id: M-16
type: mechanic
title: A short window after commit when the act has not yet left the device
primitives:
  trigger: completion
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: session
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: Gmail Undo Send
    url: https://blog.google/products-and-platforms/products/gmail/how-to-unsend-email-gmail/
    date: 2023-02-07
    class: E1
    retrieval: fetched
  - product: Gmail Help — Send or unsend messages
    url: https://support.google.com/mail/answer/2819488?hl=en
    date: 2026-08-16
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - Outlook message recall — after delivery it asks the recipient's client to delete, often fails, and can generate extra notification mail, so "undo" after the act has left is not the same mechanic
produces:
  - B-01
  - B-02
backfires:
  - behavior: B-01
    how: a long window trains people to log first and think later, so the saved set is a draft that happens to expire into a record
    class: E3
---

**The parts.** The user hits the commit control · the product **does not emit
yet** · for a short, named window the same control can be taken back · the
artifact returns to the pre-commit state · after the window the commit is
ordinary and irreversible from this surface.

This is not pre-authorized forgiveness (`M-03`). That insurance is decided
*before* a miss. This window is decided *after* a commit. Gmail's own help
treats Undo as cancelling a send that has not finished, not as recalling a
delivered message.

**What is not this mechanic.** Outlook-style recall after delivery. Slack
"edited" / "deleted" traces on a message that did leave. A confirmation modal
*before* commit (that is a tap, and this product already budgets taps).

**Why the window is the primitive.** Five seconds is the default Gmail ships;
settings offer 5, 10, 20 or 30. The duration is a knob. The mechanic is that
commit and emit are not the same instant.

Harvest-9 scout opened both URLs. Inbox file discarded after this promotion.
GitHub draft PRs (share without requesting review) discarded: `precondition`
is a reviewer graph we do not have. Stripe test clocks discarded: advancing
a clock in a sandbox is not an athlete-facing commit, and a product preview
of unlived time sits next to `X-07`.
