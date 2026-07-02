'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ACTIVITY_LABELS,
  type ActivityType,
  deleteActivity,
  getActivitiesForWeek,
  getWeeklyStats,
  logActivity,
} from '@/lib/activityLog';
import type { PremiumTrackProgram, TrackProgramSession } from '@/data/premiumTrackProgramData';
import { logPillarWin } from '@/lib/pillarLog';
import { ActivityImportPanel } from '@/components/track/ActivityImportPanel';
import { usePremium } from '@/hooks/usePremium';
import { PREMIUM_TRACK_PROGRAM_COUNT } from '@/lib/trackPremiumMeta';
import { MapPin, Trash2 } from 'lucide-react';

export function TrackPage() {
  const { t } = useTranslation();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumPrograms, setPremiumPrograms] = useState<PremiumTrackProgram[]>([]);
  const [type, setType] = useState<ActivityType>('walk');
  const [durationMin, setDurationMin] = useState(30);
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');
  const [refresh, setRefresh] = useState(0);

  const weekActivities = typeof window !== 'undefined' ? getActivitiesForWeek() : [];
  const stats = typeof window !== 'undefined'
    ? getWeeklyStats()
    : { count: 0, totalMin: 0, totalKm: 0, byType: {} };

  useEffect(() => {
    if (!premium) {
      setPremiumPrograms([]);
      return;
    }
    fetch('/api/premium/track-programs', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { programs: [] }))
      .then((data) => setPremiumPrograms(data.programs ?? []))
      .catch(() => setPremiumPrograms([]));
  }, [premium]);

  const logSession = (session: TrackProgramSession, programName?: string) => {
    const today = new Date().toISOString().split('T')[0];
    logActivity({
      date: today,
      type: session.type,
      durationMin: session.durationMin,
      distanceKm: session.distanceKm,
      notes: session.notes?.trim() || undefined,
    });
    logPillarWin('track', session.title, {
      durationMin: session.durationMin,
      distanceKm: session.distanceKm ?? 0,
      ...(programName ? { program: programName } : {}),
    });
    setRefresh((r) => r + 1);
  };

  const handleLog = () => {
    if (durationMin < 1) return;
    logSession({
      title: `${ACTIVITY_LABELS[type]} ${durationMin}min`,
      type,
      durationMin,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      notes: notes.trim() || undefined,
    });
    setNotes('');
    setDistanceKm('');
  };

  const handleDelete = (id: string) => {
    deleteActivity(id);
    setRefresh((r) => r + 1);
  };

  void refresh;

  const paceEntries = weekActivities.filter((a) => a.distanceKm && a.distanceKm > 0);
  const avgPaceMinKm =
    paceEntries.length > 0
      ? paceEntries.reduce((s, a) => s + a.durationMin / (a.distanceKm ?? 1), 0) / paceEntries.length
      : null;

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem index={0}>
        <PillarPageHeader
          icon={MapPin}
          title={t('trackTitle', { defaultValue: 'Track Activity' })}
          subtitle={t('trackSubtitle', {
            defaultValue:
              'Free manual activity log — walk, run, bike, hike. Premium adds structured programs and pace insights (Super Bundle).',
          })}
        />
      </StaggerItem>

      <StaggerItem index={1}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="content-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('trackWeekSessions', { defaultValue: 'This Week' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">
                {stats.count} {t('sessions', { defaultValue: 'sessions' }).toLowerCase()}
              </div>
            </CardContent>
          </Card>
          <Card className="content-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('trackTotalTime', { defaultValue: 'Total Time' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stats.totalMin} min</div>
            </CardContent>
          </Card>
          <Card className="content-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('trackDistance', { defaultValue: 'Distance' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stats.totalKm.toFixed(1)} km</div>
              {premium && avgPaceMinKm != null && (
                <p className="text-xs text-emerald-400 mt-1">
                  {t('trackAvgPace', {
                    pace: avgPaceMinKm.toFixed(1),
                    defaultValue: `Avg pace ${avgPaceMinKm.toFixed(1)} min/km (logged distance)`,
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      <StaggerItem index={2}>
        <Card className="content-card">
          <CardHeader>
            <CardTitle>{t('trackLogTitle', { defaultValue: 'Log Activity' })}</CardTitle>
            <CardDescription>
              {t('trackLogDesc', { defaultValue: 'No GPS needed — manual entry works offline anywhere.' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('trackTypeLabel', { defaultValue: 'Type' })}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((act) => (
                  <Button
                    key={act}
                    size="sm"
                    variant={type === act ? 'default' : 'outline'}
                    onClick={() => setType(act)}
                  >
                    {ACTIVITY_LABELS[act]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('trackDurationLabel', { defaultValue: 'Duration (minutes)' })}</Label>
                <Input
                  type="number"
                  min={1}
                  value={durationMin}
                  onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>{t('trackDistanceLabel', { defaultValue: 'Distance km (optional)' })}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 5.2"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>{t('trackNotesLabel', { defaultValue: 'Notes (optional)' })}</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('trackNotesPlaceholder', {
                  defaultValue: 'Morning park loop, felt great',
                })}
              />
            </div>
            <Button variant="fitness" onClick={handleLog}>
              {t('trackLogBtn', { defaultValue: 'Log Activity' })}
            </Button>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem index={3}>
        <ActivityImportPanel onImported={() => setRefresh((r) => r + 1)} />
      </StaggerItem>

      <StaggerItem index={4}>
        <Card className="content-card">
          <CardHeader>
            <CardTitle>{t('trackWeekLogTitle', { defaultValue: "This Week's Log" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {weekActivities.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title={t('trackEmptyTitle', { defaultValue: 'No activities this week' })}
                description={t('trackEmptyWeek', {
                  defaultValue: 'No activities yet this week. Log a walk or run above.',
                })}
                actionLabel={t('trackLogBtn', { defaultValue: 'Log Activity' })}
                onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            ) : (
              <ul className="space-y-2">
                {weekActivities.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between text-sm border-b border-border/50 pb-2"
                  >
                    <div>
                      <span className="font-medium">{ACTIVITY_LABELS[a.type]}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        · {a.date} · {a.durationMin} min
                      </span>
                      {a.distanceKm != null && (
                        <span className="text-muted-foreground"> · {a.distanceKm} km</span>
                      )}
                      {a.notes && <div className="text-xs text-muted-foreground">{a.notes}</div>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem index={5}>
        {premium && !premiumLoading && premiumPrograms.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('trackProgramsPremium', { defaultValue: 'Premium activity programs (Super Bundle)' })}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {premiumPrograms.map((program) => (
                <Card key={program.id} className="content-card border-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="text-base">{program.name}</CardTitle>
                    <CardDescription>{program.subtitle}</CardDescription>
                    <p className="text-xs text-muted-foreground">{program.focus}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {program.sessions.map((session) => (
                      <div
                        key={`${program.id}-${session.title}`}
                        className="flex items-center justify-between gap-2 text-sm border border-border/40 rounded-lg p-3"
                      >
                        <div>
                          <div className="font-medium">{session.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {ACTIVITY_LABELS[session.type]} · {session.durationMin} min
                            {session.distanceKm != null ? ` · ${session.distanceKm} km` : ''}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="fitness"
                          onClick={() => logSession(session, program.name)}
                        >
                          {t('trackLogSession', { defaultValue: 'Log' })}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="content-card border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-base">
                {t('trackPremiumLockedTitle', {
                  count: PREMIUM_TRACK_PROGRAM_COUNT,
                  defaultValue: `+${PREMIUM_TRACK_PROGRAM_COUNT} Premium Programs`,
                })}
              </CardTitle>
              <CardDescription>
                {t('trackPremiumLockedBody', {
                  defaultValue:
                    'Unlock structured walk/run/hike programs, pace insights, and MapMy-style depth via the Super Bundle.',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="fitness" onClick={() => { window.location.href = '/bundle'; }}>
                {t('trackExploreBundle', { defaultValue: 'Explore Super Bundle' })}
              </Button>
            </CardContent>
          </Card>
        )}
      </StaggerItem>
    </StaggerGroup>
  );
}
