import Link from 'next/link';

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
    <header className="border-b border-border/60">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
            MW
          </span>
          <span className="font-display text-lg font-semibold uppercase tracking-wide truncate">
            Mission Winning
          </span>
        </Link>
        <Link
          href={ctaHref}
          className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors min-h-[40px] inline-flex items-center"
        >
          {ctaLabel}
        </Link>
      </div>
      <div className="mx-auto max-w-4xl px-5 pb-10 pt-4">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="display-section mb-4">{title}</h1>
        <p className="max-w-2xl text-muted-foreground leading-relaxed">{subtitle}</p>
      </div>
    </header>
  );
}
