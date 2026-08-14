/**
 * CONCEPT 3 — FIELD MANUAL
 *
 * A document, not a scroll. The first screen is a contents page: numbered
 * entries you choose between. Nothing is revealed by scrolling; it is revealed
 * by *opening*. You may never reach the bottom, and that is the design.
 *
 * Why this shape. Every previous attempt was a linear marketing scroll, so the
 * reader's only verb was "keep going". A manual gives them a different verb —
 * "look up" — and it makes a claim the copy never has to: this is a serious
 * tool that came with documentation, not a lifestyle brand. It also earns the
 * density the product's own voice asks for ("mission briefing… clinical metrics
 * over gamification slang", brand-guidelines.md § Voice).
 *
 * It is the only concept that needs **no JavaScript**: `<details>` and anchors.
 * That makes it the control in the set — the one that keeps the rule the other
 * two break.
 *
 * It is also the only place the evidence thesis is permitted to appear.
 * brand-guidelines.md is explicit that it may not lead a landing hero, but that
 * "evidence language belongs in About, Learn, founder narrative". Entry 07 is
 * that context: deep in a document, behind a disclosure, cited, and hedged to
 * the exact language EXERCISE_AS_MEDICINE.md permits.
 */
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { fontFaces, photo } from './assets.mjs';

const N = CONTENT_FLOORS.exercisePages;

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type Entry = {
  n: string;
  title: string;
  standfirst: string;
  margin?: string;
  body: string;
  open?: boolean;
};

/*
 * Copy written for THIS shape. It is not the homepage's copy re-cut — a manual
 * addresses a reader who has already decided to look something up, so it can
 * open on definition rather than persuasion.
 */
