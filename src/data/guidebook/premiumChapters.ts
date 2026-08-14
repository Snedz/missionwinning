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
        practiceCTA: { label: 'Today', href: '/log' },
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
        body: `Aim for pale-yellow urine on training days. In heat or long sessions, add sodium via food or an electrolyte mix — not only plain water. Track glasses on Fuel so Mission Score hydration stays honest.

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
  {
    id: 'one-week-sequence',
    number: 11,
    title: 'One Week, One Sequence',
    subtitle: 'Train, then Coach, then Fuel / Move / Mind — the same week, not six apps',
    icon: '📅',
    sections: [
      {
        id: 'pch11-s1',
        diataxis: 'tutorial',
        title: 'Tutorial — Log the session you actually did',
        summary:
          'The diary is the product. A set on this phone beats a perfect program in another app.',
        body: `Open Train and log the session you actually did — not the one a PDF promised, not the one a wearable inferred. Weight and reps, or bodyweight and quality. A note if a set felt ugly. That is the whole first move.

You do not need an account for this. You do not need a watch. The logger works offline on this phone. If the gym Wi-Fi dies mid-set, the set still happened; it lives on the device until you next have a connection.

A guidebook on a shelf cannot see this session. A standalone logger can store it and then shrug. Mission Winning stores it so the next step — the week — has something real to read.

Do one session before you touch Coach, Fuel, Move, or Mind. The sequence starts with a diary, not a dashboard.`,
        practiceCTA: { label: 'Open Train logger', href: '/active' },
        sourceRef: 'MW product — Super Bundle sequence',
        checklist: {
          title: 'First logged session',
          items: [
            'Open Train on this phone — no account required',
            'Enter the load and reps you actually did (bodyweight counts)',
            'Add a one-line note if a set broke down',
            'Skip any wearable. The log is the input',
          ],
        },
      },
      {
        id: 'pch11-s2',
        diataxis: 'tutorial',
        title: 'Tutorial — Generate the week from that diary',
        summary:
          'Mission Coach plans the next week from your logs. It does not import a second program.',
        body: `After a few logged sessions, open Mission Coach and generate the week. The plan is a prediction from what you already did: which patterns you hit, how hard the sets were, whether you showed up.

That is the difference from buying a coach app. Most coach products start from a questionnaire, a wearable, or a template they already sold you. This one starts from the diary you just wrote in Train.

Read the week. One next session should be obvious. If the rationale cites your logs, the loop is working. If you feel the urge to paste the week into another tracker, stop — that is how three products start fighting.

You can generate and adapt a week without Super Bundle. Bundle depth is voice, chat, and extra regenerations — not the right to have a week at all.`,
        practiceCTA: { label: 'Open Mission Coach', href: '/coach' },
        sourceRef: 'MW product — Super Bundle sequence',
      },
      {
        id: 'pch11-s3',
        diataxis: 'how-to',
        title: 'How-to — Fuel, Move, and Mind on this week',
        summary:
          'Support the sessions already on the week. Do not start a second nutrition app, a second mobility program, or a second mindfulness course.',
        body: `The week Coach just built is the calendar. Fuel, Move, and Mind hang off those sessions — they do not get their own competing plan.

**Fuel:** Eat for the sessions that are already there. Protein stays steady. Carbs rise on the hard lower or interval day sitting on this week, not on a meal-plan calendar from another app.

**Move:** Use a short flow before the squat or hinge session already scheduled — or an easy walk on the recovery day already scheduled. You are not "doing mobility" as a separate sport.

**Mind:** One breathing block before a hard session, or a wind-down on the night the week looks stacked. That is support, not a streak in a fifth app.

