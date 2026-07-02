'use client';

import React from 'react';
import { HtmlLangSync } from '@/components/i18n/HtmlLangSync';
import { LocaleHttpSync } from '@/components/i18n/LocaleHttpSync';
import { TextScaleInit } from '@/components/a11y/TextScaleInit';

// Initialize i18next + browser language detector + all our global resources (EN/ES/FR/PT/RU)
// This must run on the client only.
import '@/i18n';

// PWA beforeinstallprompt capture + trigger (used by Landing "Install" CTAs and Home PWA banner).
// Ported from the original Vite main.tsx logic so "Install Mission Winning for offline" works.
if (typeof window !== 'undefined') {
  let deferredPwaPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e as BeforeInstallPromptEvent;
    try {
      localStorage.setItem('mw_event_pwa_prompt_available', new Date().toISOString());
    } catch {
      /* storage unavailable */
    }
  });

  window.deferredPwaPrompt = () => deferredPwaPrompt;

  window.triggerPwaInstall = async () => {
    const promptEvent = deferredPwaPrompt;
    if (!promptEvent) {
      alert('Use your browser menu (⋮ or Share > Add to Home Screen) to install Mission Winning for offline use anywhere.');
      return;
    }
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    try {
      localStorage.setItem('mw_event_pwa_install_' + outcome, new Date().toISOString());
    } catch {
      /* storage unavailable */
    }
    deferredPwaPrompt = null;
  };
}

export function I18nPwaProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLangSync />
      <LocaleHttpSync />
      <TextScaleInit />
      {children}
    </>
  );
}
