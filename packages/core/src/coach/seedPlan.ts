import type { CoachPlan, EquipmentProfile } from './types';
import { weekStartMonday } from './types';

/**
 * Minimal offline week for native v1 / demos.
 * Full engine stays in src/lib/coach/planEngine.ts until fully ported.
 */
export function createSeedCoachPlan(opts?: {
  equipment?: EquipmentProfile;
  revision?: number;
  withAdaptDemo?: boolean;
}): CoachPlan {
  const weekStart = weekStartMonday();
  const equipment = opts?.equipment ?? 'bodyweight';
  const revision = opts?.revision ?? (opts?.withAdaptDemo ? 2 : 1);

  const sessions: CoachPlan['sessions'] = [
    {
      id: 'seed-mon',
      dayOffset: 0,
      kind: 'strength',
      name: 'Push + core',
      focusGroups: ['chest', 'shoulders'],
      exercises: [
        { exerciseId: 'pushup', sets: 3, reps: 10, weight: 0, whyKey: 'seed' },
        { exerciseId: 'plank', sets: 3, reps: 40, weight: 0, whyKey: 'seed' },
      ],
      estMinutes: 35,
      status: opts?.withAdaptDemo ? 'missed' : 'planned',
    },
    {
      id: 'seed-wed',
      dayOffset: 2,
      kind: 'strength',
      name: 'Legs + hinge',
      focusGroups: ['quads', 'glutes'],
      exercises: [
        { exerciseId: 'squat', sets: 3, reps: 12, weight: 0, whyKey: 'seed' },
        { exerciseId: 'hip-hinge', sets: 3, reps: 10, weight: 0, whyKey: 'seed' },
      ],
      estMinutes: 40,
      status: opts?.withAdaptDemo ? 'swapped' : 'planned',
    },
    {
      id: 'seed-fri',
      dayOffset: 4,
      kind: 'strength',
      name: 'Pull + carry',
      focusGroups: ['back', 'biceps'],
      exercises: [
        { exerciseId: 'row', sets: 3, reps: 10, weight: 0, whyKey: 'seed' },
        { exerciseId: 'chinup', sets: 3, reps: 6, weight: 0, whyKey: 'seed' },
      ],
      estMinutes: 35,
      status: 'planned',
    },
  ];

  if (opts?.withAdaptDemo) {
    sessions[1] = {
      ...sessions[1],
      kind: 'recovery',
      name: 'Recovery (adapted)',
      status: 'swapped',
      exercises: [{ exerciseId: 'walk', sets: 1, reps: 20, weight: 0, whyKey: 'adapt' }],
      estMinutes: 25,
    };
  }

  return {
    revision,
    weekStart,
    daysPerWeek: 3,
    sessions,
    generatedAt: new Date().toISOString(),
    contextHash: `seed-${equipment}-${revision}`,
    equipmentProfile: equipment,
  };
}

/** Mark a planned session done and bump revision (native log → adapt signal). */
export function markSessionDone(plan: CoachPlan, sessionId: string): CoachPlan {
  const sessions = plan.sessions.map((s) =>
    s.id === sessionId ? { ...s, status: 'done' as const } : s
  );
  return {
    ...plan,
    sessions,
    revision: plan.revision + 1,
    generatedAt: new Date().toISOString(),
    contextHash: `${plan.contextHash}-done-${sessionId}`,
  };
}
