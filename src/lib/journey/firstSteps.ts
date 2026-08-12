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
 * Order is by what actually helps first, not by pillar hierarchy: first log,
 * **second log (week-1 habit)**, then optional pillars, then the health screen.
 * `.291` inserted session 2 so Fuel is no longer the default next after one set.
 * F-004: pillar + PAR-Q rows stay off the list until `b.workout` — progressive
 * disclosure so I-Day / early Basic is not a six-item options wall (C5≤90s).
 */

import type { JourneyState } from '@/lib/missionJourney';
import { week1SecondSessionDone } from '@/lib/activation/week1SecondSession';

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

export type GetFirstStepsOpts = {
  /**
   * `workoutHistory.length`. Required for the week-1 second-session step (`.291`).
   * When omitted after a first workout, the step still appears and stays open
   * until a caller passes a real count ≥ 2.
   */
  completedSessions?: number;
};

export function getFirstSteps(state: JourneyState, opts?: GetFirstStepsOpts): FirstStep[] {
  const b = state.basic;
  const sessions =
    typeof opts?.completedSessions === 'number'
      ? opts.completedSessions
      : b.workout
        ? 1
        : 0;

  const steps: FirstStep[] = [
    {
      key: 'workout',
      done: b.workout,
      href: '/active',
      titleKey: 'firstStepWorkoutTitle',
      title: 'Log your first workout',
      whyKey: 'firstStepWorkoutWhy',
      why: 'One logged set is all Mission Coach needs to start building your week.',
    },
  ];

  // F-004 / C5≤90s: before the first log, the checklist is *only* that log —
  // Fuel/Mind/Move/Learn/PAR-Q were an options wall that competed with Train.
  // Progressive disclosure: pillar discovery returns after `b.workout` (same
  // signal as `allBasicDone` / Basic Training). Still never a gate.
  if (!b.workout) return steps;

  // Week-1 activation: second train before Fuel/Mind tourism (Horizon W).
  steps.push({
    key: 'session2',
    done: week1SecondSessionDone(sessions),
    href: '/active',
    titleKey: 'firstStepSession2Title',
    title: 'Log a second session',
    whyKey: 'firstStepSession2Why',
    why: 'Two sessions in week one locks the habit. Coach builds from the logs — not every pillar at once.',
  });

  steps.push(
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
    }
  );

  return steps;
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
