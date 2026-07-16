# Phantom USDC lifetime checkout

Accept **$149 USDC on Solana** for Super Bundle Lifetime via Phantom Connect — no Stripe for this path. Stripe remains for card / wallets / PayPal / Stripe USDC.

**Not legal advice.** You still need a treasury wallet and normal bookkeeping/AML hygiene.

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
NEXT_PUBLIC_PHANTOM_APP_ID=...
SOLANA_TREASURY_ADDRESS=...          # base58 pubkey
SOLANA_RPC_URL=https://...           # Helius/QuickNode
SUPABASE_SERVICE_ROLE_KEY=...        # already required for enrollments
```

6. Smoke: `node scripts/verify-stripe-enrollment.mjs --check-crypto-checkout` (expects 401 without session).

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
- UI is hidden unless `NEXT_PUBLIC_CRYPTO_CHECKOUT=true` **and** `NEXT_PUBLIC_PHANTOM_APP_ID` is set; server also requires treasury.

---

## Out of scope

Monthly/annual Phantom pay, Kraken deposit matching, EVM, automated on-chain refunds.
