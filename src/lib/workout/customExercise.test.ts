/**
 * Named custom on the live Train picker (`.990`).
 *
 * Empty invents nothing. Unlimited. Free. A catalog miss must not
 * unmount a live set row. Today stays one Start.
 */

import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'path';
import type { Exercise } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { remove } from '@/lib/storage/safeStorage';
import {
  CUSTOM_ID_PREFIX,
  decideNamedCustom,
  exerciseDisplayName,
  exercisesForPicker,
  humanizeExerciseId,
  loadCustomExercises,
  mintCustomId,
  normalizeCustomName,
  resolveExercise,
  upsertCustomExercise,
  type CustomExercise,
} from '@/lib/workout/customExercise';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const CATALOG: Exercise[] = [
  { id: 'bench-press', name: 'Bench Press', muscleGroups: ['Chest'] },
  { id: 'squat', name: 'Squat', muscleGroups: ['Legs'] },
];

afterEach(() => {
  remove(STORAGE_KEYS.customExercises);
});

function mem(rows: CustomExercise[] = []) {
  let stored = [...rows];
  let ids = 0;
  return {
    catalog: CATALOG,
    load: () => stored,
    save: (next: CustomExercise[]) => {
      stored = [...next];
      return true;
    },
    now: () => '2026-08-25T12:00:00.000Z',
    id: () => `00000000-0000-4000-8000-${String(++ids).padStart(12, '0')}`,
    get stored() {
      return stored;
    },
  };
}

describe('normalize + decide', () => {
  it('blank / whitespace invents nothing', () => {
    assert.equal(normalizeCustomName(''), '');
    assert.equal(normalizeCustomName('   '), '');
    assert.equal(normalizeCustomName('\n\t'), '');
    assert.equal(decideNamedCustom({ name: '   ', catalog: CATALOG, existing: [] }), null);
    assert.equal(upsertCustomExercise('  ', mem()), null);
  });

  it('catalog name (any case) picks the catalog and writes nothing', () => {
    const store = mem();
    assert.deepEqual(decideNamedCustom({ name: 'bench press', catalog: CATALOG, existing: [] }), {
      kind: 'catalog',
      id: 'bench-press',
    });
    assert.deepEqual(upsertCustomExercise('BENCH PRESS', store), {
      id: 'bench-press',
      name: 'Bench Press',
    });
    assert.equal(store.stored.length, 0);
  });

  it('new name creates custom- uuid; same name reuses', () => {
    const store = mem();
    const first = upsertCustomExercise('Landmine twist', store);
    assert.ok(first);
    assert.match(first.id, /^custom-/);
    assert.equal(first.name, 'Landmine twist');
    assert.equal(store.stored.length, 1);
    const again = upsertCustomExercise('landmine twist', store);
    assert.deepEqual(again, first);
    assert.equal(store.stored.length, 1);
  });

  it('eight distinct names all persist — no cap', () => {
    const store = mem();
    const names = [
      'Landmine twist',
      'Jefferson curl',
      'Sissy squat',
      'Z-press',
      'Meadows row',
      'Viking press',
      'Pendlay row pause',
      'Safety-bar good morning',
    ];
    const ids = new Set<string>();
    for (const name of names) {
      const row = upsertCustomExercise(name, store);
      assert.ok(row, `refused ${name}`);
      ids.add(row.id);
    }
    assert.equal(ids.size, 8);
    assert.equal(store.stored.length, 8);
  });
});

describe('resolve + picker list', () => {
  it('catalog hit / notebook hit / leftover slug still paint', () => {
    const store = mem([
      { id: 'custom-aaaa', name: 'Landmine twist', createdAt: '2026-08-25T12:00:00.000Z' },
    ]);
    assert.equal(resolveExercise('bench-press', store)?.name, 'Bench Press');
    assert.equal(resolveExercise('custom-aaaa', store)?.name, 'Landmine twist');
    const leftover = resolveExercise('landmine-twist', store);
    assert.ok(leftover);
    assert.equal(leftover.id, 'landmine-twist');
    assert.equal(leftover.name, 'landmine twist');
    assert.deepEqual(leftover.muscleGroups, []);
    assert.equal(resolveExercise('', store), null);
    assert.equal(resolveExercise('   ', store), null);
    assert.equal(exerciseDisplayName('custom-aaaa', store), 'Landmine twist');
  });

  it('picker lists theirs plus catalog — never seeds a fake row', () => {
    const empty = mem();
    assert.deepEqual(
      exercisesForPicker(CATALOG, empty).map((e) => e.id),
      ['bench-press', 'squat']
    );
    const named = mem([
      { id: 'custom-aaaa', name: 'Landmine twist', createdAt: '2026-08-25T12:00:00.000Z' },
    ]);
    assert.deepEqual(
      exercisesForPicker(CATALOG, named).map((e) => e.id),
      ['custom-aaaa', 'bench-press', 'squat']
    );
  });

  it('humanize leftover uuid is Custom; slug keeps words', () => {
    assert.equal(humanizeExerciseId('custom-aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'), 'Custom');
    assert.equal(humanizeExerciseId('landmine-twist'), 'landmine twist');
    assert.equal(humanizeExerciseId(''), '');
    assert.match(mintCustomId(() => 'deadbeef-0000'), /^custom-deadbeef-0000$/);
  });

  it('device notebook persists and drops blank rows', () => {
    const created = upsertCustomExercise('Jefferson curl');
    assert.ok(created);
    const loaded = loadCustomExercises();
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0]?.name, 'Jefferson curl');
    assert.match(loaded[0]?.id ?? '', new RegExp(`^${CUSTOM_ID_PREFIX}`));
    assert.equal(resolveExercise(created.id)?.name, 'Jefferson curl');
  });
});

