'use client';

/**
 * Thin What’s New sheet — curated athlete bullets for the current build label.
 *
 * D13. Marks the build seen on open so the “new” affordance clears once the
 * athlete looks. Never scrapes LOG.md.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { WHATS_NEW_BULLETS, markWhatsNewSeen } from '@/lib/whatsNew';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function WhatsNewSheet({ open, onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (open) markWhatsNewSeen(APP_BUILD_LABEL);
  }, [open]);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow={t('whatsNewEyebrow', { defaultValue: 'Updates' })}
      title={t('whatsNewTitle', { defaultValue: 'What’s new' })}
      footer={
        <Button variant="outline" className="min-h-[44px] w-full" onClick={onClose}>
          {t('whatsNewDone', { defaultValue: 'Got it' })}
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs tabular-nums text-muted-foreground">
          {t('whatsNewBuildLine', {
            label: APP_BUILD_LABEL,
            defaultValue: `Build ${APP_BUILD_LABEL}`,
          })}
        </p>
        <ul className="divide-y-2 divide-border border-y-2 border-border">
          {WHATS_NEW_BULLETS.map((b) => (
            <li key={b.id} className="py-3">
              <p className="text-sm font-semibold leading-snug">
                {t(b.titleKey, { defaultValue: b.titleDefault })}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(b.bodyKey, { defaultValue: b.bodyDefault })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </AdaptiveOverlay>
  );
}
