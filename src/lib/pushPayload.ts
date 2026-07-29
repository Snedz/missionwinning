/** Pure push helpers (unit-testable; no server-only). */

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  /**
   * Notification tag. Same tag replaces, different tags coexist. Every message used
   * to share the service worker's hardcoded `mw-nudge`, so an evening wind-down would
   * have silently replaced a comeback the athlete had not opened yet.
   */
  tag?: string;
};

export function buildPushNotificationJson(payload: PushPayload): string {
  return JSON.stringify({
    title: payload.title,
    body: payload.body,
    data: { tag: payload.tag, url: payload.url },
  });
}

/** Stale Web Push endpoints — subscription should be deleted. */
export function isStalePushStatus(statusCode: number | undefined): boolean {
  return statusCode === 404 || statusCode === 410;
}
