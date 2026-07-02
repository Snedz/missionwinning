"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnlockButton } from "@/components/UnlockButton";
import { FaqSection } from "@/components/marketing/FaqSection";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [planId, setPlanId] = useState<BundlePlanId>(DEFAULT_BUNDLE_PLAN);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [checkoutBanner, setCheckoutBanner] = useState<"success" | "cancel" | null>(null);

  const plan = BUNDLE_PLANS[planId];
  const stripeUrl = getStripeCheckoutUrl("super-bundle");
  const vsSeparateSavings = bundleSavingsPercent();

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success" || checkout === "cancel") {
      setCheckoutBanner(checkout);
    }
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const planTabLabel =
    planId === "3mo"
      ? t("bundleTab3mo")
      : planId === "12mo"
        ? t("bundleTab12mo")
        : t("bundleTabLifetime");

  const billingLineFor = (id: BundlePlanId, price: string) =>
    id === "lifetime"
      ? t("bundleBilledOnce", { price })
      : t("bundleBilledTotal", { price });

  const faqItems = useMemo(
    () => [
      { id: "1", question: t("bundleFaq1Q"), answer: t("bundleFaq1A") },
      { id: "2", question: t("bundleFaq2Q"), answer: t("bundleFaq2A") },
      { id: "3", question: t("bundleFaq3Q"), answer: t("bundleFaq3A") },
      { id: "4", question: t("bundleFaq4Q"), answer: t("bundleFaq4A") },
      { id: "5", question: t("bundleFaq5Q"), answer: t("bundleFaq5A") },
      { id: "6", question: t("bundleFaq6Q"), answer: t("bundleFaq6A") },
    ],
    [t]
  );

  const scrollToUnlock = () => {
    document.getElementById("bundle-offer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-8">
      {checkoutBanner && (
        <Card
          className={
            checkoutBanner === "success"
              ? "border-emerald-500/40 bg-emerald-950/20"
              : "border-border/60 bg-muted/30"
          }
        >
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <p className="text-sm">
              {checkoutBanner === "success"
                ? t("bundleCheckoutSuccess")
                : t("bundleCheckoutCancel")}
            </p>
            <Button variant="fitness" size="sm" className="tap-target shrink-0" onClick={() => router.push("/log")}>
              {t("bundleGoToApp")}
            </Button>
          </CardContent>
        </Card>
      )}

      <header className="text-center sm:text-start space-y-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Badge variant="secondary">{t("bundleBadge")}</Badge>
          <Badge className="bg-amber-500/90 hover:bg-amber-500/90 text-amber-950 border-0">
            {t("bundleUrgencyBadge")}
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("bundleHeadline")}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto sm:mx-0">{t("bundleSubhead")}</p>
        <Button variant="outline" size="sm" className="tap-target" asChild>
          <Link href="/welcome">{t("bundleStartFreeFirst", { defaultValue: "Start free first — no card required" })}</Link>
        </Button>
      </header>

      <Tabs
        value={planId}
        onValueChange={(v) => setPlanId(v as BundlePlanId)}
        className="w-full"
        id="bundle-offer"
      >
        <TabsList className="grid grid-cols-3 h-auto p-1 gap-1">
          <TabsTrigger value="3mo" className="tap-target min-h-[48px] py-3 text-xs sm:text-sm">
            {t("bundleTab3mo")}
          </TabsTrigger>
          <TabsTrigger value="12mo" className="tap-target min-h-[48px] py-3 text-xs sm:text-sm flex flex-col gap-0.5 sm:flex-row sm:gap-2">
            <span>{t("bundleTab12mo")}</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">
              {t("bundleBadgePopular")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="lifetime" className="tap-target min-h-[48px] py-3 text-xs sm:text-sm">
            {t("bundleTabLifetime")}
          </TabsTrigger>
        </TabsList>

        {(["3mo", "12mo", "lifetime"] as const).map((id) => {
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
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
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
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {t("bundleVsSeparate", { percent: vsSeparateSavings })}
                    </p>
                  )}

                  <div>
                    <p className="text-sm font-semibold mb-3">{t("bundleOneAppTitle")}</p>
                    <p className="text-xs text-muted-foreground mb-4">{t("bundleOneAppDesc")}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {BUNDLE_PILLARS.map((pillar) => {
                        const Icon = PILLAR_ICONS[pillar.id] ?? Sparkles;
                        const keys = BUNDLE_PILLAR_I18N[pillar.id];
                        return (
                          <Link
                            key={pillar.id}
                            href={pillar.route}
                            className="tap-target flex flex-col items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 p-3 min-h-[88px] hover:border-primary/40 hover:bg-primary/5 transition-colors text-center"
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

                  <UnlockButton
                    isSubscription={p.isSubscription}
                    productId="super-bundle"
                    price={p.price}
                    bundlePlanId={p.id}
                    stripeCheckoutUrl={stripeUrl}
                    label={t("bundleUnlockCta")}
                    className="w-full primary-action"
                  />
                  {!stripeUrl && (
                    <p className="text-xs text-muted-foreground text-center">
                      {t("bundleStripeHint")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <section>
        <h2 className="text-lg font-semibold mb-4">{t("bundleCompareTitle")}</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm min-w-[320px]">
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

      <FaqSection
        title={t("bundleFaqTitle")}
        subtitle={t("bundleFaqSubtitle")}
        items={faqItems}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("bundleFreeForeverTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{t("bundleFreeForeverBody")}</p>
          <Button variant="outline" className="tap-target" asChild>
            <Link href="/welcome">{t("bundleStartFreeFirst", { defaultValue: "Start free first — no card required" })}</Link>
          </Button>
        </CardContent>
      </Card>

      {showStickyCta && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border/60 bg-background/95 backdrop-blur p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          role="region"
          aria-label="Unlock bundle"
        >
          <Button variant="fitness" className="primary-action w-full max-w-lg mx-auto" onClick={scrollToUnlock}>
            {t("bundleUnlockCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
