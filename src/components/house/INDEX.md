# src/components/house/

> Signed-in product house — icon rail, desk, compose sidecar. Not AppLayout.

| File | Purpose |
|------|---------|
| `HouseShell.tsx` | Root signed-in chrome. Journey sync + outbox drain stay mounted. Desktop wraps second + canvas in `.house-sheet`. |
| `HouseIconRail.tsx` | Left icon rail (desktop) and floor icons (compact). Account avatar + hover labels. |
| `HouseSecondRail.tsx` | Left column next to the icon rail (`grid-column: 2`). Home rooms or Library objects. Week pane is the real week + `/coach` (`generateWeek`). Not More. |
| `HousePane.tsx` | Pane context + visit ticks (week / History). Home click closes the pane. |
| `HouseGuide.tsx` | One first-run coach-mark. Got it / X dismiss. No popup chain. |
| `HouseFirstRoomsCard.tsx` | Persistent collapsible N-of-N under Start. Three MW rows. |
| `houseFirstRooms.ts` | Inferred ticks + lock for the three first rooms. |
| `HouseMore.tsx` | Leftover rooms only (Fuel / You / Account + quiet pillars + Garage). Not the Home second bar. |
| `houseNav.ts` | Rail hrefs + Today/Library rooms + More leftovers. `/server` is quiet More only. |
| `DESIGN.md` | House design system — tokens, type, layout, motion, rooms. Field-manual stays on `/private` / www. |
| `house.css` | Runtime for that system, scoped to `.mw-house`. Transferred rooms hide the old pillar header. |
| `TodayDesk` | Lives in `src/page-components/TodayDesk.tsx` — one Start, week as work. |
| `TrainComposeEmpty.tsx` | Victory-only empty canvas. Cold `/active` is the live compose (set table + Log set) — persist does not own Log set. Never Restoring session. |
| `TrainSidecar.tsx` | Live session settings: rest, skip, jot. |
| `AccountSidecar.tsx` | Settings room links. |

Do not import `Sidebar`, `MobileNav`, `AppHeader`, `RAIL_GROUPS`, or `HomeTodayLean`.
