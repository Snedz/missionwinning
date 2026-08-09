#!/usr/bin/env node
/**
 * How much of this page is a photograph, measured the way the references were.
 *
 * This guard exists because of a specific failure: `sites/www` shipped matching
 * the reference type scale (Wave 10 §10.2) and the reference vertical rhythm
 * (§10.4), with five guards green, and rendered as **a wireframe**. Nothing had
 * ever measured the axis that actually separates the two. Wave 11 measured it:
 * references run 76–81% image area page-wide and put a photograph under 81–100%
 * of the first 900pt; the page ran ~4% and ~0%.
 *
 * A number in a research doc is a claim. This makes it a check, using the same
 * method §11.2 used on the captures — the UNION of image rectangles on a grid,
 * never the sum. Three of the ten captures sum past 100% (CoD home reaches
 * 176.5%) because carousel layers stack, and a guard that counts a stack twice
 * congratulates a page for one photograph shown three times.
 *
 * Floors, not targets. Every value is set BELOW the measured reference band and
 * was written into DESIGN_RESEARCH §11.5 before this page was built, so it fails
 * on regression rather than dictating art direction. That is the same reasoning
 * that kept §10.4's cluster spacing out of www-rhythm.mjs.
 *
 * What it cannot see, stated rather than assumed:
 *
 *   - It counts raster boxes at one viewport. It has no opinion on whether a
 *     photograph is any good, and a page could satisfy every floor here with
 *     twelve bad images. It closes the axis that was missing, not the one that
 *     matters most.
 *   - CSS backgrounds are deliberately NOT counted. Only real <img> content
 *     counts, because a page can reach any coverage number with a solid-colour
 *     background image, and §11.2 excluded the same thing on the reference side
 *     (gradients and SVG are drawing operators, not image XObjects — which is
 *     why every reference percentage is itself a lower bound).
 *
 * Usage: node scripts/www-composition.mjs [url]
 */
import { emittedRoutes, openPreview, URL_ARG } from './lib/wwwPreview.mjs';

/*
 * DESIGN_RESEARCH.md §11.5. Each cites the band it sits below.
 * Ratchet UP only — the same discipline bundle-budget.mjs applies downward.
 */
const FLOORS = {
  /** Reference band 81–100% across six captures. */
  foldImagePct: 60,
  /** Reference homepage median 52.8%. */
  pageImagePct: 35,
  /** References carry 1–7 per page, each 480–1135pt tall. */
  fullBleed: 1,
  /** 40–100% of reference text spans fall inside an image box. */
  textOverImage: 1,
};

/** Union resolution. 8px is ~0.3% of the 1440 width — finer than the floors. */
const CELL = 8;

async function measure(route) {
  const { page, errors, done } = await openPreview({ label: 'www-composition', route });

  // Lazy images below the fold never decode during a scripted visit, and an
  // undecoded image still has layout — but scrolling first also settles any
  // scroll-driven transform, so the boxes measured are the ones a reader sees.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });

  const measured = await page.evaluate((cell) => {
    const vw = window.innerWidth;
    const pageH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    const visible = (el) =>
      typeof el.checkVisibility !== 'function' ||
      el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true });

    const boxes = [];
    for (const img of document.querySelectorAll('img')) {
      if (!visible(img)) continue;
      const r = img.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      boxes.push({
        left: r.left,
        top: r.top + window.scrollY,
        width: r.width,
        height: r.height,
      });
    }

    // Union on a grid. Sum would double-count stacked layers — §11.2.
    const cols = Math.ceil(vw / cell);
    const rows = Math.ceil(pageH / cell);
    const grid = new Uint8Array(cols * rows);
    for (const b of boxes) {
      const c0 = Math.max(0, Math.floor(b.left / cell));
      const c1 = Math.min(cols, Math.ceil((b.left + b.width) / cell));
      const r0 = Math.max(0, Math.floor(b.top / cell));
      const r1 = Math.min(rows, Math.ceil((b.top + b.height) / cell));
      for (let r = r0; r < r1; r += 1) {
        for (let c = c0; c < c1; c += 1) grid[r * cols + c] = 1;
      }
    }

    const foldRows = Math.ceil(window.innerHeight / cell);
    let filled = 0;
    let foldFilled = 0;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (!grid[r * cols + c]) continue;
        filled += 1;
        if (r < foldRows) foldFilled += 1;
      }
    }

    const fullBleed = boxes
      .filter((b) => b.width >= vw * 0.9)
      .map((b) => Math.round(b.height))
      .sort((a, z) => z - a);

    // Text sitting ON a photograph, not beside one. Leaf text blocks only, the
    // same definition www-rhythm.mjs uses, so the two guards cannot disagree
    // about what a text block is.
    const isTextLeaf = (el) => {
      if (!el.textContent || !el.textContent.trim()) return false;
      for (const child of el.children) if (child.textContent && child.textContent.trim()) return false;
      return visible(el);
    };
    let textOverImage = 0;
    for (const el of document.querySelectorAll('main *, footer *')) {
      if (!isTextLeaf(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const t = { left: r.left, top: r.top + window.scrollY, right: r.right, bottom: r.bottom + window.scrollY };
      const inside = boxes.some(
        (b) =>
          t.left >= b.left - 1 &&
          t.right <= b.left + b.width + 1 &&
          t.top >= b.top - 1 &&
          t.bottom <= b.top + b.height + 1,
      );
      if (inside) textOverImage += 1;
    }

    return {
      vw,
      pageH: Math.round(pageH),
      foldH: window.innerHeight,
      images: boxes.length,
      pageImagePct: (filled / (cols * rows)) * 100,
      foldImagePct: (foldFilled / (cols * foldRows)) * 100,
      fullBleed,
      textOverImage,
    };
  }, CELL);

  await done();
  return { route, measured, errors };
}

