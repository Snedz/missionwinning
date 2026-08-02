#!/usr/bin/env node
/**
 * How much of this codebase does the suite actually execute?
 *
 * `npm test` is 1,186 green tests, and `node --test --experimental-test-coverage`
 * answers **92.0%**. Both numbers are true and together they are misleading, because
 * V8 can only report a file it *loaded*: when this was written the report reached
 * **271 of 657** source files and the other 386 were absent from it — not scored
 * zero, absent. Averaging over the reached 41% is what produces 92%.
 *
 * That is this repo's own recurring defect one level up. `.213` found `ciTruth`
 * counting dead workflows as coverage; `.220` found a guard "named for both streak
 * readers" that opened a two-file list. A metric whose *name* claims the codebase
 * and whose *denominator* is whatever happened to get imported is the same shape,
 * and it is the shape you cannot see from inside a green run.
 *
 * So this script fixes the denominator. It enumerates every source file under
 * `src/` and `packages/mw-core/`, and a file no test loads counts as **untested**,
 * by name, in the output.
 *
 * ## It ratchets on functions, not lines
 *
 * Line % is the metric that produced the two numbers this was built to catch:
 *
 *   - `apiSchemas.ts` — **98.23% lines / 23.91% functions**. It is Zod:
 *     `z.object({…})` runs at module load, so importing the file "covers" nearly
 *     every line while the refinements and parse paths never run. 35 schemas
 *     exported; 3 were named in any test. This is the input validation for all 67
 *     API routes.
 *   - `payments.ts` — **73.54% lines / 33.33% functions**. The covered part is the
 *     price constants. `createCheckoutForPlan`, `getStripeCheckoutUrl` and
 *     `openBillingPortal` are unexecuted. The file reads three-quarters covered
 *     because something imports `SUPER_BUNDLE_PRICE`.
 *
 * Ratcheted the `.202`/`.209` way — floors only ever move in the improving
 * direction, and `coverageBudget.test.ts` pins the high-water marks separately so a
 * loosened floor cannot pass unnoticed.
 *
 * Run: node scripts/coverage.mjs        (gate step; runs the tests itself)
 *      node scripts/coverage.mjs --list  also print every untested file
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The floors. **Improve these whenever you win; never loosen them.**
 *
 * Measured 2026-08-01, at the values the suite actually produces, with no
 * headroom on `untestedFiles` and ~1 point on the percentages: a floor set below
 * where you are is a floor that cannot fail, which is `.219`'s saturated
 * `npm audit` in a new costume.
 *
 * `untestedFiles` is the number that matters and the only one with no estimation
 * in it — it counts files, not lines, so nothing depends on what V8 considers
 * instrumentable. It is high because ~295 component / page-component / hook files
 * are covered by Playwright rather than unit tests, which is a deliberate choice
 * and still leaves them invisible to this measurement. Lowering it is how the
 * proposals in the coverage analysis get paid off one at a time.
 */
const FLOORS = {
  /**
   * Source files that no test loads, directly or transitively. Must not rise.
   *
   * 381 → 391 when this branch finally merged. **None of the ten is this
   * branch's**: they arrived on `master` while `.260` sat in the queue behind
   * `.244`–`.259`, and a floor measured against a `master` eight ships older
   * than the one you merge into is a floor that fails for being stale rather
   * than for being breached.
   *
   * Raised here rather than absorbed silently, because the guard's own failure
   * message asks for exactly that — say so where a reviewer can see it. What
   * arrived, by kind:
   *
   *   8  UI, Playwright-covered — `components/{charts,history,journey,public,
   *      track,ui}`, `page-components/HistoryDayPage`
   *   2  client hooks — `useDismissed`, `useLocaleFormat` (this lane is 0/18
   *      and has been since the script was written)
   *   3  locale packs — `firstSteps`, `notification`, `zeroState`
   *   4  **logic, and the actionable ones** — `today/firstStepsDismissed`,
   *      `today/todayBlockPriority`, `trends/resolveTrendSeries`,
   *      `trends/trendMetrics`
   *
   * Those last four are real debt carried in from `.244`–`.251` and
   * `.240`–`.243`, not UI that Playwright covers. They are named here rather
   * than tested here because writing tests for another ship's modules inside a
   * merge commit hides which change earned which test. The script lists them
   * under "untested logic files" on every run, so the debt stays visible and
   * this floor comes back down when they are paid off.
   */
  untestedFiles: 391,
  /**
   * Line % across the files that *are* loaded. Must not fall.
   *
   * Deliberately looser than the others, because **reaching a new file usually
   * lowers this number**: a 400-line server module that no test imported
   * contributed nothing to either side of the fraction, and the moment one test
   * touches it, all its unexecuted branches join the denominator. `.260`'s
   * revenue-path work moved reach 41.2% → 42.1% and line % 91.84 → 91.80.
   *
   * Ratcheting this tightly would therefore punish the exact change the other two
   * floors exist to encourage. `untestedFiles` is the primary ratchet; this one is
   * a floor against a real collapse, not a high-water mark.
   */
  linePct: 91.5,
  /** Function % across the files that are loaded — the one that catches Zod. */
  funcPct: 67.3,
};

