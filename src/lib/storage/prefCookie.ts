/**
 * First-party preference cookies (strictly necessary — locale / country).
 * Not localStorage; not analytics. SameSite=Lax, 1 year, Secure on https.
 */

export const LOCALE_COOKIE = 'mw_locale';
export const COUNTRY_COOKIE = 'mw_country';

const MAX_AGE_SEC = 60 * 60 * 24 * 365;

function cookieSecure(): string {
  try {
    if (typeof location !== 'undefined' && location.protocol === 'https:') return '; Secure';
  } catch {
    /* non-browser */
  }
  return '';
}

export function readPrefCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const parts = document.cookie.split(';');
    const prefix = `${name}=`;
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.slice(prefix.length));
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function writePrefCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${cookieSecure()}`;
  } catch {
    /* private mode / cookie blocked */
  }
}
