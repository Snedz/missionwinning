'use client';

/**
 * One small coach-mark. Black Got it + X. Either click dismisses.
 * No chain of popups. Checklist is a separate persistent card.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { isHouseTodayPath } from './houseNav';

export function HouseGuide() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isHouseTodayPath(pathname)) {
      setOpen(false);
      return;
    }
    if (readRaw(STORAGE_KEYS.houseGuideDismissed) === '1') {
      setOpen(false);
      return;
    }
    const id = window.setTimeout(() => {
      if (document.querySelector('[data-testid="today-start-ready"]')) {
        setOpen(true);
      }
    }, 40);
    return () => window.clearTimeout(id);
  }, [pathname]);

  if (!open) return null;

  const title = t('houseGuideStartTitle', { defaultValue: 'Start the session' });
  const body = t('houseGuideStartBody', { defaultValue: 'One tap opens Train.' });

  const dismiss = () => {
    writeRaw(STORAGE_KEYS.houseGuideDismissed, '1');
    setOpen(false);
  };

  return (
    <div
      className="house-guide is-start"
      data-testid="house-guide"
      data-house-guide-step="start"
      role="dialog"
      aria-label={title}
    >
      <div className="house-guide-card">
        <button
          type="button"
          className="house-btn house-btn-ghost house-guide-x"
          aria-label={t('houseGuideClose', { defaultValue: 'Close' })}
          onClick={dismiss}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <h3 className="house-side-title" style={{ margin: 0, paddingRight: 28 }}>
          {title}
        </h3>
        <p className="house-lede" style={{ marginTop: 8 }}>
          {body}
        </p>
        <button type="button" className="house-btn house-btn-primary" style={{ marginTop: 16 }} onClick={dismiss}>
          {t('houseGuideGotIt', { defaultValue: 'Got it' })}
        </button>
      </div>
    </div>
  );
}
