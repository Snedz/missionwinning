# 05 — tutor-repair-dualcam

**Status:** unpublished-draft · paper only  
**Depends on:** track **01 `dual-capture-plus`**. Say it in every file. This track does **not** own the multicam graph.

## What it is

A **product skin** on dual capture: one take that keeps the **learner’s face** (front) and the **bench / appliance / circuit / hands** (back) time-aligned so a remote tutor can say “turn the screw you are holding,” not “hold the phone up.”

If `01-dual-capture-plus/FRAMEWORK.md` is missing on this branch, treat the capture graph as **UNKNOWN**. Do not invent session presets here.

## Why the dependency is hard

WWDC26 Camera lab: multicam is supported through the public multicam APIs, but combinations are **device- and format-limited**, thermally expensive, and must keep coherent timestamps. The system Camera app’s dual look is not a single third-party switch. Track 01 is the place that queries formats and fails closed. Track 05 only **consumes** a working pair of sample buffers + a sync story.

## ICP

Trade-school instructors, appliance-brand field trainers, and bike-shop leads who already run video calls and lose the work the moment the learner flips the camera. They will pay for **one recording mode**, not a Zoom competitor.

Not: Mission Winning Coach. Not a telehealth device. Not a claim we match the system Camera app’s 24 MP + depth on both streams (lab: query at runtime; do not assume).

## Non-goals

- Building `AVCaptureMultiCamSession` in this folder
- ARKit Spatial Reframe (locked; wrong track — see 06)
- Cloud proctoring or exam surveillance

## Kill criterion

If 01 cannot deliver 30 seconds of synced face+bench on a listed device without thermal shutdown, **05 is parked**. Do not ship a single-cam “picture-in-picture fake.”

## Sell before build

[SELL_FIRST.md](SELL_FIRST.md). Intended `priceLabel`: **$19 one-time** for the tutor mode (label only). `paymentUrl` empty. No TestFlight URL.
