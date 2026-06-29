'use client';

import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  type TodayDashboardPrefs,
  type TodaySectionId,
  saveTodayDashboardPrefs,
} from '@/lib/todayDashboardPrefs';

type Props = {
  prefs: TodayDashboardPrefs;
  onChange: (prefs: TodayDashboardPrefs) => void;
};

const SECTION_LABEL_KEYS: Record<TodaySectionId, { title: string; defaultTitle: string }> = {
  health: { title: 'todaySectionHealth', defaultTitle: 'Health scores' },
  week: { title: 'todaySectionWeek', defaultTitle: 'This week' },
  progress: { title: 'todaySectionProgress', defaultTitle: 'Progress & tools' },
};

export function TodayDashboardCustomize({ prefs, onChange }: Props) {
  const { t } = useTranslation();

  const toggle = (id: TodaySectionId) => {
    const visibleCount = Object.values(prefs).filter(Boolean).length;
    if (prefs[id] && visibleCount <= 1) return;
    const next = { ...prefs, [id]: !prefs[id] };
    saveTodayDashboardPrefs(next);
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <LayoutGrid className="h-4 w-4 text-emerald-400" />
        {t('todayCustomizeTitle', { defaultValue: 'Customize Today' })}
      </div>
      <p className="text-xs text-muted-foreground">
        {t('todayCustomizeDesc', { defaultValue: 'Choose which sections appear below. Saved on this device.' })}
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {(Object.keys(SECTION_LABEL_KEYS) as TodaySectionId[]).map((id) => {
          const { title, defaultTitle } = SECTION_LABEL_KEYS[id];
          const on = prefs[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors min-h-[36px] ${
                on
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-muted/30 border-border text-muted-foreground hover:border-border/80'
              }`}
            >
              {t(title, { defaultValue: defaultTitle })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
