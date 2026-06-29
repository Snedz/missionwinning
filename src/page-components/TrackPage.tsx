'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ACTIVITY_LABELS,
  type ActivityType,
  deleteActivity,
  getActivitiesForWeek,
  getWeeklyStats,
  logActivity,
} from '@/lib/activityLog';
import { logPillarWin } from '@/lib/pillarLog';
import { UnlockButton } from '@/components/UnlockButton';
import { MapPin, Trash2 } from 'lucide-react';

export function TrackPage() {
  const [type, setType] = useState<ActivityType>('walk');
  const [durationMin, setDurationMin] = useState(30);
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');
  const [refresh, setRefresh] = useState(0);

  const weekActivities = typeof window !== 'undefined' ? getActivitiesForWeek() : [];
  const stats = typeof window !== 'undefined' ? getWeeklyStats() : { count: 0, totalMin: 0, totalKm: 0, byType: {} };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="h-7 w-7 text-emerald-400" />
          Track Activity
        </h1>
        <p className="text-muted-foreground mt-1">
          Free manual activity log — walk, run, bike, hike. Premium adds GPS and advanced stats (MapMy-style, Super Bundle).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">This Week</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.count} sessions</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Time</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalMin} min</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Distance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalKm.toFixed(1)} km</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Activity</CardTitle>
          <CardDescription>No GPS needed — manual entry works offline anywhere.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((t) => (
                <Button key={t} size="sm" variant={type === t ? 'default' : 'outline'} onClick={() => setType(t)}>
                  {ACTIVITY_LABELS[t]}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" min={1} value={durationMin} onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Distance km (optional)</Label>
              <Input type="number" step="0.1" placeholder="e.g. 5.2" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Morning park loop, felt great" />
          </div>
          <Button variant="fitness" onClick={handleLog}>Log Activity</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>This Week&apos;s Log</CardTitle></CardHeader>
        <CardContent>
          {weekActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activities yet this week. Log a walk or run above.</p>
          ) : (
            <ul className="space-y-2">
              {weekActivities.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                  <div>
                    <span className="font-medium">{ACTIVITY_LABELS[a.type]}</span>
                    <span className="text-muted-foreground"> · {a.date} · {a.durationMin} min</span>
                    {a.distanceKm != null && <span className="text-muted-foreground"> · {a.distanceKm} km</span>}
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

      <Card className="border-white/10 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Premium — GPS & advanced stats</CardTitle>
          <CardDescription>MapMy-style tracking, routes, pace charts, cross-pillar coaching.</CardDescription>
        </CardHeader>
        <CardContent>
          <UnlockButton productId="track-premium" price="8" title="Track Premium" isSubscription />
        </CardContent>
      </Card>
    </div>
  );
}
