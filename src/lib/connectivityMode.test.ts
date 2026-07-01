import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  connectivityBannerCopy,
  resolveConnectivityMode,
} from './connectivityMode.ts';

describe('connectivityMode', () => {
  it('resolves offline when not online', () => {
    assert.equal(resolveConnectivityMode(false), 'offline');
  });

  it('resolves lite when save-data or preference', () => {
    assert.equal(resolveConnectivityMode(true, { litePreference: true }), 'lite');
    assert.equal(resolveConnectivityMode(true, { saveData: true }), 'lite');
  });

  it('online has empty banner', () => {
    assert.equal(connectivityBannerCopy('online').message, '');
  });

  it('offline banner reassures local use', () => {
    assert.match(connectivityBannerCopy('offline').message, /offline/i);
  });
});
