'use client';

import Link from 'next/link';
import { UnlockButton } from '@/components/UnlockButton';
import { PROGRAM_PRICES } from '@/lib/payments';
import { PROGRAM_TEMPLATES } from '@/data/programTemplates';

export default function LearnPillar() {
  // Free intros: show a couple sample programs with limited details (e.g. first session summary)
  const freeSamples = PROGRAM_TEMPLATES.slice(0, 3);

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
        </div>
      </div>

      <div className="mt-8 text-xs text-white/50">
        See <a href="/vision" className="underline">vision.md</a>. Education as one pillar in the everything app — free entry, premium depth, bundle synergy.
      </div>
    </div>
  );
}
