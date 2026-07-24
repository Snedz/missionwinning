/**
 * Shared editorial blocks for guidebook sections (callout / table / checklist / figure).
 * Used by magazine print, public /guide, and in-app /learn/guide.
 */

import type { GuideFigure, GuideSection } from '@/data/guidebook/types';

type Variant = 'magazine' | 'app';

type Props = {
  section: Pick<GuideSection, 'callout' | 'table' | 'checklist' | 'figure'>;
  /** magazine = print/PDF cool-paper styles; app = dark UI content-card styles */
  variant?: Variant;
};

export function GuideFigureBlock({
  figure,
  variant = 'app',
}: {
  figure: GuideFigure;
  variant?: Variant;
}) {
  if (variant === 'magazine') {
    return (
      <figure className="magazine-figure">
        {/* eslint-disable-next-line @next/next/no-img-element -- static guidebook assets */}
        <img src={figure.src} alt={figure.alt} className="magazine-figure-img" />
        {figure.caption && <figcaption className="magazine-figure-caption">{figure.caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-xl border border-border/40 bg-[#0a0c10]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static guidebook assets */}
      <img
        src={figure.src}
        alt={figure.alt}
        loading="lazy"
        decoding="async"
        className="mx-auto w-full max-h-64 object-contain object-center"
      />
      {figure.caption && (
        <figcaption className="border-t border-border/30 px-3 py-1.5 text-center text-xs text-muted-foreground">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function GuideSectionExtras({ section, variant = 'app' }: Props) {
  const { callout, table, checklist, figure } = section;
  if (!callout && !table && !checklist && !figure) return null;

  const root = variant === 'magazine' ? 'magazine-extras' : 'guide-extras';

  return (
    <div className={root}>
      {figure && <GuideFigureBlock figure={figure} variant={variant} />}

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
