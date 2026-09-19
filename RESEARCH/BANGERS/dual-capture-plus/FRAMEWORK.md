# dual-capture-plus — framework

**Claim:** Creators on iPhone XS–16 will pay a small one-time fee for front+rear video with **layouts Apple does not ship** and **separate stems**, because stock Dual Capture is free only on iPhone 17 / Air and writes **one baked file**.

**Status:** paper. **Pays:** 0 (none collected). **Checkout URL:** none.

---

## Problem

Apple shipped **Dual Capture** in the stock Camera app: front + rear at once, picture-in-picture, one file. It is useful for reaction, tutorial, and “me + the thing” video.

It is also **narrow**:

| Constraint | Source |
|------------|--------|
| Hardware: iPhone 17, 17 Pro, 17 Pro Max, iPhone Air | Apple Support — [Record a video](https://support.apple.com/guide/iphone/record-a-video-iph61f49e4bb/ios) |
| One layout: rear-primary, selfie in a small window; no split, no swap | Tom’s Guide hands-on; MacRumors how-to (see `SOURCES.md`) |
| One file — not two ISO stems | Same reviews |
| 1080p or 4K at 24 / 30 fps | MacRumors |

The **MultiCam API** (`AVCaptureMultiCamSession`) has existed since **iOS 13 / WWDC19** on **A12+** (iPhone XS / XR and newer). Apple demoed third-party multi-cam on stage in 2019 and left it to the App Store for six years. Stock Dual Capture in 2025–26 did **not** extend that API to older phones.

So the gap is not “dual cam is new.” The gap is: **stock Camera finally does a basic PiP — only on the newest phones — and still will not write stems or split.**

---

## Buyer

| Field | Value |
|-------|--------|
| Who | Solo creators, tutors, repair techs, vloggers on **iPhone XR / XS through iPhone 16** who want dual-cam this week |
| Who is not | iPhone 17 owners who only need Apple’s PiP; cinema shooters who already live in FiLMiC Pro |
| Job | Record face + bench / product / student in one take |
| Willingness to pay | **UNKNOWN.** Category has **free** incumbents (below). Paid only if the offer is not “PiP again.” |

---

## Wedge (must be all three, or kill)

1. **Older devices.** A12 Bionic and newer — the MultiCam floor — not iPhone 17-only.
2. **Layouts Apple does not ship.** Split 50/50, swap which camera is hero, tutor (face-small / bench-large), repair (overhead + face), 9:16 / 1:1 / 16:9.
3. **Stems.** Two synced files (front ISO + rear ISO) plus an optional baked composite. Stock Dual Capture does not do this.

If a sentence of lander copy could also describe Apple Dual Capture or free DoubleTake, delete it.

---

## Incumbents (honest)

| Product | Price (as listed) | Devices | Layouts | Stems | Notes |
|---------|-------------------|---------|---------|-------|-------|
| **Apple Dual Capture** | Free (stock Camera) | iPhone 17 family + Air | One PiP, rear-hero | No | iOS 26+. Not on XS–16. |
| **DoubleTake** (FiLMiC) | Free on App Store | XS / XR / 11+ (A12+). Listing historically names XS–13-era devices; **confirm current list** | PiP (moveable), 50/50 split, discrete | Yes — discrete mode = two 1080p files | FiLMiC site: 1080p cap attributed to Apple MultiCam API. Auto exposure / WB / focus. |
| **RØDE Capture** | Free | iOS 16+; dual-cam needs capable A12+ hardware (some iPads excluded) | Split + PiP; combined or separate files | Yes | Differentiator is **RØDE mic control**, not layouts. |
| **MultiCam+** | Free + IAP (**UNKNOWN** current IAP mix; listing shows in-app purchases) | A12+ / iOS 14+ | Dual output, PiP, side-by-side, split, diagonal | Dual output listed | Closest paid-feature cousin. |
| **DuoCam** | Free + IAP (listing shows DuoCam Pro at $0.99 and $9.99 — **verify live**) | XS / XR and newer on listing | PiP move/resize, flip while recording | **UNKNOWN** | Social/Stories positioning. |

**Implication:** “Dual cam on old iPhones” is **already free**. Dual Capture+ cannot win as a MultiCam wrapper. It wins only as **opinionated layouts + stems + a vertical** (see [tutor-repair-dualcam](../tutor-repair-dualcam/)), sold before the binary exists.

---

## 14-day test

See [SELL_FIRST.md](SELL_FIRST.md). Bar: **5 cold pays / 14 days**. Expect **FAIL** if the ask is “Dual Capture for iPhone 12.” Expect a chance only if the ask is “tutor/repair stems + layouts Apple will not ship.”

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Free DoubleTake / RØDE | Kill | Offer must name a layout or stem workflow those apps make you hunt for. |
| Apple extends Dual Capture to older phones | Kill / shrink | Possible any iOS. Do not bet the company. 14-day cash test only. |
| MultiCam 1080p ceiling | Product | FiLMiC documents 1080p as an API cap. Do not promise 4K dual-cam unless you re-measure on current iOS. |
| Thermal / battery on A12 | Support | Disclose. Older phones may drop a camera. |
| Trademark “Dual Capture” | Legal | Apple’s feature name. Working title only. Final App Store name **UNKNOWN** / counsel. |
| MW confusion | Process | Not Train. Not `/active`. Not Mission Coach. |

---

## MW relationship

None in code. Camera experiment. Do not add AVFoundation to the PWA. Do not start iOS before Android Accept B **for Mission Winning**. This slug, if ever built, is a **separate** Xcode target and bundle id.

---

## Price hypothesis (not a fact)

**HYPOTHESIS:** $9–19 one-time IAP or preorder. Subscription is the wrong shape for a camera utility this small. Do not print a Stripe URL.

---

## Overnight notes (GLM 5.3)

Checked **2026-09-19**. Does not replace the incumbent table above.

- **DoubleTake** (FiLMiC / Bending Spoons) and **RØDE Capture** are still **free** to download. Dual cam on A12+ is already free. This slug is layouts + stems + a vertical — or it dies. See [GLM53.md](GLM53.md).
- **4K dual-cam** (third-party MultiCam) stays **UNKNOWN** until measured on current iOS. Apple’s “Dual Capture up to 4K Dolby Vision at 30 fps” is **stock Camera on 17 / Air**, not a promise we can print.
- **No payment URL.** Checkout none. Pays 0. Do not invent Stripe / Gumroad / App Store product links.
