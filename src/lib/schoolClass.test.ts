import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateClassCode,
  joinClass,
  normalizeClassCode,
  classJoinUrl,
} from '@/lib/schoolClass';

describe('schoolClass', () => {
  it('normalizes class codes', () => {
    assert.equal(normalizeClassCode('mw-a3k9'), 'MWA3K9');
    assert.equal(normalizeClassCode('A3K9'), 'MWA3K9');
    assert.equal(normalizeClassCode('ab'), null);
  });

  it('generates MW-prefixed codes', () => {
    const code = generateClassCode();
    assert.match(code, /^MW[A-Z0-9]{4}$/);
  });

  it('builds join URLs', () => {
    assert.equal(classJoinUrl('MWTEST', 'https://example.com'), 'https://example.com/join/class/MWTEST');
  });
});

describe('schoolClass localStorage', () => {
  it('joinClass stores code when window exists', () => {
    const g = globalThis as typeof globalThis & {
      localStorage?: Storage;
      window?: Window & typeof globalThis;
    };
    const store: Record<string, string> = {};
    g.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => {
        store[k] = v;
      },
      removeItem: (k) => {
        delete store[k];
      },
    } as Storage;
    g.window = g as unknown as Window & typeof globalThis;

    assert.equal(joinClass('mwtest'), 'MWTEST');
    assert.equal(store.mw_class_code, 'MWTEST');
  });
});
