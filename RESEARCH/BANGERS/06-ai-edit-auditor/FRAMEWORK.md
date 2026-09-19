# 06 — ai-edit-auditor

**Status:** unpublished-draft · paper only  
**Job:** tell a human **whether a still was altered by system Photos AI** (Clean Up, Spatial Reframing, Extend) by reading **IPTC + EXIF** that iOS 27 writes — not by re-running those tools.

## Locked API (do not “build around” it)

WWDC26 Camera lab, on the record: **there is no public developer API for the Photos Spatial Reframe pipeline.** ARKit reconstruction and AVFoundation depth are **not** that pipeline. File Feedback Assistant if you want it. This track **never** calls a Reframe API.

What we may do: after the **user** (or Photos) has already applied Clean Up / Reframe / Extend, read the **metadata the system already wrote** and show it in plain language.

## What Apple said about tags

Same lab: when Reframe or Clean Up modifies a photo, **file metadata is modified**. IPTC is updated, together with EXIF, and IPTC reflects **which** AI modification was used. Photos info panel (swipe up) can show the edit. That is the auditor’s raw material.

Keywords exist in Photos UI and export into IPTC; **there is no PhotoKit API to query library assets by those keywords.** Do not promise a PhotoKit keyword search.

## IPTC vocabulary (public, not Apple-specific)

IPTC `DigitalSourceType` includes `compositeWithTrainedAlgorithmicMedia` (“Edited using Generative AI” — inpaint/outpaint) and `trainedAlgorithmicMedia` (created with generative AI). Apple’s exact key/value pair for “Clean Up” vs “spatial reframe” is **what we must dump from a real exported file** — until then the mapping is **UNKNOWN**. Do not invent a private fourcc.

## ICP

An editor, insurer, or listing agent who must say “this file carries a system AI-edit tag” or “no such tag in the bytes we received.” They will open one file. They will not buy a “deepfake detector” speech.

Not: a watermark stripper. Not a claim we read invisible SynthID without a cited method. Not Mission Winning photo log.

## Kill criterion

If a Clean Up export from a current iOS 27 Photos build does **not** contain a distinguishable IPTC/EXIF difference vs the unedited original on the same device, the SKU dies. Do not fall back to “AI guessed from pixels.”

## Sell before build

[SELL_FIRST.md](SELL_FIRST.md). Intended `priceLabel`: **$12 one-time**. `paymentUrl` empty.
