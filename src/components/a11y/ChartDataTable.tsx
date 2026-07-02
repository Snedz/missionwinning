'use client';

import { useTranslation } from 'react-i18next';

export type ChartDataColumn<T extends object> = {
  key: keyof T & string;
  header: string;
  format?: (value: T[keyof T], row: T) => string;
};

type Props<T extends object> = {
  caption: string;
  columns: ChartDataColumn<T>[];
  rows: T[];
  id?: string;
};

/** Screen-reader accessible data table alternative to Recharts visuals. */
export function ChartDataTable<T extends object>({
  caption,
  columns,
  rows,
  id,
}: Props<T>) {
  const { t } = useTranslation();
  if (rows.length === 0) return null;

  return (
    <details className="mt-3 group">
      <summary className="text-xs text-muted-foreground cursor-pointer list-none flex items-center gap-1 min-h-[44px]">
        <span className="underline decoration-dotted">
          {t('chartDataTableToggle', { defaultValue: 'View chart data table (accessibility)' })}
        </span>
      </summary>
      <div className="overflow-x-auto mt-2 rounded-md border border-border">
        <table id={id} className="w-full text-xs" role="table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-2 py-2 text-left font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                {columns.map((col) => {
                  const raw = row[col.key];
                  const text = col.format ? col.format(raw, row) : String(raw ?? '—');
                  return (
                    <td key={col.key} className="px-2 py-1.5 tabular-nums">
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
