'use client';

/**
 * Device-local "I've seen this, stop showing it" state.
 *
 * Two shells were about to grow the same four-line `useState` + `useEffect` pair
 * to read one dismissal key, which is precisely the drift
 * `todayGuidanceMount.ts` exists to prevent — and the reason its own guard
 * asserts that both shells ask the *shared* rule rather than re-deriving it.
 *
 * A dismissal is a reading position, not data: it stays on the device and never
 * syncs, the same call `feedbackUnread.ts` makes.
 *
 * **Reads after mount, not during render.** The first paint has to match the
 * server's, so a dismissed card appears for one frame and then retracts; the
 * alternative is a hydration mismatch on the app's most-visited screen. Callers
 * that must not flash should gate on `ready`.
 */

import { useCallback, useEffect, useState } from 'react';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export interface Dismissal {
  dismissed: boolean;
  /** False until the device has been read — distinguishes "not dismissed" from "not yet known". */
  ready: boolean;
  dismiss: () => void;
}

export function useDismissed(key: string): Dismissal {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDismissed(readRaw(key) === '1');
    setReady(true);
  }, [key]);

  const dismiss = useCallback(() => {
    writeRaw(key, '1');
    setDismissed(true);
  }, [key]);

  return { dismissed, ready, dismiss };
}
