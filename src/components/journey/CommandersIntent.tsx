'use client';

import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatStoredGoal } from '@/lib/journeyGoals';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw } from '@/lib/storage/safeStorage';

export function CommandersIntent() {
  const { t } = useTranslation();
  const [goalRaw, setGoalRaw] = useState('');

  // Read after mount, not during render: the server has no stored goal and a
  // mismatch here would be a hydration error on every page that shows this.
  useEffect(() => {
    setGoalRaw(readRaw(STORAGE_KEYS.primaryGoal) || readRaw(STORAGE_KEYS.goals) || '');
  }, []);

  const goal = formatStoredGoal(goalRaw, t);
  if (!goal.trim()) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-muted/15 px-4 py-3 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-border bg-background mt-0.5">
        <Target className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">
          {t('commandersIntent', { defaultValue: "Today's focus" })}
        </p>
        <p className="text-sm font-medium leading-snug mt-0.5 text-foreground">{goal}</p>
      </div>
    </div>
  );
}
