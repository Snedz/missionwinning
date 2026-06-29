'use client';

import { useTranslation } from 'react-i18next';
import { UnlockButton } from '@/components/UnlockButton';
import { useWorkoutStore } from '@/store/workoutStore';

export default function MovePillar() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Move & Mobility</h1>
      <p className="text-white/70 mb-6">Free entry to mobility flows and basic yoga-inspired movement (bodyweight, accessible globally). Premium unlocks full Pliability-style routines + Skill Yoga for athletic performance and longevity.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-[#111827] border border-white/10 p-6 rounded">
          <h2 className="font-semibold mb-3">Free Core (Always Accessible)</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>• Basic mobility cues and flows (from corrective/ ISSA principles)</li>
            <li>• Bodyweight progressions for daily movement</li>
            <li>• Integration tips with training</li>
            <li>• No login or payment required for basics</li>
            <li>• Example free: Hip openers, thoracic rotations, ankle mobility — 5-10 min daily</li>
          </ul>
          <div className="mt-4 text-xs">
            <div className="font-medium mb-1">Free core daily mobility flows &amp; prompts (bodyweight, 5-12 min, use daily — no paywall):</div>
            {[
              "World's Greatest Stretch: 3/side — deep hip + thoracic rotation, exhale into stretch",
              "90/90 Hip Opener Flow: 60s/side — switch legs, rock gently, breathe into hips",
              "Cat-Camel + Thread the Needle: 8 reps each — spine mobility + shoulder stretch",
              "Ankle Rocks & Calf Stretch: 10/side — wall or floor, drive knee over toes",
              "Thoracic Rotations on all fours: 8/side — open chest, follow hand with eyes",
              "Pigeon Pose Hold + Rock: 45s/side — deep glute/hip, gentle rock for release",
              "Down Dog to Cobra Flow: 6 slow reps — full posterior + anterior chain opener",
              "Seated Forward Fold + Twist: 45s hold + 3 twists/side — hamstrings + spine",
              "Wall Angels: 8 reps — back flat on wall, arms slide up/down like snow angel",
              "Superman Hold + Y-T-I Raises: 20s hold + 5 each letter — back extensors + scapular",
              "Couch Stretch: 60s/side — quad/hip flexor opener against wall or couch",
              "Neck + Jaw Release Circles: 5 slow each way — counter desk tension, breathe",
              "Bear Crawl 20 steps forward/back: low hips, core braced — full body mobility primer",
              "Inchworm to Push-up Position: 6 reps — hamstring + wrist + core activation",
              "Hip 90/90 Switches: 8/side — deep external/internal rotation, breathe into stretch",
              "Thoracic Extension on Foam or Towel: 8 reps — open chest, counter desk posture",
              "Ankle Dorsiflexion Rocks: 10/side against wall — improve squat depth and walking",
              "Child's Pose to Cobra: 6 slow reps — gentle spine opener for recovery",
              "Wall Push + Chest Opener: 8 reps — counter shoulder tightness from daily life",
              "Pigeon to Down Dog Flow: 5/side — deep hip opener with full body stretch",
              "Calf Raise to Ankle Rock: 10 reps — lower leg mobility for better movement",
              "Hip Opener Series: 45s pigeon + 45s 90/90 + 45s frog pose",
              "Full Body Flow: Down dog - plank - cobra - child's - repeat 5x",
              "Ankle + Hip Series: 10 ankle rocks/side + 45s pigeon each",
              "Recovery Flow: Child's pose - cat camel - thread needle - 8 slow reps",
              "Lunge with Overhead Reach: 6/side — hip flexor + thoracic + stability",
              "Single Leg Balance Hold: 30s/side — ankle/knee/hip + focus (pair with breath)",
              "Push-up to Down Dog: 6-8 reps — shoulder + hamstring + core link",
              "Bear Crawl to Inchworm: 4 rounds — coordination + wrist/shoulder health",
              "Frog Pose Hold: 60s — deep hip for squat depth and recovery",
              "Shrimp Squat Regressions: 5-8/side assisted — single leg strength anywhere",
              "Desk Reset Micro: neck circles + wall angels + thread needle (3 min)",
              "Animal Flow Primer: bear + inchworm + pushup-down dog 4 rounds",
              "Neck + Jaw + Wall Angels: 60s desk reset for posture + focus (pair with breath)",
              "Lunge Reach Flow: 6/side hip + thoracic + stability, end with 3 gratitudes",
              "Single Leg + Superman: balance hold 30s/side + back extension for resilience",
              "Frog Pose + Thread Needle: deep hip + shoulder release, 45s each",
              "Lunge with Reach + Wall Angels: hip opener + scapular mobility flow",
              "Bear Crawl + Inchworm: 8 steps each for full body coordination + core",
              "Pigeon to Down Dog: 5/side deep hip + full chain opener, breathe",
              "Wall Sit + Superman Hold: 30s each for leg endurance + back strength",
              "Inchworm to Plank Hold: 6 reps + 20s hold for full body mobility + core",
              "Calf Raise to Ankle Rock: 10 reps lower leg + ankle mobility for better squats",
              "Child Pose to Cobra Flow: 6 slow reps gentle spine + hip flexor opener",
              "Pigeon to Down Dog Flow: 5/side deep hip + full chain opener, breathe",
              "Wall Sit to Superman: 30s each for leg endurance + back strength",
              "Inchworm to Plank: 6 reps for full body mobility + core activation",
              "Superman Hold with YTI: 20s hold + 5 reps each letter for back + scapular",
              "90/90 Hip Flow: 8 switches/side deep hip mobility + breath",
              "Single Leg Balance with Arm Reach: 30s/side stability + mind focus",
              "Bear Crawl + Inchworm Combo: 8 steps each for full body coordination",
              "Thoracic Rotation on All Fours: 8/side upper back mobility + breath",
              "Frog Pose Hold: 45-60s deep hip opener for squat depth and recovery",
              "Neck Circles and Jaw Release: 5 slow each way for desk tension relief",
              "Lunge with Overhead Reach: 6/side hip flexor + thoracic + stability",
              "Single Leg Glute Bridge: 8/side unilateral glute and core strength",
              "Bear Hug Hold (imaginary): 20-30s isometric for upper back, grip, posture",
              "Pike Push-up to Down Dog: 6 reps shoulder + hamstring + core link",
              "Seated Spinal Twist with Forward Fold: 45s each side hip and back release",
              "Thoracic Extension on Floor: 8 reps open chest for better breathing and posture",
              "Pigeon Pose to Down Dog: 5/side deep hip + full posterior chain opener",
              "Standing Quad Stretch with Balance: 30s/side single leg stability + quad open",
              "Bear Crawl to Inchworm: 4 rounds full body coordination and mobility",
              "Superman to Child's Pose Flow: 6 reps back strength + gentle recovery",
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <span>• {p}</span>
                <button
                  onClick={async () => {
                    // Functional win: bump streak + real cloud nutrition log entry if signed in
                    try {
                      const cur = parseInt(localStorage.getItem('mw_streak') || '0');
                      localStorage.setItem('mw_streak', String(cur + 1));
                    } catch {}
                    try {
                      const { getUser, saveNutritionEntry } = await import('@/lib/supabase');
                      const u = await getUser();
                      if (u) {
                        const today = new Date().toISOString().split('T')[0];
                        await saveNutritionEntry({ date: today, name: `Mobility Win: ${p.slice(0,40)}`, protein: 0, cals: 0 });
                      }
                    } catch {}
                    alert(`Mobility win logged: ${p.slice(0,50)}... (streak +1, saved to cloud if signed in). Check /nutrition or Today hub.`);
                    if (p.toLowerCase().includes('couch') || p.toLowerCase().includes('pigeon')) window.location.href = '/nutrition';
                  }}
                  className="text-[10px] px-1.5 py-0.5 border border-white/30 rounded hover:bg-white/10 ml-auto shrink-0"
                >
                  Do it
                </button>
              </div>
            ))}
            <div className="text-emerald-400 mt-1">+ many more in free Library. Premium for guided + sports-specific.</div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <a href="/nutrition" className="text-[10px] px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Log Recovery Fuel →</a>
              <a href="/active" className="text-[10px] px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Start Mobility Starter →</a>
              <a href="/library" className="text-[10px] px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Browse more cues in Library →</a>
            </div>
          </div>

          {/* Sign in for cloud + full private build access (consistent with other pillars) */}
          <div className="mt-4 p-3 bg-[#0a0f1a] border border-emerald-500/30 rounded text-xs">
            <div className="text-emerald-400 font-medium mb-1">Sign in for cloud sync + early private access (free magic link)</div>
            <form onSubmit={async (e) => { e.preventDefault(); const email = (e.target as any).email.value; if (!email) return; const { signInMagic } = await import('@/lib/supabase'); await signInMagic(email); alert(`Magic link sent to ${email}. Check email to load full build.`); }} className="flex gap-2">
              <input name="email" type="email" placeholder="you@email.com" className="flex-1 bg-black/40 border border-white/20 rounded px-2 py-1 text-xs" required />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs">Send Magic Link</button>
            </form>
          </div>

          {/* Quick-start free mobility circuits — fully functional, launch into Active Workout */}
          <div className="mt-3">
            <div className="text-[10px] font-medium mb-1">Quick free mobility circuits (tap to start 5-8 min flow):</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "Hip Opener Flow", exs: [{exerciseId:"glute-bridge", sets:[{reps:10,weight:0}]}, {exerciseId:"bird-dog", sets:[{reps:8,weight:0}]}, {exerciseId:"cat-camel", sets:[{reps:10,weight:0}]}] },
                { name: "Full Body Reset", exs: [{exerciseId:"push-ups", sets:[{reps:8,weight:0}]}, {exerciseId:"wall-sit", sets:[{reps:30,weight:0}]}, {exerciseId:"superman", sets:[{reps:8,weight:0}]}, {exerciseId:"plank", sets:[{reps:20,weight:0}]}] },
                { name: "Thoracic + Ankle", exs: [{exerciseId:"cat-camel", sets:[{reps:8,weight:0}]}, {exerciseId:"bird-dog", sets:[{reps:6,weight:0}]}, {exerciseId:"wall-sit", sets:[{reps:25,weight:0}]}] },
              ].map((flow, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const store = useWorkoutStore.getState();
                    store.startWorkout(flow.name, flow.exs);
                    window.location.href = "/active";
                  }}
                  className="text-[10px] px-2 py-1 border border-emerald-500/40 rounded hover:bg-emerald-500/10"
                >
                  {flow.name} →
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-emerald-400">This is part of the free mission — available to everyone worldwide.</p>

          {/* Quick cross-pillar action: log recovery fuel after mobility */}
          <div className="mt-2">
            <button className="text-xs px-2 py-1 border border-emerald-500/40 rounded hover:bg-emerald-500/10" onClick={() => {
              alert('Great mobility session! Head to Nutrition to log a recovery snack (e.g. yogurt bowl). Builds Fuel + Move synergy.');
              window.location.href = '/nutrition';
            }}>
              Log Recovery Fuel →
            </button>
          </div>
        </div>

        <div className="bg-[#111827] border border-white/10 p-6 rounded">
          <h2 className="font-semibold mb-3">Premium (Pliability + Skill Yoga)</h2>
          <p className="text-sm text-white/80 mb-4">Sports-specific mobility, daily maintenance, functional yoga with feedback. Synergizes with training for better results and recovery.</p>
          <UnlockButton 
            productId="move-premium" 
            price="9" 
            title="Move & Mobility Premium" 
          />
          <p className="text-[10px] text-center mt-2 text-white/40">Or include in Super Bundle (recommended for full path synergy)</p>
        </div>
      </div>

      <div className="mt-8 text-xs text-white/50">
        See <a href="/vision" className="underline">vision.md</a> — pillars complement each other. Free core + optional premium for the complete journey.
      </div>

      {/* Sign up / Sign in for early private access while building */}
      <div className="mt-6 p-4 bg-[#111827] border border-emerald-500/30 rounded">
        <div className="text-emerald-400 font-medium mb-2">Sign up / Sign in for early private access (free magic link)</div>
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
        <div className="text-[10px] text-white/40 mt-1">Join the private build. Full Move + cloud after sign-in. Public sees teaser only.</div>
      </div>
    </div>
  );
}
