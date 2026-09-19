# 07 — SOURCES

| Source | Proves |
|--------|--------|
| [Building a Responsive Camera App in iOS 27](https://blakecrosley.com/blog/responsive-camera-app-ios-27) | Center Stage for VoIP via Control Center; other apps use Center Stage API (`cooperative` / `app`, `isCenterStageEnabled`). Front Center Stage camera as `.builtInUltraWideCamera` on iPhone 17, iPhone Air, iPhone 17 Pro. `dynamicAspectRatio` on square formats. Deferred start + `isResponsiveCaptureEnabled`. |
| [WWDC26 Camera lab notes](https://antongubarenko.substack.com/p/wwdc26-camera-and-photo-technologies) | Session on dedicated queue; `beginConfiguration`/`commitConfiguration`; preview layer vs video data output; deferred start races without responsive capture. |
| Apple AVFoundation docs for Center Stage / system video effects | Canonical symbol names — re-open the current doc page at build time; if the blog and the header disagree, **the header wins**. |

## UNKNOWN until we hold a phone

Whether a specific SKU (e.g. older Pro) enables the same front UW Center Stage path. Do not fill the matrix from memory.
