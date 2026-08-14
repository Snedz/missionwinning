#!/usr/bin/env node
/**
 * Renders the design-variant comparison board.
 *
 * Eight art directions for the marketing homepage, plus an index that shows
 * them together. Each output is a single self-contained HTML file — no network,
 * no build step, opens from disk in a year — which is the same property
 * `docs/design/www-spec-sheet.html` has and for the reason `docs/design/INDEX.md`
 * records: this repo has already paid for design artifacts that stopped being
 * re-readable.
 *
 * The load-bearing property is **copy identity**. All eight render the same DOM
 * from `sites/www/src/lib/homeContent.ts` — the module the real page reads — and
 * this script asserts their visible text is byte-identical before it writes
 * anything. A board where one variant quietly says something different is not a
 * comparison of designs, it is a comparison of two pages, and the difference is
 * invisible at thumbnail size. That assertion is the whole reason this is a
 * generator rather than eight hand-authored files.
 *
 * Why `docs/design/variants/` and not `sites/www`: seven of the eight are
 * ILLEGAL inside the app surface by construction — `off-palette-colour` in
 * check-design-system.mjs is repo-wide and unscoped, and three more bans
 * (gradient, emoji-as-icon, centred-section-root) are scoped to `sites/www`.
 * Exploring alternatives there would mean allowlisting the core palette rule,
 * which is how a ban list dies. `docs/` is outside every guard's roots —
 * verified against all twelve — so exploration costs nothing and the rules stay
 * enforced where they matter.
 *
 * Run: npx tsx scripts/build-design-variants.mts
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  META, HERO, STATS, STATEMENTS, ADAPT, ANYWHERE, FREE_CORE, COMPARE, QUESTIONS, NAV_LINKS, CTA,
  ADAPT_WEEK,
} from '../sites/www/src/lib/homeContent';
import { THEMES } from './design-variants/themes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, '.cache/design-variants');
const OUT = path.join(ROOT, 'docs/design/variants');

/*
 * Published artifact URLs, so the board's click-throughs work for anyone it is
 * shared with rather than only for someone with the repo checked out. Committed
 * rather than passed in, because a link map that lives in a shell history is a
 * link map that goes stale silently — the same reason the ban list and the
 * budgets are inline consts.
 *
 * Re-publishing a variant keeps its URL (same file path), so these are stable.
 * A variant with no entry falls back to its relative filename, which is correct
 * when the board is opened from disk.
 */
const PUBLISHED: Record<string, string> = {
  'a1-modernist': 'https://claude.ai/code/artifact/139c30b2-c91d-452b-87a6-e4f6c5d97e5f',
  'b1-sport': 'https://claude.ai/code/artifact/9fb03134-c054-48d7-a0ba-0f202093649e',
  'b2-archivo-ground': 'https://claude.ai/code/artifact/a1668b45-eba3-41a5-a288-b03299f956e4',
  'b3-free': 'https://claude.ai/code/artifact/bba23ced-77d4-40c5-aae2-b714d65a28ae',
  'c1-dossier': 'https://claude.ai/code/artifact/c674506e-d8ef-4718-959b-ffb7a1c59524',
  'c2-instrument': 'https://claude.ai/code/artifact/dc5f9246-6e16-4b7f-9fcf-1b05efe31d73',
  'c3-cinematic': 'https://claude.ai/code/artifact/228dd7f1-2744-4573-ac32-1ec26037d6fe',
  'c4-zine': 'https://claude.ai/code/artifact/a6e4f85a-c34c-4ddf-b182-b95197a8f1e7',
};

/* The wght+wdth Archivo. The repo's own woff2 carries the weight axis only, so
   condensed and expanded cuts would be synthesised — which is a different
   typeface, badly drawn. This copy is the only source of the width axis. */
const FONT = fs.readFileSync(path.join(__dirname, 'design-variants/archivo-var.b64.txt'), 'utf8').trim();

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function dataUri(file: string): string {
  const ext = path.extname(file).slice(1);
  const mime = ext === 'png' ? 'image/png' : 'image/webp';
  return `data:${mime};base64,${fs.readFileSync(path.join(ASSETS, file)).toString('base64')}`;
}

/* ── The shared stylesheet ────────────────────────────────────────────────
   Structure only. Every colour, weight, width and rule thickness is a custom
   property a theme sets; nothing here decides how anything looks. If a value
   in this block would change between two directions, it belongs in a theme. */
