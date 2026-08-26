'use client';

/**
 * Log a session they already did (`.1000`).
 * Pick a date, type the sets they remember, Save.
 * Timing off by default — never invent a clock from now.
 * Not Resume. Not Edit. Not the Today Start.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { resolveExercise } from '@/lib/workout/customExercise';
import {
  appendBackfillExercise,
  appendBackfillSet,
  backfillPrLabels,
  emptyBackfillDraft,
  parseBackfillSetNumber,
  parseBackfillTime,
  patchBackfillSet,
  removeBackfillExercise,
  removeBackfillSet,
  toggleBackfillSetTag,
  type BackfillDraft,
} from '@/lib/workout/backfillSession';
import {
  SET_ROW_TAGS,
  setKindBadgeClass,
  setKindDefaultLabel,
  setKindLabelKey,
} from '@/lib/workout/setKind';
import {
  parseDurationSeconds,
  resolveSetRowType,
  type SetRowType,
} from '@/lib/workout/setRowType';
import { localDateKey } from '@/lib/time/localDate';
import { cn } from '@/lib/utils';
import type { CompletedWorkoutLog } from '@/types';

type Props = {
  history: readonly CompletedWorkoutLog[];
  unitLabel: string;
  /** `.1028` empty-day door prefills this local dateKey. Overflow stays blank. */
  initialDateKey?: string;
  onSaveRequest: (draft: BackfillDraft) => void;
  onCancel: () => void;
};

function typeHeaders(type: SetRowType, t: (key: string, opts: { defaultValue: string }) => string) {
  if (type === 'duration') {
    return [t('historyTableTime', { defaultValue: 'Time' })];
  }
  if (type === 'bodyweight') {
    return [
      t('historyTableVest', { defaultValue: '+kg' }),
      t('historyTableReps', { defaultValue: 'Reps' }),
    ];
  }
  if (type === 'assisted') {
    return [
      t('historyTableAssist', { defaultValue: 'Assist' }),
      t('historyTableReps', { defaultValue: 'Reps' }),
    ];
  }
  return [
    t('historyTableWeight', { defaultValue: 'Weight' }),
    t('historyTableReps', { defaultValue: 'Reps' }),
  ];
}

