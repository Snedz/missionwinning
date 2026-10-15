'use client';
/**
 * Page: / — the public homepage once the gate cookie is set, or when the gate is off.
 * See: app/INDEX.md
 *
 * One headline, one action, one shot of the logger. The waitlist stays on /notify
 * and on the gated door. No stat row, no testimonials, no second accent.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/components/house/house.css';

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="mw-house polish-door">
      <div className="polish-col">
        <h1 className="polish-title">
          {t('footerTagline', { defaultValue: 'Log a set. Offline.' })}
        </h1>
        <Link href="/welcome" className="house-btn house-btn-primary polish-cta">
          {t('landingHeroLine1', { defaultValue: 'Log a set.' })}
        </Link>
        <img
          className="polish-shot"
          src="/brand/log-a-set.webp"
          alt="The logger. The open set, and Log set."
          width={390}
          height={640}
        />
      </div>
    </div>
  );
}
