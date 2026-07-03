'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';

type InfoPageFooterProps = {
  showLegal?: boolean;
  showToday?: boolean;
  showBundle?: boolean;
  todayLabel?: string;
  className?: string;
};

export function InfoPageFooter({
  showLegal = true,
  showToday = false,
  showBundle = false,
  todayLabel = 'Today',
  className = '',
}: InfoPageFooterProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {showLegal && <AppLegalFooter className="py-0" />}
      <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
        {showToday && (
          <Button asChild variant="outline" size="sm">
            <Link href="/log">{todayLabel}</Link>
          </Button>
        )}
        {showBundle && (
          <Button asChild variant="fitness" size="sm">
            <Link href="/bundle">Super Bundle</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
