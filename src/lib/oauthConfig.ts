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

export function getEnabledOAuthProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = [];
  if (isGoogleOAuthEnabled()) providers.push('google');
  if (isAppleOAuthEnabled()) providers.push('apple');
  return providers;
}
