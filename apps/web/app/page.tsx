import type { Metadata } from 'next';
import { getExerciseById } from '@/data/exercises';
import { generateNotebookWeek } from '@/lib/coach/notebookWeek';
import type { CompletedWorkoutLog } from '@/types';
import { quickStartHref } from '../lib/trainEntry';
import styles from './landing.module.css';

const title = 'Mission Winning — Log a set. Know what to train next.';
const description = 'A training notebook for sets, reps, and load. Log in your browser without an account, then use your training history to build your week.';
const shareImage = {
  url: '/landing-share.png', width: 1200, height: 630,
  alt: 'Mission Winning training notebook. Log a set. Know what to train next. In your browser. No account needed.',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.missionwinning.com'),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'Mission Winning', title, description, url: '/', images: [shareImage] },
  twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
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
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const originalDays = new Set(firstPlan.sessions.map(({ dayOffset }) => dayOffset));
const rebuiltDays = new Set(rebuiltPlan.sessions.map(({ dayOffset }) => dayOffset));
const appScreens = [
  { id: 'today', name: 'Today', description: 'Start a workout or see what’s next.', alt: 'Today with a Start workout button, next session, and recent training.' },
  { id: 'train', name: 'Train', description: 'Enter reps and load. See the sets you saved.', alt: 'Train showing a logged twelve-rep set and fields for reps and load.' },
  { id: 'coach', name: 'Coach', description: 'Build a week from your logged training.', alt: 'Coach showing a week plan and a citation from the logged workout.' },
];
const signInAvailable = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function Arrow({ down = false }: { down?: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d={down ? 'M12 3v17m-6-6 6 6 6-6' : 'M3 12h17m-6-6 6 6-6 6'} />
  </svg>;
}

function LogLink() {
  return <a href={quickStartHref} className="button primary-button">Log a set <Arrow /></a>;
}

function WeekComparison() {
  const changes = (matches: (day: number) => boolean) => weekdays.filter((_, day) => matches(day)).join(' and ');
  const removed = changes((day) => originalDays.has(day) && !rebuiltDays.has(day));
  const added = changes((day) => rebuiltDays.has(day) && !originalDays.has(day));
  const kept = changes((day) => rebuiltDays.has(day) && originalDays.has(day));
  const firstExercise = rebuiltPlan.sessions[0]?.exercises[0];
  return <div className={styles.plan}>
    <div className={styles.planHeader}><h3 id="sample-week">Example week</h3><span className="eyebrow">Sample data · Dumbbells</span></div>
    <table aria-labelledby="sample-week" aria-describedby="schedule-change" className={styles.calendar}>
      <thead><tr>
        <th scope="col"><span className="sr-only">Plan version</span></th>
        {weekdays.map((day) => <th key={day} scope="col">
          <span aria-hidden="true">{day.slice(0, 3)}</span><span className="sr-only">{day}</span>
        </th>)}
      </tr></thead>
      <tbody>
        {[
          { label: 'Original plan', days: originalDays },
          { label: 'Rebuilt Thursday', days: rebuiltDays },
        ].map(({ label, days }) => <tr key={label}>
          <th scope="row">{label}</th>
          {weekdays.map((day, index) => {
            const scheduled = days.has(index);
            return <td key={day} className={scheduled ? styles.scheduled : undefined}>
              <span aria-hidden="true">{scheduled ? '●' : '–'}</span>
              <span className="sr-only">{scheduled ? 'Session planned' : 'No session'}</span>
            </td>;
          })}
        </tr>)}
      </tbody>
    </table>
    <p className={styles.changeNote} id="schedule-change">
      <strong>{removed} → {added}.</strong> {kept} stays on the plan.
    </p>
    <p className={styles.planFoot}>
      {firstExercise && <>{getExerciseById(firstExercise.exerciseId)?.name} in the rebuilt plan: {firstExercise.sets} × {firstExercise.reps} at {firstExercise.weight} kg. </>}
      Both schedules come from the notebook’s Coach planner.
    </p>
  </div>;
}

function AppPreview() {
  return <section className={`${styles.frame} ${styles.appPreview}`} aria-labelledby="preview-title">
    <div className={styles.sectionCopy}>
      <p className={`eyebrow ${styles.kicker}`}>02 / Inside the notebook</p>
      <h2 id="preview-title">See the real app.</h2>
      <p>Screens from the training notebook with an example workout.</p>
    </div>
    <div className={styles.previewGrid}>
      {appScreens.map(({ id, name, description, alt }, index) => <figure key={id}>
        <figcaption>
          <span className="eyebrow">0{index + 1} / {name}</span>
          <p>{description}</p>
        </figcaption>
        <picture className={id === 'today' ? styles.phoneFrame : styles.adaptiveFrame}>
          {id !== 'today' && <source media="(min-width: 64rem)" srcSet={`/preview-${id}-laptop.webp`} width={960} height={600} />}
          <img src={`/preview-${id}-phone.webp`} width={390} height={844} alt={alt} loading="lazy" decoding="async" />
        </picture>
      </figure>)}
    </div>
  </section>;
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
          <p className={styles.reassurance}>In your browser. No account needed.</p>
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
            <p>You logged three sets of lunges on Monday, then missed Wednesday’s session. On Thursday you choose “Rebuild week.” Coach plans the remaining days with the same workout history, dumbbells and three-day target.</p>
          </div>
          <WeekComparison />
        </div>
      </section>
      <AppPreview />
      <section className={styles.availability} aria-labelledby="availability-title">
        <div className={`${styles.frame} ${styles.appPreview}`}>
          <div className={styles.sectionCopy}>
            <p className={`eyebrow ${styles.kicker}`}>03 / On your device</p>
            <h2 id="availability-title">Train beyond Wi-Fi.</h2>
            <p>Start in your browser. Install the web app if you want a home-screen shortcut.</p>
          </div>
          <div className={styles.availabilityGrid}>
            <div>
              <h3>Add to your home screen</h3>
              <p>Open the notebook in a supported browser. Use “Install app” if the notebook offers it, or look for an install or Add to Home Screen option in your browser menu.</p>
            </div>
            <div>
              <h3>Log in airplane mode</h3>
              <p>Open the notebook online on this device first and wait for “Offline ready.” Then you can save sets without a connection. Account sync needs you back online.</p>
            </div>
            <div>
              <h3>Separate native Android app</h3>
              <p>Mission Winning also has a native Android app. This page opens the web notebook; no native app is needed to log here.</p>
            </div>
          </div>
        </div>
      </section>
      <section className={`${styles.frame} ${styles.questions}`} aria-labelledby="questions-title">
        <div className={styles.sectionCopy}>
          <p className={`eyebrow ${styles.kicker}`}>04 / Good to know</p>
          <h2 id="questions-title">Just you and your training.</h2>
        </div>
        <div className={styles.answers}>
          <details><summary>Do I need a gym or a wearable?</summary><p>No. Start with bodyweight, or tell Coach you have dumbbells or a full gym. Coach uses your workout history, not wearable readings.</p></details>
          <details>
            <summary>Where are my workouts saved?</summary>
            <p>As a guest, your workouts are saved in this browser on this device. Export a backup from You before clearing browser data or moving to another device.</p>
            {signInAvailable && <p>Already have a Mission Winning account? Sign in from You to sync workouts across devices. You can keep logging as a guest instead.</p>}
          </details>
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
