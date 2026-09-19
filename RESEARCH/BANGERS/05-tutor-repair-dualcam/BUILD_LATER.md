# 05 — BUILD_LATER

**Gate:** `01-dual-capture-plus` has a FRAMEWORK plus a capture module that can start/stop a multicam session and emit synced buffers. If 01 is only a sibling PR not merged, **do not** start 05 code. Paper is allowed.

## Phase A — after 01 exists **and** sell/override

1. Import 01’s session factory. Do not fork the graph.
2. UI: two previews, one record button, one “swap which stream is large.”
3. Write a single movie or a sidecar pair with a shared timeline (01 decides the container).
4. In-app coach overlay: **text cues only** (arrow on the bench stream). No LLM required for v1.

## Phase B

- Live streaming to a tutor (uses 01’s sync rules; do not invent a second clock)
- Still burst from the bench camera while face stays live (only if 01 lists that combo)

## Never

- A second `AVCaptureSession` started on the main thread (lab: dedicated serial queue)
- Claiming 24 MP + depth on both cameras because the system Camera app can
- Spatial Reframe on the recording (API locked — track 06)

## Proofs allowed now

A storyboard sketch in markdown (this file) and sell copy. No Xcode target named `TutorRepair` until the gate.
