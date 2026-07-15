'use client';

import React, { useEffect } from 'react';
import { HtmlLangSync } from '@/components/i18n/HtmlLangSync';
import { LocaleHttpSync } from '@/components/i18n/LocaleHttpSync';
import { OnlineStatusBanner } from '@/components/layout/OnlineStatusBanner';
import { identifyUser, initAnalytics, resetAnalyticsIdentity, track } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

// Initialize i18next + browser language detector + all our global resources (EN/ES/FR/PT/RU)
// This must run on the client only.
import '@/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type MwWindow = Window & {
  deferredPwaPrompt?: () => BeforeInstallPromptEvent | null;
  triggerPwaInstall?: () => Promise<void>;
};

// PWA beforeinstallprompt capture + trigger (used by Landing "Install" CTAs and Home PWA banner).
// Ported from the original Vite main.tsx logic so "Install Mission Winning for offline" works.
if (typeof window !== 'undefined') {
  const mw = window as MwWindow;
  initAnalytics();

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

  // Tie analytics identity to auth: anonymous users stay anonymous
  // (person_profiles: 'identified_only'); signed-in events join their profile.
  // Also apply the I-Day reminders opt-in once a profile row exists.
  useEffect(() => {
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
        } catch { /* noop */ }
      } else if (event === 'SIGNED_OUT') {
        resetAnalyticsIdentity();
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <>
      <HtmlLangSync />
      <LocaleHttpSync />
      <OnlineStatusBanner />
      {children}
    </>
  );
}
