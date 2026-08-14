## 2026-08-12 — Production smoke ratchet: legal floors + /compare redirect (`.692`)

Tip already had English floors for privacy/terms (`.653`) and permanent
`/compare` → `/welcome` (`.668`); live Production is still on `.618` and fails
all three smokes (raw `infoPrivacy*` / `infoTerms*` paint; Hevy/Strong hub at
200). One-concern optional smoke ratchet so tip cannot regress — does **not**
redo the product fixes:

- `productionSmokeRatchet.test.ts` — discover Privacy/Terms keys → `infoEnFloor`
  ≠ raw key; parse `next.config.js` redirects (`/compare`, `/compare/:path*`,
  permanent → `/welcome`); pages must wire `infoEnFloor` as `defaultValue`.
- `gate-smoke` — curl `/compare` + `/compare/forge` redirect; `/privacy` +
  `/terms` refuse HTML text-node raw keys (`>infoPrivacy…<`).
- Hero e2e covers hub index + story path.

Verified: 2 mutants killed (drop `/compare` rule; floor Overview to its key);
gate-smoke against www fails the four new checks on `.618` as expected.
Label `.692` (rebases onto tip `.691` after #453/#462).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-663-for-692.md](docs/archive/log/LOG-rotate-663-for-692.md). · [`.691` for `.750`](docs/archive/log/LOG-rotate-691-for-750.md).