function rowsFor(measured) {
  return [
    {
      name: 'image area, first fold',
      got: `${measured.foldImagePct.toFixed(1)}%`,
      floor: `${FLOORS.foldImagePct}%`,
      ok: measured.foldImagePct >= FLOORS.foldImagePct,
      band: 'refs 81–100%',
    },
    {
      name: 'image area, whole page',
      got: `${measured.pageImagePct.toFixed(1)}%`,
      floor: `${FLOORS.pageImagePct}%`,
      ok: measured.pageImagePct >= FLOORS.pageImagePct,
      band: 'refs median 52.8%',
    },
    {
      name: 'full-bleed images',
      got: String(measured.fullBleed.length),
      floor: String(FLOORS.fullBleed),
      ok: measured.fullBleed.length >= FLOORS.fullBleed,
      band: 'refs 1–7',
    },
    {
      name: 'text blocks over image',
      got: String(measured.textOverImage),
      floor: String(FLOORS.textOverImage),
      ok: measured.textOverImage >= FLOORS.textOverImage,
      band: 'refs 40–100% of spans',
    },
  ];
}

async function main() {
  // Discovered, never listed: a guard hardcoded to `/` stops covering the site
  // the moment a second page lands, which is exactly what `/start` would have
  // done. An explicit url argument measures only that url.
  const routes = URL_ARG ? ['/'] : emittedRoutes();
  if (!routes.length) throw new Error('www-composition: dist emitted no routes');

  let failed = 0;

  for (const route of routes) {
    const { measured, errors } = await measure(route);

    if (errors.length) {
      console.error(`\n✗ ${route} — page errors during measurement:\n  ${errors.join('\n  ')}\n`);
      failed += 1;
      continue;
    }

    const rows = rowsFor(measured);

    console.log(
      `\nwww composition — ${URL_ARG || 'dist'}${route === '/' ? '/' : route} at ${measured.vw}px · ` +
        `page ${measured.pageH}px · ${measured.images} image(s)\n`,
    );
    console.log('Metric                     Measured   Floor    Reference             Status');
    console.log('-'.repeat(78));
    for (const r of rows) {
      console.log(
        `${r.name.padEnd(26)} ${r.got.padEnd(10)} ${r.floor.padEnd(8)} ${r.band.padEnd(21)} ${r.ok ? 'OK' : 'UNDER'}`,
      );
    }
    if (measured.fullBleed.length) {
      console.log(`\n  full-bleed heights: ${measured.fullBleed.join(' · ')}px`);
    }

    const under = rows.filter((r) => !r.ok);
    if (under.length) {
      console.error(`\n✗ ${route}: ${under.length} composition floor(s) not met.`);
      failed += 1;
    }
  }

  if (failed) {
    console.error(
      '\n  DESIGN_RESEARCH §11.5 sets these below the measured reference band, so\n' +
        '  falling under one is a regression, not a stylistic disagreement.\n',
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\n✓ composition floors met on ${routes.length} route(s): ${routes.join(' · ')}\n`);
}

main();
