'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UnlockButton } from '@/components/UnlockButton';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';

const PREMIUM_PREVIEW = [
  { title: 'Corrective Exercise Depth', icon: '🩹' },
  { title: 'Coaching Business Essentials', icon: '💼' },
  { title: 'Bodybuilding Periodization', icon: '💪' },
];

/** Learn premium upsell — free intro chapter + gated specialist courses teaser. */
export function LearnLockedPreview() {
  const { t } = useTranslation();
  const intro = BEYOND_THE_BASICS_CHAPTERS[0];

  return (
    <Card className="content-card border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          {t('learnPremiumTitle', { defaultValue: 'Premium Specialist Programs' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('learnPremiumDesc', {
            defaultValue:
              'Full PT+Nutrition, Bodybuilding, Corrective, Business, Coaching, Conditioning.',
          })}
        </p>
        {intro && (
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-primary">
              {t('learnFreeIntro', { defaultValue: 'Free — read now' })}
            </p>
            <p className="font-semibold">{intro.title}</p>
            <p className="text-sm text-muted-foreground">{intro.subtitle}</p>
            <Button variant="fitness" size="sm" asChild>
              <Link href={`/learn/guide/${intro.id}`}>
                {t('learnReadIntro', { defaultValue: 'Read intro chapter →' })}
              </Link>
            </Button>
          </div>
        )}
        <div className="relative rounded-lg border border-border/50 bg-black/20 p-3 space-y-2">
          <div className="pointer-events-none select-none opacity-60 blur-[1px] space-y-2">
            {PREMIUM_PREVIEW.map((ch) => (
              <div key={ch.title} className="flex items-center gap-2 text-sm border border-border/30 rounded-lg p-2">
                <span>{ch.icon}</span>
                <span>{ch.title}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {t('learnPreviewCourse', { defaultValue: 'Multi-chapter courses with progress tracking' })}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('learnLockedHint', {
            defaultValue:
              'Free: 6 guidebook chapters + 10 paths. Premium: 4 specialist courses, 16 sections — corrective, coaching, periodization, sports nutrition.',
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          <UnlockButton productId="super-bundle" planId="12mo" price="59" title="Super Bundle" isSubscription />

          <Button variant="outline" size="sm" asChild>
            <Link href="/bundle">{t('trackExploreBundle', { defaultValue: 'See Super Bundle' })}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
