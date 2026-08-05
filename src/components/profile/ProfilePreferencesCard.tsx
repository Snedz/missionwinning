'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileLanguageSwitcher } from '@/components/profile/ProfileLanguageSwitcher';
import {
  getAthleteSex,
  setAthleteSex,
  type BiologicalSex,
} from '@/lib/athleteSex';

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
  const [sex, setSexState] = useState<BiologicalSex | null>(() => getAthleteSex());

  const chooseSex = (s: BiologicalSex) => {
    setSexState(s);
    setAthleteSex(s);
  };

  return (
    <>
      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('units', { defaultValue: 'Units' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              className="min-h-[44px]"
              variant={units === 'metric' ? 'selected' : 'outline'}
              onClick={() => onSaveUnits('metric')}
            >
              {t('metric', { defaultValue: 'Metric (kg, cm)' })}
            </Button>
            <Button
              className="min-h-[44px]"
              variant={units === 'imperial' ? 'selected' : 'outline'}
              onClick={() => onSaveUnits('imperial')}
            >
              {t('imperial', { defaultValue: 'Imperial (lbs, in)' })}
            </Button>
          </div>
          <div className="text-xs mt-2 text-muted-foreground">
            Affects calculators and future logs. (Global default metric for accessibility.)
          </div>
        </CardContent>
      </Card>

      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('profileSexTitle', { defaultValue: 'Sex' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              className="min-h-[44px] flex-1"
              variant={sex === 'male' ? 'selected' : 'outline'}
              onClick={() => chooseSex('male')}
            >
              {t('calcSexMale', { defaultValue: 'Male' })}
            </Button>
            <Button
              className="min-h-[44px] flex-1"
              variant={sex === 'female' ? 'selected' : 'outline'}
              onClick={() => chooseSex('female')}
            >
              {t('calcSexFemale', { defaultValue: 'Female' })}
            </Button>
          </div>
          <p className="text-xs mt-2 text-muted-foreground">
            {t('profileSexHint', {
              defaultValue:
                'Used for fuel math, strength standards, and fitness-test bands. Male and female standards stay separate. We do not assume male.',
            })}
          </p>
        </CardContent>
      </Card>

      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('language', { defaultValue: 'Language' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileLanguageSwitcher />
          <div className="text-xs mt-2 text-muted-foreground">
            Switch the app language. Names shown in their native form so it&apos;s clear in any
            language.
          </div>
        </CardContent>
      </Card>

      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('trainingGoals', { defaultValue: 'Training Goals' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* The card title is not a label — axe is right, and a screen reader
              reading this field announced nothing at all. 2px rule while here;
              `border rounded` predates the rebrand. */}
          <label htmlFor="profile-goals" className="sr-only">
            {t('trainingGoals', { defaultValue: 'Training Goals' })}
          </label>
          <textarea
            id="profile-goals"
            className="w-full border-2 border-border bg-background p-2"
            value={goals}
            onChange={(e) => onGoalsChange(e.target.value)}
            rows={3}
          />
          <Button variant="outline" className="min-h-[44px]" onClick={onSaveGoals}>{t('saveGoals', { defaultValue: 'Save Goals' })}</Button>
          <div className="text-xs">Used for program recommendations (future personalization).</div>
        </CardContent>
      </Card>
    </>
  );
}
