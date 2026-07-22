'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OtpInput, type OtpInputHandle, type OtpInputStatus } from '@/components/ui/OtpInput';
import { RESEND_COOLDOWN_MS } from '@/lib/otpInput';
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
  const [otpStatus, setOtpStatus] = useState<OtpInputStatus>('idle');
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const otpRef = useRef<OtpInputHandle>(null);
  const verifyingRef = useRef(false);

  useEffect(() => {
    void mergeYouthConsentFromServer().then((ok) => {
      if (ok) onConsented();
    });
  }, [onConsented]);

  // Pending verify on load: lock resend so users do not hammer the notify endpoint.
  useEffect(() => {
    if (hasPendingYouthConsent()) {
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
      setNow(Date.now());
    }
  }, []);

  useEffect(() => {
    if (step !== 'verify' || resendAvailableAt <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [step, resendAvailableAt]);

  const startResendCooldown = useCallback(() => {
    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
    setNow(Date.now());
  }, []);

  if (!requiresYouthConsent(childAge) || hasYouthConsent()) {
    return null;
  }

  const sendNotify = async (parentEmail: string) => {
    const res = await fetch('/api/youth/consent-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentEmail, childAge }),
    });
    return res.ok;
  };

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
    setSending(true);
    setError('');
    try {
      const ok = await sendNotify(email.trim());
      if (!ok) {
        setError(
          t('youthSendFailed', {
            defaultValue: 'Could not send the verification email. Try again shortly.',
          })
        );
        return;
      }
      saveYouthConsent({ parentEmail: email.trim(), childAge, verified: false });
      setSent(true);
      startResendCooldown();
      setStep('verify');
      setCode('');
      setOtpStatus('idle');
    } catch {
      setError(
        t('youthSendFailed', {
          defaultValue: 'Could not send the verification email. Try again shortly.',
        })
      );
    } finally {
      setSending(false);
    }
  };

  const resendCode = async () => {
    if (Date.now() < resendAvailableAt) return;
    const consentEmail = email.trim() || getYouthConsent()?.parentEmail || '';
    if (!consentEmail) {
      setError(t('youthEmailInvalid', { defaultValue: 'Enter a valid parent or guardian email.' }));
      return;
    }
    try {
      const ok = await sendNotify(consentEmail);
      if (ok) {
        setSent(true);
        startResendCooldown();
        setError('');
      } else {
        setError(
          t('youthResendFailed', {
            defaultValue: 'Could not resend the code. Try again shortly.',
          })
        );
      }
    } catch {
      setError(
        t('youthResendFailed', {
          defaultValue: 'Could not resend the code. Try again shortly.',
        })
      );
    }
  };

  const verifyCode = async (rawCode?: string) => {
    const trimmed = (rawCode ?? code).trim();
    if (trimmed.length !== 6 || verifyingRef.current || otpStatus === 'success') return;
    verifyingRef.current = true;
    setVerifying(true);
    const consentEmail = email.trim() || getYouthConsent()?.parentEmail || '';
    try {
      const res = await fetch('/api/youth/consent-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail: consentEmail,
          childAge,
          code: trimmed,
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setError(t('youthCodeInvalid', { defaultValue: 'Incorrect verification code.' }));
        setOtpStatus('error');
        setCode('');
        window.setTimeout(() => {
          setOtpStatus('idle');
          otpRef.current?.focusFirst();
        }, 400);
        return;
      }
      setOtpStatus('success');
      setError('');
      markYouthConsentVerified();
      window.setTimeout(() => onConsented(), 450);
    } catch {
      setError(
        t('youthVerifyNetwork', {
          defaultValue: 'Could not verify right now. Check your connection and try again.',
        })
      );
      setOtpStatus('error');
      setCode('');
      window.setTimeout(() => {
        setOtpStatus('idle');
        otpRef.current?.focusFirst();
      }, 400);
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  };

  const resendSecondsLeft = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
  const resendLocked = resendSecondsLeft > 0;

  if (step === 'verify') {
    return (
      <Card className="border-[hsl(var(--status-warn)/0.3)] bg-[hsl(var(--status-warn)/0.08)]">
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
          <OtpInput
            ref={otpRef}
            value={code}
            status={otpStatus}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- OTP entry after consent email
            autoFocus
            disabled={verifying}
            aria-label={t('youthVerifyTitle', { defaultValue: 'Enter verification code' })}
            aria-invalid={otpStatus === 'error' || !!error}
            aria-describedby={error ? 'youth-otp-error' : undefined}
            id="youth-otp"
            onChange={(next) => {
              setCode(next);
              if (otpStatus === 'error') setOtpStatus('idle');
              setError('');
            }}
            onComplete={(full) => {
              void verifyCode(full);
            }}
          />
          {error && (
            <p id="youth-otp-error" className="text-xs text-red-400 text-center" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={code.length !== 6 || verifying || otpStatus === 'success'}
              onClick={() => void verifyCode()}
            >
              {t('youthVerifyCta', { defaultValue: 'Verify & continue' })}
            </Button>
            <Button variant="ghost" onClick={() => setStep('request')}>
              {t('pftBack', { defaultValue: 'Back' })}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            disabled={resendLocked || otpStatus === 'success'}
            onClick={() => void resendCode()}
          >
            {resendLocked
              ? t('youthResendIn', {
                  defaultValue: 'Resend code in {{seconds}}s',
                  seconds: resendSecondsLeft,
                })
              : t('youthResendCode', { defaultValue: 'Resend code' })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[hsl(var(--status-warn)/0.3)] bg-[hsl(var(--status-warn)/0.08)]">
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
        {error && (
          <p id="youth-request-error" className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button className="flex-1" disabled={sending} onClick={() => void requestConsent()}>
            {sending
              ? t('youthSending', { defaultValue: 'Sending…' })
              : t('youthSendCode', { defaultValue: 'Send verification email' })}
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
