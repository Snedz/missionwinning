import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('legal pack routes and Europe policy are wired', () => {
  const terms = readFileSync(join(root, 'src/page-components/TermsPage.tsx'), 'utf8');
  assert.match(terms, /eligibility/);
  assert.match(terms, /\/regions/);
  assert.match(terms, /\/usage/);
  assert.match(terms, /\/service-terms/);

  const privacy = readFileSync(join(root, 'src/page-components/PrivacyPage.tsx'), 'utf8');
  assert.match(privacy, /infoPrivacyRegions/);

  const locales = readFileSync(join(root, 'src/i18n/infoLocales.ts'), 'utf8');
  assert.match(locales, /Europe is not supported/);
  assert.match(locales, /Supported Regions/);

  const pub = readFileSync(join(root, 'src/lib/publicRoutes.ts'), 'utf8');
  assert.match(pub, /\/usage/);
  assert.match(pub, /\/regions/);
  assert.match(pub, /\/service-terms/);

  for (const route of ['usage', 'regions', 'service-terms']) {
    assert.ok(
      readFileSync(join(root, `app/(app)/${route}/page.tsx`), 'utf8').includes('Page'),
      route
    );
  }
});
