import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { EXERCISES } from '@/data/exercises';
import { readRaw, remove } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import {
  HOME_GYM_ITEMS,
  kitMatchesExercise,
  kitRequirement,
  kitToAthleteHomeGymPick,
  kitToEquipmentProfile,
  kitToStorageEquipment,
  loadHomeGymKit,
  parseHomeGymKit,
  persistHomeGymKit,
  previewKitFromEquipment,
  seedHomeGymKitIfUnset,
  seedKitFromEquipmentProfile,
  toggleHomeGymItem,
} from '@/lib/workout/homeGymKit';

function kit(...items: string[]) {
  return parseHomeGymKit(items);
}

function ex(id: string) {
  const found = EXERCISES.find((e) => e.id === id);
  assert.ok(found, id);
  return found!;
}

describe('parseHomeGymKit', () => {
  it('clamps unknown keys and explicit empty is floor-only', () => {
    assert.deepEqual(parseHomeGymKit(['barbell', 'laser-grid', 'floor']).items, [
      'barbell',
      'floor',
    ]);
    assert.deepEqual(parseHomeGymKit([]).items, ['floor']);
    assert.deepEqual(parseHomeGymKit({ items: ['dumbbells'] }).items, ['dumbbells']);
  });
});

describe('$0 floor default', () => {
  it('empty save is floor-only bodyweight', () => {
    const empty = parseHomeGymKit([]);
    assert.deepEqual(empty.items, ['floor']);
    assert.equal(kitToEquipmentProfile(empty), 'bodyweight');
    assert.equal(kitToStorageEquipment(empty), 'bodyweight');
  });
});

describe('kitMatchesExercise', () => {
  it('barbell+rack matches squat; barbell without rack rejects squat and allows deadlift', () => {
    const withRack = kit('barbell', 'rack', 'floor');
    const barOnly = kit('barbell', 'floor');
    assert.equal(kitMatchesExercise(ex('squats'), withRack), true);
    assert.equal(kitMatchesExercise(ex('squats'), barOnly), false);
    assert.equal(kitMatchesExercise(ex('deadlift'), barOnly), true);
    assert.equal(kitMatchesExercise(ex('bench-press'), withRack), true);
    assert.equal(kitMatchesExercise(ex('bench-press'), barOnly), false);
  });

  it('floor-only rejects barbell, dumbbells, and machines', () => {
    const floor = kit('floor');
    assert.equal(kitMatchesExercise(ex('push-ups'), floor), true);
    assert.equal(kitMatchesExercise(ex('deadlift'), floor), false);
    assert.equal(kitMatchesExercise(ex('bicep-curl'), floor), false);
    assert.equal(kitMatchesExercise(ex('leg-press'), floor), false);
  });

  it('pull-ups need a pull-up bar even when catalog says Bodyweight', () => {
    const floor = kit('floor');
    const bar = kit('floor', 'pull-up-bar');
    assert.deepEqual(kitRequirement(ex('pull-ups')), ['pull-up-bar']);
    assert.equal(kitMatchesExercise(ex('pull-ups'), floor), false);
    assert.equal(kitMatchesExercise(ex('pull-ups'), bar), true);
  });

  it('catalog Bench matches floor or rack', () => {
    const bench = {
      id: 'bench-dip',
      name: 'Bench dip',
      muscleGroups: ['Chest'] as const,
      equipment: 'Bench',
    };
    assert.deepEqual(kitRequirement(bench as never), []);
    assert.equal(kitMatchesExercise(bench as never, kit('floor')), true);
    assert.equal(kitMatchesExercise(bench as never, kit('rack')), true);
    assert.equal(kitMatchesExercise(bench as never, kit('dumbbells')), false);
  });

  it('commercial machines never match a garage kit', () => {
    const industrial = kit(...HOME_GYM_ITEMS);
    assert.equal(kitMatchesExercise(ex('leg-press'), industrial), false);
    assert.equal(kitRequirement(ex('leg-press')), 'commercial');
  });
});

