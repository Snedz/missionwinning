/**
 * CONCEPT 2 — ANYWHERE
 *
 * One session, five places. A pinned scroll narrative: the ground changes under
 * you while the plan in the corner does not. The argument is carried by
 * continuity and imagery rather than by copy — you are not told it works
 * anywhere, you watch it not care where you are.
 *
 * This is the direct answer to La Huella, the reference in the set that reads as
 * award-winning. It is also the reason that reference's architecture matters
 * more than its palette: its 9,109pt print capture is almost empty because the
 * page is entirely scroll-driven. Structure, not surface.
 *
 * **Photography is the honest problem.** Five places, three photographs in the
 * whole repo. Rather than reuse three frames five times and hope, the chapters
 * alternate: photographic plates where a frame exists, and typographic plates
 * where one does not. That reads as a deliberate rhythm rather than as a gap —
 * and it is stated in the colophon rather than left to be discovered.
 * docs/design/GROK_IMAGE_PACK.md already specifies the missing frames by name
 * and aspect.
 *
 * JS: required, and it cannot not be. The pin, the ground changes and the
 * chapter state are the design. Without JS the page degrades to five stacked
 * plates with their type — readable, honest, and not the concept.
 *
 * Motion: Lenis for scroll smoothing (vendored, 20 KB, inlined), plus
 * IntersectionObserver for chapter state. Deliberately NOT GSAP + ScrollTrigger:
 * ~70 KB to do what `position: sticky` and an observer already do correctly, in
 * a document that has to carry its own fonts and photographs too.
 */
import { fontFaces, photo } from './assets.mjs';
import { INVITE_URL } from '../../sites/www/src/lib/appLinks.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LENIS = fs.readFileSync(
  path.join(__dirname, '..', '..', '.cache/vendor/package/dist/lenis.min.js'),
  'utf8',
);

type Chapter = {
  time: string;
  place: string;
  line: string;
  note: string;
  photo?: string;
  /** Typographic plates get a ground instead of a frame. */
  ground?: string;
};

const CHAPTERS: Chapter[] = [
  {
    time: '05:12',
    place: 'Garage',
    line: 'Same session.',
    note: 'Concrete, one roller door, a bar that lives under the bench. The week said lower body, so it is lower body.',
    photo: 'home-rack',
  },
  {
    time: '21:40',
    place: 'Hotel floor',
    line: 'No bar.',
    note: 'Fourth night away. The plan did not ask where you are — it asked what you have, and it built the session from that.',
    ground: '#14161a',
  },
  {
    time: '06:15',
    place: 'Stairwell',
    line: 'No signal.',
    note: 'Six floors, twice. Everything logs on the device; the sync can wait until there is something to sync to.',
    photo: 'phone-bench',
  },
  {
    time: '17:20',
    place: 'Park bar',
    line: 'No wearable.',
    note: 'Nothing on the wrist. The plan is written from sets you finished, not from a sensor you remembered to charge.',
    photo: 'bare-wrist',
  },
  {
    time: '07:05',
    place: 'Balcony',
    line: 'Still the same week.',
    note: 'Five places, one plan, and not one of them needed a gym to exist. That is the entire claim.',
    ground: '#101317',
  },
];

const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function build(): string {
  const grounds = CHAPTERS.map((c, i) =>
    c.photo
      ? `<div class="ground" data-g="${i}"${i === 0 ? ' data-on' : ''}><img src="${photo(c.photo)}" alt=""></div>`
      : `<div class="ground is-type" data-g="${i}"${i === 0 ? ' data-on' : ''} style="--fill:${c.ground}">
           <span class="ghost">${esc(c.place)}</span></div>`,
  ).join('\n');

  const chapters = CHAPTERS.map(
    (c, i) => `
  <section class="chapter" data-ch="${i}">
    <div class="ch-inner">
      <p class="stamp"><span class="mono">${c.time}</span> &middot; ${esc(c.place)}</p>
      <h2 class="ch-line">${esc(c.line)}</h2>
      <p class="ch-note">${esc(c.note)}</p>
    </div>
  </section>`,
  ).join('\n');

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mission Winning — anywhere</title>
<style>
${fontFaces(['barlow-cond-700', 'barlow-cond-800', 'plex-mono-400', 'inter-400'])}

:root{
  --ink:#07080a; --paper:#f2efe9; --dim:rgba(242,239,233,.62);
  --sig:#e8452a;
  --cond:'BarlowCond',Impact,sans-serif;
  --mono:'PlexMono',ui-monospace,monospace;
  --ui:'Inter',system-ui,sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ink);color:var(--paper);font-family:var(--ui);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.mono{font-family:var(--mono);font-variant-numeric:tabular-nums}

/* ── The pinned stage ──────────────────────────────────────────────────
   Everything visual lives here and never moves. The chapters below scroll
   past it and only change its state. */
.stage{position:sticky;top:0;height:100svh;overflow:hidden;z-index:0}
.ground{position:absolute;inset:0;opacity:0;transition:opacity 900ms cubic-bezier(.22,1,.36,1)}
.ground[data-on]{opacity:1}
.ground img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.35) brightness(.4);
  transform:scale(1.06);transition:transform 1600ms cubic-bezier(.22,1,.36,1)}