Today is the hub that shows the next Train action first. Open Fuel / Move / Mind from that week, then come back. If a pillar wants a twelve-week curriculum of its own, ignore it until this week's sessions are logged.`,
        practiceCTA: { label: 'Open Today', href: '/log' },
        sourceRef: 'MW product — Super Bundle sequence',
        table: {
          caption: 'Same-week support — not a second program',
          headers: ['Support', 'Do this', 'Where'],
          rows: [
            ['Fuel', 'Protein every day; extra carbs on the hard session already planned', 'Fuel'],
            ['Move', 'Short flow before the lift on this week, or easy work on the recovery day', 'Move'],
            ['Mind', 'One breath block before a hard session, or wind-down when the week is stacked', 'Mind'],
          ],
        },
      },
      {
        id: 'pch11-s4',
        diataxis: 'how-to',
        title: 'How-to — When the week breaks, adapt here',
        summary:
          'Missed a day, travelled, or slept badly — adapt the same week in Coach. Do not open another app for a fresh program.',
        body: `Weeks break. You miss Thursday. A session feels heavy for no heroic reason. You are in a hotel with a band.

Adapt inside Mission Coach. The engine already has this week's logs. A missed day is an input, not a character verdict. A high-strain week should shrink, not shame you into a deload PDF from somewhere else.

Do not export the week into a logger you already paid for. Do not screenshot Coach into Notes and start a parallel diary. The moment you keep two diaries, the next generate is lying — it cannot see the work you logged elsewhere.

If a lift hurts sharply, stop that pattern and use a regression in Train notes. Coach can only be honest if the diary is honest. Super Bundle does not replace a clinician; it keeps the week in one place while you decide.`,
        practiceCTA: { label: 'Open Mission Coach', href: '/coach' },
        sourceRef: 'MW product — Super Bundle sequence',
      },
    ],
  },
  {
    id: 'one-stack',
    number: 12,
    title: 'One Stack',
    subtitle: 'Why Super Bundle beats a guidebook + a logger + a coach app',
    icon: '📖',
    sections: [
      {
        id: 'pch12-s1',
        diataxis: 'explanation',
        title: 'Explanation — Three products, three diaries',
        summary:
          'A book, a logger, and a coach app each keep a different source of truth. You become the integration layer.',
        body: `People buy this stack with good taste: a serious guidebook, a fast logger (Strong or similar), and a coach app that promises the week. Each piece is fine. Together they fight.

The book cannot see what you lifted. The logger will not plan next Tuesday. The coach app wants its own onboarding, often a wearable, and a program that does not match the diary you kept in the logger. You copy numbers between them until you stop copying, and then every tool is slightly wrong.

Mission Winning's bet is rude and small: one diary. Train is the logger. Coach reads that diary. The guidebook (Learn) teaches the loop instead of sitting on a shelf. Super Bundle is not "more tabs." It is the same week with more depth on the supports.

If you keep a second logger "just in case," you have recreated the three-product problem inside one phone.`,
        practiceCTA: { label: 'Open Train logger', href: '/active' },
        sourceRef: 'MW product — Super Bundle sequence',
        callout: {
          title: 'Shared diary is the product',
          body: 'The week is only as honest as the log Coach can see. One diary on this phone beats a beautiful stack you have to glue together every Sunday.',
        },
      },
      {
        id: 'pch12-s2',
        diataxis: 'explanation',
        title: 'Explanation — One sequence, not six apps',
        summary:
          'Train, Fuel, Move, Mind, Track, and Learn are one week with supporting roles — not six products with six home screens.',
        body: `Six pillars on a nav bar look like six apps. That is the failure mode this course exists to kill.

The sequence is linear: log (Train) → week from logs (Coach, shown on Today) → eat / move / settle in ways that serve those sessions (Fuel, Move, Mind). Track is a spare diary for runs and walks, not a second coach. Learn is how you understand the loop, including these chapters.

Super Bundle unlocks depth on that sequence — more recipes, more flows, more sessions, specialist Learn, Coach voice and chat. It does not unlock a second identity. You are not "a Fuel user" on Tuesdays and "a Mind user" on Sundays. You are an athlete with one week.

If a screen asks you to pick a pillar before you have logged a session, skip it. The free intro already told you to log first. This course is the paid depth of the same advice.`,
        practiceCTA: { label: 'Open Today', href: '/log' },
        sourceRef: 'MW product — Super Bundle sequence',
      },
      {
        id: 'pch12-s3',
        diataxis: 'reference',
        title: 'Reference — What stays free',
        summary:
          'The wedge stays ungated: logger, weekly generate and adapt, six guidebook chapters, ten Learn paths.',
        body: `Super Bundle is depth on a free core. If a page implies you must pay to log a set, that page is wrong.

The free guidebook (Beyond the Basics) and the free Learn paths stay readable without an account. Getting Started and the programming chapters already teach log-then-plan. This course does not replace them; it does not hide them.

Weekly Mission Coach generate and adapt from your logs stay available. Bundle is extra regenerations, voice, and chat — not the existence of a week.

The logger is not a demo. A watch is optional, never an input. There is no "finish six pillars" scavenger hunt before the first set.`,
        practiceCTA: { label: 'Open free guidebook', href: '/learn/guide' },
        sourceRef: 'MW product — Super Bundle sequence',
        table: {
          caption: 'Free wedge vs Super Bundle depth on this sequence',
          headers: ['Piece', 'Stays free', 'Super Bundle depth'],
          rows: [
            ['Train logger', 'Sets, rest, history on this phone', 'Same logger — never gated'],
            ['Mission Coach week', 'Generate and adapt from logs', 'Voice, chat, extra regenerations'],
            ['Learn intro', '6 guidebook chapters + 10 paths', 'This sequence course + specialist chapters'],
            ['Fuel / Move / Mind', 'Core log, basic flows, basic sessions', 'Full libraries on the same week'],
          ],
        },
      },
      {
        id: 'pch12-s4',
        diataxis: 'reference',
        title: 'Reference — What Super Bundle adds on this sequence',
        summary:
          'Pay for depth on the week you already have — not a second program.',
        body: `Once the diary and the week exist, Super Bundle spends money where a book + Strong + a coach app would charge you three times:

Coach depth: talk through the week, hear why a session changed, regenerate when life actually changed — still from the same logs.

Fuel / Move / Mind depth: recipes, recovery flows, and guided sessions that attach to this week, not to a separate curriculum.

Learn depth: these two chapters plus the specialist courses (corrective, coaching practice, hypertrophy blocks, sports nutrition). Specialist chapters are optional later. The sequence is the reason to pay.

You still log in Train. You still generate in Coach. You still do not need a watch. If Super Bundle is off, the wedge remains; you are not locked out of the diary or the week.`,
        practiceCTA: { label: 'Open Mission Coach', href: '/coach' },
        sourceRef: 'MW product — Super Bundle sequence',
        checklist: {
          title: 'Bundle depth on the same week',
          items: [
            'Keep logging in Train — payment never gates a set',
            'Use Coach voice or chat on the week already generated from logs',
            'Pick Fuel / Move / Mind extras that match sessions on this week',
            'Read this course; leave specialist chapters until the loop is habitual',
          ],
        },
      },
    ],
  },
];
