# Rotated from LOG.md for .416

## 2026-08-04 — Beachhead i18n parity for Fuel/Active/Learn (`.401`)

CI `i18n:parity` failed after unit tests cleared: beachhead `es`/`fr`/`pt` for **fuel**, **activeWorkout**, and **learn** were above the 40% English-placeholder cap (kaizen loops added EN keys; packs never caught up because superseding pushes cancelled earlier runs before the parity step). Filled the deficit into `src/i18n/packs/{es,fr,pt}.json` via `google-translate-api-x` (preserve brand / `{placeholders}`). `npm run i18n:parity` → OK.
