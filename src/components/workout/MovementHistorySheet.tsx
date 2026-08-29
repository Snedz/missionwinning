'use client';

/**
 * Prior sessions of the open lift — their diary (`.993`).
 * Empty invents nothing. Short list stays a notebook. Not a chart.
 */

import { useTranslation } from 'react-i18next';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { formatLocalDateKey } from '@/lib/time/localDate';
import {
  formatMovementHistorySets,
  isShortMovementHistory,
  movementHistoryTitle,
  type MovementHistoryRow,
} from '@/lib/workout/movementHistory';
import type { SetRowType } from '@/types';

type Props = {
  open: boolean;
  onClose: () => void;
  exerciseName: string;
  rows: MovementHistoryRow[];
  rowType?: SetRowType;
};

export function MovementHistorySheet({
  open,
  onClose,
  exerciseName,
  rows,
  rowType = 'weight',
}: Props) {
  const { t, i18n } = useTranslation();
  const empty = rows.length === 0;
  const short = isShortMovementHistory(rows);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      className="mw-house house-movement-sheet"
      eyebrow={t('activeMovementHistoryEyebrow', { defaultValue: 'History' })}
      title={exerciseName}
      bodyClassName="p-4"
      footer={
        <button
          type="button"
          className="house-btn min-h-[52px] w-full tap-target"
          data-testid="movement-history-close"
          onClick={onClose}
        >
          {t('activeMovementHistoryClose', { defaultValue: 'Close' })}
        </button>
      }
    >
      <div data-testid="movement-history-sheet" data-short={short ? 'true' : 'false'}>
        {empty ? (
          <p className="text-sm text-muted-foreground" data-testid="movement-history-empty">
            {t('activeMovementHistoryEmpty', {
              defaultValue: 'No prior sessions yet — log this one',
            })}
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.sessionId}
                data-testid="movement-history-row"
                className="house-movement-row space-y-1"
              >
                {row.dateKey ? (
                  <p className="house-set-kicker">
                    {formatLocalDateKey(row.dateKey, i18n.language)}
                  </p>
                ) : null}
                <p className="text-sm font-semibold">{movementHistoryTitle(row)}</p>
                {row.workoutName &&
                row.workoutName !== movementHistoryTitle(row) ? (
                  <p className="text-xs text-muted-foreground">{row.workoutName}</p>
                ) : null}
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatMovementHistorySets(row.sets, rowType)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdaptiveOverlay>
  );
}
