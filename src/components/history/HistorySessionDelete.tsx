'use client';

/**
 * Delete one finished History log (`.1003`).
 * Confirm-gated. Restore lives on History (`.1006`).
 * Not Resume. Not live cancel. Not the Today Start.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { decideDeleteFinishedSession } from '@/lib/workout/deleteFinishedSession';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

type Props = {
  sessionId: string;
  history: readonly CompletedWorkoutLog[];
  live?: ActiveWorkout | null;
  onConfirm: (sessionId: string) => void;
};

export function HistorySessionDelete({
  sessionId,
  history,
  live,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestConfirm = () => {
    const decision = decideDeleteFinishedSession({
      sessionId,
      history,
      live,
    });
    if (decision.kind !== 'needs-confirm') return;
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-2" data-testid="session-history-delete">
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-delete-open"
        onClick={requestConfirm}
      >
        {t('historyDelete', { defaultValue: 'Delete this session' })}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent className="max-w-md border-2 border-border bg-card">
          <DialogHeader>
            <DialogTitle>
              {t('historyDeleteConfirmTitle', { defaultValue: 'Delete this session?' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyDeleteConfirmDesc', {
                defaultValue:
                  'This session leaves History. Restore it from Deleted sessions. Other days stay.',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] tap-target"
              data-testid="session-history-delete-confirm"
              onClick={() => {
                setConfirmOpen(false);
                const decision = decideDeleteFinishedSession({
                  sessionId,
                  history,
                  live,
                });
                if (decision.kind !== 'needs-confirm') return;
                onConfirm(decision.sessionId);
              }}
            >
              {t('historyDeleteConfirm', {
                defaultValue: 'Delete this session',
              })}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full min-h-[44px] tap-target"
              onClick={() => setConfirmOpen(false)}
            >
              {t('historyDeleteCancel', { defaultValue: 'Cancel' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
