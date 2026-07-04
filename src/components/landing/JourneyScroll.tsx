'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANDING_JOURNEY_KEYS } from '@/i18n/landingLocales';
import { cn } from '@/lib/utils';

export function JourneyScroll() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const cards = root.querySelectorAll('[data-journey-step]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).dataset.journeyStep;
          if (id && e.isIntersecting) {
            setVisible((v) => ({ ...v, [id]: true }));
          }
        });
      },
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="path" className="border-b border-border/60" ref={sectionRef}>
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="briefing-rule mb-4">
          <span className="eyebrow">{t('landingJourneyTitle', { defaultValue: 'The member path' })}</span>
        </div>
        <h2 className="display-section mb-4">
          A clear beginning.
          <br className="sm:hidden" /> One step at a time.
        </h2>
        <p className="mb-10 max-w-xl text-muted-foreground">
          Borrowed from academy onboarding: you always know exactly where you are and what comes
          next. No wall of features on day one.
        </p>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60 hidden sm:block" aria-hidden />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:pl-8">
            {LANDING_JOURNEY_KEYS.map((p, i) => (
              <div
                key={p.phase}
                data-journey-step={p.phase}
                className={cn(
                  'content-card p-5 transition-all duration-500',
                  visible[p.phase] !== false && 'opacity-100 translate-y-0',
                  visible[p.phase] === undefined && 'opacity-70 translate-y-2',
                  visible[p.phase] && 'journey-enter'
                )}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <p className="eyebrow-live mb-3">{p.phase}</p>
                <h3 className="font-display mb-2 text-2xl font-semibold uppercase leading-none">
                  {t(p.nameKey)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(p.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
