/**
 * Page: /notify — Super Bundle waitlist (checkout is not live)
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * F-047. The door on `/private` keeps `launch-waitlist`. This page is the
 * public capture when the gate is off (`/private` then redirects) and when
 * Super Bundle merch says Get notified. Landing still does not remount the form.
 */

import { LaunchNotifyForm } from '@/components/public/LaunchNotifyForm';

export function NotifyPage() {
  return (
    <div className="space-y-4">
      <LaunchNotifyForm
        source="landing-super-bundle-notify"
        message="Super Bundle — notify when checkout opens"
        variant="landing"
      />
      <p className="text-sm text-muted-foreground">
        No spam. One email when Super Bundle checkout opens.
      </p>
    </div>
  );
}
