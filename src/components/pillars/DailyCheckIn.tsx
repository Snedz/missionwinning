'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logPillarWin } from '@/lib/pillarLog';

interface CheckInData {
  date: string;
  sleep: number;
  mood: number;
  stress: number;
  energy: number;
  note?: string;
}

const STORAGE_KEY = 'mw_mind_checkins';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function loadToday(): CheckInData | null {
  if (typeof window === 'undefined') return null;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CheckInData[];
    return all.find((c) => c.date === todayStr()) ?? null;
  } catch {
    return null;
  }
}

function saveCheckIn(data: CheckInData) {
  if (typeof window === 'undefined') return;
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CheckInData[];
  const filtered = all.filter((c) => c.date !== data.date);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([data, ...filtered].slice(0, 30)));
}

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
        <span className="text-muted-foreground">{value}/5</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
              value >= n ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = loadToday();
    if (t) {
      setSleep(t.sleep);
      setMood(t.mood);
      setStress(t.stress);
      setEnergy(t.energy);
      setNote(t.note || '');
      setSaved(true);
    }
  }, []);

  const handleSave = () => {
    const data: CheckInData = { date: todayStr(), sleep, mood, stress, energy, note: note.trim() || undefined };
    saveCheckIn(data);
    logPillarWin('mind', 'Daily check-in', { sleep, mood, stress, energy });
    setSaved(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Check-In</CardTitle>
        <p className="text-sm text-muted-foreground">Sleep, mood, stress, energy — 1 (low) to 5 (great). Free for all.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RatingRow label="Sleep quality last night" value={sleep} onChange={setSleep} />
        <RatingRow label="Mood today" value={mood} onChange={setMood} />
        <RatingRow label="Stress level" value={stress} onChange={setStress} />
        <RatingRow label="Energy" value={energy} onChange={setEnergy} />
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
        <Button variant="fitness" className="w-full" onClick={handleSave}>
          {saved ? 'Update Today\'s Check-In' : 'Save Check-In'}
        </Button>
        {saved && <p className="text-xs text-emerald-400 text-center">Saved for today — feeds recovery insights.</p>}
      </CardContent>
    </Card>
  );
}
