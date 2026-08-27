'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { useWorkoutStore } from '@/store/workoutStore';

const REST = [60, 90, 120, 180] as const;

export function TrainSidecar() {
  const { t } = useTranslation();
  const units = useUnits();
  const workout = useWorkoutStore((s) => s.activeWorkout);
  const restOn = useWorkoutStore((s) => s.restTimerActive);
  const restLeft = useWorkoutStore((s) => s.restSecondsRemaining);
  const startRest = useWorkoutStore((s) => s.startRestTimer);
  const stopRest = useWorkoutStore((s) => s.stopRestTimer);
  const setNote = useWorkoutStore((s) => s.setSessionNote);

  if (!workout) {
    return (
      <aside className="house-sidecar is-open" aria-label={t('navTrain', { defaultValue: 'Train' })}>
        <h2 className="house-side-title">{t('navTrain', { defaultValue: 'Train' })}</h2>
        <p className="house-lede" style={{ marginTop: 0 }}>
          {t('activeEmptyExercises', { defaultValue: 'Add an exercise to begin logging sets.' })}
        </p>
      </aside>
    );
  }

  return (
    <aside className="house-sidecar is-open" data-testid="train-sidecar" aria-label={t('navTrain', { defaultValue: 'Train' })}>
      <h2 className="house-side-title">{t('navTrain', { defaultValue: 'Train' })}</h2>
      <p className="house-kicker">{workout.workoutName}</p>
      <p className="house-lede" style={{ marginTop: 0 }}>
        {weightUnitLabel(units)}
        {restOn
          ? ` · ${t('activeRestTitle', { defaultValue: 'Rest' })} ${restLeft}s`
          : ''}
      </p>
      <p className="house-kicker" style={{ marginTop: 22 }}>
        {t('activeRestTitle', { defaultValue: 'Rest' })}
      </p>
      <div className="house-list" style={{ marginTop: 8 }}>
        {REST.map((sec) => (
          <button
            key={sec}
            type="button"
            className="house-item"
            onClick={() => startRest(sec)}
          >
            <strong>{t('activeStartRest', { defaultValue: '{{seconds}}s Rest', seconds: String(sec) })}</strong>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="house-btn"
        style={{ marginTop: 12, width: '100%' }}
        onClick={() => stopRest()}
      >
        {t('activeRestSkip', { defaultValue: 'Skip' })}
      </button>
      <label className="house-kicker" style={{ display: 'block', marginTop: 22 }}>
        {t('sessionJotLabel', { defaultValue: 'Notes' })}
        <textarea
          className="house-card"
          style={{ width: '100%', marginTop: 8, minHeight: 88, resize: 'vertical' }}
          maxLength={500}
          value={workout.sessionNote ?? ''}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('sessionJotLabel', { defaultValue: 'Notes' })}
        />
      </label>
      <div style={{ marginTop: 20 }}>
        <Link href="/history" className="house-btn">
          {t('navHistory', { defaultValue: 'History' })}
        </Link>
      </div>
    </aside>
  );
}
