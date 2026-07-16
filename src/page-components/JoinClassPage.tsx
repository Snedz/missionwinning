'use client';
/**
 * Page: /join/class/[code] — student class join
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { joinClass } from '@/lib/schoolClass';
import { track } from '@/lib/analytics';

type Props = {
  code: string;
};

export function JoinClassPage({ code }: Props) {
  const router = useRouter();

  useEffect(() => {
    const joined = joinClass(code);
    if (joined) {
      track('class_joined', { code: String(joined).slice(0, 32) });
    }
    router.replace(joined ? `/fitness-test?class=${joined}` : '/america');
  }, [code, router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
      Joining class…
    </div>
  );
}
