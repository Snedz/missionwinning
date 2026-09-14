import { flagBucket } from './bucket';
import { catalogEntry, FEATURE_FLAG_CATALOG } from './catalog';

export type FlagSubject = {
  userId?: string | null;
  deviceId?: string | null;
  email?: string | null;
};

export type FlagOverride = {
  percent: number;
  killed: boolean;
  allowlist: string[];
};

export type FlagDecisionReason =
  | 'unknown'
  | 'no_subject'
  | 'killed'
  | 'allowlist'
  | 'percent'
  | 'off';

export type FlagDecision = {
  on: boolean;
  bucket: number | null;
  reason: FlagDecisionReason;
};

export const MAX_ALLOWLIST = 50;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Trim + lowercase. Empty becomes null. */
export function normalizeAllowlistEntry(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (EMAIL_RE.test(value) || UUID_RE.test(value)) return value;
  return null;
}

export function parseAllowlist(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_ALLOWLIST) return null;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (typeof item !== 'string') return null;
    const entry = normalizeAllowlistEntry(item);
    if (!entry) return null;
    if (seen.has(entry)) continue;
    seen.add(entry);
    out.push(entry);
  }
  return out;
}

export function subjectId(subject: FlagSubject): string | null {
  const userId = subject.userId?.trim();
  if (userId) return userId;
  const deviceId = subject.deviceId?.trim();
  if (deviceId) return deviceId;
  return null;
}

function allowlistHit(subject: FlagSubject, allowlist: string[]): boolean {
  const email = subject.email?.trim().toLowerCase() ?? '';
  if (email && allowlist.includes(email)) return true;
  const userId = subject.userId?.trim().toLowerCase() ?? '';
  if (userId && allowlist.includes(userId)) return true;
  return false;
}

export function clampPercent(n: number): number {
  if (!Number.isInteger(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

/**
 * One flag, one subject, one decision.
 *
 * Order: unknown → false; killed → false (allowlist does not win); else
 * allowlist; else percent bucket. No subject → false, even at 100%.
 */
export function evaluateFlag(
  key: string,
  subject: FlagSubject,
  override: FlagOverride | null
): FlagDecision {
  const entry = catalogEntry(key);
  if (!entry) return { on: false, bucket: null, reason: 'unknown' };

  const killed = override?.killed === true;
  if (killed) return { on: false, bucket: null, reason: 'killed' };

  const allowlist = parseAllowlist(override?.allowlist ?? []) ?? [];
  if (allowlistHit(subject, allowlist)) {
    return { on: true, bucket: null, reason: 'allowlist' };
  }

  const sid = subjectId(subject);
  if (!sid) return { on: false, bucket: null, reason: 'no_subject' };

  const percent = clampPercent(override?.percent ?? entry.defaultPercent);
  const bucket = flagBucket(key, sid);
  if (percent <= 0) return { on: false, bucket, reason: 'off' };
  if (bucket < percent) return { on: true, bucket, reason: 'percent' };
  return { on: false, bucket, reason: 'off' };
}

export function isFlagOn(
  key: string,
  subject: FlagSubject,
  override: FlagOverride | null
): boolean {
  return evaluateFlag(key, subject, override).on;
}

export function evaluateAllFlags(
  subject: FlagSubject,
  overrides: ReadonlyMap<string, FlagOverride>
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const entry of FEATURE_FLAG_CATALOG) {
    out[entry.key] = evaluateFlag(entry.key, subject, overrides.get(entry.key) ?? null).on;
  }
  return out;
}
