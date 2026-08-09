import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { PRIVATE_NOTE_MAX } from './privateNote';

let originalLocalStorage: Storage | undefined;
let hadWindow = false;

beforeEach(() => {
  const store = new Map<string, string>();
  const memStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  } as Storage;
  hadWindow = typeof globalThis.window !== 'undefined';
  if (!hadWindow) {
    (globalThis as unknown as { window: unknown }).window = Object.assign(
      Object.create(globalThis),
      { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} }
    );
  }
  originalLocalStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: memStorage,
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
  if (!hadWindow) delete (globalThis as unknown as { window?: unknown }).window;
});

test('private note clamps to max and round-trips', async () => {
  const { loadPrivateNote, savePrivateNote } = await import('./privateNote');
  const long = 'x'.repeat(PRIVATE_NOTE_MAX + 40);
  const saved = savePrivateNote(long);
  assert.equal(saved.length, PRIVATE_NOTE_MAX);
  assert.equal(loadPrivateNote().length, PRIVATE_NOTE_MAX);
});
