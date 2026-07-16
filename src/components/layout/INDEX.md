# src/components/layout/

> App shell — nav, headers, footers, page wrappers.

## Components

| File | Purpose |
|------|---------|
| `AppLayout.tsx` | Main app chrome + journey sync |
| `AppHeader.tsx` | Top bar, title from navConfig |
| `Sidebar.tsx` | Desktop nav |
| `MobileNav.tsx` | Bottom tab bar |
| `PillarPageShell.tsx` | Standard pillar page wrapper |
| `PillarPageHeader.tsx` | Pillar title + actions |
| `InfoPageShell.tsx` | Legal/marketing pages |
| `InfoPageFooter.tsx` | Info footer links |
| `AppLegalFooter.tsx` | In-app legal links |
| `LegalNav.tsx` | Privacy/terms nav |
| `HeaderAuthChip.tsx` | Sign-in avatar chip |
| `PageTransition.tsx` | Route transition animation |
| `StaggerReveal.tsx` | Staggered entrance motion |
| `OnlineStatusBanner.tsx` | Offline/sync banner |
| `AnalyticsConsentBanner.tsx` | First-visit product analytics choice (private by default) |

## Related

| Layer | Path |
|-------|------|
| Nav config | `navConfig.ts` |
| Routes | `app/(app)/layout.tsx` |
