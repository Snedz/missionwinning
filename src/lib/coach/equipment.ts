import type { Exercise } from '@/types';
import type { EquipmentProfile } from '@/lib/coach/types';
import { kitMatchesExercise, type HomeGymKit } from '@/lib/workout/homeGymKit';

const BODYWEIGHT_EQ = new Set([
  'bodyweight',
  'chair/bench',
  'box',
]);

const DUMBBELLS_KIT: HomeGymKit = { items: ['dumbbells', 'floor'] };
const EXTRA_GEAR_IN_SETUP = /\b(?:bench(?:es)?|chair|box|block|platform|rack|smith machine|stability ball|swiss ball|exercise ball|foam roller|sliders?|step[- ]ups?|elevated|anchor(?:ed)? (?:your )?feet|ankles? under|jump rope)\b/i;

const FULL_GYM_ONLY = new Set(['sled', 'tire', 'various']);

function normalizeEquipment(eq?: string): string {
  if (!eq) return 'bodyweight';
  return eq.trim().toLowerCase();
}

function matchesBodyweight(eq: string): boolean {
  if (BODYWEIGHT_EQ.has(eq)) return true;
  if (eq.startsWith('bodyweight')) return true;
  if (eq.includes('chair') || eq.includes('bench') && !eq.includes('barbell')) return true;
  if (eq === 'box') return true;
  const base = eq.split('/')[0].trim();
  return BODYWEIGHT_EQ.has(base) || base.startsWith('bodyweight');
}

export function mapStorageEquipment(value: string): EquipmentProfile {
  const v = value.trim().toLowerCase();
  if (v === 'bodyweight' || v === 'bodyweight-only' || v.includes('bodyweight')) return 'bodyweight';
  if (v === 'dumbbells' || v === 'home-gym') return 'dumbbells';
  return 'full-gym';
}

export function equipmentMatches(
  ex: Exercise,
  profile: EquipmentProfile,
  kit?: HomeGymKit | null
): boolean {
  const eq = normalizeEquipment(ex.equipment);

  if (profile === 'dumbbells') {
    return (eq === 'dumbbells' || eq === 'bodyweight') &&
      !EXTRA_GEAR_IN_SETUP.test(`${ex.name} ${ex.cues ?? ''}`) &&
      kitMatchesExercise(ex, DUMBBELLS_KIT) &&
      (!kit || kitMatchesExercise(ex, kit));
  }

  if (kit) return kitMatchesExercise(ex, kit);
  if (FULL_GYM_ONLY.has(eq) && profile !== 'full-gym') return false;

  if (profile === 'full-gym') return true;

  return matchesBodyweight(eq);
}
