interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface Window {
  deferredPwaPrompt?: () => BeforeInstallPromptEvent | null;
  triggerPwaInstall?: () => Promise<void>;
}
