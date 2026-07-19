/**
 * First-touch campaign attribution (first-party, functional storage).
 *
 * Captures utm_* + referrer + landing_path into localStorage on first visit.
 * Referral `ref` can backfill onto an existing first-touch record (UTMs never overwritten).
 */

export const ATTRIBUTION_KEY = 'mw_attribution';

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** Mission Winning referral code from ?ref=MW-XXXXX */
  ref?: string;
  referrer?: string;
  landing_path?: string;
  captured_at?: string;
};

export type CaptureAttributionResult = {
  attribution: Attribution | null;
  /** True when a new ?ref= was stored this call (first capture or ref-only backfill). */
  referralLanded: boolean;
};

const MAX_FIELD = 200;
const MAX_REF = 500;
const MAX_REF_CODE = 32;

function clamp(s: string, max: number): string {
  return s.slice(0, max);
}

function parseRefParam(params: URLSearchParams): string | undefined {
  const v = params.get('ref')?.trim();
  if (!v) return undefined;
  return clamp(v, MAX_REF_CODE);
}

export function loadAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

function saveAttribution(next: Attribution): void {
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

/**
 * Persist first-touch UTMs once. Ref can backfill later without overwriting UTMs.
 */
export function captureAttribution(
  search = typeof window !== 'undefined' ? window.location.search : '',
  opts?: { referrer?: string; path?: string }
): CaptureAttributionResult {
  if (typeof window === 'undefined') {
    return { attribution: null, referralLanded: false };
  }

  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const refFromUrl = parseRefParam(params);
  const existing = loadAttribution();

  // Ref-only backfill on existing first-touch
  if (existing?.captured_at) {
    if (refFromUrl && !existing.ref) {
      const updated = { ...existing, ref: refFromUrl };
      saveAttribution(updated);
      return { attribution: updated, referralLanded: true };
    }
    return { attribution: existing, referralLanded: false };
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

  const ref = opts?.referrer ?? (typeof document !== 'undefined' ? document.referrer : '');
  if (ref) next.referrer = clamp(ref, MAX_REF);

  const path =
    opts?.path ??
    (typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`.slice(0, MAX_REF)
      : '');
  if (path) next.landing_path = clamp(path, MAX_REF);

  saveAttribution(next);
  return { attribution: next, referralLanded: Boolean(refFromUrl) };
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
