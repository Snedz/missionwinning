'use client';

/**
 * Coach door to the free AI personal trainer (.1115).
 * Same route as the open set on Train. No checkout link.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { SessionTrainerAsk } from '@/components/workout/SessionTrainerAsk';

export function CoachTrainerDoor({ exerciseName }: { exerciseName: string }) {
  const { t } = useTranslation();
  const name = exerciseName.trim() || 'Today';

  return (
    <div className="mw-house coach-trainer-door" data-testid="coach-trainer-door">
      <SessionTrainerAsk
        rulesLine={`Set 1 of 1. ${name}.`}
        facts={{
          exerciseName: name,
          setNumber: 1,
          setCount: 1,
          reps: 0,
          weight: 0,
          unitLabel: 'kg',
          rowType: 'weight',
          hardCount: 0,
        }}
      />
      <Link
        href="/active"
        className="house-btn house-btn-ghost min-h-[44px]"
        data-testid="coach-trainer-train"
      >
        {t('navTrain', { defaultValue: 'Train' })}
      </Link>
    </div>
  );
}
