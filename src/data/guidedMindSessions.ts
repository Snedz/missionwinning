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
  {
    id: 'stress-reset',
    title: 'Mid-day stress reset',
    subtitle: '3 min — downshift between tasks',
    minutes: 3,
    steps: [
      { text: 'Unclench jaw, drop shoulders, feel feet on the floor.', durationSec: 25 },
      { text: 'Inhale 4 counts, exhale 6 counts — repeat 5 times.', durationSec: 50 },
      { text: 'Name one thing you control right now in this session.', durationSec: 30 },
      { text: 'Return to your day with one clear next action.', durationSec: 25 },
    ],
  },
  {
    id: 'between-sets-calm',
    title: 'Between-sets calm',
    subtitle: '90 sec — reset heart rate',
    minutes: 2,
    steps: [
      { text: 'Stand tall, hands on ribs, feel lateral expansion.', durationSec: 20 },
      { text: 'Nasal breath in, long mouth exhale — 4 cycles.', durationSec: 40 },
      { text: 'Shake out arms, recommit to next set form.', durationSec: 30 },
    ],
  },
  {
    id: 'gratitude-recovery',
    title: 'Gratitude recovery',
    subtitle: '3 min — after a hard week',
    minutes: 3,
    steps: [
      { text: 'Recall one training win from this week — any size.', durationSec: 35 },
      { text: 'Thank your body for showing up, not only for PRs.', durationSec: 40 },
      { text: 'Plan one recovery action: sleep, food, or mobility.', durationSec: 35 },
      { text: 'Breathe slowly until the timer ends.', durationSec: 30 },
    ],
  },
  {
    id: 'anxiety-grounding',
    title: 'Anxiety grounding 5-4-3-2-1',
    subtitle: '4 min — sensory grounding',
    minutes: 4,
    steps: [
      { text: 'Name 5 things you can see.', durationSec: 40 },
      { text: 'Name 4 things you can touch.', durationSec: 40 },
      { text: 'Name 3 things you can hear.', durationSec: 35 },
      { text: 'Name 2 things you can smell.', durationSec: 30 },
      { text: 'Name 1 thing you can taste or one slow breath.', durationSec: 35 },
    ],
  },
  {
    id: 'pre-competition',
    title: 'Pre-test focus',
    subtitle: '2 min — before benchmarks or PFT',
    minutes: 2,
    steps: [
      { text: 'Feet rooted, posture tall, eyes on a fixed point.', durationSec: 20 },
      { text: 'Two sharp exhales — release tension.', durationSec: 20 },
      { text: 'Run through the test order once in your head.', durationSec: 30 },
      { text: 'Execute the plan — not the fear.', durationSec: 30 },
    ],
  },
  {
    id: 'walking-meditation',
    title: 'Walking meditation',
    subtitle: '5 min — mindful steps',
    minutes: 5,
    steps: [
      { text: 'Walk slowly indoors or outside, phone away.', durationSec: 30 },
      { text: 'Feel heel, midfoot, toe on each step.', durationSec: 60 },
      { text: 'When mind wanders, return to the next step.', durationSec: 90 },
      { text: 'Notice breath without changing it.', durationSec: 60 },
      { text: 'End with one deep breath and stop.', durationSec: 40 },
    ],
  },
  {
    id: 'evening-unplug',
    title: 'Evening unplug',
    subtitle: '4 min — screen-to-sleep bridge',
    minutes: 4,
    steps: [
      { text: 'Put the phone face down or in another room if you can.', durationSec: 25 },
      { text: 'Dim lights. Roll shoulders back three times.', durationSec: 30 },
      { text: 'Extended exhale breathing — exhale twice as long as inhale.', durationSec: 60 },
      { text: 'Tomorrow\'s training can wait. Rest is training.', durationSec: 45 },
      { text: 'Close eyes or soften gaze until timer ends.', durationSec: 60 },
    ],
  },
];
