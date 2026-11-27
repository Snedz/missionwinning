# Working on Mission Winning

- Keep guest logging ungated. Build the Today → Train → Victory → Coach → History loop before adding surfaces.
- Keep portable logic in `packages/core`, browser state and UI in `apps/web`. Read [ARCHITECTURE.md](ARCHITECTURE.md) and [MIGRATION.md](MIGRATION.md) before changing persistence.
- Never call `localStorage` directly. Use `safeStorage`. For calendar days and week keys use `localDateKey` and `localWeekKey`; ISO strings are for instants.
- Preserve exercise IDs and existing backup/data contracts. New cloud writes, if introduced, must go through the durable outbox.
- Keep the paper/ink, Archivo, and zero-radius design. Run `npm run verify` before committing.
