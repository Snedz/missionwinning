/**
 * Platform hub adapters (Apple HealthKit, Google Health Connect / Fit).
 * Web PWA cannot read hubs live — thin native shell posts samples to hub-ingest.
 * See docs/WEARABLES.md · docs/TWA_MOBILE_PLAYBOOK.md
 */
import type { WearableSample } from './types';

export type NativeHubBridgeMessage = {
  /** Capacitor / TWA bridge event name */
  type: 'mw_wearables_hub_samples';
  source: 'healthkit' | 'health_connect' | 'google_fit';
  samples: Array<{
    kind: WearableSample['kind'];
    startedAt: string;
    endedAt?: string;
    externalId: string;
    metrics?: WearableSample['metrics'];
  }>;
};

/** Validate and normalize samples from the native shell. */
export function normalizeHubSamples(
  source: 'healthkit' | 'health_connect' | 'google_fit',
  raw: unknown
): WearableSample[] {
  if (!Array.isArray(raw)) return [];
  const out: WearableSample[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const kind = o.kind;
    const startedAt = o.startedAt ?? o.started_at;
    const externalId = o.externalId ?? o.external_id;
    if (typeof kind !== 'string' || typeof startedAt !== 'string' || typeof externalId !== 'string') {
      continue;
    }
    if (!['workout', 'activity', 'sleep', 'hr', 'hrv', 'steps', 'recovery'].includes(kind)) {
      continue;
    }
    out.push({
      source,
      kind: kind as WearableSample['kind'],
      startedAt,
      endedAt: typeof o.endedAt === 'string' ? o.endedAt : typeof o.ended_at === 'string' ? o.ended_at : undefined,
      externalId: String(externalId).startsWith(`${source}:`)
        ? String(externalId)
        : `${source}:${externalId}`,
      metrics:
        o.metrics && typeof o.metrics === 'object'
          ? (o.metrics as WearableSample['metrics'])
          : undefined,
    });
  }
  return out;
}

export const HUB_PROVIDER_META = [
  {
    id: 'healthkit' as const,
    label: 'Apple Health',
    status: 'requires_ios_shell',
    note: 'HealthKit read via Capacitor after thin iOS shell. Apple Watch included.',
  },
  {
    id: 'health_connect' as const,
    label: 'Google Health Connect',
    status: 'requires_android_shell',
    note: 'Primary Google/Android path after TWA or Capacitor.',
  },
  {
    id: 'google_fit' as const,
    label: 'Google Fit',
    status: 'legacy_fallback',
    note: 'Prefer Health Connect; Fit REST only if web-only users need it.',
  },
] as const;
