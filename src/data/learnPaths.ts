export interface LearnLesson {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
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
];
