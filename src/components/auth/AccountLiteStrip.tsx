'use client';

/**
 * F-017 — quiet post-workout account offer. Secondary, dismissible, never
 * poster-red. Create account opens Profile (SignInPanel lives there); Not now
 * is device-local. Must not mount during the first session (caller gates on
 * completedWorkouts via accountLiteHeroChrome).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/supabase';
import { useDismissed } from '@/hooks/useDismissed';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import {
  ACCOUNT_LITE_COPY,
  accountLiteHeroChrome,
} from '@/lib/today/accountLite';

type Props = {
  completedWorkouts: number;
};

export function AccountLiteStrip({ completedWorkouts }: Props) {
  const { t } = useTranslation();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const { dismissed, ready, dismiss } = useDismissed(STORAGE_KEYS.accountLiteDismissed);

  useEffect(() => {
    getUser()
      .then((u) => setSignedIn(!!u?.email))
      .catch(() => setSignedIn(false));
  }, []);

  if (signedIn === null || !ready) return null;

  const chrome = accountLiteHeroChrome({
    signedIn,
    completedWorkouts,
    dismissed,
  });
  if (chrome !== 'offer') return null;

  return (
    <div
      className="border-2 border-border bg-card p-3 space-y-2"
      data-testid="account-lite-strip"
    >
      <p className="text-sm font-semibold text-foreground">
        {t('f017DeferAccountTitle', {
          defaultValue: ACCOUNT_LITE_COPY.deferAccountTitle,
        })}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('f017DeferAccountBody', {
          defaultValue: ACCOUNT_LITE_COPY.deferAccountBody,
        })}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="min-h-[44px] tap-target">
          <Link href="/profile">
            {t('f017CreateAccount', {
              defaultValue: ACCOUNT_LITE_COPY.createAccount,
            })}
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-[44px] tap-target"
          onClick={dismiss}
        >
          {t('f017NotNow', { defaultValue: ACCOUNT_LITE_COPY.notNow })}
        </Button>
      </div>
    </div>
  );
}
