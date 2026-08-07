/**
 * First-touch campaign attribution (first-party, consent-aware).
 *
 * ePrivacy Art. 5(3) governs *storage on the device*, not transmission — so the
 * split is by necessity, not by field type: referral `ref` / beta `invite` codes
 * are persisted unconditionally (honoring the link the user clicked is strictly
 * necessary), while marketing fields (utm_*, referrer, landing_path) reach
 * device storage only when the caller says analytics are allowed. Until then
 * they live in module memory for this page load and are written by
 * `flushPendingAttribution()` if the user allows in-session — or dropped.
 * First-touch rule unchanged: stored UTMs are never overwritten.
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

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/** Marketing fields captured this page load but not yet allowed into storage. */
let pendingMarketing: Attribution | null = null;

/**
 * Persist first-touch UTMs once. Ref and invite can backfill later without overwriting UTMs.
 *
 * `persistMarketing` must be true for utm fields, referrer and landing_path to
 * touch device storage — pass the analytics-consent state. Ref/invite persist
 * either way.
 */
export function captureAttribution(
  search = typeof window !== 'undefined' ? window.location.search : '',
  opts?: { referrer?: string; path?: string; persistMarketing?: boolean }
): CaptureAttributionResult {
  if (typeof window === 'undefined') {
    return { attribution: null, referralLanded: false, inviteLanded: false };
  }

  const persistMarketing = opts?.persistMarketing === true;
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

  const marketing: Attribution = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) marketing[key] = clamp(v, MAX_FIELD);
  }
  const ref = opts?.referrer ?? (typeof document !== 'undefined' ? document.referrer : '');
  if (ref) marketing.referrer = clamp(ref, MAX_REF);
  const path =
    opts?.path ?? `${window.location.pathname}${window.location.search}`.slice(0, MAX_REF);
  if (path) marketing.landing_path = clamp(path, MAX_REF);

  if (persistMarketing) {
    const next: Attribution = { captured_at: new Date().toISOString(), ...marketing };
    if (refFromUrl) next.ref = refFromUrl;
    if (inviteFromUrl) next.invite = inviteFromUrl;
    saveAttribution(next);
    return {
      attribution: next,
      referralLanded: Boolean(refFromUrl),
      inviteLanded: Boolean(inviteFromUrl),
    };
  }

  // No consent: storage gets only what honoring the link requires.
  if (!pendingMarketing && Object.keys(marketing).length > 0) {
    pendingMarketing = marketing;
  }
  let stored: Attribution | null = null;
  if (refFromUrl || inviteFromUrl) {
    stored = { captured_at: new Date().toISOString() };
    if (refFromUrl) stored.ref = refFromUrl;
    if (inviteFromUrl) stored.invite = inviteFromUrl;
    saveAttribution(stored);
  }
  const merged: Attribution = { ...(pendingMarketing ?? {}), ...(stored ?? {}) };
  return {
    attribution: Object.keys(merged).length > 0 ? merged : null,
    referralLanded: Boolean(refFromUrl),
    inviteLanded: Boolean(inviteFromUrl),
  };
}

/**
 * The user allowed analytics: marketing fields held this page load may now be
 * stored. Stored values always win — first-touch is never overwritten.
 */
export function flushPendingAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  const pending = pendingMarketing;
  if (!pending) return loadAttribution();
  const existing = loadAttribution();
  const next: Attribution = existing?.captured_at
    ? { ...pending, ...existing }
    : { captured_at: new Date().toISOString(), ...pending, ...(existing ?? {}) };
  saveAttribution(next);
  pendingMarketing = null;
  return next;
}

/** The user opted out: drop marketing fields that were waiting on consent. */
export function discardPendingAttribution(): void {
  pendingMarketing = null;
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
