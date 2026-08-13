/**
 * The one-line status strip above the public chrome.
 *
 * `.240` — the reference app for this wave runs an announcement bar across the
 * top of every page ("BIRTHDAY SALE · JULY 30 — AUG 9"). The *placement* is
 * worth taking: the thing that most changes how a visitor reads the price is
 * the first line on the page, not a paragraph five sections down. The *content*
 * is not — a countdown to a sale that is always running is manufactured
 * urgency, and this product does not have a sale.
 *
 * What Mission Winning has to say there is true and currently buried: the whole
 * platform is free during the open beta. That sentence lives in the landing
 * page's fifth section and on no other public URL, while the free core is the
 * single strongest thing about the product.
 *
 * **Ink, not red.** Red is the one do-this-now action, and the landing already
 * spends its one poster field on the closing CTA. An ink field says "status"
 * where a red one would say "act" — which is the opposite of what a bar
 * announcing that nothing costs anything should imply.
 *
 * **Server Component.** `PublicPageShell` is a Server Component covering ~250
 * SEO URLs and is English-only by construction (`force-static`, `lang="en"`);
 * `MarketingNav` is a client component and passes a translated string. Neither
 * has to hydrate anything for this bar.
 */

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
        {label ??
          'Free beta — full platform free for testers while we grow with you'}
      </p>
    </div>
  );
}
