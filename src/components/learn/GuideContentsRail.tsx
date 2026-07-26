'use client';

/**
 * Expandable Contents rail for public Beyond the Basics (GT Apex–style TOC).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GuideChapter } from '@/data/guidebook/types';
import { cn } from '@/lib/utils';

type Props = {
  chapters: GuideChapter[];
  activeChapterId?: string;
  className?: string;
  /** Called when a link is clicked (e.g. close mobile sheet). */
  onNavigate?: () => void;
};

export function GuideContentsRail({
  chapters,
  activeChapterId,
  className,
  onNavigate,
}: Props) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(activeChapterId ?? chapters[0]?.id ?? null);

  useEffect(() => {
    if (activeChapterId) setOpenId(activeChapterId);
  }, [activeChapterId]);

  return (
    <nav
      className={cn('space-y-1', className)}
      aria-label={t('magazineContents', { defaultValue: 'Contents' })}
    >
      <p className="eyebrow mb-3">{t('magazineContents', { defaultValue: 'Contents' })}</p>
      <ul className="space-y-1">
        {chapters.map((ch) => {
          const open = openId === ch.id;
          const active = activeChapterId === ch.id;
          return (
            <li key={ch.id} className="border-b border-border last:border-0">
              <button
                type="button"
                className={cn(
                  'flex w-full items-start gap-2 py-3 text-left text-sm transition-colors',
                  active ? 'text-primary' : 'text-foreground hover:text-primary'
                )}
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : ch.id)}
              >
                <span className="section-index mt-0.5 shrink-0 tabular-nums">
                  {String(ch.number).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 font-display text-[13px] font-semibold uppercase leading-snug tracking-wide">
                  {ch.title}
                </span>
                <ChevronDown
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                    open && 'rotate-180'
                  )}
                  aria-hidden
                />
              </button>
              {open && (
                <ul className="mb-3 space-y-1 border-l border-border pl-3 ml-6">
                  <li>
                    <Link
                      href={`/guide/${ch.id}`}
                      className={cn(
                        'block py-1 text-xs hover:text-primary',
                        active ? 'text-primary' : 'text-muted-foreground'
                      )}
                      onClick={onNavigate}
                    >
                      {t('magazineChapterOverview', { defaultValue: 'Chapter overview' })}
                    </Link>
                  </li>
                  {ch.sections.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/guide/${ch.id}#${s.id}`}
                        className="block py-1 text-xs text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          onNavigate?.();
                          if (
                            typeof window !== 'undefined' &&
                            window.location.pathname === `/guide/${ch.id}`
                          ) {
                            const el = document.getElementById(s.id);
                            if (el) {
                              e.preventDefault();
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              window.history.replaceState(null, '', `#${s.id}`);
                            }
                          }
                        }}
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
