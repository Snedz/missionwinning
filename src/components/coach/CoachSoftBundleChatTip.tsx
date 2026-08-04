'use client';

/**
 * Soft Bundle tip under Coach chat for non–free-beta — never a brass paywall (.437).
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { isFreeBeta } from '@/lib/freeBeta';

export function CoachSoftBundleChatTip({ className }: { className?: string }) {
  const { t } = useTranslation();
  if (isFreeBeta()) return null;
  return (
    <p
      className={cn('text-center text-xs text-muted-foreground px-1', className)}
      data-testid="coach-chat-soft-tip"
    >
      {t('coachChatSoftTip', {
        defaultValue: 'Want to ask the coach anything? Chat is Super Bundle.',
      })}{' '}
      <Link href="/bundle" className="text-primary hover:underline">
        {t('coachUnlockBundle', { defaultValue: 'Unlock Super Bundle' })}
      </Link>
    </p>
  );
}
