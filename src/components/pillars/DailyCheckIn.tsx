'use client';
import { useTranslation } from 'react-i18next';

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
            aria-pressed={value >= n}
            /* `.241` — ink fill, not red. Five filled segments per scale × three
               scales put fifteen red controls on `/mind`, which is most of why
               that route measured 51 against a one-red-action rule. A rating is a
               value, not the thing to do next; the ink fill is `WeekStrip`'s
               "done" treatment and leaves red for Save. `font-semibold` because
               Archivo has no 500. */
            className={`min-h-[44px] flex-1 py-2 text-sm font-semibold tabular-nums transition-colors ${
              value >= n
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground hover:bg-muted'
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
  const { t } = useTranslation();
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
    // Named `today`, not `t` — `t` is the translator now, and a shadow that
    // compiles is exactly the kind that survives review.
    const today = getTodayCheckIn();
    if (today) {
      setSleep(today.sleep);
      setMood(today.mood);
      setStress(today.stress);
      setEnergy(today.energy);
      setSoreness(today.soreness ?? 3);
      setBehaviors(today.behaviors ?? {});
      setNote(today.note || '');
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
        <CardTitle>{t('mindCheckInTitle', { defaultValue: 'Daily Check-In' })}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('mindCheckInSubtitle', {
            defaultValue:
              'Sleep, mood, stress, energy, soreness — 1 (low) to 5 (great). Feeds readiness on Today and Active. Free for all.',
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RatingRow label={t('mindCheckInSleep', { defaultValue: 'Sleep quality last night' })} value={sleep} onChange={setSleep} />
        <RatingRow label={t('mindCheckInMood', { defaultValue: 'Mood today' })} value={mood} onChange={setMood} />
        <RatingRow label={t('mindCheckInStress', { defaultValue: 'Stress level' })} value={stress} onChange={setStress} />
        <RatingRow label={t('mindCheckInEnergy', { defaultValue: 'Energy' })} value={energy} onChange={setEnergy} />
        <RatingRow label={t('mindCheckInSoreness', { defaultValue: 'Muscle soreness' })} value={soreness} onChange={setSoreness} />
        <BehaviorStrip value={behaviors} onChange={setBehaviors} />
        <div>
          <label htmlFor="daily-checkin-note" className="text-sm">
            {t('mindCheckInNoteLabel', { defaultValue: 'Optional note' })}
          </label>
          <textarea
            id="daily-checkin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-1 min-h-[60px] rounded border border-border bg-background px-3 py-2 text-sm"
            placeholder={t('mindCheckInNotePlaceholder', {
              defaultValue: 'One line — what helped or what you need tomorrow',
            })}
          />
        </div>
        <Button variant="default" className="min-h-[44px] w-full" onClick={handleSave}>
          {saved
            ? t('mindCheckInUpdate', { defaultValue: "Update Today's Check-In" })
            : t('mindCheckInSave', { defaultValue: 'Save Check-In' })}
        </Button>
        {saved && (
          <p className="text-xs text-primary text-center">
            {t('mindCheckInSaved', {
              defaultValue: 'Saved for today — adjusts readiness (within honest bounds).',
            })}
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
