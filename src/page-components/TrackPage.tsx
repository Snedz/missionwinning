'use client';
/**
 * Page: /track — Quiet Track (weight / tape). Activity & GPS in Show more.
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
import {
  ACTIVITY_LABELS,
  type ActivityType,
  deleteActivity,
  getActivitiesForWeek,
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
import { usePremium } from '@/hooks/usePremium';
import { Scale, Trash2 } from 'lucide-react';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
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
      className="house-track"
      icon={Scale}
      eyebrow={t('trackEyebrow', { defaultValue: 'Track' })}
      title={t('trackTitle', { defaultValue: 'Track' })}
      subtitle={t('trackSubtitleBrief', {
        defaultValue: 'A number you already have. Scale or tape. Never required to train.',
      })}
    >
      {/*
       * Quiet Track first paint is the scale / tape log.
       * Walks, GPS, import, and parked wearables fold under disclosures.
       */}
      <BodyMetricsCard refreshKey={refresh} onChanged={() => setRefresh((r) => r + 1)} />

      <details className="house-card group">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          {t('trackMoreGpsImport', { defaultValue: 'Walks, GPS & import' })}
        </summary>
        <div className="space-y-4 border-t-2 border-border p-4">
          <div id="track-log" className="scroll-mt-20">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>{t('trackLogTitle', { defaultValue: 'Log Activity' })}</CardTitle>
                <CardDescription>
                  {t('trackLogDesc', {
                    defaultValue: 'No GPS needed — type it in, and it stays on this device.',
                  })}
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
                        className="min-h-[44px] tap-target"
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
                      defaultValue: 'Morning park loop',
                    })}
                  />
                </div>
                <Button
                  variant="outline"
                  className="min-h-[52px] tap-target w-full sm:w-auto"
                  onClick={handleLog}
                >
                  {t('trackLogBtn', { defaultValue: 'Log activity' })}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="content-card">
            <CardHeader>
              <CardTitle>{t('trackWeekLogTitle', { defaultValue: "This Week's Log" })}</CardTitle>
            </CardHeader>
            <CardContent>
              {weekActivities.length === 0 ? (
                <EmptyState
                  className="house-empty"
                  icon={Scale}
                  title={t('trackEmptyTitle', { defaultValue: 'No activities this week' })}
                  description={t('trackEmptyWeek', {
                    defaultValue: 'Log a walk or run above when you want — optional beside Train.',
                  })}
                  actionLabel={t('trackLogBtn', { defaultValue: 'Log activity' })}
                  href="#track-log"
                />
              ) : (
                <ul className="space-y-2">
                  {weekActivities.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between text-sm border-b-2 border-border pb-2 min-h-[44px] gap-2"
                    >
                      <div className="min-w-0">
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
                        {a.notes && (
                          <div className="text-xs text-muted-foreground truncate">{a.notes}</div>
                        )}
                      </div>
                      <HoldToConfirmButton
                        size="sm"
                        className="h-11 w-11 tap-target shrink-0"
                        label={t('trackDeleteActivity', { defaultValue: 'Delete activity' })}
                        icon={<Trash2 className="h-4 w-4" />}
                        onConfirm={() => handleDelete(a.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <TrackGpsPanel onLogged={() => setRefresh((r) => r + 1)} />
          <TrackWeeklyInsights locked={!premium} key={refresh} />
          <ActivityImportPanel onImported={() => setRefresh((r) => r + 1)} />
        </div>
      </details>

      <details className="house-card group">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
          {t('trackMoreBodyWearables', { defaultValue: 'Trends & extras' })}
        </summary>
        <div className="space-y-4 border-t-2 border-border p-4">
          <p className="text-xs text-muted-foreground" data-testid="track-no-strap">
            {t('trackNoStrapRequired', {
              defaultValue: 'No strap required. GPS and a typed walk are optional beside Train.',
            })}
          </p>
          <ProfileWearablesCard signedIn={signedIn} />
          <TrendAskCard history={workoutHistory} />
        </div>
      </details>
    </PillarPageShell>
  );
}