.ground[data-on] img{transform:scale(1)}
/* Typographic plates: a ground and the place name set enormous, cropped by the
   viewport. A deliberate rhythm, not an apology for a missing photograph. */
.ground.is-type{background:var(--fill)}
/* The ghost fills the plate rather than hiding in a corner. The first render
   parked it bottom-right at 5% opacity and the top two thirds of the frame was
   simply empty — next to a photographic plate it read as unfinished rather than
   as a deliberate alternation. */
.ground.is-type .ghost{position:absolute;inset:0;display:grid;place-items:center;
  font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:min(19vw,15rem);line-height:.8;color:rgba(242,239,233,.085);
  letter-spacing:-.02em;text-align:center;padding:0 4vw}
.ground.is-type::after{content:"";position:absolute;inset:0;
  background:repeating-linear-gradient(to bottom,transparent 0 3px,rgba(242,239,233,.022) 3px 4px)}
.veil{position:absolute;inset:0;background:rgba(7,8,10,.34)}

/* Persistent HUD — the plan that does not change */
.hud{position:absolute;right:clamp(1rem,3vw,2.5rem);top:clamp(4.5rem,10vh,7rem);
  width:min(19rem,74vw);border:1px solid rgba(242,239,233,.26);
  background:rgba(7,8,10,.55);backdrop-filter:blur(2px);padding:.9rem 1rem 1rem}
.hud h3{margin:0 0 .7rem;font-family:var(--mono);font-size:10.5px;letter-spacing:.2em;
  text-transform:uppercase;color:var(--dim);font-weight:400}
.hud ol{list-style:none;margin:0;padding:0;font-family:var(--mono);font-size:12px}
.hud li{display:flex;justify-content:space-between;gap:1rem;padding:.28rem 0;
  border-top:1px solid rgba(242,239,233,.13)}
.hud li:first-child{border-top:0}
.hud li[data-now]{color:var(--sig)}
.hud .foot{margin:.7rem 0 0;font-family:var(--mono);font-size:10px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--dim)}

.markbar{position:absolute;left:clamp(1rem,3vw,2.5rem);top:clamp(1.4rem,4vh,2.2rem);
  display:flex;align-items:center;gap:.7rem;font-family:var(--mono);font-size:11px;
  letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}
.markbar i{width:1.5rem;height:1.5rem;background:var(--paper);color:var(--ink);
  display:grid;place-items:center;font-style:normal;font-weight:700;font-size:10px}

/* Chapter progress — five ticks, bottom left */
.ticks{position:absolute;left:clamp(1rem,3vw,2.5rem);bottom:clamp(1.4rem,4vh,2.4rem);
  display:flex;gap:.4rem}
.ticks b{width:2.2rem;height:2px;background:rgba(242,239,233,.28);display:block}
.ticks b[data-on]{background:var(--sig)}

/* ── Chapters: invisible scrollers that drive the stage ────────────────── */
.chapters{position:relative;z-index:1;margin-top:-100svh}
.chapter{min-height:100svh;display:flex;align-items:flex-end;
  padding:0 clamp(1rem,3vw,2.5rem) clamp(4.5rem,12vh,8rem)}
