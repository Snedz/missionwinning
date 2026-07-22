# Phantom USDC lifetime checkout

Accept **$149 USDC on Solana** for Super Bundle Lifetime via Phantom Connect — no Stripe for this path. Stripe remains for card / wallets / PayPal / Stripe USDC.

**Not legal advice.** You still need a treasury wallet and normal bookkeeping/AML hygiene.

**Strategy:** Crypto is a payment rail, not the product — [CRYPTO_RAILS_THESIS.md](CRYPTO_RAILS_THESIS.md).

---

## Buyer flow

1. Sign in (Profile) with the email that should receive premium.
2. `/bundle` → **Lifetime** tab → **Pay with Phantom (USDC)**.
3. Connect Phantom → confirm $149 USDC transfer.
4. Server verifies on-chain (amount, mint, treasury, Solana Pay reference) → `enrollments` (`provider: phantom`).
5. Land on `/bundle?checkout=success`.

---

## Founder setup

1. Create a Solana wallet for **treasury** (hardware recommended). Create its USDC associated token account (receive any USDC once or use a wallet that auto-creates ATA).
2. [Phantom Portal](https://phantom.com/portal) → create app → copy **App ID**. Allowlist `https://www.missionwinning.com` and `http://localhost:3000` (+ `/bundle` redirect).
3. Use a dedicated RPC (Helius / QuickNode) — public mainnet RPC is rate-limited.
4. Apply migration: `supabase/migrations/20260716_crypto_payment_intents.sql`
5. Vercel Production env:

```
NEXT_PUBLIC_CRYPTO_CHECKOUT=true
SOLANA_TREASURY_ADDRESS=...          # base58 pubkey
SOLANA_RPC_URL=https://...           # Helius/QuickNode preferred; public mainnet works for smoke
# Optional — enables Google/Apple/deeplink embedded wallets (Portal App ID):
# NEXT_PUBLIC_PHANTOM_APP_ID=...
SUPABASE_SERVICE_ROLE_KEY=...        # already required for enrollments
```

Injected Phantom extension works **without** `NEXT_PUBLIC_PHANTOM_APP_ID`. Portal App ID is only required for embedded social login.

6. Smoke: `SMOKE_BASE_URL=https://www.missionwinning.com node scripts/verify-stripe-enrollment.mjs --check-crypto-checkout` (expects 401 without session). Signed-in Lifetime → Pay with Phantom → confirm `enrollments.provider = phantom` once treasury USDC ATA is funded.

---

## Code map

| Piece | Path |
|-------|------|
| Intent + confirm APIs | `app/api/crypto-checkout/intent`, `…/confirm` |
| Lib | `src/lib/cryptoCheckout/` |
| UI | `src/components/crypto/PhantomLifetimeCheckout.tsx` |
| Grant | `grantEnrollmentFromWebhook({ provider: 'phantom', external_id: signature })` |

---

## Security notes

- Intent expires in 30 minutes.
- Matching uses a unique **reference** pubkey per intent (not amount-only).
- `tx_signature` is unique; enrollment idempotent on `(provider, external_id)`.
- UI is shown when `NEXT_PUBLIC_CRYPTO_CHECKOUT=true`; server also requires `SOLANA_TREASURY_ADDRESS`.
- `NEXT_PUBLIC_PHANTOM_APP_ID` is optional (injected extension). Required for Google/Apple/deeplink.

---

## Out of scope

Monthly/annual Phantom pay, Kraken deposit matching, EVM, automated on-chain refunds.
