#!/usr/bin/env node
/**
 * Every class the www source references must exist in the built stylesheet.
 *
 * Two failure modes, one check:
 *
 *  1. A ported island references a class it does not own. LogToPlanHero,
 *     CoachAdaptDemo and WeekStrip carry `.eyebrow`, `.reveal`, `.content-card`,
 *     `.tap-target`, `.briefing-rule`, `.week-strip-pulse`, `.is-active-row` —
 *     all defined in src/index.css, none of them automatically present here.
 *     A missing one renders invisible or unstyled content and NOTHING FAILS:
 *     the build is green, the page loads, the text is just gone. That is the
 *     defect class this repo keeps paying for, one layer out from `.221`.
 *
 *  2. Tailwind did not generate a utility because the class was assembled at
 *     runtime. `class={`text-${size}`}` produces no CSS and no error.
 *
 * Comparing against the BUILT stylesheet rather than a hand-listed set is what
 * makes this discover rather than enumerate: whatever Tailwind actually emitted
 * is the truth, so a new utility needs no maintenance here and a deleted
 * component class fails immediately.
 *
 * Run: npm run www:check  (or node scripts/www-class-contract.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const SRC = path.join(root, 'sites/www/src');
const DIST = path.join(root, 'sites/www/dist');

/**
 * Classes that are markers, not styles — they exist to be queried, never to
 * paint. Each needs a reason, in the idiom check-design-system's ALLOWLIST uses:
 * an exemption without one is a disabled check.
 */
const MARKERS = [
  {
    name: 'reveal-visible',
    why: 'Applied by the scroll-reveal island at runtime, so it is never in a source class attribute at build time; it IS defined in global.css.',
  },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(astro|tsx?|jsx?)$/.test(e.name)) out.push(full);
  }
  return out;
}

/** Class selectors present in the built CSS, with Tailwind's escaping undone. */
function builtClasses(cssText) {
  const set = new Set();
  for (const m of cssText.matchAll(/\.((?:[A-Za-z0-9_-]|\\.)+)/g)) {
    set.add(m[1].replace(/\\(.)/g, '$1'));
  }
  return set;
}

/** Static class tokens in a source file. Dynamic pieces are skipped, loudly. */
function sourceClasses(src) {
  const found = new Set();
  let dynamic = 0;
  const attrs = [
    ...src.matchAll(/class(?:Name)?\s*=\s*"([^"]*)"/g),
    ...src.matchAll(/class(?:Name)?\s*=\s*'([^']*)'/g),
    ...src.matchAll(/class(?:Name)?\s*=\s*\{`([^`]*)`\}/g),
  ];
  for (const m of attrs) {
    /*
     * Strip `${…}` spans BEFORE splitting on whitespace.
     *
     * Filtering token-by-token instead — the first version of this — reads the
     * inside of an interpolation as class names: `${rule ? 'rule-top' : ''}`
     * splits into `${rule`, `?`, `'rule-top'`, `:`, `''}`, and only the first
     * and last carry a brace, so the guard reported `.?` and `.:` as undefined
     * classes. A check that invents findings gets muted as fast as one that
     * misses them.
     *
     * The expression's own class names are not recovered — they are dynamic by
     * definition. They are counted, and the count is printed, so the blind spot
     * is visible rather than assumed to be empty.
     */
    let value = m[1];
    const interpolations = value.match(/\$\{[^}]*\}/g);
    if (interpolations) {
      dynamic += interpolations.length;
      value = value.replace(/\$\{[^}]*\}/g, ' ');
    }

    for (const raw of value.split(/\s+/)) {
      const token = raw.trim();
      if (!token) continue;
      // A leftover brace means an interpolation this regex could not close —
      // nested braces, most likely. Count it, do not guess at it.
      if (token.includes('$') || token.includes('{') || token.includes('}')) {
        dynamic += 1;
        continue;
      }
      found.add(token);
    }
  }
  return { found, dynamic };
}

function main() {
  const cssFiles = fs.existsSync(DIST)
    ? walk(DIST, []).concat(
        fs
          .readdirSync(path.join(DIST, '_astro'), { withFileTypes: true })
          .filter((e) => e.isFile() && e.name.endsWith('.css'))
          .map((e) => path.join(DIST, '_astro', e.name)),
      )
    : [];
  const css = cssFiles
    .filter((f) => f.endsWith('.css'))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');

  if (!css) {
    console.error(
      '\n✗ No built stylesheet found under sites/www/dist.\n' +
        '  Run `npm --prefix sites/www run build` first — this check compares source\n' +
        '  against what Tailwind actually emitted, and with no CSS it would report\n' +
        '  every class as missing or, worse, nothing at all.\n',
    );
    throw new Error('www-class-contract: no built CSS');
  }

  const defined = builtClasses(css);
  const markerNames = new Set(MARKERS.map((m) => m.name));

  const files = walk(SRC, []);
  const missing = [];
  let dynamicTotal = 0;
  let checked = 0;

  for (const file of files) {
    const rel = path.relative(root, file);
    const { found, dynamic } = sourceClasses(fs.readFileSync(file, 'utf8'));
    dynamicTotal += dynamic;
    for (const token of found) {
      checked += 1;
      if (defined.has(token) || markerNames.has(token)) continue;
      missing.push({ file: rel, token });
    }
  }

  // A contract check that checked nothing passes everything. If the source has
  // no class attributes at all, that is a broken scan, not a clean bill.
  if (checked === 0) {
    console.error('\n✗ www-class-contract found zero class tokens to check.\n');
    throw new Error('www-class-contract: scanned nothing');
  }

  console.log(
    `www class contract — ${files.length} source files, ${checked} class references, ` +
      `${defined.size} classes in built CSS` +
      (dynamicTotal ? `, ${dynamicTotal} dynamic (unresolvable, not checked)` : ''),
  );

  if (missing.length) {
    console.error(`\n✗ ${missing.length} class reference(s) with no rule in the built CSS:\n`);
    for (const m of missing) {
      console.error(`    ${m.file}  .${m.token}`);
    }
    console.error(
      '\n  Either the class is undefined (an island referencing a rule this site\n' +
        '  does not carry), or Tailwind never generated it. Both render silently.\n',
    );
    process.exitCode = 1;
    return;
  }

  console.log('  ✓ every referenced class has a rule');
}

main();
