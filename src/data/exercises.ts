import type { Exercise } from "@/types";
import { enrichExercises } from "@/data/exerciseEnrichment";

const EXERCISE_ENTRIES: Exercise[] = [
  { id: "push-ups", name: "Push-ups", muscleGroups: ["Chest", "Arms", "Core"], equipment: "Bodyweight" },
  { id: "pull-ups", name: "Pull-ups", muscleGroups: ["Back", "Arms"], equipment: "Bodyweight" },
  { id: "bench-press", name: "Bench Press", muscleGroups: ["Chest", "Arms"], equipment: "Barbell" },
  { id: "incline-bench", name: "Incline Bench Press", muscleGroups: ["Chest", "Shoulders"], equipment: "Barbell" },
  { id: "dumbbell-press", name: "Dumbbell Chest Press", muscleGroups: ["Chest", "Arms"], equipment: "Dumbbells" },
  { id: "squats", name: "Squats", muscleGroups: ["Legs", "Core"], equipment: "Barbell" },
  { id: "front-squat", name: "Front Squat", muscleGroups: ["Legs", "Core"], equipment: "Barbell" },
  { id: "deadlift", name: "Deadlift", muscleGroups: ["Back", "Legs"], equipment: "Barbell" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", muscleGroups: ["Legs", "Back"], equipment: "Barbell" },
  { id: "lunges", name: "Lunges", muscleGroups: ["Legs"], equipment: "Dumbbells" },
  { id: "leg-press", name: "Leg Press", muscleGroups: ["Legs"], equipment: "Machine" },
  { id: "leg-curl", name: "Leg Curl", muscleGroups: ["Legs"], equipment: "Machine" },
  { id: "calf-raise", name: "Calf Raise", muscleGroups: ["Legs"], equipment: "Machine" },
  { id: "overhead-press", name: "Overhead Press", muscleGroups: ["Shoulders", "Arms"], equipment: "Barbell" },
  { id: "lateral-raise", name: "Lateral Raise", muscleGroups: ["Shoulders"], equipment: "Dumbbells" },
  { id: "face-pull", name: "Face Pull", muscleGroups: ["Shoulders", "Back"], equipment: "Cable" },
  { id: "barbell-row", name: "Barbell Row", muscleGroups: ["Back", "Arms"], equipment: "Barbell" },
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroups: ["Back", "Arms"], equipment: "Cable" },
  { id: "cable-row", name: "Seated Cable Row", muscleGroups: ["Back", "Arms"], equipment: "Cable" },
  { id: "bicep-curl", name: "Bicep Curl", muscleGroups: ["Arms"], equipment: "Dumbbells" },
  { id: "hammer-curl", name: "Hammer Curl", muscleGroups: ["Arms"], equipment: "Dumbbells" },
  { id: "tricep-pushdown", name: "Tricep Pushdown", muscleGroups: ["Arms"], equipment: "Cable" },
  { id: "skull-crusher", name: "Skull Crusher", muscleGroups: ["Arms"], equipment: "Barbell" },
  { id: "plank", name: "Plank", muscleGroups: ["Core"], equipment: "Bodyweight" },
  { id: "crunches", name: "Crunches", muscleGroups: ["Core"], equipment: "Bodyweight" },
  { id: "hanging-leg-raise", name: "Hanging Leg Raise", muscleGroups: ["Core"], equipment: "Bodyweight" },
  { id: "burpees", name: "Burpees", muscleGroups: ["Full Body", "Cardio"], equipment: "Bodyweight" },
  { id: "box-jump", name: "Box Jump", muscleGroups: ["Legs", "Cardio"], equipment: "Box" },
  { id: "kettlebell-swing", name: "Kettlebell Swing", muscleGroups: ["Full Body", "Legs"], equipment: "Kettlebell" },
  { id: "hip-thrust", name: "Hip Thrust", muscleGroups: ["Legs", "Core"], equipment: "Barbell" },
  // Bodybuilding / Isolation + symmetry (from Ch10 specialist: isolation for weak points, unilateral, origin/insertion stress, myofibrillar vs sarcoplasmic, shaping via rep ranges/volume)
  { id: "dumbbell-fly", name: "Dumbbell Fly", muscleGroups: ["Chest"], equipment: "Dumbbells", cues: "Control eccentric, deep stretch at bottom, squeeze pecs at top without locking elbows. Use for sarcoplasmic hypertrophy (higher reps). Unilateral option for lagging side." },
  { id: "cable-crossover", name: "Cable Crossover", muscleGroups: ["Chest"], equipment: "Cable", cues: "Slight forward lean, cross hands at bottom for full contraction. High-to-low for lower pecs, low-to-high for upper. Attack origin/insertion." },
  { id: "lateral-raise-db", name: "Lateral Raise", muscleGroups: ["Shoulders"], equipment: "Dumbbells", cues: "Lead with elbows, slight lean, stop at shoulder height. Unilateral for symmetry on lagging delt. Avoid swinging – pure isolation for side delt cap." },
  { id: "rear-delt-fly", name: "Rear Delt Fly", muscleGroups: ["Shoulders", "Back"], equipment: "Dumbbells", cues: "Hinge at hips, lead elbows back, squeeze rear delts/scaps. Critical for symmetry and posture; often lagging in bodybuilders." },
  { id: "triceps-extension", name: "Overhead Triceps Extension", muscleGroups: ["Arms"], equipment: "Dumbbells", cues: "Full stretch at bottom, lockout at top without flare. Unilateral to bring up weaker arm. Use for long head emphasis." },
  { id: "leg-extension", name: "Leg Extension", muscleGroups: ["Legs"], equipment: "Machine", cues: "Full contraction at top (squeeze quads), slow negative. Unilateral for vastus medialis 'tear drop' sweep. Isolation overload for quads weak points." },
  { id: "seated-calf", name: "Seated Calf Raise", muscleGroups: ["Legs"], equipment: "Machine", cues: "Full stretch at bottom (dorsiflex), pause at top. Targets soleus (deeper calf). Higher reps for sarcoplasmic growth." },
  { id: "preacher-curl", name: "Preacher Curl", muscleGroups: ["Arms"], equipment: "Barbell", cues: "No swing, full extension at bottom, squeeze at top. Unilateral DB version for lagging bicep. Strict form for peak contraction." },
  // Periodization notes integrated into programs (from Ch9: ABC model, linear/reverse/undulating/block, Granddaddy Laws, fast/slow gainers, recovery)
  // Corrective / Mobility (from corrective course forms & analysis)
  { id: "band-pull-apart", name: "Band Pull-Apart", muscleGroups: ["Shoulders", "Back"], equipment: "Band" },
  { id: "dead-bug", name: "Dead Bug", muscleGroups: ["Core"], equipment: "Bodyweight" },
  { id: "bird-dog", name: "Bird Dog", muscleGroups: ["Core", "Back"], equipment: "Bodyweight" },
  { id: "glute-bridge", name: "Glute Bridge", muscleGroups: ["Legs", "Core"], equipment: "Bodyweight" },
  { id: "face-pull-band", name: "Face Pull (Band)", muscleGroups: ["Shoulders", "Back"], equipment: "Band" },
  { id: "cat-camel", name: "Cat-Camel", muscleGroups: ["Core", "Back"], equipment: "Bodyweight" },
  { id: "superman", name: "Superman Hold", muscleGroups: ["Back", "Core"], equipment: "Bodyweight", cues: "Lie face down, lift arms/legs/chest off floor, squeeze lower back/glutes. Hold 10-30s. Free back extensor strength for posture." },
  { id: "wall-sit", name: "Wall Sit", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Back flat on wall, knees 90deg, hold. Build quad endurance. Free isometric for beginners or rehab." },
  { id: "step-ups", name: "Step-Ups", muscleGroups: ["Legs"], equipment: "Box/Bench", cues: "Step up driving through heel, knee tracks over ankle. Alternate. Free functional leg strength, scale height." },
  { id: "inverted-row", name: "Inverted Row (under table/bar)", muscleGroups: ["Back"], equipment: "Bodyweight/Table", cues: "Pull chest to bar/table edge, body straight. Scale angle for difficulty. Free horizontal pull for back." },
  { id: "pike-pushup", name: "Pike Push-ups", muscleGroups: ["Shoulders"], equipment: "Bodyweight", cues: "Hips high, lower head toward hands. Builds shoulder strength. Free vertical press regression." },
  { id: "single-leg-glute", name: "Single-Leg Glute Bridge", muscleGroups: ["Legs", "Core"], equipment: "Bodyweight", cues: "One leg up, drive hips, squeeze glute. Unilateral for imbalance correction. Free advanced glute work." },
  { id: "mountain-climbers", name: "Mountain Climbers", muscleGroups: ["Core", "Cardio"], equipment: "Bodyweight", cues: "Fast knee drives in plank. Keep hips low. Free cardio + core burner." },
  { id: "jump-squats", name: "Jump Squats", muscleGroups: ["Legs", "Cardio"], equipment: "Bodyweight", cues: "Explode up from squat, soft land. Power and conditioning. Free plyo for legs." },
  { id: "dips-chair", name: "Chair Dips", muscleGroups: ["Arms"], equipment: "Chair/Bench", cues: "Lower body with elbows back, push up. Tricep focus. Free upper body using everyday object." },
  { id: "side-plank", name: "Side Plank", muscleGroups: ["Core"], equipment: "Bodyweight", cues: "Stack hips, lift top arm or leg for challenge. Hold 20-60s per side. Free oblique stability." },
  // Conditioning / Metcon (CrossFit-style + specialist)
  { id: "thruster", name: "Thruster", muscleGroups: ["Full Body"], equipment: "Barbell" },
  { id: "wall-ball", name: "Wall Ball", muscleGroups: ["Full Body", "Legs"], equipment: "Medicine Ball" },
  { id: "double-under", name: "Double Under", muscleGroups: ["Cardio"], equipment: "Jump Rope" },
  { id: "kettlebell-swing-2h", name: "Two-Handed Kettlebell Swing", muscleGroups: ["Full Body", "Legs"], equipment: "Kettlebell" },
  { id: "burpee-pullup", name: "Burpee + Pull-up", muscleGroups: ["Full Body"], equipment: "Bodyweight" },
  { id: "sled-push", name: "Sled Push", muscleGroups: ["Legs", "Full Body"], equipment: "Sled" },
  // Advanced Bodybuilding methods from Ch11 (supersets, drop sets, giant sets, rest-pause, pyramiding, forced reps, negatives, peak contraction, etc. for hypertrophy focus)
  { id: "superset-bench-row", name: "Superset: Bench Press + Bent Over Row", muscleGroups: ["Chest", "Back"], equipment: "Barbell", cues: "Perform bench then immediately row with no rest. Opposing muscle groups for efficiency and pump. From bodybuilding methods: alternate push/pull for symmetry." },
  { id: "drop-set-lateral-raise", name: "Drop Set Lateral Raise", muscleGroups: ["Shoulders"], equipment: "Dumbbells", cues: "Start heavy, reps to failure, drop 20-30% weight, continue to failure. Repeat 2-3 drops. Induces sarcoplasmic hypertrophy and pump per Ch11 techniques." },
  { id: "giant-set-shoulders", name: "Giant Set: Delts (Lateral + Front + Rear Raises)", muscleGroups: ["Shoulders"], equipment: "Dumbbells", cues: "3+ exercises back to back no rest: lateral, front, rear delt raises. Targets all heads for full cap development and symmetry. Use for weak point training." },
  { id: "rest-pause-squat", name: "Rest-Pause Squat", muscleGroups: ["Legs"], equipment: "Barbell", cues: "85-95% 1RM single, rest 15-30s, repeat 6-8 singles. CNS heavy but builds strength/hypertrophy. From advanced methods: great for 20-rep breathing squats variation." },
  { id: "forced-rep-bench", name: "Forced Rep Bench (Partner)", muscleGroups: ["Chest", "Arms"], equipment: "Barbell", cues: "To failure, partner assists 2-3 extra reps. Builds intensity beyond failure. Use sparingly for advanced lifters per bodybuilding traditions." },
  { id: "negative-pullup", name: "Negative Pull-ups", muscleGroups: ["Back", "Arms"], equipment: "Bodyweight", cues: "Jump or assisted to top, lower slowly 5-8s. Eccentric focus for strength and hypertrophy. Regression for pull-ups." },
  { id: "peak-contraction-curl", name: "Peak Contraction Bicep Curl", muscleGroups: ["Arms"], equipment: "Dumbbells", cues: "At top of curl, hold and squeeze for 2s peak contraction. Weider principle for mind-muscle connection and bicep peak." },
  // More from Ch11: EuroBlast, staggered sets, pyramiding, pre/post exhaustion, 20-rep squats, DC training, Weider, heavy duty, etc.
  { id: "euroblast-curl", name: "EuroBlast Bicep Pump", muscleGroups: ["Arms"], equipment: "Dumbbells", cues: "High volume pump: continuous up/down motion with light weight for 30-60s to flood muscle with blood/nutrients. Ch11 technique for hypertrophy via metabolic stress." },
  { id: "staggered-curls", name: "Staggered Concentration Curls", muscleGroups: ["Arms"], equipment: "Dumbbells", cues: "Alternate arms or do partials between sets for lagging biceps. Builds focus on weak points without full fatigue." },
  { id: "pyramid-bench", name: "Traditional Pyramid Bench", muscleGroups: ["Chest"], equipment: "Barbell", cues: "Start light high reps, increase weight decrease reps up pyramid, then reverse down. Classic for progressive overload and volume." },
  { id: "pre-exhaust-fly", name: "Pre-Exhaust Fly to Bench", muscleGroups: ["Chest"], equipment: "Dumbbells", cues: "Do isolation fly first to fatigue pecs, then compound bench for deeper stimulus. Pre-exhaust method from Ch11." },
  { id: "20-rep-squat", name: "20-Rep Breathing Squats", muscleGroups: ["Legs"], equipment: "Barbell", cues: "Heavy 20 reps with breathing pauses at top. Legendary for leg mass and mental toughness. Rest-pause variation." },
  { id: "dc-training-restpause", name: "DC Training Rest-Pause", muscleGroups: ["Full Body"], equipment: "Various", cues: "Rest-pause 3x to failure on key lifts (e.g. 8-12 reps). Extreme intensity for advanced. DC style from Ch11." },
  // Extra free core mobility / bodyweight depth (global, no equipment)
  { id: "couch-stretch", name: "Couch Stretch", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Knee on floor or couch, front foot forward, drive hips — deep quad/hip flexor. 45-90s/side. Free daily hip opener." },
  { id: "inchworm", name: "Inchworm", muscleGroups: ["Full Body", "Core"], equipment: "Bodyweight", cues: "Walk hands out to plank, walk feet to hands. 6-8 slow reps. Free hamstring + wrist + core mobility primer." },
  { id: "bear-crawl", name: "Bear Crawl", muscleGroups: ["Full Body", "Core"], equipment: "Bodyweight", cues: "Low hips, opposite hand/knee, crawl forward/back 10-20 steps. Free full-body coordination and shoulder stability." },
  { id: "worlds-greatest-stretch", name: "World's Greatest Stretch", muscleGroups: ["Full Body"], equipment: "Bodyweight", cues: "Deep lunge with rotation and reach. Free full chain opener for hips, thoracic, shoulders." },
  { id: "childs-pose-cobra", name: "Child's Pose to Cobra", muscleGroups: ["Back", "Core"], equipment: "Bodyweight", cues: "Flow between gentle backbend and fold. Free spine mobility and recovery." },
  { id: "seated-spinal-twist", name: "Seated Spinal Twist", muscleGroups: ["Back"], equipment: "Bodyweight", cues: "Cross leg twist for spine and hip mobility. Free daily reset from desk or training." },
  { id: "standing-quad-stretch", name: "Standing Quad Stretch", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Pull heel to glute, balance on one leg. Free quad open + stability for legs." },
  { id: "wall-chest-opener", name: "Wall Chest Opener", muscleGroups: ["Chest", "Shoulders"], equipment: "Bodyweight", cues: "Hands on wall, lean forward. Free counter to forward posture, opens chest/shoulders." },
  { id: "pigeon-to-down-dog", name: "Pigeon to Down Dog Flow", muscleGroups: ["Legs", "Full Body"], equipment: "Bodyweight", cues: "From pigeon pose to down dog. Free hip opener with full body stretch." },
  { id: "calf-raise-ankle-rock", name: "Calf Raise to Ankle Rock", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Raise heels then rock forward. Free lower leg mobility and ankle stability." },
  { id: "seated-forward-fold-twist", name: "Seated Forward Fold + Twist", muscleGroups: ["Back", "Legs"], equipment: "Bodyweight", cues: "Fold then twist for hamstrings and spine. Free daily mobility staple." },
  { id: "standing-balance-quad", name: "Standing Balance Quad Stretch", muscleGroups: ["Legs", "Core"], equipment: "Bodyweight", cues: "Quad stretch with balance challenge. Free stability and flexibility." },
  { id: "hip-90-90-flow", name: "90/90 Hip Flow", muscleGroups: ["Legs", "Full Body"], equipment: "Bodyweight", cues: "Switch between 90/90 positions with rock. Free deep hip mobility for daily or post training." },
  { id: "superman-to-yti", name: "Superman to Y-T-I", muscleGroups: ["Back", "Core"], equipment: "Bodyweight", cues: "Hold superman then lift arms in Y T I shapes. Free back and scapular strength + mobility." },
  { id: "wall-angels", name: "Wall Angels", muscleGroups: ["Shoulders", "Back"], equipment: "Bodyweight", cues: "Back flat on wall, arms slide up/down like snow angel. 8-10 reps. Free scapular mobility + posture reset." },
  { id: "thread-needle", name: "Thread the Needle", muscleGroups: ["Back", "Shoulders"], equipment: "Bodyweight", cues: "On all fours, thread one arm under, rotate and reach. 6-8/side. Free thoracic rotation." },
  { id: "frog-pose", name: "Frog Pose Hold", muscleGroups: ["Legs", "Full Body"], equipment: "Bodyweight", cues: "Knees wide, hips low, ankles in. Breathe 45-90s. Free deep hip opener." },
  { id: "bear-hug-hold", name: "Bear Hug Hold (Imaginary)", muscleGroups: ["Back", "Core", "Arms"], equipment: "Bodyweight", cues: "Squeeze imaginary tree or self hard 20-40s. Isometric for upper back and posture." },
  { id: "shrimp-squat-reg", name: "Shrimp Squat Regression (Assisted)", muscleGroups: ["Legs", "Core"], equipment: "Bodyweight", cues: "Hold wall or chair, one leg back, squat on front. 5-8/side. Single leg strength builder." },
  { id: "neck-circles-release", name: "Neck Circles + Jaw Release", muscleGroups: ["Back", "Shoulders"], equipment: "Bodyweight", cues: "Slow circles 5 each way + open/close jaw gently. Counter desk tension." },
  { id: "ankle-dorsiflex-rock", name: "Ankle Dorsiflexion Rocks", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Knee over toes, rock forward 10-15/side against wall or floor. Squat depth + walking health." },
  { id: "thoracic-rot-quad", name: "Thoracic Rotations on All Fours", muscleGroups: ["Back", "Core"], equipment: "Bodyweight", cues: "Open chest, follow hand with eyes 8/side. Upper back mobility for presses and posture." },
  { id: "down-dog-cobra-flow", name: "Down Dog to Cobra Flow", muscleGroups: ["Full Body"], equipment: "Bodyweight", cues: "Flow 6 slow reps. Posterior chain + hip flexor + spine." },
  { id: "child-pose-thread", name: "Child's Pose to Thread Needle", muscleGroups: ["Back", "Shoulders"], equipment: "Bodyweight", cues: "Alternate fold and thread 5-6/side. Gentle recovery for spine and shoulders." },
  { id: "single-leg-stand-hold", name: "Single Leg Balance Hold", muscleGroups: ["Legs", "Core"], equipment: "Bodyweight", cues: "Stand on one leg 20-45s/side. Ankle/knee/hip stability + focus." },
  { id: "pushup-to-down-dog", name: "Push-up to Down Dog", muscleGroups: ["Full Body"], equipment: "Bodyweight", cues: "Pushup then pike hips up. 6-8 reps. Shoulder + hamstring + core link." },
  { id: "lunge-with-reach", name: "Lunge with Overhead Reach", muscleGroups: ["Legs", "Full Body"], equipment: "Bodyweight", cues: "Front lunge + reach tall 6/side. Hip + thoracic + stability." },
  { id: "crawl-to-inchworm", name: "Bear Crawl to Inchworm", muscleGroups: ["Full Body", "Core"], equipment: "Bodyweight", cues: "Crawl 8 steps then inchworm back. 4-5 rounds. Free coordination, shoulder, wrist, hamstring." },
  // Additional global bodyweight / minimal-equipment (M&S / BB.com scale path)
  { id: "air-squat", name: "Air Squat", muscleGroups: ["Legs", "Core"], equipment: "Bodyweight", cues: "Feet shoulder width, break parallel if mobile, chest up. High-rep finisher or daily habit." },
  { id: "hollow-hold", name: "Hollow Body Hold", muscleGroups: ["Core"], equipment: "Bodyweight", cues: "Lower back pressed to floor, arms/legs extended. 20-40s. Gymnastics core staple." },
  { id: "v-up", name: "V-Up", muscleGroups: ["Core"], equipment: "Bodyweight", cues: "Touch toes at top, control down. Scale with bent knees." },
  { id: "reverse-lunge", name: "Reverse Lunge", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Step back, knee hovers, drive through front heel. Easier on knees than forward lunge." },
  { id: "box-pistol-reg", name: "Box Pistol Regression", muscleGroups: ["Legs", "Core"], equipment: "Box/Bench", cues: "Sit to box on one leg, minimal hand assist. Build toward pistol squat." },
  { id: "scap-pullup", name: "Scapular Pull-up", muscleGroups: ["Back", "Shoulders"], equipment: "Bodyweight", cues: "Hang, depress and retract scapula without bending elbows. Shoulder health primer." },
  { id: "banded-dislocate", name: "Banded Shoulder Dislocate", muscleGroups: ["Shoulders", "Back"], equipment: "Band", cues: "Wide grip, slow arc overhead to hips. Prep for pressing and overhead work." },
  { id: "farmers-walk-dbs", name: "Farmer's Walk (DBs/Bags)", muscleGroups: ["Full Body", "Core"], equipment: "Dumbbells", cues: "Tall posture, brisk steps 20-40m. Grip, core, conditioning in one." },
  { id: "suitcase-carry", name: "Suitcase Carry", muscleGroups: ["Core", "Full Body"], equipment: "Dumbbells", cues: "One side loaded, walk without leaning. Anti-lateral flexion core strength." },
  { id: "wall-handstand-hold", name: "Wall Handstand Hold", muscleGroups: ["Shoulders", "Core"], equipment: "Bodyweight", cues: "Chest to wall or facing wall kick-up. 15-30s. Shoulder endurance + body awareness." },
  { id: "jumping-jack", name: "Jumping Jacks", muscleGroups: ["Cardio", "Full Body"], equipment: "Bodyweight", cues: "Warm-up or conditioning filler. Low skill, global-friendly." },
  { id: "high-knees", name: "High Knees", muscleGroups: ["Cardio", "Legs"], equipment: "Bodyweight", cues: "Drive knees up, quick feet 30-60s. Warm-up or interval work." },
  { id: "skater-hop", name: "Skater Hops", muscleGroups: ["Legs", "Cardio"], equipment: "Bodyweight", cues: "Lateral bounds, soft landings. Athletic conditioning without equipment." },
  { id: "good-morning-bw", name: "Good Morning (Bodyweight)", muscleGroups: ["Back", "Legs"], equipment: "Bodyweight", cues: "Hands behind head, hinge hips, flat back. Hamstring + back endurance." },
  { id: "cossack-squat", name: "Cossack Squat", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Shift side to side in deep squat. Hip + ankle mobility + leg strength." },
  { id: "tuck-jump", name: "Tuck Jump", muscleGroups: ["Legs", "Cardio"], equipment: "Bodyweight", cues: "Explosive jump, knees to chest, soft land. Power finisher." },
  { id: "ring-row", name: "Ring/TRX Row", muscleGroups: ["Back", "Arms"], equipment: "Rings/TRX", cues: "Body angle sets difficulty. Horizontal pull scalable anywhere." },
  { id: "decline-pushup", name: "Decline Push-up", muscleGroups: ["Chest", "Shoulders"], equipment: "Bodyweight", cues: "Feet elevated. Progression toward pike and handstand push-up." },
  { id: "diamond-pushup", name: "Diamond Push-up", muscleGroups: ["Chest", "Arms"], equipment: "Bodyweight", cues: "Hands close, elbows track back. Tricep emphasis." },
  { id: "split-squat", name: "Split Squat", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Static lunge bottom, vertical torso. Unilateral leg builder." },
  { id: "nordic-curl-reg", name: "Nordic Curl Regression", muscleGroups: ["Legs"], equipment: "Bodyweight", cues: "Anchor feet, slow lower with hands catch. Hamstring strength progressions." },
  { id: "jump-rope-single", name: "Single Unders (Jump Rope)", muscleGroups: ["Cardio"], equipment: "Jump Rope", cues: "Light feet, minimal jump height. Cheap global conditioning tool." },
  { id: "medicine-ball-slam", name: "Med Ball Slam", muscleGroups: ["Full Body", "Core"], equipment: "Medicine Ball", cues: "Overhead to floor with full extension. Power + stress relief." },
  { id: "battle-rope-alt", name: "Battle Rope Alternating Waves", muscleGroups: ["Cardio", "Arms"], equipment: "Battle Ropes", cues: "Fast alternating waves 20-30s. Conditioning if gym has ropes." },
  { id: "sled-drag-reg", name: "Sled Drag Regression (Tow Strap)", muscleGroups: ["Legs", "Full Body"], equipment: "Sled", cues: "Walk backward dragging load. Low-impact leg drive." },
];

/** Deduplicated exercise list (first entry wins per id). */
function dedupeExercises(list: Exercise[]): Exercise[] {
  const seen = new Set<string>();
  const out: Exercise[] = [];
  for (const ex of list) {
    if (seen.has(ex.id)) continue;
    seen.add(ex.id);
    out.push(ex);
  }
  return out;
}

export const EXERCISES: Exercise[] = enrichExercises(dedupeExercises(EXERCISE_ENTRIES));

let extendedCatalogLoaded = false;
let extendedCatalogPromise: Promise<void> | null = null;

/** Lazy-load extended + volume-2 catalogs (large JSON modules). Safe to call repeatedly. */
export function ensureFullExerciseCatalog(): Promise<void> {
  if (extendedCatalogLoaded) return Promise.resolve();
  if (!extendedCatalogPromise) {
    extendedCatalogPromise = Promise.all([
      import('@/data/exercisesExtended'),
      import('@/data/exercisesVolume2'),
    ]).then(([extended, volume2]) => {
      const merged = enrichExercises(
        dedupeExercises([
          ...EXERCISE_ENTRIES,
          ...extended.EXERCISES_EXTENDED,
          ...volume2.EXERCISES_VOLUME_2,
        ])
      );
      EXERCISES.splice(0, EXERCISES.length, ...merged);
      extendedCatalogLoaded = true;
    });
  }
  return extendedCatalogPromise;
}

export function isFullExerciseCatalogLoaded(): boolean {
  return extendedCatalogLoaded;
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
