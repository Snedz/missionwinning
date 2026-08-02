/**
 * The local gate and CI must build the same app.
 *
 * `.249` — they did not, and it stayed invisible for as long as Actions was
 * billing-blocked.
 *
 * `.198` discovered that `isPushSupported()` returns false without a VAPID
 * public key, so every component behind it — the wind-down offer, the
 * day-review opt-in — rendered **nothing** in every e2e run this repo had ever
 * done, and a guard written about those surfaces passed vacuously. The fix was
 * a placeholder key in `BUILD_ENV`.
 *
 * It went into `scripts/gate.mjs` and **not** into `.github/workflows/ci.yml`.
 * One fact, two homes, and they drifted immediately (`.178`). The moment
 * billing cleared on 2026-08-01 and the PR gate ran for the first time, *Today
 * shows one red action at 19:00* failed on CI — deterministically, on the retry
 * too — while passing locally, because the two lanes were configured
 * differently.
 *
 * That is `.209`'s lesson pointed the other way: there, the gate measured a
 * configuration production does not serve. Here, CI measured a configuration
 * the *local gate* does not serve, and the local gate is what every agent runs
 * before pushing. A green local gate meant nothing about CI.
 *
 * So the two lists are compared. Not "CI has some env" — **every variable the
 * local gate sets is set in CI, to the same value**, because a placeholder that
 * differs between lanes is the same defect with extra steps.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/**
 * `BUILD_ENV` in `gate.mjs`, as `name → literal`.
 *
 * Values are written as `process.env.X || 'literal'`, so the literal is the
 * fallback the gate actually uses on a machine with nothing set — which is the
 * configuration CI has to match.
 */
function gateEnv(): Map<string, string> {
  const src = read('scripts/gate.mjs');
  const block = src.slice(src.indexOf('const BUILD_ENV'), src.indexOf('let step = 0'));
  assert.ok(block.length > 100, 'BUILD_ENV moved in gate.mjs — re-read this guard');

  /*
   * Split at each declaration first, then read the literal inside that segment.
   *
   * The first draft did it in one regex — `([A-Z_]+):\s*(?:[\s\S]*?\|\|\s*)?'…'`
   * — and the optional cross-line branch let `PRIVATE_MODE: 'false',` reach
   * *past its own line* to the `|| 'https://ci-placeholder…'` belonging to the
   * next variable. It reported `PRIVATE_MODE=https://ci-placeholder.supabase.co`
   * and failed on a disagreement that did not exist. Two forms have to be read
   * (`NAME: 'x',` and `NAME:\n  process.env.NAME || 'x',`) and a bounded
   * segment is what keeps them apart.
   */
  const decl = /^ {2}([A-Z_][A-Z0-9_]*):/gm;
  const starts = [...block.matchAll(decl)].map((m) => ({ name: m[1], at: m.index ?? 0 }));

  const out = new Map<string, string>();
  starts.forEach((d, i) => {
    const segment = block.slice(d.at, starts[i + 1]?.at ?? block.length);
    const literal = segment.match(/'([^']+)'/);
    if (literal) out.set(d.name, literal[1]);
  });
  return out;
}

