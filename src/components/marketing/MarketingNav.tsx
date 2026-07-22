'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MarketingNavProps = {
  /** full = landing anchors + bundle; compact = logo + primary CTA only */
  variant?: 'full' | 'compact';
  className?: string;
};

export function MarketingNav({ variant = 'full', className }: MarketingNavProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <nav
      className={cn(
        'glass-nav sticky top-0 z-50 section-seam',
        className
      )}
    >
      <div className="relative z-[1] mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
            MW
          </span>
          <span className="font-display text-xl font-semibold uppercase tracking-wide">
            Mission Winning
          </span>
        </Link>

        {variant === 'full' ? (
          <div className="hidden items-center gap-6 text-sm sm:flex">
            <a
              href="/#coach"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('landingNavCoach', { defaultValue: 'Coach' })}
            </a>
            <Link
              href="/bundle"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('landingNavBundle', { defaultValue: 'Super Bundle' })}
            </Link>
          </div>
        ) : (
          <Link
            href="/"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            {t('landingNavHome', { defaultValue: 'Home' })}
          </Link>
        )}

        <Button
          variant="ghost"
          onClick={() => router.push('/welcome')}
          className="tap-target text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {t('landingNavStart', { defaultValue: 'Start free' })}
        </Button>
      </div>
    </nav>
  );
}
