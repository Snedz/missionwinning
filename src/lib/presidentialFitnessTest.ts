import standardsDoc from '@/data/presidentialFitnessStandards.json';

export type FitnessAwardTier = 'presidential' | 'national' | 'participant' | 'below';
export type FitnessSex = 'male' | 'female';

export type FitnessEventId =
  | 'curl_ups'
  | 'push_ups'
  | 'sit_reach'
  | 'mile_run'
  | 'pull_ups';

export interface FitnessEventDefinition {
  id: FitnessEventId;
  name: string;
  unit: string;
  durationSec?: number;
  higherIsBetter: boolean;
  description: string;
}

export interface EventResultInput {
  eventId: FitnessEventId;
  value: number;
}

export interface ScoredEventResult {
  eventId: FitnessEventId;
  value: number;
  tier: FitnessAwardTier;
  eventName: string;
}

export interface FitnessTestSession {
  id: string;
  completedAt: string;
  age: number;
  sex: FitnessSex;
  ageBandId: string;
  mode: 'full' | 'mini';
  events: ScoredEventResult[];
  overallTier: FitnessAwardTier;
}

const TIER_RANK: Record<FitnessAwardTier, number> = {
  presidential: 4,
  national: 3,
  participant: 2,
  below: 1,
};

const standards = standardsDoc as {
  ageBands: { id: string; label: string; minAge: number; maxAge: number }[];
  events: FitnessEventDefinition[];
  standards: Record<
    string,
    Record<FitnessSex, Record<string, { presidential: number; national: number; participant: number }>>
  >;
  miniTestEventIds: string[];
};

export const PFT_EVENTS = standards.events as FitnessEventDefinition[];
export const PFT_AGE_BANDS = standards.ageBands;
export const PFT_MINI_EVENT_IDS = standards.miniTestEventIds as FitnessEventId[];

export function resolveAgeBand(age: number): string {
  const clamped = Math.max(6, Math.min(120, Math.floor(age)));
  const band = standards.ageBands.find((b) => clamped >= b.minAge && clamped <= b.maxAge);
  return band?.id ?? '18-39';
}

export function getEventDefinition(eventId: FitnessEventId): FitnessEventDefinition | undefined {
  return PFT_EVENTS.find((e) => e.id === eventId);
}

function tierFromThresholds(
  value: number,
  thresholds: { presidential: number; national: number; participant: number },
  higherIsBetter: boolean
): FitnessAwardTier {
  if (higherIsBetter) {
    if (value >= thresholds.presidential) return 'presidential';
    if (value >= thresholds.national) return 'national';
    if (value >= thresholds.participant) return 'participant';
    return 'below';
  }
  if (value <= thresholds.presidential) return 'presidential';
  if (value <= thresholds.national) return 'national';
  if (value <= thresholds.participant) return 'participant';
  return 'below';
}

export function scoreEvent(
  eventId: FitnessEventId,
  value: number,
  age: number,
  sex: FitnessSex
): ScoredEventResult {
  const ageBandId = resolveAgeBand(age);
  const event = getEventDefinition(eventId);
  const thresholds = standards.standards[ageBandId]?.[sex]?.[eventId];
  if (!event || !thresholds || !Number.isFinite(value)) {
    return {
      eventId,
      value,
      tier: 'below',
      eventName: event?.name ?? eventId,
    };
  }
  return {
    eventId,
    value,
    tier: tierFromThresholds(value, thresholds, event.higherIsBetter),
    eventName: event.name,
  };
}

export function lowestTier(tiers: FitnessAwardTier[]): FitnessAwardTier {
  if (tiers.length === 0) return 'below';
  return tiers.reduce((min, t) => (TIER_RANK[t] < TIER_RANK[min] ? t : min), tiers[0]);
}

export function scoreFitnessTestSession(opts: {
  age: number;
  sex: FitnessSex;
  results: EventResultInput[];
  mode?: 'full' | 'mini';
  completedAt?: string;
  id?: string;
}): FitnessTestSession {
  const scored = opts.results.map((r) => scoreEvent(r.eventId, r.value, opts.age, opts.sex));
  const overallTier = lowestTier(scored.map((s) => s.tier));
  return {
    id: opts.id ?? `pft-${Date.now()}`,
    completedAt: opts.completedAt ?? new Date().toISOString(),
    age: opts.age,
    sex: opts.sex,
    ageBandId: resolveAgeBand(opts.age),
    mode: opts.mode ?? (opts.results.length <= 2 ? 'mini' : 'full'),
    events: scored,
    overallTier,
  };
}

export function formatMileTime(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function parseMileTime(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export function awardLabel(tier: FitnessAwardTier): string {
  switch (tier) {
    case 'presidential':
      return 'Presidential';
    case 'national':
      return 'National';
    case 'participant':
      return 'Participant';
    default:
      return 'Keep training';
  }
}

export function tierToScore(tier: string): number {
  switch (tier) {
    case 'presidential':
      return 100;
    case 'national':
      return 75;
    case 'participant':
      return 50;
    default:
      return 25;
  }
}
