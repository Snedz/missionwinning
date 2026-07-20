# Mission Winning — Brand guidelines

**Audience:** Press, partners, creators, and anyone using Mission Winning marks in coverage or marketing.  
**Public kit:** [missionwinning.com/press](https://www.missionwinning.com/press) · Assets under `/brand/`  
**In-app design system:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · Runtime tokens: `src/index.css`  
**Social copy kit:** [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md)

---

## Name & tagline

| | |
|--|--|
| **Name** | Mission Winning |
| **Tagline** | Train Anywhere. Win Daily. |
| **URL** | https://www.missionwinning.com |

**Short one-liner:** Free offline workout tracker — no account required to start.

**Medium boilerplate:** Mission Winning is the free health everything app: workout tracking, nutrition, mobility, mind, activity, and learning in one path. Free core forever. Works offline as a PWA. Premium Super Bundle unlocks Coach and depth — never gates the logger.

---

## Voice

- **Mission briefing** — clear, direct, respectful of the reader’s time.
- Clinical metrics over gamification slang; lucide-style clarity, not emoji spam.
- Free core is a product promise, not a guilt trip about competitors.
- Avoid gym-bro hype, paywall shame bait, fake testimonials, and “we’re live” claims while private beta is on.

---

## Colors

Emerald = action. Brass = earned / honor. Navy = canvas. Never use competitor blue/violet as brand identity.

| Role | Token | HSL | Hex |
|------|-------|-----|-----|
| Navy canvas | `--background` | `222 24% 5%` | `#0a0c10` |
| Emerald action | `--primary` | `158 64% 42%` | `#27b07d` |
| Brass honor | `--brass` | `42 48% 58%` | `#c7a860` |
| Primary text on dark | — | — | `#ffffff` |

Foreground on navy is near-white; keep body copy readable (`text-muted-foreground` in product UI).

---

## Typography

| Role | Font | Use |
|------|------|-----|
| Display | **Barlow Condensed** (bold) | Hero titles, wordmark lockups |
| Body | **Inter** | Paragraphs, UI |
| Eyebrow / telemetry | **IBM Plex Mono** | Labels, section indexes |

Stack in product: Google Fonts via `app/layout.tsx` (`--font-display`, `--font-inter`, `--font-mono`).

---

## Logo

Primary mark: rounded emerald square with white **MW** monogram (same paths as `/favicon.svg`).

| Asset | Use |
|-------|-----|
| `/brand/logo-icon.svg` | Default icon on emerald |
| `/brand/logo-icon-navy.svg` | Icon on navy (dark UI / social) |
| `/brand/logo-icon-mono-light.svg` | Light mark on dark backgrounds |
| `/brand/logo-icon-mono-dark.svg` | Dark mark on light backgrounds |
| `/brand/logo-wordmark-dark.svg` | Icon + wordmark for dark backgrounds |
| `/brand/logo-wordmark-light.svg` | Icon + wordmark for light backgrounds |
| `/brand/og-default.png` | Default Open Graph / Twitter share (1200×630) |

**App icons (do not duplicate in kit):** `/favicon.svg`, `/apple-touch-icon.png`, `/pwa-512x512.png`, `/pwa-maskable-512x512.png`.

### Clear space & size

- Clear space around the mark ≈ **¼ of the icon height** on each side.
- Digital minimum: icon **24px**; full wordmark **120px** wide.
- Do not stretch, rotate, add drop shadows, or place the mark on busy photos without a solid navy or emerald field.

### Do / don’t

| Do | Don’t |
|----|--------|
| Use emerald + navy + brass as specified | Recolor the mark to blue, violet, or cream/terracotta |
| Keep white monogram on emerald or navy | Outline, bevel, or “glow” the logo for decoration |
| Pair wordmark with Barlow Condensed uppercase | Substitute Inter/Arial as the wordmark face in official lockups |
| Credit “Mission Winning” in coverage | Imply partnership or endorsement without permission |

---

## Asset index

| Path | Notes |
|------|-------|
| https://www.missionwinning.com/press | Human-readable media kit |
| https://www.missionwinning.com/brand/… | Direct SVG/PNG downloads |
| https://www.missionwinning.com/brand/README.md | Usage license summary |

---

## Contact

- Support: support@missionwinning.com  
- Coaching inquiries: hello@missionwinning.com  
