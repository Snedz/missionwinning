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
- Pilots: Fuel log, session check-in, plate calculator, coach adjust
- Victory uses existing Dialog with wider `md`/`xl` max-width
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
