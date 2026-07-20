'use client';

import { useTranslation } from 'react-i18next';
import { getCouncilStatus, showMahaCopy } from '@/lib/americaConfig';

/** Tiered Council / national fitness copy — legal-safe defaults. */
export function CouncilLeadershipBlock() {
  const { t } = useTranslation();
  const status = getCouncilStatus();

  const bodyKey =
    status === 'member'
      ? 'councilBodyMember'
      : status === 'pending'
        ? 'councilBodyPending'
        : 'councilBodyAspirational';

  return (
    <section className="rounded-2xl border border-[hsl(var(--status-info)/0.25)] bg-[hsl(var(--status-info)/0.1)] p-6 space-y-3 not-prose">
      <h2 className="text-xl font-semibold text-[hsl(var(--status-info))] m-0">
        {t('councilTitle', { defaultValue: 'National fitness mission' })}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed m-0">
        {t(bodyKey, {
          defaultValue:
            'Mission Winning is being built in alignment with national priorities for sports, fitness, and nutrition — free tools that help kids move, parents lead, and communities get stronger together.',
        })}
      </p>
      {showMahaCopy() && (
        <p className="text-sm font-medium text-primary/90 m-0">
          {t('mahaTagline', {
            defaultValue:
              "Let's Make America Healthy Again — starting with strength, movement, and families training together.",
          })}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground m-0">
        {t('councilDisclaimer', {
          defaultValue:
            'Mission Winning LLC is a private educational fitness platform. Not a U.S. government website. Council references reflect alignment or confirmed service only — not an official endorsement unless explicitly stated with authorization.',
        })}
      </p>
    </section>
  );
}
