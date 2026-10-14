import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  isJourneyBypassPath,
  isPrivateGatePublicPath,
  JOURNEY_BYPASS_PATHS,
} from '@/lib/publicRoutes';

const root = join(import.meta.dirname, '../..');

describe('publicRoutes', () => {
  it('bypasses info and marketing paths pre-I-Day', () => {
    assert.equal(isJourneyBypassPath('/about'), true);
    assert.equal(isJourneyBypassPath('/changelog'), true);
    assert.equal(isJourneyBypassPath('/feedback'), true);
    assert.equal(isJourneyBypassPath('/calculators'), true);
    assert.equal(isJourneyBypassPath('/press'), true);
    assert.equal(isJourneyBypassPath('/notify'), true);
    assert.equal(isJourneyBypassPath('/join/class/MW-TEST'), true);
    assert.equal(isJourneyBypassPath('/log'), false);
  });

  it('includes join class prefix in bypass list', () => {
    assert.ok(JOURNEY_BYPASS_PATHS.includes('/join/class'));
  });

  it('allows private gate public paths', () => {
    assert.equal(isPrivateGatePublicPath('/changelog'), true);
    assert.equal(isPrivateGatePublicPath('/vision'), true);
    assert.equal(isPrivateGatePublicPath('/beta'), true);
    assert.equal(isPrivateGatePublicPath('/press'), true);
    assert.equal(isPrivateGatePublicPath('/notify'), true);
    assert.equal(isPrivateGatePublicPath('/log'), true);
    assert.equal(isPrivateGatePublicPath('/active'), true);
    assert.equal(isPrivateGatePublicPath('/_next/static/chunk.js'), true);
  });
});

/**
 * Public pages must not link into nothing.
 *
 * Original framing of this check was "a public page links into the gate" — pointed at
 * `ExercisePublicPage` → `/builder`. That turned out to be wrong on inspection: while
 * `PRIVATE_MODE` is on, `privateGateHeaders()` stamps `noindex, nofollow` on every
 * gate-public path, so there is no crawl budget being spent on a gated link. And after
 * the flip the gate is off, so the link resolves. `/builder` is reachable and
 * `MUST_STAY_GATED` in `firstSetWhileGated.test.ts` records that placement as deliberate
 * (`.768`/`.839`). Widening the pre-launch surface to "fix" it would have been a
 * product decision made by an agent, which is exactly what that list exists to prevent.
 *
 * The durable invariant is narrower and actually true: a literal `href` on a public page
 * component must resolve to a real route. A 404 is not a design position, it is a dead
 * link that no review catches, because the page renders fine.
 */
describe('public pages do not link into nothing', () => {
  const PUBLIC_PAGE_COMPONENTS = [
    'src/page-components/ExercisePublicPage.tsx',
    'src/page-components/CalculatorsPage.tsx',
    'src/page-components/PathsPage.tsx',
  ];

  /** Literal `href="..."` only — template hrefs are resolved per item at runtime. */
  const LITERAL_HREF = /\shref\s*=\s*["'](\/[^"'{}]*)["']/g;

  /** Every route the app actually serves, built from the `app/` tree. */
  function knownRoutes(dir: string, prefix = '', out = new Set<string>()): Set<string> {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return out;
    }
    for (const ent of entries) {
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        // Route groups `(app)` and `(marketing)` do not appear in the URL.
        const seg = /^\(.+\)$/.test(ent.name) ? '' : `/${ent.name}`;
        knownRoutes(full, `${prefix}${seg}`, out);
      } else if (ent.name === 'page.tsx') {
        out.add(prefix === '' ? '/' : prefix);
      }
    }
    return out;
  }

  it('every literal internal href resolves to a real route', () => {
    const routes = knownRoutes(join(root, 'app'));
    const offenders: string[] = [];

    for (const rel of PUBLIC_PAGE_COMPONENTS) {
      let src: string;
      try {
        src = readFileSync(join(root, rel), 'utf8');
      } catch {
        continue;
      }
      for (const [, href] of src.matchAll(LITERAL_HREF)) {
        const path = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
        if (!routes.has(path)) offenders.push(`${rel} -> ${href}`);
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `public page links to a route that does not exist:\n    ${offenders.join('\n    ')}`,
    );
  });

  it('/builder is a real route and stays gated — reachable after the flip, not before', () => {
    assert.equal(knownRoutes(join(root, 'app')).has('/builder'), true);
    // Deliberate, per .768/.839. Asserted so the next agent re-reads the reasoning
    // before widening the pre-launch surface.
    assert.equal(isPrivateGatePublicPath('/builder'), false);
    const page = readFileSync(join(root, 'src/page-components/ExercisePublicPage.tsx'), 'utf8');
    assert.match(page, /href="\/builder"/);
  });
});
