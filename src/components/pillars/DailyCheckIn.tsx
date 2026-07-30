'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logPillarWin } from '@/lib/pillarLog';
import {
  getTodayCheckIn,
  saveCheckIn,
  todayCheckInDate,
  type MindCheckIn,
} from '@/lib/mindCheckIns';
import { BehaviorStrip } from '@/components/pillars/BehaviorStrip';
import type { BehaviorEntry } from '@/lib/behaviors';
import { loadCheckIns } from '@/lib/mindCheckIns';
import {
  computeSleepConsistency,
  consistencyLine,
  sleepCollectingLine,
  sleepConsistencyProgress,
} from '@/lib/sleepConsistency';

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-sm mb-2 flex justify-between">
        <span>{label}</span>
        <span className="text-muted-foreground tabular-nums">{value}/5</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`min-h-[44px] flex-1 py-2 rounded text-sm font-medium transition-colors ${
              value >= n ? 'bg-primary-fill text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DailyCheckIn() {
  const [sleep, setSleep] = useState(3);
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(3);
  const [behaviors, setBehaviors] = useState<BehaviorEntry>({});
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [consistency, setConsistency] = useState<string | null>(null);

  const refreshConsistency = () => {
    const checkIns = loadCheckIns();
    const c = computeSleepConsistency(checkIns);
    if (c) {
      setConsistency(consistencyLine(c));
      return;
    }
    // Four nights in, "nothing to say yet" and "this feature does not exist"
    // look identical. The progress line is the difference.
    const collecting = sleepConsistencyProgress(checkIns);
    setConsistency(collecting ? sleepCollectingLine(collecting) : null);
  };

  useEffect(() => {
    refreshConsistency();
    const t = getTodayCheckIn();
    if (t) {
      setSleep(t.sleep);
      setMood(t.mood);
      setStress(t.stress);
      setEnergy(t.energy);
      setSoreness(t.soreness ?? 3);
      setBehaviors(t.behaviors ?? {});
      setNote(t.note || '');
      setSaved(true);
    }
  }, []);

  const handleSave = () => {
    const data: MindCheckIn = {
      date: todayCheckInDate(),
      sleep,
      mood,
      stress,
      energy,
      soreness,
      behaviors,
      note: note.trim() || undefined,
    };
    saveCheckIn(data);
    // The pillar-win payload stays ratings-only: behaviors are journal-class
    // data and have no business riding a win record that other surfaces read.
    logPillarWin('mind', 'Daily check-in', { sleep, mood, stress, energy, soreness });
    setSaved(true);
    // Tonight's bed time can change the picture, so recompute after the write.
    refreshConsistency();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Check-In</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sleep, mood, stress, energy, soreness — 1 (low) to 5 (great). Feeds readiness on Today and
          Active. Free for all.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RatingRow label="Sleep quality last night" value={sleep} onChange={setSleep} />
        <RatingRow label="Mood today" value={mood} onChange={setMood} />
        <RatingRow label="Stress level" value={stress} onChange={setStress} />
        <RatingRow label="Energy" value={energy} onChange={setEnergy} />
        <RatingRow label="Muscle soreness" value={soreness} onChange={setSoreness} />
        <BehaviorStrip value={behaviors} onChange={setBehaviors} />
        <div>
          <label htmlFor="daily-checkin-note" className="text-sm">
            Optional note
          </label>
          <textarea
            id="daily-checkin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-1 min-h-[60px] rounded border border-border bg-background px-3 py-2 text-sm"
            placeholder="One line — what helped or what you need tomorrow"
          />
        </div>
        <Button variant="fitness" className="min-h-[44px] w-full" onClick={handleSave}>
          {saved ? "Update Today's Check-In" : 'Save Check-In'}
        </Button>
        {saved && (
          <p className="text-xs text-primary text-center">
            Saved for today — adjusts readiness (within honest bounds).
          </p>
        )}
        {/* Regularity, not a duration, and never a debt figure we cannot
            honestly measure. Silent only until the first bed time is logged;
            after that it counts up to the five nights the band needs. */}
        {consistency && (
          <p className="text-xs leading-relaxed text-muted-foreground">{consistency}</p>
        )}
      </CardContent>
    </Card>
  );
}
