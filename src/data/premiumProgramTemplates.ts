import 'server-only';
import type { WorkoutExerciseTemplate } from '@/types';
import type { ProgramTemplate } from '@/data/programTemplates';

function sets(count: number, reps: number, weight = 0): WorkoutExerciseTemplate['sets'] {
  return Array.from({ length: count }, () => ({ reps, weight }));
}

function ex(exerciseId: string, setCount: number, reps: number, weight = 0): WorkoutExerciseTemplate {
  return { exerciseId, sets: sets(setCount, reps, weight) };
}

/** Pro program templates — server-only; served via /api/premium/programs */
export const PREMIUM_PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: "pro-texas-method",
    name: "Texas Method (Full)",
    category: "pro",
    description: "Complete Texas Method with chin-ups, power cleans optional, and deadlift cycling on intensity day.",
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
    description: "Complete Super Squats-style block: breathing squats, light day, and progressive overload notes.",
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
    description: "Full 4-day Hatch rotation: volume back squat, front squat, moderate triples, and heavy singles.",
    duration: "4–6 weeks",
    focus: "Squat peaking",
    sessions: [
      {
        id: "hatch-day1",
        name: "Day 1 — Volume Back Squat",
        weekLabel: "Day 1",
        notes: "5×5 @ 75–80%. Pause 2 min. RDL accessory.",
        exercises: [
          ex("squats", 5, 5),
          ex("romanian-deadlift", 3, 8),
          ex("calf-raise", 3, 12),
        ],
      },
      {
        id: "hatch-day2",
        name: "Day 2 — Front Squat",
        weekLabel: "Day 2",
        notes: "Front squat 4×4, back squat 3×3 @ ~85%.",
        exercises: [
          ex("front-squat", 4, 4),
          ex("squats", 3, 3),
          ex("leg-curl", 3, 10),
        ],
      },
      {
        id: "hatch-day3",
        name: "Day 3 — Moderate Triples",
        weekLabel: "Day 3",
        exercises: [
          ex("squats", 3, 3),
          ex("hip-thrust", 3, 8),
          ex("hanging-leg-raise", 3, 12),
        ],
      },
      {
        id: "hatch-day4",
        name: "Day 4 — Heavy Singles",
        weekLabel: "Day 4",
        notes: "1×1–3 @ 90–95%. No grinders.",
        exercises: [
          ex("squats", 3, 1),
          ex("front-squat", 2, 2),
          ex("leg-press", 2, 8),
        ],
      },
      {
        id: "hatch-deload",
        name: "Deload — 60% Week",
        weekLabel: "After week 4",
        exercises: [
          ex("squats", 3, 3),
          ex("front-squat", 2, 3),
        ],
      },
    ],
  },
  {
    id: "pro-smolov-squat",
    name: "Smolov Squat",
    category: "pro",
    description: "13-week high-frequency squat program. Intro, base mesocycle, switching, and peak — enter % of 1RM as weight notes.",
    duration: "13 weeks",
    focus: "Squat specialization",
    sessions: [
      {
        id: "smolov-intro-1",
        name: "Intro — Session 1",
        weekLabel: "Weeks 1–2",
        notes: "6×3 @ 70% 1RM. Four sessions/week in intro.",
        exercises: [
          ex("squats", 6, 3),
        ],
      },
      {
        id: "smolov-intro-2",
        name: "Intro — Session 2",
        weekLabel: "Weeks 1–2",
        notes: "7×5 @ 75% 1RM.",
        exercises: [
          ex("squats", 7, 5),
        ],
      },
      {
        id: "smolov-base-1",
        name: "Base — Session 1",
        weekLabel: "Weeks 3–6",
        notes: "6×6 @ 70% 1RM.",
        exercises: [
          ex("squats", 6, 6),
        ],
      },
      {
        id: "smolov-base-2",
        name: "Base — Session 2",
        weekLabel: "Weeks 3–6",
        notes: "7×5 @ 75% 1RM.",
        exercises: [
          ex("squats", 7, 5),
        ],
      },
      {
        id: "smolov-base-3",
        name: "Base — Session 3",
        weekLabel: "Weeks 3–6",
        notes: "8×4 @ 80% 1RM.",
        exercises: [
          ex("squats", 8, 4),
        ],
      },
      {
        id: "smolov-base-4",
        name: "Base — Session 4",
        weekLabel: "Weeks 3–6",
        notes: "10×3 @ 85% 1RM.",
        exercises: [
          ex("squats", 10, 3),
        ],
      },
      {
        id: "smolov-switch",
        name: "Switching Phase",
        weekLabel: "Weeks 7–8",
        notes: "8×2 @ 80% — speed focus, 2 min rest.",
        exercises: [
          ex("squats", 8, 2),
          ex("box-jump", 3, 3),
        ],
      },
      {
        id: "smolov-peak",
        name: "Peaking — 1RM Test",
        weekLabel: "Week 13",
        notes: "Deload week 12, then test 1RM.",
        exercises: [
          ex("squats", 1, 1),
        ],
      },
    ],
  },
  {
    id: "pro-smolov-jr",
    name: "Smolov Jr",
    category: "pro",
    description: "3-week condensed squat peaker. Four sessions/week — same rep schemes as Smolov base in miniature.",
    duration: "3 weeks",
    focus: "Short squat peaking",
    sessions: [
      {
        id: "smolov-jr-w1-1",
        name: "Week 1 — Session 1",
        weekLabel: "Week 1",
        notes: "6×6 @ 65–70% 1RM.",
        exercises: [
          ex("squats", 6, 6),
        ],
      },
      {
        id: "smolov-jr-w1-2",
        name: "Week 1 — Session 2",
        weekLabel: "Week 1",
        notes: "7×5 @ 70–75% 1RM.",
        exercises: [
          ex("squats", 7, 5),
        ],
      },
      {
        id: "smolov-jr-w1-3",
        name: "Week 1 — Session 3",
        weekLabel: "Week 1",
        notes: "8×4 @ 75% 1RM.",
        exercises: [
          ex("squats", 8, 4),
        ],
      },
      {
        id: "smolov-jr-w1-4",
        name: "Week 1 — Session 4",
        weekLabel: "Week 1",
        notes: "10×3 @ 80% 1RM.",
        exercises: [
          ex("squats", 10, 3),
        ],
      },
      {
        id: "smolov-jr-w2-1",
        name: "Week 2 — Session 1",
        weekLabel: "Week 2",
        notes: "6×6 @ 70–75% 1RM.",
        exercises: [
          ex("squats", 6, 6),
        ],
      },
      {
        id: "smolov-jr-w2-2",
        name: "Week 2 — Session 2",
        weekLabel: "Week 2",
        notes: "7×5 @ 75–80% 1RM.",
        exercises: [
          ex("squats", 7, 5),
        ],
      },
      {
        id: "smolov-jr-w2-3",
        name: "Week 2 — Session 3",
        weekLabel: "Week 2",
        notes: "8×4 @ 80% 1RM.",
        exercises: [
          ex("squats", 8, 4),
        ],
      },
      {
        id: "smolov-jr-w2-4",
        name: "Week 2 — Session 4",
        weekLabel: "Week 2",
        notes: "10×3 @ 82.5% 1RM.",
        exercises: [
          ex("squats", 10, 3),
        ],
      },
      {
        id: "smolov-jr-w3-1",
        name: "Week 3 — Session 1",
        weekLabel: "Week 3",
        notes: "6×4 @ 80% 1RM.",
        exercises: [
          ex("squats", 6, 4),
        ],
      },
      {
        id: "smolov-jr-w3-2",
        name: "Week 3 — Session 2",
        weekLabel: "Week 3",
        notes: "7×3 @ 82.5% 1RM.",
        exercises: [
          ex("squats", 7, 3),
        ],
      },
      {
        id: "smolov-jr-w3-3",
        name: "Week 3 — Session 3",
        weekLabel: "Week 3",
        notes: "8×2 @ 85% 1RM.",
        exercises: [
          ex("squats", 8, 2),
        ],
      },
      {
        id: "smolov-jr-w3-4",
        name: "Week 3 — Session 4 (Test)",
        weekLabel: "Week 3",
        notes: "Work up to 1×1–3, then test new 1RM if ready.",
        exercises: [
          ex("squats", 1, 1),
        ],
      },
    ],
  },
  {
    id: "pro-sheiko-bench",
    name: "Sheiko Bench (Mini)",
    category: "pro",
    description: "High-frequency bench specialization sample — squat maintenance only. Scale % from competition max.",
    duration: "4 weeks",
    focus: "Bench peaking",
    sessions: [
      {
        id: "sheiko-b1",
        name: "Day 1 — Volume Bench",
        notes: "5×5 bench @ 70%. Squat 3×5 light.",
        exercises: [
          ex("bench-press", 5, 5),
          ex("squats", 3, 5),
          ex("tricep-pushdown", 3, 12),
        ],
      },
      {
        id: "sheiko-b2",
        name: "Day 2 — Heavy Bench",
        notes: "4×3 @ 80%. Rows for balance.",
        exercises: [
          ex("bench-press", 4, 3),
          ex("barbell-row", 4, 6),
        ],
      },
      {
        id: "sheiko-b3",
        name: "Day 3 — Speed Bench",
        notes: "8×3 @ 65%, 2 min rest.",
        exercises: [
          ex("bench-press", 8, 3),
          ex("overhead-press", 3, 5),
        ],
      },
    ],
  },
  {
    id: "adv-intensity-methods",
    name: "Advanced Intensity Methods (Ch11 Bodybuilding)",
    category: "pro",
    description: "Shock/hypertrophy block using supersets, giant sets, rest-pause, drop sets, EuroBlast pumps, 20-rep squats, DC rest-pause. Periodize carefully (1-2x per year).",
    duration: "4-8 weeks",
    focus: "Advanced hypertrophy & mental toughness",
    tags: ["hypertrophy","strength"],
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

export function getPremiumProgramTemplates(): ProgramTemplate[] {
  return PREMIUM_PROGRAM_TEMPLATES;
}
