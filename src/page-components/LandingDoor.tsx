'use client';

/**
 * First screen of `/` once the gate is off or the cookie is set.
 *
 * The hero spec measures this composition: one Geist headline
 * ("Log a set. Offline."), one yellow Log a set that opens `/welcome`,
 * and one shot of the logger. The forge sheet follows in the same document.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/components/house/house.css';

export function LandingDoor() {
  const { t } = useTranslation();

  return (
    <div className="mw-house polish-door polish-front">
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
          alt={t('landingForgeShotAlt', { defaultValue: 'The logger, mid set' })}
          width={390}
          height={640}
        />
      </div>
    </div>
  );
}
