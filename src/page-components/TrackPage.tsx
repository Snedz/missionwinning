'use client';
/**
 * Page: /track — activity/GPS pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
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
  getWeeklyStats,
  logActivity,
} from '@/lib/activityLog';
import { isGpsActivity } from '@/lib/trackGps';
import { logPillarWin } from '@/lib/pillarLog';
import { TrackGpsPanel } from '@/components/track/TrackGpsPanel';
import { TrackWeeklyInsights } from '@/components/track/TrackWeeklyInsights';
import { ActivityImportPanel } from '@/components/track/ActivityImportPanel';
import { usePremium } from '@/hooks/usePremium';
import { MapPin, Trash2 } from 'lucide-react';

export function TrackPage() {
  const { t } = useTranslation();
  const { premium } = usePremium();
  const [type, setType] = useState<ActivityType>('walk');
  const [durationMin, setDurationMin] = useState(30);
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');
  const [refresh, setRefresh] = useState(0);

  const weekActivities = typeof window !== 'undefined' ? getActivitiesForWeek() : [];
  const stats = typeof window !== 'undefined'
    ? getWeeklyStats()
    : { count: 0, totalMin: 0, totalKm: 0, byType: {} };

  const handleLog = () => {
    if (durationMin < 1) return;
    const today = new Date().toISOString().split('T')[0];
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
      title={t('trackTitle', { defaultValue: 'Track Activity' })}
      subtitle={t('trackSubtitle', {
        defaultValue:
          'Free manual activity log — walk, run, bike, hike. Premium adds GPS and advanced stats (MapMy-style, Super Bundle).',
      })}
    >
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
            </CardContent>
          </Card>
        </div>

        <TrackGpsPanel onLogged={() => setRefresh((r) => r + 1)} />

        <TrackWeeklyInsights locked={!premium} key={refresh} />

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

        <ActivityImportPanel onImported={() => setRefresh((r) => r + 1)} />

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
                    className="flex items-center justify-between text-sm border-b border-border/50 pb-2"
                  >
                    <div>
                      <span className="font-medium">{ACTIVITY_LABELS[a.type]}</span>
                      {isGpsActivity(a.notes) && (
                        <span className="ms-1.5 text-[10px] uppercase tracking-wide text-emerald-400/90 font-semibold">
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
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
    </PillarPageShell>
  );
}
