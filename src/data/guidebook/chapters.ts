import type { GuideChapter } from './types';

/** Beyond the Basics — free core guidebook (GT7 Beyond the APEX model). */
export const BEYOND_THE_BASICS_CHAPTERS: GuideChapter[] = [
  {
    id: 'human-performance',
    number: 1,
    title: 'Human Performance Science',
    subtitle: 'How your body adapts — evidence over hype',
    icon: '🧬',
    quickPathId: 'strength-basics',
    sections: [
      {
        id: 'ch1-s1',
        title: 'The SAID Principle',
        summary:
          'Your body adapts specifically to the stress you apply. Random workouts produce random results; intentional stress produces intentional gains.',
        body: `Training works because of Specific Adaptation to Imposed Demands (SAID). When you squat repeatedly with progressive load, your nervous system, muscles, and connective tissue reorganize to handle that demand more efficiently.

This is why "muscle confusion" is oversold. Variation has a place — especially for joint health and skill — but the foundation is repeating key patterns while gradually increasing stress (weight, reps, quality, or range of motion).

Mission Winning tracks what you actually do. That history is the feedback loop: without logs, you are guessing whether adaptation is happening.`,
        practiceCTA: { label: 'Check readiness on Today', href: '/log' },
        sourceRef: 'foundations — adaptation',
      },
      {
        id: 'ch1-s2',
        title: 'Energy Systems (Simple View)',
        summary:
          'Strength, intervals, and long steady work use different fuel pathways. Match your training intent to the system you want to develop.',
        body: `You do not need a biochemistry degree to program well. Think in three buckets:

**ATP-PC (seconds):** Heavy singles, explosive jumps, short sprints. Full rest between efforts.

**Glycolytic (30s–2min):** Hard circuits, repeated 400m efforts, high-rep burnouts. Partial recovery.

**Oxidative (minutes+):** Jogging, long hikes, easy bike. Sustainable pace and breathing.

Most general fitness blends all three across the week. A lifter who never trains oxidative capacity may gas out on conditioning tests; a runner who never lifts may lack strength for posture and injury resilience. The six-pillar Win Score nudges balance — not perfection every day.`,
        practiceCTA: { label: 'Log an activity', href: '/track' },
        relatedLearnPathId: 'strength-basics',
        sourceRef: 'foundations — energy systems',
      },
      {
        id: 'ch1-s3',
        title: 'Recovery Is Part of Training',
        summary:
          'Adaptation happens between sessions. Sleep, nutrition, and deload weeks are not optional extras.',
        body: `Training provides the stimulus; recovery provides the adaptation window. Chronic under-recovery shows up as stalled lifts, irritability, poor sleep, and rising resting heart rate — not always as soreness.

Practical recovery levers you can control today: 7–9 hours sleep when possible, protein at most meals, hydration, easy movement on rest days (walks, mobility flows), and honest deloads when readiness rings trend down.

Readiness on the Today hub is a consistency score from your logs — not a medical device. Use it as a nudge to push, maintain, or back off — not as an excuse to skip forever.`,
        practiceCTA: { label: 'Open health screen (PAR-Q)', href: '/assessments' },
        sourceRef: 'foundations — recovery',
      },
    ],
  },
  {
    id: 'movement-mechanics',
    number: 2,
    title: 'Movement Mechanics',
    subtitle: 'How lifts and patterns work — levers, not lore',
    icon: '🦴',
    quickPathId: 'corrective-foundations',
    sections: [
      {
        id: 'ch2-s1',
        title: 'The Squat Pattern',
        summary:
          'Knee and hip flexion with a braced torso. Depth and stance change muscle emphasis but the pattern stays the same.',
        body: `Squatting is not "knees bad" or "ass to grass always." It is controlled hip and knee flexion with a stable spine.

**Setup:** Feet roughly shoulder width, toes slightly out, brace before you descend.

**Descent:** Hips and knees bend together; knees track over mid-foot (not collapsing inward).

**Depth:** Parallel or below if mobility and comfort allow. Partial reps have a place but are not a substitute for full-range strength.

**Common mistakes:** Heels lifting, excessive forward lean from weak ankles or poor brace, bouncing out of the hole.

Use the Library form guides and swap to goblet squats or box squats if barbell depth is not there yet.`,
        practiceCTA: { label: 'Browse squat variations', href: '/library' },
        relatedExerciseIds: ['squats', 'goblet-squat', 'air-squat'],
        sourceRef: 'foundations — squat pattern',
      },
      {
        id: 'ch2-s2',
        title: 'The Hinge Pattern',
        summary:
          'Hip flexion and extension with minimal knee bend. Deadlifts, RDLs, and kettlebell swings share this blueprint.',
        body: `The hinge loads the posterior chain: hamstrings, glutes, erectors. The bar or load stays close; the hips move back, not down like a squat.

**Feel:** Stretch in hamstrings at the bottom, glutes drive the lockout.

**Common mistakes:** Squatting the deadlift (knees shoot forward), rounding the lower back under load, hyperextending at lockout.

Romanian deadlifts and good mornings teach the hinge with lighter loads. Master the pattern before chasing maximal singles.`,
        practiceCTA: { label: 'View hinge exercises', href: '/library' },
        relatedExerciseIds: ['deadlift', 'romanian-deadlift', 'kettlebell-swing'],
        sourceRef: 'foundations — hinge pattern',
      },
      {
        id: 'ch2-s3',
        title: 'Push, Pull & Carry',
        summary:
          'Upper-body training organizes into pushing away, pulling toward, and loaded carries for real-world strength.',
        body: `**Push:** Bench press, push-ups, overhead press — train horizontal and vertical angles. Keep shoulder blades engaged on presses.

**Pull:** Rows and pull-ups balance push volume and shoulder health. If you press often, pull at least as often.

**Carry:** Farmer walks, suitcase carries, and rucks build grip, core, and posture under load — underrated for general population clients.

Pair patterns across the week rather than cramming everything into one marathon session. The Builder and program templates encode sane splits for you.`,
        practiceCTA: { label: 'Open workout Builder', href: '/builder' },
        relatedExerciseIds: ['push-ups', 'pull-ups', 'barbell-row'],
        sourceRef: 'foundations — movement patterns',
      },
    ],
  },
  {
    id: 'programming-tuning',
    number: 3,
    title: 'Programming & Tuning',
    subtitle: 'Volume, intensity, and when to deload — tune your plan',
    icon: '⚙️',
    quickPathId: 'periodization-design',
    sections: [
      {
        id: 'ch3-s1',
        title: 'Volume & Intensity',
        summary:
          'Volume is how much work you do; intensity is how hard each set is. Both must progress over months, not every session.',
        body: `**Volume** is often counted as hard sets per muscle group per week. Beginners grow on modest volume; advanced lifters need more careful periodization.

**Intensity** can mean % of max or proximity to failure (RPE). Heavy triples and moderate rep work serve different goals.

A common beginner mistake is maxing out every week. A common intermediate mistake is adding exercises instead of progressing the ones that matter.

Log sets and reps in Active Workout. Mission Winning history is your programming notebook.`,
        practiceCTA: { label: 'Start a workout', href: '/active' },
        sourceRef: 'foundations — volume & intensity',
      },
      {
        id: 'ch3-s2',
        title: 'RPE & Auto-Regulation',
        summary:
          'Some days you have 90% of your best; training as if you always have 100% leads to burnout.',
        body: `Rate of Perceived Exertion (RPE) scales effort: RPE 8 means two reps left in the tank. It lets you train hard without always hitting failure.

Use RPE when sleep was poor, stress is high, or readiness trends down. Maintain the movement pattern; adjust load or reps.

In the logger, note how sets felt. Over time you will recognize when to add weight versus when to repeat.`,
        practiceCTA: { label: 'Use program templates', href: '/builder' },
        sourceRef: 'foundations — RPE',
      },
      {
        id: 'ch3-s3',
        title: 'Periodization & Deloads',
        summary:
          'Plans wave stress across weeks. Deloads are planned easier weeks — not failure.',
        body: `**Linear periodization:** Add weight weekly on key lifts (works well for novices).

**Undulating:** Rotate heavy, moderate, and light days within the week.

**Deload:** Cut volume or intensity 40–60% for a week when performance stalls or readiness drops for 5+ days.

Program templates in the Builder encode these ideas. Pro templates (premium) add classic strength blocks — Texas Method, 5/3/1 variants, and more — when you are ready for structure beyond starters.`,
        practiceCTA: { label: 'Browse templates', href: '/builder' },
        relatedLearnPathId: 'periodization-design',
        sourceRef: 'foundations — periodization',
      },
    ],
  },
  {
    id: 'getting-started-mw',
    number: 4,
    title: 'Getting Started with Mission Winning',
    subtitle: 'I-Day, six pillars, and your Win Score',
    icon: '🎯',
    quickPathId: 'mindset-habits',
    sections: [
      {
        id: 'ch4-s1',
        title: 'I-Day & Your Mission',
        summary:
          'Onboarding sets experience level, equipment, and goals so Today can recommend sensible next steps.',
        body: `I-Day takes about three minutes: accept the mission, set your profile, optionally sign in for cloud sync.

You are not locked into one program forever. Revisit Welcome with ?edit=1 to update equipment or goals.

The journey phases — Basic, Readiness, Commissioned — exist to build habits across all six pillars, not just the barbell.`,
        practiceCTA: { label: 'Review Welcome / I-Day', href: '/welcome' },
        sourceRef: 'foundations — onboarding & purpose',
      },
      {
        id: 'ch4-s2',
        title: 'The Six Pillars',
        summary:
          'Train, Fuel, Move, Mind, Track, and Learn work together. Siloed apps miss the synergy.',
        body: `**Train** — log sets and follow programs.

**Fuel** — macros, water, recipes.

**Move** — timed mobility flows.

**Mind** — breathing and short guided sessions.

**Track** — activities beyond the gym.

**Learn** — this guidebook and quick education paths.

Each pillar can log a "win" on Today. Basic Training asks for one win in each — a low bar designed to show the whole app, not exhaust you in week one.`,
        practiceCTA: { label: 'Open Today hub', href: '/log' },
        sourceRef: 'MW product design',
      },
      {
        id: 'ch4-s3',
        title: 'Win Score & Offline Use',
        summary:
          'Mission Score weights pillar consistency. The app works offline as a PWA once installed.',
        body: `Win Score is a holistic consistency metric — not a medical grade readiness score. It rewards showing up across pillars over time.

Install from your browser (Add to Home Screen) for offline logging at the park or garage gym. Sync when you sign in on Profile.

Beta testers: see /beta for the start guide and feedback channels.`,
        practiceCTA: { label: 'Beta start guide', href: '/beta' },
        sourceRef: 'MW product design',
      },
    ],
  },
  {
    id: 'nutrition-recovery',
    number: 5,
    title: 'Nutrition & Recovery',
    subtitle: 'Fuel and sleep — the other half of adaptation',
    icon: '🥗',
    quickPathId: 'nutrition-101',
    sections: [
      {
        id: 'ch5-s1',
        title: 'Macros Without Obsession',
        summary:
          'Protein, carbohydrates, and fats each play a role. Track enough to learn, not enough to dread meals.',
        body: `**Protein:** Roughly 1.6–2.2 g/kg bodyweight for most active people building or retaining muscle. Spread across meals.

**Carbs:** Fuel hard training and recovery; timing matters more for athletes than for general fitness.

**Fats:** Essential for hormones and satiety; do not eliminate them chasing low numbers.

Log a typical day on Fuel. Use recipes for ideas — free core includes dozens; premium adds meal-prep depth.`,
        practiceCTA: { label: 'Open Fuel log', href: '/nutrition' },
        sourceRef: 'nutrition science — macros',
      },
      {
        id: 'ch5-s2',
        title: 'Hydration & Sleep',
        summary:
          'Water and sleep move the needle more than most supplements.',
        body: `Dehydration reduces performance and recovery. A simple habit: drink steadily through the day, extra around training.

Sleep is when growth hormone peaks and memory consolidates — including motor learning from today's lifts. Chronic five-hour nights undermine every program.

Mind pillar includes wind-down sessions; Move includes recovery flows. Use them on rest days.`,
        practiceCTA: { label: 'Try a recovery flow', href: '/move' },
        sourceRef: 'foundations — hydration & sleep',
      },
      {
        id: 'ch5-s3',
        title: 'Meal Timing & Consistency',
        summary:
          'Total daily intake matters most; timing is a tiebreaker for advanced athletes.',
        body: `For most users, hitting protein and calories across the day beats worrying about the "anabolic window."

Pre-workout: easily digested carbs + protein if training fasted feels bad.

Post-workout: protein and carbs within a few hours supports recovery — not a minute-by-minute emergency.

Log recipes from the Fuel page to pre-fill macros. Weekly challenges can nudge protein-day streaks.`,
        practiceCTA: { label: 'Browse recipes', href: '/nutrition' },
        sourceRef: 'foundations — meal timing',
      },
    ],
  },
  {
    id: 'assessments-progress',
    number: 6,
    title: 'Assessments & Progress',
    subtitle: 'Screen safely, benchmark honestly, adjust deliberately',
    icon: '📊',
    quickPathId: 'assessments-path',
    sections: [
      {
        id: 'ch6-s1',
        title: 'PAR-Q & Health Screening',
        summary:
          'Know when to seek medical clearance before pushing intensity.',
        body: `The Physical Activity Readiness Questionnaire (PAR-Q) flags cardiovascular, joint, and metabolic risks. A "yes" does not mean never train — it means talk to a qualified professional first.

Complete the in-app health screen honestly. Mission Winning is a civilian fitness tool, not medical advice.

Assessments save a summary to your log for your own reference — share with your doctor or coach if useful.`,
        practiceCTA: { label: 'Complete PAR-Q', href: '/assessments' },
        sourceRef: 'PAR-Q screening',
      },
      {
        id: 'ch6-s2',
        title: 'Benchmarks & Tests',
        summary:
          'Push-ups, pull-ups, and strength standards give objective checkpoints beyond the mirror.',
        body: `Benchmark tests repeat every few weeks — not daily. They answer: is my training transferring to performance?

Use Readiness tests and history trends together. One bad day is noise; four weeks flat is signal.

Leaderboards add optional social motivation. Squad codes let friends compare without posting publicly.`,
        practiceCTA: { label: 'Open benchmarks', href: '/benchmarks' },
        sourceRef: 'foundations — assessments',
      },
      {
        id: 'ch6-s3',
        title: 'When to Adjust the Plan',
        summary:
          'Stall, pain, or life stress each call for different fixes — not always "push harder."',
        body: `**Stall:** Add volume or intensity on one lift at a time, or deload and rebuild.

**Pain:** Sharp or joint pain — stop aggravating movement, seek qualified help. Dull muscle soreness is different.

**Life stress:** Maintain with lower RPE sessions; consistency beats hero weeks.

History and Win Score trends on Today help you decide. This guidebook is the reference; your log is the truth.`,
        practiceCTA: { label: 'View workout history', href: '/history' },
        sourceRef: 'foundations — program adjustment',
      },
    ],
  },
];

export function getGuideChapter(id: string): GuideChapter | undefined {
  return BEYOND_THE_BASICS_CHAPTERS.find((c) => c.id === id);
}

export function getTotalGuideSections(): number {
  return BEYOND_THE_BASICS_CHAPTERS.reduce((n, ch) => n + ch.sections.length, 0);
}
