/**
 * Public Learn vs-pages (AEO explanation). Not magazine chapters.
 * Original Mission Winning wording — not competitor help text.
 * Frozen plan: docs/LEARN_VS_PAGES_PLAN.md
 */

import type { GuideChecklist, GuideTable } from '@/data/guidebook/types';

export const LEARN_VS_PAGE_IDS = [
  'mission-winning-vs-strong',
  'mission-winning-vs-hevy',
  'mission-winning-vs-fitbod',
] as const;

export type LearnVsPageId = (typeof LEARN_VS_PAGE_IDS)[number];

/** Honest CSV row — import is live on master; Strong/Hevy export dialects are not. */
export const LEARN_VS_CSV_CELL =
  'Import of Strong/Hevy CSV is live. Export in those dialects is planned (not on this build). JSON device backup is live.';

export type LearnVsSection = {
  id: string;
  title: string;
  summary: string;
  body: string;
  table?: GuideTable;
  callout?: { title: string; body: string };
  checklist?: GuideChecklist;
};

export type LearnVsPage = {
  id: LearnVsPageId;
  competitor: 'Strong' | 'Hevy' | 'Fitbod';
  title: string;
  subtitle: string;
  /** 40–60 word lead for citation + meta description. */
  lead: string;
  sections: LearnVsSection[];
};

const CSV_ROW = ['CSV in / out (Strong & Hevy)', LEARN_VS_CSV_CELL] as const;

function csvRowFor(competitorCell: string): [string, string, string] {
  return [CSV_ROW[0], competitorCell, CSV_ROW[1]];
}

