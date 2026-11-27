# LOG rotation for `.1205`

## 2026-10-22 — fitness-test age band means the same as field-test (`.1190`)

One value: `fieldTestAgeBand` in `src/i18n/fitnessTestLocales.ts` was `'Column M'` but the key is the `{{band}}` interpolation in `field-test` (rendered by the field-test receipt strip). Latent today because first-class strings merge last; it would surface on the next locale export. Label `2026.07-unified.1190`. PRIVATE_MODE stays.
