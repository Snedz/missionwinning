# src/lib/places/

> One concern: Explore pins, optional nearby, personal place-dex. Logging a set never needs a place.

Frozen spec: [docs/places/PLAN.md](../../../docs/places/PLAN.md).

## Files

| File | Role |
|------|------|
| `types.ts` | Pin shape; coords optional |
| `examplePublicPlaces.ts` | Four uncontested example parks |
| `placeDex.ts` | Device-local personal pins + after-set session tag |
| `nearby.ts` | Haversine sort when GPS is granted |
| `plot.ts` | Lat/lng → paper-board percents (no tiles) |
| `openInMaps.ts` | OSM query URL |

## Do not

- Import rewards / leaderboard / social (planner boundary)
- Call geolocation from `logSet` / `completeActiveWorkout`
- Add gym-war / takeover / likes / public-rank fields
