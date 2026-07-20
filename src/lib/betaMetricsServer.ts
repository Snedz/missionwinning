import 'server-only';
import type { JourneyBasicMilestones, JourneyPhase, JourneyState } from '@/lib/missionJourney';
import type { BetaFunnelAggregate } from '@/types/betaMetrics';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type { BetaFunnelAggregate };

function allBasicDone(b: JourneyBasicMilestones): boolean {
  return b.workout && b.fuel && b.move && b.mind && b.learn;
}

function emptyPhaseCounts(): Record<JourneyPhase, number> {
  return { 'i-day': 0, basic: 0, readiness: 0, commissioned: 0 };
}

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

  const phaseCounts = emptyPhaseCounts();
  let iDayComplete = 0;
  let basicComplete = 0;
  let commissioned = 0;
  const cutoff = Date.now() - 14 * 86400000;
  let signedUpLast14Days = 0;

  for (const row of profiles ?? []) {
    if (row.created_at && new Date(row.created_at).getTime() >= cutoff) {
      signedUpLast14Days++;
    }

    const js = row.journey_state as JourneyState | null;
    if (!js?.phase) continue;

    phaseCounts[js.phase] = (phaseCounts[js.phase] ?? 0) + 1;

    if (js.iDay?.completedAt) iDayComplete++;
    if (js.basic && allBasicDone(js.basic)) basicComplete++;
    if (js.commissionedAt || js.phase === 'commissioned') commissioned++;
  }

  const totalProfiles = profiles?.length ?? 0;
  const pct = (n: number) => (totalProfiles ? Math.round((n / totalProfiles) * 100) : 0);

  const { count: journeyEventCount } = await admin
    .from('journey_events')
    .select('*', { count: 'exact', head: true });

  const { count: phaseTransitionCount } = await admin
    .from('journey_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_name', 'journey_phase_complete');

  const targets = {
    iDayPct: 80,
    basicPct: 40,
    commissionedPct: 25,
    launchBasicPct: 60,
  };

  const iDayCompletionPct = pct(iDayComplete);
  const basicCompletePct = pct(basicComplete);
  const commissionedPct = pct(commissioned);

  const launchNotes: string[] = [];
  if (totalProfiles < 10) launchNotes.push(`Need ≥10 beta users (currently ${totalProfiles}).`);
  if (iDayCompletionPct < targets.iDayPct) {
    launchNotes.push(`I-Day completion ${iDayCompletionPct}% — target ≥${targets.iDayPct}%.`);
  }
  if (basicCompletePct < targets.launchBasicPct) {
    launchNotes.push(`Basic Training complete ${basicCompletePct}% — launch gate ≥${targets.launchBasicPct}%.`);
  }
  if (commissionedPct < targets.commissionedPct) {
    launchNotes.push(`Commissioned ${commissionedPct}% — target ≥${targets.commissionedPct}% in 14 days.`);
  }

  const launchReady =
    totalProfiles >= 10 &&
    iDayCompletionPct >= targets.iDayPct &&
    basicCompletePct >= targets.launchBasicPct;

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
    totalProfiles,
    signedUpLast14Days,
    iDayComplete,
    iDayCompletionPct,
    basicComplete,
    basicCompletePct,
    commissioned,
    commissionedPct,
    phaseCounts,
    journeyEventCount: journeyEventCount ?? 0,
    phaseTransitionCount: phaseTransitionCount ?? 0,
    targets,
    launchReady,
    launchNotes,
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

function buildInviteShareLink(inviteCode: string): string {
  const access =
    process.env.PRIVATE_ACCESS_SECRET?.trim() ||
    process.env.PRIVATE_ACCESS_CODES?.split(',')[0]?.trim() ||
    '';
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://www.missionwinning.com';
  const base = raw.replace(/\/$/, '');
  const params = new URLSearchParams();
  if (access) params.set('access', access);
  params.set('invite', inviteCode);
  return `${base}/?${params.toString()}`;
}

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

    const totals = {
      issued: rows.length,
      landed: rows.filter((r) => r.first_landed_at).length,
      signedUp: rows.filter((r) => r.signed_up_user_id).length,
      iDayDone: rows.filter((r) => r.iDayDone).length,
      withWorkout: rows.filter((r) => r.firstWorkout).length,
      target: 10,
    };

    return { rows, totals };
  } catch (e) {
    console.error('computeInviteFunnel', e);
    return null;
  }
}
