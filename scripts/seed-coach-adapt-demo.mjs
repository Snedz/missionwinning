/**
 * Prints a browser DevTools snippet that seeds mw_coach_plan so /coach shows
 * CoachAdaptBanner (missed + swapped + revision > 1) for the 60s application demo.
 *
 * Usage: npm run seed-coach-adapt-demo
 * Then paste the printed IIFE into the console on missionwinning.com (or localhost).
 * Does not touch production databases or flip PRIVATE_MODE.
 */

function mondayOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const dd = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const weekStart = mondayOfWeek();

const plan = {
  revision: 3,
  weekStart,
  daysPerWeek: 4,
  generatedAt: new Date().toISOString(),
  contextHash: 'demo-adapt-seed',
  equipmentProfile: 'bodyweight',
  sessions: [
    {
      id: 'demo-missed-0',
      dayOffset: 0,
      kind: 'strength',
      name: 'Full body A',
      focusGroups: ['Chest', 'Back'],
      exercises: [
        {
          exerciseId: 'push-up',
          sets: 3,
          reps: 10,
          weight: 0,
          whyKey: 'coachWhyHold',
        },
      ],
      estMinutes: 35,
      status: 'missed',
    },
    {
      id: 'demo-swapped-today',
      dayOffset: 1,
      kind: 'recovery',
      name: 'Recovery (adapted)',
      focusGroups: ['Core', 'Back'],
      exercises: [
        {
          exerciseId: 'plank',
          sets: 3,
          reps: 30,
          weight: 0,
          whyKey: 'coachWhyRecovery',
        },
      ],
      estMinutes: 20,
      status: 'swapped',
    },
    {
      id: 'demo-planned-2',
      dayOffset: 3,
      kind: 'strength',
      name: 'Full body B',
      focusGroups: ['Legs'],
      exercises: [
        {
          exerciseId: 'squat-bodyweight',
          sets: 3,
          reps: 12,
          weight: 0,
          whyKey: 'coachWhyRepProgress',
        },
      ],
      estMinutes: 40,
      status: 'planned',
    },
    {
      id: 'demo-done-4',
      dayOffset: 4,
      kind: 'strength',
      name: 'Pull focus',
      focusGroups: ['Back'],
      exercises: [
        {
          exerciseId: 'pull-up',
          sets: 3,
          reps: 5,
          weight: 0,
          whyKey: 'coachWhyLoadUp',
        },
      ],
      estMinutes: 40,
      status: 'done',
    },
  ],
};

const json = JSON.stringify(plan);
const snippet = `(function(){localStorage.setItem('mw_coach_plan',${JSON.stringify(json)});localStorage.setItem('mw_coach_taster_used','1');window.dispatchEvent(new CustomEvent('mw-coach-plan-changed'));console.log('Mission Winning: coach adapt demo seeded. Open /coach');location.href='/coach';})();`;

console.log(`
seed-coach-adapt-demo
=====================
Week start: ${weekStart}
Plan: revision ${plan.revision}, missed + swapped sessions (CoachAdaptBanner)

1. Open https://www.missionwinning.com (or localhost:3000) — use private access code if needed.
2. DevTools → Console → paste the snippet below → Enter.
3. Confirm /coach shows "Adapted from your logs — no wearable needed".
4. Film the 60s demo (see docs/ACCELERATOR_SPRINT.md).

----- COPY BELOW -----
${snippet}
----- COPY ABOVE -----
`);