const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--ground); color:var(--on-ground);
  font-family:'ArchivoVar',system-ui,sans-serif; font-weight:400;
  font-size:17px; line-height:1.55; text-wrap:pretty;
  -webkit-font-smoothing:antialiased;
}
img{display:block;max-width:100%}
a{color:inherit}
.wrap{max-width:1120px;margin:0 auto;padding-inline:clamp(1.25rem,4vw,2rem)}
.s{padding-block:var(--section-pad,7rem);border-top:var(--rule-w) solid var(--rule)}
.s:first-child{border-top:0}

/* Type tiers. Size and weight come from the theme; the shared part is only the
   relationship between them. */
.h1{
  margin:0; font-weight:var(--display-weight,800);
  font-stretch:calc(var(--display-w,100) * 1%);
  letter-spacing:var(--display-track,-.03em);
  line-height:var(--display-lh,.98);
  text-transform:var(--display-transform,none);
  font-size:calc(clamp(2.6rem,6.6vw,5.8rem) * var(--display-scale,1));
  max-width:16ch;
}
.h1 span{display:block}
.h2{
  margin:0; font-weight:var(--display-weight,800);
  font-stretch:calc(var(--display-w,100) * 1%);
  letter-spacing:var(--display-track,-.02em);
  line-height:1.08; text-transform:var(--display-transform,none);
  font-size:calc(clamp(1.9rem,4.2vw,3rem) * var(--display-scale,1));
  max-width:24ch;
}
.statement p{
  margin:0; font-weight:var(--display-weight,800);
  font-stretch:calc(var(--display-w,100) * 1%);
  letter-spacing:var(--display-track,-.03em);
  line-height:var(--display-lh,.94);
  text-transform:var(--display-transform,none);
  font-size:calc(clamp(2.5rem,6.4vw,5.4rem) * var(--display-scale,1));
  max-width:18ch;
}
.eyebrow{
  margin:0; font-size:13px; font-weight:600;
  letter-spacing:var(--eyebrow-track,.08em);
  text-transform:var(--eyebrow-transform,uppercase);
  color:var(--quiet);
}
.lede{margin:1.5rem 0 0;font-size:19px;line-height:1.5;max-width:54ch;color:var(--quiet)}
.body{margin:1.5rem 0 0;font-size:17px;line-height:1.6;max-width:62ch;color:var(--quiet)}

/* Photographic grounds. */
.stage{position:relative;isolation:isolate;overflow:hidden}
.stage>.ph{position:absolute;inset:0;z-index:-1}
.stage>.ph img{width:100%;height:100%;object-fit:cover;filter:var(--photo-filter)}
/* A SOLID veil, never a gradient. Type on a photograph is the legibility
   failure that shipped twice on the real page — a black CTA border on a dark
   frame, and an eyebrow in muted ink on red. A hard-edged flat overlay is the
   modernist answer and it is also the one this repo's ban list permits. */
.stage>.ph::after,.panel>.ph::after{content:"";position:absolute;inset:0;background:var(--veil,transparent)}
.on-field{color:var(--on-field)}
.on-field .eyebrow,.on-field .lede,.on-field .body{color:color-mix(in srgb,var(--on-field) 74%,transparent)}

/* Nav */
.nav{position:absolute;inset-inline:0;top:0;z-index:5}
.nav .row{display:flex;align-items:center;gap:1rem;padding-block:1.1rem}
.nav-mark{
  width:2rem;height:2rem;display:grid;place-items:center;
  background:var(--on-field);color:var(--field);
  font-size:13px;font-weight:800;letter-spacing:-.04em;
}
.nav-name{font-size:15px;font-weight:800;letter-spacing:-.01em}
.nav-links{display:none;gap:1.5rem;margin-left:2rem}
.nav-links a{font-size:15px;font-weight:600;text-decoration:none}
@media(min-width:900px){.nav-links{display:flex}}

/* The action */
.cta{
  display:inline-flex;align-items:center;gap:.5rem;min-height:52px;
  padding-inline:1.5rem;background:var(--accent);color:var(--paper);
  font-size:19px;font-weight:800;text-decoration:none;border-radius:var(--radius);
}
.cta-quiet{
  display:inline-flex;align-items:center;min-height:44px;padding-inline:1rem;
  border:var(--rule-w) solid currentColor;font-size:15px;font-weight:600;
  text-decoration:none;border-radius:var(--radius);margin-left:auto
}
.reassure{margin:.75rem 0 0;font-size:13px;font-weight:600;letter-spacing:var(--eyebrow-track,.08em);text-transform:var(--eyebrow-transform,uppercase);color:var(--quiet)}