export function HistoryBackfill({
  history,
  unitLabel,
  initialDateKey,
  onSaveRequest,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const todayKey = localDateKey();
  const [draft, setDraft] = useState<BackfillDraft>(() => emptyBackfillDraft(initialDateKey));
  const [pickId, setPickId] = useState('');

  const prLabels = useMemo(
    () =>
      backfillPrLabels(draft, history, {
        heaviest: t('activeInSetPrHeaviest', { defaultValue: 'Heaviest' }),
        mostReps: t('activeInSetPrMostReps', { defaultValue: 'Most reps' }),
        bestLogged5: t('activeInSetPrBestLogged5', { defaultValue: 'Best logged 5' }),
      }),
    [draft, history, t]
  );

  return (
    <div className="space-y-4" data-testid="session-history-backfill">
      <p className="text-sm text-muted-foreground">
        {t('historyBackfillDesc', {
          defaultValue:
            'If you trained and never opened the app, log that session with the date it happened. Empty invents nothing.',
        })}
      </p>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="history-backfill-date">
          {t('historyBackfillDate', { defaultValue: 'Date' })}
        </label>
        <Input
          id="history-backfill-date"
          type="date"
          className="min-h-[44px]"
          max={todayKey}
          value={draft.dateKey}
          onChange={(e) => setDraft({ ...draft, dateKey: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="history-backfill-name">
          {t('historyBackfillName', { defaultValue: 'Name' })}
        </label>
        <Input
          id="history-backfill-name"
          className="min-h-[44px]"
          value={draft.workoutName}
          onChange={(e) => setDraft({ ...draft, workoutName: e.target.value })}
          placeholder={t('historyBackfillNamePlaceholder', { defaultValue: 'Workout' })}
        />
      </div>

      <label className="flex items-center gap-3 min-h-[44px] tap-target">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={draft.timing.enabled}
          onChange={(e) =>
            setDraft({
              ...draft,
              timing: { ...draft.timing, enabled: e.target.checked },
            })
          }
        />
        <span className="text-sm">
          {t('historyBackfillTiming', { defaultValue: 'Use start and end time' })}
        </span>
      </label>
      {draft.timing.enabled ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="history-backfill-start">
              {t('historyBackfillStart', { defaultValue: 'Start' })}
            </label>
            <Input
              id="history-backfill-start"
              type="time"
              className="min-h-[44px]"
              value={draft.timing.startTime}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  timing: { ...draft.timing, startTime: parseBackfillTime(e.target.value) },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="history-backfill-end">
              {t('historyBackfillEnd', { defaultValue: 'End' })}
            </label>
            <Input
              id="history-backfill-end"
              type="time"
              className="min-h-[44px]"
              value={draft.timing.endTime}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  timing: { ...draft.timing, endTime: parseBackfillTime(e.target.value) },
                })
              }
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('historyBackfillTimingOff', {
            defaultValue: 'Timing is off — duration is omitted. The date still stands.',
          })}
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-semibold">
          {t('historyBackfillAddExercise', { defaultValue: 'Add exercise' })}
        </p>
        <ExercisePicker
          value={pickId}
          onChange={(id) => {
            setDraft(appendBackfillExercise(draft, id));
            setPickId('');
          }}
        />
      </div>

      {draft.exercises.map((ex, exIdx) => {
        const exercise = resolveExercise(ex.exerciseId);
        const rowType = resolveSetRowType(exercise);
        const headers = typeHeaders(rowType, t);
        return (
          <div key={`${ex.exerciseId}-${exIdx}`} className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{exercise?.name ?? ex.exerciseId}</h4>
              <Button
                type="button"
                variant="ghost"
                className="min-h-[44px] tap-target ms-auto"
                onClick={() => setDraft(removeBackfillExercise(draft, exIdx))}
              >
                {t('historyBackfillRemoveExercise', { defaultValue: 'Remove' })}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('historyTableSet', { defaultValue: 'Set' })}</TableHead>
                  <TableHead>{t('historyTableType', { defaultValue: 'Type' })}</TableHead>
                  {headers.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                  <TableHead className="w-[72px]">
                    <span className="sr-only">
                      {t('historyRemoveSet', { defaultValue: 'Remove' })}
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ex.sets.map((set, setIdx) => {
                  const kind = set.kind ?? 'normal';
                  const pr = prLabels[exIdx]?.[setIdx];
                  return (
                    <TableRow key={setIdx} className={cn(kind !== 'normal' && 'bg-card')}>
                      <TableCell>{setIdx + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {SET_ROW_TAGS.map((tag) => (
                            <Button
                              key={tag}
                              type="button"
                              variant="ghost"
                              className="min-h-[44px] tap-target px-2"
                              onClick={() =>
                                setDraft(toggleBackfillSetTag(draft, exIdx, setIdx, tag))
                              }
                            >
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] uppercase',
                                  kind === tag ? setKindBadgeClass(tag) : 'text-muted-foreground'
                                )}
                              >
                                {t(setKindLabelKey(tag), {
                                  defaultValue: setKindDefaultLabel(tag),
                                })}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      {rowType === 'duration' ? (
                        <TableCell>
                          <Input
                            inputMode="decimal"
                            className="min-h-[44px] w-20"
                            value={set.durationSeconds ? String(set.durationSeconds) : ''}
                            onChange={(e) =>
                              setDraft(
                                patchBackfillSet(draft, exIdx, setIdx, {
                                  durationSeconds: parseDurationSeconds(e.target.value),
                                  reps: 0,
                                  weight: 0,
                                })
                              )
                            }
                            aria-label={t('historyTableTime', { defaultValue: 'Time' })}
                          />
                        </TableCell>
                      ) : (
                        <>
                          <TableCell>
                            <Input
                              inputMode="decimal"
                              className="min-h-[44px] w-20"
                              value={set.weight ? String(set.weight) : ''}
                              onChange={(e) =>
                                setDraft(
                                  patchBackfillSet(draft, exIdx, setIdx, {
                                    weight: parseBackfillSetNumber(e.target.value),
                                  })
                                )
                              }
                              aria-label={
                                rowType === 'assisted'
                                  ? t('historyTableAssist', { defaultValue: 'Assist' })
                                  : t('historyTableWeight', { defaultValue: 'Weight' })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              inputMode="numeric"
                              className="min-h-[44px] w-16"
                              value={set.reps ? String(set.reps) : ''}
                              onChange={(e) =>
                                setDraft(
                                  patchBackfillSet(draft, exIdx, setIdx, {
                                    reps: Math.round(parseBackfillSetNumber(e.target.value)),
                                  })
                                )
                              }
                              aria-label={t('historyTableReps', { defaultValue: 'Reps' })}
                            />
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          className="min-h-[44px] tap-target"
                          onClick={() => setDraft(removeBackfillSet(draft, exIdx, setIdx))}
                        >
                          {t('historyRemoveSet', { defaultValue: 'Remove' })}
                        </Button>
                        {pr ? (
                          <p className="text-[11px] text-muted-foreground">{pr}</p>
                        ) : null}
                        <span className="sr-only">{unitLabel}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] tap-target"
              onClick={() => setDraft(appendBackfillSet(draft, exIdx))}
            >
              {t('historyAddSet', { defaultValue: 'Add set' })}
            </Button>
          </div>
        );
      })}

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-[44px] tap-target"
          data-testid="session-history-backfill-save"
          onClick={() => onSaveRequest(draft)}
        >
          {t('historyBackfillSave', { defaultValue: 'Save' })}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full min-h-[44px] tap-target"
          onClick={onCancel}
        >
          {t('historyBackfillCancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </div>
  );
}
