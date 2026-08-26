# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: residual-history-empty-load-volume
done_means: History list row and session detail print working reps for an empty-load session, not 0 kg.
accept: npx tsx --test src/lib/historyEmptyLoadVolume.test.ts src/lib/workout/volumeDisplay.test.ts
test_written: yes

## progress

Tests written first (4 red). Helper + History list/detail wired. Tests 8/8.

## decisions

- Reuse Victory helper `formatWorkoutVolumeDisplay` / `sumWorkingReps`. Display only.
- Career briefing + avg volume stay kg-honest (`summary.totalVolume`). Do not mix units.
- Today chrome untouched. Store still `weight: 0`.
- Not a GRAPH_LOOP letter. VISION stays ready-for-founder.
- Citation `.1023` / heatmap `.1022` / chat `.1021` stay. This hop stamps `.1024` from master `.1023` (`825bd9fc`).
