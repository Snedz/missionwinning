# scripts/

> One concern: Dev, deploy, test, and content automation (not runtime app code).

## Scripts

| Script | Command | When to run |
|--------|---------|-------------|
| `e2e-smoke.mjs` | `npm run e2e` | Extended smoke + screenshots (runs `e2e:critical` first) |
| `e2e:critical` (npm) | `npm run e2e:critical` | Blocking Playwright specs in `tests/e2e/` |
| `gate-smoke.ts` | `npm run gate-smoke` | Post-deploy HTTP checks (P0 perimeter) |
| `launch-verify.mjs` | `npm run launch-verify` | Track D chain: env + Supabase + Stripe gates + gate-smoke + e2e:critical |
| `lighthouse-budget.mjs` | `LIGHTHOUSE_SNAPSHOT=1 node scripts/lighthouse-budget.mjs` | Mobile Lighthouse budgets (see [docs/LIGHTHOUSE_BASELINE.md](../docs/LIGHTHOUSE_BASELINE.md)) |
| `verify-stripe-enrollment.mjs` | `node scripts/verify-stripe-enrollment.mjs` | Row shape; `--check-gates`; `--check-checkout`; `--check-crypto-checkout`; `--ping-webhook`; `--verify-enrollment <email>` |
| `verify-premium` (npm) | `npm run verify-premium` | Alias for `--check-gates` against `SMOKE_BASE_URL` |
| `verify-supabase-security.mjs` | `node scripts/verify-supabase-security.mjs` | Security migration checklist |
| `pre-deploy-smoke.ts` | `npm run predeploy` | Before deploy |
| `check-env.mjs` | `npm run check-env` | Verify `.env.local`; add `--launch` for go-live env |
| `export-locale-json.ts` | `npm run export-locales` | Export i18n TS → `public/locales/` |
| `generate-premium-programs.ts` | manual `tsx` | Regenerate premium program content |
| `strip-pro-programs.ts` | manual `tsx` | Strip pro programs from export |
| `print-beta-invite.ts` | `npm run print-beta-invite` | Beta invite URLs |
| `sync-vercel-env.mjs` | `npm run sync-vercel-env` | Sync env to Vercel |

## Related (not here)

- `.claude/skills/**/scripts/` — design skill tooling, not app deploy

| `send-launch-broadcast.mjs` | Founder launch email dry-run/send |
