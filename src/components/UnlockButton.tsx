'use client';

import React, { useState } from 'react';
import { PROGRAM_PRICES, grantPremiumDemo } from '@/lib/payments';
import { grantDemoPremium } from '@/lib/supabase';

interface Props {
  productId?: string;
  price?: string;
  title?: string;
  label?: string;
  isSubscription?: boolean;
  className?: string;
  stripeCheckoutUrl?: string | null;
  onSuccess?: () => void;
}

export function UnlockButton({
  productId,
  price,
  title,
  label,
  isSubscription = false,
  className = '',
  stripeCheckoutUrl,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const program = productId ? PROGRAM_PRICES[productId] : null;
  const amount = price || program?.price || '297';
  const itemTitle = title || program?.title || (isSubscription ? 'Mission Winning Super Bundle' : 'Mission Winning Program');
  const buttonLabel =
    label ||
    (isSubscription ? `Unlock Super Bundle ($${amount}/mo)` : `Request Access — $${amount}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    grantPremiumDemo(productId || (isSubscription ? 'super-bundle' : undefined));

    try {
      await grantDemoPremium(email);
    } catch {
      // fallback already handled in grantDemoPremium
    }

    console.log('analytics: unlock_requested', { productId, isSubscription, title: itemTitle, email });

    setSubmitted(true);

    setTimeout(() => {
      if (onSuccess) onSuccess();
      else window.location.href = '/log';
    }, 1500);
  };

  if (submitted) {
    return (
      <div className={`text-center p-3 bg-emerald-900/20 border border-emerald-400/30 rounded ${className}`}>
        <div className="text-emerald-400 font-semibold">Thank you! Demo access granted.</div>
        <div className="text-xs text-white/60 mt-1">We&apos;ll follow up at {email}. Welcome to the path.</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {stripeCheckoutUrl && (
        <a
          href={stripeCheckoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded text-base text-center mb-3"
        >
          {buttonLabel} — Stripe Checkout
        </a>
      )}
      <form onSubmit={handleSubmit}>
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
            {stripeCheckoutUrl ? 'Or request demo access' : buttonLabel}
          </button>
        </div>
        <div className="text-[10px] text-center mt-1 text-white/40">
          Free core always. Real checkout via Stripe when LLC + payment link is configured.
        </div>
      </form>
    </div>
  );
}

export { UnlockButton as PayPalCheckoutButton };
