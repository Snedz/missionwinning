# Rotated from LOG.md when `.797` landed

## 2026-08-14 — Feedback triage inbox (`.782`)

Notes already arrived and the founder could read them. The weekly ritual
("read 2, fix the #1 confusion") still had no state: no class, no dest,
no way to mark craft vs park. A list that cannot be rated is a reader,
not a loop.

**Ship:** rules classifier (`feedbackTriage.ts`) — no Grok. Founder POST
rates dest (craft / voice / park / done) onto `feedback_reviews`. Missing
table fail-opens the inbox. Tickets redact email. `/feedback` uses the
one composer (screen + build). Medical / off-horizon / unaligned cannot
go to voice or craft.

Mutants: timer-jump on Train sent to voice; iOS ask craftable with
override; ticket still carrying a raw email; POST inserting reviews itself.

Label `.782` (onto master `.781`).

Excellence-Override: founder inbox rating on feedback + beta admin
