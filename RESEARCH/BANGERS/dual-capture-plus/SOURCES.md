# dual-capture-plus — sources

Checked **2026-09-19**. Re-verify before quoting prices or device lists.

| # | What | URL | Used for | Notes |
|---|------|-----|----------|-------|
| 1 | Apple — Record a video (Dual Capture) | https://support.apple.com/guide/iphone/record-a-video-iph61f49e4bb/ios | Device list | States Dual Capture on iPhone 17, 17 Pro, 17 Pro Max, iPhone Air. |
| 2 | WWDC19 — Multi-Camera Capture | https://developer.apple.com/videos/play/wwdc2019/249/ | API floor | `AVCaptureMultiCamSession`; XS-class combinations; two physical cameras. |
| 3 | 9to5Mac — Dual Capture on iPhone 17 | https://9to5mac.com/2025/09/10/iphone-17-video-dual-cam-recording/ | History | API existed since 2019; stock Camera PiP is 17-only; older hardware capable. |
| 4 | MacRumors — how to Dual Capture | https://www.macrumors.com/how-to/iphone-17-dual-capture-video/ | Limits | One layout; one file; 1080p or 4K at 24/30. Comments point to RØDE on older phones. |
| 5 | Tom’s Guide — Dual Capture hands-on | https://www.tomsguide.com/phones/iphones/i-tried-out-iphone-17-dual-capture-heres-what-it-can-and-cant-do | Layout lock | Rear-hero PiP; no split; no feed swap; vs Samsung Dual Rec. |
| 6 | FiLMiC DoubleTake product | https://www.filmicpro.com/products/doubletake/ | Free incumbent | Discrete 1080p stems; PiP; split; 24/25/30; API 1080p note. |
| 7 | DoubleTake App Store | https://apps.apple.com/us/app/doubletake-multicam-video/id1478041592 | Listing | Free. Device list on listing is historical — re-read before citing. |
| 8 | Cined — DoubleTake review | https://www.cined.com/multicam-recording-iphone-doubletake-filmic-pro/ | Floor | Free; XS / 11-gen; 1080p API cap; auto AE/AF/WB. |
| 9 | RØDE Capture App Store | https://apps.apple.com/us/app/r%C3%B8de-capture/id1588683096 | Free incumbent | Split + PiP; combined or separate files; iOS 16+. |
| 10 | RØDE Capture user guide | https://rode.com/en-int/user-guides/rode-capture | Dual-cam behavior | Separate vs combined; some iPads cannot dual-cam; 4K60 on iPhone 12+. |
| 11 | MultiCam+ App Store | https://apps.apple.com/us/app/multicam-front-back-camera/id1480484661 | Paid-feature cousin | A12+ required; multiple layouts; IAP present — **current prices UNKNOWN without a live storefront read**. |
| 12 | DuoCam App Store | https://apps.apple.com/us/app/duocam-multicam-video-camera/id1482277903 | IAP cousin | Listing showed DuoCam Pro $0.99 / $9.99 when checked via search snippet — **re-open listing**. |

## UNKNOWN (do not invent)

| Item | Why |
|------|-----|
| DoubleTake / RØDE monthly active users | No primary public figure found. |
| MultiCam+ revenue or IAP mix | Listing confirms IAP exist; dollar amounts move. |
| Whether Apple will port Dual Capture to iPhone 16 and older | No commitment found. |
| Exact MultiCam resolution cap on iOS 26 | FiLMiC’s 1080p note may be stale. Measure. |
| Buyer count who will pay $12 given free apps | Untested. That is the 14-day bar. |
| Final App Store name (trademark vs “Dual Capture”) | Counsel. |

## Overnight re-open (GLM 5.3 · 2026-09-19)

Complement only. Existing rows above stay. Full check table: [GLM53.md](GLM53.md).

| # | What | URL | Notes |
|---|------|-----|-------|
| 13 | `AVCaptureMultiCamSession` (Apple docs) | https://developer.apple.com/documentation/avfoundation/avcapturemulticamsession | Official API. `isMultiCamSupported` / hardware cost. |
| 14 | `supportedMultiCamDeviceSets` (Apple docs) | https://developer.apple.com/documentation/avfoundation/avcapturedevice/discoverysession/supportedmulticamdevicesets | Query combinations; do not hard-code. |
| 15 | iPhone 17 tech specs | https://support.apple.com/en-us/125089 | Dual Capture up to 4K Dolby Vision at 30 fps — **stock Camera**. |
| 16 | iPhone 17 Pro tech specs | https://support.apple.com/en-us/125090 | Same Dual Capture 4K line. |
| 17 | iPhone 17 Pro Max tech specs | https://support.apple.com/en-us/125091 | Same Dual Capture 4K line. |
| 18 | iPhone Air tech specs | https://support.apple.com/en-us/125092 | Same Dual Capture 4K line. |
| 19 | iPhone 16 tech specs | https://support.apple.com/en-us/121029 | **No** Dual Capture line (gap holds). |
| 20 | Record a video (iOS 26 guide) | https://support.apple.com/guide/iphone/record-a-video-iph61f49e4bb/26/ios/26 | Still names 17 / 17 Pro / 17 Pro Max / Air. |

Listing refreshes (same URLs as #7, #9, #11, #12): DoubleTake still **Free** + IAP; RØDE Capture still **Free**; MultiCam+ storefront showed **$1.99**; DuoCam still Free + IAP (Pro $0.99 / $9.99 / $12.99 listed). IAP dollars move — do not freeze them in the lander.
