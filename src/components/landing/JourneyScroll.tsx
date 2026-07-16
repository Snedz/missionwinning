'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANDING_JOURNEY_KEYS } from '@/i18n/landingLocales';
import { cn } from '@/lib/utils';

export function JourneyScroll() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
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
            const idx = LANDING_JOURNEY_KEYS.findIndex((p) => p.phase === id);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="path" className="section-seam" ref={sectionRef}>
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:items-start">
          {/* Sticky rail on large screens */}
          <div className="mb-10 lg:sticky lg:top-24 lg:mb-0">
            <div className="briefing-rule mb-4">
              <span className="eyebrow">
                {t('landingJourneyTitle', { defaultValue: 'The member path' })}
              </span>
            </div>
            <h2 className="display-section mb-4">
              {t('landingJourneyHeadline1', { defaultValue: 'A clear beginning.' })}
              <br className="sm:hidden" />{' '}
              {t('landingJourneyHeadline2', { defaultValue: 'One step at a time.' })}
            </h2>
            <p className="mb-6 max-w-xl text-muted-foreground">
              {t('landingJourneyBody', {
                defaultValue:
                  'Borrowed from academy onboarding: you always know exactly where you are and what comes next. No wall of features on day one.',
              })}
            </p>
            <ol className="hidden space-y-2 lg:block" aria-hidden>
              {LANDING_JOURNEY_KEYS.map((p, i) => (
                <li
                  key={p.phase}
                  className={cn(
                    'flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors',
                    i === active ? 'text-primary' : 'text-muted-foreground/60'
                  )}
                >
                  <span className="tabular-nums">{String(i).padStart(2, '0')}</span>
                  <span className="h-px w-6 bg-current opacity-50" />
                  <span>{t(p.nameKey)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative">
            <div
              className="absolute left-4 top-0 bottom-0 w-px bg-border/60 hidden sm:block lg:left-0"
              aria-hidden
            />
            <div className="grid gap-4 sm:grid-cols-2 sm:pl-8 lg:grid-cols-1 lg:pl-8">
              {LANDING_JOURNEY_KEYS.map((p, i) => (
                <div
                  key={p.phase}
                  data-journey-step={p.phase}
                  className={cn(
                    'card-elevated p-5 transition-all duration-500',
                    visible[p.phase] !== false && 'opacity-100 translate-y-0',
                    visible[p.phase] === undefined && 'opacity-70 translate-y-2',
                    visible[p.phase] && 'journey-enter',
                    i === active && 'card-glow-emerald'
                  )}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="section-index">{String(i).padStart(2, '0')}</span>
                    <h3 className="font-display text-xl font-semibold uppercase leading-none">
                      {t(p.nameKey)}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(p.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
