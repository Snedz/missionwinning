'use client';

/**
 * Lifetime Super Bundle — pay $149 USDC via Phantom (Solana).
 * Must render inside PhantomCheckoutProvider.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Wallet } from 'lucide-react';
import { useModal, usePhantom, useSolana } from '@phantom/react-sdk';
import { buildLifetimeUsdcTransfer } from '@/lib/cryptoCheckout/buildTransfer';
import { track } from '@/lib/analytics';
import { isFreeBeta } from '@/lib/freeBeta';

type Phase = 'idle' | 'intent' | 'signing' | 'confirming';

export function PhantomLifetimePayButton({ className = '' }: { className?: string }) {
  const { isConnected, isClient } = usePhantom();
  const { solana, isAvailable } = useSolana();
  const { open } = useModal();
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  if (isFreeBeta()) return null;
  if (!isClient) return null;

  const busy = phase !== 'idle';

  const runCheckout = async () => {
    setError(null);
    track('checkout_clicked', {
      product: 'super-bundle',
      plan: 'lifetime',
      mode: 'phantom_usdc',
    });

    try {
      if (!isConnected || !solana.publicKey) {
        open();
        setError('Connect Phantom in the modal, then tap Pay with Phantom again.');
        return;
      }

      const payer = solana.publicKey;

      setPhase('intent');
      const intentRes = await fetch('/api/crypto-checkout/intent', {
        method: 'POST',
        credentials: 'include',
      });
      const intentBody = (await intentRes.json().catch(() => ({}))) as {
        intentId?: string;
        reference?: string;
        treasury?: string;
        amountUsdc?: number;
        rpcUrl?: string;
        error?: string;
        code?: string;
      };

      if (intentRes.status === 401 || intentBody.code === 'auth_required') {
        setPhase('idle');
        setError('Sign in on Profile with your email first, then pay with Phantom.');
        return;
      }
      if (!intentRes.ok || !intentBody.intentId || !intentBody.reference || !intentBody.treasury) {
        setPhase('idle');
        setError(intentBody.error || 'Could not start crypto checkout');
        return;
      }

      setPhase('signing');
      const tx = await buildLifetimeUsdcTransfer({
        rpcUrl: intentBody.rpcUrl || 'https://api.mainnet-beta.solana.com',
        payer,
        treasury: intentBody.treasury,
        reference: intentBody.reference,
        amountUsdc: intentBody.amountUsdc,
      });

      const { signature } = await solana.signAndSendTransaction(tx);

      setPhase('confirming');
      const confirmRes = await fetch('/api/crypto-checkout/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentId: intentBody.intentId,
          signature,
        }),
      });
      const confirmBody = (await confirmRes.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!confirmRes.ok || !confirmBody.ok) {
        setPhase('idle');
        setError(
          confirmBody.error ||
            'Payment sent but not confirmed yet — wait a minute and contact support with your tx signature.'
        );
        return;
      }

      track('checkout_completed', { premium: true, mode: 'phantom_usdc' });
      window.location.href = '/bundle?checkout=success';
    } catch (e) {
      setPhase('idle');
      const msg = e instanceof Error ? e.message : 'Payment cancelled or failed';
      setError(msg);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        className="primary-action w-full border-2 border-primary bg-transparent text-foreground hover:bg-accent-100 disabled:opacity-60"
        disabled={busy || (isConnected && !isAvailable)}
        onClick={() => void runCheckout()}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {phase === 'intent' && 'Creating payment…'}
            {phase === 'signing' && 'Confirm in Phantom…'}
            {phase === 'confirming' && 'Verifying on-chain…'}
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Pay with Phantom (USDC)
          </>
        )}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        $149 USDC on Solana · no Stripe · same lifetime unlock
      </p>
      {error && (
        <p className="mt-2 text-center text-xs text-destructive" role="alert">
          {error}{' '}
          {error.includes('Sign in') && (
            <Link href="/profile" className="underline underline-offset-2">
              Open Profile
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
