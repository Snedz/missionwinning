/**
 * /bundle stacked shop: Free forever vs Super Bundle (one paid SKU).
 * Inventory counts from CONTENT_FLOORS via bundleShop — never hand-typed.
 */
'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { UnlockButton } from '@/components/UnlockButton';
import { Button } from '@/components/ui/button';
import {
  BUNDLE_PAID_INVENTORY,
  BUNDLE_PLANS,
  BUNDLE_VS_STACK,
  type BundlePlanId,
  type BundleShopCta,
} from '@/lib/bundleShop';
import { getStripeCheckoutUrl } from '@/lib/payments';
import { cn } from '@/lib/utils';

const PLAN_ORDER: BundlePlanId[] = ['12mo', 'monthly', 'lifetime'];

function vsStackLine(): string {
  const [a, b, c, d] = BUNDLE_VS_STACK;
  return `${a} + ${b} + ${c} + ${d}`;
}

function paidLineLabel(
  t: (key: string, opts?: Record<string, unknown>) => string,
  line: (typeof BUNDLE_PAID_INVENTORY)[number]
): string {
  if (line.id === 'coach') {
    return t('bundleShopPaidCoach', {
      defaultValue: 'Mission Coach weekly plans from your logs',
    });
  }
  if (line.id === 'recipes') {
    return t('bundleShopPaidRecipes', {
      count: line.count,
      defaultValue: '{{count}} premium recipes',
    });
  }
  if (line.id === 'move') {
    return t('bundleShopPaidMove', {
      count: line.count,
      defaultValue: '{{count}} premium Move flows',
    });
  }
  if (line.id === 'mind') {
    return t('bundleShopPaidMind', {
      count: line.count,
      defaultValue: '{{count}} premium Mind sessions',
    });
  }
  return t('bundleShopPaidLearn', {
    count: line.count,
    defaultValue: '{{count}} premium Learn sections',
  });
}

export function BundleShopStack(props: {
  planId: BundlePlanId;
  onPlanId: (id: BundlePlanId) => void;
  cta: BundleShopCta;
  className?: string;
}) {
  const { t } = useTranslation();
  const { planId, onPlanId, cta, className } = props;
  const plan = BUNDLE_PLANS[planId];
  const stripeUrl = getStripeCheckoutUrl(`bundle-${planId}`) ?? getStripeCheckoutUrl('super-bundle');

  return (
    <div className={cn('space-y-3', className)} data-testid="bundle-shop-stack">
      <article
        data-testid="bundle-card-free"
        className="card-elevated space-y-4 rounded-none p-6"
      >
        <p className="eyebrow">{t('bundleShopFreeEyebrow', { defaultValue: 'Always yours' })}</p>
        <h2 className="display-section">
          {t('bundleShopFreeTitle', { defaultValue: 'Free forever' })}
        </h2>
        <p className="max-w-xl text-sm text-muted-foreground">
          {t('bundleShopFreeBody', {
            defaultValue:
              'Logger and free floors. No account. No card. Super Bundle is optional depth — never required to log a set.',
          })}
        </p>
        <Button asChild variant="outline" className="min-h-[52px] w-full tap-target sm:w-auto">
          <Link href="/active">{t('bundleShopFreeCta', { defaultValue: 'Start training' })}</Link>
        </Button>
      </article>

      <article
        data-testid="bundle-card-paid"
        className="card-boss space-y-5 rounded-none p-6"
      >
        <p className="eyebrow text-primary">
          {t('bundleShopPaidEyebrow', { defaultValue: 'One Super Bundle' })}
        </p>
        <h2 className="display-section">
          {t('bundleHeroTitle', { defaultValue: 'Super Bundle' })}
        </h2>
        <p className="max-w-xl text-sm text-muted-foreground">
          {t('bundleShopPaidLead', {
            defaultValue:
              'Coach depth plus pillar catalogs in one install — not four apps.',
          })}
        </p>
        <p className="text-sm font-semibold">
          {t('bundleShopVsStack', {
            stack: vsStackLine(),
            defaultValue: `One Super Bundle vs ${vsStackLine()}.`,
          })}
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <span className="display-mega text-primary">${BUNDLE_PLANS['12mo'].price}</span>
          <span className="pb-1 text-sm text-muted-foreground">
            {t('bundleShopPerYear', { defaultValue: '/year founders' })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('bundleShopSecondaryPrices', {
            monthly: BUNDLE_PLANS.monthly.price,
            lifetime: BUNDLE_PLANS.lifetime.price,
            defaultValue: `$${BUNDLE_PLANS.monthly.price}/mo · $${BUNDLE_PLANS.lifetime.price} lifetime`,
          })}
        </p>

        <div className="seg w-full sm:w-auto" role="tablist" aria-label={t('bundleShopPlanChooser', { defaultValue: 'Super Bundle plan' })}>
          {PLAN_ORDER.map((id) => {
            const p = BUNDLE_PLANS[id];
            const selected = planId === id;
            const tabLabel =
              id === '12mo'
                ? t('bundleTab12mo', { defaultValue: '12 months' })
                : id === 'monthly'
                  ? t('bundleTabMonthly', { defaultValue: 'Monthly' })
                  : t('bundleTabLifetime', { defaultValue: 'Lifetime' });
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                data-state={selected ? 'active' : 'inactive'}
                className="seg-opt flex-1 sm:flex-none"
                onClick={() => onPlanId(id)}
              >
                {tabLabel}
                <span className="tabular-nums text-muted-foreground">${p.price}</span>
              </button>
            );
          })}
        </div>

        <ul className="space-y-2">
          {BUNDLE_PAID_INVENTORY.map((line) => (
            <li key={line.id} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{paidLineLabel(t, line)}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              {t('bundleShopPaidLogger', {
                defaultValue: 'Logger stays free. Never gated.',
              })}
            </span>
          </li>
        </ul>

        {cta === 'included' ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              {t('bundleShopAlreadyIncluded', { defaultValue: 'Already included' })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('bundleShopAlreadyIncludedBody', {
                defaultValue: 'Super Bundle depth is on this account.',
              })}
            </p>
            <Button asChild className="min-h-[52px] w-full tap-target">
              <Link href="/coach">{t('bundleShopOpenCoach', { defaultValue: 'Open Coach' })}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <UnlockButton
              isSubscription={plan.isSubscription}
              productId="super-bundle"
              planId={planId}
              price={plan.perMonth ?? plan.price}
              stripeCheckoutUrl={stripeUrl}
              label={
                cta === 'subscribe'
                  ? t('bundleShopSubscribe', { defaultValue: 'Subscribe Now' })
                  : t('bundleShopGetNotified', { defaultValue: 'Get notified' })
              }
              className="w-full"
            />
            {cta === 'notify' ? (
              <p className="text-center text-xs text-muted-foreground">
                {t('bundleShopCheckoutSoon', {
                  defaultValue: 'Checkout opens when payments go live.',
                })}
              </p>
            ) : null}
          </div>
        )}
      </article>
    </div>
  );
}