describe('seed / preview / identity emit', () => {
  it('seeds bodyweight and dumbbells; full-gym stays unset', () => {
    assert.deepEqual(seedKitFromEquipmentProfile('bodyweight')?.items, ['floor']);
    assert.deepEqual(seedKitFromEquipmentProfile('dumbbells')?.items, ['floor', 'dumbbells']);
    assert.equal(seedKitFromEquipmentProfile('full-gym'), null);
  });

  it('full-gym preview shows all six without being a seed write', () => {
    assert.deepEqual(previewKitFromEquipment('full-gym').items, [...HOME_GYM_ITEMS]);
  });

  it('identity map is one-way onto existing table picks', () => {
    assert.equal(kitToAthleteHomeGymPick(kit('floor')), 'bodyweight-only');
    assert.equal(kitToAthleteHomeGymPick(kit('floor', 'dumbbells')), 'dumbbells');
    assert.equal(kitToAthleteHomeGymPick(kit('barbell', 'rack', 'floor')), 'rack-bars');
  });
});

describe('toggleHomeGymItem', () => {
  it('unchecking the last item returns floor, not empty', () => {
    const next = toggleHomeGymItem(kit('floor'), 'floor');
    assert.deepEqual(next.items, ['floor']);
  });
});

describe('persist / seed', () => {
  it('writes kit and derived mw_equipment', () => {
    remove(STORAGE_KEYS.homeGymKit);
    remove(STORAGE_KEYS.equipment);
    persistHomeGymKit(kit('barbell', 'rack', 'floor'));
    assert.deepEqual(loadHomeGymKit()?.items, ['barbell', 'rack', 'floor']);
    assert.equal(readRaw(STORAGE_KEYS.equipment), 'full-gym');
  });

  it('seed full-gym leaves kit unset so commercial gym is not stripped', () => {
    remove(STORAGE_KEYS.homeGymKit);
    seedHomeGymKitIfUnset('full-gym');
    assert.equal(loadHomeGymKit(), null);
  });

  it('seed bodyweight writes floor only and does not overwrite a later save', () => {
    remove(STORAGE_KEYS.homeGymKit);
    seedHomeGymKitIfUnset('bodyweight');
    assert.deepEqual(loadHomeGymKit()?.items, ['floor']);
    seedHomeGymKitIfUnset('dumbbells');
    assert.deepEqual(loadHomeGymKit()?.items, ['floor']);
  });
});

/**
 * Free path: discover kit files rather than list them. A paywall on a $0 garage
 * kit would be a new file or a premium import — both go red here.
 */
const repoRoot = path.join(import.meta.dirname, '..', '..', '..');

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === 'dist') continue;
      walkTs(full, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(name.name)) out.push(full);
  }
  return out;
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
}

const KIT_PRODUCT = [
  'src/lib/workout/homeGymKit.ts',
  'src/components/profile/HomeGymKitCard.tsx',
] as const;

const PAYWALL =
  /\b(isPremium|usePremium|isFreeBeta|Super Bundle|trial|checkout)\b/i;

describe('home gym kit is free', () => {
  it('discovers kit module + Account card; no premium/Bundle/trial', () => {
    const srcRoot = path.join(repoRoot, 'src');
    const discovered = walkTs(srcRoot)
      .filter((f) => /homeGymKit|HomeGymKitCard/i.test(path.basename(f)))
      .map((f) => path.relative(repoRoot, f).split(path.sep).join('/'))
      .sort();
    assert.ok(
      discovered.some((f) => f.endsWith('homeGymKit.ts')),
      `kit module missing from ${discovered.join(', ')}`,
    );
    assert.ok(
      discovered.some((f) => f.endsWith('HomeGymKitCard.tsx')),
      `Account card missing from ${discovered.join(', ')}`,
    );
    const product = discovered.filter((f) => !/\.test\.tsx?$/.test(f));
    assert.deepEqual(
      product,
      [...KIT_PRODUCT].sort(),
      'unreviewed kit file — add it here after checking it stays free, or delete the stale row',
    );
    for (const rel of product) {
      const src = stripComments(readFileSync(path.join(repoRoot, rel), 'utf8'));
      assert.doesNotMatch(src, PAYWALL, rel);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/(?:premium|checkout|bundleConfig)/, rel);
    }
    const locales = readFileSync(path.join(repoRoot, 'src/i18n/athleteLocales.ts'), 'utf8');
    for (const m of locales.matchAll(/homeGymKit\w+:\s*\n?\s*'([^']*)'/g)) {
      assert.doesNotMatch(m[1]!, PAYWALL, m[0]);
    }
  });
});
