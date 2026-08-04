## 2026-08-04 — Session more menu seeded a11y (`.385`)

Kaizen Loop 28 L1. Seeded axe on `/active` with session More menu open (Discard HoldToConfirm).

**Real axe finding fixed:** `role=menu` must not wrap `HoldToConfirmButton` (`button[aria-busy]` fails aria-required-children). Session chrome drops menu role for a plain disclosure; exercise overflow keeps `role=menu` only around menuitems, HoldToConfirm outside.

Cap 16.
