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

### Section figures (`.414`)

| File | Section |
|------|---------|
| `said-principle.webp` | Ch1 SAID |
| `energy-systems.webp` | Ch1 energy |
| `recovery-stimulus.webp` | Ch1 recovery |
| `progressive-overload.webp` | Ch3 volume |
| `deload-signal.webp` | Ch3 deload |
| `first-session.webp` | Ch4 I-Day |
| `protein-briefing.webp` | Ch5 macros |
| `retest-cadence.webp` | Ch6 benchmarks |
| `six-pillars.webp` | Ch4 pillars |
| `win-score-offline.webp` | Ch4 Mission Score |
| `meal-timing.webp` | Ch5 meal timing |
| `parq-screen.webp` | Ch6 PAR-Q |
| `adjust-plan.webp` | Ch6 adjust plan |

**Palette (`.268`):** paper `#f3f2f2` ground, ink line diagrams, brand red accents — same system as `public/form-guides/`. Regenerate with:

```bash
node scripts/generate-guidebook-heroes.mjs
node scripts/generate-learn-section-figures.mjs
node scripts/check-guidebook-heroes.mjs
```

SVG sources land in `media/inbox/guide-heroes/` and `media/inbox/learn-sections/`. Do not reintroduce dark-ground AI heroes; `guidebookHeroPalette.test.ts` fails them.
