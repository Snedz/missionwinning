export interface LearnLesson {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  /** Optional long-form paragraphs. */
  body?: string[];
  actionLabel?: string;
  actionHref?: string;
}

export interface LearnPath {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  lessons: LearnLesson[];
}

export const FREE_LEARN_PATHS: LearnPath[] = [
  {
    id: 'strength-basics',
    title: 'Strength Basics',
    subtitle: 'The right way to start lifting — evidence over hype',
    icon: '🏋️',
    lessons: [
      {
        id: 'sb-1',
        title: 'Progressive Overload',
        summary: 'Muscles adapt when you gradually increase stress — weight, reps, or quality.',
        keyPoints: [
          'Add load or reps when you hit the top of your rep range with good form',
          'Track sessions — what gets measured gets improved',
          'Recovery is part of progress — not optional',
        ],
        actionLabel: 'Log a workout',
        actionHref: '/active',
      },
      {
        id: 'sb-2',
        title: 'Compound Movements First',
        summary: 'Squat, hinge, push, pull, carry — build the foundation before isolation.',
        keyPoints: [
          'Multi-joint lifts give the most return per minute',
          'Master bodyweight patterns before heavy barbell work',
          'Use the Library filters to find exercises by equipment',
        ],
        actionHref: '/library',
        actionLabel: 'Browse Library',
      },
      {
        id: 'sb-3',
        title: 'RPE & Auto-Regulation',
        summary: 'Some days you push, some days you maintain — listen to readiness scores.',
        keyPoints: [
          'Rate sets easy / medium / hard in the Active Workout logger',
          'Readiness rings on Today Hub guide muscle group focus',
          'Consistency beats perfect intensity every session',
        ],
        actionHref: '/log',
        actionLabel: 'Check Today Hub',
      },
    ],
  },
  {
    id: 'nutrition-101',
    title: 'Nutrition 101',
    subtitle: 'Fuel the mission — protein, whole foods, global access',
    icon: '🥗',
    lessons: [
      {
        id: 'n-1',
        title: 'Protein Priority',
        summary: 'Adequate protein supports muscle repair, satiety, and recovery.',
        keyPoints: [
          'Aim for a daily target — adjust in Calculators',
          'High-protein days boost your Win Score',
          'Combine plant sources for complete amino profiles',
        ],
        actionHref: '/nutrition',
        actionLabel: 'Log today\'s protein',
      },
      {
        id: 'n-2',
        title: 'Whole Foods, Common Ingredients',
        summary: 'Rice, beans, eggs, chicken, oats, vegetables — accessible worldwide.',
        keyPoints: [
          'Free recipes in Fuel pillar use global-friendly ingredients',
          'Hydration supports performance — log water glasses',
          'No fad elimination required for real results',
        ],
        actionHref: '/nutrition',
        actionLabel: 'Open Nutrition',
      },
    ],
  },
  {
    id: 'mobility-longevity',
    title: 'Mobility & Longevity',
    subtitle: 'Move daily — joints, posture, athletic life span',
    icon: '🧘',
    lessons: [
      {
        id: 'm-1',
        title: 'Daily Movement Minimum',
        summary: '5–10 minutes of mobility beats occasional long sessions.',
        keyPoints: [
          'Use guided flows in the Move pillar — timed step-through',
          'Mobility wins count toward recovery score',
          'Pair with training — open hips before squats',
        ],
        actionHref: '/move',
        actionLabel: 'Start a Flow',
      },
      {
        id: 'm-2',
        title: 'Corrective Mindset',
        summary: 'Address asymmetry and desk posture before they become injury.',
        keyPoints: [
          'Unilateral work exposes left/right gaps',
          'Face pulls and band work for shoulder health',
          'Assessments pillar tracks readiness and risk',
        ],
        actionHref: '/assessments',
        actionLabel: 'Take Assessment',
      },
    ],
  },
  {
    id: 'mindset-habits',
    title: 'Mindset & Habits',
    subtitle: 'The mind pillar makes every other pillar stick',
    icon: '🧠',
    lessons: [
      {
        id: 'mind-1',
        title: 'Breath as Anchor',
        summary: 'Controlled breathing reduces stress and improves focus before training.',
        keyPoints: [
          'Box breathing: 4s in, hold, out, hold',
          'Use the Mind pillar breathing timer — free, no audio needed',
          'One minute before a set can improve form quality',
        ],
        actionHref: '/mind',
        actionLabel: 'Try Breathing Timer',
      },
      {
        id: 'mind-2',
        title: 'Streaks & Identity',
        summary: 'You become what you repeat — small daily wins compound.',
        keyPoints: [
          'Weekly challenges on Today Hub track train, fuel, volume',
          'Daily check-in (sleep, mood, stress) builds self-awareness',
          'The path is consistency, not perfection',
        ],
        actionHref: '/log',
        actionLabel: 'View Challenges',
      },
    ],
  },
  {
    id: 'assessments-path',
    title: 'Assess & Adjust',
    subtitle: 'Know where you are — train smarter, not blindly',
    icon: '📊',
    lessons: [
      {
        id: 'a-1',
        title: 'PAR-Q & Readiness',
        summary: 'Screen before intense training — safety first, always.',
        keyPoints: [
          'Complete assessments in the free Assessments pillar',
          'Readiness rings reflect recent muscle group work',
          'When in doubt, consult a qualified professional',
        ],
        actionHref: '/assessments',
        actionLabel: 'Start Assessment',
      },
      {
        id: 'a-2',
        title: 'Benchmarks & 1RM',
        summary: 'Track strength over time — estimated and actual rep maxes.',
        keyPoints: [
          'Log working sets in Active Workout for history charts',
          'Benchmarks page shows progression and PRs',
          'Use metric or imperial — global by default',
        ],
        actionHref: '/benchmarks',
        actionLabel: 'View Benchmarks',
      },
    ],
  },
  {
    id: 'corrective-foundations',
    title: 'Corrective Exercise Foundations',
    subtitle: 'Assess, correct, then load — never the reverse',
    icon: '🩹',
    lessons: [
      {
        id: 'cf-1',
        title: 'Static & Dynamic Assessment',
        summary: 'Observe posture, gait, and key movement patterns before adding load.',
        keyPoints: [
          'Overhead squat and single-leg balance reveal common compensations',
          'Document left/right differences — unilateral work fixes asymmetry',
          'Use Assessments pillar + Move flows before heavy training blocks',
        ],
        actionHref: '/assessments',
        actionLabel: 'Run Assessment',
      },
      {
        id: 'cf-2',
        title: 'Activation Before Integration',
        summary: 'Wake up dormant muscles (glutes, scapular stabilizers) then use them in compound lifts.',
        keyPoints: [
          'Band pull-aparts, clamshells, dead bugs — low fatigue, high signal',
          'Corrective work belongs in warm-ups, not only on rest days',
          'Library tag "Corrective" filters prehab movements',
        ],
        actionHref: '/library',
        actionLabel: 'Corrective Library',
      },
      {
        id: 'cf-3',
        title: 'Layering Correctives Into Programs',
        summary: 'Correctives support strength — they replace training only when pain or dysfunction demands it.',
        keyPoints: [
          'Pair face pulls with pressing days; hip mobility with squat days',
          'Builder includes Desk Reset & Corrective Block templates',
          'Refer out when pain is sharp, radiating, or worsening',
        ],
        actionHref: '/builder',
        actionLabel: 'Load Corrective Template',
      },
    ],
  },
  {
    id: 'periodization-design',
    title: 'Periodization & Program Design',
    subtitle: 'Plan training in blocks — linear, undulating, and deload weeks',
    icon: '📈',
    lessons: [
      {
        id: 'pd-1',
        title: 'Linear vs Undulating Progression',
        summary: 'Beginners thrive on simple linear overload; intermediates benefit from varied stress.',
        keyPoints: [
          'Add weight or reps when top of rep range feels solid (RPE easy/medium)',
          'Undulating: heavy / moderate / light days in one week',
          'Program templates in Builder span beginner 5×5 to advanced blocks',
        ],
        actionHref: '/builder',
        actionLabel: 'Browse Templates',
      },
      {
        id: 'pd-2',
        title: 'Volume, Intensity, Frequency',
        summary: 'The training triangle — adjust one lever at a time, not all three at once.',
        keyPoints: [
          'Hypertrophy: moderate load, higher volume (8–15 reps, more sets)',
          'Strength: heavier load, lower reps, longer rest',
          'Deload every 4–8 weeks or when readiness/ recovery scores crash',
        ],
        actionHref: '/log',
        actionLabel: 'Check Recovery Score',
      },
      {
        id: 'pd-3',
        title: 'Specialization & Peaking',
        summary: 'Short blocks to bring up a lift or muscle group without abandoning the whole program.',
        keyPoints: [
          'Smolov Jr, Sheiko mini — examples in Pro templates (advanced)',
          'Pre-exhaust and intensity methods are shock blocks, not year-round training',
          'Match nutrition and sleep to training phase in Fuel pillar',
        ],
        actionHref: '/nutrition',
        actionLabel: 'Fuel for Training Phase',
      },
    ],
  },
  {
    id: 'coaching-client-success',
    title: 'Coaching & Client Success',
    subtitle: 'Communication, adherence, and ethical scope — professional coaching principles',
    icon: '🤝',
    lessons: [
      {
        id: 'cc-1',
        title: 'Scope of Practice',
        summary: 'Coaches educate and program; they do not diagnose, prescribe meds, or replace clinicians.',
        keyPoints: [
          'PAR-Q and red flags → refer to physician or PT when appropriate',
          'Nutrition guidance stays within general wellness unless licensed RD',
          'Mission Winning tools support coaching — they don\'t replace professional judgment',
        ],
        actionHref: '/assessments',
        actionLabel: 'Review PAR-Q',
      },
      {
        id: 'cc-2',
        title: 'Behavior Change & Adherence',
        summary: 'Streaks, check-ins, and small wins beat perfect programs nobody follows.',
        keyPoints: [
          'Mind pillar daily check-in builds self-awareness',
          'Weekly challenges on Today Hub — train, fuel, volume goals',
          'Start clients with 2–3 habits, not twelve',
        ],
        actionHref: '/mind',
        actionLabel: 'Daily Check-In',
      },
      {
        id: 'cc-3',
        title: 'Progress Tracking & Feedback Loops',
        summary: 'Log workouts, review trends, adjust based on data and conversation.',
        keyPoints: [
          'History + cloud sync preserve long-term trends',
          'Coaching inquiry form captures goals for human follow-up',
          'Celebrate process metrics (sessions completed) not only scale weight',
        ],
        actionHref: '/coaching',
        actionLabel: 'Coaching Inquiry',
      },
    ],
  },
  {
    id: 'sleep-recovery',
    title: 'Sleep & Recovery',
    subtitle: 'Rest is training — habits that compound',
    icon: '🌙',
    lessons: [
      {
        id: 'sr-1',
        title: 'Sleep Hygiene Basics',
        summary: 'Consistent schedule and environment beat expensive gadgets for most people.',
        keyPoints: [
          'Same wake time ±30 min, even weekends',
          'Cool, dark room; screens dimmed 60 min before bed',
          'Caffeine cutoff 8+ hours before sleep if sensitive',
        ],
        actionHref: '/mind',
        actionLabel: 'Sleep Wind-Down Session',
      },
      {
        id: 'sr-2',
        title: 'Active Recovery Days',
        summary: 'Easy movement clears soreness better than complete couch lock.',
        keyPoints: [
          'Walks, mobility flows, light bike — conversational pace',
          'Avoid max effort on rest days',
          'Move pillar Recovery Wind-Down after hard sessions',
        ],
        actionHref: '/move',
        actionLabel: 'Recovery Flow',
      },
      {
        id: 'sr-3',
        title: 'Readiness Signals',
        summary: 'Use trends, not one bad morning, to decide push vs deload.',
        keyPoints: [
          'Mission Score and readiness rings on Today',
          'Multiple low days → reduce volume or take deload',
          'Guidebook Ch.1 covers adaptation science',
        ],
        actionHref: '/learn/guide/human-performance',
        actionLabel: 'Guidebook Ch.1',
      },
      {
        id: 'sr-4',
        title: 'Nutrition for Recovery',
        summary: 'Protein and carbs support repair; dehydration impairs sleep.',
        keyPoints: [
          'Protein spread across day',
          'Evening meal not too heavy 2–3h before bed',
          'Hydrate early; taper fluids before sleep if bathroom wakes you',
        ],
        actionHref: '/nutrition',
        actionLabel: 'Log Fuel',
      },
    ],
  },
  {
    id: 'home-gym-budget',
    title: 'Home Gym on a Budget',
    subtitle: 'Maximum results with minimal gear',
    icon: '🏠',
    lessons: [
      {
        id: 'hg-1',
        title: 'Tier 1 Equipment',
        summary: 'Bands, a door anchor, and adjustable dumbbells cover most beginners.',
        keyPoints: [
          'Bodyweight + bands = global-friendly',
          'Pull-up bar or rings if doorway safe',
          'Floor space beats fancy machines',
        ],
        actionHref: '/library',
        actionLabel: 'Filter by Equipment',
      },
      {
        id: 'hg-2',
        title: 'Tier 2 Upgrades',
        summary: 'Barbell and rack when you outgrow dumbbells — buy used when possible.',
        keyPoints: [
          'Olympic bar + plates + squat stands',
          'Bumper plates if dropping cleans',
          'Skip gimmick devices; invest in load',
        ],
        actionHref: '/builder',
        actionLabel: 'Build a Program',
      },
      {
        id: 'hg-3',
        title: 'Programming at Home',
        summary: 'Noise, space, and neighbors shape exercise selection.',
        keyPoints: [
          'Goblet and DB work for quiet sessions',
          'Starter programs on Today hub need minimal gear',
          'Guidebook Ch.3 covers tuning volume',
        ],
        actionHref: '/learn/guide/programming-tuning',
        actionLabel: 'Guidebook Ch.3',
      },
      {
        id: 'hg-4',
        title: 'Safety Without a Spotter',
        summary: 'Use safeties, avoid true max singles alone, favor submaximal work.',
        keyPoints: [
          'Rack pins for bench and squat',
          'Leave 1–2 reps in tank on heavy sets',
          'Use smith or DB when learning new lifts',
        ],
        actionHref: '/active',
        actionLabel: 'Log Safely',
      },
    ],
  },
];
