# Design system — Mission Winning

**Runtime source:** [`src/index.css`](../src/index.css) · [`tailwind.config.js`](../tailwind.config.js) · fonts in [`app/layout.tsx`](../app/layout.tsx)  
**Research:** [`DESIGN_RESEARCH.md`](DESIGN_RESEARCH.md)  
**Build:** `2026.07-unified.89`+ (Wave 9 consolidation)

---

## Principles

**Modernist** (rebrand 2026-07-25, [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) wave D5): flat ink on paper, one red accent, Archivo for everything, zero corner radius, structure drawn with 2px rules, photography in black and white. Light-only — the dark theme is retired.

1. **The field manual** — caps kicker → Archivo 800 display (sentence case, flush left) → body; red spent like attention
2. **One red field per page** — `--accent-poster` for the primary action / poster close; small red text is always `--primary` (#ae1800)
3. **One boss action** per screen (especially Today)
4. **Clinical metrics, not gamification** — tabular nums, quiet labels, lucide over emoji
5. **Nothing floats, nothing is decorated** — no shadows, no glows, no gradients; alignment and 2px rules do the organizing; everything flush left (button labels included)

### Scoped color exceptions

- **Drop-set kind chip** (`SetLogRow`): keeps `bg-violet-600` so drop sets stay visually distinct from supersets (`--status-info`) and normal sets. Not brand identity violet.
- Long-tail raw Tailwind color classes: prefer `--status-*` / `--primary` when touching those files; no mass rewrite.

## Card tier ladder (in-app + marketing)

| Tier | Class | Use |
|------|--------|-----|
| **Base** | `Card` (flat surface fill) | Dense/repeated rows, settings, logger inners, tables |
| **Content** | `content-card` | Standalone pillar content blocks — surface fill, no border |
| **Hero** | `card-elevated` | **≤1** summary/boss panel per screen — surface + 2px rule border |
| **Live / selected** | `card-glow-emerald` | Active timer / Today scorecard / selected option (≤1) — tint fill `#fff2ef` + 2px poster-red border |
| **Honor** | `card-glow-brass` | Legacy honor sites — renders as `card-elevated` (brass retired) |

No elevation anywhere — shadows and glows are retired. `card-glow-*` class names survive for call-site stability; Phase 3 renames them.

## Tokens

| Token | Role |
|-------|------|
| `--background` / `--foreground` | Paper `#f3f2f2` / ink `#201e1d` |
| `--card` / `--border` | Surface `#eae9e9` / rule gray (ALL rules 2px solid) |
| `--primary` | Red text/border `#ae1800` — safe at any size (6.4:1) |
| `--primary-fill` (+ `-hover`) | Button fills `#dd2b0f` — white text 4.74:1 AA |
| `--accent-poster` | Poster red `#ec3013` — fills w/ large labels, chrome, ≤1 field/page |
| `--accent-tint` | `#fff2ef` — highlighted rows, "today" states, tracks |
| `--brass` | **Retired** — resolves to a neutral until Phase 3 removes call sites |
| `--status-warn` / `--status-info` | Deep amber / deep blue (text-safe on paper) |
| `--status-danger` / `--status-ok` | `#ae1800` / deep green |

**Cross-platform drift:** `npm run check-token-sync` pins the web `:root` values. The Android cross-check is **paused** for the rebrand (wave D5 founder override) — Android keeps navy/emerald until its own program. Motion checks still enforced.

Utility classes: `content-card`, `card-elevated`, `card-glow-emerald`, `card-glow-brass`, `primary-action`, `eyebrow`, `eyebrow-live`, `eyebrow-honor`, `display-hero`, `display-section`, `display-mega`, `section-index`, `briefing-rule`, `pressable-card`, `ring-draw-in`, `score-tick`, `section-seam`.

### Marketing surfaces (landing / bundle / SEO)

| Class | Role |
|-------|------|
| `hero-field` | Flat paper + safe-area padding (gradient field retired) |
| `texture-grid` | The visible modular grid — subtle rule-gray lines |
| `section-seam` / `section-seam-glow` | Honest 2px rules (both render identically now) |
| `reveal` / `reveal-visible` | Scroll-reveal (pair with `Reveal` / `useScrollReveal`) |
| `ticker-track` | Caps telemetry marquee (md+) |

Tailwind: `poster`, `tint`, `surface-raised`.

### Generated art (`public/art/`)

| Asset | Use |
|-------|-----|
| `hero-field.avif` (+ webp) | Landing hero (priority) |
| `topo-brass.*` | Manifesto / mission bands |
| `arc-momentum.*` | Final CTA |
| `bundle-brass.*` | Bundle teaser flourish |

Rules: decorative (`alt=""`, `aria-hidden`), explicit width/height, lazy except hero, ≤80 KB each / ≤250 KB total on `/`.

**Form diagrams & Learn figures:** [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · `public/form-guides/` · `public/learn/`.

---

## Typography

| Role | Class / font |
|------|----------------|
| Hero — `/` only | `.display-hero` — Archivo 800, `clamp(2.625rem, 6vw, 4.75rem)`, lh 1.06, ls −0.02em |
| Section title **and template page title** | `.display-section`, `clamp(1.9rem, 4.5vw, 3rem)` |
| Kicker / telemetry | `.eyebrow` — Archivo caps, 13px, ls 0.08em, `tnum` |
| Body | Archivo 400 (`font-sans`) — 17/28 marketing, 15/24 app density |
| Numbers | `tabular-nums` always on weights, reps, timers, scores |

Display type is **sentence case and flush left** — the caps were Barlow's; Archivo 800 carries the weight instead. Archivo loads 400/600/800 only, so use `font-semibold`/`font-extrabold`, never `font-medium`/`font-bold` on display type (500/700 would synthesize).

**Never put a `text-*` utility on a display class.** The display classes live in `@layer
components` and Tailwind utilities in `@layer utilities`, which comes later — so
`className="display-section text-2xl"` silently discards the `clamp()` at equal
specificity. `npm run check-display-type` fails the gate on it. If you
need the face at a custom size, use `font-display` directly.

`.display-hero` is reserved for `/`. A template page titled with an exercise name uses
`.display-section` — the hero tier's floor wraps "Close-Grip Bench Press" to three
lines at 390px.

## Components

| Component | Path | Use |
|-----------|------|-----|
| **ProgressRing** | `src/components/ui/ProgressRing.tsx` | Today + Fuel + demos (canonical) |
| ScoreRing / MetricRing | adapters → ProgressRing | Legacy call sites |
| **HoldToConfirmButton** | `src/components/ui/HoldToConfirmButton.tsx` | Destructive hold-to-confirm — [DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md) |
| **DangerZone** | `src/components/ui/DangerZone.tsx` | Geography for destructive actions |
| **PillarPageHeader** | briefing anatomy (eyebrow optional) | All pillar + info pages |
| **PillarPageShell** | stagger + header + children | In-app pillars |
| **InfoPageShell** | info/marketing in app chrome | About, legal, etc. |
| **MarketingNav / Footer** | `src/components/marketing/` | Landing + Bundle chrome |
| **Experience (`/experience`)** | `src/components/experience/` | Frontier dossier — route-scoped CSS (`.xp-*`), `gpuTier` WebGPU→WebGL2→static, hero aurora + Win Score particles, no global CSS pollution |
| **PublicPageShell** | `src/components/public/PublicPageShell.tsx` | **All SEO surfaces** — exercises, hubs, compare, paths. Server Component; briefing type; `maxWidth` applies to header *and* body so they cannot drift. Replaced `PublicSeoHeader`/`PublicSeoFooter` in `.129` |
| **PublicNavMenu** | `src/components/public/PublicNavMenu.tsx` | Mobile navigation (Radix Dialog — focus trap/Escape/scroll lock for free). Used by `MarketingNav` and `PublicPageShell` |
| **PublicSiteFooter** | `src/components/public/PublicSiteFooter.tsx` | Server-side twin of `MarketingFooter`; both read `marketing/footerLinks.ts` |
| **GuideApexShell** | `src/components/learn/GuideApexShell.tsx` | Public `/guide` magazine reader — Contents rail + locale |
| **Reveal** | `src/components/marketing/Reveal.tsx` | Landing scroll-reveal (`StatBand` was listed here and had zero call sites) |
| **EmptyState** | dashed invite + CTA | First-week empties |
| **primary-action** | CSS class | Journey / conversion CTAs |

---

## Shell rules

| Surface type | Shell |
|--------------|--------|
| **Public SEO (exercises · hubs · compare · paths)** | **`PublicPageShell`** — English chrome by design: every SEO route is `force-static` and `app/layout.tsx` hardcodes `lang="en"`, so there is exactly one build-time language. Real translation here means `/es/exercises/[id]` + hreflang, which is Horizon 3 i18n depth. Do not "fix" this by making these pages client components — that ships the exercise catalog to the browser and still indexes English. |
| In-app pillars | `PillarPageShell` |
| Today `/log` | Custom command layout (not PillarPageShell) |
| Landing, Welcome, Exercises | Standalone marketing chrome |
| Public `/guide` | `GuideApexShell` (Contents sidebar + language) |
| Compare, Bundle | Prefer marketing chrome (out of AppLayout when practical) |
| Train `/active` | Header + dense logger; keep set-table internals |

---

## Motion & interaction

- No decorative animation, no scroll-hijacking, no parallax. Transitions ≤200ms, opacity/transform only; entrances 300–450ms fades gated by `prefers-reduced-motion`
- Duration tiers: **150ms** press/hover feedback · **200–250ms** state changes (toggles, tab switches) · **300–450ms** entrances/reveals. One easing family: `ease-out` for entrances, `ease-in-out` for state changes. No spring/bounce in-app (marketing `/experience` excepted).
- `score-tick` on ring center values; `ring-draw-in` on ring mount
- Press: `.pressable-card` / `primary-action` active scale — every tappable surface gives press feedback
- **Focus:** one global `:focus-visible` in `src/index.css` `@layer base` — 2px solid `--ring`, offset 2. Do **not** add per-component `focus-visible:ring-*`; that renders two indicators. `.primary-action` overrides to an ink outline because its fill is the same red as the ring. axe does not test focus visibility, so `tests/e2e/a11y.spec.ts` tabs and asserts `outline-style: solid` at ≥2px
- **No layout shift on data load**: reserve space with skeletons/placeholders; numbers use `tabular-nums` so ticks don't jitter
- One entrance stagger per screen (PillarPageShell owns it); elements never animate twice on the same mount
- Android mirrors these values (`core/designsystem` enter-fade + reduce-motion); keep parity when tuning

---

## Do not

- Round a corner anywhere — `--radius` is 0 on purpose, and the whole Tailwind scale collapses to it
- Center button labels or hero copy — everything flush left
- Soften the 2px rules into hairlines, or replace them with whitespace/shadows
- Revive navy/emerald/brass, gradients, glows, or tinted imagery (photography is b&w via `grayscale`)
- Put small text in `--accent-poster` — that is what `--primary` is for
- Ad-hoc amber/blue skins without mapping to `--status-*`
- Multiple primary CTAs above the fold on Today or Landing
