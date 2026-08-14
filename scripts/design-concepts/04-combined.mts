/**
 * CONCEPT 4 — COMBINED LANDING
 *
 * One continuous-scroll landing for a first-time visitor. The three `.644`
 * concepts keep their verbs, in this order, restyled into one deepened-
 * modernist system (paper / ink / the three brand reds; Barlow Condensed
 * display, IBM Plex Mono numerals, Inter text). Archivo stays the shipped
 * homepage voice — this file is the landing, not a reskin of `sites/www`.
 *
 *   02  scroll   — pinned cinematic arrival. One session, five places, a
 *                  HUD week that does not change.
 *   01  press    — the instrument. Log a set; the week is already on screen.
 *                  Consequence picker for a broken week.
 *   03  look up  — the manual. Contents + `<details>`. Evidence only in
 *                  entry 07, closed.
 *
 * Ground plan from DESIGN_RESEARCH §11.3: photographic/ink for the pin
 * (the one contrasting field), paper for the instrument and the manual
 * (the dominant ground), red only at the close. Not per-section
 * alternation.
 *
 * Links are real. Primary CTA is INVITE_URL, repeated. Homepage is the
 * second distinct CTA. A bare `#` is how `.640` shipped twice.
 *
 * JS-off: the five chapter texts, the real engine target, every manual
 * entry and every sentence remain. The pin stops swapping grounds and
 * the logger stops taking taps. Declared in the colophon.
 */
import { suggestNextSetTarget, type SetSnapshot } from '@/lib/workout/nextSetTargets';
import { weightUnitLabel, type UnitsPref } from '@/lib/units';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { INVITE_URL, HOME_URL } from '../../sites/www/src/lib/appLinks.ts';
import { fontFaces, photo } from './assets.mjs';

const UNITS: UnitsPref = 'metric';
const UNIT = weightUnitLabel(UNITS);
const LAST: SetSnapshot[] = [
  { reps: 12, weight: 80 },
  { reps: 12, weight: 80 },
  { reps: 12, weight: 80 },
];
const opening = suggestNextSetTarget(LAST, 0, UNITS);
if (!opening) throw new Error('04-combined: engine returned no target for the seed session');
const after = suggestNextSetTarget([{ reps: opening.reps, weight: opening.weight }], 0, UNITS);
if (!after) throw new Error('04-combined: engine returned no follow-up target');
const AFTER_NOTE =
  after.reason === 'add_reps'
    ? 'one more rep, same load'
    : after.reason === 'add_weight'
      ? 'the next load step, reps reset'
      : 'the next target from the last set';

const N = CONTENT_FLOORS.exercisePages;
const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type Day = { d: string; label: string; kind: 'strength' | 'mobility' | 'cond' | 'rest' };
const BASE: Day[] = [
  { d: 'Mon', label: 'Lower', kind: 'strength' },
  { d: 'Tue', label: 'Mobility', kind: 'mobility' },
  { d: 'Wed', label: 'Upper', kind: 'strength' },
  { d: 'Thu', label: 'Rest', kind: 'rest' },
  { d: 'Fri', label: 'Conditioning', kind: 'cond' },
  { d: 'Sat', label: 'Rest', kind: 'rest' },
  { d: 'Sun', label: 'Rest', kind: 'rest' },
];

