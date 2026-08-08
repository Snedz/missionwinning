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
npm run ops:sync         # refresh strategy copies (never overwrites full memos with stubs)
```

Cold start for any model: `ops/CONTINUITY/INDEX.md` + `ops/CONTINUITY/CURRENT.md`.

Product agents without ops mounted still use CONTEXT → AGENTS → INDEX → ORCHESTRATION.
