'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileLanguageSwitcher } from '@/components/profile/ProfileLanguageSwitcher';

type ProfilePreferencesCardProps = {
  units: 'metric' | 'imperial';
  onSaveUnits: (units: 'metric' | 'imperial') => void;
  goals: string;
  onGoalsChange: (goals: string) => void;
  onSaveGoals: () => void;
};

export function ProfilePreferencesCard({
  units,
  onSaveUnits,
  goals,
  onGoalsChange,
  onSaveGoals,
}: ProfilePreferencesCardProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="house-card space-y-3" data-testid="account-units-card">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          {t('units', { defaultValue: 'Units' })}
        </h3>
        <div className="flex gap-2">
          <Button
            className="min-h-[44px] tap-target"
            variant={units === 'metric' ? 'selected' : 'outline'}
            onClick={() => onSaveUnits('metric')}
          >
            {t('metric', { defaultValue: 'Metric (kg, cm)' })}
          </Button>
          <Button
            className="min-h-[44px] tap-target"
            variant={units === 'imperial' ? 'selected' : 'outline'}
            onClick={() => onSaveUnits('imperial')}
          >
            {t('imperial', { defaultValue: 'Imperial (lbs, in)' })}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {t('unitsAffectsHint', {
            defaultValue: 'Affects calculators and new logs. Default is metric.',
          })}
        </div>
      </div>

      <div className="house-card space-y-3" data-testid="account-language-card">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          {t('language', { defaultValue: 'Language' })}
        </h3>
        <ProfileLanguageSwitcher />
        <div className="text-xs text-muted-foreground">
          {t('languageHint', {
            defaultValue: 'Switch the app language. Names stay in native form.',
          })}
        </div>
      </div>

      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('trainingGoals', { defaultValue: 'Training goals' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* The card title is not a label — axe is right, and a screen reader
              reading this field announced nothing at all. 2px rule while here;
              `border rounded` predates the rebrand. */}
          <label htmlFor="profile-goals" className="sr-only">
            {t('trainingGoals', { defaultValue: 'Training goals' })}
          </label>
          <textarea
            id="profile-goals"
            className="w-full min-h-[88px] border-2 border-border bg-background p-2"
            value={goals}
            onChange={(e) => onGoalsChange(e.target.value)}
            rows={3}
          />
          <Button variant="outline" className="min-h-[44px] tap-target" onClick={onSaveGoals}>
            {t('saveGoals', { defaultValue: 'Save goals' })}
          </Button>
          <div className="text-xs text-muted-foreground">
            {t('trainingGoalsHint', {
              defaultValue: 'Used for program recommendations.',
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
