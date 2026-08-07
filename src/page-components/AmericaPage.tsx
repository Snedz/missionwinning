'use client';
/**
 * Page: /america — optional national fitness track
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { Flag, Heart, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CouncilLeadershipBlock } from '@/components/america/CouncilLeadershipBlock';
import { isAmericaTrackEnabled, showMahaCopy, getCouncilStatus } from '@/lib/americaConfig';
import {
  isYouthModeEnabled,
  setYouthModeEnabled,
} from '@/lib/presidentialFitnessStorage';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { useEffect, useState } from 'react';
import { SchoolClassPanel } from '@/components/fitness-test/SchoolClassPanel';

export function AmericaPage() {
  const { t } = useTranslation();
  const [youth, setYouth] = useState(false);

  useEffect(() => {
    setYouth(isYouthModeEnabled());
  }, []);

  if (!isAmericaTrackEnabled()) {
    return (
      <InfoPageShell
        icon={Flag}
        title={t('americaHeroTitle', { defaultValue: 'Strength for the next generation' })}
        variant="sections"
      >
        <p className="text-center text-muted-foreground py-12">
          {t('americaDisabled', { defaultValue: 'National fitness track is not enabled in this build.' })}
        </p>
      </InfoPageShell>
    );
  }

  const toggleYouth = () => {
    const next = !youth;
    setYouthModeEnabled(next);
    setYouth(next);
  };

  const councilStatus = getCouncilStatus();
  const heroBody = showMahaCopy()
    ? t('americaHeroMaha', {
        defaultValue:
          "Mission Winning is bringing back the spirit of the Presidential Fitness Test — inspiring kids to get moving and restoring a culture of strength, health, and fitness. Let's Make America Healthy Again!",
      })
    : councilStatus === 'member'
      ? t('americaHeroCouncilMember', {
          defaultValue:
            'Mission Winning supports national fitness priorities with free Presidential Fitness Test tools for families, schools, and communities — built in service of a stronger, healthier America.',
        })
      : councilStatus === 'pending'
        ? t('americaHeroCouncilPending', {
            defaultValue:
              'Mission Winning is advancing national fitness tools in coordination with leadership on sports and youth health — starting with free Presidential Fitness Test scoring for every community.',
          })
        : t('americaHeroDefault', {
            defaultValue:
              'Mission Winning is reviving the Presidential Fitness Test tradition — free digital scoring for families, schools, and anyone ready to move with purpose.',
          });

  return (
    <InfoPageShell
      icon={Flag}
      iconClassName="text-muted-foreground"
      title={t('americaHeroTitle', { defaultValue: 'Strength for the next generation' })}
      subtitle={heroBody}
      variant="sections"
      showLegalFooter
    >
        <CouncilLeadershipBlock />
        <SchoolClassPanel />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="content-card">
            <CardContent className="pt-6 text-center space-y-2">
              <Users className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="font-semibold text-sm">
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
              <Flag className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="font-semibold text-sm">
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
              <Heart className="h-8 w-8 mx-auto text-primary" />
              <p className="font-semibold text-sm">
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
              <p className="font-semibold">{t('americaYouthMode', { defaultValue: 'Youth mode' })}</p>
              <p className="text-sm text-muted-foreground">
                {t('americaYouthModeDesc', {
                  defaultValue: 'Simplified focus for athletes under 18 (local preference).',
                })}
              </p>
            </div>
            <Button variant={youth ? 'selected' : 'outline'} className="min-h-[44px] tap-target" onClick={toggleYouth}>
              {youth
                ? t('americaYouthOn', { defaultValue: 'Youth mode on' })
                : t('americaYouthOff', { defaultValue: 'Enable youth mode' })}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="min-h-[52px] tap-target bg-[hsl(var(--status-info))] hover:bg-card">
            <Link href="/fitness-test">{t('americaCtaTest', { defaultValue: 'Take the fitness test' })}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-[52px] tap-target">
            <Link href="/welcome">{t('americaCtaWelcome', { defaultValue: 'Start I-Day journey' })}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="min-h-[52px] tap-target">
            <Link href="/log">{t('americaCtaToday', { defaultValue: 'Go to Today' })}</Link>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {t('americaGlobalNote', {
            defaultValue:
              'Mission Winning remains a global health app — this U.S. track is optional and does not replace worldwide free access.',
          })}
        </p>
    </InfoPageShell>
  );
}
