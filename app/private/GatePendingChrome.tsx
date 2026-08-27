/**
 * Honest loading chrome for `/private` while Suspense / session unlock runs.
 * Same brand + Free kicker as the ready gate — not a bare "Loading…"
 * or "Checking sign-in…" dead-end (F-008 / BETA_LANGUAGE).
 */

import { GATED_WWW_HONESTY } from '@/lib/gatedWwwHonesty';

type Props = {
  /** Invitee query already resolved (SSR or client). */
  isInvitee?: boolean;
  /** Status line under the kicker. */
  status?: string;
};

export function GatePendingChrome({
  isInvitee = false,
  status = GATED_WWW_HONESTY.gateLoading,
}: Props) {
  return (
    <div
      className="gate-shell"
      data-mw-invitee={isInvitee ? '1' : '0'}
      data-mw-gate-pending="1"
    >
      <header className="gate-header">
        <span className="gate-brand">
          <span className="gate-mark" data-brand-monogram aria-hidden>
            MW
          </span>
          <span className="gate-brandname">Mission Winning</span>
        </span>
        <p className="gate-kicker">{GATED_WWW_HONESTY.gateEyebrow}</p>
      </header>
      <hr className="gate-rule" />
      <main
        className="gate-center"
        style={{ flex: 1, display: 'flex' }}
        aria-busy="true"
        aria-live="polite"
      >
        <p className="gate-foot">{status}</p>
      </main>
    </div>
  );
}
