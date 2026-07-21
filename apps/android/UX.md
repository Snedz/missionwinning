# Android UX notes — Mission Winning

**Product path:** Compose wedge (Train + Coach).  
**Overhaul plan:** session plan (Phases 0–4). This file is the short in-repo reference.

## Principles

1. **App chrome** — bottom nav on Today / Coach only; Active / Victory / I-Day immersive.  
2. **Cards over naked text** — navy elevated surfaces, emerald action, brass honor.  
3. **Logger is the product** — current-set card, steppers, rest dock, one primary complete.  
4. **Offline honesty** — “ON DEVICE · SYNC LATER” pill; Room is SoT.  
5. **One thumb** — 48dp targets, TalkBack on primaries.

## Typography

| Role | Style |
|------|--------|
| Display / hero | Barlow Condensed ExtraBold |
| Body | Inter |
| Eyebrow / metrics | IBM Plex Mono |

## Components (designsystem)

`MwCard`, `MwChip`, `MwTopBar`, `MwBottomNav`, `MwSessionTile`, `MwEmptyState`, `MwLoadingBlock`, `MwOfflinePill`, `MwMetricCard`, `MwStepper`, `MwRestDock`, `MwConfirmSheet`, plus buttons / set row / rest timer.

## Wedge flow

I-Day (3 steps or skip) → Today → Active → Victory → Coach (or Today).

## Verify

```bash
./gradlew :app:assembleDebug
./gradlew :feature:active:testDebugUnitTest
# maestro test .maestro/wedge.yaml
```
