# scripts/

> One concern: Dev, deploy, test, and content automation (not runtime app code).

## Scripts

| Script | Command | When to run |
|--------|---------|-------------|
| `e2e-smoke.mjs` | `npm run e2e` | Extended smoke + screenshots (runs `e2e:critical` first) |
| `e2e:critical` (npm) | `npm run e2e:critical` | Blocking Playwright specs in `tests/e2e/` |
| `gate-smoke.ts` | `npm run gate-smoke` | Post-deploy HTTP checks (P0 perimeter) |
| `rate-limit-smoke.mjs` | `npm run rate-limit-smoke` | Layer 9: burst `/api/leads` until 429 (needs `SMOKE_BASE_URL`) |
| `seed-coach-adapt-demo.mjs` | `npm run seed-coach-adapt-demo` | Print DevTools snippet to seed CoachAdaptBanner for 60s demo |
| `compliance-status.ts` | `npm run compliance:status` | Vanta-lite control report (`--ci`, `--write-md`) |
| `growth-smoke.mjs` | `npm run growth-smoke` | Leads/unsub/welcome perimeter (Wave 2) |
| `launch-verify.mjs` | `npm run launch-verify` | Track D chain: env + Supabase + Stripe gates + gate-smoke + e2e:critical |
| `lighthouse-budget.mjs` | `LIGHTHOUSE_SNAPSHOT=1 node scripts/lighthouse-budget.mjs` | Mobile Lighthouse budgets (see [docs/LIGHTHOUSE_BASELINE.md](../docs/LIGHTHOUSE_BASELINE.md)) |
| `verify-stripe-enrollment.mjs` | `node scripts/verify-stripe-enrollment.mjs` | Row shape; `--check-gates`; `--check-checkout`; `--check-crypto-checkout`; `--ping-webhook`; `--verify-enrollment <email>` |
| `setup-stripe-webhook.mjs` | `STRIPE_SECRET_KEY=sk_… node scripts/setup-stripe-webhook.mjs` | Create Stripe `checkout.session.completed` webhook; print `whsec` for Vercel |
| `verify-premium` (npm) | `npm run verify-premium` | Alias for `--check-gates` against `SMOKE_BASE_URL` |
| `verify-supabase-security.mjs` | `node scripts/verify-supabase-security.mjs` | Security migration checklist |
| `pre-deploy-smoke.ts` | `npm run predeploy` | Before deploy |
| `check-env.mjs` | `npm run check-env` | Verify `.env.local`; add `--launch` for go-live env |
| `oauth-provider-checklist.mjs` | `node scripts/oauth-provider-checklist.mjs` | Print Google/Apple/Azure/Facebook enable order (see ENV.md) |
| `export-locale-json.ts` | `npm run export-locales` | Export i18n TS + packs → `public/locales/` |
| `i18n-parity.ts` | `npm run i18n:parity` | APP_LANGS key-set + non-EN placeholder gate (CI) |
| `i18n-fill-missing.ts` | `npm run i18n:fill` | Translate EN placeholders into `src/i18n/packs/{lang}.json` |
| `generate-premium-programs.ts` | manual `tsx` | Regenerate premium program content |
| `strip-pro-programs.ts` | manual `tsx` | Strip pro programs from export |
| `print-beta-invite.ts` | `npm run print-beta-invite` | Beta invite URLs |
| `build-guidebook-pdf.ts` | `npm run build-guidebook-pdf` | Generate `public/magazine/beyond-the-basics[.lang].pdf` from `/guide/print?lang=` (app must be serving). Set `GUIDEBOOK_PDF_AUTO_SERVER=1` to spawn `next start`. Set `GUIDEBOOK_PDF_LANGS=all` (or `en,es,fr`) for localized PDFs. Asserts ~12–28 pages. |
| `sync-vercel-env.mjs` | `npm run sync-vercel-env` | Sync env to Vercel |

## Related (not here)

- `.claude/skills/**/scripts/` — design skill tooling, not app deploy

| `send-launch-broadcast.mjs` | Founder launch email dry-run/send |
