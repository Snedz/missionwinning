import type { FitnessTestSession } from '@/lib/presidentialFitnessTest';
import { schedulePftPush } from '@/lib/pftSync';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, readRaw, remove, writeJson, writeRaw } from '@/lib/storage/safeStorage';

const STORAGE_KEY = STORAGE_KEYS.pftResults;
const YOUTH_KEY = STORAGE_KEYS.youthMode;

export function loadFitnessTestSessions(): FitnessTestSession[] {
  const parsed = readJson<FitnessTestSession[]>(STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveFitnessTestSession(session: FitnessTestSession): void {
  const existing = loadFitnessTestSessions();
  const next = [session, ...existing.filter((s) => s.id !== session.id)].slice(0, 20);
  writeJson(STORAGE_KEY, next);
  writeRaw(STORAGE_KEYS.pftLastTier, session.overallTier);
  writeRaw(STORAGE_KEYS.pftLastAt, session.completedAt);
  schedulePftPush(session);
}

export function getLatestFitnessTestSession(): FitnessTestSession | null {
  return loadFitnessTestSessions()[0] ?? null;
}

export function isYouthModeEnabled(): boolean {
  return readRaw(YOUTH_KEY) === 'true';
}

export function setYouthModeEnabled(enabled: boolean): void {
  if (enabled) writeRaw(YOUTH_KEY, 'true');
  else remove(YOUTH_KEY);
}
