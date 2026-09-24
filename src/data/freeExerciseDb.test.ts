import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { MuscleGroup } from "@/types";
import {
  FREE_EXERCISE_DB_ATTRIBUTION,
  FREE_EXERCISE_DB_CAP,
  FREE_EXERCISE_DB_EQUIPMENT_ORDER,
  FREE_EXERCISE_DB_ID_PREFIX,
  FREE_EXERCISE_DB_LICENSE,
  FREE_EXERCISE_DB_SOURCE,
  curateFreeExerciseDb,
  freeExerciseDbId,
  mapFreeExerciseDbRow,
  normalizeExerciseName,
  type FreeExerciseDbRow,
} from "./freeExerciseDb";

const MUSCLES = new Set<MuscleGroup>([
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Full Body",
  "Cardio",
]);

function row(partial: FreeExerciseDbRow): FreeExerciseDbRow {
  return {
    id: "Barbell_Deadlift",
    name: "Barbell Deadlift",
    level: "intermediate",
    equipment: "barbell",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["lower back"],
    instructions: ["Hinge at the hips. Keep the bar close."],
    category: "strength",
    images: ["Barbell_Deadlift/0.jpg"],
    ...partial,
  };
}

describe("freeExerciseDb", () => {
  it("maps a strength row onto the house Exercise shape and drops images", () => {
    const mapped = mapFreeExerciseDbRow(
      row({
        id: "Alternate_Incline_Dumbbell_Curl",
        name: "Alternate Incline Dumbbell Curl",
        level: "beginner",
        equipment: "dumbbell",
        primaryMuscles: ["biceps"],
        secondaryMuscles: ["forearms"],
        instructions: ["Sit down on an incline bench.  Keep the elbows close."],
      }),
    );
    assert.ok(mapped);
    assert.equal(mapped.id, "fedb-alternate-incline-dumbbell-curl");
    assert.equal(mapped.equipment, "Dumbbells");
    assert.deepEqual(mapped.muscleGroups, ["Arms"]);
    assert.equal(mapped.level, "beginner");
    assert.deepEqual(mapped.tags, ["strength"]);
    assert.equal(mapped.cues, "Sit down on an incline bench.");
    assert.equal("images" in mapped, false);
    assert.equal(JSON.stringify(mapped).includes(".jpg"), false);
  });

  it("maps expert to advanced and keeps a second muscle group", () => {
    const mapped = mapFreeExerciseDbRow(
      row({
        level: "expert",
        primaryMuscles: ["chest"],
        secondaryMuscles: ["triceps", "shoulders"],
      }),
    );
    assert.ok(mapped);
    assert.equal(mapped.level, "advanced");
    assert.deepEqual(mapped.muscleGroups, ["Chest", "Arms", "Shoulders"]);
  });

  it("refuses stretching, unmapped equipment, null equipment, and empty primaries", () => {
    assert.equal(mapFreeExerciseDbRow(row({ category: "stretching" })), null);
    assert.equal(mapFreeExerciseDbRow(row({ category: "plyometrics" })), null);
    assert.equal(mapFreeExerciseDbRow(row({ equipment: "foam roll" })), null);
    assert.equal(mapFreeExerciseDbRow(row({ equipment: "e-z curl bar" })), null);
    assert.equal(mapFreeExerciseDbRow(row({ equipment: null })), null);
    assert.equal(mapFreeExerciseDbRow(row({ primaryMuscles: [] })), null);
    assert.equal(mapFreeExerciseDbRow(row({ primaryMuscles: ["not-a-muscle"] })), null);
  });

  it("drops a name the house catalog already owns and caps the round-robin", () => {
    const rows = [
      row({ id: "Push_Up", name: "Push-Ups", equipment: "body only", primaryMuscles: ["chest"] }),
      row({ id: "Band_Row", name: "Band Row", equipment: "bands", primaryMuscles: ["lats"] }),
      row({ id: "Db_Row", name: "One-Arm Dumbbell Row", equipment: "dumbbell", primaryMuscles: ["lats"] }),
      row({ id: "Bb_Row", name: "Bent Over Barbell Row", equipment: "barbell", primaryMuscles: ["middle back"] }),
      row({ id: "Bb_Row_2", name: "Bent Over Barbell Row", equipment: "barbell", primaryMuscles: ["lats"] }),
      row({ id: "Cable_Row", name: "Seated Cable Row Extra", equipment: "cable", primaryMuscles: ["lats"] }),
    ];
    const curated = curateFreeExerciseDb(rows, ["Push-ups"], 3);
    assert.equal(curated.length, 3);
    assert.ok(curated.every((ex) => normalizeExerciseName(ex.name) !== "pushups"));
    assert.deepEqual(
      curated.map((ex) => ex.equipment),
      ["Dumbbells", "Barbell", "Cable"],
    );
    const names = new Set(curated.map((ex) => normalizeExerciseName(ex.name)));
    assert.equal(names.size, curated.length);
  });

  it("round-robin prefers a spread and stops at the cap", () => {
    const rows: FreeExerciseDbRow[] = [];
    for (let i = 0; i < 5; i++) {
      rows.push(
        row({
          id: `Bb_${i}`,
          name: `Barbell Move ${i}`,
          equipment: "barbell",
          primaryMuscles: ["quadriceps"],
        }),
      );
      rows.push(
        row({
          id: `Bw_${i}`,
          name: `Body Move ${i}`,
          equipment: "body only",
          primaryMuscles: ["quadriceps"],
        }),
      );
    }
    const curated = curateFreeExerciseDb(rows, [], 3);
    assert.equal(curated.length, 3);
    assert.deepEqual(
      curated.map((ex) => ex.equipment),
      ["Bodyweight", "Barbell", "Bodyweight"],
    );
  });

  it("slugs the source id and refuses an empty slug", () => {
    assert.equal(freeExerciseDbId("Air_Bike"), "fedb-air-bike");
    assert.equal(mapFreeExerciseDbRow(row({ id: "___" })), null);
  });
});

