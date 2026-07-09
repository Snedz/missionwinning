import 'server-only';
import type { GuideChapter } from './types';

/** Premium specialist guidebook chapters — server-only, gated via API. */
export const PREMIUM_GUIDEBOOK_CHAPTERS: GuideChapter[] = [
  {
    id: 'corrective-depth',
    number: 7,
    title: 'Corrective Exercise Depth',
    subtitle: 'Assess, correct, then load — specialist progression',
    icon: '🩹',
    quickPathId: 'corrective-foundations',
    sections: [
      {
        id: 'pch7-s1',
        title: 'Movement Screens Overview',
        summary: 'Static and dynamic screens reveal asymmetry before you add load.',
        body: `Overhead squat, single-leg balance, and gait observation highlight mobility and stability gaps. Document findings; retest after a corrective block.

Mission Winning Library filters help you swap aggravating patterns for regressions while you rebuild.`,
        practiceCTA: { label: 'Corrective quick path', href: '/learn' },
        sourceRef: 'corrective — screening',
      },
      {
        id: 'pch7-s2',
        title: 'Activation Before Integration',
        summary: 'Wake up inhibited muscles before compound lifts.',
        body: `Glute bridges, band walks, and scapular sets belong in warm-ups when screens show deficits. Short activation blocks (5 minutes) improve main lift quality.

Pair with Move flows tagged for hips or shoulders.`,
        practiceCTA: { label: 'Hip opener flow', href: '/move' },
        sourceRef: 'corrective — activation',
      },
      {
        id: 'pch7-s3',
        title: 'Regression Ladder',
        summary: 'When a pattern hurts, step down — never push through sharp joint pain.',
        body: `Build a three-rung ladder for each main lift: full pattern → partial range or assisted → isometric hold. Climb only when the lower rung is pain-free and controlled for a full week.

Log the regression you used in Active notes so Coach and History stay honest.`,
        practiceCTA: { label: 'Open Active logger', href: '/active' },
        sourceRef: 'corrective — regression',
      },
      {
        id: 'pch7-s4',
        title: 'Retest Cadence',
        summary: 'Screens without retests become folklore.',
        body: `Retest the same screen every 2–3 weeks under similar conditions (time of day, warm-up). Photograph or note scores. If nothing improves, change the corrective — do not add load.

Use Assessments for a readiness check when pain or fatigue clouds judgment.`,
        practiceCTA: { label: 'Assessments', href: '/assessments' },
        sourceRef: 'corrective — retest',
      },
    ],
  },
  {
    id: 'coaching-business',
    number: 8,
    title: 'Coaching Business Essentials',
    subtitle: 'Ethics, adherence, and sustainable client load',
    icon: '💼',
    quickPathId: 'coaching-client-success',
    sections: [
      {
        id: 'pch8-s1',
        title: 'Scope of Practice',
        summary: 'Trainers coach movement and habits; refer out for diagnosis and diet therapy where law requires.',
        body: `Stay inside your certification scope. PAR-Q positives, eating disorders, and acute pain warrant referral. Document consent and liability practices.

Mission Winning disclaimers on Terms and Privacy align with this boundary.`,
        practiceCTA: { label: 'Coaching interest', href: '/coaching' },
        sourceRef: 'foundations — scope',
      },
      {
        id: 'pch8-s2',
        title: 'Adherence Systems',
        summary: 'Clients succeed on systems, not motivation speeches.',
        body: `Weekly check-ins, minimum viable workouts on busy weeks, and pillar wins mirror what the app journey already teaches. Use Leaderboard squads for accountability groups.`,
        practiceCTA: { label: 'Leaderboard', href: '/leaderboard' },
        sourceRef: 'foundations — adherence',
      },
      {
        id: 'pch8-s3',
        title: 'Client Onboarding Script',
        summary: 'First session sets expectations for logging, recovery, and communication.',
        body: `Cover: goal in one sentence, equipment reality, injury history, and how they will log (app or paper). Agree on a minimum viable week before selling a maximal plan.

Point clients at Today’s single next action — not a twelve-tab dashboard.`,
        practiceCTA: { label: 'Today hub', href: '/log' },
        sourceRef: 'foundations — onboarding',
      },
      {
        id: 'pch8-s4',
        title: 'Sustainable Caseload',
        summary: 'Burned-out coaches deliver worse programs than busy ones who protect recovery.',
        body: `Cap active clients by hours of real coaching, not vanity headcount. Block admin time. Use templates and Mission Coach-style weekly plans so you are not reinventing every Monday.

Protect your own Mind and Move practice — model the path you sell.`,
        practiceCTA: { label: 'Mind recovery', href: '/mind' },
        sourceRef: 'foundations — caseload',
      },
    ],
  },
  {
    id: 'bodybuilding-periodization',
    number: 9,
    title: 'Bodybuilding Periodization',
    subtitle: 'Hypertrophy blocks, volume landmarks, and specialization',
    icon: '💪',
    sections: [
      {
        id: 'pch9-s1',
        title: 'Volume Landmarks',
        summary: 'Minimum effective volume vs maximum recoverable volume per muscle group.',
        body: `Start at the low end of effective sets per week; add sets only when progress stalls. Track performance in History — if loads fall for three sessions, pull volume back.

Premium pro templates include bodybuilding-friendly splits.`,
        practiceCTA: { label: 'Pro templates', href: '/builder' },
        sourceRef: 'hypertrophy science — volume',
      },
      {
        id: 'pch9-s2',
        title: 'Mesocycle Structure',
        summary: '3–6 week blocks with a planned deload beat random hard days.',
        body: `Accumulate volume for 3–5 weeks, then reduce sets ~40–50% for one week while keeping movement patterns. Mission Coach fatigue swaps when strain is high — use that signal instead of ego loading.

Fuel protein stays steady across the block; carbs rise on heavy lower days.`,
        practiceCTA: { label: 'Mission Coach', href: '/coach' },
        sourceRef: 'hypertrophy science — mesocycle',
      },
      {
        id: 'pch9-s3',
        title: 'Specialization Phases',
        summary: 'Bring up lagging groups without abandoning the whole physique.',
        body: `Pick one lagging region for 4–6 weeks. Add 4–8 weekly sets there; hold or slightly cut volume elsewhere. Keep compounds that support the specialty (e.g. rows for rear delts).

Photograph progress monthly under the same lighting — not daily mirror checks.`,
        practiceCTA: { label: 'History & charts', href: '/history' },
        sourceRef: 'hypertrophy science — specialization',
      },
      {
        id: 'pch9-s4',
        title: 'Exercise Selection Rules',
        summary: 'Stable joints and progressive overload beat novelty for hypertrophy.',
        body: `Prefer movements you can load for months. Rotate accessories when joints complain or progress stalls — not every week for entertainment. Library cues and form guides keep technique honest.

If a lift repeatedly fails form under fatigue, regress or swap before chasing PRs.`,
        practiceCTA: { label: 'Exercise library', href: '/library' },
        sourceRef: 'hypertrophy science — selection',
      },
    ],
  },
  {
    id: 'sports-nutrition-depth',
    number: 10,
    title: 'Sports Nutrition Depth',
    subtitle: 'Periodized fueling for training blocks',
    icon: '🍽️',
    sections: [
      {
        id: 'pch10-s1',
        title: 'Fuel for Training Blocks',
        summary: 'Match carbohydrate intake to hard session days.',
        body: `Higher carbs on leg and interval days; moderate on rest days. Protein stays steady. Use premium recipes for meal-prep batches aligned to your split.

Log water and macros together on heavy days.`,
        practiceCTA: { label: 'Premium recipes', href: '/nutrition' },
        sourceRef: 'nutrition science — periodization',
      },
      {
        id: 'pch10-s2',
        title: 'Pre- and Post-Session Timing',
        summary: 'Most athletes need simple timing, not perfect windows.',
        body: `Eat a familiar carb+protein meal 2–3 hours before hard training when possible. After training, prioritize protein and carbs within a few hours — not a stopwatch panic.

Fuel Coach adapts meal plans to training load when you are on Super Bundle.`,
        practiceCTA: { label: 'Fuel Coach', href: '/nutrition' },
        sourceRef: 'nutrition science — timing',
      },
      {
        id: 'pch10-s3',
        title: 'Hydration and Electrolytes',
        summary: 'Thirst lags; urine color and body weight still help.',
        body: `Aim for pale-yellow urine on training days. In heat or long sessions, add sodium via food or an electrolyte mix — not only plain water. Track glasses on Fuel so Win Score hydration stays honest.

Travel and altitude increase fluid needs — plan before the session, not mid-cramp.`,
        practiceCTA: { label: 'Log water on Fuel', href: '/nutrition' },
        sourceRef: 'nutrition science — hydration',
      },
      {
        id: 'pch10-s4',
        title: 'Competition Week Fueling',
        summary: 'Do not invent a new diet the week of a test.',
        body: `Practice race-day or test-day meals in training weeks. Keep fiber moderate the day before if GI distress is common. Sleep and sodium matter as much as macros.

Pair with a Mind pre-race calm session the night before.`,
        practiceCTA: { label: 'Mind sessions', href: '/mind' },
        sourceRef: 'nutrition science — competition',
      },
    ],
  },
];
