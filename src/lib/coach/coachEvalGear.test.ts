/**
 * GNT-2 U4 — generateWeek programs only catalog ids legal for declared gear.
 *
 * `equipment.test.ts` discovers the catalog for the *predicate*. That is not
 * this bar. U1's discarded-`loadZone` class: a planner that computes
 * `equipmentMatches` and never uses it at `generateWeek` still passes the
 * unit test. `planEngine.test.ts` asserts `!exerciseId.includes('bench')` on
 * one persona — one spelling, date literal. This file calls `generateWeek`
 * and walks every programmed id against `EXERCISES`.
 *
 * Pins three properties a banned-id list cannot fake:
 *
 *   1. each week programs at least one exercise (precondition — fail, do not
 *      skip),
 *   2. every programmed id exists in `EXERCISES` (unknown id is not "sane"),
 *   3. every catalog hit passes `equipmentMatches` for that profile / kit.
 *
 * Profiles: bodyweight, dumbbells, full-gym, plus one Home gym kit overlay
 * on full-gym. Kit is declared gear.
 *
 * No date literals: the week is the current local Monday.
 * Do not enumerate banned ids.
 *
 * This documents today's behaviour. It is not a request to grow the catalog.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES } from '@/data/exercises';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { equipmentMatches } from '@/lib/coach/equipment';
import type { EquipmentProfile } from '@/lib/coach/types';
import { parseHomeGymKit, type HomeGymKit } from '@/lib/workout/homeGymKit';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';

const PROFILES = ['bodyweight', 'dumbbells', 'full-gym'] as const;

const GARAGE = parseHomeGymKit(['barbell', 'rack', 'plates', 'floor']);

function weekFor(profile: EquipmentProfile, kit: HomeGymKit | null = null) {
  const ctx = buildCoachContextFromInputs({
    history: [],
    experience: 'intermediate',
    equipment: profile,
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: `gnt2-u4-${profile}${kit ? '-kit' : ''}`,
    includeCheckIn: false,
    homeGymKit: kit,
  });
  const monday = localDateKey(startOfLocalWeek(new Date()));
  return generateWeek({ ...ctx, homeGymKit: kit }, monday, 1, monday);
}

function assertLegal(
  profile: EquipmentProfile,
  kit: HomeGymKit | null,
  label: string,
): void {
  const plan = weekFor(profile, kit);
  const ids = plan.sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId));
  assert.ok(ids.length > 0, `${label} programmed no exercises — do not skip`);

  const missing: string[] = [];
  const illegal: string[] = [];
  for (const id of ids) {
    const data = EXERCISES.find((e) => e.id === id);
    if (!data) {
      missing.push(id);
      continue;
    }
    if (!equipmentMatches(data, profile, kit)) illegal.push(id);
  }
  assert.deepEqual(missing, [], `${label} programmed ids not in EXERCISES: ${missing.join(', ')}`);
  assert.deepEqual(
    illegal,
    [],
    `${label} programmed ids equipmentMatches rejected: ${illegal.join(', ')}`,
  );
}

test('the catalog this instrument discovers is not empty', () => {
  assert.ok(EXERCISES.length > 0, 'EXERCISES is empty — the discover step found nothing');
});

test('generateWeek programs only catalog ids legal for the declared gear', () => {
  for (const profile of PROFILES) {
    assertLegal(profile, null, profile);
  }
  assertLegal('full-gym', GARAGE, 'full-gym+kit');
});
