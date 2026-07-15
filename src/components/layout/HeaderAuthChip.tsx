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
    getUser()
      .then((u) => setEmail(u?.email ?? null))
      .finally(() => setReady(true));
  }, []);

  if (!ready || email) return null;

  return (
    <Link
      href="/profile"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors min-h-[36px]"
    >
      <User className="h-3.5 w-3.5" />
      {t('headerSignIn', { defaultValue: 'Sign in' })}
    </Link>
  );
}
