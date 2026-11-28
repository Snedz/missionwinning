import { useMemo, useState } from 'react';
import { getExerciseById } from '@/data/exercises';
import { LANDING_PREVIEW_EN as copy } from '@/i18n/landingPreviewLocales';
import { landingPreviewWeek } from '@/lib/coach/landingPreviewWeek';
import type { EquipmentProfile } from '@/lib/coach/types';
import s from './landingV2.module.css';

export default function LandingV2Demo() {
  const [equipment, setEquipment] = useState<EquipmentProfile>('dumbbells');
  const [days, setDays] = useState(3);
  const [missed, setMissed] = useState(2);
  const [result, setResult] = useState<ReturnType<typeof landingPreviewWeek>>();
  const scheduled = useMemo(() => landingPreviewWeek(equipment, days).map(({ dayOffset }) => dayOffset), [equipment, days]);
  const missedDay = scheduled.includes(missed) ? missed : scheduled[0];
  const dayList = (offsets: number[]) => offsets.map((day) => copy.days[day]).join(', ');

  return <div className={s.demoPanel}>
    <form className={s.form} onSubmit={(event) => {
      event.preventDefault();
      setResult(landingPreviewWeek(equipment, days, missedDay));
    }}>
      <label>{copy.equipment}<select value={equipment} onChange={(event) => { setEquipment(event.target.value as EquipmentProfile); setResult(undefined); }}>
        {Object.entries(copy.gear).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select></label>
      <label>{copy.frequency}<select value={days} onChange={(event) => { setDays(Number(event.target.value)); setResult(undefined); }}>
        {[2, 3, 4, 5, 6].map((day) => <option key={day}>{day}</option>)}
      </select></label>
      <label>{copy.missed}<select value={missedDay} onChange={(event) => { setMissed(Number(event.target.value)); setResult(undefined); }}>
        {scheduled.map((day) => <option key={day} value={day}>{copy.days[day]}</option>)}
      </select></label>
      <button type="submit" className={s.primary}>{copy.rebuild}</button>
    </form>
    <p className={s.note}>{copy.demoOriginal} {dayList(scheduled)}.</p>
    <p role="status" aria-atomic="true">{result && (result.length ? `${copy.demoRebuilt} ${dayList(result.map(({ dayOffset }) => dayOffset))}.` : copy.demoNoDays)}</p>
    {!!result?.length && <ul className={s.demoSessions}>{result.map(({ id, dayOffset, exercises }) => {
      const exercise = exercises[0];
      return <li key={id}><strong>{copy.days[dayOffset]}</strong>{exercise && <span>{getExerciseById(exercise.exerciseId)?.name ?? exercise.exerciseId} · {exercise.sets} × {exercise.reps}</span>}</li>;
    })}</ul>}
  </div>;
}
