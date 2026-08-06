export type GuidedMindStep = {
  text: string;
  durationSec: number;
};

export type GuidedMindSession = {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  /** Collection tags (Super Bundle depth). Optional on legacy rows. */
  tags?: string[];
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
{
    id: 'between-sets-reset-2',
    title: 'Between heavy sets',
    subtitle: '90 sec — downregulate without losing drive',
    minutes: 2,
    tags: ['pre-lift', 'focus'],
    steps: [
      { text: 'Rack the bar. Stand tall. Soften your grip.', durationSec: 15 },
      { text: 'Two nasal breaths — longer exhale.', durationSec: 25 },
      { text: 'Name the cue for the next set in three words.', durationSec: 20 },
      { text: 'When ready, approach with calm intent.', durationSec: 20 },
    ],
  },
  {
    id: 'missed-session-reframe',
    title: 'Missed session reframe',
    subtitle: '3 min — no shame, next action',
    minutes: 3,
    tags: ['stress', 'recovery'],
    steps: [
      { text: 'You are not behind. Consistency is a week, not a day.', durationSec: 30 },
      { text: 'Name one reason today slipped — without judgment.', durationSec: 35 },
      { text: 'Choose the smallest next train: one set, a walk, or tomorrow plan.', durationSec: 40 },
      { text: 'Drink water. Close this and move lightly if you can.', durationSec: 30 },
      { text: 'The path stays open.', durationSec: 20 },
    ],
  },
  {
    id: 'hotel-room-calm',
    title: 'Hotel room calm',
    subtitle: '4 min — travel nervous system',
    minutes: 4,
    tags: ['travel', 'stress', 'sleep'],
    steps: [
      { text: 'Sit on the bed edge. Feet on the floor.', durationSec: 25 },
      { text: 'Five slow breaths — room is temporary; you are steady.', durationSec: 50 },
      { text: 'Unclench jaw, drop shoulders, open hands.', durationSec: 35 },
      { text: 'If training later, set one simple intention. If not, rest is allowed.', durationSec: 40 },
      { text: 'Return to the day when ready.', durationSec: 30 },
    ],
  },
  {
    id: 'protein-patience',
    title: 'Fuel patience',
    subtitle: '2 min — before a rushed meal choice',
    minutes: 2,
    tags: ['focus', 'stress'],
    steps: [
      { text: 'Pause before ordering or opening the fridge.', durationSec: 20 },
      { text: 'Ask: protein first, then carbs, then extras.', durationSec: 30 },
      { text: 'Good enough food beats perfect plans you skip.', durationSec: 30 },
      { text: 'Choose and move on — no spiral.', durationSec: 20 },
    ],
  },
  {
    id: 'early-alarm-start',
    title: 'Early alarm start',
    subtitle: '3 min — before coffee heroics',
    minutes: 3,
    tags: ['focus', 'pre-lift', 'travel'],
    steps: [
      { text: 'Sit up. Light on if safe. No phone scroll yet.', durationSec: 25 },
      { text: 'Three breath cycles — in nose, out mouth.', durationSec: 40 },
      { text: 'Name the first physical action: water, shoes, or doorway stretch.', durationSec: 35 },
      { text: 'Stand when the timer ends. Momentum over mood.', durationSec: 30 },
    ],
  },
  {
    id: 'crowded-gym-focus',
    title: 'Crowded gym focus',
    subtitle: '3 min — own your lane',
    minutes: 3,
    tags: ['focus', 'pre-lift', 'anxiety'],
    steps: [
      { text: 'You do not need the whole floor — one rack or mat is enough.', durationSec: 30 },
      { text: 'Breathe. Soften the urge to rush or perform for others.', durationSec: 35 },
      { text: 'Plan two exercises max for the next 20 minutes.', durationSec: 35 },
      { text: 'Begin. Noise is weather; your set is the work.', durationSec: 30 },
    ],
  },
  {
    id: 'deload-week-mind',
    title: 'Deload week mind',
    subtitle: '4 min — lighter load is still the plan',
    minutes: 4,
    tags: ['recovery', 'post-train', 'stress'],
    steps: [
      { text: 'Deload is not weakness. It is programmed recovery.', durationSec: 35 },
      { text: 'Notice the urge to add plates just because.', durationSec: 40 },
      { text: 'Commit to quality movement and full rest between sessions.', durationSec: 45 },
      { text: 'Sleep and protein matter more this week than PRs.', durationSec: 40 },
      { text: 'Trust the plan. Show up lighter and leave proud.', durationSec: 30 },
    ],
  },
  {
    id: 'walk-meditation-short',
    title: 'Walking reset',
    subtitle: '5 min — outdoor or hallway',
    minutes: 5,
    tags: ['stress', 'travel', 'recovery'],
    steps: [
      { text: 'Start walking at an easy pace.', durationSec: 40 },
      { text: 'Feel heel, midfoot, toe. No phone.', durationSec: 60 },
      { text: 'When mind wanders, return to the next step.', durationSec: 70 },
      { text: 'Notice breath without forcing it.', durationSec: 50 },
      { text: 'Stop with one deep breath. Session complete.', durationSec: 30 },
    ],
  },
  {
    id: 'gratitude-three-wins',
    title: 'Three wins',
    subtitle: '3 min — end-of-day honesty',
    minutes: 3,
    tags: ['recovery', 'sleep', 'stress'],
    steps: [
      { text: 'Name one physical win today (moved, trained, walked, stretched).', durationSec: 40 },
      { text: 'Name one fuel or recovery win — even small.', durationSec: 35 },
      { text: 'Name one non-training win that kept life stable.', durationSec: 35 },
      { text: 'No ranking. Three is enough. Rest well.', durationSec: 30 },
    ],
  },
  {
    id: 'pr-attempt-calm',
    title: 'PR attempt calm',
    subtitle: '3 min — before a heavy single',
    minutes: 3,
    tags: ['pre-lift', 'focus', 'anxiety'],
    steps: [
      { text: 'This is one rep in a long career. Stay curious.', durationSec: 30 },
      { text: 'Breathe down into the belly. Soften the face.', durationSec: 35 },
      { text: 'Visualize successful lockout or stand — technical, not heroic.', durationSec: 40 },
      { text: 'If it misses, you still own the attempt. Approach when ready.', durationSec: 30 },
    ],
  },
  {
    id: 'rain-day-indoor',
    title: 'Rain day indoor',
    subtitle: '3 min — plan B without sulking',
    minutes: 3,
    tags: ['stress', 'focus', 'travel'],
    steps: [
      { text: 'Weather changed the plan. You did not fail.', durationSec: 30 },
      { text: 'Pick an indoor option: bodyweight, mobility, or mind session.', durationSec: 40 },
      { text: 'Set a 20-minute timer and begin that option only.', durationSec: 35 },
      { text: 'Done is the win. Outside returns another day.', durationSec: 25 },
    ],
  },
  {
    id: 'body-scan-short',
    title: 'Short body scan',
    subtitle: '5 min — lie down or sit',
    minutes: 5,
    tags: ['recovery', 'sleep', 'stress'],
    steps: [
      { text: 'Close eyes if comfortable. Notice contact points with floor or chair.', durationSec: 40 },
      { text: 'Scan face and jaw — soften.', durationSec: 40 },
      { text: 'Scan shoulders, chest, belly — longer exhales.', durationSec: 50 },
      { text: 'Scan hips, legs, feet — release effort.', durationSec: 50 },
      { text: 'Whole body at once. Rest until the timer ends.', durationSec: 60 },
    ],
  },
  {
    id: 'coach-trust',
    title: 'Trust the week plan',
    subtitle: '3 min — when you want to freestyle everything',
    minutes: 3,
    tags: ['focus', 'pre-lift'],
    steps: [
      { text: 'Your Mission Coach week is a hypothesis built from logs — not a cage.', durationSec: 35 },
      { text: 'One swap is fine. Abandoning the whole week is usually noise.', durationSec: 40 },
      { text: 'Do todays session as written unless pain or life says otherwise.', durationSec: 35 },
      { text: 'Log it. Tomorrow adapts. Begin.', durationSec: 25 },
    ],
  },
  {
    id: 'social-compare-stop',
    title: 'Stop the compare scroll',
    subtitle: '3 min — after social fitness feeds',
    minutes: 3,
    tags: ['anxiety', 'stress', 'focus'],
    steps: [
      { text: 'Put the feed away. Their highlight is not your program.', durationSec: 30 },
      { text: 'Name your current goal in one sentence.', durationSec: 35 },
      { text: 'Name one action in the next hour that serves that goal only.', durationSec: 40 },
      { text: 'Do that action. Leave their story in their feed.', durationSec: 30 },
    ],
  },
];