const ENTRIES: Entry[] = [
  {
    n: '00',
    title: 'What this is',
    standfirst: 'A free workout logger, and a coach that reads the log.',
    margin: 'Free core is a product promise, not an introductory rate.',
    open: true,
    body: `
      <p>You log what you actually did. Once a week, Mission Coach reads the log and writes the next
      seven days from it — load, volume, and which days are which. Nothing else is required: no
      wearable, no gym membership, no account, no app store.</p>
      <p>The logger is free permanently. Not a trial, not a freemium timer. The paid tier deepens
      the other pillars; it never gates the log.</p>
      <table class="spec">
        <tr><th>Runs on</th><td>Any phone with a browser. Installs if you want it to.</td></tr>
        <tr><th>Needs a signal</th><td>No. Sets save on the device; they sync when there is one.</td></tr>
        <tr><th>Needs an account</th><td>No.</td></tr>
        <tr><th>Costs</th><td>Nothing, for the logger and the weekly plan.</td></tr>
      </table>`,
  },
  {
    n: '01',
    title: 'The problem this exists for',
    standfirst: 'Most training advice stops at “be consistent”, which is not a plan.',
    margin: 'The gap is not motivation. It is prescription.',
    body: `
      <p>The evidence for structured exercise is not in dispute. What is missing between that
      evidence and a Tuesday is <em>dose</em> — how much, how often, how heavy, and what to do when
      the week does not go as written.</p>
      <p>Generic programmes assume the week goes as written. They are built for a person who does
      not travel, does not get ill, and does not lose a Wednesday. When that person misses a
      session, the programme has nothing to say, so the athlete improvises or stops.</p>
      <p class="pull">A missed day is not a failed plan. It is an input.</p>`,
  },
  {
    n: '02',
    title: 'How the week is built',
    standfirst: 'From logged sets. Not from a questionnaire, and not from a heart-rate strap.',
    margin: 'Same engine as the app: <code>suggestNextSetTarget</code>.',
    body: `
      <p>Each week the planner reads what you completed — sets, reps, load, and whether you finished
      the range you were given — and writes the next seven days against it. Finish everything at the
      top of the range and the next session asks for more. Miss the range and it holds, or backs
      off.</p>
      <table class="spec">
        <tr><th>Reads</th><td>Completed sets: reps, load, RPE where you gave one.</td></tr>
        <tr><th>Ignores</th><td>Heart rate, sleep scores, step counts, anything from a wearable.</td></tr>
        <tr><th>Writes</th><td>Seven days: session type, exercises, target sets and load.</td></tr>
        <tr><th>Rewrites</th><td>Weekly, and whenever the week breaks.</td></tr>
      </table>
      <p>The planner is deliberately blind to anything social. It cannot see leaderboards, streaks or
      other athletes, and it is prevented from doing so by a test rather than by a convention — a
      week planned from comparison is a week planned from the wrong data.</p>`,
  },
  {
    n: '03',
    title: 'What it needs from you',
    standfirst: 'A phone, and about forty seconds a session.',
    margin: 'Nothing to charge. Nothing to pair.',
    body: `
      <p>Log the set you just did. That is the whole contract. Everything the coach knows, it knows
      because you tapped a number after a set — which means it keeps working in a basement, on a
      plane, and in a country where the app store is a problem.</p>
      <p>There is no onboarding quiz to complete before the product does anything. The first session
      is loggable within about three minutes of arriving, without an account.</p>`,
  },
  {
    n: '04',
    title: 'Where it works',
    standfirst: 'Anywhere you can stand up.',
    margin: 'Equipment is an input, not a prerequisite.',
    body: `
      <p>Tell it what you have — a barbell, two bands, a single kettlebell, nothing at all — and the
      week is built from that. Change the answer when you travel and the week is rebuilt from the
      new one.</p>
      <table class="spec">
        <tr><th>Catalogue</th><td>${N} exercises, bodyweight and minimal-gear first, with form cues.</td></tr>
        <tr><th>Typical minimum</th><td>Floor space and a doorway.</td></tr>
        <tr><th>Offline</th><td>Full logging. The plan is already on the device.</td></tr>
      </table>`,
  },
  {
    n: '05',
    title: 'What is free, and what is not',
    standfirst: 'The logger and the weekly plan are free permanently.',
    margin: 'Stated as a boundary so it can be held to.',
    body: `
      <table class="spec">
        <tr><th>Free, permanently</th><td>Logging — sets, reps, RPE, rest timers, supersets, personal records.</td></tr>
        <tr><th>Free, permanently</th><td>Mission Coach: a week built from your logs, rewritten weekly.</td></tr>
        <tr><th>Free, permanently</th><td>The ${N}-exercise catalogue and its form cues.</td></tr>
        <tr><th>Paid</th><td>Depth in the other pillars — fuel, mobility, mind, tracking, learning.</td></tr>
      </table>
      <p>The paid tier is additive by design. If a future version of this document says otherwise,
      the promise was broken and this line is the evidence.</p>`,
  },
  {
    n: '06',
    title: 'Honest comparison',
    standfirst: 'What the alternatives are actually good at.',
    margin: 'No competitor is a villain here.',
    body: `
      <table class="spec">
        <tr><th>A spreadsheet</th><td>Total control, no cost, and it will never reschedule itself. You are the planner.</td></tr>
        <tr><th>A logging app</th><td>Excellent records and history. Most do not write next week for you.</td></tr>
        <tr><th>A written programme</th><td>Real expertise, fixed in advance. It cannot see that you missed Wednesday.</td></tr>
        <tr><th>A human coach</th><td>Better than this at everything, when you can afford one and reach one.</td></tr>
      </table>
      <p>The narrow claim: an adaptive week, from logged sets alone, on any phone, for nothing.</p>`,
  },
  {
    n: '07',
    title: 'Why this is being built',
    standfirst: 'Context, not a clinical claim.',
    margin: 'Educational tools. Not medical care.',
    body: `
      <p>Structured exercise has substantial evidence behind it, and major guidelines already name it
      as a first-line option for mild depressive symptoms. Yet exercise <em>prescription</em> — dose,
      progression, and what to do when life interrupts — is rarely part of professional training, so
      the advice that reaches people collapses to “just go work out”.</p>
      <p>This product is not treatment and does not claim to be. It is an attempt at the missing
      middle: structured, adaptive training that an ordinary person can actually follow, on a phone
      they already own. Energy, mood and resilience are honest consequences of showing up. They are
      not a diagnosis, and nothing here replaces a clinician, a therapist, or medication.</p>
      <p class="note">Educational tools and a daily supplement — not medical care, and not a
      replacement for human coaches or clinicians.</p>`,
  },
  {
    n: '08',
    title: 'Getting an invite',
    standfirst: 'Currently in private beta.',
    margin: 'One email when it opens. One at launch.',
    body: `
      <p>Access is invite-only while the beta runs. Leaving an address gets you two emails and
      nothing else — one when the beta opens, one at launch.</p>
      <p><a class="action" href="#">Request an invite &rarr;</a></p>`,
  },
];

