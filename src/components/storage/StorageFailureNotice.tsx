'use client';

/**
 * Says out loud that this device is not saving.
 *
 * ## Why this exists
 *
 * `safeStorage` has reported failures to the UI since it was written, and the copy
 * for it has existed since too — "This device is out of storage space", "this
 * browser won't let us save to the device". It was rendered in exactly one place:
 * `SyncStatusRow`, which lives on `/account`.
 *
 * `/account` is not where the loss happens. An athlete fills a disk, or opens the
 * app in Safari private browsing, and logs a full session on Train. The memory
 * fallback keeps the tab working, so every tap looks like it landed. Nothing on
 * `/active` said otherwise. On reload the session is gone, and the one warning
 * that would have prevented it was on a page they had to go and find — afterwards.
 *
 * The failure mode is silent loss of the thing the product sells ("Log a set.
 * Offline.", no account, on this device), so it belongs on the screen where the
 * athlete is trusting the device to remember.
 *
 * ## Why the hook is separate from the component
 *
 * The first draft had the component subscribe and tell its parent it was visible,
 * via `onVisibilityChange`. That deadlocks in the one place that needs it:
 * `SyncStatusRow` returns `null` when it has nothing to say, so it cannot render
 * the component that would have told it there *was* something to say. The warning
 * on `/account` would have gone silently missing — the exact regression this
 * change was made to remove.
 *
 * So the subscription is a hook the parent owns, and the component is
 * presentational. The parent decides whether it has something to say; this only
 * decides what that looks like.
 *
 * ## Why it is quiet otherwise
 *
 * The hook returns `null` unless storage is genuinely not persisting, so both call
 * sites cost a subscription and nothing else on the normal path. It deliberately
 * does not escalate into a toast per failed write: `safeStorage` reports quota
 * once per session precisely because a full disk should not spam, and a banner
 * that appears and disappears on every set is a banner that stops being read.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudOff } from 'lucide-react';
import { isPersistent, onStorageFailure, type StorageFailure } from '@/lib/storage/safeStorage';

/**
 * The current storage failure, or `null` while the device is saving normally.
 *
 * Callers own this so they can decide whether to render their own container —
 * see the note above on why the component does not subscribe on its own.
 */
export function useStorageFailure(): StorageFailure | null {
  const [failure, setFailure] = useState<StorageFailure | null>(null);

  useEffect(() => {
    const unsub = onStorageFailure(setFailure);
    // Covers storage that was refused before this component ever mounted — the
    // private-browsing case, where nothing will ever fire a failure event.
    if (!isPersistent()) {
      setFailure({ reason: 'denied', key: '', usingMemoryFallback: true });
    }
    return unsub;
  }, []);

  return failure;
}

/**
 * Which message this failure gets.
 *
 * Extracted so it can be tested without a renderer, and because it is the part with
 * a contract: the two messages must not be interchangeable, and neither may promise
 * a persistence the memory fallback cannot deliver.
 */
export function storageFailureCopy(reason: StorageFailure['reason']): {
  key: string;
  fallback: string;
} {
  if (reason === 'quota') {
    return {
      key: 'syncStorageFull',
      fallback:
        'This device is out of storage space. Export a backup, then clear some space so new sessions save.',
    };
  }
  if (reason === 'denied') {
    return {
      key: 'syncStorageDenied',
      fallback:
        "This browser won't let us save to the device — private browsing does this. Your session works, but it won't be here next time.",
    };
  }
  /*
   * Its own line rather than falling through to `denied`. An unclassified failure is
   * not evidence of private browsing, and telling the user to go change that
   * setting sends them off to fix the wrong thing while the session stays at risk.
   */
  return {
    key: 'syncStorageUnknown',
    fallback:
      "This device isn't saving right now, so this session may not be here next time. Export a backup before you close the app.",
  };
}

export function StorageFailureNotice({
  failure,
  className = '',
}: {
  /** From `useStorageFailure()`. Rendering with `null` would be a caller bug. */
  failure: StorageFailure;
  className?: string;
}) {
  const { t } = useTranslation();
  const copy = storageFailureCopy(failure.reason);

  return (
    <div className={className} data-testid="storage-failure-notice" role="status">
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <CloudOff className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          {t(copy.key, {
            defaultValue: copy.fallback,
          })}
        </span>
      </p>
    </div>
  );
}