const CONSEQUENCES = [
  {
    id: 'miss',
    button: 'I missed Wednesday',
    verdict: 'Upper moves to Thursday. Nothing is dropped, and nothing is doubled up.',
    detail:
      'The session you missed is the one that matters, so it keeps its place in the order rather than being deleted to make the calendar tidy. Friday shifts. The week still ends on rest.',
    week: [
      { d: 'Mon', label: 'Lower', kind: 'strength' },
      { d: 'Tue', label: 'Mobility', kind: 'mobility' },
      { d: 'Wed', label: 'Missed', kind: 'rest' },
      { d: 'Thu', label: 'Upper', kind: 'strength' },
      { d: 'Fri', label: 'Rest', kind: 'rest' },
      { d: 'Sat', label: 'Conditioning', kind: 'cond' },
      { d: 'Sun', label: 'Rest', kind: 'rest' },
    ] as Day[],
  },
  {
    id: 'travel',
    button: 'I am travelling all week',
    verdict: 'Same structure. No barbell in it.',
    detail: `The shape of the week does not change when your equipment does — the strength days stay strength days, built from what fits in a hotel room. The catalogue is ${N} exercises, bodyweight and minimal gear first, for exactly this.`,
    week: [
      { d: 'Mon', label: 'Lower · BW', kind: 'strength' },
      { d: 'Tue', label: 'Mobility', kind: 'mobility' },
      { d: 'Wed', label: 'Upper · BW', kind: 'strength' },
      { d: 'Thu', label: 'Rest', kind: 'rest' },
      { d: 'Fri', label: 'Intervals', kind: 'cond' },
      { d: 'Sat', label: 'Rest', kind: 'rest' },
      { d: 'Sun', label: 'Rest', kind: 'rest' },
    ] as Day[],
  },
  {
    id: 'gear',
    button: 'I only have a band',
    verdict: 'The week keeps its shape. Every strength day is a band day.',
    detail:
      'Equipment is an input, not a prerequisite. The catalogue is built bodyweight and minimal-gear first, so a week that assumed a barbell can be rewritten from a single band without dropping a session or inventing a rest day to hide the gap.',
    week: [
      { d: 'Mon', label: 'Lower · band', kind: 'strength' },
      { d: 'Tue', label: 'Mobility', kind: 'mobility' },
      { d: 'Wed', label: 'Upper · band', kind: 'strength' },
      { d: 'Thu', label: 'Rest', kind: 'rest' },
      { d: 'Fri', label: 'Conditioning', kind: 'cond' },
      { d: 'Sat', label: 'Rest', kind: 'rest' },
      { d: 'Sun', label: 'Rest', kind: 'rest' },
    ] as Day[],
  },
];

type Chapter = {
  time: string;
  place: string;
  line: string;
  note: string;
  photo?: string;
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
  },
];

type Entry = {
  n: string;
  title: string;
  standfirst: string;
  margin: string;
  body: string;
  open?: boolean;
};

