# npm audit triage — Mission Winning

**Date:** 2026-07-16 · **Re-checked 2026-08-08** (public OSS prep)  
**Command:** `npm run security-audit` (`npm audit --audit-level=high`)  
**Snapshot:** still ~11 high / 10 moderate (mostly Solana/Phantom graph). No force-fix. See [SECURITY_PUBLIC_OSS_AUDIT_2026-08-08.md](SECURITY_PUBLIC_OSS_AUDIT_2026-08-08.md).

---

## Summary

| Bucket | Packages | Action |
|--------|----------|--------|
| **In use (crypto checkout)** | `@solana/web3.js`, `@solana/spl-token`, `@phantom/react-sdk`, `@phantom/browser-sdk` + transitive | **Accept for now** with monitoring; required for Phantom USDC lifetime path |
| **Transitive high via Phantom/Solana** | `@phantom/*`, `@solana/buffer-layout-utils`, `bigint-buffer`, `axios` (via chain) | No app-level axios usage for security-sensitive paths; track upstream |
| **Not a free fix** | Many require major upgrades / force | Avoid `npm audit fix --force` without full regression |

Runtime import graph (confirmed):

- Server: `src/lib/cryptoCheckout/*` → `@solana/web3.js`, `@solana/spl-token`
- Client: `src/components/crypto/Phantom*` → `@phantom/react-sdk`

No evidence of `SUPABASE_SERVICE_ROLE_KEY` or webhook secrets in client bundles (server-only modules).

---

## Risk notes

1. **Phantom/Solana CVEs** affect wallet connection / transfer parsing. Mitigations already in product:
   - Intent amount is **server-fixed** (`LIFETIME_USDC_*`)
   - Confirm requires **session + intent owned by user** (`getIntentForUser`)
   - On-chain verify of amount/treasury/reference before enrollment
2. **Do not** remove Solana stack while Phantom lifetime checkout is shipped.
3. If crypto checkout is disabled in prod (`isCryptoCheckoutEnabled() === false`), residual risk is limited to unused install surface — still install-time supply chain.

---

## Accepted risk (founder sign-off)

| Item | Severity | Decision | Review by |
|------|----------|----------|-----------|
| Solana/Phantom high advisories | High (upstream) | **Accept** while crypto checkout is optional lifetime path | Next quarterly or before marketing crypto heavily |
| Soft CI audit (`continue-on-error`) | Process | Keep soft until upstream clean or crypto path removed | After H1 public |
| `postcss@8.4.31` nested under `next@16.2.12` (Dependabot alerts #44–#45) | High (upstream pin) | **Cleared `.489`/`.491`.** `next@16.3.0` nests `postcss@8.5.23` (≥ fixed `8.5.18`). Root stays `8.5.25`. Guard: `src/lib/nextNestedPostcss.test.ts` — fails if the lockfile pulls Next’s copy under the floor. Close Dependabot #44–#45 when GH still shows them open. | Done (ratchet) |

---

## Next actions

- [ ] Re-run `npm audit` after each major dependency bump  
- [ ] Prefer Phantom/Solana minor bumps when available  
- [ ] If crypto checkout is shelved: remove `@phantom/*` + unused `@solana/*` to shrink surface  
- [ ] Never force-fix without `e2e:critical` + crypto unit tests green  
- [x] Nested `postcss` re-checked after `next@16.3.0` (`.489`) — floor guarded in `.491`  


---

## Aikido mapping (2026-07-22)

When Aikido SCA / `aikido_issues_list` returns Phantom or Solana dependency findings:

| Finding class | Map to | Action |
|---------------|--------|--------|
| `@phantom/*` / `@solana/*` high or CRITICAL deps | This doc — accepted while lifetime USDC path ships | Do **not** ignore CRITICAL *leaked secrets*; do **not** `npm audit fix --force` |
| Non-crypto CRITICAL deps | Fix or upgrade | Block merge once `AIKIDO_SECRET_KEY` CI gate is live |
| SAST on crypto confirm / intent | Review against `src/lib/cryptoCheckout/` + existing unit tests | Fix if real; else document here |

Feed still needs [IDE MCP permissions](https://app.us.aikido.dev/settings/integrations/ide/mcp/permissions) — [AIKIDO.md](AIKIDO.md).

---

## Related

- [OWASP_AUDIT.md](OWASP_AUDIT.md)
- [PROTECTION.md](PROTECTION.md)
- [AIKIDO.md](AIKIDO.md)
- `src/lib/cryptoCheckout/INDEX.md`
