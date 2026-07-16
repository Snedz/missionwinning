# Design system — Mission Winning

**Runtime source:** [`src/index.css`](../src/index.css) · [`tailwind.config.js`](../tailwind.config.js) · fonts in [`app/layout.tsx`](../app/layout.tsx)  
**Research:** [`DESIGN_RESEARCH.md`](DESIGN_RESEARCH.md)  
**Build:** `2026.07-unified.83`+ (Wave 4 in-app elevation)

---

## Principles

1. **Mission briefing** — mono eyebrow → display title → one emerald CTA
2. **Emerald = do it** · **Brass = earned it** · never competitor blue/violet identity
3. **One boss action** per screen (especially Today)
4. **Clinical metrics, not gamification** — tabular nums, quiet labels, lucide over emoji
5. **Match chrome to task** — Train dense; Today sparse; marketing product-in-hero

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

Utility classes: `glass-nav`, `content-card`, `card-elevated`, `card-glow-emerald`, `card-glow-brass`, `primary-action`, `eyebrow`, `eyebrow-live`, `eyebrow-honor`, `display-hero`, `display-section`, `display-mega`, `section-index`, `briefing-rule`, `pressable-card`, `ring-draw-in`, `score-tick`, `section-seam`.

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

---

## Typography

| Role | Class / font |
|------|----------------|
| Hero | `.display-hero` — Barlow Condensed |
| Section / page title | `.display-section` |
| Eyebrow / telemetry | `.eyebrow` — IBM Plex Mono |
| Body | Inter (`font-sans`) |
| Numbers | `tabular-nums` always on weights, reps, timers, scores |

---

## Components

| Component | Path | Use |
|-----------|------|-----|
| **ProgressRing** | `src/components/ui/ProgressRing.tsx` | Today + Fuel + demos (canonical) |
| ScoreRing / MetricRing | adapters → ProgressRing | Legacy call sites |
| **PillarPageHeader** | briefing anatomy (eyebrow optional) | All pillar + info pages |
| **PillarPageShell** | stagger + header + children | In-app pillars |
| **InfoPageShell** | info/marketing in app chrome | About, legal, etc. |
| **MarketingNav / Footer** | `src/components/marketing/` | Landing + Bundle chrome |
| **PublicSeoHeader / Footer** | `src/components/public/` | Guide, exercises, compare, paths |
| **Reveal / StatBand** | `src/components/marketing/` | Landing motion + telemetry |
| **EmptyState** | dashed invite + CTA | First-week empties |
| **primary-action** | CSS class | Journey / conversion CTAs |

---

## Shell rules

| Surface type | Shell |
|--------------|--------|
| In-app pillars | `PillarPageShell` |
| Today `/log` | Custom command layout (not PillarPageShell) |
| Landing, Welcome, Guide, Exercises | Standalone marketing chrome |
| Compare, Bundle | Prefer marketing chrome (out of AppLayout when practical) |
| Train `/active` | Header + dense logger; keep set-table internals |

---

## Motion

- CSS-first, 200–450ms, `prefers-reduced-motion` gates all entrance animations
- `score-tick` on ring center values; `ring-draw-in` on ring mount
- Press: `.pressable-card` / `primary-action` active scale

---

## Do not

- Cream + serif + terracotta, purple glow, broadsheet hairlines
- Ad-hoc amber/blue skins without mapping to `--status-*` or brass
- Multiple primary CTAs above the fold on Today or Landing
