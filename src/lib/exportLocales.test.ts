import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { countEsPlaceholderKeys } from '@/lib/exportLocales';

describe('exportLocales', () => {
  it('counts ES keys that still match EN', () => {
    const fuel = countEsPlaceholderKeys('fuel');
    assert.ok(fuel.total > 20);
    assert.ok(fuel.placeholders < fuel.total);
  });

  it('welcome ES has fewer placeholders than total keys', () => {
    const welcome = countEsPlaceholderKeys('welcome');
    assert.ok(welcome.placeholders / welcome.total < 0.5);
  });
});