/**
 * esbuild's CJS interop banner, which `tsx` injects into every transformed file
 * and lcov then reports as functions. On a small module they outnumber the real
 * ones: `fuelStreak.ts` reports FNF:10 / FNH:8 (80%) where the real answer is
 * 1 of 2 (50%), because all six helpers are always called.
 *
 * Counting them would make function coverage measure the transform instead of the
 * code — a guard that reports on its own tooling, which is the `.212` failure
 * (a check keyed to an artifact of how it looks rather than to the thing it claims
 * to see).
 *
 * `get` is emitted *inside* `__copyProps`, so it is only dropped when the rest of
 * the banner is present — a genuinely-named `get` in a file esbuild did not wrap
 * still counts.
 */
const ESBUILD_HELPERS = new Set([
  '__name', '__export', '__copyProps', '__toCommonJS', '__toESM', '__commonJS', '__require',
]);
const HELPER_ONLY_WITH_BANNER = new Set(['get']);

/** Test files are not the subject of the measurement. */
const IS_TEST = /\.(test|routetest)\.tsx?$/;

function sourceUniverse() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.posix.join(dir, e.name);
      if (e.isDirectory()) walk(rel);
      else if (/\.tsx?$/.test(e.name) && !e.name.endsWith('.d.ts') && !IS_TEST.test(e.name)) out.push(rel);
    }
  };
  walk('src');
  walk('packages/mw-core/src');
  return out.sort();
}

/**
 * Run one lane, writing lcov to `dest` and the usual spec output to the terminal.
 *
 * A coverage script that swallows test failures would report a comfortable number
 * for a red suite, so the lane's exit status is propagated rather than inspected
 * for coverage only.
 */
function runLane(label, extraNodeArgs, pattern, dest) {
  console.log(`\n  running ${label}…`);
  const r = spawnSync(
    'npx',
    [
      'tsx',
      ...extraNodeArgs,
      '--test',
      '--experimental-test-coverage',
      '--test-reporter=lcov',
      `--test-reporter-destination=${dest}`,
      '--test-reporter=dot',
      '--test-reporter-destination=stdout',
      pattern,
    ],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'inherit', 'inherit'] }
  );
  if (r.status !== 0) {
    console.error(`\n\x1b[31m✗ ${label} failed — coverage of a red suite is not a number worth having.\x1b[0m`);
    process.exit(r.status ?? 1);
  }
}

/**
 * Parse lcov into `{ file → { lines: Map<line,hits>, funcs: Map<name,hits> } }`.
 *
 * Both maps are keyed rather than appended because esbuild's transform emits the
 * same function twice (`getFuelLogStreak` at FN:19 *and* FN:28, from the export
 * getter and the declaration). Keying by name and taking the max counts one
 * function once and does not credit a wrapper for the body it forwards to.
 */
