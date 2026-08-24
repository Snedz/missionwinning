# Public Alpha snapshot

> One concern: filter the working tree into a progress-report copy for `Mission-Winning/missionwinning`. Not a cutover. Origin stays `Snedz/missionwinning`.

## Command

```bash
npm run snapshot:public
# or:
node scripts/export-public-snapshot.mjs --out ../missionwinning-public-snapshot --git --force
```

Default destination is a **sibling** directory: `../missionwinning-public-snapshot` (outside this repo). `--force` replaces the files. `--git` inits an orphan commit. If the dest already had a remote pointing at `Mission-Winning/missionwinning`, that remote is restored. **Does not push. Does not change this tree's `origin`.**

## Keep / drop

Keep: product (`src/`, `app/`, `apps/`, `packages/`, `tests/`, `scripts/`, `supabase/`, `.github/`), product docs, **all tests**, `docs/archive/` (rotation history the unit tests require).

Drop: root leftover `PLAN.md` / `IMPROVEMENT_LOG.md`, overnight/places/plans hop folders, gauntlet PNGs, design stills and variant HTML. Keep `docs/design/concepts/*.html` (unit tests read them). Secrets and `ops/` are gitignored and also refused.

Deny rules: [deny.mjs](deny.mjs) · tests: [deny.test.mjs](deny.test.mjs). Snapshot README overlay: [README.snapshot.md](README.snapshot.md).
