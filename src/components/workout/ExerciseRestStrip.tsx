'use client';

/**
 * Per-exercise rest on the open Train lift — work vs warmup (`.995`).
 * Writes the lift's lanes. Does not write the global Default home.
 */

import { useTranslation } from 'react-i18next';
import { REST_PRESETS, formatRestClock, type RestLane } from '@/lib/workout/restTimer';
import { cn } from '@/lib/utils';

type Props = {
  workSeconds: number;
  warmupSeconds: number;
  onSetLane: (lane: RestLane, seconds: number) => void;
};

export function ExerciseRestStrip({ workSeconds, warmupSeconds, onSetLane }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="w-full space-y-1.5"
      data-testid="exercise-rest-strip"
    >
      <RestLaneRow
        lane="work"
        seconds={workSeconds}
        label={t('activeExerciseRestWork', { defaultValue: 'Work rest' })}
        testId="exercise-rest-work"
        onSetLane={onSetLane}
      />
      <RestLaneRow
        lane="warmup"
        seconds={warmupSeconds}
        label={t('activeExerciseRestWarmup', { defaultValue: 'Warmup rest' })}
        testId="exercise-rest-warmup"
        onSetLane={onSetLane}
      />
    </div>
  );
}

function RestLaneRow({
  lane,
  seconds,
  label,
  testId,
  onSetLane,
}: {
  lane: RestLane;
  seconds: number;
  label: string;
  testId: string;
  onSetLane: (lane: RestLane, seconds: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-wrap items-center gap-1"
      data-testid={testId}
      role="group"
      aria-label={label}
    >
      <span className="house-kicker me-1 min-w-[5.5rem]" style={{ margin: 0 }}>
        {label}
      </span>
      {REST_PRESETS.map((sec) => {
        const selected = seconds === sec;
        const clock = formatRestClock(sec);
        return (
          <button
            key={`${lane}-${sec}`}
            type="button"
            aria-pressed={selected}
            data-testid={`${testId}-${sec}`}
            aria-label={t('activeExerciseRestSetAria', {
              lane: label,
              clock,
              defaultValue: `Set ${label} to ${clock}`,
            })}
            onClick={() => onSetLane(lane, sec)}
            className={cn('house-state min-h-[44px] tap-target', selected && 'is-on')}
          >
            {clock}
          </button>
        );
      })}
    </div>
  );
}
