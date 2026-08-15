# Rotated from LOG.md when `.809` landed

## 2026-08-14 — Landing chrome is Alpha, not leftover Open beta (`.794`)

After Done, MarketingNav first-painted "Open beta — Super Bundle: get
notified until Stripe" and never interpolated `productVersion`. The
stamp is Alpha 0.1.0. First paint and hydrate disagreed.

**Ship:** status bar uses `APP_PUBLIC_STATUS_LINE_EN` and
`{{productVersion}}`. Drift cap 218 → 217. No restyle. No
`PRIVATE_MODE` flip.

Label `.794` (onto master `.793`).

Excellence-Override: landing chrome leftover Open beta (surface; RESULT unscored)
