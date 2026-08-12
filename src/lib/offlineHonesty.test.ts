import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isOfflineInstallable } from '@/lib/offlineCapability';

/**
 * The app must not claim a capability this build does not ship.
 *
 * `next.config.js` disables Serwist whenever the private gate is up, so
 * production ships **no service worker**: not installable, nothing precached,
 * and a cold open or refresh with no network hits the browser's error page.
 * `CONTEXT.md` records that plainly — *"no beta tester can install the PWA or
 * log offline"* — and **none of that honesty reached a single string**. Seven
 * surfaces asserted the capability in the present tense, including the invite
 * landing, which is the first screen an invited tester ever sees.
 *
 * The feature is **kept**. It is constitutional (`vision.md`: "offline-first",
 * "free offline logger"), fully built, and scheduled on by
 * `PRODUCTION_STACK.md` L10 at the public flip. What is fixed here is the
 * tense: claims render only when the capability is real, so they are true now
 * *and* true after the flip, with nobody having to remember a copy edit.
 *
 * **Two classes of string, and conflating them would trade one dishonesty for
 * another.** A *capability claim* ("installable", "works offline anywhere") is
 * false today. A *network-state message* ("Offline — logging still works") is
 * **true** today: the workout store persists to device storage and every cloud
 * write rides the durable outbox, so a session already open keeps logging
 * through a signal drop and syncs later. Gating those would understate what the
 * product does.
 */

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/**
 * Strip line and block comments without touching string literals.
 *
 * A naive block-comment regex is wrong here: CSP in next.config.js carries
 * `https://*.supabase.co`, and the slash-star in that URL starts a false block
 * comment that swallows the `env.NEXT_PUBLIC_PWA_ENABLED` assignment (the
 * load-bearing line this suite asserts). That went red after any later
 * block-comment closer in the file sealed the accidental span — e.g. the `.668`
 * redirects JSDoc.
 */
