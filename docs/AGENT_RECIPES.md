# Agent recipes — Mission Winning

Copy-paste playbooks for common tasks. Read [AGENTS.md](../AGENTS.md) and folder `INDEX.md` first.

---

## 1. Add a new app page route

1. `app/(app)/your-path/page.tsx` — import page component only
2. `src/page-components/YourPage.tsx` — full UI
3. Row in [app/INDEX.md](../app/INDEX.md)
4. `navConfig.ts` if in nav
5. i18n keys in `src/i18n/*Locales.ts`
6. File header comment on page component

---

## 2. Add a new API route

1. `app/api/your-path/route.ts` — thin handler
2. Logic in `src/lib/yourFeatureServer.ts`
3. Zod schema in `src/lib/apiSchemas.ts`
4. `rateLimitAsync` + auth (`getUserFromRequest`, `hasAppAccess`, etc.)
5. Update [app/api/INDEX.md](../app/api/INDEX.md) and [docs/API.md](API.md)
6. File header on route (auth, rate, schema)

---

## 3. Fix premium 403 for enrolled user

1. Check Vercel: `DEMO_PREMIUM=false` in production
2. Verify `isPremiumForUser` uses `getSupabaseAdmin()` in [premiumServer.ts](../src/lib/premiumServer.ts)
3. Confirm `enrollments` row: `user_email` or `user_id`, `status=active` or `premium_granted=true`
4. User signed in with **same email** as Stripe checkout
5. Curl: `GET /api/premium/status` with session cookie

---

## 4. Add rate limit to an endpoint

```ts
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';

const ip = clientIp(request);
const limited = await rateLimitAsync(`your-key:${ip}`, LIMIT, 60_000);
if (!limited.ok) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

Document limit in `docs/API.md`. Optional: set `UPSTASH_REDIS_*` in prod.

---

## 5. Add Zod validation to POST body

```ts
import { yourSchema, parseJsonBody } from '@/lib/apiSchemas';

const raw = await request.json().catch(() => null);
const parsed = parseJsonBody(yourSchema, raw);
if (!parsed.ok) {
  return NextResponse.json({ error: parsed.error }, { status: 400 });
}
const body = parsed.data;
```

Define `yourSchema` in `apiSchemas.ts` with max string lengths.

---

## 6. Add a cross-pillar coach chip

1. Rule in [crossPillarCoach.ts](../src/lib/crossPillarCoach.ts)
2. Test in `crossPillarCoach.test.ts`
3. Chip renders via [CrossPillarCoachChips.tsx](../src/components/today/CrossPillarCoachChips.tsx)
4. i18n keys for label and message

---

## 7. Change Mission Coach plan logic

1. Read pipeline: [src/lib/coach/INDEX.md](../src/lib/coach/INDEX.md)
2. Edit `planEngine.ts`, `adapt.ts`, or `selector.ts` — not page components
3. Update golden tests in `planEngine.test.ts` / `adapt.test.ts`
4. `npm test` — coach suite must pass

---

## 8. School class API change

1. Auth via [schoolClassAccess.ts](../src/lib/schoolClassAccess.ts)
2. Teacher PIN in header `x-teacher-pin`, never query string for new code
3. Redact user ids in public JSON — use `athleteId` from [userIdRedact.ts](../src/lib/userIdRedact.ts)
4. Update [docs/help/fitness-test-and-school.md](help/fitness-test-and-school.md) if user-visible

---

## 9. New i18n string

1. Add the key to the appropriate `src/i18n/fooLocales.ts` **English** pack
2. Ensure every `APP_LANGS` entry can resolve it (spread `...en` + overrides, or pack fill)
3. Use `t('key', { defaultValue: 'English fallback' })` in UI
4. Run `npm run i18n:fill` if other langs still show English placeholders
5. Run `npm run i18n:parity` (must pass) and `npm run export-locales`
6. Brand / proper nouns that stay identical: add to `scripts/i18n-allowlist.json`
7. **Do not** use `src/locales/`

Canonical langs: [`src/i18n/appLangs.ts`](../src/i18n/appLangs.ts) (`APP_LANGS`, 15 languages).

---

## 10. Touching auth / PII / webhooks / LLM / health flags

Living census: [security/PROGRAM_STATUS.md](security/PROGRAM_STATUS.md). Catalog: [`docs/compliance/controls.yaml`](compliance/controls.yaml). This is **not** a SOC 2 / ISO / HIPAA / GDPR certification.

**Required reads**

1. [CONTEXT.md](../CONTEXT.md) `## Now`
2. [PROTECTION.md](PROTECTION.md)
3. [LEGAL_SAFETY.md](LEGAL_SAFETY.md) §2 (store-label inventory)
4. [security/PROGRAM_STATUS.md](security/PROGRAM_STATUS.md)

