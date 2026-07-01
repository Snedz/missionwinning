'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { FoodSearchItem } from '@/lib/foodSearch';

type Props = {
  onSelect: (item: FoodSearchItem) => void;
};

export function FoodSearchBar({ onSelect }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<FoodSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setItems([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/fuel/search-food?q=${encodeURIComponent(q.trim())}`);
      const data = (await res.json()) as { items?: FoodSearchItem[]; error?: string };
      if (!res.ok) {
        setItems([]);
        setError(
          t('fuelSearchUnavailable', {
            defaultValue: 'Food search temporarily unavailable. Use quick-add or manual log.',
          })
        );
        return;
      }
      setItems(data.items ?? []);
      if ((data.items?.length ?? 0) === 0) {
        setError(t('fuelSearchEmpty', { defaultValue: 'No matches — try a simpler name.' }));
      }
    } catch {
      setItems([]);
      setError(t('fuelSearchUnavailable', { defaultValue: 'Food search temporarily unavailable.' }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('fuelSearchPlaceholder', {
            defaultValue: 'Search foods (global database)…',
          })}
          className="pl-9"
          autoComplete="off"
        />
      </div>
      {loading && (
        <p className="text-xs text-muted-foreground">
          {t('fuelSearchLoading', { defaultValue: 'Searching…' })}
        </p>
      )}
      {error && !loading && <p className="text-xs text-muted-foreground">{error}</p>}
      {items.length > 0 && (
        <ul className="rounded-xl border border-border/50 divide-y divide-border/40 overflow-hidden max-h-56 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 hover:bg-emerald-950/30 transition-colors min-h-[44px]"
                onClick={() => {
                  onSelect(item);
                  setQuery('');
                  setItems([]);
                }}
              >
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.brand ? `${item.brand} · ` : ''}
                  {item.protein}g P · {item.calories} kcal
                  {item.servingLabel ? ` · ${item.servingLabel}` : ''}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-muted-foreground/70">
        {t('fuelSearchCredit', {
          defaultValue: 'Powered by Open Food Facts — community database, edit portions after adding.',
        })}
      </p>
    </div>
  );
}
