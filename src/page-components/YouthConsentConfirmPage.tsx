'use client';
/**
 * Page: /youth/consent/confirm — parent consent link
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { markYouthConsentVerified, saveYouthConsent } from '@/lib/youthConsent';

export function YouthConsentConfirmPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [crossDevice, setCrossDevice] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`/api/youth/consent-confirm?token=${encodeURIComponent(token)}`);
        const data = (await res.json()) as {
          ok?: boolean;
          email?: string;
          age?: number;
          persisted?: boolean;
        };
        if (!res.ok || !data.ok || !data.email || data.age == null) {
          setStatus('error');
          return;
        }
        setCrossDevice(Boolean(data.persisted));
        saveYouthConsent({
          parentEmail: data.email,
          childAge: data.age,
          verified: true,
        });
        markYouthConsentVerified();
        setStatus('ok');
        setTimeout(() => router.replace('/fitness-test'), 2500);
      } catch {
        setStatus('error');
      }
    })();
  }, [searchParams, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full content-card">
        <CardHeader>
          <CardTitle>{t('youthConfirmTitle', { defaultValue: 'Parent consent' })}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {status === 'loading' && (
            <p className="text-muted-foreground">
              {t('youthConfirmLoading', { defaultValue: 'Confirming…' })}
            </p>
          )}
          {status === 'ok' && (
            <p className="text-primary">
              {crossDevice
                ? t('youthConfirmCrossDevice', {
                    defaultValue:
                      'Consent saved to the athlete account. They can continue on any signed-in device.',
                  })
                : t('youthConfirmOk', {
                    defaultValue: 'Consent verified. Redirecting to the fitness test…',
                  })}
            </p>
          )}
          {status === 'error' && (
            <>
              <p className="text-red-400">
                {t('youthConfirmError', {
                  defaultValue: 'Link expired or invalid. Ask your parent to resubmit consent.',
                })}
              </p>
              <Button variant="outline" onClick={() => router.push('/fitness-test')}>
                {t('youthConfirmBack', { defaultValue: 'Back to fitness test' })}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
