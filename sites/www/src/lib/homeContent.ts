/*
 * Everything the homepage says, in one place.
 *
 * This existed inline in `src/pages/index.astro` until `.643`, which was fine
 * while there was one page. There are now nine renderings of this copy — the
 * real page plus eight art-direction variants under `docs/design/variants/` —
 * and the entire value of that comparison board is that **only the art
 * direction differs**. Copy living in the page it is rendered by makes that
 * property impossible to hold: the first edit to either side silently turns the
 * board into a comparison of two different pages.
 *
 * So the board and the site read the same module, and `build-design-variants`
 * asserts the rendered text of all eight variants is identical. One fact, one
 * home — the rule this repo opens with.
 *
 * Numbers come from `contentFloors`, never typed. Strings that already exist in
 * the app's locale pack come from there, so this surface cannot say something
 * the product does not.
 */
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { landingStringsFor, LANDING_FAQ_KEYS } from '@/i18n/landingLocales';

const t = landingStringsFor('en');

export const META = {
  title: 'Log a set. Offline. — Mission Winning',
  description:
    "Free offline workout logger plus adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline, anywhere.",
};

export const HERO = {
  eyebrow: t.landingHeroEyebrow ?? 'Free · offline · no account',
  /* Two lines, set as separate elements so a theme can stagger or stack them. */
  lines: ['Log a set.', 'Your week rewrites itself.'],
  body:
    "A workout logger that turns what you actually did into next week's plan. No wearable, no gym, no account — and the logger is free forever.",
};

/*
 * Checkable facts only — hard rule 3, no traction claims. `exercisePages` is a
 * floor asserted against the real catalogue by contentInventory.test.ts, so
 * copy written from it can only ever under-promise.
 */
export const STATS = [
  { figure: String(CONTENT_FLOORS.exercisePages), label: 'Exercises, bodyweight and minimal gear first' },
  { figure: '3min', label: 'From landing to your first logged set' },
  { figure: '0', label: 'Wearables, accounts or app stores required' },
  { figure: '$0', label: 'The logger, forever — not a trial' },
] as const;

export const STATEMENTS = {
  missed: 'A missed day is not a failed plan.',
  close: 'One set is the whole beginning.',
};

export const ADAPT = {
  eyebrow: 'When you miss',
  heading: 'A missed day is not a failed plan',
  body:
    'Sleep badly, travel, lose a week — Mission Coach reshapes what is left instead of leaving you behind a schedule you already broke.',
};

/*
 * The three documentary shots that exist. A slot with no photograph renders an
 * honest captioned frame, never a stock stand-in — the same call GrayscalePhoto
 * makes in the app.
 */
export const ANYWHERE = {
  eyebrow: 'Where you train',
  heading: 'Built for one bar of signal and no rack',
  panels: [
    {
      base: '/photo/phone-bench',
      alt: 'A phone resting on a gym bench between sets',
      title: 'Offline first',
      body: 'Sets save on the device the moment you log them. Signal is optional; the log is not.',
    },
    {
      base: '/photo/home-rack',
      alt: 'A loaded barbell on a home rack',
      title: 'Your gear, not a gym',
      body: 'Tell it what you have — a bar, two bands, nothing — and the week is built from that.',
    },
    {
      base: '/photo/bare-wrist',
      alt: 'A bare wrist gripping a barbell',
      title: 'No wearable',
      body: 'The plan comes from logged sets, so nothing needs charging for it to work.',
    },
  ],
} as const;

export const FREE_CORE = {
  eyebrow: 'The free core',
  heading: 'Free is the mission, not the trial',
  rows: [
    { term: 'The logger', def: 'Sets, reps, RPE, rest timers, supersets, PRs.' },
    { term: 'Mission Coach', def: 'A week built from your logs, regenerated every week.' },
    { term: `${CONTENT_FLOORS.exercisePages} exercises`, def: 'Bodyweight and minimal gear first, with form cues.' },
    { term: 'No account', def: 'Works offline. Nothing to install, nothing to sign up for.' },
  ],
  footnote:
    'Fuel, Move, Mind, Track and Learn deepen the path after Train + Coach — never the pitch.',
};

export const QUESTIONS = {
  eyebrow: 'Straight answers',
  heading: 'Questions worth asking first',
  items: LANDING_FAQ_KEYS.map((item) => ({
    q: t[item.qKey] ?? item.qDefault,
    a: t[item.aKey] ?? item.aDefault,
  })),
};

export const NAV_LINKS = [
  { href: '/#train', label: 'Train' },
  { href: '/#adapt', label: 'Coach' },
  { href: '/#history', label: 'History' },
  { href: '/about', label: 'About' },
] as const;

export const CTA = {
  label: 'Get notified',
  reassurance: 'One email when Alpha is public. Logger stays free forever.',
};

/*
 * The adapt demo's two weeks. Literal arrays here exactly as they are literal
 * arrays in the app — `adaptPlan` is never called. CoachAdaptDemo's own header
 * records this so nobody upgrades the claim; repeating it here for the same
 * reason, because a variant renderer reading these could easily assume they
 * came from an engine.
 */
export const ADAPT_WEEK = {
  planned: [
    { day: 'Mon', label: 'Lower', kind: 'strength' },
    { day: 'Tue', label: 'Mobility', kind: 'mobility' },
    { day: 'Wed', label: 'Upper', kind: 'strength' },
    { day: 'Thu', label: 'Rest', kind: 'rest' },
    { day: 'Fri', label: 'Conditioning', kind: 'conditioning' },
    { day: 'Sat', label: 'Rest', kind: 'rest' },
    { day: 'Sun', label: 'Rest', kind: 'rest' },
  ],
  adapted: [
    { day: 'Mon', label: 'Lower', kind: 'strength' },
    { day: 'Tue', label: 'Mobility', kind: 'mobility' },
    { day: 'Wed', label: 'Missed', kind: 'rest' },
    { day: 'Thu', label: 'Upper', kind: 'strength' },
    { day: 'Fri', label: 'Rest', kind: 'rest' },
    { day: 'Sat', label: 'Conditioning', kind: 'conditioning' },
    { day: 'Sun', label: 'Rest', kind: 'rest' },
  ],
  note: 'A planned week. Miss a day and the rest of it moves — the door is kept, not dropped.',
  action: 'Miss Wednesday',
} as const;

