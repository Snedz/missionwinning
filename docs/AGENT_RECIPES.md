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

## 10. Security-sensitive change checklist

- [ ] No secrets in `NEXT_PUBLIC_*`
- [ ] Premium check server-side
- [ ] RLS or service-role pattern documented
- [ ] Rate limit on brute-force endpoints
- [ ] Update [PROTECTION.md](../PROTECTION.md) or [OWASP_AUDIT.md](OWASP_AUDIT.md)
- [ ] `npm run security-smoke` if deploy smoke env available

---

## Quick commands

```bash
npm test
npm run build
npm run lint
SMOKE_BASE_URL=https://your-preview.vercel.app npm run security-smoke
node scripts/verify-supabase-security.mjs
```
