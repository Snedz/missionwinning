'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NutritionLogRow } from '@/lib/nutritionQuickLog';

type Props = {
  logs: NutritionLogRow[];
  todayIso: string;
  onCopyDayToToday: (rows: NutritionLogRow[]) => void;
};

/**
 * Browse recent past days (read-only) and copy a day onto today.
 */
export function FuelPastDaysCard({ logs, todayIso, onCopyDayToToday }: Props) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const byDate = useMemo(() => {
    const map = new Map<string, NutritionLogRow[]>();
    for (const row of logs) {
      if (!row.date || row.date === todayIso) continue;
      const list = map.get(row.date) ?? [];
      list.push(row);
      map.set(row.date, list);
    }
    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 14);
  }, [logs, todayIso]);

  if (byDate.length === 0) return null;

  return (
    <Card className="bg-card">
      <CardHeader className="py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-start"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <CardTitle className="text-base font-semibold">
            {t('fuelPastDaysTitle', { defaultValue: 'Past days' })}
          </CardTitle>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            {t('fuelPastDaysCount', {
              count: byDate.length,
              defaultValue: `${byDate.length} days with logs`,
            })}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </span>
        </button>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-3 pt-0">
          {byDate.map(([date, rows]) => {
            const protein = rows.reduce((s, r) => s + (r.protein || 0), 0);
            const cals = rows.reduce((s, r) => s + (r.cals || 0), 0);
            const label = new Date(`${date}T12:00:00`).toLocaleDateString(i18n.language, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            return (
              <details
                key={date}
                className="border-2 border-border px-3 py-2"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 min-h-[40px] [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-medium">
                    {label}
                    <span className="ms-2 text-xs font-normal text-muted-foreground tabular-nums">
                      {rows.length} · {protein}g P · {cals} kcal
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </summary>
                <ul className="mt-2 space-y-1 border-t border-border pt-2 text-sm">
                  {rows.map((r, i) => (
                    <li
                      key={`${date}-${i}-${r.name}`}
                      className="flex justify-between gap-2 text-muted-foreground"
                    >
                      <span className="truncate min-w-0">{r.name}</span>
                      <span className="tabular-nums shrink-0 text-xs">
                        {r.protein}g · {r.cals} kcal
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2 w-full sm:w-auto"
                  onClick={() => onCopyDayToToday(rows)}
                >
                  {t('fuelCopyDayToToday', {
                    defaultValue: 'Copy to today',
                  })}
                </Button>
              </details>
            );
          })}
        </CardContent>
      ) : null}
    </Card>
  );
}
