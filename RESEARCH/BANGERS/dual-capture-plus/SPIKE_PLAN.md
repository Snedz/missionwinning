# Dual Capture+ — spike plan (≤1 day, after sell PASS only)

**Illegal to start if [SELL_FIRST.md](SELL_FIRST.md) is not PASS.**  
**Illegal to commit the Xcode project to this monorepo.**  
Bound: **one working day** on a founder Mac + **one physical A12+ iPhone**. Simulator is not a MultiCam device.

Goal: prove or kill the technical thesis *before* a v1 app, using Apple’s sample, not a from-scratch session.

Canonical sample: [AVMultiCamPiP](https://developer.apple.com/documentation/AVFoundation/avmulticampip-capturing-from-multiple-cameras) — A12+ iPhone or A12X+ iPad Pro ([SOURCES.md](SOURCES.md) §1).

---

## 0. Setup (first hour)

| Step | Done when |
|------|-----------|
| 1. Download AVMultiCamPiP from Apple’s doc page (not a GitHub mirror) | Project opens in current Xcode |
| 2. Signing team = founder | Builds to a physical device |
| 3. Device A = oldest MultiCam phone on the desk (XS / XR / 11 / SE 2 preferred) | `AVCaptureMultiCamSession.isMultiCamSupported == true` |
| 4. Device B (if present) = a 15/16/17 | Same check |
| 5. Log `supportedMultiCamDeviceSets` and every format where `isMultiCamSupported` | A text table (dims, max fps, binned or not) |

If step 3 is false on a phone we merchandised as A12+: **stop**. The lander is wrong. Do not “try a different API.”

---

## 1. Accept bars (all required)

The spike **PASS**es only if every row is green on **Device A**. Device B is confirmation, not a substitute.

| ID | Bar | Fail looks like |
|----|-----|-----------------|
| S1 | **Front + rear preview** at the same time from `AVCaptureMultiCamSession` | One camera, or a second `AVCaptureSession` hack |
| S2 | **Record ≥60s** without `wasInterruptedNotification` at the highest format with `hardwareCost ≤ 1.0` and `systemPressureCost < 1.0` at t=0 | Thermal death, black frames, silent stop |
| S3 | **Discrete two files** — two movies in Photos/Files, same take, both playable, A/V not drifting off a clap | One file only, 0-byte, unsynced |
| S4 | **Composite one file** — PiP *or* 50/50, as previewed, via VideoDataOutputs + `AVAssetWriter` (AVMultiCamPiP path) | Preview ≠ file, or MovieFileOutput asked to take two videos |
| S5 | **Swap** which camera is full-frame (sample already double-taps) **and** a 50/50 split export of the same session | Cannot split without restarting into a different app |
| S6 | **Fail-closed** on a non-MultiCam path (iPad mini without support, or a forced false) | Crash or a frozen fake viewfinder |
| S7 | **Cost governor** — if you *raise* dims/fps until `hardwareCost > 1.0`, start is refused | Session that Apple said would not run |

S3 is the Plus. If S3 fails and S4 works, we have rebuilt Apple Dual Capture. That is a **spike FAIL** for this track (stock already ships that on 17s; we would only be back-porting PiP). Refund.

---

## 2. Hour-by-hour (do not stretch to a week)

| Block | Work |
|-------|------|
| 0–1h | Sample builds, S1 on Device A, dump device sets + formats |
| 1–3h | S4 already mostly in the sample. Measure cost. Lock a format that stays &lt; 1.0 |
| 3–5h | S3 — second writer or second file output. Clap test. Sync note |
| 5–6h | S5 split compositor (even ugly). S6 / S7 |
| 6–7h | Repeat S2 60s × 3. Note battery and thermal. If Device B exists, S1+S3 only |
| Last hour | Write the result table below. PASS → [BUILD_LATER.md](BUILD_LATER.md). FAIL → refund |

If S3 is not done by hour 5, **stop adding layouts**. Two files are the product.

---

## 3. Result table (fill after the day — facts only)

Copy into a later `SPIKE_RESULTS.md` if useful. No traction language.

```
Date:
Xcode / iOS:
Device A (model, SoC):
  isMultiCamSupported:
  device sets (count + example pairs):
  chosen format A (dims, fps, cost):
  chosen format B:
  hardwareCost at start:
  systemPressureCost at start:
  S1–S7 (pass/fail + one clause):
  max sustainable seconds at chosen format:
  discrete sync (clap offset, ms, if measured):
Device B (optional):
  …
Decision: SPIKE PASS / SPIKE FAIL
```

**Do not** write 4K into the lander from a 17 stock Camera take. Only from **this** session’s MultiCam formats.

---

## 4. Implementation notes (so the day is not spent on Slack)

- Use `addInputWithNoConnections` / `addOutputWithNoConnections` / `setSessionWithNoConnections` on preview layers. Implicit connections cross A and B ([WWDC 249](https://developer.apple.com/videos/play/wwdc2019/249/)).
- Iterate formats **reversed** (sample pattern): pick the next-lower MultiCam format when cost is too high.
- `AVCaptureMovieFileOutput` is one video source ([forums/651426](https://developer.apple.com/forums/thread/651426)). Discrete = two writers or two file outputs, not one MovieFileOutput with two connections.
- Audio: one input, duplicate onto both files for v0 if that keeps sync. Do not build a mixer.
- Backgrounding: stop and finalize. Do not fight iOS for background camera.
- Heat: film in a room you can feel. A 60s take in winter AC is not S2.

---

## 5. Spike FAIL / PASS outcomes

| Result | Meaning | Money |
|--------|---------|-------|
| **SPIKE PASS** | S1–S7 green on Device A | Keep preorders; start v1 off-repo |
| **SPIKE FAIL** | Any of S1–S7 red, or only S4 works | **Refund.** Track is technically a stock-PiP clone or a non-runner |
| **SPIKE HOLD** | No A12 device that day | Do not pretend. Borrow a phone or refund if the 90-day ship clock is at risk |

A FAIL does not unlock a “two-week rewrite.” The API either writes two files on A12 hardware in a day or this is not a BANGERS hit.

---

## 6. What the spike is not

- Not App Store assets
- Not SwiftUI polish
- Not a Mission Winning target
- Not Android CameraX
- Not 4K research unless Device A’s MultiCam format list actually contains it
- Not a reason to add `apps/ios/` here

---

## 7. Agent assistance (optional, after PASS)

An agent may: paste session-wiring checklists, read Apple docs, review a **gist** of cost numbers the founder pastes.

An agent may not: declare S3 green without the founder’s device log, invent a GitHub sample as official, or open a PR that adds Swift to `missionwinning`.
