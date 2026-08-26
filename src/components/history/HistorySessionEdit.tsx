'use client';

/**
 * Edit the sets on a finished History log (`.997`).
 * Reorder lifts while editing (`.1034`). Replace a lift
 * while editing (`.1036`) — sets stay. Add a lift while
 * editing (`.1037`) — empty 0/0, then they type evidence.
 * Remove a lift while editing (`.1038`) when two or more
 * remain — last remaining is delete-session. Set kind
 * while editing (`.1039`) — warmup they logged as work,
 * or the reverse. Same W/D/F as live. Optional 1–10 RPE
 * while editing (`.1040`) — empty is valid (clear).
 * Optional 0–5 RIR while editing (`.1041`) — empty is
 * valid (clear). Never replaces RPE.
 * Optional L / R / Alt while editing (`.1042`) —
 * empty is valid (clear). Only on a unilateral
 * lift. Never a SetKind.
 * Optional e-p-c tempo while editing (`.1043`) —
 * empty is valid (clear). Never required.
 * Confirm before a destructive change. Empty invents nothing.
 * Not Resume. Not a public URL. Not the Today Start.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { SetRirSelect } from '@/components/workout/SetRirSelect';
import { SetRpe10Select } from '@/components/workout/SetRpe10Select';
import { SetSideSelect } from '@/components/workout/SetSideSelect';
import { SetTempoField } from '@/components/workout/SetTempoField';
import { resolveExercise } from '@/lib/workout/customExercise';
import {
  appendDraftSet,
  draftFromLog,
  parseFinishedSetNumber,
  patchDraftSet,
  removeDraftSet,
  type FinishedSessionDraft,
} from '@/lib/workout/editFinishedSession';
import { decideAppendFinishedExercise } from '@/lib/workout/appendFinishedExercise';
import {
  cycleFinishedSetKind,
  decidePatchFinishedSetKind,
} from '@/lib/workout/patchFinishedSetKind';
import { decidePatchFinishedSetRir } from '@/lib/workout/patchFinishedSetRir';
import { decidePatchFinishedSetRpe10 } from '@/lib/workout/patchFinishedSetRpe10';
import { decidePatchFinishedSetSide } from '@/lib/workout/patchFinishedSetSide';
import { decidePatchFinishedSetTempo } from '@/lib/workout/patchFinishedSetTempo';
import { parseOptionalTempo } from '@/lib/workout/tempo';
import {
  parseSetSide,
  shouldOfferSetSide,
  type SetSide,
} from '@/lib/workout/unilateral';
import { decideRemoveFinishedExercise } from '@/lib/workout/removeFinishedExercise';
import { decideReorderFinishedExercises } from '@/lib/workout/reorderFinishedExercises';
import { decideReplaceFinishedExercise } from '@/lib/workout/replaceFinishedExercise';
import { setKindBadgeClass, setKindDefaultLabel, setKindLabelKey } from '@/lib/workout/setKind';
import {
  formatSetRowLine,
  parseDurationSeconds,
  resolveSetRowType,
  type SetRowType,
} from '@/lib/workout/setRowType';
import { cn } from '@/lib/utils';
import type { CompletedWorkoutLog, SetTempo } from '@/types';

type Props = {
  log: CompletedWorkoutLog;
  unitLabel: string;
  editing: boolean;
  onEditingChange: (next: boolean) => void;
  onSaveRequest: (draft: FinishedSessionDraft) => void;
  confirmOpen: boolean;
  onConfirm: () => void;
  onConfirmCancel: () => void;
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

export function HistorySessionEdit({
  log,
  unitLabel,
  editing,
  onEditingChange,
  onSaveRequest,
  confirmOpen,
  onConfirm,
  onConfirmCancel,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<FinishedSessionDraft | null>(() => draftFromLog(log));

  useEffect(() => {
    setDraft(draftFromLog(log));
  }, [log]);

  const startEdit = () => {
    const next = draftFromLog(log);
    if (!next) return;
    setDraft(next);
    onEditingChange(true);
  };

  const cancelEdit = () => {
    setDraft(draftFromLog(log));
    onEditingChange(false);
  };

  const reorderLift = (fromIndex: number, toIndex: number) => {
    setDraft((current) => {
      if (!current) return current;
      const decision = decideReorderFinishedExercises({
        draft: current,
        fromIndex,
        toIndex,
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  const replaceLift = (exerciseIndex: number, nextExerciseId: string) => {
    setDraft((current) => {
      if (!current) return current;
      const decision = decideReplaceFinishedExercise({
        draft: current,
        exerciseIndex,
        nextExerciseId,
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  const appendLift = (nextExerciseId: string) => {
    setDraft((current) => {
      if (!current) return current;
      const decision = decideAppendFinishedExercise({
        draft: current,
        nextExerciseId,
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  const removeLift = (exerciseIndex: number) => {
    setDraft((current) => {
      if (!current) return current;
      const decision = decideRemoveFinishedExercise({
        draft: current,
        exerciseIndex,
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  const patchSetKind = (exerciseIndex: number, setIndex: number) => {
    setDraft((current) => {
      if (!current) return current;
      const set = current.exercises[exerciseIndex]?.sets[setIndex];
      const decision = decidePatchFinishedSetKind({
        draft: current,
        exerciseIndex,
        setIndex,
        kind: cycleFinishedSetKind(set?.kind),
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  const patchSetRpe10 = (
    exerciseIndex: number,
    setIndex: number,
    rpe10: number | undefined
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const decision = decidePatchFinishedSetRpe10({
        draft: current,
        exerciseIndex,
        setIndex,
        rpe10,
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  const patchSetRir = (
    exerciseIndex: number,
    setIndex: number,
    rir: number | undefined
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const decision = decidePatchFinishedSetRir({
        draft: current,
        exerciseIndex,
        setIndex,
        rir,
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  const patchSetSide = (
    exerciseIndex: number,
    setIndex: number,
    side: SetSide | undefined
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const decision = decidePatchFinishedSetSide({
        draft: current,
        exerciseIndex,
        setIndex,
        side,
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  const patchSetTempo = (
    exerciseIndex: number,
    setIndex: number,
    tempo: SetTempo | undefined
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const decision = decidePatchFinishedSetTempo({
        draft: current,
        exerciseIndex,
        setIndex,
        tempo,
      });
      return decision.kind === 'apply' ? decision.draft : current;
    });
  };

  if (!draft) return null;

  const canReorder = editing && draft.exercises.length >= 2;
  const canRemoveLift = editing && draft.exercises.length >= 2;

  return (
    <div className="space-y-4">
      {draft.exercises.map((ex, exIdx) => {
        const exercise = resolveExercise(ex.exerciseId);
        const rowType = resolveSetRowType(exercise);
        const headers = typeHeaders(rowType, t);
        const offerSetSide = shouldOfferSetSide({
          id: ex.exerciseId,
          name: exercise?.name ?? ex.exerciseId,
        });
        return (
          <div key={`${ex.exerciseId}-${exIdx}`} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold">{exercise?.name ?? ex.exerciseId}</h4>
              {exercise?.muscleGroups.map((mg) => (
                <Badge key={mg} variant="muscle" className="text-[10px]">
                  {mg}
                </Badge>
              ))}
              {canReorder ? (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] tap-target"
                    data-testid={`session-history-reorder-up-${exIdx}`}
                    disabled={exIdx === 0}
                    onClick={() => reorderLift(exIdx, exIdx - 1)}
                  >
                    {t('historyReorderUp', { defaultValue: 'Move up' })}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] tap-target"
                    data-testid={`session-history-reorder-down-${exIdx}`}
                    disabled={exIdx === draft.exercises.length - 1}
                    onClick={() => reorderLift(exIdx, exIdx + 1)}
                  >
                    {t('historyReorderDown', { defaultValue: 'Move down' })}
                  </Button>
                </div>
              ) : null}
              {canRemoveLift ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[44px] tap-target"
                  data-testid={`session-history-remove-lift-${exIdx}`}
                  onClick={() => removeLift(exIdx)}
                >
                  {t('historyRemoveLift', { defaultValue: 'Remove lift' })}
                </Button>
              ) : null}
            </div>
            {editing ? (
              <div data-testid={`session-history-replace-${exIdx}`}>
                <p className="text-sm font-semibold">
                  {t('historyReplaceLift', { defaultValue: 'Replace lift' })}
                </p>
                <ExercisePicker
                  value={ex.exerciseId}
                  onChange={(id) => replaceLift(exIdx, id)}
                />
              </div>
            ) : null}
            {ex.note?.trim() ? (
              <p className="text-sm italic text-muted-foreground border-l-2 border-border pl-3">
                {ex.note}
              </p>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('historyTableSet', { defaultValue: 'Set' })}</TableHead>
                  <TableHead>{t('historyTableType', { defaultValue: 'Type' })}</TableHead>
                  {headers.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                  {!editing ? (
                    <TableHead>{t('historyTableLogged', { defaultValue: 'Logged' })}</TableHead>
                  ) : (
                    <>
                      <TableHead>{t('activeRpe10', { defaultValue: 'RPE' })}</TableHead>
                      <TableHead>{t('activeRir', { defaultValue: 'RIR' })}</TableHead>
                      <TableHead>{t('activeTempo', { defaultValue: 'Tempo' })}</TableHead>
                      {offerSetSide ? (
                        <TableHead>
                          {t('activeSetSideAria', { defaultValue: 'Set side' })}
                        </TableHead>
                      ) : null}
                      <TableHead className="w-[72px]">
                        <span className="sr-only">
                          {t('historyRemoveSet', { defaultValue: 'Remove' })}
                        </span>
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ex.sets.map((set, setIdx) => {
                  const kind = set.kind ?? 'normal';
                  return (
                    <TableRow key={setIdx} className={cn(kind !== 'normal' && 'bg-card')}>
                      <TableCell>{setIdx + 1}</TableCell>
                      <TableCell>
                        {editing ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="min-h-[44px] tap-target"
                            data-testid={`session-history-set-kind-${exIdx}-${setIdx}`}
                            onClick={() => patchSetKind(exIdx, setIdx)}
                          >
                            {t(setKindLabelKey(kind), {
                              defaultValue: setKindDefaultLabel(kind),
                            })}
                          </Button>
                        ) : kind === 'normal' ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn('text-[10px] uppercase', setKindBadgeClass(kind))}
                          >
                            {t(setKindLabelKey(kind), {
                              defaultValue: setKindDefaultLabel(kind),
                            })}
                          </Badge>
                        )}
                      </TableCell>
                      {editing ? (
                        <>
                          {rowType === 'duration' ? (
                            <TableCell>
                              <Input
                                inputMode="decimal"
                                className="min-h-[44px] w-20"
                                value={set.durationSeconds ? String(set.durationSeconds) : ''}
                                onChange={(e) =>
                                  setDraft(
                                    patchDraftSet(draft, exIdx, setIdx, {
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
                                      patchDraftSet(draft, exIdx, setIdx, {
                                        weight: parseFinishedSetNumber(e.target.value),
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
                                      patchDraftSet(draft, exIdx, setIdx, {
                                        reps: Math.round(parseFinishedSetNumber(e.target.value)),
                                      })
                                    )
                                  }
                                  aria-label={t('historyTableReps', { defaultValue: 'Reps' })}
                                />
                              </TableCell>
                            </>
                          )}
                          <TableCell>
                            <SetRpe10Select
                              rpe10={set.rpe10}
                              onRateRpe10={(value) => patchSetRpe10(exIdx, setIdx, value)}
                              testId={`session-history-set-rpe-${exIdx}-${setIdx}`}
                              className="min-h-[44px]"
                            />
                          </TableCell>
                          <TableCell>
                            <SetRirSelect
                              rir={set.rir}
                              onRateRir={(value) => patchSetRir(exIdx, setIdx, value)}
                              testId={`session-history-set-rir-${exIdx}-${setIdx}`}
                              className="min-h-[44px]"
                            />
                          </TableCell>
                          <TableCell>
                            <SetTempoField
                              tempo={parseOptionalTempo(set.tempo)}
                              onRateTempo={(value) => patchSetTempo(exIdx, setIdx, value)}
                              testId={`session-history-set-tempo-${exIdx}-${setIdx}`}
                              className="min-h-[44px]"
                            />
                          </TableCell>
                          {offerSetSide ? (
                            <TableCell>
                              <SetSideSelect
                                side={parseSetSide(set.side)}
                                onSetSide={(value) => patchSetSide(exIdx, setIdx, value)}
                                testId={`session-history-set-side-${exIdx}-${setIdx}`}
                                className="min-h-[44px]"
                              />
                            </TableCell>
                          ) : null}
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              className="min-h-[44px] tap-target"
                              onClick={() => setDraft(removeDraftSet(draft, exIdx, setIdx))}
                            >
                              {t('historyRemoveSet', { defaultValue: 'Remove' })}
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell>
                          {formatSetRowLine({
                            type: rowType,
                            reps: set.reps,
                            weight: set.weight,
                            unitLabel,
                            durationSeconds: set.durationSeconds,
                          }) || t('historyWarmupExcluded', { defaultValue: '—' })}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {editing ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px] tap-target"
                onClick={() => setDraft(appendDraftSet(draft, exIdx))}
              >
                {t('historyAddSet', { defaultValue: 'Add set' })}
              </Button>
            ) : null}
          </div>
        );
      })}

      {editing ? (
        <div data-testid="session-history-add-lift">
          <p className="text-sm font-semibold">
            {t('historyAddLift', { defaultValue: 'Add a lift' })}
          </p>
          <ExercisePicker value="" onChange={(id) => appendLift(id)} />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {editing ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] tap-target"
              data-testid="session-history-edit-save"
              onClick={() => onSaveRequest(draft)}
            >
              {t('historyEditSave', { defaultValue: 'Save' })}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full min-h-[44px] tap-target"
              onClick={cancelEdit}
            >
              {t('historyEditCancel', { defaultValue: 'Cancel' })}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="session-history-edit"
            onClick={startEdit}
          >
            {t('historyEdit', { defaultValue: 'Edit' })}
          </Button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && onConfirmCancel()}>
        <DialogContent className="max-w-md border-2 border-border bg-card">
          <DialogHeader>
            <DialogTitle>
              {t('historyEditConfirmTitle', { defaultValue: 'Save these changes?' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyEditConfirmDesc', {
                defaultValue:
                  'This updates the session you logged. Coach and History will use the new numbers. The session is not deleted.',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] tap-target"
              data-testid="session-history-edit-confirm"
              onClick={onConfirm}
            >
              {t('historyEditConfirm', { defaultValue: 'Save changes' })}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full min-h-[44px] tap-target"
              onClick={onConfirmCancel}
            >
              {t('historyEditCancel', { defaultValue: 'Cancel' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
