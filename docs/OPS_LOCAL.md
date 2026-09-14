# Local private ops (mission-ops)

**Not in product git.** After clone, founder/agents with access use the private war room separately.

| Item | Detail |
|------|--------|
| **GitHub** | [github.com/Snedz/mission-ops](https://github.com/Snedz/mission-ops) (PRIVATE) |
| **Local staging** | `ops/` at product repo root (gitignored) |
| **Policy** | [CLASSIFICATION.md](CLASSIFICATION.md) · [DUAL_REPO.md](DUAL_REPO.md) |

## Continuity + dashboard

```bash
# clone or sync private ops into ./ops, then:
npm run ops:dashboard    # Mission Control UI → http://localhost:5173
npm run ops:session -- "title"   # scaffold a diary session
npm run ops:sync         # copy strategy docs; never overwrites a living file
npm run ops:sync -- --force      # regenerate the generated templates on purpose
```

Cold start for any model: `ops/CONTINUITY/INDEX.md` + `ops/CONTINUITY/CURRENT.md`.

**Intel brain** (named research, store stills, steal/avoid): `ops/intel/INDEX.md` → `SYNTHESIS.md` → `WIREFRAME.md` → `patterns/`. Product code never imports this tree.

After an intel wave: `cd ops && git add intel && git commit && git push` to private `mission-ops`. Never stage `ops/` in the product repo.

## Guards on the ops boundary

| Guard | Where | What it refuses |
|-------|-------|-----------------|
| `ops` in the product index | CI (`ci.yml`, before `npm ci`) | `git add -f ops` — the ignore file is not a lock |
| Continuity index | `ops/scripts/check-continuity.mjs` via `core.hooksPath` | a `sessions/*.md` missing from `DIARY.md`, or a row pointing at a missing file |
| Names denylist | `npm run names:check` | a denied product name in tracked product files |

`ops:sync` writes its five generated templates **only when absent**. Three of them
are not templates — the ops README is the real war-room index, and
`FOUNDER_CRITICAL_PATH.md` carries founder data. Overwriting them from a hardcoded
literal is silent data loss, so `--force` is opt-in.

`names:check` reads `ops/intel/NAME_DENYLIST.md` when mounted and fails if a denied
name is in tracked product files. It scans via `git grep`, not a per-file read loop.
It is deliberately **not** wired into CI (no ops mount there → always exits 0) and
**not** wired into `pre-push`: as of 2026-09-14 it reports 142 hits, almost all of
them the shipped CSV-import dialect, so a hook would block every push and teach
`--no-verify`. Resolve the denylist scope first, then wire it.

Product agents without ops mounted still use CONTEXT → AGENTS → INDEX → ORCHESTRATION.
