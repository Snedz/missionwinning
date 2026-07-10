'use client';

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { cn } from '@/lib/utils';

type InfoPageShellProps = {
  icon: LucideIcon;
  /** Briefing eyebrow above the display title. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  variant?: 'single' | 'sections';
  children: React.ReactNode;
  showLegalFooter?: boolean;
  footer?: React.ReactNode;
  jumpLinks?: { id: string; label: string }[];
  className?: string;
  iconClassName?: string;
};

export function InfoSection({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('space-y-3 scroll-mt-24', className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function InfoPageShell({
  icon,
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  variant = 'single',
  children,
  showLegalFooter = false,
  footer,
  jumpLinks,
  className,
  iconClassName,
}: InfoPageShellProps) {
  const headerSubtitle = [subtitle, lastUpdated].filter(Boolean).join(' · ');

  return (
    <StaggerGroup className={cn('space-y-6', className)}>
      <StaggerItem index={0}>
        <PillarPageHeader
          icon={icon}
          eyebrow={eyebrow}
          title={title}
          subtitle={headerSubtitle}
          iconClassName={iconClassName}
        />
      </StaggerItem>

      {jumpLinks && jumpLinks.length > 0 && (
        <StaggerItem index={1}>
          <nav className="flex gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            {jumpLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="shrink-0 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </StaggerItem>
      )}

      {variant === 'single' ? (
        <StaggerItem index={jumpLinks ? 2 : 1}>
          <Card className="content-card">
            <CardContent className="pt-6 space-y-6 text-sm leading-relaxed">{children}</CardContent>
          </Card>
        </StaggerItem>
      ) : (
        <div className="space-y-6">{children}</div>
      )}

      {(footer || showLegalFooter) && (
        <StaggerItem index={jumpLinks ? 3 : variant === 'single' ? 2 : 1}>
          {footer ?? <AppLegalFooter />}
        </StaggerItem>
      )}
    </StaggerGroup>
  );
}
