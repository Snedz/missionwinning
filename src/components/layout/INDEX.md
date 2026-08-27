# src/components/layout/

> App shell — nav, headers, footers, page wrappers.

## Components

| File | Purpose |
|------|---------|
| `AppLayout.tsx` | Main app chrome + journey sync. Pads the shell by visualViewport keyboard overlap so Log set stays above the keys (G5). |
| `AppHeader.tsx` | Top bar, title from navConfig |
| `Sidebar.tsx` | Desktop nav; athlete chip is public version |
| `MobileNav.tsx` | Bottom tab bar — cold Summary + Search; live Train joins. In flow (not fixed) so it reserves its own height. Rooms: [docs/IA_SKELETON.md](../../../docs/IA_SKELETON.md) |
| `MoreSheet.tsx` | Search sheet: catalog field + pin-from-row for Fuel/Coach/Train + What’s New + First Steps |
| `ScreenDock.tsx` | The field a screen docks above the tab bar. **Compact only** — at `md+` it renders in place (see *Two surfaces* below). On compact it **portals to a flex sibling of `main`**: `position: fixed` does not work inside a screen (`.stagger-enter` leaves a transform, and a transformed ancestor becomes the containing block), and a flex sibling reserves its own height |
| `PillarPageShell.tsx` | Standard pillar page wrapper |
| `PillarPageHeader.tsx` | Pillar title + actions |
| `InfoPageShell.tsx` | Legal/marketing pages |
| `InfoPageFooter.tsx` | Info footer links |
| `AppLegalFooter.tsx` | In-app legal links + public version stamp (`Alpha 0.1.0`) + Changelog |
| `LegalNav.tsx` | Privacy / terms / DMCA nav |
| `HeaderAuthChip.tsx` | Sign-in avatar chip. F-017 (`.766` / `.762`): hidden until the first workout; never on `/active`. `getUser` only when the chip may show. |
| `PageTransition.tsx` | Route transition animation |
| `../ui/AdaptiveOverlay.tsx` | Compact bottom sheet / md+ centered dialog |
| `StaggerReveal.tsx` | Staggered entrance motion |
| `OnlineStatusBanner.tsx` | Offline/sync banner |
| `AnalyticsConsentBanner.tsx` | First-visit product analytics choice (private by default); docks into the `ScreenDock` host so it never covers the logger (`.765`) |

## Two surfaces — read this before changing structure

There are **three design handoffs, and they describe three surfaces, not three
revisions of one product**:

| Handoff | Surface |
|---|---|
| `design_handoff_modernist_rebrand` | Landing / marketing, pre-sign-in (`.130`–`.138`) |
| `design_handoff_missionwinning_modernist` | **The desktop app** (`.139`–`.149`) |
| `design_handoff_mobile_app` | **The mobile app** (`.150`–`.158`) |

The screenshots in each bundle are **examples, not targets** — each design is
responsive within its own band. The only fixed number is the boundary: `md`
(768px), via [`useIsCompact()`](../../hooks/useIsCompact.ts).

**The handoff bundles ship HTML, not only screenshots.** When something looks
wrong, read the mock's markup — it carries exact numbers. Desktop Today is
`max-width:960px; padding:36px 44px 64px`, and its `.btn` is `inline-flex`.
That is how `.160` found Today capping itself at 512px on top of `AppLayout`'s
container.

**A structural change from one handoff is scoped to that handoff's surface.**
Tokens, primitives, a11y and bug fixes apply everywhere — those are the system.
Layout decisions (docking, tab bars, one console vs. per-set inputs, a picker
behind a sheet) are not. Applying the mobile handoff at every width in
`.150`–`.158` overwrote a desktop design that was already correct; `.159` put it
back. Do not re-flatten them.

## Related

| Layer | Path |
|-------|------|
| Nav config | `navConfig.ts` |
| Routes | `app/(app)/layout.tsx` |
