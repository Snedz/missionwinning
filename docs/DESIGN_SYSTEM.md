# Design system — Mission Winning

**Runtime source:** [`src/index.css`](../src/index.css) · [`tailwind.config.js`](../tailwind.config.js) · fonts in [`app/layout.tsx`](../app/layout.tsx)  
**Research:** [`DESIGN_RESEARCH.md`](DESIGN_RESEARCH.md)  
**Build:** `2026.07-unified.89`+ (Wave 9 consolidation)

---

## Principles

1. **Mission briefing** — mono eyebrow → display title → one emerald CTA
2. **Emerald = do it** · **Brass = earned it** · never competitor blue/violet identity
3. **One boss action** per screen (especially Today)
4. **Clinical metrics, not gamification** — tabular nums, quiet labels, lucide over emoji
5. **Match chrome to task** — Train dense; Today sparse; marketing product-in-hero

### Scoped color exceptions

- **Drop-set kind chip** (`SetLogRow`): keeps `bg-violet-600` so drop sets stay visually distinct from supersets (`--status-info`) and normal sets. Optional future token: `--set-kind-drop`. Not brand identity violet.
- Long-tail raw Tailwind color classes (~50 remaining outside top files): prefer `--status-*` / brass / primary when touching those files; no mass rewrite (Wave 9).

---

## Card tier ladder (in-app + marketing)

| Tier | Class | Use |
|------|--------|-----|
| **Base** | `Card` (`rounded-2xl` + quiet border) | Dense/repeated rows, settings, logger inners, tables |
| **Content** | `content-card` | Standalone pillar content blocks |
| **Hero** | `card-elevated` | **≤1** summary/boss panel per screen |
| **Live** | `card-glow-emerald` | Active timer / Today scorecard only (≤1) |
| **Honor** | `card-glow-brass` | PRs, victory, premium/founders teasers |
| **Texture** | `texture-noise` / `texture-grid` | Marketing; **not** dense app screens (victory backdrop OK) |

Hybrid rule: one modest base lift + targeted promotions — no mass Card rewrites. Superset grouping uses `--status-info` (not purple).

**Removed:** `dashboard-panel` (was near-dead; use `content-card` / `card-elevated`).

---

## Tokens

| Token | Role |
|-------|------|
| `--background` / `--foreground` | Navy canvas / primary text |
| `--card` / `--border` | Solid content surfaces |
| `--surface-raised` / `--grid-line` | Elevation + faint grids |
| `--primary` / `--accent` | Emerald action |
| `--brass` | Honor, PR, founders, rank |
| `--status-warn` | Strain / caution (prefer over raw amber) |
| `--status-info` | Recovery / info / functional grouping (prefer over raw blue/violet) |
| `--status-danger` / `--status-ok` | Risk / success |

**Cross-platform drift:** run `npm run check-token-sync` before ship — compares web `:root` HSL (this file) to Android [`MwColors.kt`](../apps/android/core/designsystem/src/main/java/com/missionwinning/core/designsystem/MwColors.kt) / [`MwMotion.kt`](../apps/android/core/designsystem/src/main/java/com/missionwinning/core/designsystem/MwMotion.kt). Exit 0 = OK. See [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) token sync checklist.

Utility classes: `content-card`, `card-elevated`, `card-glow-emerald`, `card-glow-brass`, `primary-action`, `eyebrow`, `eyebrow-live`, `eyebrow-honor`, `display-hero`, `display-section`, `display-mega`, `section-index`, `briefing-rule`, `pressable-card`, `ring-draw-in`, `score-tick`, `section-seam`.

### Marketing elevation (landing / bundle / SEO)

| Class | Role |
|-------|------|
| `hero-field` | Full-bleed emerald + brass radial field on navy |
| `texture-grid` / `texture-noise` | CSS grid + grain (mobile-cheap) |
| `card-elevated` | Raised surface above `content-card` |
| `card-glow-emerald` / `card-glow-brass` | Soft brand glows |
| `section-seam` / `section-seam-glow` | Gradient hairlines (replace uniform borders) |
| `reveal` / `reveal-visible` | Scroll-reveal (pair with `Reveal` / `useScrollReveal`) |
| `ticker-track` | Mono telemetry marquee (md+) |

Tailwind: `surface-raised`, `shadow-glow`, `shadow-glow-brass`.

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
| Hero — `/` only | `.display-hero` — Barlow Condensed, `clamp(2.75rem, 8vw, 5.5rem)` |
| Section title **and template page title** | `.display-section`, `clamp(1.9rem, 4.5vw, 3rem)` |
| Eyebrow / telemetry | `.eyebrow` — IBM Plex Mono |
| Body | Inter (`font-sans`) |
| Numbers | `tabular-nums` always on weights, reps, timers, scores |

**Never put a `text-*` utility on a display class.** The display classes live in `@layer
components` and Tailwind utilities in `@layer utilities`, which comes later — so
`className="display-section text-2xl"` silently discards the `clamp()` at equal
specificity. Ten call sites had done this, which is why `.display-section`'s real size
rendered on exactly one page. `npm run check-display-type` fails the gate on it. If you
need the face at a custom size, use `font-display` directly.

`.display-hero` is reserved for `/`. A template page titled with an exercise name uses
`.display-section` — the hero tier's 2.75rem floor wraps "Close-Grip Bench Press" to three
lines at 390px. Barlow Condensed loads **weight 700 only**, so display classes use
`font-bold`; `font-semibold` gets synthesized.

---

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

- CSS-first, 200–450ms, `prefers-reduced-motion` gates all entrance animations
- Duration tiers: **150ms** press/hover feedback · **200–250ms** state changes (toggles, tab switches) · **300–450ms** entrances/reveals. One easing family: `ease-out` for entrances, `ease-in-out` for state changes. No spring/bounce in-app (marketing `/experience` excepted).
- `score-tick` on ring center values; `ring-draw-in` on ring mount
- Press: `.pressable-card` / `primary-action` active scale — every tappable surface gives press feedback
- **Focus:** one global `:focus-visible` in `src/index.css` `@layer base` — 2px solid `--ring`, offset 2. Do **not** add per-component `focus-visible:ring-*`; that renders two indicators. `.primary-action` overrides to a white outline because its own bloom is emerald. axe does not test focus visibility, so `tests/e2e/a11y.spec.ts` tabs and asserts `outline-style: solid` at ≥2px
- **No layout shift on data load**: reserve space with skeletons/placeholders; numbers use `tabular-nums` so ticks don't jitter
- One entrance stagger per screen (PillarPageShell owns it); elements never animate twice on the same mount
- Android mirrors these values (`core/designsystem` enter-fade + reduce-motion); keep parity when tuning

---

## Do not

- Cream + serif + terracotta, purple glow, broadsheet hairlines
- Ad-hoc amber/blue skins without mapping to `--status-*` or brass
- Multiple primary CTAs above the fold on Today or Landing
