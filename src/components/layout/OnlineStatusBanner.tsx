'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Slim connectivity banner. Local-first means offline is a supported mode,
 * not an error — the copy reflects that.
 */
export function OnlineStatusBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(typeof navigator !== 'undefined' && !navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-border/60 bg-secondary/80 px-3 py-1.5 text-xs text-muted-foreground"
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden />
      {t('offlineBanner', {
        defaultValue: 'Offline — logging still works. Cloud sync resumes when you reconnect.',
      })}
    </div>
  );
}
