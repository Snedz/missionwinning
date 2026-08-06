'use client';

/**
 * Quiet Super Bundle continuity under Victory primary (one boss CTA stays above).
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { VictorySecondaryLink } from '@/lib/workout/victorySecondaryLinks';

type Props = {
  links: VictorySecondaryLink[];
  onNavigate: () => void;
};

export function VictorySecondaryLinks({ links, onNavigate }: Props) {
  const { t } = useTranslation();
  if (!links.length) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"
      data-testid="victory-secondary-links"
    >
      {links.map((link, i) => (
        <span key={link.href} className="inline-flex items-center gap-x-3">
          {i > 0 ? <span aria-hidden>·</span> : null}
          <Link
            href={link.href}
            className="hover:text-foreground underline-offset-2 hover:underline"
            onClick={onNavigate}
          >
            {t(link.labelKey, { defaultValue: link.defaultLabel })}
          </Link>
        </span>
      ))}
    </div>
  );
}
