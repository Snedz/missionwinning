# Dual Capture+ — build later

**Do not execute this file until [SELL_FIRST.md](SELL_FIRST.md) is PASS.**  
If you are here to start coding, you are early. The legal next object after PASS is [SPIKE_PLAN.md](SPIKE_PLAN.md) (≤1 day), then this MVP.

This file is the **ceiling** for v1 so a PASS does not become a cinema camera.

---

## 1. When this file turns on

| Gate | State required |
|------|----------------|
| Cold pays | ≥5 in the 14-day window |
| Spike | [SPIKE_PLAN.md](SPIKE_PLAN.md) accept bars green (or written FAIL → refund / kill) |
| Repo | Still **no** `.ipa` in `missionwinning`. Separate Xcode dir on the founder Mac (or a later private repo the founder creates) |

---

## 2. v1 job (closed)

Open app → grant camera + mic → pick A/B from **legal MultiCam sets** → pick layout → record → Photos contains:

1. **File A** (camera A), **File B** (camera B) — default on  
2. **Composite** (optional toggle, default off for “editor” preset, on for “share now”)

Time-to-record target: **&lt;5 seconds** from cold launch on a second-run (permissions already granted). First-run may take the system permission sheets.

---

## 3. MVP scope (build)

| # | Object | Done when |
|---|--------|-----------|
| 1 | MultiCam session | `AVCaptureMultiCamSession` wired like AVMultiCamPiP: no implicit connections |
| 2 | Device gate | `isMultiCamSupported == false` → blocking screen, no fake viewfinder |
| 3 | Pair picker | Only `supportedMultiCamDeviceSets`. Front+rear highlighted. Rear+rear if the set exists |
| 4 | Layouts | PiP (drag + swap), 50/50 split, vertical stack (9:16) |
| 5 | Discrete writers | Two files, same start/stop, same audio policy (§5) |
| 6 | Composite writer | One file, layout as previewed (VideoDataOutputs + AVAssetWriter) |
| 7 | Cost governor | If `hardwareCost` > 1.0, refuse start and drop to a known-good format. If pressure rises, drop fps then dims, then stop cleanly |
| 8 | Orientation | Portrait-first. Landscape allowed. No “rotate to record” dead end |
| 9 | Photos save | `PHPhotoLibrary` with a Dual Capture+ album. User can refuse Photos and still get Files app export |
| 10 | Settings | Layout, discrete on/off, composite on/off, fps 24/30 (60 only if spike proved it), grid off |
| 11 | Paywall | If they prepaid, unlock via a founder-owned redeem (email / code). If they did not, $14.99 App Store IAP or paid listing — founder picks one, not both in v1 |
| 12 | Privacy nutrition | Camera and mic used for recording only. No cloud unless the user shares |

---

## 4. Explicit non-goals (v1)

| Temptation | Why it waits |
|------------|--------------|
| 4K dual / Dolby Vision dual | Stock Camera on 17 advertises this. Our spike writes the real MultiCam format list. Advertising 4K before that is a lie |
| ProRes / Log / false color / zebras | MoviePro / FiLMiC / Blackmagic job |
| Three or four cameras at once | Apple MultiCam sets are pairs. Do not merchandize a quad |
| RØDE / USB mic DSP console | RØDE Capture job. External mic as **system input** is enough |
| Multi-iPhone sync / genlock | Blackmagic job |
| In-app CapCut clone | Export two files |
| Android | Different camera2 / CameraX concurrent story. Not this track |
| MW Train overlay / form check | New privacy + horizon object. Forbidden |
| Account, chat, feed, streaks | Utility app |
| Subscription | [SELL_FIRST.md](SELL_FIRST.md) |

---

## 5. Audio policy (v1)

One mix, written onto **both** discrete files (identical track) **or** onto the composite only — spike picks whichever keeps A/V sync simpler. Do not ship “front mic vs rear mic” as a v1 headline; iPhone mics are not a boom pair.

If an external mic is the route input, use it. Do not build a mixer UI.

---

## 6. Architecture after PASS (sketch, not a repo layout)

```
AVCaptureMultiCamSession
  ├─ DeviceInput A  (no connections)
  ├─ DeviceInput B
  ├─ AudioInput     (no connections)
  ├─ VideoDataOutput A ──┐
  ├─ VideoDataOutput B ──┼─ compositor (PiP / split / stack) ─ AVAssetWriter (composite)
  ├─ AudioDataOutput ────┘
  ├─ (discrete) AssetWriter A
  └─ (discrete) AssetWriter B
Preview: two AVCaptureVideoPreviewLayer **or** one MTKView of the compositor
     (sample uses preview layers + PiP; match the sample first)
```

**Rules carried from FRAMEWORK**

- `addInputWithNoConnections` / `addOutputWithNoConnections`
- `activeFormat` only where `isMultiCamSupported`
- Watch `hardwareCost` / `systemPressureCost` / `systemPressureState`
- One session. Period

**App shape**

- SwiftUI shell, UIKit/AVFoundation session object on a dedicated queue
- Minimum iOS: **16** unless the spike needs 17 APIs (do not bump for fashion)
- No third-party analytics SDK in v1
- No this-monorepo import of `src/lib/`

---

## 7. App Store facts to face later (not blockers for paper)

- **Name:** “Dual Capture+” may lose a 4.3(a) / 2.3(b) fight with Apple’s feature name. Have a backup: **Two Cam**, **A/B Capture**, **Dual Files**. Rename does not change the sell thesis.
- **Guideline 2.5.9 / hardware:** disclosing A12+ / MultiCam-only is mandatory in the description (DoubleTake already does this).
- **Photos:** NSCameraUsageDescription / NSMicrophoneUsageDescription / NSPhotoLibraryAddUsageDescription in plain language.
- **Preorder vs IAP:** money taken off-App-Store for a digital unlock can collide with 3.1.1 if the app unlocks paid features. Founder + counsel: either **paid listing only** (delete external preorder unlock) or **external preorder = coupon that does not live in-app**. Do not invent a consumable IAP scheme in this pack.

---

## 8. Quality bar (v1 ship)

- 60-second front+rear discrete on an **A12 device** (XS or XR) without a thermal interrupt at 1080p30 or the highest format the spike locked
- Same take on a 15/16 and on a 17 (17 must still beat stock Dual Capture on *files/layout*, not on 4K HDR)
- Backgrounding mid-record: stop clean, keep files
- Low storage: fail before toasting a 0-byte movie
- Accessibility: Record is a 44pt+ control, VoiceOver names both cameras

---

## 9. What “later than v1” means

Only if v1 is on the store **and** the founder still wants the track:

- 60 fps dual where cost &lt; 1.0
- Rear+rear templates (wide + tele “punch-in”)
- Live A/B cut (switch which camera is full-frame without stopping)
- LUT on composite only

None of these reopen a killed sell clock.
