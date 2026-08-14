/*
 * Copy for `/week` — the continuous-scroll landing that combines the three
 * `.644` concepts (The Week · Anywhere · Field Manual) in the A1 language.
 *
 * Not `homeContent.ts`. That module is the comparison-board contract: eight
 * variants render it identically. This page is a different argument, so it
 * owns its own strings. Numbers still come from `contentFloors` — typing a
 * digit here is how the app's landing claimed 217 against a catalogue of 228.
 *
 * Voice: brand-guidelines.md § Voice. Evidence language is confined to manual
 * entry 07, behind a disclosure, hedged to EXERCISE_AS_MEDICINE.md. Hard rule 3:
 * no traction claims.
 */
import { CONTENT_FLOORS } from '@/lib/contentFloors';

const N = CONTENT_FLOORS.exercisePages;

export const META = {
  title: 'The week, anywhere — Mission Winning',
  description:
    'Log a set. Watch the week answer. The same plan holds in five places. A free offline logger and a coach that reads the log — no wearable, no gym, no account.',
};

export type DayKind = 'strength' | 'mobility' | 'cond' | 'rest';
export type Day = { d: string; label: string; kind: DayKind };

export const BASE_WEEK: Day[] = [
  { d: 'Mon', label: 'Lower', kind: 'strength' },
  { d: 'Tue', label: 'Mobility', kind: 'mobility' },
  { d: 'Wed', label: 'Upper', kind: 'strength' },
  { d: 'Thu', label: 'Rest', kind: 'rest' },
  { d: 'Fri', label: 'Conditioning', kind: 'cond' },
  { d: 'Sat', label: 'Rest', kind: 'rest' },
  { d: 'Sun', label: 'Rest', kind: 'rest' },
];

/*
 * Authored illustrations, not engine output. The planner is a weekly batch;
 * animating it on a click would be inventing proof. The page says so.
 */
export const CONSEQUENCES = [
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
] as const;

export type Chapter = {
  time: string;
  place: string;
  line: string;
  note: string;
  photo?: '/photo/home-rack' | '/photo/phone-bench' | '/photo/bare-wrist';
  alt?: string;
  position?: string;
};

/*
 * Five places, three photographs. Typographic plates where a frame does not
 * exist — a deliberate rhythm, stated on the page, not a placeholder. The
 * missing frames are named in docs/design/GROK_IMAGE_PACK.md.
 */
export const CHAPTERS: Chapter[] = [
  {
    time: '05:12',
    place: 'Garage',
    line: 'Same session.',
    note: 'Concrete, one roller door, a bar that lives under the bench. The week said lower body, so it is lower body.',
    photo: '/photo/home-rack',
    alt: 'A loaded barbell on a home rack',
    position: '52% 38%',
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
    photo: '/photo/phone-bench',
    alt: 'A phone resting on a bench between sets',
    position: '50% 42%',
  },
  {
    time: '17:20',
    place: 'Park bar',
    line: 'No wearable.',
    note: 'Nothing on the wrist. The plan is written from sets you finished, not from a sensor you remembered to charge.',
    photo: '/photo/bare-wrist',
    alt: 'A bare wrist — no watch, no band',
    position: '50% 30%',
  },
  {
    time: '07:05',
    place: 'Balcony',
    line: 'Still the same week.',
    note: 'Five places, one plan, and not one of them needed a gym to exist. That is the entire claim.',
  },
];

/*
 * The HUD week is BASE_WEEK, held identical across all five chapters on
 * purpose — that it does not change is the argument. Copy around it lives
 * here so the component cannot invent a second week.
 */
export const PIN = {
  kicker: 'This week · unchanged',
  foot: 'Written from your log',
};

export type SpecRow = { th: string; td: string };

export type ManualEntry = {
  n: string;
  title: string;
  standfirst: string;
  margin: string;
  open?: boolean;
  paragraphs: string[];
  spec?: SpecRow[];
  pull?: string;
  note?: string;
};

