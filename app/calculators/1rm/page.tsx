import type { Metadata } from 'next';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { PublicOneRmCalculator } from '@/components/calculators/PublicOneRmCalculator';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const metadata: Metadata = publicPageMetadata({
  title: 'One-rep max calculator',
  description:
    'Free 1RM calculator — estimate your one-rep max from any hard set with Epley and Brzycki, plus working weights for 1–12 reps. No account, works offline.',
  path: '/calculators/1rm',
});

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'One-rep max calculator',
  url: 'https://www.missionwinning.com/calculators/1rm',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Mission Winning' },
};

export default function OneRmCalculatorRoute() {
  return (
    <PublicPageShell
      eyebrow="Calculators · free, no account"
      title="One-rep max calculator"
      subtitle="Enter a hard set you actually did — the estimated single and your working weights for 1–12 reps come back instantly. Epley headline, Brzycki as the honesty check."
      maxWidth="4xl"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicOneRmCalculator />
      <section className="border-t-2 border-border pt-8">
        <p className="eyebrow-live mb-4">How to use it</p>
        <div className="max-w-[58ch] space-y-4 text-base leading-relaxed">
          <p>
            A 1RM estimate turns any honest set into a planning number: pick working weights as
            percentages, compare sessions, and watch strength trend without maxing out. Retest with
            a heavy set every few weeks — the estimate is only as honest as the set behind it.
          </p>
          <p className="text-sm text-muted-foreground">
            Also here:{' '}
            <a href="/calculators/tdee" className="underline underline-offset-2 hover:text-primary">
              TDEE &amp; macros
            </a>{' '}
            ·{' '}
            <a
              href="/calculators/strength-standards"
              className="underline underline-offset-2 hover:text-primary"
            >
              Strength standards
            </a>
          </p>
        </div>
      </section>
    </PublicPageShell>
  );
}
