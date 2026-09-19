# center-stage-coach — sources

Checked **2026-09-19**. Re-verify the device list before any lander.

| # | What | URL | Used for | Notes |
|---|------|-----|----------|-------|
| 1 | Apple Support 111102 | https://support.apple.com/en-us/111102 | Device list + toggle | Live 2026-09-19. Published on page: 2026-05-12. Named iPhone: 17, Air, 17 Pro (front). Intro: “iPhone 17 models and iPhone Air.” 17 Pro Max **not named**. iPad generations listed. |
| 2 | WWDC26 session 341 | https://developer.apple.com/videos/play/wwdc2026/341/ | App support | Front camera Center Stage; zoom / rotate; video calls. |
| 3 | AVFoundation sample | https://developer.apple.com/documentation/avfoundation/supporting-center-stage-front-camera-in-your-ios-app | API | Preliminary / beta note on the page. iPhone 17 / Air / 17 Pro. |
| 4 | `isCenterStageEnabled` | https://developer.apple.com/documentation/avfoundation/avcapturedevice/iscenterstageenabled | API | Process-wide intent vs `isCenterStageActive`. |
| 5 | `isCenterStageSupported` | https://developer.apple.com/documentation/avfoundation/avcapturedevice/format/iscenterstagesupported | API | Per-format. |
| 6 | The Swift Dev notes | https://www.theswift.dev/posts/add-center-stage-framing-to-an-ios-camera-app | Secondary | Implementation notes; beta-shaped names. Not a product. |

## UNKNOWN (do not invent) — dated 2026-09-19

| Item | Why |
|------|-----|
| iPhone 17 Pro Max on the official named list | Not in 111102 system-requirements bullets this pass. Intro says “17 models.” |
| Paid demand | Untested. Pays = 0. |
| Shipped App Store “Center Stage coach / framing marks” competitor | None found. Do not invent. |
| Final App Store name (vs Apple’s feature name) | Counsel. |
| Preliminary API stability on shipping iOS | Measure on device. |
