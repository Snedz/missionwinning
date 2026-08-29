'use client';

/**
 * Desktop inline add-exercise row on Active (compact keeps the sheet) (.434).
 */

import { useTranslation } from 'react-i18next';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { resolveAddExerciseId } from '@/lib/workout/activeSetInputPatches';
import { resolveExercise } from '@/lib/workout/customExercise';
import type { MuscleGroup } from '@/types';

type Props = {
  addExerciseId: string;
  onAddExerciseIdChange: (id: string) => void;
  onAdd: (exerciseId: string, muscleGroups: MuscleGroup[] | undefined) => void;
};

export function ActiveInlineAddExercise({
  addExerciseId,
  onAddExerciseIdChange,
  onAdd,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="house-add-exercise max-w-[640px] pt-5">
      <ExercisePicker
        value={addExerciseId}
        onChange={onAddExerciseIdChange}
        placeholder={t('activeAddExerciseInline', {
          defaultValue: 'Add exercise — search 300+ movements',
        })}
      />
      <button
        type="button"
        disabled={!addExerciseId}
        data-testid="active-add-selected-exercise"
        onClick={() => {
          const id = resolveAddExerciseId(addExerciseId);
          if (!id) return;
          const ex = resolveExercise(id);
          onAdd(id, ex?.muscleGroups);
          onAddExerciseIdChange('');
        }}
        className="house-btn min-h-[44px] tap-target"
      >
        {t('activeAddSelectedExercise', { defaultValue: 'Add selected exercise' })}
      </button>
    </div>
  );
}
