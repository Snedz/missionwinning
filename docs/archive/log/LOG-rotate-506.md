# Rotated for .506

## 2026-08-05 — Unicode pack placeholder guard (`.490`)

`.484` fixed machine-translated `{{peso}}`-style keys, but the extractor used `\w` (ASCII-only in JS). Hindi/Thai/Vietnamese packs still shipped `{{गिनती}}`, `{{นาที}}`, `{{trọng lượng}}` — runtime left literals; the guard skipped them because `got.size === 0`. Rewrote 36 keys (hi 27, vi 7, th 2) to English names; synced `public/locales`. Extractor is now `{{([^}]+)}}` + ASCII-ident check; pin test fails if `\w` returns.

Mutants: restore `\w` extractor → pin red; hi `{{गिनती}}` again → main test red.


