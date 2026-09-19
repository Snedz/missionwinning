# center-stage-coach — framework

**Claim:** Creators on **Center Stage hardware** will pay for framing cues (in-frame / too close / rotate). Device-gated and easy to confuse with **Mission Coach**.

**Status:** paper. **Pays:** 0. **Checkout:** none.

**Paid title:** “Framing marks” (or similar). The folder slug is a working name. **Never title the offer Mission Coach. Never put “Coach” in a paid title.**

## Problem

Apple Center Stage keeps a person in frame. On iPhone 17 / Air it is a square wide front sensor; on iPad it is older. Developers can opt in (`isCenterStageSupported`, `AVCaptureDevice.isCenterStageEnabled`). Creators still guess **how** to stand.

## Buyer

| Field | Value |
|-------|--------|
| Who | Talking-head / class / meeting hosts on **supported** devices |
| Who is not | Anyone on unsupported hardware; MW athletes looking for weekly plans |
| Job | On-screen marks: chin line, headroom, “rotate the phone” |
| Willingness to pay | **UNKNOWN** vs FaceTime defaults |

## Wedge

On-screen **framing marks** (chin line, headroom, “rotate the phone”) — **not** weekly training plans. Never say Mission Coach.

## MW relationship

**Collision risk only.** Mission Coach is `src/lib/coach/` + `/coach` (AI weekly plan). This slug is device-gated camera overlays. Do not import `src/lib/coach/`. Do not put this on Today. If ever built: separate Xcode target, separate bundle id. iOS-before-Android-Accept-B is forbidden **for Mission Winning**; this slug would still be a separate app.

## 14-day test

See [SELL_FIRST.md](SELL_FIRST.md). Bar: **5 cold pays / 14 days**. Rank 9. Hardware lock kills TAM. Expect FAIL. Prefer skipping until Dual Capture+ / ClearShot resolve.

## Constraints (official device list)

Re-opened Apple Support **111102** on 2026-09-19 (page published 2026-05-12):

| Surface | Official list |
|---------|----------------|
| iPhone (front) | **iPhone 17, iPhone Air, iPhone 17 Pro** named under “Center Stage system requirements.” Intro copy says “iPhone 17 models and iPhone Air.” **iPhone 17 Pro Max is not named** in that list — treat as UNKNOWN until the page adds it. |
| iPad (front) | iPad Pro 11" (3rd gen)+ or 12.9" (5th gen)+; iPad Air (5th gen)+; iPad (9th gen)+; iPad mini (6th gen)+ |
| Mac | Continuity Camera (iPhone 11+, excl. SE); recent built-in Studio / 2024+ Mac cameras — **out of v1** |
| App must support the feature | WWDC26 session 341 / AVFoundation docs |

## Incumbents

| Product | Official | Kind | Money | Wedge vs us |
|---------|----------|------|-------|-------------|
| **Apple Center Stage** | https://support.apple.com/en-us/111102 | Stock Camera / FaceTime / Control Center | Free on supported hardware | Keeps you in frame. No chin-line / headroom marks. |
| **AVFoundation Center Stage** | https://developer.apple.com/documentation/avfoundation/supporting-center-stage-front-camera-in-your-ios-app | API (preliminary) | Free to adopt | Developers opt in. Not a creator overlay product. |
| **WWDC26 341** | https://developer.apple.com/videos/play/wwdc2026/341/ | Session | — | Zoom / rotate / video-call integration. |
| **Named paid “Center Stage framing” App Store app** | — | — | — | **UNKNOWN** this pass. Do not invent a competitor. |

Secondary implementation notes: https://www.theswift.dev/posts/add-center-stage-framing-to-an-ios-camera-app (beta-shaped names — not a product).

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hardware lock (17 / Air / listed iPads) | Kill / shrink TAM | Disclose. Fail closed on unsupported devices. |
| Name collision with Mission Coach | Process | Paid title: “Framing marks.” Never “Coach.” |
| Free FaceTime Center Stage | High | We sell **marks**, not auto-center (Apple already does that). |
| iOS before MW Android Accept B | Process | Separate app; still don’t start MW iOS for this. |
| Invented App Store comps | Honesty | None found. UNKNOWN. |

## Price hypothesis (not a fact)

$8 one-time. **HYPOTHESIS.** Do not print a Stripe URL.
