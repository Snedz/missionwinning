# Transparency — Visibility + Under the Hood (`.729`)

Excellence-Override: X-style why-this transparency report.

Account ships two surfaces. **Visibility** lists whether anything is limited and the exact reason. **Under the Hood** publishes BOOSTS / PENALTIES as a dark tabular card. Download (JSON + text) is the same report object: reasons, weights, and labels on this athlete.

## Routes

| URL | Page |
|---|---|
| `/account/transparency` | Visibility — N limits apply / each check + reason |
| `/account/under-the-hood` | Scoring weights — BOOSTS / PENALTIES |

Entry: Account card (after sign-in), with downloads on the card.

## Visibility rows (exactly these)

| id | Status when it applies | What it states |
|---|---|---|
| `logger` | always `open` | Offline, no account, never paywalled. |
| `access` | `gated` if PRIVATE_MODE | Invite/access-code launch gate, or open. |
| `region` | `limited` if hosted signup blocked | Named policy via `supportedRegions.ts`. Logger is not region-gated. |
| `coach` | `skipped` if no week | Skippable. Why-line from `buildWeekRationale`. Planner reads logs only. |
| `score` | always `hidden` | Mission Score / XP stay on this device. |
| `bundle` | `limited` if checkout muted | Notify only until Stripe. |

## Under the Hood

**BOOSTS (live)** = `src/lib/rewards/catalog.ts` (`XP_BY_ACTION` + caps). Source line: `src/lib/rewards/catalog.ts • defaults`.

**BOOSTS (Club planned)** = `docs/CLUB_PLAN.md` v1 (session +10, coach-plan +5, …). Labeled planned. Not awarding today.

**PENALTIES** = report / mute / block / hide. Visibility filters. Display: `does not debit points`. No ROOM SCORE table exists — do not invent magnitudes. Never “you lost N pts”.

Do not clone another product’s chrome or mascot. Do not treat another product’s ranking scores as XP.

## Download

JSON + text from the same report: rows, earn table, `boosts`, `clubPlannedBoosts`, `penalties`, `athleteLabels`, `sources`.

## Refuse

- Impressions, feed ranking, hiding other users
- Paying people to talk / treating foreign ranking scores as XP
- Standing on the log path
- Claiming we hide posts
- EIN work, `PRIVATE_MODE` production flip, invite-only product change

## Tests

- Copy-guard on lib + pages + panel
- Every gated/hidden/limited/skipped fixture has a reason
- Download includes weights + athlete labels
- Live boosts match catalog; Club session/coach-plan match CLUB_PLAN; penalties never debit
- `check-build-label` `.729`

## Help

`docs/help/privacy-and-data.md` — Visibility + Under the Hood. Mission Server: replies from people you trained with beat likes; likes are weak.
