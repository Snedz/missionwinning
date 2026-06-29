'use client';

import { useTranslation } from 'react-i18next';
import { UnlockButton } from '@/components/UnlockButton';

export default function MindPillar() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Mind & Recovery</h1>
      <p className="text-white/70 mb-6">Free entry to basic mindfulness habits and recovery prompts. Premium unlocks full Calm/Waking Up-style guided meditations, sleep tools, stress relief, and expert lessons on the "why" — the mind pillar that makes every other route more effective.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-[#111827] border border-white/10 p-6 rounded">
          <h2 className="font-semibold mb-3">Free Core (Always Accessible)</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>• Basic breathing and presence prompts</li>
            <li>• Recovery and sleep habit tips</li>
            <li>• Integration with training streaks</li>
            <li>• No paywall — part of the free mission for global mental + physical health</li>
          </ul>
          <div className="mt-4 text-xs">
            <div className="font-medium mb-1">Free core daily mind &amp; recovery prompts (use anytime — no paywall):</div>
            {[
              "5-min box breathing before training (4s in, 4s hold, 4s out, 4s hold)",
              "Evening wind-down: 3 gratitudes + quick body scan head to toe",
              "Post-workout reflection: What felt strong today? One thing to improve tomorrow.",
              "Morning: 60s of slow breathing + set one word intention for the day",
              "Midday reset: 10 slow breaths, notice tension, release shoulders/jaw",
              "Pre-sleep: Review one win from the day, release one worry with a long exhale",
              "Focus boost: 4-7-8 breath (inhale 4, hold 7, exhale 8) between sets",
              "Training anxiety: 4 slow breaths + name 3 things you can control right now",
              "Recovery check-in: Rate soreness 1-10, note what helped yesterday",
              "Habit stack: After brushing teeth, 30s of standing forward fold + 3 breaths",
              "Stress with life: 5 min walk outside + notice 5 colors, 4 sounds, 3 textures",
              "Pre-sleep body scan: Tense then release each muscle group head to toe (10 min)",
              "Gratitude with training: Name 2 body parts that carried you today + thank them",
              "Morning intention + movement: 1 min breath + 10 air squats or wall push-ups",
              "Between meetings or sessions: 3x 'I am here now' + drop shoulders on exhale",
              "Post-mobility wind-down: 2 min box breath + name 1 thing you're grateful for in your body",
              "Training focus cue: Before set, 1 deep breath + visualize perfect form (mind-muscle link)",
              "Daily reset: 3 gratitudes + 1 'I release' + 30s forward fold",
              "Pre-sleep gratitude scan: Name 3 body wins from today + 1 area for tomorrow's focus",
              "Mid-session reset: 3 breaths + affirm 'I am building the path' between sets",
              "Habit anchor: After coffee/tea, 1 min neck rolls + set daily intention",
              "Post-training reflection: 1 min breath + note one win in movement quality",
              "Morning mobility cue: 30s cat-camel + set one word for how you want to feel today",
              "Evening body scan: 2 min from head to toe, release tension from the day",
              "Pre-training visualization: 60s breath + picture completing the session strong",
              "Midday micro-habit: 3 deep breaths + 5 squats or stretches at desk",
              "Gratitude for movement: List 3 ways your body served you today",
              "Focus reset: 4-7-8 breath when distracted, then one small action",
              "Post-mobility reflection: 1 min breath + note how body feels after flow",
              "Habit stack with nutrition: After mind prompt, log one protein serving",
              "Training gratitude: Name 3 things your body did well today",
              "Evening reset: 2 min breath + visualize tomorrow's win",
              "Focus cue: Before any task, 3 breaths + one intention",
              "Pre-sleep body gratitude: Thank 2 body parts that carried you through the day",
              "Midday micro-reset: 1 min breath + 5 squats or stretches to reconnect",
              "Post-training gratitude: Name 3 movement wins from the session",
              "Morning intention: 30s breath + visualize completing one small win today",
              "Evening wind-down: 2 min scan + release one worry with exhale",
              "Pre-sleep body gratitude: Thank 2 body parts that carried you through the day",
              "Desk micro-reset: 3 breaths + name 1 body win + 10 wall push or squats",
              "Gratitude stack: Name 3 body parts + 1 person who supported your path today",
              "Pre-sleep release: 4 long exhales + 'I did enough today' + one tomorrow intention",
              "Movement mindfulness: During any flow, notice 3 sensations without judgment",
              "Habit anchor + log: After mind prompt, open Nutrition and log one entry",
              "Gratitude for body parts that carried the session + 1 intention for tomorrow",
              "Pre-sleep release: long exhales + 'I released what I cannot control today'",
              "Micro reset between tasks: 3 breaths + name 1 win from the last hour",
              "Body gratitude scan: thank 3 parts of your body that carried you through the day",
              "Intention stack: after any movement, set one word for how you want to feel tomorrow",
              "Evening release: 4 exhales + 'I let go of what no longer serves the path'",
              "Gratitude for movement: name 3 ways your body served you today + 1 stretch",
              "Focus cue: 3 deep breaths + visualize one small win for the next hour",
              "Habit anchor: after coffee, 60s breath + set daily movement intention",
              "Gratitude for breath: 5 slow breaths + name 2 body wins from the day",
              "Pre-sleep body scan: release tension from head to toe, 2 min",
              "Morning intention: 30s breath + one word for how you want to move today",
              "Gratitude for body: thank 3 parts that carried you + 1 stretch for them",
              "Micro habit: 3 breaths + 5 squats or wall push at desk between tasks",
              "Evening wind down: 2 min scan + release one worry with long exhale",
              "Body scan with movement gratitude: name 3 parts + thank them with a stretch",
              "Focus reset: 4-7-8 breath when distracted, then one small action",
              "Habit stack with nutrition: after mind prompt, log one protein serving",
              "Gratitude for the path: name 3 wins from the week + one intention for next",
              "Body tension release: tense and release muscle groups head to toe, 3 min",
              "Mindful eating cue: before a meal, 3 breaths + notice hunger and gratitude",
              "Daily resilience: 2 min breath + reframe one challenge as growth",
              "Pre-training visualization: 60s breath + picture completing moves strong",
              "Gratitude for the breath: 5 slow breaths + name 2 body wins from today",
              "Micro reset: 3 breaths + name one thing you're building toward",
              "Evening gratitude scan: name 3 body parts that carried you + thank them",
              "Morning body scan: 2 min from head to toe, set one intention for movement",
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
                        await saveNutritionEntry({ date: today, name: `Mind Win: ${p.slice(0,40)}`, protein: 0, cals: 0 });
                      }
                    } catch {}
                    alert(`Logged for today: ${p.slice(0,60)}... (streak +1, saved to cloud if signed in). Try a mobility flow or log protein.`);
                    if (p.toLowerCase().includes('nutrition') || p.toLowerCase().includes('log')) window.location.href = '/nutrition';
                  }}
                  className="text-[10px] px-1.5 py-0.5 border border-white/30 rounded hover:bg-white/10 ml-auto shrink-0"
                >
                  Do it
                </button>
              </div>
            ))}
            <div className="text-emerald-400 mt-1">Premium unlocks guided audio sessions + full library (Calm/Waking Up style) + sleep tools.</div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <a href="/move" className="text-[10px] px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Do a 5-min Move flow →</a>
              <a href="/nutrition" className="text-[10px] px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Log a protein win →</a>
              <a href="/active" className="text-[10px] px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Start a free starter →</a>
            </div>
          </div>

          {/* Sign in for cloud + full private build access */}
          <div className="mt-4 p-3 bg-[#0a0f1a] border border-emerald-500/30 rounded text-xs">
            <div className="text-emerald-400 font-medium mb-1">Sign in for cloud sync + early private access (free magic link)</div>
            <form onSubmit={async (e) => { e.preventDefault(); const email = (e.target as any).email.value; if (!email) return; const { signInMagic } = await import('@/lib/supabase'); await signInMagic(email); alert(`Magic link sent to ${email}. Check email to load full build.`); }} className="flex gap-2">
              <input name="email" type="email" placeholder="you@email.com" className="flex-1 bg-black/40 border border-white/20 rounded px-2 py-1 text-xs" required />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs">Send Magic Link</button>
            </form>
          </div>
          <p className="mt-4 text-xs text-emerald-400">The right path includes the mind. Free for everyone.</p>
        </div>

        <div className="bg-[#111827] border border-white/10 p-6 rounded">
          <h2 className="font-semibold mb-3">Premium (Mindfulness Ecosystem)</h2>
          <p className="text-sm text-white/80 mb-4">Guided sessions, daily practices, lessons on building resilience. Synergizes with all pillars for consistency and results (like Freeletics bundle partners).</p>
          <UnlockButton 
            productId="mind-premium" 
            price="7" 
            title="Mind & Recovery Premium" 
            isSubscription={true}
          />
          <p className="text-[10px] text-center mt-2 text-white/40">Best value in the Super Bundle — mind + body + fuel together</p>
        </div>
      </div>

      <div className="mt-8 text-xs text-white/50">
        See <a href="/vision" className="underline">vision.md</a>. This pillar turns training into sustainable transformation. Free core + premium depth.
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
        <div className="text-[10px] text-white/40 mt-1">Join the private build. Full Mind + cloud after sign-in. Public teaser only.</div>
      </div>
    </div>
  );
}
