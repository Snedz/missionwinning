'use client';

/**
 * Desktop inline add-exercise row on Active (compact keeps the sheet) (.434).
 */

import { useTranslation } from 'react-i18next';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { resolveAddExerciseId } from '@/lib/workout/activeSetInputPatches';
import { getExerciseById } from '@/data/exercises';
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
    <div className="max-w-[640px] border-t-2 border-border pt-5">
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
        onClick={() => {
          const id = resolveAddExerciseId(addExerciseId);
          if (!id) return;
          const ex = getExerciseById(id);
          onAdd(id, ex?.muscleGroups);
          onAddExerciseIdChange('');
        }}
        className="mt-3 min-h-[44px] border-2 border-border px-4 text-sm font-semibold transition-colors hover:bg-muted disabled:pointer-events-none disabled:border-dashed disabled:text-muted-foreground tap-target"
      >
        {t('activeAddSelectedExercise', { defaultValue: 'Add selected exercise' })}
      </button>
    </div>
  );
}