export function build(): string {
  const contents = ENTRIES.map(
    (e) => `<li><a href="#e${e.n}"><span class="n">${e.n}</span><span class="t">${esc(e.title)}</span><span class="rule"></span></a></li>`,
  ).join('\n');

  const entries = ENTRIES.map(
    (e) => `
<article class="entry" id="e${e.n}">
  <details${e.open ? ' open' : ''}>
    <summary>
      <span class="n">${e.n}</span>
      <span class="head">
        <h2>${esc(e.title)}</h2>
        <p class="sf">${esc(e.standfirst)}</p>
      </span>
      <span class="mark" aria-hidden="true"></span>
    </summary>
    <div class="cols">
      <aside class="margin">${e.margin ?? ''}</aside>
      <div class="prose">${e.body}</div>
    </div>
  </details>
</article>`,
  ).join('\n');

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mission Winning — Field Manual</title>
<style>
${fontFaces(['plex-mono-400', 'plex-mono-500', 'barlow-cond-700', 'barlow-cond-800'])}

:root{
  --paper:#e7e3d8; --ink:#15150f; --quiet:#5f5c4c; --rule:#15150f;
  --accent:#8a2a12; --wash:#dbd6c7;
  --mono:'PlexMono',ui-monospace,Menlo,monospace;
  --cond:'BarlowCond',Impact,sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0;background:var(--paper);color:var(--ink);
  font-family:var(--mono);font-size:14px;line-height:1.62;
}
a{color:inherit}
.sheet{max-width:76rem;margin:0 auto;padding:0 clamp(1.1rem,3vw,2.5rem) 8rem;
  border-inline:1px solid rgba(21,21,15,.18);
  /* Ruled stock — on the SHEET, not the desk. The first render bled the rules
     into the margins outside the page edge, which read as a bug rather than as
     paper. */
  background-image:repeating-linear-gradient(to bottom,transparent 0 27px,rgba(21,21,15,.055) 27px 28px)}

/* ── Masthead ───────────────────────────────────────────────────────── */
.mast{padding:2.2rem 0 1.4rem;border-bottom:3px solid var(--rule)}
.mast-row{display:flex;align-items:flex-end;gap:1.5rem;flex-wrap:wrap}
.wordmark{font-family:var(--cond);font-weight:800;font-size:clamp(2.6rem,8vw,5.6rem);
  line-height:.84;letter-spacing:-.01em;text-transform:uppercase;margin:0}
.mast dl{margin:0 0 .3rem auto;display:grid;grid-template-columns:auto auto;gap:.1rem 1rem;font-size:11px;letter-spacing:.06em;text-transform:uppercase}
.mast dt{color:var(--quiet)}
.mast dd{margin:0;text-align:right}
.strap{margin:.9rem 0 0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--quiet)}

/* ── Contents: the first screen ─────────────────────────────────────── */
.contents{padding:2.6rem 0 3rem;border-bottom:1px solid rgba(21,21,15,.3)}
.contents h2{margin:0 0 1.4rem;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:var(--quiet);font-weight:500}
.contents ol{list-style:none;margin:0;padding:0}
.contents li a{display:flex;align-items:baseline;gap:1rem;padding:.42rem 0;text-decoration:none}
.contents li a:hover .t{color:var(--accent)}
.contents .n{font-size:12px;color:var(--accent);min-width:2.2rem}
.contents .t{font-family:var(--cond);font-weight:700;font-size:clamp(1.15rem,2.6vw,1.75rem);
  text-transform:uppercase;letter-spacing:.005em;white-space:nowrap}
.contents .rule{flex:1;border-bottom:1px dotted rgba(21,21,15,.45);transform:translateY(-.28em)}

