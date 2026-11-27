# LOG rotation for `.1207`

## 2026-10-22 — es + pt-BR homepage loop and comparison strings translated (`.1192`)

`src/i18n/landingLocales.ts`: the loop homepage (hero, adapt, anywhere, free terms, hero demo) and the comparison block shipped English-only to the es and pt beachheads, putting both at 45% placeholders, over the 40% cap in `scripts/i18n-parity.ts`, which kept Ratchets and every PR's build-and-test red. 41 keys translated per language; parity OK. Copy only, no UI files. Label `2026.07-unified.1192`. PRIVATE_MODE stays.

## 2026-10-22 — repair the stale links in the public repo's live documents (`.1191`)

Eight documents pointed at files that are not where the link says, so a reader following any of them landed on a 404. `app/INDEX.md` reached the root `INDEX.md` through `../../`, one level too far; `media/inbox/README.md`, `public/locales/README.md` and `src/i18n/INDEX.md` reached their targets one directory too shallow; and `docs/INDEX.md`, `docs/PLAN.md`, `docs/EXERCISE_AS_MEDICINE.md` and `vision.md` pointed at a `VISION_STATUS.md` that now lives under `docs/archive/`. Docs only. Label `2026.07-unified.1191`. `[skip vercel]`.
