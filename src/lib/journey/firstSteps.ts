/**
 * The first-steps checklist — what a new athlete has and has not tried yet.
 *
 * **This changes nothing about what the app requires.** Horizon W narrowed Basic
 * Training to *"first workout only — other pillars stay free, not gated chores"*,
 * and `.223` cost a launch gate because `allBasicDone` meant two things in two
 * files. So: [`basicComplete.ts`](./basicComplete.ts) stays the one definition
 * of *complete*, it stays `b.workout`, and nothing here is consulted by it.
 * This module answers a different question — *what is there to discover* — and
 * the honest answer includes the four pillars that are deliberately not gates.
 *
 * Every step is **already detected**. `detectBasicMilestones` has computed all
 * five of these since the journey engine shipped, and `detectReadinessMilestones`
 * computes the health screen; four of the six then displayed nowhere, because
 * `BASIC_STEPS` is a one-element array and the stepper reads "Step 1 of 1"
 * forever. Nothing new is measured here and no new state is written — a
 * checklist that invents its own progress is a second source of truth for how
 * far along someone is (`.178`).
 *
 * Order is by what actually helps first, not by pillar hierarchy: log something,
 * then eat for it, then the screen that decides how hard the app may push you.
 */

import type { JourneyState } from '@/lib/missionJourney';

export interface FirstStep {
  key: string;
  /** Done is read, never written — the pillars themselves record it. */
  done: boolean;
  /** Where the step is completed. */
  href: string;
  /** English source copy; the card passes these through `t()` with the key below. */
  title: string;
  /** One line of *why*, which is the part a bare checklist leaves out. */
  why: string;
  /** i18n keys, colocated so the card never invents them. */
  titleKey: string;
  whyKey: string;
}

export function getFirstSteps(state: JourneyState): FirstStep[] {
  const b = state.basic;
  return [
    {
      key: 'workout',
      done: b.workout,
      href: '/active',
      titleKey: 'firstStepWorkoutTitle',
      title: 'Log your first workout',
      whyKey: 'firstStepWorkoutWhy',
      why: 'One logged set is all Mission Coach needs to start building your week.',
    },
    {
      key: 'fuel',
      done: b.fuel,
      href: '/nutrition',
      titleKey: 'firstStepFuelTitle',
      title: 'Log what you ate',
      whyKey: 'firstStepFuelWhy',
      why: 'Protein is the one number worth watching early. Nothing else is required.',
    },
    {
      key: 'mind',
      done: b.mind,
      href: '/mind',
      titleKey: 'firstStepMindTitle',
      title: 'Take one check-in',
      whyKey: 'firstStepMindWhy',
      why: 'How rested you feel changes what the coach asks of you tomorrow.',
    },
    {
      key: 'move',
      done: b.move,
      href: '/move',
      titleKey: 'firstStepMoveTitle',
      title: 'Try a mobility flow',
      whyKey: 'firstStepMoveWhy',
      why: 'Five minutes on the days you do not train is what keeps the streak reachable.',
    },
    {
      key: 'learn',
      done: b.learn,
      href: '/learn',
      titleKey: 'firstStepLearnTitle',
      title: 'Read one guide',
      whyKey: 'firstStepLearnWhy',
      why: 'Knowing why a session is built the way it is makes it easier to keep going.',
    },
    {
      key: 'parq',
      done: state.readiness.parq,
      href: '/assessments',
      titleKey: 'firstStepParqTitle',
      title: 'Complete the health screen',
      whyKey: 'firstStepParqWhy',
      why: 'A short safety questionnaire. It is the one step the app does ask for before pushing harder.',
    },
  ];
}

export interface FirstStepsProgress {
  done: number;
  total: number;
  /** The next undone step, or null when every step is done. */
  next: FirstStep | null;
  complete: boolean;
}

export function summarizeFirstSteps(steps: FirstStep[]): FirstStepsProgress {
  const done = steps.filter((s) => s.done).length;
  return {
    done,
    total: steps.length,
    next: steps.find((s) => !s.done) ?? null,
    complete: done === steps.length,
  };
}
