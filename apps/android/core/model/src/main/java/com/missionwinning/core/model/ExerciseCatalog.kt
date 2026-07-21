package com.missionwinning.core.model

/**
 * Offline exercise library — Phase 1 logger parity.
 * IDs match LocalCoachSeed / mw-core seed plan where possible.
 */
data class ExerciseDef(
    val id: String,
    val name: String,
    /** Equipment profiles that can perform this move. */
    val equipment: Set<String>,
    val muscleGroups: List<String> = emptyList(),
    val isBodyweight: Boolean = false,
)

object ExerciseCatalog {
    private val BW = "bodyweight"
    private val DB = "dumbbells"
    private val GYM = "full-gym"

    val all: List<ExerciseDef> = listOf(
        // Bodyweight core (existing — IDs must stay stable)
        e("pushup", "Push-up", setOf(BW, DB, GYM), listOf("chest", "triceps"), true),
        e("plank", "Plank", setOf(BW, DB, GYM), listOf("core"), true),
        e("squat", "Bodyweight squat", setOf(BW), listOf("quads", "glutes"), true),
        e("hip-hinge", "Hip hinge (bodyweight)", setOf(BW), listOf("hamstrings", "glutes"), true),
        e("row", "Inverted row / table row", setOf(BW), listOf("back"), true),
        e("chinup", "Chin-up", setOf(BW, GYM), listOf("back", "biceps"), true),
        e("pullup", "Pull-up", setOf(BW, GYM), listOf("back"), true),
        e("dip", "Dip", setOf(BW, GYM), listOf("chest", "triceps"), true),
        e("lunge", "Walking lunge", setOf(BW, DB, GYM), listOf("quads", "glutes"), true),
        e("glute-bridge", "Glute bridge", setOf(BW, DB, GYM), listOf("glutes"), true),
        e("side-plank", "Side plank", setOf(BW, DB, GYM), listOf("core"), true),
        e("burpee", "Burpee", setOf(BW), listOf("full body"), true),
        e("jumping-jack", "Jumping jack", setOf(BW), listOf("cardio"), true),
        e("mountain-climber", "Mountain climber", setOf(BW), listOf("core", "cardio"), true),
        e("walk", "Brisk walk", setOf(BW, DB, GYM), listOf("cardio"), true),
        e("hollow-hold", "Hollow body hold", setOf(BW, GYM), listOf("core"), true),
        // Dumbbell (existing)
        e("db-press", "Dumbbell bench press", setOf(DB, GYM), listOf("chest")),
        e("db-fly", "Dumbbell fly", setOf(DB, GYM), listOf("chest")),
        e("db-row", "Dumbbell row", setOf(DB, GYM), listOf("back")),
        e("db-curl", "Dumbbell curl", setOf(DB, GYM), listOf("biceps")),
        e("db-rdl", "Dumbbell RDL", setOf(DB, GYM), listOf("hamstrings", "glutes")),
        e("goblet-squat", "Goblet squat", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-shoulder-press", "Dumbbell shoulder press", setOf(DB, GYM), listOf("shoulders")),
        e("db-lateral-raise", "Lateral raise", setOf(DB, GYM), listOf("shoulders")),
        e("db-lunges", "Dumbbell lunge", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-tricep-extension", "Overhead tricep extension", setOf(DB, GYM), listOf("triceps")),
        // Full gym (existing)
        e("bench-press", "Barbell bench press", setOf(GYM), listOf("chest")),
        e("cable-fly", "Cable fly", setOf(GYM), listOf("chest")),
        e("back-squat", "Back squat", setOf(GYM), listOf("quads", "glutes")),
        e("romanian-deadlift", "Romanian deadlift", setOf(GYM), listOf("hamstrings", "glutes")),
        e("deadlift", "Conventional deadlift", setOf(GYM), listOf("posterior")),
        e("lat-pulldown", "Lat pulldown", setOf(GYM), listOf("back")),
        e("barbell-row", "Barbell row", setOf(GYM), listOf("back")),
        e("overhead-press", "Overhead press", setOf(GYM), listOf("shoulders")),
        e("leg-press", "Leg press", setOf(GYM), listOf("quads")),
        e("leg-curl", "Lying leg curl", setOf(GYM), listOf("hamstrings")),
        e("calf-raise", "Calf raise", setOf(DB, GYM), listOf("calves")),
        e("face-pull", "Face pull", setOf(GYM), listOf("rear delts")),
        e("hip-thrust", "Barbell hip thrust", setOf(GYM), listOf("glutes")),
        e("main", "Main lift", setOf(BW, DB, GYM), listOf("full body")),

        // ── Bodyweight / park / home (YC wedge) ──
        e("knee-pushup", "Knee push-up", setOf(BW, DB, GYM), listOf("chest", "triceps"), true),
        e("diamond-pushup", "Diamond push-up", setOf(BW, DB, GYM), listOf("triceps", "chest"), true),
        e("wide-pushup", "Wide push-up", setOf(BW, DB, GYM), listOf("chest"), true),
        e("decline-pushup", "Decline push-up", setOf(BW, DB, GYM), listOf("chest", "shoulders"), true),
        e("incline-pushup", "Incline push-up", setOf(BW, DB, GYM), listOf("chest", "triceps"), true),
        e("pike-pushup", "Pike push-up", setOf(BW, DB, GYM), listOf("shoulders", "triceps"), true),
        e("archer-pushup", "Archer push-up", setOf(BW), listOf("chest", "triceps"), true),
        e("clap-pushup", "Clap push-up", setOf(BW), listOf("chest", "cardio"), true),
        e("hindu-pushup", "Hindu push-up", setOf(BW), listOf("chest", "shoulders", "core"), true),
        e("pseudo-planche-pushup", "Pseudo planche push-up", setOf(BW), listOf("chest", "shoulders"), true),
        e("handstand-hold", "Handstand hold", setOf(BW, GYM), listOf("shoulders", "core"), true),
        e("wall-handstand", "Wall handstand", setOf(BW), listOf("shoulders", "core"), true),
        e("handstand-pushup", "Handstand push-up", setOf(BW, GYM), listOf("shoulders", "triceps"), true),
        e("muscle-up", "Muscle-up", setOf(BW, GYM), listOf("back", "chest"), true),
        e("australian-pullup", "Australian pull-up", setOf(BW), listOf("back", "biceps"), true),
        e("negative-pullup", "Negative pull-up", setOf(BW, GYM), listOf("back"), true),
        e("scapular-pullup", "Scapular pull-up", setOf(BW, GYM), listOf("back", "shoulders"), true),
        e("commando-pullup", "Commando pull-up", setOf(BW, GYM), listOf("back", "biceps"), true),
        e("wide-pullup", "Wide-grip pull-up", setOf(BW, GYM), listOf("back"), true),
        e("close-chinup", "Close-grip chin-up", setOf(BW, GYM), listOf("back", "biceps"), true),
        e("ring-row", "Ring row", setOf(BW, GYM), listOf("back"), true),
        e("ring-dip", "Ring dip", setOf(BW, GYM), listOf("chest", "triceps"), true),
        e("bench-dip", "Bench dip", setOf(BW, DB, GYM), listOf("triceps"), true),
        e("chair-dip", "Chair dip", setOf(BW), listOf("triceps", "chest"), true),
        e("triceps-extension-bw", "Bodyweight triceps extension", setOf(BW), listOf("triceps"), true),
        e("pistol-squat", "Pistol squat", setOf(BW), listOf("quads", "glutes"), true),
        e("assisted-pistol", "Assisted pistol squat", setOf(BW), listOf("quads", "glutes"), true),
        e("jump-squat", "Jump squat", setOf(BW), listOf("quads", "glutes", "cardio"), true),
        e("sumo-squat-bw", "Sumo squat", setOf(BW), listOf("quads", "glutes"), true),
        e("split-squat", "Split squat", setOf(BW, DB, GYM), listOf("quads", "glutes"), true),
        e("bulgarian-split-squat-bw", "Bulgarian split squat", setOf(BW, DB, GYM), listOf("quads", "glutes"), true),
        e("reverse-lunge", "Reverse lunge", setOf(BW, DB, GYM), listOf("quads", "glutes"), true),
        e("lateral-lunge", "Lateral lunge", setOf(BW, DB, GYM), listOf("quads", "glutes"), true),
        e("curtsy-lunge", "Curtsy lunge", setOf(BW, DB, GYM), listOf("glutes", "quads"), true),
        e("step-up", "Step-up", setOf(BW, DB, GYM), listOf("quads", "glutes"), true),
        e("box-step-up", "Box step-up", setOf(BW, DB, GYM), listOf("quads", "glutes"), true),
        e("box-jump", "Box jump", setOf(BW, GYM), listOf("quads", "glutes", "cardio"), true),
        e("broad-jump", "Broad jump", setOf(BW), listOf("glutes", "quads", "cardio"), true),
        e("single-leg-rdl-bw", "Single-leg RDL (bodyweight)", setOf(BW), listOf("hamstrings", "glutes"), true),
        e("good-morning-bw", "Good morning (bodyweight)", setOf(BW), listOf("hamstrings", "back"), true),
        e("single-leg-glute-bridge", "Single-leg glute bridge", setOf(BW, DB, GYM), listOf("glutes"), true),
        e("frog-pump", "Frog pump", setOf(BW), listOf("glutes"), true),
        e("donkey-kick", "Donkey kick", setOf(BW), listOf("glutes"), true),
        e("fire-hydrant", "Fire hydrant", setOf(BW), listOf("glutes"), true),
        e("clamshell", "Clamshell", setOf(BW), listOf("glutes"), true),
        e("wall-sit", "Wall sit", setOf(BW), listOf("quads"), true),
        e("calf-raise-bw", "Bodyweight calf raise", setOf(BW), listOf("calves"), true),
        e("single-leg-calf-raise", "Single-leg calf raise", setOf(BW, DB, GYM), listOf("calves"), true),
        e("tibialis-raise", "Tibialis raise", setOf(BW), listOf("calves"), true),
        e("high-knees", "High knees", setOf(BW), listOf("cardio"), true),
        e("butt-kicks", "Butt kicks", setOf(BW), listOf("cardio"), true),
        e("skipping", "Skipping in place", setOf(BW), listOf("cardio"), true),
        e("jump-rope", "Jump rope", setOf(BW, DB, GYM), listOf("cardio"), true),
        e("shadow-boxing", "Shadow boxing", setOf(BW), listOf("cardio", "shoulders"), true),
        e("bear-crawl", "Bear crawl", setOf(BW), listOf("full body", "core"), true),
        e("crab-walk", "Crab walk", setOf(BW), listOf("triceps", "core"), true),
        e("inchworm", "Inchworm", setOf(BW), listOf("hamstrings", "core"), true),
        e("sprawls", "Sprawls", setOf(BW), listOf("full body", "cardio"), true),
        e("tuck-jump", "Tuck jump", setOf(BW), listOf("quads", "cardio"), true),
        e("skater-jump", "Skater jump", setOf(BW), listOf("glutes", "cardio"), true),
        e("lateral-shuffle", "Lateral shuffle", setOf(BW), listOf("cardio", "glutes"), true),
        e("sprint-intervals", "Sprint intervals", setOf(BW), listOf("cardio"), true),
        e("jog", "Jog", setOf(BW), listOf("cardio"), true),
        e("run", "Run", setOf(BW), listOf("cardio"), true),
        e("hill-sprint", "Hill sprint", setOf(BW), listOf("cardio", "glutes"), true),
        e("stair-climb", "Stair climb", setOf(BW), listOf("cardio", "quads"), true),
        e("bike-ride", "Bike ride", setOf(BW), listOf("cardio", "quads"), true),

        // ── Core (bodyweight-first) ──
        e("crunch", "Crunch", setOf(BW, DB, GYM), listOf("core"), true),
        e("reverse-crunch", "Reverse crunch", setOf(BW, GYM), listOf("core"), true),
        e("bicycle-crunch", "Bicycle crunch", setOf(BW), listOf("core"), true),
        e("dead-bug", "Dead bug", setOf(BW, GYM), listOf("core"), true),
        e("bird-dog", "Bird dog", setOf(BW), listOf("core", "back"), true),
        e("superman", "Superman", setOf(BW), listOf("back", "core"), true),
        e("v-up", "V-up", setOf(BW), listOf("core"), true),
        e("sit-up", "Sit-up", setOf(BW), listOf("core"), true),
        e("leg-raise", "Lying leg raise", setOf(BW, GYM), listOf("core"), true),
        e("hanging-leg-raise", "Hanging leg raise", setOf(BW, GYM), listOf("core"), true),
        e("hanging-knee-raise", "Hanging knee raise", setOf(BW, GYM), listOf("core"), true),
        e("toes-to-bar", "Toes to bar", setOf(BW, GYM), listOf("core"), true),
        e("ab-wheel", "Ab wheel rollout", setOf(BW, GYM), listOf("core"), true),
        e("russian-twist", "Russian twist", setOf(BW, DB, GYM), listOf("core"), true),
        e("heel-taps", "Heel taps", setOf(BW), listOf("core"), true),
        e("flutter-kicks", "Flutter kicks", setOf(BW), listOf("core"), true),
        e("scissor-kicks", "Scissor kicks", setOf(BW), listOf("core"), true),
        e("plank-shoulder-tap", "Plank shoulder tap", setOf(BW), listOf("core", "shoulders"), true),
        e("plank-jack", "Plank jack", setOf(BW), listOf("core", "cardio"), true),
        e("long-lever-plank", "Long-lever plank", setOf(BW), listOf("core"), true),
        e("rkc-plank", "RKC plank", setOf(BW), listOf("core"), true),
        e("copenhagen-plank", "Copenhagen plank", setOf(BW, GYM), listOf("core", "glutes"), true),
        e("pallof-press-bw", "Pallof press (band)", setOf(BW, GYM), listOf("core"), true),
        e("woodchop-bw", "Woodchop (band)", setOf(BW, GYM), listOf("core"), true),
        e("hip-flexor-march", "Marching hip flexors", setOf(BW), listOf("core"), true),

        // ── Dumbbell (home / YC wedge) ──
        e("db-incline-press", "Dumbbell incline press", setOf(DB, GYM), listOf("chest", "shoulders")),
        e("db-decline-press", "Dumbbell decline press", setOf(DB, GYM), listOf("chest")),
        e("db-floor-press", "Dumbbell floor press", setOf(DB, GYM), listOf("chest", "triceps")),
        e("db-pullover", "Dumbbell pullover", setOf(DB, GYM), listOf("chest", "back")),
        e("db-squeeze-press", "Dumbbell squeeze press", setOf(DB, GYM), listOf("chest")),
        e("db-single-arm-press", "Single-arm dumbbell press", setOf(DB, GYM), listOf("chest", "core")),
        e("db-chest-supported-row", "Chest-supported dumbbell row", setOf(DB, GYM), listOf("back")),
        e("db-renegade-row", "Renegade row", setOf(DB, GYM), listOf("back", "core")),
        e("db-meadows-row", "Meadows-style dumbbell row", setOf(DB, GYM), listOf("back")),
        e("db-shrug", "Dumbbell shrug", setOf(DB, GYM), listOf("traps")),
        e("db-upright-row", "Dumbbell upright row", setOf(DB, GYM), listOf("shoulders", "traps")),
        e("db-front-raise", "Dumbbell front raise", setOf(DB, GYM), listOf("shoulders")),
        e("db-rear-delt-fly", "Dumbbell rear delt fly", setOf(DB, GYM), listOf("rear delts")),
        e("db-arnold-press", "Arnold press", setOf(DB, GYM), listOf("shoulders")),
        e("db-z-press", "Dumbbell Z-press", setOf(DB, GYM), listOf("shoulders", "core")),
        e("db-push-press", "Dumbbell push press", setOf(DB, GYM), listOf("shoulders")),
        e("db-hammer-curl", "Hammer curl", setOf(DB, GYM), listOf("biceps")),
        e("db-incline-curl", "Incline dumbbell curl", setOf(DB, GYM), listOf("biceps")),
        e("db-concentration-curl", "Concentration curl", setOf(DB, GYM), listOf("biceps")),
        e("db-preacher-curl", "Dumbbell preacher curl", setOf(DB, GYM), listOf("biceps")),
        e("db-cross-body-curl", "Cross-body hammer curl", setOf(DB, GYM), listOf("biceps")),
        e("db-kickback", "Triceps kickback", setOf(DB, GYM), listOf("triceps")),
        e("db-skull-crusher", "Dumbbell skull crusher", setOf(DB, GYM), listOf("triceps")),
        e("db-close-grip-press", "Close-grip dumbbell press", setOf(DB, GYM), listOf("triceps", "chest")),
        e("db-front-squat", "Dumbbell front squat", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-sumo-squat", "Dumbbell sumo squat", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-bulgarian-split", "Dumbbell Bulgarian split squat", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-step-up", "Dumbbell step-up", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-reverse-lunge", "Dumbbell reverse lunge", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-walking-lunge", "Dumbbell walking lunge", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-single-leg-rdl", "Dumbbell single-leg RDL", setOf(DB, GYM), listOf("hamstrings", "glutes")),
        e("db-stiff-leg-dl", "Dumbbell stiff-leg deadlift", setOf(DB, GYM), listOf("hamstrings", "glutes")),
        e("db-hip-thrust", "Dumbbell hip thrust", setOf(DB, GYM), listOf("glutes")),
        e("db-glute-bridge", "Dumbbell glute bridge", setOf(DB, GYM), listOf("glutes")),
        e("db-calf-raise", "Dumbbell calf raise", setOf(DB, GYM), listOf("calves")),
        e("db-farmer-carry", "Farmer carry", setOf(DB, GYM), listOf("full body", "traps")),
        e("db-suitcase-carry", "Suitcase carry", setOf(DB, GYM), listOf("core", "traps")),
        e("db-overhead-carry", "Overhead carry", setOf(DB, GYM), listOf("shoulders", "core")),
        e("db-thruster", "Dumbbell thruster", setOf(DB, GYM), listOf("full body", "shoulders")),
        e("db-clean", "Dumbbell clean", setOf(DB, GYM), listOf("full body")),
        e("db-snatch", "Dumbbell snatch", setOf(DB, GYM), listOf("full body", "shoulders")),
        e("db-swing", "Dumbbell swing", setOf(DB, GYM), listOf("glutes", "hamstrings")),
        e("db-man-maker", "Man maker", setOf(DB, GYM), listOf("full body")),
        e("db-deadlift", "Dumbbell deadlift", setOf(DB, GYM), listOf("posterior", "glutes")),
        e("db-sumo-deadlift", "Dumbbell sumo deadlift", setOf(DB, GYM), listOf("glutes", "hamstrings")),
        e("db-bent-over-row", "Bent-over dumbbell row", setOf(DB, GYM), listOf("back")),
        e("db-reverse-fly", "Dumbbell reverse fly", setOf(DB, GYM), listOf("rear delts")),
        e("db-wrist-curl", "Dumbbell wrist curl", setOf(DB, GYM), listOf("forearms")),
        e("db-reverse-wrist-curl", "Reverse wrist curl", setOf(DB, GYM), listOf("forearms")),
        e("db-side-bend", "Dumbbell side bend", setOf(DB, GYM), listOf("core")),
        e("db-crunch", "Weighted crunch", setOf(DB, GYM), listOf("core")),
        e("db-russian-twist", "Weighted Russian twist", setOf(DB, GYM), listOf("core")),

        // ── Barbell (gym) ──
        e("incline-bench", "Incline barbell bench", setOf(GYM), listOf("chest", "shoulders")),
        e("decline-bench", "Decline barbell bench", setOf(GYM), listOf("chest")),
        e("close-grip-bench", "Close-grip bench press", setOf(GYM), listOf("triceps", "chest")),
        e("floor-press", "Barbell floor press", setOf(GYM), listOf("chest", "triceps")),
        e("pause-bench", "Pause bench press", setOf(GYM), listOf("chest")),
        e("front-squat", "Front squat", setOf(GYM), listOf("quads", "core")),
        e("pause-squat", "Pause squat", setOf(GYM), listOf("quads", "glutes")),
        e("box-squat", "Box squat", setOf(GYM), listOf("quads", "glutes")),
        e("sumo-deadlift", "Sumo deadlift", setOf(GYM), listOf("glutes", "hamstrings")),
        e("trap-bar-deadlift", "Trap-bar deadlift", setOf(GYM), listOf("posterior", "quads")),
        e("deficit-deadlift", "Deficit deadlift", setOf(GYM), listOf("posterior")),
        e("rack-pull", "Rack pull", setOf(GYM), listOf("back", "posterior")),
        e("stiff-leg-deadlift", "Stiff-leg deadlift", setOf(GYM), listOf("hamstrings", "glutes")),
        e("good-morning", "Good morning", setOf(GYM), listOf("hamstrings", "back")),
        e("pendlay-row", "Pendlay row", setOf(GYM), listOf("back")),
        e("yates-row", "Yates row", setOf(GYM), listOf("back")),
        e("seal-row", "Seal row", setOf(GYM), listOf("back")),
        e("barbell-shrug", "Barbell shrug", setOf(GYM), listOf("traps")),
        e("barbell-curl", "Barbell curl", setOf(GYM), listOf("biceps")),
        e("ez-bar-curl", "EZ-bar curl", setOf(GYM), listOf("biceps")),
        e("barbell-skull-crusher", "Barbell skull crusher", setOf(GYM), listOf("triceps")),
        e("jm-press", "JM press", setOf(GYM), listOf("triceps")),
        e("push-press", "Push press", setOf(GYM), listOf("shoulders")),
        e("push-jerk", "Push jerk", setOf(GYM), listOf("shoulders")),
        e("behind-neck-press", "Behind-the-neck press", setOf(GYM), listOf("shoulders")),
        e("barbell-upright-row", "Barbell upright row", setOf(GYM), listOf("shoulders", "traps")),
        e("barbell-lunge", "Barbell lunge", setOf(GYM), listOf("quads", "glutes")),
        e("barbell-split-squat", "Barbell split squat", setOf(GYM), listOf("quads", "glutes")),
        e("barbell-calf-raise", "Barbell calf raise", setOf(GYM), listOf("calves")),
        e("power-clean", "Power clean", setOf(GYM), listOf("full body")),
        e("hang-clean", "Hang clean", setOf(GYM), listOf("full body")),
        e("power-snatch", "Power snatch", setOf(GYM), listOf("full body")),
        e("clean-and-jerk", "Clean and jerk", setOf(GYM), listOf("full body")),
        e("barbell-thruster", "Barbell thruster", setOf(GYM), listOf("full body")),
        e("landmine-press", "Landmine press", setOf(GYM), listOf("shoulders", "chest")),
        e("landmine-row", "Landmine row", setOf(GYM), listOf("back")),
        e("landmine-squat", "Landmine squat", setOf(GYM), listOf("quads", "glutes")),
        e("zercher-squat", "Zercher squat", setOf(GYM), listOf("quads", "core")),
        e("safety-bar-squat", "Safety-bar squat", setOf(GYM), listOf("quads", "glutes")),

        // ── Cable ──
        e("cable-crossover", "Cable crossover", setOf(GYM), listOf("chest")),
        e("cable-press", "Cable chest press", setOf(GYM), listOf("chest")),
        e("cable-incline-fly", "Cable incline fly", setOf(GYM), listOf("chest")),
        e("cable-row", "Seated cable row", setOf(GYM), listOf("back")),
        e("cable-single-arm-row", "Single-arm cable row", setOf(GYM), listOf("back")),
        e("straight-arm-pulldown", "Straight-arm pulldown", setOf(GYM), listOf("back")),
        e("cable-pullover", "Cable pullover", setOf(GYM), listOf("back", "chest")),
        e("cable-lat-pulldown", "Wide-grip lat pulldown", setOf(GYM), listOf("back")),
        e("close-grip-pulldown", "Close-grip pulldown", setOf(GYM), listOf("back", "biceps")),
        e("cable-face-pull", "Cable face pull", setOf(GYM), listOf("rear delts")),
        e("cable-lateral-raise", "Cable lateral raise", setOf(GYM), listOf("shoulders")),
        e("cable-front-raise", "Cable front raise", setOf(GYM), listOf("shoulders")),
        e("cable-rear-delt-fly", "Cable rear delt fly", setOf(GYM), listOf("rear delts")),
        e("cable-curl", "Cable curl", setOf(GYM), listOf("biceps")),
        e("cable-hammer-curl", "Cable hammer curl", setOf(GYM), listOf("biceps")),
        e("cable-tricep-pushdown", "Triceps pushdown", setOf(GYM), listOf("triceps")),
        e("cable-overhead-extension", "Cable overhead extension", setOf(GYM), listOf("triceps")),
        e("cable-kickback", "Cable kickback", setOf(GYM), listOf("triceps")),
        e("cable-crunch", "Cable crunch", setOf(GYM), listOf("core")),
        e("cable-woodchop", "Cable woodchop", setOf(GYM), listOf("core")),
        e("cable-pallof-press", "Cable Pallof press", setOf(GYM), listOf("core")),
        e("cable-pull-through", "Cable pull-through", setOf(GYM), listOf("glutes", "hamstrings")),
        e("cable-kickback-glute", "Cable glute kickback", setOf(GYM), listOf("glutes")),
        e("cable-hip-abduction", "Cable hip abduction", setOf(GYM), listOf("glutes")),
        e("cable-shrug", "Cable shrug", setOf(GYM), listOf("traps")),

        // ── Machine ──
        e("chest-press-machine", "Chest press machine", setOf(GYM), listOf("chest")),
        e("pec-deck", "Pec deck", setOf(GYM), listOf("chest")),
        e("smith-bench", "Smith machine bench", setOf(GYM), listOf("chest")),
        e("smith-squat", "Smith machine squat", setOf(GYM), listOf("quads", "glutes")),
        e("hack-squat", "Hack squat", setOf(GYM), listOf("quads")),
        e("leg-extension", "Leg extension", setOf(GYM), listOf("quads")),
        e("seated-leg-curl", "Seated leg curl", setOf(GYM), listOf("hamstrings")),
        e("standing-leg-curl", "Standing leg curl", setOf(GYM), listOf("hamstrings")),
        e("hip-abduction-machine", "Hip abduction machine", setOf(GYM), listOf("glutes")),
        e("hip-adduction-machine", "Hip adduction machine", setOf(GYM), listOf("glutes")),
        e("glute-drive", "Glute drive / hip thrust machine", setOf(GYM), listOf("glutes")),
        e("seated-calf-raise", "Seated calf raise", setOf(GYM), listOf("calves")),
        e("standing-calf-machine", "Standing calf machine", setOf(GYM), listOf("calves")),
        e("shoulder-press-machine", "Shoulder press machine", setOf(GYM), listOf("shoulders")),
        e("lateral-raise-machine", "Lateral raise machine", setOf(GYM), listOf("shoulders")),
        e("rear-delt-machine", "Rear delt machine", setOf(GYM), listOf("rear delts")),
        e("assisted-pullup", "Assisted pull-up machine", setOf(GYM), listOf("back")),
        e("assisted-dip", "Assisted dip machine", setOf(GYM), listOf("chest", "triceps")),
        e("t-bar-row", "T-bar row", setOf(GYM), listOf("back")),
        e("chest-supported-tbar", "Chest-supported T-bar row", setOf(GYM), listOf("back")),
        e("preacher-curl-machine", "Preacher curl machine", setOf(GYM), listOf("biceps")),
        e("bicep-curl-machine", "Bicep curl machine", setOf(GYM), listOf("biceps")),
        e("tricep-extension-machine", "Triceps extension machine", setOf(GYM), listOf("triceps")),
        e("ab-crunch-machine", "Ab crunch machine", setOf(GYM), listOf("core")),
        e("back-extension-machine", "Back extension machine", setOf(GYM), listOf("back")),
        e("roman-chair", "Roman chair hyperextension", setOf(GYM), listOf("back", "glutes")),
        e("captains-chair", "Captain's chair knee raise", setOf(GYM), listOf("core")),

        // ── Cardio machines / gym conditioning ──
        e("treadmill", "Treadmill", setOf(GYM), listOf("cardio")),
        e("treadmill-incline", "Incline treadmill walk", setOf(GYM), listOf("cardio", "glutes")),
        e("elliptical", "Elliptical", setOf(GYM), listOf("cardio")),
        e("stationary-bike", "Stationary bike", setOf(GYM), listOf("cardio", "quads")),
        e("assault-bike", "Assault bike", setOf(GYM), listOf("cardio")),
        e("row-erg", "Rowing machine", setOf(GYM), listOf("cardio", "back")),
        e("ski-erg", "SkiErg", setOf(GYM), listOf("cardio", "back")),
        e("stair-climber", "Stair climber", setOf(GYM), listOf("cardio", "glutes")),
        e("battle-ropes", "Battle ropes", setOf(GYM), listOf("cardio", "shoulders")),
        e("sled-push", "Sled push", setOf(GYM), listOf("full body", "cardio")),
        e("sled-pull", "Sled pull", setOf(GYM), listOf("back", "cardio")),
        e("farmer-walk-gym", "Farmer walk (gym)", setOf(GYM), listOf("full body", "traps")),
        e("medicine-ball-slam", "Medicine ball slam", setOf(GYM), listOf("full body", "core")),
        e("medicine-ball-throw", "Medicine ball chest throw", setOf(GYM), listOf("chest", "core")),
        e("kettlebell-swing", "Kettlebell swing", setOf(GYM), listOf("glutes", "hamstrings")),
        e("kettlebell-goblet-squat", "Kettlebell goblet squat", setOf(GYM), listOf("quads", "glutes")),
        e("kettlebell-clean", "Kettlebell clean", setOf(GYM), listOf("full body")),
        e("kettlebell-snatch", "Kettlebell snatch", setOf(GYM), listOf("full body", "shoulders")),
        e("kettlebell-press", "Kettlebell press", setOf(GYM), listOf("shoulders")),
        e("kettlebell-turkish-getup", "Turkish get-up", setOf(GYM), listOf("full body", "core")),
        e("kettlebell-row", "Kettlebell row", setOf(GYM), listOf("back")),
        e("kettlebell-deadlift", "Kettlebell deadlift", setOf(GYM), listOf("posterior", "glutes")),
    )

    private val byId: Map<String, ExerciseDef> = all.associateBy { it.id }

    fun get(id: String): ExerciseDef? = byId[normalizeId(id)]

    fun displayName(id: String): String {
        val key = normalizeId(id)
        return byId[key]?.name ?: humanize(key)
    }

    fun search(query: String, equipment: String? = null, muscle: String? = null): List<ExerciseDef> {
        val q = query.trim().lowercase()
        val equip = equipment?.let { normalizeEquip(it) }
        val muscleKey = muscle?.trim()?.lowercase()?.takeIf { it.isNotEmpty() }
        return all.filter { def ->
            val equipOk = equip == null || equip in def.equipment
            val muscleOk = muscleKey == null ||
                def.muscleGroups.any { it.lowercase().contains(muscleKey) }
            val textOk = q.isEmpty() ||
                def.name.lowercase().contains(q) ||
                def.id.contains(q) ||
                def.muscleGroups.any { it.contains(q) }
            equipOk && muscleOk && textOk
        }
    }

    fun forEquipment(equipment: String): List<ExerciseDef> =
        search(query = "", equipment = equipment)

    fun byMuscle(muscle: String): List<ExerciseDef> {
        val m = muscle.trim().lowercase()
        if (m.isEmpty()) return all
        return all.filter { def ->
            def.muscleGroups.any { it.lowercase().contains(m) }
        }
    }

    fun muscleGroups(): List<String> =
        all.flatMap { it.muscleGroups }
            .map { it.lowercase() }
            .distinct()
            .sorted()

    private fun e(
        id: String,
        name: String,
        equipment: Set<String>,
        muscles: List<String>,
        bodyweight: Boolean = false,
    ) = ExerciseDef(id, name, equipment, muscles, bodyweight)

    private fun normalizeId(id: String): String =
        id.trim().lowercase().replace('_', '-')

    private fun normalizeEquip(raw: String): String =
        when (raw.trim().lowercase()) {
            "dumbbells", "db", "dumbbell" -> DB
            "full-gym", "full_gym", "gym", "fullgym" -> GYM
            else -> BW
        }

    private fun humanize(id: String): String =
        id.replace('-', ' ').replaceFirstChar { it.uppercase() }
}
