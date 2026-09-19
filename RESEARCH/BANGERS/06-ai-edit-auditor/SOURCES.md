# 06 — SOURCES

| Source | Proves |
|--------|--------|
| [WWDC26 Camera lab Q&A](https://antongubarenko.substack.com/p/wwdc26-camera-and-photo-technologies) | Clean Up / Reframe **modify file metadata** (IPTC + EXIF; IPTC names the modification). Photos info panel can show the edit. **No public Spatial Reframe pipeline API.** No PhotoKit keyword query API. Keywords still export in IPTC. |
| [IPTC Digital Source Type vocabulary](https://cv.iptc.org/newscodes/digitalsourcetype/) | Public codes: `compositeWithTrainedAlgorithmicMedia` (edited with generative AI / inpaint-outpaint), `trainedAlgorithmicMedia` (created with generative AI), `screenCapture`, etc. Apple’s Photos tokens may be additional — UNKNOWN until dump. |
| [Here’s everything new for Apple Photos in iOS 27 (9to5Mac)](https://9to5mac.com/2026/06/16/heres-everything-new-for-apple-photos-in-ios-27/) | Marketing names: Spatial Reframing, Extend, upgraded Clean Up. Product description, not an API. |
| [Apple details how iOS 27's AI Photos tools work (LavX / Stalman interview recap)](https://news.lavx.hu/article/apple-details-how-ios-27-s-ai-photos-tools-work-and-where-it-draws-the-line) | Extend cap (~25%, once); Reframe generates pixels only where perspective shifted. Still **system Photos**, not a third-party pipeline. |
| [The next generation of Apple Intelligence is available today (Apple Newsroom, 2026-09)](https://www.apple.com/ie/newsroom/2026/09/next-generation-of-apple-intelligence-available-today/) | OS generation and device floor for Apple Intelligence. Not a metadata spec. |

## Press caution

Some recaps mention hidden watermarks. Until we have a file dump + a cited method, watermark claims stay **UNKNOWN**. The auditor ships as a **metadata reader** first.
