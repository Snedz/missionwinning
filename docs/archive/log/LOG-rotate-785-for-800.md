# Rotated from LOG.md when `.800` landed

## 2026-08-14 — Locale sheet follows the live path (`.785`)

`.784` keyed the auto-open to the React pathname. The `/api/geo` fetch
can resolve after I-Day Continue has already landed `/active`, so the
sheet still covered Train's first set.

**Ship:** decide open from `window.location.pathname`. Force-close when
the live path is first-set. Logger ungated. No `PRIVATE_MODE` flip.

Mutants: setOpen(true) still using only the stale pathname.

Label `.785` (onto master `.784`).

Excellence-Override: locale sheet follows live path on Train/I-Day
