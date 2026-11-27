'use client';

import { useEffect, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { EXERCISES, getExerciseById } from '@/data/exercises';
import { coachCitationFact, coachLogCitation } from '@/lib/coach/logCitation';
import { downloadBackup, restoreBackupFromJson } from '@/lib/backup';
import { localDateKey, localDateKeyFromIso, formatLocalDateKey } from '@/lib/time/localDate';
import { exerciseFromCatalogLike, formatSetRowLine, resolveSetRowType, resolveSetRowTypeFromId } from '@/lib/workout/setRowType';
import { weightUnitLabel } from '@/lib/units';
import type { EquipmentProfile, PlanSession } from '@/lib/coach/types';
import type { ActiveExerciseLog, CompletedWorkoutLog } from '@/types';
import { useNotebook } from '../lib/notebook';

type Route = '/log' | '/active' | '/victory' | '/coach' | '/history' | '/profile';
type IconName = 'today' | 'train' | 'coach' | 'history' | 'you' | 'arrow' | 'plus' | 'check';

const icons: Record<IconName, ReactNode> = {
  today: <><rect x="4" y="5" width="16" height="15" /><path d="M8 3v4m8-4v4M4 10h16m-12 5h4" /></>,
  train: <path d="M2 12h20M5 8v8m3-10v12m8-12v12m3-10v8" />,
  coach: <><path d="M12 3l2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6z" /><path d="M19 3v4m-2-2h4" /></>,
  history: <><path d="M4 5h16v15H4zM8 9h8m-8 4h8m-8 4h5" /></>,
  you: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
  arrow: <path d="M3 12h17m-6-6 6 6-6 6" />,
  plus: <path d="M12 4v16M4 12h16" />,
  check: <path d="m4 12 5 5L20 6" />,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="miter">{icons[name]}</svg>;
}

const NAV = [
  { href: '/log', label: 'Today', icon: 'today' },
  { href: '/active', label: 'Train', icon: 'train' },
  { href: '/coach', label: 'Coach', icon: 'coach' },
  { href: '/history', label: 'History', icon: 'history' },
  { href: '/profile', label: 'You', icon: 'you' },
] as const;

function go(href: Route) {
  if (location.pathname === href) return;
  window.history.pushState(null, '', href);
  window.scrollTo(0, 0);
}

function AppLink({ href, className, children, current }: {
  href: Route; className?: string; children: ReactNode; current?: boolean;
}) {
  function follow(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(href);
  }
  return <a href={href} onClick={follow} className={className} aria-current={current ? 'page' : undefined}>{children}</a>;
}

function Heading({ index, label, title, children }: {
  index: string; label: string; title: string; children: ReactNode;
}) {
  return <header className="screen-heading">
    <div className="eyebrow heading-index"><span>{index} /</span> {label}</div>
    <h1>{title}</h1>
    <p>{children}</p>
  </header>;
}

function shortDate(at: string) {
  return formatLocalDateKey(localDateKeyFromIso(at), 'en', { month: 'short', day: 'numeric' });
}

function exerciseName(id: string) {
  return getExerciseById(id)?.name ?? id.replaceAll('-', ' ');
}

function exerciseRowType(id: string) {
  const exercise = getExerciseById(id);
  return exercise ? resolveSetRowType(exerciseFromCatalogLike(exercise)) : resolveSetRowTypeFromId(id);
}

function setsIn(log: CompletedWorkoutLog) {
  return log.exercises.reduce((count, exercise) => count + exercise.sets.length, 0);
}

function setCountLabel(count: number) {
  return `${count} ${count === 1 ? 'set' : 'sets'}`;
}

function useConnection() {
  const [online, setOnline] = useState(true);
  const [cached, setCached] = useState(false);
  useEffect(() => {
    function sync() { setOnline(navigator.onLine); }
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const check = () => setCached(navigator.serviceWorker.controller !== null);
      check();
      navigator.serviceWorker.addEventListener('controllerchange', check);
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
      return () => {
        window.removeEventListener('online', sync);
        window.removeEventListener('offline', sync);
        navigator.serviceWorker.removeEventListener('controllerchange', check);
      };
    }
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);
  return { online, cached };
}

export function Notebook() {
  const pathname = usePathname();
  const ready = useNotebook((store) => store.ready);
  const hydrate = useNotebook((store) => store.hydrate);
  const storageWarning = useNotebook((store) => store.storageWarning);
  const { online, cached } = useConnection();
  useEffect(() => { if (!ready) hydrate(); }, [ready, hydrate]);
  const route = pathname === '/' ? '/log' : pathname;
  return <div className="shell">
    <header className="masthead">
      <AppLink href="/log" className="brand"><span className="brand-mark" aria-hidden="true">MW</span><span>MISSION<br />WINNING</span></AppLink>
      <div className="masthead-right"><span className="edition">TRAINING NOTEBOOK / 02</span><span className="device-status" role="status"><i />{!online ? 'Offline' : cached ? 'Offline ready' : 'On this device'}</span></div>
    </header>
    <main id="content" className="content" key={route} aria-busy={!ready}>
      {storageWarning && <p className="notice danger" role="alert">This device refused to save. Keep this tab open; new work may not survive a reload.</p>}
      {!ready ? <p className="loading">Opening your notebook…</p> :
        route === '/active' ? <Train /> :
        route === '/victory' ? <Victory /> :
        route === '/coach' ? <Coach /> :
        route === '/history' ? <History /> :
        route === '/profile' ? <You /> : <Today />}
    </main>
    <nav className="dock" aria-label="Training notebook">
      {NAV.map((link) => <AppLink key={link.href} href={link.href} current={route === link.href} className="dock-item">
        <Icon name={link.icon} /><span>{link.label}</span>
      </AppLink>)}
    </nav>
  </div>;
}

function Today() {
  const { workoutHistory, activeWorkout, plan, start } = useNotebook();
  const logs = workoutHistory.filter((log) => !log.deletedAt);
  const next = plan?.sessions.find((session) => session.status === 'planned' || session.status === 'swapped');
  const label = formatLocalDateKey(localDateKey(), 'en', { weekday: 'long', month: 'long', day: 'numeric' });
  return <>
    <Heading index="01" label={label} title="Today.">A place to do the work, one set at a time.</Heading>
    <div className="today-grid">
      <section className="start-panel">
        <span className="eyebrow stamp">{activeWorkout ? 'IN PROGRESS' : 'READY TO TRAIN'}</span>
        <div className="start-copy">
          <h2>{activeWorkout ? 'Keep going.' : 'Log a set.'}</h2>
          <p>{activeWorkout ? `${activeWorkout.workoutName} is open on this device.` : 'Start with push-ups or pick a movement. No account needed.'}</p>
        </div>
        <button className="button paper-button" onClick={() => { if (!activeWorkout) start(); go('/active'); }}>
          {activeWorkout ? 'Resume workout' : 'Start workout'}<Icon name="arrow" />
        </button>
      </section>
      <div className="today-aside">
        <section className="note-panel">
          <div className="eyebrow muted">THE NEXT SESSION</div>
          <h2>{next ? next.name : 'Your week, when you want it.'}</h2>
          <p>{next ? `${next.exercises.length} movements · about ${next.estMinutes} min` : 'Ask Coach for a plan after logging, or keep training freestyle.'}</p>
          <AppLink href="/coach" className="text-link">Open Coach <Icon name="arrow" size={17} /></AppLink>
        </section>
        <section className="note-panel">
          <div className="eyebrow muted">IN YOUR NOTEBOOK</div>
          <h2>{logs.length ? `${logs.length} ${logs.length === 1 ? 'workout' : 'workouts'} logged.` : 'A clean page.'}</h2>
          <p>{logs[0] ? `Last: ${logs[0].workoutName} · ${shortDate(logs[0].completedAt)}` : 'Finished workouts will appear here.'}</p>
          <AppLink href="/history" className="text-link">View History <Icon name="arrow" size={17} /></AppLink>
        </section>
      </div>
    </div>
  </>;
}

function SetEntry({ exercise }: { exercise: ActiveExerciseLog }) {
  const { undoSet, units, logSet, workoutHistory } = useNotebook();
  const kind = exerciseRowType(exercise.exerciseId);
  const next = exercise.sets.find((row) => !row.completed);
  const prior = workoutHistory.filter((row) => !row.deletedAt)
    .flatMap((row) => row.exercises.filter((ex) => ex.exerciseId === exercise.exerciseId))[0]?.sets.at(-1);
  const logged = exercise.sets.filter((row) => row.completed);
  const labels = weightUnitLabel(units);
  const loadLabel = kind === 'assisted' ? 'Assist' : kind === 'bodyweight' ? 'Added load' : 'Load';
  function display(set: { weight: number; reps: number; durationSeconds?: number }) {
    return formatSetRowLine({ type: kind, reps: set.reps, weight: set.weight, durationSeconds: set.durationSeconds, unitLabel: labels });
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const reps = Number(values.get('reps'));
    const weight = Number(values.get('weight'));
    const durationSeconds = Number(values.get('seconds'));
    if (kind === 'duration') {
      if (!Number.isFinite(durationSeconds) || durationSeconds < 1) return;
      logSet(exercise.exerciseId, { reps: 0, weight: 0, durationSeconds });
    } else {
      if (!Number.isInteger(reps) || reps < 1 || !Number.isFinite(weight) || weight < 0) return;
      logSet(exercise.exerciseId, { reps, weight });
    }
  }
  return <section className="exercise-panel">
    <div className="eyebrow muted">MOVEMENT / {getExerciseById(exercise.exerciseId)?.equipment ?? 'Notebook'}</div>
    <h2>{exerciseName(exercise.exerciseId)}</h2>
    <p className="subtle">{next ? `Target: ${display(next)}` : prior ? `Last time: ${display(prior)}` : 'Start where you are.'}</p>
    {logged.length > 0 && <ol className="set-list" aria-label="Logged sets">
      {logged.map((set, i) => <li key={set.id}>
        <span className="set-number">{String(i + 1).padStart(2, '0')}</span>
        <strong>{display(set)}</strong>
        <button className="bare-button" onClick={() => undoSet(exercise.exerciseId, set.id)} aria-label={`Undo set ${i + 1}`}>Undo</button>
      </li>)}
    </ol>}
    <form className="set-form" onSubmit={submit} key={next?.id ?? exercise.exerciseId}>
      <div className="set-inputs">
        {kind === 'duration' ? <label>Seconds<input name="seconds" type="number" inputMode="numeric" min="1" max="86400" required defaultValue={prior?.durationSeconds ?? ''} /></label> : <>
          <label>{loadLabel} ({labels})<input name="weight" type="number" inputMode="decimal" min="0" max="5000" step="any" required defaultValue={next?.weight ?? prior?.weight ?? 0} /></label>
          <label>Reps<input name="reps" type="number" inputMode="numeric" min="1" max="999" required defaultValue={next?.reps ?? prior?.reps ?? 8} /></label>
        </>}
      </div>
      <button className="button primary-button" type="submit">Log set <Icon name="check" /></button>
    </form>
  </section>;
}

function Rest({ until }: { until: number }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const update = () => setSeconds(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    update();
    if (!until) return;
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [until]);
  return seconds > 0 ? <span className="eyebrow rest-clock">REST {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span> : null;
}

function Train() {
  const { activeWorkout, addExercise, finish, start, restUntil } = useNotebook();
  const [current, setCurrent] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const active = activeWorkout;
  const exercise = active?.exercises.find((row) => row.exerciseId === current) ?? active?.exercises[0];
  const count = active?.exercises.reduce((n, row) => n + row.sets.filter((s) => s.completed).length, 0) ?? 0;
  const pickable = searchOpen
    ? EXERCISES.filter((item) => !active?.exercises.some((ex) => ex.exerciseId === item.id) &&
        item.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 10)
    : [];
  return <>
    <Heading index="02" label="LIVE SESSION" title="Train.">{active ? active.workoutName : 'Start a quick workout whenever you’re ready.'}</Heading>
    {!active ? <button className="button primary-button" onClick={() => start()}>Start workout <Icon name="arrow" /></button> : <>
      <div className="session-strip"><span className="eyebrow"><i /> {setCountLabel(count)} logged</span><Rest until={restUntil} /></div>
      <div className="move-row" aria-label="Movements in workout">
        {active.exercises.map((row, i) => <button key={`${row.exerciseId}-${i}`} className="chip" aria-pressed={row === exercise} onClick={() => setCurrent(row.exerciseId)}>{exerciseName(row.exerciseId)}</button>)}
        <button className="chip add-chip" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><Icon name="plus" size={15} /> Add movement</button>
      </div>
      {searchOpen && <section className="note-panel search-panel">
        <label>Find a movement<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name an exercise…" /></label>
        {pickable.length === 0 ? <p>No matching movements.</p> : <ul className="search-results">{pickable.map((item) =>
          <li key={item.id}><button className="bare-button" onClick={() => { addExercise(item.id); setCurrent(item.id); setSearchOpen(false); setSearch(''); }}>
            {item.name}<Icon name="plus" size={16} />
          </button></li>
        )}</ul>}
      </section>}
      {exercise && <SetEntry key={exercise.exerciseId} exercise={exercise} />}
      <div className="finish-row">
        <p className="subtle">{count ? 'Only completed sets go into History.' : 'Log a set to finish this workout.'}</p>
        <button className="button outline-button" disabled={count === 0} onClick={() => { if (finish()) go('/victory'); }}>Finish workout <Icon name="arrow" /></button>
      </div>
    </>}
  </>;
}

function Victory() {
  const { workoutHistory, lastFinishedId } = useNotebook();
  const log = workoutHistory.find((entry) => entry.id === lastFinishedId && !entry.deletedAt) ??
    workoutHistory.find((entry) => !entry.deletedAt);
  return <>
    <Heading index="03" label="SESSION RECEIPT" title="Victory.">{log ? 'The work is in your notebook.' : 'Finish a workout to see its receipt here.'}</Heading>
    {log ? <>
      <section className="victory-panel">
        <div className="eyebrow stamp"><Icon name="check" size={15} /> COMPLETE · {shortDate(log.completedAt)}</div>
        <h2>{log.workoutName}</h2>
        <div className="receipt-stats">
          <div><strong>{setsIn(log)}</strong><span>{setsIn(log) === 1 ? 'SET' : 'SETS'}</span></div>
          <div><strong>{log.exercises.length}</strong><span>{log.exercises.length === 1 ? 'MOVEMENT' : 'MOVEMENTS'}</span></div>
          <div><strong>{Math.floor(log.durationSeconds / 60)}:{String(log.durationSeconds % 60).padStart(2, '0')}</strong><span>ELAPSED</span></div>
        </div>
      </section>
      <div className="action-row"><AppLink href="/coach" className="button primary-button">Plan with Coach <Icon name="arrow" /></AppLink><AppLink href="/history" className="button outline-button">View History</AppLink></div>
    </> : <AppLink href="/active" className="button primary-button">Open Train <Icon name="arrow" /></AppLink>}
  </>;
}

function sessionDate(weekStart: string, offset: number) {
  const [year, month, day] = weekStart.split('-').map(Number);
  const date = new Date(year, month - 1, day + offset, 12);
  return formatLocalDateKey(localDateKey(date), 'en', { weekday: 'short', month: 'short', day: 'numeric' });
}

function sessionLabel(session: PlanSession) {
  return session.status === 'done' ? 'Complete' : session.kind;
}

function Coach() {
  const { plan, workoutHistory, units, makePlan, start } = useNotebook();
  const [equipment, setEquipment] = useState<EquipmentProfile>(plan?.equipmentProfile ?? 'bodyweight');
  const [days, setDays] = useState(plan?.daysPerWeek ?? 3);
  const citation = coachCitationFact(coachLogCitation(workoutHistory), 'en', weightUnitLabel(units));
  return <>
    <Heading index="04" label="THE WEEK AHEAD" title="Coach.">A week that fits the equipment you have and the training you’ve logged.</Heading>
    <aside className="citation">
      <span className="eyebrow"><Icon name="coach" size={16} /> {citation ? 'FROM YOUR LOG' : 'NO LOGS YET'}</span>
      <p>{citation ?? 'Log a set for Coach to use. A starter week can still use your equipment and schedule.'}</p>
    </aside>
    <form className="plan-form note-panel" onSubmit={(event) => { event.preventDefault(); makePlan(equipment, days); }}>
      <label>Equipment<select value={equipment} onChange={(event) => setEquipment(event.target.value as EquipmentProfile)}>
        <option value="bodyweight">Bodyweight</option><option value="dumbbells">Dumbbells</option><option value="full-gym">Full gym</option>
      </select></label>
      <label>Days per week<select value={days} onChange={(event) => setDays(Number(event.target.value))}>
        {[2, 3, 4, 5, 6].map((day) => <option key={day}>{day}</option>)}
      </select></label>
      <button type="submit" className={`button ${plan ? 'outline-button' : 'primary-button'}`}>{plan ? 'Rebuild week' : 'Generate week'} <Icon name="arrow" /></button>
    </form>
    {plan && <section className="plan-week" aria-label="Week plan">
      <div className="section-rule"><h2>Week of {formatLocalDateKey(plan.weekStart, 'en', { month: 'short', day: 'numeric' })}</h2><span className="eyebrow muted">{plan.sessions.length} SESSIONS</span></div>
      <div className="plan-list">{[...plan.sessions].sort((a, b) => a.dayOffset - b.dayOffset).map((session) => <details className="plan-card" key={session.id}>
        <summary><span><span className="eyebrow muted">{sessionDate(plan.weekStart, session.dayOffset)} · {sessionLabel(session)}</span><strong>{session.name}</strong></span><Icon name="plus" size={19} /></summary>
        <ul>{session.exercises.map((exercise, index) => <li key={`${exercise.exerciseId}-${index}`}><span>{exerciseName(exercise.exerciseId)}</span><strong>{exercise.sets} × {exercise.reps}</strong></li>)}</ul>
        {session.status !== 'done' && <button className="button primary-button" onClick={() => { start(session); go('/active'); }}>Start session <Icon name="arrow" /></button>}
      </details>)}</div>
    </section>}
  </>;
}

function History() {
  const { workoutHistory, units } = useNotebook();
  const logs = workoutHistory.filter((log) => !log.deletedAt);
  return <>
    <Heading index="05" label="COMPLETED WORK" title="History.">The sets you actually did, not the ones you planned.</Heading>
    {logs.length ? <section className="history-list" aria-label="Completed workouts">{logs.map((log) => <details className="plan-card" key={log.id}>
      <summary><span><span className="eyebrow muted">{shortDate(log.completedAt)} · {setCountLabel(setsIn(log))}</span><strong>{log.sessionTitle ?? log.workoutName}</strong></span><Icon name="plus" size={19} /></summary>
      {log.exercises.map((exercise, i) => <div className="history-movement" key={`${exercise.exerciseId}-${i}`}><h3>{exerciseName(exercise.exerciseId)}</h3>
        <ul>{exercise.sets.map((set, j) => <li key={j}><span>Set {j + 1}</span><strong>{formatSetRowLine({ ...set, type: exerciseRowType(exercise.exerciseId), unitLabel: weightUnitLabel(units) })}</strong></li>)}</ul>
        {exercise.note && <p>{exercise.note}</p>}
      </div>)}
    </details>)}</section> : <section className="note-panel empty-panel"><div className="eyebrow muted">NO WORKOUTS YET</div><h2>Your first session goes here.</h2><AppLink href="/active" className="text-link">Open Train <Icon name="arrow" size={17} /></AppLink></section>}
  </>;
}

function You() {
  const { workoutHistory, hydrate, deleteWorkout, eraseDevice } = useNotebook();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const logs = workoutHistory.filter((log) => !log.deletedAt);
  async function importFile(file: File) {
    try {
      const result = restoreBackupFromJson(await file.text());
      if (result.ok) hydrate();
      const added = result.workoutsMerged ?? 0;
      setMessage({ ok: result.ok, text: result.ok
        ? `Backup imported. ${added} ${added === 1 ? 'workout' : 'workouts'} added.`
        : result.error ?? 'Backup could not be imported.' });
    } catch {
      setMessage({ ok: false, text: 'Could not read this backup file.' });
    }
  }
  return <>
    <Heading index="06" label="DEVICE & DATA" title="You.">Your notebook belongs to you. Keep a copy before changing devices.</Heading>
    {message && <p className={`notice ${message.ok ? '' : 'danger'}`} role={message.ok ? 'status' : 'alert'}>{message.text}</p>}
    <section className="note-panel data-panel">
      <div className="eyebrow muted">PORTABLE BACKUP</div><h2>Take your training with you.</h2>
      <p>Use the same Mission Winning JSON format to bring your existing logs here or take them back.</p>
      <div className="action-row">
        <button className="button primary-button" onClick={() => { const result = downloadBackup(); setMessage({ ok: result.ok, text: result.ok ? 'Backup downloaded.' : result.error }); }}>Export backup <Icon name="arrow" /></button>
        <label className="button outline-button file-button">Import backup
          <input aria-label="Import backup" type="file" accept="application/json,.json" onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) void importFile(file);
          }} />
        </label>
      </div>
    </section>
    <section className="note-panel data-panel">
      <div className="eyebrow muted">LOCAL STORAGE</div><h2>Manage this notebook.</h2>
      <p>Nothing is uploaded here. Removing data on this device doesn’t change another copy.</p>
      {logs.length > 0 && <label>Delete one workout<select value={confirm && confirm !== 'all' ? confirm : ''} onChange={(event) => setConfirm(event.target.value || null)}>
        <option value="">Select a workout</option>{logs.map((log) => <option key={log.id} value={log.id}>{log.workoutName} · {shortDate(log.completedAt)}</option>)}
      </select></label>}
      <div className="action-row">
        {confirm && confirm !== 'all' && <button className="button outline-button" onClick={() => { deleteWorkout(confirm); setConfirm(null); setMessage({ ok: true, text: 'Workout removed from History.' }); }}>Delete selected workout</button>}
        {confirm !== 'all' && <button className="bare-button danger-link" onClick={() => setConfirm('all')}>Delete app data from this device…</button>}
      </div>
      {confirm === 'all' && <div className="notice danger" role="group" aria-label="Confirm device deletion">
        <p>This removes workouts, in-progress sessions, plans, and other Mission Winning keys on this device. Export first if you want to keep them.</p>
        <div className="action-row"><button className="button primary-button" onClick={() => { const ok = eraseDevice(); setConfirm(null); setMessage({ ok, text: ok ? 'App data deleted from this device.' : 'The device refused part of the deletion.' }); }}>Delete app data</button><button className="button outline-button" onClick={() => setConfirm(null)}>Cancel</button></div>
      </div>}
    </section>
  </>;
}
