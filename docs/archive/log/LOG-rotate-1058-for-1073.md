# Rotated from LOG.md for `.1073`

## 2026-08-30 — Train does not mint a Coach week (`.1058`)

`/active` no longer mounts
`useCoachPlan`. That hook
auto-calls `generateWeek` on
mount, so a Today Start that
lands Train was minting a week
as a side effect. Volume trim
in Show all now reads/writes
the stored plan only
(`trimTodayVolume.ts`). Generate
stays the week writer on
`/coach`. Today Start still
writes then `/active`. Log set
stays filled. Finish stays
outline. Park leftover PR #889.
`[skip vercel]`. No
`PRIVATE_MODE` flip. No promote.
Live www stays `.696`.

Label `2026.07-unified.1058`
(from master `.1057` /
`f302f40f`). Stamp `.1058`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1041-for-1058.md](docs/archive/log/LOG-rotate-1041-for-1058.md).
