# Security technical review pass — 2026-08-05

Companion to [SECURITY_PUBLIC_OSS_AUDIT_2026-08.md](SECURITY_PUBLIC_OSS_AUDIT_2026-08.md).  
**Enhance plan:** `.hermes/plans/2026-08-05_222405-security-enhance-review-fix.md`.

## Code fixes this ship (`.539`)

| ID | Fix |
|----|-----|
| F1 / R1 | Private gate accepts **verified** Supabase JWT from **Bearer or cookies** (`hasVerifiedSupabaseUser` + `authAccessToken.ts`). No `PRIVATE_ALLOW_AUTH_BYPASS` required. |
| Cron allowlist gap | `/api/cron/day-review` + `/api/cron/wind-down` added to `PUBLIC_API_PATHS_WHILE_GATED` (still require `CRON_SECRET`). |
| F2 ops | `environment: production` on deploy / sync-vercel-env / apply-migration workflows (founder must create GH Environment). |
| F5 | Already allowlisted rewardBadge keys (#352). |

## Cluster review (S3)

| Cluster | Verdict | Notes |
|---------|---------|-------|
| Money (Stripe/PayPal/crypto) | **OK** | Signature helper + routetests; crypto intent requires sign-in; DEMO_PREMIUM prod refuse |
| Cron / nudges | **OK** + allowlist fix | All four cron routes Bearer CRON_SECRET; 503 if unset |
| Coach / LLM / fuel | **OK (prior)** | Rate limits + access checks from S2 OWASP; no change this pass |
| Beta admin | **OK** | Fail-closed `authorizeBetaAdmin` |
| School / youth | **OK parked** | Server fail-closed; surfaces parked |
| Mobile API | **OK after F1** | Not on public allowlist; Bearer reaches handlers under PRIVATE_MODE |
| Leads / referral | **OK** | Public leads rate-limited; admin paths gated |
| Client bundle | **OK** | No SERVICE_ROLE in client components (server-only admin) |
| Actions | **Hardened** | environment: production; no pull_request_target |
| Android bake-cookie | **Docs** | Production must use Supabase Bearer only |

## Still founder

- History gitleaks  
- GH Environment reviewers + secret scanning  
- Live RLS dashboard check vs [SECURITY_SERVICE_ROLE_MAP.md](SECURITY_SERVICE_ROLE_MAP.md)  
- Actions billing restore  
- PRIVATE_MODE / Public visibility  

## npm audit

11 high via Solana/Phantom — **Accept** while crypto optional ([SECURITY_AUDIT_TRIAGE.md](SECURITY_AUDIT_TRIAGE.md)).
