# src/components/house/

> Signed-in product house — icon rail, desk, compose sidecar. Not AppLayout.

| File | Purpose |
|------|---------|
| `HouseShell.tsx` | Root signed-in chrome. Journey sync + outbox drain stay mounted. |
| `HouseIconRail.tsx` | Left icon rail (desktop) and floor icons (compact). Account avatar on the rail. |
| `HouseMore.tsx` | Rest of the house. Not the WEDGE MoreSheet. `/server` is a quiet foot only. |
| `houseNav.ts` | Rail hrefs. `/server` is never here. |
| `house.css` | House visual language, scoped to `.mw-house`. |
| `TodayDesk` | Lives in `src/page-components/TodayDesk.tsx` — one Start, week as work. |
| `CatalogTabs.tsx` | Library + Builder object tabs. |
| `TrainComposeEmpty.tsx` | Cold `/active` canvas. Same start engines as ActiveEmptyState. |
| `TrainSidecar.tsx` | Live session settings: rest, skip, jot. |
| `AccountSidecar.tsx` | Settings room links. |

Do not import `Sidebar`, `MobileNav`, `AppHeader`, `RAIL_GROUPS`, or `HomeTodayLean`.