const ENTRIES: Entry[] = [
  {
    n: '00',
    title: 'What this is',
    standfirst: 'A free workout logger, and a coach that reads the log.',
    margin: 'Free core is a product promise, not an introductory rate.',
    open: true,
    body: `<p>You log what you actually did. Once a week, Mission Coach reads the log and writes the next seven days from it — load, volume, and which days are which. Nothing else is required: no wearable, no gym membership, no account, no app store.</p>
      <p>The logger is free permanently. Not a trial, not a freemium timer. The paid tier deepens the other pillars; it never gates the log.</p>
      <table class="spec"><tr><th>Runs on</th><td>Any phone with a browser. Installs if you want it to.</td></tr>
      <tr><th>Needs a signal</th><td>No. Sets save on the device; they sync when there is one.</td></tr>
      <tr><th>Needs an account</th><td>No.</td></tr>
      <tr><th>Costs</th><td>Nothing, for the logger and the weekly plan.</td></tr></table>`,
  },
  {
    n: '01',
    title: 'The problem this exists for',
    standfirst: 'Most training advice stops at “be consistent”, which is not a plan.',
    margin: 'The gap is not motivation. It is prescription.',
    body: `<p>What is missing between a written programme and a Tuesday is <em>dose</em> — how much, how often, how heavy, and what to do when the week does not go as written.</p>
      <p>Generic programmes assume the week goes as written. They are built for a person who does not travel, does not get ill, and does not lose a Wednesday. When that person misses a session, the programme has nothing to say, so the athlete improvises or stops.</p>
      <p class="pull">A missed day is not a failed plan. It is an input.</p>`,
  },
  {
    n: '02',
    title: 'How the week is built',
    standfirst: 'From logged sets. Not from a questionnaire, and not from a heart-rate strap.',
    margin: 'Same engine as the app: suggestNextSetTarget.',
    body: `<p>Each week the planner reads what you completed — sets, reps, load, and whether you finished the range you were given — and writes the next seven days against it. Finish everything at the top of the range and the next session asks for more. Miss the range and it holds, or backs off.</p>
      <table class="spec"><tr><th>Reads</th><td>Completed sets: reps, load, RPE where you gave one.</td></tr>
      <tr><th>Ignores</th><td>Heart rate, sleep scores, step counts, anything from a wearable.</td></tr>
      <tr><th>Writes</th><td>Seven days: session type, exercises, target sets and load.</td></tr>
      <tr><th>Rewrites</th><td>Weekly, and whenever the week breaks.</td></tr></table>
      <p>The planner is deliberately blind to anything social. It cannot see leaderboards, streaks or other athletes, and it is prevented from doing so by a test rather than by a convention — a week planned from comparison is a week planned from the wrong data.</p>`,
  },
  {
    n: '03',
    title: 'What it needs from you',
    standfirst: 'A phone, and about forty seconds a session.',
    margin: 'Nothing to charge. Nothing to pair.',
    body: `<p>Log the set you just did. That is the whole contract. Everything the coach knows, it knows because you tapped a number after a set — which means it keeps working in a basement, on a plane, and in a country where the app store is a problem.</p>
      <p>There is no onboarding quiz to complete before the product does anything. The first session is loggable within about three minutes of arriving, without an account.</p>`,
  },
  {
    n: '04',
    title: 'Where it works',
    standfirst: 'Anywhere you can stand up.',
    margin: 'Equipment is an input, not a prerequisite.',
    body: `<p>Tell it what you have — a barbell, two bands, a single kettlebell, nothing at all — and the week is built from that. Change the answer when you travel and the week is rebuilt from the new one.</p>
      <table class="spec"><tr><th>Catalogue</th><td>${N} exercises, bodyweight and minimal-gear first, with form cues.</td></tr>
      <tr><th>Typical minimum</th><td>Floor space and a doorway.</td></tr>
      <tr><th>Offline</th><td>Full logging. The plan is already on the device.</td></tr></table>`,
  },
  {
    n: '05',
    title: 'What is free, and what is not',
    standfirst: 'The logger and the weekly plan are free permanently.',
    margin: 'Stated as a boundary so it can be held to.',
    body: `<table class="spec"><tr><th>Free, permanently</th><td>Logging — sets, reps, RPE, rest timers, supersets, personal records.</td></tr>
      <tr><th>Free, permanently</th><td>Mission Coach: a week built from your logs, rewritten weekly.</td></tr>
      <tr><th>Free, permanently</th><td>The ${N}-exercise catalogue and its form cues.</td></tr>
      <tr><th>Paid</th><td>Depth in the other pillars — fuel, mobility, mind, tracking, learning.</td></tr></table>
      <p>The paid tier is additive by design. If a future version of this document says otherwise, the promise was broken and this line is the evidence.</p>`,
  },
  {
    n: '06',
    title: 'Honest comparison',
    standfirst: 'What the alternatives are actually good at.',
    margin: 'No competitor is a villain here.',
    body: `<table class="spec"><tr><th>A spreadsheet</th><td>Total control, no cost, and it will never reschedule itself. You are the planner.</td></tr>
      <tr><th>A logging app</th><td>Excellent records and history. Most do not write next week for you.</td></tr>
      <tr><th>A written programme</th><td>Real expertise, fixed in advance. It cannot see that you missed Wednesday.</td></tr>
      <tr><th>A human coach</th><td>Better than this at everything, when you can afford one and reach one.</td></tr></table>
      <p>The narrow claim: an adaptive week, from logged sets alone, on any phone, for nothing.</p>`,
  },
  {
    n: '07',
    title: 'Why this is being built',
    standfirst: 'Context, not a clinical claim.',
    margin: 'Educational tools. Not medical care.',
    body: `<p>Structured exercise has substantial evidence behind it, and major guidelines already name it as a first-line option for mild depressive symptoms. Yet exercise <em>prescription</em> — dose, progression, and what to do when life interrupts — is rarely part of professional training, so the advice that reaches people collapses to “just go work out”.</p>
      <p>This product is not treatment and does not claim to be. It is an attempt at the missing middle: structured, adaptive training that an ordinary person can actually follow, on a phone they already own. Energy, mood and resilience are honest consequences of showing up. They are not a diagnosis, and nothing here replaces a clinician, a therapist, or medication.</p>
      <p class="note">Educational tools and a daily supplement — not medical care, and not a replacement for human coaches or clinicians.</p>`,
  },
];

const weekHtml = (days: Day[], cls = '') =>
  `<div class="week ${cls}">${days
    .map((d) => `<div class="day k-${d.kind}"><b>${d.d}</b><span>${d.label}</span></div>`)
    .join('')}</div>`;

