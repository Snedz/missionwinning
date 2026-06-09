'use client';

import { useTranslation } from 'react-i18next';
import { UnlockButton } from '@/components/UnlockButton';
import { EXERCISES } from '@/data/exercises';

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
            <div className="font-medium mb-1">Sample free mobility exercises (from library):</div>
            {EXERCISES.filter(e => e.equipment === 'Bodyweight' && (e.name.toLowerCase().includes('hip') || e.name.toLowerCase().includes('mobility') || e.name.toLowerCase().includes('stretch') || e.name.toLowerCase().includes('thoracic') || e.name.toLowerCase().includes('ankle'))).slice(0,5).map(e => (
              <div key={e.id}>• {e.name} {e.cues ? `— ${e.cues.substring(0,60)}...` : ''}</div>
            ))}
            <div className="text-emerald-400 mt-1">+ many more in the free Library (filter by bodyweight/mobility).</div>
          </div>
          <p className="mt-4 text-xs text-emerald-400">This is part of the free mission — available to everyone worldwide.</p>
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
    </div>
  );
}
