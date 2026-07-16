/**
 * First-touch campaign attribution (first-party, functional storage).
 *
 * Captures utm_* + referrer + landing_path into localStorage on first visit.
 * Nothing leaves the device until:
 *   - the user submits a lead (attached to /api/leads), or
 *   - product analytics is allowed (PostHog super-properties).
 *
 * This is not marketing cookies / cross-site tracking — it is session context
 * for our own conversion funnel. Independent of analytics opt-in.
 */

export const ATTRIBUTION_KEY = 'mw_attribution';

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
  captured_at?: string;
};

const MAX_FIELD = 200;
const MAX_REF = 500;

function clamp(s: string, max: number): string {
  return s.slice(0, max);
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

/**
 * Persist first-touch only. Subsequent navigations with new UTMs do not overwrite.
 * Returns the stored record (existing or newly captured).
 */
export function captureAttribution(
  search = typeof window !== 'undefined' ? window.location.search : '',
  opts?: { referrer?: string; path?: string }
): Attribution | null {
  if (typeof window === 'undefined') return null;

  const existing = loadAttribution();
  if (existing?.captured_at) return existing;

  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
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

  const ref = opts?.referrer ?? (typeof document !== 'undefined' ? document.referrer : '');
  if (ref) next.referrer = clamp(ref, MAX_REF);

  const path =
    opts?.path ??
    (typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`.slice(0, MAX_REF)
      : '');
  if (path) next.landing_path = clamp(path, MAX_REF);

  // Only persist if we captured something useful (or always stamp path for funnels).
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  return next;
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
