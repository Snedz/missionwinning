import type { Metadata } from 'next';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { PublicTdeeCalculator } from '@/components/calculators/PublicTdeeCalculator';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const metadata: Metadata = publicPageMetadata({
  title: 'TDEE & macro calculator',
  description:
    'Free TDEE calculator — daily calories from Mifflin-St Jeor plus honest macro targets (protein first, fat 25%, carbs the remainder). No account, works offline.',
  path: '/calculators/tdee',
});

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'TDEE & macro calculator',
  url: 'https://www.missionwinning.com/calculators/tdee',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Mission Winning' },
};

export default function TdeeCalculatorRoute() {
  return (
    <PublicPageShell
      eyebrow="Calculators · free, no account"
      title="TDEE & macros"
      subtitle="Your daily energy budget from Mifflin-St Jeor, then macros in the order that matters: protein first, fat as a floor, carbs fill the rest. Estimates, honestly framed."
      maxWidth="4xl"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicTdeeCalculator />
      <section className="border-t-2 border-border pt-8">
        <p className="eyebrow-live mb-4">How to use it</p>
        <div className="max-w-[58ch] space-y-4 text-base leading-relaxed">
          <p>
            Treat the number as a two-week experiment, not a verdict. Log what you eat against it,
            watch the scale trend and your training, then adjust by 100–200 kcal. Every equation
            carries about ±10% — your log is the better instrument.
          </p>
          <p className="text-sm text-muted-foreground">
            Also here:{' '}
            <a href="/calculators/1rm" className="underline underline-offset-2 hover:text-primary">
              1RM
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
