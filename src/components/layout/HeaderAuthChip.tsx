'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { getUser } from '@/lib/supabase';

/** Compact sign-in chip for the app header when logged out. */
export function HeaderAuthChip() {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Defer auth lookup so Supabase is not on first paint for cold /log.
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
    const t = setTimeout(boot, 400);
    return () => clearTimeout(t);
  }, []);

  if (!ready || email) return null;

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
