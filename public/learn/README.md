# Learn figures

Chapter / section imagery for Beyond the Basics. Playbook: [docs/MEDIA_SYSTEM.md](../../docs/MEDIA_SYSTEM.md).

| File | Chapter |
|------|---------|
| `human-performance-hero.webp` | Ch 1 |
| `movement-mechanics-hero.webp` | Ch 2 |
| `programming-tuning-hero.webp` | Ch 3 |
| `getting-started-mw-hero.webp` | Ch 4 |
| `nutrition-recovery-hero.webp` | Ch 5 |
| `assessments-progress-hero.webp` | Ch 6 |

**Palette (`.268`):** paper `#f3f2f2` ground, ink line diagrams, brand red accents — same system as `public/form-guides/`. Regenerate with:

```bash
node scripts/generate-guidebook-heroes.mjs
node scripts/check-guidebook-heroes.mjs
```

SVG sources land in `media/inbox/guide-heroes/`. Do not reintroduce dark-ground AI heroes; `guidebookHeroPalette.test.ts` fails them.
