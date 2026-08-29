'use client';
import { useTranslation } from 'react-i18next';

import { useEffect, useState } from 'react';
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
      <div className="house-row">
        <span className="house-kicker">{label}</span>
        <span className="house-lede tabular-nums">{value}/5</span>
      </div>
      <div className="house-checkin-scale">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value >= n}
            /* `.241` — ink fill, not red. A rating is a value, not the next
               action; Save stays the one filled house button. */
            className={`house-checkin-tick min-h-[44px] tap-target${
              value >= n ? ' is-on' : ''
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
    <section className="house-card house-checkin">
      <h2 className="house-checkin-name">
        {t('mindCheckInTitle', { defaultValue: 'Daily Check-In' })}
      </h2>
      <p className="house-lede">
        {t('mindCheckInSubtitle', {
          defaultValue:
            'Sleep, mood, stress, energy, soreness — 1 (low) to 5 (great). Feeds readiness on Today and Active. Free for all.',
        })}
      </p>
      <div className="house-checkin-body">
        <RatingRow label={t('mindCheckInSleep', { defaultValue: 'Sleep quality last night' })} value={sleep} onChange={setSleep} />
        <RatingRow label={t('mindCheckInMood', { defaultValue: 'Mood today' })} value={mood} onChange={setMood} />
        <RatingRow label={t('mindCheckInStress', { defaultValue: 'Stress level' })} value={stress} onChange={setStress} />
        <RatingRow label={t('mindCheckInEnergy', { defaultValue: 'Energy' })} value={energy} onChange={setEnergy} />
        <RatingRow label={t('mindCheckInSoreness', { defaultValue: 'Muscle soreness' })} value={soreness} onChange={setSoreness} />
        <BehaviorStrip value={behaviors} onChange={setBehaviors} />
        <div>
          <label htmlFor="daily-checkin-note" className="house-kicker">
            {t('mindCheckInNoteLabel', { defaultValue: 'Optional note' })}
          </label>
          <textarea
            id="daily-checkin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="house-field"
            placeholder={t('mindCheckInNotePlaceholder', {
              defaultValue: 'One line — what helped or what you need tomorrow',
            })}
          />
        </div>
        <button
          type="button"
          className="house-btn house-btn-primary min-h-[44px] w-full tap-target"
          onClick={handleSave}
        >
          {saved
            ? t('mindCheckInUpdate', { defaultValue: "Update Today's Check-In" })
            : t('mindCheckInSave', { defaultValue: 'Save Check-In' })}
        </button>
        {saved && (
          <p className="house-lede">
            {t('mindCheckInSaved', {
              defaultValue: 'Saved for today — adjusts readiness (within honest bounds).',
            })}
          </p>
        )}
        {/* Regularity, not a duration, and never a debt figure we cannot
            honestly measure. Silent only until the first bed time is logged;
            after that it counts up to the five nights the band needs. */}
        {consistency && <p className="house-lede">{consistency}</p>}
      </div>
    </section>
  );
}
