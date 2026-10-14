'use client';
/**
 * Page: /contact — company contact for Mission Winning LLC.
 * Quiet house info door. No form, no tracker, no submission pipeline: email is
 * the only channel, and it is listed in the page body and the footer.
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const CONTACT_SECTIONS = [
  { id: 'company', key: 'infoContactCompanyTitle', bodyKey: 'infoContactCompanyBody' },
  { id: 'email', key: 'infoContactEmailTitle', bodyKey: 'infoContactEmailBody' },
  { id: 'expect', key: 'infoContactResponseTitle', bodyKey: 'infoContactResponseBody' },
  { id: 'no-forms', key: 'infoContactNoFormsTitle', bodyKey: 'infoContactNoFormsBody' },
] as const;

export function ContactPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={Mail}
      eyebrow={t('infoCompanyEyebrow', { defaultValue: infoEnFloor('infoCompanyEyebrow') })}
      title={t('infoContactTitle', { defaultValue: infoEnFloor('infoContactTitle') })}
      subtitle={t('infoContactSubtitle', { defaultValue: infoEnFloor('infoContactSubtitle') })}
      variant="sections"
      showLegalFooter
    >
      <nav className="flex flex-wrap gap-2 text-xs" aria-label={t('infoContactTitle', { defaultValue: 'Contact' })}>
        {CONTACT_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {CONTACT_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          <p className="text-sm text-muted-foreground">
            {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
          </p>
        </section>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoContactFoot', { defaultValue: infoEnFloor('infoContactFoot') })}
      </p>
    </InfoPageShell>
  );
}
