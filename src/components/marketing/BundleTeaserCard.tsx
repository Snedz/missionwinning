'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUNDLE_PILLARS } from '@/lib/payments';
import { BUNDLE_PLANS, DEFAULT_BUNDLE_PLAN } from '@/lib/bundleConfig';
import { Reveal } from '@/components/marketing/Reveal';

/**
 * Landing Super Bundle teaser — price from BUNDLE_PLANS (not hardcoded).
 * Payment lives on /bundle; this is merchandising only.
 */
export function BundleTeaserCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const plan = BUNDLE_PLANS[DEFAULT_BUNDLE_PLAN];
  const perMonth = plan.perMonth ?? plan.price;

  return (
    <section className="section-seam">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <Reveal>
          <div className="card-elevated card-glow-brass relative overflow-hidden grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 opacity-40"
              aria-hidden
            >
              <Image
                src="/art/bundle-brass.avif"
                alt=""
                width={160}
                height={160}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="relative z-[1]">
              <p className="eyebrow-honor mb-4">
                {t('landingBundleEyebrow', { defaultValue: 'The Super Bundle' })}
              </p>
              <h2 className="display-section mb-4">
                {t('landingBundleTitle1', { defaultValue: 'Six premium tools.' })}
                <br />
                {t('landingBundleTitle2', { defaultValue: 'One subscription.' })}
              </h2>
              <p className="mb-4 max-w-lg leading-relaxed text-muted-foreground">
                {t('landingBundleBody', {
                  defaultValue:
                    'Coaching-grade training plans, deep nutrition, complete mobility and mind libraries, advanced tracking, and full specialist programs — the depth of six apps, priced like one. Founding members lock in discounted pricing for good.',
                })}
              </p>
              <p className="mb-6 font-mono text-sm text-brass tabular-nums">
                {t('landingBundlePriceLine', {
                  defaultValue: 'From ${{perMonth}}/mo · free core forever',
                  perMonth,
                })}
              </p>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-brass/40 px-6 text-brass hover:bg-brass/10 hover:text-brass"
                onClick={() => router.push('/bundle')}
              >
                {t('landingBundleCta', { defaultValue: 'See the bundle' })}{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <ul className="relative z-[1] space-y-2.5 text-sm">
              {BUNDLE_PILLARS.map((p) => (
                <li key={p.id} className="flex items-center gap-2.5 text-foreground/90">
                  <Check className="h-4 w-4 shrink-0 text-brass" />
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground"> — {p.premium}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t('landingBundleFoot', {
            defaultValue:
              'The free core never moves behind the bundle. Premium funds the mission — it doesn’t gate it.',
          })}
        </p>
      </div>
    </section>
  );
}
