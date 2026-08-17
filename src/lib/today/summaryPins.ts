/**
 * Today Summary pins — 0–4, default one. Start stays the docked red field.
 * Extra rooms (Fuel, Coach) are optional pins, not tabs.
 */

import { COACH_LIVE_HREF } from '@/lib/speech/coachVoiceSession';

export const SUMMARY_PIN_MAX = 4;

export const SUMMARY_PIN_CATALOG = ['session', 'fuel', 'coach'] as const;
export type SummaryPinId = (typeof SUMMARY_PIN_CATALOG)[number];

export const DEFAULT_SUMMARY_PIN_IDS: readonly SummaryPinId[] = ['session'];

export type SummaryPinKind = 'start' | 'last' | 'resume' | 'fuel' | 'coach';

export type SummaryPin = {
  id: string;
  kind: SummaryPinKind;
  sessionName: string | null;
  href?: string;
};

export function defaultSummaryPins(input: {
  lastSessionName: string | null;
  hasActiveWorkout: boolean;
}): SummaryPin[] {
  const name = input.lastSessionName?.trim() || null;
  if (input.hasActiveWorkout) {
    return [{ id: 'start', kind: 'resume', sessionName: name }];
  }
  if (name) {
    return [{ id: 'start', kind: 'last', sessionName: name }];
  }
  return [{ id: 'start', kind: 'start', sessionName: null }];
}

export function clampSummaryPins(pins: SummaryPin[]): SummaryPin[] {
  return pins.slice(0, SUMMARY_PIN_MAX);
}

const CATALOG = new Set<string>(SUMMARY_PIN_CATALOG);

export function parseSummaryPinIds(raw: string | null): SummaryPinId[] {
  if (raw == null) return [...DEFAULT_SUMMARY_PIN_IDS];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [...DEFAULT_SUMMARY_PIN_IDS];
  }
  if (!Array.isArray(parsed)) return [...DEFAULT_SUMMARY_PIN_IDS];
  const seen = new Set<SummaryPinId>();
  const out: SummaryPinId[] = [];
  for (const item of parsed) {
    if (typeof item !== 'string' || !CATALOG.has(item)) continue;
    const id = item as SummaryPinId;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= SUMMARY_PIN_MAX) break;
  }
  return out;
}

export function toggleSummaryPinId(
  ids: readonly SummaryPinId[],
  id: SummaryPinId
): SummaryPinId[] {
  if (ids.includes(id)) return ids.filter((x) => x !== id);
  if (ids.length >= SUMMARY_PIN_MAX) return [...ids];
  return [...ids, id];
}

export function resolveSummaryPins(input: {
  ids: readonly SummaryPinId[];
  lastSessionName: string | null;
  hasActiveWorkout: boolean;
}): SummaryPin[] {
  const out: SummaryPin[] = [];
  for (const id of input.ids) {
    if (id === 'session') {
      out.push(
        ...defaultSummaryPins({
          lastSessionName: input.lastSessionName,
          hasActiveWorkout: input.hasActiveWorkout,
        })
      );
    } else if (id === 'fuel') {
      out.push({ id: 'fuel', kind: 'fuel', sessionName: null, href: '/nutrition' });
    } else if (id === 'coach') {
      out.push({ id: 'coach', kind: 'coach', sessionName: null, href: COACH_LIVE_HREF });
    }
  }
  return clampSummaryPins(out);
}
