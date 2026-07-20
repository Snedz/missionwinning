'use client';

/**
 * Bundle-only Phantom provider for lifetime USDC checkout.
 * Injected extension works without Portal App ID; social/deeplink need App ID.
 */
import { PhantomProvider, darkTheme, AddressType } from '@phantom/react-sdk';
import type { ReactNode } from 'react';

export function PhantomCheckoutProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PHANTOM_APP_ID?.trim();
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com';

  // Injected-only: no Portal App ID required (extension wallets).
  if (!appId) {
    return (
      <PhantomProvider
        config={{
          providers: ['injected'],
          addressTypes: [AddressType.solana],
        }}
        theme={darkTheme}
        appName="Mission Winning"
      >
        {children}
      </PhantomProvider>
    );
  }

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
