/**
 * Page: /bundle — Super Bundle shop (Free vs one paid SKU).
 * See: docs/SUPER_BUNDLE_SHOP_PLAN.md, app/INDEX.md, src/page-components/INDEX.md
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PillarPageHeader } from "@/components/layout/PillarPageHeader";
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
  type BundlePlanId,
} from "@/lib/bundleConfig";
import { BUNDLE_PILLAR_I18N } from "@/i18n/bundleLocales";
import { BundleShopStack } from "@/components/bundle/BundleShopStack";
import { bundleShopCta } from "@/lib/bundleShop";
import { isFreeBeta } from "@/lib/freeBeta";
import {
  getStripeCheckoutUrl,
  isCheckoutSessionsEnabled,
  isPaidCheckoutAllowed,
} from "@/lib/payments";

// `dynamic()`, not a static import — @phantom/react-sdk is 508K gzipped.
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
  const vsSeparateSavings = bundleSavingsPercent();
  const checkoutConfigured =
    isCheckoutSessionsEnabled() ||
    Boolean(getStripeCheckoutUrl(`bundle-${planId}`) || getStripeCheckoutUrl("super-bundle"));
  const cta = bundleShopCta({
    freeBeta: isFreeBeta(),
    checkoutConfigured,
    purchased: premium && !isFreeBeta(),
  });

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="compact" />

      <div className="hero-field section-seam relative">
        <div className="relative z-[1] mx-auto max-w-4xl space-y-3 px-5 pb-10 pt-10">
          <Badge className="w-fit border-border bg-muted text-accent-900 hover:bg-muted">
            {t("bundleUrgencyBadge")}
          </Badge>
          <PillarPageHeader
            icon={Sparkles}
            eyebrow={t('bundleEyebrow', { defaultValue: 'Super Bundle' })}
            title={t("bundleHeadline")}
            subtitle={t("bundleSubhead")}
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
          <Card className="rounded-none border-primary/40 bg-primary/10">
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

        <BundleShopStack planId={planId} onPlanId={setPlanId} cta={cta} />

        {planId === 'lifetime' && isPaidCheckoutAllowed() && isSurfaceEnabled('cryptoRails') && (
          <PhantomLifetimeCheckout className="w-full" />
        )}

        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-semibold text-muted-foreground marker:content-none hover:text-foreground">
            <span className="flex items-center justify-between gap-4">
              {t("bundleCompareTitle")}
              <span className="transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <div className="mt-4 overflow-x-auto border-2 border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-card">
                  <th className="p-3 text-start font-semibold">{t("bundleColPillar")}</th>
                  <th className="hidden p-3 text-start font-semibold sm:table-cell">
                    {t("bundleColPremium")}
                  </th>
                  <th className="p-3 text-end font-semibold">{t("bundleColMonthly")}</th>
                  <th className="p-3 text-center font-semibold">{t("bundleColIncluded")}</th>
                </tr>
              </thead>
              <tbody>
                {BUNDLE_PILLARS.map((pillar) => {
                  const keys = BUNDLE_PILLAR_I18N[pillar.id];
                  const fuelCount =
                    pillar.id === "fuel"
                      ? { count: CONTENT_FLOORS.recipesPremium }
                      : undefined;
                  return (
                    <tr key={pillar.id} className="border-b border-border last:border-0">
                      <td className="p-3">
                        <p className="font-semibold">{keys ? t(keys.nameKey) : pillar.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {keys ? t(keys.premiumKey, fuelCount) : pillar.premium}
                        </p>
                      </td>
                      <td className="hidden p-3 text-muted-foreground sm:table-cell">
                        {keys ? t(keys.premiumKey, fuelCount) : pillar.premium}
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
                    {t("bundleRowTotal")}
                  </td>
                  <td className="p-3 text-end tabular-nums">
                    {plan.perMonth ? (
                      <>
                        ${plan.perMonth}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {planId === "monthly"
                            ? t("bundleTabMonthly", { defaultValue: "Monthly" })
                            : planId === "12mo"
                              ? t("bundleTab12mo")
                              : t("bundleTabLifetime")}
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
          <p className="mt-3 text-xs text-muted-foreground">
            {t("bundleCompareFoot")}
            {vsSeparateSavings > 0
              ? ` ${t("bundleVsSeparate", { percent: vsSeparateSavings })}`
              : ""}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('bundleShopIllustrative', {
              defaultValue:
                'Standalone $ figures are an illustrative vs-stack — not for sale separately. Super Bundle is the only paid SKU.',
            })}
          </p>
        </details>

        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t("bundleFreeForeverTitle")}</strong>
          {' — '}
          {t("bundleFreeForeverBody")}
        </p>
      </div>
      <MarketingFooter />
    </div>
  );
}
