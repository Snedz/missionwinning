/**
 * Confirm a Phantom USDC payment: verify on-chain → mark intent → grant enrollment.
 */
import 'server-only';
import { grantEnrollmentFromWebhook } from '@/lib/premiumServer';
import {
  CRYPTO_PRODUCT_ID,
  CRYPTO_PROVIDER,
  getTreasuryAddress,
} from '@/lib/cryptoCheckout/constants';
import {
  getIntentForUser,
  markIntentConfirmed,
  type CryptoPaymentIntent,
} from '@/lib/cryptoCheckout/intent';
import { isIntentExpired } from '@/lib/cryptoCheckout/intentExpiry';
import { verifyUsdcPayment } from '@/lib/cryptoCheckout/verifyTransfer';
import { isPlausibleTxSignature } from '@/lib/cryptoCheckout/confirmGuards';

export type ConfirmPaymentResult =
  | { ok: true; duplicate?: boolean }
  | { ok: false; status: 400 | 404 | 409 | 500; error: string };

export async function confirmCryptoPayment(input: {
  userId: string;
  intentId: string;
  signature: string;
}): Promise<ConfirmPaymentResult> {
  const signature = input.signature.trim();
  if (!isPlausibleTxSignature(signature)) {
    return { ok: false, status: 400, error: 'Invalid signature' };
  }

  const intent = await getIntentForUser(input.intentId, input.userId);
  if (!intent) {
    return { ok: false, status: 404, error: 'Payment intent not found' };
  }

  if (intent.status === 'confirmed') {
    if (intent.tx_signature === signature) {
      return { ok: true, duplicate: true };
    }
    return { ok: false, status: 409, error: 'Intent already confirmed' };
  }

  if (intent.status === 'expired' || isIntentExpired(intent.expires_at)) {
    return { ok: false, status: 400, error: 'Payment intent expired' };
  }

  if (intent.status !== 'pending') {
    return { ok: false, status: 400, error: 'Intent not pending' };
  }

  const treasury = getTreasuryAddress();
  if (!treasury) {
    return { ok: false, status: 500, error: 'Treasury not configured' };
  }

  const verified = await verifyUsdcPayment({
    signature,
    referencePubkey: intent.reference_pubkey,
    treasuryAddress: treasury,
    amountMicro: Number(intent.amount_micro),
  });

  if (!verified.ok) {
    return { ok: false, status: 400, error: verified.error };
  }

  const marked = await markIntentConfirmed({
    intentId: intent.id,
    txSignature: signature,
  });
  if (!marked.ok) {
    return { ok: false, status: 409, error: marked.error };
  }

  try {
    const grant = await grantEnrollmentFromWebhook({
      user_email: intent.user_email,
      user_id: intent.user_id,
      product_id: CRYPTO_PRODUCT_ID,
      provider: CRYPTO_PROVIDER,
      external_id: signature,
    });
    return { ok: true, duplicate: grant.duplicate };
  } catch (e) {
    console.error('phantom enrollment grant error:', e);
    return { ok: false, status: 500, error: 'Enrollment failed' };
  }
}

export type { CryptoPaymentIntent };
