# docs/design/ — rendered design artifacts

Visual artifacts that a markdown file cannot carry. Prose and decisions live in the docs that own them; nothing here restates a fact from [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md), [DESIGN_PROPOSAL_WWW.md](../DESIGN_PROPOSAL_WWW.md) or [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md).

| File | What it is | Owned by |
|------|-----------|----------|
| [`www-spec-sheet.html`](www-spec-sheet.html) | The www design proposal rendered **in the system it specifies** — type tiers at live `clamp()` sizes, the rhythm ruler drawn to scale, the seven motion moves running, both page-map compositions. Open it in a browser. | [DESIGN_PROPOSAL_WWW.md](../DESIGN_PROPOSAL_WWW.md) |
| [`www-wireframes.png`](www-wireframes.png) | Compact (390) and desktop (1440) compositions, side by side — the same content as the spec sheet's §06, as an image so it reads in a diff, on a phone, and in a PR. | same |
| [`www-rhythm-ruler.png`](www-rhythm-ruler.png) | The section-boundary argument drawn to actual scale: today's 160px against the proposed 256px and 576px, against the measured 190–450pt reference band. | same |

## Why the HTML is self-contained (161 KB)

`www-spec-sheet.html` embeds Archivo as a base64 `woff2` and inlines every style. It has **zero external references** — verified, not assumed. A design reference that needs a network, a font CDN or a build step is one that stops opening, and this repo has already paid for artifacts that could not be re-read (`.254`: six guidebook heroes carrying the retired navy/emerald palette, invisible to a source scan). The size is the cost of it still working in a year.

The PNGs are rendered **from that file**, at `deviceScaleFactor: 2`, by the same Chromium the e2e suite uses — so they cannot drift from it silently. Regenerate both by opening the HTML and re-shooting §06 and §03.

## Rules

- **Rendered output only.** No source of truth lives here — if a value in `www-spec-sheet.html` disagrees with `src/index.css`, the CSS wins and the sheet is stale.
- **Not scanned by the design-system guard.** `check-design-system.mjs` walks `src`, `app` and `sites/www`; `docs/` is outside it. That is deliberate — the sheet prints literal brand hexes *as its content* (the swatch tables), the same exemption `PressPage.tsx` carries for the same reason.
- **The published copy is an Artifact**, private until shared: https://claude.ai/code/artifact/f5d8df0f-f987-4cf6-80ac-b118c3404554 — same file, so redeploying it from `docs/design/www-spec-sheet.html` keeps the URL.
