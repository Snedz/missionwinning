---
id: B-01
type: behavior
title: A stranger saves a working set on their first visit
behavior_class: activate
observable: event:first_set_logged
measurable: blocked-on-telemetry
source:
  - ORCHESTRATION.md Horizon W criterion 5 — phone hero under ninety seconds feels intentional
  - docs/JOURNEY.md Phase 1 — Basic Training means first workout completed
---

The one behaviour every other behaviour depends on. Nothing in the graph can
target `return`, `trust` or `depth` for an athlete who never logged anything.

**What already serves it.** `/active` is gate-public so a first set can happen
while the site is private; `.839` made cold Continue land on `/log` rather than
dumping into an empty Active screen; `TAP_BUDGET` caps the path at five taps.

**Why `blocked-on-telemetry`.** The event exists in the union and the code fires
it, but `PRIVATE_MODE` is on, no invite can be sent while `MAIL_POSTAL_ADDRESS`
is unset, and there are no users. So the behaviour is currently gradeable only
through its proxy instruments — taps and wall clock — not through itself. Any
hypothesis claiming otherwise is inventing traction (`X-07`).
