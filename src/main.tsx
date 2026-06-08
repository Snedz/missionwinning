import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // i18n init for global support (EN + ES starter, more coming)

// Stale PWA service workers can serve old JS without templates — clear in dev
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => void registration.unregister());
  });
}

// PWA install prompt support (capture for use in CTAs). Improved: store event, expose prompt() caller + choice listener for owner analytics.
let deferredPwaPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e: any) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  // Track for owner (A/B, acquisition)
  try { localStorage.setItem('mw_event_pwa_prompt_available', new Date().toISOString()); } catch {}
});
(window as any).deferredPwaPrompt = () => deferredPwaPrompt;
(window as any).triggerPwaInstall = async () => {
  const promptEvent = deferredPwaPrompt;
  if (!promptEvent) {
    alert('Use browser menu (⋮ or share > Add to Home Screen).');
    return;
  }
  promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;
  try {
    localStorage.setItem('mw_event_pwa_install_' + outcome, new Date().toISOString());
    if (outcome === 'accepted') {
      // increment spots demo or just log
      console.log('PWA installed — massive action offline win.');
    }
  } catch {}
  deferredPwaPrompt = null; // one-time use typical
}; // expose for buttons

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
