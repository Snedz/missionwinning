import type { LedgerRow, LedgerEvent } from './earnbackLedgerProgress.js';
import { applyLedgerEvent } from './earnbackLedgerProgress.js';
import type { RefundDecision } from './earnbackRefundRule.js';

export type LedgerKey = { userId: string; planId: string };

type LedgerEntry = {
  key: LedgerKey;
  row: LedgerRow;
};

function normalizeKey(key: LedgerKey): LedgerKey | null {
  const userId = key.userId.trim();
  const planId = key.planId.trim();

  if (!userId || !planId) {
    return null;
  }

  return { userId, planId };
}

export function createLedgerStore(): {
  get(key: LedgerKey): LedgerRow | undefined;
  upsert(key: LedgerKey, row: LedgerRow): void;
  apply(
    key: LedgerKey,
    event: LedgerEvent,
    nowMs: number
  ): { row: LedgerRow; decision: RefundDecision } | null;
  listForUser(userId: string): LedgerRow[];
  clear(): void;
} {
  const entries: LedgerEntry[] = [];

  return {
    get(key: LedgerKey): LedgerRow | undefined {
      const normalizedKey = normalizeKey(key);
      if (!normalizedKey) {
        return undefined;
      }

      const entry = entries.find(
        (e) =>
          e.key.userId === normalizedKey.userId &&
          e.key.planId === normalizedKey.planId
      );

      return entry ? { ...entry.row } : undefined;
    },

    upsert(key: LedgerKey, row: LedgerRow): void {
      const normalizedKey = normalizeKey(key);
      if (!normalizedKey) {
        return;
      }

      const existingIndex = entries.findIndex(
        (e) =>
          e.key.userId === normalizedKey.userId &&
          e.key.planId === normalizedKey.planId
      );

      const newEntry: LedgerEntry = {
        key: normalizedKey,
        row: { ...row },
      };

      if (existingIndex >= 0) {
        entries[existingIndex] = newEntry;
      } else {
        entries.push(newEntry);
      }
    },

    apply(
      key: LedgerKey,
      event: LedgerEvent,
      nowMs: number
    ): { row: LedgerRow; decision: RefundDecision } | null {
      const normalizedKey = normalizeKey(key);
      if (!normalizedKey) {
        return null;
      }

      const entryIndex = entries.findIndex(
        (e) =>
          e.key.userId === normalizedKey.userId &&
          e.key.planId === normalizedKey.planId
      );

      if (entryIndex < 0) {
        return null;
      }

      const entry = entries[entryIndex];
      const result = applyLedgerEvent(entry.row, event, nowMs);

      // Store the updated row (shallow copy)
      entries[entryIndex] = {
        key: entry.key,
        row: { ...result.row },
      };

      return { row: result.row, decision: result.decision };
    },

    listForUser(userId: string): LedgerRow[] {
      const trimmedUserId = userId.trim();
      return entries
        .filter((e) => e.key.userId === trimmedUserId)
        .map((e) => ({ ...e.row }));
    },

    clear(): void {
      entries.length = 0;
    },
  };
}
