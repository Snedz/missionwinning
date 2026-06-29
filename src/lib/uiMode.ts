export type UiMode = 'simple' | 'pro';

const STORAGE_KEY = 'mw_ui_mode';

/**
 * @deprecated Layout no longer gated by Simple/Pro — journey phase drives disclosure.
 * Kept for cloud sync compatibility; new users default to unified experience.
 */
export function loadUiMode(): UiMode {
  if (typeof window === 'undefined') return 'pro';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'simple' ? 'simple' : 'pro';
}

export function saveUiMode(mode: UiMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent('mw-ui-mode', { detail: mode }));
  void import('@/lib/journeySync').then((m) => m.scheduleJourneyPush());
}

export function isProMode(): boolean {
  return loadUiMode() === 'pro';
}