describe("freeExerciseDb curated file", () => {
  const root = path.join(import.meta.dirname, "..", "..");
  const jsonPath = path.join(root, "src/data/freeExerciseDb.curated.json");
  const noticePath = path.join(root, "src/data/free-exercise-db/NOTICE.md");

  it("ships a capped subset with no image payload", () => {
    const text = readFileSync(jsonPath, "utf8");
    assert.equal(text.includes("images"), false);
    assert.equal(text.includes(".jpg"), false);
    assert.equal(text.includes(".gif"), false);
    const parsed = JSON.parse(text) as {
      id: string;
      name: string;
      muscleGroups: string[];
      equipment: string;
    }[];
    assert.ok(parsed.length > 0);
    assert.ok(parsed.length <= FREE_EXERCISE_DB_CAP);
    const ids = new Set<string>();
    const names = new Set<string>();
    for (const ex of parsed) {
      assert.ok(ex.id.startsWith(FREE_EXERCISE_DB_ID_PREFIX));
      assert.equal(ids.has(ex.id), false);
      ids.add(ex.id);
      const key = normalizeExerciseName(ex.name);
      assert.equal(names.has(key), false);
      names.add(key);
      assert.ok(FREE_EXERCISE_DB_EQUIPMENT_ORDER.includes(ex.equipment as (typeof FREE_EXERCISE_DB_EQUIPMENT_ORDER)[number]));
      assert.ok(ex.muscleGroups.length > 0);
      assert.ok(ex.muscleGroups.every((group) => MUSCLES.has(group as MuscleGroup)));
    }
  });

  it("records the Unlicense source and the image skip", () => {
    const notice = readFileSync(noticePath, "utf8");
    assert.match(notice, new RegExp(FREE_EXERCISE_DB_SOURCE));
    assert.match(notice, new RegExp(FREE_EXERCISE_DB_LICENSE));
    assert.match(notice, /Images/);
    assert.match(notice, /not shipped|No image/i);
    assert.match(FREE_EXERCISE_DB_ATTRIBUTION, /Unlicense/);
    assert.match(FREE_EXERCISE_DB_ATTRIBUTION, /Images not included/);
  });

  it("joins the catalog the Library loads without replacing a house id", async () => {
    const { EXERCISES, ensureFullExerciseCatalog, getExerciseById } = await import("@/data/exercises");
    await ensureFullExerciseCatalog();
    const absorbed = EXERCISES.filter((ex) => ex.id.startsWith(FREE_EXERCISE_DB_ID_PREFIX));
    assert.ok(absorbed.length > 0);
    assert.ok(absorbed.length <= FREE_EXERCISE_DB_CAP);
    assert.equal(getExerciseById("push-ups")?.name, "Push-ups");
    assert.equal(getExerciseById("fedb-alternate-hammer-curl")?.name, "Alternate Hammer Curl");
    const houseNames = new Set(
      EXERCISES.filter((ex) => !ex.id.startsWith(FREE_EXERCISE_DB_ID_PREFIX)).map((ex) =>
        normalizeExerciseName(ex.name),
      ),
    );
    for (const ex of absorbed) {
      assert.equal(houseNames.has(normalizeExerciseName(ex.name)), false, ex.name);
    }
  });
});
