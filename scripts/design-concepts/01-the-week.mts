/**
 * CONCEPT 1 — THE WEEK
 *
 * The product is the page. No headline, no photograph, no hero copy — the first
 * screen is a live week and one instruction: tell it what you did.
 *
 * Why this shape. Every version of this site so far has *described* the coach.
 * Describing is the weakest thing a marketing page can do about the one asset
 * nobody else has: a spreadsheet cannot reschedule itself and a logging app does
 * not plan. So this page hands the engine to the reader instead. Scrolling does
 * not reveal sections; pressing things reveals **consequences**. Copy appears
 * only as annotation to something that already happened on screen.
 *
 * The register is instrument, not encouragement — which is the product's own
 * stated voice ("clinical metrics over gamification slang", brand-guidelines.md
 * § Voice). Inter for text, IBM Plex Mono for every number, one amber signal.
 *
 * Honesty about the numbers. The opening target is computed at BUILD time by
 * `suggestNextSetTarget` — the same function `/active` calls — so the page opens
 * on a real engine output rather than a designed one. The responses to the three
 * consequence buttons are authored, and the page says so in the colophon: the
 * planner is a weekly batch, not something that recomputes on a click, and
 * pretending otherwise would be inventing proof.
 *
 * JS: required. Degrades to the full week, the real target, and every
 * annotation already visible — a reader with JS off loses the interaction, not
 * the argument.
 */
import { suggestNextSetTarget, type SetSnapshot } from '@/lib/workout/nextSetTargets';
import { weightUnitLabel, type UnitsPref } from '@/lib/units';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { fontFaces } from './assets.mjs';

const UNITS: UnitsPref = 'metric';
const UNIT = weightUnitLabel(UNITS);
const LAST: SetSnapshot[] = [
  { reps: 12, weight: 80 },
  { reps: 12, weight: 80 },
  { reps: 12, weight: 80 },
];

const opening = suggestNextSetTarget(LAST, 0, UNITS);
if (!opening) throw new Error('01-the-week: engine returned no target for the seed session');
// After all three sets are logged at the top of the range, the engine asks for
// one more rep. Computed, not typed.
const after = suggestNextSetTarget([{ reps: opening.reps, weight: opening.weight }], 0, UNITS);
if (!after) throw new Error('01-the-week: engine returned no follow-up target');

const N = CONTENT_FLOORS.exercisePages;

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

/* Each consequence is an authored week plus the sentence that explains it. */
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
    detail:
      `The shape of the week does not change when your equipment does — the strength days stay strength days, built from what fits in a hotel room. The catalogue is ${N} exercises, bodyweight and minimal gear first, for exactly this.`,
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
    id: 'gone',
    button: 'I lost the whole week',
    verdict: 'It starts from where you actually are, not from where the plan wished you were.',
    detail:
      'Seven days off is not a failure state that needs punishing with a harder week. The next week is written from your real last session — which is now a week old — so it opens lighter and builds again.',
    week: [
      { d: 'Mon', label: 'Lower · light', kind: 'strength' },
      { d: 'Tue', label: 'Rest', kind: 'rest' },
      { d: 'Wed', label: 'Upper · light', kind: 'strength' },
      { d: 'Thu', label: 'Rest', kind: 'rest' },
      { d: 'Fri', label: 'Mobility', kind: 'mobility' },
      { d: 'Sat', label: 'Conditioning', kind: 'cond' },
      { d: 'Sun', label: 'Rest', kind: 'rest' },
    ] as Day[],
  },
];

const week = (days: Day[], cls = '') =>
  `<div class="week ${cls}">${days
    .map(
      (d) =>
        `<div class="day k-${d.kind}"><b>${d.d}</b><span>${d.label}</span></div>`,
    )
    .join('')}</div>`;

export function build(): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mission Winning — the week, live</title>
<style>
${fontFaces(['inter-400', 'inter-600', 'inter-700', 'plex-mono-400', 'plex-mono-500'])}

