'use client';

/**
 * One ScreenDock for rest OR compact log console — never both (.440).
 * Mode stays in resolveActiveDockMode; this is chrome only.
 */

import { ScreenDock } from '@/components/layout/ScreenDock';
import { RestTimerBar } from '@/components/workout/RestTimerBar';
import { LogConsole } from '@/components/workout/LogConsole';
import { patchesForUseNext } from '@/lib/workout/activeSetInputPatches';
import type { ActiveDockMode, ConsoleSetView } from '@/lib/workout/activeWorkoutHelpers';
import type { SetKind, SetSide } from '@/types';

type Props = {
  dockMode: ActiveDockMode;
  consoleSet: ConsoleSetView | null;
  restSecondsRemaining: number;
  restTimerInitialSeconds: number;
  unitLabel: string;
  weightStep: number;
  onSkipRest: () => void;
  onAdjustRest: (delta: number) => void;
  onPresetRest: (seconds: number) => void;
  onRepsChange: (exIdx: number, setIdx: number, reps: number) => void;
  onWeightChange: (exIdx: number, setIdx: number, weight: number) => void;
  onKindChange: (exIdx: number, setIdx: number, kind: SetKind) => void;
  onSideChange: (exIdx: number, setIdx: number, side: SetSide | undefined) => void;
  onLog: (exIdx: number, setIdx: number) => void;
  onApplyFieldPatches: (
    exIdx: number,
    setIdx: number,
    patches: { field: 'reps' | 'weight'; value: number }[]
  ) => void;
};

export function ActiveSessionDock({
  dockMode,
  consoleSet,
  restSecondsRemaining,
  restTimerInitialSeconds,
  unitLabel,
  weightStep,
  onSkipRest,
  onAdjustRest,
  onPresetRest,
  onRepsChange,
  onWeightChange,
  onKindChange,
  onSideChange,
  onLog,
  onApplyFieldPatches,
}: Props) {
  /*
    One dock, two states, never both. Rest takes the console over rather
    than being a second fixed panel floating on the set rows it describes.
  */
  if (dockMode === 'rest') {
    return (
      <ScreenDock>
        <RestTimerBar
          remaining={restSecondsRemaining}
          initial={restTimerInitialSeconds}
          onSkip={onSkipRest}
          onAdjust={onAdjustRest}
          onPreset={onPresetRest}
        />
      </ScreenDock>
    );
  }

  if (dockMode === 'console' && consoleSet) {
    /* Compact only — desktop enters the set in SetLogTable. */
    return (
      <ScreenDock>
        <LogConsole
          exerciseName={consoleSet.exerciseName}
          setNumber={consoleSet.setIdx + 1}
          totalSets={consoleSet.totalSets}
          overloadCue={consoleSet.overloadCue}
          reps={consoleSet.input.reps}
          weight={consoleSet.input.weight}
          weightLabel={unitLabel}
          weightStep={weightStep}
          kind={consoleSet.kind}
          unilateral={consoleSet.unilateral}
          side={consoleSet.side}
          onSideChange={(side) => onSideChange(consoleSet.exIdx, consoleSet.setIdx, side)}
          plusLoad={consoleSet.plusLoad}
          onRepsChange={(v) => onRepsChange(consoleSet.exIdx, consoleSet.setIdx, v)}
          onWeightChange={(v) => onWeightChange(consoleSet.exIdx, consoleSet.setIdx, v)}
          onKindChange={(kind) => onKindChange(consoleSet.exIdx, consoleSet.setIdx, kind)}
          onLog={() => onLog(consoleSet.exIdx, consoleSet.setIdx)}
          lastSetGhost={consoleSet.lastSetGhost}
          onAcceptGhost={(target) => {
            onApplyFieldPatches(
              consoleSet.exIdx,
              consoleSet.setIdx,
              patchesForUseNext(target)
            );
          }}
          onUseNext={(target) => {
            onApplyFieldPatches(
              consoleSet.exIdx,
              consoleSet.setIdx,
              patchesForUseNext(target)
            );
          }}
        />
      </ScreenDock>
    );
  }

  return null;
}