function parseLcov(text) {
  const files = new Map();
  let cur = null;
  const fnNames = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('SF:')) {
      const f = line.slice(3).trim();
      cur = files.get(f) ?? { lines: new Map(), funcs: new Map() };
      files.set(f, cur);
      fnNames.length = 0;
    } else if (!cur) {
      continue;
    } else if (line.startsWith('FN:')) {
      fnNames.push(line.slice(3).split(',').slice(1).join(','));
    } else if (line.startsWith('FNDA:')) {
      const [hitsRaw, ...rest] = line.slice(5).split(',');
      const name = rest.join(',');
      const hits = Number(hitsRaw) || 0;
      cur.funcs.set(name, Math.max(cur.funcs.get(name) ?? 0, hits));
    } else if (line.startsWith('DA:')) {
      const [ln, hits] = line.slice(3).split(',');
      const n = Number(ln);
      cur.lines.set(n, Math.max(cur.lines.get(n) ?? 0, Number(hits) || 0));
    } else if (line === 'end_of_record') {
      cur = null;
    }
  }
  // Drop the transform's own helpers.
  for (const rec of files.values()) {
    const hasBanner = [...rec.funcs.keys()].some((n) => ESBUILD_HELPERS.has(n));
    for (const name of [...rec.funcs.keys()]) {
      const helper =
        ESBUILD_HELPERS.has(name) ||
        /^anonymous_\d+$/.test(name) ||
        (hasBanner && HELPER_ONLY_WITH_BANNER.has(name));
      if (helper) rec.funcs.delete(name);
    }
  }
  return files;
}

/** Merge the two lanes: a file loaded by both is covered by the union of the runs. */
function mergeLcov(a, b) {
  const out = new Map(a);
  for (const [file, rec] of b) {
    const cur = out.get(file);
    if (!cur) {
      out.set(file, rec);
      continue;
    }
    for (const [k, v] of rec.lines) cur.lines.set(k, Math.max(cur.lines.get(k) ?? 0, v));
    for (const [k, v] of rec.funcs) cur.funcs.set(k, Math.max(cur.funcs.get(k) ?? 0, v));
  }
  return out;
}

const listAll = process.argv.includes('--list');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mw-coverage-'));
const unitLcov = path.join(tmp, 'unit.info');
const routeLcov = path.join(tmp, 'routes.info');

console.log('coverage — over every source file, not only the ones a test imported\n');
runLane('unit lane', [], 'src/**/*.test.ts', unitLcov);
// Route handlers import `server-only`, which throws under plain tsx — same lane
// split as `npm run test:routes`, for the same reason.
runLane('route lane', ['--conditions=react-server'], 'src/**/*.routetest.ts', routeLcov);

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
const covered = mergeLcov(parseLcov(read(unitLcov)), parseLcov(read(routeLcov)));

const universe = sourceUniverse();
const loaded = [];
const untested = [];
for (const file of universe) (covered.has(file) ? loaded : untested).push(file);

let lf = 0, lh = 0, fnf = 0, fnh = 0;
const perFile = [];
for (const file of loaded) {
  const rec = covered.get(file);
  const fileLf = rec.lines.size;
  const fileLh = [...rec.lines.values()].filter((h) => h > 0).length;
  const fileFnf = rec.funcs.size;
  const fileFnh = [...rec.funcs.values()].filter((h) => h > 0).length;
  lf += fileLf; lh += fileLh; fnf += fileFnf; fnh += fileFnh;
  perFile.push({
    file,
    linePct: fileLf ? (100 * fileLh) / fileLf : 100,
    funcPct: fileFnf ? (100 * fileFnh) / fileFnf : 100,
    fnf: fileFnf,
  });
}

const linePct = lf ? (100 * lh) / lf : 0;
const funcPct = fnf ? (100 * fnh) / fnf : 0;
const reachPct = (100 * loaded.length) / universe.length;

/** Where the untested files are, so the number is actionable rather than just large. */
const AREAS = [
  ['src/lib', 'business logic'],
  ['src/store', 'zustand'],
  ['src/hooks', 'client hooks'],
  ['src/components', 'UI (Playwright-covered)'],
  ['src/page-components', 'pages (Playwright-covered)'],
  ['src/i18n', 'translations'],
  ['src/data', 'static catalogs'],
  ['packages/mw-core', 'shared web + Android core'],
];

