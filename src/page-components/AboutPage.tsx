'use client';

import Link from 'next/link';
import { CouncilLeadershipBlock } from '@/components/america/CouncilLeadershipBlock';
import { isAmericaTrackEnabled } from '@/lib/americaConfig';

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto prose prose-invert">
      <h1>About Mission Winning</h1>
      <p>
        Mission Winning is the all-in-one global health and workout app. Free powerful tracker +
        premium specialist education programs and coaching drawn from elite practical training
        curricula.
      </p>

      <h2>Our Global Mission</h2>
      <p>
        Accessible, science-based training and nutrition tools for everyone, everywhere — from city
        gyms to rural areas with minimal equipment. Train smart. Win daily. No borders.
      </p>

      {isAmericaTrackEnabled() && (
        <>
          <h2>National fitness (U.S.)</h2>
          <CouncilLeadershipBlock />
          <p>
            <Link href="/america" className="text-blue-400 hover:underline no-underline">
              Presidential Fitness Test &amp; youth movement →
            </Link>
          </p>
        </>
      )}

      <h2>Business Structure</h2>
      <p>
        Operated by Mission Winning LLC (for-profit) for the app, programs, and coaching. A separate
        nonprofit foundation is planned to support free access, scholarships for coaches in
        underserved regions, and mission-driven initiatives.
      </p>

      <h2>Important Disclaimers</h2>
      <p>
        <strong>Educational only.</strong> Mission Winning provides practical training education and
        tools. We are not a federally recognized or accredited certifying agency. Completion grants
        a Mission Winning Certificate of Educational Achievement only.
      </p>
      <p>
        <strong>Not a government site.</strong> Mission Winning is not operated by the U.S.
        government. Presidential Fitness Test scoring is an educational revival inspired by classic
        youth fitness programs — not an official federal test unless explicitly partnered and
        labeled as such.
      </p>
      <p>
        Always consult qualified medical professionals before starting new training or nutrition
        protocols. Results vary. This is not medical, legal, or licensing advice.
      </p>

      <h2>Legal</h2>
      <p>
        <Link href="/privacy" className="text-emerald-400 hover:underline no-underline">
          Privacy Policy
        </Link>
        {' · '}
        <Link href="/terms" className="text-emerald-400 hover:underline no-underline">
          Terms of Use
        </Link>
        {' · '}
        <Link href="/beta" className="text-emerald-400 hover:underline no-underline">
          Beta start guide
        </Link>
        {isAmericaTrackEnabled() && (
          <>
            {' · '}
            <Link href="/america" className="text-blue-400 hover:underline no-underline">
              National fitness
            </Link>
          </>
        )}
      </p>

      <h2>Contact</h2>
      <p>support@missionwinning.com • hello@missionwinning.com for coaching inquiries.</p>

      <p className="text-xs text-muted-foreground mt-8">
        © Mission Winning. Global by design. PWA — works offline anywhere.
      </p>
    </div>
  );
}
