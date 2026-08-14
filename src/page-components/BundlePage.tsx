/**
 * Page: /bundle — Super Bundle checkout
 * See: app/INDEX.md, src/page-components/INDEX.md
 * D4 beta composure: thin hero → one story → one offer → quiet compare.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { track } from "@/lib/analytics";
import { usePremium } from "@/hooks/usePremium";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Loader2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PillarPageHeader } from "@/components/layout/PillarPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnlockButton } from "@/components/UnlockButton";
import dynamic from "next/dynamic";
import { isSurfaceEnabled } from "@/lib/surface";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { BUNDLE_PILLARS } from "@/lib/payments";
import { CONTENT_FLOORS } from "@/lib/contentFloors";
import {
  BUNDLE_PLANS,
  DEFAULT_BUNDLE_PLAN,
  PILLAR_STANDALONE_PRICES,
  bundleSavingsPercent,
  getStripeCheckoutUrl,
  type BundlePlanId,
} from "@/lib/bundleConfig";
import { BUNDLE_PILLAR_I18N } from "@/i18n/bundleLocales";
import { cn } from "@/lib/utils";

function planBadgeLabel(
  badge: "popular" | "bestValue" | "limited" | undefined,
  t: (key: string, opts?: { defaultValue: string }) => string
): string | null {
  if (badge === "popular") return t('bundleBadgePopular', { defaultValue: 'Founders' });
  if (badge === "bestValue") return t('bundleBadgeBestValue', { defaultValue: 'Best value' });
  if (badge === "limited") return t('bundleBadgeLimited', { defaultValue: 'Limited offer' });
  return null;
}

// `dynamic()`, not a static import — @phantom/react-sdk is 508K gzipped and carries
// 19 of the repo's Dependabot alerts. A static import ships all of it to every
// /bundle visitor whether or not the crypto rail is even enabled; the surface check
// below means a parked `cryptoRails` costs zero bytes. This page 307s to /log while
// FREE_BETA is on, so the static version was latent — armed to land in the client
// bundle the moment payments flip on, which is precisely the wrong moment.
const PhantomLifetimeCheckout = dynamic(
  () =>
    import("@/components/crypto/PhantomLifetimeCheckout").then(
      (m) => m.PhantomLifetimeCheckout
    ),
  { ssr: false }
);

export function BundlePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { premium, loading: premiumLoading, refetch } = usePremium();
  const [planId, setPlanId] = useState<BundlePlanId>(DEFAULT_BUNDLE_PLAN);
  const [unlockTimedOut, setUnlockTimedOut] = useState(false);
  const unlockedToastSent = useRef(false);
  const plan = BUNDLE_PLANS[planId];
  const stripeUrl = getStripeCheckoutUrl("super-bundle");
  const vsSeparateSavings = bundleSavingsPercent();

  useEffect(() => {
    track('bundle_viewed');
  }, []);

  const checkoutSuccess = searchParams.get('checkout') === 'success';

  useEffect(() => {
    if (!checkoutSuccess || premiumLoading || premium) return;
    refetch();
    const interval = setInterval(refetch, 4000);
    const stop = setTimeout(() => clearInterval(interval), 90_000);
    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [checkoutSuccess, premium, premiumLoading, refetch]);

  useEffect(() => {
    if (!checkoutSuccess || premium) {
      setUnlockTimedOut(false);
      return;
    }
    const tId = setTimeout(() => setUnlockTimedOut(true), 90_000);
    return () => clearTimeout(tId);
  }, [checkoutSuccess, premium]);

  useEffect(() => {
    if (!checkoutSuccess || premiumLoading || !premium) return;
    track('checkout_completed', { premium: true });
    if (!unlockedToastSent.current) {
      unlockedToastSent.current = true;
      toast({
        title: t('bundleCheckoutSuccess', {
          defaultValue: 'Premium active — Mission Coach and bundle content are unlocked.',
        }),
      });
    }
  }, [checkoutSuccess, premium, premiumLoading, t, toast]);

  const planTabLabel =
    planId === "monthly"
      ? t("bundleTabMonthly", { defaultValue: t("bundleTab3mo", { defaultValue: "Monthly" }) })
      : planId === "12mo"
        ? t('bundleTab12mo', { defaultValue: '12 months' })
        : t('bundleTabLifetime', { defaultValue: 'Lifetime' });

  const billingLineFor = (id: BundlePlanId, price: string) =>
    id === "lifetime"
      ? t('bundleBilledOnce', { price, defaultValue: '${{price}} one-time' })
      : id === "monthly"
        ? t("bundleBilledMonthly", { price, defaultValue: `$${price} billed monthly` })
        : t('bundleBilledTotal', { price, defaultValue: '${{price}} billed once' });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="compact" />

      {/* Thin hero */}
      <div className="hero-field section-seam relative">
        <div className="relative z-[1] mx-auto max-w-4xl space-y-3 px-5 pb-10 pt-10">
          <Badge className="w-fit border-border bg-muted text-accent-900 hover:bg-muted">
            {t('bundleUrgencyBadge', { defaultValue: 'Founders pricing — locked in at launch' })}
          </Badge>
          <PillarPageHeader
            icon={Sparkles}
            eyebrow={t('bundleEyebrow', { defaultValue: 'Super Bundle' })}
            title={t('bundleHeadline', { defaultValue: 'Mission Coach + depth. One honest price.' })}
            subtitle={t('bundleSubhead', { defaultValue: 'Adaptive weekly plans from your workout logs — then Fuel, Move, Mind, Track, and Learn depth when you want it. Free logger stays free forever.' })}
          />
          <p className="max-w-xl text-sm text-muted-foreground">
            {t('bundleHonestNote', {
              defaultValue:
                'Free logger stays free. Bundle unlocks Mission Coach + deeper Fuel/Move/Mind/Learn — never required to log workouts.',
            })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-10 px-5 pb-12 pt-8">
        {checkoutSuccess && (
          <Card className="border-primary/40 bg-primary/10">
            <CardContent className="space-y-3 pt-6">
              {premium ? (
                <p className="text-sm font-semibold text-primary">
                  {t('bundleCheckoutSuccess', {
                    defaultValue: 'Premium active — Mission Coach and bundle content are unlocked.',
                  })}
                </p>
              ) : unlockTimedOut ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t('bundleCheckoutStillProcessing', {
                      defaultValue:
                        'Still processing — refresh this page or check the email you used at checkout. Premium unlocks after payment confirms.',
                    })}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] tap-target"
                    onClick={() => {
                      setUnlockTimedOut(false);
                      refetch();
                    }}
                  >
                    {t('bundleCheckoutRetry', { defaultValue: 'Check again' })}
                  </Button>
                </>
              ) : (
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  {t('bundleCheckoutUnlocking', {
                    defaultValue: 'Unlocking your Super Bundle…',
                  })}
                </p>
              )}
              {premium && (
                <Button asChild variant="default" size="sm" className="min-h-[44px] tap-target">
                  <Link href="/coach">{t('coachViewPlan', { defaultValue: 'View full week' })}</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* One pillar story — prose only, no tile grid */}
        <section className="space-y-2">
          <p className="eyebrow">{t('bundleStoryEyebrow', { defaultValue: 'One path' })}</p>
          <h2 className="display-section">
            {t('bundleStoryTitle', { defaultValue: 'Mission Coach depth. Same free logger.' })}
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            {t('bundleStoryBody', {
              defaultValue:
                'Bundle deepens Coach and the other pillars when you want more. The free offline logger stays free forever — never gated.',
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('bundleStoryProof', {
              defaultValue: 'Product proof: Today briefing · Just Go · rest · PRs — free forever.',
            })}
          </p>
        </section>

        {/* One offer card */}
        <Tabs
          value={planId}
          onValueChange={(v) => setPlanId(v as BundlePlanId)}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0">
            {(["monthly", "12mo", "lifetime"] as const).map((id) => {
              const p = BUNDLE_PLANS[id];
              const label =
                id === "monthly"
                  ? t("bundleTabMonthly", {
                      defaultValue: t("bundleTab3mo", { defaultValue: "Monthly" }),
                    })
                  : id === "12mo"
                    ? t('bundleTab12mo', { defaultValue: '12 months' })
                    : t('bundleTabLifetime', { defaultValue: 'Lifetime' });
              const badgeText = planBadgeLabel(p.badge, t);
              return (
                <TabsTrigger
                  key={id}
                  value={id}
                  className={cn(
                    "flex h-auto flex-col items-start gap-0.5 border-2 border-border bg-card px-3 py-3 text-left data-[state=active]:border-primary data-[state=active]:bg-tint"
                  )}
                >
                  <span className="text-xs font-semibold sm:text-sm">{label}</span>
                  <span className="font-display text-lg font-semibold tabular-nums leading-none">
                    ${p.price}
                  </span>
                  {p.perMonth ? (
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      ${p.perMonth}/mo
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">once</span>
                  )}
                  {badgeText ? (
                    <span className="mt-1 text-[9px] uppercase tracking-wider text-primary">
                      {badgeText}
                    </span>
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(["monthly", "12mo", "lifetime"] as const).map((id) => {
            const p = BUNDLE_PLANS[id];
            const badgeText = planBadgeLabel(p.badge, t);
            return (
              <TabsContent key={id} value={id} className="mt-4">
                <Card className="card-boss overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                          <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                          {t('bundleHeroTitle', { defaultValue: 'Super Bundle' })}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{t('bundleHeroSubtitle', { defaultValue: 'Coach + pillar depth in one install — vs juggling partner apps' })}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {badgeText && (
                          <Badge className="bg-primary-fill text-primary-foreground">{badgeText}</Badge>
                        )}
                        {p.savingsPercent > 0 && (
                          <Badge variant="outline" className="border-primary/50 text-primary">
                            {t('bundleSavePercent', { percent: p.savingsPercent, defaultValue: 'Save {{percent}}%' })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap items-end gap-3">
                      <span className="text-lg tabular-nums text-muted-foreground line-through">
                        ${p.strikePrice}
                      </span>
                      <span className="display-mega text-primary">${p.price}</span>
                      {p.perMonth && (
                        <span className="pb-1 text-sm text-muted-foreground">
                          {t('bundlePerMonth', { price: p.perMonth, defaultValue: '${{price}}/mo' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{billingLineFor(id, p.price)}</p>

                    {vsSeparateSavings > 0 && (
                      <p className="text-sm font-semibold text-primary">
                        {t('bundleVsSeparate', { percent: vsSeparateSavings, defaultValue: 'Save {{percent}}% vs buying pillars separately' })}
                      </p>
                    )}

                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Trophy className="h-3.5 w-3.5 shrink-0 text-accent-900" />
                      {t('bundleWinScoreNote', { defaultValue: 'Today Win Score ties every pillar together.' })}
                    </p>

                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>
                          <strong>{t('bundlePillarTrain', { defaultValue: 'Train' })}</strong>
                          {' — '}
                          {t('bundlePillarTrainPremium', {
                            defaultValue: 'Mission Coach weekly plans + adapt depth',
                          })}
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>
                          {t('bundleProofNearCta', {
                            defaultValue:
                              'Deeper Fuel, Move, Mind, Track, and Learn — one subscription, logger never gated.',
                          })}
                        </span>
                      </li>
                    </ul>

                    <p className="mb-3 text-center text-[11px] text-muted-foreground">
                      {t('bundlePayMethods', {
                        defaultValue: 'Card · Apple Pay · Google Pay · PayPal · USDC',
                      })}
                    </p>
                    {id === 'lifetime' && (
                      <p className="mb-3 text-center text-xs text-primary">
                        {t('bundleUsdcNote', {
                          defaultValue:
                            'Prefer wallet USDC? Pay with Phantom below (no Stripe) — or use USDC inside Stripe Checkout when enabled.',
                        })}
                      </p>
                    )}
                    <UnlockButton
                      isSubscription={p.isSubscription}
                      productId="super-bundle"
                      planId={id}
                      price={p.perMonth ?? p.price}
                      stripeCheckoutUrl={getStripeCheckoutUrl(`bundle-${id}`) ?? stripeUrl}
                      label={
                        id === 'lifetime'
                          ? t('bundleUnlockLifetimeCta', {
                              defaultValue: 'Unlock lifetime — card or USDC',
                            })
                          : t('bundleUnlockCta', { defaultValue: 'Unlock Super Bundle' })
                      }
                      className="w-full"
                    />
                    {id === 'lifetime' && isSurfaceEnabled('cryptoRails') && (
                      <PhantomLifetimeCheckout className="mt-3 w-full" />
                    )}
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      {t('bundleRefundNote', {
                        defaultValue: '14-day money-back on first paid charge — see',
                      })}{' '}
                      <Link href="/refunds" className="text-primary hover:underline">
                        {t('infoRefundsTitle', { defaultValue: 'Refunds' })}
                      </Link>
                      .
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Quiet compare — below fold, one table */}
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-semibold text-muted-foreground marker:content-none hover:text-foreground">
            <span className="flex items-center justify-between gap-4">
              {t('bundleCompareTitle', { defaultValue: 'Compare standalone vs bundle' })}
              <span className="transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <div className="mt-4 overflow-x-auto border-2 border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-card">
                  <th className="p-3 text-start font-semibold">{t('bundleColPillar', { defaultValue: 'Pillar' })}</th>
                  <th className="hidden p-3 text-start font-semibold sm:table-cell">
                    {t('bundleColPremium', { defaultValue: 'Premium tier' })}
                  </th>
                  <th className="p-3 text-end font-semibold">{t('bundleColMonthly', { defaultValue: 'Monthly' })}</th>
                  <th className="p-3 text-center font-semibold">{t('bundleColIncluded', { defaultValue: 'In bundle' })}</th>
                </tr>
              </thead>
              <tbody>
                {BUNDLE_PILLARS.map((pillar) => {
                  const keys = BUNDLE_PILLAR_I18N[pillar.id];
                  const fuelCount = { count: CONTENT_FLOORS.recipesPremium };
                  const premiumCopy = keys
                    ? pillar.id === "fuel"
                      ? t(keys.premiumKey, fuelCount)
                      : t(keys.premiumKey, {
                          ...(pillar.id === "mind"
                            ? { count: CONTENT_FLOORS.mindPremium }
                            : {}),
                          defaultValue: pillar.premium,
                        })
                    : pillar.premium;
                  return (
                    <tr key={pillar.id} className="border-b border-border last:border-0">
                      <td className="p-3">
                        <p className="font-semibold">{keys ? t(keys.nameKey) : pillar.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {premiumCopy}
                        </p>
                      </td>
                      <td className="hidden p-3 text-muted-foreground sm:table-cell">
                        {premiumCopy}
                      </td>
                      <td className="p-3 text-end tabular-nums">
                        ${PILLAR_STANDALONE_PRICES[pillar.id] ?? "—"}
                      </td>
                      <td className="p-3 text-center">
                        <Check className="inline h-4 w-4 text-primary" aria-label="included" />
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-border bg-tint font-semibold">
                  <td className="p-3" colSpan={2}>
                    {t('bundleRowTotal', { defaultValue: 'Super Bundle (all pillars)' })}
                  </td>
                  <td className="p-3 text-end tabular-nums">
                    {plan.perMonth ? (
                      <>
                        ${plan.perMonth}
                        <span className="block text-xs font-normal text-muted-foreground">
                          ({planTabLabel})
                        </span>
                      </>
                    ) : (
                      <>${plan.price}</>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Check className="inline h-4 w-4 text-primary" aria-label="included" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t('bundleCompareFoot', { defaultValue: 'Standalone prices are illustrative — the bundle costs less than subscribing to equivalent apps separately.' })}</p>
        </details>

        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('bundleFreeForeverTitle', { defaultValue: 'Free forever' })}</strong>
          {' — '}
          {t('bundleFreeForeverBody', { defaultValue: 'Every pillar includes a free tier: workouts, recipes, mobility flows, breathing, activity logging, and learn paths. Premium unlocks advanced programs, full recipe library, and cloud sync priority.' })}
        </p>
      </div>
      <MarketingFooter />
    </div>
  );
}
