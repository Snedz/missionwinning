# Rotated for .536

## 2026-08-05 — Kaizen: formatLocalDateKey shared helper (`.521`)

Move History date formatting into `localDate.ts` (`formatLocalDateKey`) so UTC-midnight shift never returns as a page-local copy. HistoryPage uses the shared helper.

Mutants: History reintroduces local formatDayKey → red (optional source pin); malformed key returns raw.