export const MANUAL: ManualEntry[] = [
  {
    n: '00',
    title: 'What this is',
    standfirst: 'A free workout logger, and a coach that reads the log.',
    margin: 'Free core is a product promise, not an introductory rate.',
    open: true,
    paragraphs: [
      'You log what you actually did. Once a week, Mission Coach reads the log and writes the next seven days from it — load, volume, and which days are which. Nothing else is required: no wearable, no gym membership, no account, no app store.',
      'The logger is free permanently. Not a trial, not a freemium timer. The paid tier deepens the other pillars; it never gates the log.',
    ],
    spec: [
      { th: 'Runs on', td: 'Any phone with a browser. Installs if you want it to.' },
      { th: 'Needs a signal', td: 'No. Sets save on the device; they sync when there is one.' },
      { th: 'Needs an account', td: 'No.' },
      { th: 'Costs', td: 'Nothing, for the logger and the weekly plan.' },
    ],
  },
  {
    n: '01',
    title: 'The problem this exists for',
    standfirst: 'Most training advice stops at “be consistent”, which is not a plan.',
    margin: 'The gap is not motivation. It is prescription.',
    paragraphs: [
      'The evidence for structured exercise is not in dispute. What is missing between that evidence and a Tuesday is dose — how much, how often, how heavy, and what to do when the week does not go as written.',
      'Generic programmes assume the week goes as written. They are built for a person who does not travel, does not get ill, and does not lose a Wednesday. When that person misses a session, the programme has nothing to say, so the athlete improvises or stops.',
    ],
    pull: 'A missed day is not a failed plan. It is an input.',
  },
  {
    n: '02',
    title: 'How the week is built',
    standfirst: 'From logged sets. Not from a questionnaire, and not from a heart-rate strap.',
    margin: 'Same engine as the app: suggestNextSetTarget.',
    paragraphs: [
      'Each week the planner reads what you completed — sets, reps, load, and whether you finished the range you were given — and writes the next seven days against it. Finish everything at the top of the range and the next session asks for more. Miss the range and it holds, or backs off.',
      'The planner is deliberately blind to anything social. It cannot see leaderboards, streaks or other athletes, and it is prevented from doing so by a test rather than by a convention — a week planned from comparison is a week planned from the wrong data.',
    ],
    spec: [
      { th: 'Reads', td: 'Completed sets: reps, load, RPE where you gave one.' },
      { th: 'Ignores', td: 'Heart rate, sleep scores, step counts, anything from a wearable.' },
      { th: 'Writes', td: 'Seven days: session type, exercises, target sets and load.' },
      { th: 'Rewrites', td: 'Weekly, and whenever the week breaks.' },
    ],
  },
  {
    n: '04',
    title: 'Where it works',
    standfirst: 'Anywhere you can stand up.',
    margin: 'Equipment is an input, not a prerequisite.',
    paragraphs: [
      'Tell it what you have — a barbell, two bands, a single kettlebell, nothing at all — and the week is built from that. Change the answer when you travel and the week is rebuilt from the new one.',
    ],
    spec: [
      { th: 'Catalogue', td: `${N} exercises, bodyweight and minimal-gear first, with form cues.` },
      { th: 'Typical minimum', td: 'Floor space and a doorway.' },
      { th: 'Offline', td: 'Full logging. The plan is already on the device.' },
    ],
  },
  {
    n: '05',
    title: 'What is free, and what is not',
    standfirst: 'The logger and the weekly plan are free permanently.',
    margin: 'Stated as a boundary so it can be held to.',
    paragraphs: [
      'The paid tier is additive by design. If a future version of this document says otherwise, the promise was broken and this line is the evidence.',
    ],
    spec: [
      { th: 'Free, permanently', td: 'Logging — sets, reps, RPE, rest timers, supersets, personal records.' },
      { th: 'Free, permanently', td: 'Mission Coach: a week built from your logs, rewritten weekly.' },
      { th: 'Free, permanently', td: `The ${N}-exercise catalogue and its form cues.` },
      { th: 'Paid', td: 'Depth in the other pillars — fuel, mobility, mind, tracking, learning.' },
    ],
  },
  {
    n: '06',
    title: 'Honest comparison',
    standfirst: 'What the alternatives are actually good at.',
    margin: 'No competitor is a villain here.',
    paragraphs: [
      'The narrow claim: an adaptive week, from logged sets alone, on any phone, for nothing.',
    ],
    spec: [
      { th: 'A spreadsheet', td: 'Total control, no cost, and it will never reschedule itself. You are the planner.' },
      { th: 'A logging app', td: 'Excellent records and history. Most do not write next week for you.' },
      { th: 'A written programme', td: 'Real expertise, fixed in advance. It cannot see that you missed Wednesday.' },
      { th: 'A human coach', td: 'Better than this at everything, when you can afford one and reach one.' },
    ],
  },
  {
    n: '07',
    title: 'Why this is being built',
    standfirst: 'Context, not a clinical claim.',
    margin: 'Educational tools. Not medical care.',
    paragraphs: [
      'Structured exercise has substantial evidence behind it, and major guidelines already name it as a first-line option for mild depressive symptoms. Yet exercise prescription — dose, progression, and what to do when life interrupts — is rarely part of professional training, so the advice that reaches people collapses to “just go work out”.',
      'This product is not treatment and does not claim to be. It is an attempt at the missing middle: structured, adaptive training that an ordinary person can actually follow, on a phone they already own. Energy, mood and resilience are honest consequences of showing up. They are not a diagnosis, and nothing here replaces a clinician, a therapist, or medication.',
    ],
    note: 'Educational tools and a daily supplement — not medical care, and not a replacement for human coaches or clinicians.',
  },
];

export const CLOSE = {
  eyebrow: 'What it costs',
  statement: 'Nothing, for the part you just used.',
  body: 'The logger and the weekly plan are free permanently — not a trial. No wearable, no gym, no account. Access is invite-only while the beta runs.',
};

export const COLOPHON = {
  numbers:
    'The opening target is computed at build time by the same function the app calls. The three responses to a broken week are authored illustrations: the real planner is a weekly batch, not something that recomputes on a button press.',
  plates:
    'Three of the five grounds are photographs; two are typographic, because three documentary frames exist in this project and five places were needed. The alternation is deliberate rather than a placeholder.',
  js: 'The logger demonstration needs JavaScript. The broken-week picker, the five places, the manual, and every sentence on this page do not. Without script you lose the taps, not the argument.',
  boundary: 'Educational tools and a daily supplement. Not medical care.',
};
