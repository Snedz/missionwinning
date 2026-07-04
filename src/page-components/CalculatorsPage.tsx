'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { UnlockButton } from '@/components/UnlockButton';
import { OneRmCalculator } from '@/components/calculators/OneRmCalculator';
import { MacroCalculator, MacroCalculatorActions } from '@/components/calculators/MacroCalculator';
import { PlateCalculatorPanel } from '@/components/calculators/PlateCalculatorPanel';

export function CalculatorsPage() {
  const { t } = useTranslation();
  const [e1rm, setE1rm] = useState(0);

  return (
    <PillarPageShell
      icon={Calculator}
      title={t('calcTitle', { defaultValue: 'Calculators' })}
      subtitle={t('calcSubtitle', {
        defaultValue:
          'Free 1RM, macro, and plate tools. Super Bundle unlocks advanced periodization and client sync.',
      })}
      showLegalFooter
    >
      <Tabs defaultValue="1rm" className="w-full">
        <TabsList className="grid grid-cols-3 h-auto p-1 w-full sm:w-auto">
          <TabsTrigger value="1rm" className="py-2.5 text-xs sm:text-sm">
            {t('calcTab1rm', { defaultValue: '1RM' })}
          </TabsTrigger>
          <TabsTrigger value="macros" className="py-2.5 text-xs sm:text-sm">
            {t('calcTabMacros', { defaultValue: 'Macros' })}
          </TabsTrigger>
          <TabsTrigger value="plates" className="py-2.5 text-xs sm:text-sm">
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

      <Card className="content-card border-emerald-500/30 bg-emerald-950/10">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold text-emerald-400">
              {t('calcPremiumTitle', { defaultValue: 'Premium calculators' })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('calcPremiumDesc', {
                defaultValue:
                  'Super Bundle unlocks periodization blocks, contest prep macros, and client tools that sync to your log.',
              })}{' '}
              <Link href="/bundle" className="text-emerald-400 underline underline-offset-2">
                {t('calcPremiumLink', { defaultValue: 'View bundle' })}
              </Link>
            </p>
          </div>
          <UnlockButton
            label={t('calcPremiumBtn', { defaultValue: 'Unlock premium tools' })}
            className="shrink-0"
          />
        </CardContent>
      </Card>

      <SignInPrompt
        nextPath="/calculators"
        description={t('calcSignInFoot', {
          defaultValue: 'Sign in to sync calculator logs and nutrition targets across devices.',
        })}
      />
    </PillarPageShell>
  );
}
