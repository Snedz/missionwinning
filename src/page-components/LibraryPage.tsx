'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EXERCISES } from "@/data/exercises";
import { useWorkoutStore } from "@/store/workoutStore";

const CUES: Record<string, string> = {
  "bench-press": "Feet flat, scapulae retracted, bar touches mid-chest. Drive through heels of hands. No bounce.",
  "squats": "Brace core, knees track over toes, depth to parallel or below if mobility allows. Drive through midfoot.",
  "deadlift": "Hips back first, bar close to shins, neutral spine. Lock hips and knees at top. Reset each rep.",
  "pull-ups": "Full range, chin over bar at top. Controlled lower. Use bands or negatives for regression.",
  "dead-bug": "Lower back glued to floor. Opposite arm/leg reach without arching. Slow and controlled.",
  "thruster": "Front rack position, squat then drive and press in one fluid motion. Core braced throughout.",
  // From Ch11 bodybuilding methods
  "superset-bench-row": "Bench then immediate row, no rest. Opposing groups for pump and efficiency. Alternate heavy/light days per split system.",
  "drop-set-lateral-raise": "Heavy to failure, drop weight 20-30%, continue. Induces pump and sarcoplasmic growth. Use on isolation for lagging parts. Full spectrum fiber recruitment per Ch11.",
  "giant-set-shoulders": "Lateral + front + rear raises back to back. All delt heads for 3D caps and symmetry. No rest between for intensity.",
  "rest-pause-squat": "Heavy single, 15-30s rest, repeat to 6-8. Builds mental toughness and strength. CNS heavy - use in periodized blocks.",
  "forced-rep-bench": "To failure + 2-3 assisted. Partner helps past sticking point. Intensity technique for advanced only.",
  "negative-pullup": "Controlled 5-8s eccentric lower. Great for building strength when positive is hard. Eccentric overload for hypertrophy.",
  "peak-contraction-curl": "Hold and squeeze 2s at top. Mind-muscle for peak. Weider principle for bicep shape.",
};

export function LibraryPage() {
  // Per vision.md: Library is core free for everyone (bodyweight/global focus). Premium filters/content in Learn/Move pillars or bundle.
  // Free core always accessible — no paywall on basics.
  const [q, setQ] = useState("");
  const [equip, setEquip] = useState("");
  const [goal, setGoal] = useState(""); // M&S style: Build Muscle, Strength, etc.
  const [level, setLevel] = useState(""); // Beginner, Intermediate, Advanced
  const premium = typeof window !== "undefined" && localStorage.getItem("mw_premium") === "true";
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const filtered = EXERCISES.filter(e => {
    const matchQ = !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.muscleGroups.some(m => m.toLowerCase().includes(q.toLowerCase()));
    const matchE = !equip || (e.equipment || "").toLowerCase().includes(equip.toLowerCase());
    const matchGoal = !goal || e.muscleGroups.some(m => m.toLowerCase().includes(goal.toLowerCase())) || (e.cues && e.cues.toLowerCase().includes(goal.toLowerCase()));
    const matchLevel = !level || (e.cues && e.cues.toLowerCase().includes(level.toLowerCase()));
    return matchQ && matchE && matchGoal && matchLevel;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Exercise Library</h2>
        <p className="text-muted-foreground">Global, accessible movements. Bodyweight &amp; minimal equipment prioritized. Use from your <a href="/log" className="underline">Today Hub</a> for best flow. {premium ? "Full cues & details unlocked." : "Upgrade for full cues, progressions, and video guidance from the specialist programs."}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search name or muscle..." value={q} onChange={e=>setQ(e.target.value)} className="max-w-xs" />
        <select value={equip} onChange={e=>setEquip(e.target.value)} className="border rounded px-3 bg-background">
          <option value="">All Equipment</option>
          <option value="bodyweight">Bodyweight</option>
          <option value="dumbbell">Dumbbells</option>
          <option value="barbell">Barbell</option>
          <option value="cable">Cable / Machine</option>
          <option value="band">Band</option>
          <option value="kettlebell">Kettlebell</option>
        </select>
        <select value={goal} onChange={e=>setGoal(e.target.value)} className="border rounded px-3 bg-background">
          <option value="">All Goals (M&S style)</option>
          <option value="build muscle">Build Muscle / Hypertrophy</option>
          <option value="strength">Strength</option>
          <option value="symmetry">Symmetry / Weak Points</option>
          <option value="conditioning">Conditioning</option>
        </select>
        <select value={level} onChange={e=>setLevel(e.target.value)} className="border rounded px-3 bg-background">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced (drop sets, giant sets)</option>
        </select>
        <span className="text-xs self-center text-muted-foreground">~{EXERCISES.length} movements • M&S inspired filters + cues from bodybuilding programs</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ex => {
          const cue = CUES[ex.id];
          return (
            <Card key={ex.id} className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{ex.name}</CardTitle>
                <div className="text-xs text-muted-foreground">{ex.muscleGroups.join(" • ")} • {ex.equipment || "Various"}</div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {cue ? (
                  <div><span className="font-medium">Key cues:</span> {cue}</div>
                ) : (
                  <div className="text-muted-foreground">Detailed cues, regressions, and common faults available in premium (Corrective + Bodybuilding programs).</div>
                )}
                <button
                  onClick={() => {
                    startWorkout(ex.name, [{ exerciseId: ex.id, sets: [{ reps: 8, weight: 0 }] }]);
                    window.location.href = "/active";
                  }}
                  className="text-xs px-3 py-1.5 border border-primary/50 rounded hover:bg-primary/10 font-medium w-full text-center"
                >
                  Quick Add to Today’s Workout →
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!premium && <div className="text-center text-xs text-muted-foreground">Premium unlocks 100+ exercises with video guidance, full corrective analysis forms, and bodybuilding technique mastery from the courses.</div>}
    </div>
  );
}
