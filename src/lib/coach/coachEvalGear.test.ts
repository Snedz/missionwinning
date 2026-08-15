/**
 * GNT-2 U4 — a generated week only ever prescribes gear the athlete declared.
 *
 * `equipment.test.ts` already exists and already filters the catalog rather than
 * naming ids, so it looks like this bar. It is not, for the reason U2 recorded
 * about `progression.test.ts`: that file tests the **predicate**
 * (`equipmentMatches`), and this bar is about the **planned week**. A planner
 * that computes the filter and then discards it at `generateWeek` passes
 * `equipment.test.ts` untouched.
 *
 * Two facts make the difference concrete, both measured in source.
 *
 * **1. The catalog is 130 in tests and 233 in production.** `src/data/exercises.ts`
 * ships a base `EXERCISES` array and an `ensureFullExerciseCatalog()` that loads
 * `exercisesExtended.ts` and grows it in place. Every existing test — including
 * `equipment.test.ts` — runs against the base only, so **103 shipped exercises
 * have never been gear-checked by anything**. Relative to what production loads,
 * the base catalog *is* an enumeration. That is what "discover the catalog, not
 * a few ids" has to mean here, and `MIN_FULL_CATALOG` is the ratchet that makes
 * the claim falsifiable: drop the load and this file goes red instead of quietly
 * measuring the smaller universe.
 *
 * **2. Recovery days do not consult the gear filter at all.** `selector.ts`
 * builds strength (`:124`) and conditioning (`:133`) candidates through
 * `equipmentMatches`, but `pickRecoveryExercises` (`:94`) maps a hard-coded
 * `RECOVERY_IDS` constant straight to prescriptions. All eight ids happen to be
 * `Bodyweight` today, so the guarantee holds by the contents of a list rather
 * than by construction — one banded stretch added there ships a bodyweight
 * athlete something they cannot do. So the sweep covers a **strained** week,
 * where recovery days are actually generated, not just a cold one.
 *
 * The profile axis is discovered too: `EquipmentProfile` is a type union with no
 * runtime list, so it is parsed out of `types.ts`. A fourth profile added without
 * gear coverage fails here rather than passing silently.
 *
 * No date literals — the week start is the current local Monday.
 *
 * This documents today's behaviour, which is green. It is not a request to
 * rewrite `pickRecoveryExercises`.
 */
import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { EXERCISES, ensureFullExerciseCatalog } from '@/data/exercises';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { equipmentMatches } from '@/lib/coach/equipment';
import type { EquipmentProfile } from '@/lib/coach/types';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';

/**
 * Catalog size the full load must still reach. Ratchet **up** only — it exists
 * to fail when this file is measuring the 130-entry base slice again.
 */
const MIN_FULL_CATALOG = 233;

/** Size of the base array before `ensureFullExerciseCatalog()`, captured at import. */
const BASE_CATALOG_SIZE = EXERCISES.length;

/** Trailing hard-log counts: cold, then strained enough to generate recovery days. */
const COLD = 0;
const STRAINED = 20;

const DAY = 86_400_000;

