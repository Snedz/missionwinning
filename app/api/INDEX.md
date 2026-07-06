# app/api/

> HTTP API route handlers — thin wrappers over `src/lib/`.

Full reference: [docs/API.md](../../docs/API.md).

## Inventory by domain

### Gate & leads

| Route | Methods | Auth | Rate |
|-------|---------|------|------|
| `private-access/route.ts` | POST | public password | 8/min |
| `leads/route.ts` | POST | gate | 5/min |

### Coach

| Route | Methods | Auth | Rate |
|-------|---------|------|------|
| `coach/daily-insight/route.ts` | POST | gate + app access | 12/min |
| `coach/plan-voice/route.ts` | POST | gate + app access | 6/min |

### Premium

| Route | Methods | Auth |
|-------|---------|------|
| `premium/status/route.ts` | GET | session |
| `premium/recipes/route.ts` | GET | premium |
| `premium/programs/route.ts` | GET | premium |
| `premium/mobility/route.ts` | GET | premium |
| `premium/mind/route.ts` | GET | premium |
| `premium/fuel-plan/route.ts` | GET | premium |
| `premium/guidebook/route.ts` | GET | premium |

### Fuel

| Route | Methods | Rate |
|-------|---------|------|
| `fuel/search-food/route.ts` | GET | 30/min |
| `fuel/barcode/route.ts` | GET | 30/min |
| `fuel/estimate-meal/route.ts` | POST | 10/min |

### School

| Route | Methods | Auth |
|-------|---------|------|
| `school/class/route.ts` | POST | session |
| `school/class/mine/route.ts` | GET | session |
| `school/class/[code]/access/route.ts` | GET, POST | session + PIN |
| `school/class/[code]/verify/route.ts` | GET, POST | gate + PIN |
| `school/class/[code]/stats/route.ts` | GET | teacher |
| `school/class/[code]/leaderboard/route.ts` | GET | teacher |
| `school/class/[code]/export/route.ts` | GET | teacher |

### Youth

| Route | Methods |
|-------|---------|
| `youth/consent-verify/route.ts` | POST |
| `youth/consent-notify/route.ts` | POST |
| `youth/consent-status/route.ts` | GET |
| `youth/consent-confirm/route.ts` | GET |

### Journey & cron

| Route | Methods | Auth |
|-------|---------|------|
| `journey/nudge/route.ts` | POST | session |
| `nudges/unsubscribe/route.ts` | POST | token |
| `cron/nudges/route.ts` | GET | CRON_SECRET |

### Webhooks & beta

| Route | Methods | Auth |
|-------|---------|------|
| `stripe-webhook/route.ts` | POST | Stripe sig |
| `paypal-webhook/route.ts` | POST | PayPal sig |
| `beta/metrics/route.ts` | GET | beta admin |

## Adding a route

1. Create `app/api/.../route.ts`
2. Logic in `src/lib/`
3. Zod in `src/lib/apiSchemas.ts`
4. Wrap exports with `withApiLogging('path/under/api', handler)` from `src/lib/api/withApiLogging.ts`
5. Update this file + [docs/API.md](../../docs/API.md)

## Deleted — do not recreate

- `app/api/coach/plan/route.ts` — use client `src/lib/coach/` + `plan-voice`

## Related

- [../INDEX.md](../INDEX.md) — page routes
- [../../src/lib/apiSchemas.ts](../../src/lib/apiSchemas.ts)
- [../../src/lib/INDEX.md](../../src/lib/INDEX.md)
