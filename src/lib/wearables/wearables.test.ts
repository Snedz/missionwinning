import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHubSamples } from './hubs.ts';
import { buildProviderStatusList } from './status.ts';
import { samplesToActivityHints } from './mapSamples.ts';
import { mapStravaActivity } from './oauthProviders.ts';
import type { WearableSample } from './types.ts';

describe('wearables hubs', () => {
  it('normalizes hub samples and prefixes external ids', () => {
    const samples = normalizeHubSamples('healthkit', [
      {
        kind: 'activity',
        startedAt: '2026-07-01T10:00:00Z',
        endedAt: '2026-07-01T10:30:00Z',
        externalId: 'abc',
        metrics: { distance_m: 3000 },
      },
      { kind: 'nope', startedAt: 'x', externalId: 'y' },
    ]);
    assert.equal(samples.length, 1);
    assert.equal(samples[0].externalId, 'healthkit:abc');
    assert.equal(samples[0].source, 'healthkit');
  });
});

describe('wearables status', () => {
  it('builds empty list when flag off', () => {
    const prev = process.env.NEXT_PUBLIC_WEARABLES;
    process.env.NEXT_PUBLIC_WEARABLES = 'false';
    assert.equal(buildProviderStatusList([]).length, 0);
    process.env.NEXT_PUBLIC_WEARABLES = prev;
  });

  it('includes oauth + hub + ble when flag on', () => {
    const prev = process.env.NEXT_PUBLIC_WEARABLES;
    const prevSurfaces = process.env.NEXT_PUBLIC_SURFACES;
    process.env.NEXT_PUBLIC_WEARABLES = 'true';
    // The wearables surface is parked by default (src/lib/surface.ts); the provider
    // flag alone no longer reaches the UI.
    process.env.NEXT_PUBLIC_SURFACES = 'wearables';
    const list = buildProviderStatusList([]);
    assert.ok(list.some((p) => p.provider === 'whoop'));
    assert.ok(list.some((p) => p.provider === 'healthkit'));
    assert.ok(list.some((p) => p.provider === 'ble_hr'));
    process.env.NEXT_PUBLIC_WEARABLES = prev;
    if (prevSurfaces === undefined) delete process.env.NEXT_PUBLIC_SURFACES;
    else process.env.NEXT_PUBLIC_SURFACES = prevSurfaces;
  });

  it('stays empty when the surface is parked, even with the provider flag on', () => {
    const prev = process.env.NEXT_PUBLIC_WEARABLES;
    process.env.NEXT_PUBLIC_WEARABLES = 'true';
    assert.equal(buildProviderStatusList([]).length, 0);
    process.env.NEXT_PUBLIC_WEARABLES = prev;
  });
});

describe('samplesToActivityHints', () => {
  it('maps activity samples', () => {
    const samples: WearableSample[] = [
      {
        source: 'strava',
        kind: 'activity',
        startedAt: '2026-07-01T12:00:00Z',
        endedAt: '2026-07-01T12:40:00Z',
        externalId: 'strava:1',
        metrics: { type: 'Run', distance_m: 5000, name: 'Tempo' },
      },
    ];
    const hints = samplesToActivityHints(samples);
    assert.equal(hints.length, 1);
    assert.equal(hints[0].durationMin, 40);
    assert.equal(hints[0].distanceKm, 5);
  });
});

describe('mapStravaActivity', () => {
  it('maps Strava activity JSON to sample with strava: external id', () => {
    const sample = mapStravaActivity({
      id: 12345,
      name: 'Morning Run',
      type: 'Run',
      start_date: '2026-07-01T12:00:00Z',
      moving_time: 2400,
      distance: 8000,
    });
    assert.equal(sample.source, 'strava');
    assert.equal(sample.kind, 'activity');
    assert.equal(sample.externalId, 'strava:12345');
    assert.equal(sample.metrics.distance_m, 8000);
    assert.equal(sample.metrics.moving_time_s, 2400);
    assert.equal(sample.metrics.type, 'Run');
    assert.equal(sample.metrics.name, 'Morning Run');
    assert.equal(sample.endedAt, '2026-07-01T12:40:00.000Z');
  });
});
