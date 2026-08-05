import type { WorkoutExerciseTemplate } from "@/types";
import type { ProgramTag } from "@/types";

export type ProgramCategory = "beginner" | "advanced" | "pro";

export interface ProgramSession {
  id: string;
  name: string;
  weekLabel?: string;
  notes?: string;
  exercises: WorkoutExerciseTemplate[];
}

export interface ProgramTemplate {
  id: string;
  name: string;
  category: ProgramCategory;
  description: string;
  duration: string;
  focus: string;
  /** Phase D — strength, hypertrophy, conditioning, corrective */
  tags?: ProgramTag[];
  sessions: ProgramSession[];
}

export const PROGRAM_CATEGORIES: {
  id: ProgramCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "beginner",
    label: "Beginner Workout Plans",
    description: "Full-body and split routines to build consistency and form.",
  },
  {
    id: "advanced",
    label: "Advanced Cycles",
    description: "Proven strength templates — 5×5, Texas Method, squat specials, and more.",
  },
  {
    id: "pro",
    label: "Pro Cycles",
    description: "High-volume peaking and periodized blocks for experienced lifters.",
  },
];

function sets(count: number, reps: number, weight = 0): WorkoutExerciseTemplate["sets"] {
  return Array.from({ length: count }, () => ({ reps, weight }));
}

function ex(exerciseId: string, setCount: number, reps: number, weight = 0): WorkoutExerciseTemplate {
  return { exerciseId, sets: sets(setCount, reps, weight) };
}

function pctSet(loadPct: number, reps: number): WorkoutExerciseTemplate["sets"][number] {
  return { reps, weight: 0, loadPct };
}

/**
 * One 5/3/1 + BBB session: three main working sets at wave percentages, then 5×10
 * supplemental at 50% TM. Percentages are authored against the athlete's e1RM with
 * Wendler's training max (90% of 1RM) already baked in — 85% TM is written 76.5 —
 * so `materializeProgram.ts` can resolve them with no TM concept anywhere.
 */
function w531(
  mainLift: string,
  bbbLift: string,
  pcts: [number, number, number],
  reps: [number, number, number]
): WorkoutExerciseTemplate[] {
  return [
    {
      exerciseId: mainLift,
      sets: [pctSet(pcts[0], reps[0]), pctSet(pcts[1], reps[1]), pctSet(pcts[2], reps[2])],
    },
    { exerciseId: bbbLift, sets: Array.from({ length: 5 }, () => pctSet(45, 10)) },
  ];
}

const W531_WEEKS: { label: string; pcts: [number, number, number]; reps: [number, number, number] }[] = [
  { label: "Week 1 — 5s", pcts: [58.5, 67.5, 76.5], reps: [5, 5, 5] },
  { label: "Week 2 — 3s", pcts: [63, 72, 81], reps: [3, 3, 3] },
  { label: "Week 3 — 5/3/1", pcts: [67.5, 76.5, 85.5], reps: [5, 3, 1] },
];

const W531_LIFTS: { id: string; name: string; main: string; bbb: string }[] = [
  { id: "squat", name: "Squat", main: "squats", bbb: "squats" },
  { id: "bench", name: "Bench", main: "bench-press", bbb: "bench-press" },
  { id: "dead", name: "Deadlift", main: "deadlift", bbb: "romanian-deadlift" },
  { id: "ohp", name: "OHP", main: "overhead-press", bbb: "overhead-press" },
];

