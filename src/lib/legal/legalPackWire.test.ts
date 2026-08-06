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
  assert.match(locales, /Europe/);
  assert.match(locales, /Organisation of Islamic Cooperation|OIC/);
  assert.match(locales, /Canada/);

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

test('signup and checkout hard-block territory', () => {
  const checkout = readFileSync(join(root, 'app/api/checkout/route.ts'), 'utf8');
  assert.match(checkout, /hostedServiceAccessFromHeaders/);
  assert.match(checkout, /territory_blocked|403/);

  const intent = readFileSync(join(root, 'app/api/crypto-checkout/intent/route.ts'), 'utf8');
  assert.match(intent, /hostedServiceAccessFromHeaders/);

  const signIn = readFileSync(join(root, 'src/components/auth/SignInPanel.tsx'), 'utf8');
  assert.match(signIn, /fetchTerritoryAccess/);
  assert.match(signIn, /territoryBlocked/);

  const unlock = readFileSync(join(root, 'src/components/UnlockButton.tsx'), 'utf8');
  assert.match(unlock, /fetchTerritoryAccess/);
  assert.match(unlock, /territory_blocked|territoryBlocked/);

  const geo = readFileSync(join(root, 'app/api/geo/route.ts'), 'utf8');
  assert.match(geo, /blocked/);
  assert.match(geo, /blockReason/);
});
