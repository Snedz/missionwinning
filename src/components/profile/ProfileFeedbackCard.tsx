'use client';

/**
 * The way in.
 *
 * `.215` — before this, the only route from an athlete to a human ran through
 * `/feedback`, linked from `LegalNav` in muted 14px between "Beta guide" and
 * "Terms of Service". The primary listening channel of a private beta was
 * styled as a disclaimer, and the form behind it asked for results, a
 * testimonial and a 1–5 rating: a **testimonial** instrument, not a friction
 * one. Nobody reaches for that when a button did nothing.
 *
 * So this card is a question, not a form, and it does not compete for the
 * screen's one primary action — `ProfileDayReviewRow` sets that precedent
 * deliberately. `/feedback` stays exactly where it is; it is the considered
 * instrument, this is the fast one.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackSheet } from './FeedbackSheet';

export function ProfileFeedbackCard() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // `usePathname` rather than a hardcoded '/profile': the card is the mount
  // point today, and a wrong constant would outlive the second mount point.
  const pathname = usePathname() || '/profile';

  return (
    <div className="house-card space-y-3" data-testid="account-feedback-card">
      <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
        {t('feedbackCardTitle', { defaultValue: 'Tell us what broke' })}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t('feedbackCardLead', {
          defaultValue:
            'A bug, a confusing screen, or something you wish it did. One box, no account, and it sends even if you write it with no signal.',
        })}
      </p>
      <Button
        type="button"
        variant="outline"
        className="min-h-[44px] w-full tap-target"
        onClick={() => setOpen(true)}
      >
        {t('feedbackCardOpen', { defaultValue: 'Send feedback' })}
      </Button>
      <FeedbackSheet open={open} onClose={() => setOpen(false)} screen={pathname} />
    </div>
  );
}
