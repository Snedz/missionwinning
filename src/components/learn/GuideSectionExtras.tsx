/**
 * Shared editorial blocks for guidebook sections (callout / table / checklist).
 * Used by magazine print, public /guide, and in-app /learn/guide.
 */

import type { GuideSection } from '@/data/guidebook/types';

type Variant = 'magazine' | 'app';

type Props = {
  section: Pick<GuideSection, 'callout' | 'table' | 'checklist'>;
  /** magazine = print/PDF cool-paper styles; app = dark UI content-card styles */
  variant?: Variant;
};

export function GuideSectionExtras({ section, variant = 'app' }: Props) {
  const { callout, table, checklist } = section;
  if (!callout && !table && !checklist) return null;

  const root = variant === 'magazine' ? 'magazine-extras' : 'guide-extras';

  return (
    <div className={root}>
      {callout && (
        <aside className={variant === 'magazine' ? 'magazine-callout' : 'guide-callout'}>
          <p className={variant === 'magazine' ? 'eyebrow-live magazine-callout-title' : 'eyebrow-live mb-2'}>
            {callout.title}
          </p>
          <p className={variant === 'magazine' ? 'magazine-callout-body' : 'text-sm leading-relaxed text-foreground/90'}>
            {callout.body}
          </p>
        </aside>
      )}

      {table && (
        <figure className={variant === 'magazine' ? 'magazine-table-wrap' : 'guide-table-wrap'}>
          {table.caption && (
            <figcaption
              className={
                variant === 'magazine'
                  ? 'magazine-table-caption'
                  : 'section-index mb-2 text-muted-foreground'
              }
            >
              {table.caption}
            </figcaption>
          )}
          <div className={variant === 'magazine' ? undefined : 'overflow-x-auto'}>
            <table className={variant === 'magazine' ? 'magazine-table' : 'guide-table'}>
              <thead>
                <tr>
                  {table.headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={`${i}-${j}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      )}

      {checklist && (
        <div className={variant === 'magazine' ? 'magazine-checklist' : 'guide-checklist'}>
          <p
            className={
              variant === 'magazine'
                ? 'magazine-checklist-title'
                : 'section-index mb-2 text-muted-foreground'
            }
          >
            {checklist.title}
          </p>
          <ul>
            {checklist.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
