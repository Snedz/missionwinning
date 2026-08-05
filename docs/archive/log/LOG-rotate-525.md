# Rotated for .525

## 2026-08-05 — Kaizen: free-beta dual-mode Unlock + Bundle route pins (`.510`)

Pin UnlockButton mute + checkout body and `app/bundle` redirect(`/log`) under free-beta so dual-mode cannot silently drift.

Mutants: UnlockButton without isFreeBeta return null → red; bundle page without redirect /log → red.