const PROGRAM_TEMPLATES_RAW: ProgramTemplate[] = [
  // ─── Beginner ─────────────────────────────────────────────────────────────
  {
    id: "beginner-full-body",
    name: "Full Body 3×/Week",
    category: "beginner",
    description:
      "Three simple full-body days per week. Focus on form, add 5 lb when all sets feel solid. From periodization basics (Ch9).",
    duration: "8–12 weeks",
    focus: "General strength",
    sessions: [
      {
        id: "bfb-a",
        name: "Day A",
        notes: "Squat, push, pull — 3×8–10. Rest 2–3 min on compounds.",
        exercises: [
          ex("squats", 3, 8),
          ex("bench-press", 3, 8),
          ex("barbell-row", 3, 8),
          ex("plank", 3, 30),
        ],
      },
      {
        id: "bfb-b",
        name: "Day B",
        notes: "Alternate with Day A. Deadlift once per week at moderate reps.",
        exercises: [
          ex("squats", 3, 8),
          ex("overhead-press", 3, 8),
          ex("deadlift", 1, 5),
          ex("lat-pulldown", 3, 10),
        ],
      },
    ],
  },
  {
    id: "beginner-upper-lower",
    name: "Upper / Lower Split",
    category: "beginner",
    description: "Four days: two upper, two lower. More volume per muscle without daily full body fatigue.",
    duration: "8+ weeks",
    focus: "Hypertrophy & strength base",
    sessions: [
      {
        id: "bul-upper-1",
        name: "Upper 1",
        exercises: [
          ex("bench-press", 3, 10),
          ex("barbell-row", 3, 10),
          ex("overhead-press", 3, 10),
          ex("bicep-curl", 2, 12),
        ],
      },
      {
        id: "bul-lower-1",
        name: "Lower 1",
        exercises: [
          ex("squats", 3, 10),
          ex("romanian-deadlift", 3, 10),
          ex("lunges", 3, 10),
          ex("calf-raise", 3, 15),
        ],
      },
      {
        id: "bul-upper-2",
        name: "Upper 2",
        exercises: [
          ex("incline-bench", 3, 10),
          ex("lat-pulldown", 3, 10),
          ex("dumbbell-press", 3, 10),
          ex("tricep-pushdown", 2, 12),
        ],
      },
      {
        id: "bul-lower-2",
        name: "Lower 2",
        exercises: [
          ex("squats", 3, 8),
          ex("deadlift", 1, 5),
          ex("leg-press", 3, 12),
          ex("leg-curl", 3, 12),
        ],
      },
    ],
  },
  {
    id: "beginner-ppl",
    name: "Push / Pull / Legs (Intro)",
    category: "beginner",
    description: "Classic PPL with moderate volume. Run P→P→L or add a rest day between each.",
    duration: "Ongoing",
    focus: "Balanced physique",
    sessions: [
      {
        id: "ppl-push",
        name: "Push",
        exercises: [
          ex("bench-press", 3, 10),
          ex("overhead-press", 3, 10),
          ex("incline-bench", 2, 12),
          ex("tricep-pushdown", 3, 12),
        ],
      },
      {
        id: "ppl-pull",
        name: "Pull",
        exercises: [
          ex("barbell-row", 3, 10),
          ex("lat-pulldown", 3, 10),
          ex("face-pull", 3, 15),
          ex("bicep-curl", 3, 12),
        ],
      },
      {
        id: "ppl-legs",
        name: "Legs",
        exercises: [
          ex("squats", 3, 10),
          ex("romanian-deadlift", 3, 10),
          ex("lunges", 3, 10),
          ex("calf-raise", 3, 15),
        ],
      },
    ],
  },
  {
    id: "beginner-bodyweight",
    name: "Bodyweight & Dumbbell Starter",
    category: "beginner",
    description: "Minimal equipment. Build habit before loading a barbell.",
    duration: "4–6 weeks",
    focus: "Movement quality",
    sessions: [
      {
        id: "bw-day1",
        name: "Circuit A",
        notes: "Rest 60–90s between exercises. Add reps before weight.",
        exercises: [
          ex("push-ups", 3, 12),
          ex("lunges", 3, 12),
          ex("plank", 3, 30),
          ex("crunches", 3, 15),
        ],
      },
      {
        id: "bw-day2",
        name: "Circuit B",
        exercises: [
          ex("pull-ups", 3, 6),
          ex("kettlebell-swing", 3, 15),
          ex("burpees", 3, 8),
          ex("hanging-leg-raise", 3, 10),
        ],
      },
    ],
  },
  {
    id: "beginner-machine",
    name: "Machine & Cable Intro",
    category: "beginner",
    description: "Gym-friendly machine circuit. Low coordination demand, steady progression.",
    duration: "6–8 weeks",
    focus: "Confidence in the gym",
    sessions: [
      {
        id: "mach-full",
        name: "Full Gym Circuit",
        exercises: [
          ex("leg-press", 3, 12),
          ex("lat-pulldown", 3, 12),
          ex("dumbbell-press", 3, 12),
          ex("cable-row", 3, 12),
          ex("leg-curl", 2, 15),
          ex("lateral-raise", 2, 15),
        ],
      },
    ],
  },
  {
    id: "beginner-daily-mobility",
    name: "Daily Mobility Circuit (Free Core)",
    category: "beginner",
    description: "5-10 min daily movement quality. Use as warm-up, cool-down, or standalone recovery. Bodyweight only.",
    duration: "Ongoing habit",
    focus: "Joint health & daily readiness",
    sessions: [
      {
        id: "mob-a",
        name: "Mobility Flow A",
        notes: "Breathe deeply. No rushing. 5-8 min total.",
        exercises: [
          ex("cat-camel", 2, 8),
          ex("bird-dog", 2, 6),
          ex("glute-bridge", 2, 10),
          ex("wall-sit", 1, 30),
          ex("superman", 2, 8),
        ],
      },
      {
        id: "mob-b",
        name: "Mobility Flow B",
        exercises: [
          ex("push-ups", 2, 8),
          ex("lunges", 2, 6),
          ex("plank", 2, 20),
          ex("side-plank", 1, 15),
          ex("pike-pushup", 2, 5),
        ],
      },
    ],
  },
  {
    id: "beginner-bodyweight-full",
    name: "Bodyweight Strength Circuit",
    category: "beginner",
    description: "No equipment full body. Progress reps, slow tempos, or add pauses. Perfect free starter.",
    duration: "4-8 weeks",
    focus: "Strength + control anywhere",
    sessions: [
      {
        id: "bw-full-a",
        name: "Circuit A",
        exercises: [
          ex("push-ups", 3, 10),
          ex("squats", 3, 12),
          ex("inverted-row", 3, 8),
          ex("lunges", 3, 8),
          ex("plank", 3, 25),
        ],
      },
      {
        id: "bw-full-b",
        name: "Circuit B",
        exercises: [
          ex("pike-pushup", 3, 6),
          ex("single-leg-glute", 3, 8),
          ex("mountain-climbers", 3, 20),
          ex("dips-chair", 3, 8),
          ex("side-plank", 2, 20),
        ],
      },
    ],
  },
  {
    id: "beginner-habit-stack",
    name: "Habit Stack Daily (Free Core)",
    category: "beginner",
    description: "Build consistency with short daily actions. Stack mobility + mind + simple nutrition log. The foundation of lifelong health per vision.",
    duration: "Ongoing",
    focus: "Habits + synergy",
    sessions: [
      {
        id: "habit-daily",
        name: "Daily Stack",
        notes: "5-10 min total. Log in Today and Nutrition.",
        exercises: [
          ex("cat-camel", 1, 8),
          ex("bird-dog", 1, 6),
          ex("glute-bridge", 1, 10),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },
  {
    id: "beginner-recovery-flow",
    name: "Recovery & Mobility Flow",
    category: "beginner",
    description: "Post-training or daily reset. Emphasizes global accessible bodyweight mobility for joint health and better training.",
    duration: "Ongoing",
    focus: "Recovery + longevity",
    sessions: [
      {
        id: "rec-a",
        name: "Full Reset Flow",
        exercises: [
          ex("couch-stretch", 2, 60),
          ex("inchworm", 2, 6),
          ex("bear-crawl", 1, 15),
          ex("superman", 2, 8),
          ex("side-plank", 2, 20),
        ],
      },
    ],
  },
  {
    id: "beginner-mind-habit",
    name: "Mind + Movement Daily Habit",
    category: "beginner",
    description: "Free core habit builder: short mobility + breathing + intention. Builds the synergistic path (Move + Mind) with zero equipment.",
    duration: "Ongoing",
    focus: "Habit + mental resilience",
    sessions: [
      {
        id: "mind-mob",
        name: "Daily 8-Min Stack",
        notes: "Do after wake or pre-bed. Log win in Today.",
        exercises: [
          ex("cat-camel", 1, 8),
          ex("bird-dog", 1, 6),
          ex("glute-bridge", 1, 10),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },
  {
    id: "beginner-bodyweight-progress",
    name: "Progressive Bodyweight Strength",
    category: "beginner",
    description: "Builds from basics to advanced bodyweight moves. Free core, no gym needed, global friendly. Add reps or slow tempo each week.",
    duration: "8-12 weeks",
    focus: "Strength + control",
    sessions: [
      {
        id: "bw-prog-a",
        name: "Level 1 Circuit",
        exercises: [
          ex("push-ups", 3, 8),
          ex("squats", 3, 10),
          ex("inverted-row", 3, 6),
          ex("plank", 3, 20),
        ],
      },
      {
        id: "bw-prog-b",
        name: "Level 2 Circuit",
        exercises: [
          ex("pike-pushup", 3, 5),
          ex("lunges", 3, 8),
          ex("single-leg-glute", 3, 6),
          ex("side-plank", 2, 15),
          ex("burpees", 2, 5),
        ],
      },
    ],
  },
  {
    id: "beginner-mobility-habit",
    name: "Daily Mobility + Mind Habit",
    category: "beginner",
    description: "Free core daily practice: mobility flow + breathing/intention. Builds consistency across Move and Mind pillars with zero equipment.",
    duration: "Ongoing",
    focus: "Habit + joint health",
    sessions: [
      {
        id: "mob-mind",
        name: "Daily 10-Min Flow",
        notes: "Do morning or evening. Pair with 2 min breath work. Log in Today.",
        exercises: [
          ex("cat-camel", 1, 10),
          ex("bird-dog", 1, 8),
          ex("couch-stretch", 1, 60),
          ex("inchworm", 1, 6),
          ex("bear-crawl", 1, 12),
        ],
      },
    ],
  },
  {
    id: "beginner-full-body-habit",
    name: "Full Body Habit Builder",
    category: "beginner",
    description: "Simple full body 3x/week bodyweight. Free core foundation for strength, mobility, and consistency. Progress by adding reps or sets.",
    duration: "6-12 weeks",
    focus: "Consistency + base strength",
    sessions: [
      {
        id: "fbh-a",
        name: "Session A",
        exercises: [
          ex("push-ups", 3, 10),
          ex("squats", 3, 12),
          ex("glute-bridge", 3, 12),
          ex("plank", 3, 25),
          ex("couch-stretch", 1, 45),
        ],
      },
      {
        id: "fbh-b",
        name: "Session B",
        exercises: [
          ex("lunges", 3, 8),
          ex("pike-pushup", 3, 6),
          ex("single-leg-glute", 3, 8),
          ex("side-plank", 2, 20),
          ex("superman", 2, 8),
        ],
      },
    ],
  },
  {
    id: "beginner-habit-reset",
    name: "Daily Habit Reset (Free Core)",
    category: "beginner",
    description: "Short daily mobility + mind + simple log. Free core for building the consistent path with zero barriers.",
    duration: "Ongoing",
    focus: "Daily consistency",
    sessions: [
      {
        id: "reset-daily",
        name: "Reset Flow",
        notes: "5-8 min. Log in Nutrition or Today.",
        exercises: [
          ex("cat-camel", 1, 8),
          ex("glute-bridge", 1, 10),
          ex("couch-stretch", 1, 45),
          ex("superman", 1, 8),
        ],
      },
    ],
  },
  {
    id: "beginner-mobility-only",
    name: "Mobility Only Daily",
    category: "beginner",
    description: "Pure free core mobility for joint health and recovery. Use as standalone or add to any training.",
    duration: "Ongoing",
    focus: "Joint health + recovery",
    sessions: [
      {
        id: "mob-only",
        name: "Full Mobility Circuit",
        exercises: [
          ex("cat-camel", 1, 10),
          ex("bird-dog", 1, 8),
          ex("couch-stretch", 1, 60),
          ex("inchworm", 1, 6),
          ex("bear-crawl", 1, 12),
          ex("wall-sit", 1, 30),
        ],
      },
    ],
  },
  {
    id: "beginner-simple-habit",
    name: "Simple Daily Movement Habit",
    category: "beginner",
    description: "Free core 10-min daily: mix of strength and mobility. Builds consistency without overwhelm. Log in Today for streak.",
    duration: "Ongoing",
    focus: "Daily habit",
    sessions: [
      {
        id: "simple-daily",
        name: "10-Min Daily",
        notes: "Do 4-5x/week. Progress reps over time.",
        exercises: [
          ex("push-ups", 2, 8),
          ex("squats", 2, 10),
          ex("glute-bridge", 2, 10),
          ex("plank", 2, 20),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },
  {
    id: "beginner-nutrition-habit",
    name: "Fuel + Movement Habit",
    category: "beginner",
    description: "Free core: bodyweight moves + simple protein log. Synergy between Fuel and Train for better results.",
    duration: "Ongoing",
    focus: "Nutrition + training habit",
    sessions: [
      {
        id: "fuel-move",
        name: "Session + Log",
        notes: "Do moves, then log a high-protein snack in Nutrition.",
        exercises: [
          ex("lunges", 2, 8),
          ex("push-ups", 2, 8),
          ex("plank", 2, 25),
          ex("bird-dog", 1, 6),
        ],
      },
    ],
  },
  {
    id: "beginner-core-stability",
    name: "Core Stability Builder",
    category: "beginner",
    description: "Free core focus on planks, bridges, and bird dogs for posture and injury prevention. Use as warm-up or standalone.",
    duration: "Ongoing",
    focus: "Core + stability",
    sessions: [
      {
        id: "core-a",
        name: "Stability Circuit",
        exercises: [
          ex("plank", 3, 30),
          ex("glute-bridge", 3, 12),
          ex("bird-dog", 3, 8),
          ex("side-plank", 2, 20),
        ],
      },
    ],
  },
  {
    id: "beginner-upper-body-habit",
    name: "Upper Body Daily",
    category: "beginner",
    description: "Simple push/pull bodyweight for upper body strength. Free core, minimal space needed.",
    duration: "Ongoing",
    focus: "Upper body",
    sessions: [
      {
        id: "upper-a",
        name: "Push/Pull Circuit",
        exercises: [
          ex("push-ups", 3, 8),
          ex("inverted-row", 3, 6),
          ex("pike-pushup", 2, 5),
          ex("dips-chair", 2, 8),
        ],
      },
    ],
  },
  {
    id: "beginner-lower-body-habit",
    name: "Lower Body Daily",
    category: "beginner",
    description: "Free core leg and glute focus with mobility. Builds strength and mobility synergy for Train + Move.",
    duration: "Ongoing",
    focus: "Lower body + mobility",
    sessions: [
      {
        id: "lower-a",
        name: "Leg + Mobility",
        exercises: [
          ex("squats", 3, 10),
          ex("lunges", 3, 8),
          ex("glute-bridge", 3, 12),
          ex("couch-stretch", 1, 60),
        ],
      },
    ],
  },
  {
    id: "beginner-full-habit-stack",
    name: "Full Habit Stack Daily",
    category: "beginner",
    description: "Complete free core daily: strength, mobility, mind cues. Log in Nutrition and Today for full synergy.",
    duration: "Ongoing",
    focus: "All pillars habit",
    sessions: [
      {
        id: "full-stack",
        name: "Daily Stack",
        notes: "5-10 min total. Add mind prompt + nutrition log.",
        exercises: [
          ex("push-ups", 2, 8),
          ex("squats", 2, 10),
          ex("plank", 2, 20),
          ex("couch-stretch", 1, 45),
          ex("bird-dog", 1, 6),
        ],
      },
    ],
  },
  {
    id: "beginner-mobility-mind",
    name: "Mobility + Mind Daily",
    category: "beginner",
    description: "Free core: mobility flows with built-in mind prompts. Builds Move and Mind synergy for sustainable habits.",
    duration: "Ongoing",
    focus: "Mobility + mental",
    sessions: [
      {
        id: "mob-mind-daily",
        name: "Daily Flow + Breath",
        notes: "Do flow, then 2 min mind prompt. Log win.",
        exercises: [
          ex("cat-camel", 1, 10),
          ex("bird-dog", 1, 8),
          ex("couch-stretch", 1, 60),
          ex("inchworm", 1, 6),
        ],
      },
    ],
  },
  {
    id: "beginner-bodyweight-habit",
    name: "Full Bodyweight Habit",
    category: "beginner",
    description: "Free core full body bodyweight for strength and mobility. Use as base for all pillars.",
    duration: "Ongoing",
    focus: "Full body habit",
    sessions: [
      {
        id: "bw-full",
        name: "Full Body Circuit",
        exercises: [
          ex("push-ups", 3, 10),
          ex("squats", 3, 12),
          ex("lunges", 3, 8),
          ex("plank", 3, 25),
          ex("couch-stretch", 1, 45),
          ex("bear-crawl", 1, 10),
        ],
      },
    ],
  },
  // ─── Additional Free Core Starters (unique, no dups) ─────────────────────
  {
    id: "beginner-animal-flow",
    name: "Animal Flow Basics (Free)",
    category: "beginner",
    description: "Free core: bear crawl, crab walk sim, and inchworm for full body coordination + fun movement. Global, zero equip.",
    duration: "Ongoing habit",
    focus: "Coordination + mobility",
    sessions: [
      { id: "af-1", name: "Animal Circuit", notes: "Low to ground, breathe, 4-6 rounds.", exercises: [ex("bear-crawl", 3, 12), ex("inchworm", 3, 6), ex("pushup-to-down-dog", 2, 5), ex("frog-pose", 1, 45)] },
    ],
  },
  {
    id: "beginner-balance-stability",
    name: "Balance & Stability Daily",
    category: "beginner",
    description: "Free core single leg + core work for ankle/knee/hip health and focus. Pairs with Mind for resilience.",
    duration: "Ongoing",
    focus: "Stability + mind",
    sessions: [
      { id: "bal-1", name: "Balance Stack", exercises: [ex("single-leg-stand-hold", 2, 30), ex("glute-bridge", 3, 10), ex("side-plank", 2, 20), ex("bird-dog", 2, 8)] },
    ],
  },
  {
    id: "beginner-desk-reset",
    name: "Desk/Travel Reset Flow (Free)",
    category: "beginner",
    description: "5-min anywhere reset: neck, thoracic, hips, ankles. Perfect for global users with limited space or time.",
    duration: "Daily micro-habit",
    focus: "Posture + reset",
    sessions: [
      { id: "desk-1", name: "Reset Circuit", notes: "Do between calls or on layovers. Log as movement win.", exercises: [ex("neck-circles-release", 1, 10), ex("wall-angels", 2, 8), ex("thread-needle", 2, 6), ex("ankle-dorsiflex-rock", 2, 10), ex("couch-stretch", 1, 45)] },
    ],
  },
  {
    id: "beginner-upper-lower-bodyweight",
    name: "Upper/Lower Bodyweight Split (Free)",
    category: "beginner",
    description: "Simple 4-day bodyweight split. Push/pull/legs focus with mobility finishers. No gym needed.",
    duration: "6-10 weeks",
    focus: "Balanced bodyweight",
    sessions: [
      { id: "ulw-u", name: "Upper Push/Pull", exercises: [ex("push-ups", 3, 10), ex("pike-pushup", 2, 6), ex("inverted-row", 3, 8), ex("dips-chair", 2, 8)] },
      { id: "ulw-l", name: "Lower + Core", exercises: [ex("squats", 3, 12), ex("lunges", 3, 8), ex("single-leg-glute", 2, 8), ex("plank", 2, 30), ex("couch-stretch", 1, 60)] },
    ],
  },

  // New free core unique starters (habit + synergy focused)
  {
    id: "beginner-mind-mobility-stack",
    name: "Mind + Mobility Micro Stack (Free)",
    category: "beginner",
    description: "Free core 6-8 min: mobility flow + built-in mind prompts. Builds Move + Mind synergy with zero equipment. Log the win in Nutrition or Today.",
    duration: "Ongoing daily habit",
    focus: "Resilience + mobility",
    sessions: [
      {
        id: "mm-1",
        name: "Micro Stack",
        notes: "Do the flow, then 60s breath + 2 gratitudes. Streak +1.",
        exercises: [
          ex("cat-camel", 1, 8),
          ex("thread-needle", 1, 6),
          ex("couch-stretch", 1, 45),
          ex("superman-to-yti", 1, 8),
        ],
      },
    ],
  },
  {
    id: "beginner-assessment-safe-start",
    name: "Assessment-Guided Safe Start (Free)",
    category: "beginner",
    description: "Free core: take assessment first, then this low-impact full body + mobility to build confidence safely. Ideal entry after readiness screen.",
    duration: "4-6 weeks",
    focus: "Safe habit foundation",
    sessions: [
      {
        id: "safe-1",
        name: "Safe Full Body + Mobility",
        notes: "Focus on form and breath. Log win after. Use if assessment flagged caution.",
        exercises: [
          ex("wall-sit", 2, 20),
          ex("glute-bridge", 2, 10),
          ex("inverted-row", 2, 6),
          ex("cat-camel", 2, 8),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },
  {
    id: "beginner-quick-pillar-stack",
    name: "Quick Pillar Stack Habit (Free)",
    category: "beginner",
    description: "Free core 10-12 min: short strength + mobility + log a protein win. Builds Train + Move + Fuel synergy in one go. Perfect daily habit starter.",
    duration: "Ongoing",
    focus: "Synergy habit",
    sessions: [
      {
        id: "stack-1",
        name: "Mini Stack",
        notes: "Moves then log fuel. +1 streak + win entry.",
        exercises: [
          ex("push-ups", 2, 8),
          ex("squats", 2, 10),
          ex("glute-bridge", 1, 10),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },
  {
    id: "beginner-mindful-movement",
    name: "Mindful Movement Daily (Free)",
    category: "beginner",
    description: "Free core: 8 min bodyweight + built-in mind cues (breath, gratitude). Builds Move + Mind habit with zero gear. Log as win.",
    duration: "Ongoing",
    focus: "Mind-body connection",
    sessions: [
      {
        id: "mm-1",
        name: "Mindful Flow",
        notes: "Move slowly, breathe, end with 2 gratitudes. +1 streak.",
        exercises: [
          ex("cat-camel", 2, 8),
          ex("bird-dog", 2, 6),
          ex("glute-bridge", 2, 10),
          ex("wall-angels", 1, 8),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },
  {
    id: "beginner-no-equip-full",
    name: "No-Equip Full Body Daily (Free)",
    category: "beginner",
    description: "Free core: pure bodyweight full body circuit. Builds strength + mobility habit anywhere. Log fuel win after.",
    duration: "Ongoing",
    focus: "Accessible strength",
    sessions: [
      {
        id: "ne-1",
        name: "Full Body Circuit",
        notes: "3 rounds, rest as needed. +1 streak + nutrition log.",
        exercises: [
          ex("push-ups", 3, 10),
          ex("squats", 3, 12),
          ex("inverted-row", 3, 8),
          ex("lunges", 3, 8),
          ex("plank", 2, 30),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },
  {
    id: "beginner-global-protein-habit",
    name: "Global Protein + Movement Habit (Free)",
    category: "beginner",
    description: "Free core: simple bodyweight moves + log a high-protein global staple (lentils, eggs, yogurt). Synergy Fuel + Train. Accessible worldwide.",
    duration: "Ongoing",
    focus: "Nutrition + training habit",
    sessions: [
      {
        id: "gph-1",
        name: "Move + Fuel",
        notes: "Complete moves, then log one recipe from /nutrition (e.g. Lentil Stew or Egg Rice).",
        exercises: [
          ex("push-ups", 2, 8),
          ex("squats", 2, 10),
          ex("glute-bridge", 2, 10),
          ex("wall-angels", 1, 8),
        ],
      },
    ],
  },
  {
    id: "beginner-pillar-sync-daily",
    name: "Pillar Sync Daily (Free)",
    category: "beginner",
    description: "Free core 12 min: strength moves + mobility + log a high-protein snack. Builds Train + Move + Fuel synergy. Perfect daily habit.",
    duration: "Ongoing",
    focus: "Full synergy habit",
    sessions: [
      {
        id: "ps-1",
        name: "Sync Circuit",
        notes: "Do moves, then log protein in Nutrition. +1 streak.",
        exercises: [
          ex("push-ups", 2, 8),
          ex("squats", 2, 10),
          ex("glute-bridge", 2, 10),
          ex("couch-stretch", 1, 45),
          ex("bird-dog", 1, 6),
        ],
      },
    ],
  },
  {
    id: "beginner-assessment-recovery",
    name: "Assessment Recovery Flow (Free)",
    category: "beginner",
    description: "Free core: low-impact based on assessment (mobility + light strength). Safe entry point for cautious starters.",
    duration: "Ongoing",
    focus: "Safe foundation",
    sessions: [
      {
        id: "ar-1",
        name: "Recovery Circuit",
        notes: "Focus on breath and form. Log win after.",
        exercises: [
          ex("cat-camel", 2, 8),
          ex("glute-bridge", 2, 10),
          ex("wall-sit", 1, 20),
          ex("superman", 2, 8),
          ex("couch-stretch", 1, 60),
        ],
      },
    ],
  },
  {
    id: "beginner-pillar-sync-daily",
    name: "Pillar Sync Daily (Free)",
    category: "beginner",
    description: "Free core 12 min: strength moves + mobility + log a high-protein snack. Builds Train + Move + Fuel synergy. Perfect daily habit.",
    duration: "Ongoing",
    focus: "Full synergy habit",
    sessions: [
      {
        id: "ps-1",
        name: "Sync Circuit",
        notes: "Do moves, then log protein in Nutrition. +1 streak.",
        exercises: [
          ex("push-ups", 2, 8),
          ex("squats", 2, 10),
          ex("glute-bridge", 2, 10),
          ex("couch-stretch", 1, 45),
          ex("bird-dog", 1, 6),
        ],
      },
    ],
  },
  {
    id: "beginner-assessment-recovery",
    name: "Assessment Recovery Flow (Free)",
    category: "beginner",
    description: "Free core: low-impact based on assessment (mobility + light strength). Safe entry point for cautious starters.",
    duration: "Ongoing",
    focus: "Safe foundation",
    sessions: [
      {
        id: "ar-1",
        name: "Recovery Circuit",
        notes: "Focus on breath and form. Log win after.",
        exercises: [
          ex("cat-camel", 2, 8),
          ex("glute-bridge", 2, 10),
          ex("wall-sit", 1, 20),
          ex("superman", 2, 8),
          ex("couch-stretch", 1, 60),
        ],
      },
    ],
  },
  {
    id: "beginner-pillar-sync-daily",
    name: "Pillar Sync Daily (Free)",
    category: "beginner",
    description: "Free core 12 min: strength moves + mobility + log a high-protein snack. Builds Train + Move + Fuel synergy. Perfect daily habit.",
    duration: "Ongoing",
    focus: "Full synergy habit",
    sessions: [
      {
        id: "ps-1",
        name: "Sync Circuit",
        notes: "Do moves, then log protein in Nutrition. +1 streak.",
        exercises: [
          ex("push-ups", 2, 8),
          ex("squats", 2, 10),
          ex("glute-bridge", 2, 10),
          ex("couch-stretch", 1, 45),
          ex("bird-dog", 1, 6),
        ],
      },
    ],
  },
  {
    id: "beginner-assessment-recovery",
    name: "Assessment Recovery Flow (Free)",
    category: "beginner",
    description: "Free core: low-impact based on assessment (mobility + light strength). Safe entry point for cautious starters.",
    duration: "Ongoing",
    focus: "Safe foundation",
    sessions: [
      {
        id: "ar-1",
        name: "Recovery Circuit",
        notes: "Focus on breath and form. Log win after.",
        exercises: [
          ex("cat-camel", 2, 8),
          ex("glute-bridge", 2, 10),
          ex("wall-sit", 1, 20),
          ex("superman", 2, 8),
          ex("couch-stretch", 1, 60),
        ],
      },
    ],
  },
  {
    id: "beginner-pillar-sync-daily",
    name: "Pillar Sync Daily (Free)",
    category: "beginner",
    description: "Free core 12 min: strength moves + mobility + log a high-protein snack. Builds Train + Move + Fuel synergy. Perfect daily habit.",
    duration: "Ongoing",
    focus: "Full synergy habit",
    sessions: [
      {
        id: "ps-1",
        name: "Sync Circuit",
        notes: "Do moves, then log protein in Nutrition. +1 streak.",
        exercises: [
          ex("push-ups", 2, 8),
          ex("squats", 2, 10),
          ex("glute-bridge", 2, 10),
          ex("couch-stretch", 1, 45),
          ex("bird-dog", 1, 6),
        ],
      },
    ],
  },
  {
    id: "beginner-daily-mobility-mind-stack",
    name: "Daily Mobility + Mind Stack (Free)",
    category: "beginner",
    description: "Free core 10 min: mobility flow + built-in mind prompts (breath, gratitude). Builds Move + Mind habit with zero equipment. Log the win.",
    duration: "Ongoing",
    focus: "Mind-body daily habit",
    sessions: [
      {
        id: "dmm-1",
        name: "Mobility Mind Flow",
        notes: "Flow slowly, add breath and gratitude. +1 streak + cloud win.",
        exercises: [
          ex("cat-camel", 2, 8),
          ex("bird-dog", 2, 6),
          ex("glute-bridge", 2, 10),
          ex("couch-stretch", 1, 45),
          ex("superman", 2, 8),
        ],
      },
    ],
  },
  {
    id: "beginner-no-equip-pillar-stack",
    name: "No-Equip Pillar Stack (Free)",
    category: "beginner",
    description: "Free core 12 min: bodyweight strength + mobility + log protein snack. Full Train + Move + Fuel synergy. Perfect anywhere habit.",
    duration: "Ongoing",
    focus: "Complete daily synergy",
    sessions: [
      {
        id: "neps-1",
        name: "No-Equip Stack",
        notes: "Moves then Nutrition log. Builds all pillars.",
        exercises: [
          ex("push-ups", 3, 8),
          ex("squats", 3, 10),
          ex("inverted-row", 2, 8),
          ex("glute-bridge", 2, 10),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },
  {
    id: "beginner-daily-mobility-mind-stack",
    name: "Daily Mobility + Mind Stack (Free)",
    category: "beginner",
    description: "Free core 10 min: mobility flow + built-in mind prompts (breath, gratitude). Builds Move + Mind habit with zero equipment. Log the win.",
    duration: "Ongoing",
    focus: "Mind-body daily habit",
    sessions: [
      {
        id: "dmm-1",
        name: "Mobility Mind Flow",
        notes: "Flow slowly, add breath and gratitude. +1 streak + cloud win.",
        exercises: [
          ex("cat-camel", 2, 8),
          ex("bird-dog", 2, 6),
          ex("glute-bridge", 2, 10),
          ex("couch-stretch", 1, 45),
          ex("superman", 2, 8),
        ],
      },
    ],
  },
  {
    id: "beginner-no-equip-pillar-stack",
    name: "No-Equip Pillar Stack (Free)",
    category: "beginner",
    description: "Free core 12 min: bodyweight strength + mobility + log protein snack. Full Train + Move + Fuel synergy. Perfect anywhere habit.",
    duration: "Ongoing",
    focus: "Complete daily synergy",
    sessions: [
      {
        id: "neps-1",
        name: "No-Equip Stack",
        notes: "Moves then Nutrition log. Builds all pillars.",
        exercises: [
          ex("push-ups", 3, 8),
          ex("squats", 3, 10),
          ex("inverted-row", 2, 8),
          ex("glute-bridge", 2, 10),
          ex("couch-stretch", 1, 45),
        ],
      },
    ],
  },

  // ─── Famous free programs (launch wave `.181`) — never gated ─────────────
  {
    id: "free-531-bbb",
    name: "5/3/1 Boring But Big",
    category: "advanced",
    description:
      "Wendler 5/3/1 — three-week wave on squat, bench, deadlift and press, plus 5×10 supplemental. Percentages resolve against your own logged max the moment you start a session.",
    duration: "3-week wave + deload",
    focus: "Strength + hypertrophy",
    tags: ["strength"],
    sessions: W531_LIFTS.flatMap((lift) =>
      W531_WEEKS.map((week) => ({
        id: `f531-${lift.id}-${week.label.slice(5, 6)}`,
        name: `${lift.name} — ${week.label}`,
        weekLabel: week.label,
        notes:
          "Top set is the money set — leave a rep in the tank on weeks 1–2, push the last set week 3. Deload week: 40/50/60% before the next wave.",
        exercises: w531(lift.main, lift.bbb, week.pcts, week.reps),
      }))
    ),
  },
  {
    id: "free-gzclp",
    name: "GZCLP Linear",
    category: "advanced",
    description:
      "Cody Lefever's GZCL linear progression — tier 1 heavy triples, tier 2 volume, tier 3 pump work. The classic post-5×5 novice program.",
    duration: "Until stalls",
    focus: "Novice linear",
    tags: ["strength"],
    sessions: [
      {
        id: "fgzcl-a",
        name: "Day A — Squat / Bench / Lat",
        notes: "T1: 5×3+ last set AMRAP. T2: 3×10. T3: 3×15+. Add weight when all reps complete.",
        exercises: [ex("squats", 5, 3), ex("bench-press", 3, 10), ex("lat-pulldown", 3, 15)],
      },
      {
        id: "fgzcl-b",
        name: "Day B — OHP / Deadlift / Row",
        notes: "T1: 5×3+ last set AMRAP. T2: 3×10. T3: 3×15+.",
        exercises: [ex("overhead-press", 5, 3), ex("deadlift", 3, 5), ex("barbell-row", 3, 15)],
      },
    ],
  },
  {
    id: "free-basic-beginner",
    name: "r/Fitness Basic Beginner",
    category: "beginner",
    description:
      "The r/Fitness Basic Beginner Routine — two alternating full-body days, 3×5+ with an AMRAP last set. The most-recommended first barbell program on the internet.",
    duration: "8–12 weeks",
    focus: "First barbell program",
    tags: ["strength"],
    sessions: [
      {
        id: "fbbr-a",
        name: "Workout A — Bench / Squat / Row",
        notes: "3×5+, last set AMRAP (stop 1–2 reps shy of failure). Add 2.5 kg when all reps complete.",
        exercises: [ex("bench-press", 3, 5), ex("squats", 3, 5), ex("barbell-row", 3, 5)],
      },
      {
        id: "fbbr-b",
        name: "Workout B — Press / Deadlift / Pull-ups",
        notes: "3×5+ press and deadlift; pull-ups 3×amrap (or lat pulldown).",
        exercises: [ex("overhead-press", 3, 5), ex("deadlift", 3, 5), ex("pull-ups", 3, 8)],
      },
    ],
  },
  // ─── Advanced ─────────────────────────────────────────────────────────────
  {
    id: "adv-5x5",
    name: "StrongLifts 5×5",
    category: "advanced",
    description:
      "Classic linear progression. Alternate A/B, add 5 lb when all sets complete.",
    duration: "Ongoing",
    focus: "Full-body strength",
    sessions: [
      {
        id: "5x5-a",
        name: "Workout A",
        notes: "Squat, Bench, Row — 5×5 each. Add 5 lb per lift when successful.",
        exercises: [ex("squats", 5, 5), ex("bench-press", 5, 5), ex("barbell-row", 5, 5)],
      },
      {
        id: "5x5-b",
        name: "Workout B",
        notes: "Squat, OHP, Deadlift — 5×5 squat/OHP, 1×5 deadlift.",
        exercises: [ex("squats", 5, 5), ex("overhead-press", 5, 5), ex("deadlift", 1, 5)],
      },
    ],
  },
  {
    id: "adv-starting-strength",
    name: "Starting Strength (Style)",
    category: "advanced",
    description: "Linear progression emphasizing squat, press, and pull. Deadlift 1×5.",
    duration: "3–6 months",
    focus: "Novice strength",
    sessions: [
      {
        id: "ss-a",
        name: "Workout A",
        exercises: [ex("squats", 3, 5), ex("bench-press", 3, 5), ex("deadlift", 1, 5)],
      },
      {
        id: "ss-b",
        name: "Workout B",
        exercises: [ex("squats", 3, 5), ex("overhead-press", 3, 5), ex("barbell-row", 3, 5)],
      },
    ],
  },
  {
    id: "adv-texas-method",
    name: "Texas Method",
    category: "advanced",
    description:
      "Weekly volume, recovery, and intensity. Standard 3-day Texas Method for intermediates.",
    duration: "Weekly cycle",
    focus: "Intermediate strength",
    sessions: [
      {
        id: "tm-volume",
        name: "Monday — Volume",
        notes: "5×5 @ ~90% of Friday weight.",
        exercises: [ex("squats", 5, 5), ex("bench-press", 5, 5), ex("barbell-row", 3, 8)],
      },
      {
        id: "tm-recovery",
        name: "Wednesday — Recovery",
        notes: "2×5 squat & press @ ~80% of Monday.",
        exercises: [ex("squats", 2, 5), ex("overhead-press", 3, 5), ex("pull-ups", 3, 8)],
      },
      {
        id: "tm-intensity",
        name: "Friday — Intensity",
        notes: "1×5 PR attempts on squat & bench.",
        exercises: [ex("squats", 1, 5), ex("bench-press", 1, 5), ex("deadlift", 1, 5)],
      },
    ],
  },
  {
    id: "adv-20-rep-squat",
    name: "20 Rep Squat (Classic)",
    category: "advanced",
    description:
      "Breathing squats plus a lighter day. One set of 20, then upper-body pump work.",
    duration: "6–12 weeks",
    focus: "Mass & squat",
    sessions: [
      {
        id: "20rs-main",
        name: "Breathing Squat Day",
        notes: "1×20 squat — ~10 lb below 10RM. Breathe 3× between reps after rep 10.",
        exercises: [
          ex("squats", 1, 20),
          ex("bench-press", 3, 10),
          ex("barbell-row", 3, 10),
          ex("overhead-press", 2, 10),
        ],
      },
      {
        id: "20rs-light",
        name: "Light Squat Day",
        notes: "80% of Monday squat for 3×5.",
        exercises: [ex("squats", 3, 5), ex("bench-press", 3, 8), ex("deadlift", 1, 15)],
      },
    ],
  },
  {
    id: "adv-hatch-squat",
    name: "Hatch Squat (Intro)",
    category: "advanced",
    description:
      "Four-day squat emphasis with back and front squat. Simplified Hatch-style rotation.",
    duration: "4 weeks",
    focus: "Squat strength",
    sessions: [
      {
        id: "hatch-adv-1",
        name: "Volume Back Squat",
        notes: "5×5 @ 75–80%.",
        exercises: [ex("squats", 5, 5), ex("romanian-deadlift", 3, 8)],
      },
      {
        id: "hatch-adv-2",
        name: "Front Squat Day",
        exercises: [ex("front-squat", 4, 4), ex("squats", 3, 3)],
      },
      {
        id: "hatch-adv-3",
        name: "Moderate Day",
        exercises: [ex("squats", 3, 3), ex("hip-thrust", 3, 8)],
      },
      {
        id: "hatch-adv-4",
        name: "Heavy Singles",
        notes: "Work to 1–3 reps @ 90–95%.",
        exercises: [ex("squats", 3, 1), ex("front-squat", 2, 2)],
      },
    ],
  },
  {
    id: "adv-madcow",
    name: "Madcow 5×5",
    category: "advanced",
    description: "Weekly ramping 5×5 on squat, bench, row, and press. 5% jumps week to week.",
    duration: "9+ weeks",
    focus: "Weekly progression",
    sessions: [
      {
        id: "madcow-a",
        name: "Workout A",
        notes: "Ramp sets: 40%, 60%, 80%, 90%, 100% of weekly top set across 5 sets.",
        exercises: [ex("squats", 5, 5), ex("bench-press", 5, 5), ex("barbell-row", 5, 5)],
      },
      {
        id: "madcow-b",
        name: "Workout B",
        exercises: [ex("squats", 5, 5), ex("overhead-press", 5, 5), ex("deadlift", 1, 5)],
      },
    ],
  },

  // Bodybuilding example (hypertrophy focus)
  {
    id: "bb-upper-lower",
    name: "Bodybuilding Upper/Lower (Hypertrophy)",
    category: "advanced",
    description: "4-day split for muscle growth. 8-12 rep range, controlled eccentrics, 60-90s rest on isolations.",
    duration: "8-12 weeks",
    focus: "Hypertrophy",
    tags: ["hypertrophy"],
    sessions: [
      { id: "bb-ul-u1", name: "Upper A", exercises: [ex("bench-press", 4, 8), ex("barbell-row", 4, 8), ex("dumbbell-fly", 3, 12), ex("bicep-curl", 3, 10)] },
      { id: "bb-ul-l1", name: "Lower A", exercises: [ex("squats", 4, 8), ex("romanian-deadlift", 3, 10), ex("leg-extension", 3, 12), ex("hip-thrust", 3, 10)] },
      { id: "bb-ul-u2", name: "Upper B", exercises: [ex("overhead-press", 4, 8), ex("lat-pulldown", 4, 10), ex("lateral-raise-db", 3, 15), ex("triceps-extension", 3, 12)] },
      { id: "bb-ul-l2", name: "Lower B", exercises: [ex("front-squat", 3, 8), ex("lunges", 3, 10), ex("seated-calf", 4, 15), ex("glute-bridge", 3, 12)] },
    ],
  },
  // Corrective starter (integrate daily)
  {
    id: "corr-mobility",
    name: "Corrective & Mobility Block",
    category: "beginner",
    description: "3x/week mobility + activation to bulletproof shoulders, hips, core. Use before or after main lifts.",
    duration: "4-6 weeks",
    focus: "Injury prevention & movement quality",
    tags: ["corrective"],
    sessions: [
      { id: "corr-a", name: "Upper Focus + Core", notes: "Band work for scapular health, anti-rotation core.", exercises: [ex("band-pull-apart", 3, 15), ex("face-pull-band", 3, 15), ex("dead-bug", 3, 8), ex("cat-camel", 2, 10)] },
      { id: "corr-b", name: "Lower + Hips", notes: "Glute activation, hip mobility for squat/deadlift health.", exercises: [ex("glute-bridge", 3, 12), ex("bird-dog", 3, 8), ex("hip-thrust", 3, 10)] },
    ],
  },
  // Ch11 advanced intensity: supersets, giant sets, rest-pause, drop sets, EuroBlast, 20-rep, DC style.
  {
    id: "cond-emom-starter",
    name: "EMOM Metcon Starter",
    category: "beginner",
    description:
      "20-minute every-minute-on-the-minute conditioning. Scales globally with bodyweight — burpees, squats, push-ups rotation.",
    duration: "4 weeks",
    focus: "Conditioning & work capacity",
    tags: ["conditioning"],
    sessions: [
      {
        id: "emom-1",
        name: "EMOM 20 — Burpees",
        notes: "Min 1: 8 burpees. Rest remainder. Track rounds completed.",
        exercises: [ex("emom-burpees", 1, 8)],
      },
      {
        id: "emom-2",
        name: "EMOM 20 — Squat + Push",
        notes: "Alternate: odd minutes air squats, even push-ups.",
        exercises: [ex("amrap-air-squat-pushup", 1, 1)],
      },
      {
        id: "emom-3",
        name: "Mixed Modal",
        notes: "KB swing + mountain climbers + jump rope singles.",
        exercises: [
          ex("kettlebell-swing", 3, 15),
          ex("mountain-climbers", 3, 30),
          ex("jump-rope-single", 3, 50),
        ],
      },
    ],
  },
  {
    id: "cond-engine-builder",
    name: "Engine Builder (Intervals)",
    category: "advanced",
    description:
      "Energy system development — bike sprints, row repeats, sled work. Complements strength without destroying recovery (evidence-based conditioning principles).",
    duration: "6 weeks",
    focus: "Aerobic power & repeatability",
    tags: ["conditioning"],
    sessions: [
      {
        id: "eb-bike",
        name: "Bike Intervals",
        notes: "20s on / 40s off × 10. Log perceived effort in Track pillar.",
        exercises: [ex("assault-bike-sprint", 1, 10)],
      },
      {
        id: "eb-row",
        name: "Row Repeats",
        notes: "3×500m hard, 2 min rest between.",
        exercises: [ex("rower-500m-repeats", 3, 1)],
      },
      {
        id: "eb-sled",
        name: "Sled + Carry",
        notes: "Prowler push + farmer carry finisher.",
        exercises: [ex("prowler-push", 4, 1), ex("farmer-walk-dbs", 3, 1)],
      },
    ],
  },
  {
    id: "corr-desk-reset",
    name: "Desk Reset & Prehab",
    category: "beginner",
    description:
      "Daily 10-minute corrective block for desk workers — hips, thoracic spine, scapular control. Evidence-based corrective exercise foundations.",
    duration: "Ongoing",
    focus: "Posture & movement quality",
    tags: ["corrective"],
    sessions: [
      {
        id: "desk-a",
        name: "Upper Reset",
        exercises: [
          ex("wall-angels", 2, 10),
          ex("band-pull-apart", 3, 15),
          ex("thread-needle", 2, 8),
          ex("neck-circles-release", 1, 5),
        ],
      },
      {
        id: "desk-b",
        name: "Lower Reset",
        exercises: [
          ex("hip-90-90-flow", 2, 8),
          ex("couch-stretch", 2, 45),
          ex("clamshell", 2, 12),
          ex("ankle-dorsiflex-rock", 2, 12),
        ],
      },
      {
        id: "desk-c",
        name: "Full Chain",
        exercises: [
          ex("worlds-greatest-stretch", 2, 6),
          ex("cat-camel", 2, 10),
          ex("dead-bug", 3, 8),
          ex("pallof-press", 2, 10),
        ],
      },
    ],
  },
  {
    id: "hypertrophy-ppl-lite",
    name: "Push / Pull / Legs (Hypertrophy Lite)",
    category: "advanced",
    description:
      "Classic 3-day PPL for muscle growth — 8–12 reps, 60–90s rest on accessories. Free template from bodybuilding programming principles.",
    duration: "8 weeks",
    focus: "Muscle hypertrophy",
    tags: ["hypertrophy"],
    sessions: [
      {
        id: "ppl-push",
        name: "Push",
        exercises: [
          ex("bench-press", 4, 8),
          ex("incline-dumbbell-press", 3, 10),
          ex("overhead-press", 3, 10),
          ex("lateral-raise-db", 3, 15),
          ex("rope-tricep-ext", 3, 12),
        ],
      },
      {
        id: "ppl-pull",
        name: "Pull",
        exercises: [
          ex("barbell-row", 4, 8),
          ex("lat-pulldown", 3, 10),
          ex("face-pull", 3, 15),
          ex("dumbbell-row", 3, 10),
          ex("bicep-curl", 3, 12),
        ],
      },
      {
        id: "ppl-legs",
        name: "Legs",
        exercises: [
          ex("squats", 4, 8),
          ex("romanian-deadlift", 3, 10),
          ex("leg-extension", 3, 12),
          ex("hip-thrust", 3, 10),
          ex("standing-calf-raise", 4, 15),
        ],
      },
    ],
  },
];

/** Deduped catalog — copy-paste left duplicate ids that break React keys in Builder. */
export const PROGRAM_TEMPLATES: ProgramTemplate[] = (() => {
  const seen = new Set<string>();
  return PROGRAM_TEMPLATES_RAW.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
})();

/** Infer program tags from name, focus, and description when not set explicitly. */
export function getProgramTags(program: ProgramTemplate): ProgramTag[] {
  if (program.tags?.length) return program.tags;
  const text = `${program.name} ${program.description} ${program.focus}`.toLowerCase();
  const tags: ProgramTag[] = [];
  if (/corrective|mobility|prehab|injury|movement quality|activation|bulletproof|rehab/.test(text)) {
    tags.push("corrective");
  }
  if (/conditioning|metcon|cardio|emom|amrap|interval|energy system|hwpo|sprint|row repeat|bike/.test(text)) {
    tags.push("conditioning");
  }
  if (/hypertrophy|bodybuilding|pump|muscle growth|8-12|isolation|bb |muscle|volume block|intensity methods|euroblast|giant set/.test(text)) {
    tags.push("hypertrophy");
  }
  if (/strength|5x5|powerlifting|peaking|1rm|squat pr|bench|deadlift|texas|sheiko|smolov|5×5|linear|dup|block/.test(text)) {
    tags.push("strength");
  }
  if (tags.length === 0) tags.push("strength");
  return [...new Set(tags)];
}

export function getProgramsByTag(tag: ProgramTag): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.filter((p) => getProgramTags(p).includes(tag));
}

export function getProgramById(id: string): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATES.find((p) => p.id === id);
}

export function getProgramsByCategory(category: ProgramCategory): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.filter((p) => p.category === category);
}

export function draftExercisesFromSession(session: ProgramSession) {
  const stamp = Date.now();
  return {
    workoutName: session.name,
    notes: session.notes,
    exercises: session.exercises
      .filter((e) => e.sets.length > 0)
      .map((e, i) => ({
        key: `tpl-${stamp}-${i}`,
        exerciseId: e.exerciseId,
        sets: e.sets.map((s) => ({ ...s })),
      })),
  };
}
