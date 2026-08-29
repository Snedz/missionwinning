'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getMyReferral } from '@/lib/referral';
import { shareText } from '@/lib/shareFitnessMission';
import { track } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const SITE = 'https://www.missionwinning.com';

type Props = {
  signedIn: boolean;
};

function recognitionKey(count: number): string | null {
  if (count >= 25) return 'growthRecognition25';
  if (count >= 10) return 'growthRecognition10';
  if (count >= 3) return 'growthRecognition3';
  return null;
}

/** Invite code + recruit recognition — no monetary rewards (Wave 8). */
export function ProfileReferralCard({ signedIn }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(signedIn);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    void getMyReferral().then((r) => {
      if (cancelled || !r) {
        setLoading(false);
        return;
      }
      setCode(r.code);
      setCount(r.recruitCount);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const invite = async () => {
    if (!code) return;
    const link = `${SITE}/?ref=${code}`;
    const text = `Join me on Mission Winning — free core forever. Start here: ${link}`;
    const method = await shareText(text, 'Mission Winning');
    track('referral_link_shared', { method, surface: 'profile' });
    if (method === 'copied') {
      toast({ title: t('growthShareCopied', { defaultValue: 'Link copied' }) });
    } else if (method === 'failed') {
      toast({
        title: t('growthShareFailed', { defaultValue: 'Could not share' }),
        variant: 'destructive',
      });
    }
  };

  const badge = recognitionKey(count);

  return (
    <div className="house-card space-y-3" data-testid="account-referral-card">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <Users className="h-4 w-4 text-primary" aria-hidden />
        {t('growthReferralTitle', { defaultValue: 'Invite a friend' })}
      </h3>
        <p className="house-referral-cite" data-testid="account-referral-cite">
          {t('growthReferralDesc', {
            defaultValue:
              'Share your code. When someone starts their free path with it, you both grow the mission. Recognition only — no paid rewards yet.',
          })}
        </p>

        {!signedIn ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('growthReferralSignInHint', {
                defaultValue: 'Sign in to get your invite code and share the mission.',
              })}
            </p>
            <Button asChild variant="default" className="min-h-[44px]">
              <Link href="/profile">
                {t('growthReferralSignIn', { defaultValue: 'Sign in' })}
              </Link>
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-2" role="status" aria-busy="true" aria-label="Loading">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full sm:w-40" />
          </div>
        ) : (
          <>
            {code ? (
              <div className="border-2 border-border bg-card px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t('growthReferralCode', { defaultValue: 'Your code' })}
                </p>
                <p className="font-mono text-lg font-semibold tracking-wide text-primary">{code}</p>
              </div>
            ) : null}
            <p className="text-sm">
              {t('growthReferralCount', {
                count,
                defaultValue: `${count} recruited`,
              })}
            </p>
            {badge ? (
              <p
                className={cn(
                  'inline-flex  border border-border bg-muted px-3 py-1',
                  'text-xs font-medium uppercase tracking-wide text-accent-900'
                )}
              >
                {t(badge, { defaultValue: 'Recruiter' })}
              </p>
            ) : null}
            <Button
              type="button"
              variant="default"
              className="min-h-[44px] w-full sm:w-auto"
              disabled={!code}
              onClick={() => void invite()}
            >
              {t('growthReferralInvite', { defaultValue: 'Invite a friend' })}
            </Button>
          </>
        )}
    </div>
  );
}