/** The `env:` block on the `build-and-test` job. */
function ciEnv(): Map<string, string> {
  const src = read('.github/workflows/ci.yml');
  const start = src.indexOf('\n    env:\n');
  assert.notEqual(start, -1, 'the build-and-test env block moved — re-read this guard');
  const block = src.slice(start, src.indexOf('\n    steps:', start));

  const out = new Map<string, string>();
  for (const line of block.split('\n')) {
    const m = line.match(/^\s{6}([A-Z_][A-Z0-9_]*):\s*'?([^'#]+?)'?\s*$/);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
}

test('every variable the local gate sets is also set in CI', () => {
  const gate = gateEnv();
  const ci = ciEnv();

  assert.ok(gate.size >= 3, `parsed only ${gate.size} vars from gate.mjs — the parser broke`);
  assert.ok(ci.size >= 3, `parsed only ${ci.size} vars from ci.yml — the parser broke`);

  const missing = [...gate.keys()].filter((k) => !ci.has(k));
  assert.deepEqual(
    missing,
    [],
    'these are set for the local gate but not for CI, so the two lanes build different apps:\n  ' +
      missing.join('\n  ')
  );
});

test('and to the same value', () => {
  /*
   * Presence alone is not enough. A placeholder that differs between lanes
   * reproduces the defect with extra steps — the surfaces would render in one
   * lane and not the other, exactly as they just did.
   */
  const gate = gateEnv();
  const ci = ciEnv();

  const differing = [...gate.entries()]
    .filter(([k, v]) => ci.has(k) && ci.get(k) !== v)
    .map(([k, v]) => `${k}: gate=${v} ci=${ci.get(k)}`);

  assert.deepEqual(differing, [], 'the two lanes disagree on these values:\n  ' + differing.join('\n  '));
});

test('the VAPID placeholder is present in both, and is only the public half', () => {
  /*
   * Named explicitly because it is the one that actually broke, and because it
   * is the one a future reader is most likely to remove on security grounds.
   *
   * It is safe: the public half of a keypair gates only whether the UI *draws*.
   * Nothing can subscribe — the server has no private key and no test grants
   * notification permission. Removing it does not harden anything; it silently
   * un-renders every push surface and makes the guards over them vacuous again,
   * which is the `.198` defect this placeholder exists to prevent.
   */
  const gate = gateEnv();
  const ci = ciEnv();
  assert.ok(gate.has('NEXT_PUBLIC_VAPID_PUBLIC_KEY'), 'gate.mjs lost the VAPID placeholder');
  assert.ok(ci.has('NEXT_PUBLIC_VAPID_PUBLIC_KEY'), 'ci.yml lost the VAPID placeholder');

  // Public VAPID keys are 65-byte P-256 points, base64url — never a private key.
  const key = ci.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY') ?? '';
  assert.match(key, /^B[A-Za-z0-9_-]{80,}$/, 'not a public VAPID key — do not put a secret here');
});

/* ── Step parity ─────────────────────────────────────────────────────────── */

/**
 * `.250` — env parity was only half the question.
 *
 * Five checks ran **only** in `scripts/gate.mjs`: `check-design-system`
 * (`.221`, widened in `.244`), `bundle-budget` (`.209`), `check-locale-split`
 * (`.222`), `i18n:coverage` and `a11y` (`.200`). So they were advisory in the
 * one lane an agent can forget, and absent from the lane that actually blocks
 * a pull request.
 *
 * `ci.yml` already states the principle above its first check — *"a guard
 * nobody runs on a PR is not a guard, and branches from other sessions never
 * run the local gate."* This asserts it.
 *
 * It is the `.200`/`.213`/`.219` defect with the lanes swapped. Those waves
 * found checks living only in a billing-blocked workflow, so `npm run gate`
 * became the real gate. Now CI runs again and is the enforcing lane — and the
 * drift silently reversed.
 */
const CI_ONLY_EXEMPT: { script: string; why: string }[] = [
  {
    script: 'start',
    why: 'Not a check — the local gate spawns the server itself, while ci.yml starts one inline in its own step. Different mechanism, same effect.',
  },
  {
    script: 'a11y',
    why: 'Needs a running server, and the one local run of it flaked: axe measured skeleton text at 1.05 contrast on /profile before the page settled. Adding a step that can go red for a render race would make CI a coin flip, and a check people re-run until green teaches them to ignore it. Fix the settle race first, then add it.',
  },
];

function npmScripts(text: string, pattern: RegExp): Set<string> {
  return new Set([...text.matchAll(pattern)].map((m) => m[1]).filter(Boolean));
}

test('every check the local gate runs also runs on CI', () => {
  const gate = npmScripts(read('scripts/gate.mjs'), /'npm',\s*\['run',\s*'([^']+)'/g);
  const ci = new Set([
    ...npmScripts(read('.github/workflows/ci.yml'), /run: npm run ([\w:-]+)/g),
    ...npmScripts(read('.github/workflows/ci.yml'), /run: npm (test)\b/g),
  ]);

  assert.ok(gate.size >= 8, `parsed only ${gate.size} gate steps — the parser broke`);
  assert.ok(ci.size >= 8, `parsed only ${ci.size} CI steps — the parser broke`);

  const exempt = new Set(CI_ONLY_EXEMPT.map((e) => e.script));
  const missing = [...gate].filter((s) => !ci.has(s) && !exempt.has(s)).sort();

  assert.deepEqual(
    missing,
    [],
    'these run in the local gate but not on CI, so they only guard the lane an agent can skip:\n  ' +
      missing.join('\n  ')
  );
});

test('every step exempted from CI states why', () => {
  for (const e of CI_ONLY_EXEMPT) {
    assert.ok(e.why.trim().length > 60, `${e.script}: "${e.why}" is not a reason`);
  }
});

test('no exemption is stale', () => {
  // `.220`'s direction: an entry for a script the gate no longer runs makes the
  // list look more considered than it is.
  const gate = npmScripts(read('scripts/gate.mjs'), /'npm',\s*\['run',\s*'([^']+)'/g);
  const stale = CI_ONLY_EXEMPT.filter((e) => !gate.has(e.script) && e.script !== 'start').map(
    (e) => e.script
  );
  assert.deepEqual(stale, [], 'the local gate no longer runs these — remove their exemptions');
});

test('the locale-split check runs before the locale export', () => {
  /*
   * `.250` — ordering is load-bearing here, and nothing else says so.
   *
   * `npm run export-locales` regenerates `public/locales/**` in the pre-`.222`
   * unsplit shape. Verified, not assumed: running it turns
   * `check-locale-split` from "15 languages, all split" into "392 files carry
   * keys outside their namespace". So a CI that exports *before* it checks can
   * never pass — and a reorder is a one-line diff nobody would think twice
   * about.
   */
  /*
   * Matched on the `run:` line, not the bare script name. The first version
   * used `indexOf('npm run export-locales')` and failed immediately — on the
   * **comment** above the split step, which names that command while
   * explaining this very ordering. Prose is not execution, which is the same
   * distinction `check-design-system` strips comments for.
   */
  const ci = read('.github/workflows/ci.yml');
  const split = ci.indexOf('run: npm run check-locale-split');
  const exp = ci.indexOf('run: npm run export-locales');
  assert.notEqual(split, -1, 'the locale-split step is gone from CI');
  assert.notEqual(exp, -1, 'the locale-export step is gone from CI');
  assert.ok(
    split < exp,
    'check-locale-split must come before export-locales — the export recreates the unsplit shape, so this check can never pass after it'
  );
});
