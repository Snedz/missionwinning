'use client';

import { UnlockButton } from '@/components/UnlockButton';
import { SUPER_BUNDLE_PRICE, SUPER_BUNDLE_TITLE, BUNDLE_DISCOUNT_NOTE } from '@/lib/payments';

export default function SuperBundle() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Super Bundle — The Everything Path</h1>
      <p className="text-xl text-white/70 mb-6">One subscription. All premium pillars. Holistic synergy for the full journey (Train + Fuel + Move + Mind + Track + Learn). Inspired by models that deliver 6-7 complementary tools at the price of 1-2 with 50% off promos for maximum value and retention.</p>

      <div className="bg-[#111827] border border-emerald-400/30 p-8 rounded mb-8">
        <h2 className="text-2xl font-semibold mb-4">Why the Bundle?</h2>
        <ul className="space-y-3 text-white/80">
          <li>• <strong>Synergy</strong>: Pillars reinforce each other (mobility improves training results; mind improves consistency; nutrition fuels everything).</li>
          <li>• <strong>Value</strong>: Premium across the board for the price of one or two individual routes (50% off first 6-12 months like proven promos).</li>
          <li>• <strong>Impact</strong>: Deeper transformation while funding the free core for everyone else (the mission).</li>
          <li>• <strong>Accessible</strong>: Free core always there. Bundle for those ready to go all-in on the right path.</li>
        </ul>
        <div className="mt-6">
          <div className="text-xs text-emerald-400 mb-1">{BUNDLE_DISCOUNT_NOTE}</div>
          <UnlockButton 
            isSubscription={true}
            productId="super-bundle"
            price={SUPER_BUNDLE_PRICE}
            title={SUPER_BUNDLE_TITLE}
          />
        </div>
        <p className="text-center text-xs mt-3 text-white/40">Annual option for even better value. 30-day guarantee. See vision.md for the full model. Free core always available.</p>
      </div>

      <div className="text-sm text-white/60">
        Individual pillars available too (see sidebar). But the bundle is the "everything app" experience — the smart way to invest in the complete path.
        <br /><br />
        <strong>Included in Super Bundle:</strong> Premium Train (AI Coach), Fuel (deep nutrition), Move (Pliability + Skill Yoga), Mind (Calm/Waking Up style), Track (advanced), Learn (full specialist programs).
        <br /><br />
        Core tracking, library, basic nutrition, etc. remain <strong>free forever</strong> for the mission. This is how we make the world healthier for all.
      </div>
    </div>
  );
}
