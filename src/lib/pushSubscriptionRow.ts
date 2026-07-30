/**
 * The push_subscriptions row an upsert should write.
 *
 * This exists as a separate pure function for one reason: the rule it encodes is the
 * kind that gets silently un-done. The route previously wrote `last_session_at ?? null`,
 * which meant a Profile-mount sync from a device with empty local history wrote NULL
 * over a real timestamp — disarming that athlete's comeback nudge with no error and no
 * log line anywhere. A rule whose violation is invisible in production needs a test
 * that can see it, and a test cannot reach into an upsert call inside a route handler.
 *
 * The contract: **absent means "I have nothing to say about this field", never "clear
 * it".** Every optional cadence field is omitted unless the client actually sent it,
 * so a partial sync updates what it knows and leaves the rest standing.
 */

export interface SubscriptionRowInput {
  userId: string | null;
  deviceId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  lastSessionAt?: string;
  daysPerWeek?: number;
  timeZone?: string;
  lastSessionHigh?: boolean;
  /**
   * `.194` — the local hour the athlete chose for the evening review, 18–22.
   * A preference integer of the same class as `daysPerWeek`; no behavior data,
   * no review content, ever.
   *
   * `.196` — the only field where `null` and `undefined` must stay distinct.
   * `null` is the athlete turning the evening review **off**, and it has to
   * reach the column as a NULL or the notification keeps arriving after they
   * said stop. `undefined` is an unrelated sync — a Profile mount, a finished
   * session — which knows nothing about this preference and must leave it
   * standing. Collapsing the two in either direction is a real defect: one way
   * the athlete cannot turn it off, the other way any cadence sync silently
   * turns it off for them.
   */
  dayReviewHour?: number | null;
}

export type SubscriptionRow = {
  user_id: string | null;
  device_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
} & Partial<{
  last_session_at: string;
  days_per_week: number;
  time_zone: string;
  last_session_high: boolean;
  day_review_hour: number | null;
}>;

export function buildSubscriptionRow(input: SubscriptionRowInput): SubscriptionRow {
  return {
    user_id: input.userId,
    device_id: input.deviceId,
    endpoint: input.endpoint,
    p256dh: input.p256dh,
    auth: input.auth,
    ...(input.lastSessionAt !== undefined ? { last_session_at: input.lastSessionAt } : {}),
    ...(input.daysPerWeek !== undefined ? { days_per_week: input.daysPerWeek } : {}),
    ...(input.timeZone !== undefined ? { time_zone: input.timeZone } : {}),
    ...(input.lastSessionHigh !== undefined
      ? { last_session_high: input.lastSessionHigh }
      : {}),
    ...(input.dayReviewHour !== undefined ? { day_review_hour: input.dayReviewHour } : {}),
  };
}