function stripComments(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      out += c;
      i += 1;
      while (i < src.length) {
        if (src[i] === '\\' && i + 1 < src.length) {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        if (src[i] === q) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (c === '/' && n === '/') {
      i += 2;
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && n === '*') {
      i += 2;
      while (i + 1 < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

describe('the offline capability flag', () => {
  /**
   * The load-bearing assertion. Every claim below is gated on
   * `NEXT_PUBLIC_PWA_ENABLED`; that is only meaningful while the flag keeps
   * being derived from the *same* expression that decides whether Serwist
   * builds. Decouple them — hand-set the env var, or change one side — and
   * every gated claim silently unmoors from the capability it describes, with
   * every test here still green. This is the one that must not rot.
   */
  it('is derived from the same expression that builds the service worker', () => {
    const cfg = stripComments(read('next.config.js'));

    assert.match(
      cfg,
      /NEXT_PUBLIC_PWA_ENABLED:\s*pwaDisabled\s*\?\s*'false'\s*:\s*'true'/,
      'the flag must be computed from `pwaDisabled`, not set independently — otherwise the UI can ' +
        'claim offline in a build that ships no worker, which is the defect this file exists for'
    );
    assert.match(
      cfg,
      /disable:\s*pwaDisabled/,
      'Serwist must be disabled by the same `pwaDisabled` the flag is derived from'
    );
    assert.match(
      cfg,
      /const pwaDisabled =[\s\S]{0,240}PRIVATE_MODE/,
      '`pwaDisabled` must still key on PRIVATE_MODE — the whole coupling rests on it'
    );
  });

  it('reads that flag and nothing else', () => {
    const src = stripComments(read('src/lib/offlineCapability.ts'));
    assert.match(src, /NEXT_PUBLIC_PWA_ENABLED/);
    // Fails closed, in the shape of `isPushSupported`: anything other than an
    // explicit 'true' means we cannot prove the capability, so we do not claim it.
    assert.equal(
      isOfflineInstallable(),
      process.env.NEXT_PUBLIC_PWA_ENABLED === 'true',
      'the predicate must agree with the flag it wraps'
    );
  });

  it('is false in this test environment, so the assertions below mean something', () => {
    // Unit tests run without the Next build env, so the flag is absent → false.
    // If this ever flips, the "claims are gated" checks below would be asserting
    // against the enabled branch and would stop covering the defect.
    assert.equal(isOfflineInstallable(), false);
  });
});

describe('capability claims are gated', () => {
  /**
   * Each entry: the file, and the key whose copy asserts installability or
   * real offline capability. Kept as (file, key) pairs rather than a prose
   * grep because the same word "offline" appears in both classes of string —
   * the distinction is semantic and a regex cannot make it.
   */
  const CLAIMS: { file: string; key: string; note: string }[] = [
    {
      file: 'src/components/today/TodayProgressSection.tsx',
      key: 'todayInstallPwa',
      note: 'install banner on the daily command screen — "for offline use anywhere"',
    },
    {
      file: 'src/components/workout/ActiveEmptyState.tsx',
      key: 'activeEmptySubtitle',
      note: 'the logger says "offline ready"',
    },
    {
      file: 'src/page-components/BetaStartPage.tsx',
      key: 'betaFootWedge',
      note: 'invite landing — the first screen a tester sees',
    },
    {
      file: 'src/components/today/DayReviewOptIn.tsx',
      key: 'dayReviewOptInInstall',
      note: 'iOS: "add to home screen and an evening review can find you here"',
    },
    {
      file: 'src/components/workout/WindDownOptIn.tsx',
      key: 'windDownInstallFirst',
      note: 'iOS: "Add to Home Screen first" as the stated push prerequisite',
    },
  ];

  for (const { file, key, note } of CLAIMS) {
    it(`${key} renders only when the capability is real (${note})`, () => {
      const src = stripComments(read(file));
      assert.ok(src.includes(key), `${file} no longer renders ${key} — re-read this row`);
      assert.match(
        src,
        /isOfflineInstallable\(\)/,
        `${file} claims offline capability without checking for it. Gate it on ` +
          '`isOfflineInstallable()` and state the narrower truth otherwise.'
      );
    });
  }

  /**
   * Every gated claim needs a fallback that is *itself* true, or gating just
   * hides the product's best property from beta testers. The `NoSw` variants
   * say what holds without a worker: an open session survives a signal drop.
   */
  /**
   * Claims with nothing honest to say in their place, which therefore render
   * *nothing* while the worker is gated. All three offer an install; there is
   * no narrower version of "you can install this" when you cannot.
   *
   * The rest must degrade rather than vanish — hiding a true capability is its
   * own way of misinforming a tester about what the product does.
   */
  const HIDDEN_ENTIRELY = ['todayInstallPwa', 'dayReviewOptInInstall', 'windDownInstallFirst'];

  it('each gated claim either degrades to a truth or is an install offer', () => {
    for (const { file, key } of CLAIMS.filter((c) => !HIDDEN_ENTIRELY.includes(c.key))) {
      const src = stripComments(read(file));
      assert.match(
        src,
        new RegExp(`${key}NoSw`),
        `${file} hides its claim but offers nothing in its place — say what is true instead`
      );
    }
  });
});

describe('network-state messages are left alone', () => {
  /**
   * These are true **without** a service worker, and gating them would be its
   * own dishonesty in the opposite direction. Recorded with reasons so a future
   * sweep of the word "offline" does not take them out.
   */
  const TRUE_TODAY: { file: string; reason: string }[] = [
    {
      file: 'src/components/layout/OnlineStatusBanner.tsx',
      reason:
        '"Offline — logging still works" is accurate with no SW: the store persists to device ' +
        'storage and writes ride the durable outbox, so an open session keeps logging and syncs later.',
    },
    {
      file: 'src/page-components/PrivacyPage.tsx',
      reason:
        'infoPrivacyCollectLi4 — "the free core works offline; data stays on your device until you ' +
        'sign in to sync" — is a statement about **localStorage**, not about the service worker, and ' +
        'it is true either way. `.603` came within one edit of gating it: the audit that found the ' +
        'real /vision claim reported it under this key’s line number, and the plan inherited that. ' +
        'Recorded so the next sweep of the word "offline" does not take out a true privacy disclosure.',
    },
  ];

  for (const { file, reason } of TRUE_TODAY) {
    it(`${file} stays ungated`, () => {
      assert.ok(reason.trim().length > 0);
      assert.doesNotMatch(
        stripComments(read(file)),
        /isOfflineInstallable\(\)/,
        `${file} was gated behind the PWA flag, but its message is true without a service worker. ` +
          `Gating it understates the product:\n  ${reason}`
      );
    });
  }
});

describe('push cannot be offered without a worker to push through', () => {
  it('isPushSupported checks the same flag', () => {
    const src = stripComments(read('src/lib/pushClient.ts'));
    assert.match(
      src,
      /isOfflineInstallable\(\)/,
      'without this, the day VAPID is set while PRIVATE_MODE is still on, the push UI renders and ' +
        '`subscribePush()` awaits `navigator.serviceWorker.ready` forever — there is no timeout on it'
    );
  });
});

describe('meta and manifest capability claims are gated', () => {
  /**
   * Manifest, root OG/Twitter, landing JSON-LD, and /beta metadata are what
   * crawlers and "Add to Home Screen" surfaces read. They stayed unconditional
   * after `.615` gated the in-app UI — the defect this row closes.
   */
  const META_SURFACES: { file: string; helpers: string[]; note: string }[] = [
    {
      file: 'app/manifest.ts',
      helpers: ['manifestDescription'],
      note: 'PWA manifest description',
    },
    {
      file: 'app/layout.tsx',
      helpers: ['siteDescription', 'openGraphDescription', 'twitterDescription'],
      note: 'root description + OG + Twitter',
    },
    {
      file: 'app/page.tsx',
      helpers: ['siteDescription'],
      note: 'landing publicPageMetadata description',
    },
    {
      file: 'src/lib/publicSeo.ts',
      helpers: ['softwareApplicationDescription'],
      note: 'SoftwareApplication JSON-LD',
    },
    {
      file: 'app/(app)/beta/page.tsx',
      helpers: ['betaRouteDescription'],
      note: '/beta route metadata',
    },
  ];

  const INLINE_CLAIM =
    /works offline|offline-first|installable|log offline|offline ready|offline anywhere/i;

  for (const { file, helpers, note } of META_SURFACES) {
    it(`${file} sources descriptions from offlineCapability (${note})`, () => {
      const src = stripComments(read(file));
      for (const helper of helpers) {
        assert.match(
          src,
          new RegExp(helper),
          `${file} must call ${helper}() — do not embed capability copy inline`
        );
      }
      assert.doesNotMatch(
        src,
        INLINE_CLAIM,
        `${file} still embeds an offline/install capability claim — route it through ` +
          '`src/lib/offlineCapability.ts`'
      );
    });
  }

  it('offlineCapability meta helpers gate on isOfflineInstallable()', () => {
    const src = stripComments(read('src/lib/offlineCapability.ts'));
    for (const helper of [
      'siteDescription',
      'manifestDescription',
      'openGraphDescription',
      'twitterDescription',
      'softwareApplicationDescription',
      'betaRouteDescription',
    ]) {
      assert.match(
        src,
        new RegExp(
          `export function ${helper}\\([\\s\\S]*?isOfflineInstallable\\(\\)[\\s\\S]*?\\}`,
          'm'
        ),
        `${helper}() must branch on isOfflineInstallable()`
      );
    }
  });
});
