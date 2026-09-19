# 10 — BUILD_LATER

Gate: sell/override. A **hand-written** sample HTML proof with placeholder figures is allowed now (no Buy button).

## Phase A

1. CLI or drop-folder: sort by filename, read `captions.md`, write `page.html`
2. Relative `img` paths only — no upload
3. Optional IPTC `screenCapture` on export if we encode (cite IPTC URI)

## Phase B

- ScreenCaptureKit still grab on Mac (WWDC23 `SCScreenshotManager`) as an **input**, not the product
- Size presets table **after** we measure App Store slot pixels ourselves

## Never

- An LLM that invents captions from the pixels as the default
- A hosted builder origin
- Merging 06’s auditor (different job: read AI-edit tags)

## Proofs allowed now

One static HTML skeleton in this folder **only if** it has no checkout control. Default in this PR: markdown-only to keep the tree small.
