'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BetaFunnelAggregate } from '@/types/betaMetrics';

type InviteRow = {
  id: string;
  code: string;
  label: string;
  email: string | null;
  created_at: string;
  first_landed_at: string | null;
  signed_up_user_id: string | null;
  day2_sent_at: string | null;
  day7_sent_at: string | null;
  link?: string;
  iDayDone: boolean;
  btSessions: number;
  firstWorkout: boolean;
};

type InviteFunnelClient = {
  rows: InviteRow[];
  totals: {
    issued: number;
    landed: number;
    signedUp: number;
    iDayDone: number;
    withWorkout: number;
    target: number;
  };
};

interface Props {
  enabled: boolean;
}

export function BetaAdminPanel({ enabled }: Props) {
  const [metrics, setMetrics] = useState<BetaFunnelAggregate | null>(null);
  const [invites, setInvites] = useState<InviteFunnelClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('');
  const [email, setEmail] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [issueMsg, setIssueMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, invitesRes] = await Promise.all([
        fetch('/api/beta/metrics', { credentials: 'include' }),
        fetch('/api/beta/invites', { credentials: 'include' }),
      ]);
      if (metricsRes.status === 403) {
        setMetrics(null);
        setInvites(null);
        return;
      }
      const metricsData = await metricsRes.json();
      if (!metricsRes.ok) throw new Error(metricsData.error || 'Could not load metrics');
      setMetrics(metricsData);

      if (invitesRes.ok) {
        setInvites((await invitesRes.json()) as InviteFunnelClient);
      } else if (invitesRes.status !== 403) {
        // Soft-fail invites if table missing pre-migration
        setInvites(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  const issueInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setIssuing(true);
    setIssueMsg(null);
    try {
      const res = await fetch('/api/beta/invites', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Issue failed');
      setIssueMsg(`Issued ${data.code}`);
      setLabel('');
      setEmail('');
      if (data.link) {
        try {
          await navigator.clipboard.writeText(data.link);
          setCopiedId(data.id);
        } catch {
          /* clipboard may be blocked */
        }
      }
      void load();
    } catch (err: unknown) {
      setIssueMsg(err instanceof Error ? err.message : 'Issue failed');
    } finally {
      setIssuing(false);
    }
  };

  const copyLink = async (row: InviteRow) => {
    try {
      const link =
        row.link ||
        `${typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com'}/?invite=${encodeURIComponent(row.code)}`;
      await navigator.clipboard.writeText(link);
      setCopiedId(row.id);
    } catch {
      setCopiedId(null);
    }
  };

  if (!enabled) return null;
  if (!loading && !metrics && !error) return null;

  const gateTarget = invites?.totals.target ?? 10;
  const signedUp = invites?.totals.signedUp ?? 0;

  return (
    <div className="space-y-4">
      <Card className="border-[color:var(--status-warning-border)] bg-[color:var(--status-warning-bg)]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>Beta funnel (all users)</span>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="text-xs font-normal text-primary hover:underline disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {error && <p className="text-destructive text-xs">{error}</p>}
          {metrics && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Total profiles" value={String(metrics.totalProfiles)} />
                <Stat label="Last 14 days" value={String(metrics.signedUpLast14Days)} />
                <Stat label="I-Day complete" value={`${metrics.iDayCompletionPct}%`} />
                <Stat label="BT 5/5 complete" value={`${metrics.basicCompletePct}%`} />
                <Stat label="Commissioned" value={`${metrics.commissionedPct}%`} />
                <Stat label="Phase events" value={String(metrics.phaseTransitionCount)} />
              </div>
              <div className="text-xs text-muted-foreground">
                Phases: I-Day {metrics.phaseCounts['i-day']} · Basic {metrics.phaseCounts.basic} ·
                Readiness {metrics.phaseCounts.readiness} · Commissioned{' '}
                {metrics.phaseCounts.commissioned}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed rounded-lg border border-border/40 p-2">
                <span className="font-medium text-foreground">Client I-Day steps</span> (PostHog,
                after allow): <code className="text-[10px]">iday_started</code> →{' '}
                <code className="text-[10px]">iday_mission_accepted</code> →{' '}
                <code className="text-[10px]">iday_profile_completed</code> →{' '}
                <code className="text-[10px]">iday_completed</code> →{' '}
                <code className="text-[10px]">first_workout_completed</code>
              </p>
              {metrics.leadSourceTop && metrics.leadSourceTop.length > 0 ? (
                <div className="rounded-lg border border-border/50 p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-foreground">
                    Lead sources ({metrics.leadTotal ?? 0} rows, top {metrics.leadSourceTop.length})
                  </div>
                  <ul className="space-y-1 font-mono text-muted-foreground">
                    {metrics.leadSourceTop.map((row) => (
                      <li key={row.source} className="flex justify-between gap-2">
                        <span className="truncate">{row.source}</span>
                        <span className="tabular-nums text-foreground">{row.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div
                className={`rounded-lg border p-3 text-xs ${
                  metrics.launchReady
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-[color:var(--status-warning-border)] bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning-fg)]'
                }`}
              >
                <div className="font-semibold mb-1">
                  {metrics.launchReady
                    ? 'Launch gate: READY (consider PRIVATE_MODE=false after final PROTECTION pass)'
                    : 'Launch gate: not ready'}
                </div>
                {metrics.launchNotes.length === 0 ? (
                  <p>All beta targets met.</p>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    {metrics.launchNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
          <p className="text-[10px] text-muted-foreground">
            Requires <code className="text-[10px]">BETA_ADMIN_EMAILS</code> +{' '}
            <code className="text-[10px]">SUPABASE_SERVICE_ROLE_KEY</code> in Vercel.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Invites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat
              label="Signed up / target"
              value={`${signedUp} / ${gateTarget}`}
            />
            <Stat label="Landed" value={String(invites?.totals.landed ?? 0)} />
            <Stat label="Issued" value={String(invites?.totals.issued ?? 0)} />
            <Stat label="I-Day done" value={String(invites?.totals.iDayDone ?? 0)} />
            <Stat label="With workout" value={String(invites?.totals.withWorkout ?? 0)} />
          </div>
          {signedUp < gateTarget ? (
            <p className="text-xs text-[color:var(--status-warning-fg)]">
              Need ≥{gateTarget} signed-up invitees to unlock flip gates (I-Day ≥80% / BT ≥60%).
            </p>
          ) : (
            <p className="text-xs text-primary">≥{gateTarget} signed-up via invites — headcount met.</p>
          )}

          <form onSubmit={(e) => void issueInvite(e)} className="space-y-2 rounded-lg border border-border/50 p-3">
            <div className="text-xs font-semibold text-foreground">Issue invite</div>
            <label className="block text-xs text-muted-foreground">
              Label (invitee name)
              <input
                type="text"
                value={label}
                onChange={(ev) => setLabel(ev.target.value)}
                maxLength={120}
                required
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                placeholder="Alex"
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Email (optional — enables day-2/7 follow-ups)
              <input
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                maxLength={320}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                placeholder="alex@example.com"
              />
            </label>
            <button
              type="submit"
              disabled={issuing || !label.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {issuing ? 'Issuing…' : 'Issue + copy link'}
            </button>
            {issueMsg ? <p className="text-[11px] text-muted-foreground">{issueMsg}</p> : null}
          </form>

          {invites && invites.rows.length > 0 ? (
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {invites.rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border border-border/50 p-2.5 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-foreground">{row.label}</span>
                      <span className="ml-2 font-mono text-muted-foreground">{row.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyLink(row)}
                      className="shrink-0 text-primary hover:underline"
                    >
                      {copiedId === row.id ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Chip ok={Boolean(row.first_landed_at)} label="Landed" />
                    <Chip ok={Boolean(row.signed_up_user_id)} label="Signed up" />
                    <Chip ok={row.iDayDone} label="I-Day" />
                    <Chip ok={row.firstWorkout} label="Workout" />
                    {row.day2_sent_at ? <Chip ok label="Day-2 sent" /> : null}
                    {row.day7_sent_at ? <Chip ok label="Day-7 sent" /> : null}
                  </div>
                  {row.email ? (
                    <div className="text-muted-foreground truncate">{row.email}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              No invites yet. Issue one above (requires migration <code>20260721_beta_invites</code>
              ).
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Chip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
        ok
          ? 'bg-primary/15 text-primary border border-primary/30'
          : 'bg-muted text-muted-foreground border border-border/50'
      }`}
    >
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold font-mono">{value}</div>
    </div>
  );
}
