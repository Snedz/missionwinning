import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marketingLanguageAlternates } from '@/lib/marketingHreflang';

describe('marketingHreflang (Phase M5)', () => {
  it('builds hreflang map for all export langs', () => {
    const alt = marketingLanguageAlternates('/');
    assert.equal(alt.canonical, '/');
    assert.ok(alt.languages?.['x-default']);
    assert.ok(alt.languages?.en);
    assert.ok(alt.languages?.['pt-BR']);
    assert.ok(alt.languages?.ja);
  });
});

describe('PWA manifest (Phase M5)', () => {
  it('manifest.json is valid with screenshots', () => {
    const raw = readFileSync(join(process.cwd(), 'public/manifest.json'), 'utf8');
    const manifest = JSON.parse(raw) as {
      name: string;
      start_url: string;
      screenshots?: { src: string }[];
    };
    assert.equal(manifest.name, 'Mission Winning');
    assert.equal(manifest.start_url, '/welcome');
    assert.ok(Array.isArray(manifest.screenshots) && manifest.screenshots.length >= 3);
  });
});
