# src/components/house/

> Signed-in product house — icon rail, desk, compose sidecar. Not AppLayout.

| File | Purpose |
|------|---------|
| `HouseShell.tsx` | Root signed-in chrome. Journey sync + outbox drain stay mounted. |
| `HouseIconRail.tsx` | Left icon rail (desktop) and floor icons (compact). Account avatar + hover labels. |
| `HouseSecondRail.tsx` | Adjacent left column: Today rooms or Library objects. Not More. |
| `HouseGuide.tsx` | First-run Got it marks on the second rail and Start. |
| `HouseMore.tsx` | Compact leftover. Not the Home second bar. `/server` is a quiet foot only. |
| `houseNav.ts` | Rail hrefs + Today/Library rooms. `/server` is never here. |
| `house.css` | House visual language, scoped to `.mw-house`. |
| `TodayDesk` | Lives in `src/page-components/TodayDesk.tsx` — one Start, week as work. |
| `CatalogTabs.tsx` | Library + Builder object tabs. |
| `TrainComposeEmpty.tsx` | Cold `/active` canvas. Same start engines as ActiveEmptyState. |
| `TrainSidecar.tsx` | Live session settings: rest, skip, jot. |
| `AccountSidecar.tsx` | Settings room links. |

Do not import `Sidebar`, `MobileNav`, `AppHeader`, `RAIL_GROUPS`, or `HomeTodayLean`.
