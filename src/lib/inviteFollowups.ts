/**
 * Pure selectors for beta invite day-2 / day-7 follow-ups (unit-testable).
 * Used by cron/nudges — not server-only so tests can import.
 */

export type InviteFollowupRow = {
  id: string;
  label: string;
  email: string | null;
  created_at: string;
  signed_up_user_id: string | null;
  day2_sent_at: string | null;
  day7_sent_at: string | null;
  /** From profile journey when signed up */
  firstWorkout?: boolean;
};

export type InviteFollowupCandidate = {
  id: string;
  email: string;
  label: string;
  kind: 'day2' | 'day7';
};

const DAY_MS = 86400000;

/**
 * Day-2: created ≥2d ago, no signup, day2 not sent, has email.
 * Day-7: signed up, no first workout, day7 not sent, has email.
 * (Day-7 "created ≥7d" is not required by plan — signup + no workout is enough;
 *  we still require invite created ≥2d so brand-new issue doesn't email immediately.)
 */
export function selectInviteFollowupCandidates(
  rows: InviteFollowupRow[],
  nowMs = Date.now()
): InviteFollowupCandidate[] {
  const out: InviteFollowupCandidate[] = [];
  for (const r of rows) {
    const email = r.email?.trim().toLowerCase();
    if (!email) continue;
    const created = Date.parse(r.created_at);
    if (!Number.isFinite(created)) continue;
    const age = nowMs - created;

    if (
      !r.signed_up_user_id &&
      !r.day2_sent_at &&
      age >= 2 * DAY_MS
    ) {
      out.push({ id: r.id, email, label: r.label, kind: 'day2' });
      continue;
    }

    if (
      r.signed_up_user_id &&
      !r.firstWorkout &&
      !r.day7_sent_at &&
      age >= 2 * DAY_MS
    ) {
      out.push({ id: r.id, email, label: r.label, kind: 'day7' });
    }
  }
  return out;
}

export function day2Body(label: string, site: string): { subject: string; text: string } {
  const name = label.trim() || 'there';
  return {
    subject: 'Quick check-in — Mission Winning beta',
    text: `Hey ${name} — did you get a workout logged in Mission Winning?

What almost stopped you (confusing screen, too many steps, something else)?

Open: ${site}/?invite= (use the link we sent, or sign in at ${site})

— Mission Winning team`,
  };
}

export function day7Body(label: string, site: string): { subject: string; text: string } {
  const name = label.trim() || 'there';
  return {
    subject: 'Still with us? — Mission Winning beta',
    text: `Quick check-in, ${name}: are you still opening the app this week?

One thing you'd change about the first 3 minutes?

${site}/log

— Mission Winning team`,
  };
}
