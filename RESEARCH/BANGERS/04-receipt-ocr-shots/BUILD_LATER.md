# 04 — BUILD_LATER

Do not start this file’s code until [SELL_FIRST.md](SELL_FIRST.md) has a **real** `paymentUrl` the founder typed, **or** the founder writes an explicit override in the PR body. Paper and HTML proofs are allowed now.

## Phase A — after first real payment or override

1. iOS stills: document camera → perspective crop → `VNRecognizeTextRequest` (`.accurate`, language correction on).
2. Column join: pair observations whose y-overlap is high and x-gap looks like item/price.
3. Heuristics for `TOTAL` / `TAX` / `TIP` lines (English first; other locales UNKNOWN).
4. Review UI: one table, one primary “accept total” action. Persist JSON **on device**.
5. Export: CSV + JSON. No cloud inbox.

## Phase B — only if Phase A totals survive the kill criterion

- Thermal-fade preprocessing (contrast) as an optional toggle
- Barcode / QR on the slip via VisionKit data scanner
- A Mac companion that reads the same JSON (no second SKU price)

## Never in this track

- A hosted OCR API as the default path (on-device is the offer)
- Auto-filing into accounting software
- Training a custom receipt model “to look finished” before three real slips pass
- Sharing code with 08 unlock-code-utils (different job)

## Proofs allowed before sell

A static HTML page that shows a **hand-typed** sample table (no Buy button). Not a claim the OCR ran.
