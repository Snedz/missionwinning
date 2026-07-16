'use client';

/**
 * Bundle-only Phantom provider for lifetime USDC checkout.
 */
import { PhantomProvider, darkTheme, AddressType } from '@phantom/react-sdk';
import type { ReactNode } from 'react';

export function PhantomCheckoutProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PHANTOM_APP_ID?.trim();
  if (!appId) return <>{children}</>;

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com';

  return (
    <PhantomProvider
      config={{
        providers: ['injected', 'google', 'apple'],
        appId,
        addressTypes: [AddressType.solana],
        authOptions: {
          redirectUrl: `${origin}/bundle`,
        },
      }}
      theme={darkTheme}
      appName="Mission Winning"
    >
      {children}
    </PhantomProvider>
  );
}
