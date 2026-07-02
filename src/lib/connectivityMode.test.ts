import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  connectivityBannerCopy,
  resolveConnectivityMode,
} from './connectivityMode';

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

  it('shows pending sync when online with outbox', () => {
    assert.match(connectivityBannerCopy('online', 2).message, /2 changes waiting/);
  });

  it('offline includes pending count in detail', () => {
    assert.match(connectivityBannerCopy('offline', 1).detail ?? '', /pending sync/i);
  });
});
