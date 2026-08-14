# Rotated from LOG.md when form object kit landed

## 2026-08-13 — Preview walk P0s: consent dock + landing notify (`.765`)

Chrome walk of the ungated Preview path (mission-ops #19): the analytics
consent banner covered Today's only first-set CTA on phones, and Super Bundle
“get notified until Stripe” had no form once `/private` always redirected.

**Ship:** consent banner docks as a reserved flex sibling above the tab bar
(never `fixed bottom-0`). Landing mounts `LaunchNotifyForm` (existing
`/api/leads` path). No checkout. No Stripe-is-live claim. No invented traction.
`TAP_BUDGET` stays 5. Consent stays. `PRIVATE_MODE` unchanged. Preview will
not deploy.

Label `.765` (onto master `.764`). Brief reserved `.750` (occupied). First
land `.755` was occupied by unilateral L/R. Excellence-Override below.

Excellence-Override: preview walk P0s (consent dock + landing notify)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-750-for-765.md](docs/archive/log/LOG-rotate-750-for-765.md).
