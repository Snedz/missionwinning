/**
 * What a cold visitor downloads before they asked for anything.
 *
 * Shard 4 (diaspora + RU, ops #15) reports a heavy, slow www first paint. In
 * those regions that is bandwidth, not vanity, so it is worth being exact about
 * where the bytes went.
 *
 * Measured at 390×844 on a production build, counting every script the browser
 * fetched with no interaction: **`/welcome` pulled 416 KB gzipped across 53
 * requests** — 26 chunks and 146.6 KB more than the landing page, for a screen
 * that asks three questions. The extra was almost entirely `next/link`
 * **prefetch**: `AppLegalFooter` renders eight links (Terms, Privacy, Usage,
 * Regions, Service terms, DMCA, Refunds, About) and sits on the private gate, on
 * I-Day, and under every info and pillar page. In production each of those
 * prefetches its route on load, so arriving at I-Day downloaded the legal
 * library. Turning prefetch off took `/welcome` to **334 KB / 37 requests**
 * (−82 KB, −16 requests) and `/log` from 594 KB to 545 KB.
 *
 * ## Why a guard and not just a fix
 *
 * `prefetch` defaults to on, so this regresses by *omission*: the next `<Link>`
 * added to a footer is heavy unless its author knows this. `bundle-budget.mjs`
 * cannot see it either — that measures initial JS off prerendered HTML, and
 * prefetch is a runtime fetch of *other* routes' chunks (the same blind spot
 * `.222` found for the locale HTTP overlay: "that budget measures gzipped
 * initial JS, and this is a runtime fetch").
 *
 * The rule is deliberately narrow: a component that links **four or more**
 * info/legal routes is a footer or a nav, and nobody follows four of those at
 * once. Product links — Start, Coach, the logger — are untouched, because
 * prefetching the screen an athlete is about to open is the feature working.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { PRIVATE_GATE_PUBLIC_PATHS } from '@/lib/publicRoutes';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

function componentFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(path.join(root, dir))) {
      const rel = `${dir}/${name}`;
      if (statSync(path.join(root, rel)).isDirectory()) walk(rel);
      else if (/\.tsx$/.test(rel)) out.push(rel);
    }
  };
  walk('src/components');
  walk('src/page-components');
  walk('app');
  return out;
}

/**
 * The routes this rule is about: legal and info pages, which are exactly the
 * ones reachable while the gate is up and never the destination of a first
 * paint. Derived from `publicRoutes.ts` rather than typed out again, minus the
 * ones that *are* product destinations.
 */
const PRODUCT_PATHS = new Set([
  '/private',
  '/welcome',
  /** `.769` — the free logger is public while gated; it is the product, not legal. */
  '/active',
  '/beta',
  '/guide',
  '/exercises',
  '/learn',
  '/paths',
  '/calculators',
  '/bundle',
  '/manifest.webmanifest',
  '/magazine',
  '/locales',
  '/auth/callback',
  '/youth/consent/confirm',
]);

const INFO_PATHS = PRIVATE_GATE_PUBLIC_PATHS.filter((p) => !PRODUCT_PATHS.has(p));

/** `<Link … href="/terms" …>` occurrences, with whether that Link opts out. */
function infoLinks(src: string): { href: string; prefetchOff: boolean }[] {
  const clean = stripComments(src);
  const out: { href: string; prefetchOff: boolean }[] = [];
  // Each `<Link` up to its closing `>` — attributes may be in any order.
  for (const m of clean.matchAll(/<Link\b([^>]*)>/g)) {
    const attrs = m[1];
    const href = /href="([^"]+)"/.exec(attrs)?.[1];
    if (!href || !INFO_PATHS.includes(href as (typeof INFO_PATHS)[number])) continue;
    out.push({ href, prefetchOff: /prefetch=\{false\}/.test(attrs) });
  }
  return out;
}

/** A footer or legal nav: four or more info routes in one component. */
const MANY = 4;

test('the info-route scan sees the app', () => {
  const files = componentFiles();
  assert.ok(files.length > 200, `only ${files.length} components found — walk broken?`);
  assert.ok(
    INFO_PATHS.length >= 8,
    `only ${INFO_PATHS.length} info routes derived from publicRoutes — the filter ate the list`
  );
  const linking = files.filter((f) => infoLinks(read(f)).length >= MANY);
  assert.ok(
    linking.length >= 1,
    'no component links four+ info routes — the `<Link>` pattern stopped matching'
  );
});

test('a footer full of legal links does not download the legal library', () => {
  const offenders: string[] = [];
  for (const file of componentFiles()) {
    const links = infoLinks(read(file));
    if (links.length < MANY) continue;
    const prefetching = links.filter((l) => !l.prefetchOff).map((l) => l.href);
    if (prefetching.length) offenders.push(`${file} → ${prefetching.join(', ')}`);
  }

  assert.deepEqual(
    offenders,
    [],
    `These prefetch a route nobody asked for, on first paint. Add ` +
      `prefetch={false} — measured at 82 KB gzipped and 16 requests on ` +
      `/welcome:\n  ${offenders.join('\n  ')}`
  );
});

test('product links are left alone — this rule is about legal pages only', () => {
  // The rule must not have quietly turned prefetch off for the logger or Coach:
  // prefetching the screen an athlete is about to open is the feature working.
  const hero = read('src/components/journey/JourneyHero.tsx');
  assert.doesNotMatch(
    hero,
    /prefetch=\{false\}/,
    'JourneyHero is the primary action — it should still prefetch its destination'
  );
  assert.ok(
    !INFO_PATHS.includes('/log' as (typeof INFO_PATHS)[number]) &&
      !INFO_PATHS.includes('/active' as (typeof INFO_PATHS)[number]),
    'the info-route list must never contain the logger'
  );
});
