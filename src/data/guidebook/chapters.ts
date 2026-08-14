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
    heroImage: {
      src: '/learn/human-performance-hero.webp',
      alt: 'Abstract athletic field suggesting human performance and adaptation',
      caption: 'Adaptation follows the demand you repeat',
    },
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
        relatedExerciseIds: ['squats', 'deadlift', 'push-ups'],
        relatedLearnPathId: 'strength-basics',
        sourceRef: 'foundations — adaptation',
        callout: {
          title: 'Key idea',
          body: 'Adapt to the demand you repeat. Progress the same patterns — load, reps, quality, or range — before chasing novelty.',
        },
        figure: {
          src: '/learn/said-principle.webp',
          alt: 'Diagram of capacity rising as the same training pattern is repeated',
          caption: 'SAID — adapt to the demand you repeat',
        },
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
        relatedExerciseIds: ['jump-squats', 'burpees', 'mountain-climbers'],
        relatedLearnPathId: 'strength-basics',
        sourceRef: 'foundations — energy systems',
        table: {
          caption: 'Energy systems at a glance',
          headers: ['System', 'Duration', 'Feel', 'Examples'],
          rows: [
            ['ATP-PC', 'Seconds', 'Max power, full rest', 'Heavy singles, jumps, short sprints'],
            ['Glycolytic', '30s–2 min', 'Hard burn, partial rest', 'Circuits, 400m repeats'],
            ['Oxidative', 'Minutes+', 'Sustainable pace', 'Easy jog, hike, long bike'],
          ],
        },
        figure: {
          src: '/learn/energy-systems.webp',
          alt: 'Three panels for ATP-PC, glycolytic, and oxidative energy systems',
          caption: 'Match training intent to the system you want to develop',
        },
      },
      {
        id: 'ch1-s3',
        title: 'Recovery Is Part of Training',
        summary:
          'Adaptation happens between sessions. Sleep, nutrition, and deload weeks are not optional extras.',
        body: `Training provides the stimulus; recovery provides the adaptation window. Chronic under-recovery shows up as stalled lifts, irritability, poor sleep, and rising resting heart rate — not always as soreness.

Practical recovery levers you can control today: 7–9 hours sleep when possible, protein at most meals, hydration, easy movement on rest days (walks, mobility flows), and honest deloads when readiness rings trend down.

Readiness on Today is a consistency score from your logs — not a medical device. Use it as a nudge to push, maintain, or back off — not as an excuse to skip forever.`,
        practiceCTA: { label: 'Open health screen (PAR-Q)', href: '/assessments' },
        relatedExerciseIds: ['bird-dog', 'plank', 'glute-bridge'],
        relatedLearnPathId: 'sleep-recovery',
        sourceRef: 'foundations — recovery',
        callout: {
          title: 'Recovery is training',
          body: 'The session is the stimulus; sleep, food, and easy movement are where adaptation lands. Treat under-recovery as a programming input — not a character flaw.',
        },
        figure: {
          src: '/learn/recovery-stimulus.webp',
          alt: 'Session stimulus arrow into a recovery window where adaptation lands',
          caption: 'Adaptation happens between sessions',
        },
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
    heroImage: {
      src: '/learn/movement-mechanics-hero.webp',
      alt: 'Abstract movement patterns suggesting squat and hinge mechanics',
      caption: 'Patterns over lore',
    },
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
        relatedLearnPathId: 'corrective-foundations',
        sourceRef: 'foundations — squat pattern',
        figure: {
          src: '/form-guides/air-squat.svg',
          alt: 'Air squat form diagram with stand, depth, and stand phases',
          caption: 'Air squat — sit hips back, knees track, drive up',
        },
        checklist: {
          title: 'Squat faults to watch',
          items: [
            'Heels lifting off the floor',
            'Knees collapsing inward',
            'Excessive forward lean from weak ankles or poor brace',
            'Bouncing out of the bottom without control',
          ],
        },
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
        relatedLearnPathId: 'corrective-foundations',
        sourceRef: 'foundations — hinge pattern',
        figure: {
          src: '/form-guides/romanian-deadlift.svg',
          alt: 'Romanian deadlift form diagram with hinge and lockout phases',
          caption: 'Hinge — hips back, bar close, drive to lockout',
        },
        checklist: {
          title: 'Hinge faults to watch',
          items: [
            'Squatting the deadlift — knees shoot forward instead of hips back',
            'Rounding the lower back under load',
            'Bar drifting away from the legs',
            'Hyperextending the spine at lockout',
          ],
        },
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
        relatedExerciseIds: ['push-ups', 'pull-ups', 'barbell-row', 'overhead-press'],
        relatedLearnPathId: 'strength-basics',
        sourceRef: 'foundations — movement patterns',
        figure: {
          src: '/form-guides/push-ups.svg',
          alt: 'Push-up form diagram with setup, mid, and lockout phases',
          caption: 'Push pattern — brace, lower with control, press away',
        },
        checklist: {
          title: 'Pattern balance check',
          items: [
            'Pull at least as often as you press',
            'Train horizontal and vertical push/pull angles',
            'Include at least one loaded carry weekly if equipment allows',
            'Spread patterns across the week — not one marathon session',
          ],
        },
      },
    ],
  },
  {
    id: 'programming-tuning',
    number: 3,
    title: 'Programming & Tuning',
    subtitle: 'Volume, intensity, and deloads — plans from your logs',
    icon: '⚙️',
    quickPathId: 'periodization-design',
    heroImage: {
      src: '/learn/programming-tuning-hero.webp',
      alt: 'Abstract progressive overload waveform on a dark mission canvas',
      caption: 'Progress the plan from what you logged',
    },
    sections: [
      {
        id: 'ch3-s1',
        title: 'Log First, Then Tune',
        summary:
          'Log sets on this phone — even offline, with no wearable. Mission Coach reads that diary and builds the next week. Volume and intensity are what it is reading.',
        body: `This section is a practice intro: do the work, then let the week come from the diary.

**Do this first.** Open Train and log the sets you actually did — park, garage, hotel gym, or living-room floor. The logger works on this phone without Wi-Fi. You do not need a wearable, and you do not need an account to start. Rate how hard the set felt when you have a sense for it.

**Then open Mission Coach.** Weekly plans come from those logs: how much you did, how hard it felt, and what you missed. Coach re-spreads a skipped day instead of shaming you into a restart. A week of honest logs beats a perfect template you never followed.

**What Coach is reading.** Volume is how much work you did (often hard sets per muscle group per week). Intensity is how hard each set was — percent of max or proximity to failure (RPE). Beginners grow on modest volume; advanced lifters need more careful waves. A common beginner mistake is maxing out every week. A common intermediate mistake is adding exercises instead of progressing the ones that matter.

Log sets and reps in Train. That history is the programming notebook Mission Coach uses — not a strap, not a social feed.`,
        practiceCTA: { label: 'Start a workout', href: '/active' },
        relatedLearnPathId: 'periodization-design',
        relatedExerciseIds: ['squats', 'deadlift', 'bench-press'],
        sourceRef: 'foundations — volume & intensity',
        figure: {
          src: '/learn/progressive-overload.webp',
          alt: 'Four levers for progressive overload: load, reps, sets, quality',
          caption: 'Progress one variable at a time — keep the others honest',
        },
        table: {
          caption: 'Volume landmarks (hard sets / week)',
          headers: ['Level', 'Hard sets / muscle / week', 'Intensity cue'],
          rows: [
            ['Beginner', '6–10', 'Leave 2–3 reps in reserve most sets'],
            ['Intermediate', '10–16', 'Mix RPE 7–9; progress one lift at a time'],
            ['Advanced', '12–20+', 'Periodize; deload when stalls cluster'],
          ],
        },
      },
      {
        id: 'ch3-s2',
        title: 'RPE & Auto-Regulation',
        summary:
          'Some days you have 90% of your best; training as if you always have 100% leads to burnout.',
        body: `Rate of Perceived Exertion (RPE) scales how hard a set felt: RPE 8 means about two reps left. It lets you train hard without living at failure.

Use RPE when sleep was poor, stress is high, or readiness trends down. Keep the movement pattern; drop load or reps instead of forcing yesterday's numbers.

In the logger, note how sets felt. Mission Coach uses those RPE notes when it shapes the next week. You do not need a wearable for that signal. Over weeks you will see when to add weight versus when to repeat the same top set.`,
        practiceCTA: { label: 'Open Mission Coach', href: '/coach' },
        relatedExerciseIds: ['squats', 'bench-press', 'deadlift'],
        relatedLearnPathId: 'periodization-design',
        sourceRef: 'foundations — RPE',
        figure: {
          src: '/form-guides/squats.svg',
          alt: 'Squat form diagram used as a reference lift for RPE training',
          caption: 'Same lift, honest RPE — progress without maxing every week',
        },
        table: {
          caption: 'RPE quick reference',
          headers: ['RPE', 'Reps in reserve', 'Use when'],
          rows: [
            ['10', '0 — failure', 'Rare max tests'],
            ['9', '1 left', 'Heavy strength sets'],
            ['8', '2 left', 'Default hard training'],
            ['7', '3 left', 'Technique / volume days'],
            ['≤6', '4+ left', 'Recovery / deload'],
          ],
        },
      },
      {
        id: 'ch3-s3',
        title: 'Periodization & Deloads',
        summary:
          'Plans wave stress across weeks. Deloads are planned easier weeks — not failure.',
        body: `**Linear periodization:** Add weight weekly on key lifts (works well for novices).

**Undulating:** Rotate heavy, moderate, and light days within the week.

**Deload:** Cut volume or intensity 40–60% for a week when performance stalls or readiness drops for 5+ days.

Mission Coach already waves stress from your logs — including missed sessions. You do not need a wearable or a template pack to get a week that matches what you actually did. Deload is a plan, not a failure.`,
        practiceCTA: { label: 'Open Mission Coach', href: '/coach' },
        relatedExerciseIds: ['squats', 'deadlift', 'overhead-press'],
        relatedLearnPathId: 'periodization-design',
        sourceRef: 'foundations — periodization',
        callout: {
          title: 'When to deload',
          body: 'If key lifts stall for 2+ weeks, readiness trends down for 5+ days, or sleep and mood are clearly off — cut volume or intensity 40–60% for a week, then rebuild. Deload is a plan, not a failure.',
        },
        figure: {
          src: '/learn/deload-signal.webp',
          alt: 'Load trend over weeks with a marked deload when readiness drops',
          caption: 'Deload is a plan — not a failure',
        },
      },
    ],
  },
  {
    id: 'getting-started-mw',
    number: 4,
    title: 'Getting Started with Mission Winning',
    subtitle: 'I-Day, logging, and Mission Coach from your logs',
    icon: '🎯',
    quickPathId: 'mindset-habits',
    heroImage: {
      src: '/learn/getting-started-mw-hero.webp',
      alt: 'Abstract dawn path into training — I-Day and the mission ahead',
      caption: 'Log the work — Coach plans from your history',
    },
    sections: [
      {
        id: 'ch4-s1',
        title: 'I-Day & Your Mission',
        summary:
          'Onboarding sets level, equipment, and goals so Today can point at a sensible next session — then you log it.',
        body: `I-Day takes about three minutes: accept the mission, set your profile (level, equipment, goals), and optionally sign in for cloud sync.

You are not locked into one program forever. Open Welcome with ?edit=1 anytime equipment or goals change.

The wedge is simple: finish I-Day, log one real Train session this week, and let Today show what comes next. Mission Coach builds weekly plans from those logs alone — no wearable required. Other pillars are there when you want them; they are not homework before your first set.`,
        practiceCTA: { label: 'Open Today', href: '/log' },
        relatedLearnPathId: 'mindset-habits',
        sourceRef: 'foundations — onboarding & purpose',
        checklist: {
          title: 'First-week actions',
          items: [
            'Finish I-Day profile (level, equipment, goals)',
            'Log one Train session — even a short one',
            'Open Today after you log — see the next session cue',
            'Revisit Welcome with ?edit=1 if equipment or goals change',
          ],
        },
        figure: {
          src: '/learn/first-session.webp',
          alt: 'Three steps: gear, session, log set',
          caption: 'Gear-matched session — then log the work',
        },
      },
      {
        id: 'ch4-s2',
        title: 'The Six Pillars',
        summary:
          'Train logging plus Mission Coach is the wedge. The other pillars support when you are ready — not a week-one chore list.',
        body: `**Train** — log sets offline; follow a plan you can finish.

**Mission Coach** — weekly plans from your logs and fatigue signals — no wearable required.

The rest of the product supports that loop when you want depth:

**Fuel** — macros, water, recipes.
**Move** — timed mobility flows.
**Mind** — breathing and short guided sessions.
**Track** — activities beyond the gym.
**Learn** — this guidebook and quick education paths.

Each pillar can still log a win on Today. That is optional breadth — not a requirement before you earn a Coach week. Start with one honest Train session.`,
        practiceCTA: { label: 'Start a workout', href: '/active' },
        relatedLearnPathId: 'mindset-habits',
        sourceRef: 'MW product design',
        table: {
          caption: 'Six pillars — quick reference',
          headers: ['Pillar', 'What you do', 'Route'],
          rows: [
            ['Train', 'Log sets; open Mission Coach from logs', '/active'],
            ['Fuel', 'Macros, water, recipes', '/nutrition'],
            ['Move', 'Timed mobility flows', '/move'],
            ['Mind', 'Breathing and short sessions', '/mind'],
            ['Track', 'Runs, walks, activities', '/track'],
            ['Learn', 'Guidebook and quick paths', '/learn'],
          ],
        },
        figure: {
          src: '/learn/six-pillars.webp',
          alt: 'Six pillar cards: Train, Fuel, Move, Mind, Track, Learn',
          caption: 'Log Train first — breadth when you are ready',
        },
      },
      {
        id: 'ch4-s3',
        title: 'Win Score & Offline Use',
        summary:
          'Mission Score rewards showing up. Offline logging feeds Mission Coach — install the PWA when you can.',
        body: `Win Score (Mission Score) is a holistic consistency metric — not a medical readiness grade. It rewards showing up over time more than one hero session.

Install from your browser (Add to Home Screen) for offline logging at the park or garage gym. Sync when you sign in on Profile. Those logs are what Mission Coach reads when it builds your next week.

Beta testers: see /beta for the start guide and feedback channels.`,
        practiceCTA: { label: 'Open Today', href: '/log' },
        relatedLearnPathId: 'home-gym-budget',
        sourceRef: 'MW product design',
        callout: {
          title: 'Score is feedback',
          body: 'Win Score is feedback on consistency — not a grade. Use it to notice gaps, not to punish a quiet week. Keep logging; Coach plans from what you actually did.',
        },
        figure: {
          src: '/learn/win-score-offline.webp',
          alt: 'Win Score circle linked to offline install and log',
          caption: 'Install · log offline · sync when signed in',
        },
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
    heroImage: {
      src: '/learn/nutrition-recovery-hero.webp',
      alt: 'Calm recovery atmosphere with emerald and brass accents',
      caption: 'Recovery is part of training',
    },
    sections: [
      {
        id: 'ch5-s1',
        title: 'Macros Without Obsession',
        summary:
          'Protein, carbohydrates, and fats each play a role. Track enough to learn, not enough to dread meals.',
        body: `**Protein:** Roughly 1.6–2.2 g/kg bodyweight for most active people building or retaining muscle. Spread it across meals when you can.

**Carbs:** Fuel hard training and recovery; timing matters more for competitive athletes than for general fitness.

**Fats:** Essential for hormones and satiety — do not zero them out chasing low numbers.

Log a typical day on Fuel. Free recipes cover the basics; premium adds meal-prep depth when you want it.`,
        practiceCTA: { label: 'Open Fuel log', href: '/nutrition' },
        relatedLearnPathId: 'nutrition-101',
        sourceRef: 'nutrition science — macros',
        callout: {
          title: 'Priority order',
          body: 'Hit protein first, then overall calories, then carbs around hard training. Fats fill the rest — do not zero them out.',
        },
        figure: {
          src: '/learn/protein-briefing.webp',
          alt: 'Protein as a simple daily habit linked to repair and satiety',
          caption: 'Protein first — a daily habit, not a religion',
        },
      },
      {
        id: 'ch5-s2',
        title: 'Hydration & Sleep',
        summary:
          'Water and sleep move the needle more than most supplements.',
        body: `Dehydration cuts performance and recovery. Drink steadily through the day, and a bit more around training.

Sleep is when recovery hormones and motor learning consolidate — including today's lifts. Chronic five-hour nights undermine every program, no matter how good the spreadsheet looks.

Mind includes wind-down sessions; Move includes recovery flows. Use them on rest days instead of another grind session.`,
        practiceCTA: { label: 'Try a recovery flow', href: '/move' },
        relatedExerciseIds: ['bird-dog', 'plank', 'glute-bridge'],
        relatedLearnPathId: 'sleep-recovery',
        sourceRef: 'foundations — hydration & sleep',
        figure: {
          src: '/form-guides/plank.svg',
          alt: 'Plank hold form diagram',
          caption: 'Easy movement and holds count as recovery work',
        },
        checklist: {
          title: 'Recovery basics',
          items: [
            'Drink steadily through the day; extra around training',
            'Aim for 7–9 hours sleep when life allows',
            'Use Move recovery flows or Mind wind-downs on rest days',
            'Treat chronic short sleep as a programming problem, not a willpower test',
          ],
        },
      },
      {
        id: 'ch5-s3',
        title: 'Meal Timing & Consistency',
        summary:
          'Total daily intake matters most; timing is a tiebreaker for advanced athletes.',
        body: `For most users, hitting protein and calories across the day beats obsessing over a narrow "anabolic window."

Pre-workout: easily digested carbs plus protein if training fully fasted feels bad.

Post-workout: protein and carbs within a few hours supports recovery — not a minute-by-minute emergency.

Use Fuel recipes to pre-fill macros when planning is hard. Weekly challenges can nudge protein-day streaks.`,
        practiceCTA: { label: 'Browse recipes', href: '/nutrition' },
        relatedLearnPathId: 'nutrition-101',
        sourceRef: 'foundations — meal timing',
        figure: {
          src: '/learn/meal-timing.webp',
          alt: 'Day timeline with train and protein anchors',
          caption: 'Consistency beats perfect timing',
        },
        checklist: {
          title: 'Around-workout habits',
          items: [
            'Hit daily protein and calories first — timing is a tiebreaker',
            'If fasted training feels bad, add easy carbs + protein beforehand',
            'Eat protein and carbs within a few hours after hard sessions',
            'Use Fuel recipes to pre-fill macros when planning is hard',
          ],
        },
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
    heroImage: {
      src: '/learn/assessments-progress-hero.webp',
      alt: 'Abstract readiness and progress telemetry rings',
      caption: 'Measure to adjust — not to shame',
    },
    sections: [
      {
        id: 'ch6-s1',
        title: 'PAR-Q & Health Screening',
        summary:
          'Know when to seek medical clearance before pushing intensity.',
        body: `The Physical Activity Readiness Questionnaire (PAR-Q) flags cardiovascular, joint, and metabolic risk flags. A "yes" does not mean never train — it means talk to a qualified professional before you load intensity.

Complete the in-app health screen honestly. Mission Winning is a civilian fitness tool, not medical advice.

Assessments save a summary to your log for your own reference — share with your doctor or coach if useful.`,
        practiceCTA: { label: 'Complete PAR-Q', href: '/assessments' },
        relatedLearnPathId: 'assessments-path',
        sourceRef: 'PAR-Q screening',
        callout: {
          title: 'Screen before you load',
          body: 'A yes on the readiness screen means get clearance — not never train. Honesty here protects intensity later.',
        },
        figure: {
          src: '/learn/parq-screen.webp',
          alt: 'PAR-Q screening card leading to medical clearance when needed',
          caption: 'Yes means get clearance — not never train',
        },
      },
      {
        id: 'ch6-s2',
        title: 'Benchmarks & Tests',
        summary:
          'Push-ups, pull-ups, and strength standards give objective checkpoints beyond the mirror.',
        body: `Benchmark tests belong every few weeks — not every session. They answer a simple question: is training transferring to performance?

Use Readiness tests and history trends together. One bad day is noise; four weeks flat is signal.

Leaderboards add optional social motivation. Squad codes let friends compare without posting publicly.`,
        practiceCTA: { label: 'Open benchmarks', href: '/benchmarks' },
        relatedLearnPathId: 'assessments-path',
        relatedExerciseIds: ['push-ups', 'pull-ups', 'squats'],
        sourceRef: 'foundations — assessments',
        figure: {
          src: '/learn/retest-cadence.webp',
          alt: 'Timeline of baseline, train, retest, and train again',
          caption: 'Retest every 3–4 weeks — same conditions, honest score',
        },
        table: {
          caption: 'What to retest and when',
          headers: ['Check', 'Cadence', 'Signal'],
          rows: [
            ['Bodyweight benchmarks', 'Every 3–4 weeks', 'Rep PRs or clean form at same reps'],
            ['Key lift e1RM / heavy set', 'Every 4–6 weeks', 'Load up with solid RPE 8–9'],
            ['Readiness trend', 'Weekly glance', 'Multi-day downtrend → deload cue'],
            ['One bad session', 'Ignore as noise', 'Do not rewrite the whole plan'],
          ],
        },
      },
      {
        id: 'ch6-s3',
        title: 'When to Adjust the Plan',
        summary:
          'Stall, pain, or life stress each call for different fixes — not always "push harder."',
        body: `**Stall:** Add volume or intensity on one lift at a time, or deload and rebuild.

**Pain:** Sharp or joint pain — stop the aggravating movement and seek qualified help. Dull muscle soreness after hard work is different.

**Life stress:** Keep the habit with lower-RPE sessions; consistency beats hero weeks you cannot recover from.

History and Win Score trends on Today help you decide. This guidebook is the reference; your log is the truth.`,
        practiceCTA: { label: 'View workout history', href: '/history' },
        relatedExerciseIds: ['squats', 'push-ups', 'deadlift'],
        relatedLearnPathId: 'assessments-path',
        sourceRef: 'foundations — program adjustment',
        callout: {
          title: 'Stall vs pain vs stress',
          body: 'Stall → progress one lift or deload. Sharp joint pain → stop and refer out. Life stress → keep the habit at lower RPE. Do not treat every bad week as a cue to push harder.',
        },
        figure: {
          src: '/learn/adjust-plan.webp',
          alt: 'Three cards for stall, pain, and stress adjustments',
          caption: 'Different signals need different fixes',
        },
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
