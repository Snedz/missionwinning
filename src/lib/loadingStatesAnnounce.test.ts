/**
 * Every loading placeholder announces itself — and the a11y gate reads that marker.
 *
 * `.253` — `tests/e2e/a11y.spec.ts` waited for `getAnimations()` to go quiet and
 * called the page settled. `src/components/ui/Skeleton.tsx` deliberately does not
 * animate (its header explains why: the old pulse *was* the information, so
 * `prefers-reduced-motion` deleted it). Two correct decisions composing into a
 * wait that is blind to loading by construction — `/profile` under a 40× CPU
 * throttle reaches the scan with **two `aria-busy` regions on screen and zero
 * running animations**.
 *
 * The wait now asks about `aria-busy` too. That only works if the app sets it
 * wherever it is loading, so this file holds up the other half of the bargain.
 * Otherwise `.253` is `.199`/`.212` again: a guard keyed to one spelling, passing
 * because the thing it looks for is simply absent.
 *
 * It found four on arrival, all real:
 *
 * - `HomeTodayDashboard` mounted **five** widgets with `loading: () => <Skeleton …/>`
 *   on `/`, the most-linked page in the product. A bare `Skeleton` is `aria-hidden`
 *   — a shape, not content — so those placeholders were invisible to a screen
 *   reader *and* to any settle rule.
 * - `BenchmarksPage` and `HistoryPage` (×2) used `<div className="h-48
 *   animate-pulse bg-card" />`: anonymous grey boxes carrying the exact pulse
 *   `Skeleton` retired, on three chart slots.
 *
 * Written by discovery rather than enumeration (`.220`): the fallback expression
 * is parsed, the component it names is resolved **anywhere in the repo**, and the
 * answer comes from that component's own source. Nothing here lists which
 * placeholders exist, so one added tomorrow is covered tomorrow.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(path.join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(path.join(root, rel)).isDirectory()) walk(rel, out);
    else if (rel.endsWith('.tsx')) out.push(rel);
  }
  return out;
}

/**
 * JSX/TS comments blanked, newlines kept so line numbers survive.
 *
 * Not optional, and not hygiene — it is load-bearing twice over here, which is
 * `designSystem.test.ts`'s "comments are not code" arriving from a new direction.
 * This file's own prose quotes `aria-busy="true"` while explaining the rule, and
 * `Skeleton`'s declaration is immediately followed by `SkeletonBlock`'s doc
 * comment, which does the same. Both made the one component that must fail this
 * guard — the bare, deliberately `aria-hidden` placeholder — read as announcing.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
}

const SOURCE_FILES = [...walk('src'), ...walk('app')];
const SOURCES = new Map(SOURCE_FILES.map((f) => [f, stripComments(read(f))]));

/**
 * Fallbacks that are legitimately not placeholders.
 *
 * Per entry, per file, with a reason and what would clear it — the shape `.220`
 * asked for and `designSystem.test.ts` uses. A blanket "skip LandingPage" would
 * quietly cover the next anonymous box added to it.
 */
const NOT_A_PLACEHOLDER: { file: string; fallback: string; why: string; fixWhen: string }[] = [
  {
    file: 'src/components/landing/CinematicWww.tsx',
    fallback: 'CinematicLoggerFallback',
    why: 'Renders the hero logger for real rather than standing in for it — same component serves as the permanent no-JS shell, so from the reader\'s point of view nothing is loading and there is no busy state to announce.',
    fixWhen: 'It stops being the no-JS shell and becomes a placeholder shape.',
  },
];

const exempt = (file: string, fallback: string) =>
  NOT_A_PLACEHOLDER.some((e) => e.file === file && e.fallback === fallback);

/**
 * The fallback expression, taken by balancing brackets rather than by reading to
 * end of line.
 *
 * The first draft matched `loading:\s*\(\)\s*=>\s*<(\w+)` and silently skipped
 * every multi-line `loading: () => (` — three of them, in FuelLogSheet,
 * BuilderPage and HomeTodayDashboard. A guard that quietly covers a subset is
 * the defect this file is about, one level up.
 */