/* ── Entries ────────────────────────────────────────────────────────── */
.entry{border-bottom:1px solid rgba(21,21,15,.3)}
summary{display:flex;gap:1rem;align-items:flex-start;padding:1.6rem 0;cursor:pointer;list-style:none}
summary::-webkit-details-marker{display:none}
summary .n{font-size:12px;color:var(--accent);min-width:2.2rem;padding-top:.45rem}
summary .head{flex:1}
summary h2{margin:0;font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(1.5rem,3.6vw,2.5rem);line-height:.98;letter-spacing:.002em}
summary .sf{margin:.4rem 0 0;font-size:13.5px;color:var(--quiet);max-width:52ch}
summary .mark{width:1.1rem;height:1.1rem;position:relative;margin-top:.6rem;flex:none}
summary .mark::before,summary .mark::after{content:"";position:absolute;background:var(--ink)}
summary .mark::before{inset:calc(50% - .5px) 0 auto 0;height:1px}
summary .mark::after{inset:0 calc(50% - .5px) 0 auto;width:1px}
details[open] summary .mark::after{display:none}
.cols{display:grid;gap:1.4rem;padding:0 0 2.2rem}
@media(min-width:900px){.cols{grid-template-columns:14rem 1fr;gap:2.5rem;padding-left:3.2rem}}
.margin{font-size:12px;line-height:1.5;color:var(--quiet);border-top:1px solid rgba(21,21,15,.3);padding-top:.5rem}
.prose{max-width:66ch}
.prose p{margin:0 0 1rem}
.prose em{font-style:normal;border-bottom:1px solid var(--accent)}
.prose code{background:var(--wash);padding:.05em .3em}
.pull{font-family:var(--cond);font-weight:800;text-transform:uppercase;font-size:clamp(1.3rem,3vw,2rem);
  line-height:1.02;margin:1.4rem 0!important;max-width:20ch}
.note{border-left:3px solid var(--accent);padding-left:.9rem;font-size:12.5px;color:var(--quiet)}
table.spec{width:100%;border-collapse:collapse;margin:0 0 1.1rem;font-size:13px}
table.spec th,table.spec td{border-top:1px solid rgba(21,21,15,.3);padding:.5rem .6rem .5rem 0;
  text-align:left;vertical-align:top;font-weight:400}
table.spec th{width:12rem;color:var(--quiet);font-weight:500;white-space:nowrap}
.action{display:inline-block;margin-top:.4rem;background:var(--accent);color:var(--paper);
  padding:.7rem 1.1rem;text-decoration:none;font-weight:500;letter-spacing:.04em}

/* ── Plate: the only photograph in the document ─────────────────────── */
.plate{margin:2.6rem 0 0;border-top:3px solid var(--rule);padding-top:.6rem}
.plate img{width:100%;height:min(38vh,320px);object-fit:cover;filter:grayscale(1) contrast(1.5) brightness(.92)}
.plate figcaption{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--quiet);padding-top:.5rem}

.colophon{padding:2.4rem 0 0;font-size:11.5px;color:var(--quiet);line-height:1.7}
.colophon b{color:var(--ink);font-weight:500}
</style>
</head><body>
<div class="sheet">

  <header class="mast">
    <div class="mast-row">
      <h1 class="wordmark">Mission<br>Winning</h1>
      <dl>
        <dt>Document</dt><dd>Field manual</dd>
        <dt>Edition</dt><dd>One</dd>
        <dt>Status</dt><dd>Private beta</dd>
        <dt>Catalogue</dt><dd>${N} exercises</dd>
      </dl>
    </div>
    <p class="strap">Train anywhere &middot; Win daily</p>
  </header>

  <nav class="contents">
    <h2>Contents</h2>
    <ol>${contents}</ol>
  </nav>

  ${entries}

  <figure class="plate">
    <img src="${photo('home-rack')}" alt="A loaded barbell on a home rack">
    <figcaption>Plate I &middot; Typical installation &mdash; domestic, minimal gear</figcaption>
  </figure>

  <p class="colophon">
    <b>Colophon.</b> Set in IBM Plex Mono and Barlow Condensed.
    This document renders completely without JavaScript; every entry above opens with none.
    Figures are floors, not marketing estimates &mdash; the catalogue is asserted against the real
    exercise data at build time and can only under-report.
    <br><b>Boundary.</b> Educational tools and a daily supplement. Not medical care, and not a
    replacement for human coaches or clinicians.
  </p>

</div>
</body></html>`;
}
