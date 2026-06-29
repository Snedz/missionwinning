'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MORE_NAV } from '@/lib/navConfig';

interface MoreSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MoreSheet({ open, onClose }: MoreSheetProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/90 backdrop-blur">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{t('navMore', { defaultValue: 'More tools' })}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-emerald-400 font-medium min-h-[44px] px-3"
          >
            Done
          </button>
        </div>
        <ul className="p-3 space-y-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {MORE_NAV.map((item) => {
            const { href, labelKey, label, icon: Icon, descriptionKey, description } = item;
            const military = 'military' in item && item.military;
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 min-h-[52px] transition-colors',
                    active ? 'bg-emerald-600/15 text-emerald-400' : 'hover:bg-muted/60',
                    military && !active && 'border border-amber-800/20'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', military && 'text-amber-600/80')} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{t(labelKey, { defaultValue: label })}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {t(descriptionKey, { defaultValue: description })}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
