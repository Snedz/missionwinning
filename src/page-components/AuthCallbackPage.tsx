'use client';
/**
 * Page: /auth/callback — OAuth redirect handler
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { formatOAuthError } from '@/lib/oauthConfig';
import { supabase } from '@/lib/supabase';
import { sanitizeNextPath } from '@/lib/safeRedirect';

export function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'working' | 'error'>('working');
  const [detail, setDetail] = useState('Completing sign-in…');

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const next = searchParams.get('next') || '/log';
      const safeNext = sanitizeNextPath(next);
      const code = searchParams.get('code');
      const errorDesc = searchParams.get('error_description');

      if (errorDesc) {
        if (!cancelled) {
          setStatus('error');
          setDetail(formatOAuthError(decodeURIComponent(errorDesc)));
        }
        return;
      }

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) {
            throw new Error('No session found. Try signing in again from Profile.');
          }
        }
        if (!cancelled) router.replace(safeNext);
      } catch (e: unknown) {
        if (!cancelled) {
          setStatus('error');
          setDetail(
            formatOAuthError(
              e instanceof Error ? e.message : 'Sign-in could not be completed.'
            )
          );
        }
      }
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <Shield className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-xl font-semibold mb-2">
        {status === 'working' ? 'Signing you in' : 'Sign-in issue'}
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm">{detail}</p>
      {status === 'error' && (
        <button
          type="button"
          onClick={() => router.push('/profile')}
          className="mt-6 text-sm text-primary hover:underline"
        >
          Back to Profile
        </button>
      )}
    </div>
  );
}
