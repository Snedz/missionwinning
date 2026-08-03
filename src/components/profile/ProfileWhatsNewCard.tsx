'use client';

/**
 * Profile entry for What’s New + First Steps “show again”.
 *
 * D13 trust micro-surfaces. What’s New is always reachable; First Steps restore
 * only appears when the Today card was dismissed (More still has the checklist).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WhatsNewSheet } from './WhatsNewSheet';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { isWhatsNewUnseen } from '@/lib/whatsNew';
import {
  clearFirstStepsDismissed,
  isFirstStepsDismissed,
} from '@/lib/today/firstStepsDismissed';

export function ProfileWhatsNewCard() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [unseen, setUnseen] = useState(false);
  const [stepsDismissed, setStepsDismissed] = useState(false);
  const [stepsRestored, setStepsRestored] = useState(false);

  useEffect(() => {
    setUnseen(isWhatsNewUnseen(APP_BUILD_LABEL));
    setStepsDismissed(isFirstStepsDismissed());
  }, []);

  const closeSheet = () => {
    setOpen(false);
    setUnseen(false);
  };

  const showFirstStepsAgain = () => {
    clearFirstStepsDismissed();
    setStepsDismissed(false);
    setStepsRestored(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-4 w-4" aria-hidden="true" />
          {t('whatsNewCardTitle', { defaultValue: 'What’s new' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="leading-relaxed text-muted-foreground">
          {t('whatsNewCardLead', {
            defaultValue:
              'Short notes on what changed for athletes — not a changelog dump.',
          })}
        </p>
        <Button
          type="button"
          variant="outline"
          className="min-h-[44px] w-full"
          onClick={() => setOpen(true)}
        >
          {unseen
            ? t('whatsNewOpenUnseen', { defaultValue: 'See what’s new' })
            : t('whatsNewOpen', { defaultValue: 'What’s new' })}
        </Button>

        {stepsDismissed ? (
          <div className="space-y-2 border-t-2 border-border pt-3">
            <p className="flex items-center gap-2 text-muted-foreground">
              <ListChecks className="h-4 w-4 shrink-0" aria-hidden />
              {t('firstStepsShowAgainLead', {
                defaultValue:
                  'You hid First Steps from Today. Bring the card back anytime.',
              })}
            </p>
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] w-full"
              onClick={showFirstStepsAgain}
            >
              {t('firstStepsShowAgain', { defaultValue: 'Show First Steps again' })}
            </Button>
          </div>
        ) : null}

        {stepsRestored ? (
          <p className="text-xs leading-relaxed text-muted-foreground" role="status">
            {t('firstStepsShowAgainDone', {
              defaultValue: 'First Steps will show on Today again.',
            })}
          </p>
        ) : null}
      </CardContent>

      <WhatsNewSheet open={open} onClose={closeSheet} />
    </Card>
  );
}
