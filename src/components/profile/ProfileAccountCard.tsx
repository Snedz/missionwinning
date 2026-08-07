'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignInPanel } from '@/components/auth/SignInPanel';
import { isFreeBeta } from '@/lib/freeBeta';

type ProfileAccountCardProps = {
  email: string | null;
  ownerTools: boolean;
  onSignOut: () => void;
  authError?: string | null;
};

export function ProfileAccountCard({
  email,
  ownerTools,
  onSignOut,
  authError,
}: ProfileAccountCardProps) {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {t('account', { defaultValue: 'Account' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {authError ? (
          <p
            role="alert"
            className="border-2 border-destructive bg-card px-3 py-2 text-sm text-[hsl(var(--status-danger))]"
          >
            {authError}
          </p>
        ) : null}
        {email ? (
          <>
            <div className="text-sm leading-relaxed">
              {t('signedInAs', { defaultValue: 'Signed in as' })}{' '}
              <span className="font-medium text-foreground">{email}</span>
            </div>
            <Button variant="outline" onClick={onSignOut}>
              {t('signOut', { defaultValue: 'Sign out' })}
            </Button>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('cloudSyncActive', {
                defaultValue: 'Cloud sync on — workouts and preferences merge across devices.',
              })}
            </p>
          </>
        ) : (
          <div className="border-2 border-border bg-card p-4">
            <p className="font-medium mb-1 text-sm">
              {t('signInOptional', { defaultValue: 'Sign in (optional)' })}
            </p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t('cloudSyncPending', {
                defaultValue: 'Sync progress across devices. Logging works offline without an account.',
              })}
            </p>
            <SignInPanel nextPath="/profile" compact />
          </div>
        )}
        {ownerTools ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Owner tools: enrollments + local demo grants. Real payments when LLC is ready.
          </p>
        ) : freeBeta ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('profileFreeBetaFoot', {
              defaultValue: 'Open beta — full tools free while we grow with you. Logger stays free forever.',
            })}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('premiumStatusFoot', {
              defaultValue: 'Super Bundle unlocks Coach depth. The free logger is never gated.',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
