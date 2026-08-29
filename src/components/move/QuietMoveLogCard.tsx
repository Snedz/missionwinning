'use client';

/**
 * Quiet rest-day walk / easy session on Move.
 * Outline log. Optional minutes or distance. Not a Start. Not a score circle.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { localDateKey } from '@/lib/time/localDate';
import {
  appendQuietMove,
  decideQuietMove,
  listQuietMoveForDate,
  loadQuietMoveLog,
  saveQuietMoveLog,
  type QuietMoveKind,
  type QuietMoveRow,
} from '@/lib/move/quietMove';

function rowLine(kindLabel: string, minutesLabel?: string, kmLabel?: string): string {
  return [kindLabel, minutesLabel, kmLabel].filter(Boolean).join(' · ');
}

export function QuietMoveLogCard() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<QuietMoveKind>('walk');
  const [minutes, setMinutes] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  // Date + diary hydrate after mount. A render-time `typeof window` check
  // stays '' after SSR, so a successful Log would save and then hide the row.
  const [today, setToday] = useState('');
  const [rows, setRows] = useState<QuietMoveRow[]>([]);

  useEffect(() => {
    setToday(localDateKey());
    setRows(loadQuietMoveLog());
  }, []);

  const todayRows = useMemo(() => listQuietMoveForDate(rows, today), [rows, today]);

  const handleLog = () => {
    const todayIso = today || localDateKey();
    const row = decideQuietMove({
      kind,
      minutes,
      distanceKm,
      todayIso,
      nowIso: new Date().toISOString(),
      id: `qm-${Date.now()}`,
    });
    if (!row) return;
    const next = appendQuietMove(loadQuietMoveLog(), row);
    saveQuietMoveLog(next);
    setToday(todayIso);
    setRows(next);
    setMinutes('');
    setDistanceKm('');
  };

  return (
    <section
      data-testid="quiet-move-log"
      className="house-card house-quiet-move"
    >
      <h2 className="house-quiet-move-name">
        {t('moveQuietTitle', { defaultValue: 'Easy walk or easy session' })}
      </h2>
      <p className="house-lede">
        {t('moveQuietHint', {
          defaultValue: 'Rest is fine. Optional — minutes or distance if you have them.',
        })}
      </p>

      <div
        className="house-collections"
        role="tablist"
        aria-label={t('moveQuietKinds', { defaultValue: 'Easy Move kind' })}
      >
        <button
          type="button"
          role="tab"
          aria-selected={kind === 'walk'}
          data-testid="quiet-move-kind-walk"
          className={cn('house-state tap-target', kind === 'walk' && 'is-on')}
          onClick={() => setKind('walk')}
        >
          {t('moveQuietWalk', { defaultValue: 'Walk' })}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={kind === 'easy'}
          data-testid="quiet-move-kind-easy"
          className={cn('house-state tap-target', kind === 'easy' && 'is-on')}
          onClick={() => setKind('easy')}
        >
          {t('moveQuietEasy', { defaultValue: 'Easy session' })}
        </button>
      </div>

      <div className="house-quiet-move-fields">
        <label>
          <span className="house-kicker">
            {t('moveQuietMinutes', { defaultValue: 'Minutes (optional)' })}
          </span>
          <input
            data-testid="quiet-move-minutes"
            type="text"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="house-field"
          />
        </label>
        <label>
          <span className="house-kicker">
            {t('moveQuietDistance', { defaultValue: 'Distance km (optional)' })}
          </span>
          <input
            data-testid="quiet-move-distance"
            type="text"
            inputMode="decimal"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="house-field"
          />
        </label>
      </div>

      <button
        type="button"
        className="house-btn house-btn-ghost min-h-[44px] tap-target"
        data-testid="quiet-move-log-submit"
        onClick={handleLog}
      >
        {t('moveQuietLog', { defaultValue: 'Log' })}
      </button>

      {todayRows.length === 0 ? (
        <p className="house-lede">
          {t('moveQuietEmpty', {
            defaultValue: 'Nothing logged. Rest is not a fail.',
          })}
        </p>
      ) : (
        <ul className="house-quiet-move-rows">
          {todayRows.map((row) => (
            <li key={row.id} data-testid="quiet-move-row" className="house-lede">
              {rowLine(
                row.kind === 'easy'
                  ? t('moveQuietEasy', { defaultValue: 'Easy session' })
                  : t('moveQuietWalk', { defaultValue: 'Walk' }),
                row.minutes != null
                  ? t('moveQuietRowMinutes', {
                      count: row.minutes,
                      defaultValue: '{{count}} min',
                    })
                  : undefined,
                row.distanceKm != null
                  ? t('moveQuietRowDistance', {
                      km: row.distanceKm,
                      defaultValue: '{{km}} km',
                    })
                  : undefined
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
