# scripts/design-concepts/

From-scratch marketing-page architectures. Generated HTML lands in [`docs/design/concepts/`](../../docs/design/concepts/). Bytes (fonts, photographs) may be shared; structure may not.

| File | Role |
|------|------|
| `01-the-week.mts` | Instrument. First screen is a live session; the reader's verb is **press**. |
| `02-anywhere.mts` | Pinned cinematic. One session, five places, HUD week unchanged. Verb: **scroll**. |
| `03-field-manual.mts` | Document. Contents + `<details>`. Verb: **look up**. No JavaScript. |
| `04-combined.mts` | Continuous-scroll **landing** fusing 02 → 01 → 03 into one deepened-modernist system. Homepage stays A1 (`sites/www`). |
| `assets.mjs` | Embed subsetted OFL faces and the three documentary photographs as `data:` URIs. No DOM, no copy. |
| `fonts.mjs` | Subset Android OFL TTFs → `.cache/concept-fonts/*.woff2`. |
| `build.mts` | Orchestrator. Asserts self-contained (bare `#` fails), claims ban list, structural distinctness. |

Run: `npx tsx scripts/design-concepts/build.mts`
