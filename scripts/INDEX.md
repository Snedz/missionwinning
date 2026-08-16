# scripts/

> One concern: Dev, deploy, test, and content automation (not runtime app code).

## Scripts

| Script | Command | When to run |
|--------|---------|-------------|
| `coverage.mjs` | `npm run coverage` | **Coverage over every source file, not only the imported ones.** V8 reports 92% because it reaches 271/657; this counts the other 386 as untested and ratchets on *function* % — the metric that caught `apiSchemas.ts` at 98% lines / 24% functions. Gate step 7 + `ci.yml`. `--list` prints every untested file |
| `e2e-smoke.mjs` | `npm run e2e` | Extended smoke + screenshots (runs `e2e:critical` first) |
| `e2e:critical` (npm) | `npm run e2e:critical` | Blocking Playwright specs in `tests/e2e/` |
| `gate-smoke.ts` | `npm run gate-smoke` | Post-deploy HTTP checks (P0 perimeter) |
| `rate-limit-smoke.mjs` | `npm run rate-limit-smoke` | Layer 9: burst `/api/leads` until 429 (needs `SMOKE_BASE_URL`) |
| `seed-coach-adapt-demo.mjs` | `npm run seed-coach-adapt-demo` | Print DevTools snippet to seed CoachAdaptBanner for 60s demo |
| `compliance-status.ts` | `npm run compliance:status` | Vanta-lite control report (`--ci`, `--write-md`) |
| `growth-smoke.mjs` | `npm run growth-smoke` | Leads/unsub/welcome perimeter (Wave 2) |
| `check-build-label.mjs` | `npm run check-build-label` | **Hard rule 5, executable.** Label must exceed `origin/master`'s and be cited in LOG.md + CONTEXT.md. Gate step 2 — before the build, so an unbumped label doesn't cost 3 min |
| `queue-next.ts` | `npm run harness` | Names the live GRAPH_LOOP ticket and route. Prints, never writes. `graph` / `queue:next` are aliases |
| `graph-hop-done.ts` | `npm run harness:done` | Mechanical hop closer. HOP.md ticket must match the live GRAPH_LOOP row; `accept` must exit 0. Does not write the queue. `graph:done` is an alias |
| `week4-smoke.mjs` | `npm run week4-smoke` | Weekly-digest dryRun + optional `mw_week4_retention` RPC |
| `../supabase/checks/week4_retention_proof.sql` | `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/checks/week4_retention_proof.sql` | Seeds every boundary case for the boss metric, asserts 5 eligible / 2 retained, then **rolls back**. `week4-smoke` proves the RPC *answers*; this proves it answers *correctly* |
| `launch-verify.mjs` | `npm run launch-verify` | Track D chain: env + Supabase + Stripe gates + gate-smoke + growth-smoke + rate-limit-smoke + e2e:critical. Default env profile is Horizon 0 (`--launch`). `LAUNCH_PAID=true` or `--paid` selects Horizon 1 (Stripe webhook + Checkout). |
| `lighthouse-budget.mjs` | `LIGHTHOUSE_SNAPSHOT=1 node scripts/lighthouse-budget.mjs` | Mobile Lighthouse budgets (see [docs/LIGHTHOUSE_BASELINE.md](../docs/LIGHTHOUSE_BASELINE.md)) |
| `verify-stripe-enrollment.mjs` | `node scripts/verify-stripe-enrollment.mjs` | Row shape; `--check-gates`; `--check-checkout`; `--check-crypto-checkout`; `--ping-webhook`; `--verify-enrollment <email>` |
| `setup-stripe-webhook.mjs` | `STRIPE_SECRET_KEY=sk_… node scripts/setup-stripe-webhook.mjs` | Create Stripe `checkout.session.completed` webhook; print `whsec` for Vercel |
| `verify-premium` (npm) | `npm run verify-premium` | Alias for `--check-gates` against `SMOKE_BASE_URL` |
| `verify-supabase-security.mjs` | `node scripts/verify-supabase-security.mjs` | Security migration checklist |
| `pre-deploy-smoke.ts` | `npm run predeploy` | Before deploy |
| `check-env.mjs` | `npm run check-env` | Verify `.env.local`. `--launch` = Horizon 0 while FREE_BETA is on (`MAIL_POSTAL_ADDRESS` required; Stripe not). `--launch --paid` or `LAUNCH_PAID=true` = Horizon 1 (Stripe webhook + Checkout). `NEXT_PUBLIC_FREE_BETA=false/0/off` makes `--launch` Horizon 1. Implementation: `evaluateCheckEnv`. |
| `oauth-provider-checklist.mjs` | `node scripts/oauth-provider-checklist.mjs` | Print Google/Apple/Azure/Facebook enable order (see ENV.md) |
| `export-locale-json.ts` | `npm run export-locales` | Export i18n TS + packs → `public/locales/` |
| `i18n-parity.ts` | `npm run i18n:parity` | APP_LANGS key-set + non-EN placeholder gate (CI) |
| `i18n-fill-missing.ts` | `npm run i18n:fill` | Translate EN placeholders into `src/i18n/packs/{lang}.json` |
| `generate-premium-programs.ts` | manual `tsx` | Regenerate premium program content |
| `strip-pro-programs.ts` | manual `tsx` | Strip pro programs from export |
| `print-beta-invite.ts` | `npm run print-beta-invite` | Beta invite: `/private?invite=` + out-of-band access code (no default `?access=`) |
| `build-guidebook-pdf.ts` | `npm run build-guidebook-pdf` | Generate `public/magazine/beyond-the-basics[.lang].pdf` from `/guide/print?lang=` (app must be serving). Set `GUIDEBOOK_PDF_AUTO_SERVER=1` to spawn `next start`. Set `GUIDEBOOK_PDF_LANGS=all` (or `en,es,pt`) for localized PDFs. Asserts ~12–28 pages. |
| `optimize-media-inbox.mjs` | `npm run media:optimize-inbox` | Google Flow / Imagine frames in `media/inbox/` → WebP under `public/learn/` or `public/social/` ([MEDIA_SYSTEM.md](../docs/MEDIA_SYSTEM.md)) |
| `media-coverage-report.mjs` | `npm run media:coverage` | Exercises × text guides × form SVGs → stdout + `media/COVERAGE.md` |
| `generate-form-guides-t0.mjs` | `npm run media:form-t0` | Rebuild T0 de-cloned form SVGs via `scripts/form-kit/` |
| `generate-form-guides-t1.mjs` | `npm run media:form-t1` | T1 SVGs for structured guides that lacked media |
| `generate-learn-section-figures.mjs` | `npm run media:learn-sections` | Guidebook section teaching figures → `public/learn/*.webp` |
| `generate-form-patterns.mjs` | `npm run media:form-patterns` | Shared pattern SVGs for long-tail form media |
| `generate-form-guides-all.mjs` | `npm run media:form-all` | Rebuild **all** form SVGs with corrected stick geometry |
| `form-kit/stickFigure.mjs` | (import) | Stick-figure primitives for form-guide SVGs |
| `sync-vercel-env.mjs` | `npm run sync-vercel-env` | Sync env to Vercel (Production + Preview + Development). `PRIVATE_ACCESS_CODES` sits next to `PRIVATE_ACCESS_SECRET` so Done aliases are not Production-only |
| `design-concepts/build.mts` | `npx tsx scripts/design-concepts/build.mts` | Render the concept HTML board (01–03 architectures + 04 combined landing) into `docs/design/concepts/`. Asserts self-contained assets, claim bans, structural distinctness. |
| `design-concepts/serve.mjs` | `npm run design:concepts` | Local design studio on **127.0.0.1:4177**. Serves `docs/design/` (board, 04, studio sheet, stills). Does not replace live `/` or `/start`. |
| `design-concepts/stills.mjs` | `npm run design:stills` | Fold PNGs of 04 at 390×844 and 1440×900 into `docs/design/`. Optional `/start` stills if www is already up. |
| `sync-ops-pack.mjs` | `npm run ops:sync` | Stage INTERNAL + founder critical path into gitignored `ops/` for private mission-ops ([DUAL_REPO.md](../docs/DUAL_REPO.md)) |

## Related (not here)

- `.claude/skills/**/scripts/` — design skill tooling, not app deploy

| `send-launch-broadcast.mjs` | Founder launch email dry-run/send |