:root{
  --bg:#08090b; --panel:#0e1014; --line:#1b1f26; --line-hi:#2b323c;
  --fg:#e8edf2; --dim:#7c8794; --sig:#ffb000; --sig-dim:#553c02;
  --ui:'Inter',system-ui,sans-serif; --mono:'PlexMono',ui-monospace,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{
  margin:0;background:var(--bg);color:var(--fg);font-family:var(--ui);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;
  background-image:
    repeating-linear-gradient(to right,rgba(124,135,148,.06) 0 1px,transparent 1px 48px),
    repeating-linear-gradient(to bottom,rgba(124,135,148,.06) 0 1px,transparent 1px 48px);
}
.wrap{max-width:82rem;margin:0 auto;padding:0 clamp(1.1rem,4vw,2.5rem)}
.mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
.label{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}

/* ── Console: the first screen is the product ─────────────────────────── */
.console{min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:5rem 0 3rem}
.rig{border:1px solid var(--line-hi);background:var(--panel);position:relative}
.rig::before{content:"";position:absolute;inset:-1px;pointer-events:none;
  background:linear-gradient(var(--sig),var(--sig)) 0 0/14px 1px no-repeat,
             linear-gradient(var(--sig),var(--sig)) 0 0/1px 14px no-repeat,
             linear-gradient(var(--sig),var(--sig)) 100% 100%/14px 1px no-repeat,
             linear-gradient(var(--sig),var(--sig)) 100% 100%/1px 14px no-repeat}
.rig-head{display:flex;justify-content:space-between;align-items:center;gap:1rem;
  padding:.9rem 1.4rem;border-bottom:1px solid var(--line)}
/* Two bays. The left is what you do; the right is what it does about it — and
   the right has to be on screen from the first frame or the concept is just a
   set logger. The first render put the week below the fold and the page read as
   a widget floating in black. */
.rig-body{display:grid;gap:0}
@media(min-width:960px){.rig-body{grid-template-columns:1.05fr 1fr}}
.bay{padding:1.8rem 1.4rem 2rem}
.bay + .bay{border-top:1px solid var(--line)}
@media(min-width:960px){.bay + .bay{border-top:0;border-left:1px solid var(--line)}}

.prompt{font-size:clamp(2rem,4.6vw,3.2rem);font-weight:700;letter-spacing:-.03em;
  line-height:1.04;margin:0 0 1.6rem;max-width:14ch}
.sets{display:grid;gap:2px}
.set{display:grid;grid-template-columns:2rem 1fr auto;align-items:center;gap:1rem;
  border:1px solid var(--line);padding:.75rem .9rem;font-family:var(--mono);font-size:15px}
.set .i{color:var(--dim);font-size:12px}
.set[data-done="1"]{border-color:var(--sig-dim);background:#12100a;color:var(--sig)}
.set .tick{opacity:0;font-size:12px}
.set[data-done="1"] .tick{opacity:1}
.log{margin-top:1rem;width:100%;background:var(--sig);color:#0a0b0d;border:0;
  font-family:var(--ui);font-weight:700;font-size:17px;padding:.95rem 1rem;cursor:pointer;text-align:left;
  display:flex;justify-content:space-between;gap:1rem}
.log[disabled]{background:var(--line);color:var(--dim);cursor:default}
.readout{margin-top:1.1rem;border-top:1px solid var(--line);padding-top:.9rem;
  display:grid;gap:.35rem;font-family:var(--mono);font-size:13px;color:var(--dim);min-height:4.2rem}
.readout b{color:var(--sig);font-weight:500}
.hint{margin:1.1rem 0 0;font-size:13px;color:var(--dim)}

/* ── Consequences ─────────────────────────────────────────────────────── */
.cons{padding:5rem 0 2rem;border-top:1px solid var(--line)}
.cons h2{font-size:clamp(1.4rem,3vw,2rem);font-weight:700;letter-spacing:-.02em;margin:.6rem 0 .4rem;max-width:24ch}
.cons .sub{margin:0 0 2rem;color:var(--dim);max-width:56ch}
.picks{display:flex;flex-wrap:wrap;gap:2px;margin-bottom:1.6rem}
.pick{background:transparent;border:1px solid var(--line-hi);color:var(--fg);
  font-family:var(--ui);font-size:14px;font-weight:600;padding:.7rem 1rem;cursor:pointer}
.pick[aria-pressed="true"]{background:var(--sig);color:#0a0b0d;border-color:var(--sig)}
.week{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--line);border:1px solid var(--line)}
.week.live{grid-template-columns:1fr}
.week.live .day{flex-direction:row;align-items:baseline;gap:.9rem;min-height:0;padding:.62rem .9rem}
.week.live .day b{min-width:2.4rem}
.day{background:var(--panel);padding:.7rem .5rem;min-height:5.2rem;display:flex;flex-direction:column;gap:.3rem}
.day b{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);font-weight:400}
.day span{font-size:13px;font-weight:600;line-height:1.25}
.day.k-rest{color:var(--dim)}
.day.k-rest span{font-weight:400}
.day.k-strength{box-shadow:inset 3px 0 0 var(--sig)}
.day.k-mobility{box-shadow:inset 3px 0 0 #4a7fb5}
.day.k-cond{box-shadow:inset 3px 0 0 #7c8794}
.day.moved{background:#12100a}
.verdict{margin:1.2rem 0 0;border-left:2px solid var(--sig);padding-left:1rem;max-width:60ch}
.verdict p:first-child{margin:0 0 .4rem;font-size:18px;font-weight:600}
.verdict p:last-child{margin:0;color:var(--dim);font-size:15px}

/* ── Close ────────────────────────────────────────────────────────────── */
.close{padding:5rem 0 6rem;border-top:1px solid var(--line);margin-top:4rem}
.close h2{font-size:clamp(1.8rem,4.4vw,3rem);font-weight:700;letter-spacing:-.03em;line-height:1.05;margin:.8rem 0 1rem;max-width:18ch}
.close p{color:var(--dim);max-width:52ch;margin:0 0 1.8rem}
.cta{display:inline-flex;align-items:center;gap:.6rem;background:var(--sig);color:#0a0b0d;
  text-decoration:none;font-weight:700;font-size:17px;padding:.9rem 1.4rem}
.foot{margin-top:3.5rem;border-top:1px solid var(--line);padding-top:1.2rem;
  font-family:var(--mono);font-size:11.5px;color:var(--dim);line-height:1.8;max-width:72ch}
.foot b{color:var(--fg);font-weight:500}
@media(max-width:700px){
  .week{grid-template-columns:repeat(2,1fr)}
  .day{min-height:auto}
}
</style>
</head><body>

<main>
  <section class="console"><div class="wrap">
    <p class="label">Mission Winning · Mission Coach · live</p>

    <div class="rig" style="margin-top:1.2rem">
      <div class="rig-head">
        <span class="label">Squat · today</span>
        <span class="label mono" data-progress>0 / 3</span>
      </div>
      <div class="rig-body">
       <div class="bay">
        <h1 class="prompt">Tell it what you did.</h1>

        <div class="sets">
          <div class="set" data-set data-done="0"><span class="i">1</span><span data-target>${opening.reps} &times; ${opening.weight} ${UNIT}</span><span class="tick">&check;</span></div>
          <div class="set" data-set data-done="0"><span class="i">2</span><span data-target>${opening.reps} &times; ${opening.weight} ${UNIT}</span><span class="tick">&check;</span></div>
          <div class="set" data-set data-done="0"><span class="i">3</span><span data-target>${opening.reps} &times; ${opening.weight} ${UNIT}</span><span class="tick">&check;</span></div>
        </div>

        <button class="log" data-log>
          <span>Log set</span><span class="mono">${opening.reps} &times; ${opening.weight} ${UNIT}</span>
        </button>

        <div class="readout" data-readout>
          <div>Last session: 3 &times; 12 at 80 ${UNIT} — every set at the top of the range.</div>
          <div>So today asks for <b>${opening.reps} &times; ${opening.weight} ${UNIT}</b>.</div>
        </div>

        <p class="hint">Three taps. Nothing to install, and no account to make first.</p>
       </div>

       <div class="bay">
        <p class="label" style="margin:0 0 .9rem">This week &middot; written from your log</p>
        ${week(BASE, 'live')}
        <p class="hint" data-weeknote>Finish the session and next week is rewritten from it.
          Nothing here came from a questionnaire.</p>
       </div>
      </div>
    </div>
  </div></section>

  <section class="cons"><div class="wrap">
    <p class="label">Then the week breaks</p>
    <h2>Every plan survives a good week. Show it a bad one.</h2>
    <p class="sub">Pick what went wrong. This is the part a written programme cannot do — it was
      finished before your Wednesday happened.</p>

    <div class="picks">
      ${CONSEQUENCES.map(
        (c, i) =>
          `<button class="pick" data-pick="${c.id}" aria-pressed="${i === 0 ? 'true' : 'false'}">${c.button}</button>`,
      ).join('')}
    </div>

    ${week(CONSEQUENCES[0].week)}

    <div class="verdict" data-verdict>
      <p>${CONSEQUENCES[0].verdict}</p>
      <p>${CONSEQUENCES[0].detail}</p>
    </div>
  </div></section>

  <section class="close"><div class="wrap">
    <p class="label">What it costs</p>
    <h2>Nothing, for the part you just used.</h2>
    <p>The logger and the weekly plan are free permanently — not a trial. No wearable, no gym, no
      account. Access is invite-only while the beta runs.</p>
    <a class="cta" href="#">Request an invite &rarr;</a>

    <p class="foot">
      <b>About these numbers.</b> The opening target is computed at build time by the same function
      the app calls, from the seed session shown — it is engine output, not a designed figure.
      The three responses above are <b>authored illustrations</b>: the real planner is a weekly
      batch, not something that recomputes on a button press, and animating one would be inventing
      proof.<br>
      <b>This page needs JavaScript</b> for the interaction. Without it the week, the real target and
      every sentence here are still present — you lose the demonstration, not the argument.<br>
      <b>Boundary.</b> Educational tools and a daily supplement. Not medical care.
    </p>
  </div></section>
</main>

<script>
(() => {
  const CONS = ${JSON.stringify(
    Object.fromEntries(CONSEQUENCES.map((c) => [c.id, { week: c.week, verdict: c.verdict, detail: c.detail }])),
  )};
  const BASE = ${JSON.stringify(CONSEQUENCES[0].week)};
  const AFTER = ${JSON.stringify({ reps: after.reps, weight: after.weight, unit: UNIT })};

  // ── the console ────────────────────────────────────────────────────────
  const sets = [...document.querySelectorAll('[data-set]')];
  const btn = document.querySelector('[data-log]');
  const prog = document.querySelector('[data-progress]');
  const readout = document.querySelector('[data-readout]');
  let done = 0;

  btn.addEventListener('click', () => {
    if (done >= sets.length) return;
    sets[done].dataset.done = '1';
    done += 1;
    prog.textContent = done + ' / ' + sets.length;

    if (done < sets.length) {
      readout.innerHTML =
        '<div>Set ' + done + ' logged. Saved on this device — no signal needed.</div>' +
        '<div>' + (sets.length - done) + ' to go.</div>';
      return;
    }

    btn.disabled = true;
    btn.querySelector('span').textContent = 'Session complete';
    btn.querySelector('.mono').textContent = '3 / 3';
    readout.innerHTML =
      '<div>All three at the top of the range.</div>' +
      '<div>Next squat session will ask for <b>' + AFTER.reps + ' \\u00d7 ' + AFTER.weight + ' ' + AFTER.unit +
      '</b> — one more rep, same load.</div>';
  });

  // ── consequences ───────────────────────────────────────────────────────
  const weekEl = document.querySelector('.week');
  const verdictEl = document.querySelector('[data-verdict]');
  const baseline = BASE.map(d => d.label);

  document.querySelectorAll('[data-pick]').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('[data-pick]').forEach(q => q.setAttribute('aria-pressed', String(q === p)));
      const c = CONS[p.dataset.pick];
      weekEl.innerHTML = c.week.map((d, i) =>
        '<div class="day k-' + d.kind + (baseline[i] !== d.label ? ' moved' : '') + '">' +
        '<b>' + d.d + '</b><span>' + d.label + '</span></div>').join('');
      verdictEl.innerHTML = '<p>' + c.verdict + '</p><p>' + c.detail + '</p>';
    });
  });
})();
</script>
</body></html>`;
}
