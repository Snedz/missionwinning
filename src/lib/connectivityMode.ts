export type ConnectivityMode = 'online' | 'offline' | 'lite';

const LITE_MODE_KEY = 'mw_lite_mode';

export function readLiteModePreference(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LITE_MODE_KEY) === '1';
}

export function setLiteModePreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LITE_MODE_KEY, enabled ? '1' : '0');
}

export function detectSaveData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}

export function resolveConnectivityMode(
  online: boolean,
  opts?: { litePreference?: boolean; saveData?: boolean }
): ConnectivityMode {
  if (!online) return 'offline';
  if (opts?.litePreference || opts?.saveData) return 'lite';
  return 'online';
}

export function connectivityBannerCopy(
  mode: ConnectivityMode,
  outboxPending = 0
): {
  message: string;
  detail?: string;
} {
  if (outboxPending > 0 && mode === 'online') {
    return {
      message: `${outboxPending} change${outboxPending === 1 ? '' : 's'} waiting to sync.`,
      detail: 'Will upload automatically when connection is stable.',
    };
  }
  switch (mode) {
    case 'offline':
      return {
        message: "You're offline — workouts, logs, and assessments still work locally.",
        detail:
          outboxPending > 0
            ? `${outboxPending} pending sync when you're back online.`
            : "Changes sync when you're back online.",
      };
    case 'lite':
      return {
        message: 'Lite mode — using less data. Cloud coach and leaderboard sync are paused.',
      };
    default:
      return { message: '' };
  }
}
