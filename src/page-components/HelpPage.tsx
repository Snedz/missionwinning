'use client';
/** Page: /help — leftover FAQ. Never a rail. Not a Today tab. */

import { useTranslation } from 'react-i18next';
import { CircleHelp } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { HELP_FAQ } from '@/lib/helpFaq';

export function HelpPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      className="house-help"
      icon={CircleHelp}
      eyebrow={t('infoHelpEyebrow', { defaultValue: 'Help' })}
      title={t('infoHelpTitle', { defaultValue: 'Help' })}
      subtitle={t('infoHelpSubtitle', {
        defaultValue: 'Short answers. The free logger is never gated.',
      })}
      showLegalFooter
    >
      {/* Quiet leftover: FAQ is the first-paint object. */}
      <dl className="house-list" data-testid="help-faq">
        {HELP_FAQ.map((item) => (
          <div key={item.q} className="house-item">
            <dt className="font-semibold">{item.q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </InfoPageShell>
  );
}
