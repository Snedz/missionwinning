"use client";

import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnlockButton } from "@/components/UnlockButton";
import {
  SUPER_BUNDLE_PRICE,
  BUNDLE_PILLARS,
  getStripeCheckoutUrl,
} from "@/lib/payments";
import {
  PILLAR_STANDALONE_PRICES,
  bundleSavingsPercent,
} from "@/lib/bundleConfig";

export function BundlePage() {
  const stripeUrl = getStripeCheckoutUrl("super-bundle");
  const savings = bundleSavingsPercent();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Badge variant="secondary" className="mb-3">
          Super Bundle
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          Seven tools. One price.
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Mission Winning replaces a stack of fitness apps with one PWA — Train,
          Fuel, Move, Mind, Track, Learn, and your unified Win Score on Today.
        </p>
      </div>

      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Super Bundle
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                All six pillars + premium content
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">${SUPER_BUNDLE_PRICE}</p>
              <p className="text-sm text-muted-foreground">/month</p>
              {savings > 0 && (
                <Badge variant="secondary" className="mt-2">
                  Save {savings}% vs buying separately
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid sm:grid-cols-2 gap-2">
            {BUNDLE_PILLARS.map((p) => (
              <li key={p.id} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>{p.name}</strong> — {p.free}
                </span>
              </li>
            ))}
          </ul>
          <UnlockButton
            isSubscription
            productId="super-bundle"
            price={SUPER_BUNDLE_PRICE}
            stripeCheckoutUrl={stripeUrl}
            label="Unlock Super Bundle"
          />
          {!stripeUrl && (
            <p className="text-xs text-muted-foreground">
              Stripe checkout activates when{" "}
              <code className="text-[10px]">NEXT_PUBLIC_STRIPE_LINK_BUNDLE</code>{" "}
              is set in production.
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Compare standalone vs bundle</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Pillar</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">
                  Premium tier
                </th>
                <th className="text-right p-3 font-medium">Monthly</th>
                <th className="text-center p-3 font-medium">In bundle</th>
              </tr>
            </thead>
            <tbody>
              {BUNDLE_PILLARS.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {p.premium}
                    </p>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">
                    {p.premium}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    ${PILLAR_STANDALONE_PRICES[p.id] ?? "—"}
                  </td>
                  <td className="p-3 text-center">
                    <Check className="h-4 w-4 text-primary inline" />
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-medium">
                <td className="p-3" colSpan={2}>
                  Super Bundle (all pillars)
                </td>
                <td className="p-3 text-right tabular-nums">${SUPER_BUNDLE_PRICE}</td>
                <td className="p-3 text-center">
                  <Check className="h-4 w-4 text-primary inline" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Standalone prices are illustrative — the bundle costs less than
          subscribing to equivalent apps separately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Free forever</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Every pillar includes a free tier: workouts, recipes, mobility flows,
            breathing, activity logging, and learn paths. Premium unlocks advanced
            programs, full recipe library, and cloud sync priority.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
