'use client';

import Link from 'next/link';
import { UnlockButton } from '@/components/UnlockButton';
import { PROGRAM_PRICES } from '@/lib/payments';
import { PROGRAM_TEMPLATES } from '@/data/programTemplates';
import { useWorkoutStore } from '@/store/workoutStore';

export default function LearnPillar() {
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  // Free intros: show a couple sample programs with limited details (e.g. first session summary)
  const freeSamples = PROGRAM_TEMPLATES.slice(0, 3);

  const launchFreeStarter = (name: string, exercises: any[]) => {
    startWorkout(name, exercises);
    window.location.href = '/active';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Learn & Master</h1>
      <p className="text-white/70 mb-6">Free intros and basics (assessments, principles from elite training materials). Premium: Full specialist programs (practical PT+Nutrition, Bodybuilding, Corrective, Strength Business, Coaching, Conditioning) — the education pillar for the "right way." Repurposed high-value content as one accessible route in the super app.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-[#111827] border border-white/10 p-6 rounded">
          <h2 className="font-semibold mb-3">Free Core (Always Accessible)</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>• Basic principles and assessments (ParQ, stages, OARS-inspired)</li>
            <li>• Intro to evidence-based habits (no fads)</li>
            <li>• Links to free tracker and library</li>
            <li>• The entrance to the path — free for the mission</li>
          </ul>
          <div className="mt-4">
            <div className="text-xs font-medium mb-2">Sample free program intros (from library):</div>
            {freeSamples.map((prog) => (
              <div key={prog.id} className="text-xs mb-1 p-2 bg-white/5 rounded">
                <strong>{prog.name}</strong> ({prog.duration}) — {prog.focus}<br />
                <span className="text-white/60">{prog.description.substring(0, 80)}...</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-emerald-400">Core education available to all. See vision.md. Full templates in premium/bundle.</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => launchFreeStarter('Free Bodyweight Starter', [
                { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
                { exerciseId: 'squats', sets: [{ reps: 12, weight: 0 }] },
                { exerciseId: 'plank', sets: [{ reps: 30, weight: 0 }] },
                { exerciseId: 'lunges', sets: [{ reps: 8, weight: 0 }] },
              ])}
              className="text-xs px-3 py-1 border border-emerald-500/50 rounded hover:bg-emerald-500/10"
            >
              Start Bodyweight Sample →
            </button>
            <button
              onClick={() => launchFreeStarter('Daily Mobility Sample', [
                { exerciseId: 'cat-camel', sets: [{ reps: 8, weight: 0 }] },
                { exerciseId: 'bird-dog', sets: [{ reps: 6, weight: 0 }] },
                { exerciseId: 'glute-bridge', sets: [{ reps: 10, weight: 0 }] },
                { exerciseId: 'couch-stretch', sets: [{ reps: 45, weight: 0 }] },
              ])}
              className="text-xs px-3 py-1 border border-emerald-500/50 rounded hover:bg-emerald-500/10"
            >
              Start Mobility Sample →
            </button>
            <a href="/nutrition" className="text-xs px-3 py-1 border border-white/30 rounded hover:bg-white/10">Log a sample meal →</a>
          </div>
        </div>

        <div className="bg-[#111827] border border-white/10 p-6 rounded">
          <h2 className="font-semibold mb-3">Premium Specialist Programs</h2>
          <p className="text-sm text-white/80 mb-4">Full practical mastery content (original, globalized from deep certification materials). One-time or via bundle. "Not a certification — tools for the right path."</p>
          <ul className="text-xs text-white/70 mb-4 list-disc pl-4">
            {Object.entries(PROGRAM_PRICES).map(([id, info]) => (
              <li key={id}>{info.title} — ${info.price} (free intro, full in bundle)</li>
            ))}
          </ul>
          <UnlockButton 
            productId="learn-premium" 
            price="147" 
            title="Learn & Master Bundle (All Programs)" 
          />
          <p className="text-[10px] text-center mt-2 text-white/40">Or full access in the Super Bundle (holistic value)</p>
          <div className="mt-3 text-xs">
            <Link href="/programs" className="underline text-emerald-400">View individual program intros (free)</Link>
          </div>

          {/* Free sample depth for public/early access */}
          <div className="mt-4 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Bodyweight Strength Basics (from specialist materials)</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Push-ups: 3x8-12, full range, control eccentric.</li>
              <li>Squats: 3x10, brace core, depth to comfort.</li>
              <li>Plank: 3x20-45s, body straight.</li>
              <li>Progress: Add reps or slow tempo before adding weight.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Full programs + periodization + cues in premium/bundle.</div>
          </div>

          {/* Additional free sample per vision: mobility + habits entry point (free core education) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Daily Mobility &amp; Habit Foundations</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Start with 5-8 min mobility circuit (cat-camel, bird-dog, glute-bridge, couch stretch, bear crawl).</li>
              <li>Pair with 3 gratitudes + 1 intention (mind synergy).</li>
              <li>Post-session: log a simple recovery snack (e.g. yogurt + berries) in Fuel for habit stacking.</li>
              <li>Progress: Consistency over intensity. Track in Today hub streaks.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Full specialist education (corrective, coaching, bodybuilding) in premium/bundle. Free entry builds the path for all.</div>
          </div>

          {/* More free sample: nutrition + movement synergy (free core) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Fuel Your Moves (Nutrition Basics)</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Simple post-session: Greek yogurt + fruit + seeds (high protein, quick).</li>
              <li>Global staple: Beans + rice bowl with veg for complete protein.</li>
              <li>Habit tip: Log one meal daily in Nutrition to build awareness. Pair with mobility flow.</li>
              <li>Free core principle: Accessible ingredients, no fancy supplements needed for basics.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Premium unlocks advanced plans, periodization, and coaching integration. Start free, build the foundation.</div>
          </div>

          {/* Additional free sample: mind + movement for resilience (free core) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Mind in Motion (Habit Foundations)</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Start with 60s breath + set intention (mind prompt).</li>
              <li>Do 5-8 min mobility (cat-camel, bird-dog, couch stretch).</li>
              <li>End with gratitude: name 2 body parts that worked today.</li>
              <li>Log in Today hub for streak. Synergy: Mind makes Move sustainable.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Full programs in premium. Free samples show the path: habits + synergy for lifelong health.</div>
          </div>

          {/* More free sample: learn + move synergy */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Movement as Teacher (Learn Basics)</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Bodyweight basics: push, pull, squat, hinge, carry patterns.</li>
              <li>Mobility as education: learn your body through daily flows.</li>
              <li>Habit: 10 min movement + 5 min reflection in journal or app.</li>
              <li>Free core: Start here, build consistency before advanced programs.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Premium: full specialist programs with video, periodization, coaching. Free is the entry to the path.</div>
          </div>

          {/* New free sample: Assessments → Safe Start (free core) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Assessments → Safe Start</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Take the free Readiness Assessment (ParQ-style + stages of change).</li>
              <li>Result guides launch of matching free starter (mobility for caution flags, full-body for green light).</li>
              <li>Log the assessment as a "win" entry in Nutrition. Builds safe, consistent entry to the path.</li>
              <li>Free core: education and screening always accessible, never gated.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Premium adds saved history, advanced forms, and coaching scripts. Start free today.</div>
          </div>

          {/* New free sample: Full Pillar Stack Day (free core) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: One Full Pillar Stack Day</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Move: Do an 8-min flow from /move (e.g. cat-camel + couch stretch + bear crawl).</li>
              <li>Fuel: Log one accessible high-protein recipe (lentil stew, egg rice, or yogurt bowl) in Nutrition.</li>
              <li>Mind: 60s breath + 2 gratitudes + 1 intention post-session.</li>
              <li>Complete in Today hub for streak + Win Score. This is the free daily synergy engine.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Premium deepens each pillar and the bundle (1+1+1 is greater than the sum). Free core is the repeatable foundation for everyone.</div>
          </div>

          {/* New free sample: No-Equip Strength + Recovery (free core) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: No-Equip Strength + Recovery</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Full body bodyweight circuit (push, squat, pull, core).</li>
              <li>Finish with mobility (couch stretch, wall angels).</li>
              <li>Log a simple protein meal in Nutrition after.</li>
              <li>Free core: works anywhere, builds consistency and resilience.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Premium: guided progressions and periodization. Free gets you strong daily.</div>
          </div>

          {/* New free sample: Mindful Daily Stack (free core) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Mindful Daily Stack</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>8 min mindful movement flow (cat camel, bird dog, glute bridge, stretches).</li>
              <li>Built-in breath + gratitude cues from Mind pillar.</li>
              <li>Log the session as a win in Today or Nutrition.</li>
              <li>Free core: daily habit that compounds across pillars.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Premium: deeper guided sessions and tracking. Free builds the foundation.</div>
          </div>

          {/* New free sample: Daily No-Equip Strength (free core) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Daily No-Equip Strength</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>Bodyweight circuit: push-ups, squats, inverted rows, lunges, planks.</li>
              <li>Finish with mobility (couch stretch, wall angels).</li>
              <li>Log a protein win in Nutrition after.</li>
              <li>Free core: accessible anywhere, builds real strength and habit.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Premium: progressions and periodization. Free is the daily driver.</div>
          </div>

          {/* New free sample: Mindful Pillar Stack (free core) */}
          <div className="mt-3 p-3 bg-black/30 rounded text-xs">
            <div className="font-medium mb-1">Free Sample: Mindful Pillar Stack</div>
            <ul className="list-disc pl-4 text-white/70">
              <li>8-10 min: mobility flow + strength moves + built-in mind cues.</li>
              <li>End with Nutrition log of a simple high-protein snack.</li>
              <li>Log the full stack as a win for streak and synergy.</li>
              <li>Free core: one action that hits multiple pillars daily.</li>
            </ul>
            <div className="mt-1 text-emerald-300">Premium: advanced tracking and personalization. Free is the foundation.</div>
          </div>

          {/* Actionable free core: launch real starters from Learn */}
          <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded text-xs">
            <div className="font-medium mb-2">Launch a free core starter right now (populates benchmarks + streak + logs):</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => {
                const start = useWorkoutStore.getState().startWorkout;
                start("Daily Mobility Circuit (Free)", [
                  { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
                  { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
                ]);
                window.location.href = "/active";
              }} className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Start Daily Mobility Flow →</button>
              <button onClick={() => {
                const start = useWorkoutStore.getState().startWorkout;
                start("Full Body Habit Builder", [
                  { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
                  { exerciseId: "glute-bridge", sets: [{ reps: 12, weight: 0 }] },
                  { exerciseId: "plank", sets: [{ reps: 25, weight: 0 }] },
                  { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
                ]);
                window.location.href = "/active";
              }} className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Start Full Body Habit →</button>
              <a href="/log" className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">See all free starters in Today →</a>
              <a href="/nutrition" className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Log fuel after →</a>
              <button onClick={() => {
                const start = useWorkoutStore.getState().startWorkout;
                start("Mindful Movement Daily (Free)", [
                  { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
                  { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "wall-angels", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
                ]);
                window.location.href = "/active";
              }} className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Start Mindful Movement →</button>
              <button onClick={() => {
                const start = useWorkoutStore.getState().startWorkout;
                start("Pillar Sync Daily (Free)", [
                  { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
                  { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
                ]);
                window.location.href = "/active";
              }} className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Start Pillar Sync →</button>
              <button onClick={() => {
                const start = useWorkoutStore.getState().startWorkout;
                start("Assessment Recovery Flow (Free)", [
                  { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "wall-sit", sets: [{ reps: 20, weight: 0 }] },
                  { exerciseId: "superman", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "couch-stretch", sets: [{ reps: 60, weight: 0 }] },
                ]);
                window.location.href = "/active";
              }} className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Start Assessment Recovery →</button>
              <button onClick={() => {
                const start = useWorkoutStore.getState().startWorkout;
                start("Pillar Sync Daily (Free)", [
                  { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
                  { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
                ]);
                window.location.href = "/active";
              }} className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Start Pillar Sync →</button>
              <button onClick={() => {
                const start = useWorkoutStore.getState().startWorkout;
                start("Daily Mobility + Mind Stack (Free)", [
                  { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
                  { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
                  { exerciseId: "superman", sets: [{ reps: 8, weight: 0 }] },
                ]);
                window.location.href = "/active";
              }} className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Start Mobility + Mind Stack →</button>
              <button onClick={() => {
                const start = useWorkoutStore.getState().startWorkout;
                start("No-Equip Pillar Stack (Free)", [
                  { exerciseId: "push-ups", sets: [{ reps: 8, weight: 0 }] },
                  { exerciseId: "squats", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "inverted-row", sets: [{ reps: 6, weight: 0 }] },
                  { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
                ]);
                window.location.href = "/active";
              }} className="px-2 py-1 border border-white/30 rounded hover:bg-white/10">Start No-Equip Pillar Stack →</button>
            </div>
            <div className="text-[10px] mt-1 text-emerald-400">These are the same free core programs used in Home / Builder. Complete them to grow your benchmarks and streak.</div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-white/50">
        See <a href="/vision" className="underline">vision.md</a>. Education as one pillar in the everything app — free entry, premium depth, bundle synergy.
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
        <div className="text-[10px] text-white/40 mt-1">Join the private build. Full Learn + cloud + premium after sign-in. Public sees teaser only.</div>
      </div>
    </div>
  );
}
