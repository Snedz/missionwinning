/**
 * A limit, explained — not a broken page.
 *
 * Shard 1 (US/LatAm, ops #16): the two biggest themes, **~27% of rows**, are the
 * invite/account gate before any value and *"geo-block reads as a broken page,
 * not an explained limit"*. The instruction was explicit: **do not remove the
 * geo-block.** So nothing here changes who is blocked — `supportedRegions.ts`
 * decides that and it is founder policy. What changes is what a blocked visitor
 * is told.
 *
 * Two things were wrong with the telling:
 *
 * 1. **US and LatAm are supported territories**, so the state those respondents
 *    hit is almost certainly `unknown_edge` — Cloudflare could not place the
 *    connection (`XX`/`T1`), which a VPN, a privacy browser or a carrier proxy
 *    does routinely on mobile networks there. The message named no cause and
 *    offered no exit, so a supported athlete read a rejection of themselves.
 * 2. **Nobody was told what still works.** The free logger is device-local and
 *    needs no account; `/regions` has always said so, in its fifth section, after
 *    four ISO code lists. A page that leads with 100 country codes and buries the
 *    one useful sentence is the "broken page" feeling, precisely.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  EUROPE_UNSUPPORTED_ISO2,
  EXTRA_UNSUPPORTED_ISO2,
  OIC_UNSUPPORTED_ISO2,
  TERRITORY_BLOCK_MESSAGES,
  TERRITORY_STILL_WORKS,
  OIC_MEMBER_COUNT,
  getTerritoryBlockReason,
  isHostedServiceTerritoryBlocked,
} from '@/lib/legal/supportedRegions';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
/**
 * Source minus prose **and** minus imports.
 *
 * Third time this class has bitten in three ships: `.766`'s citation check was
 * satisfied by a leftover `import`, `.768`'s by a comment naming the constant,
 * and this one by an `import` again after the render was replaced with hardcoded
 * prose. An identifier is not a usage.
 */
const readCode = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    .replace(/^\s*import[\s\S]*?from\s*'[^']*';$/gm, ' ');

/*
 * ── The block itself is untouched ──────────────────────────────────────────
 * This is the first assertion in the file on purpose: every sentence below is
 * about wording, and wording work is exactly when a policy quietly softens.
 */

