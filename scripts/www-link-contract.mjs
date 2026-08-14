#!/usr/bin/env node
/**
 * Every internal link on the www surface resolves to something this build emits.
 *
 * Why this exists, precisely: the first homepage shipped with `/#invite` as the
 * target of its ONE action, and no `#invite` id anywhere in sites/www. The hero
 * CTA, the nav CTA and the red poster close all scrolled nowhere — on a page
 * whose brief was "one action, repeated" — and every other guard was green. A
 * dead link is invisible to the class contract (the classes existed), to the
 * rhythm guard (the type moved correctly), to the design-system walk (the
 * colours were right) and to a screenshot (a button that scrolls nowhere
 * photographs exactly like one that works).
 *
 * Discovery, not enumeration: it reads whatever `dist` contains and resolves
 * whatever hrefs it finds. There is no allowlist to go stale, and adding a page
 * or a link needs no edit here.
 *
 * What it deliberately does NOT check: absolute URLs to other origins. This
 * process cannot reach the network, and a guard that pretends to have verified
 * a remote URL is worse than one that says it did not. They are counted and
 * listed so the number is visible rather than merely absent, and they are
 * required to be https — a http:// link is a downgrade the CSP would block
 * anyway, and that much is checkable offline.
 *
 * Run: npm run www:check  (or node scripts/www-link-contract.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const DIST = path.join(root, 'sites/www/dist');

/** Schemes that are links to somewhere this build has no opinion about. */
const NON_HTTP_SCHEME = /^(mailto|tel|sms|data|blob|javascript):/i;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/**
 * `astro.config.mjs` sets `trailingSlash: 'never'`, so `foo/index.html` is
 * served at `/foo` and `index.html` at `/`. Both spellings are accepted as
 * targets because a hand-written href may use either.
 */
function routesFor(relHtml) {
  const posix = relHtml.split(path.sep).join('/');
  if (posix === 'index.html') return ['/', '/index.html'];
  const withoutIndex = posix.replace(/\/index\.html$/, '');
  if (withoutIndex !== posix) return [`/${withoutIndex}`, `/${withoutIndex}/`, `/${posix}`];
  return [`/${posix.replace(/\.html$/, '')}`, `/${posix}`];
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error(
      '\n✗ sites/www/dist not found.\n' +
        '  Run `npm --prefix sites/www run build` first. Refusing to report that\n' +
        '  every link resolves when there are no links to resolve.\n',
    );
    throw new Error('www-link-contract: no dist');
  }

  const files = walk(DIST);
  const htmlFiles = files.filter((f) => f.endsWith('.html'));
  if (htmlFiles.length === 0) {
    throw new Error('www-link-contract: dist contains no HTML');
  }

  // Everything the build emits, in both the route and the on-disk spelling.
  const emitted = new Set();
  for (const f of files) {
    const rel = path.relative(DIST, f);
    emitted.add(`/${rel.split(path.sep).join('/')}`);
  }
  for (const f of htmlFiles) {
    for (const r of routesFor(path.relative(DIST, f))) emitted.add(r);
  }

  const failures = [];
  const external = new Set();
  let checked = 0;
  let skipped = 0;

  // Ids per document, so a cross-page `/foo#bar` is resolved against foo's ids
  // rather than the ids of whichever page happened to contain the link.
  const idsByRoute = new Map();
  for (const f of htmlFiles) {
    const html = fs.readFileSync(f, 'utf8');
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    // `<a name="…">` is still a valid fragment target in HTML.
    for (const m of html.matchAll(/<a[^>]+\sname="([^"]+)"/g)) ids.add(m[1]);
    for (const r of routesFor(path.relative(DIST, f))) idsByRoute.set(r, ids);
  }

  for (const f of htmlFiles) {
    const rel = path.relative(DIST, f).split(path.sep).join('/');
    const selfRoutes = routesFor(path.relative(DIST, f));
    const html = fs.readFileSync(f, 'utf8');

    for (const m of html.matchAll(/\shref="([^"]*)"/g)) {
      const raw = m[1].trim();

      if (raw === '' || NON_HTTP_SCHEME.test(raw)) {
        skipped += 1;
        continue;
      }

      if (/^https?:\/\//i.test(raw) || raw.startsWith('//')) {
        external.add(raw);
        if (raw.toLowerCase().startsWith('http://')) {
          failures.push({ file: rel, href: raw, why: 'http:// — must be https' });
        }
        continue;
      }

      checked += 1;
      const [rawPath, frag] = raw.split('#');
      const targetRoute = rawPath === '' ? selfRoutes[0] : rawPath;

      if (rawPath !== '' && !emitted.has(rawPath)) {
        failures.push({ file: rel, href: raw, why: `no route or file at ${rawPath}` });
        continue;
      }

      if (frag) {
        const ids = idsByRoute.get(targetRoute);
        if (!ids) {
          failures.push({ file: rel, href: raw, why: `${targetRoute} is not an HTML document` });
        } else if (!ids.has(frag)) {
          failures.push({ file: rel, href: raw, why: `no id="${frag}" in ${targetRoute}` });
        }
      }
    }
  }

  // A run that resolved nothing proves nothing. This is the shape .220 named.
  if (checked === 0) {
    throw new Error(
      'www-link-contract: zero internal links found across ' +
        `${htmlFiles.length} document(s) — the extractor is broken, not the site`,
    );
  }

  console.log('\nwww link contract\n');
  console.log(
    `  ${htmlFiles.length} document(s) · ${checked} internal link(s) checked · ` +
      `${external.size} external (not fetched) · ${skipped} non-http skipped`,
  );
  if (external.size) {
    for (const url of [...external].sort()) console.log(`    → ${url}`);
  }

  if (failures.length) {
    console.error(`\n✗ ${failures.length} link(s) resolve to nothing:\n`);
    for (const f of failures) console.error(`  ${f.file}  ${f.href}\n      ${f.why}`);
    console.error('');
    process.exitCode = 1;
    return;
  }

  console.log('\n✓ every internal link resolves.\n');
}

main();
