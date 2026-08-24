'use client';

/**
 * After-complete next-set cite on the live set table (.934).
 * Quiet ink — Log set owns poster red. Skip never blocks logging.
 * Not a feed. Not a paywall. Not a door name.
 */

import { useTranslation } from 'react-i18next';

type Props = {
  target: string;
  provenance: string;
  onSkip: () => void;
};

export function SetLogNextCite({ target, provenance, onSkip }: Props) {
  const { t } = useTranslation();
  const line = provenance ? `${target} · ${provenance}` : target;
  return (
    <div
      className="flex min-w-0 items-center justify-between gap-2"
      data-testid="set-table-next-cite"
    >
      <p
        className="min-w-0 truncate text-[11px] tabular-nums text-muted-foreground"
        data-testid="set-table-next-cite-line"
        aria-label={t('activeNextCiteAria', {
          line,
          defaultValue: 'Next from your logs: {{line}}',
        })}
      >
        <span data-testid="set-table-next-cite-target">{target}</span>
        {provenance ? (
          <>
            {' · '}
            <span data-testid="set-table-next-cite-from">{provenance}</span>
          </>
        ) : null}
      </p>
      <button
        type="button"
        onClick={onSkip}
        data-testid="set-table-next-cite-skip"
        className="min-h-[44px] shrink-0 border-2 border-border px-2 text-[11px] font-semibold text-foreground tap-target hover:bg-muted"
      >
        {t('activeNextCiteSkip', { defaultValue: 'Skip' })}
      </button>
    </div>
  );
}
