import type { WorkoutExerciseTemplate } from '@/types';
import { DEFAULT_EQUIPMENT, getStoredEquipment } from '@/lib/equipmentPrefs';
import { isLowImpactGated } from '@/lib/pathfinderAssessment';

export interface OfflinePlanSession {
  dayLabel: string;
  workoutName: string;
  exercises: WorkoutExerciseTemplate[];
}

export interface OfflinePlanTemplate {
  id: string;
  name: string;
  description: string;
  duration: string;
  equipment: 'bodyweight' | 'any';
  lowImpactOnly?: boolean;
  sessions: OfflinePlanSession[];
}

const BW = (id: string, reps: number, weight = 0): WorkoutExerciseTemplate => ({
  exerciseId: id,
  sets: [{ reps, weight }],
});

const PLANS: OfflinePlanTemplate[] = [
  {
    id: 'bodyweight-strength-4w',
    name: '4-Week Bodyweight Strength',
    description: 'No equipment. Build habit and strength — village, home, or schoolyard.',
    duration: '4 weeks · 3×/week',
    equipment: 'bodyweight',
    sessions: [
      {
        dayLabel: 'Week 1 — Day A',
        workoutName: 'Bodyweight Strength A',
        exercises: [BW('push-ups', 10), BW('squats', 12), BW('glute-bridge', 12), BW('plank', 30)],
      },
      {
        dayLabel: 'Week 1 — Day B',
        workoutName: 'Bodyweight Strength B',
        exercises: [BW('lunges', 10), BW('inverted-row', 8), BW('superman', 10), BW('couch-stretch', 45)],
      },
      {
        dayLabel: 'Week 2 — Day A',
        workoutName: 'Bodyweight Strength A+',
        exercises: [BW('push-ups', 12), BW('squats', 15), BW('glute-bridge', 15), BW('plank', 40)],
      },
      {
        dayLabel: 'Week 2 — Day B',
        workoutName: 'Bodyweight Strength B+',
        exercises: [BW('lunges', 12), BW('inverted-row', 10), BW('mountain-climbers', 20), BW('cat-camel', 8)],
      },
    ],
  },
  {
    id: 'mobility-recovery-4w',
    name: '4-Week Mobility & Recovery',
    description: 'Daily maintenance flow — low strain, high consistency. Works offline.',
    duration: '4 weeks · daily option',
    equipment: 'bodyweight',
    sessions: [
      {
        dayLabel: 'Flow 1',
        workoutName: 'Mobility Reset',
        exercises: [BW('cat-camel', 8), BW('worlds-greatest-stretch', 3), BW('couch-stretch', 45), BW('thread-needle', 6)],
      },
      {
        dayLabel: 'Flow 2',
        workoutName: 'Joint Care Circuit',
        exercises: [BW('bird-dog', 8), BW('glute-bridge', 12), BW('wall-sit', 30), BW('dead-bug', 10)],
      },
    ],
  },
  {
    id: 'pathfinder-gentle-4w',
    name: 'Pathfinder Gentle 4-Week',
    description: 'For limited doctor access or high assessment flags. Low impact only.',
    duration: '4 weeks · gentle',
    equipment: 'bodyweight',
    lowImpactOnly: true,
    sessions: [
      {
        dayLabel: 'Session 1',
        workoutName: 'Gentle Mobility + Breath',
        exercises: [BW('cat-camel', 6), BW('bird-dog', 5), BW('couch-stretch', 40), BW('glute-bridge', 8)],
      },
      {
        dayLabel: 'Session 2',
        workoutName: 'Easy Movement Win',
        exercises: [BW('wall-sit', 20), BW('superman', 6), BW('thread-needle', 5), BW('plank', 20)],
      },
    ],
  },
];

export function getOfflinePlan(id: string): OfflinePlanTemplate | undefined {
  return PLANS.find((p) => p.id === id);
}

export function listOfflinePlans(opts?: {
  equipment?: string;
  lowImpactOnly?: boolean;
}): OfflinePlanTemplate[] {
  const equipment = opts?.equipment ?? getStoredEquipment();
  const lowImpact = opts?.lowImpactOnly ?? isLowImpactGated();
  return PLANS.filter((p) => {
    if (lowImpact) {
      return Boolean(p.lowImpactOnly) || p.id === 'mobility-recovery-4w';
    }
    if (equipment === 'bodyweight') {
      return p.equipment === 'bodyweight';
    }
    return true;
  });
}

export function defaultOfflinePlanId(): string {
  if (isLowImpactGated()) return 'pathfinder-gentle-4w';
  if (getStoredEquipment() === DEFAULT_EQUIPMENT) return 'bodyweight-strength-4w';
  return 'bodyweight-strength-4w';
}
