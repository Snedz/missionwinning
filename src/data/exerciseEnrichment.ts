import type { Exercise, ExerciseLevel, ProgramTag } from "@/types";

/** Legacy library cues merged onto exercises at export time. */
export const LIBRARY_CUE_OVERRIDES: Record<string, string> = {
  "bench-press":
    "Feet flat, scapulae retracted, bar touches mid-chest. Drive through heels of hands. No bounce.",
  squats:
    "Brace core, knees track over toes, depth to parallel or below if mobility allows. Drive through midfoot.",
  deadlift:
    "Hips back first, bar close to shins, neutral spine. Lock hips and knees at top. Reset each rep.",
  "pull-ups":
    "Full range, chin over bar at top. Controlled lower. Use bands or negatives for regression.",
  thruster:
    "Front rack position, squat then drive and press in one fluid motion. Core braced throughout.",
  "push-ups":
    "Body straight, lower chest to floor, full lockout. Scale with knees or incline for beginners.",
  "overhead-press":
    "Core tight, bar path straight up, lock elbows overhead. No excessive lean back.",
  "barbell-row":
    "Hinge at hips, pull bar to lower chest, squeeze shoulder blades. Neutral spine always.",
  plank: "Body in straight line, engage glutes and core, breathe steady. Hold 20–60s.",
  lunges: "Step forward, knee tracks over ankle, back knee nearly touches. Alternate or static.",
  burpees: "Squat, kick back to plank, pushup optional, jump. Modify by stepping back.",
  "dead-bug":
    "Lower back glued to floor. Opposite arm/leg reach without arching. Slow and controlled.",
  "bird-dog": "On all fours, extend opposite arm/leg, keep hips level. Hold and squeeze.",
  "glute-bridge":
    "Drive through heels, full hip extension at top, squeeze glutes 2s. Don't overarch low back.",
  "cat-camel": "On all fours, alternate arch and round spine with breath. Great warm-up.",
  "band-pull-apart":
    "Pull band apart at shoulder height, squeeze shoulder blades. Control return.",
  "face-pull-band":
    "Pull band to face, rotate externally at end. Rear delts and posture.",
  "face-pull": "Pull rope to face level, external rotation at end. Shoulder health staple.",
  "romanian-deadlift":
    "Hinge from hips, slight knee bend, bar close to legs. Feel hamstrings stretch.",
  "kettlebell-swing":
    "Hinge, snap hips, arms loose. Explosive hip drive for posterior chain.",
  "hip-thrust":
    "Shoulders on bench, drive hips up, squeeze glutes hard at top.",
  "lat-pulldown":
    "Pull bar to upper chest, lean slightly back, squeeze lats. Control the return.",
  "leg-extension":
    "Control the negative, squeeze at top. Quad isolation and knee health.",
  "seated-calf": "Full stretch at bottom, pause and squeeze at top. Targets soleus.",
  "preacher-curl": "No momentum, full extension, squeeze at top. Strict bicep isolation.",
  "lateral-raise":
    "Lead with elbows, slight lean, stop at shoulder height. Unilateral for symmetry.",
  "bicep-curl": "Control eccentric, full stretch at bottom, no swing.",
  "tricep-pushdown": "Elbows pinned, full extension, squeeze triceps at bottom.",
  "incline-bench": "Bench 30–45°, retract scapulae, bar to upper chest, controlled lower.",
  "dumbbell-press": "Neutral or pronated grip, full range, dumbbells meet at top without clashing.",
  "front-squat": "Elbows high, bar on front delts, upright torso, core braced throughout.",
  "leg-press": "Feet mid-platform, lower until knees ~90°, drive through whole foot, no butt lift.",
  "leg-curl": "Hips pinned, curl to glutes, slow eccentric, squeeze hamstrings at top.",
  "calf-raise": "Full stretch at bottom, pause at top, straight or bent knee per machine setup.",
  "cable-row": "Torso stable, pull to lower ribs, squeeze shoulder blades, control return.",
  "hammer-curl": "Neutral grip, elbows at sides, no swing, full extension at bottom.",
  "skull-crusher": "Elbows fixed, lower to forehead or behind head, extend without flaring elbows.",
  crunches: "Ribs toward pelvis, chin off chest, exhale on crunch, no neck pulling.",
  "hanging-leg-raise": "Depress shoulders, posterior pelvic tilt, raise legs with control.",
  "box-jump": "Soft landing on box, stand fully, step down — reset each rep for quality.",
  "wall-ball": "Squat to parallel, drive hips, throw to target, catch and absorb into next squat.",
  "double-under": "Wrists spin rope, small jump, practice singles until rhythm is consistent.",
  "kettlebell-swing-2h": "Hinge, snap hips, arms relaxed; bell floats to chest height, not overhead.",
  "burpee-pullup": "Burpee under bar, jump to pull-up, full chin over bar when possible.",
  "sled-push": "Low body angle, drive through balls of feet, short powerful steps, steady breathing.",
};

