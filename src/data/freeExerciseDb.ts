import type { Exercise, ExerciseLevel, MuscleGroup } from "@/types";

/**
 * Curated absorb of yuhonas/free-exercise-db (Unlicense).
 * Metadata only — see src/data/free-exercise-db/NOTICE.md.
 * Upstream snapshot: a859101d633a01c4a1a920d6a8ce41dabba0705f (2026-08-30).
 */

export const FREE_EXERCISE_DB_SOURCE = "yuhonas/free-exercise-db";
export const FREE_EXERCISE_DB_LICENSE = "Unlicense";
export const FREE_EXERCISE_DB_COMMIT = "a859101d633a01c4a1a920d6a8ce41dabba0705f";
export const FREE_EXERCISE_DB_ID_PREFIX = "fedb-";
/** Round-robin cap. The upstream file is larger; this is the curated subset. */
export const FREE_EXERCISE_DB_CAP = 120;

export const FREE_EXERCISE_DB_ATTRIBUTION =
  "Curated subset of yuhonas/free-exercise-db (Unlicense, public domain). Names, muscles, equipment, and one cue. Images not included.";

/** Equipment strings the Library chips already match via substring. */
export const FREE_EXERCISE_DB_EQUIPMENT_ORDER = [
  "Bodyweight",
  "Dumbbells",
  "Barbell",
  "Cable",
  "Band",
  "Kettlebell",
  "Machine",
] as const;

const EQUIPMENT: Record<string, string> = {
  "body only": "Bodyweight",
  dumbbell: "Dumbbells",
  barbell: "Barbell",
  cable: "Cable",
  bands: "Band",
  kettlebells: "Kettlebell",
  machine: "Machine",
};

const MUSCLE: Record<string, MuscleGroup> = {
  abdominals: "Core",
  abductors: "Legs",
  adductors: "Legs",
  biceps: "Arms",
  calves: "Legs",
  chest: "Chest",
  forearms: "Arms",
  glutes: "Legs",
  hamstrings: "Legs",
  lats: "Back",
  "lower back": "Back",
  "middle back": "Back",
  neck: "Back",
  quadriceps: "Legs",
  shoulders: "Shoulders",
  traps: "Back",
  triceps: "Arms",
};

export type FreeExerciseDbRow = {
  id?: string | null;
  name?: string | null;
  level?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[] | null;
  secondaryMuscles?: string[] | null;
  instructions?: string[] | null;
  category?: string | null;
  images?: string[] | null;
};

export function normalizeExerciseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function freeExerciseDbId(sourceId: string): string {
  const slug = sourceId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${FREE_EXERCISE_DB_ID_PREFIX}${slug}`;
}

function mapMuscles(names: string[] | null | undefined): MuscleGroup[] {
  const out: MuscleGroup[] = [];
  for (const raw of names ?? []) {
    const group = MUSCLE[raw.trim().toLowerCase()];
    if (group && !out.includes(group)) out.push(group);
  }
  return out;
}

function mapLevel(level: string | null | undefined): ExerciseLevel | undefined {
  const value = (level ?? "").trim().toLowerCase();
  if (value === "beginner" || value === "intermediate") return value;
  if (value === "expert") return "advanced";
  return undefined;
}

function cueFromInstructions(instructions: string[] | null | undefined): string | undefined {
  const raw = (instructions ?? [])
    .map((line) => line.replace(/\s+/g, " ").trim())
    .find((line) => line.length > 0);
  if (!raw) return undefined;
  const sentence = raw.split(/(?<=[.!?])\s+/)[0] ?? raw;
  const cue = (sentence.length <= 240 ? sentence : sentence.slice(0, 240)).trim();
  return cue || undefined;
}

/** One source row → an Exercise, or null when it is outside the curated rules. */
export function mapFreeExerciseDbRow(row: FreeExerciseDbRow): Exercise | null {
  if (!row || typeof row.id !== "string" || typeof row.name !== "string") return null;
  if ((row.category ?? "").trim().toLowerCase() !== "strength") return null;
  const equipment = EQUIPMENT[(row.equipment ?? "").trim().toLowerCase()];
  if (!equipment) return null;
  const primary = mapMuscles(row.primaryMuscles);
  if (primary.length === 0) return null;
  const name = row.name.replace(/\s+/g, " ").trim();
  if (!name) return null;
  const secondary = mapMuscles(row.secondaryMuscles).filter((group) => !primary.includes(group));
  const muscleGroups = [...primary, ...secondary].slice(0, 3);
  const level = mapLevel(row.level);
  const cues = cueFromInstructions(row.instructions);
  const id = freeExerciseDbId(row.id);
  if (id === FREE_EXERCISE_DB_ID_PREFIX) return null;
  return {
    id,
    name,
    muscleGroups,
    equipment,
    tags: ["strength"],
    ...(level ? { level } : {}),
    ...(cues ? { cues } : {}),
  };
}

/**
 * House names win. Remaining rows are round-robin across equipment so one
 * bucket cannot fill the cap. Order inside a bucket follows source id.
 */
export function curateFreeExerciseDb(
  rows: readonly FreeExerciseDbRow[],
  occupiedNames: Iterable<string>,
  cap = FREE_EXERCISE_DB_CAP,
): Exercise[] {
  if (cap < 1) return [];
  const occupied = new Set<string>();
  for (const name of occupiedNames) {
    const key = normalizeExerciseName(name);
    if (key) occupied.add(key);
  }
  const buckets = new Map<string, Exercise[]>();
  const seenNames = new Set<string>();
  const seenIds = new Set<string>();
  const sorted = [...rows].sort((a, b) => String(a.id ?? "").localeCompare(String(b.id ?? "")));
  for (const row of sorted) {
    const mapped = mapFreeExerciseDbRow(row);
    if (!mapped) continue;
    const key = normalizeExerciseName(mapped.name);
    if (!key || occupied.has(key) || seenNames.has(key) || seenIds.has(mapped.id)) continue;
    seenNames.add(key);
    seenIds.add(mapped.id);
    const list = buckets.get(mapped.equipment ?? "") ?? [];
    list.push(mapped);
    buckets.set(mapped.equipment ?? "", list);
  }
  const out: Exercise[] = [];
  const index: Record<string, number> = {};
  for (const equipment of FREE_EXERCISE_DB_EQUIPMENT_ORDER) index[equipment] = 0;
  let added = true;
  while (out.length < cap && added) {
    added = false;
    for (const equipment of FREE_EXERCISE_DB_EQUIPMENT_ORDER) {
      if (out.length >= cap) break;
      const list = buckets.get(equipment) ?? [];
      const at = index[equipment] ?? 0;
      const next = list[at];
      if (!next) continue;
      index[equipment] = at + 1;
      out.push(next);
      added = true;
    }
  }
  return out;
}
