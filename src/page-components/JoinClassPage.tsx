'use client';
/**
 * Page: /join/class/[code] — student class join
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * A link a teacher writes on a whiteboard, and it rendered an unstyled line of
 * muted text — then, on a code that did not parse, silently redirected to the
 * America home, which answers a question nobody asked. Branded joining state
 * now, and a failed code says so with the one hint that helps. The success
 * path is unchanged: `americaHomeOrFallback()` is only the *failure* target
 * being replaced, not the join itself.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { ErrorState } from '@/components/ui/ErrorState';
import { joinClass } from '@/lib/schoolClass';
import { track } from '@/lib/analytics';

type Props = {
  code: string;
};

export function JoinClassPage({ code }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
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
        {t('joinClassLoading', { defaultValue: 'Joining class…' })}
      </p>
    </div>
  );
}
