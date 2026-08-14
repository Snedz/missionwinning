/**
 * Chat author label. Existing call sign, or "Athlete" if unset.
 * Does not use loadOperatorName()'s "Mission Operator" fallback.
 */

import { readRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export const UNSET_CALL_SIGN = 'Athlete';

export function readChatCallSign(): string {
  const name = readRaw(STORAGE_KEYS.operatorName)?.trim();
  return name || UNSET_CALL_SIGN;
}
