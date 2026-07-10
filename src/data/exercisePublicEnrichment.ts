/**
 * Top-compound public enrichment — cues + alternatives when catalog is thin.
 * Wave 4 SEO depth. Does not rewrite the exercise catalog wholesale.
 */

export type ExercisePublicEnrichment = {
  cues?: string;
  alternatives?: string[];
  /** Extra execute lines when no structured form guide exists. */
  formTips?: string[];
};

/** ~50 high-intent movements for “how to do X” SEO. */
export const EXERCISE_PUBLIC_ENRICHMENT: Record<string, ExercisePublicEnrichment> = {
  squats: {
    alternatives: ['goblet-squat', 'air-squat', 'front-squat', 'leg-press'],
    formTips: ['Brace before you descend', 'Knees track over mid-foot', 'Stand by driving the floor away'],
  },
  deadlift: {
    alternatives: ['romanian-deadlift', 'sumo-deadlift', 'kettlebell-swing'],
    formTips: ['Bar over mid-foot', 'Push the floor — don’t yank the bar', 'Lock hips and knees together'],
  },
  'bench-press': {
    alternatives: ['push-ups', 'dumbbell-fly', 'incline-bench', 'dips'],
    formTips: ['Shoulders packed, feet planted', 'Touch chest with control', 'Press up without bouncing'],
  },
  'overhead-press': {
    alternatives: ['pike-pushup', 'lateral-raise-db', 'thruster'],
    formTips: ['Ribs down, glutes tight', 'Press straight up', 'Finish with biceps by ears'],
  },
  'barbell-row': {
    alternatives: ['inverted-row', 'lat-pulldown', 'pull-ups'],
    formTips: ['Hinge and brace', 'Pull elbows back', 'Control the eccentric'],
  },
  'pull-ups': {
    alternatives: ['chin-ups', 'lat-pulldown', 'inverted-row', 'negative-pullup'],
    formTips: ['Full hang start', 'Chest toward bar', 'Lower with control'],
  },
  'push-ups': {
    alternatives: ['bench-press', 'dips-chair', 'pike-pushup'],
    formTips: ['Body in one line', 'Elbows ~45°', 'Chest near floor each rep'],
  },
  'romanian-deadlift': {
    alternatives: ['deadlift', 'good-morning', 'single-leg-glute'],
    formTips: ['Soft knees', 'Hips back, bar close', 'Feel hamstrings stretch'],
  },
  lunges: {
    alternatives: ['bulgarian-split-squat', 'step-ups', 'air-squat'],
    formTips: ['Long enough step', 'Front knee tracks over foot', 'Torso tall'],
  },
  'hip-thrust': {
    alternatives: ['glute-bridge', 'single-leg-glute'],
    formTips: ['Chin tucked lightly', 'Drive through heels', 'Squeeze glutes at top'],
  },
  plank: {
    alternatives: ['side-plank', 'dead-bug', 'bird-dog'],
    formTips: ['Elbows under shoulders', 'Squeeze glutes', 'Breathe without sagging'],
  },
  'glute-bridge': {
    alternatives: ['hip-thrust', 'single-leg-glute'],
  },
  'air-squat': {
    alternatives: ['squats', 'goblet-squat', 'wall-sit'],
  },
  'inverted-row': {
    alternatives: ['barbell-row', 'pull-ups', 'lat-pulldown'],
  },
  burpees: {
    alternatives: ['jump-squats', 'mountain-climbers', 'push-ups'],
    cues: 'Chest to floor or soft drop, jump or step feet back, stand tall. Scale by removing the jump.',
  },
  'dumbbell-fly': {
    alternatives: ['cable-crossover', 'bench-press', 'push-ups'],
  },
  'lat-pulldown': {
    alternatives: ['pull-ups', 'chin-ups', 'inverted-row', 'barbell-row'],
    cues: 'Pull elbows down to ribs, slight lean back, control the stretch at the top. Don’t yank with momentum.',
  },
  'bicep-curl': {
    alternatives: ['preacher-curl', 'peak-contraction-curl'],
    cues: 'Elbows pinned, full extension at bottom, squeeze at top. No swinging.',
  },
  'tricep-pushdown': {
    alternatives: ['triceps-extension', 'dips-chair', 'close-grip-bench'],
    cues: 'Elbows fixed at sides, extend fully, control the return. Soft lockout.',
  },
  'leg-press': {
    alternatives: ['squats', 'hack-squat', 'leg-extension'],
    cues: 'Feet mid-platform, lower with control, don’t bounce at the bottom. Keep low back glued to the pad.',
  },
  'bulgarian-split-squat': {
    alternatives: ['lunges', 'step-ups', 'squats'],
    cues: 'Rear foot elevated, front shin vertical at bottom, torso tall. Drive through front heel.',
  },
  'chin-ups': {
    alternatives: ['pull-ups', 'lat-pulldown', 'negative-pullup'],
    cues: 'Supinated grip, full hang, pull chest to bar, lower slowly.',
  },
  'face-pull': {
    alternatives: ['rear-delt-fly', 'band-pull-apart'],
    cues: 'Pull rope to face, elbows high, external rotate at the end. Great for posture.',
  },
  'cable-crossover': {
    alternatives: ['dumbbell-fly', 'bench-press'],
  },
  'lateral-raise-db': {
    alternatives: ['giant-set-shoulders', 'overhead-press'],
  },
  'front-squat': {
    alternatives: ['squats', 'goblet-squat'],
    cues: 'Elbows high, torso upright, sit between the hips. Mobility-limited? Use goblet squat.',
  },
  'sumo-deadlift': {
    alternatives: ['deadlift', 'romanian-deadlift'],
    cues: 'Wide stance, toes out, hips closer to the bar. Push the floor apart.',
  },
  'good-morning': {
    alternatives: ['romanian-deadlift', 'deadlift'],
    cues: 'Soft knees, hinge hips back, light load. Feel hamstrings — not the low back rounding.',
  },
  'farmer-carry': {
    alternatives: ['suitcase-carry', 'deadlift'],
    cues: 'Tall posture, ribs down, short steps. Grip hard and breathe.',
  },
  'kettlebell-swing': {
    alternatives: ['romanian-deadlift', 'deadlift', 'hip-thrust'],
    cues: 'Hinge, snap hips, bell floats to chest height. Arms are ropes — power from hips.',
  },
  'box-jump': {
    alternatives: ['jump-squats', 'step-ups'],
    cues: 'Soft landing, full foot on box, stand tall. Step down to spare joints.',
  },
  dips: {
    alternatives: ['dips-chair', 'bench-press', 'tricep-pushdown'],
    cues: 'Shoulders down, slight forward lean for chest, upright for triceps. Don’t bounce in the bottom.',
  },
  'close-grip-bench': {
    alternatives: ['bench-press', 'tricep-pushdown', 'dips'],
    cues: 'Hands just inside shoulder width, elbows tuck, touch lower chest.',
  },
  'incline-bench': {
    alternatives: ['bench-press', 'push-ups', 'dumbbell-fly'],
    cues: 'Bench 15–45°, plant feet, control the touch on upper chest.',
  },
  'hack-squat': {
    alternatives: ['squats', 'leg-press'],
    cues: 'Back flat on pad, depth as mobility allows, don’t bounce.',
  },
  'leg-curl': {
    alternatives: ['romanian-deadlift', 'good-morning'],
    cues: 'Hips glued down, curl heels to glutes, slow eccentric.',
  },
  'calf-raise': {
    alternatives: ['seated-calf'],
    cues: 'Full stretch at bottom, pause at top. Both straight- and bent-knee versions matter.',
  },
  'hanging-leg-raise': {
    alternatives: ['dead-bug', 'plank', 'mountain-climbers'],
    cues: 'Dead hang, posterior tilt, raise legs without swinging.',
  },
  'russian-twist': {
    alternatives: ['side-plank', 'dead-bug'],
    cues: 'Lean slightly back, rotate through ribs, touch floor each side. Slow beats sloppy.',
  },
  'bird-dog': {
    alternatives: ['dead-bug', 'plank', 'cat-camel'],
  },
  'cat-camel': {
    alternatives: ['bird-dog', 'worlds-greatest-stretch'],
  },
  'worlds-greatest-stretch': {
    alternatives: ['couch-stretch', 'cat-camel'],
  },
  thruster: {
    alternatives: ['front-squat', 'overhead-press', 'goblet-squat'],
    cues: 'Front squat into press in one fluid motion. Brace at the bottom; don’t pause forever.',
  },
  'goblet-squat': {
    alternatives: ['air-squat', 'squats', 'front-squat'],
    cues: 'Hold weight at chest, elbows inside knees at bottom, upright torso.',
  },
  'wall-sit': {
    alternatives: ['air-squat', 'squats'],
  },
  'step-ups': {
    alternatives: ['lunges', 'bulgarian-split-squat'],
  },
  'pike-pushup': {
    alternatives: ['overhead-press', 'push-ups'],
  },
  'mountain-climbers': {
    alternatives: ['burpees', 'plank'],
  },
  'jump-squats': {
    alternatives: ['air-squat', 'box-jump'],
  },
  'dips-chair': {
    alternatives: ['dips', 'tricep-pushdown'],
  },
  'side-plank': {
    alternatives: ['plank', 'russian-twist'],
  },
  'single-leg-glute': {
    alternatives: ['glute-bridge', 'hip-thrust'],
  },
  'superman': {
    alternatives: ['bird-dog', 'glute-bridge'],
  },
  'dead-bug': {
    alternatives: ['plank', 'bird-dog'],
    cues: 'Low back pressed down, opposite arm/leg reach, exhale on the hard part.',
  },
  'couch-stretch': {
    alternatives: ['worlds-greatest-stretch', 'glute-bridge'],
    cues: 'Rear knee near wall/couch, upright torso, breathe into the hip flexor.',
  },
};
