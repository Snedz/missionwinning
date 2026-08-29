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
          className="house-cue-still mx-auto max-h-24 w-full object-contain"
        />
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <p className="house-kicker pt-2">
          {t('activeInSetCues', { defaultValue: 'Cues' })}
        </p>
        <button
          type="button"
          onClick={onHide}
          data-testid="in-set-cues-skip"
          className="house-btn house-btn-ghost min-h-[44px] shrink-0 tap-target"
        >
          {t('activeInSetCuesHide', { defaultValue: 'Hide cues' })}
        </button>
      </div>
      <ul className="space-y-1">
        {lines.map((line) => (
          <li key={line} className="house-cue-line flex gap-2 text-sm">
            <span className="shrink-0 text-foreground">·</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <Link
        href={quietLearnHref()}
        data-testid="in-set-cues-more"
        className="house-btn house-btn-ghost"
      >
        {t('activeInSetCuesMore', { defaultValue: 'More than a rack card' })}
      </Link>
    </div>
  );
}
