# DESIGN_REVIEW.md — hero-flow audit checklist

Recurring pass over the five hero flows. Findings become GitHub Issues (one screen per Issue, Android-lane style); **only hero-bug-level fixes land in Horizon 0** — everything else waits ([../ORCHESTRATION.md](../ORCHESTRATION.md)). Companions: [brand-guidelines.md](brand-guidelines.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md).

## Flows under review

1. Landing `/` → Welcome → private gate
2. I-Day onboarding → first Today
3. Today `/log` (Mission Score, next session)
4. Active `/active` → set logging → Victory
5. Coach `/coach` (plan + adapt banner)

Review on a 390×844 phone viewport first (the Playwright target); desktop second.

## Checklist (per screen)

### Brand voice
- [ ] Mission-briefing anatomy: mono eyebrow → condensed display title → one clear action. No gym-bro hype, no paywall shame bait.
- [ ] Copy leads with the wedge (logger + Mission Coach), pillars below the fold.

### Color semantics
- [ ] Emerald = the one "do this now" action; **exactly one primary CTA above the fold**.
- [ ] Brass = earned things only (PRs, streaks, founders) — never decorative.
- [ ] Status colors map to `--status-*` tokens; no ad-hoc amber/blue; no competitor blue/violet.

### Card tier ladder
- [ ] ≤1 `card-elevated` and ≤1 glow (`card-glow-emerald`/`brass`) per screen.
- [ ] Dense/repeated rows stay on base `Card`; textures off dense app screens.

### Metrics & type
- [ ] All numerals `tabular-nums`; units in mono labels; no jitter on tick.
- [ ] Type scale: Barlow Condensed display / Inter body / IBM Plex Mono labels — no new fonts, no faux weights.

### Motion & feedback
- [ ] Durations/easing per [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) § Motion; `prefers-reduced-motion` respected.
- [ ] Every tappable surface has press feedback; touch targets ≥44px (`tap-target`).
- [ ] No layout shift on data load — skeletons reserve space.

### States
- [ ] Empty state = dashed invite + CTA (`EmptyState`), not a blank void.
- [ ] Error state is recoverable and phrased as a briefing, not a stack trace.
- [ ] Loading, offline, and unauthorized each render intentionally (PWA offline shell).

### i18n & a11y
- [ ] Longest locale strings (de, pt) don't overflow or wrap-break the layout.
- [ ] RTL (ar) spot-check on the screen's flex/grid direction.
- [ ] Focus order sane; interactive elements labeled (axe-core `npm run a11y` green).

### Destructive actions
- [ ] Anything irreversible uses HoldToConfirm + DangerZone geography ([DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md)).

## Cadence

- Full pass before any public flip; then quarterly (pairs with the a11y quarterly in the standing queues).
- Log each pass: date + flows covered + Issues filed, appended below.

## Passes

| Date | Reviewer | Flows | Issues filed |
|------|----------|-------|--------------|
| 2026-07-21 | Agent (Horizon 0) | `/`→gate, Welcome, `/log`, `/active`→Victory, `/coach` | Fixed in-sprint (no separate Issues): invite→`/private` friction; gate invitee expand; beta guide/banner wedge (Train→Coach); Coach empty-state “Unlock” vs Generate mismatch; ES/FR gate “everything app” subtitle → wedge. Deferred post-flip: landing hero proof-chip density; i18n Batch C. |

### 2026-07-21 pass notes

- **Phone viewport target:** 390×844 (code + live `/private` smoke; invitee UX ships with this commit — prod still shows waitlist-first until deploy).
- **Brand / wedge:** Gate + beta surfaces now lead with logger + Mission Coach, not rankings/languages/everything-app.
- **CTA:** Invitee path puts access-code form first; cold traffic keeps waitlist primary.
- **Do not redesign:** Landing layout, card tiers, new sections left untouched.