/* Hero */
.hero{min-height:92vh;display:flex;flex-direction:column;justify-content:flex-end;padding-block:9rem 4rem}
.hero-grid{display:grid;gap:2.5rem}
@media(min-width:1000px){.hero-grid{grid-template-columns:1.05fr .95fr;align-items:end}}

/* Static demo (the live one runs the real engine; here it is a snapshot) */
.demo{background:var(--card);color:var(--on-ground);padding:1.25rem;border:var(--rule-w) solid var(--rule);border-radius:var(--radius)}
.demo-head{display:flex;justify-content:space-between;font-size:13px;font-weight:600;letter-spacing:var(--eyebrow-track,.08em);text-transform:uppercase;color:var(--quiet)}
.demo-row{display:flex;gap:1rem;align-items:center;margin-top:.5rem;padding:.7rem .9rem;border:var(--rule-w) solid var(--rule);font-size:15px;font-weight:700}
.demo-row.is-next{border-color:var(--accent);background:var(--accent-tint)}
.demo-note{margin-top:.75rem;padding:.7rem .9rem;border:var(--rule-w) solid var(--rule);font-size:14px;color:var(--quiet)}
.demo-foot{margin:.9rem 0 0;font-size:13px;letter-spacing:var(--eyebrow-track,.08em);text-transform:uppercase;color:var(--quiet)}

/* Statement */
.statement{min-height:62vh;display:flex;align-items:center;padding-block:12rem}

/* Stats */
.stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--rule-w);background:var(--rule);margin-top:2rem}
@media(min-width:760px){.stats-grid{grid-template-columns:repeat(4,1fr)}}
.stat{background:var(--ground);padding:1.5rem;display:flex;flex-direction:column;gap:.75rem}
.stat-fig{font-size:clamp(2.2rem,5vw,3.6rem);font-weight:var(--display-weight,800);font-stretch:calc(var(--display-w,100) * 1%);line-height:1;letter-spacing:-.02em;color:var(--accent);font-variant-numeric:tabular-nums}
.stat-label{font-size:13px;font-weight:600;letter-spacing:var(--eyebrow-track,.08em);text-transform:uppercase;color:var(--quiet)}

/* Adapt */
.adapt-grid{display:grid;gap:2.5rem}
@media(min-width:1000px){.adapt-grid{grid-template-columns:1fr 1fr;align-items:start}}
.week{display:grid;grid-template-columns:repeat(7,1fr);gap:var(--rule-w);background:var(--rule);border:var(--rule-w) solid var(--rule)}
.day{background:var(--ground);padding:.6rem .4rem;font-size:12px;line-height:1.3}
.day b{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--quiet);font-weight:600}
.day.is-strength{background:var(--accent-tint)}
.day.is-rest{opacity:.55}

/* Anywhere panels */
.panels{display:grid;gap:var(--rule-w);background:var(--rule);margin-top:3rem}
@media(min-width:900px){.panels{grid-template-columns:repeat(3,1fr)}}
.panel{position:relative;min-height:78vh;display:flex;align-items:flex-end;isolation:isolate;overflow:hidden}
.panel>.ph{position:absolute;inset:0;z-index:-1}
.panel>.ph img{width:100%;height:100%;object-fit:cover;filter:var(--photo-filter)}
.panel-cap{width:100%;padding:1.5rem;background:color-mix(in srgb,var(--field) 86%,transparent);color:var(--on-field)}
.panel-cap .kicker{margin:0;font-size:19px;font-weight:800}
.panel-cap p:last-child{margin:.5rem 0 0;font-size:15px;line-height:1.5;max-width:36ch;color:color-mix(in srgb,var(--on-field) 74%,transparent)}