export function build(): string {
  const grounds = CHAPTERS.map((c, i) =>
    c.photo
      ? `<div class="ground" data-g="${i}"${i === 0 ? ' data-on' : ''}><img src="${photo(c.photo)}" alt=""></div>`
      : `<div class="ground is-type" data-g="${i}"${i === 0 ? ' data-on' : ''}>
           <p class="ghost">${esc(c.place)}</p></div>`,
  ).join('\n');

  const chapters = CHAPTERS.map(
    (c, i) => `
  <article class="chapter" data-ch="${i}" aria-labelledby="ch-${i}">
    <div class="ch-inner">
      <p class="stamp"><span class="mono">${c.time}</span> · ${esc(c.place)}</p>
      <h2 id="ch-${i}" class="ch-line">${esc(c.line)}</h2>
      <p class="ch-note">${esc(c.note)}</p>
    </div>
  </article>`,
  ).join('\n');

  const hudDays = BASE.map(
    (d, i) => `<li${i === 0 ? ' data-now' : ''}><span>${d.d}</span><span>${d.label}</span></li>`,
  ).join('');

  const contents = ENTRIES.map(
    (e) =>
      `<li><a href="#e${e.n}"><span class="n">${e.n}</span><span class="t">${esc(e.title)}</span></a></li>`,
  ).join('\n');

  const entries = ENTRIES.map(
    (e) => `
<article class="entry" id="e${e.n}">
  <details class="faq"${e.open ? ' open' : ''}>
    <summary>
      <span class="n">${e.n}</span>
      <span class="head">
        <h3>${esc(e.title)}</h3>
        <p class="sf">${esc(e.standfirst)}</p>
      </span>
    </summary>
    <div class="cols">
      <aside class="margin">${esc(e.margin)}</aside>
      <div class="prose">${e.body}</div>
    </div>
  </details>
</article>`,
  ).join('\n');

  const picks = CONSEQUENCES.map(
    (c, i) => `
      <label class="pick">
        <input class="sr" type="radio" name="week-break" value="${c.id}"${i === 0 ? ' checked' : ''}>
        ${esc(c.button)}
      </label>`,
  ).join('');

  const broken = CONSEQUENCES.map(
    (c) => `
      <div class="break-week" data-for="${c.id}">
        ${weekHtml(c.week)}
        <div class="verdict">
          <p>${esc(c.verdict)}</p>
          <p>${esc(c.detail)}</p>
        </div>
      </div>`,
  ).join('');

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The week, anywhere — Mission Winning</title>
<style>
${fontFaces(['barlow-cond-700', 'barlow-cond-800', 'plex-mono-400', 'plex-mono-500', 'inter-400', 'inter-600', 'inter-700'])}

:root{
  --paper:#f3f2f2; --ink:#201e1d; --quiet:#5c5856;
  --red:#ae1800; --fill:#dd2b0f; --poster:#ec3013;
  --rule:rgba(32,30,29,.18);
  --cond:'BarlowCond',Impact,sans-serif;
  --mono:'PlexMono',ui-monospace,monospace;
  --ui:'Inter',system-ui,sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:4.75rem}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--ui);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit}
a:focus-visible,button:focus-visible,summary:focus-visible,.pick:focus-within{
  outline:2px solid var(--red);outline-offset:3px}
.mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
.wrap{max-width:72rem;margin:0 auto;padding:0 clamp(1.1rem,3vw,2.5rem)}
.label{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--quiet)}

/* Quiet CTA — ink rule, never a second red. */
.cta-quiet{display:inline-flex;align-items:center;min-height:44px;padding:0 1rem;
  border:2px solid currentColor;text-decoration:none;font-weight:600;font-size:15px}
.cta-fill{display:inline-flex;align-items:center;gap:.6rem;min-height:52px;padding:.7rem 1.4rem;
  background:var(--paper);color:var(--ink);text-decoration:none;font-family:var(--cond);
  font-weight:700;font-size:22px;letter-spacing:.04em;text-transform:uppercase}

/* ── Nav. Two distinct CTAs: homepage (wordmark) and invite, repeated.
   Ink chrome, not a section ground — so paper movements stay readable with JS off. */
.nav{position:fixed;inset:0 0 auto 0;z-index:20;display:flex;align-items:center;gap:1rem;
  min-height:3.25rem;padding:.55rem clamp(1.1rem,3vw,2.5rem);
  background:var(--ink);color:var(--paper);border-bottom:2px solid var(--ink)}
.nav a.wordmark{display:flex;align-items:center;gap:.7rem;text-decoration:none;font-weight:700}
.nav .mark{width:1.5rem;height:1.5rem;background:var(--paper);color:var(--ink);
  display:grid;place-items:center;font-size:10px;font-weight:800}
.nav .home-link{font-size:15px;font-weight:600;text-decoration:none}
.nav .cta-quiet{margin-left:auto;color:var(--paper);border-color:var(--paper)}
@media(max-width:700px){ .nav .home-link{display:none} }

