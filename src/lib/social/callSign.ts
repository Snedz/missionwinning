/**
 * Chat author label + optional Mission ID.
 * Does not use loadOperatorName()'s "Mission Operator" fallback.
 */

import { readJson, readRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import {
  clampCallSignNumber,
  formatCallSignNumber,
} from '../../../packages/mw-core/src/identity/athleteCard';

export const UNSET_CALL_SIGN = 'Athlete';

export function readChatCallSign(): string {
  const name = readRaw(STORAGE_KEYS.operatorName)?.trim();
  return name || UNSET_CALL_SIGN;
}

/** Zero-padded `00`–`99` when the Athlete Card number is set; otherwise null. */
export function readChatMissionId(): string | null {
  const card = readJson<{ callSignNumber?: unknown }>(STORAGE_KEYS.athleteCard, null);
  const n = clampCallSignNumber(card?.callSignNumber);
  return n == null ? null : formatCallSignNumber(n);
}