/** Common substitutions by exercise id. */
export const EXERCISE_ALTERNATIVES: Record<string, string[]> = {
  "bench-press": ["dumbbell-press", "floor-press", "push-ups"],
  "squats": ["goblet-squat", "front-squat", "leg-press", "air-squat"],
  deadlift: ["romanian-deadlift", "trap-bar-deadlift", "good-morning-bw"],
  "pull-ups": ["lat-pulldown", "inverted-row", "ring-row", "negative-pullup"],
  "overhead-press": ["dumbbell-shoulder-press", "pike-pushup", "landmine-press"],
  "barbell-row": ["dumbbell-row", "cable-row", "landmine-row", "inverted-row"],
  "lunges": ["reverse-lunge", "split-squat", "landmine-reverse-lunge", "bulgarian-split-squat"],
  burpees: ["mountain-climbers", "jump-squats", "high-knees"],
  thruster: ["goblet-squat", "landmine-thruster", "overhead-press", "wall-ball"],
  "front-squat": ["goblet-squat", "landmine-squat", "squats", "air-squat"],
  plank: ["dead-bug", "hollow-hold", "side-plank"],
  "bicep-curl": ["hammer-curl", "preacher-curl", "cable-curl"],
  "tricep-pushdown": ["skull-crusher", "dips-chair", "close-grip-pushup"],
  "lat-pulldown": ["pull-ups", "cable-row", "ring-row"],
  "leg-press": ["squats", "goblet-squat", "hack-squat"],
  "romanian-deadlift": ["good-morning-bw", "landmine-rdl", "single-leg-rdl", "hip-hinge-db"],
  "hip-thrust": ["glute-bridge", "single-leg-glute", "hip-thrust"],
  "push-ups": ["decline-pushup", "diamond-pushup", "bench-press"],
  "incline-bench": ["dumbbell-press", "decline-pushup", "bench-press"],
  "kettlebell-swing": ["kettlebell-swing-2h", "good-morning-bw", "hip-thrust"],
  "pallof-press": ["landmine-antirotation-press", "dead-bug", "side-plank"],
  "face-pull": ["face-pull-band", "band-pull-apart", "rear-delt-fly"],
  "band-pull-apart": ["face-pull-band", "rear-delt-fly", "wall-angels"],
  "dead-bug": ["bird-dog", "plank", "hollow-hold"],
  "bird-dog": ["dead-bug", "superman", "glute-bridge"],
};

const TAG_PATTERNS: { tag: ProgramTag; re: RegExp }[] = [
  {
    tag: "corrective",
    re: /corrective|mobility|prehab|posture|activation|band pull|dead bug|bird dog|face pull|stretch|flow|release|90-90|thread|angel|inchworm|cobra|pigeon|frog|ankle|thoracic|cat-camel|glute bridge|superman|wall angel|couch|pallof|clamshell|fire hydrant|monster walk|scapular|dislocate|rotation|rehab|symmetry|unilateral correction/i,
  },
  {
    tag: "conditioning",
    re: /cardio|burpee|jump|rope|conditioning|metcon|thruster|wall ball|sled|battle rope|high knee|skater|mountain climber|double under|swing|slam|tuck|plyo|emom|amrap|interval|assault|rower|prowler|tire|carry|farmer|sprint|bike/i,
  },
  {
    tag: "hypertrophy",
    re: /drop set|giant set|fly|isolation|hypertrophy|pump|sarcoplasmic|peak contraction|pre-exhaust|lateral raise|leg extension|preacher|crossover|euroblast|superset|curl|extension|pec deck|kickback|pump|8-12|12-15|muscle growth|bodybuilding/i,
  },
  {
    tag: "strength",
    re: /squat|deadlift|bench|press|row|pull-up|ohp|overhead|5x5|rest-pause squat|pyramid|strength|heavy|compound|power|1rm|peaking|clean|snatch|floor press|pin squat|pause squat|box squat/i,
  },
];

const LEVEL_PATTERNS: { level: ExerciseLevel; re: RegExp }[] = [
  { level: "advanced", re: /advanced|drop set|giant set|forced rep|dc training|20-rep|muscle-up|handstand|pistol|nordic|snatch|clean and jerk|negative pull|rest-pause|euroblast|pro/i },
  { level: "beginner", re: /beginner|regression|assisted|chair|wall sit|air squat|band|intro|starter|basic/i },
];

export function inferExerciseTags(ex: Exercise): ProgramTag[] {
  if (ex.tags?.length) return ex.tags;
  const text = `${ex.name} ${ex.cues ?? ""} ${ex.muscleGroups.join(" ")} ${ex.equipment ?? ""}`;
  const tags = TAG_PATTERNS.filter(({ re }) => re.test(text)).map(({ tag }) => tag);
  if (tags.length === 0) tags.push("strength");
  return [...new Set(tags)];
}

export function inferExerciseLevel(ex: Exercise): ExerciseLevel | undefined {
  if (ex.level) return ex.level;
  const text = `${ex.name} ${ex.cues ?? ""}`;
  for (const { level, re } of LEVEL_PATTERNS) {
    if (re.test(text)) return level;
  }
  return undefined;
}

export function enrichExercise(ex: Exercise): Exercise {
  const cues = ex.cues ?? LIBRARY_CUE_OVERRIDES[ex.id];
  const alternatives = ex.alternatives ?? EXERCISE_ALTERNATIVES[ex.id];
  const tags = inferExerciseTags({ ...ex, cues });
  const level = inferExerciseLevel({ ...ex, cues });
  return {
    ...ex,
    ...(cues ? { cues } : {}),
    ...(alternatives?.length ? { alternatives } : {}),
    tags,
    ...(level ? { level } : {}),
  };
}

export function enrichExercises(list: Exercise[]): Exercise[] {
  return list.map(enrichExercise);
}

export const PROGRAM_TAG_LABELS: Record<ProgramTag, string> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  conditioning: "Conditioning",
  corrective: "Corrective",
};
