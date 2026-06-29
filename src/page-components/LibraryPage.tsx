'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EXERCISES } from "@/data/exercises";
import { useWorkoutStore } from "@/store/workoutStore";

const CUES: Record<string, string> = {
  "bench-press": "Feet flat, scapulae retracted, bar touches mid-chest. Drive through heels of hands. No bounce. Free barbell staple.",
  "squats": "Brace core, knees track over toes, depth to parallel or below if mobility allows. Drive through midfoot. Free king of leg movements.",
  "deadlift": "Hips back first, bar close to shins, neutral spine. Lock hips and knees at top. Reset each rep. Free posterior chain foundation.",
  "pull-ups": "Full range, chin over bar at top. Controlled lower. Use bands or negatives for regression. Free vertical pull essential.",
  "thruster": "Front rack position, squat then drive and press in one fluid motion. Core braced throughout. Free full-body power move.",
  "push-ups": "Body straight, lower chest to floor, full lockout. Scale with knees or elevated for beginners. Free core essential.",
  "overhead-press": "Core tight, bar path straight up, lock elbows overhead. No lean back. Great free shoulder builder.",
  "barbell-row": "Hinge at hips, pull bar to lower chest, squeeze shoulder blades. Neutral spine always. Free back strength.",
  "plank": "Body in straight line, engage glutes and core, breathe steady. Hold 20-60s. Foundational free core stability.",
  "lunges": "Step forward, knee tracks over ankle, back knee nearly touches. Alternate or static. Free leg driver.",
  "burpees": "Squat, kick back to plank, pushup, jump. Modify by stepping back. Full body free cardio finisher.",
  // Core / Corrective (free forever per vision)
  "dead-bug": "Lower back glued to floor. Opposite arm/leg reach without arching. Slow and controlled. Free core anti-extension staple.",
  "bird-dog": "On all fours, extend opposite arm/leg, keep hips level. Hold and squeeze. Free stability and back health.",
  "glute-bridge": "Drive through heels, full hip extension at top, squeeze glutes 2s. Don't overarch low back. Free posterior power.",
  "cat-camel": "On all fours, alternate arch and round spine with breath. Great mobility for spine. Free warm-up.",
  "band-pull-apart": "Pull band apart at shoulder height, squeeze shoulder blades. Control return. Free rear delt and posture builder.",
  "face-pull-band": "Pull band to face, rotate externally at end. Great for rear delts and posture. Free shoulder health staple.",
  "superman": "Lie face down, lift arms/legs/chest off floor, squeeze lower back/glutes. Hold 10-30s. Free back extensor for posture.",
  "wall-sit": "Back flat on wall, knees 90deg, hold. Build quad endurance. Free isometric for beginners or rehab.",
  "side-plank": "Stack hips, lift top arm or leg for challenge. Hold 20-60s per side. Free oblique stability.",
  "single-leg-glute": "One leg up, drive hips, squeeze glute. Unilateral for imbalance correction. Free advanced glute work.",
  // Bodybuilding / Intensity techniques (Ch11 methods)
  "superset-bench-row": "Bench then immediate row, no rest. Opposing groups for pump and efficiency. Alternate heavy/light days per split system.",
  "drop-set-lateral-raise": "Heavy to failure, drop weight 20-30%, continue. Induces pump and sarcoplasmic growth. Use on isolation for lagging parts.",
  "giant-set-shoulders": "Lateral + front + rear raises back to back. All delt heads for 3D caps and symmetry. No rest between for intensity.",
  "rest-pause-squat": "Heavy single, 15-30s rest, repeat to 6-8. Builds mental toughness and strength. CNS heavy - use in periodized blocks.",
  "forced-rep-bench": "To failure + 2-3 assisted. Partner helps past sticking point. Intensity technique for advanced only.",
  "negative-pullup": "Controlled 5-8s eccentric lower. Great for building strength when positive is hard. Eccentric overload for hypertrophy.",
  "peak-contraction-curl": "Hold and squeeze 2s at top. Mind-muscle for peak. Weider principle for bicep shape.",
  // Free posterior / hip / pull staples
  "romanian-deadlift": "Hinge from hips, slight knee bend, bar close to legs. Feel hamstrings stretch, drive hips forward. Free posterior chain builder.",
  "face-pull": "Pull rope to face level, external rotation at end. Great for rear delts, posture, and shoulder health. Free corrective staple.",
  "kettlebell-swing": "Hinge, snap hips, arms loose. Explosive hip drive for conditioning and posterior chain. Free full-body finisher.",
  "hip-thrust": "Shoulders on bench or floor, drive hips up with bar or bodyweight. Squeeze glutes hard at top. Free glute builder for strength and aesthetics.",
  "lat-pulldown": "Pull bar to upper chest, lean slightly back, squeeze lats. Control the return. Free back width builder, scale with bands.",
  // Isolation / machine accessories (free options)
  "leg-extension": "Control the negative, squeeze at top. Good for quad isolation and knee health. Free machine option for beginners.",
  "seated-calf": "Full stretch at bottom, pause and squeeze at top. Targets soleus. Free calf builder for ankle stability.",
  "preacher-curl": "No momentum, full extension, squeeze at top. Strict form for bicep peak. Free isolation for arms.",
  "lateral-raise": "Lead with elbows, slight lean, stop at shoulder height. Unilateral for symmetry on lagging delt. Free shoulder cap builder.",
  "bicep-curl": "Control the eccentric, full stretch at bottom, no swing. Squeeze at top. Free arm isolation staple.",
  "tricep-pushdown": "Elbows pinned, full extension, squeeze triceps at bottom. Free cable isolation for arms.",
  // Expanded free core mobility cues (new + existing)
  "couch-stretch": "Knee on floor or couch, front foot forward, drive hips — deep quad/hip flexor. 45-90s/side. Free daily hip opener.",
  "inchworm": "Walk hands out to plank, walk feet to hands. 6-8 slow reps. Free hamstring + wrist + core mobility primer.",
  "bear-crawl": "Low hips, opposite hand/knee, crawl forward/back 10-20 steps. Free full-body coordination and shoulder stability.",
  "worlds-greatest-stretch": "Deep lunge with rotation and reach. Free full chain opener for hips, thoracic, shoulders.",
  "childs-pose-cobra": "Flow between gentle backbend and fold. Free spine mobility and recovery.",
  "seated-spinal-twist": "Cross leg twist for spine and hip mobility. Free daily reset from desk or training.",
  "standing-quad-stretch": "Pull heel to glute, balance on one leg. Free quad open + stability for legs.",
  "wall-chest-opener": "Hands on wall, lean forward. Free counter to forward posture, opens chest/shoulders.",
  "pigeon-to-down-dog": "From pigeon pose to down dog. Free hip opener with full body stretch.",
  "calf-raise-ankle-rock": "Raise heels then rock forward. Free lower leg mobility and ankle stability.",
  "seated-forward-fold-twist": "Fold then twist for hamstrings and spine. Free daily mobility staple.",
  "standing-balance-quad": "Quad stretch with balance challenge. Free stability and flexibility.",
  "hip-90-90-flow": "Switch between 90/90 positions with rock. Free deep hip mobility for daily or post training.",
  "superman-to-yti": "Hold superman then lift arms in Y T I shapes. Free back and scapular strength + mobility.",
  "wall-angels": "Back flat on wall, arms slide up/down like snow angel. 8-10 reps. Free scapular mobility + posture reset.",
  "thread-needle": "On all fours, thread one arm under, rotate and reach. 6-8/side. Free thoracic rotation and shoulder release.",
  "frog-pose": "Knees wide, hips low, ankles in. Breathe 45-90s. Free deep hip opener for squat depth and recovery.",
  "bear-hug-hold": "Squeeze imaginary tree or self hard 20-40s. Isometric for upper back, grip, posture. Free anywhere.",
  "shrimp-squat-reg": "Hold wall or chair, one leg back, squat on front. 5-8/side. Free single leg strength builder.",
  "neck-circles-release": "Slow circles 5 each way + open/close jaw gently. Counter phone/desk tension. Free daily 60s reset.",
  "ankle-dorsiflex-rock": "Knee over toes, rock forward 10-15/side against wall or floor. Free squat depth + walking health.",
  "thoracic-rot-quad": "Open chest, follow hand with eyes 8/side. Free upper back mobility for better presses and posture.",
  "down-dog-cobra-flow": "Flow 6 slow reps. Posterior chain + hip flexor + spine. Free full body primer or finisher.",
  "child-pose-thread": "Alternate fold and thread 5-6/side. Gentle recovery for spine and shoulders after any session.",
  "single-leg-stand-hold": "Stand on one leg 20-45s/side, eyes open then closed. Free ankle/knee/hip stability + focus.",
  "pushup-to-down-dog": "Pushup then pike hips up. 6-8 reps. Free shoulder + hamstring + core link.",
  "lunge-with-reach": "Front lunge + reach tall and slight backbend 6/side. Free hip + thoracic + stability.",
  "crawl-to-inchworm": "Crawl 8 steps then inchworm back. 4-5 rounds. Free coordination, shoulder, wrist, hamstring.",
  "inverted-row": "Pull chest to bar/table edge, body straight. Scale angle for difficulty. Free horizontal pull for back.",
  "pike-pushup": "Hips high, lower head toward hands. Builds shoulder strength. Free vertical press regression.",
  "mountain-climbers": "Fast knee drives in plank. Keep hips low. Free cardio + core burner.",
  "jump-squats": "Explode up from squat, soft land. Power and conditioning. Free plyo for legs.",
  "dips-chair": "Lower body with elbows back, push up. Tricep focus. Free upper body using everyday object.",
  "step-ups": "Step up driving through heel, knee tracks over ankle. Alternate. Free functional leg strength, scale height.",
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

      {/* Sign up / Sign in for full cues + cloud while building privately */}
      <div className="mt-6 p-4 bg-[#111827] border border-emerald-500/30 rounded">
        <div className="text-emerald-400 font-medium mb-2">Sign up / Sign in for early private access + full library cues (free magic link)</div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const email = (e.target as any).email.value;
          if (!email) return;
          try {
            const { signInMagic } = await import('@/lib/supabase');
            await signInMagic(email);
            alert(`Magic link sent to ${email}. Check email to access the full private build.`);
          } catch (err: any) {
            alert('Error: ' + (err.message || 'Check Supabase/Resend in Vercel.'));
          }
        }} className="flex gap-2">
          <input name="email" type="email" placeholder="you@email.com" className="flex-1 border border-white/20 bg-black/40 rounded px-3 py-2 text-sm" required />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium">Send Magic Link</button>
        </form>
        <div className="text-[10px] text-white/40 mt-1">Public teaser only. Sign in for full free core + cloud on the live domain.</div>
      </div>
    </div>
  );
}
