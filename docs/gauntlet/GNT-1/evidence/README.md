# GNT-1 evidence

Own-app stills only. Name: `U<n>-R<r>-<beat>.png` (e.g. `U1-R1-set-row.png`). Beat list is in the workbench.

Competitor captures stay on the founder’s machine. Only measurements and verdicts enter the workbench.

## How to shoot (critic)

1. From the repo root: `npm run dev` (ungated locally). Do **not** `next start` unless `PRIVATE_MODE=false` and the gate cookie is set — that stills `/private`.
2. Viewport **390×844**. Playwright: `page.setViewportSize({ width: 390, height: 844 })` then `page.screenshot({ path: 'docs/gauntlet/GNT-1/evidence/U1-R1-<beat>.png' })`.
3. If a named instrument is Playwright: `npx playwright install chromium` once. A missing browser is not a product FAIL.
4. Paste the workbench command’s **last lines**, not “tests passed.”
