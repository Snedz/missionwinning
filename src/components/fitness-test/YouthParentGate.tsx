'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  hasYouthConsent,
  hasPendingYouthConsent,
  isValidParentEmail,
  markYouthConsentVerified,
  mergeYouthConsentFromServer,
  requiresYouthConsent,
  saveYouthConsent,
  getYouthConsent,
} from '@/lib/youthConsent';

type Props = {
  childAge: number;
  onConsented: () => void;
  onCancel?: () => void;
};

type Step = 'request' | 'verify';

/** Parent/guardian gate before under-13 athletes log fitness test data. */
export function YouthParentGate({ childAge, onConsented, onCancel }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(hasPendingYouthConsent() ? 'verify' : 'request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void mergeYouthConsentFromServer().then((ok) => {
      if (ok) onConsented();
    });
  }, [onConsented]);

  if (!requiresYouthConsent(childAge) || hasYouthConsent()) {
    return null;
  }

  const requestConsent = async () => {
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
    saveYouthConsent({ parentEmail: email.trim(), childAge, verified: false });
    try {
      const res = await fetch('/api/youth/consent-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail: email.trim(), childAge }),
      });
      if (res.ok) setSent(true);
    } catch {
      /* local consent still saved */
    }
    setStep('verify');
    setError('');
  };

  const verifyCode = async () => {
    const consentEmail = email.trim() || getYouthConsent()?.parentEmail || '';
    try {
      const res = await fetch('/api/youth/consent-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail: consentEmail,
          childAge,
          code: code.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setError(t('youthCodeInvalid', { defaultValue: 'Incorrect verification code.' }));
        return;
      }
      markYouthConsentVerified();
      onConsented();
    } catch {
      setError(t('youthCodeInvalid', { defaultValue: 'Incorrect verification code.' }));
    }
  };

  if (step === 'verify') {
    return (
      <Card className="border-amber-500/30 bg-amber-950/10">
        <CardHeader>
          <CardTitle className="text-base">
            {t('youthVerifyTitle', { defaultValue: 'Enter verification code' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {sent
              ? t('youthVerifySent', {
                  defaultValue:
                    'We emailed your parent/guardian a 6-digit code and confirm link. Enter the code here to continue.',
                })
              : t('youthVerifyPending', {
                  defaultValue: 'Enter the 6-digit code from the parent consent email.',
                })}
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            className="w-full rounded-md bg-background border border-border px-3 py-2 font-mono text-lg tracking-widest"
            placeholder="123456"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => void verifyCode()}>
              {t('youthVerifyCta', { defaultValue: 'Verify & continue' })}
            </Button>
            <Button variant="ghost" onClick={() => setStep('request')}>
              {t('pftBack', { defaultValue: 'Back' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              'Athletes under 13 need a parent or guardian to approve before logging fitness test results.',
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
                'I am the parent/guardian. I consent to my child using Mission Winning fitness tools.',
            })}
          </span>
        </label>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => void requestConsent()}>
            {t('youthSendCode', { defaultValue: 'Send verification email' })}
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
