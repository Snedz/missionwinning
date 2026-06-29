export interface FlowStep {
  title: string;
  cue: string;
  durationSec: number;
}

export interface MobilityFlow {
  id: string;
  name: string;
  durationMin: number;
  focus: string;
  steps: FlowStep[];
}

export const MOBILITY_FLOWS: MobilityFlow[] = [
  {
    id: 'hip-opener',
    name: 'Hip Opener Flow',
    durationMin: 8,
    focus: 'Hips + glutes — great before or after leg day',
    steps: [
      { title: 'Cat-Camel', cue: 'Slow spine waves, breathe with each rep.', durationSec: 45 },
      { title: '90/90 Hip Switch', cue: 'Switch sides gently, rock into hips.', durationSec: 60 },
      { title: 'Pigeon Hold', cue: 'Left side — deep glute stretch, breathe into tension.', durationSec: 45 },
      { title: 'Pigeon Hold', cue: 'Right side — same depth, no forcing range.', durationSec: 45 },
      { title: 'Couch Stretch', cue: 'Left quad/hip flexor against wall or couch.', durationSec: 45 },
      { title: 'Couch Stretch', cue: 'Right side — tall posture, squeeze glute.', durationSec: 45 },
      { title: 'Glute Bridge', cue: '10 slow reps — activate glutes after opening.', durationSec: 40 },
    ],
  },
  {
    id: 'desk-reset',
    name: 'Desk Reset (5 min)',
    durationMin: 5,
    focus: 'Neck, shoulders, thoracic — counter sitting',
    steps: [
      { title: 'Neck Circles', cue: 'Slow circles each direction, jaw relaxed.', durationSec: 30 },
      { title: 'Wall Angels', cue: 'Back flat on wall, arms slide up and down.', durationSec: 45 },
      { title: 'Thread the Needle', cue: 'Left side — open thoracic, follow hand with eyes.', durationSec: 30 },
      { title: 'Thread the Needle', cue: 'Right side — breathe into upper back.', durationSec: 30 },
      { title: 'Wall Chest Opener', cue: 'Hands on wall, lean forward, open chest.', durationSec: 45 },
      { title: 'Box Breathing', cue: '4s in, 4s hold, 4s out, 4s hold — 4 rounds.', durationSec: 60 },
    ],
  },
  {
    id: 'full-body-primer',
    name: 'Full Body Primer',
    durationMin: 10,
    focus: 'Pre-workout mobility — ankles to shoulders',
    steps: [
      { title: "World's Greatest Stretch", cue: 'Deep lunge + rotation, 3 per side.', durationSec: 60 },
      { title: 'Ankle Rocks', cue: 'Knee over toes, 10 each side against wall.', durationSec: 45 },
      { title: 'Inchworm', cue: 'Walk hands out to plank, walk feet in — 6 reps.', durationSec: 50 },
      { title: 'Bear Crawl', cue: 'Low hips, 10 steps forward and back.', durationSec: 45 },
      { title: 'Down Dog to Cobra', cue: 'Flow slowly, 6 reps — spine and shoulders.', durationSec: 50 },
      { title: 'Single Leg Balance', cue: '30s each leg — activate ankles and focus.', durationSec: 70 },
    ],
  },
  {
    id: 'recovery-wind-down',
    name: 'Recovery Wind-Down',
    durationMin: 7,
    focus: 'Post-training — gentle, parasympathetic',
    steps: [
      { title: "Child's Pose", cue: 'Knees wide or narrow, long exhales.', durationSec: 45 },
      { title: 'Seated Forward Fold', cue: 'Hamstrings relaxed, no bouncing.', durationSec: 45 },
      { title: 'Seated Spinal Twist', cue: 'Left — gentle rotation, breathe.', durationSec: 30 },
      { title: 'Seated Spinal Twist', cue: 'Right — same ease.', durationSec: 30 },
      { title: 'Frog Pose', cue: 'Deep hip hold — breathe into hips.', durationSec: 60 },
      { title: 'Body Scan', cue: 'Lie still, release tension head to toe.', durationSec: 90 },
    ],
  },
];
