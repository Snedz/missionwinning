/**
 * Page: /bundle — Super Bundle checkout
 * See: app/INDEX.md, src/page-components/INDEX.md
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { track } from "@/lib/analytics";
import { usePremium } from "@/hooks/usePremium";
import {
  BookOpen,
  Brain,
  Check,
  Dumbbell,
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
  const searchParams = useSearchParams();
  const { premium, loading: premiumLoading, refetch } = usePremium();
  const [planId, setPlanId] = useState<BundlePlanId>(DEFAULT_BUNDLE_PLAN);
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
    if (!checkoutSuccess || premiumLoading || !premium) return;
    track('checkout_completed', { premium: true });
  }, [checkoutSuccess, premium, premiumLoading]);

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
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
              MW
            </span>
            <span className="font-display text-lg font-semibold uppercase tracking-wide truncate">
              Mission Winning
            </span>
          </Link>
          <Link
            href="/welcome"
            className="shrink-0 rounded-xl border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('bundleNavFree', { defaultValue: 'Free core' })}
          </Link>
        </div>
      </div>

    <div className="space-y-10 max-w-4xl mx-auto px-5 pb-12 pt-8">
      {/* Title block */}
      <div className="space-y-3">
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

      {checkoutSuccess && !premiumLoading && (
        <Card className="border-primary/40 bg-primary/10">
          <CardContent className="pt-6">
            {premium ? (
              <p className="text-sm font-medium text-primary">
                {t('bundleCheckoutSuccess', {
                  defaultValue: 'Premium active — Mission Coach and bundle content are unlocked.',
                })}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('bundleCheckoutPending', {
                  defaultValue:
                    'Thanks! If you just paid, premium may take a minute — refresh or sign in with your checkout email.',
                })}
              </p>
            )}
            {premium && (
              <Button asChild variant="fitness" size="sm" className="mt-3">
                <Link href="/coach">{t('coachViewPlan', { defaultValue: 'View full week' })}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Story scroll — six pillars before checkout (REDTEAM: under-promise) */}
      <section className="rounded-2xl border border-border/40 bg-gradient-to-br from-emerald-950/25 via-card/40 to-transparent p-6 md:p-8 space-y-5">
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
        <TabsList className="grid grid-cols-3 h-auto p-1">
          <TabsTrigger value="monthly" className="py-2.5 text-xs sm:text-sm">
            {t("bundleTabMonthly", { defaultValue: t("bundleTab3mo", { defaultValue: "Monthly" }) })}
          </TabsTrigger>
          <TabsTrigger value="12mo" className="py-2.5 text-xs sm:text-sm relative">
            {t("bundleTab12mo")}
            <span className="absolute -top-1 end-1 hidden sm:inline-flex">
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                {t("bundleBadgePopular")}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger value="lifetime" className="py-2.5 text-xs sm:text-sm">
            {t("bundleTabLifetime")}
          </TabsTrigger>
        </TabsList>

        {(["monthly", "12mo", "lifetime"] as const).map((id) => {
          const p = BUNDLE_PLANS[id];
          const badgeText = planBadgeLabel(p.badge, t);
          return (
            <TabsContent key={id} value={id} className="mt-4">
              <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden shadow-lg">
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
                    <span className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">
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
                      <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
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
                  <UnlockButton
                    isSubscription={p.isSubscription}
                    productId="super-bundle"
                    price={p.perMonth ?? p.price}
                    stripeCheckoutUrl={getStripeCheckoutUrl(`bundle-${id}`) ?? stripeUrl}
                    label={t("bundleUnlockCta")}
                    className="w-full"
                  />
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
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
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
                  <tr key={pillar.id} className="border-b last:border-0">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("bundleFreeForeverTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{t("bundleFreeForeverBody")}</p>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
