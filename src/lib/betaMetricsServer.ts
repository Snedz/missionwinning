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
