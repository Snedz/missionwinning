/** Pure push helpers (unit-testable; no server-only). */

export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

export function buildPushNotificationJson(payload: PushPayload): string {
  return JSON.stringify({
    title: payload.title,
    body: payload.body,
    data: { url: payload.url },
  });
}

/** Stale Web Push endpoints — subscription should be deleted. */
export function isStalePushStatus(statusCode: number | undefined): boolean {
  return statusCode === 404 || statusCode === 410;
}
