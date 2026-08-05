'use client';
/**
 * Page: /track — activity/GPS pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScoreNumeral } from '@/components/ui/ScoreNumeral';
import {
  ACTIVITY_LABELS,
  type ActivityType,
  deleteActivity,
  getActivitiesForWeek,
  getWeeklyStats,
  logActivity,
} from '@/lib/activityLog';
import { isGpsActivity } from '@/lib/trackGps';
import { logPillarWin } from '@/lib/pillarLog';
import { TrackGpsPanel } from '@/components/track/TrackGpsPanel';
import { TrendAskCard } from '@/components/track/TrendAskCard';
import { useWorkoutStore } from '@/store/workoutStore';
import { TrackWeeklyInsights } from '@/components/track/TrackWeeklyInsights';
import { ActivityImportPanel } from '@/components/track/ActivityImportPanel';
import { ProfileWearablesCard } from '@/components/profile/ProfileWearablesCard';
import { BodyMetricsCard } from '@/components/track/BodyMetricsCard';
import { ProgressPhotosCard } from '@/components/track/ProgressPhotosCard';
import { usePremium } from '@/hooks/usePremium';
import { MapPin, Trash2 } from 'lucide-react';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { isFreeBeta } from '@/lib/freeBeta';
import { localDateKey } from '@/lib/time/localDate';

export function TrackPage() {
  const { t } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const { premium } = usePremium();
  const [type, setType] = useState<ActivityType>('walk');
  const [durationMin, setDurationMin] = useState(30);
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void import('@/lib/supabase').then(({ supabase }) => {
      void supabase.auth.getSession().then(({ data }) => {
        if (!cancelled) setSignedIn(Boolean(data.session?.user));
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const weekActivities = typeof window !== 'undefined' ? getActivitiesForWeek() : [];
  const stats = typeof window !== 'undefined'
    ? getWeeklyStats()
    : { count: 0, totalMin: 0, totalKm: 0, byType: {} };

  const handleLog = () => {
    if (durationMin < 1) return;
    const today = localDateKey();
    logActivity({
      date: today,
      type,
      durationMin,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      notes: notes.trim() || undefined,
    });
    logPillarWin('track', `${ACTIVITY_LABELS[type]} ${durationMin}min`, {
      durationMin,
      distanceKm: distanceKm || 0,
    });
    setNotes('');
    setDistanceKm('');
    setRefresh((r) => r + 1);
  };

  const handleDelete = (id: string) => {
    deleteActivity(id);
    setRefresh((r) => r + 1);
  };

  void refresh;

  return (
    <PillarPageShell
      icon={MapPin}
      eyebrow={t('trackEyebrow', { defaultValue: 'Track' })}
      title={t('trackTitle', { defaultValue: 'Activity' })}
      subtitle={t('trackSubtitle', {
        defaultValue: isFreeBeta()
          ? 'Log walks, runs, and rides — simple weekly totals.'
          : 'Log walks, runs, and rides. Super Bundle can add GPS depth when paid depth is on.',
      })}
    >
        {/*
         * One stat band on a 2px rule — the recut the card ladder was written
         * for (`card-section`: "the default once a screen is recut"). Three
         * boxed cards said three topics; one ruled band says one fact with
         * three numbers, and `ScoreNumeral` is the system's numeral, not a
         * hand-rolled text-2xl.
         */}
        <section className="card-section">
          <div className="grid grid-cols-3 gap-4">
            <ScoreNumeral
              size="md"
              label={t('trackWeekSessions', { defaultValue: 'This Week' })}
              value={stats.count}
              caption={t('sessions', { defaultValue: 'sessions' }).toLowerCase()}
            />
            <ScoreNumeral
              size="md"
              label={t('trackTotalTime', { defaultValue: 'Total Time' })}
              value={stats.totalMin}
              caption="min"
            />
            <ScoreNumeral
              size="md"
              label={t('trackDistance', { defaultValue: 'Distance' })}
              value={stats.totalKm.toFixed(1)}
              caption="km"
            />
          </div>
        </section>

        <TrackGpsPanel onLogged={() => setRefresh((r) => r + 1)} />

        <TrackWeeklyInsights locked={!premium} key={refresh} />

      <Card className="card-elevated">
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
                    variant={type === act ? 'selected' : 'outline'}
                    onClick={() => setType(act)}
                  >
                    {ACTIVITY_LABELS[act]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="track-duration">
                  {t('trackDurationLabel', { defaultValue: 'Duration (minutes)' })}
                </Label>
                <Input
                  id="track-duration"
                  type="number"
                  min={1}
                  value={durationMin}
                  onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="track-distance">
                  {t('trackDistanceLabel', { defaultValue: 'Distance km (optional)' })}
                </Label>
                <Input
                  id="track-distance"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 5.2"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="track-notes">
                {t('trackNotesLabel', { defaultValue: 'Notes (optional)' })}
              </Label>
              <Input
                id="track-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('trackNotesPlaceholder', {
                  defaultValue: 'Morning park loop, felt great',
                })}
              />
            </div>
            <Button variant="default" onClick={handleLog}>
              {t('trackLogBtn', { defaultValue: 'Log Activity' })}
            </Button>
          </CardContent>
        </Card>

        <ActivityImportPanel onImported={() => setRefresh((r) => r + 1)} />

        {/* Flag-gated: NEXT_PUBLIC_WEARABLES — Strava connect/sync/disconnect */}
        <ProfileWearablesCard signedIn={signedIn} />

        <TrendAskCard history={workoutHistory} />
        <BodyMetricsCard refreshKey={refresh} onChanged={() => setRefresh((r) => r + 1)} />
        <ProgressPhotosCard />

      <section className="card-section space-y-3">
          <h2 className="text-lg font-semibold">
            {t('trackWeekLogTitle', { defaultValue: "This Week's Log" })}
          </h2>
          <div>
            {weekActivities.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title={t('trackEmptyTitle', { defaultValue: 'No activities this week' })}
                description={t('trackEmptyWeek', {
                  defaultValue:
                    'Optional this week: log a walk or run above. Core mission is Train + Fuel — Track adds when you are ready.',
                })}
                actionLabel={t('trackLogBtn', { defaultValue: 'Log Activity' })}
                onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            ) : (
              <ul className="space-y-2">
                {weekActivities.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between text-sm border-b-2 border-border pb-2"
                  >
                    <div>
                      <span className="font-semibold">{ACTIVITY_LABELS[a.type]}</span>
                      {isGpsActivity(a.notes) && (
                        <span className="ms-1.5 text-[10px] uppercase tracking-wide text-primary font-semibold">
                          GPS
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {' '}
                        · {a.date} · {a.durationMin} min
                      </span>
                      {a.distanceKm != null && (
                        <span className="text-muted-foreground"> · {a.distanceKm} km</span>
                      )}
                      {a.notes && <div className="text-xs text-muted-foreground">{a.notes}</div>}
                    </div>
                    <HoldToConfirmButton
                      size="sm"
                      className="h-9 w-9"
                      label={t('trackDeleteActivity', { defaultValue: 'Delete activity' })}
                      icon={<Trash2 className="h-4 w-4" />}
                      onConfirm={() => handleDelete(a.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
    </PillarPageShell>
  );
}
