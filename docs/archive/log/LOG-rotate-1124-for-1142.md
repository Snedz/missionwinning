## 2026-10-12 — `npm run verify` merge gate (`.1124`)

One command an agent must pass before calling work done: `npm run verify` runs check-build-label → typecheck → lint → test → build, then boots `next start` and asserts `GET /api/health` returns `ok: true`. It prints a PASS/FAIL summary and exits non-zero on any failure (`verify:fast` skips build + health).

Added `docs/agents/DONE_CONTRACT.md` (what done means: verify PASS pasted in the PR, green CI, one PR per card, proof, rails, 3-strike stop) and `docs/agents/TEST_AUDIT.md` (authoring gate + junk patterns, adapted from openclaw/openclaw `test-audit`, MIT). AGENTS.md links both.

Label `2026.07-unified.1124`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1105-for-1124.md](docs/archive/log/LOG-rotate-1105-for-1124.md) (`.1105`), for the ≤15 entry budget.
