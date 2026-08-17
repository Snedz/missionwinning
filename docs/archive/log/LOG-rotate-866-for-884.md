# Rotated from LOG.md for `.884`

## 2026-08-16 — No French — France is blocked (`.866`)

Founder: there is no France region because we blocked it. Offering `fr` as
a pack, picker, or geo default was a served-language claim for a blocked
country. French is not a product language.

**Ship:** `APP_LANGS` 15→14 · `UI_LANGS` 40→39 · `normalizeUiLang('fr')` → `en`
· France / francophone geo defaults to English · packs and public locale
tree dropped · Android picker drops `fr`.

Label `.866` (onto master `.865`).

Excellence-Override: founder-directed language cut (picker/packs; RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-851-for-866.md](LOG-rotate-851-for-866.md).
