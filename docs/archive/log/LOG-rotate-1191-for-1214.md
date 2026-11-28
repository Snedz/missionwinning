# LOG rotation for `.1214`

## 2026-10-22 — repair the stale links in the public repo's live documents (`.1191`)

Eight documents pointed at files that are not where the link says, so a reader following any of them landed on a 404. `app/INDEX.md` reached the root `INDEX.md` through `../../`, one level too far; `media/inbox/README.md`, `public/locales/README.md` and `src/i18n/INDEX.md` reached their targets one directory too shallow; and `docs/INDEX.md`, `docs/PLAN.md`, `docs/EXERCISE_AS_MEDICINE.md` and `vision.md` pointed at a `VISION_STATUS.md` that now lives under `docs/archive/`. Docs only. Label `2026.07-unified.1191`. `[skip vercel]`.
