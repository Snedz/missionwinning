# src/lib/cryptoCheckout/

> One concern: Lifetime Phantom Solana USDC checkout (intent + on-chain verify → enrollments).

## Read order

1. `constants.ts` — USDC mint, $149 amount, env flags
2. `intent.ts` — create / expire / mark confirmed intents
3. `intentExpiry.ts` — pure expiry check
4. `verifyTransfer.ts` — RPC + parsed-tx assertions (reference, mint, treasury, amount)
5. `confirm.ts` — verify → mark → grant enrollment
6. `buildTransfer.ts` — client VersionedTransaction builder

## Flow

1. Signed-in user → `POST /api/crypto-checkout/intent`
2. Client Phantom transfer USDC + Solana Pay reference
3. `POST /api/crypto-checkout/confirm` → verify → `grantEnrollmentFromWebhook(provider: phantom)`

## Env

| Var | Role |
|-----|------|
| `NEXT_PUBLIC_CRYPTO_CHECKOUT` | `true` to show UI |
| `NEXT_PUBLIC_PHANTOM_APP_ID` | Phantom Portal app |
| `SOLANA_TREASURY_ADDRESS` | Receive USDC |
| `SOLANA_RPC_URL` | Preferred Helius/QuickNode |

## UI

- `src/components/crypto/PhantomCheckoutProvider.tsx`
- `src/components/crypto/PhantomLifetimePayButton.tsx`
- Bundle lifetime tab only

## Out of scope

Monthly/annual, Kraken, EVM, refunds.
