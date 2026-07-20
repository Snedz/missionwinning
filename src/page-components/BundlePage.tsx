/**
 * Page: /bundle — Super Bundle checkout
 * See: app/INDEX.md, src/page-components/INDEX.md
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
  BookOpen,
  Brain,
  Check,
  Dumbbell,
  Loader2,
  MapPin,
  Sparkles,
  Trophy,
  UtensilsCrossed,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PillarPageHeader } from "@/components/layout/PillarPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnlockButton } from "@/components/UnlockButton";
import { PhantomLifetimeCheckout } from "@/components/crypto/PhantomLifetimeCheckout";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { BUNDLE_PILLARS } from "@/lib/payments";
import {
  BUNDLE_PLANS,
  DEFAULT_BUNDLE_PLAN,
  PILLAR_STANDALONE_PRICES,
  bundleSavingsPercent,
  getStripeCheckoutUrl,
  type BundlePlanId,
} from "@/lib/bundleConfig";
import { BUNDLE_PILLAR_I18N } from "@/i18n/bundleLocales";
import {
  PREMIUM_INVENTORY,
  PREMIUM_RECIPE_COUNT,
} from "@/data/premiumInventory";
import { cn } from "@/lib/utils";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  train: Dumbbell,
  fuel: UtensilsCrossed,
  move: Wind,
  mind: Brain,
  track: MapPin,
  learn: BookOpen,
};

function planBadgeLabel(
  badge: "popular" | "bestValue" | "limited" | undefined,
  t: (key: string) => string
): string | null {
  if (badge === "popular") return t("bundleBadgePopular");
  if (badge === "bestValue") return t("bundleBadgeBestValue");
  if (badge === "limited") return t("bundleBadgeLimited");
  return null;
}

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
        ? t("bundleTab12mo")
        : t("bundleTabLifetime");

  const billingLineFor = (id: BundlePlanId, price: string) =>
    id === "lifetime"
      ? t("bundleBilledOnce", { price })
      : id === "monthly"
        ? t("bundleBilledMonthly", { price, defaultValue: `$${price} billed monthly` })
        : t("bundleBilledTotal", { price });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="compact" />

      <div className="hero-field texture-noise section-seam relative">
        <div className="relative z-[1] mx-auto max-w-4xl space-y-3 px-5 pb-10 pt-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{t("bundleBadge")}</Badge>
            <Badge className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/10">
              {t("bundleExpandedContent", { defaultValue: "Depth when you want it" })}
            </Badge>
            <Badge className="border-brass/40 bg-brass/15 text-brass hover:bg-brass/15">
              {t("bundleUrgencyBadge")}
            </Badge>
          </div>
          <PillarPageHeader
            icon={Sparkles}
            eyebrow={t('bundleEyebrow', { defaultValue: 'Super Bundle' })}
            title={t("bundleHeadline")}
            subtitle={t("bundleSubhead")}
          />
          <p className="text-sm text-muted-foreground max-w-xl">
            {t('bundleHonestNote', {
              defaultValue:
                'Free tracker stays free. Bundle unlocks Coach, deeper Fuel/Move/Mind/Learn — never required to log workouts.',
            })}
          </p>
          <ul className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <li className="rounded-full border border-border/50 px-2.5 py-1">
              {t('bundleProofRecipes', {
                count: PREMIUM_RECIPE_COUNT,
                defaultValue: `${PREMIUM_RECIPE_COUNT} premium recipes`,
              })}
            </li>
            <li className="rounded-full border border-border/50 px-2.5 py-1">
              {t('bundleProofMind', {
                count: PREMIUM_INVENTORY.mindSessions,
                defaultValue: `${PREMIUM_INVENTORY.mindSessions} Mind sessions`,
              })}
            </li>
            <li className="rounded-full border border-border/50 px-2.5 py-1">
              {t('bundleProofMove', {
                count: PREMIUM_INVENTORY.moveFlows,
                defaultValue: `${PREMIUM_INVENTORY.moveFlows} Move flows`,
              })}
            </li>
            <li className="rounded-full border border-border/50 px-2.5 py-1">
              {t('bundleProofCoach', { defaultValue: 'AI weekly plan + GPS Track' })}
            </li>
          </ul>
        </div>
      </div>

    <div className="space-y-10 max-w-4xl mx-auto px-5 pb-12 pt-8">

      {checkoutSuccess && (
        <Card className="border-primary/40 bg-primary/10">
          <CardContent className="pt-6 space-y-3">
            {premium ? (
              <p className="text-sm font-medium text-primary">
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
                  onClick={() => {
                    setUnlockTimedOut(false);
                    refetch();
                  }}
                >
                  {t('bundleCheckoutRetry', { defaultValue: 'Check again' })}
                </Button>
              </>
            ) : (
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                {t('bundleCheckoutUnlocking', {
                  defaultValue: 'Unlocking your Super Bundle…',
                })}
              </p>
            )}
            {premium && (
              <Button asChild variant="fitness" size="sm">
                <Link href="/coach">{t('coachViewPlan', { defaultValue: 'View full week' })}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Story scroll — six pillars before checkout (REDTEAM: under-promise) */}
      <section className="card-elevated p-6 md:p-8 space-y-5">
        <div className="space-y-2">
          <p className="eyebrow">{t('bundleStoryEyebrow', { defaultValue: 'One app' })}</p>
          <h2 className="display-section text-xl md:text-2xl">
            {t('bundleStoryTitle', { defaultValue: 'Six pillars. One Win Score.' })}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            {t('bundleStoryBody', {
              defaultValue:
                'Train, Fuel, Move, Mind, Track, and Learn share the same briefing — not six subscriptions. The free logger stays free; Bundle deepens Coach and pillar content when you want more.',
            })}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BUNDLE_PILLARS.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id] ?? Sparkles;
            const keys = BUNDLE_PILLAR_I18N[pillar.id];
            return (
              <div
                key={pillar.id}
                className="rounded-xl border border-border/40 bg-background/40 px-3 py-3 space-y-1"
              >
                <Icon className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">
                  {keys ? t(keys.nameKey) : pillar.name}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {keys ? t(keys.freeKey) : pillar.free}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('bundleStoryProof', {
            defaultValue: 'Product proof: Today briefing · Just Go · rest · PRs — free forever.',
          })}{' '}
          <Link href="/compare" className="text-primary hover:underline">
            {t('bundleStoryCompare', { defaultValue: 'See comparisons' })}
          </Link>
        </p>
      </section>

      {/* Duration tabs + hero offer card */}
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
                  ? t("bundleTab12mo")
                  : t("bundleTabLifetime");
            const badgeText = planBadgeLabel(p.badge, t);
            return (
              <TabsTrigger
                key={id}
                value={id}
                className={cn(
                  "flex h-auto flex-col items-start gap-0.5 rounded-xl border border-border/50 bg-card/60 px-3 py-3 text-left data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:shadow-glow"
                )}
              >
                <span className="text-xs font-medium sm:text-sm">{label}</span>
                <span className="font-display text-lg font-semibold tabular-nums leading-none">
                  ${p.price}
                </span>
                {p.perMonth ? (
                  <span className="text-[10px] text-muted-foreground tabular-nums">
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
              <Card className="card-elevated card-glow-emerald overflow-hidden border-primary/30">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                        <Sparkles className="h-5 w-5 text-primary shrink-0" />
                        {t("bundleHeroTitle")}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{t("bundleHeroSubtitle")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {badgeText && (
                        <Badge className="bg-primary text-primary-foreground">{badgeText}</Badge>
                      )}
                      {p.savingsPercent > 0 && (
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          {t("bundleSavePercent", { percent: p.savingsPercent })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-lg text-muted-foreground line-through tabular-nums">
                      ${p.strikePrice}
                    </span>
                    <span className="display-mega text-primary">
                      ${p.price}
                    </span>
                    {p.perMonth && (
                      <span className="text-sm text-muted-foreground pb-1">
                        {t("bundlePerMonth", { price: p.perMonth })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{billingLineFor(id, p.price)}</p>

                  {vsSeparateSavings > 0 && (
                    <p className="text-sm font-medium text-primary">
                      {t("bundleVsSeparate", { percent: vsSeparateSavings })}
                    </p>
                  )}

                  {/* Pillar icon grid */}
                  <div>
                    <p className="text-sm font-semibold mb-3">{t("bundleOneAppTitle")}</p>
                    <p className="text-xs text-muted-foreground mb-4">{t("bundleOneAppDesc")}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {BUNDLE_PILLARS.map((pillar) => {
                        const Icon = PILLAR_ICONS[pillar.id] ?? Sparkles;
                        const keys = BUNDLE_PILLAR_I18N[pillar.id];
                        return (
                          <Link
                            key={pillar.id}
                            href={pillar.route}
                            className="flex flex-col items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors text-center"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" aria-hidden />
                            </div>
                            <span className="text-xs font-semibold leading-tight">
                              {keys ? t(keys.nameKey) : pillar.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-[hsl(var(--status-warn))] shrink-0" />
                      {t("bundleWinScoreNote")}
                    </p>
                  </div>

                  <ul className="grid sm:grid-cols-2 gap-2">
                    {BUNDLE_PILLARS.map((pillar) => {
                      const keys = BUNDLE_PILLAR_I18N[pillar.id];
                      return (
                        <li key={pillar.id} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>
                            <strong>{keys ? t(keys.nameKey) : pillar.name}</strong>
                            {" — "}
                            {keys ? t(keys.premiumKey) : pillar.premium}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="text-xs text-primary/90 mb-2">
                    {t('bundleProofNearCta', {
                      defaultValue: 'Six pillars in one app — not a multi-app unlock email.',
                    })}
                  </p>
                  <p className="text-center text-[11px] text-muted-foreground mb-3">
                    {t('bundlePayMethods', {
                      defaultValue: 'Card · Apple Pay · Google Pay · PayPal · USDC',
                    })}
                  </p>
                  {id === 'lifetime' && (
                    <p className="text-center text-xs text-primary mb-3">
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
                        : t('bundleUnlockCta')
                    }
                    className="w-full"
                  />
                  {id === 'lifetime' && (
                    <PhantomLifetimeCheckout className="w-full mt-3" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Shipped premium experiences */}
      <section className="rounded-lg border border-primary/40 bg-primary/10 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-primary">
          {t('bundleShippedTitle', { defaultValue: 'What premium unlocks today' })}
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/mind" className="text-foreground hover:text-primary">
              {t('bundlePillarMind')}
            </Link>
            {' — '}
            {t('bundlePillarMindPremium')}
          </li>
          <li>
            <Link href="/move" className="text-foreground hover:text-primary">
              {t('bundlePillarMove')}
            </Link>
            {' — '}
            {t('bundlePillarMovePremium')}
          </li>
          <li>
            <Link href="/learn/course" className="text-foreground hover:text-primary">
              {t('bundlePillarLearn')}
            </Link>
            {' — '}
            {t('bundlePillarLearnPremium')}
          </li>
          <li>
            <Link href="/track" className="text-foreground hover:text-primary">
              {t('bundlePillarTrack')}
            </Link>
            {' — '}
            {t('bundlePillarTrackPremium')}
          </li>
        </ul>
      </section>

      {/* Comparison table — below fold */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("bundleCompareTitle")}</h2>
        <div className="card-elevated overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-start p-3 font-medium">{t("bundleColPillar")}</th>
                <th className="text-start p-3 font-medium hidden sm:table-cell">
                  {t("bundleColPremium")}
                </th>
                <th className="text-end p-3 font-medium">{t("bundleColMonthly")}</th>
                <th className="text-center p-3 font-medium">{t("bundleColIncluded")}</th>
              </tr>
            </thead>
            <tbody>
              {BUNDLE_PILLARS.map((pillar) => {
                const keys = BUNDLE_PILLAR_I18N[pillar.id];
                return (
                  <tr key={pillar.id} className="border-b border-border/30 last:border-0">
                    <td className="p-3">
                      <p className="font-medium">{keys ? t(keys.nameKey) : pillar.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {keys ? t(keys.premiumKey) : pillar.premium}
                      </p>
                    </td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">
                      {keys ? t(keys.premiumKey) : pillar.premium}
                    </td>
                    <td className="p-3 text-end tabular-nums">
                      ${PILLAR_STANDALONE_PRICES[pillar.id] ?? "—"}
                    </td>
                    <td className="p-3 text-center">
                      <Check className="h-4 w-4 text-primary inline" aria-label="included" />
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-primary/5 font-medium">
                <td className="p-3" colSpan={2}>
                  {t("bundleRowTotal")}
                </td>
                <td className="p-3 text-end tabular-nums">
                  {plan.perMonth ? (
                    <>
                      ${plan.perMonth}
                      <span className="text-xs text-muted-foreground font-normal block">
                        ({planTabLabel})
                      </span>
                    </>
                  ) : (
                    <>${plan.price}</>
                  )}
                </td>
                <td className="p-3 text-center">
                  <Check className="h-4 w-4 text-primary inline" aria-label="included" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">{t("bundleCompareFoot")}</p>
      </section>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">{t("bundleFreeForeverTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{t("bundleFreeForeverBody")}</p>
        </CardContent>
      </Card>
    </div>
    <MarketingFooter />
    </div>
  );
}
