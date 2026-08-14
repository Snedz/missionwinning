import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import {
  hasParqScreen,
  persistParqScreen,
  scoreParqAnswers,
} from '@/lib/journey/parqIntake';

const root = path.join(import.meta.dirname, '..', '..', '..');

let originalLocalStorage: Storage | undefined;

beforeEach(() => {
  const store = new Map<string, string>();
  const mem = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  } as Storage;
  originalLocalStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: mem,
  });
});

afterEach(() => {
  if (originalLocalStorage !== undefined) {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: originalLocalStorage,
    });
  }
});

test('no answers is low risk; one yes is moderate; three is high', () => {
  assert.equal(scoreParqAnswers({}).risk, 'low');
  assert.equal(scoreParqAnswers({ chest_pain: 'yes' }).risk, 'moderate');
  assert.equal(
    scoreParqAnswers({ chest_pain: 'yes', fainting: 'yes', heart: 'yes' }).risk,
    'high'
  );
});

test('persist writes lastAssessment only — never a food-row name', () => {
  assert.equal(hasParqScreen(), false);
  const snap = persistParqScreen({ risk: 'low', notes: 'educational only' });
  assert.equal(hasParqScreen(), true);
  assert.equal(snap.risk, 'low');
  const raw = localStorage.getItem(STORAGE_KEYS.lastAssessment);
  assert.ok(raw);
  assert.doesNotMatch(raw, /Assessment:/);
  assert.equal(localStorage.getItem(STORAGE_KEYS.nutritionLog), null);
});

test('AssessmentsPage and intake persist do not call saveNutritionEntry', () => {
  const page = readFileSync(path.join(root, 'src/page-components/AssessmentsPage.tsx'), 'utf8');
  const intake = readFileSync(path.join(root, 'src/lib/journey/parqIntake.ts'), 'utf8');
  assert.doesNotMatch(page, /saveNutritionEntry/);
  assert.doesNotMatch(intake, /saveNutritionEntry/);
});