/* ── 02 ANYWHERE. Pinned stage. The one dark/photographic field. */
.pin{position:relative;background:var(--ink);color:var(--paper)}
.stage{position:sticky;top:0;height:100svh;overflow:hidden;z-index:0}
.ground{position:absolute;inset:0;opacity:0;transition:opacity 900ms cubic-bezier(.22,1,.36,1)}
.ground[data-on]{opacity:1}
.ground img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.35) brightness(.4)}
.ground.is-type{background:var(--ink)}
.ghost{position:absolute;inset:0;margin:0;padding:18vh 5vw 0;overflow:hidden;
  font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:min(22vw,12rem);line-height:.8;letter-spacing:-.03em;color:rgba(243,242,242,.1)}
@media(min-width:761px){.ghost{padding-right:min(22rem,34vw)}}
.hud{position:absolute;right:clamp(1rem,3vw,2.5rem);top:clamp(4.5rem,10vh,7rem);
  width:min(19rem,74vw);border:2px solid rgba(243,242,242,.34);
  background:rgba(32,30,29,.86);padding:.9rem 1rem 1rem;z-index:2}
.hud h3{margin:0 0 .7rem;font-family:var(--mono);font-size:10.5px;letter-spacing:.2em;
  text-transform:uppercase;color:rgba(243,242,242,.74);font-weight:400}
.hud ol{list-style:none;margin:0;padding:0;font-family:var(--mono);font-size:12px}
.hud li{display:flex;justify-content:space-between;gap:1rem;padding:.28rem 0;
  border-top:2px solid rgba(243,242,242,.18)}
.hud li:first-child{border-top:0;font-weight:700}
.hud .foot{margin:.7rem 0 0;font-family:var(--mono);font-size:10px;letter-spacing:.12em;
  text-transform:uppercase;color:rgba(243,242,242,.74)}
.ticks{position:absolute;left:clamp(1rem,3vw,2.5rem);bottom:clamp(1.4rem,4vh,2.4rem);
  display:flex;gap:.4rem;z-index:2}
.ticks b{width:2.2rem;height:2px;background:rgba(243,242,242,.28);display:block}
.ticks b[data-on]{background:var(--poster)}
.chapters{position:relative;z-index:1;margin-top:-100svh}
.chapter{min-height:100svh;display:flex;align-items:flex-end;
  padding:0 clamp(1rem,3vw,2.5rem) clamp(4.5rem,12vh,8rem)}
.ch-inner{max-width:42rem}
@media(min-width:761px){.ch-inner{padding-right:min(22rem,34vw)}}
.stamp{margin:0 0 .8rem;font-family:var(--mono);font-size:11px;letter-spacing:.2em;
  text-transform:uppercase;color:rgba(243,242,242,.74)}
.ch-line{margin:0;font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(3.2rem,12vw,9rem);line-height:.82;letter-spacing:-.015em}
.ch-note{margin:1.1rem 0 0;max-width:38ch;font-size:16.5px;line-height:1.55;color:rgba(243,242,242,.74)}
@media(max-width:760px){ .hud{display:none} }
@media(prefers-reduced-motion:reduce){ .ground{transition:none} }

/* ── 01 THE WEEK. Paper. The instrument. */
.instrument{background:var(--paper);color:var(--ink);padding:6.5rem 0 clamp(4rem,10vh,7rem)}
.instrument h2{font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(2.2rem,6vw,4.4rem);line-height:.9;letter-spacing:-.015em;margin:.4rem 0 1.2rem;max-width:16ch}
.rig{border:2px solid var(--ink);background:var(--paper)}
.rig-head{display:flex;justify-content:space-between;gap:1rem;padding:.9rem 1.4rem;border-bottom:2px solid var(--ink)}
.rig-body{display:grid;gap:0}
@media(min-width:960px){.rig-body{grid-template-columns:1.05fr 1fr}}
.bay{padding:1.8rem 1.4rem 2rem}
.bay + .bay{border-top:2px solid var(--ink)}
@media(min-width:960px){.bay + .bay{border-top:0;border-left:2px solid var(--ink)}}
.prompt{font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(2rem,4.6vw,3.2rem);letter-spacing:-.02em;line-height:.95;margin:0 0 1.6rem;max-width:14ch}
.sets{display:grid;gap:2px}
.set{display:grid;grid-template-columns:2rem 1fr auto;align-items:center;gap:1rem;
  border:2px solid var(--rule);padding:.75rem .9rem;font-family:var(--mono);font-size:15px}
