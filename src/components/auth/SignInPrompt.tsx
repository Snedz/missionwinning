'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/supabase';
import { SignInPanel } from '@/components/auth/SignInPanel';

type SignInPromptProps = {
  /**
   * Collapsed title. Active passes a device-first title so mid-session chrome
   * does not hero "Save progress to cloud" (MatrAIx F-001).
   */
  title?: string;
  /** Shown under the title when collapsed. */
  description?: string;
  nextPath?: string;
  className?: string;
};

export function SignInPrompt({
  title,
  description,
  nextPath = '/profile',
  className = '',
}: SignInPromptProps) {
  const { t } = useTranslation();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    /*
     * Fail open on auth rejection (expired JWT / offline getUser).
     * Kaizen Strong acceptance: session expiry must never gate mid-set
     * Log / rest — treat unknown as signed-out chrome, never throw.
     */
    getUser()
      .then((u) => setSignedIn(!!u?.email))
      .catch(() => setSignedIn(false));
  }, []);

  if (signedIn === null || signedIn) return null;

  const heading =
    title ??
    t('saveProgressCloud', { defaultValue: 'Save progress to cloud' });
  const copy =
    description ??
    t('signInPromptDefault', {
      defaultValue: 'Sign in to sync workouts and journey progress across devices.',
    });

  return (
    <div className={`auth-panel border-2 border-border bg-card p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-primary text-sm">{heading}</div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{copy}</p>
        </div>
        <Link href="/profile" className="text-xs text-primary hover:underline shrink-0 pt-0.5 min-h-[44px] inline-flex items-center tap-target">
          {t('yourProfile', { defaultValue: 'Profile' })}
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px] tap-target"
            onClick={() => setExpanded((v) => !v)}
        >
          {expanded
            ? t('signInCollapse', { defaultValue: 'Hide sign-in' })
            : t('signInPromptExpand', { defaultValue: 'Sign in with Google or email' })}
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t-2 border-border">
          <SignInPanel compact nextPath={nextPath} />
        </div>
      )}
    </div>
  );
}
