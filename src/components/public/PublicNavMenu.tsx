'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import type { FooterLink } from '@/components/marketing/footerLinks';

/**
 * The public site's mobile navigation.
 *
 * Before this, `MarketingNav` put its links behind `hidden … sm:flex` and there was no
 * menu anywhere in the marketing or public chrome — so at 390px, the stated primary
 * viewport, a visitor could reach `/` and `/welcome` and nothing else. The ~250-page
 * exercise and guide library was unreachable from any chrome on any phone.
 *
 * Built on Radix Dialog (already a direct dependency, already used by
 * `src/components/ui/dialog.tsx`) because it brings the focus trap, Escape, scroll lock,
 * `aria-modal` and focus restore-to-trigger with it. `AdaptiveOverlay` hand-rolls all of
 * that and puts a focusable full-screen scrim button inside its own trap; there is no
 * reason to repeat that here.
 *
 * The Radix primitive is imported directly rather than through our `DialogContent`
 * wrapper, which is a centred modal — this needs to be a full-height panel, and
 * overriding its transform and slide-in classes through `twMerge` would be less clear
 * than positioning it here.
 *
 * This is the only client component in `PublicPageShell`. The ~233 Server Component SEO
 * pages keep their static shell and hydrate just this island.
 */
export function PublicNavMenu({
  links,
  legalLinks,
  ctaHref,
  ctaLabel,
  menuLabel = 'Menu',
  closeLabel = 'Close menu',
  className,
}: {
  links: FooterLink[];
  legalLinks: FooterLink[];
  ctaHref: string;
  ctaLabel: string;
  menuLabel?: string;
  closeLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className={
          className ??
          'tap-target -mr-2 inline-flex items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground md:hidden'
        }
        aria-label={menuLabel}
      >
        <Menu className="h-6 w-6" aria-hidden />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-foreground/50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 top-0 z-[61] max-h-[100dvh] overflow-y-auto border-b-2 border-border bg-background pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
          aria-describedby={undefined}
        >
          {/* Radix requires a title for the dialog's accessible name; the panel's own
              heading is the word "Menu", which the trigger already says out loud. */}
          <DialogPrimitive.Title className="sr-only">{menuLabel}</DialogPrimitive.Title>

          <div className="mx-auto flex max-w-6xl items-center justify-end px-5">
            <DialogPrimitive.Close
              className="tap-target -mr-2 inline-flex items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground"
              aria-label={closeLabel}
            >
              <X className="h-6 w-6" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <nav aria-label={menuLabel} className="mx-auto max-w-6xl px-5">
            <ul className="divide-y-2 divide-border border-y-2 border-border">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[56px] items-center font-display text-xl font-extrabold tracking-[-0.01em] text-foreground transition-colors hover:text-primary"
                  >
                    {link.defaultValue}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="primary-action mt-6"
            >
              {ctaLabel}
            </Link>

            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.defaultValue}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
