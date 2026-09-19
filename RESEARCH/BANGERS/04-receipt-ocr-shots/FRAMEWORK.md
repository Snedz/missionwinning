# 04 — receipt-ocr-shots

**Status:** unpublished-draft · paper only  
**Job:** photograph a paper receipt and emit **merchant, date, currency, total, tax, and line-item candidates** — not a bookkeeping suite.

## What it is

A stills-in, table-out utility. Capture with VisionKit document camera (or a user-supplied photo). Run `VNRecognizeTextRequest` at `.accurate`. Keep every `VNRecognizedTextObservation` bounding box. Reconstruct columns (item left, price right) in our code. Apple’s Vision returns **text at a location**. It does not return “this is a receipt.”

## ICP

One person who already photographs receipts for taxes, per-diem, or a shared house ledger and is tired of retyping totals. They will sit with a review screen. They will not subscribe to an expense platform.

Not: Mission Winning Fuel. Not a bank connection. Not an IRS e-file.

## Non-goals

- Live SKU catalog matching
- Multi-currency FX
- Cloud “always-on” receipt inbox
- Claiming 99% line-item accuracy (unmeasured → UNKNOWN)

## API / platform facts this track may use

- `VNDocumentCameraViewController` / `VNDetectDocumentSegmentationRequest` for page crop (WWDC21 “Extract document data using Vision”)
- `VNRecognizeTextRequest` + bounding boxes for column join
- VisionKit `DataScannerViewController` for **live** totals/barcodes if we ever leave stills — stills-first

## Kill criterion

If three real receipts (grocery, restaurant, thermal gas) cannot produce a **total that the human accepts in one tap** after a review UI, kill the SKU. Do not add a second model to hide the miss.

## Sell before build

Listing and waitlist copy live in [SELL_FIRST.md](SELL_FIRST.md). No capture binary until a founder override or a real payment exists. Intended `priceLabel`: **$9 one-time**. Not charged. `paymentUrl` empty.
