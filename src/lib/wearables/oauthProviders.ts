import type { WearableOAuthAdapter, OAuthTokenSet } from './adapter';
import type { WearableOAuthProviderId, WearableSample } from './types';

async function postForm(
  url: string,
  body: Record<string, string>,
  headers?: Record<string, string>
): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      ...headers,
    },
    body: new URLSearchParams(body).toString(),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      typeof json.error === 'string'
        ? json.error
        : typeof json.message === 'string'
          ? json.message
          : `token_exchange_${res.status}`
    );
  }
  return json;
}

function tokensFromJson(json: Record<string, unknown>): OAuthTokenSet {
  const accessToken = String(json.access_token ?? '');
  if (!accessToken) throw new Error('missing_access_token');
  const expiresIn = Number(json.expires_in);
  return {
    accessToken,
    refreshToken: json.refresh_token != null ? String(json.refresh_token) : null,
    expiresAt:
      Number.isFinite(expiresIn) && expiresIn > 0
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : null,
    scopes: json.scope != null ? String(json.scope) : null,
  };
}

/** Generic OAuth2 code exchange — most fitness vendors. */
function makeCodeAdapter(opts: {
  id: WearableOAuthProviderId;
  label: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string;
  extraAuthParams?: Record<string, string>;
  syncSince: WearableOAuthAdapter['syncSince'];
}): WearableOAuthAdapter {
  return {
    id: opts.id,
    label: opts.label,
    buildAuthorizeUrl: ({ clientId, redirectUri, state }) => {
      const u = new URL(opts.authorizeUrl);
      u.searchParams.set('client_id', clientId);
      u.searchParams.set('redirect_uri', redirectUri);
      u.searchParams.set('response_type', 'code');
      u.searchParams.set('scope', opts.scopes);
      u.searchParams.set('state', state);
      for (const [k, v] of Object.entries(opts.extraAuthParams ?? {})) {
        u.searchParams.set(k, v);
      }
      return u.toString();
    },
    exchangeCode: async ({ clientId, clientSecret, code, redirectUri }) => {
      const json = await postForm(opts.tokenUrl, {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      });
      return tokensFromJson(json);
    },
    refresh: async ({ clientId, clientSecret, refreshToken }) => {
      const json = await postForm(opts.tokenUrl, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      });
      return tokensFromJson(json);
    },
    syncSince: opts.syncSince,
  };
}

/** Stub sync until vendor credentials + production API mapping are live. */
async function emptySync(_args: {
  accessToken: string;
  sinceIso: string;
}): Promise<WearableSample[]> {
  return [];
}

/**
 * Whoop — recovery/strain/sleep. Sync maps filled when API credentials are live.
 * Docs: developer.whoop.com
 */
export const whoopAdapter = makeCodeAdapter({
  id: 'whoop',
  label: 'Whoop',
  authorizeUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
  tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
  scopes: 'read:recovery read:cycles read:sleep read:profile read:body_measurement',
  syncSince: emptySync,
});

/** Map a raw Strava activity JSON object → WearableSample (unit-tested). */
export function mapStravaActivity(a: Record<string, unknown>): {
  source: 'strava';
  kind: 'activity';
  startedAt: string;
  endedAt: string;
  externalId: string;
  metrics: {
    distance_m: number;
    moving_time_s: number;
    type: string;
    name: string;
  };
} {
  const id = String(a.id ?? '');
  const start = String(a.start_date ?? a.start_date_local ?? new Date().toISOString());
  const moving = Number(a.moving_time ?? a.elapsed_time ?? 0);
  const startMs = Date.parse(start);
  const end = new Date(
    (Number.isFinite(startMs) ? startMs : Date.now()) + Math.max(0, moving) * 1000
  ).toISOString();
  return {
    source: 'strava',
    kind: 'activity',
    startedAt: start,
    endedAt: end,
    externalId: `strava:${id}`,
    metrics: {
      distance_m: Number(a.distance ?? 0),
      moving_time_s: moving,
      type: String(a.type ?? a.sport_type ?? 'other'),
      name: String(a.name ?? ''),
    },
  };
}

/** Strava — activities for Track. Scopes: activity:read (own activities). */
export const stravaAdapter = makeCodeAdapter({
  id: 'strava',
  label: 'Strava',
  authorizeUrl: 'https://www.strava.com/oauth/authorize',
  tokenUrl: 'https://www.strava.com/oauth/token',
  scopes: 'activity:read',
  extraAuthParams: { approval_prompt: 'auto' },
  syncSince: async ({ accessToken, sinceIso }) => {
    const after = Math.floor(new Date(sinceIso).getTime() / 1000);
    const url = new URL('https://www.strava.com/api/v3/athlete/activities');
    url.searchParams.set('after', String(Number.isFinite(after) ? after : 0));
    url.searchParams.set('per_page', '50');
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return [];
    const list = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(list)) return [];
    return list.map(mapStravaActivity);
  },
});

export const ouraAdapter = makeCodeAdapter({
  id: 'oura',
  label: 'a ring tracker',
  authorizeUrl: 'https://cloud.ouraring.com/oauth/authorize',
  tokenUrl: 'https://api.ouraring.com/oauth/token',
  scopes: 'email personal daily',
  syncSince: emptySync,
});

export const garminAdapter = makeCodeAdapter({
  id: 'garmin',
  label: 'Garmin',
  authorizeUrl: 'https://connect.garmin.com/oauthConfirm',
  tokenUrl: 'https://connectapi.garmin.com/di-oauth2-service/oauth/token',
  scopes: 'activity_import',
  syncSince: emptySync,
});

export const fitbitAdapter = makeCodeAdapter({
  id: 'fitbit',
  label: 'Fitbit',
  authorizeUrl: 'https://www.fitbit.com/oauth2/authorize',
  tokenUrl: 'https://api.fitbit.com/oauth2/token',
  scopes: 'activity heartrate sleep',
  extraAuthParams: { expires_in: '604800' },
  syncSince: emptySync,
});

export const polarAdapter = makeCodeAdapter({
  id: 'polar',
  label: 'Polar',
  authorizeUrl: 'https://flow.polar.com/oauth2/authorization',
  tokenUrl: 'https://polarremote.com/v2/oauth2/token',
  scopes: 'accesslink.read_all',
  syncSince: emptySync,
});

const ADAPTERS: Record<WearableOAuthProviderId, WearableOAuthAdapter> = {
  whoop: whoopAdapter,
  strava: stravaAdapter,
  oura: ouraAdapter,
  garmin: garminAdapter,
  fitbit: fitbitAdapter,
  polar: polarAdapter,
};

export function getOAuthAdapter(id: WearableOAuthProviderId): WearableOAuthAdapter {
  return ADAPTERS[id];
}

export function isOAuthProviderId(id: string): id is WearableOAuthProviderId {
  return id in ADAPTERS;
}
