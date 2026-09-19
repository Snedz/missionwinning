# 04 — SOURCES

Opened or primary-doc pages. One claim per row. If a link 404s, mark **STALE** — do not guess a replacement.

| Source | Proves |
|--------|--------|
| [Extract document data using Vision (WWDC21)](https://developer.apple.com/videos/play/wwdc2021/10041/) | `VNDetectDocumentSegmentationRequest` + `VNRecognizeTextRequest` on a cropped page. Receipts are in the training description of the segmenter, not a receipt schema API. |
| [Capture machine-readable codes and text with VisionKit (WWDC22)](https://developer.apple.com/videos/play/wwdc2022/10025/) | `DataScannerViewController` wraps AVFoundation + Vision for live text/barcodes. Availability: Neural Engine devices; camera permission; Screen Time camera restriction can disable scanning. |
| [Scanning data with the camera (VisionKit)](https://developer.apple.com/documentation/visionkit/scanning-data-with-the-camera) | Official still/live scanner configuration. Payload is text or barcode — app supplies structure. |
| [Apple VisionKit: scanning receipt structure (Stack Overflow)](https://stackoverflow.com/questions/77771459/apple-visionkit-scanning-receipt-structure-accurately) | Vision returns observations + boxes; item/price join is **your** geometry. Throwing away all-but-first candidates loses columns. |
| [What’s new in VisionKit (WWDC23)](https://developer.apple.com/videos/play/wwdc2023/10048/) | Live Text / document structure detection in the **system** overlay is not a receipt parser you can call as a ledger. |

## What we do not cite as fact

- A public “ReceiptKit” or iOS 27 receipt-schema API (not found)
- Accuracy percentages we did not measure
- Any shop URL