test('the geo-block still blocks exactly who it blocked', () => {
  /*
   * Named members and pinned sizes, because a list cannot verify itself: the
   * first draft iterated the three arrays and asserted each entry was blocked,
   * so **deleting** `'CA'` passed — the loop simply stopped visiting it. A mutant
   * said so. `OIC_MEMBER_COUNT` was already pinned here for the same reason.
   */
  assert.equal(OIC_MEMBER_COUNT, 57);
  assert.equal(OIC_UNSUPPORTED_ISO2.length, OIC_MEMBER_COUNT);
  assert.equal(EXTRA_UNSUPPORTED_ISO2.length, 2, 'Canada + Ukraine');
  assert.ok(EUROPE_UNSUPPORTED_ISO2.length >= 40, 'the Europe list shrank');
  for (const [iso, reason] of [
    ['CA', 'canada'],
    ['UA', 'ukraine'],
    ['FR', 'europe'],
    ['DE', 'europe'],
    ['GB', 'europe'],
    ['CH', 'europe'],
    ['TR', 'oic'],
    ['ID', 'oic'],
    ['SA', 'oic'],
  ] as const) {
    assert.equal(getTerritoryBlockReason(iso), reason, `${iso} lost its block`);
  }

  const blocked = [
    ...EUROPE_UNSUPPORTED_ISO2,
    ...OIC_UNSUPPORTED_ISO2,
    ...EXTRA_UNSUPPORTED_ISO2,
  ];
  assert.ok(blocked.length > 90, `only ${blocked.length} codes — a list shrank`);
  for (const iso of blocked) {
    assert.equal(isHostedServiceTerritoryBlocked(iso), true, `${iso} stopped being blocked`);
  }
  // Unknown / Tor still refuse hosted signup and checkout.
  for (const iso of ['XX', 'T1']) {
    assert.equal(isHostedServiceTerritoryBlocked(iso), true, `${iso} stopped being blocked`);
  }
  // And the supported world is still supported — shard 1's own regions.
  for (const iso of ['US', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE']) {
    assert.equal(isHostedServiceTerritoryBlocked(iso), false, `${iso} became blocked`);
  }
});

test('every block reason has a sentence, and none of them is a bare verdict', () => {
  for (const [reason, message] of Object.entries(TERRITORY_BLOCK_MESSAGES)) {
    assert.ok(message.length > 40, `${reason} message is too terse to explain anything`);
    assert.match(message, /[.!]$/, `${reason} message must be a sentence`);
    // "Error", "denied", "forbidden" is how a broken page talks.
    assert.doesNotMatch(
      message,
      /\berror\b|\bdenied\b|\bforbidden\b|\bnot allowed\b/i,
      `${reason} reads like a failure rather than a limit`
    );
  }
});

test('the unknown-country message names a cause and a way forward', () => {
  const m = TERRITORY_BLOCK_MESSAGES.unknown_edge;
  assert.match(m, /VPN|proxy/i, 'the usual cause must be named — US/LatAm mobile hits this');
  assert.match(m, /turning a VPN off|resolve/i, 'a blocked state with no exit is a dead end');
  // It is *not* an exclusion, and must not read like the named-territory ones.
  for (const named of ['europe', 'canada', 'ukraine', 'oic'] as const) {
    assert.notEqual(m, TERRITORY_BLOCK_MESSAGES[named]);
  }
  assert.equal(getTerritoryBlockReason('XX'), 'unknown_edge');
  assert.equal(getTerritoryBlockReason('T1'), 'unknown_edge');
});

test('the "what still works" sentence is true, specific, and one home', () => {
  assert.match(TERRITORY_STILL_WORKS, /logger/i);
  assert.match(TERRITORY_STILL_WORKS, /no account/i);
  assert.match(TERRITORY_STILL_WORKS, /this device/i);
  // It must not promise the things the block removes.
  assert.doesNotMatch(TERRITORY_STILL_WORKS, /sync|cloud|checkout|Super Bundle/i);
});

/**
 * Every surface that tells someone they are blocked must also tell them what
 * still works — discovered by the state they render, not by a list I keep.
 */
const BLOCKED_STATE_SURFACES = [
  'app/private/PrivateTeaserClient.tsx',
  'src/components/auth/SignInPanel.tsx',
  'src/components/UnlockButton.tsx',
  'src/page-components/SupportedRegionsPage.tsx',
] as const;

/** `/regions` **is** the policy — asking it to link itself is a circle. */
const IS_THE_POLICY = 'src/page-components/SupportedRegionsPage.tsx';

test('no blocked state is a dead end', () => {
  for (const file of BLOCKED_STATE_SURFACES) {
    const src = readCode(file);
    assert.match(
      src,
      /TERRITORY_STILL_WORKS/,
      `${file} tells someone they are blocked without saying what still works`
    );
    assert.match(
      src,
      /data-mw-still-works/,
      `${file} must mark the sentence so the smoke can find it on the page`
    );
    if (file !== IS_THE_POLICY) {
      assert.match(src, /\/regions/, `${file} must link the policy it is enforcing`);
    }
  }
});

test('the surfaces named above really do render a blocked state', () => {
  // A list of files that no longer handle the block would pass the test above
  // by accident — the `.766` stale-exemption defect in a new place.
  for (const file of BLOCKED_STATE_SURFACES) {
    const src = readCode(file);
    const handlesBlock =
      /territoryBlocked|territory\.stance === 'refuse'|TERRITORY_BLOCK_MESSAGES|EUROPE_UNSUPPORTED_ISO2/.test(
        src
      );
    assert.ok(handlesBlock, `${file} no longer renders a blocked state — update this list`);
  }
});

test('/regions answers "can I use this?" before it lists 100 country codes', () => {
  /*
   * Inside the JSX only. The first draft compared raw source offsets and failed
   * on its own subject: `const europeCodes = …` is declared at the top of the
   * component, so the "ISO lists" position it measured was a variable
   * declaration, not anything on the page. Order of *rendered* things is the
   * claim, so the slice starts at `return (` and the anchors are interpolations.
   */
  const whole = readCode('src/page-components/SupportedRegionsPage.tsx');
  const src = whole.slice(whole.indexOf('return ('));
  const stillWorks = src.indexOf('TERRITORY_STILL_WORKS');
  const summary = src.indexOf('{REGION_POLICY.summary}');
  const isoLists = src.indexOf('{europeCodes}');
  assert.ok(stillWorks > 0 && summary > 0 && isoLists > 0, 'page structure moved — re-read it');
  assert.ok(
    stillWorks < summary,
    'what still works must come before the market-posture paragraph'
  );
  assert.ok(stillWorks < isoLists, 'what still works must come before the ISO lists');
});