.ch-inner{max-width:42rem}
.stamp{margin:0 0 .8rem;font-family:var(--mono);font-size:11px;letter-spacing:.2em;
  text-transform:uppercase;color:var(--dim)}
.ch-line{margin:0;font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(3.4rem,13vw,11rem);line-height:.82;letter-spacing:-.015em}
.ch-note{margin:1.1rem 0 0;max-width:38ch;font-size:16.5px;line-height:1.55;color:var(--dim)}

/* ── Close ─────────────────────────────────────────────────────────────── */
.close{position:relative;z-index:1;background:var(--paper);color:var(--ink);
  padding:clamp(5rem,16vh,10rem) clamp(1rem,3vw,2.5rem)}
.close .in{max-width:60rem;margin:0 auto}
.close h2{margin:0;font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(2.6rem,8vw,6.5rem);line-height:.86;letter-spacing:-.015em;max-width:14ch}
.close p{margin:1.6rem 0 0;max-width:46ch;font-size:17px;color:#4a4740}
.cta{display:inline-flex;align-items:center;gap:.6rem;margin-top:2.2rem;background:var(--sig);
  color:var(--paper);text-decoration:none;font-family:var(--cond);font-weight:700;
  text-transform:uppercase;letter-spacing:.04em;font-size:22px;padding:.7rem 1.4rem}
.colophon{max-width:60rem;margin:3.5rem auto 0;border-top:1px solid rgba(7,8,10,.22);
  padding-top:1.2rem;font-family:var(--mono);font-size:11px;line-height:1.85;color:#5d594f}
.colophon b{color:var(--ink);font-weight:400}
@media(max-width:760px){ .hud{display:none} }
</style>
</head><body>

<div class="stage">
  ${grounds}
  <div class="veil"></div>

  <div class="markbar"><i>MW</i> Mission Winning</div>

  <aside class="hud">
    <h3>This week &middot; unchanged</h3>
    <ol>
      <li data-now><span>Mon</span><span>Lower</span></li>
      <li><span>Tue</span><span>Mobility</span></li>
      <li><span>Wed</span><span>Upper</span></li>
      <li><span>Thu</span><span>Rest</span></li>
      <li><span>Fri</span><span>Conditioning</span></li>
      <li><span>Sat</span><span>Rest</span></li>
      <li><span>Sun</span><span>Rest</span></li>
    </ol>
    <p class="foot">Written from your log</p>
  </aside>

  <div class="ticks">${CHAPTERS.map((_, i) => `<b data-t="${i}"${i === 0 ? ' data-on' : ''}></b>`).join('')}</div>
</div>

<main class="chapters">
${chapters}
</main>

<section class="close">
  <div class="in">
    <h2>Train anywhere.<br>Win daily.</h2>
    <p>A free workout logger, and a coach that writes next week from what you actually did. No
      wearable, no gym, no account. Invite-only while the beta runs.</p>
    <a class="cta" href="${INVITE_URL}">Request an invite &rarr;</a>

    <p class="colophon">
      <b>On the plates.</b> Three of the five grounds are photographs; two are typographic, because
      three documentary frames exist in this project and five places were needed. The alternation is
      deliberate rather than a placeholder, and the missing frames are specified by name and aspect
      in the photography handoff.<br>
      <b>On the week.</b> The panel is a real plan shape, held identical across all five chapters on
      purpose — that it does not change IS the argument.<br>
      <b>This page requires JavaScript.</b> Without it the five chapters stack and stay readable, but
      the pin and the ground changes are the concept, and they are gone.<br>
      <b>Boundary.</b> Educational tools and a daily supplement. Not medical care.
    </p>
  </div>
</section>

<script>${LENIS}</script>
<script>
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  const grounds = [...document.querySelectorAll('[data-g]')];
  const ticks = [...document.querySelectorAll('[data-t]')];

  // Chapter state by observation, not by scroll maths — an observer cannot drift
  // out of sync with layout the way a hand-computed offset can.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const i = Number(e.target.dataset.ch);
      grounds.forEach((g, gi) => g.toggleAttribute('data-on', gi === i));
      ticks.forEach((t, ti) => t.toggleAttribute('data-on', ti <= i));
    }
  }, { threshold: 0.55 });

  document.querySelectorAll('[data-ch]').forEach((c) => io.observe(c));
})();
</script>
</body></html>`;
}
