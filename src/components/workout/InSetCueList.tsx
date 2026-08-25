'use client';

/**
 * Short written cues on the open live exercise (`.973`).
 * Quiet ink — Log set owns poster red. Hide never blocks logging.
 * Optional still only from media we already have. Not a clip marketplace.
 * Quiet Learn link when they want more than a rack card (`.978`).
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { quietLearnHref } from '@/lib/quietLearn';

type Props = {
  lines: string[];
  stillUrl: string | null;
  exerciseName: string;
  onHide: () => void;
};

export function InSetCueList({ lines, stillUrl, exerciseName, onHide }: Props) {
  const { t } = useTranslation();

  if (lines.length === 0) return null;

  return (
    <div className="space-y-2" data-testid="in-set-cues">
      {stillUrl ? (
        <img
          src={stillUrl}
          alt={t('activeInSetCuesDemoAlt', {
            name: exerciseName,
            defaultValue: '{{name}} setup',
          })}
          loading="lazy"
          decoding="async"
          data-testid="in-set-cues-demo"
          className="mx-auto max-h-24 w-full object-contain bg-background"
        />
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <p className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('activeInSetCues', { defaultValue: 'Cues' })}
        </p>
        <button
          type="button"
          onClick={onHide}
          data-testid="in-set-cues-skip"
          className="min-h-[44px] shrink-0 border-2 border-border px-2 text-[11px] font-semibold text-foreground tap-target hover:bg-muted"
        >
          {t('activeInSetCuesHide', { defaultValue: 'Hide cues' })}
        </button>
      </div>
      <ul className="space-y-1">
        {lines.map((line) => (
          <li key={line} className="flex gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 text-foreground">·</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <Link
        href={quietLearnHref()}
        data-testid="in-set-cues-more"
        className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground underline underline-offset-2 tap-target"
      >
        {t('activeInSetCuesMore', { defaultValue: 'More than a rack card' })}
      </Link>
    </div>
  );
}
