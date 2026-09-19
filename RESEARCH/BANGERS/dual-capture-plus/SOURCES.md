# Dual Capture+ — sources

Primary links only. If a URL dies, replace it with another page on the **same official host**, do not invent an App Store id. Retrieved for this pack **2026-09-19**. Hands-on press is labeled **secondary** (limitations of stock Dual Capture that Apple’s how-to implies but does not enumerate).

Camera / App Store names here are citations for BANGERS track 01, not Mission Winning fitness intel.

---

## 1. Apple developer — MultiCam API and sample

| What | URL | Why it is in the pack |
|------|-----|------------------------|
| **AVMultiCamPiP: Capturing from Multiple Cameras** | https://developer.apple.com/documentation/AVFoundation/avmulticampip-capturing-from-multiple-cameras | **Canonical sample.** Simultaneous front+back into one movie. Configure note: run on **iPhone A12 or later** or **iPad Pro A12X or later**. Associated with WWDC 2019 session **225** |
| **AVCaptureMultiCamSession** | https://developer.apple.com/documentation/avfoundation/avcapturemulticamsession | Session subclass. Preset is always `inputPriority`. `isMultiCamSupported`, `hardwareCost`, `systemPressureCost`. Do not use a second `AVCaptureSession` for a second camera |
| **isMultiCamSupported** (session) | https://developer.apple.com/documentation/avfoundation/avcapturemulticamsession/ismulticamsupported | Class property: this **device** can run a multi-cam session |
| **Format.isMultiCamSupported** | https://developer.apple.com/documentation/avfoundation/avcapturedevice/format/ismulticamsupported | Only these formats may be `activeFormat` on a multi-cam session |
| **supportedMultiCamDeviceSets** | https://developer.apple.com/documentation/avfoundation/avcapturedevice/discoverysession/supportedmulticamdevicesets | Legal simultaneous device combinations |
| **systemPressureCost** | https://developer.apple.com/documentation/avfoundation/avcapturemulticamsession/systempressurecost | &gt; 1.0 = not sustainable; watch `systemPressureState`; interruption → `wasInterruptedNotification` |
| **hardwareCost** | https://developer.apple.com/documentation/avfoundation/avcapturemulticamsession/hardwarecost | Session hardware budget. WWDC 249: 0.0–1.0 runnable |
| WWDC 2019 **249** — Introducing Multi-Camera Capture for iOS | https://developer.apple.com/videos/play/wwdc2019/249/ | Lecture: explicit connections, device sets, format walk, cost, AVMultiCamPiP demo. Slides PDF: https://devstreaming-cdn.apple.com/videos/wwdc/2019/249a0jw909n3uq0/249/249_introducing_multicamera_capture_for_ios.pdf |
| WWDC 2019 **225** — Advances in Camera Capture & Portrait Segmentation | https://developer.apple.com/videos/play/wwdc2019/225/ | Sample association page points here; includes MultiCam PiP demo (swap full vs inset; one video track) |
| Apple Developer Forums — Media Engineer on two files vs composite | https://developer.apple.com/forums/thread/651426 | `AVCaptureMovieFileOutput` = **one** video source. Composite = 2× VideoDataOutput + AVAssetWriter (AVMultiCamPiP). Discrete = two movie outputs, optional offline compose |

**Spike download:** use the **Download** control on the AVMultiCamPiP documentation page (Apple’s sample zip). Do not vendor a random GitHub mirror as the source of truth.

---

## 2. Apple product — stock Dual Capture (the thing we are not)

| What | URL | What to take from it |
|------|-----|----------------------|
| iPhone User Guide — Record a video (iOS 26) | https://support.apple.com/guide/iphone/record-a-video-iph61f49e4bb/ios | Official how-to. **“On iPhone 17, iPhone 17 Pro, iPhone 17 Pro Max, and iPhone Air, you can record Dual Capture video.”** Steps: Camera → Video → Dual Capture → Record |
| Same guide, iOS 26 path | https://support.apple.com/guide/iphone/record-a-video-iph61f49e4bb/26/ios/26 | Version-pinned twin of the above |
| iPhone 17 tech specs | https://support.apple.com/en-us/125089 | **“Dual Capture up to 4K Dolby Vision at 30 fps”** under Video Recording |
| iPhone 17 Pro tech specs | https://support.apple.com/en-us/125090 | Same Dual Capture 4K Dolby Vision 30 line |
| iPhone 17 Pro / Pro Max specs (marketing) | https://www.apple.com/iphone-17-pro/specs/ | Dual Capture listed on Fusion + Center Stage camera sections |
| iPhone Air newsroom | https://www.apple.com/newsroom/2025/09/introducing-iphone-air-a-powerful-new-iphone-with-a-breakthrough-design/ | Dual Capture named with Center Stage: record front and rear simultaneously; concert / game-reaction framing |

Apple’s how-to does **not** claim split-screen, feed swap, or two files. Those absences are confirmed by secondary hands-on (§4), not invented.

---

## 3. App Store and vendor pages (competitors)

US storefront preferred. IDs are taken from live App Store URLs, not guessed.

