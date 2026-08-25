'use client';

/**
 * Quiet rest-day walk / easy session on Move.
 * Outline log. Optional minutes or distance. Not a Start. Not a score circle.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

let qmMountSeq = 0;

function qmAgentLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  const entry = { hypothesisId, location, message, data, timestamp: Date.now() };
  try {
    const g = globalThis as { __QM_DEBUG?: unknown[] };
    g.__QM_DEBUG = g.__QM_DEBUG ?? [];
    g.__QM_DEBUG.push(entry);
  } catch {
    /* ignore */
  }
  try {
    console.info('[qm-debug]', JSON.stringify(entry));
  } catch {
    /* ignore */
  }
  try {
    void fetch('http://127.0.0.1:7931/log', {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(entry),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
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
  const [hydrated, setHydrated] = useState(false);
  const mountIdRef = useRef(++qmMountSeq);
  const mountId = mountIdRef.current;

  useEffect(() => {
    // #region agent log
    qmAgentLog('E', 'QuietMoveLogCard.tsx:mount', 'card mount', {
      mountId,
      href: typeof location !== 'undefined' ? location.href : '',
    });
    // #endregion
    return () => {
      // #region agent log
      qmAgentLog('E', 'QuietMoveLogCard.tsx:unmount', 'card unmount', { mountId });
      // #endregion
    };
  }, [mountId]);

  useEffect(() => {
    const nextToday = localDateKey();
    const loaded = loadQuietMoveLog();
    setToday(nextToday);
    setRows(loaded);
    setHydrated(true);
    // #region agent log
    qmAgentLog('C', 'QuietMoveLogCard.tsx:hydrate', 'hydrate today+rows', {
      mountId,
      nextToday,
      loadedCount: loaded.length,
      loadedDates: loaded.map((r) => r.date),
    });
    // #endregion
  }, [mountId]);

  const todayRows = useMemo(() => listQuietMoveForDate(rows, today), [rows, today]);

  useEffect(() => {
    // #region agent log
    qmAgentLog('C', 'QuietMoveLogCard.tsx:view', 'todayRows view', {
      mountId,
      today,
      hydrated,
      rowCount: rows.length,
      todayRowCount: todayRows.length,
      rowDates: rows.map((r) => r.date),
    });
    // #endregion
  }, [mountId, today, hydrated, rows, todayRows]);

  const handleLog = () => {
    // #region agent log
    qmAgentLog('A', 'QuietMoveLogCard.tsx:handleLog', 'handleLog entry', {
      mountId,
      kind,
      minutes,
      distanceKm,
      today,
      hydrated,
    });
    // #endregion
    const todayIso = today || localDateKey();
    const row = decideQuietMove({
      kind,
      minutes,
      distanceKm,
      todayIso,
      nowIso: new Date().toISOString(),
      id: `qm-${Date.now()}`,
    });
    // #region agent log
    qmAgentLog('B', 'QuietMoveLogCard.tsx:decide', 'decideQuietMove result', {
      mountId,
      todayIso,
      rejected: !row,
      rowDate: row?.date ?? null,
      rowId: row?.id ?? null,
    });
    // #endregion
    if (!row) return;
    const next = appendQuietMove(loadQuietMoveLog(), row);
    saveQuietMoveLog(next);
    setToday(todayIso);
    setRows(next);
    setMinutes('');
    setDistanceKm('');
  };

  return (
    <div
      data-testid="quiet-move-log"
      data-qm-instrumented="1"
      data-qm-hydrated={hydrated ? '1' : '0'}
      data-qm-today={today}
      data-qm-row-count={String(todayRows.length)}
      data-qm-mount={String(mountId)}
      className="border-2 border-border bg-card px-3 py-3 space-y-3"
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {t('moveQuietTitle', { defaultValue: 'Easy walk or easy session' })}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('moveQuietHint', {
            defaultValue: 'Rest is fine. Optional — minutes or distance if you have them.',
          })}
        </p>
      </div>

      <div
        className="flex gap-2"
        role="tablist"
        aria-label={t('moveQuietKinds', { defaultValue: 'Easy Move kind' })}
      >
        <button
          type="button"
          role="tab"
          aria-selected={kind === 'walk'}
          data-testid="quiet-move-kind-walk"
          className={cn(
            'min-h-[44px] flex-1 border-2 px-3 text-sm font-semibold tap-target',
            kind === 'walk'
              ? 'is-active-tab border-primary text-foreground'
              : 'border-border bg-card text-foreground hover:border-primary'
          )}
          onClick={() => setKind('walk')}
        >
          {t('moveQuietWalk', { defaultValue: 'Walk' })}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={kind === 'easy'}
          data-testid="quiet-move-kind-easy"
          className={cn(
            'min-h-[44px] flex-1 border-2 px-3 text-sm font-semibold tap-target',
            kind === 'easy'
              ? 'is-active-tab border-primary text-foreground'
              : 'border-border bg-card text-foreground hover:border-primary'
          )}
          onClick={() => setKind('easy')}
        >
          {t('moveQuietEasy', { defaultValue: 'Easy session' })}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            {t('moveQuietMinutes', { defaultValue: 'Minutes (optional)' })}
          </span>
          <Input
            data-testid="quiet-move-minutes"
            type="text"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="min-h-[44px] border-2"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            {t('moveQuietDistance', { defaultValue: 'Distance km (optional)' })}
          </span>
          <Input
            data-testid="quiet-move-distance"
            type="text"
            inputMode="decimal"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="min-h-[44px] border-2"
          />
        </label>
      </div>

      <Button
        type="button"
        variant="outline"
        className="min-h-[44px] tap-target"
        data-testid="quiet-move-log-submit"
        onPointerDown={() => {
          // #region agent log
          qmAgentLog('A', 'QuietMoveLogCard.tsx:pointerdown', 'Log pointerdown', {
            mountId,
            today,
            minutes,
            kind,
            hydrated,
          });
          // #endregion
        }}
        onClick={handleLog}
      >
        {t('moveQuietLog', { defaultValue: 'Log' })}
      </Button>

      {todayRows.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('moveQuietEmpty', {
            defaultValue: 'Nothing logged. Rest is not a fail.',
          })}
        </p>
      ) : (
        <ul className="space-y-1 text-sm text-foreground">
          {todayRows.map((row) => (
            <li key={row.id} data-testid="quiet-move-row">
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
    </div>
  );
}
