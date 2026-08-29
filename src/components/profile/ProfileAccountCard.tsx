'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DangerZone } from '@/components/ui/DangerZone';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { SignInPanel } from '@/components/auth/SignInPanel';
import { MissionIdView } from '@/components/profile/MissionIdView';
import { isFreeBeta } from '@/lib/freeBeta';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw } from '@/lib/storage/safeStorage';
import { localDateKey } from '@/lib/time/localDate';

type ProfileAccountCardProps = {
  email: string | null;
  ownerTools: boolean;
  onSignOut: () => void;
  authError?: string | null;
  missionId?: number | null;
};

export function ProfileAccountCard({
  email,
  ownerTools,
  onSignOut,
  authError,
  missionId = null,
}: ProfileAccountCardProps) {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  const downloadCloudExport = async () => {
    setDataError(null);
    setExporting(true);
    try {
      const res = await fetch('/api/account/export');
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mission-winning-cloud-export-${localDateKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDataError(
        t('accountExportCloudError', {
          defaultValue: 'Export failed — try again in a few minutes.',
        })
      );
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    setDataError(null);
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: 'DELETE',
          deviceId: readRaw(STORAGE_KEYS.deviceId) ?? undefined,
        }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !body?.ok) throw new Error(String(res.status));
      setDeleted(true);
      onSignOut();
    } catch {
      setDataError(
        t('accountDeleteError', {
          defaultValue:
            'Deletion failed — nothing was partially removed. Try again or email support.',
        })
      );
    } finally {
      setDeleting(false);
    }
  };

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
            className="border border-destructive bg-accent-100 px-3 py-2 text-sm text-[hsl(var(--status-danger))]"
          >
            {authError}
          </p>
        ) : null}
        {deleted ? (
          <p role="status" className="text-sm text-muted-foreground leading-relaxed">
            {t('accountDeleteDoneNote', {
              defaultValue: 'Account deleted. Your on-device data is untouched.',
            })}
          </p>
        ) : email ? (
          <>
            <div className="text-sm leading-relaxed">
              {t('signedInAs', { defaultValue: 'Signed in as' })}{' '}
              <span className="font-semibold text-foreground">{email}</span>
            </div>
            <MissionIdView missionId={missionId} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onSignOut}>
                {t('signOut', { defaultValue: 'Sign out' })}
              </Button>
              <Button variant="outline" onClick={downloadCloudExport} disabled={exporting}>
                {t('accountExportCloud', { defaultValue: 'Download my cloud data' })}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('cloudSyncActive', {
                defaultValue: 'Journey synced to cloud',
              })}
            </p>
          </>
        ) : (
          <div className="house-account-signin" data-testid="account-signin-block">
            <p className="font-semibold mb-1 text-sm">
              {t('signInOptional', { defaultValue: 'Sign in optional — progress stays on this device.' })}
            </p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t('cloudSyncPending', {
                defaultValue: 'Sign in to sync journey across devices',
              })}
            </p>
            <SignInPanel nextPath="/profile" compact />
          </div>
        )}
        {dataError ? (
          <p role="alert" className="text-xs text-[hsl(var(--status-danger))] leading-relaxed">
            {dataError}
          </p>
        ) : null}
        {ownerTools ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Owner tools: enrollments + local demo grants. Real payments when LLC is ready.
          </p>
        ) : freeBeta ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('profileFreeBetaFoot', {
              defaultValue: 'Alpha — full tools free while we grow with you. Logger stays free forever.',
            })}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('premiumStatusFoot', {
              defaultValue: 'Super Bundle unlocks Coach depth. The free logger is never gated.',
            })}
          </p>
        )}
        {email && !deleted ? (
          <DangerZone
            title={t('accountDangerTitle', { defaultValue: 'Danger zone' })}
            description={t('accountDangerDesc', {
              defaultValue:
                'Deletes your account and all cloud data — workouts, nutrition, plans, everything synced. Immediate and irreversible. Data on this device stays until you clear it (see Back up your data).',
            })}
          >
            <HoldToConfirmButton
              label={t('accountDeleteHold', { defaultValue: 'Delete account & cloud data' })}
              onConfirm={deleteAccount}
              disabled={deleting}
              size="sm"
            />
          </DangerZone>
        ) : null}
      </CardContent>
    </Card>
  );
}
