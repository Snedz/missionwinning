'use client';

/**
 * Prior sessions of the open lift — their diary (`.993`).
 * Empty invents nothing. Short list stays a notebook. Not a chart.
 */

import { useTranslation } from 'react-i18next';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { Button } from '@/components/ui/button';
import { formatLocalDateKey } from '@/lib/time/localDate';
import {
  formatMovementHistorySets,
  isShortMovementHistory,
  type MovementHistoryRow,
} from '@/lib/workout/movementHistory';

type Props = {
  open: boolean;
  onClose: () => void;
  exerciseName: string;
  rows: MovementHistoryRow[];
};

export function MovementHistorySheet({ open, onClose, exerciseName, rows }: Props) {
  const { t, i18n } = useTranslation();
  const empty = rows.length === 0;
  const short = isShortMovementHistory(rows);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow={t('activeMovementHistoryEyebrow', { defaultValue: 'History' })}
      title={exerciseName}
      bodyClassName="p-4"
      footer={
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-[52px] tap-target"
          data-testid="movement-history-close"
          onClick={onClose}
        >
          {t('activeMovementHistoryClose', { defaultValue: 'Close' })}
        </Button>
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
                className="border-2 border-border bg-card p-3 space-y-1"
              >
                {row.dateKey ? (
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
                    {formatLocalDateKey(row.dateKey, i18n.language)}
                  </p>
                ) : null}
                <p className="text-sm font-semibold">{row.workoutName}</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatMovementHistorySets(row.sets)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdaptiveOverlay>
  );
}
