# Red team hunt plan — 2026-08-13

Read-only review of Snedz/missionwinning. **Findings only** — no exploit code, PoCs, payloads, or attack procedures. Geo-block and counsel-hold are product rules unless bypassable. Do not flip `PRIVATE_MODE`. No secrets, no EIN.

Companion findings: [REDTEAM_2026-08-13.md](REDTEAM_2026-08-13.md).

## Hunt areas

| # | Area | What to read | Bug class if real |
|---|------|--------------|-------------------|
| 1 | Authz / IDOR — Mission ID + account APIs | `app/api/account/*`, `accountDataServer.ts`, identity / referral / school class routes, sequential IDs | Cross-account read/write or guessable sequential IDs |
| 2 | `PRIVATE_MODE` / Preview gate | `proxy.ts`, `privateGate.ts`, `privateSession.ts`, `publicRoutes.ts`, Preview auth, `?access=` / `?next=` | Gate bypass without cookie, session, or founder flag |
| 3 | Geo-block vs `supportedRegions.ts` | `supportedRegions.ts`, checkout / signup / leads / geo API, Cloudflare vs in-app | Bypass of hosted-service territory block (not the block itself) |
| 4 | XSS — logger / notes | Active workout notes, Today notes, `dangerouslySetInnerHTML`, share cards, JSON-LD | Stored or reflected XSS from athlete-controlled text |
| 5 | Guest vs signed-in data leaks | Sync / export / coach / push / premium status; localStorage merge on sign-in | Guest data attached to another account, or signed-in data leaking to guest |
| 6 | Webhook / Stripe | `stripeWebhook.ts`, `paypalWebhook.ts`, crypto confirm, checkout session | Unsigned or replayable grant; IDOR on checkout objects |
| 7 | Path traversal | File reads, magazine / locales / form-guides, upload paths | `../` escape from intended root |
| 8 | Open redirects | `safeRedirect.ts`, `privateGateReturn.ts`, auth callback, wearables OAuth | Off-site redirect after auth or gate unlock |
| 9 | Coach reading identity | `src/lib/coach/`, `domainBoundary.ts`, daily-insight / chat payloads | Planner or LLM seeing standing / call sign / social fields it must not |
| 10 | Pregnancy / PT flags → analytics (`.740`) | Journey / PAR-Q / health flags, `analytics.ts`, PostHog properties | Sensitive health flags leaving the device |
| 11 | Race on sequential Mission ID | Identity number mint, referral MW-code, any `max+1` insert | Two athletes receiving the same public ID |

## Method

1. Read indexed security docs and API inventory (no stale paths).
2. Trace each area in source: auth check → Zod → ownership → side effects.
3. Record only defects with a concrete file/symbol and a one-sentence impact.
4. Blue-team hint = what to change, not how to attack.
5. Rank P0 first. Counsel-hold / geo-block as designed = not a finding.

## Out of scope

- Writing exploits, curls, or reproduction steps
- Flipping `PRIVATE_MODE` or inventing traction
- Secrets, EIN, postal address, treasury keys
- Product-rule geo-block or counsel-hold unless bypassable
