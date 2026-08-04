import type { FormGuide } from '@/types/formGuide';

/** Compact guide builder from movement pattern. */
function g(
  ready: string,
  setup: string[],
  execute: string[],
  errors?: string[],
  breath = 'In down · Out up'
): FormGuide {
  return { readyPosition: ready, setup, execute, commonErrors: errors, breathing: breath };
}

/** Additional guides to reach 50+ priority movements (text-only). */
export const EXTENDED_GUIDES: Record<string, FormGuide> = {
  'bench-press': g(
    'Lie on bench, eyes under bar',
    ['Feet flat, slight arch, shoulder blades pinched', 'Grip slightly wider than shoulders', 'Wrists stacked over elbows'],
    ['Lower bar to mid-chest with control', 'Elbows ~45° from torso', 'Press up in slight arc to lockout'],
    ['Bouncing bar off chest', 'Flaring elbows to 90°']
  ),
  'romanian-deadlift': g(
    'Standing, bar at hips',
    ['Soft knees, hips back', 'Bar close to legs', 'Flat back, lats engaged'],
    ['Hinge until hamstrings stretch', 'Feel stretch behind knee', 'Drive hips forward to stand'],
    ['Rounding lower back', 'Bar drifting away from legs']
  ),
  'lat-pulldown': g(
    'Seated, thighs secured',
    ['Grip slightly wider than shoulders', 'Chest up, core braced', 'Start with arms extended'],
    ['Pull bar to upper chest', 'Elbows down and back', 'Control the return'],
    ['Leaning too far back', 'Pulling behind neck']
  ),
  'hip-thrust': g(
    'Upper back on bench',
    ['Feet flat, knees bent ~90°', 'Bar padded over hips', 'Chin tucked'],
    ['Drive hips up', 'Squeeze glutes at top', 'Lower without losing tension'],
    ['Hyperextending lower back', 'Pushing through toes only']
  ),
  'kettlebell-swing': g(
    'Hinge with KB between feet',
    ['Hike bell back between legs', 'Hips back, flat back', 'Arms relaxed like ropes'],
    ['Snap hips forward', 'Bell floats to chest height', 'Let bell fall back into hinge'],
    ['Squatting the swing', 'Lifting with arms']
  ),
  'face-pull': g(
    'Cable at face height',
    ['Rope grip, step back', 'Elbows high', 'Shoulders down'],
    ['Pull rope toward face', 'Externally rotate at end', 'Squeeze rear delts'],
    ['Using too much weight', 'Shrugging shoulders']
  ),
  'bicep-curl': g(
    'Standing, dumbbells at sides',
    ['Elbows pinned to ribs', 'Neutral or supinated grip', 'Shoulders still'],
    ['Curl without swinging', 'Squeeze at top', 'Lower with control'],
    ['Swinging body', 'Partial reps']
  ),
  'tricep-pushdown': g(
    'Cable at chest height',
    ['Elbows at sides', 'Slight forward lean', 'Grip shoulder-width'],
    ['Extend elbows fully', 'Squeeze triceps', 'Return without flaring elbows'],
    ['Moving upper arms', 'Incomplete extension']
  ),
  'crunches': g(
    'Supine, knees bent',
    ['Low back gently pressed down', 'Hands light behind head', 'Chin off chest'],
    ['Curl ribs toward pelvis', 'Exhale on the way up', 'Lower with control'],
    ['Pulling on neck', 'Using momentum']
  ),
  'cat-camel': g(
    'Hands and knees',
    ['Wrists under shoulders', 'Knees under hips', 'Neutral spine to start'],
    ['Round spine up (cat)', 'Then arch gently (camel)', 'Move slowly through range'],
    ['Rushing reps', 'Collapsing in mid-back'],
    'Exhale on cat · In on camel'
  ),
  'bird-dog': g(
    'Hands and knees',
    ['Spine neutral', 'Core braced', 'Look at floor'],
    ['Extend opposite arm and leg', 'Keep hips level', 'Hold briefly, switch sides'],
    ['Rotating hips', 'Arching lower back']
  ),
  'couch-stretch': g(
    'Half-kneeling at couch/wall',
    ['Back knee close to wall', 'Front foot flat', 'Torso tall'],
    ['Tuck pelvis slightly', 'Squeeze glute on back leg', 'Hold 45–90 seconds'],
    ['Arching lower back', 'Front knee caving']
  ),
  'wall-sit': g(
    'Back against wall',
    ['Feet shoulder-width', 'Slide down to ~90° knees', 'Weight in heels'],
    ['Hold position', 'Keep back flat on wall', 'Breathe steadily'],
    ['Knees past toes', 'Hands on thighs for help'],
    'Steady breaths'
  ),
  'pike-pushup': g(
    'Downward dog style',
    ['Hips high, head between arms', 'Hands shoulder-width', 'Legs straight or bent'],
    ['Lower head toward floor', 'Elbows back', 'Press up to start'],
    ['Sagging hips', 'Incomplete range']
  ),
  'side-plank': g(
    'Side-lying on forearm',
    ['Elbow under shoulder', 'Stack feet or stagger', 'Hips lifted in line'],
    ['Hold body straight', 'Breathe', 'Switch sides'],
    ['Hips dropping', 'Shoulder shrugging']
  ),
  'mountain-climbers': g(
    'High plank',
    ['Hands under shoulders', 'Core tight', 'Hips low'],
    ['Drive knee toward chest', 'Alternate quickly', 'Keep shoulders over wrists'],
    ['Hips bouncing high', 'Feet landing wide']
  ),
  'dips-chair': g(
    'Hands on chair edge',
    ['Fingers forward, hips close', 'Legs bent or straight', 'Shoulders down'],
    ['Lower until ~90° elbows', 'Press up fully', 'Keep back close to chair'],
    ['Shrugging shoulders', 'Going too deep if shoulder pain']
  ),
  'step-ups': g(
    'Facing box or bench',
    ['Full foot on box', 'Torso tall', 'Drive through top leg'],
    ['Step up without pushing off back leg', 'Control down', 'Alternate legs'],
    ['Knee collapsing inward', 'Box too high']
  ),
  'bear-crawl': g(
    'Hands and knees lifted',
    ['Knees 1–2 inches off floor', 'Back flat', 'Opposite hand and foot'],
    ['Crawl forward or back', 'Small controlled steps', 'Keep hips low'],
    ['Hips swaying side to side', 'Rushing']
  ),
  'inchworm': g(
    'Standing',
    ['Hinge and walk hands out', 'To plank position', 'Core braced'],
    ['Walk feet toward hands', 'Keep legs as straight as comfortable', 'Stand and repeat'],
    ['Collapsing in plank', 'Bending knees excessively']
  ),
  'dead-bug': g(
    'Supine, arms up',
    ['Low back pressed to floor', 'Knees at 90°', 'Brace core'],
    ['Extend opposite arm and leg', 'Return without back arching', 'Alternate sides'],
    ['Lower back peeling off floor', 'Holding breath']
  ),
  'thruster': g(
    'Front rack position',
    ['Elbows up, bar on shoulders', 'Feet shoulder-width', 'Core braced'],
    ['Squat to depth', 'Drive up and press overhead', 'Lock out in one motion'],
    ['Good-morning squat', 'Pressing before hips extend']
  ),
  'sled-push': g(
    'Hands on sled handles',
    ['Body angled ~45°', 'Drive through balls of feet', 'Short powerful steps'],
    ['Push with legs not arms only', 'Keep spine neutral', 'Steady pace for distance'],
    ['Rounding back', 'Overstriding'],
    'Powerful exhales on drive'
  ),
  'negative-pullup': g(
    'Top of pull-up position',
    ['Jump or assist to chin over bar', 'Engage lats', 'Body straight'],
    ['Lower slowly 3–5 seconds', 'Full extension at bottom', 'Reset and repeat'],
    ['Dropping fast', 'Incomplete bottom range']
  ),
  'front-squat': g(
    'Bar in front rack',
    ['Elbows high, bar on shoulders', 'Feet shoulder-width', 'Torso upright'],
    ['Sit straight down', 'Knees track toes', 'Drive up elbows leading'],
    ['Elbows dropping', 'Good-morning out of hole']
  ),
  'overhead-press': g(
    'Bar at front rack or shoulders',
    ['Ribs down, glutes tight', 'Wrists over elbows', 'Feet planted'],
    ['Press straight up', 'Move head through at top', 'Lock out overhead'],
    ['Excessive back lean', 'Pressing forward']
  ),
  'cable-row': g(
    'Seated at cable',
    ['Chest up, slight lean', 'Feet braced', 'Shoulders packed'],
    ['Pull handle to lower ribs', 'Squeeze shoulder blades', 'Extend with control'],
    ['Using momentum', 'Rounding upper back']
  ),
  'leg-press': g(
    'Feet on platform',
    ['Feet shoulder-width on sled', 'Lower back flat on pad', 'Unlock safety handles'],
    ['Lower until knees ~90°', 'Drive through whole foot', 'Do not lock knees harshly'],
    ['Lower back lifting off pad', 'Knees caving']
  ),
  'calf-raise': g(
    'Balls of feet on edge',
    ['Full stretch at bottom', 'Hips stable', 'Hold support if needed'],
    ['Rise to full extension', 'Pause at top', 'Lower slowly'],
    ['Bouncing at bottom', 'Bent knees on straight-leg version']
  ),
  'lateral-raise': g(
    'Standing, dumbbells at sides',
    ['Soft elbows', 'Shoulders down', 'Slight forward lean optional'],
    ['Raise to shoulder height', 'Lead with elbows', 'Lower with control'],
    ['Shrugging traps', 'Swinging body']
  ),
  'skull-crusher': g(
    'Lie on bench, bar extended',
    ['Arms vertical or slightly back', 'Elbows stay in place', 'Grip shoulder-width'],
    ['Hinge at elbows only', 'Lower toward forehead', 'Extend to start'],
    ['Elbows flaring wide', 'Lowering toward face']
  ),
  'hanging-leg-raise': g(
    'Dead hang from bar',
    ['Shoulders engaged', 'Legs together', 'Avoid swinging'],
    ['Raise knees or legs', 'Posterior pelvic tilt at top', 'Lower with control'],
    ['Excessive swinging', 'Arching lower back']
  ),
  'box-jump': g(
    'Standing facing box',
    ['Feet hip-width', 'Arm swing ready', 'Pick appropriate height'],
    ['Quarter squat then explode', 'Land softly on box', 'Stand fully, step down'],
    ['Landing with stiff legs', 'Box too high for skill']
  ),
  'jump-squats': g(
    'Athletic stance',
    ['Squat to comfortable depth', 'Arms for counterbalance', 'Core braced'],
    ['Explode upward', 'Land softly into next squat', 'Reset if form breaks'],
    ['Landing loud and stiff', 'Shallow squats']
  ),
  'band-pull-apart': g(
    'Arms extended, band at chest',
    ['Shoulders down', 'Slight bend in elbows', 'Band at chest height'],
    ['Pull band apart', 'Squeeze rear delts and scaps', 'Return with control'],
    ['Shrugging', 'Band too heavy']
  ),
  'superman': g(
    'Prone on floor',
    ['Arms extended or at sides', 'Legs straight', 'Neck neutral'],
    ['Lift arms, chest, and legs slightly', 'Squeeze glutes and back', 'Hold 2–3 seconds'],
    ['Hyperextending neck', 'Jerking up too high']
  ),
  'goblet-squat': g(
    'Goblet hold at chest',
    ['Elbows inside knees at bottom', 'Feet shoulder-width', 'Torso upright'],
    ['Sit between hips', 'Knees track toes', 'Stand driving through floor'],
    ['Collapsing forward', 'Heels lifting']
  ),
  'single-leg-glute': g(
    'Supine, one foot planted',
    ['Other leg extended or bent', 'Ribs down', 'Drive through planted heel'],
    ['Lift hips level', 'Squeeze glute at top', 'Lower without tilting'],
    ['Rotating hips', 'Pushing through toes']
  ),
  'wall-angels': g(
    'Back flat on wall',
    ['Low back, head, and arms touching wall', 'Elbows bent 90°'],
    ['Slide arms up overhead', 'Keep contact with wall', 'Return slowly'],
    ['Arching off wall', 'Rushing']
  ),
  'thread-needle': g(
    'Hands and knees',
    ['One arm reaches under body', 'Shoulder to floor', 'Other arm stays planted'],
    ['Rotate through upper back', 'Hold stretch', 'Switch sides'],
    ['Collapsing hips', 'Forcing range']
  ),
  'frog-pose': g(
    'Knees wide, on forearms',
    ['Ankles in line with knees if comfortable', 'Breathe into hips', 'Relax shoulders'],
    ['Hold static stretch', 'Do not bounce', 'Exit slowly'],
    ['Forcing knees to floor', 'Lower back pain — reduce range']
  ),
  // Phase 4 craft completeness — common logger lifts still on cues-only
  'dumbbell-press': g(
    'Lie on bench, dumbbells at chest',
    ['Feet flat, shoulder blades pinched', 'Wrists stacked over elbows', 'Neutral spine'],
    ['Press dumbbells up and slightly together', 'Lower with control to chest line', 'Do not bounce at bottom'],
    ['Flaring elbows hard', 'Arching low back off bench']
  ),
  'incline-bench': g(
    'Incline bench, bar or DBs',
    ['Bench 30–45°', 'Shoulder blades set', 'Grip slightly wider than shoulders'],
    ['Lower to upper chest', 'Press up without shrugging', 'Control the eccentric'],
    ['Angle too steep (becomes shoulder press)', 'Bouncing bar']
  ),
  'hammer-curl': g(
    'Standing, neutral grip',
    ['Elbows at ribs', 'Thumbs up / hammer grip', 'Shoulders quiet'],
    ['Curl without swinging', 'Squeeze at top', 'Lower fully'],
    ['Torso lean', 'Partial range']
  ),
  'preacher-curl': g(
    'Arms on preacher pad',
    ['Armpits near top of pad', 'Full stretch at bottom', 'Wrists neutral'],
    ['Curl without lifting elbows', 'Squeeze peak', 'Lower under control'],
    ['Incomplete bottom stretch', 'Using body English']
  ),
  'triceps-extension': g(
    'Overhead dumbbell or cable',
    ['Elbows point forward/up', 'Ribs down', 'Core braced'],
    ['Extend elbows fully', 'Keep upper arms still', 'Control the lower'],
    ['Flaring elbows', 'Arching lumbar']
  ),
  'leg-extension': g(
    'Seated on machine',
    ['Pad on lower shins', 'Back against pad', 'Toes up'],
    ['Extend knees fully', 'Squeeze quads', 'Lower without slamming'],
    ['Using momentum', 'Hips lifting off seat']
  ),
  'leg-curl': g(
    'Prone or seated machine',
    ['Pad just above heels', 'Hips stable', 'Neutral spine'],
    ['Curl heels toward glutes', 'Squeeze hamstrings', 'Return with control'],
    ['Hips rising', 'Partial range']
  ),
  'reverse-lunge': g(
    'Standing, feet hip-width',
    ['Torso tall', 'Core braced', 'Step back far enough for vertical front shin'],
    ['Lower back knee toward floor', 'Front knee tracks toes', 'Drive through front heel'],
    ['Front knee cave', 'Falling forward']
  ),
  'cossack-squat': g(
    'Wide stance',
    ['Toes out slightly', 'Weight shifts to one leg', 'Other leg straight'],
    ['Sit into the bent leg', 'Keep heel down if possible', 'Stand and switch'],
    ['Collapsing knee inward', 'Rounding upper back']
  ),
  'scap-pullup': g(
    'Dead hang',
    ['Full hang, passive shoulders first', 'Grip solid', 'Body still'],
    ['Depress and retract scapulae (lift body slightly)', 'Hold 1 second', 'Return to passive hang'],
    ['Bending elbows into a pull-up', 'Shrugging up']
  ),
  'jumping-jack': g(
    'Standing, feet together',
    ['Arms at sides', 'Soft knees', 'Light on feet'],
    ['Jump feet out while arms go overhead', 'Jump back to start', 'Steady rhythm'],
    ['Landing stiff-legged', 'Holding breath']
  ),
  'worlds-greatest-stretch': g(
    'Lunge position',
    ['Long lunge, front foot flat', 'Back knee down or hovering', 'Hands inside front foot'],
    ['Rotate open toward front leg', 'Reach arm up', 'Return and switch sides'],
    ['Front knee collapsing', 'Forcing rotation']
  ),
  'dumbbell-fly': g(
    'Lie on bench, DBs above chest',
    ['Soft elbows fixed angle', 'Shoulder blades set', 'Feet flat'],
    ['Open arms wide with control', 'Feel stretch in chest', 'Bring DBs together over chest'],
    ['Locking elbows straight', 'Going too deep for shoulders']
  ),
  'rear-delt-fly': g(
    'Hinge or seated chest-supported',
    ['Soft elbows', 'Neutral neck', 'Light weight'],
    ['Raise arms out to sides', 'Squeeze rear delts', 'Lower slowly'],
    ['Using traps/shrugging', 'Swinging torso']
  ),
  'face-pull-band': g(
    'Band at face height',
    ['Step back for tension', 'Elbows high', 'Shoulders down'],
    ['Pull band toward face', 'Externally rotate at end', 'Control return'],
    ['Band too heavy', 'Shrugging']
  ),
};
