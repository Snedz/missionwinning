'use client';

/**
 * Overlay sheet cluster for ActiveWorkoutPage — check-in, form, add, plates, victory (.450).
 */

import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { AddExerciseSheet } from '@/components/workout/AddExerciseSheet';
import { PlateCalculatorSheet } from '@/components/workout/PlateCalculatorSheet';
import { WorkoutVictorySheet } from '@/components/workout/WorkoutVictorySheet';
import { SessionCheckInSheet } from '@/components/workout/SessionCheckInSheet';
import { HardSessionWarningSheet } from '@/components/workout/HardSessionWarningSheet';
import { getExerciseById } from '@/data/exercises';
import { resolveExercise } from '@/lib/workout/customExercise';
import type { Debrief } from '@/lib/coach/debrief';
import type { FormGuide } from '@/types/formGuide';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import {
  plateCalcInitialWeight,
  resolveAddExerciseId,
} from '@/lib/workout/activeSetInputPatches';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';
import type { ActiveExerciseLog, MuscleGroup } from '@/types';

type FormGuideView = {
  exerciseId: string;
  exerciseName: string;
  guide: FormGuide;
};

type CheckInDismiss = {
  completed: boolean;
  checkIn: MindCheckIn | null;
};

type Props = {
  checkInOpen: boolean;
  onCheckInDismiss: (result: CheckInDismiss) => void;
  hardWarningOpen?: boolean;
  onHardWarningContinue?: () => void;
  onHardWarningBack?: () => void;
  formGuideSheet: FormGuideView | null;
  onCloseFormGuide: () => void;
  addExerciseOpen: boolean;
  onCloseAddExercise: () => void;
  addExerciseId: string;
  onAddExerciseIdChange: (id: string) => void;
  onAddExerciseConfirmed: (id: string, muscleGroups: MuscleGroup[] | undefined) => void;
  plateCalcOpen: boolean;
  onClosePlateCalc: () => void;
  nextSet: { exIdx: number; setIdx: number } | null;
  exercises: ActiveExerciseLog[];
  resolveInput: (
    exIdx: number,
    setIdx: number,
    defaultReps: number,
    defaultWeight: number
  ) => { reps: number; weight: number };
  onApplyPlateWeight: (exIdx: number, setIdx: number, weight: number) => void;
  victoryOpen: boolean;
  victorySummary: WorkoutVictorySummary | null;
  onVictoryOpenChange: (open: boolean) => void;
  onViewToday: () => void;
  onViewHistory: () => void;
  debrief: Debrief | null;
  fragments: string[];
  victoryWorkoutId: string | null;
};

export function ActiveWorkoutSheets({
  checkInOpen,
  onCheckInDismiss,
  hardWarningOpen = false,
  onHardWarningContinue,
  onHardWarningBack,
  formGuideSheet,
  onCloseFormGuide,
  addExerciseOpen,
  onCloseAddExercise,
  addExerciseId,
  onAddExerciseIdChange,
  onAddExerciseConfirmed,
  plateCalcOpen,
  onClosePlateCalc,
  nextSet,
  exercises,
  resolveInput,
  onApplyPlateWeight,
  victoryOpen,
  victorySummary,
  onVictoryOpenChange,
  onViewToday,
  onViewHistory,
  debrief,
  fragments,
  victoryWorkoutId,
}: Props) {
  return (
    <>
      <HardSessionWarningSheet
        open={hardWarningOpen}
        onContinue={() => onHardWarningContinue?.()}
        onBack={() => onHardWarningBack?.()}
      />
      <SessionCheckInSheet open={checkInOpen} onDismiss={onCheckInDismiss} />

      {formGuideSheet ? (
        <FormGuideSheet
          exerciseName={formGuideSheet.exerciseName}
          exerciseId={formGuideSheet.exerciseId}
          guide={formGuideSheet.guide}
          open
          onClose={onCloseFormGuide}
        />
      ) : null}

      <AddExerciseSheet
        open={addExerciseOpen}
        onClose={onCloseAddExercise}
        value={addExerciseId}
        onChange={onAddExerciseIdChange}
        onConfirm={() => {
          const id = resolveAddExerciseId(addExerciseId);
          if (!id) return;
          const ex = resolveExercise(id);
          onAddExerciseConfirmed(id, ex?.muscleGroups);
        }}
      />

      <PlateCalculatorSheet
        open={plateCalcOpen}
        onClose={onClosePlateCalc}
        initialTarget={plateCalcInitialWeight({
          nextSet,
          exercises,
          resolveInput,
        })}
        onApplyTarget={(weight) => {
          if (!nextSet) return;
          onApplyPlateWeight(nextSet.exIdx, nextSet.setIdx, weight);
        }}
      />

      <WorkoutVictorySheet
        open={victoryOpen}
        summary={victorySummary}
        onOpenChange={onVictoryOpenChange}
        onViewToday={onViewToday}
        onViewHistory={onViewHistory}
        debrief={debrief}
        fragments={fragments}
        workoutId={victoryWorkoutId ?? undefined}
      />
    </>
  );
}