| Product | App Store | Vendor / notes |
|---------|-----------|----------------|
| **DoubleTake - Multicam video** | https://apps.apple.com/us/app/doubletake-multicam-video/id1478041592 | Listing states multi-cam restricted to XS / XR / SE 2 / 11–13 series (copy lags newer phones) + iPad Pro 2018+; others install but **single camera**. PiP, discrete files, 50/50 split, lens picker. Product page: https://www.filmicpro.com/products/doubletake/ (states 1080p as practical MultiCam API max — treat as vendor claim, verify on spike) |
| **RØDE Capture** | https://apps.apple.com/us/app/r%C3%B8de-capture/id1588683096 | Free. Dual camera: split, PiP, **combined or separate files**; 16:9 / 4:3 / 1:1; HD / FHD / 4K *as listed*; 24 / 30 / 60. Vendor: https://rode.com/en-us/apps/rode-capture |
| **MoviePro - Pro Video Camera** | https://apps.apple.com/us/app/moviepro-pro-video-camera/id547101144 | Paid pro camera. Vendor: https://www.moviepro.app/ — Auto / Pro / **Dual Capture** scene; PiP, split, or live cut on supported devices |
| **FiLMiC Pro** | https://apps.apple.com/us/app/filmic-pro-video-camera/id436577167 | Cinema logger. **Not** the dual-file utility. WWDC 2019 on-stage partner for the API reveal (see 9to5Mac in §4) |
| **Blackmagic Camera** | https://apps.apple.com/us/app/blackmagic-camera/id6449580241 | Free cinema app. **Multi-phone** remote multicam, not front+rear on one iPhone. Tech: https://www.blackmagicdesign.com/products/blackmagiccamera/techspecs |

### Competitor capability matrix (sourced, not hoped)

| | Stock Dual Capture | DoubleTake | RØDE Capture | MoviePro Dual | FiLMiC Pro | Blackmagic Camera | **Dual Capture+ (promised)** |
|--|--------------------|------------|--------------|---------------|------------|-------------------|------------------------------|
| Price | Free | Free + IAP (listing) | Free | Paid Pro | Paid | Free | **$9 preorder / $14.99 street** |
| 17 / Air / Pro only | **Yes** | No (A12-class) | No (iOS 16+ listing) | Supported devices | N/A (single-cam) | N/A | **No — A12+ MultiCam** |
| Split-screen | **No** (secondary) | Yes | Yes | Yes | — | — | Yes |
| Swap / move PiP | Limited move (secondary) | Yes | Yes | Yes | — | — | Yes |
| Two files | **No** (secondary) | Yes (discrete) | Yes (separate) | Check listing | — | — | **Yes, default** |
| Rear+rear simultaneous | Live **switch** on 17 Pro, not two rear files | Yes where sets allow | Front+rear focused | Check device | — | Multi-**phone** | Yes where `supportedMultiCamDeviceSets` allows |
| Cinema suite | No | Thin | Mic DSP | Deep | Deep | Deep | **No** |

Empty cells: do not advertise a fact we did not read on the linked page.

---

## 4. Secondary — stock Dual Capture limitations (press)

Use these to justify lander bullets Apple’s guide leaves implicit. If Apple later ships split or two files, **this section expires** — re-read the User Guide before the next lander edit.

| Piece | URL | Claim we rely on |
|-------|-----|------------------|
| 9to5Mac — Dual Capture on all iPhone 17 models | https://9to5mac.com/2025/09/10/iphone-17-video-dual-cam-recording/ | Stock mode is a **single** composed video, rear + front PiP. **Not indicated** for older iPhones on iOS 26 despite 2019 hardware. API existed; third parties shipped first; FiLMiC was the 2019 demo |
| MacRumors how-to | https://www.macrumors.com/how-to/iphone-17-dual-capture-video/ | 1080p or 4K at 24/30. Locked PiP layout. **One file**. 17 Pro can switch rear lenses **during** the take |
| Tom’s Guide hands-on | https://www.tomsguide.com/phones/iphones/i-tried-out-iphone-17-dual-capture-heres-what-it-can-and-cant-do | No feed swap, no split (contrasts Samsung Dual Rec). One file. Inset can be moved; motion is baked |

---

## 5. Do not cite as proof

| Avoid | Why |
|-------|-----|
| Random GitHub copies of AVMultiCamPiP | Drift from Apple’s sample |
| Android Dual Rec reviews as iOS specs | Different stack |
| “Every iPhone since 2019 has Dual Capture in Camera” | False — stock button is 17 / Air / Pro |
| Invented `apps.apple.com` IDs | Review will notice; this table used live IDs: `1478041592`, `1588683096`, `547101144`, `436577167`, `6449580241` |
| Traffic or download counts | Hard rule: do not invent traction |

---

## 6. Re-verify checklist (before a second lander)

1. Open the iPhone User Guide Dual Capture paragraph — device list still 17 / Air / Pro?
2. Open iPhone 17 specs — still “4K Dolby Vision at 30 fps” for Dual Capture?
3. Open AVMultiCamPiP — A12 / A12X line still present?
4. Open DoubleTake + RØDE listings — still shipping split / separate files?
5. If Apple added two files or split to stock Camera, **rewrite the wedge** or kill the track.