describe('live list + picker wiring', () => {
  it('ActiveExerciseList resolves — catalog miss no longer unmounts', () => {
    const src = read('src/components/workout/ActiveExerciseList.tsx');
    assert.match(src, /const exercise = resolveExercise\(exLog\.exerciseId\)/);
    assert.doesNotMatch(src, /getExerciseById/);
  });

  it('picker invents on a typed miss and keeps the e2e add contract', () => {
    const picker = read('src/components/library/ExercisePicker.tsx');
    assert.match(picker, /exercisesForPicker/);
    assert.match(picker, /decideNamedCustom/);
    assert.match(picker, /exercise-picker-use-name/);
    assert.match(picker, /exercisePickerUseName/);
    assert.match(picker, /Search exercises/);
    assert.match(picker, /role="option"/);
    assert.doesNotMatch(picker, /UnlockButton|isPremium|\/bundle/);
    assert.doesNotMatch(picker, /video required|300\+|400 Exercises/i);

    const sheet = read('src/components/workout/AddExerciseSheet.tsx');
    assert.match(sheet, /Add selected exercise/);
    assert.match(sheet, /ExercisePicker/);
    const sheets = read('src/components/workout/ActiveWorkoutSheets.tsx');
    assert.match(sheets, /resolveExercise/);

    const inline = read('src/components/workout/ActiveInlineAddExercise.tsx');
    assert.match(inline, /resolveExercise/);
    assert.doesNotMatch(inline, /getExerciseById/);
  });

  it('diary / Repeat last / Victory resolve the typed name; Library stays catalog', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(page, /resolveExercise|exerciseDisplayName/);
    const history = read('src/page-components/HistoryPage.tsx');
    assert.match(history, /resolveExercise|exerciseDisplayName/);
    assert.match(history, /decideRepeatThisSession|decideStartAgain/);
    const startAgain = read('src/lib/workout/startAgain.ts');
    assert.match(startAgain, /templateFromCompletedLog/);
    const library = read('src/page-components/LibraryPage.tsx');
    assert.doesNotMatch(library, /customExercise|loadCustomExercises|exercisesForPicker/);
    assert.match(library, /from '@\/data\/exercises'/);
  });
});

describe('refuse + Today lock + first set', () => {
  const BANNED_IMPORT =
    /from\s+['"]@\/lib\/(?:premium|rewards|identity|social|wearables|speech|sync\/)/;

  it('helper does not import premium / rewards / social / Health / speech', () => {
    const src = read('src/lib/workout/customExercise.ts');
    assert.doesNotMatch(src, BANNED_IMPORT);
    assert.doesNotMatch(src, /MAX_CUSTOM|CUSTOM_CAP|freeCap\b/);
    assert.doesNotMatch(src, /UnlockButton|isPremium|\/bundle/);
  });

  it('lean Today still one Start; last-vs-this stays on the strip cell', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, /BodyMetricsCard/);
    assert.doesNotMatch(lean, /TodayMetricsSparklineRow/);
    assert.doesNotMatch(lean, /from ['"]@\/components\/today\/Sparkline['"]/);
    assert.doesNotMatch(lean, /exercise-picker-use-name/);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.match(strip, /quiet-week-track-trend/);
  });

  it('Train / picker / helper never mount a login wall', () => {
    const files = [
      'src/lib/workout/customExercise.ts',
      'src/components/library/ExercisePicker.tsx',
      'src/components/workout/AddExerciseSheet.tsx',
      'src/components/workout/ActiveInlineAddExercise.tsx',
      'src/components/workout/ActiveExerciseList.tsx',
    ];
    for (const rel of files) {
      assert.ok(existsSync(path.join(root, rel)), rel);
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, `${rel} login wall`);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, `${rel} sync wall`);
      assert.doesNotMatch(src, /discord\.com|WeChat|Health gate/i, `${rel} refused surface`);
    }
  });
});
