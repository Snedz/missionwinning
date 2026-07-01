'use client';

import Link from 'next/link';
import { Flag, Heart, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CouncilLeadershipBlock } from '@/components/america/CouncilLeadershipBlock';
import { isAmericaTrackEnabled, showMahaCopy } from '@/lib/americaConfig';
import {
  isYouthModeEnabled,
  setYouthModeEnabled,
} from '@/lib/presidentialFitnessStorage';
import { useEffect, useState } from 'react';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { SchoolClassPanel } from '@/components/fitness-test/SchoolClassPanel';

export function AmericaPage() {
  const { t } = useTranslation();
  const [youth, setYouth] = useState(false);

  useEffect(() => {
    setYouth(isYouthModeEnabled());
  }, []);

  if (!isAmericaTrackEnabled()) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center text-muted-foreground">
        {t('americaDisabled', { defaultValue: 'National fitness track is not enabled in this build.' })}
      </div>
    );
  }

  const toggleYouth = () => {
    const next = !youth;
    setYouthModeEnabled(next);
    setYouth(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 max-w-3xl mx-auto px-4 py-10 space-y-8 page-enter">
        <div className="text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/30">
            <Flag className="h-7 w-7 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('americaHeroTitle', { defaultValue: 'Strength for the next generation' })}
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {showMahaCopy()
              ? t('americaHeroMaha', {
                  defaultValue:
                    "Mission Winning is bringing back the spirit of the Presidential Fitness Test — inspiring kids to get moving and restoring a culture of strength, health, and fitness. Let's Make America Healthy Again!",
                })
              : t('americaHeroDefault', {
                  defaultValue:
                    'Mission Winning is reviving the Presidential Fitness Test tradition — free digital scoring for families, schools, and anyone ready to move with purpose.',
                })}
          </p>
        </div>

        <CouncilLeadershipBlock />

        <SchoolClassPanel />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="content-card">
            <CardContent className="pt-6 text-center space-y-2">
              <Users className="h-8 w-8 mx-auto text-blue-400" />
              <p className="font-medium text-sm">
                {t('americaKids', { defaultValue: 'Kids & schools' })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('americaKidsDesc', {
                  defaultValue: 'Age-based scoring, mini tests, and daily 10-minute missions.',
                })}
              </p>
            </CardContent>
          </Card>
          <Card className="content-card">
            <CardContent className="pt-6 text-center space-y-2">
              <Flag className="h-8 w-8 mx-auto text-blue-400" />
              <p className="font-medium text-sm">
                {t('americaPft', { defaultValue: 'Presidential Fitness Test' })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('americaPftDesc', {
                  defaultValue: 'Curl-ups, push-ups, sit-and-reach, mile, pull-ups — log and earn badges.',
                })}
              </p>
            </CardContent>
          </Card>
          <Card className="content-card">
            <CardContent className="pt-6 text-center space-y-2">
              <Heart className="h-8 w-8 mx-auto text-emerald-400" />
              <p className="font-medium text-sm">
                {t('americaFree', { defaultValue: 'Free forever' })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('americaFreeDesc', {
                  defaultValue: 'Core test prep stays in the free tier — global mission unchanged.',
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="content-card border-dashed">
          <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-medium">{t('americaYouthMode', { defaultValue: 'Youth mode' })}</p>
              <p className="text-sm text-muted-foreground">
                {t('americaYouthModeDesc', {
                  defaultValue: 'Simplified focus for athletes under 18 (local preference).',
                })}
              </p>
            </div>
            <Button variant={youth ? 'default' : 'outline'} onClick={toggleYouth}>
              {youth
                ? t('americaYouthOn', { defaultValue: 'Youth mode on' })
                : t('americaYouthOff', { defaultValue: 'Enable youth mode' })}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-blue-700 hover:bg-blue-600">
            <Link href="/fitness-test">{t('americaCtaTest', { defaultValue: 'Take the fitness test' })}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/welcome">{t('americaCtaWelcome', { defaultValue: 'Start I-Day journey' })}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/log">{t('americaCtaToday', { defaultValue: 'Go to Today' })}</Link>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {t('americaGlobalNote', {
            defaultValue:
              'Mission Winning remains a global health app — this U.S. track is optional and does not replace worldwide free access.',
          })}
        </p>
      </div>
      <AppLegalFooter />
    </div>
  );
}
