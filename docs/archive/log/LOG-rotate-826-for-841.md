# Rotated from LOG.md for `.841`

Superseded as a live LOG entry 2026-08-15 when `.841` shipped. Full text preserved.

## 2026-08-15 — Logging a set no longer scrolls the phone sideways (`.826`)

Easy/Med/Hard + RIR sat `shrink-0` on the nowrap metric row. After Log set the page was 470px wide on a 390 phone.

**Ship:** ratings on their own wrapping row. Gate e2e asserts `scrollWidth === innerWidth` at 390.

Label `.826` (onto `.825`).

Excellence-Override: logger no side-scroll (G1 hotfix; RESULT unscored)
