# scripts/design-concepts/

From-scratch marketing-page architectures. Generated HTML lands in [`docs/design/concepts/`](../../docs/design/concepts/). Bytes (fonts, photographs) may be shared; structure may not.

| File | Role |
|------|------|
| `01-the-week.mts` | Instrument. First screen is a live session; the reader's verb is **press**. |
| `02-anywhere.mts` | Pinned cinematic. One session, five places, HUD week unchanged. Verb: **scroll**. |
| `03-field-manual.mts` | Document. Contents + `<details>`. Verb: **look up**. No JavaScript. |
| `04-combined.mts` | Continuous-scroll **landing** fusing 02 → 01 → 03 into one deepened-modernist system. Homepage stays A1 (`sites/www`). |
| `serve.mjs` | Local studio. `npm run design:concepts` serves `docs/design/` on **127.0.0.1:4177** (fixed). Does not replace `/` or `/start`. |
| `stills.mjs` | Fold PNGs of 04 at 390×844 and 1440×900 into `docs/design/`. Current `/start` stills only if `npm run www` is already up. |
| `assets.mjs` | Embed subsetted OFL faces and the three documentary photographs as `data:` URIs. No DOM, no copy. |
| `fonts.mjs` | Subset Android OFL TTFs → `.cache/concept-fonts/*.woff2`. |
| `build.mts` | Orchestrator. Asserts self-contained (bare `#` fails), claims ban list, structural distinctness. |

Run: `npx tsx scripts/design-concepts/build.mts`

Local review (does not replace live www):

```bash
npm run design:concepts   # studio at http://127.0.0.1:4177/concepts/studio.html
npm run design:stills     # fold PNGs at 390 and 1440
npm run www               # current / and /start on 4321, for the control frames
```
