'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WeekStrip } from '@/components/coach/WeekStrip';
import type { PlanSession } from '@/lib/coach/types';
import { prefersReducedMotion } from '@/lib/motion';

function demoSession(
  dayOffset: number,
  name: string,
  kind: PlanSession['kind'],
  status: PlanSession['status']
): PlanSession {
  return {
    id: `demo-${dayOffset}`,
    dayOffset,
    name,
    kind,
    status,
    focusGroups: ['Legs'],
    exercises: [],
    estMinutes: 32,
  };
}

const FULL_WEEK: PlanSession[] = [
  demoSession(0, 'Lower', 'strength', 'planned'),
  demoSession(2, 'Upper', 'strength', 'planned'),
  demoSession(4, 'Conditioning', 'conditioning', 'planned'),
];

const MISSED_MON: PlanSession[] = [
  demoSession(0, 'Lower', 'strength', 'missed'),
  demoSession(1, 'Upper', 'strength', 'planned'),
  demoSession(3, 'Conditioning', 'conditioning', 'planned'),
];

const ADAPTED: PlanSession[] = [
  demoSession(0, 'Lower', 'strength', 'missed'),
  demoSession(2, 'Upper', 'strength', 'planned'),
  demoSession(4, 'Conditioning', 'conditioning', 'planned'),
  demoSession(5, 'Recovery', 'recovery', 'planned'),
];

const FRAMES = [FULL_WEEK, MISSED_MON, ADAPTED];

export function CoachAdaptDemo() {
  const { t } = useTranslation();
  const [frame, setFrame] = useState(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 2800);
    return () => clearInterval(id);
  }, [reduced]);

  const sessions = FRAMES[reduced ? FRAMES.length - 1 : frame];
  const caption = [
    t('coachDemoFullWeek', { defaultValue: 'Your week — planned' }),
    t('coachDemoMissed', { defaultValue: 'Monday missed — plan adapts' }),
    t('coachDemoRespread', { defaultValue: 'Sessions re-spread automatically' }),
  ][reduced ? 2 : frame];

  return (
    <div className="content-card p-6 max-w-md mx-auto">
      <p className="eyebrow mb-2 text-center">
        {t('coachDemoTitle', { defaultValue: 'Mission Coach' })}
      </p>
      <WeekStrip weekStart="2026-01-05" sessions={sessions} todayOffset={1} />
      <p className="mt-4 text-center text-sm text-muted-foreground min-h-[2.5rem]">{caption}</p>
    </div>
  );
}
