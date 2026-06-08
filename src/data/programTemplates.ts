import type { WorkoutExerciseTemplate } from "@/types";

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

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
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

  // ─── Pro ──────────────────────────────────────────────────────────────────
  {
    id: "pro-texas-method",
    name: "Texas Method (Full)",
    category: "pro",
    description:
      "Complete Texas Method with chin-ups, power cleans optional, and deadlift cycling on intensity day.",
    duration: "Weekly + 6-week blocks",
    focus: "Intermediate peaking",
    sessions: [
      {
        id: "pro-tm-vol",
        name: "Monday — Volume",
        weekLabel: "Intensity base",
        notes: "5×5 squat/bench @ 90% Friday. Rows 3×8. Add 5 lb to Friday when Monday is easy.",
        exercises: [
          ex("squats", 5, 5),
          ex("bench-press", 5, 5),
          ex("barbell-row", 3, 8),
          ex("face-pull", 3, 15),
        ],
      },
      {
        id: "pro-tm-rec",
        name: "Wednesday — Recovery",
        notes: "2×5 @ 80% Monday. Chin-ups 3×8–12. No grinding.",
        exercises: [
          ex("squats", 2, 5),
          ex("overhead-press", 3, 5),
          ex("pull-ups", 3, 10),
          ex("hanging-leg-raise", 3, 12),
        ],
      },
      {
        id: "pro-tm-int",
        name: "Friday — Intensity",
        notes: "1×5 PR squat & bench. Deadlift 1×5 every other week; light RDL on off weeks.",
        exercises: [
          ex("squats", 1, 5),
          ex("bench-press", 1, 5),
          ex("deadlift", 1, 5),
          ex("romanian-deadlift", 3, 8),
        ],
      },
      {
        id: "pro-tm-deload",
        name: "Deload Week (Optional)",
        weekLabel: "Every 4–6 weeks",
        notes: "60% volume and intensity across all lifts.",
        exercises: [
          ex("squats", 3, 3),
          ex("bench-press", 3, 3),
          ex("overhead-press", 2, 5),
        ],
      },
    ],
  },
  {
    id: "pro-20-rep-squat",
    name: "20 Rep Squat (Full Program)",
    category: "pro",
    description:
      "Complete Super Squats-style block: breathing squats, light day, and progressive overload notes.",
    duration: "6–12 weeks",
    focus: "Hypertrophy & squat PR",
    sessions: [
      {
        id: "pro-20rs-w1",
        name: "Week 1–2 — Main Day",
        weekLabel: "Accumulation",
        notes: "1×20 @ ~10RM minus 10 lb. Milk & sleep. Add 5 lb when all 20 are strict.",
        exercises: [
          ex("squats", 1, 20),
          ex("bench-press", 3, 10),
          ex("barbell-row", 3, 10),
          ex("overhead-press", 2, 10),
          ex("bicep-curl", 1, 15),
          ex("crunches", 3, 20),
        ],
      },
      {
        id: "pro-20rs-light",
        name: "Light Squat Day",
        notes: "80% Monday weight, 3×5. Deadlift 1×15 light.",
        exercises: [
          ex("squats", 3, 5),
          ex("bench-press", 3, 8),
          ex("deadlift", 1, 15),
          ex("lat-pulldown", 3, 10),
        ],
      },
    ],
  },
  {
    id: "pro-hatch-squat",
    name: "Hatch Squat Cycle (Full)",
    category: "pro",
    description:
      "Full 4-day Hatch rotation: volume back squat, front squat, moderate triples, and heavy singles.",
    duration: "4–6 weeks",
    focus: "Squat peaking",
    sessions: [
      {
        id: "hatch-day1",
        name: "Day 1 — Volume Back Squat",
        weekLabel: "Day 1",
        notes: "5×5 @ 75–80%. Pause 2 min. RDL accessory.",
        exercises: [ex("squats", 5, 5), ex("romanian-deadlift", 3, 8), ex("calf-raise", 3, 12)],
      },
      {
        id: "hatch-day2",
        name: "Day 2 — Front Squat",
        weekLabel: "Day 2",
        notes: "Front squat 4×4, back squat 3×3 @ ~85%.",
        exercises: [ex("front-squat", 4, 4), ex("squats", 3, 3), ex("leg-curl", 3, 10)],
      },
      {
        id: "hatch-day3",
        name: "Day 3 — Moderate Triples",
        weekLabel: "Day 3",
        exercises: [ex("squats", 3, 3), ex("hip-thrust", 3, 8), ex("hanging-leg-raise", 3, 12)],
      },
      {
        id: "hatch-day4",
        name: "Day 4 — Heavy Singles",
        weekLabel: "Day 4",
        notes: "1×1–3 @ 90–95%. No grinders.",
        exercises: [ex("squats", 3, 1), ex("front-squat", 2, 2), ex("leg-press", 2, 8)],
      },
      {
        id: "hatch-deload",
        name: "Deload — 60% Week",
        weekLabel: "After week 4",
        exercises: [ex("squats", 3, 3), ex("front-squat", 2, 3)],
      },
    ],
  },
  {
    id: "pro-smolov-squat",
    name: "Smolov Squat",
    category: "pro",
    description:
      "13-week high-frequency squat program. Intro, base mesocycle, switching, and peak — enter % of 1RM as weight notes.",
    duration: "13 weeks",
    focus: "Squat specialization",
    sessions: [
      {
        id: "smolov-intro-1",
        name: "Intro — Session 1",
        weekLabel: "Weeks 1–2",
        notes: "6×3 @ 70% 1RM. Four sessions/week in intro.",
        exercises: [ex("squats", 6, 3)],
      },
      {
        id: "smolov-intro-2",
        name: "Intro — Session 2",
        weekLabel: "Weeks 1–2",
        notes: "7×5 @ 75% 1RM.",
        exercises: [ex("squats", 7, 5)],
      },
      {
        id: "smolov-base-1",
        name: "Base — Session 1",
        weekLabel: "Weeks 3–6",
        notes: "6×6 @ 70% 1RM.",
        exercises: [ex("squats", 6, 6)],
      },
      {
        id: "smolov-base-2",
        name: "Base — Session 2",
        weekLabel: "Weeks 3–6",
        notes: "7×5 @ 75% 1RM.",
        exercises: [ex("squats", 7, 5)],
      },
      {
        id: "smolov-base-3",
        name: "Base — Session 3",
        weekLabel: "Weeks 3–6",
        notes: "8×4 @ 80% 1RM.",
        exercises: [ex("squats", 8, 4)],
      },
      {
        id: "smolov-base-4",
        name: "Base — Session 4",
        weekLabel: "Weeks 3–6",
        notes: "10×3 @ 85% 1RM.",
        exercises: [ex("squats", 10, 3)],
      },
      {
        id: "smolov-switch",
        name: "Switching Phase",
        weekLabel: "Weeks 7–8",
        notes: "8×2 @ 80% — speed focus, 2 min rest.",
        exercises: [ex("squats", 8, 2), ex("box-jump", 3, 3)],
      },
      {
        id: "smolov-peak",
        name: "Peaking — 1RM Test",
        weekLabel: "Week 13",
        notes: "Deload week 12, then test 1RM.",
        exercises: [ex("squats", 1, 1)],
      },
    ],
  },
  {
    id: "pro-smolov-jr",
    name: "Smolov Jr",
    category: "pro",
    description:
      "3-week condensed squat peaker. Four sessions/week — same rep schemes as Smolov base in miniature.",
    duration: "3 weeks",
    focus: "Short squat peaking",
    sessions: [
      {
        id: "smolov-jr-w1-1",
        name: "Week 1 — Session 1",
        weekLabel: "Week 1",
        notes: "6×6 @ 65–70% 1RM.",
        exercises: [ex("squats", 6, 6)],
      },
      {
        id: "smolov-jr-w1-2",
        name: "Week 1 — Session 2",
        weekLabel: "Week 1",
        notes: "7×5 @ 70–75% 1RM.",
        exercises: [ex("squats", 7, 5)],
      },
      {
        id: "smolov-jr-w1-3",
        name: "Week 1 — Session 3",
        weekLabel: "Week 1",
        notes: "8×4 @ 75% 1RM.",
        exercises: [ex("squats", 8, 4)],
      },
      {
        id: "smolov-jr-w1-4",
        name: "Week 1 — Session 4",
        weekLabel: "Week 1",
        notes: "10×3 @ 80% 1RM.",
        exercises: [ex("squats", 10, 3)],
      },
      {
        id: "smolov-jr-w2-1",
        name: "Week 2 — Session 1",
        weekLabel: "Week 2",
        notes: "6×6 @ 70–75% 1RM.",
        exercises: [ex("squats", 6, 6)],
      },
      {
        id: "smolov-jr-w2-2",
        name: "Week 2 — Session 2",
        weekLabel: "Week 2",
        notes: "7×5 @ 75–80% 1RM.",
        exercises: [ex("squats", 7, 5)],
      },
      {
        id: "smolov-jr-w2-3",
        name: "Week 2 — Session 3",
        weekLabel: "Week 2",
        notes: "8×4 @ 80% 1RM.",
        exercises: [ex("squats", 8, 4)],
      },
      {
        id: "smolov-jr-w2-4",
        name: "Week 2 — Session 4",
        weekLabel: "Week 2",
        notes: "10×3 @ 82.5% 1RM.",
        exercises: [ex("squats", 10, 3)],
      },
      {
        id: "smolov-jr-w3-1",
        name: "Week 3 — Session 1",
        weekLabel: "Week 3",
        notes: "6×4 @ 80% 1RM.",
        exercises: [ex("squats", 6, 4)],
      },
      {
        id: "smolov-jr-w3-2",
        name: "Week 3 — Session 2",
        weekLabel: "Week 3",
        notes: "7×3 @ 82.5% 1RM.",
        exercises: [ex("squats", 7, 3)],
      },
      {
        id: "smolov-jr-w3-3",
        name: "Week 3 — Session 3",
        weekLabel: "Week 3",
        notes: "8×2 @ 85% 1RM.",
        exercises: [ex("squats", 8, 2)],
      },
      {
        id: "smolov-jr-w3-4",
        name: "Week 3 — Session 4 (Test)",
        weekLabel: "Week 3",
        notes: "Work up to 1×1–3, then test new 1RM if ready.",
        exercises: [ex("squats", 1, 1)],
      },
    ],
  },
  {
    id: "pro-sheiko-bench",
    name: "Sheiko Bench (Mini)",
    category: "pro",
    description:
      "High-frequency bench specialization sample — squat maintenance only. Scale % from competition max.",
    duration: "4 weeks",
    focus: "Bench peaking",
    sessions: [
      {
        id: "sheiko-b1",
        name: "Day 1 — Volume Bench",
        notes: "5×5 bench @ 70%. Squat 3×5 light.",
        exercises: [ex("bench-press", 5, 5), ex("squats", 3, 5), ex("tricep-pushdown", 3, 12)],
      },
      {
        id: "sheiko-b2",
        name: "Day 2 — Heavy Bench",
        notes: "4×3 @ 80%. Rows for balance.",
        exercises: [ex("bench-press", 4, 3), ex("barbell-row", 4, 6)],
      },
      {
        id: "sheiko-b3",
        name: "Day 3 — Speed Bench",
        notes: "8×3 @ 65%, 2 min rest.",
        exercises: [ex("bench-press", 8, 3), ex("overhead-press", 3, 5)],
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
    sessions: [
      { id: "corr-a", name: "Upper Focus + Core", notes: "Band work for scapular health, anti-rotation core.", exercises: [ex("band-pull-apart", 3, 15), ex("face-pull-band", 3, 15), ex("dead-bug", 3, 8), ex("cat-camel", 2, 10)] },
      { id: "corr-b", name: "Lower + Hips", notes: "Glute activation, hip mobility for squat/deadlift health.", exercises: [ex("glute-bridge", 3, 12), ex("bird-dog", 3, 8), ex("hip-thrust", 3, 10)] },
    ],
  },
  // Ch11 advanced intensity: supersets, giant sets, rest-pause, drop sets, EuroBlast, 20-rep, DC style.
  {
    id: "adv-intensity-methods",
    name: "Advanced Intensity Methods (Ch11 Bodybuilding)",
    category: "pro",
    description:
      "Shock/hypertrophy block using supersets, giant sets, rest-pause, drop sets, EuroBlast pumps, 20-rep squats, DC rest-pause. Periodize carefully (1-2x per year).",
    duration: "4-8 weeks",
    focus: "Advanced hypertrophy & mental toughness",
    sessions: [
      {
        id: "aim-push",
        name: "Push Shock",
        notes: "Supersets + giant + drops. Pre-exhaust optional.",
        exercises: [
          ex("superset-bench-row", 3, 8),
          ex("giant-set-shoulders", 3, 10),
          ex("drop-set-lateral-raise", 3, 12),
          ex("forced-rep-bench", 3, 6),
        ],
      },
      {
        id: "aim-pull-legs",
        name: "Pull/Legs Intensity",
        notes: "Rest-pause + negatives + 20-rep. DC for compounds.",
        exercises: [
          ex("rest-pause-squat", 4, 6),
          ex("20-rep-squat", 1, 20),
          ex("negative-pullup", 3, 5),
          ex("dc-training-restpause", 3, 8),
        ],
      },
      {
        id: "aim-pump",
        name: "Pump/EuroBlast Day",
        notes: "High-volume pump. Staggered, EuroBlast, pyramiding.",
        exercises: [
          ex("euroblast-curl", 2, 30),
          ex("staggered-curls", 3, 12),
          ex("pyramid-bench", 4, 10),
          ex("pre-exhaust-fly", 3, 12),
        ],
      },
    ],
  },
];

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
