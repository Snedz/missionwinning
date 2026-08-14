'use client';
/**
 * Page: / — marketing landing (post-unlock).
 * Four cinematic scenes — docs/design/WWW_NIGHT.md
 * Cold visitors never see this: app/page.tsx redirects to /private.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CinematicWww } from '@/components/landing/CinematicWww';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { LaunchNotifyForm } from '@/components/public/LaunchNotifyForm';
import '@/components/landing/cinematic.css';

export function LandingPage() {
  const { t } = useTranslation();
  const start = t('landingNavStart', { defaultValue: 'Enter with code' });

  const door = (
    <>
      <div className="www-cine-mark">
        <img src="/brand/logo-icon.svg" alt="" width={96} height={96} />
      </div>
      <p className="eyebrow-live www-cine-kicker www-cine-mark-follow">
        {t('landingHeroEyebrowLoop', { defaultValue: 'Free · offline · no account' })}
      </p>
      <h2 className="display-section">
        {t('landingFinalCtaTitleLoop', { defaultValue: 'One set is the whole beginning' })}
      </h2>
      <p className="www-cine-lede">
        {t('landingFinalCtaFoot', {
          defaultValue:
            'Under three minutes to your first session. Nothing to install, nothing to pay.',
        })}
      </p>
      <p className="www-cine-mark-follow">
        <Link className="www-cine-ghost" href="/welcome">
          {start}
        </Link>
      </p>
    </>
  );

  return (
    <>
      <CinematicWww mode="open" door={door} />
      <section data-mw-landing-notify className="www-cine-colophon">
        <div className="www-cine-colophon-inner">
          <LaunchNotifyForm
            source="landing-super-bundle-notify"
            message="Super Bundle checkout notify"
            variant="landing"
          />
        </div>
      </section>
      <div className="www-cine-colophon">
        <div className="www-cine-colophon-inner">
          <span>
            Mission Winning — {t('gateFooterTagline', { defaultValue: 'free core forever' })}
          </span>
          <AppLegalFooter className="gate-footer-links" />
        </div>
      </div>
    </>
  );
}
