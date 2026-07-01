import type { FitnessTestSession } from '@/lib/presidentialFitnessTest';
import { schedulePftPush } from '@/lib/pftSync';

const STORAGE_KEY = 'mw_pft_results';
const YOUTH_KEY = 'mw_youth_mode';

export function loadFitnessTestSessions(): FitnessTestSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FitnessTestSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFitnessTestSession(session: FitnessTestSession): void {
  if (typeof window === 'undefined') return;
  const existing = loadFitnessTestSessions();
  const next = [session, ...existing.filter((s) => s.id !== session.id)].slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  localStorage.setItem('mw_pft_last_tier', session.overallTier);
  localStorage.setItem('mw_pft_last_at', session.completedAt);
  schedulePftPush(session);
}

export function getLatestFitnessTestSession(): FitnessTestSession | null {
  return loadFitnessTestSessions()[0] ?? null;
}

export function isYouthModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(YOUTH_KEY) === 'true';
}

export function setYouthModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (enabled) localStorage.setItem(YOUTH_KEY, 'true');
  else localStorage.removeItem(YOUTH_KEY);
}
