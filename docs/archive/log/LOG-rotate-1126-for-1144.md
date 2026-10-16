## 2026-10-12 — Next 16.4 initial JS under the bundle caps (`.1126`)

Next 16.4.0's webpack client runtime is about 2.0 KB gzip larger than 16.3.4 on every wedge route. The growth sits in the shared Next runtime chunk and the React framework chunk, both in `rootMainFiles`, so `/`, `/log`, and `/active` all move together. Measured on the same gzip level the budget script uses (zlib level 9, which matches the GitHub Actions runner): `/` 348.7 → 350.7 (cap 351), `/log` 419.9 → 422.0 (cap 420), `/active` 515.6 → 517.6 (cap 516). `npm run verify` does not run `scripts/bundle-budget.mjs`. CI does, after the production build. That is why verify was green and `build-and-test` was not.

Caps stay 351 / 420 / 516. Two static imports were shipping data the first paint does not need.

Just Go's focus fallback scans program names and always hits one of six free programs. It imported `FREE_STARTER_PROGRAMS`, the whole Today quick-options wall. Those six programs now live in `starterFocusFallback.ts` and are spread back into the wall, so the objects are the same. The rest of the wall stays on Today, which already loads quick options off the prerender script list.

Challenges count guidebook progress with `loadGuidebookProgress().size`. That function lived next to the chapter catalog, so the workout store pulled the book onto `/log` and `/active`. The id set is now `guidebookProgressStore.ts`. Stats and continue-reading still import the chapters.

After both cuts, the same CI-env webpack build measures `/` 350.7, `/log` 411.5, `/active` 507.1. Caps unchanged.

Label `2026.07-unified.1126`.

`[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1107-for-1126.md](docs/archive/log/LOG-rotate-1107-for-1126.md) (`.1107`).
