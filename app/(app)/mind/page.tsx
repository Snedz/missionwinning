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
            <div className="font-medium mb-1">Sample free daily mind prompts (free core):</div>
            <div>• 5-min box breathing before training</div>
            <div>• Evening wind-down: 3 gratitudes + body scan</div>
            <div>• Post-workout reflection: What felt strong today?</div>
            <div className="text-emerald-400 mt-1">Premium unlocks guided audio + full library (Calm/Waking Up style).</div>
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
    </div>
  );
}