**Required tests** (run the ones your change can break)

```bash
npx tsx --test src/lib/healthDataBucket.test.ts
npx tsx --test src/lib/legal/supportedRegions.test.ts
npx tsx --test src/lib/privacyInstill.test.ts
npx tsx --conditions=react-server --test src/lib/accountDataServer.routetest.ts
npm run compliance:status   # fail count must stay 0
```

**Never**

- Claim SOC 2, ISO 27001, HIPAA, or GDPR in product or docs
- Tick founder-only boxes (`MAIL_POSTAL_ADDRESS`, DMCA agent, Play form, ZDR contract)
- Flip `PRIVATE_MODE`
- Treat [REDTEAM_2026-08-13.md](security/REDTEAM_2026-08-13.md) as live — use PROGRAM_STATUS

**Review checklist**

- [ ] No secrets in `NEXT_PUBLIC_*`
- [ ] Premium check server-side (`premiumServer.ts`, never localStorage)
- [ ] Auth is `getUser()` / `hasAppAccess` + Zod — no second copy of a predicate
- [ ] IDOR: filter by session `user_id`, not a client `userId` / unproven `deviceId`
- [ ] Account delete/export never forwards `parsed.data.deviceId` into the executor
- [ ] Access country is not `x-country-code`; Vercel allow is `x-vercel-ip-country` only
- [ ] Assessment / pregnancy / PAR-Q never call `saveNutritionEntry` or PostHog properties
- [ ] New `create table` has a fate in `accountDataRegistry.ts`
- [ ] New third party is a LEGAL_SAFETY §2 row **and** a Privacy sentence
- [ ] Rate limit on brute-force / mail / webhook endpoints
- [ ] `npm run security-smoke` if deploy smoke env is available

This repo has no `.greptile/` tree. Instill is this recipe + `privacyInstill.test.ts` + the colocated hunt tests. Do not invent a Greptile config.

---

## 11. Continue the agent graph loop

1. Read [GRAPH_LOOP.md](GRAPH_LOOP.md) — the queue is the source, not chat history.
2. Take **only** the top `open` loop. Investigate on current master before coding.
3. If the loop’s defect is already gone, mark it `done (already true)` with proof paths and stop.
4. One PR. `[skip vercel]` unless the founder asked for Preview.
5. Touching `src|app|scripts|supabase` → bump `APP_BUILD_LABEL` past master, LOG + CONTEXT `## Now` in the same commit. Surface paths while excellence is unscored need `Excellence-Override: <reason>`.
6. Close the loop in `GRAPH_LOOP.md` (Outcome = PR + label). Do not start the next loop in that PR.
7. Spawn the next agent with the copy-paste prompt in GRAPH_LOOP.md.

If GRAPH_LOOP records a founder skip-W (2026-08-14), do not pull parked W loops forward. Do not write excellence `status: pass`.

Hard bans stay: free logger never gated · no `PRIVATE_MODE` flip · no invented traction.

---

## Quick commands

```bash
npm test
npm run build
npm run lint
SMOKE_BASE_URL=https://your-preview.vercel.app npm run security-smoke
node scripts/verify-supabase-security.mjs
```
