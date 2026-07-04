'use client';

import type { LucideIcon } from 'lucide-react';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { cn } from '@/lib/utils';

type PillarPageShellProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  showLegalFooter?: boolean;
  footer?: React.ReactNode;
  className?: string;
};

export function PillarPageShell({
  icon,
  title,
  subtitle = '',
  children,
  headerActions,
  showLegalFooter = false,
  footer,
  className,
}: PillarPageShellProps) {
  return (
    <StaggerGroup className={cn('space-y-6', className)}>
      <StaggerItem index={0}>
        {headerActions ? (
          <div className="flex items-start justify-between gap-4">
            <PillarPageHeader
              icon={icon}
              title={title}
              subtitle={subtitle}
              className="flex-1 min-w-0"
            />
            {headerActions}
          </div>
        ) : (
          <PillarPageHeader icon={icon} title={title} subtitle={subtitle} />
        )}
      </StaggerItem>

      <div className="space-y-6">{children}</div>

      {(footer || showLegalFooter) && (
        <StaggerItem index={1}>
          {footer ?? <AppLegalFooter />}
        </StaggerItem>
      )}
    </StaggerGroup>
  );
}
