'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  hasYouthConsent,
  isValidParentEmail,
  requiresYouthConsent,
  saveYouthConsent,
} from '@/lib/youthConsent';

type Props = {
  childAge: number;
  onConsented: () => void;
  onCancel?: () => void;
};

/** Parent/guardian gate before under-13 athletes log fitness test data. */
export function YouthParentGate({ childAge, onConsented, onCancel }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  if (!requiresYouthConsent(childAge) || hasYouthConsent()) {
    return null;
  }

  const submit = () => {
    if (!isValidParentEmail(email)) {
      setError(t('youthEmailInvalid', { defaultValue: 'Enter a valid parent or guardian email.' }));
      return;
    }
    if (!checked) {
      setError(
        t('youthConsentRequired', {
          defaultValue: 'Parent or guardian must accept the youth privacy notice.',
        })
      );
      return;
    }
    saveYouthConsent({ parentEmail: email.trim(), childAge });
    onConsented();
  };

  return (
    <Card className="border-amber-500/30 bg-amber-950/10">
      <CardHeader>
        <CardTitle className="text-base">
          {t('youthGateTitle', { defaultValue: 'Parent or guardian approval' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground leading-relaxed">
          {t('youthGateBody', {
            defaultValue:
              'Athletes under 13 need a parent or guardian to approve before logging fitness test results. We store consent locally on this device only.',
          })}
        </p>
        <label className="block space-y-1">
          <span>{t('youthParentEmail', { defaultValue: 'Parent/guardian email' })}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className="w-full rounded-md bg-background border border-border px-3 py-2"
            placeholder="parent@example.com"
          />
        </label>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1"
          />
          <span>
            {t('youthConsentCheckbox', {
              defaultValue:
                'I am the parent/guardian. I consent to my child using Mission Winning fitness tools. I understand this is not medical advice and results stay on this device unless we sign in to sync.',
            })}
          </span>
        </label>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={submit}>
            {t('youthContinue', { defaultValue: 'Continue' })}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {t('pftBack', { defaultValue: 'Back' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
