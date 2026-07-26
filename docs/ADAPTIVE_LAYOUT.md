# Adaptive layout — window size classes

Cross-surface rules for web PWA + Android Compose. Prefer **width** over orientation (unfolded foldables → Expanded).

## Size classes

| Class | Web (Tailwind) | Android (`MwWidthSizeClass`) | Overlay |
|-------|----------------|------------------------------|---------|
| Compact | `< md` (~640px) | `< 600dp` | Bottom sheet, full width |
| Medium | `md`–`xl` | 600–839dp | Centered dialog (`max-w-xl` / ~560dp) |
| Expanded | `xl+` | ≥840dp | Wider dialog (`max-w-3xl` / ~720dp); optional two-column body |

## Web

- Primitive: [`src/components/ui/AdaptiveOverlay.tsx`](../src/components/ui/AdaptiveOverlay.tsx)
- **Must portal to `document.body`** — AppLayout uses `h-screen overflow-hidden` + scrollable `main`; in-tree `fixed` sheets clip under MobileNav
- Body scroll lock while open; default z-index above MobileNav (`z-50`) and consent banner (`z-60`) → `z-[70]`
- Pilots: Fuel log, session check-in, plate calculator, coach adjust
- Victory uses existing Dialog with wider `md`/`xl` max-width

### Sheet anatomy (Modernist, wave D6)

Bottom-anchored, `max-height` 85–88%, `--card` ground, **2px ink top rule** — that
rule is the sheet affordance; the 30%-alpha drag pill it replaced was invisible at
arm's length and said nothing a rule does not.

| Region | Rule |
|---|---|
| Header | Pinned 16px block. 11px/600 caps eyebrow over a 22px/800 title, 44px 2px-ruled close. |
| Body | The only scroll region. |
| Footer (`footer` prop) | Pinned, 2px top rule, holds **one** primary action at 52px. |

The footer sits inside the panel, so the panel's `env(safe-area-inset-bottom)`
padding already lifts it clear of the home indicator — do not add a second inset.

Any neutral tag **inside** a sheet needs a rule, not a fill: `neutral-200`
(`#eae7e7`) is 1.01:1 against the `#eae9e9` sheet ground, so `Badge
variant="secondary"` disappears there even though it reads fine on paper.
- Shell: [`AppLayout`](../src/components/layout/AppLayout.tsx) `xl:max-w-4xl 2xl:max-w-5xl` (readable measure, not magazine sprawl)

## Android

- `MwWidthSizeClass` + `rememberMwWidthSizeClass()` — [`MwWindowSize.kt`](../apps/android/core/designsystem/src/main/java/com/missionwinning/core/designsystem/MwWindowSize.kt)
- `MwAdaptiveOverlay` — compact bottom sheet / medium+ `Dialog` — [`MwAdaptiveOverlay.kt`](../apps/android/core/designsystem/src/main/java/com/missionwinning/core/designsystem/MwAdaptiveOverlay.kt)
- `MwConfirmSheet` + Active plate calculator use `MwAdaptiveOverlay` (wedge path)
- Gallery demo: Design system screen (debug)

## Do / don’t

- Do: migrate new modal chrome through AdaptiveOverlay / MwAdaptiveOverlay
- Don’t: hardcode `items-end` + `max-w-lg` phone sheets for desktop-only flows
- Don’t: multi-pane dashboard every route — overlays + shell width first

## Related

- [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) · [apps/android/UX.md](../apps/android/UX.md)
