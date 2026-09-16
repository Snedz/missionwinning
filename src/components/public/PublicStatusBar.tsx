/**
 * The one-line status strip above the public chrome.
 *
 * Ink, not red. Server Component: `PublicPageShell` covers SEO URLs and
 * is English-only by construction; this bar does not hydrate.
 */

import { APP_PUBLIC_STATUS_LINE_EN } from '@/lib/buildInfo';
import { isFreeBeta } from '@/lib/freeBeta';

type Props = {
  /** Translated label. Defaults to English for the server-rendered SEO shell. */
  label?: string;
};

export function PublicStatusBar({ label }: Props) {
  // Nothing to announce once the beta ends — the bar disappears with the fact,
  // rather than becoming a slot that has to be filled.
  if (!isFreeBeta()) return null;

  return (
    <div className="bg-neutral-900 text-neutral-100">
      <p className="mx-auto max-w-6xl px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em]">
        {label ?? APP_PUBLIC_STATUS_LINE_EN}
      </p>
    </div>
  );
}
