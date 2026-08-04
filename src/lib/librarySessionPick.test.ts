import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LIBRARY_PICK_MAX,
  sessionNameFromLibraryPick,
  templatesFromLibraryPick,
  toggleLibraryPick,
} from './librarySessionPick';
import type { Exercise } from '@/types';

const catalog: Exercise[] = [
  { id: 'a', name: 'A Lift', muscleGroups: ['Chest'], equipment: 'Barbell' },
  { id: 'b', name: 'B Lift', muscleGroups: ['Back'], equipment: 'Barbell' },
  { id: 'c', name: 'C Lift', muscleGroups: ['Legs'], equipment: 'Bodyweight' },
];

describe('librarySessionPick', () => {
  it('toggles pick membership', () => {
    assert.deepEqual(toggleLibraryPick([], 'a'), ['a']);
    assert.deepEqual(toggleLibraryPick(['a'], 'a'), []);
    assert.deepEqual(toggleLibraryPick(['a'], 'b'), ['a', 'b']);
  });

  it('refuses to grow past LIBRARY_PICK_MAX', () => {
    const full = Array.from({ length: LIBRARY_PICK_MAX }, (_, i) => `id-${i}`);
    assert.equal(toggleLibraryPick(full, 'extra').length, LIBRARY_PICK_MAX);
    assert.ok(!toggleLibraryPick(full, 'extra').includes('extra'));
  });

  it('builds templates in pick order with default sets', () => {
    const t = templatesFromLibraryPick(catalog, ['b', 'missing', 'a']);
    assert.equal(t.length, 2);
    assert.equal(t[0]!.exerciseId, 'b');
    assert.equal(t[1]!.exerciseId, 'a');
    assert.equal(t[0]!.sets.length, 3);
    assert.equal(t[0]!.sets[0]!.reps, 8);
  });

  it('names the session from the first picks', () => {
    assert.equal(sessionNameFromLibraryPick(catalog, ['a']), 'A Lift');
    assert.equal(sessionNameFromLibraryPick(catalog, ['a', 'b']), 'A Lift + B Lift');
    assert.equal(sessionNameFromLibraryPick(catalog, ['a', 'b', 'c']), 'A Lift + B Lift +1');
    assert.equal(sessionNameFromLibraryPick(catalog, []), 'Library session');
  });
});
