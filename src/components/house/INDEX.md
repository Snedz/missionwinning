# src/components/house/

> Signed-in product house — icon rail, desk, compose sidecar. Not AppLayout.

| File | Purpose |
|------|---------|
| `HouseShell.tsx` | Root signed-in chrome. Journey sync + outbox drain stay mounted. |
| `HouseIconRail.tsx` | Left icon rail (desktop) and floor icons (compact). Account avatar + hover labels. |
| `HouseSecondRail.tsx` | Adjacent left column: Today rooms or Library objects. A deeper step may replace this bar with a back-chevron pane. Not More. |
| `HousePane.tsx` | Pane context + visit ticks (week / History). Home click closes the pane. |
| `HouseGuide.tsx` | One first-run coach-mark. Got it / X dismiss. No popup chain. |
| `HouseFirstRoomsCard.tsx` | Persistent collapsible N-of-N under Start. Three MW rows. |
| `houseFirstRooms.ts` | Inferred ticks + lock for the three first rooms. |
| `HouseMore.tsx` | Compact leftover. Not the Home second bar. Garage is locked with a why-tooltip. |
| `houseNav.ts` | Rail hrefs + Today/Library rooms. `/server` is never here. |
| `house.css` | House visual language + short eased motion, scoped to `.mw-house`. |
| `TodayDesk` | Lives in `src/page-components/TodayDesk.tsx` — one Start, week as work. |
| `CatalogTabs.tsx` | Library + Builder object tabs. |
| `TrainComposeEmpty.tsx` | Cold `/active` canvas. Same start engines as ActiveEmptyState. |
| `TrainSidecar.tsx` | Live session settings: rest, skip, jot. |
| `AccountSidecar.tsx` | Settings room links. |

Do not import `Sidebar`, `MobileNav`, `AppHeader`, `RAIL_GROUPS`, or `HomeTodayLean`.
