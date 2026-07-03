import 'server-only';
import type { GuidedMindSession } from '@/data/guidedMindSessions';

/** Premium guided mind sessions — server-only depth. */
export const PREMIUM_MIND_SESSIONS: GuidedMindSession[] = [
  {
    id: 'deep-focus-block',
    title: 'Deep focus block',
    subtitle: '8 min — pre-study or technical work',
    minutes: 8,
    steps: [
      { text: 'Clear desk clutter in one minute — physical space mirrors mental space.', durationSec: 60 },
      { text: 'Set a single outcome for the next 25 minutes.', durationSec: 45 },
      { text: 'Box breathing 4-4-4-4 for 6 cycles.', durationSec: 90 },
      { text: 'Visualize completing the task with calm attention.', durationSec: 60 },
      { text: 'Begin work when timer ends — no phone checks.', durationSec: 45 },
    ],
  },
  {
    id: 'injury-acceptance',
    title: 'Injury acceptance',
    subtitle: '6 min — when training is limited',
    minutes: 6,
    steps: [
      { text: 'Acknowledge frustration without judging it.', durationSec: 40 },
      { text: 'List what you CAN do today — mobility, upper, walking.', durationSec: 60 },
      { text: 'Breathe into areas that feel safe, not painful.', durationSec: 60 },
      { text: 'Commit to one small win on Today hub.', durationSec: 45 },
    ],
  },
  {
    id: 'competition-visualization',
    title: 'Competition visualization',
    subtitle: '7 min — test or event prep',
    minutes: 7,
    steps: [
      { text: 'Sit comfortably, eyes closed if safe.', durationSec: 30 },
      { text: 'Walk through venue arrival and warm-up in detail.', durationSec: 60 },
      { text: 'See yourself executing each movement with planned effort.', durationSec: 90 },
      { text: 'Feel calm breath at the start line.', durationSec: 60 },
      { text: 'Open eyes — execute the plan you saw.', durationSec: 40 },
    ],
  },
  {
    id: 'gratitude-training',
    title: 'Gratitude for training',
    subtitle: '5 min — long-term adherence',
    minutes: 5,
    steps: [
      { text: 'Recall why you started training — beyond aesthetics.', durationSec: 45 },
      { text: 'Name one person or place that supports your health.', durationSec: 40 },
      { text: 'Thank your body for one capability today.', durationSec: 40 },
      { text: 'Set intention for tomorrow\'s session.', durationSec: 35 },
    ],
  },
  {
    id: 'anger-downshift',
    title: 'Anger downshift',
    subtitle: '4 min — before you send that message',
    minutes: 4,
    steps: [
      { text: 'Notice heat in chest or jaw — do not act yet.', durationSec: 30 },
      { text: 'Exhale longer than inhale, 8 breaths.', durationSec: 70 },
      { text: 'Ask: will this matter in 24 hours?', durationSec: 35 },
      { text: 'Choose response, not reaction.', durationSec: 25 },
    ],
  },
  {
    id: 'body-scan-long',
    title: 'Full body scan',
    subtitle: '12 min — deep relaxation',
    minutes: 12,
    steps: [
      { text: 'Lie down, arms at sides, feet fall open.', durationSec: 30 },
      { text: 'Scan feet, calves, knees — release tension.', durationSec: 90 },
      { text: 'Scan thighs, hips, belly, lower back.', durationSec: 90 },
      { text: 'Scan chest, shoulders, arms, hands.', durationSec: 90 },
      { text: 'Scan neck, jaw, face, crown of head.', durationSec: 90 },
      { text: 'Whole body heavy and warm — rest.', durationSec: 90 },
    ],
  },
  {
    id: 'morning-intention',
    title: 'Morning intention',
    subtitle: '5 min — before checking phone',
    minutes: 5,
    steps: [
      { text: 'Feet on floor, sit edge of bed, three breaths.', durationSec: 40 },
      { text: 'One word for today: strength, patience, focus…', durationSec: 35 },
      { text: 'Picture one training or recovery action you will complete.', durationSec: 50 },
      { text: 'Stand and begin the day on purpose.', durationSec: 35 },
    ],
  },
  {
    id: 'social-anxiety-gym',
    title: 'Gym social calm',
    subtitle: '4 min — crowded gym nerves',
    minutes: 4,
    steps: [
      { text: 'Everyone is focused on themselves — not judging your form.', durationSec: 35 },
      { text: 'You belong here as much as anyone.', durationSec: 30 },
      { text: 'Pick one station and start — action reduces anxiety.', durationSec: 40 },
      { text: 'Breathe and begin set one.', durationSec: 35 },
    ],
  },
  {
    id: 'pain-distinction',
    title: 'Pain vs discomfort',
    subtitle: '5 min — train smart',
    minutes: 5,
    steps: [
      { text: 'Muscle burn and breathlessness are often safe training signals.', durationSec: 45 },
      { text: 'Sharp joint pain means stop that movement pattern.', durationSec: 45 },
      { text: 'When unsure, regress load and consult a professional.', durationSec: 40 },
      { text: 'Log what you did — data helps later decisions.', durationSec: 30 },
    ],
  },
  {
    id: 'sleep-prep-advanced',
    title: 'Advanced sleep prep',
    subtitle: '10 min — insomnia support habit',
    minutes: 10,
    steps: [
      { text: 'Dim lights. No news or feeds.', durationSec: 40 },
      { text: 'Progressive muscle relaxation — feet to head.', durationSec: 180 },
      { text: 'Count breaths 30 to 1; restart if needed.', durationSec: 120 },
      { text: 'If not asleep, get up and read something dull — return when sleepy.', durationSec: 60 },
    ],
  },
  {
    id: 'post-loss-reset',
    title: 'After a bad session',
    subtitle: '5 min — bounce back mentally',
    minutes: 5,
    steps: [
      { text: 'One bad workout does not erase months of work.', durationSec: 35 },
      { text: 'Note one thing that went well — even showing up.', durationSec: 40 },
      { text: 'Note one adjustment for next time — sleep, food, load.', durationSec: 45 },
      { text: 'Tomorrow is a new session.', durationSec: 30 },
    ],
  },
  {
    id: 'mindful-eating-prep',
    title: 'Mindful eating prep',
    subtitle: '4 min — before meals',
    minutes: 4,
    steps: [
      { text: 'Pause before first bite — smell and look at food.', durationSec: 30 },
      { text: 'Three breaths, put fork down between bites when you can.', durationSec: 45 },
      { text: 'Eat to 80% full — stop when satisfied not stuffed.', durationSec: 40 },
      { text: 'Log roughly on Fuel if tracking today.', durationSec: 25 },
    ],
  },
];
