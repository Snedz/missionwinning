import type { GuidedMindSession } from '@/data/guidedMindSessions';

/** Premium guided session content — import via premiumMindSessions.ts on server only. */
export const PREMIUM_MIND_SESSION_DATA: GuidedMindSession[] = [
  {
    id: 'anxiety-reset',
    title: 'Anxiety reset',
    subtitle: '3 min — ground the nervous system',
    minutes: 3,
    steps: [
      { text: 'Feet flat on the floor. Feel the weight of your body supported.', durationSec: 25 },
      { text: 'Name 5 things you can see, 4 you can touch, 3 you can hear.', durationSec: 45 },
      { text: 'Box breath: inhale 4, hold 4, exhale 4, hold 4 — two rounds.', durationSec: 40 },
      { text: 'Release shoulders on each exhale. Jaw soft, tongue relaxed.', durationSec: 30 },
      { text: 'Return to the room. One small next step is enough.', durationSec: 20 },
    ],
  },
  {
    id: 'deep-recovery',
    title: 'Deep recovery scan',
    subtitle: '5 min — parasympathetic activation',
    minutes: 5,
    steps: [
      { text: 'Lie down or recline. Close your eyes if comfortable.', durationSec: 20 },
      { text: 'Breathe slowly — exhale longer than inhale.', durationSec: 45 },
      { text: 'Scan calves → thighs → hips. Soften each area on the exhale.', durationSec: 60 },
      { text: 'Scan belly → chest → shoulders → face. No fixing — just notice.', durationSec: 60 },
      { text: 'Imagine recovery flowing to wherever you trained hardest.', durationSec: 45 },
      { text: 'Protein and sleep tonight complete the mission.', durationSec: 30 },
    ],
  },
  {
    id: 'focus-block',
    title: 'Focus block',
    subtitle: '4 min — clear mental clutter',
    minutes: 4,
    steps: [
      { text: 'Sit upright. Set a single priority for the next hour.', durationSec: 25 },
      { text: 'Write it mentally — one sentence, no extras.', durationSec: 30 },
      { text: 'Three breaths: each inhale gathers attention, each exhale releases distraction.', durationSec: 45 },
      { text: 'When thoughts wander, label them “thinking” and return to breath.', durationSec: 50 },
      { text: 'Open your eyes. Begin the block with one deliberate action.', durationSec: 20 },
    ],
  },
  {
    id: 'gratitude-reflection',
    title: 'Gratitude reflection',
    subtitle: '3 min — reinforce consistency',
    minutes: 3,
    steps: [
      { text: 'Recall one training win from this week — any size counts.', durationSec: 30 },
      { text: 'Notice what your body enabled you to do today.', durationSec: 35 },
      { text: 'Thank one person or habit that supported your health.', durationSec: 35 },
      { text: 'Set one kind intention for tomorrow’s session.', durationSec: 30 },
      { text: 'Carry this steadiness into the rest of your day.', durationSec: 20 },
    ],
  },
  {
    id: 'competition-calm',
    title: 'Competition calm',
    subtitle: '3 min — steady nerves before a test or event',
    minutes: 3,
    steps: [
      { text: 'Stand tall. Shake out hands and shoulders once.', durationSec: 20 },
      { text: 'You prepared. The work is already in you.', durationSec: 25 },
      { text: 'Power breath: sharp inhale, long slow exhale — three times.', durationSec: 40 },
      { text: 'Visualize your first rep or step — smooth, controlled, committed.', durationSec: 35 },
      { text: 'Go execute. One rep at a time.', durationSec: 20 },
    ],
  },
  {
    id: 'sleep-story-wind',
    title: 'Sleep story wind-down',
    subtitle: '5 min — narrative calm for restless nights',
    minutes: 5,
    steps: [
      { text: 'Dim the room. Lie on your back, palms open.', durationSec: 25 },
      { text: 'Imagine walking a quiet path at dusk — each step slower than the last.', durationSec: 55 },
      { text: 'The air is cool. Your breath matches the gentle rhythm of your steps.', durationSec: 55 },
      { text: 'At the path’s end is rest. Nothing left to solve tonight.', durationSec: 50 },
      { text: 'Let the story fade. Sleep will meet you here.', durationSec: 45 },
    ],
  },
];
