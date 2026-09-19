# 05 — SOURCES

| Source | Proves |
|--------|--------|
| [WWDC26 Camera and Photo Technologies Group Lab (Anton Gubarenko notes)](https://antongubarenko.substack.com/p/wwdc26-camera-and-photo-technologies) | Multicam: use supported APIs; thermal / bandwidth / power limits; coherent timestamps; do not assume system Camera combos (incl. 24 MP + depth on both). Spatial Reframe pipeline **has no public API** (relevant so 05 does not “fix framing” that way). Dedicated serial queue for `AVCaptureSession`. |
| [Building a Responsive Camera App in iOS 27](https://blakecrosley.com/blog/responsive-camera-app-ios-27) | Front Center Stage surfaces as front `.builtInUltraWideCamera` on listed iPhone 17 class devices; `dynamicAspectRatio`; deferred start / responsive capture — useful for the **face** stream, still not a dual-graph. |
| Track 01 `dual-capture-plus` FRAMEWORK (sibling) | **The** capture contract. If absent, graph is UNKNOWN. |

## What we do not cite

- A public “TutorCam” Apple API
- A ship date for 01
- Any store URL
