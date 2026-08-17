/** Normalized wearable ingest types — see docs/WEARABLES.md */

export type WearableSampleKind =
  | 'workout'
  | 'activity'
  | 'sleep'
  | 'hr'
  | 'hrv'
  | 'steps'
  | 'recovery';

export type WearableOAuthProviderId =
  | 'whoop'
  | 'strava'
  | 'oura'
  | 'garmin'
  | 'fitbit'
  | 'polar';

export type WearableHubProviderId = 'healthkit' | 'health_connect' | 'google_fit';

export type WearableProviderId =
  | WearableOAuthProviderId
  | WearableHubProviderId
  | 'manual'
  | 'ble_hr';

export type WearableSample = {
  source: WearableProviderId;
  kind: WearableSampleKind;
  startedAt: string;
  endedAt?: string;
  externalId: string;
  metrics?: Record<string, number | string | boolean | null>;
  rawSummary?: string;
};

export type WearableConnectionStatus = {
  provider: WearableProviderId;
  label: string;
  category: 'oauth' | 'hub' | 'session';
  configured: boolean;
  connected: boolean;
  lastSyncAt: string | null;
  status: string;
};

export const OAUTH_PROVIDER_ORDER: WearableOAuthProviderId[] = [
  'whoop',
  'strava',
  'oura',
  'garmin',
  'fitbit',
  'polar',
];

export const PROVIDER_LABELS: Record<WearableProviderId, string> = {
  whoop: 'Whoop',
  strava: 'Strava',
  oura: 'a ring tracker',
  garmin: 'Garmin',
  fitbit: 'Fitbit',
  polar: 'Polar',
  healthkit: 'Apple Health',
  health_connect: 'Google Health Connect',
  google_fit: 'Google Fit',
  manual: 'Manual import',
  ble_hr: 'Bluetooth heart rate',
};
