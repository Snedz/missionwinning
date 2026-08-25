'use client';

/**
 * Merge two names of the same movement (`.1002`).
 * Pick a source and a keeper, then confirm. Cannot be undone.
 * Does not invent a match. Not Resume. Not the Today Start.
 */

import { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  decideMergeExercises,
  filterMergeCandidates,
  listMergeCandidates,
  type MergeCandidate,
} from '@/lib/workout/mergeExercises';
import { cn } from '@/lib/utils';
import type { CompletedWorkoutLog, SavedWorkout } from '@/types';

type Props = {
  history: readonly CompletedWorkoutLog[];
  live?: readonly { exerciseId: string }[] | null;
  saved?: readonly SavedWorkout[];
  onConfirm: (sourceId: string, keeperId: string) => void;
  onCancel: () => void;
};

function MergeIdPick(props: {
  id: string;
  label: string;
  value: string;
  query: string;
  onQuery: (q: string) => void;
  onChange: (id: string) => void;
  rows: readonly MergeCandidate[];
}) {
  const { t } = useTranslation();
  const filtered = filterMergeCandidates(props.rows, props.query);
  const selected = props.rows.find((row) => row.id === props.value);
  return (
    <div className="space-y-2">
      <label htmlFor={props.id} className="text-sm font-semibold">
        {props.label}
      </label>
      <Input
        id={props.id}
        type="search"
        value={props.query}
        onChange={(e) => props.onQuery(e.target.value)}
        placeholder={t('historyMergeSearch', { defaultValue: 'Search a name…' })}
        className="min-h-[44px]"
      />
      {selected && !props.query ? (
        <p className="text-xs text-muted-foreground">
          {t('historyMergeSelected', {
            name: selected.name,
            defaultValue: `Selected: ${selected.name}`,
          })}
        </p>
      ) : null}
      <div
        className="max-h-40 overflow-y-auto border-2 border-border divide-y divide-border"
        role="listbox"
        aria-label={props.label}
      >
        {filtered.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            {t('historyMergeEmptyPick', { defaultValue: 'No matches' })}
          </p>
        ) : (
          filtered.slice(0, 40).map((row) => (
            <button
              key={row.id}
              type="button"
              role="option"
              aria-selected={props.value === row.id}
              className={cn(
                'w-full min-h-[44px] px-3 py-2 text-start text-sm hover:bg-muted tap-target',
                props.value === row.id &&
                  'bg-muted text-primary border-s-[3px] border-s-primary'
              )}
              onClick={() => {
                props.onChange(row.id);
                props.onQuery('');
              }}
            >
              <span className="font-semibold">{row.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function HistoryMergeExercises({
  history,
  live,
  saved,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [sourceId, setSourceId] = useState('');
  const [keeperId, setKeeperId] = useState('');
  const [sourceQuery, setSourceQuery] = useState('');
  const [keeperQuery, setKeeperQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [emptyOpen, setEmptyOpen] = useState(false);

  const candidates = useMemo(
    () => listMergeCandidates({ history, live, saved }),
    [history, live, saved]
  );
  const knownIds = useMemo(() => candidates.map((row) => row.id), [candidates]);
  const sourceName = candidates.find((row) => row.id === sourceId)?.name ?? sourceId;
  const keeperName = candidates.find((row) => row.id === keeperId)?.name ?? keeperId;

  const requestConfirm = () => {
    const decision = decideMergeExercises({ sourceId, keeperId, knownIds });
    if (decision.kind === 'needs-confirm') {
      setConfirmOpen(true);
      return;
    }
    setEmptyOpen(true);
  };

  return (
    <div className="space-y-4" data-testid="session-history-merge">
      <MergeIdPick
        id="merge-source"
        label={t('historyMergeSource', { defaultValue: 'Move data from' })}
        value={sourceId}
        query={sourceQuery}
        onQuery={setSourceQuery}
        onChange={setSourceId}
        rows={candidates}
      />
      <MergeIdPick
        id="merge-keeper"
        label={t('historyMergeKeeper', { defaultValue: 'Keep this name' })}
        value={keeperId}
        query={keeperQuery}
        onQuery={setKeeperQuery}
        onChange={setKeeperId}
        rows={candidates}
      />
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-[44px] tap-target"
          data-testid="session-history-merge-continue"
          onClick={requestConfirm}
        >
          {t('historyMergeContinue', { defaultValue: 'Continue' })}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full min-h-[44px] tap-target"
          onClick={onCancel}
        >
          {t('historyMergeCancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent className="max-w-md border-2 border-border bg-card">
          <DialogHeader>
            <DialogTitle>
              {t('historyMergeConfirmTitle', { defaultValue: 'Merge these names?' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyMergeConfirmDesc', {
                source: sourceName,
                keeper: keeperName,
                defaultValue:
                  'All history, PRs, notes, tags, rest, and 1RM from {{source}} move onto {{keeper}}. This cannot be undone.',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] tap-target"
              data-testid="session-history-merge-confirm"
              onClick={() => {
                setConfirmOpen(false);
                onConfirm(sourceId, keeperId);
              }}
            >
              {t('historyMergeConfirm', { defaultValue: 'Merge — cannot be undone' })}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full min-h-[44px] tap-target"
              onClick={() => setConfirmOpen(false)}
            >
              {t('historyMergeCancel', { defaultValue: 'Cancel' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emptyOpen} onOpenChange={(open) => !open && setEmptyOpen(false)}>
        <DialogContent className="max-w-md border-2 border-border bg-card">
          <DialogHeader>
            <DialogTitle>
              {t('historyMergeEmpty', { defaultValue: 'Nothing to merge' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyMergeEmptyDesc', {
                defaultValue:
                  'Empty invents nothing — pick two different names that already exist.',
              })}
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            onClick={() => setEmptyOpen(false)}
          >
            {t('historyMergeCancel', { defaultValue: 'Cancel' })}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
