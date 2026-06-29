export type UiMode = 'simple' | 'pro';

const STORAGE_KEY = 'mw_ui_mode';

/** Simple = one CTA + 5 tabs (default). Pro = full dashboard + More tools. */
export function loadUiMode(): UiMode {
  if (typeof window === 'undefined') return 'simple';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'pro' ? 'pro' : 'simple';
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
