# Public GitHub — founder Settings clicks

**Agents never flip repository visibility.** This page is a checklist for the human who owns GitHub Settings. Product posture: [OPEN_SOURCE.md](OPEN_SOURCE.md) · secrets: [SECRETS.md](SECRETS.md) · dual-repo: [DUAL_REPO.md](DUAL_REPO.md).

Public name after the flip: **Beta 0.1** / **Mission Winning 0.1 (beta)**. That is not a claim that `PRIVATE_MODE` is off — the site gate stays founder-owned.

## Before Public

1. This product tree is the public repo (`Snedz/missionwinning`). War room stays in private `Snedz/mission-ops`.
2. Stubs still stubs (`RELOCATED_TO_MISSION_OPS`). `.hermes/` and `ops/` untracked.
3. `npm run secrets:scan` clean (0 findings).
4. Do not commit EIN, Stripe live keys, deploy hooks, or personal email.

## GitHub Settings (you click these)

1. **Settings → General → Danger zone → Change repository visibility → Public.**
2. **Settings → Code security → Secret scanning** — on.
3. **Push protection** — on (blocks commits that look like secrets).
4. **Topics** (About → gear): `agpl-3.0`, `pwa`, `fitness`, `nextjs`, `offline-first`.
5. Confirm the LICENSE file is AGPL-3.0 and the README badges resolve.

## Do not flip with visibility

| Flag | Owner | This checklist |
|------|--------|----------------|
| `PRIVATE_MODE` | Founder (Vercel env) | Unchanged |
| `FREE_BETA` | Founder | Unchanged |
| Production Stripe live | Founder after EIN | Not this click |

`PRIVATE_MODE` is the **site** gate. GitHub Public is the **source** offer. They are not the same switch.
