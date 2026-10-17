/**
 * Web Push endpoints the server is willing to fetch.
 *
 * `webpush.sendNotification` GETs whatever URL was stored. A signed-in (or
 * anonymous) client can subscribe with any URL, so the host has to be one of
 * the push services before that fetch exists.
 */

const EXACT_HOSTS = new Set([
  'fcm.googleapis.com',
  'updates.push.services.mozilla.com',
  'web.push.apple.com',
]);

function hostnameOf(url: URL): string {
  let host = url.hostname.toLowerCase();
  if (host.endsWith('.')) host = host.slice(0, -1);
  return host;
}

function isWindowsNotifyHost(host: string): boolean {
  const suffix = '.notify.windows.com';
  return host.endsWith(suffix) && host.length > suffix.length && !host.includes('..');
}

/** https only, no userinfo, port 443, and a known push host. */
export function isAllowedPushEndpoint(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.username !== '' || url.password !== '') return false;
  if (url.port !== '' && url.port !== '443') return false;
  const host = hostnameOf(url);
  if (host.length === 0 || host.includes(':')) return false;
  if (EXACT_HOSTS.has(host)) return true;
  return isWindowsNotifyHost(host);
}
