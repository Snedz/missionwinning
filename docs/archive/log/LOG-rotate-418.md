# Rotated from LOG.md for .418

## 2026-08-04 — Pack exercisePickerList for coverage (`.403`)

Seeded axe on ExercisePicker added `t('exercisePickerList')` for the listbox name but never put the key in [`libraryLocales.ts`](src/i18n/libraryLocales.ts). Coverage hit **17 / cap 16** (Bundle keys stay intentionally uncovered under free-first). Added `exercisePickerList: 'Exercise matches'`. Coverage OK at 16/16.
