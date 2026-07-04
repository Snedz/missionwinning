import type { Exercise } from '@/types';
import type { EquipmentProfile } from '@/lib/coach/types';

const BODYWEIGHT_EQ = new Set([
  'bodyweight',
  'chair/bench',
  'box',
]);

const DUMBBELLS_EXTRA = new Set([
  'dumbbells',
  'kettlebell',
  'band',
  'bench',
  'medicine ball',
]);

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

export function equipmentMatches(ex: Exercise, profile: EquipmentProfile): boolean {
  const eq = normalizeEquipment(ex.equipment);

  if (FULL_GYM_ONLY.has(eq) && profile !== 'full-gym') return false;

  if (profile === 'full-gym') return true;

  if (profile === 'bodyweight') {
    return matchesBodyweight(eq);
  }

  // dumbbells profile
  const base = eq.split('/')[0].trim();
  return matchesBodyweight(eq) || DUMBBELLS_EXTRA.has(base) || DUMBBELLS_EXTRA.has(eq);
}
