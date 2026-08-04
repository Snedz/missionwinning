## 2026-08-04 — Active coach tip kind extract (`.365`)

Kaizen Loop 21 E2. `activeCoachTipKind` owns the hard-set tip band (default vs high) so ActiveSessionChrome does not inline `hardCount > 2`.

Wiring guard: chrome must call the helper and must not re-inline the threshold. Cap 16.
