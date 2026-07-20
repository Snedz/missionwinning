/** Public compare narrative stories — server-safe (no 'use client'). */

export type CompareStoryBodySection = {
  heading: string;
  paragraphs: string[];
};

export type CompareStory = {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: { label: string; mw: string; them: string }[];
  proof: string;
  ctaNote: string;
  /** Long-form honest comparison sections. */
  body?: CompareStoryBodySection[];
  verdict?: string;
};

export const COMPARE_STORIES: CompareStory[] = [
  {
    slug: 'forge',
    eyebrow: 'vs Forge Fitness',
    title: 'Free core, no AI key required.',
    subtitle:
      'Forge’s best features lean on bring-your-own AI keys and a Pro paywall. Mission Winning ships Just Go, rest timers, PRs, and progression free — offline, no account. Optional AI coach exists only when operators enable it.',
    bullets: [
      { label: 'Start today’s workout', mw: 'Just Go — rule-based, free', them: 'AI Just Go (key + Pro)' },
      { label: 'Rest / PRs / progression', mw: 'Included forever', them: 'Often Pro-gated' },
      { label: 'Privacy model', mw: 'Offline-first PWA; sync optional', them: 'On-device + BYOK to providers' },
      { label: 'Platform', mw: 'Installable web app worldwide', them: 'iPhone beta first' },
    ],
    proof: '217 free exercise pages · offline · no account · no AI billing surprise',
    ctaNote: 'Lead with the free tracker — Bundle adds Coach depth when you want it.',
    body: [
      {
        heading: 'What Forge does well',
        paragraphs: [
          'Forge leans into AI-assisted programming and a polished iOS-first experience. If you want a coach that talks to a model you pay for separately, that product path can feel modern.',
          'The tradeoff is dependency: best features often sit behind Pro plus an API key. That is a real cost and a real failure mode when offline or traveling.',
        ],
      },
      {
        heading: 'Where Mission Winning leads',
        paragraphs: [
          'Mission Winning ships the free logger complete: Just Go, rest timers, PRs, and progression without an AI bill. The free exercise library and offline PWA are designed for parks, garages, and weak signal.',
          'Premium depth exists when you want Coach and pillar content — it never holds the core tracker hostage.',
        ],
      },
    ],
    verdict:
      'Choose Forge if BYOK AI on iPhone is the product. Choose Mission Winning if free offline logging is non-negotiable.',
  },
  {
    slug: 'freeletics',
    eyebrow: 'vs Freeletics Super Bundle',
    title: 'Six pillars in one app',
    subtitle:
      'Freeletics sells a multi-app story. Mission Winning keeps Train, Fuel, Move, Mind, Track, and Learn in one install with one Win Score.',
    bullets: [
      { label: 'Apps to install', mw: 'One PWA', them: 'Partner / multi-app unlock' },
      { label: 'Free core', mw: 'Full logger + library forever', them: 'Strong brand; paid depth' },
      { label: 'Nutrition + mind + mobility', mw: 'Same app, same score', them: 'Often separate products' },
      { label: 'Offline', mw: 'Designed for weak signal', them: 'Varies by surface' },
    ],
    proof: 'One Win Score ties every pillar — not seven subscriptions.',
    ctaNote: 'Free tracker stays free. Super Bundle unlocks Coach and deeper pillar content.',
    body: [
      {
        heading: 'What Freeletics does well',
        paragraphs: [
          'Freeletics built a powerful brand around bodyweight training and a freemium coach story. Their Super Bundle framing inspired the industry — including us.',
          'Many users still end up managing multiple surfaces for nutrition, mindfulness, or mobility partners.',
        ],
      },
      {
        heading: 'Where Mission Winning leads',
        paragraphs: [
          'One installable PWA holds Train, Fuel, Move, Mind, Track, and Learn. Win Score weights the whole person — not six separate streaks.',
          'The free core is permanent. Super Bundle funds depth; it does not redefine “free.”',
        ],
      },
    ],
    verdict: 'Freeletics is a brand ecosystem. Mission Winning is one app with one score and a free logger that stays free.',
  },
  {
    slug: 'spreadsheet',
    eyebrow: 'vs notes & spreadsheets',
    title: 'Progression without the spreadsheet tax',
    subtitle:
      'Notes apps break when you need last-session weights, rest timers, and readiness. Mission Winning is the free tracker that remembers for you.',
    bullets: [
      { label: 'Last session weights', mw: 'Auto-seeded next-set targets', them: 'Copy-paste or memory' },
      { label: 'Rest timer', mw: 'Auto-starts after each set', them: 'Phone clock juggling' },
      { label: 'Readiness', mw: 'Muscle freshness from your logs', them: 'Guesswork' },
      { label: 'Cost', mw: '$0 forever on the core', them: '“Free” until the sheet breaks' },
    ],
    proof: 'Log a set → Win Score ticks. That’s the loop.',
    ctaNote: 'Start free in under two minutes. No email wall on the logger.',
    body: [
      {
        heading: 'When spreadsheets win',
        paragraphs: [
          'Power users who love custom columns will always prefer a sheet. If you build your own periodization model, a spreadsheet is infinitely flexible.',
        ],
      },
      {
        heading: 'When the tax is too high',
        paragraphs: [
          'Most people abandon tracking when rest timers, last weights, and history become manual work. Mission Winning automates the boring parts while staying free offline.',
        ],
      },
    ],
    verdict: 'Keep the sheet if it is a hobby. Use Mission Winning if logging must survive real life.',
  },
  {
    slug: 'hevy',
    eyebrow: 'vs Hevy',
    title: 'Unlimited free core — not a free trial of limits',
    subtitle:
      'Hevy is a strong modern logger with social features. Its free tier still caps routines and history. Mission Winning keeps unlimited local routines and history free forever.',
    bullets: [
      { label: 'Saved routines (free)', mw: 'Unlimited local', them: 'Limited free tier' },
      { label: 'History (free)', mw: 'Unlimited on device', them: 'Time-capped free' },
      { label: 'Account required', mw: 'No — works offline', them: 'Yes for full product' },
      { label: 'Six pillars', mw: 'Train + Fuel + Move + Mind + Track + Learn', them: 'Primarily training log' },
    ],
    proof: 'No account · offline PWA · free exercise pages · one Win Score',
    ctaNote: 'If you only want a gym log with friends, Hevy is fine. If free forever offline is the bar, start here.',
    body: [
      {
        heading: 'What Hevy does well',
        paragraphs: [
          'Hevy ships a polished logger, social feed energy, and a familiar freemium path. Many lifters like the UX for pure gym sessions.',
        ],
      },
      {
        heading: 'The free-tier reality',
        paragraphs: [
          'Hevy’s free plan historically limits routines, history depth, and custom exercises. That is a product choice — not a bug. Mission Winning refuses to put those walls on the free core.',
          'We also keep nutrition, mobility, mind, and learning in the same app when you want them, scored together.',
        ],
      },
    ],
    verdict: 'Hevy for social gym logging. Mission Winning for unlimited free offline core + holistic pillars.',
  },
  {
    slug: 'strong',
    eyebrow: 'vs Strong',
    title: 'The free logger that does not expire your history',
    subtitle:
      'Strong is a classic set logger. Free tiers still constrain routines. Mission Winning keeps the free tracker complete and offline-first worldwide.',
    bullets: [
      { label: 'Free routines', mw: 'Unlimited', them: 'Hard free caps' },
      { label: 'Offline', mw: 'Designed as PWA offline', them: 'App-store native' },
      { label: 'No account', mw: 'Supported', them: 'Account-centric' },
      { label: 'Holistic score', mw: 'Win Score across pillars', them: 'Training-focused' },
    ],
    proof: 'Free core forever · 217 exercise pages · offline logging',
    ctaNote: 'Start free — no store fees, no routine cap.',
    body: [
      {
        heading: 'What Strong does well',
        paragraphs: [
          'Strong defined clean set logging for a generation of lifters. If you live in Apple’s ecosystem and only need a training log, it remains a credible choice.',
        ],
      },
      {
        heading: 'Where limits show',
        paragraphs: [
          'Free tiers that cap routines push serious users into paid plans quickly. Mission Winning’s free core includes unlimited local routines and history by design.',
        ],
      },
    ],
    verdict: 'Strong is a mature native log. Mission Winning is free offline depth without the routine tax.',
  },
  {
    slug: 'jefit',
    eyebrow: 'vs Jefit',
    title: 'Library depth without the ad-era clutter',
    subtitle:
      'Jefit has a huge exercise library and long history. Mission Winning pairs free public exercise pages with an offline logger and honest freemium — no cluttered free wall.',
    bullets: [
      { label: 'Exercise education', mw: 'Public SEO pages + form cues', them: 'In-app library tradition' },
      { label: 'Free experience', mw: 'Clean free core', them: 'Often ad/ freemium noise' },
      { label: 'Offline', mw: 'PWA first', them: 'Varies' },
      { label: 'Progression', mw: 'Next-set targets + PRs free', them: 'Mixed free/paid' },
    ],
    proof: 'Public exercises + free logger + Win Score',
    ctaNote: 'Browse the free library, then log without an account.',
    body: [
      {
        heading: 'What Jefit does well',
        paragraphs: [
          'Jefit earned trust with a massive catalog and community history. Long-time users know the exercise database well.',
        ],
      },
      {
        heading: 'Modern free core',
        paragraphs: [
          'Mission Winning publishes exercise pages publicly for learning and SEO, then logs offline without forcing a noisy free tier. Premium is optional depth, not the price of a clean log.',
        ],
      },
    ],
    verdict: 'Jefit for legacy library scale. Mission Winning for clean free offline logging + public education.',
  },
  {
    slug: 'caliber',
    eyebrow: 'vs Caliber',
    title: 'Coaching-grade plans without selling the free log short',
    subtitle:
      'Caliber blends coaching and programming. Mission Winning keeps free logging complete and sells Coach depth only when you want it.',
    bullets: [
      { label: 'Free logger', mw: 'Complete forever', them: 'Coaching product first' },
      { label: 'Plans', mw: 'Mission Coach + free Just Go', them: 'Coach-led programming' },
      { label: 'Offline', mw: 'PWA offline core', them: 'Varies' },
      { label: 'Price honesty', mw: 'Free core never moves', them: 'Coaching economics' },
    ],
    proof: 'Just Go free · Coach optional · offline first',
    ctaNote: 'Log free today. Unlock Coach when you want weekly adaptation.',
    body: [
      {
        heading: 'What Caliber does well',
        paragraphs: [
          'Caliber aims at coaching relationships and structured plans — a good fit if you want human or hybrid coaching as the product center.',
        ],
      },
      {
        heading: 'Mission Winning’s wedge',
        paragraphs: [
          'We start with the free tracker that works anywhere. Mission Coach and Super Bundle add depth without rewriting the free promise.',
        ],
      },
    ],
    verdict: 'Caliber for coaching-first. Mission Winning for free offline logging first.',
  },
  {
    slug: 'boostcamp',
    eyebrow: 'vs Boostcamp',
    title: 'Programs + logging without locking the free path',
    subtitle:
      'Boostcamp is excellent for following popular strength programs. Mission Winning includes free templates and unlimited free logging offline.',
    bullets: [
      { label: 'Program following', mw: 'Free templates + Builder', them: 'Strong program marketplace' },
      { label: 'Free log', mw: 'Unlimited core', them: 'Program-centric freemium' },
      { label: 'Offline', mw: 'PWA offline', them: 'Native focus' },
      { label: 'Holistic pillars', mw: 'Fuel/Move/Mind included', them: 'Primarily training' },
    ],
    proof: 'Free templates · free logger · public exercise pages',
    ctaNote: 'Start a free template or Just Go — no paywall on the log.',
    body: [
      {
        heading: 'What Boostcamp does well',
        paragraphs: [
          'Boostcamp made popular strength programs easy to follow with a clean UI. If your identity is “I run program X,” it is a strong pick.',
        ],
      },
      {
        heading: 'Where we differ',
        paragraphs: [
          'Mission Winning keeps free starters and unlimited free logging offline, then adds Coach and multi-pillar depth without requiring a marketplace membership to track sets.',
        ],
      },
    ],
    verdict: 'Boostcamp for program marketplace energy. Mission Winning for free offline everything-app logging.',
  },
  {
    slug: 'stronglifts',
    eyebrow: 'vs StrongLifts 5×5',
    title: '5×5 simplicity — without a single-program ceiling',
    subtitle:
      'StrongLifts popularized simple linear progression. Mission Winning includes free 5×5-style starters plus a full free library and multi-pillar scoring.',
    bullets: [
      { label: '5×5 path', mw: 'Free Full Body Starter (5×5)', them: 'Core product focus' },
      { label: 'Exercise variety', mw: '217 free exercise pages', them: 'Narrow barbell set' },
      { label: 'Beyond barbell', mw: 'Bodyweight + DB + offline', them: 'Barbell-first' },
      { label: 'Lifecycle', mw: 'Free forever core', them: 'App + program brand' },
    ],
    proof: 'Free 5×5 starter · free library · offline PWA',
    ctaNote: 'Run linear progression free — then keep going when you outgrow 5×5.',
    body: [
      {
        heading: 'What StrongLifts does well',
        paragraphs: [
          'StrongLifts made linear progression simple for beginners. The psychology of “add 5 lb” works.',
        ],
      },
      {
        heading: 'When you need more',
        paragraphs: [
          'Most lifters eventually need more exercises, equipment options, or recovery tools. Mission Winning starts free with a 5×5-style starter and never walls the logger when you expand.',
        ],
      },
    ],
    verdict: 'StrongLifts for pure 5×5 focus. Mission Winning when free variety and offline life matter.',
  },
];

export function getCompareStory(slug: string): CompareStory | undefined {
  return COMPARE_STORIES.find((s) => s.slug === slug);
}
