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
  // next-pwa@5 only injects its register script into the Pages Router entry,
  // so under the App Router we must register manually.)

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
  // Register the PWA service worker (no-op when the worker wasn't generated,
  // e.g. gated/private builds — the fetch 404s and the catch swallows it).
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* noop */ });
    }
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
