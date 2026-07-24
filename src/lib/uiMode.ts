import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export type UiMode = 'simple' | 'pro';

const STORAGE_KEY = STORAGE_KEYS.uiMode;

/**
 * @deprecated Layout no longer gated by Simple/Pro — journey phase drives disclosure.
 * Kept for cloud sync compatibility; new users default to unified experience.
 */
export function loadUiMode(): UiMode {
  return readRaw(STORAGE_KEY) === 'simple' ? 'simple' : 'pro';
}

export function saveUiMode(mode: UiMode): void {
  if (typeof window === 'undefined') return;
  writeRaw(STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent('mw-ui-mode', { detail: mode }));
  void import('@/lib/journeySync').then((m) => m.scheduleJourneyPush());
}

export function isProMode(): boolean {
  return loadUiMode() === 'pro';
}
