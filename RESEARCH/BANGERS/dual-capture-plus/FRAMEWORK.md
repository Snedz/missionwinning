# Dual Capture+ — framework

**Track:** BANGERS 01  
**Product working name:** Dual Capture+  
**Surface:** iOS App Store camera app (not started). This repo holds paper only.  
**Governing sell rule:** [SELL_FIRST.md](SELL_FIRST.md) — kill if **&lt;5 cold pays in 14 days** after the lander has a working checkout.  
**Hardware law:** `AVCaptureMultiCamSession` on **A12 or later** iPhone (or A12X+ iPad Pro). Runtime check, never a marketing guess.

This file is the constitution for the track. Pricing and the kill clock live in `SELL_FIRST.md`. Build scope after PASS lives in `BUILD_LATER.md`. Sources are cited, not restated as folklore, in [SOURCES.md](SOURCES.md).

---

## 1. One sentence

**Dual Capture+ is the Dual Capture people assume Apple shipped:** two cameras at once, on the phones they already own, with layouts and **two files** the stock Camera app on iPhone 17 / Air / Pro refuses to give.

It is not Apple’s free Dual Capture with a plus badge. It is not Mission Winning. It is not a cinema suite.

---

## 2. Why this exists (the 2019–2026 gap)

Apple showed simultaneous front+rear recording on stage in 2019 (iPhone 11 Pro era) and left it as an **App Store API** (`AVCaptureMultiCamSession`, iOS 13). Third-party apps shipped it. Android OEMs put a dual-rec button in the stock camera. Apple’s own Camera app did not.

In September 2025 Apple finally put **Dual Capture** in stock Camera — and then **device-locked** it to the new chassis:

| Official Apple wording | Implication |
|------------------------|-------------|
| Support guide: Dual Capture is on **iPhone 17, iPhone 17 Pro, iPhone 17 Pro Max, and iPhone Air** | A 16 Pro on iOS 26 does not get the button |
| Specs: **Dual Capture up to 4K Dolby Vision at 30 fps** | Quality ceiling of the *stock* mode, not a promise to third-party MultiCam |
| How-to + hands-on press: **one composed file**, **rear-primary PiP**, **no split**, **no feed swap** | The category name is now mainstream; the implementation is a postcard |

That is the opening. Apple paid for the words “Dual Capture.” The stock feature is a subset of what `AVCaptureMultiCamSession` has allowed on **A12+** hardware since 2019. Dual Capture+ sells the rest of that subset, named in Apple’s vocabulary, to two buyers:

1. **Everyone not on a 17 / Air / Pro** who saw the keynote and opened Camera on a 13 / 14 / 15 / 16.
2. **17 / Air / Pro owners** who want two files, split-screen, swap, or rear+rear — things the stock mode does not do.

