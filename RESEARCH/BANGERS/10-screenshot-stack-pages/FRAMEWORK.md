# 10 — screenshot-stack-pages

**Status:** unpublished-draft · paper only  
**Job:** take an **ordered folder of screenshots** and emit **one static page** (help article, listing draft, or walkthrough) — not a design tool and not an App Store Connect client.

## What it is

A compiler: `01.png … 08.png` + a captions file → one HTML page with figure order preserved. The “stack” is the **user’s habit** (iOS groups screenshots; people dump a burst into a folder). There is **no cited public iOS 27 “Screenshot Stack API”** that emits IPTC for the stack. Do not claim one.

Capture of new screenshots on Mac can use ScreenCaptureKit (`SCScreenshotManager`) when we build later. Mobile users just AirDrop a folder.

IPTC `DigitalSourceType` `screenCapture` exists in the public vocabulary. We may **write** that on export if we control the encoder. We do not claim Apple’s screenshot stack already stamps it.

## ICP

An indie who has eight phone stills and needs a single URL-less HTML file to attach to a listing draft. They will edit captions. They will not want a CMS.

Not: track 04 (receipts). Not track 06 (AI-edit audit). Not Mission Winning `sites/www`.

## Non-goals

- Auto-generating marketing claims from pixels
- A hosted page builder with a fake shop
- Pixel-perfect App Store screenshot sizes as a guarantee (sizes are a later table)

## Kill criterion

If eight stills cannot become one printable HTML page with captions the human typed, kill. Do not add an LLM “to write the page.”

## Sell before build

[SELL_FIRST.md](SELL_FIRST.md). Intended `priceLabel`: **$8 one-time**. `paymentUrl` empty.
