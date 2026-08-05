'use client';
/**
 * Page: /join/class/[code] — student class join
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * `.462`: this is a shareable link a teacher writes on a whiteboard, and it
 * rendered a bare unstyled div — and on a bad code it silently redirected to
 * /america, which answers a question nobody asked. Branded joining state,
 * and a failed code now says so, with the one hint that helps.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { ErrorState } from '@/components/ui/ErrorState';
import { joinClass } from '@/lib/schoolClass';
import { track } from '@/lib/analytics';

type Props = {
  code: string;
};

export function JoinClassPage({ code }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const joined = joinClass(code);
    if (joined) {
      track('class_joined', { code: String(joined).slice(0, 32) });
      router.replace(`/fitness-test?class=${joined}`);
    } else {
      setFailed(true);
    }
  }, [code, router]);

  if (failed) {
    return (
      <div className="mx-auto min-h-[60vh] max-w-md px-5 pt-16">
        <ErrorState
          title={t('joinClassFailedTitle', { defaultValue: 'That class code did not work' })}
          description={t('joinClassFailedDesc', {
            defaultValue:
              'Check the code with your teacher — codes are short letter-number combinations. Nothing was saved.',
          })}
          actionLabel={t('joinClassFailedHome', { defaultValue: 'Go to Today' })}
          onAction={() => router.replace('/log')}
        />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      aria-busy="true"
    >
      <BrandMonogram className="h-12 w-12 text-lg" />
      <p role="status" className="text-sm text-muted-foreground">
        {t('joinClassJoining', { defaultValue: 'Joining class…' })}
      </p>
    </div>
  );
}
