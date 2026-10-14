'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { flush, retryStuck, subscribe, type OutboxState } from '@/lib/sync/outbox';
import { StorageFailureNotice, useStorageFailure } from '@/components/storage/StorageFailureNotice';

/**
 * Tells the truth about unsynced work instead of pretending everything landed.
 *
 * The logger never blocks on the cloud, which used to mean a failed write was
 * completely invisible. If something is queued, the user should be able to see it
 * and poke it.
 *
 * The "this device isn't saving" half of that used to live here as its own
 * paragraph, which meant the only surface carrying it was `/account` — a page an
 * athlete mid-session never visits. It is now [`StorageFailureNotice`], mounted
 * on Train as well, so the warning arrives where the trust is being placed.
 */
export function SyncStatusRow() {
  const { t } = useTranslation();
  const [state, setState] = useState<OutboxState | null>(null);
  const [busy, setBusy] = useState(false);
  const storageFailure = useStorageFailure();

  useEffect(() => {
    const unsubOutbox = subscribe(setState);
    return unsubOutbox;
  }, []);

  const queued = (state?.pending ?? 0) + (state?.stuck ?? 0);

  if (!storageFailure && queued === 0) return null;

  const onRetry = async () => {
    setBusy(true);
    retryStuck();
    await flush();
    setBusy(false);
  };

  return (
    <div className="house-card space-y-3 text-sm" data-testid="account-sync-status-row">
      {storageFailure ? (
        <StorageFailureNotice failure={storageFailure} className="border-0 p-0" />
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-[44px]"
            onClick={onRetry}
            disabled={busy}
          >
            <RefreshCw className={`me-1.5 h-3.5 w-3.5 ${busy ?'animate-spin' : ''}`} />
            {t('syncRetryNow', { defaultValue: 'Retry' })}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
