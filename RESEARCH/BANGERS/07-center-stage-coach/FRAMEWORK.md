# 07 — center-stage-coach

**Status:** unpublished-draft · paper only  
**Job:** a talking-head coaching recorder that **stays framed** using the system Center Stage path on devices that expose it — not a full Mission Coach plan engine.

## What it is

One front-camera session: preview + record + a cue card the coach reads. Framing is **Center Stage** (system video effect), not our face-tracker. On iPhone 17 / iPhone Air / iPhone 17 Pro class hardware, the Center Stage front camera is the front **ultra-wide** (`.builtInUltraWideCamera` at `.front`). Apps without VoIP background mode set the Center Stage control mode (`cooperative` or `app`) and `isCenterStageEnabled`.

If `isCenterStageEnabled` cannot be set, the SKU says so and **does not** ship a fake crop.

## ICP

A remote strength or language coach who walks while talking and currently clips their own forehead. They want a file they can send. They do not want another calendar SaaS.

Not: `/coach` Mission Coach. Not `/coaching` human-lead form. Not track 05 (that needs dual-cam + 01).

## Non-goals

- Dual capture (that is 01 + 05)
- Spatial Reframe after the fact (locked — 06)
- Live class marketplace

## Device honesty

Capability is queried at runtime. A marketing sentence that says “every iPhone” is a defect. Device matrix until measured: **UNKNOWN**.

## Kill criterion

On a listed Center Stage device, if the subject can walk a 2 m lateral path and leave the frame for >2 s while the effect is enabled, kill or return the API (do not write our own tracker to hide it).

## Sell before build

[SELL_FIRST.md](SELL_FIRST.md). Intended `priceLabel`: **$9 one-time**. `paymentUrl` empty.