/* Free core — the one contrasting field */
.free{background:var(--field);color:var(--on-field);border-top:0}
.free .eyebrow,.free .body{color:color-mix(in srgb,var(--on-field) 74%,transparent)}
.deflist{margin:2.5rem 0 0;border-block:var(--rule-w) solid color-mix(in srgb,var(--on-field) 34%,transparent)}
.defrow{display:grid;gap:.5rem;padding-block:1.25rem;border-top:var(--rule-w) solid color-mix(in srgb,var(--on-field) 34%,transparent)}
.defrow:first-child{border-top:0}
@media(min-width:700px){.defrow{grid-template-columns:14rem 1fr;gap:2rem}}
.dt{font-size:17px;font-weight:800}
.dd{margin:0;font-size:16px;line-height:1.6;color:color-mix(in srgb,var(--on-field) 74%,transparent)}

/* Compare rail */
.rail{display:flex;gap:var(--rule-w);overflow-x:auto;margin-top:2.5rem;scrollbar-width:none}
.rail::-webkit-scrollbar{display:none}
.card{flex:0 0 78%;background:var(--card);border:var(--rule-w) solid var(--rule);padding:1.25rem;display:flex;flex-direction:column;gap:.75rem;text-decoration:none;border-radius:var(--radius)}
@media(min-width:760px){.card{flex-basis:30%}}
@media(min-width:1200px){.card{flex-basis:19%}}
.card .t{font-size:17px;font-weight:800;line-height:1.2}

/* Questions */
.faq{max-width:56rem;margin-top:2.5rem;border-block:var(--rule-w) solid var(--rule)}
.faq-item{border-top:var(--rule-w) solid var(--rule);padding-block:1rem}
.faq-item:first-child{border-top:0}
.faq-q{margin:0;font-size:17px;font-weight:800;display:flex;justify-content:space-between;gap:1rem}
.faq-q::after{content:"+";font-weight:800}
.faq-a{margin:.75rem 0 0;font-size:16px;line-height:1.6;max-width:62ch;color:var(--quiet)}

/* Close */
.close{background:var(--close);color:var(--on-close);padding-block:12rem}
.close .cta{background:var(--on-close);color:var(--close)}
.close .reassure{color:color-mix(in srgb,var(--on-close) 86%,transparent)}

/* The per-variant note. Excluded from the copy-identity assertion by
   [data-meta] — it is the one block that is SUPPOSED to differ. */
