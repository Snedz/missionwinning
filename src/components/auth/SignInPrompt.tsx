'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/supabase';
import { SignInPanel } from '@/components/auth/SignInPanel';

type SignInPromptProps = {
  /** Shown under the title when collapsed. */
  description?: string;
  nextPath?: string;
  className?: string;
};

export function SignInPrompt({
  description,
  nextPath = '/profile',
  className = '',
}: SignInPromptProps) {
  const { t } = useTranslation();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getUser().then((u) => setSignedIn(!!u?.email));
  }, []);

  if (signedIn === null || signedIn) return null;

  const copy =
    description ??
    t('signInPromptDefault', {
      defaultValue: 'Sign in to sync workouts and journey progress across devices.',
    });

  return (
    <div className={`auth-panel rounded-xl p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium text-emerald-400 text-sm">
            {t('saveProgressCloud', { defaultValue: 'Save progress to cloud' })}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{copy}</p>
        </div>
        <Link href="/profile" className="text-xs text-emerald-400 hover:underline shrink-0 pt-0.5">
          {t('yourProfile', { defaultValue: 'Profile' })} →
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
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
        <div className="mt-4 pt-4 border-t border-border/50">
          <SignInPanel compact nextPath={nextPath} />
        </div>
      )}
    </div>
  );
}
