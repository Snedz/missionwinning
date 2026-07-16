/**
 * EN copy for /experience — shaped for future t() without wiring i18n on this route.
 */

export const XP = {
  navStart: 'Start free',
  railAria: 'Chapter navigation',
  progressAria: 'Page scroll progress',

  ch00Index: '00',
  ch00Eyebrow: 'The Signal',
  ch00Title: 'Nothing on this page is a video.',
  ch00Title2: 'Everything is code.',
  ch00Body:
    'A live dossier of the Mission Winning path — WebGPU when your browser allows, pure CSS when it does not. The words you are reading are real DOM. The sky is a shader.',
  ch00TierPrefix: 'Rendering tier',

  ch01Index: '01',
  ch01Eyebrow: 'The Why',
  ch01Lead: 'Why we build',
  ch01Quote:
    'The right way to build a body and a life should be obvious, doable, and free — for every human on Earth.',
  ch01Body:
    'Mission Winning is the entrance to that path: evidence-based, holistic, habit-first. Free core forever. Premium depth only when you want it — never as the price of a basic log.',

  ch02Index: '02',
  ch02Eyebrow: 'The Path',
  ch02Title: 'A clear beginning. One step at a time.',
  ch02Body:
    'Borrowed from academy onboarding: you always know where you are and what comes next. No wall of features on day one.',

  ch03Index: '03',
  ch03Eyebrow: 'Six Chambers',
  ch03Title: 'Everything reinforces everything.',
  ch03Body:
    'Mobility improves training. Mind improves consistency. Fuel powers results. Win Score weighs all six — one number for the whole self.',
  ch03Free: 'Free',
  ch03Bundle: 'Bundle',
  ch03ToggleFree: 'Show free core',
  ch03TogglePremium: 'Show Super Bundle depth',

  ch04Index: '04',
  ch04Eyebrow: 'The Score',
  ch04Title: 'Log a set. Watch the score move.',
  ch04Body:
    'Same loop as the landing demo, scaled up: three sets, Win Score climbs, PR on the third. Buttons and numbers are always DOM — particles are decoration when GPU allows.',
  ch04Set1: 'Set 1 · Squat',
  ch04Set2: 'Set 2 · Squat',
  ch04Set3: 'Set 3 · Squat',
  ch04Pr: 'NEW PR LOGGED',
  ch04Loop: "That's the loop. Start free →",
  ch04ScoreLabel: 'Win Score',

  ch05Index: '05',
  ch05Eyebrow: 'Free Forever',
  ch05Title: 'Free is the mission, not the trial.',
  ch05Body:
    'The fundamentals that make people healthier should have no price of admission — anywhere in the world. Premium funds the mission. It does not gate the logger.',
  ch05Ledger: 'Honesty ledger',
  ch05Monthly: 'Monthly',
  ch05Annual: '12-month founders',
  ch05Lifetime: 'Lifetime',
  ch05Core: 'Core logger',
  ch05CoreVal: '$0 forever',

  ch06Index: '06',
  ch06Eyebrow: 'Proof of Work',
  ch06Title: 'What this page can do on your device',
  ch06Body:
    'Live capability audit. We report the tier you actually got — no fake “works everywhere” claims.',
  ch06Rendered: 'This page rendered in',
  ch06StatExercises: 'exercises in the free library',
  ch06StatLangs: '14 languages',
  ch06StatOffline: 'Offline PWA core',
  ch06StatPrice: '$0 free core',
  ch06StatLicense: 'AGPL-3.0 source',

  ch07Index: '07',
  ch07Eyebrow: 'Commission',
  ch07Title: 'The path starts with one workout.',
  ch07Body: 'Under three minutes to your first session. Nothing to install, nothing to pay.',
  ch07Cta: 'Start free — no account',
  ch07Signoff: 'Train anywhere. Win daily.',
} as const;

export const XP_JOURNEY = [
  {
    phase: '00',
    name: 'I-Day',
    desc: 'Three questions — experience, equipment, goal. No account needed. Under three minutes.',
  },
  {
    phase: '01',
    name: 'Basic Training',
    desc: 'One small win in each pillar: first workout, first meal, first flow, first breath, first lesson.',
  },
  {
    phase: '02',
    name: 'Readiness',
    desc: 'A health screen, your baseline Win Score, and a seven-day streak. Standards before speed.',
  },
  {
    phase: '03',
    name: 'Commissioned',
    desc: 'Today becomes your command center. One clear action every day, scored across all six pillars.',
  },
] as const;
