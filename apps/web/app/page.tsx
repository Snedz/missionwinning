import type { Metadata } from 'next';
import { getExerciseById } from '@/data/exercises';
import { generateNotebookWeek } from '@/lib/coach/notebookWeek';
import type { CompletedWorkoutLog } from '@/types';
import { quickStartHref } from '../lib/trainEntry';
import styles from './landing.module.css';

export const metadata: Metadata = {
  title: 'Mission Winning — Log a set. Know what to train next.',
};

const exampleSets = [
  { id: 'one', reps: 10, weight: 20, completed: true },
  { id: 'two', reps: 10, weight: 20, completed: true },
  { id: 'three', reps: 10, weight: 20, completed: true },
];
const exampleDate = new Date(2026, 5, 8, 12);
const exampleWorkout: CompletedWorkoutLog = {
  id: 'landing-example',
  workoutName: 'Lower body',
  completedAt: exampleDate.toISOString(),
  startedAt: exampleDate.toISOString(),
  durationSeconds: 600,
  weightUnit: 'kg',
  totalVolume: exampleSets.reduce((volume, set) => volume + set.reps * set.weight, 0),
  exercises: [{ exerciseId: 'lunges', sets: exampleSets }],
};
const exampleInput: Parameters<typeof generateNotebookWeek>[0] = {
  equipment: 'dumbbells', daysPerWeek: 3, units: 'metric', history: [exampleWorkout], revision: 1,
};
const firstPlan = generateNotebookWeek(exampleInput, new Date(2026, 5, 10, 12));
const rebuiltPlan = generateNotebookWeek({ ...exampleInput, revision: 2 }, new Date(2026, 5, 11, 12));
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const signInAvailable = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function Arrow({ down = false }: { down?: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d={down ? 'M12 3v17m-6-6 6 6 6-6' : 'M3 12h17m-6-6 6 6-6 6'} />
  </svg>;
}

function LogLink() {
  return <a href={quickStartHref} className="button primary-button">Log a set <Arrow /></a>;
}

export default function LandingPage() {
  return <div className={styles.landing}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={styles.masthead}>
      <div className={styles.frame}>
        <a className="brand" href="/" aria-label="Mission Winning home">
          <span className="brand-mark" aria-hidden="true">MW</span><span>MISSION<br />WINNING</span>
        </a>
        <a className={styles.returnLink} href="/log">Open notebook <Arrow /></a>
      </div>
    </header>
    <main id="main" tabIndex={-1}>
      <section className={`${styles.frame} ${styles.hero}`} aria-labelledby="landing-title">
        <div className={styles.heroCopy}>
          <p className={`eyebrow ${styles.kicker}`}>The training notebook</p>
          <h1 id="landing-title">Log a set.<br /><span>Know what to train next.</span></h1>
          <p className={styles.intro}>Track sets, reps and load. Then use your training history to build a week that fits the equipment you have.</p>
          <div className={styles.actions}>
            <LogLink />
            <a className={styles.inlineLink} href="#example">See how a week adapts <Arrow down /></a>
          </div>
          <p className={styles.reassurance}>No account needed to log.</p>
        </div>
        <figure className={styles.plate} aria-labelledby="plate-caption">
          <figcaption id="plate-caption"><span>From the notebook</span><span>Sample data</span></figcaption>
          <div className={styles.receipt}>
            <p className="eyebrow">01 / Sample workout</p>
            <h2>Lunges</h2>
            <ol aria-label="Example logged sets">
              {exampleSets.map((set, index) => <li key={set.id}>
                <span className={styles.setIndex}>0{index + 1}</span>
                <strong>{set.reps} reps</strong>
                <span>{set.weight} kg</span>
              </li>)}
            </ol>
          </div>
          <div className={styles.plateFoot}><span>Workout history</span><Arrow /><span>Coach plan</span></div>
        </figure>
      </section>
      <section id="example" className={styles.example} aria-labelledby="example-title">
        <div className={`${styles.frame} ${styles.exampleGrid}`}>
          <div className={styles.sectionCopy}>
            <p className={`eyebrow ${styles.kicker}`}>01 / From your log</p>
            <h2 id="example-title">Build a week from what you did.</h2>
            <p>You logged three sets of lunges on Monday, then missed Wednesday’s session. Choose “Rebuild week” on Thursday and Coach fits the sessions onto the days that are left.</p>
          </div>
          <div className={styles.plan}>
            <div className={styles.planHeader}><h3>Example week</h3><span className="eyebrow">3 days · Dumbbells</span></div>
            <p className={styles.snapshot}>Original plan: <strong>{firstPlan.sessions.map(({ dayOffset }) => weekdays[dayOffset]).join(' · ')}</strong></p>
            <p className={styles.snapshot}>Rebuilt on Thursday</p>
            <ul aria-label="Example planned sessions">
              {rebuiltPlan.sessions.map((session) => {
                const movement = session.exercises[0];
                return <li key={session.id}>
                  <strong>{weekdays[session.dayOffset]}</strong>
                  <span>{session.name}</span>
                  {movement && <small>
                    {getExerciseById(movement.exerciseId)?.name}<br />
                    {movement.sets} × {movement.reps} · {movement.weight} kg
                  </small>}
                </li>;
              })}
            </ul>
            <p>Generated from sample data with the notebook’s Coach planner.</p>
          </div>
        </div>
      </section>
      <section className={`${styles.frame} ${styles.questions}`} aria-labelledby="questions-title">
        <div className={styles.sectionCopy}>
          <p className={`eyebrow ${styles.kicker}`}>02 / Good to know</p>
          <h2 id="questions-title">Just you and your training.</h2>
        </div>
        <div className={styles.answers}>
          <details><summary>Can I log offline?</summary><p>Yes. Open the notebook online first and wait for “Offline ready.” After that you can log on this device without a connection.</p></details>
          <details><summary>Do I need a gym or a wearable?</summary><p>No. Start with bodyweight, or tell Coach you have dumbbells or a full gym. Coach uses your workout history, not wearable readings.</p></details>
          <details><summary>Where are my workouts saved?</summary><p>Guest workouts stay in this browser on this device. Export a backup from You to keep a copy or move to another browser.</p></details>
        </div>
      </section>
      <div className={styles.finalBand}>
        <div className={styles.frame}><p>Start with the set in front of you.</p><LogLink /></div>
      </div>
    </main>
    <footer className={styles.frame}>
      <span>Mission Winning</span>
      {signInAvailable
        ? <a className={styles.returnLink} href="/profile">Sign in <Arrow /></a>
        : <a className={styles.returnLink} href="/log">Open notebook <Arrow /></a>}
    </footer>
  </div>;
}
