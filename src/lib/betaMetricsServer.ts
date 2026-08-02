import 'server-only';
import type { JourneyState } from '@/lib/missionJourney';
/*
 * `.223` — imported, not redefined. This file carried its own `allBasicDone`
 * requiring all five pillars while the client had narrowed to `b.workout`, and it
 * is this copy that computes the launch gate. See `journey/basicComplete.ts`.
 *
 * `.224` — and the arithmetic that turns that predicate into `launchReady` now
 * lives in `beta/funnelAggregate.ts` for the same reason one step on: this
 * function reaches Supabase on its first line, so the gate itself had never been
 * executed by a test.
 */
import { aggregateBetaFunnel, type BetaProfileRow } from '@/lib/beta/funnelAggregate';
import { buildInviteShareLink, inviteTotals } from '@/lib/beta/inviteShareLink';
import type { BetaFunnelAggregate } from '@/types/betaMetrics';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type { BetaFunnelAggregate };

/** Aggregate journey funnel across all profiles (service role). */
export async function computeBetaFunnelAggregate(): Promise<BetaFunnelAggregate | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: profiles, error } = await admin
    .from('profiles')
    .select('journey_state, created_at');

  if (error) {
    console.error('computeBetaFunnelAggregate profiles', error);
    return null;
  }

  // The maths lives in `beta/funnelAggregate.ts` so the launch gate can be
  // asserted without a service-role client. `.224`.
  const funnel = aggregateBetaFunnel(profiles as BetaProfileRow[] | null);

  const { count: journeyEventCount } = await admin
    .from('journey_events')
    .select('*', { count: 'exact', head: true });

  const { count: phaseTransitionCount } = await admin
    .from('journey_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_name', 'journey_phase_complete');

  // Waitlist / lead source breakdown (package_interest) — best-effort.
  let leadSourceTop: Array<{ source: string; count: number }> = [];
  let leadTotal = 0;
  try {
    const { data: leadRows, error: leadErr } = await admin
      .from('leads')
      .select('package_interest')
      .limit(2000);
    if (!leadErr && leadRows) {
      leadTotal = leadRows.length;
      const counts = new Map<string, number>();
      for (const row of leadRows) {
        const src = String(row.package_interest || 'general').slice(0, 80);
        counts.set(src, (counts.get(src) ?? 0) + 1);
      }
      leadSourceTop = [...counts.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
    }
  } catch {
    /* column missing pre-migration or table empty — non-fatal */
  }

  return {
    ...funnel,
    journeyEventCount: journeyEventCount ?? 0,
    phaseTransitionCount: phaseTransitionCount ?? 0,
    leadSourceTop,
    leadTotal,
  };
}

export function isBetaAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.BETA_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export type Week4Retention = {
  cohort_eligible: number;
  week4_retained: number;
};

/** Null-safe if migration / RPC missing. */
export async function computeWeek4Retention(): Promise<Week4Retention | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  try {
    const { data, error } = await admin.rpc('mw_week4_retention');
    if (error || !data) return null;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return {
      cohort_eligible: Number(row.cohort_eligible) || 0,
      week4_retained: Number(row.week4_retained) || 0,
    };
  } catch {
    return null;
  }
}

export type ReferralStats = {
  attributedTotal: number;
  topCodes: Array<{ code: string; count: number }>;
};

export async function computeReferralStats(): Promise<ReferralStats | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  try {
    const { data, error } = await admin
      .from('profiles')
      .select('referred_by')
      .not('referred_by', 'is', null)
      .limit(5000);
    if (error) return null;
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const code = String(row.referred_by || '');
      if (!code) continue;
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    const topCodes = [...counts.entries()]
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return {
      attributedTotal: data?.length ?? 0,
      topCodes,
    };
  } catch {
    return null;
  }
}

export type InviteFunnelRow = {
  id: string;
  code: string;
  label: string;
  email: string | null;
  created_at: string;
  first_landed_at: string | null;
  signed_up_user_id: string | null;
  day2_sent_at: string | null;
  day7_sent_at: string | null;
  notes: string | null;
  /** Full share link with access + invite (access from env, never stored in DB). */
  link: string;
  /** Invitee profile journey (when signed up). */
  iDayDone: boolean;
  btSessions: number;
  firstWorkout: boolean;
};

export type InviteFunnel = {
  rows: InviteFunnelRow[];
  totals: {
    issued: number;
    landed: number;
    signedUp: number;
    iDayDone: number;
    withWorkout: number;
    target: number;
  };
};

/** Per-invite funnel for BetaAdminPanel Invites card. */
export async function computeInviteFunnel(): Promise<InviteFunnel | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  try {
    const { data: invites, error } = await admin
      .from('beta_invites')
      .select(
        'id, code, label, email, created_at, first_landed_at, signed_up_user_id, day2_sent_at, day7_sent_at, notes'
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('computeInviteFunnel invites', error);
      return null;
    }

    const userIds = (invites ?? [])
      .map((r) => r.signed_up_user_id as string | null)
      .filter((id): id is string => Boolean(id));

    const journeyByUser = new Map<
      string,
      { iDayDone: boolean; btSessions: number; firstWorkout: boolean }
    >();

    if (userIds.length) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, journey_state')
        .in('id', userIds);

      for (const p of profiles ?? []) {
        const js = p.journey_state as JourneyState | null;
        const basic = js?.basic;
        const btSessions = basic
          ? [basic.workout, basic.fuel, basic.move, basic.mind, basic.learn].filter(Boolean)
              .length
          : 0;
        journeyByUser.set(p.id as string, {
          iDayDone: Boolean(js?.iDay?.completedAt),
          btSessions,
          firstWorkout: Boolean(basic?.workout),
        });
      }
    }

    const rows: InviteFunnelRow[] = (invites ?? []).map((r) => {
      const j = r.signed_up_user_id
        ? journeyByUser.get(r.signed_up_user_id as string)
        : undefined;
      const code = r.code as string;
      return {
        id: r.id as string,
        code,
        label: r.label as string,
        email: (r.email as string | null) ?? null,
        created_at: r.created_at as string,
        first_landed_at: (r.first_landed_at as string | null) ?? null,
        signed_up_user_id: (r.signed_up_user_id as string | null) ?? null,
        day2_sent_at: (r.day2_sent_at as string | null) ?? null,
        day7_sent_at: (r.day7_sent_at as string | null) ?? null,
        notes: (r.notes as string | null) ?? null,
        link: buildInviteShareLink(code),
        iDayDone: j?.iDayDone ?? false,
        btSessions: j?.btSessions ?? 0,
        firstWorkout: j?.firstWorkout ?? false,
      };
    });

    const totals = inviteTotals(rows);

    return { rows, totals };
  } catch (e) {
    console.error('computeInviteFunnel', e);
    return null;
  }
}
