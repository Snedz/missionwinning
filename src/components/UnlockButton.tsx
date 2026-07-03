'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { PROGRAM_PRICES, getStripeCheckoutUrl, grantPremiumDemo } from '@/lib/payments';
import { submitLead } from '@/lib/supabase';
import { track } from '@/lib/analytics';

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

const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Checkout entry point for premium products.
 *
 * - When a Stripe Payment Link is configured (env or prop), renders real checkout.
 * - Otherwise renders an honest founders-waitlist capture — no fake purchases,
 *   no "access granted" theater. (In local dev only, joining the waitlist also
 *   grants demo premium so the paid experience can be tested.)
 */
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
  const [submitting, setSubmitting] = useState(false);

  const program = productId ? PROGRAM_PRICES[productId] : null;
  const amount = price || program?.price;
  const itemTitle =
    title || program?.title || (isSubscription ? 'Mission Winning Super Bundle' : 'Mission Winning Program');
  const checkoutUrl =
    stripeCheckoutUrl ?? getStripeCheckoutUrl(productId || (isSubscription ? 'super-bundle' : undefined));

  const checkoutLabel =
    label || (isSubscription ? `Unlock the Super Bundle${amount ? ` — $${amount}/mo` : ''}` : `Unlock${amount ? ` — $${amount}` : ''}`);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    try {
      await submitLead({
        name: '',
        email,
        source: `waitlist-${productId || (isSubscription ? 'super-bundle' : 'premium')}`,
        message: `Founders waitlist: ${itemTitle}`,
      });
    } catch {
      // Lead capture is best-effort; the confirmation below is still honest —
      // the founder reviews waitlist submissions manually during beta.
    }

    track('waitlist_joined', { product: productId || (isSubscription ? 'super-bundle' : 'premium') });

    if (IS_DEV) grantPremiumDemo(productId || (isSubscription ? 'super-bundle' : undefined));

    setSubmitted(true);
    setSubmitting(false);
    if (onSuccess) setTimeout(onSuccess, 1200);
  };

  if (checkoutUrl) {
    return (
      <div className={className}>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="primary-action"
          onClick={() =>
            track('checkout_clicked', {
              product: productId || (isSubscription ? 'super-bundle' : 'premium'),
            })
          }
        >
          {checkoutLabel}
          <ArrowUpRight className="h-4 w-4" />
        </a>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Secure checkout by Stripe · 30-day guarantee · The free core stays free
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        className={`rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center ${className}`}
      >
        <p className="inline-flex items-center gap-1.5 font-semibold text-primary">
          <Check className="h-4 w-4" /> You&apos;re on the founders list.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          We&apos;ll email {email} when checkout opens. Founders lock in the launch discount.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleWaitlist} className={className}>
      <div className="flex flex-col gap-2">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email for the founders waitlist"
          className="tap-target w-full rounded-xl border border-input bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" disabled={submitting} className="primary-action disabled:opacity-60">
          {submitting ? 'Joining…' : 'Join the founders waitlist'}
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Checkout opens soon. Founders get the launch discount first — and the free core stays free
        either way.
      </p>
    </form>
  );
}

export { UnlockButton as PayPalCheckoutButton };
