import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { newPhotoId } from './progressPhotos.ts';

describe('progressPhotos pure helpers', () => {
  it('newPhotoId is unique-ish', () => {
    const a = newPhotoId();
    const b = newPhotoId();
    assert.ok(a.startsWith('pp_'));
    assert.notEqual(a, b);
  });
});

// Full IDB CRUD requires a browser environment; covered manually + e2e later.
