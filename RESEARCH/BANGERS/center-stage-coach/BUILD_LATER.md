# center-stage-coach — build later

**Gate:** [SELL_FIRST.md](SELL_FIRST.md) result = **PASS** (5 cold pays / 14 days) or a written founder override.

Until then: no AVFoundation app, nothing under `src/lib/coach/`.

---

## Forbidden now

- AVFoundation / Camera app in this repo  
- Any import of `src/lib/coach/` or Mission Coach copy  
- A paid title containing “Coach”  
- Starting the MW iOS lane “because Center Stage needs it”  
- Invented checkout URL  
- Claiming 17 Pro Max support until Apple names it on 111102 (UNKNOWN 2026-09-19)

---

## If the bar passes — smallest after-PASS

1. Tiny SwiftUI camera preview + overlay. Separate bundle id.  
2. Query `format.isCenterStageSupported` / `isCenterStageActive`. **Fail closed** on unsupported devices.  
3. Marks: chin line, headroom, rotate. No workout logging.  
4. No account. Photos write optional, off by default.  
5. IAP after App Store Connect exists. Price matches the lander ($8 HYPOTHESIS).  
6. App Store name: **not** Coach, **not** Mission Coach. Counsel on “Center Stage” (Apple feature name).

Out of v1: Mac Continuity Camera, Android, MW host.

---

## Later (not v1)

Video-call cooperative mode (WWDC26 341) only if buyers asked in writing.
