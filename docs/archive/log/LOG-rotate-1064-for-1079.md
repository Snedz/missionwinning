Superseded live LOG section rotated 2026-09-15 for `.1079` billing CapResult deny consistency.

## 2026-09-13 — Astro AVIF RCE (`.1064`)

Critical Dependabot alert #87 / GHSA-26w7-cxv4-gfx2:
Astro RCE via AVIF image optimization (`libheif` / Sharp).
Patched in Astro `7.2.8` (requires Sharp `0.35.4`).

`sites/www` only: `astro` `^7.2.0` → `^7.2.8`; lock resolves
`astro@7.3.2` and `sharp@0.35.4`. No `@astrojs/*` peer bump
required.

Paper only. `[skip vercel]`. No tip-promote. Live www stays
`.697`. PRIVATE_MODE stays.

Label `2026.07-unified.1064`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1045-for-1064.md](docs/archive/log/LOG-rotate-1045-for-1064.md) (`.1045`) and [docs/archive/log/LOG-rotate-1044-for-1064.md](docs/archive/log/LOG-rotate-1044-for-1064.md) (`.1044`).