/** Same shape as the U1 and U3 engine pins, so all three describe one planner. */
function hardLog(daysAgo: number): CompletedWorkoutLog {
  return {
    id: `gear-${daysAgo}`,
    clientId: `gear-${daysAgo}`,
    workoutName: 'Hard lower',
    startedAt: new Date(Date.now() - daysAgo * DAY - 3_600_000).toISOString(),
    completedAt: new Date(Date.now() - daysAgo * DAY).toISOString(),
    durationSeconds: 7_200,
    exercises: [
      { exerciseId: 'squat', muscleGroups: ['Legs'], sets: [{ reps: 5, weight: 140, kind: 'normal' }] },
    ],
    totalVolume: 80_000,
    revision: 1,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * The profiles, read out of the type rather than retyped here.
 *
 * `EquipmentProfile` is a bare union with no runtime counterpart, so an
 * enumeration in this file would be a list that silently stops matching the
 * product. Parsing it means a fourth profile fails until it is covered.
 */
function declaredProfiles(): EquipmentProfile[] {
  const src = readFileSync(path.join(import.meta.dirname, 'types.ts'), 'utf8');
  const line = /export type EquipmentProfile\s*=\s*([^;]+);/.exec(src);
  assert.ok(line, 'EquipmentProfile is no longer a union in coach/types.ts — re-derive this reader');
  const found = [...line[1].matchAll(/'([^']+)'/g)].map((m) => m[1] as EquipmentProfile);
  assert.ok(found.length > 0, 'parsed no profiles out of EquipmentProfile');
  return found;
}

const PROFILES = declaredProfiles();

function weekFor(profile: EquipmentProfile, logCount: number) {
  const ctx = buildCoachContextFromInputs({
    history: Array.from({ length: logCount }, (_, i) => hardLog(i)),
    experience: 'intermediate',
    equipment: profile,
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: 'gnt2-u4',
    includeCheckIn: false,
  });
  const monday = localDateKey(startOfLocalWeek(new Date()));
  return generateWeek(ctx, monday, 1, monday);
}

before(async () => {
  await ensureFullExerciseCatalog();
});

test('the instrument measures the full catalog, not the base slice', () => {
  assert.ok(
    EXERCISES.length >= MIN_FULL_CATALOG,
    `catalog is ${EXERCISES.length}, floor ${MIN_FULL_CATALOG} — ` +
      `ensureFullExerciseCatalog() did not run, so every assertion below is measuring a subset`
  );
  assert.ok(
    EXERCISES.length > BASE_CATALOG_SIZE,
    `the full catalog (${EXERCISES.length}) is no larger than the base one (${BASE_CATALOG_SIZE}); ` +
      `if the extended catalog was folded in, drop this file's load and re-derive MIN_FULL_CATALOG`
  );
});

test('every declared equipment profile is exercised', () => {
  // Preconditions, not decoration: the sweep below is only as wide as this list.
  assert.ok(PROFILES.length >= 3, `only ${PROFILES.length} profile(s) parsed: ${PROFILES.join(', ')}`);
  for (const profile of PROFILES) {
    const pool = EXERCISES.filter((ex) => equipmentMatches(ex, profile));
    assert.ok(pool.length > 0, `profile \`${profile}\` matches nothing in the catalog — it cannot be planned for`);
  }
});

test('a generated week only prescribes gear the athlete declared', () => {
  const byId = new Map(EXERCISES.map((ex) => [ex.id, ex]));
  let recoverySessionsSeen = 0;

  for (const profile of PROFILES) {
    for (const logCount of [COLD, STRAINED]) {
      const plan = weekFor(profile, logCount);
      const where = `${profile} / ${logCount} logs`;

      const prescribed = plan.sessions.flatMap((s) =>
        s.exercises.map((e) => ({ id: e.exerciseId, kind: s.kind }))
      );
      assert.ok(prescribed.length > 0, `${where}: the week prescribed nothing, so nothing was checked`);
      recoverySessionsSeen += plan.sessions.filter((s) => s.kind === 'recovery').length;

      const unresolved = prescribed.filter((p) => !byId.has(p.id));
      assert.deepEqual(
        unresolved.map((p) => `${p.id} (${p.kind})`),
        [],
        `${where}: prescribed exercise ids that are not in the catalog`
      );

      const violations = prescribed.filter((p) => !equipmentMatches(byId.get(p.id)!, profile));
      assert.deepEqual(
        violations.map((p) => `${p.id} [${byId.get(p.id)!.equipment}] on a ${p.kind} day`),
        [],
        `${where}: prescribed exercises the declared gear cannot perform`
      );
    }
  }

  // The recovery path is the one that never calls `equipmentMatches`. If the
  // sweep stops generating recovery days, this file silently stops covering it.
  assert.ok(
    recoverySessionsSeen > 0,
    `no recovery session was generated across the sweep, so ${STRAINED} logs no longer reaches ` +
      `the pickRecoveryExercises path and its gear bypass is untested`
  );
});

test('the profile pools are nested, poorest gear first', () => {
  // `bodyweight ⊆ dumbbells ⊆ full-gym`. A break means the profiles are not a
  // ladder, and "declared gear" stops having a single meaning.
  const pools = PROFILES.map((profile) => ({
    profile,
    ids: new Set(EXERCISES.filter((ex) => equipmentMatches(ex, profile)).map((ex) => ex.id)),
  })).sort((a, b) => a.ids.size - b.ids.size);

  for (let i = 1; i < pools.length; i += 1) {
    const smaller = pools[i - 1];
    const larger = pools[i];
    const leaked = [...smaller.ids].filter((id) => !larger.ids.has(id));
    assert.deepEqual(
      leaked.slice(0, 5),
      [],
      `${leaked.length} exercise(s) allowed for \`${smaller.profile}\` are refused by the larger ` +
        `\`${larger.profile}\` pool — the gear profiles are not nested`
    );
  }
});
