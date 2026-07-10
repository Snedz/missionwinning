# Design system — Mission Winning

**Runtime source:** [`src/index.css`](../src/index.css) · [`tailwind.config.js`](../tailwind.config.js) · fonts in [`app/layout.tsx`](../app/layout.tsx)  
**Research:** [`DESIGN_RESEARCH.md`](DESIGN_RESEARCH.md)  
**Build:** `2026.07-unified.50`+

---

## Principles

1. **Mission briefing** — mono eyebrow → display title → one emerald CTA
2. **Emerald = do it** · **Brass = earned it** · never competitor blue/violet identity
3. **One boss action** per screen (especially Today)
4. **Clinical metrics, not gamification** — tabular nums, quiet labels
5. **Match chrome to task** — Train dense; Today sparse; marketing product-in-hero

---

## Tokens

| Token | Role |
|-------|------|
| `--background` / `--foreground` | Navy canvas / primary text |
| `--card` / `--border` | Solid content surfaces |
| `--primary` / `--accent` | Emerald action |
| `--brass` | Honor, PR, founders, rank |
| `--status-warn` | Strain / caution (prefer over raw amber) |
| `--status-info` | Recovery / info (prefer over raw blue) |
| `--status-danger` / `--status-ok` | Risk / success |

Utility classes: `glass-nav`, `content-card`, `dashboard-panel`, `primary-action`, `eyebrow`, `eyebrow-live`, `eyebrow-honor`, `display-hero`, `display-section`, `briefing-rule`, `pressable-card`, `ring-draw-in`, `score-tick`.

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
