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
  {
    id: 'ankle-knee-prep',
    name: 'Ankle & Knee Prep',
    durationMin: 6,
    focus: 'Pre-run or pre-squat — joints ready',
    steps: [
      { title: 'Ankle Circles', cue: '10 each direction per foot.', durationSec: 40 },
      { title: 'Knee Hugs', cue: 'Walk forward, hug knee to chest, 8 steps.', durationSec: 35 },
      { title: 'Calf Stretch Wall', cue: 'Straight and bent knee versions, 30s each leg.', durationSec: 60 },
      { title: 'Bodyweight Squat', cue: '10 slow reps, pause at bottom.', durationSec: 45 },
      { title: 'Terminal Knee Extension', cue: 'Band optional — squeeze quad at top, 10 each leg.', durationSec: 50 },
    ],
  },
  {
    id: 'shoulder-cars',
    name: 'Shoulder CARs Flow',
    durationMin: 7,
    focus: 'Controlled articular rotations — shoulder health',
    steps: [
      { title: 'Scapular Push-up', cue: 'Protract and retract, 10 reps.', durationSec: 40 },
      { title: 'Shoulder CARs', cue: 'Slow circles, left arm, largest pain-free range.', durationSec: 45 },
      { title: 'Shoulder CARs', cue: 'Right arm — match quality not speed.', durationSec: 45 },
      { title: 'Wall Slides', cue: 'Forearms on wall, slide up without rib flare.', durationSec: 45 },
      { title: 'Band Pull-Aparts', cue: '15 reps, pause at end range.', durationSec: 40 },
      { title: 'Dead Hang or Stretch', cue: 'Relax shoulders if bar available; else doorway stretch.', durationSec: 45 },
    ],
  },
  {
    id: 'post-run-cooldown',
    name: 'Post-Run Cooldown',
    durationMin: 8,
    focus: 'Calves, hips, spine after cardio',
    steps: [
      { title: 'Walk Easy', cue: '2 min nasal breathing, heart rate down.', durationSec: 60 },
      { title: 'Standing Calf Stretch', cue: 'Left then right, 40s each.', durationSec: 80 },
      { title: 'Pigeon Hold', cue: 'Left hip, breathe into glute.', durationSec: 45 },
      { title: 'Pigeon Hold', cue: 'Right hip.', durationSec: 45 },
      { title: 'Supine Twist', cue: 'Knees side to side, slow.', durationSec: 50 },
      { title: 'Box Breathing', cue: '4-4-4-4 for 4 rounds.', durationSec: 60 },
    ],
  },
  {
    id: 'morning-wake-up',
    name: 'Morning Wake-Up',
    durationMin: 5,
    focus: 'Gentle activation before the day',
    steps: [
      { title: 'Neck Nods', cue: 'Yes and no motions, slow.', durationSec: 30 },
      { title: 'Cat-Camel', cue: '8 reps, sync with breath.', durationSec: 40 },
      { title: 'Bodyweight Good Morning', cue: '10 hinges, hands behind head.', durationSec: 40 },
      { title: 'Arm Circles', cue: 'Small to large, forward and back.', durationSec: 35 },
      { title: 'March in Place', cue: 'Lift knees, wake up ankles.', durationSec: 35 },
    ],
  },
  {
    id: 'travel-hotel',
    name: 'Travel Hotel Flow',
    durationMin: 6,
    focus: 'No equipment — hotel room friendly',
    steps: [
      { title: 'Doorway Chest Stretch', cue: 'Left and right, 30s each.', durationSec: 60 },
      { title: 'Air Squats', cue: '15 controlled reps.', durationSec: 40 },
      { title: 'Incline Push-up', cue: 'Hands on desk or bed, 10 reps.', durationSec: 35 },
      { title: 'Single-Leg Balance', cue: '30s each leg.', durationSec: 70 },
      { title: 'Seated Hamstring Stretch', cue: 'Reach toward toes, no bounce.', durationSec: 45 },
    ],
  },
  {
    id: 'post-leg-day',
    name: 'Post-Leg-Day Recovery',
    durationMin: 10,
    focus: 'Flush legs after heavy lower session',
    steps: [
      { title: 'Easy Bike or Walk', cue: 'If available; else marching in place 60s.', durationSec: 60 },
      { title: 'Couch Stretch', cue: 'Left quad/hip flexor.', durationSec: 50 },
      { title: 'Couch Stretch', cue: 'Right side.', durationSec: 50 },
      { title: 'Frog Pose', cue: 'Deep hip opener, breathe.', durationSec: 60 },
      { title: 'Pigeon', cue: 'Left glute.', durationSec: 45 },
      { title: 'Pigeon', cue: 'Right glute.', durationSec: 45 },
      { title: 'Legs Up Wall', cue: 'Relax, slow breathing.', durationSec: 90 },
    ],
  },
];
