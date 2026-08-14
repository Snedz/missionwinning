'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  hasValidPrivacyConsent,
  savePrivacyConsent,
} from '@/lib/privacyConsent';
import {
  formatEnabledOAuthLabels,
  formatOAuthError,
  getEnabledOAuthProviders,
  isAppleOAuthEnabled,
  isAzureOAuthEnabled,
  isFacebookOAuthEnabled,
  isGoogleOAuthEnabled,
} from '@/lib/oauthConfig';
import {
  isSupabaseConfigured,
  signInMagic,
  signInWithOAuth,
  type OAuthProvider,
} from '@/lib/supabase';
import { fetchTerritoryAccess } from '@/lib/legal/territoryAccessClient';

type SignInPanelProps = {
  /** Called after magic link is sent or user skips (Welcome flow). */
  onComplete?: () => void;
  /** Show skip when email is empty (onboarding). */
  allowSkip?: boolean;
  skipLabel?: string;
  /** Redirect path after OAuth / magic link (default /log). */
  nextPath?: string;
  compact?: boolean;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#00A4EF" d="M13 1h10v10H13z" />
      <path fill="#7FBA00" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export function SignInPanel({
  onComplete,
  allowSkip = false,
  skipLabel: skipLabelProp,
  nextPath = '/log',
  compact = false,
}: SignInPanelProps) {
  const { t } = useTranslation();
  const skipLabel = skipLabelProp ?? t('signInSkip', { defaultValue: 'Skip — continue without account' });
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentLocked, setConsentLocked] = useState(false);
  const [loading, setLoading] = useState<OAuthProvider | 'email' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const [territoryBlocked, setTerritoryBlocked] = useState(false);
  const [territoryMessage, setTerritoryMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();
  const oauthProviders = getEnabledOAuthProviders();
  const showOAuth = configured && oauthProviders.length > 0;
  const oauthLabelList = formatEnabledOAuthLabels(oauthProviders);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  useEffect(() => {
    if (hasValidPrivacyConsent()) {
      setConsent(true);
      setConsentLocked(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchTerritoryAccess().then((t) => {
      if (cancelled) return;
      if (t.blocked) {
        setTerritoryBlocked(true);
        setTerritoryMessage(
          t.message ||
            'Hosted accounts are not available in your region. See Supported Regions.'
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureConsent = (): boolean => {
    if (!consent) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return false;
    }
    if (!consentLocked) savePrivacyConsent();
    return true;
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setMessage(null);
    if (!ensureConsent()) return;
    const territory = await fetchTerritoryAccess();
    if (territory.blocked) {
      setTerritoryBlocked(true);
      setTerritoryMessage(territory.message);
      return;
    }
    if (!configured) {
      setError('Cloud sign-in is not configured yet. You can continue without an account.');
      return;
    }
    setLoading(provider);
    try {
      await signInWithOAuth(provider, nextPath);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(formatOAuthError(msg));
      setLoading(null);
    }
  };

  const handleEmail = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Enter your email or use a sign-in option above.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!ensureConsent()) return;
    const territory = await fetchTerritoryAccess();
    if (territory.blocked) {
      setTerritoryBlocked(true);
      setTerritoryMessage(territory.message);
      return;
    }
    if (!configured) {
      setError('Cloud sign-in is not configured yet.');
      return;
    }

    setLoading('email');
    try {
      await signInMagic(email.trim(), nextPath);
      const sentTo = email.trim();
      setMessage(`Check ${sentTo} for a secure sign-in link.`);
      setLinkSent(true);
      setEmail('');
      // Do not call onComplete here — Welcome must show the check-email message first.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(null);
    }
  };

  if (territoryBlocked) {
    return (
      <div className={compact ? 'space-y-4' : 'space-y-5'}>
        <p
          role="alert"
          className="text-sm text-foreground bg-background border-2 border-border px-3 py-3"
        >
          {territoryMessage}
        </p>
        <p className="text-xs text-muted-foreground">
          You can still use the free offline logger without an account.{' '}
          <Link prefetch={false} href="/regions" className="text-primary underline underline-offset-2">
            Supported Regions
          </Link>
          {' · '}
          <Link prefetch={false} href="/terms" className="text-primary underline underline-offset-2">
            Terms
          </Link>
        </p>
        {allowSkip && onComplete && (
          <Button type="button" variant="outline" className="w-full h-12" onClick={() => onComplete()}>
            {skipLabel}
          </Button>
        )}
      </div>
    );
  }

  if (linkSent && message) {
    return (
      <div className={compact ? 'space-y-4' : 'space-y-5'}>
        <p
          id="signin-message"
          role="status"
          className="text-sm text-primary bg-background border-2 border-primary px-3 py-3"
        >
          {message}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('signInLinkHint', { defaultValue: 'Open the link on this device to sync. You can keep using the app meanwhile.' })}
        </p>
        <div className="flex flex-col gap-2">
          {onComplete && (
            <Button type="button" className="w-full min-h-[52px] tap-target h-12" onClick={() => onComplete()}>
              {t('continue', { defaultValue: 'Continue' })}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full min-h-[44px] tap-target"
            onClick={() => {
              setLinkSent(false);
              setMessage(null);
            }}
          >
            {t('signInDifferentEmail', { defaultValue: 'Use a different email' })}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {/*
        `.240` — a 2px rule, not a tinted pill.
        Two compounding failures, both from fading a token picked for its
        contrast. `text-status-warn/90` composited to #976115 on the amber tint
        (3.79:1, axe serious). Restoring full strength got #8f5300 on #e2dbd3 —
        **4.49:1**, still short, because the 10% fill darkens the ground the text
        has to beat. So the fill goes: Modernist draws structure with rules, and
        the status colour now sits on the card's own paper where it clears AA
        with room. `.127`'s lesson, twice in one element.
      */}
      {!configured && (
        <p className="text-xs text-status-warn border-2 border-[hsl(var(--status-warn))] px-3 py-2">
          {t('signInDemoMode', { defaultValue: 'Demo mode — add Supabase keys to enable cloud sync and social sign-in.' })}
        </p>
      )}

      {showOAuth && (
        <div className="space-y-2.5">
          {isAppleOAuthEnabled() && (
            <Button
              type="button"
              variant="outline"
              className="oauth-btn oauth-btn-apple w-full min-h-[48px] h-12 text-[15px] font-medium tap-target"
              disabled={!!loading}
              onClick={() => handleOAuth('apple')}
            >
              <AppleIcon className="h-5 w-5" />
              {loading === 'apple' ? t('signInRedirecting', { defaultValue: 'Redirecting…' }) : t('signInApple', { defaultValue: 'Continue with Apple' })}
            </Button>
          )}
          {isGoogleOAuthEnabled() && (
            <Button
              type="button"
              variant="outline"
              className="oauth-btn oauth-btn-google w-full min-h-[48px] h-12 text-[15px] font-medium tap-target"
              disabled={!!loading}
              onClick={() => handleOAuth('google')}
            >
              <GoogleIcon className="h-5 w-5" />
              {loading === 'google' ? t('signInRedirecting', { defaultValue: 'Redirecting…' }) : t('signInGoogle', { defaultValue: 'Continue with Google' })}
            </Button>
          )}
          {isAzureOAuthEnabled() && (
            <Button
              type="button"
              variant="outline"
              className="oauth-btn oauth-btn-azure w-full min-h-[48px] h-12 text-[15px] font-medium tap-target"
              disabled={!!loading}
              onClick={() => handleOAuth('azure')}
            >
              <MicrosoftIcon className="h-5 w-5" />
              {loading === 'azure' ? t('signInRedirecting', { defaultValue: 'Redirecting…' }) : t('signInMicrosoft', { defaultValue: 'Continue with Microsoft' })}
            </Button>
          )}
          {isFacebookOAuthEnabled() && (
            <Button
              type="button"
              variant="outline"
              className="oauth-btn oauth-btn-facebook w-full min-h-[48px] h-12 text-[15px] font-medium tap-target"
              disabled={!!loading}
              onClick={() => handleOAuth('facebook')}
            >
              <FacebookIcon className="h-5 w-5" />
              {loading === 'facebook' ? t('signInRedirecting', { defaultValue: 'Redirecting…' }) : t('signInFacebook', { defaultValue: 'Continue with Facebook' })}
            </Button>
          )}
        </div>
      )}

      {showOAuth && (
        <div className="auth-divider">
          <span>{t('signInOrEmail', { defaultValue: 'or use email' })}</span>
        </div>
      )}

      <form onSubmit={handleEmail} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            disabled={!!loading}
            aria-invalid={!!error}
            aria-describedby={error ? 'signin-error' : undefined}
            className="pl-10 h-12 bg-background"
          />
        </div>
        <Button
          type="submit"
          disabled={!!loading || !email.trim()}
          className="w-full h-12 text-[15px] font-semibold bg-primary hover:bg-primary"
        >
          {loading === 'email' ? 'Sending secure link…' : 'Send magic link'}
        </Button>
      </form>

      {allowSkip && (
        <Button
          type="button"
          variant="ghost"
          className="w-full h-11 text-muted-foreground"
          disabled={!!loading}
          onClick={() => onComplete?.()}
        >
          {skipLabel}
        </Button>
      )}

      <label className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed cursor-pointer group">
        <input
          type="checkbox"
          checked={consent}
          disabled={consentLocked}
          onChange={(e) => setConsent(e.target.checked)}
          aria-invalid={!!error && !consent}
          className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(var(--primary))] shrink-0"
        />
        <span>
          I agree to the{' '}
          <Link prefetch={false} href="/terms" target="_blank" className="text-primary underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link prefetch={false} href="/privacy" target="_blank" className="text-primary underline">
            Privacy Policy
          </Link>
          . We only sync data you choose to save when signed in.
        </span>
      </label>

      {error && (
        <p
          id="signin-error"
          role="alert"
          className="text-sm text-destructive bg-background border-2 border-destructive px-3 py-2"
        >
          {error}
        </p>
      )}

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Privacy by design: no password stored.
        {showOAuth && oauthLabelList
          ? ` OAuth uses ${oauthLabelList} — we receive your email and name only.`
          : ' Email magic link only — we receive your email to sync your account.'}{' '}
        You can sign out anytime from Profile.
      </p>
    </div>
  );
}
