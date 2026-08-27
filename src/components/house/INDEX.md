# src/components/house/

> Signed-in product house — icon rail, desk, compose sidecar. Not AppLayout.

| File | Purpose |
|------|---------|
| `HouseShell.tsx` | Root signed-in chrome. Journey sync + outbox drain stay mounted. |
| `HouseIconRail.tsx` | Left icon rail (desktop) and floor icons (compact). No group headers. |
| `houseNav.ts` | Rail hrefs. `/server` is never here. |
| `house.css` | House visual language, scoped to `.mw-house`. |
| `TodayDesk` | Lives in `src/page-components/TodayDesk.tsx` — one Start, week as work. |
| `CatalogTabs.tsx` | Library + Builder state tabs. |
| `TrainSidecar.tsx` | Session settings beside the set table. |
| `AccountSidecar.tsx` | Settings room links. |

Do not import `Sidebar`, `MobileNav`, `AppHeader`, `RAIL_GROUPS`, or `HomeTodayLean`.
