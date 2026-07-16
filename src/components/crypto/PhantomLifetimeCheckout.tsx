'use client';

/**
 * Env-gated lifetime Phantom USDC checkout (provider + button).
 */
import { isCryptoCheckoutPubliclyEnabled } from '@/lib/cryptoCheckout/constants';
import { PhantomCheckoutProvider } from '@/components/crypto/PhantomCheckoutProvider';
import { PhantomLifetimePayButton } from '@/components/crypto/PhantomLifetimePayButton';

export function PhantomLifetimeCheckout({ className = '' }: { className?: string }) {
  if (!isCryptoCheckoutPubliclyEnabled()) return null;

  return (
    <PhantomCheckoutProvider>
      <PhantomLifetimePayButton className={className} />
    </PhantomCheckoutProvider>
  );
}
