# 08 — SOURCES

| Source | Proves |
|--------|--------|
| [Capture machine-readable codes and text with VisionKit (WWDC22)](https://developer.apple.com/videos/play/wwdc2022/10025/) | Data scanner for QR + text; camera permission; Screen Time **camera restriction** can disable scanning (not a PIN API). |
| [Scanning data with the camera](https://developer.apple.com/documentation/visionkit/scanning-data-with-the-camera) | Official configuration; tap → payload; app decides the action. |
| [DataScannerViewController.RecognizedDataType](https://developer.apple.com/documentation/visionkit/datascannerviewcontroller/recognizeddatatype) | `.barcode(symbologies:)` and text content types. |
| [How to decode a WIFI QR payload (Apple Developer Forums)](https://developer.apple.com/forums/thread/720396) | Payload shape `WIFI:S:…;T:…;P:…;;` — split yourself; no first-party Wi‑Fi object. |

## WIFI field table (legal parse)

| Prefix | Meaning |
|--------|---------|
| `S:` | SSID |
| `T:` | Type (e.g. WPA) |
| `P:` | Password |
| `H:` | Hidden network flag when present |

Escapes and missing fields are the parser’s problem. Do not store a sample `P:` from a real network in git.

## Not sources for this SKU

FamilyControls / ManagedSettings (those are Screen Time **app limits**, not a passcode dump). Any “unlock iPhone” blog.
