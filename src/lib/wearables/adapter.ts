import type { WearableOAuthProviderId, WearableSample } from './types';

export type OAuthTokenSet = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
  scopes?: string | null;
  accountLabel?: string | null;
};

export type WearableOAuthAdapter = {
  id: WearableOAuthProviderId;
  label: string;
  /** Authorization URL path builder */
  buildAuthorizeUrl: (args: {
    clientId: string;
    redirectUri: string;
    state: string;
  }) => string;
  /** Exchange code for tokens */
  exchangeCode: (args: {
    clientId: string;
    clientSecret: string;
    code: string;
    redirectUri: string;
  }) => Promise<OAuthTokenSet>;
  refresh?: (args: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }) => Promise<OAuthTokenSet>;
  /** Pull samples since ISO timestamp (inclusive). */
  syncSince: (args: {
    accessToken: string;
    sinceIso: string;
  }) => Promise<WearableSample[]>;
};

export type HubIngestPayload = {
  source: 'healthkit' | 'health_connect' | 'google_fit';
  samples: WearableSample[];
};
