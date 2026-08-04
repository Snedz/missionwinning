'use client';

/**
 * One exercise block in the active logger (header + set rows + actions).
 * Dense mobile: cues live in Form guide; actions in overflow.
 */

import { useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Plus, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { SetLogRow } from '@/components/workout/SetLogRow';
import { SetLogTable } from '@/components/workout/SetLogTable';
import { ActiveExerciseMoreMenu } from '@/components/workout/ActiveExerciseMoreMenu';
import { ActiveSetOptionsMenu } from '@/components/workout/ActiveSetOptionsMenu';
import { useIsCompact } from '@/hooks/useIsCompact';
import { getLastPerformanceForSet, exerciseHasCompletedSet, exerciseHasPlannedSet, holdsActiveExercise, isActiveSetCell, activeSetIdxForExercise, shouldShowSetOptionsFooter, firstWeightedLoad, shouldShowLoadPctChip, resolveExerciseNextTarget } from '@/lib/workout/activeWorkoutHelpers';
import { SET_KINDS, setKindDefaultLabel, setKindLabelKey } from '@/lib/workout/setKind';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { lastNotesFor } from '@/lib/journal/cueMemory';
import { resolveRestSeconds } from '@/lib/workout/restTimer';
import { supersetLabel } from '@/lib/workout/superset';
import { cn } from '@/lib/utils';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import type { UnitsPref } from '@/lib/units';
import type {
  ActiveExerciseLog,
  CompletedWorkoutLog,
  Exercise,
  LoggedSet,
  SetKind,
} from '@/types';

type TemplateSet = { reps: number; weight: number; kind?: SetKind; rpe?: LoggedSet['rpe'] };

type Props = {
  exLog: ActiveExerciseLog;
  /** The athlete's goal rep range, so freestyle suggestions match the plan's philosophy. */
  goalRange?: { min: number; max: number };
  exIdx: number;
  exercises: ActiveExerciseLog[];
  exercise: Exercise;
  workoutHistory: CompletedWorkoutLog[];
  units: UnitsPref;
  unitLabel: string;
  nextSet: { exIdx: number; setIdx: number } | null;
  nextSetRef: RefObject<HTMLDivElement | null>;
  swapOpen: boolean;
  noteOpen: boolean;
  swapCandidates: Exercise[];
  lastSessionSets: (
    history: CompletedWorkoutLog[],
    exerciseId: string
  ) => TemplateSet[] | null;
  onRepeatLast: () => void;
  onFormGuide: () => void;
  onToggleSuperset: () => void;
  onUnlinkSuperset: () => void;
  onToggleNote: () => void;
  onToggleSwap: () => void;
  onRemove: () => void;
  onSwapTo: (id: string) => void;
  onNoteChange: (note: string) => void;
  onRate: (setIdx: number, rpe: NonNullable<LoggedSet['rpe']>) => void;
  onApplyAllTargets: () => void;
  onAddSet: () => void;
  onRemoveSet: () => void;
  onStartRest: (seconds: number) => void;
  /* Desktop only — the table logs in place, so it needs the same input state
     the docked console gets. Compact ignores all three. */
  setInput: { reps: number; weight: number };
  onSetInputChange: (field: 'reps' | 'weight', value: number) => void;
  onLogSet: (setIdx: number) => void;
  /** Kind of the set currently being entered, and how to change it. */
  activeSetKind: SetKind;
  onSetKindChange: (kind: SetKind) => void;
};

export function ActiveExerciseCard({
  exLog,
  goalRange,
  exIdx,
  exercises,
  exercise,
  workoutHistory,
  units,
  unitLabel,
  nextSet,
  nextSetRef,
  swapOpen,
  noteOpen,
  swapCandidates,
  lastSessionSets,
  onRepeatLast,
  onFormGuide,
  onToggleSuperset,
  onUnlinkSuperset,
  onToggleNote,
  onToggleSwap,
  onRemove,
  onSwapTo,
  onNoteChange,
  onRate,
  onApplyAllTargets,
  onAddSet,
  onRemoveSet,
  onStartRest,
  setInput,
  onSetInputChange,
  onLogSet,
  activeSetKind,
  onSetKindChange,
}: Props) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const isCompact = useIsCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);
  const hasCompleted = exerciseHasCompletedSet(exLog.sets);
  const hasPlanned = exerciseHasPlannedSet(exLog.sets);
  const restSec = resolveRestSeconds(exercise.name);
  const ssLabel = supersetLabel(exercises, exIdx);
  const hasNext = exIdx < exercises.length - 1;
  const holdsActiveSet = holdsActiveExercise(nextSet, exIdx);
  const lastSets = lastSessionSets(workoutHistory, exLog.exerciseId);
  const hasFormGuide = !!getFormGuideOrCues(exercise.id, { exercise });
  // The cue the athlete wrote last time this lift came up — what a paper
  // logbook gets flipped back for. Verbatim from history; absent is silence.
  const lastNote = lastNotesFor(exLog.exerciseId, workoutHistory)[0] ?? null;

  /**
   * The "Next: N × W" line — one definition in `resolveExerciseNextTarget`
   * so prescribed sessions never disagree with the coach chip.
   */
  const nextTarget = resolveExerciseNextTarget({
    sets: exLog.sets,
    prescribed: exLog.prescribed,
    lastSets,
    units,
    goalRange,
  });

  return (
    <Card
      className={cn(
        'content-card',
        // Superset members are tied together by a red left edge, per the
        // handoff — it was a blue --status-info border, which was the last
        // non-red hue in the logger.
        ssLabel && 'border-s-[3px] border-s-[hsl(var(--accent-poster))]'
      )}
    >
      <CardHeader className="p-3 pb-2 space-y-2">
        <div className="flex items-start gap-2">
          <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <span className="leading-tight font-extrabold">{exercise.name}</span>
            {ssLabel && (
              <Badge variant="outline" className="text-[10px]">
                {ssLabel}
              </Badge>
            )}
            {shouldShowLoadPctChip(exLog.loadPct, exLog.sets) && (
                <Badge variant="outline" className="text-[10px] tabular-nums">
                  {t('activeLoadPctChip', {
                    pct: exLog.loadPct,
                    weight: firstWeightedLoad(exLog.sets),
                    unit: unitLabel,
                    defaultValue: '{{pct}}% · {{weight}} {{unit}}',
                  })}
                </Badge>
              )}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-0.5">
            {hasFormGuide && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 tap-target text-primary"
                aria-label={t('activeFormGuide', { defaultValue: 'Form guide' })}
                onClick={onFormGuide}
              >
                <Info className="h-5 w-5" />
              </Button>
            )}
            <ActiveExerciseMoreMenu
              open={menuOpen}
              onOpenChange={setMenuOpen}
              exerciseId={exercise.id}
              hasNextExercise={hasNext}
              supersetted={!!exLog.supersetGroup}
              hasCompletedSet={hasCompleted}
              onToggleSuperset={onToggleSuperset}
              onUnlinkSuperset={onUnlinkSuperset}
              onToggleNote={onToggleNote}
              onToggleSwap={onToggleSwap}
              onRemove={onRemove}
            />
          </div>
        </div>

        {nextTarget && (
          <p className="text-[11px] tabular-nums text-muted-foreground">
            {t('activeNextTargetLine', {
              reps: nextTarget.reps,
              weight: nextTarget.weight,
              unit: unitLabel,
              defaultValue: 'Next: {{reps}} × {{weight}} {{unit}}',
            })}
          </p>
        )}

        {hasCompleted && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px] w-fit"
            onClick={onRepeatLast}
          >
            {t('activeRepeatLast', { defaultValue: 'Repeat last set' })}
          </Button>
        )}

        {/*
          Swap used to expand an inline max-h-48 list inside the scrolling
          logger — same defect AddExerciseSheet closed: list competes for
          height with the session it mutates. Sheet gives the catalog room;
          pick closes and swaps (one tap, no second confirm — mid-set speed).
        */}
        {!hasCompleted && (
          <AdaptiveOverlay
            open={swapOpen}
            onClose={onToggleSwap}
            size="sm"
            eyebrow={t('activeSwapEyebrow', { defaultValue: 'This exercise' })}
            title={t('activeSwapTitle', {
              defaultValue: 'Swap exercise',
            })}
            bodyClassName="p-4"
          >
            <ExercisePicker
              value=""
              exercises={swapCandidates}
              listClassName="max-h-[52vh]"
              placeholder={t('activeSwapPlaceholder', {
                defaultValue: 'Swap to… (same muscles first)',
              })}
              onChange={onSwapTo}
            />
          </AdaptiveOverlay>
        )}
        {lastNote && (
          <p className="text-[11px] text-muted-foreground">
            {t('activeLastNoteLine', {
              date: fmt.longDate(lastNote.date),
              defaultValue: `Last note (${fmt.longDate(lastNote.date)}):`,
            })}{' '}
            <span className="italic text-foreground">&ldquo;{lastNote.text}&rdquo;</span>
          </p>
        )}
        {(noteOpen || exLog.note) && (
          <input
            type="text"
            value={exLog.note ?? ''}
            maxLength={200}
            placeholder={t('activeNotePlaceholder', {
              defaultValue: 'Note — "machine 3, seat 4", "left knee tight"…',
            })}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full border-2 border-border bg-background px-3 py-2.5 min-h-[44px] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
          />
        )}
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-0">
        {isCompact ? (
          exLog.sets.map((set, setIdx) => {
            const isNext = isActiveSetCell(nextSet, exIdx, setIdx);
            return (
              <div key={set.id} ref={isNext ? nextSetRef : undefined}>
                <SetLogRow
                  setNumber={setIdx + 1}
                  set={set}
                  isNext={isNext}
                  weightLabel={unitLabel}
                  onRate={(rpe) => onRate(setIdx, rpe)}
                />
              </div>
            );
          })
        ) : (
          /* Desktop logs in the row, so the ref goes on the table — the
             scroll-into-view target is the exercise, not one set. */
          <div ref={holdsActiveExercise(nextSet, exIdx) ? nextSetRef : undefined}>
            <SetLogTable
              sets={exLog.sets}
              activeSetIdx={activeSetIdxForExercise(nextSet, exIdx)}
              weightLabel={unitLabel}
              prevLabels={exLog.sets.map((_, setIdx) => {
                const last = getLastPerformanceForSet(
                  workoutHistory,
                  exLog.exerciseId,
                  setIdx
                );
                return last ? `${last.reps} × ${last.weight}` : null;
              })}
              input={setInput}
              onInputChange={onSetInputChange}
              onLog={() => nextSet && onLogSet(nextSet.setIdx)}
              onRate={onRate}
            />
          </div>
        )}
        <div className="flex flex-nowrap items-center gap-2 pt-1">
          <Button variant="outline" size="sm" className="min-h-[44px]" onClick={onAddSet}>
            <Plus className="h-3 w-3 me-1" /> {t('activeAddSet', { defaultValue: 'Add Set' })}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label={t('activeStartRest', { seconds: restSec, defaultValue: `${restSec}s Rest` })}
            onClick={() => onStartRest(restSec)}
          >
            <Timer className="h-4 w-4" />
          </Button>
          {/*
            Set kind on desktop. It lives in `LogConsole` on compact, and the
            console does not render at md+ — so without this, a desktop user
            cannot mark a warm-up or a drop set at all. The mock renders kinds
            as tags in the row and puts controls in the overflow, which is what
            this is; it is not an extra feature.
          */}
          {!isCompact && holdsActiveSet && (
            <div className="flex flex-wrap items-center gap-1">
              {SET_KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={activeSetKind === k}
                  onClick={() => onSetKindChange(k)}
                  className={cn(
                    'min-h-[32px] border-2 px-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors',
                    activeSetKind === k
                      ? 'border-[hsl(var(--accent-poster))] bg-accent-100 text-foreground'
                      : 'border-border text-muted-foreground hover:bg-accent-100'
                  )}
                >
                  {t(setKindLabelKey(k), {
                    defaultValue: k === 'normal' ? 'Work' : setKindDefaultLabel(k),
                  })}
                </button>
              ))}
            </div>
          )}
          {shouldShowSetOptionsFooter({
            hasLastSets: !!lastSets,
            hasPlanned,
            plannedSetCount: exLog.sets.length,
          }) && (
            <ActiveSetOptionsMenu
              open={footerOpen}
              onOpenChange={setFooterOpen}
              hasLastSets={!!lastSets}
              hasPlanned={hasPlanned}
              plannedSetCount={exLog.sets.length}
              onApplyAllTargets={onApplyAllTargets}
              onRemoveSet={onRemoveSet}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
