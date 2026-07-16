/**
 * Create / load / expire Solana USDC payment intents.
 */
import 'server-only';
import { Keypair } from '@solana/web3.js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  INTENT_TTL_MS,
  LIFETIME_USDC_AMOUNT,
  LIFETIME_USDC_MICRO,
  getTreasuryAddress,
  isCryptoCheckoutEnabled,
} from '@/lib/cryptoCheckout/constants';

export type CryptoPaymentIntent = {
  id: string;
  user_id: string;
  user_email: string;
  reference_pubkey: string;
  amount_usdc: number;
  amount_micro: number;
  status: 'pending' | 'confirmed' | 'expired';
  tx_signature: string | null;
  expires_at: string;
  created_at: string;
};

export type CreateIntentResult =
  | {
      ok: true;
      intent: CryptoPaymentIntent;
      treasury: string;
    }
  | { ok: false; status: 503 | 500; error: string };

/** Mark expired pending intents for this user (best-effort). */
export async function expireStaleIntents(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const now = new Date().toISOString();
  await admin
    .from('crypto_payment_intents')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lt('expires_at', now);
}

export async function createPaymentIntent(input: {
  userId: string;
  email: string;
}): Promise<CreateIntentResult> {
  if (!isCryptoCheckoutEnabled()) {
    return { ok: false, status: 503, error: 'Crypto checkout not configured' };
  }
  const treasury = getTreasuryAddress();
  if (!treasury) {
    return { ok: false, status: 503, error: 'Treasury not configured' };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { ok: false, status: 503, error: 'Database not configured' };
  }

  await expireStaleIntents(input.userId);

  const reference = Keypair.generate();
  const expiresAt = new Date(Date.now() + INTENT_TTL_MS).toISOString();
  const email = input.email.trim().toLowerCase();

  const { data, error } = await admin
    .from('crypto_payment_intents')
    .insert({
      user_id: input.userId,
      user_email: email,
      reference_pubkey: reference.publicKey.toBase58(),
      amount_usdc: LIFETIME_USDC_AMOUNT,
      amount_micro: LIFETIME_USDC_MICRO,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select(
      'id, user_id, user_email, reference_pubkey, amount_usdc, amount_micro, status, tx_signature, expires_at, created_at'
    )
    .single();

  if (error || !data) {
    console.error('crypto_payment_intents insert error:', error);
    return { ok: false, status: 500, error: 'Failed to create payment intent' };
  }

  return {
    ok: true,
    treasury,
    intent: data as CryptoPaymentIntent,
  };
}

export async function getIntentForUser(
  intentId: string,
  userId: string
): Promise<CryptoPaymentIntent | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from('crypto_payment_intents')
    .select(
      'id, user_id, user_email, reference_pubkey, amount_usdc, amount_micro, status, tx_signature, expires_at, created_at'
    )
    .eq('id', intentId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  return (data as CryptoPaymentIntent | null) ?? null;
}

export async function markIntentConfirmed(input: {
  intentId: string;
  txSignature: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: 'Database not configured' };

  const { data: existingSig } = await admin
    .from('crypto_payment_intents')
    .select('id')
    .eq('tx_signature', input.txSignature)
    .limit(1);

  if (existingSig?.length) {
    // Same signature already recorded — treat as success (idempotent).
    if (existingSig[0].id === input.intentId) return { ok: true };
    return { ok: false, error: 'Transaction already used' };
  }

  const { error } = await admin
    .from('crypto_payment_intents')
    .update({
      status: 'confirmed',
      tx_signature: input.txSignature,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', input.intentId)
    .eq('status', 'pending');

  if (error) {
    console.error('markIntentConfirmed error:', error);
    return { ok: false, error: 'Failed to update payment intent' };
  }
  return { ok: true };
}
