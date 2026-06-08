'use client';

import React from 'react';

// Initialize i18next + browser language detector + all our global resources (EN/ES/FR/PT/RU)
// This must run on the client only.
import '@/i18n';

// PWA beforeinstallprompt capture + trigger (used by Landing "Install" CTAs and Home PWA banner).
// Ported from the original Vite main.tsx logic so "Install Mission Winning for offline" works.
if (typeof window !== 'undefined') {
  let deferredPwaPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    try {
      localStorage.setItem('mw_event_pwa_prompt_available', new Date().toISOString());
    } catch {}
  });

  (window as any).deferredPwaPrompt = () => deferredPwaPrompt;

  (window as any).triggerPwaInstall = async () => {
    const promptEvent = deferredPwaPrompt;
    if (!promptEvent) {
      alert('Use your browser menu (⋮ or Share > Add to Home Screen) to install Mission Winning for offline use anywhere.');
      return;
    }
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    try {
      localStorage.setItem('mw_event_pwa_install_' + outcome, new Date().toISOString());
    } catch {}
    deferredPwaPrompt = null;
  };
}

export function I18nPwaProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
