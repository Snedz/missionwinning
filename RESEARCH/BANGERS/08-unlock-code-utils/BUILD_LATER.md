# 08 — BUILD_LATER

Gate: sell/override.

## Phase A

1. `DataScannerViewController` with `.barcode(symbologies: [.qr])` + text type for numeric codes
2. `WIFI:` parser with escapes; user confirm screen before Keychain write
3. Manual entry path (no camera) — same vault
4. Empty state: zero codes, no sample secrets in git

## Phase B

- Still-photo path (`VNRecognizeTextRequest`) for faded router cards
- Export an encrypted backup **the user chooses** (no silent iCloud)

## Never

- Screen Time / MDM PIN APIs (they are not a vault feature)
- Auto-join Wi‑Fi without user action (NEHotspotConfiguration is a later, explicit button — still not a bypass)
- Sharing 04’s receipt heuristics as “codes”

## Proofs allowed now

A markdown parse table for `WIFI:` fields (SOURCES). No live passwords in the repo.
