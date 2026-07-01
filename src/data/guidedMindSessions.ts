export type GuidedMindStep = {
  text: string;
  durationSec: number;
};

export type GuidedMindSession = {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  steps: GuidedMindStep[];
};

/** Free guided mind sessions — text + timed steps (no audio CDN required). */
export const GUIDED_MIND_SESSIONS: GuidedMindSession[] = [
  {
    id: 'pre-workout-focus',
    title: 'Pre-workout focus',
    subtitle: '2 min — clear noise, commit to the set',
    minutes: 2,
    steps: [
      { text: 'Stand or sit tall. Unclench your jaw and drop your shoulders.', durationSec: 20 },
      { text: 'Three slow breaths — in through the nose, out through the mouth.', durationSec: 30 },
      { text: 'Name one intention for this session (strength, form, or consistency).', durationSec: 25 },
      { text: 'Visualize your first exercise — smooth reps, full control.', durationSec: 25 },
      { text: 'Go. The path is built one set at a time.', durationSec: 20 },
    ],
  },
  {
    id: 'post-training-downshift',
    title: 'Post-training downshift',
    subtitle: '3 min — shift from strain to recovery',
    minutes: 3,
    steps: [
      { text: 'Notice your heartbeat slowing. You did the work.', durationSec: 25 },
      { text: 'Scan from head to toe — release anything still tight.', durationSec: 40 },
      { text: 'Breathe into the belly. Longer exhale than inhale.', durationSec: 45 },
      { text: 'Hydrate and protein within the next hour fuel the mission.', durationSec: 30 },
      { text: 'Carry this calm into the rest of your day.', durationSec: 20 },
    ],
  },
  {
    id: 'sleep-wind-down',
    title: 'Sleep wind-down',
    subtitle: '4 min — quiet mind before rest',
    minutes: 4,
    steps: [
      { text: 'Dim screens if you can. Lie down or recline comfortably.', durationSec: 25 },
      { text: 'Count breaths backward from 10 to 1 — restart if you drift.', durationSec: 60 },
      { text: 'Let tomorrow’s training wait. Tonight is for repair.', durationSec: 40 },
      { text: 'Gratitude: one thing your body did well today.', durationSec: 35 },
      { text: 'Soft belly, slow breath. Allow sleep to arrive.', durationSec: 60 },
    ],
  },
];
