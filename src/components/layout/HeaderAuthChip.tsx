'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { getUser } from '@/lib/supabase';
import { useDismissed } from '@/hooks/useDismissed';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { accountLiteHeroChrome } from '@/lib/today/accountLite';
import { readWorkoutHistoryFromStorage } from '@/lib/workout/workoutPersistLite';

/**
 * Compact sign-in chip — F-017: never on the first session (Start is the boss),
 * never while Keep this diary? owns the offer. After Not now, this is quiet
 * wayfinding to Profile. getUser stays off the cold path.
 */
export function HeaderAuthChip() {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { dismissed } = useDismissed(STORAGE_KEYS.accountLiteDismissed);
  const completedWorkouts = readWorkoutHistoryFromStorage().length;

  useEffect(() => {
    if (completedWorkouts < 1) {
      setReady(true);
      return;
    }
    const boot = () => {
      getUser()
        .then((u) => setEmail(u?.email ?? null))
        .catch(() => setEmail(null))
        .finally(() => setReady(true));
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(boot, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(boot, 400);
    return () => clearTimeout(timer);
  }, [completedWorkouts]);

  if (!ready || email) return null;

  const chrome = accountLiteHeroChrome({
    signedIn: false,
    completedWorkouts,
    dismissed,
  });
  if (chrome !== 'local-badge' || completedWorkouts < 1) return null;

  return (
    <Link
      href="/profile"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 shrink-0 border border-primary bg-tint px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors min-h-[44px] tap-target"
    >
      <User className="h-3.5 w-3.5" />
      {t('headerSignIn', { defaultValue: 'Sign in' })}
    </Link>
  );
}
