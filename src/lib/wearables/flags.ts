/**
 * Wearables feature flags — opt-in via NEXT_PUBLIC_WEARABLES=true.
 * See docs/WEARABLES.md · docs/ENV.md
 */
import type { WearableOAuthProviderId, WearableProviderId } from './types';
import { isSurfaceEnabled } from '@/lib/surface';

export function isWearablesPubliclyEnabled(): boolean {
  // Parking the surface wins over the legacy provider flag, so there is one
  // switch to reason about (src/lib/surface.ts).
  return isSurfaceEnabled('wearables') && process.env.NEXT_PUBLIC_WEARABLES === 'true';
}

/** Server: master flag (same public env; no secrets required to show UI). */
export function isWearablesEnabled(): boolean {
  return isWearablesPubliclyEnabled();
}

const OAUTH_ENV: Record<
  WearableOAuthProviderId,
  { id: string; secret: string }
> = {
  whoop: { id: 'WHOOP_CLIENT_ID', secret: 'WHOOP_CLIENT_SECRET' },
  strava: { id: 'STRAVA_CLIENT_ID', secret: 'STRAVA_CLIENT_SECRET' },
  oura: { id: 'OURA_CLIENT_ID', secret: 'OURA_CLIENT_SECRET' },
  garmin: { id: 'GARMIN_CLIENT_ID', secret: 'GARMIN_CLIENT_SECRET' },
  fitbit: { id: 'FITBIT_CLIENT_ID', secret: 'FITBIT_CLIENT_SECRET' },
  polar: { id: 'POLAR_CLIENT_ID', secret: 'POLAR_CLIENT_SECRET' },
};

export function getOAuthCredentials(
  provider: WearableOAuthProviderId
): { clientId: string; clientSecret: string } | null {
  const keys = OAUTH_ENV[provider];
  const clientId = process.env[keys.id]?.trim();
  const clientSecret = process.env[keys.secret]?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isOAuthProviderConfigured(provider: WearableOAuthProviderId): boolean {
  return isWearablesEnabled() && Boolean(getOAuthCredentials(provider));
}

export function listConfiguredOAuthProviders(): WearableOAuthProviderId[] {
  return (Object.keys(OAUTH_ENV) as WearableOAuthProviderId[]).filter(isOAuthProviderConfigured);
}

export function isHubProvider(id: WearableProviderId): boolean {
  return id === 'healthkit' || id === 'health_connect' || id === 'google_fit';
}
