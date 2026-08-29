'use client';

/**
 * Grip + up/down on the live exercise name row (`.998`).
 * Drag the handle. Tap the name still opens history.
 */

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

const TRAVEL_PX = 8;

type Props = {
  name: string;
  exIdx: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

export function ExerciseReorderHandle({
  name,
  exIdx,
  canMoveUp,
  canMoveDown,
  onReorder,
}: Props) {
  const { t } = useTranslation();
  const drag = useRef<{ pointerId: number; startY: number; armed: boolean } | null>(null);

  const dropAt = (clientX: number, clientY: number) => {
    const under = document.elementFromPoint(clientX, clientY);
    const target = under?.closest('[data-ex-idx]');
    if (!target) return;
    const to = Number(target.getAttribute('data-ex-idx'));
    if (!Number.isInteger(to) || to === exIdx) return;
    onReorder(exIdx, to);
  };

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        data-testid="exercise-reorder-handle"
        className="house-btn house-btn-ghost house-reorder min-h-[44px] tap-target"
        aria-label={t('activeReorderHandleAria', {
          name,
          defaultValue: 'Drag to reorder {{name}}',
        })}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          drag.current = { pointerId: event.pointerId, startY: event.clientY, armed: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state || state.pointerId !== event.pointerId) return;
          if (!state.armed && Math.abs(event.clientY - state.startY) >= TRAVEL_PX) {
            state.armed = true;
          }
        }}
        onPointerUp={(event) => {
          const state = drag.current;
          drag.current = null;
          if (!state || state.pointerId !== event.pointerId || !state.armed) return;
          dropAt(event.clientX, event.clientY);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="house-btn house-btn-ghost house-reorder min-h-[44px] tap-target"
        data-testid="exercise-reorder-up"
        disabled={!canMoveUp}
        aria-label={t('activeReorderMoveUp', {
          name,
          defaultValue: 'Move {{name}} up',
        })}
        onClick={() => {
          if (!canMoveUp) return;
          onReorder(exIdx, exIdx - 1);
        }}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="house-btn house-btn-ghost house-reorder min-h-[44px] tap-target"
        data-testid="exercise-reorder-down"
        disabled={!canMoveDown}
        aria-label={t('activeReorderMoveDown', {
          name,
          defaultValue: 'Move {{name}} down',
        })}
        onClick={() => {
          if (!canMoveDown) return;
          onReorder(exIdx, exIdx + 1);
        }}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
