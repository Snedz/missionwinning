/**
 * Today Summary pins — 0–4, default one. Start stays the docked red field.
 */

export const SUMMARY_PIN_MAX = 4;

export type SummaryPinKind = 'start' | 'last' | 'resume';

export type SummaryPin = {
  id: string;
  kind: SummaryPinKind;
  sessionName: string | null;
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
