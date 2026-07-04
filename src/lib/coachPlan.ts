/** Premium weekly plan generator — rule-based v1 (no LLM required). */

export type CoachPlanDay = {
  day: string;
  workoutName: string;
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[];
  focus: string;
};

export type CoachPlanInput = {
  goal?: string;
  equipment?: string;
  readiness: number;
  strain: number;
  recovery: number;
};

const BODYWEIGHT_WEEK: CoachPlanDay[] = [
  {
    day: 'Mon',
    workoutName: 'Coach — Full Body A',
    focus: 'Push + squat pattern',
    exercises: [
      { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { exerciseId: 'squats', sets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
      { exerciseId: 'plank', sets: [{ reps: 30, weight: 0 }] },
    ],
  },
  {
    day: 'Wed',
    workoutName: 'Coach — Mobility + Mind',
    focus: 'Recovery between strength days',
    exercises: [
      { exerciseId: 'cat-camel', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'bird-dog', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'glute-bridge', sets: [{ reps: 12, weight: 0 }] },
    ],
  },
  {
    day: 'Fri',
    workoutName: 'Coach — Full Body B',
    focus: 'Pull + hinge pattern',
    exercises: [
      { exerciseId: 'inverted-row', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
      { exerciseId: 'lunges', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { exerciseId: 'superman', sets: [{ reps: 10, weight: 0 }] },
    ],
  },
];

const GYM_WEEK: CoachPlanDay[] = [
  {
    day: 'Mon',
    workoutName: 'Coach — Upper Push',
    focus: 'Bench + accessories',
    exercises: [
      { exerciseId: 'bench-press', sets: [{ reps: 8, weight: 60 }, { reps: 8, weight: 60 }] },
      { exerciseId: 'overhead-press', sets: [{ reps: 8, weight: 40 }] },
      { exerciseId: 'tricep-pushdown', sets: [{ reps: 12, weight: 25 }] },
    ],
  },
  {
    day: 'Wed',
    workoutName: 'Coach — Lower',
    focus: 'Squat + hinge',
    exercises: [
      { exerciseId: 'squats', sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 80 }] },
      { exerciseId: 'romanian-deadlift', sets: [{ reps: 10, weight: 70 }] },
      { exerciseId: 'calf-raises', sets: [{ reps: 15, weight: 40 }] },
    ],
  },
  {
    day: 'Fri',
    workoutName: 'Coach — Pull',
    focus: 'Back + biceps',
    exercises: [
      { exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 60 }, { reps: 8, weight: 60 }] },
      { exerciseId: 'lat-pulldown', sets: [{ reps: 10, weight: 50 }] },
      { exerciseId: 'barbell-curl', sets: [{ reps: 10, weight: 30 }] },
    ],
  },
];

export function generateCoachPlan(input: CoachPlanInput): {
  summary: string;
  days: CoachPlanDay[];
  deload: boolean;
} {
  const deload = input.strain >= 70 || input.recovery < 40;
  const bodyweight =
    input.equipment === 'bodyweight' ||
    input.equipment === 'bodyweight-only' ||
    (input.equipment ?? '').includes('bodyweight');

  let days = bodyweight ? BODYWEIGHT_WEEK : GYM_WEEK;

  if (deload) {
    days = days.map((d) => ({
      ...d,
      workoutName: `${d.workoutName} (deload)`,
      exercises: d.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s, reps: Math.max(6, Math.round(s.reps * 0.7)) })),
      })),
    }));
  }

  const summary = deload
    ? 'High strain detected — this week emphasizes recovery volume with the same movement patterns.'
    : `Three-session week aligned to your ${input.goal || 'strength'} goal and ${bodyweight ? 'bodyweight' : 'gym'} setup.`;

  return { summary, days, deload };
}