console.log('\n\nreach — source files loaded by at least one test\n');
for (const [prefix, note] of AREAS) {
  const inArea = universe.filter((f) => f.startsWith(prefix + '/'));
  if (!inArea.length) continue;
  const miss = inArea.filter((f) => !covered.has(f)).length;
  const pct = (100 * (inArea.length - miss)) / inArea.length;
  const bar = '█'.repeat(Math.round(pct / 5)).padEnd(20, '·');
  console.log(
    `  ${bar} ${pct.toFixed(0).padStart(3)}%  ${prefix.padEnd(22)} ${String(inArea.length - miss).padStart(3)}/${String(inArea.length).padEnd(3)}  ${note}`
  );
}

console.log(`\n  ${loaded.length}/${universe.length} files reached (${reachPct.toFixed(1)}%), ${untested.length} untested\n`);
console.log('coverage of the files that are loaded\n');
console.log(`  lines      ${linePct.toFixed(2)}%   (${lh}/${lf})`);
console.log(`  functions  ${funcPct.toFixed(2)}%   (${fnh}/${fnf})`);

/*
 * The files where line % and function % disagree most. This is the apiSchemas
 * shape — a file that reads well covered because its top level runs on import,
 * while the code that makes decisions never does. Worth surfacing every run:
 * it is the one thing a single coverage percentage structurally cannot say.
 */
const skewed = perFile
  .filter((f) => f.fnf >= 4 && f.linePct - f.funcPct >= 25)
  .sort((a, b) => b.linePct - b.funcPct - (a.linePct - a.funcPct))
  .slice(0, 8);
if (skewed.length) {
  console.log('\nloaded, but the logic is not run — high lines, low functions\n');
  for (const f of skewed) {
    console.log(
      `  ${f.linePct.toFixed(0).padStart(3)}% lines / ${f.funcPct.toFixed(0).padStart(3)}% funcs   ${f.file}`
    );
  }
}

if (listAll) {
  console.log('\nuntested files\n');
  for (const f of untested) console.log(`  ${f}`);
} else if (untested.length) {
  const libUntested = untested.filter((f) => f.startsWith('src/lib/') || f.startsWith('packages/'));
  if (libUntested.length) {
    console.log(`\nuntested logic files (${libUntested.length}) — the actionable ones; --list for all\n`);
    for (const f of libUntested.slice(0, 15)) console.log(`  ${f}`);
    if (libUntested.length > 15) console.log(`  … and ${libUntested.length - 15} more`);
  }
}

const failures = [];
if (untested.length > FLOORS.untestedFiles) {
  failures.push(
    `${untested.length} untested files (floor ${FLOORS.untestedFiles}). A new source file with no test ` +
      `raises this. Add the test, or — if the file is genuinely Playwright-covered UI — say so in the ` +
      `PR and raise the floor in the same commit, where a reviewer can see it.`
  );
}
if (linePct < FLOORS.linePct) {
  failures.push(`line coverage ${linePct.toFixed(2)}% is below the ${FLOORS.linePct}% floor.`);
}
if (funcPct < FLOORS.funcPct) {
  failures.push(
    `function coverage ${funcPct.toFixed(2)}% is below the ${FLOORS.funcPct}% floor. ` +
      `This is the metric that catches a module whose top level runs on import while its ` +
      `decisions never do — see apiSchemas.ts at 98% lines / 24% functions.`
  );
}

fs.rmSync(tmp, { recursive: true, force: true });

if (failures.length) {
  console.error('\n\x1b[31m✗ coverage\x1b[0m');
  for (const f of failures) console.error(`    ${f}`);
  process.exit(1);
}

console.log('\n\x1b[32m✓ coverage OK\x1b[0m');
for (const [label, actual, floor, better] of [
  ['untested files', untested.length, FLOORS.untestedFiles, 'lower'],
  ['line %', Number(linePct.toFixed(2)), FLOORS.linePct, 'higher'],
  ['function %', Number(funcPct.toFixed(2)), FLOORS.funcPct, 'higher'],
]) {
  const slack = better === 'lower' ? floor - actual : actual - floor;
  if (slack > 0) console.log(`  ↓ ${label}: ${actual} vs floor ${floor} — tighten the floor to lock the win in.`);
}
