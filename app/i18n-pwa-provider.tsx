'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { HtmlLangSync } from '@/components/i18n/HtmlLangSync';
import { LocaleHttpSync } from '@/components/i18n/LocaleHttpSync';
import { identifyUser, initAnalytics, resetAnalyticsIdentity, track } from '@/lib/analytics';

// Bootstrap i18next (minimal EN). Full locale catalogs hydrate after idle.
// supabase-js is NOT imported here — auth listener loads it after idle.
import i18n, { hydrateI18nResources } from '@/i18n';

const OnlineStatusBanner = dynamic(
  () =>
    import('@/components/layout/OnlineStatusBanner').then((m) => ({
      default: m.OnlineStatusBanner,
    })),
  { ssr: false }
);

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type MwWindow = Window & {
  deferredPwaPrompt?: () => BeforeInstallPromptEvent | null;
  triggerPwaInstall?: () => Promise<void>;
};

// PWA beforeinstallprompt capture + trigger (used by Landing "Install" CTAs and Home PWA banner).
// Analytics init is deferred to useEffect (idle) so posthog-js is not on the critical path.
if (typeof window !== 'undefined') {
  const mw = window as MwWindow;

  // (Service worker registration lives in I18nPwaProvider's useEffect below —
  // Serwist emits public/sw.js when PRIVATE_MODE=false; App Router still needs
  // explicit register.)

  window.addEventListener('appinstalled', () => {
    track('pwa_installed');
  });

  let deferredPwaPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e as BeforeInstallPromptEvent;
    try {
      localStorage.setItem('mw_event_pwa_prompt_available', new Date().toISOString());
    } catch { /* noop */ }
  });

  mw.deferredPwaPrompt = () => deferredPwaPrompt;

  mw.triggerPwaInstall = async () => {
    const promptEvent = deferredPwaPrompt;
    if (!promptEvent) {
      alert('Use your browser menu (⋮ or Share > Add to Home Screen) to install Mission Winning for offline use anywhere.');
      return;
    }
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    try {
      localStorage.setItem('mw_event_pwa_install_' + outcome, new Date().toISOString());
    } catch { /* noop */ }
    deferredPwaPrompt = null;
  };
}

export function I18nPwaProvider({ children }: { children: React.ReactNode }) {
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  // Offline banner after idle — lucide + banner JS off first paint.
  useEffect(() => {
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(() => setShowOfflineBanner(true), { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(() => setShowOfflineBanner(true), 500);
    return () => clearTimeout(t);
  }, []);

  // Hydrate full i18n + start analytics after first interaction or a short delay
  // so LCP/TBT are not competing with multi-language catalogs or posthog-js.
  useEffect(() => {
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      initAnalytics();
      void hydrateI18nResources(i18n).catch(() => {
        /* keep bootstrap strings */
      });
    };
    const onInteract = () => run();
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true });
    const t = setTimeout(run, 2800);
    return () => {
      clearTimeout(t);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

  // Register Serwist SW only when builds enable it (PRIVATE_MODE=false).
  // When gated, unregister any stale workers so the private app is not offline-cached.
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const pwaEnabled = process.env.NEXT_PUBLIC_PWA_ENABLED === 'true';
    if (process.env.NODE_ENV !== 'production') return;
    if (!pwaEnabled) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => {
          void r.unregister();
        });
      });
      return;
    }
    void navigator.serviceWorker.register('/sw.js').catch(() => { /* noop */ });
  }, []);

  // Auth listener after idle — dynamic-import supabase-js so it is off first paint.
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    const boot = () => {
      if (cancelled) return;
      void import('@/lib/supabase').then(({ supabase }) => {
        if (cancelled) return;
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user?.id) {
            identifyUser(session.user.id);
            try {
              if (localStorage.getItem('mw_reminders_pref') === '1') {
                void supabase
                  .from('profiles')
                  .update({ reminders_opt_in: true })
                  .eq('id', session.user.id)
                  .then(({ error }) => {
                    if (!error) localStorage.removeItem('mw_reminders_pref');
                  });
              }
            } catch {
              /* noop */
            }
          } else if (event === 'SIGNED_OUT') {
            resetAnalyticsIdentity();
          }
        });
        unsub = () => data.subscription.unsubscribe();
      });
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(boot, { timeout: 3000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
        unsub?.();
      };
    }
    const t = setTimeout(boot, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
      unsub?.();
    };
  }, []);

  return (
    <>
      <HtmlLangSync />
      <LocaleHttpSync />
      {showOfflineBanner ? <OnlineStatusBanner /> : null}
      {children}
    </>
  );
}