If those people will not pay, the track dies. Free incumbents already exist ([§5](#5-honest-field-not-a-greenfield)).

---

## 3. Differentiation from free Apple Dual Capture

Apple Dual Capture is **in-box, free, excellent at one job**: reaction PiP on a brand-new phone, saved as one movie.

Dual Capture+ is **not** “the same button with a watermark.” The table is the product.

| Capability | Apple Dual Capture (stock Camera) | Dual Capture+ (this track) |
|------------|-----------------------------------|----------------------------|
| Price | Free | Paid preorder → paid App Store ([SELL_FIRST.md](SELL_FIRST.md)) |
| Devices | iPhone 17, 17 Pro, 17 Pro Max, iPhone Air **only** | Any device where `AVCaptureMultiCamSession.isMultiCamSupported` is true — **A12+ iPhone / A12X+ iPad Pro**, fail closed otherwise |
| Cameras | Front + rear, composed | Front+rear **and** any pair in `supportedMultiCamDeviceSets` (rear+rear where the set allows) |
| Layout | Fixed picture-in-picture; rear fills; front is the inset | PiP (move / resize / swap), 50/50 split, stacked vertical (Reels), live cut into one file |
| Files | **One** flattened movie | **Discrete A/B files** (default for editors) **plus** optional composite |
| Rear lens while recording | 17 Pro / Pro Max can **switch** which rear lens is live | Two rear lenses **at once** when the device set allows — different job than a live switch |
| Resolution | Up to **4K Dolby Vision 30** in stock | Third-party MultiCam is historically format-capped; spike measures real `format.isMultiCamSupported` dims (often 1080p class on older SoCs). **Do not advertise 4K dual** until the spike writes the number down |
| Audio | System Camera path | One shared mic + explicit “RØDE exists for DSP” — we do not fake a wireless-mic console |
| Affiliation | Apple | **Not affiliated with Apple.** Name is descriptive of the category Apple just taught, plus a plus |

### What we never claim

- That Apple “cannot” do two files. They chose not to in v1. They can ship it next September.
- That MultiCam on an XS is 4K HDR. WWDC 2019 published MultiCam formats up to 1920×1440 @ 30 as the high end of that generation; FiLMiC’s DoubleTake marketing still says 1080p is the practical API ceiling. Treat 4K dual as **stock-Camera-on-17**, not as our floor.
- That this is a new Apple API. The API is seven years old. The *demand spike* is new.

### The one-line vs-Apple for the lander

> Apple Dual Capture works on iPhone 17, Air, and 17 Pro — one layout, one file. Dual Capture+ is Dual Capture on A12 and later: split, swap, and two files you can edit.

---

## 4. Technical law (do not renegotiate in copy)

The implementation path after a sell PASS is Apple’s own sample, not a from-memory session graph.

| Law | Source | Rule for this track |
|-----|--------|---------------------|
| Session class | `AVCaptureMultiCamSession` | Never a pair of `AVCaptureSession`s. Apple does not support multiple multi-cam sessions / multi-app multi-cam on iOS |
| Device gate | `AVCaptureMultiCamSession.isMultiCamSupported` | Install may be wide; **record** is fail-closed. UI says “this iPhone cannot run two cameras at once” and does not pretend |
| Device pairs | `AVCaptureDevice.DiscoverySession.supportedMultiCamDeviceSets` | A/B picker only offers sets the session returns. No “ultra-wide + tele on every phone” merchandising |
| Formats | `AVCaptureDevice.Format.isMultiCamSupported` | `activeFormat` must be a MultiCam format. Preset on a multi-cam session is always `inputPriority` |
| Wiring | `addInputWithNoConnections` / `addOutputWithNoConnections` + explicit `AVCaptureConnection` | Implicit connections cross streams. Copy the AVMultiCamPiP topology |
| Cost | `hardwareCost` ≤ 1.0 to *start*; `systemPressureCost` &lt; 1.0 to run indefinitely | Over 1.0 hardware = configuration does not run. Pressure 1.0–2.0 ≈ ~15 min then thermal interrupt. Drop fps / dims / disable a port — do not cook the phone |
| Sample | **AVMultiCamPiP** — *Capturing from Multiple Cameras* | Associated with WWDC19 **225**; session **249** is the multi-cam lecture. Spike forks the sample, does not rewrite AVFoundation from a blog |
| Minimum silicon | Apple sample: **iPhone A12+** or **iPad Pro A12X+** | Matches XS / XR / 2018 iPad Pro era. Same floor DoubleTake prints on the App Store |
| Composite vs discrete | Apple Media Engineer on Forums: `AVCaptureMovieFileOutput` is **one video source**. Composite = 2× `AVCaptureVideoDataOutput` + one `AVAssetWriter`. Discrete = two file outputs (or two writers), then optional offline compose | Plus means **both** paths. Stock Apple Dual Capture is the composite path only |

A12 floor (shipping names, not a promise that every unit enables every pair):

- iPhone XS, XS Max, XR
- iPhone 11 family and every iPhone after
- iPhone SE (2nd generation) and later SE
- iPad Pro 2018 (A12X) and later Pro / Air / mini that report `isMultiCamSupported`

**Runtime wins over this list.** A future SKU that ships without MultiCam is a no, even if marketing says “Pro.”

---

## 5. Honest field (not a greenfield)

Apple Dual Capture is the **category teacher**. It is not the only incumbent. Sell-first exists because **RØDE Capture is free** and already does split + PiP + combined/separate files, and **DoubleTake** already does discrete / PiP / split on the same A12-class hardware.

| Incumbent | Role vs us | Why a buyer might still pay |
|-----------|------------|-----------------------------|
| Apple Camera Dual Capture | Category + 17-only postcard | Older phone, or two files / split / swap |
| DoubleTake (App Store `id1478041592`) | Closest clone of the *capability* set | We sell Apple’s **name** + reaction/vertical UX, not a filmmaker camera picker. If that is not enough, kill |
| RØDE Capture (App Store `id1588683096`) | Free dual-cam + RØDE mic DSP | We do not win on Wireless ME. We win only if “Dual Capture” search + two-file default + older-phone anger converts |
| MoviePro (App Store `id547101144`) | Paid pro camera with a Dual Capture *scene* | Different buyer (manual cinema). Do not out-scope them |
| FiLMiC Pro (App Store `id436577167`) | Cinema logger; WWDC 2019 demo partner | Not the dual-file reaction app. Leave it alone |
| Blackmagic Camera (App Store `id6449580241`) | Single-phone cinema + **multi-phone** remote multicam | Explicitly **not** front+rear on one phone. Different word “multicam” |

Full rows + links: [SOURCES.md](SOURCES.md) §3. If the lander cannot say in one screen why we are not “RØDE but $9,” do not ship the lander.

---

## 6. Buyer, job, anti-job

**Buyer:** a person who records talking-head + world (concert, gym form, recipe, interview, vlog) and already thinks in Reels / Shorts / TikTok / YouTube edits.

**Job:** start recording in under five seconds, see both cameras, leave with files an editor (CapCut, iMovie, Final Cut) can use.

**Anti-job:**

- Log-gamma / false color / anamorphic desqueeze (FiLMiC / Blackmagic / MoviePro Pro)
- RØDE gain / DSP (RØDE Capture)
- Multi-*phone* genlock (Blackmagic)
- Mission Winning set logging, Coach, Fuel

**ICP for the 14-day clock (not personas to workshop):**

1. iPhone 13–16 owner who searched “Dual Capture” after the 17 keynote.
2. Creator who already uses DoubleTake or RØDE and is angry about one missing default (two files on, vertical split on, no cinema chrome).
3. 17-series owner who tried stock Dual Capture once and wanted the inset to be the *main* shot, or wanted the front file separately.

---

## 7. Relationship to Mission Winning

| | Mission Winning | Dual Capture+ |
|--|-----------------|---------------|
| Repo | This monorepo’s `app/` + `src/` + `apps/android/` | `RESEARCH/BANGERS/dual-capture-plus/` paper only |
| Horizon | Horizon 0 / Alpha 0.1.0 — [CONTEXT.md](../../../CONTEXT.md) `## Now` | Side track. Does not unlock iOS for MW |
| Money | Super Bundle mute-pay until EIN | Separate preorder SKU, founder-owned checkout |
| Brand | Train + Mission Coach | Camera utility. Do not put Kalligator or Mission Score on the lander |
| iOS | [docs/IOS_PLAYBOOK.md](../../../docs/IOS_PLAYBOOK.md) deferred | If this track ever ships, it is a **different App Store listing** |

Agents do not “quickly add a camera page to `/active`.” That would be a new pillar-shaped object and a privacy surface this product has not opened.

---

## 8. Decision rules

1. If a sentence could also describe stock Dual Capture on a 17, delete it from the lander.
2. If a sentence requires 4K dual, ProRes dual, or three cameras at once, it is post-spike or never.
3. If the 14-day clock is running and someone asks for a binary, the answer is the kill bar, not Xcode.
4. If PASS, the next object is [SPIKE_PLAN.md](SPIKE_PLAN.md) (≤1 day), not a design system.
5. If KILL, refund preorders per `SELL_FIRST.md`, leave this folder as the autopsy, do not “pivot the binary.”

---

## 9. Status block (only place in this folder)

| Fact | State |
|------|--------|
| Paper pack | **This PR** |
| Lander live | Founder — paste [LANDER_DRAFT.md](LANDER_DRAFT.md), replace `PAYMENT_URL` |
| Checkout | `PAYMENT_URL` placeholder. Not invented |
| Cold-pay count | 0 — do not invent |
| Clock | Not started (starts when lander **and** working checkout are public) |
| Spike | Blocked on PASS |
| App binary in this repo | **Forbidden** |
