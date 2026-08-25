'use client';

/**
 * Start history from this date (`.1005`).
 * Fold older logs out of week strip / Coach / streak.
 * History keeps the sessions. Confirm if it hides a lot.
 * Not delete. Not Today. Not a second Start.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatLocalDateKey, localDateKey } from '@/lib/time/localDate';
import {
  decideClearStartHistoryFrom,
  decideStartHistoryFrom,
  loadStartHistoryFrom,
  persistStartHistoryFrom,
} from '@/lib/workout/startHistoryFrom';
import type { CompletedWorkoutLog } from '@/types';

type Props = {
  history: readonly CompletedWorkoutLog[];
  onApplied: () => void;
  onEmpty: () => void;
};

export function HistoryStartFrom({ history, onApplied, onEmpty }: Props) {
  const { t, i18n } = useTranslation();
  const todayKey = localDateKey();
  const current = loadStartHistoryFrom();
  const [date, setDate] = useState(current ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState('');
  const [pendingDays, setPendingDays] = useState(0);

  const applyDate = (dateKey: string) => {
    persistStartHistoryFrom(dateKey);
    onApplied();
  };

  const requestApply = () => {
    const decision = decideStartHistoryFrom({
      date,
      todayKey,
      history,
      current,
    });
    if (decision.kind === 'empty') {
      onEmpty();
      return;
    }
    if (decision.kind === 'noop') {
      onApplied();
      return;
    }
    if (decision.kind === 'needs-confirm') {
      setPendingDate(decision.dateKey);
      setPendingDays(decision.foldedDays);
      setConfirmOpen(true);
      return;
    }
    applyDate(decision.dateKey);
  };

  const requestClear = () => {
    const decision = decideClearStartHistoryFrom({ current });
    if (decision.kind !== 'clear') {
      onEmpty();
      return;
    }
    persistStartHistoryFrom(null);
    onApplied();
  };

  return (
    <div className="space-y-3" data-testid="session-history-start-from">
      {current ? (
        <p className="text-sm text-muted-foreground" data-testid="session-history-start-from-active">
          {t('historyStartFromActive', {
            date: formatLocalDateKey(current, i18n.language),
            defaultValue: `Week 1 starts ${formatLocalDateKey(current, i18n.language)}. Older days stay in History.`,
          })}
        </p>
      ) : null}

      <label className="block space-y-1">
        <span className="text-sm">{t('historyStartFromDate', { defaultValue: 'Date' })}</span>
        <Input
          type="date"
          value={date}
          max={todayKey}
          onChange={(e) => setDate(e.target.value)}
          className="min-h-[44px]"
          data-testid="session-history-start-from-date"
        />
      </label>

      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-start-from-apply"
        onClick={requestApply}
      >
        {t('historyStartFromApply', { defaultValue: 'Start history from this date' })}
      </Button>

      {current ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full min-h-[44px] tap-target"
          data-testid="session-history-start-from-clear"
          onClick={requestClear}
        >
          {t('historyStartFromClear', { defaultValue: 'Show the full diary' })}
        </Button>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent className="max-w-md border-2 border-border bg-card">
          <DialogHeader>
            <DialogTitle>
              {t('historyStartFromConfirmTitle', {
                defaultValue: 'Fold older days out of week 1?',
              })}
            </DialogTitle>
            <DialogDescription>
              {t('historyStartFromConfirmDesc', {
                count: pendingDays,
                defaultValue: `This folds ${pendingDays} training days out of the week strip, Coach, and streak. Sessions stay in History.`,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] tap-target"
              data-testid="session-history-start-from-confirm"
              onClick={() => {
                setConfirmOpen(false);
                const decision = decideStartHistoryFrom({
                  date: pendingDate,
                  todayKey,
                  history,
                  current,
                });
                if (decision.kind !== 'needs-confirm' && decision.kind !== 'apply') return;
                applyDate(decision.dateKey);
              }}
            >
              {t('historyStartFromConfirm', {
                defaultValue: 'Fold — sessions stay',
              })}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full min-h-[44px] tap-target"
              onClick={() => setConfirmOpen(false)}
            >
              {t('historyStartFromCancel', { defaultValue: 'Cancel' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
