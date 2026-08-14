# E-Day ungated Preview (`.728`)

Founder 2026-08-13 ~17:27 ET: launch later **today**, by day’s end, instead of Friday production. They are outside ~3 hours and need an **ungated Preview** to phone-review before any production push.

**This PR does not flip production `PRIVATE_MODE`.** Draft, unmerged. One Vercel Preview.

## Discovery (not guessed)

`isPrivateModeEnabled()` in [`src/lib/privateGate.ts`](../../src/lib/privateGate.ts):

1. `PRIVATE_MODE` `false`/`0` → off
2. `PRIVATE_MODE` `true`/`1` → on
3. else default **on** when `NODE_ENV === 'production'`

Vercel Preview runs `next build` (`NODE_ENV=production`) and **inherits Production env**, so `PRIVATE_MODE=true` keeps Preview gated. `proxy.ts` returns early only when the predicate is false; otherwise `/` 307s to `/private`.

Mirrors (must stay in lockstep or the client/SW/sitemap lie):

- [`next.config.js`](../../next.config.js) `privateGateActive` → `NEXT_PUBLIC_PRIVATE_GATE`; `pwaDisabled` → Serwist
- [`app/sitemap.ts`](../../app/sitemap.ts) local `privateGateOn()` (cannot import `privateGate.ts` — it pulls Supabase)

Local `npm run dev`: `NODE_ENV !== 'production'` → ungated unless `PRIVATE_MODE` is explicitly true.

## Do (this PR only)

1. One predicate: `VERCEL_ENV === 'preview'` → ungated, **checked first** (Preview inherits `PRIVATE_MODE=true`).
2. Production (`VERCEL_ENV === 'production'` or unset + `NODE_ENV=production`) still reads `PRIVATE_MODE` (currently on).
3. Point next.config + sitemap at the same rule.
4. Open-beta copy: no “invite-only”. Logger free forever. Super Bundle Get-notified until Stripe. No free trial. No landing rewrite.
5. Tests: production+PRIVATE_MODE on → gated; preview → ungated; local documented. Copy-guard: no “invite-only”.
6. Label `2026.07-unified.728`. Occupied `.698`–`.727`. Draft PR. **One Preview.** Stop when the Preview URL is in the PR body.

## Do not

- Flip Vercel **production** `PRIVATE_MODE` or merge to `master`
- EIN in git, invented traction, MAGA / FRAUD TRACKER / Gears-Xbox
- Gyms map, Mission Server, field-test scoring
- PT safety #519 / field test #505

Excellence-Override: E-Day ungated Preview (not production)