export const LEARN_VS_PAGES: LearnVsPage[] = [
  {
    id: 'mission-winning-vs-strong',
    competitor: 'Strong',
    title: 'Mission Winning vs Strong',
    subtitle: 'Gym logger craft versus a free offline diary that plans from logs',
    lead: 'Strong is a gym logger people keep because the set row is fast. Mission Winning is a free forever offline logger with no account, plus Mission Coach weeks built from those logs — no wearable. This page is a comparison, not a ranking. Stay on Strong if the logger is all you want and the three free templates are enough.',
    sections: [
      {
        id: 'vs-strong-table',
        title: 'Comparison table',
        summary:
          'Facts that matter to a train-anywhere lifter. Strong’s free tier is three templates, not locked logs.',
        body: 'Read the table as a map, not a score. Strong wins logger polish. Mission Winning wins a diary you can keep without an account, plus a week planned from that diary.',
        table: {
          caption: 'Mission Winning vs Strong',
          headers: ['Topic', 'Strong', 'Mission Winning'],
          rows: [
            [
              'Free tier',
              'Logging stays free. The free limit is three templates — logs are not locked.',
              'Logger is free forever and never for sale. Super Bundle is the only paid SKU (depth, not the log).',
            ],
            [
              'Account to start',
              'Signed-in gym app; iOS can keep a local log.',
              'No account required to log a set.',
            ],
            [
              'Offline logging',
              'Works as a phone logger when you already have the app.',
              'Designed to log in a park, garage, or hotel gym with no signal.',
            ],
            [
              'Wearable required',
              'Not a wearable coach. Logger-first.',
              'No wearable required. Coach reads sets you typed.',
            ],
            [
              'Coach / plan model',
              'You build routines. Strong is not a weekly coach from logs.',
              'Mission Coach writes the week from your logs. Skip Coach and the logger still works.',
            ],
            [
              'Social feed',
              'Not a social network. The product is the log.',
              'No in-app Feed. Share-out cards only, if you want them.',
            ],
            [
              'Bodyweight / park',
              'Gym-strength culture; works anywhere you can log a set.',
              'Train-anywhere default: home, park, garage, minimal kit.',
            ],
            csvRowFor('Export a CSV from Strong to leave. Mission Winning can import that file today.'),
          ],
        },
        callout: {
          title: 'Do not mix the free limits',
          body: 'Strong’s free cap is templates (three), not your history. If someone told you Strong locks logs, that is wrong.',
        },
      },
      {
        id: 'vs-strong-wins',
        title: 'Where Strong wins',
        summary: 'Name the craft. Do not pretend we beat the set row on every tap.',
        body: `Strong is the gym-logger people recommend when the job is “put the last set back on the screen.” The row is dense, previous numbers sit close, and the culture is barbell rooms rather than feeds.

If you already live in Strong and the three free templates cover your week, switching for a slogan is a waste. Stay. A comparison page that cannot say that is a praise page.

Mission Winning does not claim to be faster than Strong. Speed is a founder phone score, not a citation.`,
      },
      {
        id: 'vs-strong-differs',
        title: 'Where Mission Winning differs',
        summary: 'Offline diary, no account wall, Coach from logs — not a better Strong clone.',
        body: `Train Anywhere. Win Daily. The wedge is a logger that works with the radio off, and a Coach that will not start until it has your sets.

You do not need a watch. You do not need an account to record a set. The logger is not a trial and it is not a pillar SKU.

CSV: drop a Strong export on Profile and history rebuilds here. Exporting back out as Strong CSV is planned — it is not on this build. JSON backup of this device is live.

What we are not: an in-app Feed, a wearable hub, or an everything-app.`,
        checklist: {
          title: 'Mission Winning on purpose',
          items: [
            'Log a set offline with no account',
            'Let Mission Coach read those logs when you want a week',
            'Leave later: import is live; Strong-dialect export is planned',
          ],
        },
      },
      {
        id: 'vs-strong-pick',
        title: 'Who should pick what',
        summary: 'Stay on Strong if the log is the whole job. Come here if the week should follow the log.',
        body: `Stay on Strong if you want the fastest gym row, you are happy with three free templates, and you do not want a coach that rewrites the week from fatigue.

Pick Mission Winning if you train in places with bad wifi, you refuse another account wall to start, and you want the next week explained from sets you already did — not from a strap.

Trying the logger does not require leaving Strong forever. Import the CSV when you are ready. Do not delete a diary you trust until the new one has a week of your own numbers.`,
      },
    ],
  },
  {
    id: 'mission-winning-vs-hevy',
    competitor: 'Hevy',
    title: 'Mission Winning vs Hevy',
    subtitle: 'Free social logger versus an offline diary that plans from your sets',
    lead: 'Hevy pairs a workout log with a free social feed. Mission Winning does not compete on in-app social: it is a free forever offline logger (no account) and a Coach that writes the week from your own sets, with no wearable. Use this comparison to decide whether you want a feed or a diary that plans.',
    sections: [
      {
        id: 'vs-hevy-table',
        title: 'Comparison table',
        summary: 'Hevy’s social layer is free. Mission Winning has no in-app Feed.',
        body: 'If the feed is why you open the app, Hevy already won that job. If the job is a private log that still produces a week, that is the Mission Winning lane.',
        table: {
          caption: 'Mission Winning vs Hevy',
          headers: ['Topic', 'Hevy', 'Mission Winning'],
          rows: [
            [
              'Free tier',
              'Social is free. You can log and watch friends without paying for the feed.',
              'Logger is free forever. Super Bundle is the only paid SKU — it never gates the log.',
            ],
            [
              'Account to start',
              'Signed-in app built around a profile and feed.',
              'No account required to log a set.',
            ],
            [
              'Offline logging',
              'Phone logger when the app is installed.',
              'Offline is the default promise: park, garage, travel gym.',
            ],
            [
              'Wearable required',
              'Not a watch-first coach.',
              'No wearable required. Plans come from logged sets.',
            ],
            [
              'Coach / plan model',
              'Routines and social proof. Not Mission Coach from your load history.',
              'Mission Coach builds a week from logs you already typed.',
            ],
            [
              'Social feed',
              'Social is free. That is the product loop for many athletes.',
              'No in-app Feed. Share a card out if you want; nothing ranks your friends here.',
            ],
            [
              'Bodyweight / park',
              'Works anywhere you can log; culture leans gym + friends.',
              'Train-anywhere default. The diary does not need an audience.',
            ],
            csvRowFor('Export a CSV from Hevy to leave. Mission Winning can import that file today.'),
          ],
        },
        callout: {
          title: 'Social is free on Hevy',
          body: 'Do not write “Hevy hides the feed behind pay.” The feed is free. Mission Winning simply does not sell a feed.',
        },
      },
      {
        id: 'vs-hevy-wins',
        title: 'Where Hevy wins',
        summary: 'A free feed is a real reason to stay.',
        body: `Hevy is easy to open because someone you know lifted this morning. That loop is not a bug. If you train because the feed is watching, Mission Winning will feel quiet — on purpose.

We will not merchandise an in-app community to “beat” that. Share-out is a card you send. It is not a wall of other people’s PRs.

Stay on Hevy if the social log is the habit, and you are not asking a coach to rewrite next week from strain.`,
      },
      {
        id: 'vs-hevy-differs',
        title: 'Where Mission Winning differs',
        summary: 'A diary that plans. Not a quieter Hevy.',
        body: `Train Anywhere. Win Daily. Log without an account. Log when the cell tower gives up. When you want a week, Mission Coach cites the sets you logged — not a wearable, not a friend list.

CSV import from Hevy is live on Profile. Exporting history back out as Hevy CSV is planned and is not on this build. Keep a JSON backup of this device if you care about leaving.

The logger is never for sale. A feed is not the growth loop.`,
        checklist: {
          title: 'Mission Winning on purpose',
          items: [
            'Private log first — no Feed to scroll before a set',
            'Coach from your logs when you ask for a week',
            'Bring a Hevy CSV in; Hevy-dialect export is still planned',
          ],
        },
      },
      {
        id: 'vs-hevy-pick',
        title: 'Who should pick what',
        summary: 'Pick the feed, or pick the diary. They are different jobs.',
        body: `Stay on Hevy if you want a free social layer, you like watching friends’ sessions, and a weekly coach from load math is not the point.

Pick Mission Winning if you want the log to survive a dead radio, you do not want to create an account to start, and you want next week to come from your own sets.

You can import a Hevy CSV rather than re-typing years. Do not treat this page as a demand to abandon friends who lift.`,
      },
    ],
  },
  {
    id: 'mission-winning-vs-fitbod',
    competitor: 'Fitbod',
    title: 'Mission Winning vs Fitbod',
    subtitle: 'Paid day-of AI programming versus a free logger whose Coach reads your diary',
    lead: 'Fitbod generates day-of workouts after a seven-day trial, then a paid AI programmer. Mission Winning never sells the logger: log offline with no account, and Mission Coach builds the week from those logs without a watch. Stay on Fitbod if you want a generated session every gym visit and will pay after the trial.',
    sections: [
      {
        id: 'vs-fitbod-table',
        title: 'Comparison table',
        summary: 'Fitbod’s open door is a seven-day trial, not a three-workout lock.',
        body: 'Both products will write a session for you. The difference is the gate and the evidence: Fitbod’s programmer after a trial, versus a free logger whose Coach only speaks from sets you logged.',
        table: {
          caption: 'Mission Winning vs Fitbod',
          headers: ['Topic', 'Fitbod', 'Mission Winning'],
          rows: [
            [
              'Free tier',
              'Seven-day trial, then paid AI programming. Not a three-workout lock.',
              'Logger is free forever — never a trial SKU. Super Bundle is the only paid SKU (Coach depth and other pillars, not the log).',
            ],
            [
              'Account to start',
              'Onboarding into a generated plan, then the trial clock.',
              'No account required to log a set. Coach is optional.',
            ],
            [
              'Offline logging',
              'Phone app; the product is the generated session.',
              'Offline logging is the wedge. Plans can wait; the set cannot.',
            ],
            [
              'Wearable required',
              'Convenience programmer. Not sold here as a strap requirement.',
              'No wearable required. A watch is optional later, never the gate to a week.',
            ],
            [
              'Coach / plan model',
              'Day-of AI programming from the app’s model after the trial.',
              'Mission Coach from your logs. Why-this-week cites those logs.',
            ],
            [
              'Social feed',
              'Not the Hevy-style feed product.',
              'No in-app Feed.',
            ],
            [
              'Bodyweight / park',
              'Equipment-aware generated sessions (gym-friendly convenience).',
              'Train-anywhere: bodyweight and minimal kit are first-class, not an afterthought.',
            ],
            csvRowFor(
              'Fitbod is not the Strong/Hevy CSV path. Bring Strong or Hevy history in if you have it.'
            ),
          ],
        },
        callout: {
          title: 'Trial, not a three-workout lock',
          body: 'Fitbod’s open window is a seven-day trial. Claiming “three workouts then lock” is false. Do not repeat it.',
        },
      },
      {
        id: 'vs-fitbod-wins',
        title: 'Where Fitbod wins',
        summary: 'A generated session today, if you will pay after the trial.',
        body: `Fitbod is convenient when you walk into a gym and want the app to pick the work. That is a real job. After the seven-day trial, you are buying that programmer.

If black-box picks bother you, that is a Fitbod complaint we will not turn into a dunk. Mission Coach shows why the week moved from your logs. Different contract.

Stay on Fitbod if you want a new session generated for you every visit and the trial-then-pay shape is acceptable.`,
      },
      {
        id: 'vs-fitbod-differs',
        title: 'Where Mission Winning differs',
        summary: 'The logger stays free. The Coach waits for evidence.',
        body: `Train Anywhere. Win Daily. You can log forever without buying a programmer. Mission Coach is a weekly plan from the diary, not a wearable, and not a lock after three sessions.

We do not sell the logger. We do not invent a Fitbod paywall that is not the seven-day trial.

CSV: Strong and Hevy files import today. Export in those dialects is planned, not on this build. JSON backup is live.`,
        checklist: {
          title: 'Mission Winning on purpose',
          items: [
            'Free logger with no trial clock on the set',
            'Coach from logs, with a visible why, when you generate a week',
            'No wearable gate',
          ],
        },
      },
      {
        id: 'vs-fitbod-pick',
        title: 'Who should pick what',
        summary: 'Pay for a generated gym session, or keep a free diary that can plan.',
        body: `Stay on Fitbod if you like a generated workout for today’s floor and you will pay after the seven-day trial.

Pick Mission Winning if you want the log to stay free, you train without a watch, and you want the week to follow sets you actually did.

You can use the logger and ignore Coach. That is allowed. The comparison is not “buy Super Bundle to match Fitbod.” The logger is not for sale.`,
      },
    ],
  },
];

export function learnVsPublicHref(id: LearnVsPageId): string {
  return `/guide/${id}`;
}

export function getLearnVsPage(id: string): LearnVsPage | null {
  return LEARN_VS_PAGES.find((p) => p.id === id) ?? null;
}

export function requireLearnVsPage(id: LearnVsPageId): LearnVsPage {
  const page = getLearnVsPage(id);
  if (!page) throw new Error(`learn vs catalog missing ${id}`);
  return page;
}
