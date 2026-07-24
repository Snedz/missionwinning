'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatStoredGoal } from '@/lib/journeyGoals';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { saveDaysPerWeek } from '@/lib/coach/schedulePrefs';

const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6] as const;

type ProfileJourneyCardProps = {
  isOnboarded: boolean;
  experience: string;
  equipment: string;
  primaryGoal: string;
  goals: string;
  daysPerWeek: number;
  onDaysPerWeekChange: (days: number) => void;
};

export function ProfileJourneyCard({
  isOnboarded,
  experience,
  equipment,
  primaryGoal,
  goals,
  daysPerWeek,
  onDaysPerWeekChange,
}: ProfileJourneyCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (!isOnboarded) {
    return (
      <Card className="border-border/50 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t('firstTimeSetup', { defaultValue: 'Get started' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            {t('profileSetupHint', {
              defaultValue:
                'Answer a few questions so sessions match your gear (~2 minutes).',
            })}
          </p>
          <Button className="w-full min-h-[44px]" onClick={() => router.push('/welcome')}>
            {t('welcomeBegin', { defaultValue: 'Continue' })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {t('editJourneyProfile', { defaultValue: 'Training profile' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground leading-relaxed">
          Experience: <span className="text-foreground capitalize">{experience || '—'}</span>
          {' · '}
          Equipment:{' '}
          <span className="text-foreground capitalize">{equipment?.replace('-', ' ') || '—'}</span>
        </p>
        <p className="text-muted-foreground truncate leading-relaxed">
          Goal: {formatStoredGoal(primaryGoal || goals, t)}
        </p>
        <div className="space-y-2">
          <span className="text-muted-foreground">
            {t('coachDaysPerWeek', { defaultValue: 'How many days a week?' })}
          </span>
          <div className="flex flex-wrap gap-2">
            {DAYS_PER_WEEK_OPTIONS.map((n) => (
              <Button
                key={n}
                type="button"
                size="sm"
                variant={daysPerWeek === n ? 'default' : 'outline'}
                className={daysPerWeek === n ? 'bg-primary hover:bg-primary/90' : ''}
                onClick={() => {
                  onDaysPerWeekChange(n);
                  saveDaysPerWeek(n);
                  scheduleJourneyPush();
                }}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full min-h-[44px]"
          onClick={() => router.push('/welcome?edit=1')}
        >
          {t('editJourneyProfile', { defaultValue: 'Edit journey profile' })}
        </Button>
      </CardContent>
    </Card>
  );
}
