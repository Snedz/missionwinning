'use client';
/**
 * Page: /calculators — 1RM, macros, plates
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { UnlockButton } from '@/components/UnlockButton';
import { OneRmCalculator } from '@/components/calculators/OneRmCalculator';
import { MacroCalculator, MacroCalculatorActions } from '@/components/calculators/MacroCalculator';
import { PlateCalculatorPanel } from '@/components/calculators/PlateCalculatorPanel';
import { isFreeBeta } from '@/lib/freeBeta';

export function CalculatorsPage() {
  const { t } = useTranslation();
  const [e1rm, setE1rm] = useState(0);
  const freeBeta = isFreeBeta();

  return (
    <PillarPageShell
      icon={Calculator}
      eyebrow={t('toolkitEyebrow', { defaultValue: 'Toolkit' })}
      title={t('calcTitle', { defaultValue: 'Calculators' })}
      subtitle={t('calcSubtitleBrief', {
        defaultValue: '1RM, macros, plates — free tools, no account required.',
      })}
      showLegalFooter
    >
      {/* Field manual: tabs + tool first; premium upsell folded. */}
      <Tabs defaultValue="1rm" className="w-full">
        <TabsList className="grid grid-cols-3 h-auto p-1 w-full sm:w-auto">
          <TabsTrigger value="1rm" className="min-h-[44px] py-2.5 text-xs sm:text-sm">
            {t('calcTab1rm', { defaultValue: '1RM' })}
          </TabsTrigger>
          <TabsTrigger value="macros" className="min-h-[44px] py-2.5 text-xs sm:text-sm">
            {t('calcTabMacros', { defaultValue: 'Macros' })}
          </TabsTrigger>
          <TabsTrigger value="plates" className="min-h-[44px] py-2.5 text-xs sm:text-sm">
            {t('calcTabPlates', { defaultValue: 'Plates' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="1rm" className="mt-4 space-y-4">
          <Card className="content-card">
            <OneRmCalculator onE1rmChange={setE1rm} />
          </Card>
          <MacroCalculatorActions e1rm={e1rm} />
        </TabsContent>

        <TabsContent value="macros" className="mt-4">
          <Card className="content-card">
            <MacroCalculator />
          </Card>
        </TabsContent>

        <TabsContent value="plates" className="mt-4">
          <Card className="content-card">
            <PlateCalculatorPanel />
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-center text-muted-foreground">
        {t('calcUnitsFoot', {
          defaultValue: 'Toggle kg/lbs and cm/in in Profile. Global default is metric.',
        })}
      </p>

      {!freeBeta && (
        <details className="group border-2 border-border bg-card">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
            {t('calcMorePremium', { defaultValue: 'Premium calculator depth' })}
          </summary>
          <div className="flex flex-col gap-4 border-t-2 border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-semibold">
                {t('calcPremiumTitle', { defaultValue: 'Premium calculators' })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('calcPremiumDesc', {
                  defaultValue:
                    'Super Bundle unlocks periodization blocks, contest prep macros, and client tools that sync to your log.',
                })}{' '}
                <Link href="/bundle" className="text-primary underline underline-offset-2">
                  {t('calcPremiumLink', { defaultValue: 'View bundle' })}
                </Link>
              </p>
            </div>
            <UnlockButton
              productId="super-bundle"
              planId="12mo"
              isSubscription
              label={t('calcPremiumBtn', { defaultValue: 'Unlock premium tools' })}
              className="shrink-0"
            />
          </div>
        </details>
      )}

      <SignInPrompt
        nextPath="/calculators"
        description={t('calcSignInFoot', {
          defaultValue: 'Sign in to sync calculator logs and nutrition targets across devices.',
        })}
      />
    </PillarPageShell>
  );
}