.meta{background:#101013;color:#e9e9ec;font-size:13px;line-height:1.6;padding:2rem 0;font-family:ui-monospace,Menlo,Consolas,monospace}
.meta .wrap{display:grid;gap:.75rem}
.meta b{color:#fff}
.meta a{color:#9fd0ff}
`;

/* ── The shared DOM ───────────────────────────────────────────────────────
   Identical for every theme, which is what makes the comparison honest. */
function page(theme: any): string {
  const ext = theme.photoExt ?? 'webp';
  const img = (base: string, cls = '') => {
    const name = `${base.replace('/photo/', '')}--${theme.photo}.${ext}`;
    return `<div class="ph${cls}"><img src="${dataUri(name)}" alt=""></div>`;
  };

  const week = (days: any[]) =>
    days
      .map(
        (d) =>
          `<div class="day is-${d.kind}"><b>${esc(d.day)}</b>${esc(d.label)}</div>`,
      )
      .join('');

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(theme.name)} — ${esc(META.title)}</title>
<style>
@font-face{font-family:'ArchivoVar';src:url(${FONT}) format('woff2-variations');font-weight:100 900;font-stretch:62% 125%;font-display:swap}
:root{${theme.css}--mono:${theme.mono ?? 'ui-monospace,Menlo,Consolas,monospace'};--photo-filter:${theme.photoFilter}}
${BASE_CSS}
${theme.extraCss ?? ''}
</style>
</head><body>

<main>
  <section class="s hero stage on-field">
    ${img(ANYWHERE.panels[1].base)}
    <div class="nav"><div class="wrap"><div class="row">
      <span class="nav-mark">MW</span><span class="nav-name">Mission Winning</span>
      <span class="nav-links">${NAV_LINKS.map((l) => `<a href="${l.href.replace(/^\//, '')}">${esc(l.label)}</a>`).join('')}</span>
      <a class="cta-quiet" href="#">${esc(CTA.label)}</a>
    </div></div></div>
    <div class="wrap">
      <div class="hero-grid">
        <div>
          <p class="eyebrow" data-n="01">${esc(HERO.eyebrow)}</p>
          <h1 class="h1">${HERO.lines.map((l) => `<span>${esc(l)}</span>`).join('')}</h1>
          <p class="lede">${esc(HERO.body)}</p>
          <p style="margin:2.25rem 0 0"><a class="cta" href="#">${esc(CTA.label)} &rarr;</a></p>
          <p class="reassure">${esc(CTA.reassurance)}</p>
        </div>
        <div class="demo">
          <div class="demo-head"><span>Squat · Today</span><span>0/3</span></div>
          <div class="demo-row is-next"><span>1</span><span>8 × 82.5 kg</span></div>
          <div class="demo-row"><span>2</span><span>8 × 82.5 kg</span></div>
          <div class="demo-row"><span>3</span><span>8 × 82.5 kg</span></div>
          <p class="demo-note">Last squat session you finished 3 × 12 at 80 kg, so today asks for more load.</p>
          <p class="demo-foot">Demo · same engine as the app</p>
        </div>
      </div>
    </div>
  </section>

  <section class="s statement stage on-field">
    ${img(ANYWHERE.panels[2].base)}
    <div class="wrap"><p>${esc(STATEMENTS.missed)}</p></div>
  </section>

  <section class="s">
    <div class="wrap">
      <p class="eyebrow" data-n="02">At a glance</p>
      <div class="stats-grid">
        ${STATS.map((s) => `<div class="stat"><div class="stat-fig">${esc(s.figure)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="s" id="adapt">
    <div class="wrap">
      <div class="adapt-grid">
        <div>
          <p class="eyebrow" data-n="03">${esc(ADAPT.eyebrow)}</p>
          <h2 class="h2" style="margin-top:1rem">${esc(ADAPT.heading)}</h2>
          <p class="body">${esc(ADAPT.body)}</p>
        </div>
        <div class="demo">
          <div class="demo-head"><span>Demo · a week, adapted</span><span>Planned</span></div>
          <div class="week" style="margin-top:.75rem">${week(ADAPT_WEEK.planned as any)}</div>
          <p class="demo-note">${esc(ADAPT_WEEK.note)}</p>
          <p class="demo-foot">${esc(ADAPT_WEEK.action)}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="s" id="anywhere">
    <div class="wrap">
      <p class="eyebrow" data-n="04">${esc(ANYWHERE.eyebrow)}</p>
      <h2 class="h2" style="margin-top:1rem">${esc(ANYWHERE.heading)}</h2>
    </div>
    <div class="panels">
      ${ANYWHERE.panels
        .map(
          (p) => `<figure class="panel" style="margin:0">${img(p.base)}
        <figcaption class="panel-cap"><p class="kicker">${esc(p.title)}</p><p>${esc(p.body)}</p></figcaption></figure>`,
        )
        .join('')}
    </div>
  </section>

  <section class="s free" id="free">
    <div class="wrap">
      <p class="eyebrow" data-n="05">${esc(FREE_CORE.eyebrow)}</p>
      <h2 class="h2" style="margin-top:1rem">${esc(FREE_CORE.heading)}</h2>
      <div class="deflist">
        ${FREE_CORE.rows.map((r) => `<div class="defrow"><div class="dt">${esc(r.term)}</div><p class="dd">${esc(r.def)}</p></div>`).join('')}
      </div>
      <p class="body">${esc(FREE_CORE.footnote)}</p>
      <p style="margin:2.25rem 0 0"><a class="cta-quiet" style="margin-left:0" href="#">${esc(CTA.label)}</a></p>
    </div>
  </section>

  <section class="s" id="compare">
    <div class="wrap">
      <p class="eyebrow" data-n="06">${esc(COMPARE.eyebrow)}</p>
      <h2 class="h2" style="margin-top:1rem">${esc(COMPARE.heading)}</h2>
      <div class="rail">
        ${COMPARE.stories.map((s) => `<a class="card" href="#"><span class="eyebrow">${esc(s.eyebrow)}</span><span class="t">${esc(s.title)}</span></a>`).join('')}
      </div>
    </div>
  </section>

  <section class="s" id="questions">
    <div class="wrap">
      <p class="eyebrow" data-n="07">${esc(QUESTIONS.eyebrow)}</p>
      <h2 class="h2" style="margin-top:1rem">${esc(QUESTIONS.heading)}</h2>
      <div class="faq">
        ${QUESTIONS.items.map((i) => `<div class="faq-item"><p class="faq-q">${esc(i.q)}</p><p class="faq-a">${esc(i.a)}</p></div>`).join('')}
      </div>
    </div>
  </section>
</main>

<footer class="close">
  <div class="wrap">
    <div class="statement" style="min-height:0;padding-block:0"><p>${esc(STATEMENTS.close)}</p></div>
    <p style="margin:2.5rem 0 0"><a class="cta" href="#">${esc(CTA.label)} &rarr;</a></p>
    <p class="reassure">${esc(CTA.reassurance)}</p>
  </div>
</footer>

<div class="meta" data-meta>
  <div class="wrap">
    <div><b>${esc(theme.name)}</b> — ${esc(theme.family)}${theme.leash ? ` · <em>${esc(theme.leash)}</em>` : ''}</div>
    <div><b>Argues:</b> ${esc(theme.argues)}</div>
    <div><b>Type:</b> ${esc(theme.fonts)}</div>
    <div><b>Photography:</b> ${esc(theme.photo)} treatment, from the three documentary frames that exist. All eight variants use the same three.</div>
    <div><b>Cost to adopt:</b> ${esc(theme.cost)}</div>
    <div><a href="index.html">&larr; back to the board</a></div>
  </div>
</div>

</body></html>`;
}

/* ── The board ────────────────────────────────────────────────────────────── */
function board(): string {
  const byFamily = new Map<string, any[]>();
  for (const t of THEMES) {
    if (!byFamily.has(t.family)) byFamily.set(t.family, []);
    byFamily.get(t.family)!.push(t);
  }

  const swatches = (css: string) => {
    const grab = (n: string) => (css.match(new RegExp(`--${n}:\\s*([^;]+);`)) ?? [, ''])[1].trim();
    return ['paper', 'ink', 'accent', 'accent-deep']
      .map((n) => `<i style="background:${grab(n)}"></i>`)
      .join('');
  };

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Design directions — Mission Winning marketing surface</title>
<style>
@font-face{font-family:'ArchivoVar';src:url(${FONT}) format('woff2-variations');font-weight:100 900;font-stretch:62% 125%;font-display:swap}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:#f3f2f2;color:#201e1d;font-family:'ArchivoVar',system-ui,sans-serif;font-size:16px;line-height:1.6}
.wrap{max-width:1120px;margin:0 auto;padding:0 1.5rem}
header{padding:5rem 0 3rem;border-bottom:2px solid #d6d3d0}
h1{margin:0;font-size:clamp(2.2rem,5vw,3.6rem);font-weight:800;letter-spacing:-.03em;line-height:1.02;max-width:20ch}
.sub{margin:1.5rem 0 0;max-width:62ch;color:#6b6764;font-size:18px}
h2{margin:4rem 0 0;font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b6764}
.grid{display:grid;gap:2px;background:#d6d3d0;margin-top:1.5rem;border:2px solid #d6d3d0}
@media(min-width:820px){.grid{grid-template-columns:repeat(2,1fr)}}
.cell{background:#f3f2f2;padding:1.5rem;display:flex;flex-direction:column;gap:.9rem;text-decoration:none;color:inherit}
.cell:hover{background:#eae8e6}
.cell .n{font-size:20px;font-weight:800;letter-spacing:-.01em}
.cell .leash{font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#ae1800}
.cell p{margin:0;font-size:15px;line-height:1.55;color:#6b6764}
.sw{display:flex;gap:0}
.sw i{width:2.2rem;height:2.2rem;border:1px solid rgba(0,0,0,.12)}
.cost{font-size:13px;color:#6b6764;border-top:2px solid #d6d3d0;padding-top:.75rem;margin-top:auto}
.note{margin:4rem 0 6rem;padding:1.5rem;border:2px solid #d6d3d0;background:#eae8e6;font-size:15px;max-width:70ch}
.note b{display:block;margin-bottom:.5rem}
</style>
</head><body>
<div class="wrap">
<header>
  <h1>Eight directions for the marketing surface</h1>
  <p class="sub">Every one renders the same DOM and the same copy from <code>sites/www/src/lib/homeContent.ts</code>, and the generator asserts their visible text is identical before writing. The only variable is art direction — so what you are comparing is the design, not the page.</p>
  <p class="sub">All eight use the same three photographs, because those are the only three that exist. The treatment differs; the frames do not.</p>\n  <p class="sub">Each card opens its published page. The same files sit next to this one in <code>docs/design/variants/</code> if you have the repo.</p>
</header>

${[...byFamily.entries()]
  .map(
    ([family, list]) => `<h2>${esc(family)}</h2>
<div class="grid">
${list
  .map(
    (t) => `  <a class="cell" href="${PUBLISHED[t.id] ?? `${t.id}.html`}">
    <span class="sw">${swatches(t.css)}</span>
    <span class="n">${esc(t.name)}</span>
    ${t.leash ? `<span class="leash">${esc(t.leash)}</span>` : ''}
    <p>${esc(t.argues)}</p>
    <span class="cost"><b>Type:</b> ${esc(t.fonts)}<br><b>Cost:</b> ${esc(t.cost)}</span>
  </a>`,
  )
  .join('\n')}
</div>`,
  )
  .join('\n')}

<div class="note">
  <b>What is not on the board</b>
  These are art directions, not finished pages. Motion, the two live demos and the real engine are stubbed to static snapshots so nothing distracts from the look. Type is Archivo throughout — this environment cannot fetch a font, and substituting a system stack for a display face would have made this a comparison of font fallbacks. C1 and C2 use system monospace as deliberate texture and say so.
</div>
</div>
</body></html>`;
}

/* ── Assertions ───────────────────────────────────────────────────────────── */

/** Every asset must be inline. A design artifact that needs a network is one
    that stops opening — the reason www-spec-sheet.html is built this way. */
function assertSelfContained(html: string, label: string, allowLinks = false) {
  const refs = [
    ...html.matchAll(/\b(?:src|href)="([^"]+)"/g),
    ...html.matchAll(/url\(([^)]+)\)/g),
  ]
    .map((m) => m[1].replace(/^['"]|['"]$/g, ''))
    .filter((u) => !u.startsWith('data:') && !/^[a-z0-9-]+\.html$/i.test(u));

  // `allowLinks` is for the board only: it is an index OF published pages, so
  // its hrefs are the point. Assets are still required to be inline — the rule
  // that matters is "this file renders with no network", not "no URL appears".
  const external = refs
    .filter((u) => !u.startsWith('#'))
    .filter((u) => !(allowLinks && /^https:\/\//.test(u)));
  if (external.length) {
    throw new Error(`${label}: ${external.length} external reference(s): ${external.slice(0, 4).join(', ')}`);
  }

  // Same lesson as www-link-contract: an anchor pointing at nothing is a dead
  // control, and it photographs exactly like a working one.
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const dead = refs.filter((u) => u.startsWith('#') && u.length > 1 && !ids.has(u.slice(1)));
  if (dead.length) {
    throw new Error(`${label}: dead fragment(s) ${dead.join(', ')}`);
  }
}

/** Strip tags and the deliberately-varying meta strip, and compare. */
function visibleText(html: string): string {
  return html
    .replace(/<div class="meta"[\s\S]*?<\/div>\s*<\/body>/, '</body>')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<title[\s\S]*?<\/title>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  // Make the intermediates rather than demanding them. A build step someone has
  // to remember is a build step that gets skipped, and the frames are
  // deterministic from three committed photographs.
  if (!fs.existsSync(ASSETS) || !fs.readdirSync(ASSETS).length) {
    console.log('  treating photography…');
    execFileSync('node', [path.join(__dirname, 'design-variants/prepare-assets.mjs')], { stdio: 'inherit' });
  }

  const texts = new Map<string, string>();
  for (const theme of THEMES) {
    const html = page(theme);
    assertSelfContained(html, theme.id);
    texts.set(theme.id, visibleText(html));
    const file = path.join(OUT, `${theme.id}.html`);
    fs.writeFileSync(file, html);
    console.log(`  ${theme.id.padEnd(20)} ${(fs.statSync(file).size / 1024).toFixed(0).padStart(4)} KB`);
  }

  const boardHtml = board();
  assertSelfContained(boardHtml, 'index', true);
  fs.writeFileSync(path.join(OUT, 'index.html'), boardHtml);

  // The property the whole board rests on.
  const [first, ...rest] = [...texts.entries()];
  const drifted = rest.filter(([, t]) => t !== first[1]).map(([id]) => id);
  if (drifted.length) {
    throw new Error(
      `build-design-variants: copy drift in ${drifted.join(', ')} — the board compares designs ` +
        'only if every variant says exactly the same thing, and a difference is invisible at ' +
        'thumbnail size',
    );
  }

  console.log(
    `\n✓ ${THEMES.length} variants + board · copy identical across all ` +
      `(${first[1].split(' ').length} words) · every asset inline\n`,
  );
}

main();
