'use client';

/**
 * Confirm-gated write for the saved notebook (`.960`).
 * Guest. No silent wipe. Callers own the toast.
 */

import { useCallback, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import {
  decideSavedWrite,
  type SavedRoutineDraft,
} from '@/lib/workout/honorSavedRoutine';

export type HonorSaveDoor = {
  draft: SavedRoutineDraft;
  replaceExisting: boolean;
};

export function useHonorSavedRoutine() {
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const addSavedWorkout = useWorkoutStore((s) => s.addSavedWorkout);
  const replaceSavedWorkout = useWorkoutStore((s) => s.replaceSavedWorkout);
  const [door, setDoor] = useState<HonorSaveDoor | null>(null);

  const requestSave = useCallback(
    (input: { name?: string | null; exercises?: SavedRoutineDraft['exercises']; note?: string | null }) => {
      const decision = decideSavedWrite(savedWorkouts, input);
      if (decision.kind === 'empty') return { kind: 'empty' as const };
      setDoor({
        draft: decision.draft,
        replaceExisting: decision.kind === 'needs-replace' || decision.kind === 'replace',
      });
      return { kind: 'open' as const };
    },
    [savedWorkouts]
  );

  const confirmSave = useCallback(() => {
    if (!door) return { kind: 'empty' as const };
    const decision = decideSavedWrite(savedWorkouts, door.draft, {
      replace: door.replaceExisting,
    });
    if (decision.kind === 'empty') return { kind: 'empty' as const };
    if (decision.kind === 'needs-replace') {
      setDoor({ draft: decision.draft, replaceExisting: true });
      return { kind: 'needs-replace' as const };
    }
    if (decision.kind === 'replace') {
      replaceSavedWorkout(decision.existingId, decision.draft);
      setDoor(null);
      return { kind: 'replaced' as const, name: decision.draft.name };
    }
    addSavedWorkout(decision.draft);
    setDoor(null);
    return { kind: 'added' as const, name: decision.draft.name };
  }, [addSavedWorkout, door, replaceSavedWorkout, savedWorkouts]);

  const cancelSave = useCallback(() => setDoor(null), []);

  const setName = useCallback((name: string) => {
    setDoor((current) => (current ? { ...current, draft: { ...current.draft, name } } : current));
  }, []);

  return {
    door,
    requestSave,
    confirmSave,
    cancelSave,
    setName,
  };
}
