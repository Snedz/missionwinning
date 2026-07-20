import type { OAuthProvider } from '@/lib/supabase';

/** Google OAuth button — on by default when Supabase is configured. Set to "false" to hide. */
export function isGoogleOAuthEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_OAUTH_GOOGLE === 'false') return false;
  return true;
}

/**
 * Apple OAuth button — off by default.
 * Enable only after Apple Services ID (Client ID), Team ID, Key ID, and secret key
 * are saved in Supabase → Authentication → Apple.
 */
export function isAppleOAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_OAUTH_APPLE === 'true';
}

/**
 * Microsoft (Azure) OAuth button — off by default.
 * Enable only after Entra app Client ID/Secret are saved in Supabase → Authentication → Azure.
 */
export function isAzureOAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_OAUTH_AZURE === 'true';
}

/**
 * Facebook OAuth button — off by default.
 * Enable only after Meta App ID/Secret are saved in Supabase → Authentication → Facebook.
 */
export function isFacebookOAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_OAUTH_FACEBOOK === 'true';
}

export function getEnabledOAuthProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = [];
  if (isAppleOAuthEnabled()) providers.push('apple');
  if (isGoogleOAuthEnabled()) providers.push('google');
  if (isAzureOAuthEnabled()) providers.push('azure');
  if (isFacebookOAuthEnabled()) providers.push('facebook');
  return providers;
}

const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  apple: 'Apple',
  google: 'Google',
  azure: 'Microsoft',
  facebook: 'Facebook',
};

/** Human-readable list of enabled OAuth providers for UI copy. */
export function formatEnabledOAuthLabels(providers: OAuthProvider[]): string {
  const labels = providers.map((p) => PROVIDER_LABELS[p]);
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`;
}

/** Map Supabase OAuth errors to a clearer in-app message. */
export function formatOAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes('provider is not enabled') ||
    lower.includes('unsupported provider') ||
    (lower.includes('validation_failed') && lower.includes('provider'))
  ) {
    return 'This sign-in option isn’t available yet. Try email or another provider.';
  }
  return raw;
}
