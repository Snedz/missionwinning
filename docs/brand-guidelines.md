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

**Medium boilerplate:** Mission Winning is a free offline workout logger plus adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline as a PWA. Premium Super Bundle unlocks Coach depth and other pillars — never gates the logger.

---

## Voice

- **Mission briefing** — clear, direct, respectful of the reader’s time.
- Clinical metrics over gamification slang; lucide-style clarity, not emoji spam.
- Free core is a product promise, not a guilt trip about competitors.
- Avoid gym-bro hype, paywall shame bait, fake testimonials, and “we’re live” claims while private beta is on.

### Exercise, mood, and medical claims

Full thesis + cite table: [EXERCISE_AS_MEDICINE.md](EXERCISE_AS_MEDICINE.md).

| OK | Not OK |
|----|--------|
| Energy, mood, resilience as outcomes of **consistent training** | Diagnose, treat, or cure depression (or any mental illness) |
| “Exercise is medicine” as a **thesis** (structured dose > vague advice) | “Replace your SSRI / therapist” |
| Mild–moderate / research-setting comparisons with citation | “As good as SSRIs for everyone / severe depression” |
| “Most mental health professionals never trained to prescribe exercise” | “92% of **doctors**” without a matching citation |
| Adaptive weekly plan as the product story | Leading landing hero / PH with clinical depression |
| Educational + “not medical advice” disclaimer | Crisis-as-feature or clinical-care framing |

Consumer hook stays **Train Anywhere / free logger + Mission Coach**. Evidence language belongs in About, Learn, founder narrative — not the company one-liner.

---

## Colors

Emerald = action. Brass = earned / honor. Navy = canvas. Never use competitor blue/violet as brand identity.

| Role | Token | HSL | Hex |
|------|-------|-----|-----|
| Navy canvas | `--background` | `222 24% 5%` | `#0a0c10` |
| Emerald accent | `--primary` | `158 64% 42%` | `#27b07d` |
| Emerald fill | `--primary-fill` | `158 92% 25%` | `#057a4f` |
| Emerald fill hover | `--primary-fill-hover` | `158 92% 21%` | `#046743` |
| Brass honor | `--brass` | `42 48% 58%` | `#c7a860` |
| Primary text on dark | — | — | `#ffffff` |

### Which emerald

Two tokens, because **no single value works for both roles**:

| | As text/border on navy | Under white text |
|---|---|---|
| `--primary` `#27b07d` | **7.08:1** ✅ | 2.77:1 ❌ |
| `--primary-fill` `#057a4f` | 3.0:1 ❌ | **5.38:1** ✅ |

- **`--primary`** — emerald *on* the navy canvas: text, borders, icons, and low-alpha
  tints (`bg-primary/10`), where the text sitting on the tint is foreground, not white.
- **`--primary-fill`** — any **filled** emerald surface carrying white text: buttons
  (`.primary-action`, the `default` Button variant), active tabs, badges, chips. Hover
  **darkens** to `--primary-fill-hover`; lightening drops back to 4.17:1 and fails.
- **The MW monogram keeps `--primary`.** It is a logotype (WCAG 1.4.3 exempts those) and
  must match `/favicon.svg` and the PWA icons, which are all `hsl(158 64% 42%)`. Use
  [`BrandMonogram`](../src/components/brand/BrandMonogram.tsx) rather than re-inlining it.

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

## Mascot — Scout

**Full bible:** [MASCOT.md](MASCOT.md) · **Assets:** `/brand/mascot/` · **Flow prompts:** [`media/FLOW_PROMPTS.md`](../media/FLOW_PROMPTS.md)

Scout is a geometric falcon/kestrel companion (mission briefing personality). Celebrates logs; never shame. Social → one empty state → Victory only — not the Train logger, not a logo replacement for the MW monogram.

---

## AI Image Generation

**Full playbook:** [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · **Flow prompts:** [`media/FLOW_PROMPTS.md`](../media/FLOW_PROMPTS.md) · **manifest:** [`media/manifest.json`](../media/manifest.json).

**Primary HQ for Learn / social / motion:** [Google Flow](https://labs.google/fx/tools/flow) — free tier ≈ 50 credits/day for Veo Lite/Fast/Quality video. Prefer Veo 3.1 Lite (~10 credits) → export best frame for stills. Form guides stay instructional SVG.

Use Cursor GenerateImage / Grok Imagine / Gemini design scripts as fallbacks for still drafts. Generation stays offline → `media/inbox/` → `npm run media:optimize-inbox` → commit `public/`.

### Prompt block (copy)

```
Mission Winning brand imagery. Dark navy canvas #0a0c10, emerald accent #27b07d,
brass honor #c7a860. Clinical athletic clarity — not gym-bro hype, not medical.
No logos invented; no competitor blue/violet identity; no cream/terracotta editorial look.
Atmosphere: mission briefing, train-anywhere athlete, calm competence.
Decorative or chapter-hero only — not instructional form diagrams (those are SVG stick figures).
No text in the image unless explicitly requested. No crisis or clinical depression framing.
```

### Do / don’t (AI)

| Do | Don’t |
|----|--------|
| Navy / emerald / brass palette | Purple, violet brand identity, cream+terracotta editorial |
| Calm mission atmosphere | Gym-bro hype, neon glow stacks |
| Decorative Learn / landing / social | Fake medical charts or depression framing |
| Check manifest before regenerating | Commit multi‑MB unoptimized drafts / Flow raws |
| Spend free Flow on Veo Lite | Burn Quality (100) on the free 50/day |

---

## Asset index

| Path | Notes |
|------|-------|
| https://www.missionwinning.com/press | Human-readable media kit |
| https://www.missionwinning.com/brand/… | Direct SVG/PNG downloads |
| https://www.missionwinning.com/brand/README.md | Usage license summary |
| [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) | Form / Learn / art / social generation system |

---

## Contact

- Support: support@missionwinning.com  
- Coaching inquiries: hello@missionwinning.com  
