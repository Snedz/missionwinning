/**
 * Pinned reminder is theirs, per lift. Not History. Not last-note prefill.
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import {
  EXERCISE_PIN_MAX,
  EXERCISE_PIN_MAX_IDS,
  clearPinnedNote,
  normalizeExercisePin,
  readPinnedNote,
  writePinnedNote,
} from '@/lib/workout/exercisePin';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

beforeEach(() => {
  resetStorage();
});

describe('normalizeExercisePin', () => {
  it('trims a kept pin verbatim', () => {
    assert.equal(normalizeExercisePin('  45 degree incline  '), '45 degree incline');
  });

  it('empty / whitespace / non-string invent nothing', () => {
    assert.equal(normalizeExercisePin(''), undefined);
    assert.equal(normalizeExercisePin('   '), undefined);
    assert.equal(normalizeExercisePin(null), undefined);
    assert.equal(normalizeExercisePin(undefined), undefined);
    assert.equal(normalizeExercisePin(12), undefined);
  });

  it('caps over-length text — never pads', () => {
    const raw = 'x'.repeat(EXERCISE_PIN_MAX + 40);
    const kept = normalizeExercisePin(raw);
    assert.equal(kept?.length, EXERCISE_PIN_MAX);
  });
});

describe('writePinnedNote / readPinnedNote', () => {
  it('returns the pin for that lift only', () => {
    writePinnedNote('bench-press', '45 degree incline');
    writePinnedNote('squat', 'belt on 3');
    assert.equal(readPinnedNote('bench-press'), '45 degree incline');
    assert.equal(readPinnedNote('squat'), 'belt on 3');
    assert.equal(readPinnedNote('deadlift'), undefined);
  });

  it('empty write deletes that id', () => {
    writePinnedNote('bench-press', '45 degree incline');
    writePinnedNote('bench-press', '   ');
    assert.equal(readPinnedNote('bench-press'), undefined);
    clearPinnedNote('squat');
    assert.equal(readPinnedNote('squat'), undefined);
  });

  it('blank id never writes', () => {
    writePinnedNote('', '45 degree incline');
    writePinnedNote('   ', '45 degree incline');
    assert.equal(readPinnedNote(''), undefined);
    assert.equal(readPinnedNote('   '), undefined);
  });

  it('cap evicts the oldest id', () => {
    for (let i = 0; i < EXERCISE_PIN_MAX_IDS + 1; i += 1) {
      writePinnedNote(`ex-${i}`, `pin ${i}`);
    }
    assert.equal(readPinnedNote('ex-0'), undefined);
    assert.equal(readPinnedNote(`ex-${EXERCISE_PIN_MAX_IDS}`), `pin ${EXERCISE_PIN_MAX_IDS}`);
  });

  it('rewriting an id keeps it when the map is full', () => {
    for (let i = 0; i < EXERCISE_PIN_MAX_IDS; i += 1) {
      writePinnedNote(`ex-${i}`, `pin ${i}`);
    }
    writePinnedNote('ex-0', 'still mine');
    writePinnedNote('ex-new', 'newest');
    assert.equal(readPinnedNote('ex-0'), 'still mine');
    assert.equal(readPinnedNote('ex-1'), undefined);
    assert.equal(readPinnedNote('ex-new'), 'newest');
  });
});

describe('exercise pin refuses History / Feed / standing', () => {
  it('helper is a private diary — no History list, identity, standing, or LLM', () => {
    const src = read('src/lib/workout/exercisePin.ts');
    const keys = read('src/lib/storage/keys.ts');
    assert.match(src, /STORAGE_KEYS\.pinnedNoteByExercise/);
    assert.match(keys, /pinnedNoteByExercise: 'mw_pinned_note_by_exercise'/);
    assert.equal(STORAGE_KEYS.pinnedNoteByExercise, 'mw_pinned_note_by_exercise');
    assert.doesNotMatch(src, /from ['"]@\/lib\/journal\/cueMemory/);
    assert.doesNotMatch(src, /noteFromHistory|lastNotesFor|listMovementHistory/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/identity/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/rewards/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/leaderboard/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/llm/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\//);
    assert.doesNotMatch(src, /from ['"]@?mw-core/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|\/bundle/);
    assert.doesNotMatch(src, /discord\.com|likes|Feed permalink/);
  });
});
