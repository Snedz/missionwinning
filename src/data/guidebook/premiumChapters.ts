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
    ],
  },
];