.set[data-done="1"]{border-color:var(--red);background:#fff5f2;color:var(--red)}
.set .tick{opacity:0}
.set[data-done="1"] .tick{opacity:1}
.log{margin-top:1rem;width:100%;background:transparent;color:var(--ink);border:2px solid var(--red);
  font-family:var(--ui);font-weight:700;font-size:17px;padding:.95rem 1rem;cursor:pointer;text-align:left;
  display:flex;justify-content:space-between;gap:1rem;min-height:52px}
.log[disabled]{border-color:var(--rule);color:var(--quiet);cursor:default}
.readout{margin-top:1.1rem;border-top:2px solid var(--rule);padding-top:.9rem;
  display:grid;gap:.35rem;font-family:var(--mono);font-size:13px;color:var(--quiet);min-height:4.2rem}
.readout b{color:var(--ink);font-weight:500}
.hint{margin:1.1rem 0 0;font-size:13px;color:var(--quiet)}
.cons{margin-top:4rem}
.cons h3{font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(1.6rem,3.4vw,2.4rem);letter-spacing:-.015em;margin:.5rem 0 .4rem;max-width:24ch}
.picks{display:flex;flex-wrap:wrap;gap:2px;margin:1.4rem 0}
.pick{display:flex;align-items:center;min-height:44px;padding:.7rem 1rem;cursor:pointer;
  border:2px solid var(--rule);background:var(--paper);font-weight:600;font-size:14px}
.pick:has(:checked){border-color:var(--ink);background:#fff5f2}
.week{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;background:var(--rule);border:2px solid var(--ink)}
.week.live{grid-template-columns:1fr}
.week.live .day{flex-direction:row;align-items:baseline;gap:.9rem;min-height:0;padding:.62rem .9rem}
.week.live .day b{min-width:2.4rem}
.day{background:var(--paper);padding:.7rem .5rem;min-height:5.2rem;display:flex;flex-direction:column;gap:.3rem}
.day b{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--quiet);font-weight:400}
.day span{font-size:13px;font-weight:600;line-height:1.25}
.day.k-rest{color:var(--quiet)}
.day.k-strength{box-shadow:inset 3px 0 0 var(--red)}
.verdict{margin:1.2rem 0 0;border-left:2px solid var(--red);padding-left:1rem;max-width:60ch}
.verdict p:first-child{margin:0 0 .4rem;font-size:18px;font-weight:700}
.verdict p:last-child{margin:0;color:var(--quiet);font-size:15px}
.break-week{display:grid}
@supports selector(:has(*)){
  .break-week{display:none}
  .cons:has([value='miss']:checked) .break-week[data-for='miss'],
  .cons:has([value='travel']:checked) .break-week[data-for='travel'],
  .cons:has([value='gear']:checked) .break-week[data-for='gear']{display:grid}
}
.mid-cta{margin-top:3rem}
@media(max-width:700px){
  .week{grid-template-columns:1fr}
  .week .day{flex-direction:row;align-items:baseline;gap:.9rem;min-height:0;padding:.62rem .9rem}
  .week .day b{min-width:2.4rem}
}

/* ── 03 FIELD MANUAL. Still paper. Hub-and-spoke. Zero JS. */
.manual{background:var(--paper);color:var(--ink);padding:0 0 clamp(4rem,10vh,7rem);
  border-top:2px solid var(--ink)}
.manual-head{padding:6.5rem 0 1.6rem;border-bottom:2px solid var(--ink)}
.manual-head h2{font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(2.4rem,7vw,5rem);line-height:.88;letter-spacing:-.015em;margin:.4rem 0 0;max-width:16ch}
.contents{padding:2.2rem 0 2.4rem}
.contents ol{list-style:none;margin:0;padding:0}
.contents li a{display:flex;align-items:baseline;gap:1rem;padding:.5rem 0;
  text-decoration:none;border-bottom:2px solid var(--rule)}
.contents li a:hover .t{color:var(--red)}
.contents .n{font-family:var(--mono);font-size:12px;color:var(--red);min-width:2.2rem}
.contents .t{font-family:var(--cond);font-weight:700;font-size:clamp(1.15rem,2.6vw,1.75rem);
  text-transform:uppercase;letter-spacing:.005em}
.entry{border-bottom:2px solid var(--rule)}
.faq summary{display:flex;gap:1rem;align-items:flex-start;padding:1.6rem 0;cursor:pointer;list-style:none;min-height:44px}
.faq summary::-webkit-details-marker{display:none}
.faq summary .n{font-family:var(--mono);font-size:12px;color:var(--red);min-width:2.2rem;padding-top:.45rem}
.faq summary h3{margin:0;font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(1.4rem,3.2vw,2.2rem);line-height:.98}
.faq summary .sf{margin:.4rem 0 0;font-size:14px;color:var(--quiet);max-width:52ch}
.faq summary::after{content:'+';margin-left:auto;font-weight:800}
.faq[open] summary::after{content:'–'}
.cols{display:grid;gap:1.4rem;padding:0 0 2.2rem}
@media(min-width:900px){.cols{grid-template-columns:14rem 1fr;gap:2.5rem;padding-left:3.2rem}}
.margin{font-size:12px;line-height:1.5;color:var(--quiet);border-top:2px solid var(--rule);padding-top:.5rem}
.prose{max-width:66ch}
.prose p{margin:0 0 1rem}
.prose em{font-style:normal;border-bottom:2px solid var(--red)}
.pull{font-family:var(--cond);font-weight:800;text-transform:uppercase;font-size:clamp(1.3rem,3vw,2rem);
  line-height:1.02;margin:1.4rem 0!important;max-width:20ch}
.note{border-left:2px solid var(--red);padding-left:.9rem;font-size:13px;color:var(--quiet)}
table.spec{width:100%;border-collapse:collapse;margin:0 0 1.1rem;font-size:13px}
table.spec th,table.spec td{border-top:2px solid var(--rule);padding:.5rem .6rem .5rem 0;
  text-align:left;vertical-align:top;font-weight:400}
table.spec th{width:12rem;color:var(--quiet);font-weight:600}

/* ── Close. The one red field. Small text uses --red (#ae1800, 6.5:1). */
.close{background:var(--red);color:var(--paper);padding:6.5rem 0 clamp(4.5rem,14vh,8rem)}
.close .label{color:rgba(243,242,242,.8)}
.close h2{font-family:var(--cond);font-weight:800;text-transform:uppercase;
  font-size:clamp(2.6rem,8vw,6rem);line-height:.86;letter-spacing:-.015em;margin:.5rem 0 1rem;max-width:14ch}
.close .lede{max-width:46ch;margin:0}
.colophon{background:var(--ink);color:rgba(243,242,242,.74);padding:1.6rem 0 2.4rem;
  font-family:var(--mono);font-size:11.5px;line-height:1.8}
.colophon b{color:var(--paper);font-weight:500}
.colophon a{color:var(--paper)}
</style>
</head><body>

<header class="nav">
  <a class="wordmark" href="${HOME_URL}"><span class="mark">MW</span> Mission Winning</a>
  <a class="home-link" href="${HOME_URL}">Homepage</a>
  <a class="cta-quiet" href="${INVITE_URL}">Get an invite</a>
</header>

<main>
<section class="pin" id="anywhere" aria-label="Anywhere">
  <div class="stage">
    ${grounds}
    <aside class="hud">
      <h3>This week · unchanged</h3>
      <ol>${hudDays}</ol>
      <p class="foot">Written from your log</p>
    </aside>
    <div class="ticks">${CHAPTERS.map((_, i) => `<b data-t="${i}"${i === 0 ? ' data-on' : ''}></b>`).join('')}</div>
  </div>
  <div class="chapters">${chapters}</div>
</section>

<section class="instrument" id="week">
  <div class="wrap">
    <p class="label">Mission Coach · from your log</p>
    <h2>Tell it what you did.</h2>
    <div class="rig">
      <div class="rig-head">
        <span class="label">Squat · today</span>
        <span class="label mono" data-progress>0 / 3</span>
      </div>
      <div class="rig-body">
        <div class="bay">
          <p class="prompt">Log a set. The week is already on screen.</p>
          <div class="sets">
            <div class="set" data-set data-done="0"><span class="i">1</span><span data-target>${opening.reps} &times; ${opening.weight} ${UNIT}</span><span class="tick">&check;</span></div>
            <div class="set" data-set data-done="0"><span class="i">2</span><span data-target>${opening.reps} &times; ${opening.weight} ${UNIT}</span><span class="tick">&check;</span></div>
            <div class="set" data-set data-done="0"><span class="i">3</span><span data-target>${opening.reps} &times; ${opening.weight} ${UNIT}</span><span class="tick">&check;</span></div>
          </div>
          <button class="log" type="button" data-log>
            <span>Log set</span><span class="mono">${opening.reps} &times; ${opening.weight} ${UNIT}</span>
          </button>
          <div class="readout" data-readout>
            <div>Last session: 3 &times; 12 at 80 ${UNIT} — every set at the top of the range.</div>
            <div>So today asks for <b>${opening.reps} &times; ${opening.weight} ${UNIT}</b>.</div>
          </div>
          <p class="hint">Three taps. Nothing to install, and no account to make first.</p>
        </div>
        <div class="bay">
          <p class="label" style="margin:0 0 .9rem">This week · written from your log</p>
          ${weekHtml(BASE, 'live')}
          <p class="hint">Finish the session and next week is rewritten from it. Nothing here came from a questionnaire.</p>
        </div>
      </div>
    </div>

    <div class="cons">
      <p class="label">Then the week breaks</p>
      <h3>Every plan survives a good week. Show it a bad one.</h3>
      <p class="hint" style="margin:0 0 0;max-width:56ch">Pick what went wrong. This is the part a written programme cannot do — it was finished before your Wednesday happened. The three responses are authored illustrations; the real planner is a weekly batch.</p>
      <div class="picks" role="radiogroup" aria-label="What went wrong">${picks}</div>
      ${broken}
    </div>

    <p class="mid-cta"><a class="cta-quiet" href="${INVITE_URL}">Get an invite</a></p>
  </div>
</section>

<section class="manual" id="manual">
  <div class="wrap">
    <header class="manual-head">
      <p class="label">Document · Field manual · Edition one</p>
      <h2>Look it up. You may never reach the bottom.</h2>
    </header>
    <nav class="contents" aria-label="Contents">
      <p class="label">Contents</p>
      <ol>${contents}</ol>
    </nav>
    ${entries}
  </div>
</section>
</main>

<footer class="close" id="close">
  <div class="wrap">
    <p class="label">What it costs</p>
    <h2>Nothing, for the part you just used.</h2>
    <p class="lede">The logger and the weekly plan are free permanently — not a trial. No wearable, no gym, no account. Access is invite-only while the beta runs.</p>
    <p style="margin:2.2rem 0 0"><a class="cta-fill" href="${INVITE_URL}">Get an invite <span aria-hidden="true">&rarr;</span></a></p>
  </div>
</footer>

<div class="colophon">
  <div class="wrap">
    <p>
      <a href="${HOME_URL}">Homepage</a>
      · <b>About these numbers.</b> The opening target is computed at build time by the same function the app calls. The three responses to a broken week are authored illustrations: the real planner is a weekly batch, not something that recomputes on a button press.
      <b>On the plates.</b> Three of the five grounds are photographs; two are typographic, because three documentary frames exist in this project and five places were needed. The alternation is deliberate rather than a placeholder.
      <b>JavaScript.</b> The pin swaps grounds and the logger takes taps only with script. Without it the five chapter texts, the real target, the three authored weeks, the manual and every sentence remain — you lose the demonstration, not the argument. The manual needs no JavaScript at all. Without <code>:has()</code>, all three consequence weeks stay visible rather than one being selected.
      <b>Boundary.</b> Educational tools and a daily supplement. Not medical care.
    </p>
  </div>
</div>

<script>
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const grounds = [...document.querySelectorAll('[data-g]')];
  const ticks = [...document.querySelectorAll('[data-t]')];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const i = Number(e.target.getAttribute('data-ch'));
      grounds.forEach((g, gi) => g.toggleAttribute('data-on', gi === i));
      ticks.forEach((t, ti) => t.toggleAttribute('data-on', ti <= i));
    }
  }, { threshold: 0.55 });
  document.querySelectorAll('[data-ch]').forEach((c) => io.observe(c));

  const AFTER = ${JSON.stringify({ reps: after.reps, weight: after.weight, unit: UNIT })};
  const sets = [...document.querySelectorAll('[data-set]')];
  const btn = document.querySelector('[data-log]');
  const prog = document.querySelector('[data-progress]');
  const readout = document.querySelector('[data-readout]');
  let done = 0;
  if (btn) btn.addEventListener('click', () => {
    if (done >= sets.length) return;
    sets[done].dataset.done = '1';
    done += 1;
    if (prog) prog.textContent = done + ' / ' + sets.length;
    if (done < sets.length) {
      if (readout) readout.innerHTML =
        '<div>Set ' + done + ' logged. Saved on this device — no signal needed.</div>' +
        '<div>' + (sets.length - done) + ' to go.</div>';
      return;
    }
    btn.disabled = true;
    const label = btn.querySelector('span');
    const mono = btn.querySelector('.mono');
    if (label) label.textContent = 'Session complete';
    if (mono) mono.textContent = '3 / 3';
    if (readout) readout.innerHTML =
      '<div>All three at the top of the range.</div>' +
      '<div>Next squat session will ask for <b>' + AFTER.reps + ' \u00d7 ' + AFTER.weight + ' ' + AFTER.unit +
      '</b> — ${AFTER_NOTE}.</div>';
  });
  if (reduced) {
    grounds.forEach((g) => g.style.transition = 'none');
  }
})();
</script>
</body></html>`;
}
