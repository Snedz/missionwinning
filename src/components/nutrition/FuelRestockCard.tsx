'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { NutritionLogRow } from '@/lib/nutritionQuickLog';
import {
  assembleRestockList,
  formatRestockExport,
  saveFuelRestockExtras,
  type RestockRecipe,
} from '@/lib/fuelRestock';

type Props = {
  logs: NutritionLogRow[];
  todayIso: string;
  weekStart: string;
  recipes: RestockRecipe[];
  initialTypedText: string;
};

export function FuelRestockCard({
  logs,
  todayIso,
  weekStart,
  recipes,
  initialTypedText,
}: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [typedText, setTypedText] = useState(initialTypedText);

  const items = useMemo(
    () =>
      assembleRestockList({
        logs,
        todayIso,
        weekStart,
        typedText,
        recipes,
      }),
    [logs, todayIso, weekStart, typedText, recipes]
  );

  const title = t('fuelRestockTitle', { defaultValue: "This week's restock" });
  const footer = t('fuelRestockYouShop', {
    defaultValue: 'You shop. We do not order.',
  });
  const exportText = formatRestockExport({ items, title, footer });

  const handleTypedChange = (next: string) => {
    setTypedText(next);
    saveFuelRestockExtras(next);
  };

  const handleCopy = async () => {
    if (!exportText) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard');
      await navigator.clipboard.writeText(exportText);
      toast({
        title: t('fuelRestockCopied', { defaultValue: 'Copied' }),
        description: footer,
      });
    } catch {
      toast({
        title: t('fuelRestockCopyFailed', {
          defaultValue: 'Copy failed — select the list.',
        }),
      });
    }
  };

  const handleDownload = () => {
    if (!exportText) return;
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fuel-restock.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-testid="fuel-restock"
      className="border-2 border-border bg-card px-3 py-3 space-y-3"
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('fuelRestockHint', {
            defaultValue:
              "From this week's Fuel log. Copy it. You shop. We do not order.",
          })}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('fuelRestockEmpty', {
            defaultValue:
              'Log meals this week, or type what you need. Empty invents nothing.',
          })}
        </p>
      ) : (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">
          {items.map((item) => (
            <li key={item.name.toLowerCase()}>
              {item.name}
              {item.times > 1
                ? ` ${t('fuelRestockTimes', {
                    count: item.times,
                    defaultValue: '×{{count}}',
                  })}`
                : null}
            </li>
          ))}
        </ol>
      )}

      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          {t('fuelRestockTypedLabel', { defaultValue: 'Add what you need' })}
        </span>
        <textarea
          data-testid="fuel-restock-extras"
          value={typedText}
          onChange={(e) => handleTypedChange(e.target.value)}
          rows={3}
          className="w-full resize-y border-2 border-border bg-background px-3 py-2 text-sm text-foreground"
          placeholder={t('fuelRestockTypedPlaceholder', {
            defaultValue: 'eggs, oats, chicken…',
          })}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-[44px] tap-target"
          data-testid="fuel-restock-copy"
          disabled={!exportText}
          onClick={() => void handleCopy()}
        >
          {t('fuelRestockCopy', { defaultValue: 'Copy list' })}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-[44px] tap-target"
          data-testid="fuel-restock-download"
          disabled={!exportText}
          onClick={handleDownload}
        >
          {t('fuelRestockDownload', { defaultValue: 'Download list' })}
        </Button>
      </div>

      {items.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {t('fuelRestockCount', {
            count: items.length,
            defaultValue: '{{count}} items',
          })}
          {' · '}
          {footer}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">{footer}</p>
      )}
    </div>
  );
}
