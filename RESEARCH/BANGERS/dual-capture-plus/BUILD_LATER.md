# dual-capture-plus — build later

**Gate:** [SELL_FIRST.md](SELL_FIRST.md) result = **PASS** (5 cold pays / 14 days) or a written founder override.

Until then, no Xcode project, no TestFlight, no `AVCaptureMultiCamSession` sample in this repo.

---

## Forbidden now

- New iOS app target in `apps/`  
- Starting the MW iOS lane “because Dual Capture needs it”  
- Camera code in the Next.js PWA  
- Promising 4K / ProRes / four-camera capture  
- Using Apple’s “Dual Capture” as the **shipped** App Store name without counsel  
- Bundling RØDE or FiLMiC trademarks

---

## If the bar passes — smallest binary

1. **One** SwiftUI app, separate bundle id (not `com.missionwinning.app`).  
2. MultiCam: front built-in wide + rear wide (query `supportedMultiCamDeviceSets`; do not hard-code).  
3. Layouts: PiP, 50/50, swap. Persist last layout.  
4. Export: combined movie **or** two files with matching start/end (stems).  
5. Device floor: fail closed if `AVCaptureMultiCamSession` is unavailable — show “this iPhone cannot run two cameras.”  
6. No account. No cloud. Photos library write only.  
7. IAP: one non-consumable **after** App Store Connect exists. Price matches the lander ($12 HYPOTHESIS).

Out of v1: cinema sliders, LUT, multi-cam more than two streams, Android.

---

## Technical notes (for the future implementer)

- WWDC19 session 249: MultiCam is combination-limited; two **physical** cameras at a time on XS-class hardware.  
- Virtual “Dual Camera” (wide+tele as one device) is **not** the same as Dual Capture. Do not confuse them in UI copy.  
- FiLMiC documents 1080p as the MultiCam encode ceiling — **re-test on the current iOS** before the lander promises resolution.  
- Thermal: stop recording cleanly; do not corrupt the second stem.  
- Privacy Nutrition Label: camera + photos. No tracking.

---

## Later (not v1)

Tutor/repair preset pack — only if [tutor-repair-dualcam](../tutor-repair-dualcam/) also passes its own bar, or this slug’s buyers asked for those presets in writing.

MW mini: **no.** Camera is not `utility.clearshot` and not Train.
