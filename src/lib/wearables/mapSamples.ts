import type { WearableSample } from './types';

/** Map activity-kind samples into Track-friendly rows (client applies logActivity). */
export function samplesToActivityHints(samples: WearableSample[]): Array<{
  date: string;
  type: string;
  durationMin: number;
  distanceKm?: number;
  notes: string;
  externalId: string;
}> {
  const out: Array<{
    date: string;
    type: string;
    durationMin: number;
    distanceKm?: number;
    notes: string;
    externalId: string;
  }> = [];
  for (const s of samples) {
    if (s.kind !== 'activity' && s.kind !== 'workout') continue;
    const start = Date.parse(s.startedAt);
    const end = s.endedAt ? Date.parse(s.endedAt) : NaN;
    let durationMin = 1;
    if (Number.isFinite(end) && end > start) {
      durationMin = Math.max(1, Math.round((end - start) / 60_000));
    } else if (s.metrics?.moving_time_s != null) {
      durationMin = Math.max(1, Math.round(Number(s.metrics.moving_time_s) / 60));
    } else if (s.metrics?.duration_min != null) {
      durationMin = Math.max(1, Math.round(Number(s.metrics.duration_min)));
    }
    const distanceM = Number(s.metrics?.distance_m ?? 0);
    out.push({
      date: new Date(Number.isFinite(start) ? start : Date.now()).toISOString().slice(0, 10),
      type: String(s.metrics?.type ?? 'other'),
      durationMin,
      distanceKm: distanceM > 0 ? distanceM / 1000 : undefined,
      notes: String(s.metrics?.name ?? `Synced from ${s.source}`),
      externalId: s.externalId,
    });
  }
  return out;
}
