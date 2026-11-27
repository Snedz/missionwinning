import { useMemo, useState } from 'react';
import { getExerciseById } from '@/data/exercises';
import { generateNotebookWeek } from '@/lib/coach/notebookWeek';
import type { CoachPlan, EquipmentProfile } from '@/lib/coach/types';
import { exampleHistory, sampleDay, weekdays } from './landingExample';
import styles from './landing.module.css';

type Result = { plan: CoachPlan | null; missed: number };

export default function WeekDemo() {
  const [equipment, setEquipment] = useState<EquipmentProfile>('dumbbells');
  const [days, setDays] = useState(3);
  const [missed, setMissed] = useState(2);
  const [result, setResult] = useState<Result>();
  const original = useMemo(() => generateNotebookWeek({
    equipment, daysPerWeek: days, units: 'metric', history: exampleHistory, revision: 1,
  }, sampleDay(2)), [equipment, days]);
  const scheduled = original.sessions.map(({ dayOffset }) => dayOffset).sort((a, b) => a - b);
  const missedDay = scheduled.includes(missed) ? missed : scheduled[0];
  const rebuilt = [...(result?.plan?.sessions ?? [])].sort((a, b) => a.dayOffset - b.dayOffset);

  return <div className={styles.demoPanel}>
    <form className={styles.demoForm} onSubmit={(event) => {
      event.preventDefault();
      setResult({
        missed: missedDay,
        plan: missedDay < 6 ? generateNotebookWeek({
          equipment, daysPerWeek: days, units: 'metric', history: exampleHistory, revision: 2,
        }, sampleDay(missedDay + 1)) : null,
      });
    }}>
      <label>Equipment<select value={equipment} onChange={(event) => { setEquipment(event.target.value as EquipmentProfile); setResult(undefined); }}>
        <option value="bodyweight">Bodyweight</option><option value="dumbbells">Dumbbells</option><option value="full-gym">Full gym</option>
      </select></label>
      <label>Days per week<select value={days} onChange={(event) => { setDays(Number(event.target.value)); setResult(undefined); }}>
        {[2, 3, 4, 5, 6].map((day) => <option key={day}>{day}</option>)}
      </select></label>
      <label>Missed session<select value={missedDay} onChange={(event) => { setMissed(Number(event.target.value)); setResult(undefined); }}>
        {scheduled.map((day) => <option key={day} value={day}>{weekdays[day]}</option>)}
      </select></label>
      <button className="button primary-button" type="submit">Rebuild week</button>
    </form>
    <p className={styles.demoHint}>Original schedule: {scheduled.map((day) => weekdays[day]).join(', ')}. Rebuild runs the day after the missed session.</p>
    <p className={styles.demoStatus} role="status" aria-atomic="true">{result && (rebuilt.length > 0
      ? `Missed ${weekdays[result.missed]}. Rebuilt schedule: ${rebuilt.map(({ dayOffset }) => weekdays[dayOffset]).join(', ')}.`
      : `Missed ${weekdays[result.missed]}. No days remain in this sample week.`)}</p>
    {rebuilt.length > 0 && <ul className={styles.demoSessions} aria-label="Rebuilt sessions">
      {rebuilt.map(({ id, dayOffset, exercises }) => {
        const example = exercises[0];
        return <li key={id}><strong>{weekdays[dayOffset]}</strong>{example && <span>{getExerciseById(example.exerciseId)?.name} · {example.sets} × {example.reps}</span>}</li>;
      })}
    </ul>}
  </div>;
}
