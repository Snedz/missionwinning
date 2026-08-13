# Transparency report — Why this (`.729`)

Frozen implementation plan. Build only this. **Not** an X Settings clone and **not** a For You ranker — we do not have one.

Excellence-Override: X-style why-this transparency report.

## Steal

On Account, a **Why this** report the athlete can open and **download** (JSON + plain text). Each row has a **plain reason** (no mystery sauce).

Route: `/account/transparency`. Entry: Account card (day-one stack, not only More settings).

## Rows (exactly these)

| id | What it states |
|---|---|
| `logger` | Offline, no account required, never gated by paywall. Always `open`. |
| `access` | `PRIVATE_MODE` / open-beta: whether this deploy is gated and why (invite/access-code launch gate, or open). Free-beta depth unlock is named here, not as suppression. |
| `region` | If hosted signup/checkout is blocked, name the existing policy (`canada` / `europe` / `oic` / `ukraine` / `unknown_edge`) via `supportedRegions.ts`. Logger is not region-gated. |
| `coach` | Skippable. Why this week’s sessions exist — reuse `buildWeekRationale` (log-cited). Planner blindness: Coach never reads rank / points / boards. |
| `score` | Publish the **live** earn table from `rewards/catalog.ts` (`XP_BY_ACTION` + `DAILY_ACTION_CAPS` + `DAILY_XP_SOFT_CAP`) as rows: event, points, cap. Club v1 table in `CLUB_PLAN.md` is planned, not live — say so. If a number is not public, say **private-to-self, not suppressed**. |
| `bundle` | Super Bundle: Get notified until Stripe (FREE_BETA mute and/or no live checkout). Not a shadowban. |

## Refuse

- X Settings UI, impressions, For You, shadowban of other users
- Paying people to talk / X-weights-as-XP
- Standing on the log path
- Claiming we suppress posts
- EIN work, `PRIVATE_MODE` production flip, invite-only product change

## Shape

Pure builder `src/lib/transparency/` (surface). Input is injectable (gate, free-beta, stripe, territory, coach rationale). Output is one report object. Download formatters read **that same object** — JSON and plain text must carry the same `reason` strings.

Statuses: `open` | `gated` | `hidden` | `limited` | `info`. Every row has a non-empty `reason`. Every `gated` / `hidden` / `limited` row has a reason (tested).

Reason copy lives in the builder (English, cookie-policy inventory posture) so the download is stable. Page chrome goes through `athleteLocales`.

## Tests

- Copy-guard: transparency lib + page + card must not contain forbidden phrases (`shadowban`, `impressions`, `For You`, `suppress posts`, `paying people`, `x-weight`).
- Unit: every gated/hidden/limited fixture has a reason; logger never gated; coach cites rationale or “no week yet / skippable” + blindness; earn table matches catalog; download JSON/text reasons === report reasons.
- `check-build-label` `.729`.

## Docs / ship

Label `2026.07-unified.729`. Occupied `.698`–`.728`. Draft PR. One Preview max. `[skip vercel]` on the plan-only commit.

Help: one short paragraph on `docs/help/privacy-and-data.md`. Indexes: `app/`, `page-components/`, `src/lib/`, `docs/help/`, root `INDEX.md`. Excellence gate: register `src/lib/transparency` as surface.
