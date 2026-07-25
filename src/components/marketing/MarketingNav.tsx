'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isFreeBeta } from '@/lib/freeBeta';

type MarketingNavProps = {
  /** full = landing anchors + bundle; compact = logo + primary CTA only */
  variant?: 'full' | 'compact';
  className?: string;
};

export function MarketingNav({ variant = 'full', className }: MarketingNavProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const freeBeta = isFreeBeta();

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80',
        className
      )}
    >
      <div className="relative z-[1] mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground sm:h-9 sm:w-9">
            MW
          </span>
          <span className="truncate font-display text-lg font-bold uppercase tracking-wide sm:text-xl">
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
            {!freeBeta && (
              <Link
                href="/bundle"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('landingNavBundle', { defaultValue: 'Super Bundle' })}
              </Link>
            )}
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
          className="tap-target text-sm font-medium text-foreground hover:text-foreground"
        >
          {t('landingNavStart', { defaultValue: 'Start free' })}
        </Button>
      </div>
    </nav>
  );
}