function fallbackBodies(src: string): { body: string; index: number }[] {
  const found: { body: string; index: number }[] = [];
  for (const m of src.matchAll(/loading:\s*\(\)\s*=>\s*/g)) {
    let i = (m.index ?? 0) + m[0].length;
    if (src[i] === '(') {
      let depth = 0;
      const start = i;
      for (; i < src.length; i += 1) {
        if (src[i] === '(') depth += 1;
        else if (src[i] === ')') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      found.push({ body: src.slice(start, i + 1), index: m.index ?? 0 });
    } else {
      const end = src.indexOf('\n', i);
      found.push({ body: src.slice(i, end === -1 ? src.length : end), index: m.index ?? 0 });
    }
  }
  return found;
}

/**
 * The source of a component's own declaration, wherever in the repo it lives.
 *
 * Bounded at the **next** declaration, not at a fixed character count. A flat
 * 2,500-character slice from `function Skeleton(` ran straight through into
 * `SkeletonCard` — so the one component this file needs to see fail (the bare,
 * `aria-hidden` placeholder) was reading its neighbour's `aria-busy` and passing.
 */
function declarationOf(name: string): string | null {
  for (const [, src] of SOURCES) {
    const at = src.search(new RegExp(`function ${name}\\s*\\(`));
    if (at === -1) continue;
    const rest = src.slice(at + name.length);
    const next = rest.search(/\n(export )?function \w+\s*\(|\nexport const \w+ =/);
    return next === -1 ? src.slice(at) : src.slice(at, at + name.length + next);
  }
  return null;
}

const ANNOUNCES = /aria-busy=("true"|\{true\})/;

test('every dynamic() loading fallback announces that it is loading', () => {
  const offenders: string[] = [];

  for (const [file, src] of SOURCES) {
    for (const { body, index } of fallbackBodies(src)) {
      if (/^\s*\(?\s*null/.test(body)) continue;

      const tag = body.match(/<(\w+)/)?.[1];
      if (!tag) continue;
      if (exempt(file, tag)) continue;

      // An inline element carries its own attributes; a component carries them
      // in its declaration. Resolving rather than trusting the name is what makes
      // `<Skeleton/>` (aria-hidden by design) fail here while `<SkeletonBlock/>`
      // passes — the two differ only in what their source says.
      const subject = /^[a-z]/.test(tag) ? body : (declarationOf(tag) ?? '');
      if (ANNOUNCES.test(subject)) continue;

      offenders.push(`${file}:${src.slice(0, index).split('\n').length} → <${tag}>`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'these loading fallbacks never say they are loading, so a screen reader gets an ' +
      'unlabelled box and `settle()` in a11y.spec.ts measures it as finished content. ' +
      'Use SkeletonBlock, wrap them in role="status" aria-busy="true", or add a ' +
      `NOT_A_PLACEHOLDER entry saying why:\n${offenders.join('\n')}`
  );
});

test('the resolver actually resolves — this guard is not passing vacuously', () => {
  /*
   * Two of my own guards were vacuous in `.226` and mutation testing is what
   * caught them. Same check, cheaper: prove the parser sees the fallbacks and the
   * lookup finds real declarations, so an "all clear" means something.
   */
  const total = [...SOURCES.values()].reduce((n, s) => n + fallbackBodies(s).length, 0);
  assert.ok(total > 25, `expected the repo's dynamic() fallbacks, parsed ${total}`);

  assert.ok(ANNOUNCES.test(declarationOf('SkeletonCard') ?? ''), 'SkeletonCard must announce');
  assert.ok(ANNOUNCES.test(declarationOf('RouteLoading') ?? ''), 'RouteLoading must announce');
  assert.ok(
    !ANNOUNCES.test(declarationOf('Skeleton') ?? ''),
    'bare Skeleton must stay aria-hidden — it is a shape, not a status, and a fallback ' +
      'made only of one is the defect this file was written for'
  );
});

test('no NOT_A_PLACEHOLDER entry is stale', () => {
  /*
   * `.220`'s correction applied on arrival. An entry naming a fallback that would
   * now pass on its own makes the list look more considered than it is — and that
   * direction has already caught one of mine.
   */
  const stale = NOT_A_PLACEHOLDER.filter((e) => {
    const src = SOURCES.get(e.file) ?? '';
    const hit = fallbackBodies(src).find((f) => f.body.match(/<(\w+)/)?.[1] === e.fallback);
    if (!hit) return true; // the fallback is gone entirely
    const subject = /^[a-z]/.test(e.fallback) ? hit.body : (declarationOf(e.fallback) ?? '');
    return ANNOUNCES.test(subject);
  }).map((e) => `${e.file} → <${e.fallback}>`);

  assert.deepEqual(stale, [], 'these no longer need an exemption — remove them');
});

test('every exemption states why, and what would clear it', () => {
  for (const e of NOT_A_PLACEHOLDER) {
    assert.ok(SOURCES.has(e.file), `${e.file} no longer exists`);
    assert.ok(e.why.trim().length > 60, `${e.file}: "${e.why}" is not a reason`);
    assert.ok(e.fixWhen.trim().length > 15, `${e.file} must say what would clear it`);
  }
});

test('/active declares aria-busy while persist rehydrates', () => {
  /*
   * The specific thing that let the route special-case go.
   *
   * `a11y.spec.ts` used to carry `if (path === '/active')` and wait on the Start
   * button's *copy* (`/start workout|loading session/i`) — so the wait was one
   * string edit from silently disappearing, and no other route had one at all.
   * `/active`'s pre-hydration state is not a code-split chunk (`RouteLoading`
   * already announces that); it is `ActiveEmptyState` with `hydrated={false}`,
   * which said nothing. Now it does, and the general rule covers it.
   */
  const src = read('src/components/workout/ActiveEmptyState.tsx');
  assert.match(
    src,
    /aria-busy=\{hydrated \? undefined : true\}/,
    'ActiveEmptyState must mark itself busy while unhydrated, or a11y.spec.ts loses /active'
  );
});

test('the a11y settle rule reads aria-busy, and names no route', () => {
  /*
   * `.220`'s correction as a standing assertion. The enumeration is easy to
   * reintroduce — the next flaky route invites exactly one more `if (path ===`,
   * and each one is individually reasonable.
   */
  const spec = read('tests/e2e/a11y.spec.ts');

  assert.match(
    spec,
    /querySelectorAll\('\[aria-busy="true"\]'\)/,
    'settle() must wait for loading regions, not only animations'
  );
  /*
   * And the count must **gate the loop**, not merely be computed.
   *
   * The first draft asserted only that the selector appeared somewhere in the
   * file, and a mutant that deleted `&& loading() === 0` from the quiet condition
   * sailed through it: the query still ran, its answer was discarded, and the
   * guard reported green while `settle()` was exactly as blind as before. That is
   * `.220` — a check whose name claims more than what it actually looks at —
   * appearing inside the fix for `.220`.
   */
  assert.match(
    spec,
    /running\.length === 0 && loading\(\) === 0/,
    'the aria-busy count must be part of settle()’s quiet condition, not just computed'
  );
  /*
   * `[aria-busy="true"]`, not `[aria-busy]`. `HoldToConfirmButton` and
   * `CoachChatPanel` bind the attribute to state, so a fully settled page still
   * carries `aria-busy="false"` nodes; the looser selector would never clear and
   * every route would burn the whole timeout instead.
   */
  assert.doesNotMatch(spec, /querySelectorAll\('\[aria-busy\]'\)/);

  assert.equal(
    [...spec.matchAll(/if\s*\(\s*path\s*===/g)].length,
    0,
    'a route special-case is back in a11y.spec.ts — express it as a settle condition instead'
  );
});
