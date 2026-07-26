'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { flush, retryStuck, subscribe, type OutboxState } from '@/lib/sync/outbox';
import { isPersistent, onStorageFailure, type StorageFailure } from '@/lib/storage/safeStorage';

/**
 * Tells the truth about unsynced work instead of pretending everything landed.
 *
 * The logger never blocks on the cloud, which used to mean a failed write was
 * completely invisible. If something is queued, the user should be able to see it
 * and poke it — and if the browser is refusing to persist at all (private mode,
 * full disk), that is worth saying out loud before they lose a session.
 */
export function SyncStatusRow() {
  const { t } = useTranslation();
  const [state, setState] = useState<OutboxState | null>(null);
  const [failure, setFailure] = useState<StorageFailure | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubOutbox = subscribe(setState);
    const unsubStorage = onStorageFailure(setFailure);
    if (!isPersistent()) {
      setFailure({ reason: 'denied', key: '', usingMemoryFallback: true });
    }
    return () => {
      unsubOutbox();
      unsubStorage();
    };
  }, []);

  const queued = (state?.pending ?? 0) + (state?.stuck ?? 0);

  if (!failure && queued === 0) return null;

  const onRetry = async () => {
    setBusy(true);
    retryStuck();
    await flush();
    setBusy(false);
  };

  return (
    <div className="border-2 border-border bg-card p-3 text-sm">
      {failure ? (
        <p className="flex items-start gap-2 text-muted-foreground">
          <CloudOff className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {failure.reason === 'quota'
              ? t('syncStorageFull', {
                  defaultValue:
                    'This device is out of storage space. Export a backup, then clear some space so new sessions save.',
                })
              : t('syncStorageDenied', {
                  defaultValue:
                    "This browser won't let us save to the device — private browsing does this. Your session works, but it won't be here next time.",
                })}
          </span>
        </p>
      ) : null}

      {queued > 0 ? (
        <div className="flex items-center justify-between gap-3 pt-2 first:pt-0">
          <p className="text-muted-foreground">
            {t('syncQueuedCount', {
              count: queued,
              defaultValue:
                queued === 1
                  ? '1 session saved here, waiting to reach your account.'
                  : `${queued} sessions saved here, waiting to reach your account.`,
            })}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={onRetry} disabled={busy}>
            <RefreshCw className={`me-1.5 h-3.5 w-3.5 ${busy ?'animate-spin' : ''}`} />
            {t('syncRetryNow', { defaultValue: 'Retry' })}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
