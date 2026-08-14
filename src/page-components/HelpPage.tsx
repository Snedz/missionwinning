'use client';
/** Page: /help — in-app FAQ. Not a Today tab. */

import { useTranslation } from 'react-i18next';
import { CircleHelp } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';
import { HELP_FAQ } from '@/lib/helpFaq';

export function HelpPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={CircleHelp}
      eyebrow={t('infoHelpEyebrow', { defaultValue: 'Help' })}
      title={t('infoHelpTitle', { defaultValue: 'Frequently asked' })}
      subtitle={t('infoHelpSubtitle', {
        defaultValue: 'Short answers. The free logger is never gated.',
      })}
      showLegalFooter
    >
      <InfoSection id="faq" title={t('infoHelpFaq', { defaultValue: 'FAQ' })}>
        <dl className="space-y-5" data-testid="help-faq">
          {HELP_FAQ.map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-foreground">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </InfoSection>
    </InfoPageShell>
  );
}
