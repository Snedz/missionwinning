'use client';

/**
 * One catalog, two rooms. Library is browse; Builder is write.
 * Not Explore. Not a shop.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function CatalogLoopTabs({ active }: { active: 'library' | 'builder' }) {
  const { t } = useTranslation();
  const tabs = [
    {
      id: 'library' as const,
      href: '/library',
      label: t('navLibrary', { defaultValue: 'Library' }),
    },
    {
      id: 'builder' as const,
      href: '/builder',
      label: t('navBuilder', { defaultValue: 'Builder' }),
    },
  ];

  return (
    <nav
      aria-label={t('navGroupCatalog', { defaultValue: 'Catalog' })}
      data-testid="catalog-loop-tabs"
      className="flex border-2 border-border"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex min-h-[44px] flex-1 items-center justify-center px-3 text-sm font-semibold',
              isActive
                ? 'is-active-tab bg-muted text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
