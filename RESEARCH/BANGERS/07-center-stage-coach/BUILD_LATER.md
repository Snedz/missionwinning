# 07 — BUILD_LATER

Gate: sell/override. Paper device table can grow now **only** from cited docs, not from invented benches.

## Phase A

1. Discover front `.builtInUltraWideCamera` when present; else fail closed with “no Center Stage camera.”
2. Set Center Stage control mode + `isCenterStageEnabled` when the API allows.
3. Preview via `AVCaptureVideoPreviewLayer` (lab: do not use video data output just to draw preview).
4. Record + on-screen cue card (local text file). Session work on a **serial queue**, not main.

## Phase B

- `dynamicAspectRatio` for 9:16 vs 16:9 without tearing down the session (iOS 26+ property)
- Low-latency stabilization off by default (call apps; we are a recorder)

## Never

- Home-grown face crop as a Center Stage substitute
- Dual-cam (05 / 01)
- Calling Spatial Reframe

## Proofs allowed now

Markdown device **claims from docs only**. No Xcode target until the gate.
