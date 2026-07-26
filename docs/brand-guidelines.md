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

Modernist (rebrand 2026-07-25): ink on paper, ONE red accent. Navy `#0a0c10`, emerald `#27b07d`, and brass `#c7a860` are **retired**. No dark mode.

| Role | Token | HSL | Hex |
|------|-------|-----|-----|
| Paper ground | `--background` | `0 4% 95%` | `#f3f2f2` |
| Ink | `--foreground` | `20 5% 12%` | `#201e1d` |
| Surface panel | `--card` | `0 2% 92%` | `#eae9e9` |
| Poster red | `--accent-poster` | `8 85% 50%` | `#ec3013` |
| Red fill | `--primary-fill` | `8 88% 46%` | `#dd2b0f` |
| Red text | `--primary` | `8 100% 34%` | `#ae1800` |
| Tint | `--accent-tint` | `11 100% 97%` | `#fff2ef` |
| Rules / dividers | `--border` | `0 1% 62%` | ink 40% — ALL rules 2px solid |

### Which red

Three tokens, because **no single value works for every role** (the same lesson the
emerald split taught, inverted for a light ground):

| | As small text on paper | Under white text | Large labels / chrome |
|---|---|---|---|
| `--accent-poster` `#ec3013` | 3.78:1 ❌ | 4.19:1 ❌ | **3:1+ ✅** |
| `--primary-fill` `#dd2b0f` | 4.28:1 ❌ | **4.74:1 ✅** | ✅ |
| `--primary` `#ae1800` | **6.4:1 ✅** | ✅ | ✅ |

- **`--accent-poster`** — the red people remember: poster fields, `.primary-action`
  (whose 19px/800 label is WCAG large text), key figures ≥24px, icons, the app
  icon's poster variant. **At most one red field per page.**
- **`--primary-fill`** — filled buttons at UI sizes carrying white text.
- **`--primary`** — every `text-primary` / small red text / red border.

## Typography

Archivo does every job — Barlow Condensed, Inter, and IBM Plex Mono are retired.
Display, body, and telemetry are told apart by weight, size, and tracking.

| Role | Face | Use |
|------|------|-----|
| Display | **Archivo 800** | Sentence case, flush left, lh ~1.06, ls −0.02em |
| Body | **Archivo 400** | 17/28 marketing · 15/24 app density |
| Kicker / telemetry | **Archivo 600 caps** | 13px, ls 0.08em, tabular numerals |

Everything sits flush left — headings, copy, and the labels inside wide buttons.
Tabular numerals (`tnum`) on every aligned figure. Stack in product: one Google
Fonts load via `app/layout.tsx` (`--font-archivo`; legacy vars alias it).

## Logo

Primary mark: **plain ink square, zero radius, paper MW monogram** (same letter
paths as `/favicon.svg`). Three inkings, no more: ink on paper, paper on ink, and
paper on red — the red one reserved for poster moments, never decoration.

| Asset | Use |
|-------|-----|
| `/brand/logo-icon.svg` | Primary — ink square, paper monogram |
| `/brand/logo-icon-reversed.svg` | Paper square, ink monogram (on ink grounds) |
| `/brand/logo-icon-red.svg` | Poster variant — red field only, sparingly |
| `/brand/logo-wordmark-light.svg` | Icon + wordmark for paper backgrounds |
| `/brand/logo-wordmark-dark.svg` | Icon + wordmark for ink backgrounds |
| `/brand/og-default.png` | Default Open Graph / Twitter share (1200×630) |

**App icons (do not duplicate in kit):** `/favicon.svg`, `/apple-touch-icon.png`, `/pwa-512x512.png`, `/pwa-maskable-512x512.png`.

### Clear space & size

- Clear space around the mark ≈ **¼ of the square** on each side.
- Digital minimum: square **24px**; full lockup **120px** wide.
- Never rotate, round, shadow, or set the mark on a photograph without an ink or red field under it.

### Do / don't

| Do | Don't |
|----|--------|
| Use paper + ink + one red as specified | Recolor the mark, or revive navy/emerald/brass |
| Keep the square sharp — zero radius | Round, outline, bevel, or "glow" the logo |
| Pair the wordmark with Archivo 800 | Substitute another face in official lockups |
| Credit "Mission Winning" in coverage | Imply partnership or endorsement without permission |

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
Mission Winning brand imagery. Modernist: paper ground #f3f2f2, ink #201e1d,
single red accent #ec3013. Photography in pure black and white — phones, parks,
garage floors; not gym glamour. Clinical athletic clarity — not gym-bro hype,
not medical. No logos invented; no navy/emerald/brass (retired palette); no
gradients or glows. Atmosphere: mission briefing, train-anywhere athlete, calm
competence. Decorative or chapter-hero only — not instructional form diagrams
(those are SVG line art). No text in the image unless explicitly requested.
No crisis or clinical depression framing.
```

### Do / don’t (AI)

| Do | Don’t |
|----|--------|
| Paper / ink / one-red palette, b&w photography | Navy/emerald/brass (retired), purple/violet, cream+terracotta |
| Calm mission atmosphere | Gym-bro hype, neon glow stacks, gradients |
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
