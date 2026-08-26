'use client';

/**
 * Copy a finished History log onto another calendar day (`.1030`).
 * New id. Original stays. Not Move. Not Repeat. Not Resume.
 * Not the Today Start.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { localDateKey } from '@/lib/time/localDate';
import { decideCopySessionDay } from '@/lib/workout/copySessionDay';
import { sessionDayKey } from '@/lib/workout/moveSessionDay';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

type Props = {
  sessionId: string;
  history: readonly CompletedWorkoutLog[];
  live?: ActiveWorkout | null;
  onSave: (sessionId: string, dateKey: string) => void;
};

export function HistorySessionCopy({
  sessionId,
  history,
  live,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const log = history.find((row) => row.id === sessionId);
  const todayKey = localDateKey();
  const [date, setDate] = useState(sessionDayKey(log));

  const requestSave = () => {
    const decision = decideCopySessionDay({
      sessionId,
      dateKey: date,
      todayKey,
      history,
      live,
    });
    if (decision.kind !== 'apply') return;
    onSave(decision.sessionId, decision.dateKey);
  };

  if (!log || log.deletedAt) return null;

  return (
    <div className="space-y-2" data-testid="session-history-copy">
      <label className="block space-y-1">
        <span className="text-sm">
          {t('historyCopyDayLabel', { defaultValue: 'Copy to another day' })}
        </span>
        <Input
          type="date"
          value={date}
          max={todayKey}
          onChange={(e) => setDate(e.target.value)}
          className="min-h-[44px]"
          data-testid="session-history-copy-date"
          aria-label={t('historyCopyDayLabel', { defaultValue: 'Copy to another day' })}
        />
      </label>
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-copy-save"
        onClick={requestSave}
      >
        {t('historyCopyDaySave', { defaultValue: 'Copy to this day' })}
      </Button>
    </div>
  );
}
