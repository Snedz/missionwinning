import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/lib/storage/keys';

const storageMap = new Map<string, string>();
(globalThis as { localStorage?: Storage }).localStorage = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => void storageMap.set(k, v),
  removeItem: (k: string) => void storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i: number) => [...storageMap.keys()][i] ?? null,
  get length() {
    return storageMap.size;
  },
} as unknown as Storage;

test('placeDex: add and tag session after the set', async () => {
  storageMap.clear();
  const { addPersonalPlace, loadPlaceDex, tagSessionOnPlace } = await import('./placeDex');

  assert.deepEqual(loadPlaceDex(), []);
  assert.equal(addPersonalPlace({ name: '   ' }), null);

  const place = addPersonalPlace({ name: ' Garage rack ', lat: 51.5, lng: -0.1 });
  assert.ok(place);
  assert.equal(place.name, 'Garage rack');
  assert.equal(place.kind, 'personal');
  assert.equal(place.sessionIds?.length, 0);
  assert.ok(storageMap.has(STORAGE_KEYS.placeDex));

  const tagged = tagSessionOnPlace(place.id, 'log-1');
  assert.ok(tagged);
  assert.deepEqual(tagged.sessionIds, ['log-1']);
  assert.equal(tagSessionOnPlace('missing', 'log-1'), null);
  assert.equal(tagSessionOnPlace(place.id, '  '), null);

  const again = tagSessionOnPlace(place.id, 'log-1');
  assert.deepEqual(again?.sessionIds, ['log-1']);
});
