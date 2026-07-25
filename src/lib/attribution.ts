/**
 * First-touch campaign attribution (first-party, functional storage).
 *
 * Captures utm_* + referrer + landing_path into device storage on first visit.
 * Referral `ref` and beta `invite` can backfill onto an existing first-touch record
 * (UTMs never overwritten).
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export const ATTRIBUTION_KEY = STORAGE_KEYS.attribution;

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** Mission Winning referral code from ?ref=MW-XXXXX */
  ref?: string;
  /** Beta invite code from ?invite=MW-B-XXXXX */
  invite?: string;
  referrer?: string;
  landing_path?: string;
  captured_at?: string;
};

export type CaptureAttributionResult = {
  attribution: Attribution | null;
  /** True when a new ?ref= was stored this call (first capture or ref-only backfill). */
  referralLanded: boolean;
  /** True when a new ?invite= was stored this call (first capture or invite-only backfill). */
  inviteLanded: boolean;
};

const MAX_FIELD = 200;
const MAX_REF = 500;
const MAX_REF_CODE = 32;
const MAX_INVITE_CODE = 16;

function clamp(s: string, max: number): string {
  return s.slice(0, max);
}

function parseRefParam(params: URLSearchParams): string | undefined {
  const v = params.get('ref')?.trim();
  if (!v) return undefined;
  return clamp(v, MAX_REF_CODE);
}

function parseInviteParam(params: URLSearchParams): string | undefined {
  const v = params.get('invite')?.trim();
  if (!v) return undefined;
  return clamp(v, MAX_INVITE_CODE);
}

export function loadAttribution(): Attribution | null {
  return readJson<Attribution | null>(ATTRIBUTION_KEY, null);
}

function saveAttribution(next: Attribution): void {
  writeJson(ATTRIBUTION_KEY, next);
}

/**
 * Persist first-touch UTMs once. Ref and invite can backfill later without overwriting UTMs.
 */
export function captureAttribution(
  search = typeof window !== 'undefined' ? window.location.search : '',
  opts?: { referrer?: string; path?: string }
): CaptureAttributionResult {
  if (typeof window === 'undefined') {
    return { attribution: null, referralLanded: false, inviteLanded: false };
  }

  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const refFromUrl = parseRefParam(params);
  const inviteFromUrl = parseInviteParam(params);
  const existing = loadAttribution();

  // Backfill ref/invite on existing first-touch without clobbering UTMs
  if (existing?.captured_at) {
    let updated = existing;
    let referralLanded = false;
    let inviteLanded = false;
    if (refFromUrl && !existing.ref) {
      updated = { ...updated, ref: refFromUrl };
      referralLanded = true;
    }
    if (inviteFromUrl && !existing.invite) {
      updated = { ...updated, invite: inviteFromUrl };
      inviteLanded = true;
    }
    if (referralLanded || inviteLanded) {
      saveAttribution(updated);
    }
    return { attribution: updated, referralLanded, inviteLanded };
  }

  const next: Attribution = {
    captured_at: new Date().toISOString(),
  };

  for (const key of [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ] as const) {
    const v = params.get(key);
    if (v) next[key] = clamp(v, MAX_FIELD);
  }

  if (refFromUrl) next.ref = refFromUrl;
  if (inviteFromUrl) next.invite = inviteFromUrl;

  const ref = opts?.referrer ?? (typeof document !== 'undefined' ? document.referrer : '');
  if (ref) next.referrer = clamp(ref, MAX_REF);

  const path =
    opts?.path ??
    (typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`.slice(0, MAX_REF)
      : '');
  if (path) next.landing_path = clamp(path, MAX_REF);

  saveAttribution(next);
  return {
    attribution: next,
    referralLanded: Boolean(refFromUrl),
    inviteLanded: Boolean(inviteFromUrl),
  };
}

/** Flat string map for PostHog register / lead utm field. */
export function attributionAsProps(attr: Attribution | null): Record<string, string> {
  if (!attr) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(attr)) {
    if (typeof v === 'string' && v && k !== 'captured_at') out[k] = v;
  }
  return out;
}
