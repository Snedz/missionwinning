# scripts/

> One concern: Dev, deploy, test, and content automation (not runtime app code).

## Scripts

| Script | Command | When to run |
|--------|---------|-------------|
| `e2e-smoke.mjs` | `npm run e2e` | Playwright smoke against `SMOKE_BASE_URL` |
| `gate-smoke.ts` | `npm run gate-smoke` | Post-deploy HTTP checks |
| `lighthouse-budget.mjs` | `LIGHTHOUSE_SNAPSHOT=1 node scripts/lighthouse-budget.mjs` | Mobile Lighthouse budgets (see [docs/LIGHTHOUSE_BASELINE.md](../docs/LIGHTHOUSE_BASELINE.md)) |
| `verify-stripe-enrollment.mjs` | `node scripts/verify-stripe-enrollment.mjs` | Stripe webhook + enrollments row verification |
| `pre-deploy-smoke.ts` | `npm run predeploy` | Before deploy |
| `check-env.mjs` | `npm run check-env` | Verify `.env.local` |
| `export-locale-json.ts` | `npm run export-locales` | Export i18n TS → `public/locales/` |
| `generate-premium-programs.ts` | manual `tsx` | Regenerate premium program content |
| `strip-pro-programs.ts` | manual `tsx` | Strip pro programs from export |
| `print-beta-invite.ts` | `npm run print-beta-invite` | Beta invite URLs |
| `sync-vercel-env.mjs` | `npm run sync-vercel-env` | Sync env to Vercel |

## Related (not here)

- `.claude/skills/**/scripts/` — design skill tooling, not app deploy
