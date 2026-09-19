# tutor-repair-dualcam — framework

**Claim:** Tutors and phone-repair benches will pay for **one preset** (face + work surface) even when generic dual-cam apps are free — if we can DM 20 shops and five of them pay.

**Status:** paper. **Pays:** 0. **Checkout:** none.

Sibling of [dual-capture-plus](../dual-capture-plus/). This is the **vertical**, not the generic MultiCam wrapper.

## Problem

A tutor needs “my face + the page.” A repair tech needs “my face + the board.” Apple Dual Capture (iPhone 17) is one rear-hero PiP. Free DoubleTake / RØDE can do split/stems but are **generic**. The job is **setup time**: one button, 9:16, face-small, bench-large, stems for the edit.

## Buyer

| Field | Value |
|-------|--------|
| Who | YouTube / TikTok tutors; independent repair counters who already film |
| Who is not | Cinema shooters; iPhone 17 owners who only need Apple’s one PiP |
| Job | One take: face + work surface, then two files for the edit |
| Count of willing payers | **UNKNOWN.** |

## Wedge

Presets + copy, not a new camera engine. If dual-capture-plus dies, this dies with it unless a shop pays for a **Shortcuts + existing free app** playbook (no binary).

Do not start a second Xcode target. Do not run this 14-day ask the same week as Dual Capture+.

## MW relationship

None in code. Camera vertical. **Not Train. Not `/active`. Never Mission Coach.** Do not add AVFoundation to the PWA. If ever built, it is presets *inside* Dual Capture+ (or a config file), not a MW mini.

## 14-day test

See [SELL_FIRST.md](SELL_FIRST.md). Bar: **5 cold pays / 14 days**. Prefer **20 DMs** over a viral post. Rank 5. **Do not** start this clock while Dual Capture+ is asking the same people.

## Incumbents (do not duplicate the camera table)

**Camera incumbents** (Apple Dual Capture, FiLMiC DoubleTake, RØDE Capture, MultiCam+, DuoCam) live in [dual-capture-plus/SOURCES.md](../dual-capture-plus/SOURCES.md) and the incumbent table in [dual-capture-plus/FRAMEWORK.md](../dual-capture-plus/FRAMEWORK.md). Read those. Do not copy the rows here.

This slug only adds **vertical-specific** notes:

| Angle | Official / first-party | Note |
|-------|------------------------|------|
| Stock Dual Capture device lock | https://support.apple.com/guide/iphone/record-a-video-iph61f49e4bb/ios | iPhone 17 family + Air. One PiP. One file. |
| FiLMiC already names the vertical | https://www.filmicpro.com/products/doubletake/ | Discrete mode copy includes instructor / student use. They know this job. **Free.** |
| RØDE stems | https://rode.com/en-int/user-guides/rode-capture | Split + separate files. Generic, mic-first. |
| This offer | (none — paper) | Preset pack + DM script. $15 HYPOTHESIS. |

Implication: the camera layer is **already free**. We sell **one-button tutor/repair framing**, or we fail.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Free DoubleTake / RØDE | Kill | Offer must be the preset + stems-first export, not “dual cam.” |
| Same-week ask as Dual Capture+ | Process | One clock. Link; don’t double-DM. |
| Narrow ICP | Product | Helps DMs, not App Store ASO. |
| Second Xcode app | Waste | Forbidden. Presets inside 01, or Shortcuts playbook. |
| Mission Coach name | Process | Never. This is not weekly training plans. |

## Price hypothesis (not a fact)

$15 one-time preset pack. **HYPOTHESIS.** Do not print a Stripe URL.
