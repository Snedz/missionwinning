'use client';

/**
 * First-run coach-mark. Pointer + title + body + Got it + X.
 * Checklist lives under This week and never owns Start.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { isHouseTodayPath } from './houseNav';

type Step = 'rail' | 'start';

export function HouseGuide() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step | null>(null);

  useEffect(() => {
    if (!isHouseTodayPath(pathname)) {
      setStep(null);
      return;
    }
    if (readRaw(STORAGE_KEYS.houseGuideDismissed) === '1') {
      setStep(null);
      return;
    }
    const id = window.setTimeout(() => {
      const ready = document.querySelector('[data-testid="today-start-ready"]');
      const rail = document.querySelector('[data-testid="house-second-rail"]');
      if (ready && rail) setStep('rail');
    }, 40);
    return () => window.clearTimeout(id);
  }, [pathname]);

  if (!step) return null;

  const railStep = step === 'rail';
  const title = railStep
    ? t('houseGuideRailTitle', { defaultValue: 'Your week lives here' })
    : t('houseGuideStartTitle', { defaultValue: 'Start the session' });
  const body = railStep
    ? t('houseGuideRailBody', {
        defaultValue: 'Start, this week, History, and Weekly plan sit next to the icons.',
      })
    : t('houseGuideStartBody', {
        defaultValue: 'One tap opens Train.',
      });

  const dismiss = () => {
    writeRaw(STORAGE_KEYS.houseGuideDismissed, '1');
    setStep(null);
  };

  const next = () => {
    if (railStep) {
      setStep('start');
      return;
    }
    dismiss();
  };

  return (
    <div
      className={`house-guide is-${step}`}
      data-testid="house-guide"
      data-house-guide-step={step}
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
        <button type="button" className="house-btn house-btn-primary" style={{ marginTop: 16 }} onClick={next}>
          {t('houseGuideGotIt', { defaultValue: 'Got it' })}
        </button>
      </div>
    </div>
  );
}
