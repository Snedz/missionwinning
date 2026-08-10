## 2026-08-09 — Victory next-action single source (`.641`)

mw-core `pickVictoryNextAction` was missing week-1 **session 2** (always sent first-log athletes to Coach). Aligned with web Horizon W / `.412`: completedWorkouts===1 → `/active` session-2 CTA; early window → Coach; high strain → Mind post-train. Web `workoutVictory` **re-exports** the core function — one definition. Guard test `victorySingleSource.test.ts` locks web↔core agreement.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-641.md](docs/archive/log/LOG-rotate-641.md).

