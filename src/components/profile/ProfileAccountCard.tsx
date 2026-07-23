'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignInPanel } from '@/components/auth/SignInPanel';

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

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>{t('account', { defaultValue: 'Account & Sign In' })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {authError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-[hsl(var(--status-danger))]"
          >
            {authError}
          </p>
        ) : null}
        {email ? (
          <>
            <div>
              Signed in as <span className="font-mono text-primary">{email}</span>
            </div>
            <Button variant="outline" onClick={onSignOut}>
              {t('signOut', { defaultValue: 'Sign Out' })}
            </Button>
            <div className="text-xs text-primary/90">
              {t('cloudSyncActive', { defaultValue: 'Journey synced to cloud' })}
            </div>
            <div className="text-xs text-muted-foreground">
              Journey phase, preferences, and milestones merge across devices on sign-in.
            </div>
          </>
        ) : (
          <div className="auth-panel rounded-xl p-4">
            <div className="font-semibold mb-1 text-primary">Sign up or sign in</div>
            <div className="text-xs text-muted-foreground mb-4">
              {t('cloudSyncPending', { defaultValue: 'Sign in to sync journey across devices' })}
            </div>
            <SignInPanel nextPath="/profile" compact />
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {ownerTools
            ? 'Premium status from Supabase enrollments (demo requests log a lead + grant local access). Full real payments + auth when LLC ready.'
            : t('premiumStatusFoot', { defaultValue: 'Premium unlocks via Super Bundle subscription.' })}
        </div>
      </CardContent>
    </Card>
  );
}
