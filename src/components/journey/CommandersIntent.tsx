'use client';

import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CommandersIntent() {
  const { t } = useTranslation();
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setGoal(
      localStorage.getItem('mw_primary_goal') ||
        localStorage.getItem('mw_goals') ||
        ''
    );
  }, []);

  if (!goal.trim()) return null;

  return (
    <div className="page-enter rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/30 to-card/80 px-4 py-3 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 mt-0.5">
        <Target className="h-4 w-4 text-emerald-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-medium">
          {t('commandersIntent', { defaultValue: "Today's focus" })}
        </p>
        <p className="text-sm font-medium leading-snug mt-0.5">{goal}</p>
      </div>
    </div>
  );
}
