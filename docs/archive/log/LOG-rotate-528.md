# Rotated for .528

## 2026-08-05 — Kaizen: EN rewards i18n keys on Today namespace (`.513`)

Add English `reward*` strings to `public/locales/en/today.json` so Mission progress / Victory / Profile do not fall through to defaultValue-only in EN.

Mutants: strip rewardTodayTitle from en/today.json → uncovered or fallback-only path (documented).

