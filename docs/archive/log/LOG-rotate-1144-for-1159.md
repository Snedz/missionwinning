## 2026-10-15 — Large history first-paint budget (2k sessions / 40k sets) (`.1144`)

Hand-built on the free lane (no CloudAgent): `src/lib/history/largeHistoryBudget.ts` seeds 2,000 sessions × 20 sets, measures Today/History first-paint scans, and memoises personal bests to match `getBestPriorSet`. Locking tests. Label `2026.07-unified.1144`. `[skip vercel]`.
