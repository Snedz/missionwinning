'use client';

/**
 * Cold /active as a compose canvas — not the paper empty session page.
 * Same start engines as ActiveEmptyState (saved / repeat / preview / empty).
 */

import { useTranslation } from 'react-i18next';
import { WorkoutVictorySheet } from '@/components/workout/WorkoutVictorySheet';
import type { Debrief } from '@/lib/coach/debrief';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';

type Props = {
  onStart: () => void;
  hydrated?: boolean;
  hasLastSession?: boolean;
  savedRoutineName?: string;
  previewName?: string;
  previewExerciseCount?: number;
  onPreviewStart?: () => void;
  victoryOpen: boolean;
  victorySummary: WorkoutVictorySummary | null;
  onVictoryOpenChange: (open: boolean) => void;
  onViewToday: () => void;
  onViewHistory: () => void;
  debrief?: Debrief | null;
  fragments?: string[];
  workoutId?: string;
};

export function TrainComposeEmpty({
  onStart,
  hydrated = true,
  hasLastSession = false,
  savedRoutineName,
  previewName,
  previewExerciseCount,
  onPreviewStart,
  victoryOpen,
  victorySummary,
  onVictoryOpenChange,
  debrief,
  fragments,
  workoutId,
  onViewToday,
  onViewHistory,
}: Props) {
  const { t } = useTranslation();
  const start = !savedRoutineName && !hasLastSession && onPreviewStart ? onPreviewStart : onStart;
  const title = savedRoutineName
    ? savedRoutineName
    : hasLastSession
      ? t('activeRepeatLastSession', { defaultValue: 'Repeat last session' })
      : previewName
        ? previewName
        : t('navTrain', { defaultValue: 'Train' });
  const lede = savedRoutineName
    ? t('activeSavedRoutineDesc', {
        name: savedRoutineName,
        defaultValue: 'Your saved routine — last loads stay on the set row.',
      })
    : hasLastSession
      ? t('activeRepeatLastSessionDesc', {
          defaultValue: 'Same exercises and last loads. Log when ready.',
        })
      : t('activeEmptyExercises', { defaultValue: 'Add an exercise to begin logging sets.' });

  return (
    <div className="house-compose-empty" aria-busy={hydrated ? undefined : true}>
      <p className="house-kicker">{t('navTrain', { defaultValue: 'Train' })}</p>
      <h1 className="house-title">{title}</h1>
      <p className="house-lede">{lede}</p>
      <div className="house-row" style={{ marginTop: 22 }}>
        <button
          type="button"
          className="house-btn house-btn-primary"
          onClick={start}
          data-testid={
            !savedRoutineName && !hasLastSession && previewName ? 'active-start-preview' : undefined
          }
        >
          {t('todayStartCta', { defaultValue: 'Start' })}
          {previewName && previewExerciseCount
            ? ` · ${previewExerciseCount}`
            : ''}
        </button>
      </div>
      <WorkoutVictorySheet
        open={victoryOpen}
        summary={victorySummary}
        debrief={debrief}
        fragments={fragments}
        workoutId={workoutId}
        onOpenChange={onVictoryOpenChange}
        onViewToday={onViewToday}
        onViewHistory={onViewHistory}
      />
    </div>
  );
}
