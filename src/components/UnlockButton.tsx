'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import {
  PROGRAM_PRICES,
  createCheckoutForPlan,
  getStripeCheckoutUrl,
  grantPremiumDemo,
  isCheckoutSessionsEnabled,
  type CheckoutPlanId,
} from '@/lib/payments';
import { submitLead } from '@/lib/supabase';
import { track } from '@/lib/analytics';
import { isFreeBeta } from '@/lib/freeBeta';
import { fetchTerritoryAccess } from '@/lib/legal/territoryAccessClient';

interface Props {
  productId?: string;
  price?: string;
  title?: string;
  label?: string;
  isSubscription?: boolean;
  className?: string;
  /** Legacy Payment Link URL (fallback when Checkout Sessions unavailable). */
  stripeCheckoutUrl?: string | null;
  /** When set, prefer POST /api/checkout for this Super Bundle plan. */
  planId?: CheckoutPlanId;
  onSuccess?: () => void;
}

const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Checkout entry point for premium products.
 *
 * - Prefer Checkout Sessions (`planId` + NEXT_PUBLIC_STRIPE_CHECKOUT) → same-tab redirect.
 * - Else Payment Link (env or prop).
 * - Otherwise founders waitlist (dev: grantPremiumDemo).
 * - Territory hard block (Europe / OIC / Canada) — no Payment Link bypass.
 */
export function UnlockButton({
  productId,
  price,
  title,
  label,
  isSubscription = false,
  className = '',
  stripeCheckoutUrl,
  planId,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [territoryBlocked, setTerritoryBlocked] = useState(false);
  const [territoryMessage, setTerritoryMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchTerritoryAccess().then((t) => {
      if (cancelled) return;
      if (t.blocked) {
        setTerritoryBlocked(true);
        setTerritoryMessage(
          t.message ||
            'Hosted checkout is not available in your region. See Supported Regions.'
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Free-first beta: no checkout / waitlist / Bundle CTAs.
  if (isFreeBeta()) return null;

  const program = productId ? PROGRAM_PRICES[productId] : null;
  const amount = price || program?.price;
  const itemTitle =
    title ||
    program?.title ||
    (isSubscription ? 'Mission Winning Super Bundle' : 'Mission Winning Program');
  const checkoutUrl =
    stripeCheckoutUrl ??
    getStripeCheckoutUrl(productId || (isSubscription ? 'super-bundle' : undefined));

  const useSessions = Boolean(planId) && isCheckoutSessionsEnabled();
  const hasLiveCheckout = useSessions || Boolean(checkoutUrl);

  const checkoutLabel =
    label ||
    (isSubscription
      ? `Unlock the Super Bundle${amount ? ` — $${amount}/mo` : ''}`
      : `Unlock${amount ? ` — $${amount}` : ''}`);

  if (territoryBlocked) {
    return (
      <div className={`border-2 border-border bg-card p-4 space-y-2 ${className}`}>
        <p className="text-sm text-foreground font-medium" role="alert">
          {territoryMessage}
        </p>
        <p className="text-xs text-muted-foreground">
          The free offline logger still works on your device without an account.{' '}
          <Link href="/regions" className="text-primary hover:underline">
            Supported Regions
          </Link>
        </p>
      </div>
    );
  }

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    setWaitlistError(null);

    const result = await submitLead({
      name: '',
      email,
      source: `waitlist-${productId || (isSubscription ? 'super-bundle' : 'premium')}`,
      message: `Founders waitlist: ${itemTitle}`,
    });

    if (!result?.ok) {
      setWaitlistError('That did not save. Check your connection and try again.');
      setSubmitting(false);
      return;
    }

    track('waitlist_joined', {
      product: productId || (isSubscription ? 'super-bundle' : 'premium'),
    });

    if (IS_DEV) grantPremiumDemo(productId || (isSubscription ? 'super-bundle' : undefined));

    setSubmitted(true);
    setSubmitting(false);
    if (onSuccess) setTimeout(onSuccess, 1200);
  };

  const startCheckout = async () => {
    setCheckoutError(null);
    track('checkout_clicked', {
      product: productId || (isSubscription ? 'super-bundle' : 'premium'),
      ...(planId ? { plan: planId } : {}),
      mode: useSessions ? 'checkout_session' : 'payment_link',
    });

    const territory = await fetchTerritoryAccess();
    if (territory.blocked) {
      setTerritoryBlocked(true);
      setTerritoryMessage(territory.message);
      return;
    }

    if (useSessions && planId) {
      setCheckoutBusy(true);
      const result = await createCheckoutForPlan(planId);
      setCheckoutBusy(false);

      if (result.ok) {
        window.location.href = result.url;
        return;
      }

      if (result.code === 'auth_required') {
        setCheckoutError(
          'Sign in on Profile with the email you will pay with, then try again.'
        );
        return;
      }

      if (result.code === 'territory_blocked') {
        setTerritoryBlocked(true);
        setTerritoryMessage(result.message);
        return;
      }

      if (result.code === 'unavailable' && checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      setCheckoutError(result.message);
      return;
    }

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  if (hasLiveCheckout) {
    return (
      <div className={className}>
        <button
          type="button"
          className="primary-action w-full disabled:opacity-50"
          disabled={checkoutBusy}
          onClick={() => void startCheckout()}
        >
          {checkoutBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting checkout…
            </>
          ) : (
            <>
              {checkoutLabel}
              <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Secure checkout by Stripe · Card · Apple Pay · Google Pay · PayPal · USDC
        </p>
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          14-day money-back on first paid charge —{' '}
          <Link href="/refunds" className="text-primary hover:underline">
            Refunds
          </Link>
        </p>
        {checkoutError && (
          <p className="mt-2 text-center text-xs text-destructive" role="alert">
            {checkoutError}{' '}
            {checkoutError.includes('Sign in') && (
              <Link href="/profile" className="underline underline-offset-2">
                Open Profile
              </Link>
            )}
          </p>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`border-2 border-primary bg-background p-4 text-center ${className}`}>
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
    <form onSubmit={handleWaitlist} className={`space-y-3 ${className}`}>
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border-2 border-border bg-background px-3 py-3 text-sm min-h-[44px]"
      />
      <button type="submit" className="primary-action w-full" disabled={submitting || !email.trim()}>
        {submitting ? 'Joining…' : 'Join founders list'}
      </button>
      {waitlistError && (
        <p className="text-center text-xs text-destructive" role="alert">
          {waitlistError}
        </p>
      )}
    </form>
  );
}
