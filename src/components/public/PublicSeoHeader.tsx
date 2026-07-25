import Link from 'next/link';
import { BrandMonogram } from '@/components/brand/BrandMonogram';

type PublicSeoHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Primary conversion CTA — defaults to Start free → /welcome */
  ctaHref?: string;
  ctaLabel?: string;
};

/** Shared marketing chrome for public SEO + conversion pages. */
export function PublicSeoHeader({
  eyebrow,
  title,
  subtitle,
  ctaHref = '/welcome',
  ctaLabel = 'Start free',
}: PublicSeoHeaderProps) {
  return (
    <header className="relative border-b border-border/40 bg-background">
      <div className="relative z-[1] mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <BrandMonogram />
          <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
            Mission Winning
          </span>
        </Link>
        <Link
          href={ctaHref}
          className="inline-flex min-h-[40px] shrink-0 items-center rounded-xl bg-primary-fill px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-fill-hover"
        >
          {ctaLabel}
        </Link>
      </div>
      <div className="relative z-[1] mx-auto max-w-4xl px-5 pb-10 pt-4">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground">{eyebrow}</p>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight leading-tight sm:text-3xl md:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  );
}
