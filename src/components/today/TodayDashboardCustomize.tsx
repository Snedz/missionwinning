'use client';

import { ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  TODAY_SECTION_IDS,
  type TodayDashboardPrefs,
  type TodaySectionId,
  moveSection,
  saveTodayDashboardPrefs,
} from '@/lib/todayDashboardPrefs';

type Props = {
  prefs: TodayDashboardPrefs;
  onChange: (prefs: TodayDashboardPrefs) => void;
};

const SECTION_LABEL_KEYS: Record<TodaySectionId, { title: string; defaultTitle: string }> = {
  health: { title: 'todaySectionHealth', defaultTitle: 'Health scores' },
  journal: { title: 'todaySectionJournal', defaultTitle: 'Journal' },
  week: { title: 'todaySectionWeek', defaultTitle: 'This week' },
  progress: { title: 'todaySectionProgress', defaultTitle: 'Progress & tools' },
};

export function TodayDashboardCustomize({ prefs, onChange }: Props) {
  const { t } = useTranslation();

  const persist = (next: TodayDashboardPrefs) => {
    saveTodayDashboardPrefs(next);
    onChange(next);
  };

  const toggle = (id: TodaySectionId) => {
    const visibleCount = TODAY_SECTION_IDS.filter((sid) => prefs[sid]).length;
    if (prefs[id] && visibleCount <= 1) return;
    persist({ ...prefs, [id]: !prefs[id] });
  };

  const reorder = (id: TodaySectionId, direction: 'up' | 'down') => {
    persist(moveSection(prefs, id, direction));
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <LayoutGrid className="h-4 w-4 text-primary" />
        {t('todayCustomizeTitle', { defaultValue: 'Customize Today' })}
      </div>
      <p className="text-xs text-muted-foreground">
        {t('todayCustomizeDesc', {
          defaultValue: 'Choose which sections appear below and their order. Saved on this device.',
        })}
      </p>
      <div className="space-y-1.5 pt-1">
        {prefs.order.map((id, idx) => {
          const { title, defaultTitle } = SECTION_LABEL_KEYS[id];
          const on = prefs[id];
          return (
            <div
              key={id}
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-2 py-1.5"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label={t('todayMoveSectionUp', { defaultValue: 'Move up' })}
                  disabled={idx === 0}
                  onClick={() => reorder(id, 'up')}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={t('todayMoveSectionDown', { defaultValue: 'Move down' })}
                  disabled={idx === prefs.order.length - 1}
                  onClick={() => reorder(id, 'down')}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => toggle(id)}
                className={`flex-1 px-3 py-1.5 text-xs font-semibold border transition-colors min-h-[36px] text-left ${
                  on
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'bg-muted/30 border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                {t(title, { defaultValue: defaultTitle })}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
