# src/components/layout/

> App shell — nav, headers, footers, page wrappers.

## Components

| File | Purpose |
|------|---------|
| `AppLayout.tsx` | Main app chrome + journey sync |
| `AppHeader.tsx` | Top bar, title from navConfig |
| `Sidebar.tsx` | Desktop nav |
| `MobileNav.tsx` | Bottom tab bar — **five slots**, in flow (not fixed) so it reserves its own height |
| `MoreSheet.tsx` | The fifth tab: the nine signed-in screens with no tab, from `railGroupsForNav()` |
| `ScreenDock.tsx` | The field a screen docks above the tab bar. **Portals to a flex sibling of `main`** — `position: fixed` does not work inside a screen (`.stagger-enter` leaves a transform, and a transformed ancestor becomes the containing block), and a flex sibling reserves its own height |
| `PillarPageShell.tsx` | Standard pillar page wrapper |
| `PillarPageHeader.tsx` | Pillar title + actions |
| `InfoPageShell.tsx` | Legal/marketing pages |
| `InfoPageFooter.tsx` | Info footer links |
| `AppLegalFooter.tsx` | In-app legal links |
| `LegalNav.tsx` | Privacy / terms / DMCA nav |
| `HeaderAuthChip.tsx` | Sign-in avatar chip |
| `PageTransition.tsx` | Route transition animation |
| `../ui/AdaptiveOverlay.tsx` | Compact bottom sheet / md+ centered dialog |
| `StaggerReveal.tsx` | Staggered entrance motion |
| `OnlineStatusBanner.tsx` | Offline/sync banner |
| `AnalyticsConsentBanner.tsx` | First-visit product analytics choice (private by default) |

## Related

| Layer | Path |
|-------|------|
| Nav config | `navConfig.ts` |
| Routes | `app/(app)/layout.tsx` |
