'use client';

import React, { useState } from 'react';
import { PROGRAM_PRICES, grantPremiumDemo } from '@/lib/payments';
import { grantDemoPremium } from '@/lib/supabase';

interface Props {
  productId?: string;
  price?: string;
  title?: string;
  isSubscription?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function UnlockButton({
  productId,
  price,
  title,
  isSubscription = false,
  className = '',
  onSuccess,
}: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const program = productId ? PROGRAM_PRICES[productId] : null;
  const amount = price || program?.price || '297';
  const itemTitle = title || program?.title || (isSubscription ? 'Mission Winning Super Bundle' : 'Mission Winning Program');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    grantPremiumDemo(productId || (isSubscription ? 'super-bundle' : undefined));

    // Real lead capture to Supabase (if keys configured in Vercel)
    try {
      await grantDemoPremium(email);
    } catch (e) {
      // fallback already handled in grantDemoPremium
    }

    // Analytics
    console.log('analytics: unlock_requested', { productId, isSubscription, title: itemTitle, email });

    setSubmitted(true);

    // In production with real payments: redirect to checkout or thank you
    setTimeout(() => {
      if (onSuccess) onSuccess();
      else window.location.href = '/log';
    }, 1500);
  };

  if (submitted) {
    return (
      <div className={`text-center p-3 bg-emerald-900/20 border border-emerald-400/30 rounded ${className}`}>
        <div className="text-emerald-400 font-semibold">Thank you! Demo access granted.</div>
        <div className="text-xs text-white/60 mt-1">We'll "email" you at {email} (check console for now). Welcome to the path.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com (for demo request)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder:text-white/40"
        />
        <button
          type="submit"
          className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3 rounded text-base"
        >
          {isSubscription
            ? `REQUEST SUPER BUNDLE ($${amount}/mo)`
            : `REQUEST ACCESS — $${amount}`}
        </button>
      </div>
      <div className="text-[10px] text-center mt-1 text-white/40">
        Free core always. Real checkout & fulfillment via Supabase when business ready.
      </div>
    </form>
  );
}

// Alias for backward compat during transition
export { UnlockButton as PayPalCheckoutButton };
