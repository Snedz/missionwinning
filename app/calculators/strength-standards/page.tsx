import type { Metadata } from 'next';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { StrengthStandardsCalculator } from '@/components/calculators/StrengthStandardsCalculator';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const metadata: Metadata = publicPageMetadata({
  title: 'Strength standards',
  description:
    'Free strength standards calculator — squat, bench, deadlift, and press graded against bodyweight from novice to elite. Honest ladders, no account.',
  path: '/calculators/strength-standards',
});

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Strength standards calculator',
  url: 'https://www.missionwinning.com/calculators/strength-standards',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Mission Winning' },
};

export default function StrengthStandardsRoute() {
  return (
    <PublicPageShell
      eyebrow="Calculators · free, no account"
      title="Strength standards"
      subtitle="Where a lift stands relative to bodyweight — from novice to elite. Enter a set you actually did; the estimate and the ladder come back honestly, no grading on vibes."
      maxWidth="4xl"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <StrengthStandardsCalculator />
      <section className="border-t-2 border-border pt-8">
        <p className="eyebrow-live mb-4">How to use it</p>
        <div className="max-w-[58ch] space-y-4 text-base leading-relaxed">
          <p>
            Standards answer one question well: is this lift unusually behind or ahead for my size?
            Train the lagging pattern, not the mirror. Retest with a heavy set every 4–6 weeks —
            benchmark days, not every session.
          </p>
          <p className="text-sm text-muted-foreground">
            Also here:{' '}
            <a href="/calculators/1rm" className="underline underline-offset-2 hover:text-primary">
              1RM
            </a>{' '}
            ·{' '}
            <a href="/calculators/tdee" className="underline underline-offset-2 hover:text-primary">
              TDEE &amp; macros
            </a>
          </p>
        </div>
      </section>
    </PublicPageShell>
  );
}
