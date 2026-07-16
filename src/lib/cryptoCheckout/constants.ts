/**
 * Lifetime Phantom / Solana USDC checkout constants.
 * Mainnet USDC mint — do not use for subscriptions.
 */
export const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const USDC_DECIMALS = 6;

/** Matches BUNDLE_PLANS.lifetime.price */
export const LIFETIME_USDC_AMOUNT = 149;
export const LIFETIME_USDC_MICRO = 149_000_000;

export const INTENT_TTL_MS = 30 * 60 * 1000;

export const CRYPTO_PRODUCT_ID = 'super-bundle';
export const CRYPTO_PROVIDER = 'phantom';

export function isCryptoCheckoutEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_CRYPTO_CHECKOUT === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_PHANTOM_APP_ID?.trim()) &&
    Boolean(process.env.SOLANA_TREASURY_ADDRESS?.trim())
  );
}

export function getTreasuryAddress(): string | null {
  return process.env.SOLANA_TREASURY_ADDRESS?.trim() || null;
}

export function getSolanaRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL?.trim() ||
    'https://api.mainnet-beta.solana.com'
  );
}

/** Client-safe flag (NEXT_PUBLIC only). */
export function isCryptoCheckoutPubliclyEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_CRYPTO_CHECKOUT === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_PHANTOM_APP_ID?.trim())
  );
}
